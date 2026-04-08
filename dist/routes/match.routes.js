"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const match_controller_1 = require("../controllers/match.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validate_middleware_1 = require("../middleware/validate.middleware");
const schemas_1 = require("../models/schemas");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate); // All match routes require auth
router.get("/profiles", match_controller_1.getProfiles);
router.post("/like", (0, validate_middleware_1.validate)(schemas_1.swipeSchema), match_controller_1.swipe);
router.get("/matches", match_controller_1.getMatches);
router.post("/reset-rejected", match_controller_1.resetRejected);
router.post("/reset-all", match_controller_1.resetAll);
router.get("/invitations", match_controller_1.getInvitations);
exports.default = router;
//# sourceMappingURL=match.routes.js.map