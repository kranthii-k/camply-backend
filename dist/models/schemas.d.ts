import { z } from "zod";
export declare const registerSchema: z.ZodObject<{
    body: z.ZodObject<{
        name: z.ZodString;
        username: z.ZodString;
        email: z.ZodString;
        password: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        name: string;
        username: string;
        email: string;
        password: string;
    }, {
        name: string;
        username: string;
        email: string;
        password: string;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        name: string;
        username: string;
        email: string;
        password: string;
    };
}, {
    body: {
        name: string;
        username: string;
        email: string;
        password: string;
    };
}>;
export declare const loginSchema: z.ZodObject<{
    body: z.ZodObject<{
        identifier: z.ZodString;
        password: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        password: string;
        identifier: string;
    }, {
        password: string;
        identifier: string;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        password: string;
        identifier: string;
    };
}, {
    body: {
        password: string;
        identifier: string;
    };
}>;
export declare const createPostSchema: z.ZodObject<{
    body: z.ZodObject<{
        content: z.ZodString;
        category: z.ZodDefault<z.ZodEnum<["QUERY", "SOLUTION", "JOB", "DISCUSSION"]>>;
    }, "strip", z.ZodTypeAny, {
        content: string;
        category: "QUERY" | "SOLUTION" | "JOB" | "DISCUSSION";
    }, {
        content: string;
        category?: "QUERY" | "SOLUTION" | "JOB" | "DISCUSSION" | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        content: string;
        category: "QUERY" | "SOLUTION" | "JOB" | "DISCUSSION";
    };
}, {
    body: {
        content: string;
        category?: "QUERY" | "SOLUTION" | "JOB" | "DISCUSSION" | undefined;
    };
}>;
export declare const voteSchema: z.ZodObject<{
    body: z.ZodObject<{
        value: z.ZodUnion<[z.ZodLiteral<1>, z.ZodLiteral<-1>]>;
    }, "strip", z.ZodTypeAny, {
        value: 1 | -1;
    }, {
        value: 1 | -1;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        value: 1 | -1;
    };
}, {
    body: {
        value: 1 | -1;
    };
}>;
export declare const commentSchema: z.ZodObject<{
    body: z.ZodObject<{
        content: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        content: string;
    }, {
        content: string;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        content: string;
    };
}, {
    body: {
        content: string;
    };
}>;
export declare const updateProfileSchema: z.ZodObject<{
    body: z.ZodObject<{
        name: z.ZodOptional<z.ZodString>;
        bio: z.ZodOptional<z.ZodString>;
        college: z.ZodOptional<z.ZodString>;
        skills: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        name?: string | undefined;
        bio?: string | undefined;
        college?: string | undefined;
        skills?: string[] | undefined;
    }, {
        name?: string | undefined;
        bio?: string | undefined;
        college?: string | undefined;
        skills?: string[] | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        name?: string | undefined;
        bio?: string | undefined;
        college?: string | undefined;
        skills?: string[] | undefined;
    };
}, {
    body: {
        name?: string | undefined;
        bio?: string | undefined;
        college?: string | undefined;
        skills?: string[] | undefined;
    };
}>;
export declare const changePasswordSchema: z.ZodObject<{
    body: z.ZodObject<{
        currentPassword: z.ZodString;
        newPassword: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        currentPassword: string;
        newPassword: string;
    }, {
        currentPassword: string;
        newPassword: string;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        currentPassword: string;
        newPassword: string;
    };
}, {
    body: {
        currentPassword: string;
        newPassword: string;
    };
}>;
export declare const swipeSchema: z.ZodObject<{
    body: z.ZodObject<{
        toUserId: z.ZodString;
        action: z.ZodEnum<["like", "pass"]>;
    }, "strip", z.ZodTypeAny, {
        toUserId: string;
        action: "like" | "pass";
    }, {
        toUserId: string;
        action: "like" | "pass";
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        toUserId: string;
        action: "like" | "pass";
    };
}, {
    body: {
        toUserId: string;
        action: "like" | "pass";
    };
}>;
export declare const createTeamSchema: z.ZodObject<{
    body: z.ZodObject<{
        name: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        hackathon: z.ZodOptional<z.ZodString>;
        roles: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        hackathon?: string | undefined;
        description?: string | undefined;
        roles?: string[] | undefined;
    }, {
        name: string;
        hackathon?: string | undefined;
        description?: string | undefined;
        roles?: string[] | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        name: string;
        hackathon?: string | undefined;
        description?: string | undefined;
        roles?: string[] | undefined;
    };
}, {
    body: {
        name: string;
        hackathon?: string | undefined;
        description?: string | undefined;
        roles?: string[] | undefined;
    };
}>;
export declare const updateTeamSchema: z.ZodObject<{
    body: z.ZodObject<{
        name: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        hackathon: z.ZodOptional<z.ZodString>;
        roles: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        hackathon?: string | undefined;
        name?: string | undefined;
        description?: string | undefined;
        roles?: string[] | undefined;
    }, {
        hackathon?: string | undefined;
        name?: string | undefined;
        description?: string | undefined;
        roles?: string[] | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        hackathon?: string | undefined;
        name?: string | undefined;
        description?: string | undefined;
        roles?: string[] | undefined;
    };
}, {
    body: {
        hackathon?: string | undefined;
        name?: string | undefined;
        description?: string | undefined;
        roles?: string[] | undefined;
    };
}>;
export declare const createChatSchema: z.ZodObject<{
    body: z.ZodObject<{
        name: z.ZodString;
        topic: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        topic?: string | undefined;
    }, {
        name: string;
        topic?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        name: string;
        topic?: string | undefined;
    };
}, {
    body: {
        name: string;
        topic?: string | undefined;
    };
}>;
export declare const updatePostSchema: z.ZodObject<{
    body: z.ZodObject<{
        content: z.ZodOptional<z.ZodString>;
        category: z.ZodOptional<z.ZodEnum<["QUERY", "SOLUTION", "JOB", "DISCUSSION"]>>;
    }, "strip", z.ZodTypeAny, {
        content?: string | undefined;
        category?: "QUERY" | "SOLUTION" | "JOB" | "DISCUSSION" | undefined;
    }, {
        content?: string | undefined;
        category?: "QUERY" | "SOLUTION" | "JOB" | "DISCUSSION" | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        content?: string | undefined;
        category?: "QUERY" | "SOLUTION" | "JOB" | "DISCUSSION" | undefined;
    };
}, {
    body: {
        content?: string | undefined;
        category?: "QUERY" | "SOLUTION" | "JOB" | "DISCUSSION" | undefined;
    };
}>;
/**
 * Schema for company job submission form.
 * Used by: POST /api/v1/jobs/submit
 * Auth: public (companies submit without account)
 */
