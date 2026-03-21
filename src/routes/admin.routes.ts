import { Router, Request, Response } from "express";
import { prisma } from "../config/prisma";
import * as path from "path";
import * as crypto from "crypto";
import { sendSuccess, sendError } from "../utils/apiResponse";

const router = Router();

// Middleware to check admin session
export const adminAuth = (req: Request, res: Response, next: any) => {
  if ((req.session as any).isAdmin) {
    next();
  } else {
    // If it's a JSON request (API), return 401
    if (req.headers.accept?.includes("application/json")) {
      return res.status(401).json({ success: false, error: "Admin session required" });
    }
    // Otherwise redirect to login (or just serve the page which handles login)
    res.redirect("/admin/login-page");
  }
};

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
    (req.session as any).isAdmin = true;
    res.redirect("/admin/dashboard");
  } else {
    res.status(401).send("Invalid credentials");
  }
});

router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/admin/login-page");
  });
});

// Admin Dashboard
router.get("/dashboard", adminAuth, (req, res) => {
  res.sendFile(path.join(__dirname, "../public/admin.html"));
});

// API Routes for Admin Panel
router.get("/api/stats", adminAuth, async (req, res) => {
  const [users, proUsers, activeJobs, pendingEvents] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { isPro: true } }),
    prisma.job.count({ where: { status: "ACTIVE" } }),
    prisma.hostedEvent.count({ where: { status: "PENDING" } }),
  ]);
  sendSuccess(res, { stats: { users, proUsers, activeJobs, pendingEvents } });
});

export default router;
