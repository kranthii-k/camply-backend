"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllTeams = getAllTeams;
exports.getTeam = getTeam;
exports.getMyTeams = getMyTeams;
exports.createTeam = createTeam;
exports.inviteMember = inviteMember;
exports.deleteTeam = deleteTeam;
exports.leaveTeam = leaveTeam;
exports.updateTeam = updateTeam;
const prisma_1 = __importDefault(require("../config/prisma"));
const apiResponse_1 = require("../utils/apiResponse");
const notification_service_1 = require("../services/notification.service");
const TEAM_SELECT = {
    id: true,
    name: true,
    description: true,
    hackathon: true,
    roles: true,
    createdAt: true,
    members: {
        include: {
            user: {
                select: { id: true, username: true, name: true, avatar: true, trustLevel: true },
            },
        },
    },
};
// GET /api/v1/teams?q=&hackathon=&page=1&limit=10
async function getAllTeams(req, res, next) {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(50, parseInt(req.query.limit) || 10);
        const skip = (page - 1) * limit;
        const q = req.query.q?.trim();
        const hackathon = req.query.hackathon?.trim();
        const where = {};
        if (q) {
            where.OR = [
                { name: { contains: q, mode: "insensitive" } },
                { description: { contains: q, mode: "insensitive" } },
            ];
        }
        if (hackathon) {
            where.hackathon = { contains: hackathon, mode: "insensitive" };
        }
        const [teams, total] = await Promise.all([
            prisma_1.default.team.findMany({ where, select: TEAM_SELECT, orderBy: { createdAt: "desc" }, skip, take: limit }),
            prisma_1.default.team.count({ where }),
        ]);
        (0, apiResponse_1.sendSuccess)(res, {
            teams,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit), hasMore: skip + limit < total },
        });
    }
    catch (err) {
        next(err);
    }
}
// GET /api/v1/teams/:id
async function getTeam(req, res, next) {
    try {
        const teamId = req.params.id;
        const team = await prisma_1.default.team.findUnique({ where: { id: teamId }, select: TEAM_SELECT });
        if (!team) {
            (0, apiResponse_1.sendError)(res, "Team not found", 404);
            return;
        }
        (0, apiResponse_1.sendSuccess)(res, { team });
    }
    catch (err) {
        next(err);
    }
}
// GET /api/v1/teams/mine
async function getMyTeams(req, res, next) {
    try {
        const teams = await prisma_1.default.team.findMany({
            where: { members: { some: { userId: req.user.userId } } },
            select: TEAM_SELECT,
        });
        (0, apiResponse_1.sendSuccess)(res, { teams });
    }
    catch (err) {
        next(err);
    }
}
// POST /api/v1/teams
async function createTeam(req, res, next) {
    try {
        const { name, description, hackathon, roles } = req.body;
        const team = await prisma_1.default.team.create({
            data: {
                name,
                description,
                hackathon,
                roles: roles || [],
                members: {
                    create: { userId: req.user.userId, role: "OWNER" },
                },
            },
            select: TEAM_SELECT,
        });
        (0, apiResponse_1.sendSuccess)(res, { team }, "Team created", 201);
    }
    catch (err) {
        next(err);
    }
}
// POST /api/v1/teams/:id/invite
async function inviteMember(req, res, next) {
    try {
        const { username } = req.body;
        const teamId = req.params.id;
        // Verify requester is owner
        const membership = await prisma_1.default.teamMember.findFirst({
            where: { teamId, userId: req.user.userId, role: "OWNER" },
        });
        if (!membership) {
            (0, apiResponse_1.sendError)(res, "Only team owner can invite", 403);
            return;
        }
        const invitee = await prisma_1.default.user.findUnique({
            where: { username },
            select: { id: true },
        });
        if (!invitee) {
            (0, apiResponse_1.sendError)(res, "User not found", 404);
            return;
        }
        const existing = await prisma_1.default.teamMember.findUnique({
            where: { teamId_userId: { teamId, userId: invitee.id } },
        });
        if (existing) {
            (0, apiResponse_1.sendError)(res, "User already in team", 409);
            return;
        }
        await prisma_1.default.teamMember.create({
            data: { teamId, userId: invitee.id, role: "MEMBER" },
        });
        const team = await prisma_1.default.team.findUnique({ where: { id: teamId }, select: TEAM_SELECT });
        // Notify the new member in real-time
        if (team)
            (0, notification_service_1.notifyTeamInvite)(invitee.id, teamId, team.name);
        (0, apiResponse_1.sendSuccess)(res, { team }, "Member added");
    }
    catch (err) {
        next(err);
    }
}
// DELETE /api/v1/teams/:id
async function deleteTeam(req, res, next) {
    try {
        const teamId = req.params.id;
        const membership = await prisma_1.default.teamMember.findFirst({
            where: { teamId, userId: req.user.userId, role: "OWNER" },
        });
        if (!membership) {
            (0, apiResponse_1.sendError)(res, "Only team owner can delete", 403);
            return;
        }
        await prisma_1.default.team.delete({ where: { id: teamId } });
        (0, apiResponse_1.sendSuccess)(res, null, "Team deleted");
    }
    catch (err) {
        next(err);
    }
}
// DELETE /api/v1/teams/:id/members/me
async function leaveTeam(req, res, next) {
    try {
        const teamId = req.params.id;
        const userId = req.user.userId;
        const membership = await prisma_1.default.teamMember.findUnique({
            where: { teamId_userId: { teamId, userId } },
        });
        if (!membership) {
            (0, apiResponse_1.sendError)(res, "You are not a member of this team", 404);
            return;
        }
        if (membership.role === "OWNER") {
            const memberCount = await prisma_1.default.teamMember.count({ where: { teamId } });
            if (memberCount > 1) {
                (0, apiResponse_1.sendError)(res, "Transfer ownership before leaving", 400);
                return;
            }
            // Last member and owner – delete the team
            await prisma_1.default.team.delete({ where: { id: teamId } });
            (0, apiResponse_1.sendSuccess)(res, null, "Team deleted (you were the last member)");
            return;
        }
        await prisma_1.default.teamMember.delete({ where: { teamId_userId: { teamId, userId } } });
        (0, apiResponse_1.sendSuccess)(res, null, "Left team successfully");
    }
    catch (err) {
        next(err);
    }
}
// PATCH /api/v1/teams/:id
async function updateTeam(req, res, next) {
    try {
        const teamId = req.params.id;
        const { name, description, hackathon, roles } = req.body;
        const membership = await prisma_1.default.teamMember.findFirst({
            where: { teamId, userId: req.user.userId, role: "OWNER" },
        });
        if (!membership) {
            (0, apiResponse_1.sendError)(res, "Only team owner can update", 403);
            return;
        }
        const team = await prisma_1.default.team.update({
            where: { id: teamId },
            data: { name, description, hackathon, roles },
            select: TEAM_SELECT,
        });
        (0, apiResponse_1.sendSuccess)(res, { team }, "Team updated");
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=team.controller.js.map