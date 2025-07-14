// app/api/composers/[workId]/verify/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ workId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 2) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { workId } = await params;

    const { verified, notes } = await request.json();

    // Verificar se o compositor existe
    const work = await prisma.work.findUnique({
      where: { id: workId },
    });

    if (!work) {
      return NextResponse.json(
        { error: 'Peça não encontrada' },
        { status: 404 }
      );
    }

    // Atualizar status de verificação
    const updatedWork = await prisma.work.update({
      where: { id: workId },
      data: {
        verificationStatus: verified ? 'verified' : 'pending',
        verifiedBy: verified ? session.user.id : null,
        verifiedAt: verified ? new Date() : null,
        isVerified: verified ? true : false,
        // Adicionar notas ao histórico de edição
        editHistory: {
          action: verified ? 'verified' : 'unverified',
          by: session.user.id,
          at: new Date(),
          notes: notes || null,
          previous: work.verificationStatus,
        },
      },
    });

    return NextResponse.json({
      success: true,
      work: updatedWork,
      message: verified
        ? 'Peça verificado com sucesso'
        : 'Verificação removida com sucesso',
    });
  } catch (error) {
    console.error('Erro ao verificar compositor:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
