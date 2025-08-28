// app/api/admin/orphan-files/route.ts - ATUALIZADO PARA CLOUDINARY
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import {
  OrphanFileScanner,
  OrphanFileCategory,
} from '@/app/libs/orphanFiles/orphanFileScanner';
import {
  CloudinaryOrphanScanner,
  CloudinaryFileCategory,
} from '@/app/libs/orphanFiles/cloudinaryOrphanScanner';

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
    const includeCloudinary = searchParams.get('includeCloudinary') !== 'false'; // Default true
    const scanType = searchParams.get('scanType') || 'hybrid'; // 'local', 'cloudinary', 'hybrid'

    const minSize = searchParams.get('minSize')
      ? parseInt(searchParams.get('minSize')!)
      : undefined;
    const maxSize = searchParams.get('maxSize')
      ? parseInt(searchParams.get('maxSize')!)
      : undefined;

    const scanner = new OrphanFileScanner();
    const cloudinaryScanner = new CloudinaryOrphanScanner();

    switch (action) {
      case 'scan': {
        console.log(
          `🔍 [ORPHAN-SCAN] Iniciando scan ${scanType} ${
            category ? ` para categoria: ${category}` : ' completo'
          }`
        );

        const options: any = {
          includeTemp,
          minSize,
          maxSize,
          includeCloudinary: includeCloudinary && scanType !== 'local',
        };

        let result;

        if (scanType === 'cloudinary') {
          // 🆕 SCAN APENAS CLOUDINARY
          const cloudinaryResult =
            await cloudinaryScanner.scanCloudinaryOrphans();

          // Converter para formato compatível
          result = {
            totalFiles: cloudinaryResult.totalFiles,
            orphanFiles: [], // Arquivos locais vazios
            totalSize: 0, // Tamanho local
            formattedTotalSize: '0 B',
            categories: {
              profiles: 0,
              composers: 0,
              scores: 0,
              advertisements: 0,
              works: 0,
              general: 0,
              unknown: 0,
              cloudinary: cloudinaryResult.orphanFiles.length,
            },
            scanDuration: cloudinaryResult.scanDuration,
            scannedDirectories: cloudinaryResult.scannedFolders,
            errors: cloudinaryResult.errors,
            cloudinaryData: cloudinaryResult,
            includesCloudinary: true,
          };
        } else {
          // SCAN HÍBRIDO OU LOCAL
          if (category) {
            result = await scanner.scanByCategory(category, options);
          } else {
            result = await scanner.scanAll(options);
          }
        }

        const totalOrphans =
          result.orphanFiles.length +
          (result.cloudinaryData?.orphanFiles.length || 0);

        console.log(
          `✅ [ORPHAN-SCAN] Concluído: ${totalOrphans} órfãos encontrados`
        );

        return NextResponse.json({
          success: true,
          data: result,
          message: `Scan ${scanType} concluído: ${totalOrphans} arquivos órfãos encontrados`,
        });
      }

      case 'categories': {
        // 🆕 CATEGORIAS ATUALIZADAS COM CLOUDINARY
        const categories = [
          {
            value: 'profiles',
            label: 'Fotos de Perfil',
            description: 'Imagens de usuários',
            type: 'local',
          },
          {
            value: 'composers',
            label: 'Fotos de Compositores',
            description: 'Retratos de compositores',
            type: 'local',
          },
          {
            value: 'scores',
            label: 'Partituras',
            description: 'PDFs e thumbnails de partituras',
            type: 'hybrid', // Local + Cloudinary
          },
          {
            value: 'advertisements',
            label: 'Publicidades',
            description: 'Imagens e vídeos de anúncios',
            type: 'hybrid',
          },
          {
            value: 'works',
            label: 'Mídia de Obras',
            description: 'Áudios e vídeos de obras',
            type: 'hybrid',
          },
          {
            value: 'general',
            label: 'Gerais',
            description: 'Outros uploads',
            type: 'local',
          },
          {
            value: 'cloudinary',
            label: 'Cloudinary',
            description: 'Arquivos no Cloudinary (assignments, learned, etc.)',
            type: 'cloudinary',
          },
        ];

        return NextResponse.json({
          success: true,
          categories,
        });
      }

      case 'cloudinary-stats': {
        // 🆕 ESTATÍSTICAS DO CLOUDINARY
        try {
          const cloudinaryResult =
            await cloudinaryScanner.scanCloudinaryOrphans();

          return NextResponse.json({
            success: true,
            data: {
              totalFiles: cloudinaryResult.totalFiles,
              orphanFiles: cloudinaryResult.orphanFiles.length,
              totalSize: cloudinaryResult.totalSize,
              formattedTotalSize: cloudinaryResult.formattedTotalSize,
              categories: cloudinaryResult.categories,
              scannedFolders: cloudinaryResult.scannedFolders,
            },
          });
        } catch (error) {
          console.error('❌ [CLOUDINARY-STATS] Erro:', error);
          return NextResponse.json({
            success: false,
            error: 'Erro ao obter estatísticas do Cloudinary',
            details:
              error instanceof Error ? error.message : 'Erro desconhecido',
          });
        }
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

    const body = await request.json();
    const { filePaths, cloudinaryPublicIds } = body;

    // Validar se pelo menos um tipo de arquivo foi enviado
    if (
      (!filePaths || filePaths.length === 0) &&
      (!cloudinaryPublicIds || cloudinaryPublicIds.length === 0)
    ) {
      return NextResponse.json(
        { error: 'Lista de arquivos ou publicIds é obrigatória' },
        { status: 400 }
      );
    }

    console.log(`🗑️ [ORPHAN-DELETE] Removendo arquivos órfãos:`, {
      localFiles: filePaths?.length || 0,
      cloudinaryFiles: cloudinaryPublicIds?.length || 0,
    });

    const scanner = new OrphanFileScanner();
    const result = await scanner.removeOrphanFiles(
      filePaths || [],
      cloudinaryPublicIds || []
    );

    const totalRemoved =
      (result.localResult?.removed.length || 0) +
      (result.cloudinaryResult?.removed.length || 0);
    const totalFailed =
      (result.localResult?.failed.length || 0) +
      (result.cloudinaryResult?.failed.length || 0);

    console.log(
      `✅ [ORPHAN-DELETE] Concluído: ${totalRemoved} removidos, ${totalFailed} falharam`
    );

    return NextResponse.json({
      success: true,
      data: {
        ...result,
        summary: {
          totalRemoved,
          totalFailed,
          totalSizeFreed: result.totalSizeFreed,
        },
      },
      message: `${totalRemoved} arquivos removidos com sucesso`,
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
