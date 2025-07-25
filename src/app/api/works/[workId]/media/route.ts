// app/api/works/[workId]/media/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import prisma from '@/app/libs/prismadb';

interface Params {
  workId: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { workId } = await params;

    // Verificar se a obra existe e permissões
    const work = await prisma.work.findUnique({
      where: { id: workId },
      select: {
        id: true,
        title: true,
        createdBy: true,
      },
    });

    if (!work) {
      return NextResponse.json(
        { error: 'Obra não encontrada' },
        { status: 404 }
      );
    }

    // Verificar permissões
    const isAdmin = session.user.role >= 1;
    const isOwner = work.createdBy === session.user.id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const mediaType = formData.get('mediaType') as string; // 'audio', 'video', 'videoAula'

    if (!file) {
      return NextResponse.json(
        { error: 'Arquivo não fornecido' },
        { status: 400 }
      );
    }

    console.log('📤 [MEDIA-UPLOAD] Novo upload de mídia:', {
      workId,
      workTitle: work.title,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      mediaType,
      user: session.user.email,
    });

    // Validação de tipos por categoria
    const allowedTypes = {
      audio: [
        'audio/mpeg',
        'audio/mp3',
        'audio/wav',
        'audio/ogg',
        'audio/aac',
        'audio/m4a',
        'audio/flac',
      ],
      video: [
        'video/mp4',
        'video/webm',
        'video/ogg',
        'video/avi',
        'video/mov',
        'video/mkv',
      ],
      videoAula: [
        'video/mp4',
        'video/webm',
        'video/ogg',
        'video/avi',
        'video/mov',
        'video/mkv',
        'video/quicktime',
      ],
    };

    const validTypes =
      allowedTypes[mediaType as keyof typeof allowedTypes] || [];

    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error: `Tipo de arquivo não suportado para ${mediaType}: ${file.type}`,
          allowedTypes: validTypes,
        },
        { status: 400 }
      );
    }

    // Validação de tamanho (mais generoso para mídia)
    const maxSizes = {
      audio: 100 * 1024 * 1024, // 100MB
      video: 500 * 1024 * 1024, // 500MB
      videoAula: 500 * 1024 * 1024, // 500MB
    };

    const maxSize =
      maxSizes[mediaType as keyof typeof maxSizes] || 100 * 1024 * 1024;

    if (file.size > maxSize) {
      return NextResponse.json(
        {
          error: `Arquivo muito grande (máximo ${Math.round(
            maxSize / 1024 / 1024
          )}MB para ${mediaType})`,
        },
        { status: 400 }
      );
    }

    // Gerar nome único
    const timestamp = Date.now();
    const fileExtension = path.extname(file.name);
    const baseName = path.basename(file.name, fileExtension);
    const sanitizedBaseName = baseName.replace(/[^a-zA-Z0-9-_]/g, '_');
    const fileName = `${sanitizedBaseName}_${timestamp}${fileExtension}`;

    // Estrutura: uploads/[workId]/media/[mediaType]/
    const uploadDir = path.join(
      process.cwd(),
      'public',
      'uploads',
      workId,
      'media',
      mediaType
    );
    const filePath = path.join(uploadDir, fileName);

    console.log('📁 [MEDIA-UPLOAD] Estrutura:', {
      uploadDir: uploadDir.replace(process.cwd(), '.'),
      fileName,
    });

    // Criar diretório
    await mkdir(uploadDir, { recursive: true });

    // Salvar arquivo
    try {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filePath, buffer);

      console.log('✅ [MEDIA-UPLOAD] Arquivo salvo:', {
        size: buffer.length,
        path: filePath.replace(process.cwd(), '.'),
      });
    } catch (writeError) {
      console.error('❌ [MEDIA-UPLOAD] Erro ao salvar:', writeError);
      throw new Error('Erro ao salvar arquivo no servidor');
    }

    // URL pública
    const publicUrl = `/uploads/${workId}/media/${mediaType}/${fileName}`;

    // Metadados do arquivo
    const fileMetadata = {
      originalName: file.name,
      fileName,
      size: file.size,
      type: file.type,
      uploadDate: new Date().toISOString(),
      uploadedBy: session.user.id,
    };

    const response = {
      success: true,
      url: publicUrl,
      metadata: fileMetadata,
      message: `${mediaType} enviado com sucesso`,
    };

    console.log('✅ [MEDIA-UPLOAD] Concluído:', {
      workId,
      mediaType,
      url: publicUrl,
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error('❌ [MEDIA-UPLOAD] Erro geral:', error);

    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    );
  }
}

// DELETE - Remover arquivo de mídia
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { workId } = await params;
    const { searchParams } = new URL(request.url);
    const fileName = searchParams.get('fileName');
    const mediaType = searchParams.get('mediaType');

    if (!fileName || !mediaType) {
      return NextResponse.json(
        { error: 'fileName e mediaType são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar permissões
    const work = await prisma.work.findUnique({
      where: { id: workId },
      select: { createdBy: true },
    });

    if (!work) {
      return NextResponse.json(
        { error: 'Obra não encontrada' },
        { status: 404 }
      );
    }

    const isAdmin = session.user.role >= 1;
    const isOwner = work.createdBy === session.user.id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }

    // Remover arquivo
    const filePath = path.join(
      process.cwd(),
      'public',
      'uploads',
      workId,
      'media',
      mediaType,
      fileName
    );

    try {
      const { unlink } = await import('fs/promises');
      await unlink(filePath);
      console.log('🗑️ [MEDIA-UPLOAD] Arquivo removido:', fileName);
    } catch (error) {
      console.warn('⚠️ [MEDIA-UPLOAD] Arquivo não encontrado:', error);
    }

    return NextResponse.json({
      success: true,
      message: 'Arquivo removido com sucesso',
    });
  } catch (error) {
    console.error('❌ [MEDIA-UPLOAD] Erro ao remover:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
