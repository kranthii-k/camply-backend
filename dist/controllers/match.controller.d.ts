import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
export declare function getProfiles(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
export declare function swipe(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
export declare function getMatches(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
export declare function resetRejected(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
export declare function resetAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
export declare function getInvitations(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=match.controller.d.ts.map