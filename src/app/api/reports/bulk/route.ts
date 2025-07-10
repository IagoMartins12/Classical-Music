// app/api/reports/bulk/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 2) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { reportIds, action, notes } = await request.json();

    if (!reportIds || !Array.isArray(reportIds) || reportIds.length === 0) {
      return NextResponse.json(
        { error: 'IDs dos reports são obrigatórios' },
        { status: 400 }
      );
    }

    if (!['approve', 'reject', 'delete'].includes(action)) {
      return NextResponse.json({ error: 'Ação inválida' }, { status: 400 });
    }

    // Buscar reports que ainda estão pendentes
    const pendingReports = await prisma.uploadModeration.findMany({
      where: {
        id: { in: reportIds },
        status: 'pending',
      },
    });

    if (pendingReports.length === 0) {
      return NextResponse.json(
        { error: 'Nenhum report pendente encontrado' },
        { status: 404 }
      );
    }

    let processedCount = 0;
    let deletedEntities = 0;
    const errors: string[] = [];

    // Processar cada report
    for (const report of pendingReports) {
      try {
        if (action === 'delete') {
          // Deletar a entidade reportada
          switch (report.entityType) {
            case 'composer':
              await prisma.composer.delete({
                where: { id: report.entityId },
              });
              break;
            case 'work':
              await prisma.work.delete({
                where: { id: report.entityId },
              });
              break;
            case 'score':
              await prisma.workScore.delete({
                where: { id: report.entityId },
              });
              break;
          }
          deletedEntities++;
        }

        // Atualizar status do report
        await prisma.uploadModeration.update({
          where: { id: report.id },
          data: {
            status: action === 'approve' ? 'approved' : 'rejected',
            moderatedBy: session.user.id,
            moderationNotes: notes,
            resolution: action === 'delete' ? 'deleted' : action,
            resolvedAt: new Date(),
          },
        });

        processedCount++;
      } catch (error) {
        console.error(`Erro ao processar report ${report.id}:`, error);
        errors.push(
          `Report ${report.id}: ${
            error instanceof Error ? error.message : 'Erro desconhecido'
          }`
        );
      }
    }

    return NextResponse.json({
      success: true,
      processedCount,
      deletedEntities,
      totalRequested: reportIds.length,
      errors: errors.length > 0 ? errors : undefined,
      message: `${processedCount} reports processados com sucesso${
        deletedEntities > 0 ? ` (${deletedEntities} itens deletados)` : ''
      }`,
    });
  } catch (error) {
    console.error('Erro ao processar reports em lote:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
