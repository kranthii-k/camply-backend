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
exports.io = void 0;
exports.getIo = getIo;
exports.initSocket = initSocket;
const socket_io_1 = require("socket.io");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("./prisma"));
const logger_1 = __importDefault(require("./logger"));
const redis_adapter_1 = require("@socket.io/redis-adapter");
const redis_1 = require("redis");
const mentionService = __importStar(require("../services/mention.service"));
function getIo() {
    if (!exports.io)
        throw new Error("Socket.IO not initialised");
    return exports.io;
}
async function initSocket(httpServer) {
    exports.io = new socket_io_1.Server(httpServer, {
        cors: {
            origin: (process.env.ALLOWED_ORIGINS || "http://localhost:8080")
                .split(",")
                .map((o) => o.trim()),
            credentials: true,
        },
    });
    try {
        const isSecure = process.env.REDIS_URL?.startsWith("rediss://");
        const pubClient = (0, redis_1.createClient)({
            url: process.env.REDIS_URL || "redis://localhost:6379",
            socket: (isSecure ? {
                tls: true,
                rejectUnauthorized: false,
                family: 4
            } : {
                family: 4
            }) // Bypass strict TS checks for the family property
        });
        const subClient = pubClient.duplicate();
        pubClient.on("error", (err) => logger_1.default.error("Socket Redis pub error:", err));
        subClient.on("error", (err) => logger_1.default.error("Socket Redis sub error:", err));
        await Promise.all([pubClient.connect(), subClient.connect()]);
        exports.io.adapter((0, redis_adapter_1.createAdapter)(pubClient, subClient));
        logger_1.default.info("Socket.IO Redis adapter attached");
    }
    catch (err) {
        logger_1.default.warn("Socket.IO running without Redis adapter (scaling limited)", err);
    }
    // ── Auth middleware ────────────────────────────────────
    exports.io.use((socket, next) => {
        const token = socket.handshake.auth?.token;
        if (!token)
            return next(new Error("Authentication required"));
        try {
            const payload = jsonwebtoken_1.default.verify(token, process.env.JWT_ACCESS_SECRET);
            socket.user = payload;
            next();
        }
        catch {
            next(new Error("Invalid token"));
        }
    });
    exports.io.on("connection", (socket) => {
        const user = socket.user;
        logger_1.default.info(`Socket connected: ${user.username} (${socket.id})`);
        // Join personal room for targeted notifications
        socket.join(`user:${user.userId}`);
        // ── Join a chat room ─────────────────────────────────
        socket.on("join-chat", (chatId) => {
            socket.join(`chat:${chatId}`);
            logger_1.default.info(`${user.username} joined chat ${chatId}`);
        });
        socket.on("leave-chat", (chatId) => {
            socket.leave(`chat:${chatId}`);
        });
        // ── Send a message ───────────────────────────────────
        socket.on("send-message", async (data) => {
            const { chatId, content } = data;
            if (!content?.trim())
                return;
            try {
                const message = await prisma_1.default.message.create({
                    data: { content: content.trim(), chatId, senderId: user.userId },
                    include: { sender: { select: { id: true, username: true, avatar: true } } },
                });
                exports.io.to(`chat:${chatId}`).emit("new-message", message);
                // Process @mentions in chat messages
                await mentionService.processMentions(content, user.userId, `/?tab=community&chatId=${chatId}&messageId=${message.id}`, 'CHAT_MESSAGE');
            }
            catch (err) {
                logger_1.default.error("Socket send-message error", err);
                socket.emit("error", { message: "Failed to send message" });
            }
        });
        // ── Delete a message ─────────────────────────────────
        socket.on("delete-message", async (data) => {
            const { chatId, messageId } = data;
            try {
                const [message, chat] = await Promise.all([
                    prisma_1.default.message.findUnique({ where: { id: messageId } }),
                    prisma_1.default.chat.findUnique({ where: { id: chatId }, select: { createdById: true } })
                ]);
                if (!message)
                    return;
                // Verify user is sender or chat creator
                if (message.senderId !== user.userId && chat?.createdById !== user.userId) {
                    socket.emit("error", { message: "Unauthorized to delete this message" });
                    return;
                }
                await prisma_1.default.message.delete({ where: { id: messageId } });
                exports.io.to(`chat:${chatId}`).emit("message:deleted", { chatId, messageId });
            }
            catch (err) {
                logger_1.default.error("Socket delete-message error", err);
            }
        });
        // ── Typing indicator ─────────────────────────────────
        socket.on("typing", (chatId) => {
            socket.to(`chat:${chatId}`).emit("user-typing", {
                userId: user.userId,
                username: user.username,
            });
        });
        socket.on("disconnect", () => {
            logger_1.default.info(`Socket disconnected: ${user.username}`);
        });
    });
    return exports.io;
}
//# sourceMappingURL=socket.js.map