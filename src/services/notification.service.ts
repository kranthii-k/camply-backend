/**
 * notification.service.ts
 *
 * Thin wrapper around Socket.IO for pushing real-time events to specific
 * users.  Controllers call these helpers instead of importing `io` directly.
 */

import { getIo } from "../config/socket";
import logger from "../config/logger";

/** Emit an event to all sockets belonging to a specific user. */
function emitToUser(userId: string, event: string, payload: unknown): void {
  try {
    getIo().to(`user:${userId}`).emit(event, payload);
  } catch (err) {
    logger.warn(`Notification emit failed for user ${userId}`, err);
  }
}

// ── Public helpers ──────────────────────────────────────

/**
 * Tell both users they've been matched.
 */
export function notifyMatch(userAId: string, userBId: string): void {
  emitToUser(userAId, "match", { matchedUserId: userBId });
  emitToUser(userBId, "match", { matchedUserId: userAId });
}

/**
 * Notify a user that someone commented on their post.
 */
export function notifyComment(
  postAuthorId: string,
  commenterId: string,
  postId: string
): void {
  if (postAuthorId === commenterId) return; // don't notify yourself
  emitToUser(postAuthorId, "new-comment", { commenterId, postId });
}

/**
 * Notify a user that someone voted on their post.
 */
export function notifyVote(
  postAuthorId: string,
  voterId: string,
  postId: string,
  value: number
): void {
  if (postAuthorId === voterId) return;
  emitToUser(postAuthorId, "new-vote", { voterId, postId, value });
}

/**
 * Notify a user they've been added to a team.
 */
export function notifyTeamInvite(
  inviteeId: string,
  teamId: string,
  teamName: string
): void {
  emitToUser(inviteeId, "team-invite", { teamId, teamName });
}

// ── Moderation helpers ──────────────────────────────────

/**
 * Warn a user that one of their posts was flagged as offensive.
 * A 60-second deletion countdown has started.
 */
export function notifyContentWarning(
  userId: string,
  postId: string,
  reason: string,
  strikes: number
): void {
  emitToUser(userId, "CONTENT_WARNING", {
    postId,
    reason,
    strikes,
    message: "Your post has been flagged as offensive. Delete it within 60 seconds or it will be automatically removed.",
    autoDeleteAt: Date.now() + 60_000,
  });
}

/**
 * Inform a user that their flagged post was automatically deleted.
 */
export function notifyPostAutoDeleted(userId: string, postId: string): void {
  emitToUser(userId, "POST_AUTO_DELETED", {
    postId,
    message: "Your flagged post was automatically removed after 60 seconds.",
  });
}

/**
 * Inform a user that their account has been suspended for 30 days.
 * Their refresh tokens have already been revoked at this point.
 */
export function notifyAccountSuspended(userId: string): void {
  emitToUser(userId, "ACCOUNT_SUSPENDED", {
    message:
      "Your account has been suspended for 30 days due to repeated community guideline violations.",
    bannedUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  });
}
