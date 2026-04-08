"use strict";
/**
 * payment.service.ts
 *
 * Handles all Razorpay subscription lifecycle operations.
 * This service is the ONLY place that interacts with Razorpay SDK.
 * Never import Razorpay directly in controllers.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSubscription = createSubscription;
exports.verifyWebhookSignature = verifyWebhookSignature;
exports.handleSubscriptionActivated = handleSubscriptionActivated;
exports.handleSubscriptionCharged = handleSubscriptionCharged;
exports.handleSubscriptionCancelled = handleSubscriptionCancelled;
exports.handleSubscriptionExpired = handleSubscriptionExpired;
exports.handleSubscriptionHalted = handleSubscriptionHalted;
exports.cancelSubscription = cancelSubscription;
const razorpay_1 = __importDefault(require("razorpay"));
const crypto_1 = __importDefault(require("crypto"));
const prisma_1 = require("../config/prisma");
const logger_1 = __importDefault(require("../config/logger"));
const client_1 = require("@prisma/client");
const socket_1 = require("../config/socket");
// Initialize Razorpay client
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET;
let _razorpayClient = null;
/**
 * Returns a lazily-initialized Razorpay client.
 * Throws only when actually called — not at module import time.
 * This prevents test suites from crashing when Razorpay env vars are absent.
 */
function getRazorpayClient() {
    if (_razorpayClient)
        return _razorpayClient;
    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
        logger_1.default.error("RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is missing from environment variables.");
        throw new Error("Razorpay configuration missing: RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be set");
    }
    _razorpayClient = new razorpay_1.default({
        key_id: RAZORPAY_KEY_ID,
        key_secret: RAZORPAY_KEY_SECRET,
    });
    return _razorpayClient;
}
/**
 * Creates a Razorpay subscription for the given user.
 */
async function createSubscription(userId, planType) {
    const planId = planType === client_1.PlanType.MONTHLY
        ? process.env.RAZORPAY_MONTHLY_PLAN_ID
        : process.env.RAZORPAY_YEARLY_PLAN_ID;
    if (!planId) {
        throw new Error(`Razorpay plan ID for ${planType} is not configured.`);
    }
    try {
        const subscription = await getRazorpayClient().subscriptions.create({
            plan_id: planId,
            total_count: 120, // 10 years max
            quantity: 1,
            customer_notify: 1,
        });
        // Create a Subscription record in DB with status PENDING
        await prisma_1.prisma.subscription.create({
            data: {
                userId,
                razorpaySubscriptionId: subscription.id,
                planType,
                status: client_1.SubscriptionStatus.PENDING,
                amount: planType === client_1.PlanType.MONTHLY ? 5900 : 58900, // in paise
                currency: "INR",
            },
        });
        return subscription;
    }
    catch (error) {
        logger_1.default.error("Failed to create Razorpay subscription", error);
        throw new Error("Failed to initialize subscription with payment provider", { cause: error });
    }
}
/**
 * HMAC-SHA256 verification for Razorpay webhooks.
 */
function verifyWebhookSignature(body, signature) {
    if (!RAZORPAY_WEBHOOK_SECRET) {
        logger_1.default.error("RAZORPAY_WEBHOOK_SECRET is missing");
        return false;
    }
    try {
        const expectedSignature = crypto_1.default
            .createHmac("sha256", RAZORPAY_WEBHOOK_SECRET)
            .update(body)
            .digest("hex");
        return crypto_1.default.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
    }
    catch (error) {
        logger_1.default.error("Webhook signature verification failed", error);
        return false;
    }
}
/**
 * Handles subscription.activated webhook event.
 */
async function handleSubscriptionActivated(payload) {
    const subscriptionData = payload.subscription.entity;
    const razorpaySubscriptionId = subscriptionData.id;
    const razorpayPaymentId = payload.payment?.entity?.id;
    try {
        const dbSub = await prisma_1.prisma.subscription.findUnique({
            where: { razorpaySubscriptionId },
        });
        if (!dbSub) {
            logger_1.default.warn(`Subscription ${razorpaySubscriptionId} not found in DB`);
            return;
        }
        const endsAt = new Date(subscriptionData.current_end * 1000);
        await prisma_1.prisma.$transaction([
            prisma_1.prisma.subscription.update({
                where: { id: dbSub.id },
                data: {
                    status: client_1.SubscriptionStatus.ACTIVE,
                    razorpayPaymentId,
                    currentPeriodStart: new Date(subscriptionData.current_start * 1000),
                    currentPeriodEnd: endsAt,
                },
            }),
            prisma_1.prisma.user.update({
                where: { id: dbSub.userId },
                data: {
                    isPro: true,
                    subscriptionStatus: client_1.SubscriptionStatus.ACTIVE,
                    subscriptionEndsAt: endsAt,
                    proActivatedAt: new Date(),
                    planType: dbSub.planType,
                    subscriptionId: razorpaySubscriptionId,
                },
            }),
        ]);
        // Emit Socket.IO event
        (0, socket_1.getIo)().to(`user:${dbSub.userId}`).emit("pro:activated", {
            planType: dbSub.planType,
            expiresAt: endsAt
        });
        logger_1.default.info(`Pro activated for user ${dbSub.userId}`);
    }
    catch (error) {
        logger_1.default.error("Error handling subscription activation", error);
        throw error;
    }
}
/**
 * Handles subscription.charged (renewal) webhook event.
 */
