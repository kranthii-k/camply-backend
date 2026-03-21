import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { requiresPro } from "../middleware/pro.middleware";
import { validate } from "../middleware/validate.middleware";
import { createHostedEventSchema } from "../models/schemas";
import * as eventController from "../controllers/hostedEvent.controller";

const router = Router();

// Publicly view approved events
router.get("/", eventController.getEvents);

// Pro users can host events
router.post("/", authenticate, requiresPro, validate(createHostedEventSchema), eventController.createEvent);

// Admin routes (would normally be in a separate admin.routes for better gating)
// For simplicity within the requested brief:
router.get("/admin", authenticate, eventController.getAdminEvents);
router.patch("/admin/:id/status", authenticate, eventController.approveEvent);

export default router;
