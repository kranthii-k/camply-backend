/**
 * hackathon.service.ts
 * 
 * Manages hackathon data from manual entry, Devpost API, and Devfolio.
 * Includes caching to avoid hitting DB/External API too frequently.
 */

import axios from "axios";
import * as cheerio from "cheerio";
import { prisma } from "../config/prisma";
import { getCached, setCache } from "../config/redis";
import logger from "../config/logger";
import { HackathonSource } from "@prisma/client";

const HACKATHON_CACHE_KEY = "hackathons:all";
const CACHE_TTL = 3600; // 1 hour

/** Returns a valid Date, falling back to `fallback` (default: now) if parsing fails. */
function safeDate(value: unknown, fallback: Date = new Date()): Date {
  if (!value) return fallback;
  const d = new Date(value as string);
  return isNaN(d.getTime()) ? fallback : d;
}

/** Parses Devpost specific range format like 'Jun 06 - 07, 2026' or 'May 11 - Jun 28, 2026'. */
function parseRange(dateStr: string): { start: Date; end: Date } {
  const now = new Date();
  const trimmed = (dateStr || "").trim();
  if (!trimmed) return { start: now, end: now };

  const parts = trimmed.split(" - ").map(s => s.trim());
  if (parts.length === 1) {
    const single = safeDate(parts[0], now);
    return { start: single, end: single };
  }

  const [startRaw, endRaw] = parts;
  
  // Extract year from endRaw if possible (usually at the end: '... 2026')
  const yearMatch = endRaw.match(/\d{4}/);
  const year = yearMatch ? yearMatch[0] : now.getFullYear().toString();
  
  // Extract month from startRaw (usually 'Jun 06')
  const monthMatch = startRaw.match(/[a-zA-Z]+/);
  const month = monthMatch ? monthMatch[0] : "";

  // If endRaw is just '07, 2026', it lacks the month from start
  let processedEnd = endRaw;
  if (!endRaw.match(/[a-zA-Z]{3,}/) && month) {
    processedEnd = `${month} ${endRaw}`;
  }
  
  // Ensure startRaw has the year
  let processedStart = startRaw;
  if (!startRaw.match(/\d{4}/)) {
    processedStart = `${startRaw}, ${year}`;
  }
  
  // Ensure endRaw has the year (though usually it's where we got it from)
  if (!processedEnd.match(/\d{4}/)) {
    processedEnd = `${processedEnd}, ${year}`;
  }

  return {
    start: safeDate(processedStart, now),
    end: safeDate(processedEnd, now),
  };
}

/** Strip HTML tags from a string (handles Devpost prize_amount which contains <span> elements). */
function stripHtml(value: unknown): string {
  if (!value) return "TBD";
  return String(value).replace(/<[^>]*>/g, "").trim() || "TBD";
}

/**
 * Fetches upcoming hackathons from Devpost API and upserts into DB.
 */
export async function syncDevpostHackathons() {
  try {
    const response = await axios.get("https://devpost.com/api/hackathons?page=1&per_page=20&status=upcoming");
    const hackathons = response.data.hackathons;

    let syncedCount = 0;

    for (const data of hackathons) {
      const learnMoreUrl = data.url;
      if (!learnMoreUrl) continue;

      const { start, end } = parseRange(data.submission_period_dates || "");

      const commonFields = {
        title: data.title,
        organizer: data.organization_name || "Unknown Organizer",
        location: data.location || "Online",
        startDate: start,
        endDate: end,
        prizeMoney: stripHtml(data.prize_amount),
        learnMoreUrl,
        tags: data.themes?.map((t: any) => t.name) || [],
        participantCount: data.registrations_count || 0,
      };

      // Use findFirst + upsert pattern because learnMoreUrl has no @unique constraint
      const existing = await prisma.hackathon.findFirst({ where: { learnMoreUrl } });
      if (existing) {
        await prisma.hackathon.update({ where: { id: existing.id }, data: commonFields });
      } else {
        await prisma.hackathon.create({
          data: { ...commonFields, source: HackathonSource.DEVPOST, externalId: data.id?.toString() },
        });
      }
      syncedCount++;
    }

    await setCache(HACKATHON_CACHE_KEY, null, 0);
    logger.info(`Synced ${syncedCount} hackathons from Devpost`);
    return syncedCount;
  } catch (error) {
    logger.error("Failed to sync Devpost hackathons", error);
    throw new Error("Devpost synchronization failed", { cause: error });
  }
}

/**
 * Fetches upcoming hackathons from Devfolio.
 * Layer 1: Devfolio public API → Layer 2: RSS feed → Layer 3: graceful no-op.
 */
