// app/api/user/heartbeat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const { timestamp, type } = body;

    // Atualizar lastSeen do usuário (serve como "visto por último")
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        lastSeen: new Date(timestamp || Date.now()),
      },
    });

    // Log opcional para debug
    if (process.env.NODE_ENV === 'development') {
      console.log(
        `💓 Heartbeat: ${session.user.email} - ${type || 'periodic'}`
      );
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Erro no heartbeat:', error);
    return NextResponse.json(
      { error: 'Erro ao processar heartbeat' },
      { status: 500 }
    );
  }
}
