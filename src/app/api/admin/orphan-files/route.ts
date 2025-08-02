// app/api/admin/orphan-files/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import {
  OrphanFileScanner,
  OrphanFileCategory,
} from '@/app/libs/orphanFiles/orphanFileScanner';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role < 2) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'scan';
    const category = searchParams.get('category') as OrphanFileCategory;
    const includeTemp = searchParams.get('includeTemp') === 'true';
    const minSize = searchParams.get('minSize')
      ? parseInt(searchParams.get('minSize')!)
      : undefined;
    const maxSize = searchParams.get('maxSize')
      ? parseInt(searchParams.get('maxSize')!)
      : undefined;

    const scanner = new OrphanFileScanner();

    switch (action) {
      case 'scan': {
        console.log(
          `🔍 [ORPHAN-SCAN] Iniciando scan${
            category ? ` para categoria: ${category}` : ' completo'
          }`
        );

        const options = {
          includeTemp,
          minSize,
          maxSize,
        };

        let result;
        if (category) {
          result = await scanner.scanByCategory(category, options);
        } else {
          result = await scanner.scanAll(options);
        }

        console.log(
          `✅ [ORPHAN-SCAN] Concluído: ${result.orphanFiles.length} órfãos encontrados`
        );

        return NextResponse.json({
          success: true,
          data: result,
          message: `Scan concluído: ${result.orphanFiles.length} arquivos órfãos encontrados`,
        });
      }

      case 'categories': {
        const categories = [
          {
            value: 'profiles',
            label: 'Fotos de Perfil',
            description: 'Imagens de usuários',
          },
          {
            value: 'composers',
            label: 'Fotos de Compositores',
            description: 'Retratos de compositores',
          },
          {
            value: 'scores',
            label: 'Partituras',
            description: 'PDFs e thumbnails de partituras',
          },
          {
            value: 'advertisements',
            label: 'Publicidades',
            description: 'Imagens e vídeos de anúncios',
          },
          {
            value: 'works',
            label: 'Mídia de Obras',
            description: 'Áudios e vídeos de obras',
          },
          { value: 'general', label: 'Gerais', description: 'Outros uploads' },
        ];

        return NextResponse.json({
          success: true,
          categories,
        });
      }

      default:
        return NextResponse.json(
          { error: 'Ação não reconhecida' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('❌ [ORPHAN-SCAN] Erro na API:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role < 2) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { filePaths } = await request.json();

    if (!Array.isArray(filePaths) || filePaths.length === 0) {
      return NextResponse.json(
        { error: 'Lista de arquivos é obrigatória' },
        { status: 400 }
      );
    }

    console.log(
      `🗑️ [ORPHAN-DELETE] Removendo ${filePaths.length} arquivos órfãos`
    );

    const scanner = new OrphanFileScanner();
    const result = await scanner.removeOrphanFiles(filePaths);

    console.log(
      `✅ [ORPHAN-DELETE] Concluído: ${result.removed.length} removidos, ${result.failed.length} falharam`
    );

    return NextResponse.json({
      success: true,
      data: result,
      message: `${result.removed.length} arquivos removidos com sucesso`,
    });
  } catch (error) {
    console.error('❌ [ORPHAN-DELETE] Erro ao remover arquivos:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    );
  }
}
