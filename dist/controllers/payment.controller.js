"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSubscription = createSubscription;
exports.webhookHandler = webhookHandler;
exports.getSubscriptionStatus = getSubscriptionStatus;
exports.cancelSubscription = cancelSubscription;
const prisma_1 = require("../config/prisma");
const apiResponse_1 = require("../utils/apiResponse");
const paymentService = __importStar(require("../services/payment.service"));
const logger_1 = __importDefault(require("../config/logger"));
const client_1 = require("@prisma/client");
/**
 * Initiates a Razorpay subscription.
 * POST /api/v1/payments/subscribe
 */
async function createSubscription(req, res, next) {
    try {
        const { planType } = req.body;
        const userId = req.user.userId;
        if (!planType || (planType !== "MONTHLY" && planType !== "YEARLY")) {
            (0, apiResponse_1.sendError)(res, "Invalid plan type. Use 'MONTHLY' or 'YEARLY'.", 400);
            return;
        }
        // Check if user already has an active subscription
        const existingUser = await prisma_1.prisma.user.findUnique({
            where: { id: userId },
            select: { subscriptionStatus: true, isPro: true }
        });
        if (existingUser?.isPro || existingUser?.subscriptionStatus === client_1.SubscriptionStatus.ACTIVE) {
            (0, apiResponse_1.sendError)(res, "You already have an active Pro subscription.", 409);
            return;
        }
        const subscription = await paymentService.createSubscription(userId, planType);
        (0, apiResponse_1.sendSuccess)(res, {
            subscriptionId: subscription.id,
            razorpayKeyId: process.env.RAZORPAY_KEY_ID,
        }, "Subscription initiated");
    }
    catch (err) {
        next(err);
    }
}
/**
 * Processes Razorpay webhooks.
 * POST /api/v1/payments/webhook
 */
async function webhookHandler(req, res, next) {
    const signature = req.headers["x-razorpay-signature"];
    const rawBody = req.rawBody; // Assumes raw body middleware is used
    if (!signature || !rawBody) {
        logger_1.default.warn("Received webhook without signature or raw body");
        res.status(400).send("Bad Request");
        return;
    }
    const isValid = paymentService.verifyWebhookSignature(rawBody, signature);
    if (!isValid) {
        logger_1.default.warn("Invalid Razorpay webhook signature attempt");
        res.status(400).send("Invalid signature");
        return;
    }
    // Always return 200 early to Razorpay
    res.status(200).send("OK");
    try {
        const payload = JSON.parse(rawBody);
        const event = payload.event;
        logger_1.default.info(`Processing Razorpay webhook event: ${event}`);
        switch (event) {
            case "subscription.activated":
                await paymentService.handleSubscriptionActivated(payload.payload);
                break;
            case "subscription.charged":
                await paymentService.handleSubscriptionCharged(payload.payload);
                break;
            case "subscription.cancelled":
                await paymentService.handleSubscriptionCancelled(payload.payload);
                break;
            case "subscription.expired":
                await paymentService.handleSubscriptionExpired(payload.payload);
                break;
            case "subscription.halted":
                await paymentService.handleSubscriptionHalted(payload.payload);
                break;
            default:
                logger_1.default.info(`Unhandled Razorpay event: ${event}`);
        }
    }
    catch (err) {
        logger_1.default.error("Error processing Razorpay webhook payload", err);
    }
}
/**
 * Returns the current user's subscription status.
 * GET /api/v1/payments/status
 */
async function getSubscriptionStatus(req, res, next) {
    try {
        const userId = req.user.userId;
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: userId },
            select: {
                isPro: true,
                planType: true,
                subscriptionStatus: true,
                subscriptionEndsAt: true,
            },
        });
        if (!user) {
            (0, apiResponse_1.sendError)(res, "User not found", 404);
            return;
        }
        // Lazy expiry check
        let isPro = user.isPro;
        let status = user.subscriptionStatus;
        if (isPro && user.subscriptionEndsAt && user.subscriptionEndsAt < new Date()) {
            isPro = false;
            status = client_1.SubscriptionStatus.EXPIRED;
            await prisma_1.prisma.user.update({
                where: { id: userId },
                data: { isPro: false, subscriptionStatus: client_1.SubscriptionStatus.EXPIRED },
            });
            logger_1.default.info(`User ${userId} pro status lazily revoked due to expiry`);
        }
        (0, apiResponse_1.sendSuccess)(res, {
            isPro,
            planType: user.planType,
            subscriptionStatus: status,
            subscriptionEndsAt: user.subscriptionEndsAt,
        });
    }
    catch (err) {
        next(err);
    }
}
/**
 * Cancels a subscription at the end of the current period.
 * POST /api/v1/payments/cancel
 */
async function cancelSubscription(req, res, next) {
    try {
        const userId = req.user.userId;
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: userId },
            select: { subscriptionId: true, subscriptionStatus: true }
        });
        if (!user?.subscriptionId || user.subscriptionStatus !== client_1.SubscriptionStatus.ACTIVE) {
            (0, apiResponse_1.sendError)(res, "No active subscription found to cancel.", 400);
            return;
        }
        await paymentService.cancelSubscription(user.subscriptionId);
        (0, apiResponse_1.sendSuccess)(res, null, "Subscription will be cancelled at the end of the current period.");
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=payment.controller.js.map