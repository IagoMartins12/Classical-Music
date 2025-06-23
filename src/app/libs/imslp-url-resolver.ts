// lib/imslp-direct-url-resolver-optimized.ts - Versão Ultra-Otimizada com IA
import { IMSLPAdvancedLogger } from './imslp-advanced-logger';

interface SubdomainCache {
  [basePath: string]: {
    subdomain: string;
    timestamp: number;
    hits: number;
    confidence: number;
    lastResponseTime: number;
  };
}

interface PendingRequest {
  [url: string]: Promise<TestResult>;
}

interface TestResult {
  success: boolean;
  status?: number;
  headers?: Record<string, string>;
  responseTime: number;
}

interface URLParseResult {
  folder1: string;
  folder2: string;
  filename: string;
  basePath: string;
}

export class IMSLPDirectUrlResolverOptimized {
  // Cache inteligente com métricas de performance
  private static subdomainCache: SubdomainCache = {};
  private static pendingRequests: PendingRequest = {};

  // Configurações otimizadas
  private static readonly CACHE_TTL = 45 * 60 * 1000; // 45 minutos (mais longo)
  private static readonly QUICK_TEST_TIMEOUT = 1500; // 1.5s (mais rápido)
  private static readonly MAX_PARALLEL_TESTS = 4; // Mais paralelo
  private static readonly RETRY_ATTEMPTS = 2;

  // Subdomínios ordenados por performance histórica (será atualizado dinamicamente)
  private static knownSubdomains = [
    'ks15.imslp.org',
    'vmirror.imslp.org',
    's9.imslp.org',
    'imslp.eu',
    'ks3.imslp.org',
    'ks4.imslp.org',
  ];

