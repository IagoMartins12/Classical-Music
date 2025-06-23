// lib/imslp-advanced-logger.ts - Sistema Avançado de Logging e Análise
import { promises as fs } from 'fs';
import path from 'path';

interface DetailedURLLogEntry {
  timestamp: string;
  scoreId: string;
  intermediateUrl: string;
  finalUrl: string;
  subdomain: string;
  basePath: string;
  folder1: string;
  folder2: string;
  filename: string;
  processingTime: number;
  httpStatus?: number;
  headers?: Record<string, string>;
  cacheHit: boolean;
  error?: string;
  attemptedSubdomains: string[];
  successfulSubdomainIndex: number;
  ipAddress?: string;
  userAgent: string;
  sessionId: string;
  retry: number;
  fileSize?: string;
  contentType?: string;
}

interface SubdomainPattern {
  pattern: string;
  subdomains: string[];
  successRate: number;
  averageTime: number;
  lastSeen: string;
  confidence: number;
}

interface PredictionModel {
  patterns: Map<string, SubdomainPattern>;
  globalStats: {
    totalRequests: number;
    successfulRequests: number;
    averageResponseTime: number;
    mostReliableSubdomain: string;
    lastUpdated: string;
  };
}

export class IMSLPAdvancedLogger {
  private static logs: DetailedURLLogEntry[] = [];
  private static readonly MAX_MEMORY_LOGS = 500; // Reduzido para economia de memória
  private static readonly LOG_FILE_PATH = './logs/imslp';
  private static readonly ANALYSIS_FILE_PATH = './logs/imslp/analysis';
  private static sessionId = this.generateSessionId();
  private static predictionModel: PredictionModel = {
    patterns: new Map(),
    globalStats: {
      totalRequests: 0,
      successfulRequests: 0,
      averageResponseTime: 0,
      mostReliableSubdomain: '',
      lastUpdated: new Date().toISOString(),
    },
  };

  private static generateSessionId(): string {
    return `session_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 9)}`;
  }

  static async log(entry: DetailedURLLogEntry): Promise<void> {
    try {
      // Adicionar dados da sessão
      const enhancedEntry = {
        ...entry,
        sessionId: this.sessionId,
        userAgent: 'IMSLPBot/2.0',
      };

      // Manter logs em memória (limitado)
      this.logs.push(enhancedEntry);
      if (this.logs.length > this.MAX_MEMORY_LOGS) {
        this.logs = this.logs.slice(-this.MAX_MEMORY_LOGS);
      }

      // Salvar em arquivo imediatamente (async)
      this.saveLogToFile(enhancedEntry).catch(console.error);

      // Atualizar modelo de predição
      this.updatePredictionModel(enhancedEntry);

      // Log no console (mais compacto)
      console.log(`\n📊 URL LOG [${entry.scoreId}]:`);
      console.log(
        `   🎯 ${entry.subdomain} | ⏱️ ${entry.processingTime}ms | 💾 ${
          entry.cacheHit ? 'HIT' : 'MISS'
        }`
      );
      if (entry.error) {
        console.log(`   ❌ Error: ${entry.error}`);
      }
    } catch (error) {
      console.error('❌ Erro ao fazer log:', error);
    }
  }

  private static async saveLogToFile(
    entry: DetailedURLLogEntry
  ): Promise<void> {
    try {
      // Criar diretório se não existir
      await fs.mkdir(this.LOG_FILE_PATH, { recursive: true });

      // Arquivo com data atual
      const today = new Date().toISOString().split('T')[0];
      const logFile = path.join(this.LOG_FILE_PATH, `imslp_${today}.jsonl`);

      // Salvar como JSON Lines para fácil processamento
      const logLine = JSON.stringify(entry) + '\n';
      await fs.appendFile(logFile, logLine, 'utf8');
    } catch (error) {
      console.error('❌ Erro ao salvar log em arquivo:', error);
    }
  }

