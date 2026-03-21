import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // ── Users ──────────────
  // Removed dummy users (alice, bob, priya) and their passwords.


  // ── Community Chats ────────
  const rnsitChat = await prisma.chat.upsert({
    where: { id: "10000000-0000-0000-0000-000000000001" },
    update: {},
    create: {
      id: "10000000-0000-0000-0000-000000000001",
      name: "RNSIT",
      topic: "RNS Institute of Technology community",
    },
  });

  const luminousChat = await prisma.chat.upsert({
    where: { id: "10000000-0000-0000-0000-000000000002" },
    update: {},
    create: {
      id: "10000000-0000-0000-0000-000000000002",
      name: "Luminous",
      topic: "Luminous community and discussions",
    },
  });

  const startupChat = await prisma.chat.upsert({
    where: { id: "10000000-0000-0000-0000-000000000003" },
    update: {},
    create: {
      id: "10000000-0000-0000-0000-000000000003",
      name: "Startup Founders",
      topic: "Entrepreneurship and startup discussions",
    },
  });

  const projectChat = await prisma.chat.upsert({
    where: { id: "10000000-0000-0000-0000-000000000004" },
    update: {},
    create: {
      id: "10000000-0000-0000-0000-000000000004",
      name: "Project Ideas",
      topic: "Share and discover project ideas",
    },
  });



  console.log("Seed complete!");
  console.log(`
  Test accounts created successfully.
  `);

  // ── Camply Internal Jobs ─────────────────────────────────
  console.log("Seeding Camply internal jobs...");

  const camplyJobs = [
    {
      companyName: "Camply",
      companyLogo: "https://camply.live/favicon.ico",
      role: "AI Tools Expert",
      location: "Remote / RNSIT Campus",
      description: `We are looking for someone who has genuinely mastered AI-native development tools — not just dabbled in them. You will be the person on the team who knows how to get the absolute most out of Claude Code, Antigravity, Cursor, and similar agentic coding environments. You will use these tools to accelerate feature development, automate repetitive tasks, and help the team build faster without compromising quality.

**What you will do:**
- Use AI coding tools (Claude Code, Antigravity, Cursor) to ship features at 10x speed
- Build and maintain AI-assisted workflows for the Camply engineering team
- Evaluate and integrate new AI tools as they emerge
- Document best practices and train teammates on effective tool usage

**What we expect:**
- Deep, hands-on experience with at least 2 of: Claude Code, Cursor, Antigravity, Windsurf, or equivalent agentic coding tools
- Ability to prompt engineer effectively for large codebases
- Understanding of how to break down complex features into AI-executable tasks
- Strong judgment on when AI helps vs. when it hurts code quality`,
      compensationType: "Performance-based stipend + Equity perks",
      compensationNote: "No fixed salary is guaranteed at this stage. Compensation is performance-based and reviewed every 30 days. Minimum commitment of 21 working days required before any evaluation.",
      perks: [
        "Access to premium AI tools (Claude Pro, Cursor Pro, etc.)",
        "Direct connection to RNSIT Incubation Centre",
        "Support in getting your future projects incubated",
        "Real startup experience with full ownership of your domain",
        "Letter of recommendation after successful engagement"
      ],
      requirements: [
        "Currently enrolled in B.E. or B.Tech in Computer Science or sister branch (IT, ECE, etc.)",
        "No active backlogs",
        "Proven experience with AI coding tools — portfolio or demos required",
        "Available for minimum 21 working days"
      ],
      applyEmail: "contact@camply.live",
      applySubject: "Application — AI Tools Expert @ Camply",
      source: "CAMPLY_INTERNAL" as const,
      status: "ACTIVE" as const,
      isPinned: true,
    },
    {
      companyName: "Camply",
      companyLogo: "https://camply.live/favicon.ico",
      role: "AI Automation Engineer",
      location: "Remote / RNSIT Campus",
      description: `We are looking for someone who thinks in workflows and agents — not just code. You will design and maintain automated pipelines that power Camply's internal operations and user-facing features using AI agents, n8n, and similar automation platforms.

**What you will do:**
- Design and deploy AI agent workflows using n8n, Zapier, Make, or custom solutions
- Automate internal Camply processes (notifications, data pipelines, moderation queues)
- Explore agentic AI capabilities and integrate them into the product
- Monitor, debug, and improve existing automation pipelines

**What we expect:**
- Hands-on experience with at least one workflow automation tool (n8n strongly preferred)
- Understanding of AI agent architectures (tool calling, multi-step reasoning, memory)
- Ability to connect APIs, webhooks, and databases into coherent automated systems
- Comfort working with LLM APIs (OpenAI, Anthropic, etc.)`,
      compensationType: "Performance-based stipend + Equity perks",
      compensationNote: "No fixed salary is guaranteed at this stage. Compensation is performance-based and reviewed every 30 days. Minimum commitment of 21 working days required before any evaluation.",
      perks: [
        "Access to premium AI tools and automation platform subscriptions",
        "Direct connection to RNSIT Incubation Centre",
        "Support in getting your future projects incubated",
        "Real startup experience building automation systems from scratch",
        "Letter of recommendation after successful engagement"
      ],
      requirements: [
        "Currently enrolled in B.E. or B.Tech in Computer Science or sister branch (IT, ECE, etc.)",
        "No active backlogs",
        "Demonstrable experience with AI workflows or automation tools",
        "Available for minimum 21 working days"
      ],
      applyEmail: "contact@camply.live",
      applySubject: "Application — AI Automation Engineer @ Camply",
      source: "CAMPLY_INTERNAL" as const,
      status: "ACTIVE" as const,
      isPinned: true,
    },
    {
      companyName: "Camply",
      companyLogo: "https://camply.live/favicon.ico",
      role: "Backend Engineer",
      location: "Remote / RNSIT Campus",
      description: `We are looking for a backend engineer who reasons from first principles — not someone who copy-pastes Stack Overflow and hopes for the best. You will own significant parts of the Camply backend (Node.js, Express, PostgreSQL, Prisma, Redis, Socket.IO) and must be comfortable navigating a production codebase under real constraints.

**What you will do:**
- Design and implement new backend features end-to-end (schema → controller → route → tests)
- Optimize existing queries and caching strategies for scale
- Maintain API contracts and ensure zero regressions on existing behavior
- Write production-grade code with proper error handling, logging, and validation
- Participate in architecture decisions with clear reasoning

**What we expect:**
- Strong fundamentals: HTTP, databases, auth patterns, async/await, error handling
- Experience with Node.js + TypeScript (or strong willingness to ramp fast)
- Ability to read and contribute to an existing codebase without hand-holding
- Understanding of relational databases and ORM patterns (Prisma or similar)
- First-principles thinking — you can explain WHY a design decision is correct`,
      compensationType: "Performance-based stipend + Equity perks",
      compensationNote: "No fixed salary is guaranteed at this stage. Compensation is performance-based and reviewed every 30 days. Minimum commitment of 21 working days required before any evaluation.",
      perks: [
        "Work on a real production backend serving real users",
        "Direct connection to RNSIT Incubation Centre",
        "Support in getting your future projects incubated",
        "Mentorship on production engineering practices",
        "Letter of recommendation after successful engagement"
      ],
      requirements: [
        "Currently enrolled in B.E. or B.Tech in Computer Science or sister branch (IT, ECE, etc.)",
        "No active backlogs",
        "Solid understanding of backend fundamentals (not just tutorials)",
        "Available for minimum 21 working days"
      ],
      applyEmail: "contact@camply.live",
      applySubject: "Application — Backend Engineer @ Camply",
      source: "CAMPLY_INTERNAL" as const,
      status: "ACTIVE" as const,
      isPinned: true,
    },
  ];

  for (const job of camplyJobs) {
    await prisma.job.upsert({
      where: {
        // upsert by companyName + role to avoid duplicates on re-seed
        companyName_role: { companyName: job.companyName, role: job.role },
      },
      update: { ...job },
      create: { ...job },
    });
  }
  console.log("✅ Camply jobs seeded.");

  // ── Partner Tests (Ed-tech platform cards) ───────────────
  console.log("Seeding partner tests...");

  const partnerTests = [
    {
      platformName: "LeetCode",
      logoUrl: "https://leetcode.com/favicon-32x32.png",
      title: "LeetCode Weekly Contest",
      description: "Solve 4 algorithmic problems in 90 minutes. Weekly contests run every Sunday at 8:00 AM IST. Problems range from easy warm-ups to hard system-level challenges. Your global ranking updates live. Perfect for placement prep and competitive programming practice.",
      testLink: "https://leetcode.com/contest/",
      registrationLink: "https://leetcode.com/accounts/signup/",
      isActive: true,
      priority: 100,
    },
    {
      platformName: "HackerEarth",
      logoUrl: "https://www.hackerearth.com/favicon.ico",
      title: "HackerEarth Sprint",
      description: "Monthly competitive programming sprints with real company-style problems. Contests are rated and track your performance over time. Many companies recruit directly from top performers on HackerEarth sprints. Registration is free.",
      testLink: "https://www.hackerearth.com/challenges/",
      registrationLink: "https://www.hackerearth.com/users/register/",
      isActive: true,
      priority: 90,
    },
    {
      platformName: "GeeksForGeeks",
      logoUrl: "https://www.geeksforgeeks.org/favicon.ico",
      title: "GFG Weekly Coding Contest",
      description: "Weekly contests on GeeksForGeeks covering data structures, algorithms, and aptitude. Designed specifically for Indian college students targeting campus placements. Detailed editorials available after each contest to help you learn from mistakes.",
      testLink: "https://practice.geeksforgeeks.org/contests",
      registrationLink: "https://auth.geeksforgeeks.org/user/login",
      isActive: true,
      priority: 80,
    },
    {
      platformName: "CodeChef",
      logoUrl: "https://www.codechef.com/favicon.ico",
      title: "CodeChef Starters",
      description: "Bi-weekly rated contests for all skill levels — from Division 4 (beginner) to Division 1 (expert). CodeChef Starters run every Wednesday evening IST. A great starting point if you are new to competitive programming but want structured progression.",
      testLink: "https://www.codechef.com/contests",
      registrationLink: "https://www.codechef.com/register",
      isActive: true,
      priority: 70,
    },
  ];

  for (const test of partnerTests) {
    await prisma.partnerTest.upsert({
      where: {
        // upsert by platformName + title
        platformName_title: { platformName: test.platformName, title: test.title },
      },
      update: { ...test },
      create: { ...test },
    });
  }
  console.log("✅ Partner tests seeded.");

  // ── Placement Experiences ────────────────────────────────
  console.log("Seeding placement experience posts...");

  const placementPosts = [
    {
      company: "Google",
      companyLogo: "https://www.google.com/favicon.ico",
      role: "Software Engineer I",
      package: "₹62 LPA",
      location: "Bangalore",
      difficulty: "HARD" as const,
      type: "INTERVIEW" as const,
      college: "IIT Delhi",
      tags: ["DSA", "System Design", "Behavioral"],
      preview: "3 rounds — Online test, Technical interviews covering trees, graphs, and system design for a URL shortener.",

    },
    {
      company: "Microsoft",
      companyLogo: "https://www.microsoft.com/favicon.ico",
      role: "Product Manager I",
      package: "₹38 LPA",
      location: "Hyderabad",
      difficulty: "MEDIUM" as const,
      type: "GROUP_DISCUSSION" as const,
      college: "BITS Pilani",
      tags: ["Product Strategy", "Analytics", "Communication"],
      preview: "Case study on improving Microsoft Teams user engagement. Focus on data-driven decisions and user research.",

    },
    {
      company: "Amazon",
      companyLogo: "https://www.amazon.com/favicon.ico",
      role: "SDE I",
      package: "₹28 LPA",
      location: "Chennai",
      difficulty: "HARD" as const,
      type: "ONLINE_TEST" as const,
      college: "IIT Madras",
      tags: ["Algorithms", "OOP", "AWS"],
      preview: "4-hour coding challenge with dynamic programming, graph algorithms, and AWS service integration questions.",

    },
    {
      company: "Flipkart",
      companyLogo: "https://logos-world.net/wp-content/uploads/2020/11/Flipkart-Logo.png",
      role: "UI/UX Designer",
      package: "₹12 LPA",
      location: "Bangalore",
      difficulty: "MEDIUM" as const,
      type: "INTERVIEW" as const,
      college: "NID Ahmedabad",
      tags: ["Figma", "User Research", "Prototyping"],
      preview: "Portfolio review, design challenge to improve Flipkart's checkout flow, and discussion on design thinking.",

    },
    {
      company: "Zomato",
      companyLogo: "https://www.zomato.com/favicon.ico",
      role: "Data Analyst",
      package: "₹8 LPA",
      location: "Delhi",
      difficulty: "EASY" as const,
      type: "ONLINE_TEST" as const,
      college: "Delhi University",
      tags: ["SQL", "Python", "Tableau"],
      preview: "SQL queries for restaurant data analysis, Python scripting for data cleaning, and dashboard creation.",

    },
    {
      company: "Oracle",
      companyLogo: "https://logos-world.net/wp-content/uploads/2020/09/Oracle-Logo.png",
      role: "Database Administrator",
      package: "₹22 LPA",
      location: "Hyderabad",
      difficulty: "MEDIUM" as const,
      type: "INTERVIEW" as const,
      college: "NIT Trichy",
      tags: ["SQL", "DBA", "Cloud"],
      preview: "Two technical rounds focused on database architecture, recovery strategies, and cloud migration (OCI).",

    },
  ];

  for (const post of placementPosts) {
    // Upsert by company + role + college to avoid duplicates on re-seed
    const existing = await prisma.placementPost.findFirst({
      where: { company: post.company, role: post.role, college: post.college },
    });
    if (!existing) {
      await prisma.placementPost.create({ data: post });
    }
  }
  console.log("✅ Placement posts seeded.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
