
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const alice = await prisma.user.findUnique({
    where: { email: 'alice@example.com' }
  });

  if (!alice) {
    console.log('Alice not found');
    return;
  }

  console.log(`Alice ID: ${alice.id}`);

  const matchCounts = await prisma.matchLike.groupBy({
    by: ['status'],
    where: { fromUserId: alice.id },
    _count: {
      status: true
    }
  });

  console.log('MatchLike counts for Alice:');
  console.log(JSON.stringify(matchCounts, null, 2));

  // Check if any PENDING or MATCHED
  const pendingOrMatched = await prisma.matchLike.findFirst({
    where: {
      fromUserId: alice.id,
      status: { in: ['PENDING', 'MATCHED'] }
    }
  });

  console.log('Has PENDING or MATCHED:', !!pendingOrMatched);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
