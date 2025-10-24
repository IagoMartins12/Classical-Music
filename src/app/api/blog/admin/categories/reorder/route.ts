import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (
      !session?.user ||
      (session.user.role !== 1 && session.user.role !== 2)
    ) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { categories } = await request.json();

    // Update order for each category
    await Promise.all(
      categories.map((cat: { id: string; order: number }) =>
        prisma.blogCategory.update({
          where: { id: cat.id },
          data: { order: cat.order },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error reordering categories:', error);
    return NextResponse.json(
      { error: 'Erro ao reordenar categorias' },
      { status: 500 }
    );
  }
}
