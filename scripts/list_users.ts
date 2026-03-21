
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const users = await prisma.user.findMany({ take: 5, select: { id: true, email: true, username: true } });
  console.log('Users in DB:');
  console.log(JSON.stringify(users, null, 2));

  if (users.length > 0) {
    const testUser = users[0];
    console.log(`Using test user: ${testUser.username} (${testUser.id})`);
    
    const matchCounts = await prisma.matchLike.groupBy({
      by: ['status'],
      where: { fromUserId: testUser.id },
      _count: {
        status: true
      }
    });
    console.log('MatchLike counts:');
    console.log(JSON.stringify(matchCounts, null, 2));
    
    const pendingOrMatched = await prisma.matchLike.findFirst({
      where: {
        fromUserId: testUser.id,
        status: { in: ['PENDING', 'MATCHED'] }
      }
    });
    console.log('Has PENDING or MATCHED:', !!pendingOrMatched);
  } else {
    console.log('No users found in DB.');
  }
}
main().finally(() => prisma.$disconnect());
