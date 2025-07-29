// app/api/upload/route.ts - SISTEMA COM UPLOADS TEMPORÁRIOS E DEFINITIVOS
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { generateUniqueFileName } from '@/app/utils/fileUtils';
import { sanitizeWorkTitle } from '@/app/utils/pdfUtils';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string;

    // 🆕 Novos parâmetros para diferentes tipos de upload
    const userId = formData.get('userId') as string;
    const tempId = formData.get('tempId') as string;
    const workTitle = formData.get('workTitle') as string;
    const year = formData.get('year') as string;
    const month = formData.get('month') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'Arquivo não fornecido' },
        { status: 400 }
      );
    }

    console.log('📤 [UPLOAD] Novo upload:', {
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      uploadType: type,
      user: session.user.name || session.user.email,
    });

    // 🆕 Validação de tipo expandida para novos tipos
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
      // 🆕 Novos tipos para o sistema de thumbnails
      'score-temp': ['image/png', 'image/jpeg', 'application/pdf'],
      'score-final': ['image/png', 'image/jpeg', 'application/pdf'],
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
      'score-temp': 50 * 1024 * 1024, // 50MB para uploads temporários
      'score-final': 50 * 1024 * 1024, // 50MB para uploads definitivos
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

    if (file.size === 0) {
      return NextResponse.json(
        { error: 'Arquivo está vazio' },
        { status: 400 }
      );
    }

    // 🆕 Determinar estrutura de pastas baseado no tipo
    let uploadDir: string;
    let fileName: string;
    let publicUrl: string;
    let tempPath: string | undefined;

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = (now.getMonth() + 1).toString().padStart(2, '0');

    switch (type) {
      case 'score-temp':
        // 🆕 Upload temporário na pasta do usuário
        if (!userId || !tempId) {
          return NextResponse.json(
            {
              error:
                'userId e tempId são obrigatórios para uploads temporários',
            },
            { status: 400 }
          );
        }

        fileName = file.name.includes('thumb')
          ? `temp-${tempId}-thumb.png`
          : `temp-${tempId}.pdf`;

        uploadDir = path.join(
          process.cwd(),
          'public',
          'uploads',
          'scores',
          'temp',
          userId
        );

        publicUrl = `/uploads/scores/temp/${userId}/${fileName}`;
        tempPath = path.join(uploadDir, fileName); // Para mover depois
        break;

      case 'score-final':
        // 🆕 Upload definitivo na estrutura organizada por obra
        if (!workTitle || !year || !month) {
          return NextResponse.json(
            {
              error:
                'workTitle, year e month são obrigatórios para uploads definitivos',
            },
            { status: 400 }
          );
        }

        const cleanTitle = sanitizeWorkTitle(workTitle);
        fileName = file.name.includes('thumb')
          ? `${cleanTitle}-thumb.png`
          : `${cleanTitle}.pdf`;

        uploadDir = path.join(
          process.cwd(),
          'public',
          'uploads',
          'scores',
          'final',
          year,
          month,
          cleanTitle
        );

        publicUrl = `/uploads/scores/final/${year}/${month}/${cleanTitle}/${fileName}`;
        break;

      case 'image':
        // Upload de imagem padrão (para thumbnails manuais, etc.)
        const prefix = 'image';
        fileName = generateUniqueFileName(file.name, prefix);

        uploadDir = path.join(
          process.cwd(),
          'public',
          'uploads',
          type,
          currentYear.toString(),
          currentMonth
        );

        publicUrl = `/uploads/${type}/${currentYear}/${currentMonth}/${fileName}`;
        break;

      default:
        // Upload padrão (score normal, outros tipos)
        const defaultPrefix =
          type === 'image' && file.name.includes('thumbnail') ? 'thumb' : type;
        fileName = generateUniqueFileName(file.name, defaultPrefix);

        uploadDir = path.join(
          process.cwd(),
          'public',
          'uploads',
          type,
          currentYear.toString(),
          currentMonth
        );

        publicUrl = `/uploads/${type}/${currentYear}/${currentMonth}/${fileName}`;
        break;
    }

    const filePath = path.join(uploadDir, fileName);

    console.log('📁 [UPLOAD] Estrutura de pastas:', {
      type,
      uploadDir: uploadDir.replace(process.cwd(), '.'),
      fileName,
      publicUrl,
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

    // 🆕 Metadados expandidos para diferentes tipos
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

      // 🆕 Campos específicos para sistema de thumbnails
      tempPath: tempPath, // Para uploads temporários
      workTitle: workTitle, // Para uploads definitivos
      isTemporary: type === 'score-temp',
      isFinal: type === 'score-final',

      path: {
        relative: publicUrl,
        directory: uploadDir.replace(path.join(process.cwd(), 'public'), ''),
        filename: fileName,
        absolute: filePath,
      },
      message: 'Upload realizado com sucesso',
    };

    console.log('✅ [UPLOAD] Concluído:', {
      url: publicUrl,
      size: file.size,
      type: file.type,
      isTemporary: type === 'score-temp',
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
