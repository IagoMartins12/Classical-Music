// app/utils/logging/systemLogger.ts - VERSÃO CORRIGIDA
import { NextRequest } from 'next/server';

// Imports condicionais para funcionar no cliente e servidor
let fs: any = null;
let path: any = null;

// Só importar fs e path no servidor
if (typeof window === 'undefined') {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    fs = require('fs/promises');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    path = require('path');
  } catch (error) {
    console.warn('Failed to import fs/promises or path:', error);
  }
}

// Enums para categorias e níveis
export enum LogCategory {
  API = 'API',
  DATABASE = 'DATABASE',
  AUTH = 'AUTH',
  SECURITY = 'SECURITY',
  PERFORMANCE = 'PERFORMANCE',
  ADMIN = 'ADMIN',
  SYSTEM = 'SYSTEM',
  AUDIT = 'AUDIT',
}

export enum LogLevel {
  ERROR = 'ERROR',
  WARN = 'WARN',
  INFO = 'INFO',
  DEBUG = 'DEBUG',
  TRACE = 'TRACE',
}

// Interface principal do log
export interface SystemLogEntry {
  id: string;
  timestamp: string; // ISO string
  level: LogLevel;
  category: LogCategory;
  message: string;

  // Contexto HTTP (se aplicável)
  method?: string;
  path?: string;
  statusCode?: number;
  duration?: number;

  // Contexto do usuário
  userId?: string;
  userName?: string;
  userRole?: number;
  sessionId?: string;

  // Contexto da requisição
  ipAddress?: string;
  userAgent?: string;
  referer?: string;

  // Dados técnicos
  error?: {
    message: string;
    stack?: string;
    code?: string;
  };

  // Contexto do banco de dados
  query?: {
    model?: string;
    operation?: string;
    duration?: number;
    sql?: string;
  };

  // Metadados adicionais
  metadata?: Record<string, any>;
  traceId?: string;
}

// Interface para arquivos de log
interface LogFile {
  date: string;
  logs: SystemLogEntry[];
  stats: {
    total: number;
    byLevel: Record<LogLevel, number>;
    byCategory: Record<LogCategory, number>;
    avgDuration?: number;
    errorRate: number;
  };
}

class SystemLogger {
  private static instance: SystemLogger;
  private logQueue: SystemLogEntry[] = [];
  private isProcessing = false;
  private readonly LOG_DIR: string;
  private readonly BATCH_SIZE = 50;
  private readonly FLUSH_INTERVAL = 5000; // 5 segundos
  private readonly SLOW_QUERY_THRESHOLD = 90000; // 1.5 minutos
  private readonly isServer: boolean;

  private constructor() {
    this.isServer = typeof window === 'undefined';
    this.LOG_DIR = this.isServer ? path?.join(process.cwd(), 'SystemLogs') : '';

    if (this.isServer) {
      this.ensureLogDirectory();
      this.startPeriodicFlush();
      this.setupProcessHandlers();
    }
  }

  public static getInstance(): SystemLogger {
    if (!SystemLogger.instance) {
      SystemLogger.instance = new SystemLogger();
    }
    return SystemLogger.instance;
  }

  // Verificar se estamos no servidor
  private checkServerSide(): boolean {
    if (!this.isServer) {
      console.warn(
        'SystemLogger: File operations only available on server side'
      );
      return false;
    }
    if (!fs || !path) {
      console.warn('SystemLogger: fs or path modules not available');
      return false;
    }
    return true;
  }

  // Garantir que o diretório de logs existe
  private async ensureLogDirectory(): Promise<void> {
    if (!this.checkServerSide()) return;

    try {
      await fs.access(this.LOG_DIR);
    } catch {
      await fs.mkdir(this.LOG_DIR, { recursive: true });
    }
  }

  // Iniciar flush periódico
  private startPeriodicFlush(): void {
    if (!this.isServer) return;

    setInterval(() => {
      if (this.logQueue.length > 0) {
        this.flushLogs();
      }
    }, this.FLUSH_INTERVAL);
  }

