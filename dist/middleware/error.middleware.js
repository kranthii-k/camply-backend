"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const logger_1 = __importDefault(require("../config/logger"));
function errorHandler(err, _req, res, _next) {
    logger_1.default.error(err.message, { stack: err.stack });
    // Prisma unique constraint
    if (err.code === "P2002") {
        const field = err.meta?.target?.[0] ?? "field";
        res.status(409).json({
            success: false,
            error: { message: `${field} already exists` },
        });
        return;
    }
    // Prisma not found
    if (err.code === "P2025") {
        res.status(404).json({
            success: false,
            error: { message: "Resource not found" },
        });
        return;
    }
    const statusCode = err.statusCode || err.status || 500;
    res.status(statusCode).json({
        success: false,
        error: {
            message: statusCode === 500 && process.env.NODE_ENV === "production"
                ? "Internal server error"
                : err.message || "Internal server error",
        },
    });
}
//# sourceMappingURL=error.middleware.js.map