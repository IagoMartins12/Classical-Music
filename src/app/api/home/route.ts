// app/api/home/route.ts - API principal da home
import { NextResponse } from 'next/server';
import {
  getFeaturedComposer,
  getMusicalFacts,
  getRandomDiscoveries,
  getRecentAdditions,
} from '@/app/requests/home-request';
import {
  getEpochsCache,
  getRecomendadedComposers,
  getTop20FamousComposers,
} from '@/app/requests/composers';

export async function GET() {
  try {
    console.log('🏠 API: Loading home data...');

    // Buscar todos os dados em paralelo (mesmo que você faz no SSR)
    const [
      composersData,
      recomendadData,
      featuredComposer,
      epochsData,
      randomDiscoveries,
      recentComposers,
      musicalFacts,
    ] = await Promise.all([
      getTop20FamousComposers(),
      getRecomendadedComposers(),
      getFeaturedComposer(),
      getEpochsCache(),
      getRandomDiscoveries(),
      getRecentAdditions(),
      getMusicalFacts(),
    ]);

    const response = {
      success: true,
      data: {
        popularComposers: composersData,
        essentialComposers: recomendadData,
        featuredComposer,
        epochs: epochsData,
        randomDiscoveries,
        recentAdditions: recentComposers,
        musicalFacts,
      },
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=1800, stale-while-revalidate=3600', // 30min cache
      },
    });
  } catch (error) {
    console.error('❌ API Home Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to load home data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
