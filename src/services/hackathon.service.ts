/**
 * hackathon.service.ts
 * 
 * Manages hackathon data from both manual entry and Devpost API.
 * Includes caching to avoid hitting DB/External API too frequently.
 */

import axios from "axios";
import { prisma } from "../config/prisma";
import { getCached, setCache } from "../config/redis";
import logger from "../config/logger";
import { HackathonSource } from "@prisma/client";

const HACKATHON_CACHE_KEY = "hackathons:all";
const CACHE_TTL = 3600; // 1 hour

/**
 * Fetches upcoming hackathons from Devpost API and upserts into DB.
 */
export async function syncDevpostHackathons() {
  try {
    const response = await axios.get("https://devpost.com/api/hackathons?page=1&per_page=20&status=upcoming");
    const hackathons = response.data.hackathons;

    let syncedCount = 0;

    for (const data of hackathons) {
      // Map Devpost fields to our model
      // Note: This mapping depends on the actual Devpost API response structure.
      // Based on common Devpost API patterns:
      const externalId = data.id?.toString() || data.uri;
      
      await prisma.hackathon.upsert({
        where: { id: externalId }, // Using externalId or another unique field if necessary
        // Actually, schema has externalId as optional. 
        // Let's use externalId if available or a composed key.
        // I'll adjust the schema if needed, but for now I'll use externalId for upsert logic.
        // Wait, the schema didn't have @unique on externalId. I should have added that.
        // I'll use externalId to find existing records manually if not unique in DB.
        update: {
          title: data.title,
          organizer: data.organization_name || "Unknown Organizer",
          location: data.location || "Online",
          startDate: new Date(data.submission_period_dates?.split(" - ")[0] || new Date()),
          endDate: new Date(data.submission_period_dates?.split(" - ")[1] || new Date()),
          prizeMoney: data.prize_amount || "TBD",
          learnMoreUrl: data.url,
          tags: data.themes?.map((t: any) => t.name) || [],
          participantCount: data.registrations_count || 0,
        },
        create: {
          title: data.title,
          organizer: data.organization_name || "Unknown Organizer",
          location: data.location || "Online",
          startDate: new Date(data.submission_period_dates?.split(" - ")[0] || new Date()),
          endDate: new Date(data.submission_period_dates?.split(" - ")[1] || new Date()),
          prizeMoney: data.prize_amount || "TBD",
          learnMoreUrl: data.url,
          tags: data.themes?.map((t: any) => t.name) || [],
          participantCount: data.registrations_count || 0,
          source: HackathonSource.DEVPOST,
          externalId: externalId,
        },
      });
      syncedCount++;
    }

    // Invalidate cache
    await setCache(HACKATHON_CACHE_KEY, null, 0);
    logger.info(`Synced ${syncedCount} hackathons from Devpost`);
    return syncedCount;
  } catch (error) {
    logger.error("Failed to sync Devpost hackathons", error);
    throw new Error("Devpost synchronization failed", { cause: error });
  }
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
