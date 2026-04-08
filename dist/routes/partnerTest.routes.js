"use strict";
/**
 * partnerTest.routes.ts
 *
 * GET /api/v1/partner-tests — public, list active partner test cards
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const partnerTest_controller_1 = require("../controllers/partnerTest.controller");
const router = (0, express_1.Router)();
router.get("/", partnerTest_controller_1.getPartnerTests);
exports.default = router;
//# sourceMappingURL=partnerTest.routes.js.map