"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateEventStatusSchema = exports.createHostedEventSchema = exports.placementCommentSchema = exports.placementUpvoteSchema = exports.createPlacementPostSchema = exports.updateJobStatusSchema = exports.submitJobSchema = exports.updatePostSchema = exports.createChatSchema = exports.updateTeamSchema = exports.createTeamSchema = exports.swipeSchema = exports.changePasswordSchema = exports.updateProfileSchema = exports.commentSchema = exports.voteSchema = exports.createPostSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
// ─── Auth ────────────────────────────────────────────────
exports.registerSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2).max(60).trim(),
        username: zod_1.z
            .string()
            .min(3)
            .max(30)
            .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores")
            .trim(),
        email: zod_1.z.string().email().toLowerCase().trim(),
        password: zod_1.z
            .string()
            .min(8, "Password must be at least 8 characters")
            .max(100)
            .regex(/[A-Z]/, "Must include uppercase letter")
            .regex(/[0-9]/, "Must include a number"),
    }),
});
exports.loginSchema = zod_1.z.object({
    body: zod_1.z.object({
        identifier: zod_1.z.string().min(1, "Email or username required").trim(),
        password: zod_1.z.string().min(1, "Password required"),
    }),
});
// ─── Posts ───────────────────────────────────────────────
exports.createPostSchema = zod_1.z.object({
    body: zod_1.z.object({
        content: zod_1.z.string().min(1).max(5000).trim(),
        category: zod_1.z
            .enum(["QUERY", "SOLUTION", "JOB", "DISCUSSION"])
            .default("DISCUSSION"),
    }),
});
exports.voteSchema = zod_1.z.object({
    body: zod_1.z.object({
        value: zod_1.z.literal(1).or(zod_1.z.literal(-1)),
    }),
});
exports.commentSchema = zod_1.z.object({
    body: zod_1.z.object({
        content: zod_1.z.string().min(1).max(2000).trim(),
    }),
});
// ─── Profile ─────────────────────────────────────────────
exports.updateProfileSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2).max(60).optional(),
        bio: zod_1.z.string().max(500).optional(),
        college: zod_1.z.string().max(100).optional(),
        skills: zod_1.z.array(zod_1.z.string().max(30)).max(20).optional(),
    }),
});
exports.changePasswordSchema = zod_1.z.object({
    body: zod_1.z.object({
        currentPassword: zod_1.z.string().min(1),
        newPassword: zod_1.z
            .string()
            .min(8)
            .max(100)
            .regex(/[A-Z]/, "Must include uppercase letter")
            .regex(/[0-9]/, "Must include a number"),
    }),
});
// ─── Match ───────────────────────────────────────────────
exports.swipeSchema = zod_1.z.object({
    body: zod_1.z.object({
        toUserId: zod_1.z.string().uuid(),
        action: zod_1.z.enum(["like", "pass"]),
    }),
});
// ─── Teams ───────────────────────────────────────────────
exports.createTeamSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2).max(80).trim(),
        description: zod_1.z.string().max(500).optional(),
        hackathon: zod_1.z.string().max(100).optional(),
        roles: zod_1.z.array(zod_1.z.string().max(50)).max(10).optional(),
    }),
});
exports.updateTeamSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2).max(80).trim().optional(),
        description: zod_1.z.string().max(500).optional(),
        hackathon: zod_1.z.string().max(100).optional(),
        roles: zod_1.z.array(zod_1.z.string().max(50)).max(10).optional(),
    }),
});
// ─── Chats ───────────────────────────────────────────────
exports.createChatSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2).max(80).trim(),
        topic: zod_1.z.string().max(200).optional(),
    }),
});
// ─── Posts (update) ──────────────────────────────────────
exports.updatePostSchema = zod_1.z.object({
    body: zod_1.z.object({
        content: zod_1.z.string().min(1).max(5000).trim().optional(),
        category: zod_1.z.enum(["QUERY", "SOLUTION", "JOB", "DISCUSSION"]).optional(),
    }),
});
// ─── Jobs ─────────────────────────────────────────────────────────
/**
 * Schema for company job submission form.
 * Used by: POST /api/v1/jobs/submit
 * Auth: public (companies submit without account)
 */
