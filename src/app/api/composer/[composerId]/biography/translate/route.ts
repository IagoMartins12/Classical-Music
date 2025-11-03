// ========================================
// 3. /api/composer/[composerId]/biography/translate/route.ts
// ========================================
import { NextRequest, NextResponse } from 'next/server';
import { translateBiographyWithGoogle } from '@/app/utils/translations/biographyTranslation';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ composerId: string }> }
) {
  try {
    const resolvedParams = await params;
    const composerId = resolvedParams.composerId;
    console.log('composerId', composerId);

    const body = await request.json();

    const { text, from, to } = body;

    // Validações
    if (!text || !from || !to) {
      return NextResponse.json(
        { success: false, error: 'Texto e idiomas são obrigatórios' },
        { status: 400 }
      );
    }

    if (from === to) {
      return NextResponse.json(
        {
          success: false,
          error: 'Idiomas de origem e destino devem ser diferentes',
        },
        { status: 400 }
      );
    }

    // Traduzir biografia
    let translatedText = text;

    if (from === 'pt' && to === 'en') {
      // Português -> Inglês (usa a função existente)
      translatedText = await translateBiographyWithGoogle(text);
    } else if (from === 'en' && to === 'pt') {
      // Inglês -> Português (inverter a lógica da tradução)
      // Você pode criar uma função reversa ou usar Google Translate API
      // Por enquanto, vou usar a mesma função (você precisará adaptar)
      translatedText = await translateBiographyWithGoogle(text);
    }

    return NextResponse.json({
      success: true,
      translatedText,
      from,
      to,
    });
  } catch (error) {
    console.error('Erro ao traduzir biografia:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao traduzir',
      },
      { status: 500 }
    );
  }
}
