/**
 * payment.service.ts
 *
 * Handles all Razorpay subscription lifecycle operations.
 * This service is the ONLY place that interacts with Razorpay SDK.
 * Never import Razorpay directly in controllers.
 */
import { PlanType } from "@prisma/client";
/**
 * Creates a Razorpay subscription for the given user.
 */
export declare function createSubscription(userId: string, planType: PlanType): Promise<import("razorpay/dist/types/subscriptions").Subscriptions.RazorpaySubscription>;
/**
 * HMAC-SHA256 verification for Razorpay webhooks.
 */
export declare function verifyWebhookSignature(body: string, signature: string): boolean;
/**
 * Handles subscription.activated webhook event.
 */
export declare function handleSubscriptionActivated(payload: any): Promise<void>;
/**
 * Handles subscription.charged (renewal) webhook event.
 */
export declare function handleSubscriptionCharged(payload: any): Promise<void>;
/**
 * Handles subscription.cancelled webhook event.
 */
export declare function handleSubscriptionCancelled(payload: any): Promise<void>;
/**
 * Handles subscription.expired webhook event.
 */
export declare function handleSubscriptionExpired(payload: any): Promise<void>;
/**
 * Handles subscription.halted webhook event.
 */
export declare function handleSubscriptionHalted(payload: any): Promise<void>;
/**
 * Cancels a subscription at the end of the current period.
 */
export declare function cancelSubscription(razorpaySubscriptionId: string): Promise<boolean>;
//# sourceMappingURL=payment.service.d.ts.map