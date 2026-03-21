
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const userId = '4f351e46-2808-4c2a-b787-2db2bc3c2fd9';
  const stats = await prisma.matchLike.groupBy({
    by: ['status'],
    where: { fromUserId: userId },
    _count: {
      status: true
    }
  });
  console.log('Stats:');
  console.log(JSON.stringify(stats, null, 2));
}
main().finally(() => prisma.$disconnect());
