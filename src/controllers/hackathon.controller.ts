import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import * as hackathonService from "../services/hackathon.service";
import { sendSuccess, sendError } from "../utils/apiResponse";

/**
 * GET /api/v1/hackathons
 * Returns all active hackathons.
 * Requires Pro subscription (handled by middleware).
 */
export async function getHackathons(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const hackathons = await hackathonService.getAllHackathons();
    sendSuccess(res, { hackathons });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/hackathons/sync
 * Triggers a manual sync with Devpost. 
 * Admin only (session check should be in router).
 */
export async function syncHackathons(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const count = await hackathonService.syncDevpostHackathons();
    sendSuccess(res, { count }, `Successfully synced ${count} hackathons from Devpost.`);
  } catch (err) {
    next(err);
  }
}
