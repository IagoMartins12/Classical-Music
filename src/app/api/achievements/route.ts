// // app/api/achievements/route.ts - API para criar/listar conquistas
// import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';
// import { auth } from '@/lib/auth';

// export async function POST(request: NextRequest) {
//   try {
//     const session = await auth();
//     if (!session?.user?.id) {
//       return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
//     }

//     const body = await request.json();
//     const {
//       badgeId,
//       name,
//       description,
//       category,
//       rarity,
//       progress,
//       maxProgress,
//     } = body;

//     // Verificar se já existe
//     const existing = await prisma.userAchievement.findUnique({
//       where: {
//         userId_badgeId: {
//           userId: session.user.id,
//           badgeId: badgeId,
//         },
//       },
//     });

//     if (existing) {
//       return NextResponse.json(
//         { error: 'Conquista já desbloqueada' },
//         { status: 400 }
//       );
//     }

//     // Calcular XP baseado na raridade
//     const xpRewards = {
//       common: 10,
//       rare: 25,
//       epic: 50,
//       legendary: 100,
//     };
//     const xpReward = xpRewards[rarity as keyof typeof xpRewards] || 10;

//     // Criar conquista
//     const achievement = await prisma.userAchievement.create({
//       data: {
//         userId: session.user.id,
//         badgeId,
//         name,
//         description,
//         category,
//         rarity,
//         progress,
//         maxProgress,
//         xpReward,
//       },
//     });

//     // Atualizar XP total do usuário (cache)
//     await prisma.user.update({
//       where: { id: session.user.id },
//       data: {
//         // Assumindo que você tem um campo totalXP no User
//         // totalXP: { increment: xpReward },
//       },
//     });

//     console.log(
//       `🏆 [API] Conquista desbloqueada: ${name} (+${xpReward}XP) para usuário ${session.user.id}`
//     );

//     return NextResponse.json({
//       success: true,
//       achievement,
//       xpReward,
//     });
//   } catch (error) {
//     console.error('Erro ao criar conquista:', error);
//     return NextResponse.json(
//       { error: 'Erro interno do servidor' },
//       { status: 500 }
//     );
//   }
// }

// export async function GET(request: NextRequest) {
//   try {
//     const session = await auth();
//     if (!session?.user?.id) {
//       return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
//     }

//     const { searchParams } = new URL(request.url);
//     const category = searchParams.get('category');
//     const rarity = searchParams.get('rarity');
//     const isNew = searchParams.get('isNew');

//     const whereClause: any = {
//       userId: session.user.id,
//     };

//     if (category) whereClause.category = category;
//     if (rarity) whereClause.rarity = rarity;
//     if (isNew) whereClause.isNew = isNew === 'true';

//     const achievements = await prisma.userAchievement.findMany({
//       where: whereClause,
//       orderBy: { unlockedAt: 'desc' },
//     });

//     // Calcular XP total
//     const totalXP = achievements.reduce(
//       (sum, achievement) => sum + achievement.xpReward,
//       0
//     );

//     // Estatísticas
//     const stats = {
//       total: achievements.length,
//       byRarity: {
//         common: achievements.filter((a) => a.rarity === 'common').length,
//         rare: achievements.filter((a) => a.rarity === 'rare').length,
//         epic: achievements.filter((a) => a.rarity === 'epic').length,
//         legendary: achievements.filter((a) => a.rarity === 'legendary').length,
//       },
//       byCategory: achievements.reduce((acc, achievement) => {
//         acc[achievement.category] = (acc[achievement.category] || 0) + 1;
//         return acc;
//       }, {} as Record<string, number>),
//       recentCount: achievements.filter((a) => {
//         const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
//         return new Date(a.unlockedAt) >= sevenDaysAgo;
//       }).length,
//     };

//     return NextResponse.json({
//       success: true,
//       achievements,
//       totalXP,
//       stats,
//     });
//   } catch (error) {
//     console.error('Erro ao buscar conquistas:', error);
//     return NextResponse.json(
//       { error: 'Erro interno do servidor' },
//       { status: 500 }
//     );
//   }
// }

// // app/api/achievements/[id]/viewed/route.ts - Marcar conquista como visualizada
// import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';
// import { auth } from '@/lib/auth';

// export async function PATCH(
//   request: NextRequest,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     const session = await auth();
//     if (!session?.user?.id) {
//       return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
//     }

//     const achievementId = params.id;

//     // Verificar se a conquista pertence ao usuário
//     const achievement = await prisma.userAchievement.findFirst({
//       where: {
//         id: achievementId,
//         userId: session.user.id,
//       },
//     });

//     if (!achievement) {
//       return NextResponse.json(
//         { error: 'Conquista não encontrada' },
//         { status: 404 }
//       );
//     }

//     // Marcar como visualizada
//     const updated = await prisma.userAchievement.update({
//       where: { id: achievementId },
//       data: {
//         isNew: false,
//         lastViewedAt: new Date(),
//       },
//     });

//     return NextResponse.json({ success: true, achievement: updated });
//   } catch (error) {
//     console.error('Erro ao marcar conquista como visualizada:', error);
//     return NextResponse.json(
//       { error: 'Erro interno do servidor' },
//       { status: 500 }
//     );
//   }
// }

