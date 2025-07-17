// app/api/admin/ads/check-conflict/route.ts - API para verificar conflitos
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role < 1) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const placement = searchParams.get('placement');
    const targetType = searchParams.get('targetType');
    const instrumentId = searchParams.get('instrumentId');
    const excludeId = searchParams.get('excludeId'); // Para edição

    if (!placement || !targetType) {
      return NextResponse.json(
        { error: 'Placement e targetType são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se já existe um anúncio ativo para esta combinação
    const where: any = {
      placement,
      targetType,
      status: { in: ['ACTIVE', 'SCHEDULED'] },
    };

    // Se for targeting por instrumento, incluir o instrumentId
    if (targetType === 'INSTRUMENT') {
      where.instrumentId = instrumentId || null;
    } else {
      // Para outros tipos, o instrumentId deve ser null
      where.instrumentId = null;
    }

    // Excluir o próprio anúncio em caso de edição
    if (excludeId) {
      where.id = { not: excludeId };
    }

    const existingAd = await prisma.advertisement.findFirst({
      where,
      include: {
        instrument: {
          select: {
            name: true,
          },
        },
      },
    });

    if (existingAd) {
      let message = '';

      if (targetType === 'INSTRUMENT' && instrumentId) {
        message = `Já existe um anúncio ativo para o instrumento "${existingAd.instrument?.name}" na posição ${placement}.`;
      } else if (targetType === 'USER_LEVEL') {
        message = `Já existe um anúncio ativo para segmentação por tipo de usuário na posição ${placement}.`;
      } else {
        message = `Já existe um anúncio ativo geral na posição ${placement}.`;
      }

      message += ` Título do anúncio existente: "${existingAd.title}".`;

      return NextResponse.json({
        hasConflict: true,
        message,
        conflictingAd: {
          id: existingAd.id,
          title: existingAd.title,
          status: existingAd.status,
          advertiserName: existingAd.advertiserName,
        },
      });
    }

    return NextResponse.json({
      hasConflict: false,
      message: 'Nenhum conflito encontrado.',
    });
  } catch (error) {
    console.error('Erro ao verificar conflitos:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
