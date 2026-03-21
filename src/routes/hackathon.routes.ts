import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { requiresPro } from "../middleware/pro.middleware";
import * as hackathonController from "../controllers/hackathon.controller";

const router = Router();

// Pro-only access to hackathons
router.get("/", authenticate, requiresPro, hackathonController.getHackathons);

// Admin-only sync (admin session check will be handled in admin router or a separate admin middleware)
router.post("/sync", hackathonController.syncHackathons);

export default router;
