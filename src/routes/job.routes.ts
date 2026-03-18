/**
 * job.routes.ts
 *
 * GET  /api/v1/jobs           — public, list active jobs
 * POST /api/v1/jobs/submit    — public, company submits job for review
 * PATCH /api/v1/jobs/:id/status — protected (admin), toggle status
 */

import { Router } from "express";
import { getJobs, submitJob, updateJobStatus } from "../controllers/job.controller";
import { authenticate } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { submitJobSchema, updateJobStatusSchema } from "../models/schemas";

const router = Router();

router.get("/", getJobs);
router.post("/submit", validate(submitJobSchema), submitJob);
router.patch("/:id/status", authenticate, validate(updateJobStatusSchema), updateJobStatus);

export default router;
