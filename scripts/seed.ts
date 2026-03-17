import "dotenv/config";
import { PrismaClient, PostCategory, TrustLevel } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // ── Users ──────────────
  const passwordHash = await bcrypt.hash("Password123", 12);

  const alice = await prisma.user.upsert({
    where: { email: "alice@example.com" },
    update: {},
    create: {
      name: "Alice Kumar",
      username: "alicek",
      email: "alice@example.com",
      passwordHash,
      bio: "Full-stack dev | Hackathon enthusiast",
      college: "IIT Bangalore",
      skills: ["React", "Node.js", "TypeScript"],
      trustLevel: TrustLevel.GOLD,
      trustScore: 210,
    },
  });

  const bob = await prisma.user.upsert({
    where: { email: "bob@example.com" },
    update: {},
    create: {
      name: "Bob Sharma",
      username: "bobs",
      email: "bob@example.com",
      passwordHash,
      bio: "ML engineer | Pytorch & TensorFlow",
      college: "NIT Trichy",
      skills: ["Python", "PyTorch", "TensorFlow", "FastAPI"],
      trustLevel: TrustLevel.SILVER,
      trustScore: 80,
    },
  });

  const priya = await prisma.user.upsert({
    where: { email: "priya@example.com" },
    update: {},
    create: {
      name: "Priya Nair",
      username: "priyan",
      email: "priya@example.com",
      passwordHash,
      bio: "UI/UX designer & frontend dev",
      college: "BITS Pilani",
      skills: ["Figma", "React", "Tailwind CSS"],
      trustLevel: TrustLevel.BRONZE,
      trustScore: 15,
    },
  });

  // ── Posts ──────────
  await prisma.post.createMany({
    data: [
      {
        content:
          "Looking for React + ML teammates for the upcoming HackBangalore 2025! DM me if interested 🚀",
        category: PostCategory.DISCUSSION,
        authorId: alice.id,
      },
      {
        content:
          "QUERY: Best way to handle auth with JWT refresh tokens in a React SPA? Cookie vs localStorage?",
        category: PostCategory.QUERY,
        authorId: bob.id,
      },
      {
        content:
          "SOLUTION: Use httpOnly cookies for refresh tokens and in-memory for access tokens. Here's why...",
        category: PostCategory.SOLUTION,
        authorId: alice.id,
      },
      {
        content:
          "JOB: Intern opening at my startup — 2-month remote internship, React + Node. College students preferred!",
        category: PostCategory.JOB,
        authorId: priya.id,
      },
    ],
    skipDuplicates: true,
  });

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

  // Seed welcome messages per room
  await prisma.message.createMany({
    data: [
      // RNSIT
      { content: "Welcome to the RNSIT community chat! 👋", chatId: rnsitChat.id, senderId: alice.id },
      { content: "Great place to connect with fellow RNSITians 🎓", chatId: rnsitChat.id, senderId: alice.id },
      { content: "Share updates, events, and anything RNSIT-related here!", chatId: rnsitChat.id, senderId: alice.id },
      // Luminous
      { content: "Welcome to the Luminous chat! ✨", chatId: luminousChat.id, senderId: alice.id },
      { content: "Connect with the Luminous community here 🤝", chatId: luminousChat.id, senderId: alice.id },
      // Startup Founders
      { content: "Welcome, founders! 🚀 Let's build something great.", chatId: startupChat.id, senderId: alice.id },
      { content: "Share your startup journey, find co-founders, and get feedback here!", chatId: startupChat.id, senderId: alice.id },
      // Project Ideas
      { content: "Welcome to Project Ideas! 💡", chatId: projectChat.id, senderId: alice.id },
      { content: "Got a cool project idea? Share it here and find collaborators!", chatId: projectChat.id, senderId: alice.id },
    ],
    skipDuplicates: true,
  });

  console.log("Seed complete!");
  console.log(`
  Test accounts created successfully.
  `);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
