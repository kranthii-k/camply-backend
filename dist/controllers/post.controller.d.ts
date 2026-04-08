import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
export declare function getFeed(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
export declare function createPost(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
export declare function getPost(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
export declare function deletePost(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
export declare function votePost(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
export declare function addComment(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
export declare function updatePost(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
export declare function deleteComment(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=post.controller.d.ts.map