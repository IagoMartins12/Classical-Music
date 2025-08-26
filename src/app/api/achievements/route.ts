// app/api/achievements/route.ts - API principal para achievements
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

// XP por raridade
const XP_REWARDS = {
  COMMON: 10,
  RARE: 25,
  EPIC: 50,
  LEGENDARY: 100,
} as const;

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const {
      badgeId,
      name,
      description,
      category,
      rarity,
      progress,
      maxProgress,
    } = body;

    // Verificar se já existe
    const existing = await prisma.userAchievement.findUnique({
      where: {
        userId_badgeId: {
          userId: session.user.id,
          badgeId: badgeId,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Conquista já desbloqueada' },
        { status: 400 }
      );
    }

    // Calcular XP
    const xpReward = XP_REWARDS[rarity as keyof typeof XP_REWARDS] || 10;

    // Criar conquista em transação
    const result = await prisma.$transaction(async (tx) => {
      // Criar achievement
      const achievement = await tx.userAchievement.create({
        data: {
          userId: session.user.id,
          badgeId,
          name,
          description,
          category,
          rarity,
          progress,
          maxProgress,
          xpReward,
        },
      });

      // Atualizar XP total do usuário
      await tx.user.update({
        where: { id: session.user.id },
        data: {
          totalXP: { increment: xpReward },
        },
      });

      return achievement;
    });

    console.log(
      `🏆 [ACHIEVEMENT] ${name} desbloqueado para ${session.user.id} (+${xpReward}XP)`
    );

    return NextResponse.json({
      success: true,
      achievement: result,
      xpReward,
    });
  } catch (error) {
    console.error('Erro ao criar achievement:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const rarity = searchParams.get('rarity');
    const isNew = searchParams.get('isNew');

    const whereClause: any = {
      userId: session.user.id,
    };

    if (category) whereClause.category = category;
    if (rarity) whereClause.rarity = rarity;
    if (isNew) whereClause.isNew = isNew === 'true';

    const achievements = await prisma.userAchievement.findMany({
      where: whereClause,
      orderBy: { unlockedAt: 'desc' },
    });

    // Estatísticas
    const stats = {
      total: achievements.length,
      newCount: achievements.filter((a) => a.isNew).length,
      totalXP: achievements.reduce((sum, a) => sum + a.xpReward, 0),
      byRarity: {
        COMMON: achievements.filter((a) => a.rarity === 'COMMON').length,
        RARE: achievements.filter((a) => a.rarity === 'RARE').length,
        EPIC: achievements.filter((a) => a.rarity === 'EPIC').length,
        LEGENDARY: achievements.filter((a) => a.rarity === 'LEGENDARY').length,
      },
      byCategory: achievements.reduce((acc, a) => {
        acc[a.category] = (acc[a.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };

    return NextResponse.json({
      success: true,
      achievements,
      stats,
    });
  } catch (error) {
    console.error('Erro ao buscar achievements:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
