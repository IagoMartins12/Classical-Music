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
    const { url, title, composerId, excludeId } = body;

    // Pelo menos URL ou título+compositor devem estar presentes
    if (!url && (!title || !composerId)) {
      return NextResponse.json(
        {
          error: 'URL ou título com compositor são obrigatórios',
        },
        { status: 400 }
      );
    }

    console.log('🔍 Verificando duplicatas para:', { url, title, composerId });

    // Array para coletar diferentes tipos de verificação
    const duplicateChecks = [];

    // 1. Verificação por URL (se fornecida)
    if (url) {
      const cleanedUrl = cleanImslpUrl(url);
      let imslpId = '';

      if (cleanedUrl.includes('imslp.org')) {
        const urlParts = cleanedUrl.split('/wiki/');
        if (urlParts.length > 1) {
          imslpId = urlParts[1];
        }
      } else {
        imslpId = cleanedUrl;
      }

      const urlWhereClause: any = {
        OR: [{ imslpPermlink: url }, { imslpPermlink: { contains: imslpId } }],
      };

      if (excludeId) {
        urlWhereClause.id = { not: excludeId };
      }

      duplicateChecks.push({
        type: 'url',
        whereClause: urlWhereClause,
      });
    }

    // 2. Verificação por título + compositor (se fornecidos)
    if (title && composerId) {
      const titleWhereClause: any = {
        AND: [
          {
            title: {
              equals: title.trim(),
              mode: 'insensitive',
            },
          },
          { composerId: composerId },
        ],
      };

      if (excludeId) {
        titleWhereClause.id = { not: excludeId };
      }

      duplicateChecks.push({
        type: 'title_composer',
        whereClause: titleWhereClause,
      });
    }

    // Executar as verificações
    for (const check of duplicateChecks) {
      console.log(
        `🔍 Verificando duplicata por ${check.type}:`,
        check.whereClause
      );

      const existingWork = await prisma.work.findFirst({
        where: check.whereClause,
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
        const duplicateType =
          check.type === 'url' ? 'URL' : 'título e compositor';
        console.log(
          `⚠️ Duplicata encontrada por ${duplicateType}:`,
          existingWork.title
        );

        return NextResponse.json({
          found: true,
          duplicateType: check.type,
          duplicateReason: duplicateType,
          work: {
            ...existingWork,
            composerName:
              existingWork.composer.fullName || existingWork.composer.name,
            epochName: existingWork.epoch?.name,
            instrumentName: existingWork.instrument?.name,
          },
        });
      }
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

function cleanImslpUrl(url: string): string {
  try {
    const decodedUrl = decodeURIComponent(url);
    const cleanedUrl = decodedUrl.split('#')[0].split('?')[0];
    console.log(`🧹 URL limpa: ${url} -> ${cleanedUrl}`);
    return cleanedUrl;
  } catch (error) {
    console.error('❌ Erro ao limpar URL:', error);
    return url;
  }
}
