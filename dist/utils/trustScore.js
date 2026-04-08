"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrustScoreActions = void 0;
exports.calculateTrustLevel = calculateTrustLevel;
const client_1 = require("@prisma/client");
function calculateTrustLevel(score) {
    if (score >= 500)
        return client_1.TrustLevel.PLATINUM;
    if (score >= 200)
        return client_1.TrustLevel.GOLD;
    if (score >= 50)
        return client_1.TrustLevel.SILVER;
    return client_1.TrustLevel.BRONZE;
}
exports.TrustScoreActions = {
    POST_CREATED: 5,
    COMMENT_RECEIVED: 2,
    UPVOTE_RECEIVED: 3,
    MATCH_MADE: 10,
    TEAM_JOINED: 8,
};
//# sourceMappingURL=trustScore.js.map