export declare const submitJobSchema: z.ZodObject<{
    body: z.ZodObject<{
        companyName: z.ZodString;
        companyLogo: z.ZodOptional<z.ZodString>;
        role: z.ZodString;
        location: z.ZodString;
        description: z.ZodString;
        compensationType: z.ZodString;
        compensationNote: z.ZodString;
        perks: z.ZodArray<z.ZodString, "many">;
        requirements: z.ZodArray<z.ZodString, "many">;
        applyEmail: z.ZodString;
        applySubject: z.ZodString;
        submitterName: z.ZodString;
        submitterEmail: z.ZodString;
        submitterNote: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        role: string;
        description: string;
        companyName: string;
        location: string;
        compensationType: string;
        compensationNote: string;
        perks: string[];
        requirements: string[];
        applyEmail: string;
        applySubject: string;
        submitterName: string;
        submitterEmail: string;
        companyLogo?: string | undefined;
        submitterNote?: string | undefined;
    }, {
        role: string;
        description: string;
        companyName: string;
        location: string;
        compensationType: string;
        compensationNote: string;
        perks: string[];
        requirements: string[];
        applyEmail: string;
        applySubject: string;
        submitterName: string;
        submitterEmail: string;
        companyLogo?: string | undefined;
        submitterNote?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        role: string;
        description: string;
        companyName: string;
        location: string;
        compensationType: string;
        compensationNote: string;
        perks: string[];
        requirements: string[];
        applyEmail: string;
        applySubject: string;
        submitterName: string;
        submitterEmail: string;
        companyLogo?: string | undefined;
        submitterNote?: string | undefined;
    };
}, {
    body: {
        role: string;
        description: string;
        companyName: string;
        location: string;
        compensationType: string;
        compensationNote: string;
        perks: string[];
        requirements: string[];
        applyEmail: string;
        applySubject: string;
        submitterName: string;
        submitterEmail: string;
        companyLogo?: string | undefined;
        submitterNote?: string | undefined;
    };
}>;
/**
 * Schema for admin toggling a job's active status.
 * Used by: PATCH /api/v1/jobs/:id/status
 * Auth: requires authentication (admin check in controller)
 */
export declare const updateJobStatusSchema: z.ZodObject<{
    body: z.ZodObject<{
        status: z.ZodEnum<["ACTIVE", "INACTIVE", "REJECTED"]>;
    }, "strip", z.ZodTypeAny, {
        status: "ACTIVE" | "INACTIVE" | "REJECTED";
    }, {
        status: "ACTIVE" | "INACTIVE" | "REJECTED";
    }>;
    params: z.ZodObject<{
        id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
    }, {
        id: string;
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        id: string;
    };
    body: {
        status: "ACTIVE" | "INACTIVE" | "REJECTED";
    };
}, {
    params: {
        id: string;
    };
    body: {
        status: "ACTIVE" | "INACTIVE" | "REJECTED";
    };
}>;
/**
 * Schema for submitting a new placement experience.
 * Used by: POST /api/v1/placements
 * Auth: required
 */
