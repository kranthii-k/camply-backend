"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminAuth = void 0;
const express_1 = require("express");
const prisma_1 = require("../config/prisma");
const path = __importStar(require("path"));
const crypto = __importStar(require("crypto"));
const apiResponse_1 = require("../utils/apiResponse");
const router = (0, express_1.Router)();
// Middleware to check admin session
const adminAuth = (req, res, next) => {
    if (req.session.isAdmin) {
        next();
    }
    else {
        // If it's a JSON request (API), return 401
        if (req.headers.accept?.includes("application/json")) {
            return res.status(401).json({ success: false, error: "Admin session required" });
        }
        // Otherwise redirect to login (or just serve the page which handles login)
        res.redirect("/admin/login-page");
    }
};
exports.adminAuth = adminAuth;
// Login Page (Just a simple HTML or handled in admin.html)
router.get("/login-page", (req, res) => {
    res.send(`
    <html>
      <body style="background: #0f172a; color: white; display: flex; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif;">
        <form action="/admin/login" method="POST" style="background: #1e293b; padding: 2rem; border-radius: 8px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
          <h2>Camply Admin Login</h2>
          <div style="margin-bottom: 1rem;">
            <label>Username</label><br/>
            <input type="text" name="username" style="width: 100%; padding: 0.5rem; background: #0f172a; border: 1px solid #334155; color: white; border-radius: 4px;"/>
          </div>
          <div style="margin-bottom: 1rem;">
            <label>Password</label><br/>
            <input type="password" name="password" style="width: 100%; padding: 0.5rem; background: #0f172a; border: 1px solid #334155; color: white; border-radius: 4px;"/>
          </div>
          <button type="submit" style="width: 100%; padding: 0.5rem; background: #3b82f6; border: none; color: white; border-radius: 4px; cursor: pointer;">Login</button>
        </form>
      </body>
    </html>
  `);
});
// Auth Route
router.post("/login", (req, res) => {
    const { username, password } = req.body;
    // Timing-safe comparison would be better if we had many admins, 
    // but for one env-based admin:
    const envUser = process.env.ADMIN_USERNAME;
    const envPass = process.env.ADMIN_PASSWORD;
    if (!envUser || !envPass) {
        return res.status(500).send("Admin credentials not configured in environment");
    }
    // Use crypto.timingSafeEqual for security
    const userMatch = crypto.timingSafeEqual(Buffer.from(username), Buffer.from(envUser));
    const passMatch = crypto.timingSafeEqual(Buffer.from(password), Buffer.from(envPass));
    if (userMatch && passMatch) {
        req.session.isAdmin = true;
        res.redirect("/admin/dashboard");
    }
    else {
        res.status(401).send("Invalid credentials");
    }
});
router.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/admin/login-page");
    });
});
// Admin Dashboard
router.get("/dashboard", exports.adminAuth, (req, res) => {
    res.sendFile(path.join(__dirname, "../public/admin.html"));
});
// API Routes for Admin Panel
router.get("/api/stats", exports.adminAuth, async (req, res) => {
    const [users, proUsers, activeJobs, pendingEvents] = await Promise.all([
        prisma_1.prisma.user.count(),
        prisma_1.prisma.user.count({ where: { isPro: true } }),
        prisma_1.prisma.job.count({ where: { status: "ACTIVE" } }),
        prisma_1.prisma.hostedEvent.count({ where: { status: "PENDING" } }),
    ]);
    (0, apiResponse_1.sendSuccess)(res, { stats: { users, proUsers, activeJobs, pendingEvents } });
});
exports.default = router;
//# sourceMappingURL=admin.routes.js.map