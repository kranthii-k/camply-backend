import { Router } from "express";
import {
  getProfiles,
  swipe,
  getMatches,
  resetRejected,
  resetAll,
  getInvitations,
} from "../controllers/match.controller";
import { authenticate } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { swipeSchema } from "../models/schemas";

const router = Router();

router.use(authenticate); // All match routes require auth

router.get("/profiles", getProfiles);
router.post("/like", validate(swipeSchema), swipe);
router.get("/matches", getMatches);
router.post("/reset-rejected", resetRejected);
router.post("/reset-all", resetAll);
router.get("/invitations", getInvitations);

export default router;
