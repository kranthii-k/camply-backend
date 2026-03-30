import { Router } from "express";
import passport from "passport";
import { register, login, logout, refresh, me } from "../controllers/auth.controller";
import { googleCallback } from "../controllers/google.auth.controller";
import { validate } from "../middleware/validate.middleware";
import { authenticate } from "../middleware/auth.middleware";
import { registerSchema, loginSchema } from "../models/schemas";

const router = Router();

// Public
router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/refresh", refresh);
router.post("/logout", logout);

// Google OAuth
// At initiation, the browser Referer IS available — encode the frontend origin
// in the OAuth state so the callback knows where to redirect, regardless of port.
router.get("/google", (req, res, next) => {
  const referer = (req.headers.referer || req.headers.origin) as string | undefined;
  let frontendOrigin = process.env.FRONTEND_URL || "http://localhost:8080";
  if (referer) {
    try {
      const url = new URL(referer);
      frontendOrigin = `${url.protocol}//${url.host}`;
    } catch { /* ignore */ }
  }
  // Encode origin as base64 in state so it survives the Google redirect round-trip
  const state = Buffer.from(frontendOrigin).toString("base64");
  passport.authenticate("google", { scope: ["email", "profile"], state } as any)(req, res, next);
});
router.get("/google/callback", passport.authenticate("google", { session: false }), googleCallback);

// Protected
router.get("/me", authenticate, me);

export default router;
