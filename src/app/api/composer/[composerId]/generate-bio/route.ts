import { NextRequest, NextResponse } from 'next/server';
import {
  getComposerById,
  updateComposerBio,
} from '@/app/requests/composer-details';
import { AIBiographyGenerator } from '@/app/libs/ai-bio-generator';
import {
  cacheBiography,
  getCachedBiography,
  translateAndCacheBiography,
} from '@/app/utils/translations/biographyTranslation';
import { getServerLanguageStatic } from '@/app/utils/translations/serverTranslations';
import { getRequestInfo, trackActivity } from '@/app/libs/activityTracker';

// Cache para controle de processamento concurrent
const processCache = new Map<
  string,
  {
    timestamp: number;
    processing: boolean;
    result?: any;
  }
>();
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutos

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ composerId: string }> }
) {
  let composerId = '';
  const requestInfo = getRequestInfo(request);

  try {
    const resolvedParams = await params;
    composerId = resolvedParams.composerId;

    // Validar composerId
    if (!composerId?.trim()) {
      return NextResponse.json(
        { error: 'ID do compositor é obrigatório' },
        { status: 400 }
      );
    }

    // Detectar idioma preferido
    const requestedLanguage = await getServerLanguageStatic();

    const cacheKey = `bio_${composerId}_${requestedLanguage}`;

    // Verificar se já está processando
    const cached = processCache.get(cacheKey);

    if (cached && cached.processing) {
      const timeElapsed = Date.now() - cached.timestamp;

      if (timeElapsed < CACHE_DURATION) {
        if (cached.result) {
          return NextResponse.json(cached.result);
        }

        return NextResponse.json(
          {
            error: 'Biografia já está sendo gerada. Aguarde alguns momentos.',
            retryAfter: Math.ceil((CACHE_DURATION - timeElapsed) / 1000),
          },
          { status: 429 }
        );
      } else {
        processCache.delete(cacheKey);
      }
    }

    // Marcar como processando
    processCache.set(cacheKey, {
      timestamp: Date.now(),
      processing: true,
    });

    const result = await processGenerationWithTranslation(
      composerId,
      requestedLanguage,
      cacheKey
    );

    trackActivity({
      type: 'GENERATE_BIO', // Use um tipo genérico
      action: 'gerou biografia com IA',
      entityType: 'composer',
      entityId: composerId,
      metadata: {
        language: requestedLanguage,
        generated: true,
        fromCache: false,
      },
      ...requestInfo,
    });
    return result;
  } catch (error) {
    console.error('Erro geral na rota:', error);

    if (composerId) {
      processCache.delete(`bio_${composerId}_pt`);
      processCache.delete(`bio_${composerId}_en`);
    }

    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    );
  }
}

