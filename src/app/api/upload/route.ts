// app/api/upload/route.ts - VERSÃO MELHORADA
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { generateUniqueFileName } from '@/app/utils/fileUtils';

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

    // 🆕 Logs detalhados para debug
    console.log('📤 [UPLOAD] Novo upload:', {
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      uploadType: type,
      user: session.user.name || session.user.email,
    });

    // 🆕 Validação de tipo expandida
    const allowedTypes = {
      score: [
        'application/pdf',
        'audio/midi',
        'audio/x-midi',
        'application/x-midi',
        'image/svg+xml',
        'image/png',
        'image/jpeg',
        'text/xml',
        'application/xml',
        'application/musicxml+xml',
      ],
      image: [
        'image/png',
        'image/jpeg',
        'image/gif',
        'image/webp',
        'image/jpg',
      ],
    };

    const validTypes = allowedTypes[type as keyof typeof allowedTypes] || [];

    if (!validTypes.includes(file.type)) {
      console.error('❌ [UPLOAD] Tipo não suportado:', {
        provided: file.type,
        allowed: validTypes,
      });

      return NextResponse.json(
        {
          error: `Tipo de arquivo não suportado: ${file.type}`,
          allowedTypes: validTypes,
        },
        { status: 400 }
      );
    }

    // 🆕 Validação de tamanho por tipo
    const maxSizes = {
      score: 50 * 1024 * 1024, // 50MB para partituras
      image: 10 * 1024 * 1024, // 10MB para imagens
    };

    const maxSize = maxSizes[type as keyof typeof maxSizes] || 10 * 1024 * 1024;

    if (file.size > maxSize) {
      return NextResponse.json(
        {
          error: `Arquivo muito grande (máximo ${Math.round(
            maxSize / 1024 / 1024
          )}MB)`,
        },
        { status: 400 }
      );
    }

    // 🆕 Verificação adicional para arquivos vazios
    if (file.size === 0) {
      return NextResponse.json(
        {
          error: 'Arquivo está vazio',
        },
        { status: 400 }
      );
    }

    // 🆕 Gerar nome único mais descritivo
    const prefix =
      type === 'image' && file.name.includes('thumbnail') ? 'thumb' : type;
    const fileName = generateUniqueFileName(file.name, prefix);

    // 🆕 Estrutura de pastas por data (YYYY/MM)
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const dateFolder = `${year}/${month}`;

    // Definir pasta de upload com estrutura hierárquica
    const uploadDir = path.join(
      process.cwd(),
      'public',
      'uploads',
      type,
      dateFolder
    );
    const filePath = path.join(uploadDir, fileName);

    console.log('📁 [UPLOAD] Estrutura de pastas:', {
      uploadDir: uploadDir.replace(process.cwd(), '.'),
      fileName,
      fullPath: filePath.replace(process.cwd(), '.'),
    });

    // Criar diretório se não existir
    await mkdir(uploadDir, { recursive: true });

    // 🆕 Salvar arquivo com tratamento de erro melhorado
    try {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filePath, buffer);

      console.log('✅ [UPLOAD] Arquivo salvo com sucesso:', {
        size: buffer.length,
        path: filePath.replace(process.cwd(), '.'),
      });
    } catch (writeError) {
      console.error('❌ [UPLOAD] Erro ao salvar arquivo:', writeError);
      throw new Error('Erro ao salvar arquivo no servidor');
    }

    // 🆕 URL pública estruturada
    const publicUrl = `/uploads/${type}/${dateFolder}/${fileName}`;

    // 🆕 Metadados adicionais
    const fileExtension = path.extname(file.name).toLowerCase();
    const fileBaseName = path.basename(file.name, fileExtension);

    const response = {
      success: true,
      url: publicUrl,
      filename: fileName,
      originalName: file.name,
      baseName: fileBaseName,
      extension: fileExtension,
      size: file.size,
      type: file.type,
      uploadType: type,
      uploadDate: now.toISOString(),
      path: {
        relative: publicUrl,
        directory: `/uploads/${type}/${dateFolder}`,
        filename: fileName,
      },
      message: 'Upload realizado com sucesso',
    };

    console.log('✅ [UPLOAD] Concluído:', {
      url: publicUrl,
      size: file.size,
      type: file.type,
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error('❌ [UPLOAD] Erro geral:', error);

    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    );
  }
}
