// ========================================
// 4. /api/composer/[composerId]/biography/save/route.ts
// ========================================
import { NextRequest, NextResponse } from 'next/server';
import {
  generateComposerBioKey,
  loadBiographyCache,
  saveBiographyCache,
} from '@/app/utils/translations/biographyTranslation';
import { updateComposerBio } from '@/app/requests/composer-details';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ composerId: string }> }
) {
  try {
    const resolvedParams = await params;
    const composerId = resolvedParams.composerId;
    const body = await request.json();

    const { composerName, pt, en } = body;

    // Validações
    if (!composerId || !composerName) {
      return NextResponse.json(
        { success: false, error: 'Compositor não identificado' },
        { status: 400 }
      );
    }

    // 1. Salvar biografia PT no banco de dados
    if (pt) {
      try {
        await updateComposerBio(composerId, pt);
        console.log('✅ Biografia PT salva no banco');
      } catch (dbError) {
        console.error('❌ Erro ao salvar no banco:', dbError);
        // Continuar mesmo com erro no banco
      }
    }

    // 2. Salvar ambas biografias no JSON
    const cache = loadBiographyCache();
    const bioKey = generateComposerBioKey(composerName, composerId);

    // Salvar PT
    if (pt) {
      cache.ptBr[bioKey] = pt;
      console.log('✅ Biografia PT salva no JSON');
    }

    // Salvar EN
    if (en) {
      cache.en[bioKey] = en;
      console.log('✅ Biografia EN salva no JSON');
    }

    // Persistir alterações no arquivo
    saveBiographyCache(cache);

    return NextResponse.json({
      success: true,
      message: 'Biografias salvas com sucesso',
      savedTo: {
        database: !!pt,
        jsonPt: !!pt,
        jsonEn: !!en,
      },
      cacheKey: bioKey,
    });
  } catch (error) {
    console.error('Erro ao salvar biografias:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao salvar',
      },
      { status: 500 }
    );
  }
}