exports.submitJobSchema = zod_1.z.object({
    body: zod_1.z.object({
        companyName: zod_1.z.string().min(2).max(100).trim(),
        companyLogo: zod_1.z.string().url().optional(),
        role: zod_1.z.string().min(2).max(100).trim(),
        location: zod_1.z.string().min(2).max(100).trim(),
        description: zod_1.z.string().min(50).max(5000).trim(),
        compensationType: zod_1.z.string().min(2).max(100).trim(),
        compensationNote: zod_1.z.string().min(10).max(500).trim(),
        perks: zod_1.z.array(zod_1.z.string().min(1).max(200)).min(1).max(10),
        requirements: zod_1.z.array(zod_1.z.string().min(1).max(200)).min(1).max(10),
        applyEmail: zod_1.z.string().email(),
        applySubject: zod_1.z.string().min(5).max(200).trim(),
        submitterName: zod_1.z.string().min(2).max(100).trim(),
        submitterEmail: zod_1.z.string().email(),
        submitterNote: zod_1.z.string().max(1000).trim().optional(),
    }),
});
/**
 * Schema for admin toggling a job's active status.
 * Used by: PATCH /api/v1/jobs/:id/status
 * Auth: requires authentication (admin check in controller)
 */
exports.updateJobStatusSchema = zod_1.z.object({
    body: zod_1.z.object({
        status: zod_1.z.enum(["ACTIVE", "INACTIVE", "REJECTED"]),
    }),
    params: zod_1.z.object({
        id: zod_1.z.string().uuid(),
    }),
});
// ─── Placement Experiences ────────────────────────────────────────
/**
 * Schema for submitting a new placement experience.
 * Used by: POST /api/v1/placements
 * Auth: required
 */
exports.createPlacementPostSchema = zod_1.z.object({
    body: zod_1.z.object({
        company: zod_1.z.string().min(1).max(100).trim(),
        companyLogo: zod_1.z.string().url().optional(),
        role: zod_1.z.string().min(1).max(100).trim(),
        package: zod_1.z.string().min(1).max(30).trim(), // e.g. "₹28 LPA"
        location: zod_1.z.string().min(1).max(100).trim(),
        difficulty: zod_1.z.enum(["EASY", "MEDIUM", "HARD"]),
        type: zod_1.z.enum(["INTERVIEW", "ONLINE_TEST", "GROUP_DISCUSSION"]),
        college: zod_1.z.string().min(1).max(100).trim(),
        tags: zod_1.z.array(zod_1.z.string().min(1).max(30)).min(1).max(8),
        preview: zod_1.z.string().min(20).max(500).trim(),
    }),
});
/**
 * Schema for upvoting a placement post.
 * Used by: POST /api/v1/placements/:id/upvote
 * Auth: required
 */
exports.placementUpvoteSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().uuid(),
    }),
});
/**
 * Schema for adding a comment to a placement post.
 * Used by: POST /api/v1/placements/:id/comments
 * Auth: required
 */
exports.placementCommentSchema = zod_1.z.object({
    body: zod_1.z.object({
        content: zod_1.z.string().min(1).max(1000).trim(),
    }),
    params: zod_1.z.object({
        id: zod_1.z.string().uuid(),
    }),
});
// ─── Hosted Events ───────────────────────────────────────────────
exports.createHostedEventSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().min(5).max(100).trim(),
        description: zod_1.z.string().min(20).max(2000).trim(),
        location: zod_1.z.string().min(2).max(100).trim(),
        date: zod_1.z.string().datetime(),
        registrationUrl: zod_1.z.string().url(),
        bannerUrl: zod_1.z.string().url().optional(),
    }),
});
exports.updateEventStatusSchema = zod_1.z.object({
    body: zod_1.z.object({
        status: zod_1.z.enum(["APPROVED", "REJECTED", "PENDING"]),
    }),
    params: zod_1.z.object({
        id: zod_1.z.string().uuid(),
    }),
});
//# sourceMappingURL=schemas.js.map