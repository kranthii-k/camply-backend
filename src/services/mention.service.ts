/**
 * mention.service.ts
 * 
 * Parses text content for @username mentions and creates
 * notifications for mentioned users.
 * 
 * Used in: post comments, community chat messages
 */

import { prisma } from "../config/prisma";
import { getIo } from "../config/socket";
import logger from "../config/logger";
import { NotificationType } from "@prisma/client";

/**
 * Extracts unique usernames from text starting with @.
 * Max 10 mentions to prevent spam.
 */
export function extractMentions(content: string): string[] {
  const mentionRegex = /\B@([a-zA-Z0-9_]+)/g;
  const matches = content.match(mentionRegex);
  
  if (!matches) return [];
  
  // Remove @ and get unique usernames
  const usernames = Array.from(new Set(matches.map(m => m.slice(1))));
  
  return usernames.slice(0, 10);
}

/**
 * Processes mentions in content, creating notifications and emitting socket events.
 */
export async function processMentions(
  content: string,
  authorId: string,
  sourceUrl: string,
  sourceType: 'POST_COMMENT' | 'CHAT_MESSAGE'
) {
  const usernames = extractMentions(content);
  if (usernames.length === 0) return;

  try {
    const mentionedUsers = await prisma.user.findMany({
      where: {
        username: { in: usernames },
        id: { not: authorId } // Don't notify yourself
      },
      select: { id: true, username: true }
    });

    const notifications = await Promise.allSettled(
      mentionedUsers.map(async (user) => {
        const notification = await prisma.notification.create({
          data: {
            userId: user.id,
            type: NotificationType.MENTION,
            title: "You were mentioned",
            body: content.length > 100 ? content.slice(0, 97) + "..." : content,
            sourceUrl,
            actorId: authorId,
          }
        });

        // Emit real-time notification
        getIo().to(`user:${user.id}`).emit("notification:new", notification);
        
        return notification;
      })
    );

    const successCount = notifications.filter(n => n.status === 'fulfilled').length;
    logger.info(`Processed ${successCount} mentions out of ${mentionedUsers.length} for ${sourceType}`);
  } catch (error) {
    logger.error("Failed to process mentions", error);
  }
}
