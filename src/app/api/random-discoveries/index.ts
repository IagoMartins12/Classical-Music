// app/api/random-discoveries/route.ts - API de descobertas aleatórias
import { NextResponse } from 'next/server';
import { getRandomDiscoveries } from '@/app/requests/home-request';

export async function GET() {
  try {
    const discoveries = await getRandomDiscoveries();

    return NextResponse.json(
      {
        success: true,
        data: discoveries,
        timestamp: new Date().toISOString(),
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, max-age=3600, stale-while-revalidate=7200', // 1h cache
        },
      }
    );
  } catch (error) {
    console.error('❌ API Random Discoveries Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to load random discoveries',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