  /**
   * 🚀 Método principal otimizado com predição inteligente
   */
  static async resolveDirectUrl(
    hiddenLink: string,
    scoreId: string
  ): Promise<string> {
    const startTime = Date.now();
    const intermediateUrl = `https://imslp.org${hiddenLink}`;
    let finalUrl = intermediateUrl;
    let cacheHit = false;
    let httpStatus: number | undefined;
    let headers: Record<string, string> | undefined;
    let error: string | undefined;
    const attemptedSubdomains: string[] = [];
    let successfulSubdomainIndex = -1;
    let retry = 0;

    let urlInfo;
    try {
      urlInfo = this.parseHiddenLink(hiddenLink);
      if (!urlInfo) {
        throw new Error('Formato de hiddenLink inválido');
      }

      console.log(`\n🎯 === RESOLUÇÃO INTELIGENTE ===`);
      console.log(`🆔 Score ID: ${scoreId}`);
      console.log(`📁 Base Path: ${urlInfo.basePath}`);

      for (retry = 0; retry <= this.RETRY_ATTEMPTS; retry++) {
        if (retry > 0) {
          console.log(`🔄 Tentativa ${retry + 1}/${this.RETRY_ATTEMPTS + 1}`);
          await this.sleep(1000 * retry); // Backoff exponencial
        }

        // 🧠 ESTRATÉGIA 1: Predição IA
        const predictedSubdomain = IMSLPAdvancedLogger.predictBestSubdomain(
          urlInfo.basePath
        );
        if (
          predictedSubdomain &&
          !attemptedSubdomains.includes(predictedSubdomain)
        ) {
          console.log(`🧠 Testando predição IA: ${predictedSubdomain}`);

          const predictedUrl = this.buildDirectUrl(
            urlInfo,
            scoreId,
            predictedSubdomain
          );
          const result = await this.testUrlWithDetails(predictedUrl);

          attemptedSubdomains.push(predictedSubdomain);

          if (result.success) {
            this.cacheSubdomain(
              urlInfo.basePath,
              predictedSubdomain,
              result.responseTime,
              0.9
            );
            finalUrl = predictedUrl;
            cacheHit = false; // É predição, não cache tradicional
            httpStatus = result.status;
            headers = result.headers;
            successfulSubdomainIndex = 0;

            console.log(`✅ Predição IA funcionou! ${predictedSubdomain}`);
            break;
          }
        }

        // 🚀 ESTRATÉGIA 2: Cache tradicional
        const cachedSubdomain = this.getCachedSubdomain(urlInfo.basePath);
        if (cachedSubdomain && !attemptedSubdomains.includes(cachedSubdomain)) {
          console.log(`💾 Testando cache: ${cachedSubdomain}`);

          const cachedUrl = this.buildDirectUrl(
            urlInfo,
            scoreId,
            cachedSubdomain
          );
          const result = await this.testUrlWithDetails(cachedUrl);

          attemptedSubdomains.push(cachedSubdomain);

          if (result.success) {
            this.updateCacheHits(urlInfo.basePath);
            finalUrl = cachedUrl;
            cacheHit = true;
            httpStatus = result.status;
            headers = result.headers;
            successfulSubdomainIndex = 1;

            console.log(`✅ Cache válido! ${cachedSubdomain}`);
            break;
          } else {
            // Cache inválido, remover
            delete this.subdomainCache[urlInfo.basePath];
          }
        }

        // 🚀 ESTRATÉGIA 3: Teste paralelo inteligente
        const remainingSubdomains = this.knownSubdomains.filter(
          (sub) => !attemptedSubdomains.includes(sub)
        );

        if (remainingSubdomains.length > 0) {
          console.log(
            `🔍 Testando ${Math.min(
              this.MAX_PARALLEL_TESTS,
              remainingSubdomains.length
            )} subdomínios em paralelo...`
          );

          const result = await this.findWorkingSubdomainParallel(
            urlInfo,
            scoreId,
            remainingSubdomains.slice(0, this.MAX_PARALLEL_TESTS)
          );

          if (result) {
            attemptedSubdomains.push(result.subdomain);
            this.cacheSubdomain(
              urlInfo.basePath,
              result.subdomain,
              result.responseTime
            );
            this.reorderSubdomains(result.subdomain); // Otimizar ordem futura

            finalUrl = result.url;
            httpStatus = result.status;
            headers = result.headers;
            successfulSubdomainIndex =
              remainingSubdomains.indexOf(result.subdomain) + 2;

            console.log(`✅ Encontrado em paralelo: ${result.subdomain}`);
            break;
          }
        }

        // Se chegou aqui, nenhuma estratégia funcionou nesta tentativa
        if (retry === this.RETRY_ATTEMPTS) {
          console.log(`⚠️ Todas as estratégias falharam, usando fallback`);
          finalUrl = this.buildDirectUrl(
            urlInfo,
            scoreId,
            this.knownSubdomains[0]
          );
          successfulSubdomainIndex = -1;
        }
      }
    } catch (err) {
      error = err instanceof Error ? err.message : 'Erro desconhecido';
      console.error(`❌ Erro na resolução: ${error}`);
      finalUrl = intermediateUrl;
      successfulSubdomainIndex = -1;
    }

    const processingTime = Date.now() - startTime;

    // 📝 Log detalhado para análise
    await IMSLPAdvancedLogger.log({
      timestamp: new Date().toISOString(),
      scoreId,
      intermediateUrl,
      finalUrl,
      subdomain: this.extractSubdomain(finalUrl),
      basePath: urlInfo?.basePath || 'unknown',
      folder1: urlInfo?.folder1 || 'unknown',
      folder2: urlInfo?.folder2 || 'unknown',
      filename: urlInfo?.filename || 'unknown',
      processingTime,
      httpStatus,
      headers,
      cacheHit,
      error,
      attemptedSubdomains,
      successfulSubdomainIndex,
      userAgent: 'IMSLPBot/2.0',
      sessionId: 'current',
      retry,
    });

    console.log(`🎯 Resolução completa em ${processingTime}ms\n`);

    return finalUrl;
  }

