// app/api/auth/check-email-status/route.ts
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import { getUserById } from '@/app/actions/auth';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Verificar se o usuário está autenticado
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Buscar dados frescos do usuário no banco de dados
    const userData = await getUserById(session.user.id);

    if (!userData) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Retornar apenas o status de verificação do email
    return NextResponse.json({
      emailVerified: !!userData.emailVerified,
      email: userData.email,
    });
  } catch (error) {
    console.error('❌ Erro ao verificar status do email:', error);

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
