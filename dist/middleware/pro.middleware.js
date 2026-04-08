"use strict";
/**
 * pro.middleware.ts
 *
 * Verifies that the authenticated user has an active Pro subscription.
 * Must be used AFTER authenticate middleware, never standalone.
 *
 * Also performs lazy expiry check — if subscriptionEndsAt has passed,
 * revokes isPro in DB before rejecting the request.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requiresPro = requiresPro;
const prisma_1 = require("../config/prisma");
const redis_1 = require("../config/redis");
const apiResponse_1 = require("../utils/apiResponse");
const client_1 = require("@prisma/client");
const logger_1 = __importDefault(require("../config/logger"));
/**
 * Middleware to restrict access to Pro users only.
 */
async function requiresPro(req, res, next) {
    const userId = req.user?.userId;
    if (!userId) {
        (0, apiResponse_1.sendError)(res, "Authentication required", 401);
        return;
    }
    try {
        const cacheKey = `user:pro:${userId}`;
        let status = await (0, redis_1.getCached)(cacheKey);
        if (!status) {
            const user = await prisma_1.prisma.user.findUnique({
                where: { id: userId },
                select: {
                    isPro: true,
                    subscriptionEndsAt: true,
                    subscriptionStatus: true,
                },
            });
            if (!user) {
                (0, apiResponse_1.sendError)(res, "User not found", 404);
                return;
            }
            status = {
                isPro: user.isPro,
                subscriptionEndsAt: user.subscriptionEndsAt?.toISOString() || null,
                subscriptionStatus: user.subscriptionStatus,
            };
            // Cache for 5 minutes
            await (0, redis_1.setCache)(cacheKey, status, 300);
        }
        // Lazy expiry check
        if (status.isPro && status.subscriptionEndsAt) {
            const expiryDate = new Date(status.subscriptionEndsAt);
            if (expiryDate < new Date()) {
                // Update DB
                await prisma_1.prisma.user.update({
                    where: { id: userId },
                    data: {
                        isPro: false,
                        subscriptionStatus: client_1.SubscriptionStatus.EXPIRED
                    },
                });
                // Update cache (expiry is true now)
                status.isPro = false;
                status.subscriptionStatus = client_1.SubscriptionStatus.EXPIRED;
                await (0, redis_1.setCache)(cacheKey, status, 300);
                logger_1.default.info(`Lazy expiry trigger for user ${userId}`);
            }
        }
        if (!status.isPro) {
            res.status(403).json({
                success: false,
                error: {
                    message: "Pro subscription required",
                    code: "PRO_REQUIRED",
                },
            });
            return;
        }
        next();
    }
    catch (error) {
        logger_1.default.error("Error in requiresPro middleware", error);
        next(error);
    }
}
//# sourceMappingURL=pro.middleware.js.map