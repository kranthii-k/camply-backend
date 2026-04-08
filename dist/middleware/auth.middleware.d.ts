import { Request, Response, NextFunction } from "express";
export interface AuthRequest extends Request {
    user?: {
        userId: string;
        username: string;
    };
}
export declare function authenticate(req: AuthRequest, res: Response, next: NextFunction): void;
/** Middleware for routes that work both authed and unauthed */
export declare function optionalAuth(req: AuthRequest, _res: Response, next: NextFunction): void;
//# sourceMappingURL=auth.middleware.d.ts.map