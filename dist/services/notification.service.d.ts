/**
 * notification.service.ts
 *
 * Thin wrapper around Socket.IO for pushing real-time events to specific
 * users.  Controllers call these helpers instead of importing `io` directly.
 */
/**
 * Tell both users they've been matched.
 */
export declare function notifyMatch(userAId: string, userBId: string): void;
/**
 * Notify a user that someone commented on their post.
 */
export declare function notifyComment(postAuthorId: string, commenterId: string, postId: string): void;
/**
 * Notify a user that someone voted on their post.
 */
export declare function notifyVote(postAuthorId: string, voterId: string, postId: string, value: number): void;
/**
 * Notify a user they've been added to a team.
 */
export declare function notifyTeamInvite(inviteeId: string, teamId: string, teamName: string): void;
//# sourceMappingURL=notification.service.d.ts.map