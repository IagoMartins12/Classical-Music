// libs/translation/translationService.ts
import { Language } from '@/app/stores/useLanguageStore';

interface TranslationResponse {
  translatedText: string;
  success: boolean;
  fromCache?: boolean;
  error?: string;
}

interface TranslationRequest {
  text: string;
  from: Language;
  to: Language;
  useCache?: boolean;
}

class TranslationService {
  private cache = new Map<string, string>();
  private pendingRequests = new Map<string, Promise<TranslationResponse>>();
  private lastRequestTime = 0;
  private readonly RATE_LIMIT_MS = 1000; // 1 segundo entre requests

  /**
   * Traduz texto usando Google Translate com fallbacks
   */
  async translateText({
    text,
    from,
    to,
    useCache = true,
  }: TranslationRequest): Promise<TranslationResponse> {
    // Se texto vazio ou idiomas iguais, retornar original
    if (!text.trim() || from === to) {
      return { translatedText: text, success: true };
    }

    const cacheKey = `${text}_${from}_${to}`;

    // Verificar cache primeiro
    if (useCache && this.cache.has(cacheKey)) {
      return {
        translatedText: this.cache.get(cacheKey)!,
        success: true,
        fromCache: true,
      };
    }

    // Evitar requests duplicados
    if (this.pendingRequests.has(cacheKey)) {
      return await this.pendingRequests.get(cacheKey)!;
    }

    // Criar promessa para request
    const requestPromise = this.performTranslation(text, from, to);
    this.pendingRequests.set(cacheKey, requestPromise);

    try {
      const result = await requestPromise;

      // Cachear se sucesso
      if (result.success && result.translatedText) {
        this.cache.set(cacheKey, result.translatedText);
      }

      return result;
    } finally {
      this.pendingRequests.delete(cacheKey);
    }
  }

  /**
   * Executa a tradução com rate limiting
   */
  private async performTranslation(
    text: string,
    from: Language,
    to: Language
  ): Promise<TranslationResponse> {
    try {
      // Rate limiting
      await this.respectRateLimit();

      // Tentar Google Translate primeiro
      const googleResult = await this.translateWithGoogle(text, from, to);
      if (googleResult.success) {
        return googleResult;
      }

      // Fallback: tradução simples baseada em dicionário
      const fallbackResult = this.translateWithFallback(text, from, to);
      return fallbackResult;
    } catch (error) {
      console.error('Erro na tradução:', error);
      return {
        translatedText: text, // Retornar texto original em caso de erro
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }

  /**
   * Tradução via Google Translate (gratuita via web scraping)
   */
  private async translateWithGoogle(
    text: string,
    from: Language,
    to: Language
  ): Promise<TranslationResponse> {
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, from, to }),
      });

      if (!response.ok) {
        throw new Error(`API erro: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Tradução falhou');
      }

      return {
        translatedText: data.translatedText,
        success: true,
      };
    } catch (error) {
      console.error('Google Translate falhou:', error);
      return {
        translatedText: text,
        success: false,
        error: error instanceof Error ? error.message : 'Erro Google Translate',
      };
    }
  }

  /**
   * Fallback com dicionário básico para termos comuns
   */
  private translateWithFallback(
    text: string,
    from: Language,
    to: Language
  ): TranslationResponse {
    // Dicionário básico para termos mais comuns
    const dictionary = this.getBasicDictionary(from, to);

    let translatedText = text;

    // Aplicar traduções do dicionário
    for (const [original, translation] of Object.entries(dictionary)) {
      const regex = new RegExp(`\\b${original}\\b`, 'gi');
      translatedText = translatedText.replace(regex, translation);
    }

    return {
      translatedText,
      success: true,
    };
  }

  /**
   * Dicionário básico para termos musicais e interface
   */
  private getBasicDictionary(
    from: Language,
    to: Language
  ): Record<string, string> {
    if (from === 'pt' && to === 'en') {
      return {
        // Navbar
        Instrumentos: 'Instruments',
        Compositores: 'Composers',
        Obras: 'Works',
        'Quem somos': 'About us',
        'História da Música': 'Music History',
        'Todas as Obras': 'All Works',
        Categorias: 'Categories',
        'Explore nossa coleção completa': 'Explore our complete collection',
        'Navegue por gêneros musicais': 'Browse musical genres',

        // Interface comum
        'Meu Perfil': 'My Profile',
        Favoritos: 'Favorites',
        Lições: 'Lessons',
        Anotações: 'Annotations',
        Uploads: 'Uploads',
        Sair: 'Logout',
        Entrar: 'Login',
        'Criar Conta': 'Create Account',
        Salvar: 'Save',
        Cancelar: 'Cancel',
        Confirmar: 'Confirm',
        Carregar: 'Load',
        Carregando: 'Loading',
        Erro: 'Error',

        // Termos musicais
        Compositor: 'Composer',
        Obra: 'Work',
        Partitura: 'Score',
        Instrumento: 'Instrument',
        Piano: 'Piano',
        Violino: 'Violin',
        Violão: 'Guitar',
        Orquestra: 'Orchestra',
        Sinfonia: 'Symphony',
        Concerto: 'Concerto',
        Sonata: 'Sonata',

        // Períodos musicais
        Barroco: 'Baroque',
        Clássico: 'Classical',
        Romântico: 'Romantic',
        Moderno: 'Modern',
        Contemporâneo: 'Contemporary',
      };
    } else if (from === 'en' && to === 'pt') {
      // Inverter o dicionário
      const ptToEn = this.getBasicDictionary('pt', 'en');
      return Object.fromEntries(
        Object.entries(ptToEn).map(([pt, en]) => [en, pt])
      );
    }

    return {};
  }

  /**
   * Rate limiting para evitar spam na API
   */
  private async respectRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    if (timeSinceLastRequest < this.RATE_LIMIT_MS) {
      const waitTime = this.RATE_LIMIT_MS - timeSinceLastRequest;
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }

    this.lastRequestTime = Date.now();
  }

  /**
   * Quebra textos grandes em chunks para tradução
   */
  async translateLongText(
    text: string,
    from: Language,
    to: Language,
    maxChunkSize = 1000
  ): Promise<TranslationResponse> {
    if (text.length <= maxChunkSize) {
      return this.translateText({ text, from, to });
    }

    try {
      // Quebrar por parágrafos primeiro
      const paragraphs = text.split('\n\n').filter((p) => p.trim());
      const translatedParagraphs: string[] = [];

      for (const paragraph of paragraphs) {
        if (paragraph.length <= maxChunkSize) {
          const result = await this.translateText({
            text: paragraph,
            from,
            to,
          });
          translatedParagraphs.push(result.translatedText);
        } else {
          // Se parágrafo ainda é muito grande, quebrar por frases
          const sentences = paragraph.split('. ').filter((s) => s.trim());
          const translatedSentences: string[] = [];

          for (const sentence of sentences) {
            const result = await this.translateText({
              text: sentence + (sentence.endsWith('.') ? '' : '.'),
              from,
              to,
            });
            translatedSentences.push(result.translatedText);
          }

          translatedParagraphs.push(translatedSentences.join(' '));
        }
      }

      return {
        translatedText: translatedParagraphs.join('\n\n'),
        success: true,
      };
    } catch (error) {
      return {
        translatedText: text,
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Erro ao traduzir texto longo',
      };
    }
  }

  /**
   * Limpar cache (útil para desenvolvimento)
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Obter estatísticas do cache
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      pendingRequests: this.pendingRequests.size,
    };
  }
}

// Singleton para uso global
export const translationService = new TranslationService();
