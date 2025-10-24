import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import { CommentStatus } from '@prisma/client';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (
      !session?.user ||
      (session.user.role !== 1 && session.user.role !== 2)
    ) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { action } = await request.json();

    const statusMap: Record<string, CommentStatus> = {
      approve: CommentStatus.APPROVED,
      reject: CommentStatus.REJECTED,
      spam: CommentStatus.SPAM,
    };
    const status = statusMap[action];

    if (!status) {
      return NextResponse.json({ error: 'Ação inválida' }, { status: 400 });
    }

    const { id } = await params;

    const comment = await prisma.blogComment.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ success: true, comment });
  } catch (error) {
    console.error('Error moderating comment:', error);
    return NextResponse.json(
      { error: 'Erro ao moderar comentário' },
      { status: 500 }
    );
  }
}
