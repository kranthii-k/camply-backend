import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
/**
 * GET /api/v1/hackathons
 * Returns all active hackathons.
 * Requires Pro subscription (handled by middleware).
 */
export declare function getHackathons(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
/**
 * POST /api/v1/hackathons/sync
 * Triggers a manual sync with Devpost.
 * Admin only (session check should be in router).
 */
export declare function syncHackathons(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=hackathon.controller.d.ts.map