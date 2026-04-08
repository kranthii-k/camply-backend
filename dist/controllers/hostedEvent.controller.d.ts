import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
/**
 * POST /api/v1/events
 * Creates a new hosted event.
 * Pro users only. Status defaults to PENDING.
 */
export declare function createEvent(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
/**
 * GET /api/v1/events
 * Returns all APPROVED events for the public/pro feed.
 */
export declare function getEvents(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
/**
 * PATCH /api/v1/admin/events/:id/approve
 * Approves a hosted event. Admin only.
 */
export declare function approveEvent(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
/**
 * GET /api/v1/admin/events
 * Returns all events for admin review.
 */
export declare function getAdminEvents(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=hostedEvent.controller.d.ts.map