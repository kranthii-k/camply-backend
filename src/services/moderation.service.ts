import { 
  GoogleGenerativeAI, 
  HarmCategory, 
  HarmBlockThreshold 
} from "@google/generative-ai";
import prisma from "../config/prisma";
import logger from "../config/logger";
import {
  notifyContentWarning,
  notifyAccountSuspended,
} from "./notification.service";
import { invalidateCache } from "../config/redis";
import { getIo } from "../config/socket";

// ─── Gemini client ───────────────────────────────────────
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const MODERATION_PROMPT = `You are a strict content moderation AI for a campus social network called Camply.
Evaluate the following post content for violations including: hate speech, sexual content, extreme profanity, bullying, harassment, or violence.
Respond ONLY with a valid JSON object in this exact format:
{"offensive": boolean, "reason": "short description or empty string", "confidence": number between 0 and 1}`;

const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
];

/**
 * Sweeper (Garbage Collector) to handle persistent deletion of flagged posts.
 * Runs every 30 seconds and checks for posts flagged > 60s ago.
 */
export function startZombiePostSweeper() {
  setInterval(async () => {
    try {
      const sixtySecondsAgo = new Date(Date.now() - 60 * 1000);
      
      const zombiePosts = await prisma.post.findMany({
        where: {
          isFlagged: true,
          updatedAt: { lte: sixtySecondsAgo }
        },
        select: { id: true, authorId: true }
      });

      if (zombiePosts.length === 0) return;

      const io = getIo();

      for (const post of zombiePosts) {
        await prisma.post.delete({ where: { id: post.id } });
        
        // Notify author
        io.to(post.authorId).emit('CONTENT_REMOVED_SYSTEM', { 
          message: 'Your post was automatically removed for violating community guidelines.' 
        });
        
        // Update all feeds
        io.emit('POST_AUTO_DELETED', { postId: post.id });
        
        logger.info(`[AI Sweeper] Executed Zombie Post removal: ${post.id}`);
      }

      await invalidateCache('feed:*');
    } catch (err) {
      logger.error('[AI Sweeper] Error during zombie sweep:', err);
    }
  }, 30 * 1000);
}

/**
 * Core entry point for content analysis.
 */
export async function analyzePost(
  postId: string,
  content: string,
  userId: string
): Promise<void> {
  logger.info(`[AI Guardian] Starting analysis for post ${postId}...`);

  try {
    const result = await callGemini(content);
    logger.info(`[AI Guardian] Result for post ${postId}:`, result);

    if (!result.offensive || result.confidence < 0.75) {
      return;
    }

    logger.warn(`[AI Guardian] Offensive content detected on post ${postId} (confidence=${result.confidence})`);

    // ── Step 1: Flag the post ──────────────────────────────
    await prisma.post.update({
      where: { id: postId },
      data: {
        isFlagged: true,
        moderationReason: result.reason,
      },
    });

    // ── Step 2: Increment violation count ─────────────────
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        violationCount: { increment: 1 },
        lastViolationAt: new Date(),
      },
      select: { violationCount: true },
    });

    await invalidateCache("feed:*");

    // ── Step 3: Notify user via socket ────────────────────
    notifyContentWarning(userId, postId, result.reason, updatedUser.violationCount);

    // ── Step 4: Suspension check (3 strikes) ──────────────
    if (updatedUser.violationCount >= 3) {
      await prisma.user.update({
        where: { id: userId },
        data: { bannedUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
      });
      await prisma.refreshToken.deleteMany({ where: { userId } });
      notifyAccountSuspended(userId);
      logger.error(`[AI Guardian] 🚫 User ${userId} suspended (3 strikes reached)`);
    }

    // Note: Auto-deletion is now handled by the startZombiePostSweeper() in server.ts

  } catch (err) {
    logger.error(`[AI Guardian] Background analysis encountered a fatal error for post ${postId}:`, err);
  }
}

/**
 * Calls the Gemini API with strict safety overrides and resilient JSON parsing.
 */
async function callGemini(
  content: string
): Promise<{ offensive: boolean; reason: string; confidence: number }> {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "your_api_key_here") {
    logger.error("[AI Guardian] Fatal: GEMINI_API_KEY is missing or placeholder in .env");
    return { offensive: false, reason: "API Key Missing", confidence: 0 };
  }

  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.0-flash",
    systemInstruction: MODERATION_PROMPT,
    safetySettings,
    generationConfig: { responseMimeType: "application/json" }
  });

  try {
    const result = await model.generateContent(`Post content: "${content}"`);

    const rawText = result.response.text().trim();
    logger.info(`[AI Guardian] Raw Gemini Output: ${rawText}`);
    
    // Resilient JSON Parsing: strip markdown backticks if present
    const cleanedJson = rawText.replace(/^```json\n?/, "").replace(/\n?```$/, "").trim();

    try {
      const parsed = JSON.parse(cleanedJson);
      return {
        offensive: Boolean(parsed.offensive),
        reason: String(parsed.reason || ""),
        confidence: Number(parsed.confidence || 0),
      };
    } catch (parseErr) {
      logger.error(`[AI Guardian] JSON Parsing Failed. Raw output: ${rawText}`, parseErr);
      return { offensive: false, reason: "Parsing Error", confidence: 0 };
    }
  } catch (apiErr: any) {
    logger.error("[AI Guardian] Gemini API Request Failed:", apiErr);
    
    // If Google outright refused to process it due to safety, it's definitively toxic.
    if (apiErr.message && apiErr.message.includes('SAFETY')) {
      logger.warn("[AI Guardian] 🚨 FATAL TOXICITY DETECTED VIA SAFETY SHIELD 🚨");
      return { offensive: true, reason: "Blocked by Google Safety Filters (Extreme Toxicity)", confidence: 1 };
    }

    return { offensive: false, reason: "API Error", confidence: 0 };
  }
}
