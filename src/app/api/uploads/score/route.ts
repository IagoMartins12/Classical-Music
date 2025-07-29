// app/api/uploads/score/route.ts - COM MOVIMENTAÇÃO DE ARQUIVOS
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import { revalidateUploadsCache } from '@/app/requests/upload';
import { logScoreCreate } from '@/app/utils/historyUtils';
import { ProcessingStatus } from '@prisma/client';
import { promises as fs } from 'fs';
import path from 'path';
import { sanitizeWorkTitle } from '@/app/utils/pdfUtils';

/**
 * 🆕 Move arquivos da pasta temporária para a pasta definitiva
 */
async function moveTemporaryFilesToFinal(
  tempPdfPath: string,
  tempThumbnailPath: string,
  workTitle: string,
  workId: string
): Promise<{ pdfUrl: string; thumbnailUrl: string | null }> {
  try {
    console.log('📁 Movendo arquivos temporários para pasta definitiva...');

    // Obter dados da obra para criar estrutura de pastas
    const work = await prisma.work.findUnique({
      where: { id: workId },
      select: { title: true },
    });

    if (!work) {
      throw new Error('Obra não encontrada');
    }

    const now = new Date();
    const year = now.getFullYear().toString();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const cleanTitle = sanitizeWorkTitle(work.title);

    // Criar estrutura de pastas definitiva
    const finalDir = path.join(
      process.cwd(),
      'public',
      'uploads',
      'scores',
      'final',
      year,
      month,
      cleanTitle
    );

    // Criar diretório se não existir
    await fs.mkdir(finalDir, { recursive: true });

    // Nomes dos arquivos definitivos
    const finalPdfName = `${cleanTitle}.pdf`;
    const finalThumbnailName = `${cleanTitle}-thumb.png`;

    // Caminhos definitivos
    const finalPdfPath = path.join(finalDir, finalPdfName);
    const finalThumbnailPath = path.join(finalDir, finalThumbnailName);

    // URLs públicas definitivas
    const pdfUrl = `/uploads/scores/final/${year}/${month}/${cleanTitle}/${finalPdfName}`;
    let thumbnailUrl: string | null = null;

    // 🆕 Mover arquivo PDF
    if (tempPdfPath && tempPdfPath.startsWith('/uploads/')) {
      const tempPdfFullPath = path.join(process.cwd(), 'public', tempPdfPath);

      // Verificar se arquivo temporário existe
      const pdfExists = await fs
        .access(tempPdfFullPath)
        .then(() => true)
        .catch(() => false);

      if (pdfExists) {
        await fs.copyFile(tempPdfFullPath, finalPdfPath);
        console.log(`✅ PDF movido: ${tempPdfPath} → ${pdfUrl}`);

        // Remover arquivo temporário
        await fs.unlink(tempPdfFullPath).catch(console.warn);
      } else {
        console.warn(
          '⚠️ Arquivo PDF temporário não encontrado:',
          tempPdfFullPath
        );
      }
    }

    // 🆕 Mover arquivo de thumbnail (se existir)
    if (tempThumbnailPath && tempThumbnailPath.startsWith('/uploads/')) {
      const tempThumbnailFullPath = path.join(
        process.cwd(),
        'public',
        tempThumbnailPath
      );

      // Verificar se thumbnail temporário existe
      const thumbExists = await fs
        .access(tempThumbnailFullPath)
        .then(() => true)
        .catch(() => false);

      if (thumbExists) {
        await fs.copyFile(tempThumbnailFullPath, finalThumbnailPath);
        thumbnailUrl = `/uploads/scores/final/${year}/${month}/${cleanTitle}/${finalThumbnailName}`;
        console.log(
          `✅ Thumbnail movido: ${tempThumbnailPath} → ${thumbnailUrl}`
        );

        // Remover thumbnail temporário
        await fs.unlink(tempThumbnailFullPath).catch(console.warn);
      } else {
        console.warn(
          '⚠️ Arquivo de thumbnail temporário não encontrado:',
          tempThumbnailFullPath
        );
      }
    }

    // 🆕 Tentar limpar pasta temporária do usuário se estiver vazia
    try {
      if (tempPdfPath.includes('/temp/')) {
        const tempUserDir = path.dirname(
          path.join(process.cwd(), 'public', tempPdfPath)
        );
        const files = await fs.readdir(tempUserDir);

        if (files.length === 0) {
          await fs.rmdir(tempUserDir);
          console.log('🗑️ Pasta temporária vazia removida:', tempUserDir);
        }
      }
    } catch (cleanupError) {
      console.warn('⚠️ Erro ao limpar pasta temporária:', cleanupError);
    }

    return { pdfUrl, thumbnailUrl };
  } catch (error) {
    console.error('❌ Erro ao mover arquivos temporários:', error);
    throw new Error(`Erro ao organizar arquivos: ${error}`);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();

    // Validações básicas
    if (!body.workId || !body.title) {
      return NextResponse.json(
        { error: 'Obra e título são obrigatórios' },
        { status: 400 }
      );
    }

    if (!body.downloadUrl) {
      return NextResponse.json(
        { error: 'URL do arquivo ou upload é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se a obra existe
    const work = await prisma.work.findUnique({
      where: { id: body.workId },
      include: {
        composer: { select: { name: true, fullName: true } },
      },
    });

    if (!work) {
      return NextResponse.json(
        { error: 'Obra não encontrada' },
        { status: 400 }
      );
    }

    // 🆕 Mover arquivos temporários para pasta definitiva (se aplicável)
    let finalPdfUrl = body.downloadUrl;
    let finalThumbnailUrl = body.thumbnailUrl;

    if (
      body.hasTemporaryFiles &&
      (body.tempPdfPath || body.tempThumbnailPath)
    ) {
      console.log(
        '📁 Movendo arquivos temporários para estrutura definitiva...'
      );

      try {
        const movedFiles = await moveTemporaryFilesToFinal(
          body.tempPdfPath || body.downloadUrl,
          body.tempThumbnailPath || body.thumbnailUrl,
          body.title,
          body.workId
        );

        finalPdfUrl = movedFiles.pdfUrl;
        finalThumbnailUrl = movedFiles.thumbnailUrl || body.thumbnailUrl;

        console.log('✅ Arquivos movidos com sucesso:', {
          pdf: finalPdfUrl,
          thumbnail: finalThumbnailUrl,
        });
      } catch (moveError) {
        console.error('❌ Erro ao mover arquivos:', moveError);
        // Continuar com URLs originais se movimentação falhar
        console.warn(
          '⚠️ Continuando com URLs originais devido a erro na movimentação'
        );
      }
    }

    // Gerar sourceId único para partituras customizadas
    const sourceId = body.sourceId || generateSourceId(body.source || 'CUSTOM');

    // Verificar se já existe partitura com mesmo sourceId para esta obra
    const existingScore = await prisma.workScore.findFirst({
      where: {
        workId: body.workId,
        sourceId: sourceId,
        source: body.source || 'CUSTOM',
      },
    });

    if (existingScore) {
      return NextResponse.json(
        {
          error:
            'Já existe uma partitura com este identificador para esta obra',
          existingScore: {
            id: existingScore.id,
            title: existingScore.title,
          },
        },
        { status: 400 }
      );
    }

    // 🆕 Preparar dados para criação com URLs definitivas
    const scoreData = {
      workId: body.workId,
      sourceId: sourceId,
      source: body.source || 'CUSTOM',
      title: body.title,
      downloadUrl: finalPdfUrl, // 🆕 URL definitiva
      fileSize: body.fileSize || null,
      pageCount: body.pageCount || null,
      fileFormat: body.fileFormat || 'PDF',
      editor: body.editor || null,
      publisher: body.publisher || null,
      copyright: body.copyright || null,
      thumbnailUrl: finalThumbnailUrl, // 🆕 URL definitiva da thumbnail
      notes: body.notes || null,
      type: body.type || 'SCORES',
      groupIndex: body.groupIndex ? parseInt(body.groupIndex) : 0,
      groupTitle: body.groupTitle || null,
      rating: body.rating ? parseFloat(body.rating) : null,
      ratingsCount: body.ratingsCount ? parseInt(body.ratingsCount) : null,
      downloadCount: body.downloadCount ? parseInt(body.downloadCount) : null,
      isCustom: body.isCustom !== false, // Default true para uploads customizados
      uploadedBy: userId,
      customData: body.customData
        ? typeof body.customData === 'string'
          ? JSON.parse(body.customData)
          : body.customData
        : null,
      processingStatus: ProcessingStatus.COMPLETED,
      isActive: true,
      isVerified: false,
      lastVerified: new Date(),
      lastAccessed: new Date(),
      accessCount: 0,
      priority: body.priority || 0,
    };

    // Criar partitura
    const score = await prisma.workScore.create({
      data: scoreData,
      include: {
        work: {
          select: {
            id: true,
            title: true,
            composer: {
              select: {
                name: true,
                fullName: true,
              },
            },
          },
        },
      },
    });

    // 🆕 Registrar no histórico com informações sobre movimentação de arquivos
    await logScoreCreate(
      userId,
      score.id,
      {
        title: score.title,
        workTitle: score.work.title,
        composerName: score.work.composer.fullName || score.work.composer.name,
        fileFormat: score.fileFormat,
        fileSize: score.fileSize,
        pageCount: score.pageCount,
        type: score.type,
        source: score.source,
        groupIndex: score.groupIndex,
        groupTitle: score.groupTitle,
        editor: score.editor,
        publisher: score.publisher,
        isCustom: score.isCustom,
        uploadMethod: body.source === 'UPLOAD' ? 'file_upload' : 'url_link',
        // 🆕 Informações sobre arquivos
        hadTemporaryFiles: body.hasTemporaryFiles || false,
        finalPdfUrl,
        finalThumbnailUrl,
        originalPdfUrl: body.downloadUrl,
        originalThumbnailUrl: body.thumbnailUrl,
      },
      request
    );

    // Invalidar cache
    await revalidateUploadsCache(userId);

    return NextResponse.json({
      message: 'Partitura criada com sucesso!',
      score: {
        ...score,
        // 🆕 Retornar URLs definitivas
        downloadUrl: finalPdfUrl,
        thumbnailUrl: finalThumbnailUrl,
      },
      // 🆕 Informações sobre a movimentação de arquivos
      fileMovement: body.hasTemporaryFiles
        ? {
            moved: true,
            finalPdfUrl,
            finalThumbnailUrl,
            originalPdfUrl: body.downloadUrl,
            originalThumbnailUrl: body.thumbnailUrl,
          }
        : {
            moved: false,
            reason: 'No temporary files to move',
          },
    });
  } catch (error) {
    console.error('❌ Erro ao criar partitura:', error);

    // 🆕 Tratamento de erros específicos melhorado
    if (error instanceof Error) {
      if (error.message.includes('Duplicate')) {
        return NextResponse.json(
          { error: 'Já existe uma partitura com estes dados' },
          { status: 400 }
        );
      }
      if (error.message.includes('JSON')) {
        return NextResponse.json(
          { error: 'Dados customizados devem estar em formato JSON válido' },
          { status: 400 }
        );
      }
      if (error.message.includes('mover arquivos')) {
        return NextResponse.json(
          { error: `Erro ao organizar arquivos: ${error.message}` },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Função para gerar sourceId único
function generateSourceId(source: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return `${source.toLowerCase()}_${timestamp}_${random}`;
}
