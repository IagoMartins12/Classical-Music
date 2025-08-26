// app/api/achievements/progress/route.ts - Atualizar progresso
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { badgeId, currentValue, metadata } = body;

    const progress = await prisma.achievementProgress.upsert({
      where: {
        userId_badgeId: {
          userId: session.user.id,
          badgeId: badgeId,
        },
      },
      update: {
        currentValue,
        lastProgressUpdate: new Date(),
        lastCheckedAt: new Date(),
        metadata: metadata || undefined,
      },
      create: {
        userId: session.user.id,
        badgeId,
        currentValue,
        metadata: metadata || undefined,
      },
    });

    return NextResponse.json({ success: true, progress });
  } catch (error) {
    console.error('Erro ao atualizar progresso:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