export declare const createPlacementPostSchema: z.ZodObject<{
    body: z.ZodObject<{
        company: z.ZodString;
        companyLogo: z.ZodOptional<z.ZodString>;
        role: z.ZodString;
        package: z.ZodString;
        location: z.ZodString;
        difficulty: z.ZodEnum<["EASY", "MEDIUM", "HARD"]>;
        type: z.ZodEnum<["INTERVIEW", "ONLINE_TEST", "GROUP_DISCUSSION"]>;
        college: z.ZodString;
        tags: z.ZodArray<z.ZodString, "many">;
        preview: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        role: string;
        type: "INTERVIEW" | "ONLINE_TEST" | "GROUP_DISCUSSION";
        college: string;
        location: string;
        company: string;
        package: string;
        difficulty: "HARD" | "EASY" | "MEDIUM";
        tags: string[];
        preview: string;
        companyLogo?: string | undefined;
    }, {
        role: string;
        type: "INTERVIEW" | "ONLINE_TEST" | "GROUP_DISCUSSION";
        college: string;
        location: string;
        company: string;
        package: string;
        difficulty: "HARD" | "EASY" | "MEDIUM";
        tags: string[];
        preview: string;
        companyLogo?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        role: string;
        type: "INTERVIEW" | "ONLINE_TEST" | "GROUP_DISCUSSION";
        college: string;
        location: string;
        company: string;
        package: string;
        difficulty: "HARD" | "EASY" | "MEDIUM";
        tags: string[];
        preview: string;
        companyLogo?: string | undefined;
    };
}, {
    body: {
        role: string;
        type: "INTERVIEW" | "ONLINE_TEST" | "GROUP_DISCUSSION";
        college: string;
        location: string;
        company: string;
        package: string;
        difficulty: "HARD" | "EASY" | "MEDIUM";
        tags: string[];
        preview: string;
        companyLogo?: string | undefined;
    };
}>;
/**
 * Schema for upvoting a placement post.
 * Used by: POST /api/v1/placements/:id/upvote
 * Auth: required
 */
export declare const placementUpvoteSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
    }, {
        id: string;
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        id: string;
    };
}, {
    params: {
        id: string;
    };
}>;
/**
 * Schema for adding a comment to a placement post.
 * Used by: POST /api/v1/placements/:id/comments
 * Auth: required
 */
export declare const placementCommentSchema: z.ZodObject<{
    body: z.ZodObject<{
        content: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        content: string;
    }, {
        content: string;
    }>;
    params: z.ZodObject<{
        id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
    }, {
        id: string;
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        id: string;
    };
    body: {
        content: string;
    };
}, {
    params: {
        id: string;
    };
    body: {
        content: string;
    };
}>;
export declare const createHostedEventSchema: z.ZodObject<{
    body: z.ZodObject<{
        title: z.ZodString;
        description: z.ZodString;
        location: z.ZodString;
        date: z.ZodString;
        registrationUrl: z.ZodString;
        bannerUrl: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        title: string;
        description: string;
        date: string;
        location: string;
        registrationUrl: string;
        bannerUrl?: string | undefined;
    }, {
        title: string;
        description: string;
        date: string;
        location: string;
        registrationUrl: string;
        bannerUrl?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        title: string;
        description: string;
        date: string;
        location: string;
        registrationUrl: string;
        bannerUrl?: string | undefined;
    };
}, {
    body: {
        title: string;
        description: string;
        date: string;
        location: string;
        registrationUrl: string;
        bannerUrl?: string | undefined;
    };
}>;
export declare const updateEventStatusSchema: z.ZodObject<{
    body: z.ZodObject<{
        status: z.ZodEnum<["APPROVED", "REJECTED", "PENDING"]>;
    }, "strip", z.ZodTypeAny, {
        status: "PENDING" | "REJECTED" | "APPROVED";
    }, {
        status: "PENDING" | "REJECTED" | "APPROVED";
    }>;
    params: z.ZodObject<{
        id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
    }, {
        id: string;
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        id: string;
    };
    body: {
        status: "PENDING" | "REJECTED" | "APPROVED";
    };
}, {
    params: {
        id: string;
    };
    body: {
        status: "PENDING" | "REJECTED" | "APPROVED";
    };
}>;
//# sourceMappingURL=schemas.d.ts.map