  /**
   * 🚀 Teste paralelo ultra-otimizado
   */
  private static async findWorkingSubdomainParallel(
    urlInfo: URLParseResult,
    scoreId: string,
    subdomains: string[]
  ): Promise<{
    subdomain: string;
    url: string;
    status: number;
    headers: Record<string, string>;
    responseTime: number;
  } | null> {
    const testPromises = subdomains.map(async (subdomain) => {
      const url = this.buildDirectUrl(urlInfo, scoreId, subdomain);
      const result = await this.testUrlWithDeduplication(url);

      return result.success
        ? {
            subdomain,
            url,
            status: result.status!,
            headers: result.headers!,
            responseTime: result.responseTime,
          }
        : null;
    });

    // Race condition - pegar o primeiro que funcionar
    const results = await Promise.allSettled(testPromises);

    for (const result of results) {
      if (result.status === 'fulfilled' && result.value) {
        return result.value;
      }
    }

    return null;
  }

  /**
   * 🚀 Teste com deduplicação e métricas detalhadas
   */
  private static async testUrlWithDeduplication(
    url: string
  ): Promise<TestResult> {
    // Reutilizar requisição em andamento
    if (await this.pendingRequests[url]) {
      console.log(`🔄 Reutilizando request: ${url}`);
      return await this.pendingRequests[url];
    }

    // Criar nova requisição
    const requestPromise = this.testUrlWithDetails(url);
    this.pendingRequests[url] = requestPromise;

    try {
      return await requestPromise;
    } finally {
      // Limpar após delay para permitir reutilização por um tempo
      setTimeout(() => {
        delete this.pendingRequests[url];
      }, 5000);
    }
  }

  /**
   * 🚀 Teste ultra-rápido com métricas completas
   */
  private static async testUrlWithDetails(url: string): Promise<TestResult> {
    const startTime = Date.now();

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        this.QUICK_TEST_TIMEOUT
      );

      const response = await fetch(url, {
        method: 'HEAD',
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; IMSLPBot/2.0)',
          Accept: 'application/pdf,*/*;q=0.8',
          'Accept-Encoding': 'gzip, deflate, br',
          Connection: 'keep-alive',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;
      const isSuccess = response.status === 200 || response.status === 206;

      // Capturar headers úteis
      const headers: Record<string, string> = {};
      [
        'content-type',
        'content-length',
        'last-modified',
        'server',
        'cache-control',
      ].forEach((key) => {
        const value = response.headers.get(key);
        if (value) headers[key] = value;
      });

      if (isSuccess) {
        console.log(
          `   ✅ ${this.extractSubdomain(url)} - ${
            response.status
          } (${responseTime}ms)`
        );
      } else {
        console.log(
          `   ❌ ${this.extractSubdomain(url)} - ${
            response.status
          } (${responseTime}ms)`
        );
      }

      return {
        success: isSuccess,
        status: response.status,
        headers,
        responseTime,
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;

      if (error instanceof Error && error.name === 'AbortError') {
        console.log(
          `   ⏱️ ${this.extractSubdomain(url)} - Timeout (${responseTime}ms)`
        );
      } else {
        console.log(
          `   ❌ ${this.extractSubdomain(
            url
          )} - Error: ${error} (${responseTime}ms)`
        );
      }

      return { success: false, responseTime };
    }
  }

  /**
   * 🧠 Reordenar subdomínios baseado em performance
   */
  private static reorderSubdomains(successfulSubdomain: string): void {
    const index = this.knownSubdomains.indexOf(successfulSubdomain);
    if (index > 0) {
      // Mover o subdomain bem-sucedido para frente (mas não para o primeiro lugar imediatamente)
      this.knownSubdomains.splice(index, 1);
      this.knownSubdomains.splice(1, 0, successfulSubdomain);

      console.log(`📈 Subdomínio ${successfulSubdomain} promovido na ordem`);
    }
  }

  /**
   * Cache inteligente com métricas de performance
   */
  private static getCachedSubdomain(basePath: string): string | null {
    const cached = this.subdomainCache[basePath];

    if (!cached) return null;

    // Verificar TTL
    const now = Date.now();
    if (now - cached.timestamp > this.CACHE_TTL) {
      delete this.subdomainCache[basePath];
      return null;
    }

    // Verificar confiabilidade
    if (cached.confidence < 0.3) {
      return null; // Não confiar em cache com baixa confiabilidade
    }

    return cached.subdomain;
  }

