"use strict";
/**
 * partnerTest.controller.ts
 *
 * Handles listing of ed-tech partner test cards.
 * Only one public endpoint: GET /api/v1/partner-tests
 *
 * Cards are ordered by priority DESC then createdAt DESC.
 * This means paid placement partners (higher priority) always appear first.
 * Default priority is 0 (first-come-first-serve).
 *
 * isActive flag allows disabling a card without deleting it.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPartnerTests = getPartnerTests;
const prisma_1 = __importDefault(require("../config/prisma"));
const apiResponse_1 = require("../utils/apiResponse");
const logger_1 = __importDefault(require("../config/logger"));
// ─────────────────────────────────────────────────────────
// GET /api/v1/partner-tests
// Public. Returns all active partner test cards.
// ─────────────────────────────────────────────────────────
async function getPartnerTests(_req, res, next) {
    try {
        const tests = await prisma_1.default.partnerTest.findMany({
            where: { isActive: true },
            orderBy: [
                { priority: "desc" }, // Higher priority = paid placement = shown first
                { createdAt: "desc" },
            ],
            select: {
                id: true,
                platformName: true,
                logoUrl: true,
                title: true,
                description: true,
                testLink: true,
                registrationLink: true,
                createdAt: true,
                // Exclude: priority (internal business logic, not for frontend)
                // Exclude: isActive (only active ones are returned anyway)
            },
        });
        logger_1.default.info(`[PartnerTests] Fetched ${tests.length} active partner tests`);
        (0, apiResponse_1.sendSuccess)(res, { tests, total: tests.length });
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=partnerTest.controller.js.map