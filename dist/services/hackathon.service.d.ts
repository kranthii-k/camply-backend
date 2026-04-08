/**
 * hackathon.service.ts
 *
 * Manages hackathon data from both manual entry and Devpost API.
 * Includes caching to avoid hitting DB/External API too frequently.
 */
/**
 * Fetches upcoming hackathons from Devpost API and upserts into DB.
 */
export declare function syncDevpostHackathons(): Promise<number>;
/**
 * Returns all active hackathons, with priority to manual entries.
 */
export declare function getAllHackathons(): Promise<any[]>;
//# sourceMappingURL=hackathon.service.d.ts.map