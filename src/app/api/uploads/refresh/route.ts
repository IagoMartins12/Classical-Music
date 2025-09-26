// app/api/uploads/refresh/route.ts
import { NextResponse } from 'next/server';
import { refreshUserUploads } from '@/app/requests/upload';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const result = await refreshUserUploads(session.user.id);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Erro ao atualizar uploads:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
