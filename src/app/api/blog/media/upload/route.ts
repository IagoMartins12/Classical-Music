// app/api/blog/media/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import { writeFile, mkdir, readdir, rename, unlink } from 'fs/promises';
import path from 'path';
import {
  validateImageFile,
  generateFileName,
} from '@/app/utils/BlogUploadUtils';

// 🆕 FUNÇÃO PARA VALIDAR ÁUDIO
function validateAudioFile(file: File) {
  const errors: string[] = [];

  // Validar tipo
  const validTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg'];
  if (!validTypes.includes(file.type)) {
    errors.push('Tipo de arquivo inválido. Use MP3, WAV ou OGG.');
  }

  // Validar tamanho (10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    errors.push('Arquivo muito grande. Máximo: 10MB.');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role < 1) {
      return NextResponse.json(
        { success: false, error: 'Não autorizado' },
        { status: 401 }
      );
    }

    console.log(`🔄 Iniciando upload por: ${session.user.email}`);

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const articleId = formData.get('articleId') as string | null;
    const folder = formData.get('folder') as string;
    const sessionId = formData.get('sessionId') as string;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'Arquivo é obrigatório' },
        { status: 400 }
      );
    }

    // 🔄 VALIDAR ARQUIVO BASEADO NO TIPO
    let validation;

    if (folder === 'audio') {
      // Validar como áudio
      validation = validateAudioFile(file);
      console.log('🎵 Validando áudio...');
    } else {
      // Validar como imagem
      validation = validateImageFile(file);
      console.log('🖼️ Validando imagem...');
    }

    if (!validation.isValid) {
      console.log('❌ Validação falhou:', validation.errors);
      return NextResponse.json(
        {
          success: false,
          error: 'Arquivo inválido',
          details: validation.errors,
        },
        { status: 400 }
      );
    }

    let uploadDir: string;
    let fileUrl: string;
    const fileName = generateFileName(file.name);

    // Se não tem articleId, salva em pasta temporária
    if (!articleId) {
      const tempSessionId = sessionId || `temp-${Date.now()}`;
      uploadDir = path.join(
        process.cwd(),
        'public',
        'blog',
        '_temp',
        tempSessionId,
        folder || 'images'
      );
      fileUrl = `uploads/blog/_temp/${tempSessionId}/${folder || 'images'}/${fileName}`;

      console.log(`📁 Upload temporário: ${tempSessionId}`);
    } else {
      // Upload definitivo com articleId
      uploadDir = path.join(
        process.cwd(),
        'public',
        'blog',
        articleId,
        folder || 'thumbnail'
      );
      fileUrl = `uploads/blog/${articleId}/${folder || 'thumbnail'}/${fileName}`;
    }

    await mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, fileName);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    const processingTime = Date.now() - startTime;

    console.log(`✅ Upload concluído em ${processingTime}ms`);
    console.log(`🔗 URL: ${fileUrl}`);

    return NextResponse.json({
      success: true,
      url: fileUrl,
      fileName,
      isTemporary: !articleId,
      sessionId: !articleId ? sessionId || `temp-${Date.now()}` : undefined,
      format: file.type.split('/')[1],
      size: file.size,
      fileType: folder === 'audio' ? 'audio' : 'image', // 🆕 Indicar tipo
      message: 'Upload realizado com sucesso',
      meta: {
        processingTime,
        articleId: articleId || null,
        folder: folder || 'thumbnail',
      },
    });
  } catch (error) {
    console.error(`❌ Erro no upload:`, error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// ... (resto do código permanece igual: PUT e DELETE)
// Função para mover arquivos temporários para pasta definitiva
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role < 1) {
      return NextResponse.json(
        { success: false, error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const { sessionId, articleId } = await request.json();

    if (!sessionId || !articleId) {
      return NextResponse.json(
        { success: false, error: 'sessionId e articleId são obrigatórios' },
        { status: 400 }
      );
    }

    const tempDir = path.join(
      process.cwd(),
      'public',
      'blog',
      '_temp',
      sessionId
    );
    const finalDir = path.join(process.cwd(), 'public', 'blog', articleId);

    console.log(`🔄 Movendo arquivos de ${sessionId} para ${articleId}`);

    try {
      // Verificar se existe diretório temporário
      await mkdir(tempDir, { recursive: true });
      const folders = await readdir(tempDir);

      const movedFiles: string[] = [];

      // Mover cada pasta (thumbnail, content, timeline, etc)
      for (const folderName of folders) {
        const sourceFolderPath = path.join(tempDir, folderName);
        const targetFolderPath = path.join(finalDir, folderName);

        await mkdir(targetFolderPath, { recursive: true });

        const files = await readdir(sourceFolderPath);

        for (const file of files) {
          const sourceFile = path.join(sourceFolderPath, file);
          const targetFile = path.join(targetFolderPath, file);

          await rename(sourceFile, targetFile);
          movedFiles.push(`${folderName}/${file}`);

          console.log(`✅ Movido: ${file}`);
        }
      }

      // Limpar diretório temporário
      await unlink(tempDir).catch(() => {});

      console.log(`✅ Total de ${movedFiles.length} arquivos movidos`);

      return NextResponse.json({
        success: true,
        movedFiles,
        message: 'Arquivos movidos com sucesso',
      });
    } catch (error) {
      console.error('❌ Erro ao mover arquivos:', error);
      throw error;
    }
  } catch (error) {
    console.error('❌ Erro na operação:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao mover arquivos' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role < 1) {
      return NextResponse.json(
        { success: false, error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('url');

    if (!imageUrl) {
      return NextResponse.json(
        { success: false, error: 'URL da imagem é obrigatória' },
        { status: 400 }
      );
    }

    const urlPath = imageUrl.replace(/^\//, '');
    const filePath = path.join(process.cwd(), 'public', urlPath);

    await unlink(filePath);

    console.log(`✅ Imagem removida: ${imageUrl}`);

    return NextResponse.json({
      success: true,
      message: 'Imagem removida com sucesso',
    });
  } catch (error) {
    console.error('❌ Erro ao remover imagem:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao remover imagem' },
      { status: 500 }
    );
  }
}
