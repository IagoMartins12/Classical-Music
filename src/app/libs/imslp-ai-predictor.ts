// lib/imslp-ai-predictor.ts - Sistema de IA para Predição Inteligente de Subdomínios
interface PathPattern {
  folder1: string;
  folder2: string;
  basePath: string;
  filename: any;
}

interface SubdomainStats {
  subdomain: string;
  successCount: number;
  totalAttempts: number;
  averageResponseTime: number;
  lastUsed: Date;
  confidence: number;
  timeOfDayPerformance: { [hour: number]: number };
}

interface LearnedPattern {
  pattern: string;
  subdomainRanking: SubdomainStats[];
  totalSamples: number;
  lastUpdated: Date;
  confidence: number;
}

export class IMSLPAIPredictor {
  private static patterns: Map<string, LearnedPattern> = new Map();
  private static globalSubdomainStats: Map<string, SubdomainStats> = new Map();

  // Lista de subdomínios conhecidos ordenada por performance global
  private static knownSubdomains = [
    'ks15.imslp.org',
    'vmirror.imslp.org',
    's9.imslp.org',
    'ks4.imslp.org',
    'ks3.imslp.org',
    'imslp.eu',
  ];

  /**
   * 🧠 Predição inteligente baseada em padrões aprendidos
   */
  static predictBestSubdomains(pathPattern: PathPattern): string[] {
    const { basePath } = pathPattern;

    // 1. Verificar se temos padrão específico aprendido
    const learnedPattern = this.patterns.get(basePath);
    if (learnedPattern && learnedPattern.confidence > 0.6) {
      console.log(
        `🧠 [AI] Usando padrão aprendido para ${basePath} (conf: ${(
          learnedPattern.confidence * 100
        ).toFixed(1)}%)`
      );

      // Ordenar por performance atual
      const rankedSubdomains = learnedPattern.subdomainRanking
        .filter((stat) => stat.successCount > 0)
        .sort((a, b) => this.calculateScore(b) - this.calculateScore(a))
        .map((stat) => stat.subdomain);

      return rankedSubdomains.length > 0
        ? rankedSubdomains
        : this.getGlobalRanking();
    }

    // 2. Buscar padrões similares (mesmo folder1 ou folder2)
    const similarPatterns = this.findSimilarPatterns(pathPattern);
    if (similarPatterns.length > 0) {
      console.log(`🧠 [AI] Usando padrões similares para ${basePath}`);
      return this.aggregateSimilarPatterns(similarPatterns);
    }

    // 3. Fallback para ranking global
    console.log(`🧠 [AI] Usando ranking global para ${basePath}`);
    return this.getGlobalRanking();
  }

  /**
   * 📊 Calcular score de performance de um subdomínio
   */
  private static calculateScore(stats: SubdomainStats): number {
    const successRate = stats.successCount / Math.max(stats.totalAttempts, 1);
    const speedScore = Math.max(0, (5000 - stats.averageResponseTime) / 5000);
    const recentUsage = Math.max(
      0,
      (Date.now() - stats.lastUsed.getTime()) / (1000 * 60 * 60 * 24)
    );
    const recencyScore = Math.max(0, 1 - recentUsage / 7); // Penalizar se não usado há 7+ dias

    // Considerar performance por hora do dia
    const currentHour = new Date().getHours();
    const hourlyPerformance = stats.timeOfDayPerformance[currentHour] || 1;

    return (
      successRate * 0.4 + // 40% baseado em taxa de sucesso
      speedScore * 0.3 + // 30% baseado em velocidade
      recencyScore * 0.2 + // 20% baseado em uso recente
      hourlyPerformance * 0.1 // 10% baseado em performance horária
    );
  }

