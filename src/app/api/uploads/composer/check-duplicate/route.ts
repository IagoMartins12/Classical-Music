// app/api/uploads/composer/check-duplicate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { url, source, excludeId, fullName } = body;

    console.log('FULL NAME', fullName);
    if (!url || !source) {
      return NextResponse.json(
        { error: 'URL e fonte são obrigatórios' },
        { status: 400 }
      );
    }

    let whereClause: any = {};

    // Construir cláusula WHERE baseada na fonte
    if (source === 'imslp') {
      whereClause = {
        OR: [
          { imslpId: url },
          { permLinkImslp: url },
          { imslpId: { contains: url.split('/').pop() } }, // Verificar pelo ID final
        ],
      };
    } else if (source === 'wikipedia') {
      whereClause = {
        wikipediaLink: url,
      };
    }

    // Excluir o compositor que está sendo editado
    if (excludeId) {
      whereClause = {
        ...whereClause,
        id: { not: excludeId },
      };
    }

    const existingComposer = await prisma.composer.findFirst({
      where: whereClause,
      select: {
        id: true,
        name: true,
        fullName: true,
        portraitUrl: true,
        imslpId: true,
        wikipediaLink: true,
        epoch: {
          select: {
            name: true,
          },
        },
      },
    });

    if (existingComposer) {
      return NextResponse.json({
        found: true,
        composer: existingComposer,
      });
    }

    return NextResponse.json({
      found: false,
    });
  } catch (error) {
    console.error('Erro ao verificar duplicata:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
