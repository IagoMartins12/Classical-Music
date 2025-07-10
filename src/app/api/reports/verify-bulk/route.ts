// app/api/admin/verify-bulk/route.ts - API para verificação em lote de compositores
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

    const { composerIds, verified, notes } = await request.json();

    if (
      !composerIds ||
      !Array.isArray(composerIds) ||
      composerIds.length === 0
    ) {
      return NextResponse.json(
        { error: 'IDs dos compositores são obrigatórios' },
        { status: 400 }
      );
    }

    if (typeof verified !== 'boolean') {
      return NextResponse.json(
        { error: 'Status de verificação é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se os compositores existem
    const composers = await prisma.composer.findMany({
      where: { id: { in: composerIds } },
      select: { id: true, name: true, fullName: true },
    });

    if (composers.length === 0) {
      return NextResponse.json(
        { error: 'Nenhum compositor encontrado' },
        { status: 404 }
      );
    }

    // Atualizar verificações em lote
    const result = await prisma.composer.updateMany({
      where: { id: { in: composers.map((c) => c.id) } },
      data: {
        isVerified: verified,
        verificationStatus: verified ? 'verified' : 'pending',
        verifiedBy: verified ? session.user.id : null,
        verifiedAt: verified ? new Date() : null,
        verificationNotes: notes || null,
      },
    });

    // Log da ação para auditoria
    const auditLog = {
      action: verified ? 'bulk_verify' : 'bulk_unverify',
      performedBy: session.user.id,
      affectedComposers: composers.map((c) => ({ id: c.id, name: c.fullName })),
      count: result.count,
      notes,
      timestamp: new Date(),
    };

    console.log('Verificação em lote:', auditLog);

    return NextResponse.json({
      success: true,
      count: result.count,
      composers: composers.map((c) => c.fullName),
      message: `${result.count} compositor(es) ${
        verified ? 'verificado(s)' : 'com verificação removida'
      } com sucesso`,
    });
  } catch (error) {
    console.error('Erro ao verificar compositores em lote:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
