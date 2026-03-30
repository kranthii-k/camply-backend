import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { analyzePost } from "../src/services/moderation.service";
import logger from "../src/config/logger";

const prisma = new PrismaClient();

async function runSweep() {
  logger.info("🧹 Starting AI Guardian Moderation Sweep...");

  const unflaggedPosts = await prisma.post.findMany({
    where: { isFlagged: false },
    select: { id: true, content: true, authorId: true },
  });

  logger.info(`Found ${unflaggedPosts.length} unflagged posts to analyze.`);

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  for (const post of unflaggedPosts) {
    try {
      logger.info(`Analyzing post ${post.id}: "${post.content.substring(0, 30)}..."`);
      await analyzePost(post.id, post.content, post.authorId);
      // Gemini Free Tier Rate Limit: 15 Requests Per Minute (1 request every 4 seconds)
      await delay(4500); 
    } catch (err) {
      logger.error(`Failed to analyze post ${post.id}:`, err);
    }
  }

  logger.info("✅ Moderation sweep complete.");

}

runSweep()
  .catch((err) => {
    logger.error("Sweep script failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
