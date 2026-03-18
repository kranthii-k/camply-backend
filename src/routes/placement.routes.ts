/**
 * placement.routes.ts
 *
 * GET    /api/v1/placements                              — public
 * POST   /api/v1/placements                              — auth required
 * POST   /api/v1/placements/:id/upvote                  — auth required
 * POST   /api/v1/placements/:id/comments                — auth required
 * DELETE /api/v1/placements/:id/comments/:commentId     — auth required
 */

import { Router } from "express";
import {
  getPlacements,
  createPlacement,
  toggleUpvote,
  addPlacementComment,
  deletePlacementComment,
} from "../controllers/placement.controller";
import { authenticate, optionalAuth } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import {
  createPlacementPostSchema,
  placementUpvoteSchema,
  placementCommentSchema,
} from "../models/schemas";

const router = Router();

router.get("/", optionalAuth, getPlacements);
router.post("/", authenticate, validate(createPlacementPostSchema), createPlacement);
router.post("/:id/upvote", authenticate, validate(placementUpvoteSchema), toggleUpvote);
router.post("/:id/comments", authenticate, validate(placementCommentSchema), addPlacementComment);
router.delete("/:id/comments/:commentId", authenticate, deletePlacementComment);

export default router;
