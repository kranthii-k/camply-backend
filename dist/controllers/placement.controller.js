"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPlacements = getPlacements;
exports.createPlacement = createPlacement;
exports.toggleUpvote = toggleUpvote;
exports.addPlacementComment = addPlacementComment;
exports.deletePlacementComment = deletePlacementComment;
const prisma_1 = __importDefault(require("../config/prisma"));
const apiResponse_1 = require("../utils/apiResponse");
const logger_1 = __importDefault(require("../config/logger"));
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
};
// ─────────────────────────────────────────────────────────
// GET /api/v1/placements
// Public. Supports ?type=INTERVIEW|ONLINE_TEST|GROUP_DISCUSSION
// and cursor-based pagination via ?cursor=<createdAt ISO string>
// ─────────────────────────────────────────────────────────
async function getPlacements(req, res, next) {
    try {
        const PAGE_SIZE = 20;
        // Type filter — optional
        const typeParam = req.query.type;
        const validTypes = ["INTERVIEW", "ONLINE_TEST", "GROUP_DISCUSSION"];
        const typeFilter = typeParam && validTypes.includes(typeParam)
            ? typeParam
            : undefined;
        // Cursor pagination — optional
        const cursorParam = req.query.cursor;
        const cursorDate = cursorParam ? new Date(cursorParam) : undefined;
        const posts = await prisma_1.default.placementPost.findMany({
            where: {
                isActive: true,
                ...(typeFilter ? { type: typeFilter } : {}),
                ...(cursorDate ? { createdAt: { lt: cursorDate } } : {}),
            },
            orderBy: { createdAt: "desc" },
            take: PAGE_SIZE + 1, // Fetch one extra to determine if there's a next page
            select: PLACEMENT_POST_SELECT,
        });
        const hasNextPage = posts.length > PAGE_SIZE;
        const results = hasNextPage ? posts.slice(0, PAGE_SIZE) : posts;
        const nextCursor = hasNextPage
            ? results[results.length - 1].createdAt.toISOString()
            : null;
        logger_1.default.info(`[Placements] Fetched ${results.length} posts (type: ${typeFilter ?? "all"})`);
        (0, apiResponse_1.sendSuccess)(res, {
            posts: results,
            pagination: { hasNextPage, nextCursor },
        });
    }
    catch (err) {
        next(err);
    }
}
// ─────────────────────────────────────────────────────────
// POST /api/v1/placements
// Auth required. Create a new placement experience.
// ─────────────────────────────────────────────────────────
async function createPlacement(req, res, next) {
    try {
        const { company, companyLogo, role, package: pkg, location, difficulty, type, college, tags, preview, } = req.body;
        const post = await prisma_1.default.placementPost.create({
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
                authorId: req.user.userId,
                isActive: true,
            },
            select: PLACEMENT_POST_SELECT,
        });
        logger_1.default.info(`[Placements] New post created by ${req.user.userId}: ${company} — ${role}`);
        (0, apiResponse_1.sendSuccess)(res, { post }, "Placement experience submitted successfully.", 201);
    }
    catch (err) {
        next(err);
    }
}
// ─────────────────────────────────────────────────────────
// POST /api/v1/placements/:id/upvote
// Auth required. Toggle upvote on a placement post.
// ─────────────────────────────────────────────────────────
async function toggleUpvote(req, res, next) {
    try {
        const id = req.params.id;
        const userId = req.user.userId;
        const post = await prisma_1.default.placementPost.findUnique({
            where: { id, isActive: true },
            select: { id: true },
        });
        if (!post) {
            (0, apiResponse_1.sendError)(res, "Placement post not found", 404);
            return;
        }
        const existing = await prisma_1.default.placementUpvote.findUnique({
            where: { postId_userId: { postId: id, userId } },
        });
        if (existing) {
            // Already upvoted — remove it (toggle off)
            await prisma_1.default.placementUpvote.delete({
                where: { postId_userId: { postId: id, userId: userId } },
            });
            const upvoteCount = await prisma_1.default.placementUpvote.count({ where: { postId: id } });
            (0, apiResponse_1.sendSuccess)(res, { upvoted: false, upvotes: upvoteCount }, "Upvote removed");
        }
        else {
            // Not upvoted — add it (toggle on)
            await prisma_1.default.placementUpvote.create({ data: { postId: id, userId: userId } });
            const upvoteCount = await prisma_1.default.placementUpvote.count({ where: { postId: id } });
            (0, apiResponse_1.sendSuccess)(res, { upvoted: true, upvotes: upvoteCount }, "Upvoted");
        }
    }
    catch (err) {
        next(err);
    }
}
// ─────────────────────────────────────────────────────────
// POST /api/v1/placements/:id/comments
// Auth required. Add a comment to a placement post.
// ─────────────────────────────────────────────────────────
async function addPlacementComment(req, res, next) {
    try {
        const id = req.params.id;
        const { content } = req.body;
        const userId = req.user.userId;
        const post = await prisma_1.default.placementPost.findUnique({
            where: { id, isActive: true },
            select: { id: true },
        });
        if (!post) {
            (0, apiResponse_1.sendError)(res, "Placement post not found", 404);
            return;
        }
        const comment = await prisma_1.default.placementComment.create({
            data: { content, postId: id, authorId: userId },
            select: {
                id: true,
                content: true,
                createdAt: true,
                author: { select: { id: true, username: true, avatar: true } },
            },
        });
        (0, apiResponse_1.sendSuccess)(res, { comment }, "Comment added", 201);
    }
    catch (err) {
        next(err);
    }
}
// ─────────────────────────────────────────────────────────
// DELETE /api/v1/placements/:id/comments/:commentId
// Auth required. Only comment author can delete.
// ─────────────────────────────────────────────────────────
async function deletePlacementComment(req, res, next) {
    try {
        const commentId = req.params.commentId;
        const userId = req.user.userId;
        const comment = await prisma_1.default.placementComment.findUnique({
            where: { id: commentId },
            select: { authorId: true },
        });
        if (!comment) {
            (0, apiResponse_1.sendError)(res, "Comment not found", 404);
            return;
        }
        if (comment.authorId !== userId) {
            (0, apiResponse_1.sendError)(res, "You can only delete your own comments", 403);
            return;
        }
        await prisma_1.default.placementComment.delete({ where: { id: commentId } });
        (0, apiResponse_1.sendSuccess)(res, null, "Comment deleted");
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=placement.controller.js.map