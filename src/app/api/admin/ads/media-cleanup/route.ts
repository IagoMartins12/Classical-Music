// app/api/admin/ads/media-cleanup/route.ts - API para limpeza de mídia órfã
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import {
  findOrphanedMediaDirectories,
  removeOrphanedMediaDirectories,
  checkMediaIntegrity,
  generateMediaReport,
} from '@/app/libs/ads/mediaCleanup';

// GET - Gerar relatório de mídia
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Apenas super admins podem executar limpeza de mídia
    if (!session?.user || session.user.role < 2) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'report';

    switch (action) {
      case 'report':
        const report = await generateMediaReport();
        return NextResponse.json({
          success: true,
          data: report,
          message: 'Relatório de mídia gerado com sucesso',
        });

      case 'orphaned':
        const orphanedDirectories = await findOrphanedMediaDirectories();
        return NextResponse.json({
          success: true,
          data: { orphanedDirectories },
          message: `Encontradas ${orphanedDirectories.length} pasta(s) órfã(s)`,
        });

      case 'integrity':
        const integrityCheck = await checkMediaIntegrity();
        return NextResponse.json({
          success: true,
          data: integrityCheck,
          message: 'Verificação de integridade concluída',
        });

      default:
        return NextResponse.json(
          { error: 'Ação não reconhecida' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('❌ Erro na API de limpeza de mídia:', error);
    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    );
  }
}

// POST - Executar limpeza de mídia
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Apenas super admins podem executar limpeza de mídia
    if (!session?.user || session.user.role < 2) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { action = 'cleanup', dryRun = true, directories = [] } = body;

    switch (action) {
      case 'cleanup':
        console.log(`🧹 Iniciando limpeza de mídia (dryRun: ${dryRun})`);

        const result = await removeOrphanedMediaDirectories(
          directories,
          dryRun
        );

        const message = dryRun
          ? `Simulação: ${
              result.removed.length
            } pasta(s) seriam removidas, liberando ${formatFileSize(
              result.totalSize
            )}`
          : `Limpeza concluída: ${
              result.removed.length
            } pasta(s) removidas, ${formatFileSize(
              result.totalSize
            )} liberados`;

        return NextResponse.json({
          success: true,
          data: {
            ...result,
            dryRun,
            formattedSize: formatFileSize(result.totalSize),
          },
          message,
          warnings:
            result.failed.length > 0
              ? [`${result.failed.length} pasta(s) falharam ao ser removidas`]
              : [],
        });

      case 'force-cleanup':
        if (dryRun) {
          return NextResponse.json(
            { error: 'force-cleanup não pode ser executado em modo dryRun' },
            { status: 400 }
          );
        }

        console.log(`🗑️ Forçando limpeza de mídia órfã`);

        const forceResult = await removeOrphanedMediaDirectories([], false);

        return NextResponse.json({
          success: true,
          data: {
            ...forceResult,
            dryRun: false,
            formattedSize: formatFileSize(forceResult.totalSize),
          },
          message: `Limpeza forçada concluída: ${forceResult.removed.length} pasta(s) removidas`,
          warnings:
            forceResult.failed.length > 0
              ? [`${forceResult.failed.length} pasta(s) falharam`]
              : [],
        });

      default:
        return NextResponse.json(
          { error: 'Ação não reconhecida' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('❌ Erro na limpeza de mídia:', error);
    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    );
  }
}

// DELETE - Remover pasta específica
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Apenas super admins podem deletar pastas de mídia
    if (!session?.user || session.user.role < 2) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const directory = searchParams.get('directory');

    if (!directory) {
      return NextResponse.json(
        { error: 'Nome do diretório é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se é realmente órfã
    const orphanedDirectories = await findOrphanedMediaDirectories();

    if (!orphanedDirectories.includes(directory)) {
      return NextResponse.json(
        { error: 'Diretório não está na lista de órfãos ou não existe' },
        { status: 400 }
      );
    }

    const result = await removeOrphanedMediaDirectories([directory], false);

    if (result.removed.includes(directory)) {
      return NextResponse.json({
        success: true,
        message: `Pasta '${directory}' removida com sucesso`,
        data: {
          directory,
          size: formatFileSize(result.totalSize),
        },
      });
    } else {
      return NextResponse.json(
        { error: `Falha ao remover pasta '${directory}'` },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('❌ Erro ao deletar pasta específica:', error);
    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    );
  }
}

// Função auxiliar para formatar tamanho
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
