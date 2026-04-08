"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validate_middleware_1 = require("../middleware/validate.middleware");
const schemas_1 = require("../models/schemas");
const cloudinary_1 = require("../config/cloudinary");
const router = (0, express_1.Router)();
router.get("/search", auth_middleware_1.authenticate, user_controller_1.searchUsers);
router.get("/:username", user_controller_1.getProfile);
router.get("/:username/posts", user_controller_1.getUserPosts);
router.patch("/me", auth_middleware_1.authenticate, (0, validate_middleware_1.validate)(schemas_1.updateProfileSchema), user_controller_1.updateProfile);
router.patch("/me/avatar", auth_middleware_1.authenticate, cloudinary_1.avatarUpload.single("avatar"), user_controller_1.updateAvatar);
router.patch("/me/password", auth_middleware_1.authenticate, (0, validate_middleware_1.validate)(schemas_1.changePasswordSchema), user_controller_1.changePassword);
router.patch("/me/onboarding", auth_middleware_1.authenticate, user_controller_1.completeOnboarding);
exports.default = router;
//# sourceMappingURL=user.routes.js.map