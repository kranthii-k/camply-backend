"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const team_controller_1 = require("../controllers/team.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validate_middleware_1 = require("../middleware/validate.middleware");
const schemas_1 = require("../models/schemas");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
router.get("/", team_controller_1.getAllTeams);
router.get("/mine", team_controller_1.getMyTeams);
router.get("/:id", team_controller_1.getTeam);
router.post("/", (0, validate_middleware_1.validate)(schemas_1.createTeamSchema), team_controller_1.createTeam);
router.patch("/:id", (0, validate_middleware_1.validate)(schemas_1.updateTeamSchema), team_controller_1.updateTeam);
router.post("/:id/invite", team_controller_1.inviteMember);
router.delete("/:id/members/me", team_controller_1.leaveTeam);
router.delete("/:id", team_controller_1.deleteTeam);
exports.default = router;
//# sourceMappingURL=team.routes.js.map