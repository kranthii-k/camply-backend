"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFound = notFound;
function notFound(req, res) {
    res.status(404).json({
        success: false,
        error: { message: `Route ${req.method} ${req.originalUrl} not found` },
    });
}
//# sourceMappingURL=notFound.middleware.js.map