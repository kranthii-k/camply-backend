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
/**
 * Middleware to restrict access to Pro users only.
 */
export declare function requiresPro(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=pro.middleware.d.ts.map