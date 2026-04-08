"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
exports.refresh = refresh;
exports.logout = logout;
exports.me = me;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = __importDefault(require("../config/prisma"));
const jwt_1 = require("../utils/jwt");
const apiResponse_1 = require("../utils/apiResponse");
const logger_1 = __importDefault(require("../config/logger"));
const socket_1 = require("../config/socket");
const SALT_ROUNDS = 12;
// ── Helper: set httpOnly refresh token cookie ──────────────
function setRefreshCookie(res, token) {
    res.cookie("refreshToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: (0, jwt_1.refreshTokenTtlMs)(),
        path: "/api/v1/auth",
    });
}
// ── Helper: build user response (no passwordHash) ─────────
function safeUser(user) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...rest } = user;
    return rest;
}
// ─────────────────────────────────────────────────────────
// POST /api/v1/auth/register
// ─────────────────────────────────────────────────────────
async function register(req, res, next) {
    try {
        const { name, username, email, password } = req.body;
        // Check duplicates
        const existing = await prisma_1.default.user.findFirst({
            where: { OR: [{ email }, { username }] },
            select: { email: true, username: true },
        });
        if (existing) {
            const field = existing.email === email ? "email" : "username";
            (0, apiResponse_1.sendError)(res, `${field} already in use`, 409);
            return;
        }
        const passwordHash = await bcryptjs_1.default.hash(password, SALT_ROUNDS);
        const user = await prisma_1.default.user.create({
            data: { name, username, email, passwordHash },
        });
        // Issue tokens
        const tokenPayload = { userId: user.id, username: user.username };
        const accessToken = (0, jwt_1.generateAccessToken)(tokenPayload);
        const refreshToken = (0, jwt_1.generateRefreshToken)(tokenPayload);
        await prisma_1.default.refreshToken.create({
            data: {
                token: refreshToken,
                userId: user.id,
                expiresAt: new Date(Date.now() + (0, jwt_1.refreshTokenTtlMs)()),
            },
        });
        setRefreshCookie(res, refreshToken);
        logger_1.default.info(`New user registered: ${username}`);
        // Real-time notification for hackathon match exhaustion state
        try {
            const io = (0, socket_1.getIo)();
            io.emit("new-user-joined", {
                userId: user.id,
                username: user.username,
            });
        }
        catch (socketError) {
            logger_1.default.warn(`[Auth] Socket.IO not initialised or emit failed — new-user-joined event skipped. Error: ${socketError.message}`);
        }
        (0, apiResponse_1.sendSuccess)(res, { user: safeUser(user), accessToken }, "Registration successful", 201);
    }
    catch (err) {
        next(err);
    }
}
// ─────────────────────────────────────────────────────────
// POST /api/v1/auth/login
// ─────────────────────────────────────────────────────────
async function login(req, res, next) {
    try {
        const { identifier, password } = req.body;
        // identifier = email OR username
        const user = await prisma_1.default.user.findFirst({
            where: {
                OR: [{ email: identifier }, { username: identifier }],
            },
        });
        if (!user || !user.passwordHash) {
            (0, apiResponse_1.sendError)(res, "Invalid credentials", 401);
            return;
        }
        const valid = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!valid) {
            (0, apiResponse_1.sendError)(res, "Invalid credentials", 401);
            return;
        }
        const tokenPayload = { userId: user.id, username: user.username };
        const accessToken = (0, jwt_1.generateAccessToken)(tokenPayload);
        const refreshToken = (0, jwt_1.generateRefreshToken)(tokenPayload);
        // Rotate: remove old tokens for this user (keep last 3 devices)
        const tokens = await prisma_1.default.refreshToken.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: "desc" },
            select: { id: true },
        });
        if (tokens.length >= 3) {
            const toDelete = tokens.slice(2).map((t) => t.id);
            await prisma_1.default.refreshToken.deleteMany({ where: { id: { in: toDelete } } });
        }
        await prisma_1.default.refreshToken.create({
            data: {
                token: refreshToken,
                userId: user.id,
                expiresAt: new Date(Date.now() + (0, jwt_1.refreshTokenTtlMs)()),
            },
        });
        setRefreshCookie(res, refreshToken);
        (0, apiResponse_1.sendSuccess)(res, { user: safeUser(user), accessToken }, "Login successful");
    }
    catch (err) {
        next(err);
    }
}
// ─────────────────────────────────────────────────────────
// POST /api/v1/auth/refresh
// ─────────────────────────────────────────────────────────
async function refresh(req, res, next) {
    try {
        const token = req.cookies?.refreshToken || req.body?.refreshToken;
        if (!token) {
            (0, apiResponse_1.sendError)(res, "Refresh token required", 401);
            return;
        }
        // Verify token signature first
        try {
            (0, jwt_1.verifyRefreshToken)(token);
        }
        catch {
            (0, apiResponse_1.sendError)(res, "Invalid or expired refresh token", 401);
            return;
        }
        // Check DB (rotation + revocation support)
        const stored = await prisma_1.default.refreshToken.findUnique({
            where: { token },
            include: { user: true },
        });
        if (!stored || stored.expiresAt < new Date()) {
            (0, apiResponse_1.sendError)(res, "Refresh token revoked or expired", 401);
            return;
        }
        // Rotate refresh token
        await prisma_1.default.refreshToken.delete({ where: { token } });
        const newRefreshToken = (0, jwt_1.generateRefreshToken)({
            userId: stored.user.id,
            username: stored.user.username,
        });
        const accessToken = (0, jwt_1.generateAccessToken)({
            userId: stored.user.id,
            username: stored.user.username,
        });
        await prisma_1.default.refreshToken.create({
            data: {
                token: newRefreshToken,
                userId: stored.userId,
                expiresAt: new Date(Date.now() + (0, jwt_1.refreshTokenTtlMs)()),
            },
        });
        setRefreshCookie(res, newRefreshToken);
        (0, apiResponse_1.sendSuccess)(res, { accessToken }, "Token refreshed");
    }
    catch (err) {
        next(err);
    }
}
// ─────────────────────────────────────────────────────────
// POST /api/v1/auth/logout
// ─────────────────────────────────────────────────────────
async function logout(req, res, next) {
    try {
        const token = req.cookies?.refreshToken || req.body?.refreshToken;
        if (token) {
            await prisma_1.default.refreshToken.deleteMany({ where: { token } }).catch(() => { });
        }
        res.clearCookie("refreshToken", { path: "/api/v1/auth" });
        (0, apiResponse_1.sendSuccess)(res, null, "Logged out successfully");
    }
    catch (err) {
        next(err);
    }
}
// ─────────────────────────────────────────────────────────
// GET /api/v1/auth/me
// ─────────────────────────────────────────────────────────
async function me(req, res, next) {
    try {
        const user = await prisma_1.default.user.findUnique({
            where: { id: req.user.userId },
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
        if (!user) {
            (0, apiResponse_1.sendError)(res, "User not found", 404);
            return;
        }
        // ─── Graceful Transition: Auto-complete onboarding if data already exists ───
        if (!user.onboardingComplete && user.bio && user.skills && user.skills.length > 0) {
            const updatedUser = await prisma_1.default.user.update({
                where: { id: req.user.userId },
                data: { onboardingComplete: true },
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
            (0, apiResponse_1.sendSuccess)(res, { user: updatedUser });
            return;
        }
        (0, apiResponse_1.sendSuccess)(res, { user });
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=auth.controller.js.map