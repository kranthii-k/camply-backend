"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNotifications = getNotifications;
exports.markAsRead = markAsRead;
exports.markAllAsRead = markAllAsRead;
const prisma_1 = require("../config/prisma");
const apiResponse_1 = require("../utils/apiResponse");
/**
 * GET /api/v1/notifications
 * Returns last 30 notifications for the user.
 */
async function getNotifications(req, res, next) {
    const userId = req.user.userId;
    try {
        const [notifications, unreadCount] = await Promise.all([
            prisma_1.prisma.notification.findMany({
                where: { userId },
                orderBy: { createdAt: "desc" },
                take: 30,
            }),
            prisma_1.prisma.notification.count({
                where: { userId, isRead: false },
            }),
        ]);
        (0, apiResponse_1.sendSuccess)(res, { notifications, unreadCount });
    }
    catch (err) {
        next(err);
    }
}
/**
 * PATCH /api/v1/notifications/:id/read
 * Marks a single notification as read.
 */
async function markAsRead(req, res, next) {
    const id = req.params.id;
    const userId = req.user.userId;
    try {
        const notification = await prisma_1.prisma.notification.findUnique({
            where: { id },
        });
        if (!notification || notification.userId !== userId) {
            (0, apiResponse_1.sendError)(res, "Notification not found", 404);
            return;
        }
        await prisma_1.prisma.notification.update({
            where: { id },
            data: { isRead: true },
        });
        (0, apiResponse_1.sendSuccess)(res, null, "Notification marked as read");
    }
    catch (err) {
        next(err);
    }
}
/**
 * PATCH /api/v1/notifications/read-all
 * Marks all notifications as read.
 */
async function markAllAsRead(req, res, next) {
    const userId = req.user.userId;
    try {
        await prisma_1.prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true },
        });
        (0, apiResponse_1.sendSuccess)(res, null, "All notifications marked as read");
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=notification.controller.js.map