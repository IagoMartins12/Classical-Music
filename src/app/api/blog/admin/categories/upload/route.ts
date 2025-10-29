// app/api/blog/admin/categories/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import { writeFile, mkdir, unlink } from 'fs/promises';
import path from 'path';
import {
  validateImageFile,
  generateFileName,
} from '@/app/utils/BlogUploadUtils';

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

    console.log(
      `🔄 Iniciando upload de imagem de categoria por: ${session.user.email}`
    );

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const categoryId = formData.get('categoryId') as string | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'Arquivo é obrigatório' },
        { status: 400 }
      );
    }

    // Validar arquivo
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Arquivo inválido',
          details: validation.errors,
        },
        { status: 400 }
      );
    }

    console.log(
      `📁 Arquivo válido: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`
    );

    // Preparar diretório de categorias
    const uploadDir = path.join(process.cwd(), 'public', 'blog', 'categories');

    await mkdir(uploadDir, { recursive: true });

    // Gerar nome do arquivo
    const fileName = categoryId
      ? `category-${categoryId}-${generateFileName(file.name)}`
      : generateFileName(file.name);

    const filePath = path.join(uploadDir, fileName);

    console.log(`💾 Salvando imagem: ${fileName}`);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Gerar URL pública
    const imageUrl = `uploads/blog/categories/${fileName}`;

    const processingTime = Date.now() - startTime;

    console.log(`✅ Upload concluído em ${processingTime}ms`);
    console.log(`🔗 Nova URL: ${imageUrl}`);

    return NextResponse.json({
      success: true,
      url: imageUrl,
      fileName,
      format: file.type.split('/')[1],
      size: file.size,
      message: 'Upload realizado com sucesso',
      meta: {
        processingTime,
        categoryId: categoryId || null,
      },
    });
  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error(`❌ Erro no upload após ${processingTime}ms:`, error);

    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno do servidor',
      },
      { status: 500 }
    );
  }
}

// Endpoint para remover imagem de categoria
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

    // Extrair caminho do arquivo da URL
    const urlPath = imageUrl.replace(/^\//, '');
    const filePath = path.join(process.cwd(), 'public', urlPath);

    await unlink(filePath);

    console.log(`✅ Imagem de categoria removida: ${imageUrl}`);

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
