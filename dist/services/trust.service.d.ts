/**
 * trust.service.ts
 *
 * Centralises all trust-score mutations so controllers never have to
 * repeat the "increment → recalculate level → save" dance.
 */
import { TrustScoreActions } from "../utils/trustScore";
type TrustAction = keyof typeof TrustScoreActions;
/**
 * Award trust points to a single user and recalculate their trust level.
 * Safe to call without try/catch — errors are swallowed so a trust-score
 * failure never breaks the primary operation.
 */
export declare function awardTrust(userId: string, action: TrustAction): Promise<void>;
/**
 * Award trust points to multiple users at once (e.g. on a match event).
 */
export declare function awardTrustToMany(userIds: string[], action: TrustAction): Promise<void>;
export {};
//# sourceMappingURL=trust.service.d.ts.map