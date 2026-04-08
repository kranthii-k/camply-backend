/**
 * job.controller.ts
 *
 * Handles all business logic for the Jobs/Careers section.
 * Three operations are supported:
 *   1. Public listing of active jobs (GET) — used by the frontend
 *   2. Public job submission (POST /submit) — company applies to post a job
 *   3. Admin status update (PATCH /:id/status) — toggle active/inactive/rejected
 *
 * Design decisions:
 *   - Job submissions go to PENDING status; they do not appear in public
 *     listings until an admin sets status to ACTIVE.
 *   - Camply internal jobs (source=CAMPLY_INTERNAL) are always isPinned=true
 *     and sorted first in the response.
 *   - Admin auth is a lightweight check: only authenticated users whose
 *     email matches ADMIN_EMAIL env var can change job status. This avoids
 *     building a full role system at this stage while keeping the endpoint
 *     protected.
 */
import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
export declare function getJobs(_req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function submitJob(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function updateJobStatus(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=job.controller.d.ts.map