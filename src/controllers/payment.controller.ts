import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/prisma";
import { sendSuccess, sendError } from "../utils/apiResponse";
import { AuthRequest } from "../middleware/auth.middleware";
import * as paymentService from "../services/payment.service";
import logger from "../config/logger";
import { SubscriptionStatus } from "@prisma/client";

/**
 * Initiates a Razorpay subscription.
 * POST /api/v1/payments/subscribe
 */
export async function createSubscription(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { planType } = req.body;
    const userId = req.user!.userId;

    if (!planType || (planType !== "MONTHLY" && planType !== "YEARLY")) {
      sendError(res, "Invalid plan type. Use 'MONTHLY' or 'YEARLY'.", 400);
      return;
    }

    // Check if user already has an active subscription
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { subscriptionStatus: true, isPro: true }
    });

    if (existingUser?.isPro || existingUser?.subscriptionStatus === SubscriptionStatus.ACTIVE) {
      sendError(res, "You already have an active Pro subscription.", 409);
      return;
    }

    const subscription = await paymentService.createSubscription(userId, planType);

    sendSuccess(res, {
      subscriptionId: subscription.id,
      razorpayKeyId: process.env.RAZORPAY_KEY_ID,
    }, "Subscription initiated");
  } catch (err) {
    next(err);
  }
}

/**
 * Processes Razorpay webhooks.
 * POST /api/v1/payments/webhook
 */
export async function webhookHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const signature = req.headers["x-razorpay-signature"] as string;
  const rawBody = (req as any).rawBody; // Assumes raw body middleware is used

  if (!signature || !rawBody) {
    logger.warn("Received webhook without signature or raw body");
    res.status(400).send("Bad Request");
    return;
  }

  const isValid = paymentService.verifyWebhookSignature(rawBody, signature);

  if (!isValid) {
    logger.warn("Invalid Razorpay webhook signature attempt");
    res.status(400).send("Invalid signature");
    return;
  }

  // Always return 200 early to Razorpay
  res.status(200).send("OK");

  try {
    const payload = JSON.parse(rawBody);
    const event = payload.event;

    logger.info(`Processing Razorpay webhook event: ${event}`);

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
        logger.info(`Unhandled Razorpay event: ${event}`);
    }
  } catch (err) {
    logger.error("Error processing Razorpay webhook payload", err);
  }
}

/**
 * Returns the current user's subscription status.
 * GET /api/v1/payments/status
 */
export async function getSubscriptionStatus(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        isPro: true,
        planType: true,
        subscriptionStatus: true,
        subscriptionEndsAt: true,
      },
    });

    if (!user) {
      sendError(res, "User not found", 404);
      return;
    }

    // Lazy expiry check
    let isPro = user.isPro;
    let status = user.subscriptionStatus;

    if (isPro && user.subscriptionEndsAt && user.subscriptionEndsAt < new Date()) {
      isPro = false;
      status = SubscriptionStatus.EXPIRED;
      
      await prisma.user.update({
        where: { id: userId },
        data: { isPro: false, subscriptionStatus: SubscriptionStatus.EXPIRED },
      });
      
      logger.info(`User ${userId} pro status lazily revoked due to expiry`);
    }

    sendSuccess(res, {
      isPro,
      planType: user.planType,
      subscriptionStatus: status,
      subscriptionEndsAt: user.subscriptionEndsAt,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Cancels a subscription at the end of the current period.
 * POST /api/v1/payments/cancel
 */
export async function cancelSubscription(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { subscriptionId: true, subscriptionStatus: true }
    });

    if (!user?.subscriptionId || user.subscriptionStatus !== SubscriptionStatus.ACTIVE) {
      sendError(res, "No active subscription found to cancel.", 400);
      return;
    }

    await paymentService.cancelSubscription(user.subscriptionId);

    sendSuccess(res, null, "Subscription will be cancelled at the end of the current period.");
  } catch (err) {
    next(err);
  }
}
