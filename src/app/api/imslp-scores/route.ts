// app/api/imslp-scores/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { IMSLPScraper } from '@/app/libs/imslp-score-scraper';

export async function POST(request: NextRequest) {
  try {
    const { imslpUrl } = await request.json();

    if (!imslpUrl) {
      return NextResponse.json(
        { error: 'URL do IMSLP é obrigatória' },
        { status: 400 }
      );
    }

    // Fazer o scraping no servidor (sem problemas de CORS)
    const scoresData = await IMSLPScraper.fetchAndExtractScores(imslpUrl);

    console.log('✅ Partituras encontradas:', scoresData.totalCounts);

    return NextResponse.json(scoresData);
  } catch (error) {
    console.error('❌ Erro detalhado ao buscar partituras IMSLP:', error);

    // Log mais detalhado para debug
    if (error instanceof Error) {
      console.error('- Mensagem:', error.message);
      console.error('- Stack:', error.stack);
    }

    return NextResponse.json(
      {
        error: 'Erro ao buscar partituras do IMSLP',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    );
  }
}
