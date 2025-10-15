// app/api/musical-facts/route.ts - API de curiosidades musicais
import { NextResponse } from 'next/server';
import { getMusicalFacts } from '@/app/requests/home-request';

export async function GET() {
  try {
    const facts = await getMusicalFacts();

    return NextResponse.json(
      {
        success: true,
        data: facts,
        timestamp: new Date().toISOString(),
      },
      {
        status: 200,
        headers: {
          'Cache-Control':
            'public, max-age=21600, stale-while-revalidate=43200', // 6h cache
        },
      }
    );
  } catch (error) {
    console.error('❌ API Musical Facts Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to load musical facts',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