  private static updatePredictionModel(entry: DetailedURLLogEntry): void {
    try {
      const pattern = `${entry.folder1}/${entry.folder2}`;

      // Atualizar padrão específico
      let patternData = this.predictionModel.patterns.get(pattern);
      if (!patternData) {
        patternData = {
          pattern,
          subdomains: [],
          successRate: 0,
          averageTime: 0,
          lastSeen: entry.timestamp,
          confidence: 0,
        };
      }

      // Adicionar subdomain se não existir
      if (!patternData.subdomains.includes(entry.subdomain)) {
        patternData.subdomains.push(entry.subdomain);
      }

      // Atualizar estatísticas
      patternData.lastSeen = entry.timestamp;
      patternData.averageTime =
        (patternData.averageTime + entry.processingTime) / 2;

      if (!entry.error) {
        patternData.successRate = Math.min(patternData.successRate + 0.1, 1.0);
        patternData.confidence = Math.min(patternData.confidence + 0.05, 1.0);
      } else {
        patternData.successRate = Math.max(patternData.successRate - 0.05, 0);
      }

      this.predictionModel.patterns.set(pattern, patternData);

      // Atualizar estatísticas globais
      this.predictionModel.globalStats.totalRequests++;
      if (!entry.error) {
        this.predictionModel.globalStats.successfulRequests++;
      }

      this.predictionModel.globalStats.averageResponseTime =
        (this.predictionModel.globalStats.averageResponseTime +
          entry.processingTime) /
        2;

      this.predictionModel.globalStats.lastUpdated = entry.timestamp;

      // Salvar modelo atualizado (debounced)
      this.debouncedSaveModel();
    } catch (error) {
      console.error('❌ Erro ao atualizar modelo de predição:', error);
    }
  }

  private static saveModelTimeout: NodeJS.Timeout | null = null;
  private static debouncedSaveModel(): void {
    if (this.saveModelTimeout) {
      clearTimeout(this.saveModelTimeout);
    }

    this.saveModelTimeout = setTimeout(() => {
      this.saveAnalysisModel().catch(console.error);
    }, 5000); // Salvar a cada 5 segundos no máximo
  }

  private static async saveAnalysisModel(): Promise<void> {
    try {
      await fs.mkdir(this.ANALYSIS_FILE_PATH, { recursive: true });

      // Converter Map para Object para serialização
      const modelData = {
        patterns: Object.fromEntries(this.predictionModel.patterns),
        globalStats: this.predictionModel.globalStats,
        metadata: {
          savedAt: new Date().toISOString(),
          sessionId: this.sessionId,
          version: '2.0',
        },
      };

      const analysisFile = path.join(
        this.ANALYSIS_FILE_PATH,
        'prediction_model.json'
      );
      await fs.writeFile(
        analysisFile,
        JSON.stringify(modelData, null, 2),
        'utf8'
      );
    } catch (error) {
      console.error('❌ Erro ao salvar modelo de análise:', error);
    }
  }

  // 🔮 Predição inteligente de subdomain
  static predictBestSubdomain(basePath: string): string | null {
    const pattern = this.predictionModel.patterns.get(basePath);

    if (!pattern || pattern.subdomains.length === 0) {
      return null;
    }

    // Ordenar subdomains por confiabilidade
    const sortedSubdomains = pattern.subdomains.sort((a, b) => {
      // Priorizar por sucesso histórico e velocidade
      const scoreA =
        pattern.successRate * 0.7 + (1 / pattern.averageTime) * 0.3;
      const scoreB =
        pattern.successRate * 0.7 + (1 / pattern.averageTime) * 0.3;
      return scoreB - scoreA;
    });

    console.log(
      `🔮 Predição para ${basePath}: ${sortedSubdomains[0]} (confiança: ${(
        pattern.confidence * 100
      ).toFixed(1)}%)`
    );

    return sortedSubdomains[0];
  }

  // 📊 Análise de padrões
  static async generatePatternAnalysis(): Promise<{
    topPatterns: Array<{ pattern: string; data: SubdomainPattern }>;
    subdomainRanking: Array<{ subdomain: string; score: number }>;
    recommendations: string[];
    insights: string[];
  }> {
    try {
      const patterns = Array.from(this.predictionModel.patterns.entries())
        .map(([pattern, data]) => ({ pattern, data }))
        .sort((a, b) => b.data.confidence - a.data.confidence)
        .slice(0, 10);

      // Ranking de subdomains por performance geral
      const subdomainPerformance = new Map<
        string,
        { total: number; success: number; avgTime: number }
      >();

      for (const { data } of patterns) {
        for (const subdomain of data.subdomains) {
          const current = subdomainPerformance.get(subdomain) || {
            total: 0,
            success: 0,
            avgTime: 0,
          };
          current.total++;
          current.success += data.successRate;
          current.avgTime = (current.avgTime + data.averageTime) / 2;
          subdomainPerformance.set(subdomain, current);
        }
      }

      const subdomainRanking = Array.from(subdomainPerformance.entries())
        .map(([subdomain, stats]) => ({
          subdomain,
          score:
            (stats.success / stats.total) * 0.8 + (1 / stats.avgTime) * 0.2,
        }))
        .sort((a, b) => b.score - a.score);

      // Gerar insights automáticos
      const insights: string[] = [];
      const recommendations: string[] = [];

      if (subdomainRanking.length > 0) {
        insights.push(
          `Subdomain mais confiável: ${subdomainRanking[0].subdomain}`
        );
        recommendations.push(
          `Priorizar ${subdomainRanking[0].subdomain} para novos requests`
        );
      }

      if (patterns.length > 5) {
        const highConfidencePatterns = patterns.filter(
          (p) => p.data.confidence > 0.8
        );
        insights.push(
          `${highConfidencePatterns.length} padrões com alta confiança (>80%)`
        );

        if (highConfidencePatterns.length > 3) {
          recommendations.push(
            'Implementar cache agressivo para padrões de alta confiança'
          );
        }
      }

      // Salvar análise em arquivo
      const analysisResult = {
        generatedAt: new Date().toISOString(),
        topPatterns: patterns,
        subdomainRanking,
        recommendations,
        insights,
        globalStats: this.predictionModel.globalStats,
      };

      await fs.mkdir(this.ANALYSIS_FILE_PATH, { recursive: true });
      const reportFile = path.join(
        this.ANALYSIS_FILE_PATH,
        `pattern_analysis_${new Date().toISOString().split('T')[0]}.json`
      );
      await fs.writeFile(
        reportFile,
        JSON.stringify(analysisResult, null, 2),
        'utf8'
      );

      return analysisResult;
    } catch (error) {
      console.error('❌ Erro ao gerar análise de padrões:', error);
      return {
        topPatterns: [],
        subdomainRanking: [],
        recommendations: [],
        insights: [],
      };
    }
  }

