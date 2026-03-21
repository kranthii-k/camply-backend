// @ts-nocheck
import process from "process";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding default chats...");

  // Find RNSIT chat (assuming it exists by name or another property)
  const rnsitChat = await prisma.chat.findFirst({
    where: { name: { contains: "RNSIT", mode: "insensitive" } }
  });

  if (rnsitChat) {
    await prisma.chat.update({
      where: { id: rnsitChat.id },
      data: { isDefault: true }
    });
    console.log(`Updated chat ${rnsitChat.name} to be default.`);
  } else {
    // Create it if not exists
    await prisma.chat.create({
      data: {
        name: "RNSIT Community",
        topic: "General discussion for RNSIT students",
        isDefault: true
      }
    });
    console.log("Created default RNSIT chat.");
  }

  console.log("Seeding complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
