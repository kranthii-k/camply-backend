import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { prisma } from "../config/prisma";
import { sendSuccess, sendError } from "../utils/apiResponse";

/**
 * GET /api/v1/notifications
 * Returns last 30 notifications for the user.
 */
export async function getNotifications(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const userId = req.user!.userId;

  try {
    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 30,
      }),
      prisma.notification.count({
        where: { userId, isRead: false },
      }),
    ]);

    sendSuccess(res, { notifications, unreadCount });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/v1/notifications/:id/read
 * Marks a single notification as read.
 */
export async function markAsRead(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const id = req.params.id as string;
  const userId = req.user!.userId;

  try {
    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification || notification.userId !== userId) {
      sendError(res, "Notification not found", 404);
      return;
    }

    await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    sendSuccess(res, null, "Notification marked as read");
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/v1/notifications/read-all
 * Marks all notifications as read.
 */
export async function markAllAsRead(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const userId = req.user!.userId;

  try {
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });

    sendSuccess(res, null, "All notifications marked as read");
  } catch (err) {
    next(err);
  }
}
