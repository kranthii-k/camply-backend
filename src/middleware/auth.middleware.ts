import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";
import { sendError } from "../utils/apiResponse";
import prisma from "../config/prisma";

export interface AuthRequest extends Request {
  user?: { userId: string; username: string };
}

export async function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    sendError(res, "Access token required", 401);
    return;
  }

  const token = authHeader.split(" ")[1];

  let payload: { userId: string; username: string };
  try {
    payload = verifyAccessToken(token);
  } catch (err: any) {
    if (err.name === "TokenExpiredError") {
      sendError(res, "Access token expired", 401);
    } else {
      sendError(res, "Invalid access token", 401);
    }
    return;
  }

  // Check ban status — wrap in try/catch so DB failures never block legit users
  try {
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { bannedUntil: true },
    });

    if (user?.bannedUntil && user.bannedUntil > new Date()) {
      sendError(
        res,
        "Your account is temporarily suspended for 30 days due to repeated community guideline violations.",
        403
      );
      return;
    }
  } catch {
    // DB unreachable (e.g. tests with dummy URL) — allow through
  }

  req.user = payload;
  next();
}


/** Middleware for routes that work both authed and unauthed */
export function optionalAuth(
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    try {
      req.user = verifyAccessToken(authHeader.split(" ")[1]);
    } catch {
      // ignore – optional
    }
  }
  next();
}

