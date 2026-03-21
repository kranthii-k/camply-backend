/**
 * app.ts
 *
 * NOTE: Route registration order is CRITICAL here.
 * The Razorpay webhook route MUST be registered BEFORE the express.json() 
 * and express.urlencoded() middleware. This ensures it receives the 
 * raw request body for HMAC-SHA256 signature verification.
 */
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { rateLimit } from "express-rate-limit";
import { RedisStore as RateLimitRedisStore } from "rate-limit-redis";
import { redisClient } from "./config/redis";
import logger from "./config/logger";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import postRoutes from "./routes/post.routes";
import matchRoutes from "./routes/match.routes";
import teamRoutes from "./routes/team.routes";
import chatRoutes from "./routes/chat.routes";
import uploadRoutes from "./routes/upload.routes";
import jobRoutes from "./routes/job.routes";
import partnerTestRoutes from "./routes/partnerTest.routes";
import placementRoutes from "./routes/placement.routes";
import paymentRoutes from "./routes/payment.routes";
import hackathonRoutes from "./routes/hackathon.routes";
import notificationRoutes from "./routes/notification.routes";
import eventRoutes from "./routes/hostedEvent.routes";
import adminRoutes from "./routes/admin.routes";

import passport from "./config/passport";
import session from "express-session";
import RedisStore from "connect-redis";

import { errorHandler } from "./middleware/error.middleware";
import { notFound } from "./middleware/notFound.middleware";

const app = express();

// ✅ Trust Railway/Render/Vercel proxy — MUST be before rate limiter
app.set("trust proxy", 1);

// ─── Security ───────────────────────────────────────────
app.use(helmet());
app.use(passport.initialize());

const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:8080,http://localhost:5173")
  .split(",")
  .map((o) => o.trim().replace(/\/$/, ""));

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (process.env.NODE_ENV !== "production") return callback(null, true);
      const clean = origin.replace(/\/$/, "");
      if (allowedOrigins.includes(clean)) {
        callback(null, true);
      } else {
        logger.error(`CORS blocked: ${origin}`);
        callback(new Error(`CORS: ${origin} not allowed`));
      }
    },
    credentials: true,
  })
);

// ─── Rate limiting ───────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { message: "Too many requests, please slow down." } },
  store: new RateLimitRedisStore({
    sendCommand: (...args: string[]) => redisClient.sendCommand(args),
  }),
});
app.use(limiter);


// ─── Body / cookie parsing ───────────────────────────────
// CRITICAL: Webhook routes must be registered BEFORE express.json()
// to receive the raw body for signature verification.
app.use("/api/v1/payments/webhook", express.raw({ type: 'application/json' }), (req, res, next) => {
  (req as any).rawBody = req.body.toString();
  next();
});

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Session for Admin Panel
app.use(
  session({
    store: new RedisStore({
      client: redisClient as any,
      prefix: "camply:sess:",
    }) as any,
    secret: process.env.SESSION_SECRET || "camply-admin-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24, // 24 hours
    },
  })
);
app.use(cookieParser());

// Load Razorpay SDK type definitions (Requested in Phase 15)
declare global {
  interface Window {
    Razorpay: any;
  }
}

// ─── Logging ────────────────────────────────────────────
if (process.env.NODE_ENV !== "test") {
  app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
}

// ─── Health check ────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ─── Routes ──────────────────────────────────────────────
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/posts", postRoutes);
app.use("/api/v1/match", matchRoutes);
app.use("/api/v1/teams", teamRoutes);
app.use("/api/v1/chats", chatRoutes);
app.use("/api/v1/upload", uploadRoutes);
app.use("/api/v1/jobs", jobRoutes);
app.use("/api/v1/partner-tests", partnerTestRoutes);
app.use("/api/v1/placements", placementRoutes);
app.use("/api/v1/payments", paymentRoutes);
app.use("/api/v1/hackathons", hackathonRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/events", eventRoutes);
app.use("/admin", adminRoutes);

// ─── Error handling ──────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

export default app;