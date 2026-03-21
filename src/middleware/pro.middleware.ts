/**
 * pro.middleware.ts
 * 
 * Verifies that the authenticated user has an active Pro subscription.
 * Must be used AFTER authenticate middleware, never standalone.
 * 
 * Also performs lazy expiry check — if subscriptionEndsAt has passed,
 * revokes isPro in DB before rejecting the request.
 */

import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth.middleware";
import { prisma } from "../config/prisma";
import { getCached, setCache } from "../config/redis";
import { sendError } from "../utils/apiResponse";
import { SubscriptionStatus } from "@prisma/client";
import logger from "../config/logger";

interface ProStatus {
  isPro: boolean;
  subscriptionEndsAt: string | null;
  subscriptionStatus: SubscriptionStatus;
}

/**
 * Middleware to restrict access to Pro users only.
 */
export async function requiresPro(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const userId = req.user?.userId;

  if (!userId) {
    sendError(res, "Authentication required", 401);
    return;
  }

  try {
    const cacheKey = `user:pro:${userId}`;
    let status = await getCached<ProStatus>(cacheKey);

    if (!status) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          isPro: true,
          subscriptionEndsAt: true,
          subscriptionStatus: true,
        },
      });

      if (!user) {
        sendError(res, "User not found", 404);
        return;
      }

      status = {
        isPro: user.isPro,
        subscriptionEndsAt: user.subscriptionEndsAt?.toISOString() || null,
        subscriptionStatus: user.subscriptionStatus,
      };

      // Cache for 5 minutes
      await setCache(cacheKey, status, 300);
    }

    // Lazy expiry check
    if (status.isPro && status.subscriptionEndsAt) {
      const expiryDate = new Date(status.subscriptionEndsAt);
      if (expiryDate < new Date()) {
        // Update DB
        await prisma.user.update({
          where: { id: userId },
          data: { 
            isPro: false, 
            subscriptionStatus: SubscriptionStatus.EXPIRED 
          },
        });

        // Update cache (expiry is true now)
        status.isPro = false;
        status.subscriptionStatus = SubscriptionStatus.EXPIRED;
        await setCache(cacheKey, status, 300);
        
        logger.info(`Lazy expiry trigger for user ${userId}`);
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
  } catch (error) {
    logger.error("Error in requiresPro middleware", error);
    next(error);
  }
}
