// app/api/composers/[composerId]/verify/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ composerId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 2) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { composerId } = await params;

    const { verified, notes } = await request.json();

    // Verificar se o compositor existe
    const composer = await prisma.composer.findUnique({
      where: { id: composerId },
    });

    if (!composer) {
      return NextResponse.json(
        { error: 'Compositor não encontrado' },
        { status: 404 }
      );
    }

    // Atualizar status de verificação
    const updatedComposer = await prisma.composer.update({
      where: { id: composerId },
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
          previous: composer.verificationStatus,
        },
      },
    });

    return NextResponse.json({
      success: true,
      composer: updatedComposer,
      message: verified
        ? 'Compositor verificado com sucesso'
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
