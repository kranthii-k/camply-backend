"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProfile = getProfile;
exports.updateProfile = updateProfile;
exports.updateAvatar = updateAvatar;
exports.changePassword = changePassword;
exports.searchUsers = searchUsers;
exports.getUserPosts = getUserPosts;
exports.completeOnboarding = completeOnboarding;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = __importDefault(require("../config/prisma"));
const apiResponse_1 = require("../utils/apiResponse");
const cloudinary_1 = require("../config/cloudinary");
const logger_1 = __importDefault(require("../config/logger"));
const APPROVED_DOMAINS = [
    "Frontend",
    "Backend",
    "DevOps",
    "Full Stack",
    "Design",
    "Machine Learning",
    "Agentic AI",
    "Prompt Engineering",
    "AI Automation",
    "Operations",
    "DSA / Competitive Programming",
    "Database",
    "Authentication & Security",
];
const VALID_HACKATHON_COUNTS = ["1+", "5+", "10+"];
// GET /api/v1/users/:username
async function getProfile(req, res, next) {
    try {
        const { username } = req.params;
        const user = await prisma_1.default.user.findUnique({
            where: { username },
            select: {
                id: true,
                name: true,
                username: true,
                bio: true,
                avatar: true,
                college: true,
                skills: true,
                trustLevel: true,
                trustScore: true,
                createdAt: true,
                _count: { select: { posts: true, teamMembers: true } },
            },
        });
        if (!user) {
            (0, apiResponse_1.sendError)(res, "User not found", 404);
            return;
        }
        (0, apiResponse_1.sendSuccess)(res, { user });
    }
    catch (err) {
        next(err);
    }
}
// PATCH /api/v1/users/me
async function updateProfile(req, res, next) {
    try {
        const { name, bio, college, skills } = req.body;
        const updated = await prisma_1.default.user.update({
            where: { id: req.user.userId },
            data: { name, bio, college, skills },
            select: {
                id: true,
                name: true,
                username: true,
                bio: true,
                avatar: true,
                college: true,
                skills: true,
                trustLevel: true,
            },
        });
        (0, apiResponse_1.sendSuccess)(res, { user: updated }, "Profile updated");
    }
    catch (err) {
        next(err);
    }
}
// PATCH /api/v1/users/me/avatar
async function updateAvatar(req, res, next) {
    try {
        const file = req.file;
        if (!file?.buffer) {
            (0, apiResponse_1.sendError)(res, "No image uploaded", 400);
            return;
        }
        const url = await (0, cloudinary_1.uploadToCloudinary)(file.buffer, "camply/avatars");
        const user = await prisma_1.default.user.update({
            where: { id: req.user.userId },
            data: { avatar: url },
            select: { id: true, avatar: true },
        });
        (0, apiResponse_1.sendSuccess)(res, { avatar: user.avatar }, "Avatar updated");
    }
    catch (err) {
        next(err);
    }
}
// PATCH /api/v1/users/me/password
async function changePassword(req, res, next) {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await prisma_1.default.user.findUnique({
            where: { id: req.user.userId },
            select: { passwordHash: true },
        });
        if (!user || !user.passwordHash) {
            (0, apiResponse_1.sendError)(res, "User not found or logged in via OAuth", 404);
            return;
        }
        const valid = await bcryptjs_1.default.compare(currentPassword, user.passwordHash);
        if (!valid) {
            (0, apiResponse_1.sendError)(res, "Current password is incorrect", 401);
            return;
        }
        const newHash = await bcryptjs_1.default.hash(newPassword, 12);
        await prisma_1.default.user.update({
            where: { id: req.user.userId },
            data: { passwordHash: newHash },
        });
        // Revoke all refresh tokens (force re-login on other devices)
        await prisma_1.default.refreshToken.deleteMany({ where: { userId: req.user.userId } });
        (0, apiResponse_1.sendSuccess)(res, null, "Password changed successfully");
    }
    catch (err) {
        next(err);
    }
}
// GET /api/v1/users/search?q=
async function searchUsers(req, res, next) {
    try {
        const q = req.query.q?.trim();
        if (!q || q.length < 2) {
            (0, apiResponse_1.sendError)(res, "Query too short", 400);
            return;
        }
        const users = await prisma_1.default.user.findMany({
            where: {
                OR: [
                    { username: { contains: q, mode: "insensitive" } },
                    { name: { contains: q, mode: "insensitive" } },
                ],
            },
            select: {
                id: true,
                username: true,
                name: true,
                avatar: true,
                trustLevel: true,
                college: true,
                skills: true,
            },
            take: 20,
        });
        (0, apiResponse_1.sendSuccess)(res, { users });
    }
    catch (err) {
        next(err);
    }
}
// GET /api/v1/users/:username/posts?page=1&limit=10
async function getUserPosts(req, res, next) {
    try {
        const { username } = req.params;
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(50, parseInt(req.query.limit) || 10);
        const skip = (page - 1) * limit;
        const user = await prisma_1.default.user.findUnique({ where: { username }, select: { id: true } });
        if (!user) {
            (0, apiResponse_1.sendError)(res, "User not found", 404);
            return;
        }
        const [posts, total] = await Promise.all([
            prisma_1.default.post.findMany({
                where: { authorId: user.id },
                select: {
                    id: true,
                    content: true,
                    category: true,
                    createdAt: true,
                    _count: { select: { comments: true, votes: true } },
                },
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
            }),
            prisma_1.default.post.count({ where: { authorId: user.id } }),
        ]);
        (0, apiResponse_1.sendSuccess)(res, {
            posts,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit), hasMore: skip + limit < total },
        });
    }
    catch (err) {
        next(err);
    }
}
// PATCH /api/v1/users/me/onboarding
async function completeOnboarding(req, res, next) {
    try {
        const { skills, hackathonsCount, bio } = req.body;
        // Validate skills
        if (!Array.isArray(skills) || skills.length < 2 || skills.length > 3) {
            (0, apiResponse_1.sendError)(res, "skills must be an array of 2\u20133 items", 400);
            return;
        }
        const invalidSkill = skills.find((s) => !APPROVED_DOMAINS.includes(s));
        if (invalidSkill) {
            (0, apiResponse_1.sendError)(res, `"${invalidSkill}" is not an approved domain`, 400);
            return;
        }
        // Validate hackathonsCount
        if (!VALID_HACKATHON_COUNTS.includes(hackathonsCount)) {
            (0, apiResponse_1.sendError)(res, `hackathonsCount must be one of: "1+", "5+", "10+"`, 400);
            return;
        }
        // Validate bio
        if (typeof bio !== "string" || bio.trim().length < 10 || bio.trim().length > 300) {
            (0, apiResponse_1.sendError)(res, "bio must be between 10 and 300 characters", 400);
            return;
        }
        const updated = await prisma_1.default.user.update({
            where: { id: req.user.userId },
            data: {
                skills,
                hackathonsCount,
                bio: bio.trim(),
                onboardingComplete: true,
            },
            select: {
                id: true,
                name: true,
                username: true,
                email: true,
                bio: true,
                avatar: true,
                college: true,
                skills: true,
                onboardingComplete: true,
                hackathonsCount: true,
                trustLevel: true,
                trustScore: true,
                createdAt: true,
                _count: {
                    select: { posts: true, teamMembers: true },
                },
            },
        });
        logger_1.default.info(`Onboarding completed for user: ${req.user.username}`);
        (0, apiResponse_1.sendSuccess)(res, { user: updated }, "Onboarding complete");
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=user.controller.js.map