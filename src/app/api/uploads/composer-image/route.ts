// app/api/upload/composer-image/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import {
  validateImageFile,
  cleanOldImages,
  generateFileName,
} from '@/app/utils/uploadUtils';

// Função para obter caminho de upload de compositores
function getComposerUploadPath(composerId?: string) {
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'composers');
  return composerId ? path.join(uploadDir, composerId) : uploadDir;
}

// Função para gerar URL pública da imagem do compositor
function getPublicComposerImageUrl(composerId: string, fileName: string) {
  return `/uploads/composers/${composerId}/${fileName}`;
}

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

    console.log(
      `🎼 Iniciando upload de imagem de compositor para usuário: ${session.user.id}`
    );

    // 2. Extrair dados do form
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const composerId = formData.get('composerId') as string;
    const composerName = formData.get('composerName') as string;

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
      `📁 Arquivo válido para compositor: ${file.name} (${(
        file.size /
        1024 /
        1024
      ).toFixed(2)}MB)`
    );

    // 4. Gerar ID único para o compositor se não fornecido
    const finalComposerId =
      composerId ||
      `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // 5. Preparar diretório do compositor
    const composerUploadDir = getComposerUploadPath(finalComposerId);
    await mkdir(composerUploadDir, { recursive: true });

    // 6. Limpar imagens antigas do compositor
    console.log(
      `🧹 Limpando imagens antigas do compositor ${finalComposerId}...`
    );
    const cleanup = await cleanOldImages(composerUploadDir);

    if (cleanup.removedFiles.length > 0) {
      console.log(
        `✅ Removidas ${cleanup.removedFiles.length} imagens antigas do compositor:`,
        cleanup.removedFiles
      );
    }

    // 7. Gerar nome do arquivo e salvar
    const fileName = generateFileName(file.name);
    const filePath = path.join(composerUploadDir, fileName);

    console.log(`💾 Salvando imagem do compositor: ${fileName}`);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // 8. Gerar URL pública
    const imageUrl = getPublicComposerImageUrl(finalComposerId, fileName);

    // 9. Obter informações do diretório
    // const dirInfo = await getDirectoryInfo(composerUploadDir);
    const processingTime = Date.now() - startTime;

    console.log(
      `✅ Upload de imagem de compositor concluído em ${processingTime}ms`
    );
    console.log(`🔗 Nova URL da imagem: ${imageUrl}`);

    return NextResponse.json({
      success: true,
      message: 'Imagem do compositor carregada com sucesso!',
      imageUrl,
      composerId: finalComposerId,
      meta: {
        fileName,
        fileSize: file.size,
        processingTime,
        removedOldFiles: cleanup.removedFiles.length,
        composerName,
      },
    });
  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error(
      `❌ Erro no upload de imagem de compositor após ${processingTime}ms:`,
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: 'Erro interno do servidor',
      },
      { status: 500 }
    );
  }
}

// Endpoint para remover imagem de compositor
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Não autorizado' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const composerId = searchParams.get('composerId');

    if (!composerId) {
      return NextResponse.json(
        { success: false, message: 'ID do compositor é obrigatório' },
        { status: 400 }
      );
    }

    console.log(`🗑️ Removendo imagem do compositor: ${composerId}`);

    // Limpar todas as imagens do compositor
    const composerUploadDir = getComposerUploadPath(composerId);
    const cleanup = await cleanOldImages(composerUploadDir);

    if (cleanup.removedFiles.length > 0) {
      console.log(
        `✅ Removidas ${cleanup.removedFiles.length} imagens do compositor ${composerId}`
      );

      return NextResponse.json({
        success: true,
        message: 'Imagem do compositor removida com sucesso!',
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
    console.error('❌ Erro ao remover imagem do compositor:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
