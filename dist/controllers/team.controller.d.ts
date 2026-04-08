import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
export declare function getAllTeams(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
export declare function getTeam(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
export declare function getMyTeams(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
export declare function createTeam(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
export declare function inviteMember(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
export declare function deleteTeam(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
export declare function leaveTeam(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
export declare function updateTeam(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=team.controller.d.ts.map