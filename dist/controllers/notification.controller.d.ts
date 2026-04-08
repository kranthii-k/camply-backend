import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
/**
 * GET /api/v1/notifications
 * Returns last 30 notifications for the user.
 */
export declare function getNotifications(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
/**
 * PATCH /api/v1/notifications/:id/read
 * Marks a single notification as read.
 */
export declare function markAsRead(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
/**
 * PATCH /api/v1/notifications/read-all
 * Marks all notifications as read.
 */
export declare function markAllAsRead(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=notification.controller.d.ts.map