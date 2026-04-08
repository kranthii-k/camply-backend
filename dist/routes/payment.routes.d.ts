/**
 * payment.routes.ts
 *
 * Handles all payment-related endpoints.
 *
 * NOTE: The webhook route MUST be registered BEFORE the express.json()
 * middleware in app.ts to properly receive and process the raw body
 * for Razorpay signature verification.
 */
declare const router: import("express-serve-static-core").Router;
export default router;
//# sourceMappingURL=payment.routes.d.ts.map