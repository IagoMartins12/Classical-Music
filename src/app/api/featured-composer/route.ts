// app/api/featured-composer/route.ts - API do compositor em destaque
import { NextResponse } from 'next/server';
import { getFeaturedComposer } from '@/app/requests/home-request';

export async function GET() {
  try {
    const featuredComposer = await getFeaturedComposer();

    if (!featuredComposer) {
      return NextResponse.json(
        { success: false, error: 'No featured composer found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: featuredComposer,
        timestamp: new Date().toISOString(),
      },
      {
        status: 200,
        headers: {
          'Cache-Control':
            'public, max-age=86400, stale-while-revalidate=172800', // 24h cache
        },
      }
    );
  } catch (error) {
    console.error('❌ API Featured Composer Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to load featured composer',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
