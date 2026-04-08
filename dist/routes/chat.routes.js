"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const chat_controller_1 = require("../controllers/chat.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validate_middleware_1 = require("../middleware/validate.middleware");
const schemas_1 = require("../models/schemas");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
router.get("/", chat_controller_1.getChats);
router.post("/", (0, validate_middleware_1.validate)(schemas_1.createChatSchema), chat_controller_1.createChat);
router.post("/:id/join", chat_controller_1.joinChat);
router.delete("/:id/members/me", chat_controller_1.leaveChat);
router.get("/:id/messages", chat_controller_1.getMessages);
exports.default = router;
//# sourceMappingURL=chat.routes.js.map