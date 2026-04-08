"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const post_controller_1 = require("../controllers/post.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validate_middleware_1 = require("../middleware/validate.middleware");
const schemas_1 = require("../models/schemas");
const router = (0, express_1.Router)();
router.get("/", auth_middleware_1.optionalAuth, post_controller_1.getFeed);
router.post("/", auth_middleware_1.authenticate, (0, validate_middleware_1.validate)(schemas_1.createPostSchema), post_controller_1.createPost);
router.get("/:id", auth_middleware_1.optionalAuth, post_controller_1.getPost);
router.patch("/:id", auth_middleware_1.authenticate, (0, validate_middleware_1.validate)(schemas_1.updatePostSchema), post_controller_1.updatePost);
router.delete("/:id", auth_middleware_1.authenticate, post_controller_1.deletePost);
router.post("/:id/vote", auth_middleware_1.authenticate, (0, validate_middleware_1.validate)(schemas_1.voteSchema), post_controller_1.votePost);
router.post("/:id/comments", auth_middleware_1.authenticate, (0, validate_middleware_1.validate)(schemas_1.commentSchema), post_controller_1.addComment);
router.delete("/:id/comments/:commentId", auth_middleware_1.authenticate, post_controller_1.deleteComment);
exports.default = router;
//# sourceMappingURL=post.routes.js.map