  private static cacheSubdomain(
    basePath: string,
    subdomain: string,
    responseTime: number,
    confidence: number = 0.7
  ): void {
    this.subdomainCache[basePath] = {
      subdomain,
      timestamp: Date.now(),
      hits: 1,
      confidence,
      lastResponseTime: responseTime,
    };

    console.log(
      `💾 Cache: ${basePath} -> ${subdomain} (${responseTime}ms, conf: ${(
        confidence * 100
      ).toFixed(1)}%)`
    );
  }

  private static updateCacheHits(basePath: string): void {
    if (this.subdomainCache[basePath]) {
      this.subdomainCache[basePath].hits++;
      this.subdomainCache[basePath].confidence = Math.min(
        this.subdomainCache[basePath].confidence + 0.1,
        1.0
      );
    }
  }

  // Métodos auxiliares (mantidos iguais)
  private static extractSubdomain(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch {
      return 'unknown';
    }
  }

  private static parseHiddenLink(hiddenLink: string): URLParseResult | null {
    const match = hiddenLink.match(/\/images\/([^\/]+)\/([^\/]+)\/([^\/]+)$/);

    if (!match) {
      console.error('❌ Parse error:', hiddenLink);
      return null;
    }

    const [, folder1, folder2, filename] = match;
    const basePath = `${folder1}/${folder2}`;

    return {
      folder1,
      folder2,
      filename: decodeURIComponent(filename),
      basePath,
    };
  }

  private static buildDirectUrl(
    urlInfo: URLParseResult,
    scoreId: string,
    subdomain: string
  ): string {
    const { folder1, folder2, filename } = urlInfo;
    const prefixedFilename = `IMSLP${scoreId}-${filename}`;
    const imgPath = subdomain === 'imslp.eu' ? 'euimg' : 'usimg';

    return `https://${subdomain}/files/imglnks/${imgPath}/${folder1}/${folder2}/${prefixedFilename}`;
  }

  private static sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // APIs públicas
  static async getDirectDownloadUrl(
    hiddenLink: string,
    scoreId: string
  ): Promise<string> {
    console.log(`🎯 [ULTRA-OTIMIZADO] Resolvendo: ${scoreId}`);
    return await this.resolveDirectUrl(hiddenLink, scoreId);
  }

  static clearCache(): void {
    this.subdomainCache = {};
    this.pendingRequests = {};
    console.log('🗑️ Cache limpo');
  }

  static getCacheStats(): {
    totalEntries: number;
    entries: SubdomainCache;
    avgConfidence: number;
    avgResponseTime: number;
  } {
    const entries = Object.values(this.subdomainCache);
    const avgConfidence =
      entries.length > 0
        ? entries.reduce((sum, e) => sum + e.confidence, 0) / entries.length
        : 0;
    const avgResponseTime =
      entries.length > 0
        ? entries.reduce((sum, e) => sum + e.lastResponseTime, 0) /
          entries.length
        : 0;

    return {
      totalEntries: entries.length,
      entries: { ...this.subdomainCache },
      avgConfidence,
      avgResponseTime,
    };
  }

  // Integração com sistema de logging
  static getUrlLogStats() {
    return IMSLPAdvancedLogger.getStats();
  }

  static getUrlLogs() {
    return IMSLPAdvancedLogger.getLogs();
  }

  static clearUrlLogs(): void {
    IMSLPAdvancedLogger.clearLogs();
  }

  static exportUrlLogsToJSON(): string {
    return IMSLPAdvancedLogger.exportAllLogs();
  }

  static async saveLogsToFile(): Promise<string> {
    // Trigger save through analysis generation
    await IMSLPAdvancedLogger.generatePatternAnalysis();
    return `logs/imslp/pattern_analysis_${
      new Date().toISOString().split('T')[0]
    }.json`;
  }

  // 📊 Análise inteligente de padrões
  static async generateIntelligentReport(): Promise<any> {
    return await IMSLPAdvancedLogger.generatePatternAnalysis();
  }

  static getPredictionModel() {
    return IMSLPAdvancedLogger.getPredictionModel();
  }
}
