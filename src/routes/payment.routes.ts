import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import * as paymentController from "../controllers/payment.controller";

/**
 * payment.routes.ts
 * 
 * Handles all payment-related endpoints.
 * 
 * NOTE: The webhook route MUST be registered BEFORE the express.json() 
 * middleware in app.ts to properly receive and process the raw body
 * for Razorpay signature verification.
 */

const router = Router();

// Publicly accessible webhook (verification handled internally via signature)
router.post("/webhook", paymentController.webhookHandler);

// Authenticated routes
router.use(authenticate);

router.post("/subscribe", paymentController.createSubscription);
router.get("/status", paymentController.getSubscriptionStatus);
router.post("/cancel", paymentController.cancelSubscription);

export default router;
