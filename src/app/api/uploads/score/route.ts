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
import {
  sanitizeWorkTitle,
  generateScoreDirectory,
} from '@/app/utils/pdfUtils';

/**
 * 🆕 Move arquivos da pasta temporária para a pasta definitiva - NOVA ESTRUTURA
 */
async function moveTemporaryFilesToFinal(
  tempPdfPath: string,
  tempThumbnailPath: string,
  workTitle: string,
  workId: string
): Promise<{ pdfUrl: string; thumbnailUrl: string | null; scoreId: string }> {
  try {
    console.log('📁 Iniciando movimentação de arquivos temporários...');
    console.log('📄 PDF temporário:', tempPdfPath);
    console.log('🖼️ Thumbnail temporário:', tempThumbnailPath);

    // Obter dados da obra para criar estrutura de pastas
    const work = await prisma.work.findUnique({
      where: { id: workId },
      select: { title: true },
    });

    if (!work) {
      throw new Error('Obra não encontrada');
    }

    // 🆕 Gerar estrutura de pastas com ID único
    const structure = generateScoreDirectory(work.title);
    const cleanTitle = sanitizeWorkTitle(work.title);

    console.log('📁 Nova estrutura gerada:', structure);

    // Criar estrutura de pastas definitiva
    const finalPdfDir = path.join(
      process.cwd(),
      'public',
      'uploads',
      'scores',
      'final',
      structure.scoreDir
    );

    const finalThumbDir = path.join(
      process.cwd(),
      'public',
      'uploads',
      'scores',
      'final',
      structure.thumbDir
    );

    console.log('📁 Diretório PDF:', finalPdfDir);
    console.log('📁 Diretório thumbnail:', finalThumbDir);

    // Criar diretórios se não existirem
    await fs.mkdir(finalPdfDir, { recursive: true });
    await fs.mkdir(finalThumbDir, { recursive: true });
    console.log('✅ Diretórios criados/verificados');

    // 🆕 Nomes dos arquivos definitivos
    const finalPdfName = `${cleanTitle}.pdf`;
    const finalThumbnailName = `${cleanTitle}.png`;

    // Caminhos definitivos
    const finalPdfPath = path.join(finalPdfDir, finalPdfName);
    const finalThumbnailPath = path.join(finalThumbDir, finalThumbnailName);

    // 🆕 URLs públicas definitivas com nova estrutura
    const pdfUrl = `/uploads/scores/final/${structure.scoreDir}/${finalPdfName}`;
    let thumbnailUrl: string | null = null;

    // 🆕 Mover arquivo PDF (CORRIGIDO)
    if (tempPdfPath) {
      let tempPdfFullPath: string;

      // Verificar se é URL ou caminho completo
      if (tempPdfPath.startsWith('/uploads/')) {
        tempPdfFullPath = path.join(process.cwd(), 'public', tempPdfPath);
      } else if (tempPdfPath.startsWith('http')) {
        console.warn('⚠️ PDF é URL externa, não pode ser movido:', tempPdfPath);
        return {
          pdfUrl: tempPdfPath,
          thumbnailUrl: null,
          scoreId: structure.scoreId,
        };
      } else {
        tempPdfFullPath = tempPdfPath;
      }

      console.log('📄 Movendo PDF de:', tempPdfFullPath);
      console.log('📄 Para:', finalPdfPath);

      // Verificar se arquivo temporário existe
      const pdfExists = await fs
        .access(tempPdfFullPath)
        .then(() => true)
        .catch(() => false);

      if (pdfExists) {
        // Copiar arquivo
        await fs.copyFile(tempPdfFullPath, finalPdfPath);
        console.log(`✅ PDF copiado com sucesso`);

        // Verificar se foi copiado corretamente
        const finalExists = await fs
          .access(finalPdfPath)
          .then(() => true)
          .catch(() => false);
        if (finalExists) {
          // Remover arquivo temporário apenas se cópia foi bem-sucedida
          await fs.unlink(tempPdfFullPath);
          console.log(`🗑️ PDF temporário removido: ${tempPdfFullPath}`);
        } else {
          throw new Error('Cópia do PDF falhou - arquivo final não existe');
        }
      } else {
        console.warn(
          '⚠️ Arquivo PDF temporário não encontrado:',
          tempPdfFullPath
        );
        // Se não achou arquivo temporário, usar URL original
        return {
          pdfUrl: tempPdfPath,
          thumbnailUrl: null,
          scoreId: structure.scoreId,
        };
      }
    }

    // 🆕 Mover arquivo de thumbnail para subpasta thumb
    if (tempThumbnailPath) {
      let tempThumbnailFullPath: string;

      // Verificar se é URL ou caminho completo
      if (tempThumbnailPath.startsWith('/uploads/')) {
        tempThumbnailFullPath = path.join(
          process.cwd(),
          'public',
          tempThumbnailPath
        );
      } else {
        tempThumbnailFullPath = tempThumbnailPath;
      }

      console.log('🖼️ Movendo thumbnail de:', tempThumbnailFullPath);
      console.log('🖼️ Para:', finalThumbnailPath);

      // Verificar se thumbnail temporário existe
      const thumbExists = await fs
        .access(tempThumbnailFullPath)
        .then(() => true)
        .catch(() => false);

      if (thumbExists) {
        // Copiar thumbnail
        await fs.copyFile(tempThumbnailFullPath, finalThumbnailPath);
        console.log(`✅ Thumbnail copiado com sucesso`);

        // Verificar se foi copiado corretamente
        const finalThumbExists = await fs
          .access(finalThumbnailPath)
          .then(() => true)
          .catch(() => false);
        if (finalThumbExists) {
          thumbnailUrl = `/uploads/scores/final/${structure.thumbDir}/${finalThumbnailName}`;

          // Remover thumbnail temporário apenas se cópia foi bem-sucedida
          await fs.unlink(tempThumbnailFullPath);
          console.log(
            `🗑️ Thumbnail temporário removido: ${tempThumbnailFullPath}`
          );
        } else {
          console.warn('⚠️ Cópia do thumbnail falhou - usando URL original');
          thumbnailUrl = tempThumbnailPath;
        }
      } else {
        console.warn(
          '⚠️ Arquivo de thumbnail temporário não encontrado:',
          tempThumbnailFullPath
        );
        thumbnailUrl = tempThumbnailPath; // Usar URL original se não achou
      }
    }

    // 🆕 Tentar limpar pasta temporária do usuário se estiver vazia
    try {
      if (tempPdfPath && tempPdfPath.includes('/temp/')) {
        const tempUserDir = path.dirname(
          path.join(process.cwd(), 'public', tempPdfPath)
        );
        const files = await fs.readdir(tempUserDir).catch(() => []);

        if (files.length === 0) {
          await fs.rmdir(tempUserDir);
          console.log('🗑️ Pasta temporária vazia removida:', tempUserDir);
        } else {
          console.log(
            '📁 Pasta temporária ainda contém arquivos:',
            files.length
          );
        }
      }
    } catch (cleanupError) {
      console.warn('⚠️ Erro ao limpar pasta temporária:', cleanupError);
    }

    console.log('✅ Movimentação concluída:', {
      pdfUrl,
      thumbnailUrl,
      scoreId: structure.scoreId,
    });
    return { pdfUrl, thumbnailUrl, scoreId: structure.scoreId };
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
    let scoreId: string | undefined;

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
        scoreId = movedFiles.scoreId; // 🆕 Capturar scoreId gerado

        console.log('✅ Arquivos movidos com sucesso:', {
          pdf: finalPdfUrl,
          thumbnail: finalThumbnailUrl,
          scoreId,
        });
      } catch (moveError) {
        console.error('❌ Erro ao mover arquivos:', moveError);
        // Continuar com URLs originais se movimentação falhar
        console.warn(
          '⚠️ Continuando com URLs originais devido a erro na movimentação'
        );
      }
    }

    // 🆕 Gerar sourceId usando scoreId se disponível
    const sourceIdBase = body.sourceId || body.source || 'CUSTOM';
    const finalSourceId = scoreId
      ? `${sourceIdBase}_${scoreId}`
      : generateSourceId(sourceIdBase);

    // Verificar se já existe partitura com mesmo sourceId para esta obra
    const existingScore = await prisma.workScore.findFirst({
      where: {
        workId: body.workId,
        sourceId: finalSourceId,
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
      sourceId: finalSourceId, // 🆕 Usar sourceId com scoreId
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