async function processGenerationWithTranslation(
  composerId: string,
  requestedLanguage: 'pt' | 'en',
  cacheKey: string
): Promise<NextResponse> {
  try {
    // Buscar dados do compositor
    console.log(`Buscando dados do compositor: ${composerId}`);
    let composer;

    try {
      composer = await getComposerById(composerId);
    } catch (dbError) {
      console.error('Erro ao buscar compositor no banco:', dbError);
      processCache.delete(cacheKey);
      return NextResponse.json(
        { error: 'Erro ao acessar dados do compositor' },
        { status: 500 }
      );
    }

    if (!composer) {
      processCache.delete(cacheKey);
      return NextResponse.json(
        { error: 'Compositor não encontrado' },
        { status: 404 }
      );
    }

    console.log('Compositor encontrado:', {
      name: composer.name,
      fullName: composer.fullName,
      requestedLanguage,
    });

    // Primeiro verificar cache de traduções
    const cachedBiography = getCachedBiography(
      composer.fullName || composer.name,
      composerId,
      requestedLanguage
    );

    if (cachedBiography) {
      const result = {
        success: true,
        biography: cachedBiography,
        generated: false,
        fromCache: true,
        message: `Biografia em ${
          requestedLanguage === 'pt' ? 'português' : 'inglês'
        } encontrada no cache`,
      };

      processCache.set(cacheKey, {
        timestamp: Date.now(),
        processing: false,
        result: result,
      });

      return NextResponse.json(result);
    }

    // Se solicitou português
    if (requestedLanguage === 'pt') {
      return await handlePortugueseBiography(composer, composerId, cacheKey);
    }

    // Se solicitou inglês
    if (requestedLanguage === 'en') {
      return await handleEnglishBiography(composer, composerId, cacheKey);
    }

    processCache.delete(cacheKey);
    return NextResponse.json(
      { error: 'Idioma não suportado' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Erro no processamento da biografia:', error);
    processCache.delete(cacheKey);

    return NextResponse.json(
      {
        error: 'Erro interno durante processamento',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    );
  }
}

/**
 * Processa biografia em português
 */
async function handlePortugueseBiography(
  composer: any,
  composerId: string,
  cacheKey: string
): Promise<NextResponse> {
  // Verificar se já possui biografia adequada no banco
  if (composer.bio && composer.bio.trim().length > 50) {
    // Salvar no cache se ainda não estiver
    cacheBiography(
      composer.fullName || composer.name,
      composerId,
      composer.bio,
      'pt'
    );

    const result = {
      success: true,
      biography: composer.bio,
      generated: false,
      fromDatabase: true,
      message: 'Biografia em português encontrada no banco de dados',
    };

    processCache.set(cacheKey, {
      timestamp: Date.now(),
      processing: false,
      result: result,
    });

    console.log('Biografia portuguesa encontrada no banco e salva no cache');
    return NextResponse.json(result);
  }

  // Gerar nova biografia em português
  console.log('Gerando nova biografia em português...');
  return await generateNewBiography(composer, composerId, cacheKey);
}

/**
 * Processa biografia em inglês
 */
async function handleEnglishBiography(
  composer: any,
  composerId: string,
  cacheKey: string
): Promise<NextResponse> {
  const composerName = composer.fullName || composer.name;

  // Verificar se temos biografia em português (cache primeiro, depois banco)
  let portugueseBio: string | null = getCachedBiography(
    composerName,
    composerId,
    'pt'
  );

  if (!portugueseBio && composer.bio && composer.bio.trim().length > 50) {
    portugueseBio = composer.bio;
  }

  // Salvar no cache se temos biografia válida
  if (portugueseBio && !getCachedBiography(composerName, composerId, 'pt')) {
    cacheBiography(composerName, composerId, portugueseBio, 'pt');
  }

  if (portugueseBio) {
    console.log('Biografia portuguesa encontrada, traduzindo para inglês...');

    try {
      const englishBio = await translateAndCacheBiography(
        composerName,
        composerId,
        portugueseBio
      );

      const result = {
        success: true,
        biography: englishBio,
        generated: false,
        translated: true,
        message: 'Biografia traduzida do português para inglês',
      };

      processCache.set(cacheKey, {
        timestamp: Date.now(),
        processing: false,
        result: result,
      });

      return NextResponse.json(result);
    } catch (translationError) {
      console.error('Erro ao traduzir biografia:', translationError);

      // Fallback: retornar português mesmo quando solicitou inglês
      const result = {
        success: true,
        biography: portugueseBio,
        generated: false,
        translated: false,
        fallback: true,
        warning: 'Erro na tradução, retornando versão em português',
        message: 'Biografia disponível apenas em português',
      };

      processCache.set(cacheKey, {
        timestamp: Date.now(),
        processing: false,
        result: result,
      });

      return NextResponse.json(result);
    }
  }

  // Não temos biografia em português, gerar primeiro
  console.log('Biografia não encontrada, gerando em português e traduzindo...');
  return await generateAndTranslateBiography(composer, composerId, cacheKey);
}

/**
 * Gera nova biografia em português
 */
async function generateNewBiography(
  composer: any,
  composerId: string,
  cacheKey: string
): Promise<NextResponse> {
  const bioRequest = {
    composerName: composer.name?.trim() || 'Compositor desconhecido',
    fullName: composer.fullName?.trim() || composer.name?.trim() || '',
    birthDate: composer.birthDate || undefined,
    deathDate: composer.deathDate || undefined,
    epoch: composer.epochName?.trim() || undefined,
    role: composer.primaryRoleName?.trim() || undefined,
  };

  console.log('Dados para geração:', bioRequest);

  let generationResult;
  try {
    generationResult = await AIBiographyGenerator.generateBiography(bioRequest);
  } catch (generationError) {
    console.error('Erro durante geração:', generationError);
    processCache.delete(cacheKey);

    return NextResponse.json(
      {
        error: 'Erro interno durante geração da biografia',
        details:
          generationError instanceof Error
            ? generationError.message
            : 'Erro desconhecido',
      },
      { status: 500 }
    );
  }

  if (!generationResult.success) {
    console.error('Falha na geração:', generationResult.error);
    processCache.delete(cacheKey);

    let statusCode = 500;
    let errorMessage = 'Falha ao gerar biografia';

    if (generationResult.error?.includes('429')) {
      statusCode = 429;
      errorMessage =
        'Limite de requisições atingido. Tente novamente em alguns minutos.';
    } else if (generationResult.error?.includes('401')) {
      statusCode = 503;
      errorMessage = 'Serviço de IA temporariamente indisponível';
    } else if (generationResult.error?.includes('400')) {
      statusCode = 400;
      errorMessage = 'Dados insuficientes para gerar biografia';
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details: generationResult.error,
        canRetry: statusCode === 429,
      },
      { status: statusCode }
    );
  }

  if (
    !generationResult.biography?.trim() ||
    generationResult.biography.trim().length < 50
  ) {
    processCache.delete(cacheKey);
    return NextResponse.json(
      { error: 'Biografia gerada é muito curta ou vazia' },
      { status: 500 }
    );
  }

  console.log('Biografia gerada com sucesso. Salvando no banco...');

  // Salvar no banco de dados
  let finalResult;
  try {
    await updateComposerBio(composerId, generationResult.biography);
    console.log('Biografia salva no banco com sucesso');

    // Salvar no cache
    cacheBiography(
      composer.fullName || composer.name,
      composerId,
      generationResult.biography,
      'pt'
    );

    finalResult = {
      success: true,
      biography: generationResult.biography,
      generated: true,
      savedToDatabase: true,
      message: 'Biografia gerada e salva com sucesso',
    };
  } catch (updateError) {
    console.error('Erro ao salvar biografia no banco:', updateError);

    // Mesmo com erro no banco, salvar no cache
    cacheBiography(
      composer.fullName || composer.name,
      composerId,
      generationResult.biography,
      'pt'
    );

    finalResult = {
      success: true,
      biography: generationResult.biography,
      generated: true,
      savedToDatabase: false,
      message: 'Biografia gerada, mas houve erro ao salvar no banco de dados',
      warning: 'Biografia não foi persistida no banco',
    };
  }

  processCache.set(cacheKey, {
    timestamp: Date.now(),
    processing: false,
    result: finalResult,
  });

  return NextResponse.json(finalResult);
}

/**
 * Gera biografia em português e traduz para inglês
 */
async function generateAndTranslateBiography(
  composer: any,
  composerId: string,
  cacheKey: string
): Promise<NextResponse> {
  // Primeiro gerar em português
  const portugueseResult = await generateNewBiography(
    composer,
    composerId,
    `bio_${composerId}_pt`
  );
  const portugueseData = await portugueseResult.json();

  if (!portugueseData.success) {
    return portugueseResult; // Retornar erro da geração
  }

  // Agora traduzir para inglês
  try {
    const englishBio = await translateAndCacheBiography(
      composer.fullName || composer.name,
      composerId,
      portugueseData.biography
    );

    const result = {
      success: true,
      biography: englishBio,
      generated: true,
      translated: true,
      savedToDatabase: portugueseData.savedToDatabase,
      message: 'Biografia gerada em português e traduzida para inglês',
    };

    processCache.set(cacheKey, {
      timestamp: Date.now(),
      processing: false,
      result: result,
    });

    return NextResponse.json(result);
  } catch (translationError) {
    console.error('Erro ao traduzir biografia recém-gerada:', translationError);

    // Fallback: retornar português
    const result = {
      success: true,
      biography: portugueseData.biography,
      generated: true,
      translated: false,
      fallback: true,
      savedToDatabase: portugueseData.savedToDatabase,
      warning: 'Erro na tradução, retornando versão em português',
      message: 'Biografia gerada, mas tradução falhou',
    };

    processCache.set(cacheKey, {
      timestamp: Date.now(),
      processing: false,
      result: result,
    });

    return NextResponse.json(result);
  }
}
