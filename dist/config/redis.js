"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisClient = void 0;
exports.connectRedis = connectRedis;
exports.getCached = getCached;
exports.setCache = setCache;
exports.invalidateCache = invalidateCache;
const redis_1 = require("redis");
const logger_1 = __importDefault(require("./logger"));
const isSecure = process.env.REDIS_URL?.startsWith("rediss://");
exports.redisClient = (0, redis_1.createClient)({
    url: process.env.REDIS_URL || "redis://localhost:6379",
    socket: (isSecure ? {
        tls: true,
        rejectUnauthorized: false,
        family: 4
    } : {
        family: 4
    }) // Bypass strict TS checks for the family property
});
exports.redisClient.on("error", (err) => logger_1.default.error("Redis error", err));
exports.redisClient.on("connect", () => logger_1.default.info("Redis connected"));
async function connectRedis() {
    try {
        await exports.redisClient.connect();
    }
    catch (err) {
        logger_1.default.warn("Redis connection failed – functionality will be limited", err);
    }
}
/**
 * Cache helper – returns null if Redis is unavailable.
 */
async function getCached(key) {
    try {
        const data = await exports.redisClient.get(key);
        return data ? JSON.parse(data) : null;
    }
    catch {
        return null;
    }
}
async function setCache(key, value, ttlSeconds = 300) {
    try {
        await exports.redisClient.set(key, JSON.stringify(value), { EX: ttlSeconds });
    }
    catch {
        // Silently fail – cache is best-effort
    }
}
async function invalidateCache(pattern) {
    try {
        if (pattern.includes('*')) {
            const keys = [];
            for await (const key of exports.redisClient.scanIterator({
                MATCH: pattern,
                COUNT: 200
            })) {
                keys.push(key);
            }
            if (keys.length > 0) {
                await exports.redisClient.del(keys);
            }
        }
        else {
            await exports.redisClient.del(pattern);
        }
    }
    catch {
        // no-op
    }
}
//# sourceMappingURL=redis.js.map