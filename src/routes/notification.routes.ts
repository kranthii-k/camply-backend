import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import * as notificationController from "../controllers/notification.controller";

const router = Router();

router.use(authenticate);

router.get("/", notificationController.getNotifications);
router.patch("/read-all", notificationController.markAllAsRead);
router.patch("/:id/read", notificationController.markAsRead);

export default router;
