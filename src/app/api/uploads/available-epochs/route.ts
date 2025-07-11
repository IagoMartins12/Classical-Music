// app/api/uploads/available-epochs/route.ts - API PARA ÉPOCAS DISPONÍVEIS
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import { getAvailableEpochs } from '@/app/requests/upload';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all';

    const availableEpochs = await getAvailableEpochs(session.user.id, type);

    return NextResponse.json({
      epochs: availableEpochs,
    });
  } catch (error) {
    console.error('Erro ao buscar épocas disponíveis:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
