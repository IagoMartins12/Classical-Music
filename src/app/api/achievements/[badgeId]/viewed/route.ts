import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

// app/api/achievements/[badgeId]/viewed/route.ts
export async function PATCH(
  request: NextRequest,
  { params }: { params: { badgeId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const badgeId = params.badgeId;

    // Marcar como visualizado
    const updated = await prisma.userAchievement.updateMany({
      where: {
        userId: session.user.id,
        badgeId: badgeId,
      },
      data: {
        isNew: false,
        lastViewedAt: new Date(),
      },
    });

    if (updated.count === 0) {
      return NextResponse.json(
        { error: 'Achievement não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao marcar achievement como visto:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
