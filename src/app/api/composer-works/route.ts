// app/api/composer-works/route.ts - API para obras do compositor com filtros
import { NextRequest, NextResponse } from 'next/server';
import { getComposerWorksWithFilters } from '@/app/requests/composer-details';

// Interface para o corpo da requisição
interface ComposerWorksRequestBody {
  composerId: string;
  page?: number;
  limit?: number;
  filters?: {
    instrumentId?: string;
    workGenresArr?: string;
    categoryNames?: string;
    search?: string;
    workType?: string; // Novo filtro
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: ComposerWorksRequestBody = await request.json();

    // Validação básica
    if (!body.composerId) {
      return NextResponse.json(
        { error: 'composerId é obrigatório' },
        { status: 400 }
      );
    }

    // Parâmetros com valores padrão
    const page = body.page || 1;
    const limit = Math.min(body.limit || 50, 100); // Máximo de 100 por página
    const filters = body.filters;

    // Log para debug
    console.log('Buscando obras do compositor:', {
      composerId: body.composerId,
      page,
      limit,
      filters,
    });

    // Buscar obras com filtros
    const result = await getComposerWorksWithFilters(
      body.composerId,
      page,
      limit,
      filters
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Erro na API composer-works:', error);

    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
      },
      { status: 500 }
    );
  }
}

// Método GET para casos simples (sem filtros)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const composerId = searchParams.get('composerId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);

    if (!composerId) {
      return NextResponse.json(
        { error: 'composerId é obrigatório' },
        { status: 400 }
      );
    }

    const result = await getComposerWorksWithFilters(composerId, page, limit);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Erro na API composer-works (GET):', error);

    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
      },
      { status: 500 }
    );
  }
}
