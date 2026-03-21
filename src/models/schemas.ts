import { z } from "zod";

// ─── Auth ────────────────────────────────────────────────
export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(60).trim(),
    username: z
      .string()
      .min(3)
      .max(30)
      .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores")
      .trim(),
    email: z.string().email().toLowerCase().trim(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(100)
      .regex(/[A-Z]/, "Must include uppercase letter")
      .regex(/[0-9]/, "Must include a number"),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    identifier: z.string().min(1, "Email or username required").trim(),
    password: z.string().min(1, "Password required"),
  }),
});

// ─── Posts ───────────────────────────────────────────────
export const createPostSchema = z.object({
  body: z.object({
    content: z.string().min(1).max(5000).trim(),
    category: z
      .enum(["QUERY", "SOLUTION", "JOB", "DISCUSSION"])
      .default("DISCUSSION"),
  }),
});

export const voteSchema = z.object({
  body: z.object({
    value: z.literal(1).or(z.literal(-1)),
  }),
});

export const commentSchema = z.object({
  body: z.object({
    content: z.string().min(1).max(2000).trim(),
  }),
});

// ─── Profile ─────────────────────────────────────────────
export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(60).optional(),
    bio: z.string().max(500).optional(),
    college: z.string().max(100).optional(),
    skills: z.array(z.string().max(30)).max(20).optional(),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1),
    newPassword: z
      .string()
      .min(8)
      .max(100)
      .regex(/[A-Z]/, "Must include uppercase letter")
      .regex(/[0-9]/, "Must include a number"),
  }),
});

// ─── Match ───────────────────────────────────────────────
export const swipeSchema = z.object({
  body: z.object({
    toUserId: z.string().uuid(),
    action: z.enum(["like", "pass"]),
  }),
});

// ─── Teams ───────────────────────────────────────────────
export const createTeamSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(80).trim(),
    description: z.string().max(500).optional(),
    hackathon: z.string().max(100).optional(),
    roles: z.array(z.string().max(50)).max(10).optional(),
  }),
});

export const updateTeamSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(80).trim().optional(),
    description: z.string().max(500).optional(),
    hackathon: z.string().max(100).optional(),
    roles: z.array(z.string().max(50)).max(10).optional(),
  }),
});

// ─── Chats ───────────────────────────────────────────────
export const createChatSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(80).trim(),
    topic: z.string().max(200).optional(),
  }),
});

// ─── Posts (update) ──────────────────────────────────────
export const updatePostSchema = z.object({
  body: z.object({
    content: z.string().min(1).max(5000).trim().optional(),
    category: z.enum(["QUERY", "SOLUTION", "JOB", "DISCUSSION"]).optional(),
  }),
});

// ─── Jobs ─────────────────────────────────────────────────────────

/**
 * Schema for company job submission form.
 * Used by: POST /api/v1/jobs/submit
 * Auth: public (companies submit without account)
 */
export const submitJobSchema = z.object({
  body: z.object({
    companyName: z.string().min(2).max(100).trim(),
    companyLogo: z.string().url().optional(),
    role: z.string().min(2).max(100).trim(),
    location: z.string().min(2).max(100).trim(),
    description: z.string().min(50).max(5000).trim(),
    compensationType: z.string().min(2).max(100).trim(),
    compensationNote: z.string().min(10).max(500).trim(),
    perks: z.array(z.string().min(1).max(200)).min(1).max(10),
    requirements: z.array(z.string().min(1).max(200)).min(1).max(10),
    applyEmail: z.string().email(),
    applySubject: z.string().min(5).max(200).trim(),
    submitterName: z.string().min(2).max(100).trim(),
    submitterEmail: z.string().email(),
    submitterNote: z.string().max(1000).trim().optional(),
  }),
});

/**
 * Schema for admin toggling a job's active status.
 * Used by: PATCH /api/v1/jobs/:id/status
 * Auth: requires authentication (admin check in controller)
 */
export const updateJobStatusSchema = z.object({
  body: z.object({
    status: z.enum(["ACTIVE", "INACTIVE", "REJECTED"]),
  }),
  params: z.object({
    id: z.string().uuid(),
  }),
});

// ─── Placement Experiences ────────────────────────────────────────

/**
 * Schema for submitting a new placement experience.
 * Used by: POST /api/v1/placements
 * Auth: required
 */
export const createPlacementPostSchema = z.object({
  body: z.object({
    company: z.string().min(1).max(100).trim(),
    companyLogo: z.string().url().optional(),
    role: z.string().min(1).max(100).trim(),
    package: z.string().min(1).max(30).trim(),    // e.g. "₹28 LPA"
    location: z.string().min(1).max(100).trim(),
    difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
    type: z.enum(["INTERVIEW", "ONLINE_TEST", "GROUP_DISCUSSION"]),
    college: z.string().min(1).max(100).trim(),
    tags: z.array(z.string().min(1).max(30)).min(1).max(8),
    preview: z.string().min(20).max(500).trim(),
  }),
});

/**
 * Schema for upvoting a placement post.
 * Used by: POST /api/v1/placements/:id/upvote
 * Auth: required
 */
export const placementUpvoteSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

/**
 * Schema for adding a comment to a placement post.
 * Used by: POST /api/v1/placements/:id/comments
 * Auth: required
 */
export const placementCommentSchema = z.object({
  body: z.object({
    content: z.string().min(1).max(1000).trim(),
  }),
  params: z.object({
    id: z.string().uuid(),
  }),
});
// ─── Hosted Events ───────────────────────────────────────────────

export const createHostedEventSchema = z.object({
  body: z.object({
    title: z.string().min(5).max(100).trim(),
    description: z.string().min(20).max(2000).trim(),
    location: z.string().min(2).max(100).trim(),
    date: z.string().datetime(),
    registrationUrl: z.string().url(),
    bannerUrl: z.string().url().optional(),
  }),
});

export const updateEventStatusSchema = z.object({
  body: z.object({
    status: z.enum(["APPROVED", "REJECTED", "PENDING"]),
  }),
  params: z.object({
    id: z.string().uuid(),
  }),
});
