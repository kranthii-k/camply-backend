/**
 * partnerTest.controller.ts
 *
 * Handles listing of ed-tech partner test cards.
 * Only one public endpoint: GET /api/v1/partner-tests
 *
 * Cards are ordered by priority DESC then createdAt DESC.
 * This means paid placement partners (higher priority) always appear first.
 * Default priority is 0 (first-come-first-serve).
 *
 * isActive flag allows disabling a card without deleting it.
 */

import { Request, Response, NextFunction } from "express";
import prisma from "../config/prisma";
import { sendSuccess } from "../utils/apiResponse";
import logger from "../config/logger";

// ─────────────────────────────────────────────────────────
// GET /api/v1/partner-tests
// Public. Returns all active partner test cards.
// ─────────────────────────────────────────────────────────
export async function getPartnerTests(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const tests = await prisma.partnerTest.findMany({
      where: { isActive: true },
      orderBy: [
        { priority: "desc" },    // Higher priority = paid placement = shown first
        { createdAt: "desc" },
      ],
      select: {
        id: true,
        platformName: true,
        logoUrl: true,
        title: true,
        description: true,
        testLink: true,
        registrationLink: true,
        createdAt: true,
        // Exclude: priority (internal business logic, not for frontend)
        // Exclude: isActive (only active ones are returned anyway)
      },
    });

    logger.info(`[PartnerTests] Fetched ${tests.length} active partner tests`);
    sendSuccess(res, { tests, total: tests.length });
  } catch (err) {
    next(err);
  }
}
