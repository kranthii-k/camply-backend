import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
export declare function getChats(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
export declare function joinChat(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
export declare function getMessages(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
export declare function createChat(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
export declare function deleteMessage(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
export declare function leaveChat(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=chat.controller.d.ts.map