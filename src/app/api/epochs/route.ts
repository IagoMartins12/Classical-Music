// app/api/epochs/route.ts - API de épocas
import { NextResponse } from 'next/server';
import { getEpochsCache } from '@/app/requests/composers';

export async function GET() {
  try {
    const epochs = await getEpochsCache();

    return NextResponse.json(
      {
        success: true,
        data: epochs,
        timestamp: new Date().toISOString(),
      },
      {
        status: 200,
        headers: {
          'Cache-Control':
            'public, max-age=604800, stale-while-revalidate=1209600', // 7d cache
        },
      }
    );
  } catch (error) {
    console.error('❌ API Epochs Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to load epochs',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
