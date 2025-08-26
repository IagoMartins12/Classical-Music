// app/api/achievements/check/route.ts - Verificar achievements desbloqueados
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import { AchievementCategory, AchievementRarity } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

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
    const { category } = body; // 'LEARNING', 'FAVORITES', 'ANNOTATIONS'

    // Buscar dados necessários baseado na categoria
    let newAchievements: any[] = [];

    if (category === 'LEARNING') {
      newAchievements = await checkLearningAchievements(session.user.id);
    } else if (category === 'FAVORITES') {
      newAchievements = await checkFavoritesAchievements(session.user.id);
    } else if (category === 'ANNOTATIONS') {
      newAchievements = await checkAnnotationsAchievements(session.user.id);
    }

    return NextResponse.json({
      success: true,
      newAchievements,
      count: newAchievements.length,
    });
  } catch (error) {
    console.error('Erro ao verificar achievements:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Funções auxiliares para verificar achievements
async function checkLearningAchievements(userId: string) {
  const [wantToLearn, learned, existingAchievements] = await Promise.all([
    prisma.wantToLearn.findMany({ where: { userId } }),
    prisma.learned.findMany({ where: { userId } }),
    prisma.userAchievement.findMany({
      where: { userId, category: AchievementCategory.LEARNING },
      select: { badgeId: true },
    }),
  ]);

  const existingBadgeIds = new Set(existingAchievements.map((a) => a.badgeId));
  const newAchievements = [];

  // Verificar achievements específicos
  const totalLearning = wantToLearn.length + learned.length;
  const learnedCount = learned.length;
  const wantToLearnCount = wantToLearn.length;

  // Achievement: Primeiro Objetivo
  if (totalLearning >= 1 && !existingBadgeIds.has('first-goal')) {
    newAchievements.push({
      badgeId: 'first-goal',
      name: 'Primeiro Objetivo',
      description: 'Você deu o primeiro passo na sua jornada musical!',
      category: AchievementCategory.LEARNING,
      rarity: AchievementRarity.COMMON,
    });
  }

  // Achievement: Primeira Conquista
  if (learnedCount >= 1 && !existingBadgeIds.has('first-completion')) {
    newAchievements.push({
      badgeId: 'first-completion',
      name: 'Primeira Conquista',
      description: 'Parabéns! Você completou sua primeira obra musical.',
      category: AchievementCategory.LEARNING,
      rarity: AchievementRarity.COMMON,
    });
  }

  // Achievement: Estudante Dedicado
  if (wantToLearnCount >= 10 && !existingBadgeIds.has('dedicated-student')) {
    newAchievements.push({
      badgeId: 'dedicated-student',
      name: 'Estudante Dedicado',
      description: 'Você tem 10 obras em sua lista de estudos. Que dedicação!',
      category: AchievementCategory.LEARNING,
      rarity: AchievementRarity.RARE,
    });
  }

  // Achievement: Músico Experiente
  if (learnedCount >= 15 && !existingBadgeIds.has('experienced-musician')) {
    newAchievements.push({
      badgeId: 'experienced-musician',
      name: 'Músico Experiente',
      description: 'Com 15 obras dominadas, você já é um músico experiente!',
      category: AchievementCategory.LEARNING,
      rarity: AchievementRarity.EPIC,
    });
  }

  // 🔧 SALVAR COM VERIFICAÇÃO DE DUPLICATA (upsert)
  for (const achievement of newAchievements) {
    try {
      await prisma.userAchievement.upsert({
        where: {
          userId_badgeId: {
            userId,
            badgeId: achievement.badgeId,
          },
        },
        update: {}, // Não atualizar se já existe
        create: {
          userId,
          ...achievement,
          xpReward: XP_REWARDS[achievement.rarity as keyof typeof XP_REWARDS],
        },
      });
    } catch (error) {
      console.error(`Erro ao criar achievement ${achievement.badgeId}:`, error);
      // Continuar com os outros achievements mesmo se um falhar
    }
  }

  // Atualizar XP total
  if (newAchievements.length > 0) {
    const totalXP = newAchievements.reduce(
      (sum, a) => sum + XP_REWARDS[a.rarity as keyof typeof XP_REWARDS],
      0
    );

    await prisma.user.update({
      where: { id: userId },
      data: { totalXP: { increment: totalXP } },
    });
  }

  return newAchievements;
}

async function checkFavoritesAchievements(userId: string) {
  const [
    favoriteComposers,
    favoriteWorks,
    favoriteScores,
    existingAchievements,
  ] = await Promise.all([
    prisma.favoriteComposer.findMany({
      where: { userId },
      include: { composer: true },
    }),
    prisma.favoriteWork.findMany({
      where: { userId },
      include: { work: { include: { composer: true, epoch: true } } },
    }),
    prisma.favoriteScore.findMany({ where: { userId } }),
    prisma.userAchievement.findMany({
      where: { userId, category: AchievementCategory.FAVORITES },
      select: { badgeId: true },
    }),
  ]);

  const existingBadgeIds = new Set(existingAchievements.map((a) => a.badgeId));
  const newAchievements = [];

  const totalFavorites =
    favoriteComposers.length + favoriteWorks.length + favoriteScores.length;

  // Achievement: Primeiro Favorito
  if (totalFavorites >= 1 && !existingBadgeIds.has('first-favorite')) {
    newAchievements.push({
      badgeId: 'first-favorite',
      name: 'Primeiro Favorito',
      description: 'Você salvou seu primeiro item musical favorito!',
      category: AchievementCategory.FAVORITES,
      rarity: AchievementRarity.COMMON,
    });
  }

  // Achievement: Colecionador Bronze
  if (totalFavorites >= 10 && !existingBadgeIds.has('collector-bronze')) {
    newAchievements.push({
      badgeId: 'collector-bronze',
      name: 'Colecionador Bronze',
      description: 'Sua coleção chegou aos 10 favoritos. Continue explorando!',
      category: AchievementCategory.FAVORITES,
      rarity: AchievementRarity.COMMON,
    });
  }

  // Achievement: Colecionador Prata
  if (totalFavorites >= 25 && !existingBadgeIds.has('collector-silver')) {
    newAchievements.push({
      badgeId: 'collector-silver',
      name: 'Colecionador Prata',
      description:
        '25 favoritos! Você está construindo uma biblioteca musical impressionante.',
      category: AchievementCategory.FAVORITES,
      rarity: AchievementRarity.RARE,
    });
  }

  // Achievement: Explorador de Épocas
  const uniqueEpochs = new Set(
    favoriteWorks.map((fw) => fw.work?.epoch?.name).filter(Boolean)
  );
  if (uniqueEpochs.size >= 4 && !existingBadgeIds.has('epoch-explorer')) {
    newAchievements.push({
      badgeId: 'epoch-explorer',
      name: 'Explorador de Épocas',
      description: `Você descobriu ${uniqueEpochs.size} épocas musicais diferentes!`,
      category: AchievementCategory.FAVORITES,
      rarity: AchievementRarity.RARE,
    });
  }

  // 🔧 SALVAR COM UPSERT
  for (const achievement of newAchievements) {
    try {
      await prisma.userAchievement.upsert({
        where: {
          userId_badgeId: {
            userId,
            badgeId: achievement.badgeId,
          },
        },
        update: {},
        create: {
          userId,
          ...achievement,
          xpReward: XP_REWARDS[achievement.rarity as keyof typeof XP_REWARDS],
        },
      });
    } catch (error) {
      console.error(`Erro ao criar achievement ${achievement.badgeId}:`, error);
    }
  }

  return newAchievements;
}

async function checkAnnotationsAchievements(userId: string) {
  const [annotations, annotationVotes, existingAchievements] =
    await Promise.all([
      prisma.workAnnotation.findMany({ where: { userId } }),
      prisma.annotationHelpfulVote.findMany({
        where: {
          annotation: { userId },
          isHelpful: true,
        },
      }),
      prisma.userAchievement.findMany({
        where: { userId, category: AchievementCategory.ANNOTATIONS },
        select: { badgeId: true },
      }),
    ]);

  const existingBadgeIds = new Set(existingAchievements.map((a) => a.badgeId));
  const newAchievements = [];

  const totalAnnotations = annotations.length;
  const totalHelpfulVotes = annotationVotes.length;
  const publicAnnotations = annotations.filter((a) => a.isPublic).length;
  const verifiedAnnotations = annotations.filter((a) => a.isVerified).length;

  // Achievement: Primeira Contribuição
  if (totalAnnotations >= 1 && !existingBadgeIds.has('first-contribution')) {
    newAchievements.push({
      badgeId: 'first-contribution',
      name: 'Primeira Contribuição',
      description: 'Obrigado por compartilhar seu conhecimento musical!',
      category: AchievementCategory.ANNOTATIONS,
      rarity: AchievementRarity.COMMON,
    });
  }

  // Achievement: Primeira Ajuda
  if (totalHelpfulVotes >= 1 && !existingBadgeIds.has('first-helpful')) {
    newAchievements.push({
      badgeId: 'first-helpful',
      name: 'Primeira Ajuda',
      description: 'Sua anotação foi marcada como útil pela primeira vez!',
      category: AchievementCategory.ANNOTATIONS,
      rarity: AchievementRarity.COMMON,
    });
  }

  // Achievement: Contribuidor Ativo
  if (totalAnnotations >= 15 && !existingBadgeIds.has('active-contributor')) {
    newAchievements.push({
      badgeId: 'active-contributor',
      name: 'Contribuidor Ativo',
      description:
        'Com 15 anotações, você é um colaborador valioso da comunidade!',
      category: AchievementCategory.ANNOTATIONS,
      rarity: AchievementRarity.RARE,
    });
  }

  // Achievement: Expert Útil
  if (totalHelpfulVotes >= 50 && !existingBadgeIds.has('helpful-expert')) {
    newAchievements.push({
      badgeId: 'helpful-expert',
      name: 'Expert Útil',
      description:
        '50 votos úteis! Seu conhecimento está ajudando muitos músicos.',
      category: AchievementCategory.ANNOTATIONS,
      rarity: AchievementRarity.EPIC,
    });
  }

  // Achievement: Estudioso Verificado
  if (verifiedAnnotations >= 5 && !existingBadgeIds.has('verified-scholar')) {
    newAchievements.push({
      badgeId: 'verified-scholar',
      name: 'Estudioso Verificado',
      description: 'Você tem 5 anotações verificadas por especialistas!',
      category: AchievementCategory.ANNOTATIONS,
      rarity: AchievementRarity.EPIC,
    });
  }

  // 🔧 SALVAR COM UPSERT
  for (const achievement of newAchievements) {
    try {
      await prisma.userAchievement.upsert({
        where: {
          userId_badgeId: {
            userId,
            badgeId: achievement.badgeId,
          },
        },
        update: {},
        create: {
          userId,
          ...achievement,
          xpReward: XP_REWARDS[achievement.rarity as keyof typeof XP_REWARDS],
        },
      });
    } catch (error) {
      console.error(`Erro ao criar achievement ${achievement.badgeId}:`, error);
    }
  }

  return newAchievements;
}