  // Carregar modelo salvo na inicialização
  static async loadSavedModel(): Promise<void> {
    try {
      const analysisFile = path.join(
        this.ANALYSIS_FILE_PATH,
        'prediction_model.json'
      );
      const data = await fs.readFile(analysisFile, 'utf8');
      const modelData = JSON.parse(data);

      // Restaurar Map dos padrões
      this.predictionModel.patterns = new Map(
        Object.entries(modelData.patterns)
      );
      this.predictionModel.globalStats = modelData.globalStats;

      console.log(
        `🔄 Modelo carregado: ${this.predictionModel.patterns.size} padrões`
      );
    } catch (error) {
      console.log('ℹ️ Nenhum modelo salvo encontrado, iniciando do zero');
    }
  }

  // Métodos para API
  static getLogs(): DetailedURLLogEntry[] {
    return [...this.logs];
  }

  static async getLogFiles(): Promise<string[]> {
    try {
      const files = await fs.readdir(this.LOG_FILE_PATH);
      return files.filter((file) => file.endsWith('.jsonl'));
    } catch {
      return [];
    }
  }

  static async readLogFile(filename: string): Promise<DetailedURLLogEntry[]> {
    try {
      const filePath = path.join(this.LOG_FILE_PATH, filename);
      const content = await fs.readFile(filePath, 'utf8');
      return content
        .split('\n')
        .filter((line) => line.trim())
        .map((line) => JSON.parse(line));
    } catch (error) {
      console.error(`❌ Erro ao ler arquivo ${filename}:`, error);
      return [];
    }
  }

  static exportAllLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  static clearLogs(): void {
    this.logs = [];
    console.log('🗑️ Logs em memória limpos');
  }

  static getPredictionModel(): PredictionModel {
    return {
      patterns: new Map(this.predictionModel.patterns),
      globalStats: { ...this.predictionModel.globalStats },
    };
  }

  static getStats(): {
    totalEntries: number;
    cacheHitRate: number;
    averageTime: number;
    successRate: number;
    topSubdomains: Array<{ subdomain: string; count: number }>;
    patternCount: number;
  } {
    const total = this.logs.length;
    const cacheHits = this.logs.filter((log) => log.cacheHit).length;
    const successful = this.logs.filter((log) => !log.error).length;
    const totalTime = this.logs.reduce(
      (sum, log) => sum + log.processingTime,
      0
    );

    // Contar subdomains
    const subdomainCount = new Map<string, number>();
    this.logs.forEach((log) => {
      const count = subdomainCount.get(log.subdomain) || 0;
      subdomainCount.set(log.subdomain, count + 1);
    });

    const topSubdomains = Array.from(subdomainCount.entries())
      .map(([subdomain, count]) => ({ subdomain, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalEntries: total,
      cacheHitRate: total > 0 ? (cacheHits / total) * 100 : 0,
      averageTime: total > 0 ? totalTime / total : 0,
      successRate: total > 0 ? (successful / total) * 100 : 0,
      topSubdomains,
      patternCount: this.predictionModel.patterns.size,
    };
  }
}

// Inicializar modelo ao carregar o módulo
IMSLPAdvancedLogger.loadSavedModel().catch(console.error);
