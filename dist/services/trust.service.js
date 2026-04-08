"use strict";
/**
 * trust.service.ts
 *
 * Centralises all trust-score mutations so controllers never have to
 * repeat the "increment → recalculate level → save" dance.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.awardTrust = awardTrust;
exports.awardTrustToMany = awardTrustToMany;
const prisma_1 = __importDefault(require("../config/prisma"));
const trustScore_1 = require("../utils/trustScore");
/**
 * Award trust points to a single user and recalculate their trust level.
 * Safe to call without try/catch — errors are swallowed so a trust-score
 * failure never breaks the primary operation.
 */
async function awardTrust(userId, action) {
    try {
        const delta = trustScore_1.TrustScoreActions[action];
        const updated = await prisma_1.default.user.update({
            where: { id: userId },
            data: { trustScore: { increment: delta } },
            select: { trustScore: true },
        });
        const newLevel = (0, trustScore_1.calculateTrustLevel)(updated.trustScore);
        await prisma_1.default.user.update({ where: { id: userId }, data: { trustLevel: newLevel } });
    }
    catch {
        // Non-fatal – trust-score errors should not bubble up
    }
}
/**
 * Award trust points to multiple users at once (e.g. on a match event).
 */
async function awardTrustToMany(userIds, action) {
    await Promise.all(userIds.map((id) => awardTrust(id, action)));
}
//# sourceMappingURL=trust.service.js.map