// // app/api/users/[userId]/achievements/route.ts - Buscar conquistas de um usuário específico
// import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';
// import { auth } from '@/lib/auth';

// export async function GET(
//   request: NextRequest,
//   { params }: { params: { userId: string } }
// ) {
//   try {
//     const session = await auth();
//     const targetUserId = params.userId;

//     // Verificar autorização - usuário só pode ver próprias conquistas ou se for admin
//     if (session?.user?.id !== targetUserId && session?.user?.role !== 2) {
//       return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
//     }

//     // Buscar conquistas
//     const achievements = await prisma.userAchievement.findMany({
//       where: { userId: targetUserId },
//       orderBy: { unlockedAt: 'desc' },
//     });

//     // Buscar progresso
//     const progress = await prisma.achievementProgress.findMany({
//       where: { userId: targetUserId },
//     });

//     // Converter progress para objeto
//     const progressMap = progress.reduce((acc, p) => {
//       acc[p.badgeId] = {
//         badgeId: p.badgeId,
//         currentValue: p.currentValue,
//         lastCheckedAt: p.lastCheckedAt.toISOString(),
//         lastProgressUpdate: p.lastProgressUpdate?.toISOString(),
//       };
//       return acc;
//     }, {} as Record<string, any>);

//     // Calcular XP total
//     const totalXP = achievements.reduce(
//       (sum, achievement) => sum + achievement.xpReward,
//       0
//     );

//     return NextResponse.json({
//       success: true,
//       achievements: achievements.map((a) => ({
//         ...a,
//         unlockedAt: a.unlockedAt.toISOString(),
//         notificationShownAt: a.notificationShownAt?.toISOString(),
//         lastViewedAt: a.lastViewedAt?.toISOString(),
//       })),
//       progress: progressMap,
//       totalXP,
//     });
//   } catch (error) {
//     console.error('Erro ao buscar conquistas do usuário:', error);
//     return NextResponse.json(
//       { error: 'Erro interno do servidor' },
//       { status: 500 }
//     );
//   }
// }

// // app/api/achievements/progress/route.ts - Atualizar progresso das conquistas
// import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';
// import { auth } from '@/lib/auth';

// export async function POST(request: NextRequest) {
//   try {
//     const session = await auth();
//     if (!session?.user?.id) {
//       return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
//     }

//     const body = await request.json();
//     const { badgeId, currentValue } = body;

//     // Upsert progress
//     const progress = await prisma.achievementProgress.upsert({
//       where: {
//         userId_badgeId: {
//           userId: session.user.id,
//           badgeId: badgeId,
//         },
//       },
//       update: {
//         currentValue,
//         lastProgressUpdate: new Date(),
//         lastCheckedAt: new Date(),
//       },
//       create: {
//         userId: session.user.id,
//         badgeId,
//         currentValue,
//       },
//     });

//     return NextResponse.json({ success: true, progress });
//   } catch (error) {
//     console.error('Erro ao atualizar progresso:', error);
//     return NextResponse.json(
//       { error: 'Erro interno do servidor' },
//       { status: 500 }
//     );
//   }
// }

// // app/api/achievements/leaderboard/route.ts - Leaderboard de conquistas (opcional)
// export async function GET(request: NextRequest) {
//   try {
//     const { searchParams } = new URL(request.url);
//     const category = searchParams.get('category');
//     const rarity = searchParams.get('rarity');
//     const limit = parseInt(searchParams.get('limit') || '10');

//     const whereClause: any = {};
//     if (category) whereClause.category = category;
//     if (rarity) whereClause.rarity = rarity;

//     // Buscar usuários com mais conquistas
//     const topUsers = await prisma.userAchievement.groupBy({
//       by: ['userId'],
//       where: whereClause,
//       _count: { id: true },
//       _sum: { xpReward: true },
//       orderBy: { _count: { id: 'desc' } },
//       take: limit,
//     });

//     // Buscar dados dos usuários
//     const userIds = topUsers.map((u) => u.userId);
//     const users = await prisma.user.findMany({
//       where: { id: { in: userIds } },
//       select: {
//         id: true,
//         firstName: true,
//         lastName: true,
//         username: true,
//         image: true,
//       },
//     });

//     // Combinar dados
//     const leaderboard = topUsers.map((userStats, index) => {
//       const user = users.find((u) => u.id === userStats.userId);
//       return {
//         position: index + 1,
//         user: user
//           ? {
//               id: user.id,
//               name: user.firstName || user.username || 'Usuário',
//               fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
//               image: user.image,
//             }
//           : null,
//         achievementsCount: userStats._count.id,
//         totalXP: userStats._sum.xpReward || 0,
//       };
//     });

//     return NextResponse.json({
//       success: true,
//       leaderboard: leaderboard.filter((item) => item.user), // Remover usuários não encontrados
//     });
//   } catch (error) {
//     console.error('Erro ao buscar leaderboard:', error);
//     return NextResponse.json(
//       { error: 'Erro interno do servidor' },
//       { status: 500 }
//     );
//   }
// }
