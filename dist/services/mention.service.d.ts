/**
 * mention.service.ts
 *
 * Parses text content for @username mentions and creates
 * notifications for mentioned users.
 *
 * Used in: post comments, community chat messages
 */
/**
 * Extracts unique usernames from text starting with @.
 * Max 10 mentions to prevent spam.
 */
export declare function extractMentions(content: string): string[];
/**
 * Processes mentions in content, creating notifications and emitting socket events.
 */
export declare function processMentions(content: string, authorId: string, sourceUrl: string, sourceType: 'POST_COMMENT' | 'CHAT_MESSAGE'): Promise<void>;
//# sourceMappingURL=mention.service.d.ts.map