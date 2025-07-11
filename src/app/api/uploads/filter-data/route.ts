// app/api/uploads/filter-data/route.ts - API PARA DADOS DE FILTROS
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import { getFilterData } from '@/app/requests/upload';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const filterData = await getFilterData(session.user.id);

    return NextResponse.json({
      composers: filterData.composers,
      works: filterData.works,
    });
  } catch (error) {
    console.error('Erro ao buscar dados de filtros:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
