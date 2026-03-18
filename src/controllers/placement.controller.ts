/**
 * placement.controller.ts
 *
 * Handles all CRUD for community placement experience posts.
 *
 * Endpoints:
 *   GET    /api/v1/placements          — list all (with type filter)
 *   POST   /api/v1/placements          — create new (auth required)
 *   POST   /api/v1/placements/:id/upvote   — toggle upvote (auth)
 *   POST   /api/v1/placements/:id/comments — add comment (auth)
 *   DELETE /api/v1/placements/:id/comments/:commentId — delete comment (auth)
 *
 * Upvote behavior: toggling — if user has upvoted, calling again removes it.
 * This mirrors the existing Vote model behavior for posts.
 *
 * Pagination: cursor-based using createdAt for scalability.
 * Default page size: 20.
 */

import { Request, Response, NextFunction } from "express";
import prisma from "../config/prisma";
import { sendSuccess, sendError } from "../utils/apiResponse";
import { AuthRequest } from "../middleware/auth.middleware";
import logger from "../config/logger";

const PLACEMENT_POST_SELECT = {
  id: true,
  company: true,
  companyLogo: true,
  role: true,
  package: true,
  location: true,
  difficulty: true,
  type: true,
  college: true,
  tags: true,
  preview: true,
  createdAt: true,
  author: {
    select: {
      id: true,
      username: true,
      avatar: true,
      college: true,
    },
  },
  _count: {
    select: {
      upvotes: true,
      comments: true,
    },
  },
} as const;

// ─────────────────────────────────────────────────────────
// GET /api/v1/placements
// Public. Supports ?type=INTERVIEW|ONLINE_TEST|GROUP_DISCUSSION
// and cursor-based pagination via ?cursor=<createdAt ISO string>
// ─────────────────────────────────────────────────────────
export async function getPlacements(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const PAGE_SIZE = 20;

    // Type filter — optional
    const typeParam = req.query.type as string | undefined;
    const validTypes = ["INTERVIEW", "ONLINE_TEST", "GROUP_DISCUSSION"] as const;
    type PlacementTypeEnum = typeof validTypes[number];

    const typeFilter: PlacementTypeEnum | undefined =
      typeParam && validTypes.includes(typeParam as PlacementTypeEnum)
        ? (typeParam as PlacementTypeEnum)
        : undefined;

    // Cursor pagination — optional
    const cursorParam = req.query.cursor as string | undefined;
    const cursorDate = cursorParam ? new Date(cursorParam) : undefined;

    const posts = await prisma.placementPost.findMany({
      where: {
        isActive: true,
        ...(typeFilter ? { type: typeFilter } : {}),
        ...(cursorDate ? { createdAt: { lt: cursorDate } } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: PAGE_SIZE + 1,   // Fetch one extra to determine if there's a next page
      select: PLACEMENT_POST_SELECT,
    });

    const hasNextPage = posts.length > PAGE_SIZE;
    const results = hasNextPage ? posts.slice(0, PAGE_SIZE) : posts;
    const nextCursor = hasNextPage
      ? results[results.length - 1].createdAt.toISOString()
      : null;

    logger.info(`[Placements] Fetched ${results.length} posts (type: ${typeFilter ?? "all"})`);
    sendSuccess(res, {
      posts: results,
      pagination: { hasNextPage, nextCursor },
    });
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────
// POST /api/v1/placements
// Auth required. Create a new placement experience.
// ─────────────────────────────────────────────────────────
export async function createPlacement(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const {
      company, companyLogo, role, package: pkg,
      location, difficulty, type, college, tags, preview,
    } = req.body;

    const post = await prisma.placementPost.create({
      data: {
        company,
        companyLogo: companyLogo ?? null,
        role,
        package: pkg,
        location,
        difficulty,
        type,
        college,
        tags,
        preview,
        authorId: req.user!.userId,
        isActive: true,
      },
      select: PLACEMENT_POST_SELECT,
    });

    logger.info(`[Placements] New post created by ${req.user!.userId}: ${company} — ${role}`);
    sendSuccess(res, { post }, "Placement experience submitted successfully.", 201);
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────
// POST /api/v1/placements/:id/upvote
// Auth required. Toggle upvote on a placement post.
// ─────────────────────────────────────────────────────────
export async function toggleUpvote(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = req.params.id as string;
    const userId = req.user!.userId as string;

    const post = await prisma.placementPost.findUnique({
      where: { id, isActive: true },
      select: { id: true },
    });
    if (!post) {
      sendError(res, "Placement post not found", 404);
      return;
    }

    const existing = await prisma.placementUpvote.findUnique({
      where: { postId_userId: { postId: id, userId } },
    });

    if (existing) {
      // Already upvoted — remove it (toggle off)
      await prisma.placementUpvote.delete({
        where: { postId_userId: { postId: id, userId: userId } },
      });
      const upvoteCount = await prisma.placementUpvote.count({ where: { postId: id } });
      sendSuccess(res, { upvoted: false, upvotes: upvoteCount }, "Upvote removed");
    } else {
      // Not upvoted — add it (toggle on)
      await prisma.placementUpvote.create({ data: { postId: id, userId: userId } });
      const upvoteCount = await prisma.placementUpvote.count({ where: { postId: id } });
      sendSuccess(res, { upvoted: true, upvotes: upvoteCount }, "Upvoted");
    }
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────
// POST /api/v1/placements/:id/comments
// Auth required. Add a comment to a placement post.
// ─────────────────────────────────────────────────────────
export async function addPlacementComment(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = req.params.id as string;
    const { content } = req.body;
    const userId = req.user!.userId as string;

    const post = await prisma.placementPost.findUnique({
      where: { id, isActive: true },
      select: { id: true },
    });
    if (!post) {
      sendError(res, "Placement post not found", 404);
      return;
    }

    const comment = await prisma.placementComment.create({
      data: { content, postId: id, authorId: userId },
      select: {
        id: true,
        content: true,
        createdAt: true,
        author: { select: { id: true, username: true, avatar: true } },
      },
    });

    sendSuccess(res, { comment }, "Comment added", 201);
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────
// DELETE /api/v1/placements/:id/comments/:commentId
// Auth required. Only comment author can delete.
// ─────────────────────────────────────────────────────────
export async function deletePlacementComment(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const commentId = req.params.commentId as string;
    const userId = req.user!.userId as string;

    const comment = await prisma.placementComment.findUnique({
      where: { id: commentId },
      select: { authorId: true },
    });

    if (!comment) {
      sendError(res, "Comment not found", 404);
      return;
    }

    if (comment.authorId !== userId) {
      sendError(res, "You can only delete your own comments", 403);
      return;
    }

    await prisma.placementComment.delete({ where: { id: commentId } });
    sendSuccess(res, null, "Comment deleted");
  } catch (err) {
    next(err);
  }
}
