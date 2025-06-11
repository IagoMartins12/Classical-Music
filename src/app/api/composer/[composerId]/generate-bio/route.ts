import { NextRequest, NextResponse } from 'next/server';
import {
  getComposerById,
  updateComposerBio,
} from '@/app/requests/composer-details';
import { AIBiographyGenerator } from '@/app/libs/ai-bio-generator';

// Cache para controle de processamento concurrent
const processCache = new Map<
  string,
  {
    timestamp: number;
    processing: boolean;
    //@ts-ignore
    result?: any; // Armazenar o resultado em vez da Promise
  }
>();
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutos

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ composerId: string }> }
) {
  let composerId = '';

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

    const cacheKey = `bio_${composerId}`;

    // Verificar se já está processando - BLOQUEAR IMEDIATAMENTE
    const cached = processCache.get(cacheKey);

    if (cached && cached.processing) {
      const timeElapsed = Date.now() - cached.timestamp;

      if (timeElapsed < CACHE_DURATION) {
        // Se já temos um resultado, retornar uma nova resposta com os mesmos dados
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
        // Cache expirado, limpar
        processCache.delete(cacheKey);
      }
    }

    // MARCAR COMO PROCESSANDO IMEDIATAMENTE - antes de qualquer operação async
    processCache.set(cacheKey, {
      timestamp: Date.now(),
      processing: true,
    });

    // Processar a geração
    const result = await processGeneration(composerId, cacheKey);

    return result;
  } catch (error) {
    console.error('Erro geral na rota:', error);

    // Limpar cache em caso de erro
    if (composerId) {
      processCache.delete(`bio_${composerId}`);
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

// Função separada para o processamento principal
async function processGeneration(
  composerId: string,
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
      hasBio: !!composer.bio,
      bioLength: composer.bio?.length || 0,
    });

    // Verificar se já possui biografia adequada
    if (composer.bio && composer.bio.trim().length > 50) {
      const result = {
        success: true,
        biography: composer.bio,
        generated: false,
        message: 'Compositor já possui biografia',
      };

      // Salvar resultado no cache e marcar como concluído
      processCache.set(cacheKey, {
        timestamp: Date.now(),
        processing: false,
        result: result,
      });

      console.log('Compositor já possui biografia adequada');
      return NextResponse.json(result);
    }

    console.log('Iniciando geração de biografia...');

    // Preparar dados para geração da biografia
    const bioRequest = {
      composerName: composer.name?.trim() || 'Compositor desconhecido',
      fullName: composer.fullName?.trim() || composer.name?.trim() || '',
      birthDate: composer.birthDate || undefined,
      deathDate: composer.deathDate || undefined,
      epoch: composer.epochName?.trim() || undefined,
      role: composer.primaryRoleName?.trim() || undefined,
    };

    console.log('Dados para geração:', bioRequest);

    // Gerar biografia
    let generationResult;
    try {
      generationResult = await AIBiographyGenerator.generateBiography(
        bioRequest
      );
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

      // Retornar erro específico baseado no tipo
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

    // Validar biografia gerada
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

    // Atualizar no banco de dados
    let finalResult;
    try {
      await updateComposerBio(composerId, generationResult.biography);
      console.log('Biografia salva no banco com sucesso');

      finalResult = {
        success: true,
        biography: generationResult.biography,
        generated: true,
        message: 'Biografia gerada e salva com sucesso',
      };
    } catch (updateError) {
      console.error('Erro ao salvar biografia no banco:', updateError);

      finalResult = {
        success: true,
        biography: generationResult.biography,
        generated: true,
        message: 'Biografia gerada, mas houve erro ao salvar no banco de dados',
        warning: 'Biografia não foi persistida',
      };
    }

    // Salvar resultado no cache e marcar como concluído
    processCache.set(cacheKey, {
      timestamp: Date.now(),
      processing: false,
      result: finalResult,
    });

    return NextResponse.json(finalResult);
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
