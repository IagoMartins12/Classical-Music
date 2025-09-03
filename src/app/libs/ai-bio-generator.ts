// lib/ai-bio-generator.ts
interface BioGenerationRequest {
  composerName: string;
  fullName?: string;
  birthDate?: string;
  deathDate?: string;
  epoch?: string;
  role?: string;
}

interface BioGenerationResponse {
  biography: string;
  success: boolean;
  error?: string;
}

export class AIBiographyGenerator {
  private static readonly API_ENDPOINTS = {
    openai: 'https://api.openai.com/v1/chat/completions',
    groq: 'https://api.groq.com/openai/v1/chat/completions',
    huggingface:
      'https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium',
  };

  // Rate limiting simples
  private static lastRequestTime = 0;
  private static readonly MIN_REQUEST_INTERVAL = 3000; // 3 segundos entre requests

  /**
   * Implementa delay entre requisições para evitar rate limiting
   */
  private static async respectRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    if (timeSinceLastRequest < this.MIN_REQUEST_INTERVAL) {
      const waitTime = this.MIN_REQUEST_INTERVAL - timeSinceLastRequest;
      console.log(`Aguardando ${waitTime}ms para respeitar rate limit...`);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }

    this.lastRequestTime = Date.now();
  }

  /**
   * Gera biografia usando OpenAI GPT
   */
  private static async generateWithOpenAI(
    request: BioGenerationRequest
  ): Promise<BioGenerationResponse> {
    try {
      if (!process.env.OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY não configurada');
      }

      await this.respectRateLimit();

      const prompt = this.createPrompt(request);

      const response = await fetch(this.API_ENDPOINTS.openai, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo', // Modelo mais barato
          messages: [
            {
              role: 'system',
              content:
                'Você é um especialista em música clássica e história da música. Crie biografias precisas, informativas e envolventes de compositores.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          max_tokens: 2000, // Reduzido para economizar
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        let errorMessage = `OpenAI API error: ${response.status}`;

        if (response.status === 429) {
          const retryAfter = response.headers.get('retry-after') || '60';
          errorMessage += ` - Rate limit exceeded. Retry after ${retryAfter} seconds`;
        } else if (response.status === 401) {
          errorMessage += ' - Invalid API key';
        } else if (response.status === 402) {
          errorMessage += ' - Quota exceeded. Check billing details';
        }

        if (errorData.error?.message) {
          errorMessage += `: ${errorData.error.message}`;
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();
      const biography = data.choices?.[0]?.message?.content?.trim();

      if (!biography) {
        throw new Error('Biografia vazia retornada pela API');
      }

      return {
        biography,
        success: true,
      };
    } catch (error) {
      console.error('Erro ao gerar biografia com OpenAI:', error);
      return {
        biography: '',
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }

  /**
   * Fallback usando Groq (gratuito)
   */
  private static async generateWithGroq(
    request: BioGenerationRequest
  ): Promise<BioGenerationResponse> {
    try {
      if (!process.env.GROQ_API_KEY) {
        throw new Error('GROQ_API_KEY não configurada');
      }

      await this.respectRateLimit();

      const prompt = this.createPrompt(request);

      // Modelos disponíveis no Groq (ATUALIZADOS para setembro 2025)
      const availableModels = [
        // Modelos de produção (recomendados)
        'llama-3.3-70b-versatile', // Substituto do llama3-70b-8192
        'llama-3.1-8b-instant', // Substituto do llama3-8b-8192
        'gemma2-9b-it',

        // Modelos preview (opcionais, podem ser descontinuados)
        'qwen/qwen3-32b',
        'moonshotai/kimi-k2-instruct',
        'deepseek-r1-distill-llama-70b',
      ];

      let lastError: any = null;

      // Tentar cada modelo até encontrar um que funcione
      for (const model of availableModels) {
        try {
          const requestBody = {
            model: model,
            messages: [
              {
                role: 'system',
                content:
                  'Você é um especialista em música clássica. Crie biografias precisas e informativas de compositores clássicos em português.',
              },
              {
                role: 'user',
                content: prompt,
              },
            ],
            max_tokens: 2500,
            temperature: 0.7,
          };

          console.log(`Tentando modelo: ${model}`);

          const response = await fetch(this.API_ENDPOINTS.groq, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            lastError = errorData;

            // Se o modelo foi descontinuado, tenta o próximo
            if (
              response.status === 400 &&
              errorData.error?.message?.includes('decommissioned')
            ) {
              console.log(
                `Modelo ${model} foi descontinuado, tentando próximo...`
              );
              continue;
            }

            // Outros erros, tenta próximo modelo
            console.log(
              `Modelo ${model} falhou (${response.status}), tentando próximo...`
            );
            continue;
          }

          const data = await response.json();
          const biography = data.choices?.[0]?.message?.content?.trim();

          if (biography) {
            console.log(`Sucesso com modelo: ${model}`);
            return {
              biography,
              success: true,
            };
          }

          console.log(
            `Modelo ${model} retornou biografia vazia, tentando próximo...`
          );
        } catch (modelError) {
          console.log(`Erro com modelo ${model}:`, modelError);
          lastError = modelError;
          continue;
        }
      }

      // Se chegou até aqui, todos os modelos falharam
      const errorMessage =
        lastError?.error?.message ||
        lastError?.message ||
        'Todos os modelos do Groq falharam';

      throw new Error(`Groq API error: ${errorMessage}`);
    } catch (error) {
      console.error('Erro ao gerar biografia com Groq:', error);
      return {
        biography: '',
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }

  /**
   * Fallback usando biografia template (quando todas APIs falham)
   */
  private static generateTemplateBiography(
    request: BioGenerationRequest
  ): BioGenerationResponse {
    const { composerName, fullName, birthDate, deathDate, epoch } = request;

    const name = fullName || composerName;
    const birth = birthDate
      ? new Date(birthDate).getFullYear()
      : 'data desconhecida';
    const death = deathDate
      ? new Date(deathDate).getFullYear()
      : 'data desconhecida';
    const period = epoch || 'período clássico';

    const biography = `${name} foi um compositor do ${period.toLowerCase()}, nascido em ${birth} e falecido em ${death}. 
  
  Reconhecido como uma das figuras importantes da música clássica, ${name} contribuiu significativamente para o repertório musical de sua época. Suas composições refletem as características estilísticas do ${period.toLowerCase()}, demonstrando domínio técnico e sensibilidade artística.
  
  Durante sua carreira, desenvolveu um estilo compositional distintivo que influenciou gerações posteriores de músicos. Suas obras abrangem diversos gêneros musicais, desde peças para instrumento solo até composições orquestrais complexas.
  
  O legado musical de ${name} permanece relevante nos dias atuais, com suas composições sendo regularmente executadas em salas de concerto ao redor do mundo. Sua contribuição para a evolução da música clássica é amplamente reconhecida por musicólogos e intérpretes.
  
  ${name} representa um exemplo notável da criatividade e inovação musical do ${period.toLowerCase()}, mantendo-se como referência importante nos estudos de história da música.`;

    return {
      biography,
      success: true,
    };
  }

  /**
   * Cria o prompt otimizado para geração de biografias de compositores
   */
  private static createPrompt(request: BioGenerationRequest): string {
    const { composerName, fullName, birthDate, deathDate, epoch, role } =
      request;

    if (!composerName?.trim()) {
      throw new Error('Nome do compositor é obrigatório');
    }

    let prompt = `Crie uma biografia completa e informativa do compositor ${
      fullName?.trim() || composerName.trim()
    }`;

    if (birthDate && deathDate) {
      prompt += ` (${birthDate.split('-')[0]}-${deathDate.split('-')[0]})`;
    } else if (birthDate) {
      prompt += ` (nascido em ${birthDate.split('-')[0]})`;
    }

    if (epoch?.trim() && epoch !== 'Desconhecido') {
      prompt += `, do período ${epoch.trim()}`;
    }

    if (role?.trim() && role !== 'Desconhecido') {
      prompt += `, conhecido principalmente como ${role.trim()}`;
    }

    prompt += `.
    
    A biografia deve incluir:
    1. Dados biográficos essenciais (nascimento, morte, nacionalidade)
    2. Formação musical e principais influências
    3. Características distintivas do seu estilo compositional
    4. Principais obras e contribuições para a música
    5. Contexto histórico e importância na história da música
    6. Curiosidades ou aspectos interessantes da vida pessoal
    
    Escreva em português brasileiro, de forma clara e envolvente.
    Quero que Faça uma biografia rica e detalhada. 
    Faça com que a análise seja concluida antes dos 2500 caracteres.
    Aja num contexto historico, não deixe parecer que é uma IA. 
    Evite especulações e foque em fatos históricos verificáveis.
    NÃO fale 'Em resumo' no final, para dar mais veracidade a bio.
    Se possivel, aplique um leia mais em: (e coloque um link da wikipedia da pessoa. Se nao tiver link da wikipedia, nao coloque nada)
    Caso tenha um erro no cargo da pessoa ou caso nao ache informações sobre a pessoa, me retorne um 'Sem Biografia disponivel APENAS ISSO`;

    return prompt;
  }

  /**
   * Método principal para gerar biografia com fallbacks
   */
  public static async generateBiography(
    request: BioGenerationRequest
  ): Promise<BioGenerationResponse> {
    // Validar request
    if (!request.composerName?.trim()) {
      return {
        biography: '',
        success: false,
        error: 'Nome do compositor é obrigatório',
      };
    }

    // Tentar Groq primeiro (gratuito e mais confiável)
    if (process.env.GROQ_API_KEY) {
      console.log('Tentando Groq...');
      const result = await this.generateWithGroq(request);
      if (result.success) {
        console.log('Biografia gerada com sucesso usando Groq');
        return result;
      }
      console.log('Groq falhou, tentando OpenAI...');
    }

    // Tentar OpenAI como fallback (se disponível)
    if (process.env.OPENAI_API_KEY) {
      console.log('Tentando OpenAI...');
      const result = await this.generateWithOpenAI(request);
      if (result.success) {
        console.log('Biografia gerada com sucesso usando OpenAI');
        return result;
      }
      console.log('OpenAI também falhou, usando template...');
    }

    // Se tudo falhar, usar template
    console.log('Usando biografia template como último recurso');
    return this.generateTemplateBiography(request);
  }
}
