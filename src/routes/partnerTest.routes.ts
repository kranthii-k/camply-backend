/**
 * partnerTest.routes.ts
 *
 * GET /api/v1/partner-tests — public, list active partner test cards
 */

import { Router } from "express";
import { getPartnerTests } from "../controllers/partnerTest.controller";

const router = Router();

router.get("/", getPartnerTests);

export default router;
