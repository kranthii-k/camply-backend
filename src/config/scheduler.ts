/**
 * scheduler.ts — AI Scout (cron jobs)
 *
 * Registered once at server startup via initScheduler().
 * Runs hackathon syncs every 12 hours independent of HTTP traffic.
 */

import cron from "node-cron";
import logger from "./logger";
import { syncDevpostHackathons, syncDevfolioHackathons } from "../services/hackathon.service";

export function initScheduler(): void {
  if (process.env.NODE_ENV === "test") {
    logger.info("[Scheduler] Skipped in test environment");
    return;
  }

  // ── Hackathon sync every 12 hours ───────────────────────
  cron.schedule("0 */12 * * *", async () => {
    logger.info("[Scout] Starting hackathon sync...");
    try {
      const devpostCount = await syncDevpostHackathons();
      logger.info(`[Scout] Devpost: synced ${devpostCount} hackathons`);
    } catch (err) {
      logger.error("[Scout] Devpost sync failed", err);
    }
    try {
      const devfolioCount = await syncDevfolioHackathons();
      logger.info(`[Scout] Devfolio: synced ${devfolioCount} hackathons`);
    } catch (err) {
      logger.error("[Scout] Devfolio sync failed", err);
    }
  });

  logger.info("[Scheduler] Hackathon sync cron scheduled (every 12 hours)");

  // Run once immediately at startup to populate data
  setImmediate(async () => {
    logger.info("[Scout] Running initial hackathon sync on startup...");
    try {
      await syncDevpostHackathons();
      await syncDevfolioHackathons();
      logger.info("[Scout] Initial sync complete");
    } catch (err) {
      logger.warn("[Scout] Initial sync failed (non-fatal)", err);
    }
  });
}
