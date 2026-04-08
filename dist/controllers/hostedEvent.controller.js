"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEvent = createEvent;
exports.getEvents = getEvents;
exports.approveEvent = approveEvent;
exports.getAdminEvents = getAdminEvents;
const prisma_1 = require("../config/prisma");
const apiResponse_1 = require("../utils/apiResponse");
const client_1 = require("@prisma/client");
/**
 * POST /api/v1/events
 * Creates a new hosted event.
 * Pro users only. Status defaults to PENDING.
 */
async function createEvent(req, res, next) {
    try {
        const { organisationName, eventName, description, startDate, endDate, venue, isOnline, teamSize, registrationAmount, posterUrl, websiteUrl, registrationUrl, socialHandles, coordinatorName, coordinatorContact, tags } = req.body;
        const userId = req.user.userId;
        const event = await prisma_1.prisma.hostedEvent.create({
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
                status: client_1.HostedEventStatus.PENDING,
            },
            include: {
                submittedBy: { select: { username: true, avatar: true } },
            },
        });
        (0, apiResponse_1.sendSuccess)(res, { event }, "Event submitted for approval", 201);
    }
    catch (err) {
        next(err);
    }
}
/**
 * GET /api/v1/events
 * Returns all APPROVED events for the public/pro feed.
 */
async function getEvents(req, res, next) {
    try {
        const events = await prisma_1.prisma.hostedEvent.findMany({
            where: { status: client_1.HostedEventStatus.APPROVED },
            include: {
                submittedBy: { select: { username: true, avatar: true } },
            },
            orderBy: { startDate: "asc" },
        });
        (0, apiResponse_1.sendSuccess)(res, { events });
    }
    catch (err) {
        next(err);
    }
}
/**
 * PATCH /api/v1/admin/events/:id/approve
 * Approves a hosted event. Admin only.
 */
async function approveEvent(req, res, next) {
    try {
        const id = req.params.id;
        const { status } = req.body;
        const event = await prisma_1.prisma.hostedEvent.update({
            where: { id },
            data: { status },
            include: { submittedBy: { select: { id: true, username: true } } },
        });
        // Potential notification to the host here
        (0, apiResponse_1.sendSuccess)(res, { event }, `Event ${status.toLowerCase()} successfully`);
    }
    catch (err) {
        next(err);
    }
}
/**
 * GET /api/v1/admin/events
 * Returns all events for admin review.
 */
async function getAdminEvents(req, res, next) {
    try {
        const events = await prisma_1.prisma.hostedEvent.findMany({
            include: {
                submittedBy: { select: { username: true, email: true } },
            },
            orderBy: { createdAt: "desc" },
        });
        (0, apiResponse_1.sendSuccess)(res, { events });
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=hostedEvent.controller.js.map