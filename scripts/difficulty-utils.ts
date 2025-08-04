// scripts/difficulty-utils.ts - Utilitários do Scraper

import fs from 'fs/promises';
import path from 'path';
import { SCRAPER_CONFIG } from './difficulty-config';

export class ScraperLogger {
  private logFile: string;

  constructor(logFile: string = SCRAPER_CONFIG.FILES.LOGS) {
    this.logFile = path.join(process.cwd(), logFile);
  }

  async log(level: string, message: string, data?: any): Promise<void> {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level: level.toUpperCase(),
      message,
      ...(data && { data }),
    };

    const logLine = JSON.stringify(logEntry) + '\n';

    try {
      await fs.appendFile(this.logFile, logLine);

      // Console output baseado no nível
      if (level === 'error') {
        console.error(`❌ [${timestamp}] ${message}`, data || '');
      } else if (level === 'warn') {
        console.warn(`⚠️ [${timestamp}] ${message}`, data || '');
      } else if (level === 'info') {
        console.log(`ℹ️ [${timestamp}] ${message}`, data || '');
      } else if (
        level === 'debug' &&
        SCRAPER_CONFIG.LOGGING.LEVEL === 'debug'
      ) {
        console.debug(`🔍 [${timestamp}] ${message}`, data || '');
      }
    } catch (error) {
      console.error('❌ Erro ao escrever log:', error);
    }
  }

  async info(message: string, data?: any): Promise<void> {
    await this.log('info', message, data);
  }

  async warn(message: string, data?: any): Promise<void> {
    await this.log('warn', message, data);
  }

  async error(message: string, data?: any): Promise<void> {
    await this.log('error', message, data);
  }

  async debug(message: string, data?: any): Promise<void> {
    await this.log('debug', message, data);
  }
}

export class DifficultyParser {
  static parseDifficultyRating(text: string): {
    system: string;
    level: string;
    rating: string;
  } | null {
    for (const [systemName, config] of Object.entries(
      SCRAPER_CONFIG.DIFFICULTY_SYSTEMS
    )) {
      const match = text.match(config.pattern);
      if (match) {
        const level = match[1];
        return {
          system: systemName,
          level,
          rating: `${systemName} ${level}`,
        };
      }
    }

    // Fallback para padrão IMSLP simples
    const simpleMatch = text.match(/(\d+)/);
    if (simpleMatch) {
      const level = simpleMatch[1];
      return {
        system: 'IMSLP',
        level,
        rating: `Lvl ${level}`,
      };
    }

    return null;
  }

  static validateDifficultyEntry(entry: any): boolean {
    const required = SCRAPER_CONFIG.VALIDATION.REQUIRED_FIELDS;

    for (const field of required) {
      if (!entry[field] || typeof entry[field] !== 'string') {
        return false;
      }
    }

    // Validar comprimentos
    if (entry.workTitle.length < SCRAPER_CONFIG.VALIDATION.MIN_TITLE_LENGTH) {
      return false;
    }

    if (entry.workTitle.length > SCRAPER_CONFIG.VALIDATION.MAX_TITLE_LENGTH) {
      return false;
    }

    if (
      entry.composerName.length < SCRAPER_CONFIG.VALIDATION.MIN_COMPOSER_LENGTH
    ) {
      return false;
    }

    // Validar sourceId (deve ser numérico)
    if (!/^\d+$/.test(entry.sourceId)) {
      return false;
    }

    return true;
  }

  static normalizeWorkTitle(title: string): string {
    return title
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s\-.,()]/g, '')
      .substring(0, SCRAPER_CONFIG.VALIDATION.MAX_TITLE_LENGTH);
  }

  static normalizeComposerName(name: string): string {
    return name
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s\-.,]/g, '');
  }
}

export class RetryHandler {
  static async withRetry<T>(
    operation: () => Promise<T>,
    maxAttempts: number = SCRAPER_CONFIG.RETRY.MAX_ATTEMPTS,
    baseDelay: number = SCRAPER_CONFIG.RETRY.INITIAL_DELAY
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;

        if (attempt === maxAttempts) {
          throw lastError;
        }

        const delay =
          baseDelay *
          Math.pow(SCRAPER_CONFIG.RETRY.DELAY_MULTIPLIER, attempt - 1);
        console.log(
          `⚠️ Tentativa ${attempt} falhou, tentando novamente em ${delay}ms...`
        );

        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    throw lastError!;
  }
}

export class ProgressTracker {
  private startTime: number;
  private lastUpdate: number;
  private processed: number = 0;
  private total: number;

  constructor(total: number) {
    this.total = total;
    this.startTime = Date.now();
    this.lastUpdate = Date.now();
  }

  update(processed: number): void {
    this.processed = processed;
    this.lastUpdate = Date.now();
  }

  getProgress(): {
    percentage: number;
    processed: number;
    total: number;
    elapsed: number;
    estimated: number;
    remaining: number;
    rate: number;
  } {
    const now = Date.now();
    const elapsed = now - this.startTime;
    const percentage = (this.processed / this.total) * 100;
    const rate = this.processed / (elapsed / 1000); // items per second
    const estimated = (this.total / rate) * 1000; // total estimated time in ms
    const remaining = estimated - elapsed;

    return {
      percentage: Math.round(percentage * 10) / 10,
      processed: this.processed,
      total: this.total,
      elapsed,
      estimated,
      remaining: Math.max(0, remaining),
      rate: Math.round(rate * 10) / 10,
    };
  }

  formatTime(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }

  getStatusMessage(): string {
    const progress = this.getProgress();
    return [
      `📊 Progresso: ${progress.percentage}% (${progress.processed}/${progress.total})`,
      `⏱️ Tempo decorrido: ${this.formatTime(progress.elapsed)}`,
      `⏳ Tempo restante: ${this.formatTime(progress.remaining)}`,
      `🚀 Taxa: ${progress.rate} items/s`,
    ].join(' | ');
  }
}

export class FileManager {
  static async ensureDirectory(filePath: string): Promise<void> {
    const dir = path.dirname(filePath);
    try {
      await fs.access(dir);
    } catch {
      await fs.mkdir(dir, { recursive: true });
    }
  }

  static async safeWriteJson(filePath: string, data: any): Promise<void> {
    await this.ensureDirectory(filePath);
    const tempFile = `${filePath}.tmp`;

    try {
      await fs.writeFile(tempFile, JSON.stringify(data, null, 2));
      await fs.rename(tempFile, filePath);
    } catch (error) {
      // Cleanup temp file if it exists
      try {
        await fs.unlink(tempFile);
      } catch {}
      throw error;
    }
  }

  static async safeReadJson<T>(filePath: string, defaultValue: T): Promise<T> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(content);
    } catch {
      return defaultValue;
    }
  }

  static async rotateLogFile(filePath: string): Promise<void> {
    try {
      const stats = await fs.stat(filePath);
      if (stats.size > SCRAPER_CONFIG.LOGGING.MAX_LOG_SIZE) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const rotatedFile = `${filePath}.${timestamp}`;
        await fs.rename(filePath, rotatedFile);

        // Keep only the last N log files
        const dir = path.dirname(filePath);
        const basename = path.basename(filePath);
        const files = await fs.readdir(dir);
        const logFiles = files
          .filter((f) => f.startsWith(basename) && f !== basename)
          .sort()
          .reverse();

        for (
          let i = SCRAPER_CONFIG.LOGGING.MAX_LOG_FILES;
          i < logFiles.length;
          i++
        ) {
          await fs.unlink(path.join(dir, logFiles[i]));
        }
      }
    } catch {
      // File doesn't exist yet, which is fine
    }
  }
}
