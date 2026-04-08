"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginLimiter = void 0;
const express_rate_limit_1 = require("express-rate-limit");
const rate_limit_redis_1 = require("rate-limit-redis");
const redis_1 = require("../config/redis");
exports.loginLimiter = (0, express_rate_limit_1.rateLimit)({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { error: { message: "Too many auth attempts, try again later." } },
    store: new rate_limit_redis_1.RedisStore({
        sendCommand: (...args) => redis_1.redisClient.sendCommand(args),
    }),
});
//# sourceMappingURL=rateLimiters.js.map