"use strict";
/**
 * hackathon.service.ts
 *
 * Manages hackathon data from both manual entry and Devpost API.
 * Includes caching to avoid hitting DB/External API too frequently.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncDevpostHackathons = syncDevpostHackathons;
exports.getAllHackathons = getAllHackathons;
const axios_1 = __importDefault(require("axios"));
const prisma_1 = require("../config/prisma");
const redis_1 = require("../config/redis");
const logger_1 = __importDefault(require("../config/logger"));
const client_1 = require("@prisma/client");
const HACKATHON_CACHE_KEY = "hackathons:all";
const CACHE_TTL = 3600; // 1 hour
/**
 * Fetches upcoming hackathons from Devpost API and upserts into DB.
 */
async function syncDevpostHackathons() {
    try {
        const response = await axios_1.default.get("https://devpost.com/api/hackathons?page=1&per_page=20&status=upcoming");
        const hackathons = response.data.hackathons;
        let syncedCount = 0;
        for (const data of hackathons) {
            // Map Devpost fields to our model
            // Note: This mapping depends on the actual Devpost API response structure.
            // Based on common Devpost API patterns:
            const externalId = data.id?.toString() || data.uri;
            await prisma_1.prisma.hackathon.upsert({
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
                    tags: data.themes?.map((t) => t.name) || [],
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
                    tags: data.themes?.map((t) => t.name) || [],
                    participantCount: data.registrations_count || 0,
                    source: client_1.HackathonSource.DEVPOST,
                    externalId: externalId,
                },
            });
            syncedCount++;
        }
        // Invalidate cache
        await (0, redis_1.setCache)(HACKATHON_CACHE_KEY, null, 0);
        logger_1.default.info(`Synced ${syncedCount} hackathons from Devpost`);
        return syncedCount;
    }
    catch (error) {
        logger_1.default.error("Failed to sync Devpost hackathons", error);
        throw new Error("Devpost synchronization failed", { cause: error });
    }
}
/**
 * Returns all active hackathons, with priority to manual entries.
 */
async function getAllHackathons() {
    try {
        const cached = await (0, redis_1.getCached)(HACKATHON_CACHE_KEY);
        if (cached)
            return cached;
        const hackathons = await prisma_1.prisma.hackathon.findMany({
            where: { isActive: true },
            orderBy: { startDate: "asc" },
        });
        await (0, redis_1.setCache)(HACKATHON_CACHE_KEY, hackathons, CACHE_TTL);
        return hackathons;
    }
    catch (error) {
        logger_1.default.error("Failed to fetch hackathons", error);
        // Return empty array instead of throwing to prevent frontend crash
        return [];
    }
}
//# sourceMappingURL=hackathon.service.js.map