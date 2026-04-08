"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChats = getChats;
exports.joinChat = joinChat;
exports.getMessages = getMessages;
exports.createChat = createChat;
exports.deleteMessage = deleteMessage;
exports.leaveChat = leaveChat;
const prisma_1 = __importDefault(require("../config/prisma"));
const apiResponse_1 = require("../utils/apiResponse");
// GET /api/v1/chats
async function getChats(req, res, next) {
    try {
        const isPro = req.user?.userId ? await prisma_1.default.user.findUnique({
            where: { id: req.user.userId },
            select: { isPro: true }
        }).then(u => u?.isPro || false) : false;
        const chats = await prisma_1.default.chat.findMany({
            where: isPro ? {} : { isDefault: true },
            select: {
                id: true,
                name: true,
                topic: true,
                isDefault: true,
                isProOnly: true,
                createdById: true,
                _count: { select: { members: true, messages: true } },
                messages: {
                    orderBy: { createdAt: "desc" },
                    take: 1,
                    select: { content: true, createdAt: true, sender: { select: { username: true } } },
                },
            },
            orderBy: { createdAt: "desc" },
        });
        (0, apiResponse_1.sendSuccess)(res, { chats });
    }
    catch (err) {
        next(err);
    }
}
// POST /api/v1/chats/:id/join
async function joinChat(req, res, next) {
    try {
        const chatId = req.params.id;
        const userId = req.user.userId;
        const chat = await prisma_1.default.chat.findUnique({ where: { id: chatId } });
        if (!chat) {
            (0, apiResponse_1.sendError)(res, "Chat not found", 404);
            return;
        }
        await prisma_1.default.chatMember.upsert({
            where: { chatId_userId: { chatId, userId } },
            create: { chatId, userId },
            update: {},
        });
        (0, apiResponse_1.sendSuccess)(res, { chatId }, "Joined chat");
    }
    catch (err) {
        next(err);
    }
}
// GET /api/v1/chats/:id/messages?cursor=<messageId>
async function getMessages(req, res, next) {
    try {
        const chatId = req.params.id;
        const cursor = req.query.cursor;
        const limit = Math.min(50, parseInt(req.query.limit) || 30);
        const messages = await prisma_1.default.message.findMany({
            where: { chatId },
            select: {
                id: true,
                content: true,
                createdAt: true,
                sender: { select: { id: true, username: true, avatar: true } },
            },
            orderBy: { createdAt: "desc" },
            take: limit,
            ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
        });
        (0, apiResponse_1.sendSuccess)(res, {
            messages: messages.reverse(),
            nextCursor: messages.length === limit ? messages[0]?.id : null,
        });
    }
    catch (err) {
        next(err);
    }
}
// POST /api/v1/chats
async function createChat(req, res, next) {
    try {
        const { name, topic } = req.body;
        const userId = req.user.userId;
        // Pro check
        const user = await prisma_1.default.user.findUnique({
            where: { id: userId },
            select: { isPro: true }
        });
        if (!user?.isPro) {
            res.status(403).json({
                success: false,
                error: { message: "Pro subscription required to create communities", code: "PRO_REQUIRED" }
            });
            return;
        }
        const chat = await prisma_1.default.chat.create({
            data: {
                name,
                topic,
                createdById: userId,
                members: { create: { userId } },
            },
            select: {
                id: true,
                name: true,
                topic: true,
                createdAt: true,
                _count: { select: { members: true } },
            },
        });
        (0, apiResponse_1.sendSuccess)(res, { chat }, "Community created", 201);
    }
    catch (err) {
        next(err);
    }
}
// DELETE /api/v1/chats/:chatId/messages/:messageId
async function deleteMessage(req, res, next) {
    try {
        const chatId = req.params.chatId;
        const messageId = req.params.messageId;
        const userId = req.user.userId;
        const [message, chat] = await Promise.all([
            prisma_1.default.message.findUnique({ where: { id: messageId } }),
            prisma_1.default.chat.findUnique({ where: { id: chatId }, select: { createdById: true } })
        ]);
        if (!message) {
            (0, apiResponse_1.sendError)(res, "Message not found", 404);
            return;
        }
        // Check: user is sender OR chat creator
        const isSender = message.senderId === userId;
        const isCreator = chat?.createdById === userId;
        if (!isSender && !isCreator) {
            (0, apiResponse_1.sendError)(res, "Forbidden: Only sender or moderator can delete messages", 403);
            return;
        }
        await prisma_1.default.message.delete({ where: { id: messageId } });
        (0, apiResponse_1.sendSuccess)(res, null, "Message deleted");
    }
    catch (err) {
        next(err);
    }
}
// DELETE /api/v1/chats/:id/members/me  (leave chat)
async function leaveChat(req, res, next) {
    try {
        const chatId = req.params.id;
        const userId = req.user.userId;
        const membership = await prisma_1.default.chatMember.findUnique({
            where: { chatId_userId: { chatId, userId } },
        });
        if (!membership) {
            (0, apiResponse_1.sendError)(res, "You are not a member of this chat", 404);
            return;
        }
        await prisma_1.default.chatMember.delete({ where: { chatId_userId: { chatId, userId } } });
        (0, apiResponse_1.sendSuccess)(res, null, "Left chat successfully");
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=chat.controller.js.map