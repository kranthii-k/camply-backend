"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleCallback = googleCallback;
const jwt_1 = require("../utils/jwt");
const prisma_1 = __importDefault(require("../config/prisma"));
const apiResponse_1 = require("../utils/apiResponse");
// Helper from auth.controller.ts
function setRefreshCookie(res, token) {
    res.cookie("refreshToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: (0, jwt_1.refreshTokenTtlMs)(),
        path: "/api/v1/auth",
    });
}
async function googleCallback(req, res, next) {
    try {
        const user = req.user;
        if (!user) {
            (0, apiResponse_1.sendError)(res, "Google authentication failed", 401);
            return;
        }
        const tokenPayload = { userId: user.id, username: user.username };
        const accessToken = (0, jwt_1.generateAccessToken)(tokenPayload);
        const refreshToken = (0, jwt_1.generateRefreshToken)(tokenPayload);
        // Rotate refresh tokens
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
        const redirectUrl = process.env.FRONTEND_URL || "http://localhost:5173";
        res.redirect(`${redirectUrl}/auth/callback?token=${accessToken}`);
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=google.auth.controller.js.map