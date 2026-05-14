import { Request, Response, NextFunction } from "express";
import { generateAccessToken, generateRefreshToken, refreshTokenTtlMs } from "../utils/jwt";
import prisma from "../config/prisma";
import { sendError } from "../utils/apiResponse";
import logger from "../config/logger";

function setRefreshCookie(res: Response, token: string) {
  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: refreshTokenTtlMs(),
    path: "/api/v1/auth",
  });
}

/**
 * Decode the frontend origin from the OAuth state parameter.
 *
 * The state was base64-encoded in auth.routes.ts at initiation time
 * (when the browser Referer was still available). This is the spec-correct
 * way to carry custom data through the OAuth round-trip.
 *
 * Falls back to FRONTEND_URL for production / missing state.
 */
function resolveFrontendUrl(req: Request): string {
  if (process.env.NODE_ENV === "production") {
    return process.env.FRONTEND_URL || "https://camply.app";
  }

  // Read origin from state (encoded at /api/v1/auth/google initiation)
  const state = req.query.state as string | undefined;
  if (state) {
    try {
      const decoded = Buffer.from(state, "base64").toString("utf8");
      // Validate it's a sensible URL before using it
      new URL(decoded);
      return decoded;
    } catch {
      // malformed state — fall through
    }
  }

  return process.env.FRONTEND_URL || "http://localhost:8080";
}

export async function googleCallback(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user: any = req.user;

    if (!user) {
      sendError(res, "Google authentication failed", 401);
      return;
    }

    const tokenPayload = { userId: user.id, username: user.username };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Rotate refresh tokens (keep max 3)
    const tokens = await prisma.refreshToken.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      select: { id: true },
    });
    if (tokens.length >= 3) {
      const toDelete = tokens.slice(2).map((t) => t.id);
      await prisma.refreshToken.deleteMany({ where: { id: { in: toDelete } } });
    }

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + refreshTokenTtlMs()),
      },
    });

    setRefreshCookie(res, refreshToken);

    const frontendUrl = resolveFrontendUrl(req);
    logger.info(`[OAuth] Redirecting to ${frontendUrl}/auth/callback`);
    res.redirect(`${frontendUrl}/auth/callback?token=${accessToken}`);
  } catch (err) {
    next(err);
  }
}
