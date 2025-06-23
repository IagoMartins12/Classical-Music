// lib/imslp-intelligent-cache.ts - Sistema de Cache Inteligente com IA
interface CacheEntry {
  url: string;
  subdomain: string;
  basePath: string;
  timestamp: number;
  hits: number;
  lastAccess: number;
  responseTime: number;
  confidence: number;
  httpStatus: number;
  headers?: Record<string, string>;
  expiresAt: number;
}

interface CacheStats {
  totalEntries: number;
  hitRate: number;
  avgResponseTime: number;
  avgConfidence: number;
  oldestEntry: number;
  newestEntry: number;
  topSubdomains: Array<{ subdomain: string; count: number; avgTime: number }>;
}

export class IMSLPIntelligentCache {
  private static cache: Map<string, CacheEntry> = new Map();
  private static readonly DEFAULT_TTL = 45 * 60 * 1000; // 45 minutos
  private static readonly MAX_CACHE_SIZE = 1000;
  private static readonly CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutos

  // Métricas para otimização
  private static hits = 0;
  private static misses = 0;
  private static cleanupTimer: NodeJS.Timeout | null = null;

  /**
   * 🎯 Inicializar sistema de cache
   */
  static initialize(): void {
    // Cleanup automático
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.CLEANUP_INTERVAL);

