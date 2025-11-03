// ========================================
// 2. /api/composer/[composerId]/biography/generate/route.ts
// ========================================
import { NextRequest, NextResponse } from 'next/server';
import { AIBiographyGenerator } from '@/app/libs/ai-bio-generator';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ composerId: string }> }
) {
  try {
    const resolvedParams = await params;
    const composerId = resolvedParams.composerId;
    console.log('composerId', composerId);
    const body = await request.json();

    const {
      composerName,
      fullName,
      birthDate,
      deathDate,
      epoch,
      role,
      language = 'pt',
    } = body;

    // Validações
    if (!composerName || !fullName) {
      return NextResponse.json(
        { success: false, error: 'Nome e nome completo são obrigatórios' },
        { status: 400 }
      );
    }

    // Gerar biografia usando a classe existente
    const bioRequest = {
      composerName: composerName.trim(),
      fullName: fullName.trim(),
      birthDate: birthDate || undefined,
      deathDate: deathDate || undefined,
      epoch: epoch || undefined,
      role: role || undefined,
    };

    const result = await AIBiographyGenerator.generateBiography(bioRequest);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Erro ao gerar biografia',
        },
        { status: 500 }
      );
    }

    // Se solicitou em inglês, traduzir
    let finalBiography = result.biography;
    if (language === 'en') {
      const { translateBiographyWithGoogle } = await import(
        '@/app/utils/translations/biographyTranslation'
      );

      try {
        finalBiography = await translateBiographyWithGoogle(result.biography);
      } catch (translationError) {
        console.error('Erro ao traduzir:', translationError);
        return NextResponse.json(
          {
            success: false,
            error: 'Erro ao traduzir biografia gerada',
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      biography: finalBiography,
      language: language,
      generated: true,
    });
  } catch (error) {
    console.error('Erro ao gerar biografia:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    );
  }
}
