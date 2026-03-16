import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function run() {
  try {
    const totalUsers = await prisma.user.count();
    console.log('1. Total Users:', totalUsers);

    const recentUsers = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        skills: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 5,
    });
    console.log('\n2. Recent Users:');
    console.log(JSON.stringify(recentUsers, null, 2));

    const totalMatchLikes = await prisma.matchLike.count();
    console.log(`\n3. Total MatchLikes in DB (Since we don't have a specific userId): ${totalMatchLikes}`);

    const matchLikesGrouped = await prisma.matchLike.groupBy({
      by: ['fromUserId'],
      _count: true,
      orderBy: {
        _count: {
          fromUserId: 'desc'
        }
      },
      take: 5
    });
    console.log('\nTop 5 active switchers (MatchLikes per fromUserId):');
    console.log(JSON.stringify(matchLikesGrouped, null, 2));

  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}
run();