    console.log('💾 [CACHE] Sistema de cache inteligente inicializado');
  }

  /**
   * 🔍 Obter URL do cache com lógica inteligente
   */
  static get(basePath: string, scoreId: string): string | null {
    const key = this.generateKey(basePath, scoreId);
    const entry = this.cache.get(key);

    if (!entry) {
      this.misses++;
      return null;
    }

    // Verificar se ainda é válido
    const now = Date.now();
    if (now > entry.expiresAt) {
      this.cache.delete(key);
      this.misses++;
      console.log(`💾 [CACHE] Entrada expirada removida: ${basePath}`);
      return null;
    }

    // Verificar confiança mínima
    if (entry.confidence < 0.3) {
      this.cache.delete(key);
      this.misses++;
      console.log(
        `💾 [CACHE] Entrada com baixa confiança removida: ${basePath}`
      );
      return null;
    }

    // Atualizar métricas de acesso
    entry.hits++;
    entry.lastAccess = now;
    this.hits++;

    console.log(
      `💾 [CACHE] HIT: ${basePath} -> ${entry.subdomain} (${
        entry.hits
      } hits, conf: ${(entry.confidence * 100).toFixed(1)}%)`
    );
    return entry.url;
  }

  /**
   * 💾 Salvar no cache com inteligência adaptativa
   */
  static set(
    basePath: string,
    scoreId: string,
    url: string,
    subdomain: string,
    responseTime: number,
    httpStatus: number,
    headers?: Record<string, string>
  ): void {
    const key = this.generateKey(basePath, scoreId);
    const now = Date.now();

    // Calcular TTL baseado na performance
    const ttl = this.calculateAdaptiveTTL(responseTime, httpStatus);

    // Calcular confiança inicial baseada na resposta
    const confidence = this.calculateInitialConfidence(
      httpStatus,
      responseTime,
      headers
    );

    const entry: CacheEntry = {
      url,
      subdomain,
      basePath,
      timestamp: now,
      hits: 1,
      lastAccess: now,
      responseTime,
      confidence,
      httpStatus,
      headers,
      expiresAt: now + ttl,
    };

    this.cache.set(key, entry);

    // Verificar se precisa limpar cache
    if (this.cache.size > this.MAX_CACHE_SIZE) {
      this.evictLeastUseful();
    }

    console.log(
      `💾 [CACHE] SET: ${basePath} -> ${subdomain} (TTL: ${Math.round(
        ttl / 1000 / 60
      )}min, conf: ${(confidence * 100).toFixed(1)}%)`
    );
  }

  /**
   * 📈 Atualizar confiança de uma entrada baseada em uso contínuo
   */
  static updateConfidence(
    basePath: string,
    scoreId: string,
    success: boolean
  ): void {
    const key = this.generateKey(basePath, scoreId);
    const entry = this.cache.get(key);

    if (entry) {
      if (success) {
        entry.confidence = Math.min(entry.confidence * 1.1, 1.0);
      } else {
        entry.confidence = Math.max(entry.confidence * 0.8, 0.1);
      }

      console.log(
        `💾 [CACHE] Confiança atualizada: ${basePath} -> ${(
          entry.confidence * 100
        ).toFixed(1)}%`
      );
    }
  }

  /**
   * ⏰ Calcular TTL adaptativo baseado na performance
   */
  private static calculateAdaptiveTTL(
    responseTime: number,
    httpStatus: number
  ): number {
    let baseTTL = this.DEFAULT_TTL;

    // Ajustar baseado no tempo de resposta
    if (responseTime < 1000) {
      baseTTL *= 1.5; // Respostas rápidas duram mais
    } else if (responseTime > 3000) {
      baseTTL *= 0.7; // Respostas lentas duram menos
    }

    // Ajustar baseado no status HTTP
    if (httpStatus === 200) {
      baseTTL *= 1.2;
    } else if (httpStatus === 206) {
      baseTTL *= 1.1;
    } else {
      baseTTL *= 0.5; // Status não ideais duram menos
    }

    return Math.max(baseTTL, 10 * 60 * 1000); // Mínimo 10 minutos
  }

  /**
   * 🎯 Calcular confiança inicial baseada na resposta
   */
  private static calculateInitialConfidence(
    httpStatus: number,
    responseTime: number,
    headers?: Record<string, string>
  ): number {
    let confidence = 0.5; // Base

    // Ajustar baseado no status
    if (httpStatus === 200) {
      confidence = 0.8;
    } else if (httpStatus === 206) {
      confidence = 0.7;
    } else {
      confidence = 0.3;
    }

    // Ajustar baseado no tempo de resposta
    if (responseTime < 1000) {
      confidence *= 1.2;
    } else if (responseTime > 5000) {
      confidence *= 0.8;
    }

    // Ajustar baseado nos headers
    if (headers) {
      const contentType = headers['content-type'];
      const contentLength = headers['content-length'];

      if (contentType && contentType.includes('pdf')) {
        confidence *= 1.1;
      }

      if (contentLength && parseInt(contentLength) > 100000) {
        confidence *= 1.1; // Arquivos maiores são mais confiáveis
      }
    }

    return Math.min(confidence, 1.0);
  }

  /**
   * 🗑️ Remoção inteligente de entradas menos úteis
   */
  private static evictLeastUseful(): void {
    const entries = Array.from(this.cache.entries());

    // Ordenar por utilidade (hits, confiança, tempo de vida)
    entries.sort((a, b) => {
      const scoreA = this.calculateUtilityScore(a[1]);
      const scoreB = this.calculateUtilityScore(b[1]);
      return scoreA - scoreB; // Menor score primeiro (menos útil)
    });

    // Remover 20% das entradas menos úteis
    const toRemove = Math.floor(entries.length * 0.2);
    for (let i = 0; i < toRemove; i++) {
      this.cache.delete(entries[i][0]);
    }

    console.log(
      `🗑️ [CACHE] ${toRemove} entradas menos úteis removidas (cache: ${this.cache.size}/${this.MAX_CACHE_SIZE})`
    );
  }

  /**
   * 📊 Calcular score de utilidade de uma entrada
   */
  private static calculateUtilityScore(entry: CacheEntry): number {
    const now = Date.now();
    const age = (now - entry.timestamp) / 1000 / 60; // idade em minutos
    const recentAccess = (now - entry.lastAccess) / 1000 / 60; // último acesso em minutos

    return (
      entry.hits * 10 + // Número de hits
      entry.confidence * 50 + // Confiança
      Math.max(0, 100 - age) + // Frescor (menos idade = melhor)
      Math.max(0, 50 - recentAccess) // Acesso recente
    );
  }

  /**
   * 🧹 Limpeza automática de entradas expiradas
   */
  private static cleanup(): void {
    const now = Date.now();
    let removed = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt || entry.confidence < 0.2) {
        this.cache.delete(key);
        removed++;
      }
    }

    if (removed > 0) {
      console.log(
        `🧹 [CACHE] Limpeza automática: ${removed} entradas removidas`
      );
    }
  }

  /**
   * 🔑 Gerar chave única para cache
   */
  private static generateKey(basePath: string, scoreId: string): string {
    return `${basePath}:${scoreId}`;
  }

  /**
   * 📊 Obter estatísticas do cache
   */
  static getStats(): CacheStats {
    const entries = Array.from(this.cache.values());
    const totalRequests = this.hits + this.misses;

    // Calcular estatísticas
    const avgResponseTime =
      entries.length > 0
        ? entries.reduce((sum, e) => sum + e.responseTime, 0) / entries.length
        : 0;

    const avgConfidence =
      entries.length > 0
        ? entries.reduce((sum, e) => sum + e.confidence, 0) / entries.length
        : 0;

    // Top subdomains
    const subdomainMap = new Map<
      string,
      { count: number; totalTime: number }
    >();
    entries.forEach((entry) => {
      const current = subdomainMap.get(entry.subdomain) || {
        count: 0,
        totalTime: 0,
      };
      current.count++;
      current.totalTime += entry.responseTime;
      subdomainMap.set(entry.subdomain, current);
    });

    const topSubdomains = Array.from(subdomainMap.entries())
      .map(([subdomain, data]) => ({
        subdomain,
        count: data.count,
        avgTime: data.totalTime / data.count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const timestamps = entries.map((e) => e.timestamp);

    return {
      totalEntries: this.cache.size,
      hitRate: totalRequests > 0 ? (this.hits / totalRequests) * 100 : 0,
      avgResponseTime,
      avgConfidence,
      oldestEntry: timestamps.length > 0 ? Math.min(...timestamps) : 0,
      newestEntry: timestamps.length > 0 ? Math.max(...timestamps) : 0,
      topSubdomains,
    };
  }

  /**
   * 🔄 Pré-carregar cache baseado em padrões frequentes
   */
  static async preloadFrequentPatterns(
    patterns: Array<{ basePath: string; subdomain: string; confidence: number }>
  ): Promise<void> {
    console.log(
      `🔄 [CACHE] Iniciando pré-carregamento de ${patterns.length} padrões frequentes`
    );

    for (const pattern of patterns) {
      if (pattern.confidence > 0.8) {
        // Simular entrada de cache para padrões de alta confiança
        // Em produção, você pode fazer uma verificação HEAD request
        const mockScoreId = 'preload';
        const mockUrl = `https://${pattern.subdomain}/files/imglnks/usimg/${pattern.basePath}/IMSLP${mockScoreId}-preload.pdf`;

        this.set(
          pattern.basePath,
          mockScoreId,
          mockUrl,
          pattern.subdomain,
          1000, // Tempo simulado
          200,
          { 'content-type': 'application/pdf' }
        );
      }
    }

    console.log(`✅ [CACHE] Pré-carregamento concluído`);
  }

  /**
   * 🗑️ Limpar cache completamente
   */
  static clear(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
    console.log('🗑️ [CACHE] Cache limpo completamente');
  }

  /**
   * 💾 Exportar dados do cache
   */
  static export(): string {
    const data = {
      cache: Object.fromEntries(this.cache),
      metrics: {
        hits: this.hits,
        misses: this.misses,
        exportedAt: new Date().toISOString(),
      },
    };

    return JSON.stringify(data, null, 2);
  }

  /**
   * 📥 Importar dados do cache
   */
  static import(jsonData: string): void {
    try {
      const data = JSON.parse(jsonData);

      // Restaurar cache
      this.cache = new Map(Object.entries(data.cache || {}));

      // Restaurar métricas
      if (data.metrics) {
        this.hits = data.metrics.hits || 0;
        this.misses = data.metrics.misses || 0;
      }

      console.log(`📥 [CACHE] Dados importados: ${this.cache.size} entradas`);
    } catch (error) {
      console.error('❌ [CACHE] Erro ao importar dados:', error);
    }
  }

  /**
   * 🛑 Finalizar sistema de cache
   */
  static shutdown(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    console.log('🛑 [CACHE] Sistema de cache finalizado');
  }
}

// Inicializar automaticamente quando o módulo for carregado
IMSLPIntelligentCache.initialize();
