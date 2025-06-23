// app/api/composer-works/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getComposerWorksWithFilters } from '@/app/requests/composer-details';

export async function POST(request: NextRequest) {
  try {
    const { composerId, page = 1, limit = 50, filters } = await request.json();

    // Validação básica
    if (!composerId) {
      return NextResponse.json(
        { error: 'Compositor ID é obrigatório' },
        { status: 400 }
      );
    }

    // Validação do ID do compositor (MongoDB ObjectId)
    if (typeof composerId !== 'string' || composerId.length !== 24) {
      return NextResponse.json(
        { error: 'ID do compositor inválido' },
        { status: 400 }
      );
    }

    // Validação da página
    const pageNum = parseInt(page);
    if (isNaN(pageNum) || pageNum < 1) {
      return NextResponse.json(
        { error: 'Número da página inválido' },
        { status: 400 }
      );
    }

    // Validação do limite
    const limitNum = parseInt(limit);
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      return NextResponse.json(
        { error: 'Limite deve ser entre 1 e 100' },
        { status: 400 }
      );
    }

    // Buscar obras com filtros
    const result = await getComposerWorksWithFilters(
      composerId,
      pageNum,
      limitNum,
      filters
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Erro na API de obras do compositor:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// GET method para compatibilidade (sem filtros)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const composerId = searchParams.get('composerId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!composerId) {
      return NextResponse.json(
        { error: 'Compositor ID é obrigatório' },
        { status: 400 }
      );
    }

    const result = await getComposerWorksWithFilters(composerId, page, limit);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Erro na API GET de obras do compositor:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