async function handleSubscriptionCharged(payload) {
    const subscriptionData = payload.subscription.entity;
    const razorpaySubscriptionId = subscriptionData.id;
    try {
        const endsAt = new Date(subscriptionData.current_end * 1000);
        await prisma_1.prisma.subscription.update({
            where: { razorpaySubscriptionId },
            data: {
                currentPeriodEnd: endsAt,
                status: client_1.SubscriptionStatus.ACTIVE,
            },
        });
        // Update user record too
        const dbSub = await prisma_1.prisma.subscription.findUnique({
            where: { razorpaySubscriptionId },
            select: { userId: true },
        });
        if (dbSub) {
            await prisma_1.prisma.user.update({
                where: { id: dbSub.userId },
                data: {
                    subscriptionEndsAt: endsAt,
                    subscriptionStatus: client_1.SubscriptionStatus.ACTIVE,
                },
            });
        }
        logger_1.default.info(`Subscription renewed for ${razorpaySubscriptionId}`);
    }
    catch (error) {
        logger_1.default.error("Error handling subscription charge", error);
    }
}
/**
 * Handles subscription.cancelled webhook event.
 */
async function handleSubscriptionCancelled(payload) {
    const razorpaySubscriptionId = payload.subscription.entity.id;
    try {
        const dbSub = await prisma_1.prisma.subscription.findUnique({
            where: { razorpaySubscriptionId },
        });
        if (dbSub) {
            await prisma_1.prisma.subscription.update({
                where: { id: dbSub.id },
                data: { status: client_1.SubscriptionStatus.CANCELLED, cancelledAt: new Date() },
            });
            await prisma_1.prisma.user.update({
                where: { id: dbSub.userId },
                data: { subscriptionStatus: client_1.SubscriptionStatus.CANCELLED },
            });
        }
        logger_1.default.info(`Subscription cancelled: ${razorpaySubscriptionId}`);
    }
    catch (error) {
        logger_1.default.error("Error handling subscription cancellation", error);
    }
}
/**
 * Handles subscription.expired webhook event.
 */
async function handleSubscriptionExpired(payload) {
    const razorpaySubscriptionId = payload.subscription.entity.id;
    try {
        const dbSub = await prisma_1.prisma.subscription.findUnique({
            where: { razorpaySubscriptionId },
        });
        if (dbSub) {
            await prisma_1.prisma.$transaction([
                prisma_1.prisma.subscription.update({
                    where: { id: dbSub.id },
                    data: { status: client_1.SubscriptionStatus.EXPIRED },
                }),
                prisma_1.prisma.user.update({
                    where: { id: dbSub.userId },
                    data: {
                        isPro: false,
                        subscriptionStatus: client_1.SubscriptionStatus.EXPIRED
                    },
                }),
            ]);
        }
        logger_1.default.info(`Subscription expired: ${razorpaySubscriptionId}`);
    }
    catch (error) {
        logger_1.default.error("Error handling subscription expiry", error);
    }
}
/**
 * Handles subscription.halted webhook event.
 */
async function handleSubscriptionHalted(payload) {
    const razorpaySubscriptionId = payload.subscription.entity.id;
    try {
        const dbSub = await prisma_1.prisma.subscription.findUnique({
            where: { razorpaySubscriptionId },
        });
        if (dbSub) {
            await prisma_1.prisma.user.update({
                where: { id: dbSub.userId },
                data: { subscriptionStatus: client_1.SubscriptionStatus.HALTED },
            });
        }
        logger_1.default.info(`Subscription halted: ${razorpaySubscriptionId}`);
    }
    catch (error) {
        logger_1.default.error("Error handling subscription halt", error);
    }
}
/**
 * Cancels a subscription at the end of the current period.
 */
async function cancelSubscription(razorpaySubscriptionId) {
    try {
        await getRazorpayClient().subscriptions.cancel(razorpaySubscriptionId, true); // cancel_at_cycle_end: true
        await prisma_1.prisma.subscription.update({
            where: { razorpaySubscriptionId },
            data: { status: client_1.SubscriptionStatus.CANCELLED, cancelledAt: new Date() },
        });
        const dbSub = await prisma_1.prisma.subscription.findUnique({
            where: { razorpaySubscriptionId },
            select: { userId: true },
        });
        if (dbSub) {
            await prisma_1.prisma.user.update({
                where: { id: dbSub.userId },
                data: { subscriptionStatus: client_1.SubscriptionStatus.CANCELLED },
            });
        }
        return true;
    }
    catch (error) {
        logger_1.default.error(`Failed to cancel subscription ${razorpaySubscriptionId}`, error);
        throw new Error("Failed to cancel subscription with payment provider", { cause: error });
    }
}
//# sourceMappingURL=payment.service.js.map