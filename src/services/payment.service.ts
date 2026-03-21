/**
 * payment.service.ts
 * 
 * Handles all Razorpay subscription lifecycle operations.
 * This service is the ONLY place that interacts with Razorpay SDK.
 * Never import Razorpay directly in controllers.
 */

import Razorpay from "razorpay";
import crypto from "crypto";
import { prisma } from "../config/prisma";
import logger from "../config/logger";
import { PlanType, SubscriptionStatus } from "@prisma/client";
import { getIo } from "../config/socket";

// Initialize Razorpay client
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET;

if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
  logger.error("RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is missing from environment variables.");
  throw new Error("Razorpay configuration missing");
}

const razorpay = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET,
});

/**
 * Creates a Razorpay subscription for the given user.
 */
export async function createSubscription(userId: string, planType: PlanType) {
  const planId = planType === PlanType.MONTHLY 
    ? process.env.RAZORPAY_MONTHLY_PLAN_ID 
    : process.env.RAZORPAY_YEARLY_PLAN_ID;

  if (!planId) {
    throw new Error(`Razorpay plan ID for ${planType} is not configured.`);
  }

  try {
    const subscription = await razorpay.subscriptions.create({
      plan_id: planId,
      total_count: 120, // 10 years max
      quantity: 1,
      customer_notify: 1,
    });

    // Create a Subscription record in DB with status PENDING
    await prisma.subscription.create({
      data: {
        userId,
        razorpaySubscriptionId: subscription.id,
        planType,
        status: SubscriptionStatus.PENDING,
        amount: planType === PlanType.MONTHLY ? 5900 : 58900, // in paise
        currency: "INR",
      },
    });

    return subscription;
  } catch (error) {
    logger.error("Failed to create Razorpay subscription", error);
    throw new Error("Failed to initialize subscription with payment provider", { cause: error });
  }
}

/**
 * HMAC-SHA256 verification for Razorpay webhooks.
 */
