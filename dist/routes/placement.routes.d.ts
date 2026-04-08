/**
 * placement.routes.ts
 *
 * GET    /api/v1/placements                              — public
 * POST   /api/v1/placements                              — auth required
 * POST   /api/v1/placements/:id/upvote                  — auth required
 * POST   /api/v1/placements/:id/comments                — auth required
 * DELETE /api/v1/placements/:id/comments/:commentId     — auth required
 */
declare const router: import("express-serve-static-core").Router;
export default router;
//# sourceMappingURL=placement.routes.d.ts.map