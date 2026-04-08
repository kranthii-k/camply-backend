"use strict";
/**
 * placement.routes.ts
 *
 * GET    /api/v1/placements                              — public
 * POST   /api/v1/placements                              — auth required
 * POST   /api/v1/placements/:id/upvote                  — auth required
 * POST   /api/v1/placements/:id/comments                — auth required
 * DELETE /api/v1/placements/:id/comments/:commentId     — auth required
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const placement_controller_1 = require("../controllers/placement.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validate_middleware_1 = require("../middleware/validate.middleware");
const schemas_1 = require("../models/schemas");
const router = (0, express_1.Router)();
router.get("/", auth_middleware_1.optionalAuth, placement_controller_1.getPlacements);
router.post("/", auth_middleware_1.authenticate, (0, validate_middleware_1.validate)(schemas_1.createPlacementPostSchema), placement_controller_1.createPlacement);
router.post("/:id/upvote", auth_middleware_1.authenticate, (0, validate_middleware_1.validate)(schemas_1.placementUpvoteSchema), placement_controller_1.toggleUpvote);
router.post("/:id/comments", auth_middleware_1.authenticate, (0, validate_middleware_1.validate)(schemas_1.placementCommentSchema), placement_controller_1.addPlacementComment);
router.delete("/:id/comments/:commentId", auth_middleware_1.authenticate, placement_controller_1.deletePlacementComment);
exports.default = router;
//# sourceMappingURL=placement.routes.js.map