"use strict";
/**
 * mention.service.ts
 *
 * Parses text content for @username mentions and creates
 * notifications for mentioned users.
 *
 * Used in: post comments, community chat messages
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractMentions = extractMentions;
exports.processMentions = processMentions;
const prisma_1 = require("../config/prisma");
const socket_1 = require("../config/socket");
const logger_1 = __importDefault(require("../config/logger"));
const client_1 = require("@prisma/client");
/**
 * Extracts unique usernames from text starting with @.
 * Max 10 mentions to prevent spam.
 */
function extractMentions(content) {
    const mentionRegex = /\B@([a-zA-Z0-9_]+)/g;
    const matches = content.match(mentionRegex);
    if (!matches)
        return [];
    // Remove @ and get unique usernames
    const usernames = Array.from(new Set(matches.map(m => m.slice(1))));
    return usernames.slice(0, 10);
}
/**
 * Processes mentions in content, creating notifications and emitting socket events.
 */
async function processMentions(content, authorId, sourceUrl, sourceType) {
    const usernames = extractMentions(content);
    if (usernames.length === 0)
        return;
    try {
        const mentionedUsers = await prisma_1.prisma.user.findMany({
            where: {
                username: { in: usernames },
                id: { not: authorId } // Don't notify yourself
            },
            select: { id: true, username: true }
        });
        const notifications = await Promise.allSettled(mentionedUsers.map(async (user) => {
            const notification = await prisma_1.prisma.notification.create({
                data: {
                    userId: user.id,
                    type: client_1.NotificationType.MENTION,
                    title: "You were mentioned",
                    body: content.length > 100 ? content.slice(0, 97) + "..." : content,
                    sourceUrl,
                    actorId: authorId,
                }
            });
            // Emit real-time notification
            (0, socket_1.getIo)().to(`user:${user.id}`).emit("notification:new", notification);
            return notification;
        }));
        const successCount = notifications.filter(n => n.status === 'fulfilled').length;
        logger_1.default.info(`Processed ${successCount} mentions out of ${mentionedUsers.length} for ${sourceType}`);
    }
    catch (error) {
        logger_1.default.error("Failed to process mentions", error);
    }
}
//# sourceMappingURL=mention.service.js.map