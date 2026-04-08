"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const passport_1 = __importDefault(require("passport"));
const auth_controller_1 = require("../controllers/auth.controller");
const google_auth_controller_1 = require("../controllers/google.auth.controller");
const validate_middleware_1 = require("../middleware/validate.middleware");
const auth_middleware_1 = require("../middleware/auth.middleware");
const schemas_1 = require("../models/schemas");
const router = (0, express_1.Router)();
// Public
router.post("/register", (0, validate_middleware_1.validate)(schemas_1.registerSchema), auth_controller_1.register);
router.post("/login", (0, validate_middleware_1.validate)(schemas_1.loginSchema), auth_controller_1.login);
router.post("/refresh", auth_controller_1.refresh);
router.post("/logout", auth_controller_1.logout);
// Google OAuth
router.get("/google", passport_1.default.authenticate("google", { scope: ["email", "profile"] }));
router.get("/google/callback", passport_1.default.authenticate("google", { session: false }), google_auth_controller_1.googleCallback);
// Protected
router.get("/me", auth_middleware_1.authenticate, auth_controller_1.me);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map