  // Configurar handlers para salvar logs antes do processo terminar
  private setupProcessHandlers(): void {
    if (!this.isServer) return;

    const gracefulShutdown = () => {
      this.flushLogs(true);
    };

    process.on('SIGINT', gracefulShutdown);
    process.on('SIGTERM', gracefulShutdown);
    process.on('beforeExit', gracefulShutdown);
  }

  // Gerar ID único para o log
  private generateLogId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2)}`;
  }

  // Obter nome do arquivo para a data
  private getLogFileName(date: Date = new Date()): string {
    if (!this.checkServerSide()) return '';

    const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
    return path.join(this.LOG_DIR, `${dateStr}.json`);
  }

  // Método principal para registrar logs
  public log(entry: Omit<SystemLogEntry, 'id' | 'timestamp'>): void {
    const logEntry: SystemLogEntry = {
      id: this.generateLogId(),
      timestamp: new Date().toISOString(),
      ...entry,
    };

    // Adicionar à queue (assíncrono) - funciona no cliente e servidor
    this.logQueue.push(logEntry);

    // Log crítico também vai para o console
    if (entry.level === LogLevel.ERROR) {
      console.error(`🔴 [${entry.category}] ${entry.message}`, entry.error);
    } else if (entry.level === LogLevel.WARN) {
      console.warn(`🟡 [${entry.category}] ${entry.message}`);
    } else if (
      process.env.NODE_ENV === 'development' &&
      entry.level === LogLevel.INFO
    ) {
      console.log(`🔵 [${entry.category}] ${entry.message}`);
    }

    // Flush se a queue estiver muito grande (apenas no servidor)
    if (this.isServer && this.logQueue.length >= this.BATCH_SIZE) {
      setImmediate(() => this.flushLogs());
    }
  }

  // Métodos de conveniência para cada nível
  public error(
    category: LogCategory,
    message: string,
    context?: Partial<SystemLogEntry>
  ): void {
    this.log({ level: LogLevel.ERROR, category, message, ...context });
  }

  public warn(
    category: LogCategory,
    message: string,
    context?: Partial<SystemLogEntry>
  ): void {
    this.log({ level: LogLevel.WARN, category, message, ...context });
  }

  public info(
    category: LogCategory,
    message: string,
    context?: Partial<SystemLogEntry>
  ): void {
    this.log({ level: LogLevel.INFO, category, message, ...context });
  }

  public debug(
    category: LogCategory,
    message: string,
    context?: Partial<SystemLogEntry>
  ): void {
    this.log({ level: LogLevel.DEBUG, category, message, ...context });
  }

  public trace(
    category: LogCategory,
    message: string,
    context?: Partial<SystemLogEntry>
  ): void {
    this.log({ level: LogLevel.TRACE, category, message, ...context });
  }

  // Métodos específicos para diferentes tipos de log
  public logAPIRequest(
    method: string,
    path: string,
    statusCode: number,
    duration: number,
    context?: Partial<SystemLogEntry>
  ): void {
    const level =
      statusCode >= 500
        ? LogLevel.ERROR
        : statusCode >= 400
        ? LogLevel.WARN
        : LogLevel.INFO;

    this.log({
      level,
      category: LogCategory.API,
      message: `${method} ${path} - ${statusCode} (${duration}ms)`,
      method,
      path,
      statusCode,
      duration,
      ...context,
    });
  }

  public logPrismaQuery(
    model: string,
    operation: string,
    duration: number,
    context?: Partial<SystemLogEntry>
  ): void {
    const isSlowQuery = duration > this.SLOW_QUERY_THRESHOLD;
    const level = isSlowQuery ? LogLevel.WARN : LogLevel.DEBUG;
    const category = isSlowQuery
      ? LogCategory.PERFORMANCE
      : LogCategory.DATABASE;

    this.log({
      level,
      category,
      message: `Prisma ${operation} on ${model} (${duration}ms)${
        isSlowQuery ? ' - SLOW QUERY' : ''
      }`,
      query: { model, operation, duration },
      duration,
      ...context,
    });
  }

  public logAuthEvent(
    event: string,
    success: boolean,
    context?: Partial<SystemLogEntry>
  ): void {
    this.log({
      level: success ? LogLevel.INFO : LogLevel.WARN,
      category: LogCategory.AUTH,
      message: `Authentication ${event}: ${success ? 'Success' : 'Failed'}`,
      ...context,
    });
  }

  public logSecurityEvent(
    event: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    context?: Partial<SystemLogEntry>
  ): void {
    const level =
      severity === 'critical' || severity === 'high'
        ? LogLevel.ERROR
        : LogLevel.WARN;

    this.log({
      level,
      category: LogCategory.SECURITY,
      message: `Security Event [${severity.toUpperCase()}]: ${event}`,
      metadata: { severity },
      ...context,
    });
  }

  public logAdminAction(
    action: string,
    context?: Partial<SystemLogEntry>
  ): void {
    this.log({
      level: LogLevel.INFO,
      category: LogCategory.ADMIN,
      message: `Admin Action: ${action}`,
      ...context,
    });
  }

  public logSystemEvent(
    event: string,
    level: LogLevel = LogLevel.INFO,
    context?: Partial<SystemLogEntry>
  ): void {
    this.log({
      level,
      category: LogCategory.SYSTEM,
      message: `System: ${event}`,
      ...context,
    });
  }

  public logAuditEvent(
    action: string,
    resource: string,
    context?: Partial<SystemLogEntry>
  ): void {
    this.log({
      level: LogLevel.INFO,
      category: LogCategory.AUDIT,
      message: `Audit: ${action} on ${resource}`,
      ...context,
    });
  }

  // Flush logs para arquivo (apenas servidor)
  private async flushLogs(force = false): Promise<void> {
    if (!this.checkServerSide()) return;
    if (this.isProcessing && !force) return;
    if (this.logQueue.length === 0) return;

    this.isProcessing = true;
    const logsToFlush = [...this.logQueue];

    try {
      // Pegar logs da queue
      this.logQueue = [];

      // Agrupar logs por data
      const logsByDate = new Map<string, SystemLogEntry[]>();

      for (const log of logsToFlush) {
        const date = log.timestamp.split('T')[0];
        if (!logsByDate.has(date)) {
          logsByDate.set(date, []);
        }
        logsByDate.get(date)!.push(log);
      }

      // Salvar cada grupo em seu arquivo
      for (const [date, logs] of logsByDate) {
        await this.saveLogsToFile(date, logs);
      }
    } catch (error) {
      console.error('Erro ao salvar logs:', error);
      // Recolocar logs na queue em caso de erro
      this.logQueue.unshift(...logsToFlush);
    } finally {
      this.isProcessing = false;
    }
  }

  // Salvar logs no arquivo específico da data (apenas servidor)
  private async saveLogsToFile(
    date: string,
    newLogs: SystemLogEntry[]
  ): Promise<void> {
    if (!this.checkServerSide()) return;

    const fileName = path.join(this.LOG_DIR, `${date}.json`);

    try {
      // Ler arquivo existente ou criar novo
      let logFile: LogFile;

      try {
        const existingContent = await fs.readFile(fileName, 'utf-8');
        logFile = JSON.parse(existingContent);
      } catch {
        logFile = {
          date,
          logs: [],
          stats: {
            total: 0,
            byLevel: {} as Record<LogLevel, number>,
            byCategory: {} as Record<LogCategory, number>,
            errorRate: 0,
          },
        };
      }

      // Adicionar novos logs
      logFile.logs.push(...newLogs);

      // Recalcular estatísticas
      logFile.stats = this.calculateStats(logFile.logs);

      // Salvar arquivo
      await fs.writeFile(fileName, JSON.stringify(logFile, null, 2));
    } catch (error) {
      console.error(`Erro ao salvar logs para ${date}:`, error);
      throw error;
    }
  }

  // Calcular estatísticas dos logs
  private calculateStats(logs: SystemLogEntry[]): LogFile['stats'] {
    const stats = {
      total: logs.length,
      byLevel: {} as Record<LogLevel, number>,
      byCategory: {} as Record<LogCategory, number>,
      avgDuration: 0,
      errorRate: 0,
    };

    // Inicializar contadores
    Object.values(LogLevel).forEach((level) => (stats.byLevel[level] = 0));
    Object.values(LogCategory).forEach(
      (category) => (stats.byCategory[category] = 0)
    );

    let totalDuration = 0;
    let durationCount = 0;
    let errorCount = 0;

    for (const log of logs) {
      stats.byLevel[log.level]++;
      stats.byCategory[log.category]++;

      if (log.duration) {
        totalDuration += log.duration;
        durationCount++;
      }

      if (log.level === LogLevel.ERROR) {
        errorCount++;
      }
    }

    stats.avgDuration =
      durationCount > 0 ? Math.round(totalDuration / durationCount) : 0;
    stats.errorRate =
      logs.length > 0
        ? Math.round((errorCount / logs.length) * 100 * 100) / 100
        : 0;

    return stats;
  }

  // Ler logs de uma data específica (apenas servidor)
  public async readLogs(date: string): Promise<LogFile | null> {
    if (!this.checkServerSide()) return null;

    try {
      const fileName = path.join(this.LOG_DIR, `${date}.json`);
      const content = await fs.readFile(fileName, 'utf-8');
      return JSON.parse(content);
    } catch {
      return null;
    }
  }

  // Listar todas as datas disponíveis (apenas servidor)
  public async getAvailableDates(): Promise<string[]> {
    if (!this.checkServerSide()) return [];

    try {
      const files = await fs.readdir(this.LOG_DIR);
      return files
        .filter((file: any) => file.endsWith('.json'))
        .map((file: any) => file.replace('.json', ''))
        .sort()
        .reverse(); // Mais recentes primeiro
    } catch {
      return [];
    }
  }

  // Buscar logs com filtros (apenas servidor)
  public async searchLogs(filters: {
    dateFrom?: string;
    dateTo?: string;
    level?: LogLevel;
    category?: LogCategory;
    search?: string;
    userId?: string;
    limit?: number;
  }): Promise<{
    logs: SystemLogEntry[];
    total: number;
    dates: string[];
  }> {
    if (!this.checkServerSide()) {
      return { logs: [], total: 0, dates: [] };
    }

    const {
      dateFrom,
      dateTo,
      level,
      category,
      search,
      userId,
      limit = 1000,
    } = filters;

    // Determinar datas a serem buscadas
    let datesToSearch = await this.getAvailableDates();

    if (dateFrom) {
      datesToSearch = datesToSearch.filter((date) => date >= dateFrom);
    }

    if (dateTo) {
      datesToSearch = datesToSearch.filter((date) => date <= dateTo);
    }

    const allLogs: SystemLogEntry[] = [];
    const searchedDates: string[] = [];

    // Buscar logs de cada data
    for (const date of datesToSearch) {
      const logFile = await this.readLogs(date);
      if (!logFile) continue;

      searchedDates.push(date);

      let filteredLogs = logFile.logs;

      // Aplicar filtros
      if (level) {
        filteredLogs = filteredLogs.filter((log) => log.level === level);
      }

      if (category) {
        filteredLogs = filteredLogs.filter((log) => log.category === category);
      }

      if (userId) {
        filteredLogs = filteredLogs.filter((log) => log.userId === userId);
      }

      if (search) {
        const searchLower = search.toLowerCase();
        filteredLogs = filteredLogs.filter(
          (log) =>
            log.message.toLowerCase().includes(searchLower) ||
            log.path?.toLowerCase().includes(searchLower) ||
            log.userName?.toLowerCase().includes(searchLower)
        );
      }

      allLogs.push(...filteredLogs);

      // Parar se atingir o limite
      if (allLogs.length >= limit) {
        break;
      }
    }

    // Ordenar por timestamp (mais recentes primeiro)
    allLogs.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return {
      logs: allLogs.slice(0, limit),
      total: allLogs.length,
      dates: searchedDates,
    };
  }

  // Deletar logs de uma data específica (apenas servidor)
  public async deleteLogs(date: string): Promise<boolean> {
    if (!this.checkServerSide()) return false;

    try {
      const fileName = path.join(this.LOG_DIR, `${date}.json`);
      await fs.unlink(fileName);
      return true;
    } catch {
      return false;
    }
  }

  // Deletar logs antigos (apenas servidor)
  public async cleanupOldLogs(daysOld: number = 14): Promise<number> {
    if (!this.checkServerSide()) return 0;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    const cutoffDateStr = cutoffDate.toISOString().split('T')[0];

    const dates = await this.getAvailableDates();
    const oldDates = dates.filter((date) => date < cutoffDateStr);

    let deletedCount = 0;
    for (const date of oldDates) {
      if (await this.deleteLogs(date)) {
        deletedCount++;
      }
    }

    return deletedCount;
  }

  // Obter estatísticas resumidas (apenas servidor)
  public async getStats(days: number = 7): Promise<{
    totalLogs: number;
    byLevel: Record<LogLevel, number>;
    byCategory: Record<LogCategory, number>;
    errorRate: number;
    avgDuration: number;
    slowQueries: number;
    topErrors: Array<{ message: string; count: number; lastSeen: string }>;
  }> {
    if (!this.checkServerSide()) {
      return {
        totalLogs: 0,
        byLevel: {} as Record<LogLevel, number>,
        byCategory: {} as Record<LogCategory, number>,
        errorRate: 0,
        avgDuration: 0,
        slowQueries: 0,
        topErrors: [],
      };
    }

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    const result = await this.searchLogs({
      dateFrom: startDate.toISOString().split('T')[0],
      dateTo: endDate.toISOString().split('T')[0],
    });

    const stats = {
      totalLogs: result.total,
      byLevel: {} as Record<LogLevel, number>,
      byCategory: {} as Record<LogCategory, number>,
      errorRate: 0,
      avgDuration: 0,
      slowQueries: 0,
      topErrors: [] as Array<{
        message: string;
        count: number;
        lastSeen: string;
      }>,
    };

    // Inicializar contadores
    Object.values(LogLevel).forEach((level) => (stats.byLevel[level] = 0));
    Object.values(LogCategory).forEach(
      (category) => (stats.byCategory[category] = 0)
    );

    let totalDuration = 0;
    let durationCount = 0;
    const errorMessages = new Map<
      string,
      { count: number; lastSeen: string }
    >();

    for (const log of result.logs) {
      stats.byLevel[log.level]++;
      stats.byCategory[log.category]++;

      if (log.duration) {
        totalDuration += log.duration;
        durationCount++;

        if (log.duration > this.SLOW_QUERY_THRESHOLD) {
          stats.slowQueries++;
        }
      }

      if (log.level === LogLevel.ERROR) {
        const existing = errorMessages.get(log.message);
        if (existing) {
          existing.count++;
          if (log.timestamp > existing.lastSeen) {
            existing.lastSeen = log.timestamp;
          }
        } else {
          errorMessages.set(log.message, { count: 1, lastSeen: log.timestamp });
        }
      }
    }

    stats.avgDuration =
      durationCount > 0 ? Math.round(totalDuration / durationCount) : 0;
    stats.errorRate =
      result.total > 0
        ? Math.round(
            (stats.byLevel[LogLevel.ERROR] / result.total) * 100 * 100
          ) / 100
        : 0;

    // Top 5 erros
    stats.topErrors = Array.from(errorMessages.entries())
      .map(([message, data]) => ({ message, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return stats;
  }
}

// Instância singleton
export const systemLogger = SystemLogger.getInstance();

// Utilitários para capturar contexto HTTP
export function extractRequestContext(
  request: NextRequest
): Partial<SystemLogEntry> {
  return {
    ipAddress:
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown',
    userAgent: request.headers.get('user-agent') || 'unknown',
    referer: request.headers.get('referer') || undefined,
  };
}

// Utilitário para capturar stack trace
export function captureError(error: Error): SystemLogEntry['error'] {
  return {
    message: error.message,
    stack: error.stack,
    code: (error as any).code || undefined,
  };
}
