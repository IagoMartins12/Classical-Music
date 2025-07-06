// app/api/uploads/score/[id]/route.ts
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import { NextRequest, NextResponse } from 'next/server';
import { revalidateUploadsCache } from '@/app/requests/upload';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Buscar partitura existente
    const existingScore = await prisma.workScore.findUnique({
      where: { id: params.id },
    });

    if (!existingScore) {
      return NextResponse.json(
        { error: 'Partitura não encontrada' },
        { status: 404 }
      );
    }

    // Verificar permissões
    const isAdmin = session.user.role === 2;
    const isOwner = existingScore.uploadedBy === session.user.id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }

    // Deletar partitura
    await prisma.workScore.delete({
      where: { id: params.id },
    });

    await revalidateUploadsCache(session.user.id);

    return NextResponse.json({
      success: true,
      message: 'Partitura excluída com sucesso',
    });
  } catch (error) {
    console.error('Erro ao excluir partitura:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
