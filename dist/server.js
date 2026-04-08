"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const http_1 = __importDefault(require("http"));
const socket_1 = require("./config/socket");
const redis_1 = require("./config/redis");
const logger_1 = __importDefault(require("./config/logger"));
const PORT = process.env.PORT || 5000;
async function bootstrap() {
    // Connect Redis (non-fatal – app still works without it)
    try {
        await (0, redis_1.connectRedis)();
    }
    catch (err) {
        logger_1.default.warn("Redis unavailable – running without cache", err);
    }
    // Import app AFTER Redis is connected so rate-limit-redis can load its script
    const { default: app } = await Promise.resolve().then(() => __importStar(require("./app")));
    const httpServer = http_1.default.createServer(app);
    await (0, socket_1.initSocket)(httpServer);
    httpServer.listen(PORT, () => {
        logger_1.default.info(`🚀 Camply API running on port ${PORT} [${process.env.NODE_ENV}]`);
    });
}
bootstrap().catch((err) => {
    logger_1.default.error("Fatal startup error", err);
    process.exit(1);
});
//# sourceMappingURL=server.js.map