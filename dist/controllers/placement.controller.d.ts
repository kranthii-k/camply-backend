/**
 * placement.controller.ts
 *
 * Handles all CRUD for community placement experience posts.
 *
 * Endpoints:
 *   GET    /api/v1/placements          — list all (with type filter)
 *   POST   /api/v1/placements          — create new (auth required)
 *   POST   /api/v1/placements/:id/upvote   — toggle upvote (auth)
 *   POST   /api/v1/placements/:id/comments — add comment (auth)
 *   DELETE /api/v1/placements/:id/comments/:commentId — delete comment (auth)
 *
 * Upvote behavior: toggling — if user has upvoted, calling again removes it.
 * This mirrors the existing Vote model behavior for posts.
 *
 * Pagination: cursor-based using createdAt for scalability.
 * Default page size: 20.
 */
import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
export declare function getPlacements(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function createPlacement(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
export declare function toggleUpvote(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
export declare function addPlacementComment(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
export declare function deletePlacementComment(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=placement.controller.d.ts.map