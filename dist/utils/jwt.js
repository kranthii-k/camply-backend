"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAccessToken = generateAccessToken;
exports.generateRefreshToken = generateRefreshToken;
exports.verifyAccessToken = verifyAccessToken;
exports.verifyRefreshToken = verifyRefreshToken;
exports.refreshTokenTtlMs = refreshTokenTtlMs;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function generateAccessToken(payload) {
    return jsonwebtoken_1.default.sign(payload, process.env.JWT_ACCESS_SECRET, {
        expiresIn: (process.env.JWT_ACCESS_EXPIRES_IN || "15m"),
    });
}
function generateRefreshToken(payload) {
    return jsonwebtoken_1.default.sign(payload, process.env.JWT_REFRESH_SECRET, {
        expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || "7d"),
    });
}
function verifyAccessToken(token) {
    return jsonwebtoken_1.default.verify(token, process.env.JWT_ACCESS_SECRET);
}
function verifyRefreshToken(token) {
    return jsonwebtoken_1.default.verify(token, process.env.JWT_REFRESH_SECRET);
}
/** Expiry in ms — used to set cookie maxAge */
function refreshTokenTtlMs() {
    const raw = process.env.JWT_REFRESH_EXPIRES_IN || "7d";
    const unit = raw.slice(-1);
    const amount = parseInt(raw.slice(0, -1), 10);
    const multipliers = {
        s: 1000,
        m: 60_000,
        h: 3_600_000,
        d: 86_400_000,
    };
    return amount * (multipliers[unit] || 86_400_000);
}
//# sourceMappingURL=jwt.js.map