  /**
   * 🔍 Encontrar padrões similares para inferência
   */
  private static findSimilarPatterns(
    pathPattern: PathPattern
  ): LearnedPattern[] {
    const { folder1, folder2 } = pathPattern;
    const similar: LearnedPattern[] = [];

    for (const [patternKey, pattern] of this.patterns.entries()) {
      const [f1, f2] = patternKey.split('/');

      if (f1 === folder1 || f2 === folder2) {
        similar.push(pattern);
      }
    }

    return similar.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * 🎯 Agregar padrões similares para fazer predição
   */
  private static aggregateSimilarPatterns(
    patterns: LearnedPattern[]
  ): string[] {
    const subdomainScores = new Map<string, number>();

    patterns.forEach((pattern) => {
      pattern.subdomainRanking.forEach((stat) => {
        const currentScore = subdomainScores.get(stat.subdomain) || 0;
        const patternWeight = pattern.confidence * (pattern.totalSamples / 10);
        const statScore = this.calculateScore(stat) * patternWeight;

        subdomainScores.set(stat.subdomain, currentScore + statScore);
      });
    });

    return Array.from(subdomainScores.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([subdomain]) => subdomain);
  }

  /**
   * 🌐 Obter ranking global dos subdomínios
   */
  private static getGlobalRanking(): string[] {
    const globalRanking = Array.from(this.globalSubdomainStats.values())
      .sort((a, b) => this.calculateScore(b) - this.calculateScore(a))
      .map((stat) => stat.subdomain);

    // Combinar com subdomínios conhecidos que ainda não foram testados
    const untested = this.knownSubdomains.filter(
      (sub) => !globalRanking.includes(sub)
    );

    return [...globalRanking, ...untested];
  }

  /**
   * 📚 Aprender com resultado de uma tentativa
   */
  static learnFromAttempt(
    pathPattern: PathPattern,
    subdomain: string,
    success: boolean,
    responseTime: number,
    httpStatus?: number
  ): void {
    const { basePath } = pathPattern;
    const currentHour = new Date().getHours();

    // Atualizar padrão específico
    let pattern = this.patterns.get(basePath);
    if (!pattern) {
      pattern = {
        pattern: basePath,
        subdomainRanking: [],
        totalSamples: 0,
        lastUpdated: new Date(),
        confidence: 0.1,
      };
      this.patterns.set(basePath, pattern);
    }

    // Encontrar ou criar stats do subdomain no padrão
    let subdomainStat = pattern.subdomainRanking.find(
      (s) => s.subdomain === subdomain
    );
    if (!subdomainStat) {
      subdomainStat = {
        subdomain,
        successCount: 0,
        totalAttempts: 0,
        averageResponseTime: 0,
        lastUsed: new Date(),
        confidence: 0.1,
        timeOfDayPerformance: {},
      };
      pattern.subdomainRanking.push(subdomainStat);
    }

    // Atualizar estatísticas
    subdomainStat.totalAttempts++;
    if (success) {
      subdomainStat.successCount++;
    }

    // Atualizar tempo médio de resposta
    subdomainStat.averageResponseTime =
      (subdomainStat.averageResponseTime * (subdomainStat.totalAttempts - 1) +
        responseTime) /
      subdomainStat.totalAttempts;

    subdomainStat.lastUsed = new Date();
    subdomainStat.confidence = Math.min(
      subdomainStat.successCount / subdomainStat.totalAttempts,
      1.0
    );

    // Atualizar performance por hora
    const currentHourPerf =
      subdomainStat.timeOfDayPerformance[currentHour] || 1;
    const newHourPerf = success
      ? Math.min(currentHourPerf * 1.1, 2.0)
      : Math.max(currentHourPerf * 0.9, 0.5);
    subdomainStat.timeOfDayPerformance[currentHour] = newHourPerf;

    // Atualizar confiança do padrão
    pattern.totalSamples++;
    pattern.lastUpdated = new Date();
    pattern.confidence = Math.min(
      pattern.totalSamples / 10, // Confiança máxima após 10 amostras
      1.0
    );

    // Atualizar estatísticas globais
    this.updateGlobalStats(subdomain, success, responseTime, currentHour);

    // Log de aprendizado
    console.log(
      `🧠 [AI] Aprendizado: ${basePath} -> ${subdomain} | ` +
        `Sucesso: ${success} | Tempo: ${responseTime}ms | ` +
        `Conf: ${(subdomainStat.confidence * 100).toFixed(1)}%`
    );
  }

  /**
   * 📈 Atualizar estatísticas globais
   */
  private static updateGlobalStats(
    subdomain: string,
    success: boolean,
    responseTime: number,
    currentHour: number
  ): void {
    let globalStat = this.globalSubdomainStats.get(subdomain);
    if (!globalStat) {
      globalStat = {
        subdomain,
        successCount: 0,
        totalAttempts: 0,
        averageResponseTime: 0,
        lastUsed: new Date(),
        confidence: 0,
        timeOfDayPerformance: {},
      };
      this.globalSubdomainStats.set(subdomain, globalStat);
    }

    globalStat.totalAttempts++;
    if (success) {
      globalStat.successCount++;
    }

    globalStat.averageResponseTime =
      (globalStat.averageResponseTime * (globalStat.totalAttempts - 1) +
        responseTime) /
      globalStat.totalAttempts;

    globalStat.lastUsed = new Date();
    globalStat.confidence = globalStat.successCount / globalStat.totalAttempts;

    // Atualizar performance horária global
    const currentHourPerf = globalStat.timeOfDayPerformance[currentHour] || 1;
    const newHourPerf = success
      ? Math.min(currentHourPerf * 1.05, 1.5)
      : Math.max(currentHourPerf * 0.95, 0.7);
    globalStat.timeOfDayPerformance[currentHour] = newHourPerf;
  }

  /**
   * 📊 Obter estatísticas para dashboard
   */
  static getAnalytics(): {
    totalPatterns: number;
    patternsWithHighConfidence: number;
    globalSubdomainRanking: SubdomainStats[];
    topPatterns: Array<{
      pattern: string;
      confidence: number;
      samples: number;
      topSubdomain: string;
    }>;
    insights: string[];
    recommendations: string[];
  } {
    const totalPatterns = this.patterns.size;
    const patternsWithHighConfidence = Array.from(
      this.patterns.values()
    ).filter((p) => p.confidence > 0.8).length;

    const globalSubdomainRanking = Array.from(
      this.globalSubdomainStats.values()
    ).sort((a, b) => this.calculateScore(b) - this.calculateScore(a));

    const topPatterns = Array.from(this.patterns.entries())
      .sort((a, b) => b[1].confidence - a[1].confidence)
      .slice(0, 10)
      .map(([pattern, data]) => ({
        pattern,
        confidence: data.confidence,
        samples: data.totalSamples,
        topSubdomain:
          data.subdomainRanking.sort(
            (a, b) => this.calculateScore(b) - this.calculateScore(a)
          )[0]?.subdomain || 'N/A',
      }));

    const insights = this.generateInsights(globalSubdomainRanking, topPatterns);
    const recommendations = this.generateRecommendations(
      globalSubdomainRanking,
      topPatterns
    );

    return {
      totalPatterns,
      patternsWithHighConfidence,
      globalSubdomainRanking,
      topPatterns,
      insights,
      recommendations,
    };
  }

  /**
   * 💡 Gerar insights baseados nos dados
   */
  private static generateInsights(
    globalRanking: SubdomainStats[],
    topPatterns: Array<{
      pattern: string;
      confidence: number;
      samples: number;
      topSubdomain: string;
    }>
  ): string[] {
    const insights: string[] = [];

    if (globalRanking.length > 0) {
      const best = globalRanking[0];
      insights.push(
        `Subdomain mais confiável: ${best.subdomain} (${(
          best.confidence * 100
        ).toFixed(1)}% sucesso)`
      );
    }

    if (topPatterns.length > 0) {
      const highConfidencePatterns = topPatterns.filter(
        (p) => p.confidence > 0.8
      );
      if (highConfidencePatterns.length > 0) {
        insights.push(
          `${highConfidencePatterns.length} padrões com alta confiança (>80%)`
        );
      }
    }

    const totalSamples = topPatterns.reduce((sum, p) => sum + p.samples, 0);
    if (totalSamples > 100) {
      insights.push(
        `Sistema bem treinado com ${totalSamples} amostras coletadas`
      );
    }

    return insights;
  }

  /**
   * 🎯 Gerar recomendações baseadas na análise
   */
  private static generateRecommendations(
    globalRanking: SubdomainStats[],
    topPatterns: Array<{
      pattern: string;
      confidence: number;
      samples: number;
      topSubdomain: string;
    }>
  ): string[] {
    const recommendations: string[] = [];

    if (globalRanking.length > 0) {
      const best = globalRanking[0];
      if (best.confidence > 0.9) {
        recommendations.push(
          `Priorizar ${best.subdomain} para novos padrões desconhecidos`
        );
      }
    }

    const lowConfidencePatterns = topPatterns.filter((p) => p.samples < 5);
    if (lowConfidencePatterns.length > 0) {
      recommendations.push(
        `${lowConfidencePatterns.length} padrões precisam de mais dados para melhor predição`
      );
    }

    if (topPatterns.length > 50) {
      recommendations.push(
        'Considerar limpeza de padrões antigos para otimizar performance'
      );
    }

    return recommendations;
  }

  /**
   * 🧹 Limpar dados antigos para otimização
   */
  static cleanupOldData(daysThreshold: number = 30): void {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysThreshold);

    let patternsRemoved = 0;
    let statsRemoved = 0;

    // Limpar padrões antigos com baixa confiança
    for (const [key, pattern] of this.patterns.entries()) {
      if (pattern.lastUpdated < cutoffDate && pattern.confidence < 0.3) {
        this.patterns.delete(key);
        patternsRemoved++;
      }
    }

    // Limpar stats globais antigas
    for (const [key, stat] of this.globalSubdomainStats.entries()) {
      if (stat.lastUsed < cutoffDate && stat.totalAttempts < 5) {
        this.globalSubdomainStats.delete(key);
        statsRemoved++;
      }
    }

    console.log(
      `🧹 [AI] Limpeza concluída: ${patternsRemoved} padrões e ${statsRemoved} stats removidos`
    );
  }

  /**
   * 💾 Salvar/carregar dados persistentes
   */
  static exportData(): string {
    return JSON.stringify({
      patterns: Object.fromEntries(this.patterns),
      globalStats: Object.fromEntries(this.globalSubdomainStats),
      exportedAt: new Date().toISOString(),
      version: '1.0',
    });
  }

  static importData(jsonData: string): void {
    try {
      const data = JSON.parse(jsonData);

      // Restaurar padrões
      this.patterns = new Map(Object.entries(data.patterns || {}));

      // Restaurar stats globais
      this.globalSubdomainStats = new Map(
        Object.entries(data.globalStats || {})
      );

      console.log(
        `💾 [AI] Dados importados: ${this.patterns.size} padrões, ${this.globalSubdomainStats.size} stats`
      );
    } catch (error) {
      console.error('❌ [AI] Erro ao importar dados:', error);
    }
  }
}

// Tipos exportados para uso em outros módulos
export type { PathPattern, SubdomainStats, LearnedPattern };
