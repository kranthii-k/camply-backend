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
exports.getFeed = getFeed;
exports.createPost = createPost;
exports.getPost = getPost;
exports.deletePost = deletePost;
exports.votePost = votePost;
exports.addComment = addComment;
exports.updatePost = updatePost;
exports.deleteComment = deleteComment;
const prisma_1 = __importDefault(require("../config/prisma"));
const apiResponse_1 = require("../utils/apiResponse");
const redis_1 = require("../config/redis");
const trust_service_1 = require("../services/trust.service");
const notification_service_1 = require("../services/notification.service");
const mentionService = __importStar(require("../services/mention.service"));
const POST_SELECT = {
    id: true,
    content: true,
    category: true,
    createdAt: true,
    updatedAt: true,
    author: {
        select: {
            id: true,
            username: true,
            name: true,
            avatar: true,
            trustLevel: true,
        },
    },
    _count: { select: { comments: true, votes: true } },
};
// GET /api/v1/posts?page=1&limit=10&category=DISCUSSION
async function getFeed(req, res, next) {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(50, parseInt(req.query.limit) || 20);
        const category = req.query.category;
        const skip = (page - 1) * limit;
        const cacheKey = `feed:${category || "all"}:${page}:${limit}`;
        let cachedPayload = await (0, redis_1.getCached)(cacheKey);
        if (!cachedPayload) {
            const where = category ? { category: category } : {};
            const [posts, total] = await Promise.all([
                prisma_1.default.post.findMany({
                    where,
                    select: POST_SELECT,
                    orderBy: { createdAt: "desc" },
                    skip,
                    take: limit,
                }),
                prisma_1.default.post.count({ where }),
            ]);
            // ✅ Single query for ALL votes at once (replaces N+1 loop)
            const postIds = posts.map((p) => p.id);
            const allVotes = await prisma_1.default.vote.groupBy({
                by: ["postId", "value"],
                where: { postId: { in: postIds } },
                _count: { value: true },
            });
            const postsWithVotes = posts.map((post) => {
                const postVotes = allVotes.filter((v) => v.postId === post.id);
                const upvotes = postVotes.find((v) => v.value === 1)?._count.value || 0;
                const downvotes = postVotes.find((v) => v.value === -1)?._count.value || 0;
                return { ...post, upvotes, downvotes };
            });
            cachedPayload = {
                posts: postsWithVotes,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                    hasMore: skip + limit < total,
                },
            };
            await (0, redis_1.setCache)(cacheKey, cachedPayload, 300);
        }
        // Now, dynamically attach user-specific data (userVote) to the cached/fresh payload
        if (req.user) {
            const userId = req.user.userId;
            const postIds = cachedPayload.posts.map((p) => p.id);
            const userVotes = await prisma_1.default.vote.findMany({
                where: {
                    userId,
                    postId: { in: postIds }
                },
                select: { postId: true, value: true }
            });
            const voteMap = new Map(userVotes.map((v) => [v.postId, v.value]));
            cachedPayload.posts = cachedPayload.posts.map((post) => ({
                ...post,
                userVote: voteMap.get(post.id) ?? null
            }));
        }
        else {
            cachedPayload.posts = cachedPayload.posts.map((post) => ({
                ...post,
                userVote: null
            }));
        }
        (0, apiResponse_1.sendSuccess)(res, cachedPayload);
    }
    catch (err) {
        next(err);
    }
}
// POST /api/v1/posts
async function createPost(req, res, next) {
    try {
        const { content, category } = req.body;
        const post = await prisma_1.default.post.create({
            data: { content, category, authorId: req.user.userId },
            select: POST_SELECT,
        });
        // Update trust score (non-fatal)
        await (0, trust_service_1.awardTrust)(req.user.userId, "POST_CREATED");
        await (0, redis_1.invalidateCache)(`feed:*`);
        (0, apiResponse_1.sendSuccess)(res, { post }, "Post created", 201);
    }
    catch (err) {
        next(err);
    }
}
// GET /api/v1/posts/:id
async function getPost(req, res, next) {
    try {
        const { id } = req.params;
        const post = await prisma_1.default.post.findUnique({
            where: { id },
            select: {
                ...POST_SELECT,
                comments: {
                    select: {
                        id: true,
                        content: true,
                        createdAt: true,
                        author: { select: { id: true, username: true, avatar: true, trustLevel: true } },
                    },
                    orderBy: { createdAt: "asc" },
                },
            },
        });
        if (!post) {
            (0, apiResponse_1.sendError)(res, "Post not found", 404);
            return;
        }
        const allVotes = await prisma_1.default.vote.groupBy({
            by: ["value"],
            where: { postId: id },
            _count: { value: true },
        });
        const upvotes = allVotes.find((v) => v.value === 1)?._count.value || 0;
        const downvotes = allVotes.find((v) => v.value === -1)?._count.value || 0;
        let userVote = null;
        if (req.user) {
            const currentVote = await prisma_1.default.vote.findUnique({
                where: { postId_userId: { postId: id, userId: req.user.userId } },
                select: { value: true },
            });
            userVote = currentVote?.value ?? null;
        }
        (0, apiResponse_1.sendSuccess)(res, { post: { ...post, upvotes, downvotes, userVote } });
    }
    catch (err) {
        next(err);
    }
}
// DELETE /api/v1/posts/:id
async function deletePost(req, res, next) {
    try {
        const { id } = req.params;
        const post = await prisma_1.default.post.findUnique({
            where: { id },
            select: { authorId: true },
        });
        if (!post) {
            (0, apiResponse_1.sendError)(res, "Post not found", 404);
            return;
        }
        if (post.authorId !== req.user.userId) {
            (0, apiResponse_1.sendError)(res, "Forbidden", 403);
            return;
        }
        await prisma_1.default.post.delete({ where: { id } });
        await (0, redis_1.invalidateCache)(`feed:*`);
        (0, apiResponse_1.sendSuccess)(res, null, "Post deleted");
    }
    catch (err) {
        next(err);
    }
}
// POST /api/v1/posts/:id/vote
async function votePost(req, res, next) {
    try {
        const { value } = req.body; // 1 or -1
        const postId = req.params.id;
        const userId = req.user.userId;
        if (![1, -1].includes(value)) {
            (0, apiResponse_1.sendError)(res, "Vote value must be 1 or -1", 400);
            return;
        }
        const existing = await prisma_1.default.vote.findUnique({
            where: { postId_userId: { postId, userId } },
        });
        if (existing) {
            if (existing.value === value) {
                // Toggle off — remove vote
                await prisma_1.default.vote.delete({ where: { postId_userId: { postId, userId } } });
            }
            else {
                // Switch vote direction
                await prisma_1.default.vote.update({
                    where: { postId_userId: { postId, userId } },
                    data: { value },
                });
            }
        }
        else {
            // New vote
            await prisma_1.default.vote.create({ data: { postId, userId, value } });
            const postRecord = await prisma_1.default.post.findUnique({
                where: { id: postId },
                select: { authorId: true },
            });
            if (postRecord)
                (0, notification_service_1.notifyVote)(postRecord.authorId, userId, postId, value);
        }
        // Always return fresh counts + current userVote after any change
        const allVotes = await prisma_1.default.vote.groupBy({
            by: ["value"],
            where: { postId },
            _count: { value: true },
        });
        const upvotes = allVotes.find((v) => v.value === 1)?._count.value || 0;
        const downvotes = allVotes.find((v) => v.value === -1)?._count.value || 0;
        const currentVote = await prisma_1.default.vote.findUnique({
            where: { postId_userId: { postId, userId } },
            select: { value: true },
        });
        (0, apiResponse_1.sendSuccess)(res, {
            upvotes,
            downvotes,
            userVote: currentVote?.value ?? null,
        }, "Vote updated");
    }
    catch (err) {
        next(err);
    }
}
// POST /api/v1/posts/:id/comments
async function addComment(req, res, next) {
    try {
        const { content } = req.body;
        const postId = req.params.id;
        const postExists = await prisma_1.default.post.count({ where: { id: postId } });
        if (!postExists) {
            (0, apiResponse_1.sendError)(res, "Post not found", 404);
            return;
        }
        const comment = await prisma_1.default.comment.create({
            data: { content, postId, authorId: req.user.userId },
            select: {
                id: true,
                content: true,
                createdAt: true,
                author: { select: { id: true, username: true, avatar: true, trustLevel: true } },
            },
        });
        // Notify post author (non-fatal)
        const post = await prisma_1.default.post.findUnique({ where: { id: postId }, select: { authorId: true } });
        if (post)
            (0, notification_service_1.notifyComment)(post.authorId, req.user.userId, postId);
        // Parse for @mentions and notify mentioned users
        await mentionService.processMentions(content, req.user.userId, `/posts/${postId}#comment-${comment.id}`, 'POST_COMMENT');
        await (0, redis_1.invalidateCache)(`feed:*`);
        (0, apiResponse_1.sendSuccess)(res, { comment }, "Comment added", 201);
    }
    catch (err) {
        next(err);
    }
}
// PATCH /api/v1/posts/:id
async function updatePost(req, res, next) {
    try {
        const { id } = req.params;
        const { content, category } = req.body;
        const post = await prisma_1.default.post.findUnique({ where: { id }, select: { authorId: true } });
        if (!post) {
            (0, apiResponse_1.sendError)(res, "Post not found", 404);
            return;
        }
        if (post.authorId !== req.user.userId) {
            (0, apiResponse_1.sendError)(res, "Forbidden", 403);
            return;
        }
        const updated = await prisma_1.default.post.update({
            where: { id },
            data: { ...(content !== undefined && { content }), ...(category !== undefined && { category }) },
            select: POST_SELECT,
        });
        await (0, redis_1.invalidateCache)(`feed:*`);
        (0, apiResponse_1.sendSuccess)(res, { post: updated }, "Post updated");
    }
    catch (err) {
        next(err);
    }
}
// DELETE /api/v1/posts/:id/comments/:commentId
async function deleteComment(req, res, next) {
    try {
        const { commentId } = req.params;
        const comment = await prisma_1.default.comment.findUnique({
            where: { id: commentId },
            select: { authorId: true, postId: true },
        });
        if (!comment) {
            (0, apiResponse_1.sendError)(res, "Comment not found", 404);
            return;
        }
        // Allow author OR post author to delete
        const post = await prisma_1.default.post.findUnique({
            where: { id: comment.postId },
            select: { authorId: true },
        });
        if (comment.authorId !== req.user.userId && post?.authorId !== req.user.userId) {
            (0, apiResponse_1.sendError)(res, "Forbidden", 403);
            return;
        }
        await prisma_1.default.comment.delete({ where: { id: commentId } });
        (0, apiResponse_1.sendSuccess)(res, null, "Comment deleted");
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=post.controller.js.map