import { TrustLevel } from "@prisma/client";
export declare function calculateTrustLevel(score: number): TrustLevel;
export declare const TrustScoreActions: {
    readonly POST_CREATED: 5;
    readonly COMMENT_RECEIVED: 2;
    readonly UPVOTE_RECEIVED: 3;
    readonly MATCH_MADE: 10;
    readonly TEAM_JOINED: 8;
};
//# sourceMappingURL=trustScore.d.ts.map