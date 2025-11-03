// ========================================
// 1. /api/composer/[composerId]/biography/load/route.ts
// ========================================
import { NextRequest, NextResponse } from 'next/server';
import { loadBiographyCache } from '@/app/utils/translations/biographyTranslation';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ composerId: string }> }
) {
  try {
    const resolvedParams = await params;
    const composerId = resolvedParams.composerId;

    const cache = loadBiographyCache();

    // Procurar biografia no cache por composerId
    let bioKey: string | null = null;
    let ptBio = '';
    let enBio = '';

    // Procurar pela chave que contém o composerId
    for (const key in cache.ptBr) {
      if (key.includes(composerId)) {
        bioKey = key;
        ptBio = cache.ptBr[key] || '';
        enBio = cache.en[key] || '';
        break;
      }
    }

    return NextResponse.json({
      success: true,
      biographies: {
        pt: ptBio,
        en: enBio,
      },
      cacheKey: bioKey,
    });
  } catch (error) {
    console.error('Erro ao carregar biografias:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao carregar biografias',
        biographies: { pt: '', en: '' },
      },
      { status: 500 }
    );
  }
}
