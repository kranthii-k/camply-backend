"use strict";
/**
 * job.routes.ts
 *
 * GET  /api/v1/jobs           — public, list active jobs
 * POST /api/v1/jobs/submit    — public, company submits job for review
 * PATCH /api/v1/jobs/:id/status — protected (admin), toggle status
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const job_controller_1 = require("../controllers/job.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validate_middleware_1 = require("../middleware/validate.middleware");
const schemas_1 = require("../models/schemas");
const router = (0, express_1.Router)();
router.get("/", job_controller_1.getJobs);
router.post("/submit", (0, validate_middleware_1.validate)(schemas_1.submitJobSchema), job_controller_1.submitJob);
router.patch("/:id/status", auth_middleware_1.authenticate, (0, validate_middleware_1.validate)(schemas_1.updateJobStatusSchema), job_controller_1.updateJobStatus);
exports.default = router;
//# sourceMappingURL=job.routes.js.map