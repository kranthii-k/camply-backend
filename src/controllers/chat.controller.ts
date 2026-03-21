import { Response, NextFunction } from "express";
import prisma from "../config/prisma";
import { sendSuccess, sendError } from "../utils/apiResponse";
import { AuthRequest } from "../middleware/auth.middleware";

// GET /api/v1/chats
export async function getChats(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const isPro = req.user?.userId ? await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { isPro: true }
    }).then(u => u?.isPro || false) : false;

    const chats = await prisma.chat.findMany({
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

    sendSuccess(res, { chats });
  } catch (err) {
    next(err);
  }
}

// POST /api/v1/chats/:id/join
export async function joinChat(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const chatId = req.params.id as string;
    const userId = req.user!.userId;

    const chat = await prisma.chat.findUnique({ where: { id: chatId } });
    if (!chat) {
      sendError(res, "Chat not found", 404);
      return;
    }

    await prisma.chatMember.upsert({
      where: { chatId_userId: { chatId, userId } },
      create: { chatId, userId },
      update: {},
    });

    sendSuccess(res, { chatId }, "Joined chat");
  } catch (err) {
    next(err);
  }
}

// GET /api/v1/chats/:id/messages?cursor=<messageId>
export async function getMessages(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const chatId = req.params.id as string;
    const cursor = req.query.cursor as string | undefined;
    const limit = Math.min(50, parseInt(req.query.limit as string) || 30);

    const messages = await prisma.message.findMany({
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

    sendSuccess(res, {
      messages: messages.reverse(),
      nextCursor: messages.length === limit ? messages[0]?.id : null,
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/v1/chats
export async function createChat(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { name, topic } = req.body;
    const userId = req.user!.userId;

    // Pro check
    const user = await prisma.user.findUnique({
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

    const chat = await prisma.chat.create({
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

    sendSuccess(res, { chat }, "Community created", 201);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/v1/chats/:chatId/messages/:messageId
export async function deleteMessage(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const chatId = req.params.chatId as string;
    const messageId = req.params.messageId as string;
    const userId = req.user!.userId;

    const [message, chat] = await Promise.all([
      prisma.message.findUnique({ where: { id: messageId } }),
      prisma.chat.findUnique({ where: { id: chatId }, select: { createdById: true } })
    ]);

    if (!message) {
      sendError(res, "Message not found", 404);
      return;
    }

    // Check: user is sender OR chat creator
    const isSender = message.senderId === userId;
    const isCreator = chat?.createdById === userId;

    if (!isSender && !isCreator) {
      sendError(res, "Forbidden: Only sender or moderator can delete messages", 403);
      return;
    }

    await prisma.message.delete({ where: { id: messageId } });

    sendSuccess(res, null, "Message deleted");
  } catch (err) {
    next(err);
  }
}

// DELETE /api/v1/chats/:id/members/me  (leave chat)
export async function leaveChat(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const chatId = req.params.id as string;
    const userId = req.user!.userId;

    const membership = await prisma.chatMember.findUnique({
      where: { chatId_userId: { chatId, userId } },
    });
    if (!membership) {
      sendError(res, "You are not a member of this chat", 404);
      return;
    }

    await prisma.chatMember.delete({ where: { chatId_userId: { chatId, userId } } });
    sendSuccess(res, null, "Left chat successfully");
  } catch (err) {
    next(err);
  }
}
