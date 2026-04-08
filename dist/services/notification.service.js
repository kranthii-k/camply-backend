"use strict";
/**
 * notification.service.ts
 *
 * Thin wrapper around Socket.IO for pushing real-time events to specific
 * users.  Controllers call these helpers instead of importing `io` directly.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notifyMatch = notifyMatch;
exports.notifyComment = notifyComment;
exports.notifyVote = notifyVote;
exports.notifyTeamInvite = notifyTeamInvite;
const socket_1 = require("../config/socket");
const logger_1 = __importDefault(require("../config/logger"));
/** Emit an event to all sockets belonging to a specific user. */
function emitToUser(userId, event, payload) {
    try {
        (0, socket_1.getIo)().to(`user:${userId}`).emit(event, payload);
    }
    catch (err) {
        logger_1.default.warn(`Notification emit failed for user ${userId}`, err);
    }
}
// ── Public helpers ──────────────────────────────────────
/**
 * Tell both users they've been matched.
 */
function notifyMatch(userAId, userBId) {
    emitToUser(userAId, "match", { matchedUserId: userBId });
    emitToUser(userBId, "match", { matchedUserId: userAId });
}
/**
 * Notify a user that someone commented on their post.
 */
function notifyComment(postAuthorId, commenterId, postId) {
    if (postAuthorId === commenterId)
        return; // don't notify yourself
    emitToUser(postAuthorId, "new-comment", { commenterId, postId });
}
/**
 * Notify a user that someone voted on their post.
 */
function notifyVote(postAuthorId, voterId, postId, value) {
    if (postAuthorId === voterId)
        return;
    emitToUser(postAuthorId, "new-vote", { voterId, postId, value });
}
/**
 * Notify a user they've been added to a team.
 */
function notifyTeamInvite(inviteeId, teamId, teamName) {
    emitToUser(inviteeId, "team-invite", { teamId, teamName });
}
//# sourceMappingURL=notification.service.js.map