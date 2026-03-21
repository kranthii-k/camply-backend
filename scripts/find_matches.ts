
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const topUsers = await prisma.matchLike.groupBy({
    by: ['fromUserId'],
    _count: {
      fromUserId: true
    },
    orderBy: {
      _count: {
        fromUserId: 'desc'
      }
    },
    take: 5
  });

  console.log('Top users by MatchLike count:');
  console.log(JSON.stringify(topUsers, null, 2));

  if (topUsers.length > 0) {
    const userId = topUsers[0].fromUserId;
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { username: true, email: true } });
    console.log(`Using user: ${user?.username} (${userId})`);
    
    const stats = await prisma.matchLike.groupBy({
      by: ['status'],
      where: { fromUserId: userId },
      _count: {
        status: true
      }
    });
    console.log('Stats:');
    console.log(JSON.stringify(stats, null, 2));
  } else {
    console.log('No MatchLike records found in the entire DB.');
  }
}
main().finally(() => prisma.$disconnect());
