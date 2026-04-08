"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
exports.optionalAuth = optionalAuth;
const jwt_1 = require("../utils/jwt");
const apiResponse_1 = require("../utils/apiResponse");
function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
        (0, apiResponse_1.sendError)(res, "Access token required", 401);
        return;
    }
    const token = authHeader.split(" ")[1];
    try {
        const payload = (0, jwt_1.verifyAccessToken)(token);
        req.user = payload;
        next();
    }
    catch (err) {
        if (err.name === "TokenExpiredError") {
            (0, apiResponse_1.sendError)(res, "Access token expired", 401);
        }
        else {
            (0, apiResponse_1.sendError)(res, "Invalid access token", 401);
        }
    }
}
/** Middleware for routes that work both authed and unauthed */
function optionalAuth(req, _res, next) {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
        try {
            req.user = (0, jwt_1.verifyAccessToken)(authHeader.split(" ")[1]);
        }
        catch {
            // ignore – optional
        }
    }
    next();
}
//# sourceMappingURL=auth.middleware.js.map