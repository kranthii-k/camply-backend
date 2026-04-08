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
import { Request, Response, NextFunction } from "express";
export declare function getPartnerTests(_req: Request, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=partnerTest.controller.d.ts.map