export function verifyWebhookSignature(body: string, signature: string): boolean {
  if (!RAZORPAY_WEBHOOK_SECRET) {
    logger.error("RAZORPAY_WEBHOOK_SECRET is missing");
    return false;
  }

  try {
    const expectedSignature = crypto
      .createHmac("sha256", RAZORPAY_WEBHOOK_SECRET)
      .update(body)
      .digest("hex");

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch (error) {
    logger.error("Webhook signature verification failed", error);
    return false;
  }
}

/**
 * Handles subscription.activated webhook event.
 */
export async function handleSubscriptionActivated(payload: any) {
  const subscriptionData = payload.subscription.entity;
  const razorpaySubscriptionId = subscriptionData.id;
  const razorpayPaymentId = payload.payment?.entity?.id;

  try {
    const dbSub = await prisma.subscription.findUnique({
      where: { razorpaySubscriptionId },
    });

    if (!dbSub) {
      logger.warn(`Subscription ${razorpaySubscriptionId} not found in DB`);
      return;
    }

    const endsAt = new Date(subscriptionData.current_end * 1000);

    await prisma.$transaction([
      prisma.subscription.update({
        where: { id: dbSub.id },
        data: {
          status: SubscriptionStatus.ACTIVE,
          razorpayPaymentId,
          currentPeriodStart: new Date(subscriptionData.current_start * 1000),
          currentPeriodEnd: endsAt,
        },
      }),
      prisma.user.update({
        where: { id: dbSub.userId },
        data: {
          isPro: true,
          subscriptionStatus: SubscriptionStatus.ACTIVE,
          subscriptionEndsAt: endsAt,
          proActivatedAt: new Date(),
          planType: dbSub.planType,
          subscriptionId: razorpaySubscriptionId,
        },
      }),
    ]);

    // Emit Socket.IO event
    getIo().to(`user:${dbSub.userId}`).emit("pro:activated", { 
      planType: dbSub.planType,
      expiresAt: endsAt 
    });

    logger.info(`Pro activated for user ${dbSub.userId}`);
  } catch (error) {
    logger.error("Error handling subscription activation", error);
    throw error;
  }
}

/**
 * Handles subscription.charged (renewal) webhook event.
 */
export async function handleSubscriptionCharged(payload: any) {
  const subscriptionData = payload.subscription.entity;
  const razorpaySubscriptionId = subscriptionData.id;

  try {
    const endsAt = new Date(subscriptionData.current_end * 1000);

    await prisma.subscription.update({
      where: { razorpaySubscriptionId },
      data: {
        currentPeriodEnd: endsAt,
        status: SubscriptionStatus.ACTIVE,
      },
    });

    // Update user record too
    const dbSub = await prisma.subscription.findUnique({
      where: { razorpaySubscriptionId },
      select: { userId: true },
    });

    if (dbSub) {
      await prisma.user.update({
        where: { id: dbSub.userId },
        data: {
          subscriptionEndsAt: endsAt,
          subscriptionStatus: SubscriptionStatus.ACTIVE,
        },
      });
    }

    logger.info(`Subscription renewed for ${razorpaySubscriptionId}`);
  } catch (error) {
    logger.error("Error handling subscription charge", error);
  }
}

/**
 * Handles subscription.cancelled webhook event.
 */
export async function handleSubscriptionCancelled(payload: any) {
  const razorpaySubscriptionId = payload.subscription.entity.id;

  try {
    const dbSub = await prisma.subscription.findUnique({
      where: { razorpaySubscriptionId },
    });

    if (dbSub) {
      await prisma.subscription.update({
        where: { id: dbSub.id },
        data: { status: SubscriptionStatus.CANCELLED, cancelledAt: new Date() },
      });

      await prisma.user.update({
        where: { id: dbSub.userId },
        data: { subscriptionStatus: SubscriptionStatus.CANCELLED },
      });
    }

    logger.info(`Subscription cancelled: ${razorpaySubscriptionId}`);
  } catch (error) {
    logger.error("Error handling subscription cancellation", error);
  }
}

/**
 * Handles subscription.expired webhook event.
 */
export async function handleSubscriptionExpired(payload: any) {
  const razorpaySubscriptionId = payload.subscription.entity.id;

  try {
    const dbSub = await prisma.subscription.findUnique({
      where: { razorpaySubscriptionId },
    });

    if (dbSub) {
      await prisma.$transaction([
        prisma.subscription.update({
          where: { id: dbSub.id },
          data: { status: SubscriptionStatus.EXPIRED },
        }),
        prisma.user.update({
          where: { id: dbSub.userId },
          data: { 
            isPro: false, 
            subscriptionStatus: SubscriptionStatus.EXPIRED 
          },
        }),
      ]);
    }

    logger.info(`Subscription expired: ${razorpaySubscriptionId}`);
  } catch (error) {
    logger.error("Error handling subscription expiry", error);
  }
}

/**
 * Handles subscription.halted webhook event.
 */
export async function handleSubscriptionHalted(payload: any) {
  const razorpaySubscriptionId = payload.subscription.entity.id;

  try {
    const dbSub = await prisma.subscription.findUnique({
      where: { razorpaySubscriptionId },
    });

    if (dbSub) {
      await prisma.user.update({
        where: { id: dbSub.userId },
        data: { subscriptionStatus: SubscriptionStatus.HALTED },
      });
    }

    logger.info(`Subscription halted: ${razorpaySubscriptionId}`);
  } catch (error) {
    logger.error("Error handling subscription halt", error);
  }
}

/**
 * Cancels a subscription at the end of the current period.
 */
export async function cancelSubscription(razorpaySubscriptionId: string) {
  try {
    await razorpay.subscriptions.cancel(razorpaySubscriptionId, true); // cancel_at_cycle_end: true
    
    await prisma.subscription.update({
      where: { razorpaySubscriptionId },
      data: { status: SubscriptionStatus.CANCELLED, cancelledAt: new Date() },
    });

    const dbSub = await prisma.subscription.findUnique({
      where: { razorpaySubscriptionId },
      select: { userId: true },
    });

    if (dbSub) {
      await prisma.user.update({
        where: { id: dbSub.userId },
        data: { subscriptionStatus: SubscriptionStatus.CANCELLED },
      });
    }

    return true;
  } catch (error) {
    logger.error(`Failed to cancel subscription ${razorpaySubscriptionId}`, error);
    throw new Error("Failed to cancel subscription with payment provider", { cause: error });
  }
}
