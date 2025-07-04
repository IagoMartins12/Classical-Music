// app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'Arquivo não fornecido' },
        { status: 400 }
      );
    }

    // Validar tipo de arquivo
    const allowedTypes = {
      score: [
        'application/pdf',
        'audio/midi',
        'audio/x-midi',
        'image/svg+xml',
        'image/png',
        'image/jpeg',
      ],
      image: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
    };

    const validTypes = allowedTypes[type as keyof typeof allowedTypes] || [];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error: 'Tipo de arquivo não suportado',
        },
        { status: 400 }
      );
    }

    // Validar tamanho do arquivo (50MB max)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        {
          error: 'Arquivo muito grande (máximo 50MB)',
        },
        { status: 400 }
      );
    }

    // Gerar nome único para o arquivo
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 15);
    const extension = path.extname(file.name);
    const fileName = `${timestamp}-${randomStr}${extension}`;

    // Definir pasta de upload
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', type);
    const filePath = path.join(uploadDir, fileName);

    // Criar diretório se não existir
    await mkdir(uploadDir, { recursive: true });

    // Salvar arquivo
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Retornar URL pública do arquivo
    const publicUrl = `/uploads/${type}/${fileName}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename: fileName,
      size: file.size,
      type: file.type,
      message: 'Upload realizado com sucesso',
    });
  } catch (error) {
    console.error('Erro no upload:', error);
    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
      },
      { status: 500 }
    );
  }
}
