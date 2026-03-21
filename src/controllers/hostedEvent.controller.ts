import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { prisma } from "../config/prisma";
import { sendSuccess, sendError } from "../utils/apiResponse";
import { HostedEventStatus } from "@prisma/client";

/**
 * POST /api/v1/events
 * Creates a new hosted event.
 * Pro users only. Status defaults to PENDING.
 */
export async function createEvent(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { 
      organisationName, 
      eventName, 
      description, 
      startDate, 
      endDate, 
      venue, 
      isOnline, 
      teamSize, 
      registrationAmount, 
      posterUrl, 
      websiteUrl, 
      registrationUrl, 
      socialHandles, 
      coordinatorName, 
      coordinatorContact, 
      tags 
    } = req.body;
    const userId = req.user!.userId;

    const event = await prisma.hostedEvent.create({
      data: {
        organisationName,
        eventName,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        venue,
        isOnline: !!isOnline,
        teamSize,
        registrationAmount: parseInt(registrationAmount) || 0,
        posterUrl,
        websiteUrl,
        registrationUrl,
        socialHandles,
        coordinatorName,
        coordinatorContact,
        tags: tags || [],
        submittedById: userId,
        status: HostedEventStatus.PENDING,
      },
      include: {
        submittedBy: { select: { username: true, avatar: true } },
      },
    });

    sendSuccess(res, { event }, "Event submitted for approval", 201);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/events
 * Returns all APPROVED events for the public/pro feed.
 */
export async function getEvents(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const events = await prisma.hostedEvent.findMany({
      where: { status: HostedEventStatus.APPROVED },
      include: {
        submittedBy: { select: { username: true, avatar: true } },
      },
      orderBy: { startDate: "asc" },
    });

    sendSuccess(res, { events });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/v1/admin/events/:id/approve
 * Approves a hosted event. Admin only. 
 */
export async function approveEvent(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = req.params.id as string;
    const { status } = req.body;

    const event = await prisma.hostedEvent.update({
      where: { id },
      data: { status },
      include: { submittedBy: { select: { id: true, username: true } } },
    });

    // Potential notification to the host here
    
    sendSuccess(res, { event }, `Event ${status.toLowerCase()} successfully`);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/admin/events
 * Returns all events for admin review.
 */
export async function getAdminEvents(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const events = await prisma.hostedEvent.findMany({
      include: {
        submittedBy: { select: { username: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    sendSuccess(res, { events });
  } catch (err) {
    next(err);
  }
}
