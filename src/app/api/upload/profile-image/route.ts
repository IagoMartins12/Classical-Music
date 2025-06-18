// app/api/upload/profile-image/route.ts (versão refinada com utilitários)
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import {
  validateImageFile,
  cleanOldImages,
  generateFileName,
  getUserUploadPath,
  getPublicImageUrl,
  getDirectoryInfo,
} from '@/app/utils/uploadUtils';

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // 1. Verificar autenticação
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Não autorizado' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    console.log(`🔄 Iniciando upload de imagem para usuário: ${userId}`);

    // 2. Extrair arquivo do form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'Nenhum arquivo enviado' },
        { status: 400 }
      );
    }

    // 3. Validar arquivo
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      return NextResponse.json(
        {
          success: false,
          message: 'Arquivo inválido',
          errors: validation.errors,
        },
        { status: 400 }
      );
    }

    console.log(
      `📁 Arquivo válido: ${file.name} (${(file.size / 1024 / 1024).toFixed(
        2
      )}MB)`
    );

    // 4. Preparar diretório do usuário
    const userUploadDir = getUserUploadPath(userId);
    await mkdir(userUploadDir, { recursive: true });

    // 5. Limpar imagens antigas
    console.log(`🧹 Limpando imagens antigas do usuário ${userId}...`);
    const cleanup = await cleanOldImages(userUploadDir);

    if (cleanup.removedFiles.length > 0) {
      console.log(
        `✅ Removidas ${cleanup.removedFiles.length} imagens antigas:`,
        cleanup.removedFiles
      );
    }

    if (cleanup.errors.length > 0) {
      console.warn(`⚠️ Erros na limpeza:`, cleanup.errors);
    }

    // 6. Gerar nome do arquivo e salvar
    const fileName = generateFileName(file.name);
    const filePath = path.join(userUploadDir, fileName);

    console.log(`💾 Salvando nova imagem: ${fileName}`);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // 7. Gerar URL pública
    const imageUrl = getPublicImageUrl(userId, fileName);

    // 8. Atualizar usuário no banco de dados
    await prisma.user.update({
      where: { id: userId },
      data: { image: imageUrl },
    });

    // 9. Obter informações do diretório para logging
    const dirInfo = await getDirectoryInfo(userUploadDir);
    const processingTime = Date.now() - startTime;

    console.log(
      `✅ Upload concluído em ${processingTime}ms para usuário ${userId}`
    );
    console.log(
      `📊 Diretório: ${dirInfo.totalFiles} arquivos, ${(
        dirInfo.totalSize /
        1024 /
        1024
      ).toFixed(2)}MB total`
    );
    console.log(`🔗 Nova URL: ${imageUrl}`);

    return NextResponse.json({
      success: true,
      message: 'Imagem carregada com sucesso!',
      imageUrl,
      meta: {
        fileName,
        fileSize: file.size,
        processingTime,
        removedOldFiles: cleanup.removedFiles.length,
      },
    });
  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error(`❌ Erro no upload após ${processingTime}ms:`, error);

    return NextResponse.json(
      {
        success: false,
        message: 'Erro interno do servidor',
      },
      { status: 500 }
    );
  }
}

// Endpoint para remover imagem de perfil
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Não autorizado' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    console.log(`🗑️ Removendo imagem de perfil do usuário: ${userId}`);

    // Limpar todas as imagens do usuário
    const userUploadDir = getUserUploadPath(userId);
    const cleanup = await cleanOldImages(userUploadDir);

    // Atualizar usuário no banco para remover referência da imagem
    await prisma.user.update({
      where: { id: userId },
      data: { image: null },
    });

    if (cleanup.removedFiles.length > 0) {
      console.log(
        `✅ Removidas ${cleanup.removedFiles.length} imagens do usuário ${userId}`
      );

      return NextResponse.json({
        success: true,
        message: 'Imagem de perfil removida com sucesso!',
        removedFiles: cleanup.removedFiles.length,
      });
    } else {
      return NextResponse.json({
        success: true,
        message: 'Nenhuma imagem encontrada para remover',
        removedFiles: 0,
      });
    }
  } catch (error) {
    console.error('❌ Erro ao remover imagem:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Endpoint para obter informações das imagens do usuário (opcional)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Não autorizado' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const userUploadDir = getUserUploadPath(userId);
    const dirInfo = await getDirectoryInfo(userUploadDir);

    return NextResponse.json({
      success: true,
      data: {
        userId,
        totalFiles: dirInfo.totalFiles,
        totalSize: dirInfo.totalSize,
        files: dirInfo.files,
        formattedSize: `${(dirInfo.totalSize / 1024 / 1024).toFixed(2)}MB`,
      },
    });
  } catch (error) {
    console.error('❌ Erro ao obter informações:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
