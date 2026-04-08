"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * app.ts
 *
 * NOTE: Route registration order is CRITICAL here.
 * The Razorpay webhook route MUST be registered BEFORE the express.json()
 * and express.urlencoded() middleware. This ensures it receives the
 * raw request body for HMAC-SHA256 signature verification.
 */
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_rate_limit_1 = require("express-rate-limit");
const rate_limit_redis_1 = require("rate-limit-redis");
const redis_1 = require("./config/redis");
const logger_1 = __importDefault(require("./config/logger"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const post_routes_1 = __importDefault(require("./routes/post.routes"));
const match_routes_1 = __importDefault(require("./routes/match.routes"));
const team_routes_1 = __importDefault(require("./routes/team.routes"));
const chat_routes_1 = __importDefault(require("./routes/chat.routes"));
const upload_routes_1 = __importDefault(require("./routes/upload.routes"));
const job_routes_1 = __importDefault(require("./routes/job.routes"));
const partnerTest_routes_1 = __importDefault(require("./routes/partnerTest.routes"));
const placement_routes_1 = __importDefault(require("./routes/placement.routes"));
const payment_routes_1 = __importDefault(require("./routes/payment.routes"));
const hackathon_routes_1 = __importDefault(require("./routes/hackathon.routes"));
const notification_routes_1 = __importDefault(require("./routes/notification.routes"));
const hostedEvent_routes_1 = __importDefault(require("./routes/hostedEvent.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const passport_1 = __importDefault(require("./config/passport"));
const express_session_1 = __importDefault(require("express-session"));
const connect_redis_1 = __importDefault(require("connect-redis"));
const error_middleware_1 = require("./middleware/error.middleware");
const notFound_middleware_1 = require("./middleware/notFound.middleware");
const app = (0, express_1.default)();
// ✅ Trust Railway/Render/Vercel proxy — MUST be before rate limiter
app.set("trust proxy", 1);
// ─── Security ───────────────────────────────────────────
app.use((0, helmet_1.default)());
app.use(passport_1.default.initialize());
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:8080,http://localhost:5173")
    .split(",")
    .map((o) => o.trim().replace(/\/$/, ""));
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin)
            return callback(null, true);
        if (process.env.NODE_ENV !== "production")
            return callback(null, true);
        const clean = origin.replace(/\/$/, "");
        if (allowedOrigins.includes(clean)) {
            callback(null, true);
        }
        else {
            logger_1.default.error(`CORS blocked: ${origin}`);
            callback(new Error(`CORS: ${origin} not allowed`));
        }
    },
    credentials: true,
}));
// ─── Rate limiting ───────────────────────────────────────
const limiter = (0, express_rate_limit_1.rateLimit)({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: { message: "Too many requests, please slow down." } },
    store: new rate_limit_redis_1.RedisStore({
        sendCommand: (...args) => redis_1.redisClient.sendCommand(args),
    }),
});
app.use(limiter);
// ─── Body / cookie parsing ───────────────────────────────
// CRITICAL: Webhook routes must be registered BEFORE express.json()
// to receive the raw body for signature verification.
app.use("/api/v1/payments/webhook", express_1.default.raw({ type: 'application/json' }), (req, res, next) => {
    req.rawBody = req.body.toString();
    next();
});
app.use(express_1.default.json({ limit: "10mb" }));
app.use(express_1.default.urlencoded({ extended: true }));
// Session for Admin Panel
app.use((0, express_session_1.default)({
    store: new connect_redis_1.default({
        client: redis_1.redisClient,
        prefix: "camply:sess:",
    }),
    secret: process.env.SESSION_SECRET || "camply-admin-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24, // 24 hours
    },
}));
app.use((0, cookie_parser_1.default)());
// ─── Logging ────────────────────────────────────────────
if (process.env.NODE_ENV !== "test") {
    app.use((0, morgan_1.default)(process.env.NODE_ENV === "production" ? "combined" : "dev"));
}
// ─── Health check ────────────────────────────────────────
app.get("/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});
// ─── Routes ──────────────────────────────────────────────
app.use("/api/v1/auth", auth_routes_1.default);
app.use("/api/v1/users", user_routes_1.default);
app.use("/api/v1/posts", post_routes_1.default);
app.use("/api/v1/match", match_routes_1.default);
app.use("/api/v1/teams", team_routes_1.default);
app.use("/api/v1/chats", chat_routes_1.default);
app.use("/api/v1/upload", upload_routes_1.default);
app.use("/api/v1/jobs", job_routes_1.default);
app.use("/api/v1/partner-tests", partnerTest_routes_1.default);
app.use("/api/v1/placements", placement_routes_1.default);
app.use("/api/v1/payments", payment_routes_1.default);
app.use("/api/v1/hackathons", hackathon_routes_1.default);
app.use("/api/v1/notifications", notification_routes_1.default);
app.use("/api/v1/events", hostedEvent_routes_1.default);
app.use("/admin", admin_routes_1.default);
// ─── Error handling ──────────────────────────────────────
app.use(notFound_middleware_1.notFound);
app.use(error_middleware_1.errorHandler);
exports.default = app;
//# sourceMappingURL=app.js.map