import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
/**
 * Initiates a Razorpay subscription.
 * POST /api/v1/payments/subscribe
 */
export declare function createSubscription(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
/**
 * Processes Razorpay webhooks.
 * POST /api/v1/payments/webhook
 */
export declare function webhookHandler(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * Returns the current user's subscription status.
 * GET /api/v1/payments/status
 */
export declare function getSubscriptionStatus(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
/**
 * Cancels a subscription at the end of the current period.
 * POST /api/v1/payments/cancel
 */
export declare function cancelSubscription(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=payment.controller.d.ts.map