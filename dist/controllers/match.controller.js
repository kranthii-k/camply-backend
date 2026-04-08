"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProfiles = getProfiles;
exports.swipe = swipe;
exports.getMatches = getMatches;
exports.resetRejected = resetRejected;
exports.resetAll = resetAll;
exports.getInvitations = getInvitations;
const prisma_1 = __importDefault(require("../config/prisma"));
const apiResponse_1 = require("../utils/apiResponse");
const trust_service_1 = require("../services/trust.service");
const notification_service_1 = require("../services/notification.service");
// GET /api/v1/match/profiles?skills=React,Node
// Returns paginated list of users the current user has NOT yet swiped on
async function getProfiles(req, res, next) {
    try {
        const userId = req.user.userId;
        const limit = Math.min(20, parseInt(req.query.limit) || 10);
        const skillsFilter = req.query.skills
            ? req.query.skills.split(",").map((s) => s.trim())
            : undefined;
        // Get IDs already swiped
        const alreadySwiped = await prisma_1.default.matchLike.findMany({
            where: { fromUserId: userId },
            select: { toUserId: true },
        });
        const swipedIds = alreadySwiped.map((l) => l.toUserId);
        swipedIds.push(userId); // exclude self
        const profiles = await prisma_1.default.user.findMany({
            where: {
                id: { notIn: swipedIds },
                ...(skillsFilter
                    ? { skills: { hasSome: skillsFilter } }
                    : {}),
            },
            select: {
                id: true,
                username: true,
                name: true,
                avatar: true,
                bio: true,
                college: true,
                skills: true,
                trustLevel: true,
                trustScore: true,
            },
            take: limit,
            orderBy: { trustScore: "desc" },
        });
        // Check if total pool is exhausted even after resetting rejected
        // (i.e. if swipedIds includes everyone except self)
        const totalUserCount = await prisma_1.default.user.count({ where: { id: { not: userId } } });
        const swipedTotalCount = await prisma_1.default.matchLike.count({ where: { fromUserId: userId } });
        const isPoolEmpty = swipedTotalCount >= totalUserCount;
        (0, apiResponse_1.sendSuccess)(res, { profiles, isPoolEmpty });
    }
    catch (err) {
        next(err);
    }
}
// POST /api/v1/match/like
// body: { toUserId, action: "like" | "pass" }
async function swipe(req, res, next) {
    try {
        const { toUserId, action } = req.body;
        const fromUserId = req.user.userId;
        if (fromUserId === toUserId) {
            (0, apiResponse_1.sendError)(res, "Cannot swipe on yourself", 400);
            return;
        }
        const status = action === "like" ? "PENDING" : "REJECTED";
        // Duplicate guard: check if already pending or matched
        const existing = await prisma_1.default.matchLike.findUnique({
            where: { fromUserId_toUserId: { fromUserId, toUserId } }
        });
        if (existing && existing.status === "PENDING") {
            (0, apiResponse_1.sendError)(res, "Invitation already sent to this user", 409);
            return;
        }
        if (existing && existing.status === "MATCHED") {
            (0, apiResponse_1.sendError)(res, "You are already matched with this user", 409);
            return;
        }
        // Upsert (in case of double-tap)
        await prisma_1.default.matchLike.upsert({
            where: { fromUserId_toUserId: { fromUserId, toUserId } },
            create: { fromUserId, toUserId, status },
            update: { status },
        });
        if (action !== "like") {
            (0, apiResponse_1.sendSuccess)(res, { matched: false });
            return;
        }
        // Check for mutual like
        const mutual = await prisma_1.default.matchLike.findUnique({
            where: { fromUserId_toUserId: { fromUserId: toUserId, toUserId: fromUserId } },
        });
        if (mutual?.status === "PENDING") {
            // It's a match!
            await prisma_1.default.matchLike.updateMany({
                where: {
                    OR: [
                        { fromUserId, toUserId },
                        { fromUserId: toUserId, toUserId: fromUserId },
                    ],
                },
                data: { status: "MATCHED" },
            });
            // Trust score boost for both (non-fatal)
            await (0, trust_service_1.awardTrustToMany)([fromUserId, toUserId], "MATCH_MADE");
            // Push real-time notification to both users
            (0, notification_service_1.notifyMatch)(fromUserId, toUserId);
            (0, apiResponse_1.sendSuccess)(res, { matched: true, toUserId }, "It's a match! 🎉");
            return;
        }
        (0, apiResponse_1.sendSuccess)(res, { matched: false }, "Like recorded");
    }
    catch (err) {
        next(err);
    }
}
// GET /api/v1/match/matches
// Returns all mutual matches for the current user
async function getMatches(req, res, next) {
    try {
        const userId = req.user.userId;
        const matches = await prisma_1.default.matchLike.findMany({
            where: { fromUserId: userId, status: "MATCHED" },
            include: {
                toUser: {
                    select: {
                        id: true,
                        username: true,
                        name: true,
                        avatar: true,
                        bio: true,
                        skills: true,
                        trustLevel: true,
                    },
                },
            },
        });
        (0, apiResponse_1.sendSuccess)(res, { matches: matches.map((m) => m.toUser) });
    }
    catch (err) {
        next(err);
    }
}
// POST /api/v1/match/reset-rejected
// Deletes REJECTED swipes for the current user
async function resetRejected(req, res, next) {
    try {
        const userId = req.user.userId;
        await prisma_1.default.matchLike.deleteMany({
            where: {
                fromUserId: userId,
                status: "REJECTED",
            },
        });
        (0, apiResponse_1.sendSuccess)(res, { reset: true }, "Profiles refreshed");
    }
    catch (err) {
        next(err);
    }
}
// POST /api/v1/match/reset-all
// Deletes ALL MatchLike records for the current user
async function resetAll(req, res, next) {
    try {
        const userId = req.user.userId;
        await prisma_1.default.matchLike.deleteMany({
            where: {
                fromUserId: userId,
            },
        });
        (0, apiResponse_1.sendSuccess)(res, { reset: true }, "Starting fresh!");
    }
    catch (err) {
        next(err);
    }
}
// GET /api/v1/match/invitations
// Returns users who have liked the current user but were not liked back yet
async function getInvitations(req, res, next) {
    try {
        const userId = req.user.userId;
        // We want users who sent a LIKED (PENDING) to us
        // AND we haven't swiped on them at all yet
        const incomingLikes = await prisma_1.default.matchLike.findMany({
            where: {
                toUserId: userId,
                status: "PENDING"
            },
            include: {
                fromUser: {
                    select: {
                        id: true,
                        username: true,
                        name: true,
                        avatar: true,
                        bio: true,
                        skills: true,
                        trustLevel: true,
                    },
                },
            },
        });
        // Filtering out those the current user already swiped on
        // (though in theory they shouldn't be PENDING if swiped back, but defensive)
        const swiped = await prisma_1.default.matchLike.findMany({
            where: { fromUserId: userId },
            select: { toUserId: true }
        });
        const swipedIds = new Set(swiped.map(s => s.toUserId));
        const invitations = incomingLikes
            .filter(l => !swipedIds.has(l.fromUserId))
            .map(l => l.fromUser);
        (0, apiResponse_1.sendSuccess)(res, { invitations });
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=match.controller.js.map