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
import prisma from "../config/prisma";
import { sendSuccess, sendError } from "../utils/apiResponse";
import { AuthRequest } from "../middleware/auth.middleware";
import logger from "../config/logger";

// ─────────────────────────────────────────────────────────
// GET /api/v1/jobs
// Public. Returns all ACTIVE jobs, pinned first.
// ─────────────────────────────────────────────────────────
export async function getJobs(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const jobs = await prisma.job.findMany({
      where: { status: "ACTIVE" },
      orderBy: [
        { isPinned: "desc" },       // Pinned (Camply internal) always first
        { createdAt: "desc" },      // Then newest first
      ],
      select: {
        id: true,
        companyName: true,
        companyLogo: true,
        role: true,
        location: true,
        description: true,
        compensationType: true,
        compensationNote: true,
        perks: true,
        requirements: true,
        applyEmail: true,
        applySubject: true,
        source: true,
        isPinned: true,
        createdAt: true,
        // Exclude: submitterName, submitterEmail, submitterNote (internal only)
        // Exclude: status (frontend only shows active, no need to expose)
      },
    });

    logger.info(`[Jobs] Fetched ${jobs.length} active jobs`);
    sendSuccess(res, { jobs, total: jobs.length });
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────
// POST /api/v1/jobs/submit
// Public. Company submits a job post for review.
// Goes to PENDING — not visible publicly until ACTIVE.
// ─────────────────────────────────────────────────────────
export async function submitJob(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const {
      companyName,
      companyLogo,
      role,
      location,
      description,
      compensationType,
      compensationNote,
      perks,
      requirements,
      applyEmail,
      applySubject,
      submitterName,
      submitterEmail,
      submitterNote,
    } = req.body;

    const job = await prisma.job.create({
      data: {
        companyName,
        companyLogo: companyLogo ?? null,
        role,
        location,
        description,
        compensationType,
        compensationNote,
        perks,
        requirements,
        applyEmail,
        applySubject,
        submitterName,
        submitterEmail,
        submitterNote: submitterNote ?? null,
        source: "PARTNER",
        status: "PENDING",    // Always pending on submission
        isPinned: false,       // Partners are never auto-pinned
      },
      select: { id: true, companyName: true, role: true, status: true },
    });

    logger.info(`[Jobs] New job submitted: ${companyName} — ${role} (id: ${job.id})`);

    sendSuccess(
      res,
      { job },
      "Job submitted successfully. Our team will review it shortly.",
      201
    );
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────
// PATCH /api/v1/jobs/:id/status
// Protected (admin only). Toggle job status.
// ─────────────────────────────────────────────────────────
export async function updateJobStatus(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = req.params.id as string;
    const { status } = req.body;

    // Lightweight admin guard — checks email against ADMIN_EMAIL env var
    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) {
      logger.error("[Jobs] ADMIN_EMAIL environment variable not set");
      sendError(res, "Server configuration error", 500);
      return;
    }

    const requestingUser = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { email: true },
    });

    if (!requestingUser || requestingUser.email !== adminEmail) {
      logger.warn(`[Jobs] Unauthorized status update attempt by user ${req.user!.userId}`);
      sendError(res, "Unauthorized", 403);
      return;
    }

    const existing = await prisma.job.findUnique({ where: { id } });
    if (!existing) {
      sendError(res, "Job not found", 404);
      return;
    }

    const updated = await prisma.job.update({
      where: { id },
      data: { status },
      select: { id: true, companyName: true, role: true, status: true },
    });

    logger.info(`[Jobs] Status updated: ${existing.companyName} — ${existing.role} → ${status}`);
    sendSuccess(res, { job: updated }, `Job status updated to ${status}`);
  } catch (err) {
    next(err);
  }
}
