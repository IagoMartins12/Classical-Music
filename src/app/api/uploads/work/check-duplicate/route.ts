// app/api/uploads/work/check-duplicate/route.ts - VERSÃO MELHORADA
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
    const { url, excludeId } = body;

    if (!url) {
      return NextResponse.json({ error: 'URL é obrigatória' }, { status: 400 });
    }

    console.log('🔍 Verificando duplicata para URL:', url);

    // Extrair ID do IMSLP da URL de forma mais robusta
    let imslpId = '';
    if (url.includes('imslp.org')) {
      // Extrair da URL: https://imslp.org/wiki/Symphony_No.40_(Mozart,_Wolfgang_Amadeus)
      const urlParts = url.split('/wiki/');
      if (urlParts.length > 1) {
        imslpId = urlParts[1];
        // Decodificar URL se necessário
        imslpId = decodeURIComponent(imslpId);
      }
    } else {
      imslpId = url;
    }

    console.log('📋 ID extraído:', imslpId);

    // Construir cláusula WHERE para buscar duplicatas
    const whereClause: any = {
      OR: [
        { imslpId: imslpId },
        { imslpPermlink: url },
        { imslpId: { contains: imslpId } },
        // Adicionar busca por URL normalizada
        { imslpPermlink: { contains: imslpId } },
      ],
    };

    // Excluir a obra que está sendo editada
    if (excludeId) {
      whereClause.id = { not: excludeId };
      console.log('🚫 Excluindo da busca:', excludeId);
    }

    const existingWork = await prisma.work.findFirst({
      where: whereClause,
      select: {
        id: true,
        title: true,
        subtitle: true,
        imslpId: true,
        imslpPermlink: true,
        opOrCatalog: true,
        compositionYear: true,
        composer: {
          select: {
            name: true,
            fullName: true,
          },
        },
        epoch: {
          select: {
            name: true,
          },
        },
        instrument: {
          select: {
            name: true,
          },
        },
        createdAt: true,
      },
    });

    if (existingWork) {
      console.log('⚠️ Duplicata encontrada:', existingWork.title);
      return NextResponse.json({
        found: true,
        work: {
          ...existingWork,
          composerName:
            existingWork.composer.fullName || existingWork.composer.name,
          epochName: existingWork.epoch.name,
          instrumentName: existingWork.instrument.name,
        },
      });
    }

    console.log('✅ Nenhuma duplicata encontrada');
    return NextResponse.json({
      found: false,
    });
  } catch (error) {
    console.error('❌ Erro ao verificar duplicata:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
