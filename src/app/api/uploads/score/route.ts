// app/api/uploads/score/route.ts - CORRIGIDO PARA USAR URL FINAL
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
 * Move arquivos da pasta temporária para a pasta definitiva - NOVA ESTRUTURA
 */
async function moveTemporaryFilesToFinal(
  tempPdfPath: string,
  tempThumbnailPath: string,
  workTitle: string,
  workId: string
): Promise<{ pdfUrl: string; thumbnailUrl: string | null; scoreId: string }> {
  try {
    console.log(
      '📁 [MOVE-FILES] Iniciando movimentação de arquivos temporários...'
    );
    console.log('📄 [MOVE-FILES] PDF temporário:', tempPdfPath);
    console.log('🖼️ [MOVE-FILES] Thumbnail temporário:', tempThumbnailPath);

    // Obter dados da obra para criar estrutura de pastas
    const work = await prisma.work.findUnique({
      where: { id: workId },
      select: { title: true },
    });

    if (!work) {
      throw new Error('Obra não encontrada');
    }

    // Gerar estrutura de pastas com ID único
    const structure = generateScoreDirectory(work.title);
    const cleanTitle = sanitizeWorkTitle(work.title);

    console.log('📁 [MOVE-FILES] Nova estrutura gerada:', structure);

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

    console.log('📁 [MOVE-FILES] Diretório PDF final:', finalPdfDir);
    console.log('📁 [MOVE-FILES] Diretório thumbnail final:', finalThumbDir);

    // Criar diretórios se não existirem
    await fs.mkdir(finalPdfDir, { recursive: true });
    await fs.mkdir(finalThumbDir, { recursive: true });
    console.log('✅ [MOVE-FILES] Diretórios criados/verificados');

    // Nomes dos arquivos definitivos
    const finalPdfName = `${cleanTitle}.pdf`;
    const finalThumbnailName = `${cleanTitle}.png`;

    // Caminhos definitivos
    const finalPdfPath = path.join(finalPdfDir, finalPdfName);
    const finalThumbnailPath = path.join(finalThumbDir, finalThumbnailName);

    // 🔧 URLs públicas definitivas com nova estrutura
    const pdfUrl = `/uploads/scores/final/${structure.scoreDir}/${finalPdfName}`;
    let thumbnailUrl: string | null = null;

    // Mover arquivo PDF
    if (tempPdfPath) {
      let tempPdfFullPath: string;

      // Verificar se é URL relativa ou caminho completo
      if (tempPdfPath.startsWith('/uploads/')) {
        tempPdfFullPath = path.join(process.cwd(), 'public', tempPdfPath);
      } else if (tempPdfPath.startsWith('http')) {
        console.warn(
          '⚠️ [MOVE-FILES] PDF é URL externa, não pode ser movido:',
          tempPdfPath
        );
        return {
          pdfUrl: tempPdfPath,
          thumbnailUrl: null,
          scoreId: structure.scoreId,
        };
      } else {
        tempPdfFullPath = tempPdfPath;
      }

      console.log('📄 [MOVE-FILES] Movendo PDF de:', tempPdfFullPath);
      console.log('📄 [MOVE-FILES] Para:', finalPdfPath);

      // Verificar se arquivo temporário existe
      const pdfExists = await fs
        .access(tempPdfFullPath)
        .then(() => true)
        .catch(() => false);

      if (pdfExists) {
        // Copiar arquivo
        await fs.copyFile(tempPdfFullPath, finalPdfPath);
        console.log(`✅ [MOVE-FILES] PDF copiado com sucesso`);

        // Verificar se foi copiado corretamente
        const finalExists = await fs
          .access(finalPdfPath)
          .then(() => true)
          .catch(() => false);

        if (finalExists) {
          // Remover arquivo temporário apenas se cópia foi bem-sucedida
          await fs.unlink(tempPdfFullPath);
          console.log(
            `🗑️ [MOVE-FILES] PDF temporário removido: ${tempPdfFullPath}`
          );
        } else {
          throw new Error('Cópia do PDF falhou - arquivo final não existe');
        }
      } else {
        console.warn(
          '⚠️ [MOVE-FILES] Arquivo PDF temporário não encontrado:',
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

    // Mover arquivo de thumbnail
    if (tempThumbnailPath) {
      let tempThumbnailFullPath: string;

      // Verificar se é URL relativa ou caminho completo
      if (tempThumbnailPath.startsWith('/uploads/')) {
        tempThumbnailFullPath = path.join(
          process.cwd(),
          'public',
          tempThumbnailPath
        );
      } else {
        tempThumbnailFullPath = tempThumbnailPath;
      }

      console.log(
        '🖼️ [MOVE-FILES] Movendo thumbnail de:',
        tempThumbnailFullPath
      );
      console.log('🖼️ [MOVE-FILES] Para:', finalThumbnailPath);

      // Verificar se thumbnail temporário existe
      const thumbExists = await fs
        .access(tempThumbnailFullPath)
        .then(() => true)
        .catch(() => false);

      if (thumbExists) {
        // Copiar thumbnail
        await fs.copyFile(tempThumbnailFullPath, finalThumbnailPath);
        console.log(`✅ [MOVE-FILES] Thumbnail copiado com sucesso`);

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
            `🗑️ [MOVE-FILES] Thumbnail temporário removido: ${tempThumbnailFullPath}`
          );
        } else {
          console.warn(
            '⚠️ [MOVE-FILES] Cópia do thumbnail falhou - usando URL original'
          );
          thumbnailUrl = tempThumbnailPath;
        }
      } else {
        console.warn(
          '⚠️ [MOVE-FILES] Arquivo de thumbnail temporário não encontrado:',
          tempThumbnailFullPath
        );
        thumbnailUrl = tempThumbnailPath; // Usar URL original se não achou
      }
    }

    // Tentar limpar pasta temporária do usuário se estiver vazia
    try {
      if (tempPdfPath && tempPdfPath.includes('/temp/')) {
        const tempUserDir = path.dirname(
          path.join(process.cwd(), 'public', tempPdfPath)
        );
        const files = await fs.readdir(tempUserDir).catch(() => []);

        if (files.length === 0) {
          await fs.rmdir(tempUserDir);
          console.log(
            '🗑️ [MOVE-FILES] Pasta temporária vazia removida:',
            tempUserDir
          );
        } else {
          console.log(
            '📁 [MOVE-FILES] Pasta temporária ainda contém arquivos:',
            files.length
          );
        }
      }
    } catch (cleanupError) {
      console.warn(
        '⚠️ [MOVE-FILES] Erro ao limpar pasta temporária:',
        cleanupError
      );
    }

    console.log('✅ [MOVE-FILES] Movimentação concluída:', {
      pdfUrl,
      thumbnailUrl,
      scoreId: structure.scoreId,
    });

    return { pdfUrl, thumbnailUrl, scoreId: structure.scoreId };
  } catch (error) {
    console.error('❌ [MOVE-FILES] Erro ao mover arquivos temporários:', error);
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

    console.log('📄 [SCORE-CREATE] Dados recebidos:', {
      workId: body.workId,
      title: body.title,
      hasTemporaryFiles: body.hasTemporaryFiles,
      tempPdfPath: body.tempPdfPath,
      tempThumbnailPath: body.tempThumbnailPath,
      downloadUrl: body.downloadUrl,
    });

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

    // 🔧 CORREÇÃO PRINCIPAL: Mover arquivos temporários para pasta definitiva
    let finalPdfUrl = body.downloadUrl;
    let finalThumbnailUrl = body.thumbnailUrl;
    let scoreId: string | undefined;

    // 🔧 VERIFICAÇÃO MELHORADA PARA DETECTAR ARQUIVOS TEMPORÁRIOS
    const hasTemporaryFiles =
      body.hasTemporaryFiles === true ||
      (body.tempPdfPath && body.tempPdfPath.includes('/temp/')) ||
      (body.tempThumbnailPath && body.tempThumbnailPath.includes('/temp/')) ||
      (body.downloadUrl && body.downloadUrl.includes('/temp/'));

    console.log('🔍 [SCORE-CREATE] Verificação de arquivos temporários:', {
      hasTemporaryFiles,
      bodyHasTemporaryFiles: body.hasTemporaryFiles,
      tempPdfPath: body.tempPdfPath,
      tempThumbnailPath: body.tempThumbnailPath,
      downloadUrlHasTemp: body.downloadUrl?.includes('/temp/'),
    });

    if (
      hasTemporaryFiles &&
      (body.tempPdfPath ||
        body.tempThumbnailPath ||
        body.downloadUrl?.includes('/temp/'))
    ) {
      console.log(
        '📁 [SCORE-CREATE] Movendo arquivos temporários para estrutura definitiva...'
      );

      try {
        const movedFiles = await moveTemporaryFilesToFinal(
          body.tempPdfPath || body.downloadUrl,
          body.tempThumbnailPath || body.thumbnailUrl,
          body.title,
          body.workId
        );

        // 🔧 USAR OS CAMINHOS DEFINITIVOS RETORNADOS
        finalPdfUrl = movedFiles.pdfUrl;
        finalThumbnailUrl = movedFiles.thumbnailUrl || body.thumbnailUrl;
        scoreId = movedFiles.scoreId;

        console.log('✅ [SCORE-CREATE] Arquivos movidos com sucesso:', {
          originalPdf: body.downloadUrl,
          finalPdf: finalPdfUrl,
          originalThumbnail: body.thumbnailUrl,
          finalThumbnail: finalThumbnailUrl,
          scoreId,
        });
      } catch (moveError) {
        console.error('❌ [SCORE-CREATE] Erro ao mover arquivos:', moveError);

        // 🔧 EM CASO DE ERRO, CONTINUAR COM URLs ORIGINAIS MAS NOTIFICAR
        console.warn(
          '⚠️ [SCORE-CREATE] Continuando com URLs originais devido a erro na movimentação'
        );

        // Podemos escolher: falhar o upload ou continuar com arquivos temporários
        // Por segurança, vou continuar mas adicionar uma flag de erro
        finalPdfUrl = body.downloadUrl;
        finalThumbnailUrl = body.thumbnailUrl;
      }
    } else {
      console.log(
        'ℹ️ [SCORE-CREATE] Nenhum arquivo temporário detectado, usando URLs originais'
      );
    }

    // Gerar sourceId usando scoreId se disponível
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

    // 🔧 PREPARAR DADOS COM URLs DEFINITIVAS CORRETAS
    const scoreData = {
      workId: body.workId,
      sourceId: finalSourceId,
      source: body.source || 'CUSTOM',
      title: body.title,
      downloadUrl: finalPdfUrl, // 🔧 USANDO URL DEFINITIVA
      fileSize: body.fileSize || null,
      pageCount: body.pageCount || null,
      fileFormat: body.fileFormat || 'PDF',
      editor: body.editor || null,
      publisher: body.publisher || null,
      copyright: body.copyright || null,
      thumbnailUrl: finalThumbnailUrl, // 🔧 USANDO URL DEFINITIVA
      notes: body.notes || null,
      type: body.type || 'SCORES',
      groupIndex: body.groupIndex ? parseInt(body.groupIndex) : 0,
      groupTitle: body.groupTitle || null,
      rating: body.rating ? parseFloat(body.rating) : null,
      ratingsCount: body.ratingsCount ? parseInt(body.ratingsCount) : null,
      downloadCount: body.downloadCount ? parseInt(body.downloadCount) : null,
      isCustom: body.isCustom !== false,
      uploadedBy: userId,
      processingStatus: ProcessingStatus.COMPLETED,
      isActive: true,
      isVerified: false,
      lastVerified: new Date(),
      lastAccessed: new Date(),
    };

    console.log('💾 [SCORE-CREATE] Dados para salvar no banco:', {
      downloadUrl: scoreData.downloadUrl,
      thumbnailUrl: scoreData.thumbnailUrl,
      sourceId: scoreData.sourceId,
    });

    // Criar partitura no banco de dados
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

    console.log('✅ [SCORE-CREATE] WorkScore criado com sucesso:', {
      id: score.id,
      downloadUrl: score.downloadUrl,
      thumbnailUrl: score.thumbnailUrl,
    });

    // Registrar no histórico
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
        // Informações sobre arquivos
        hadTemporaryFiles: hasTemporaryFiles,
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
        // 🔧 RETORNAR URLs DEFINITIVAS
        downloadUrl: finalPdfUrl,
        thumbnailUrl: finalThumbnailUrl,
      },
      // Informações sobre a movimentação de arquivos
      fileMovement: hasTemporaryFiles
        ? {
            moved: true,
            finalPdfUrl,
            finalThumbnailUrl,
            originalPdfUrl: body.downloadUrl,
            originalThumbnailUrl: body.thumbnailUrl,
            scoreId,
          }
        : {
            moved: false,
            reason: 'No temporary files detected',
          },
    });
  } catch (error) {
    console.error('❌ [SCORE-CREATE] Erro ao criar partitura:', error);

    // Tratamento de erros específicos melhorado
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