export async function syncDevfolioHackathons(): Promise<number> {
  // --- Layer 1: Try Devfolio public API ---
  try {
    const response = await axios.get(
      "https://devfolio.co/api/hackathons?status=open&limit=20",
      { timeout: 10_000, headers: { Accept: "application/json" } }
    );
    const hackathons: any[] = response.data?.results || response.data || [];
    if (Array.isArray(hackathons) && hackathons.length > 0) {
      return await upsertDevfolioHackathons(hackathons);
    }
  } catch (err) {
    logger.warn("[Scout] Devfolio API unavailable, trying RSS...");
  }

  // --- Layer 2: Try RSS / Atom feed ---
  try {
    const rssResponse = await axios.get("https://devfolio.co/hackathons.rss", {
      timeout: 10_000,
      headers: { Accept: "application/rss+xml, text/xml" },
    });
    const $ = cheerio.load(rssResponse.data, { xmlMode: true });
    const items: any[] = [];
    $("item").each((_, el) => {
      items.push({
        title: $(el).find("title").text(),
        url: $(el).find("link").text() || $(el).find("guid").text(),
        description: $(el).find("description").text(),
        pubDate: $(el).find("pubDate").text(),
      });
    });
    if (items.length > 0) {
      return await upsertDevfolioFromRss(items);
    }
  } catch (err) {
    logger.warn("[Scout] Devfolio RSS unavailable — skipping Devfolio sync");
  }

  // --- Layer 3: Graceful no-op ---
  return 0;
}

/** Upsert hackathons from Devfolio API response format */
async function upsertDevfolioHackathons(hackathons: any[]): Promise<number> {
  let count = 0;
  const now = new Date();
  for (const data of hackathons) {
    const url = data.url || data.website || data.slug && `https://devfolio.co/${data.slug}`;
    if (!url) continue;

    const commonFields = {
      title: data.name || data.title || "Devfolio Hackathon",
      organizer: data.team?.name || data.organizer || "Devfolio",
      location: data.is_online ? "Online" : data.location || "India",
      startDate: data.starts_at ? new Date(data.starts_at) : now,
      endDate: data.ends_at ? new Date(data.ends_at) : now,
      prizeMoney: data.prize_pool || "TBD",
      learnMoreUrl: url,
      tags: data.themes?.map((t: any) => t.name) || [],
      participantCount: data.submissions_count || 0,
    };

    const existing = await prisma.hackathon.findFirst({ where: { learnMoreUrl: url } });
    if (existing) {
      await prisma.hackathon.update({ where: { id: existing.id }, data: commonFields });
    } else {
      await prisma.hackathon.create({
        data: { ...commonFields, source: HackathonSource.DEVFOLIO, externalId: data.id?.toString() },
      });
    }
    count++;
  }
  await setCache(HACKATHON_CACHE_KEY, null, 0);
  logger.info(`[Scout] Devfolio API: upserted ${count} hackathons`);
  return count;
}

/** Upsert hackathons from Devfolio RSS format */
async function upsertDevfolioFromRss(items: any[]): Promise<number> {
  let count = 0;
  const now = new Date();
  for (const item of items) {
    if (!item.url) continue;
    const commonFields = {
      title: item.title || "Devfolio Hackathon",
      organizer: "Devfolio",
      location: "Online",
      startDate: item.pubDate ? new Date(item.pubDate) : now,
      endDate: item.pubDate ? new Date(new Date(item.pubDate).getTime() + 7 * 86400_000) : now,
      prizeMoney: "TBD",
      learnMoreUrl: item.url,
      tags: ["devfolio"],
      participantCount: 0,
    };
    const existing = await prisma.hackathon.findFirst({ where: { learnMoreUrl: item.url } });
    if (existing) {
      await prisma.hackathon.update({ where: { id: existing.id }, data: commonFields });
    } else {
      await prisma.hackathon.create({
        data: { ...commonFields, source: HackathonSource.DEVFOLIO },
      });
    }
    count++;
  }
  await setCache(HACKATHON_CACHE_KEY, null, 0);
  logger.info(`[Scout] Devfolio RSS: upserted ${count} hackathons`);
  return count;
}


/**
 * Returns all active hackathons, with priority to manual entries.
 */
export async function getAllHackathons() {
  try {
    const cached = await getCached<any[]>(HACKATHON_CACHE_KEY);
    if (cached) return cached;

    const hackathons = await prisma.hackathon.findMany({
      where: { isActive: true },
      orderBy: { startDate: "asc" },
    });

    await setCache(HACKATHON_CACHE_KEY, hackathons, CACHE_TTL);
    return hackathons;
  } catch (error) {
    logger.error("Failed to fetch hackathons", error);
    // Return empty array instead of throwing to prevent frontend crash
    return [];
  }
}
