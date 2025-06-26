// app/libs/system-config.ts - Configurações Centralizadas do Sistema Otimizado

/**
 * 🚀 Configurações do Sistema de Cache de Partituras
 */
export const CACHE_CONFIG = {
  // TTL (Time To Live) configurations
  DEFAULT_CACHE_TTL: 7 * 24 * 60 * 60 * 1000, // 7 dias em ms
  SELECTED_SCORE_TTL: 30 * 24 * 60 * 60 * 1000, // 30 dias em ms
  PRIORITY_SCORE_TTL: 60 * 24 * 60 * 60 * 1000, // 60 dias em ms

  // Carregamento incremental
  INITIAL_LOAD_LIMIT: 5, // Partituras carregadas inicialmente
  LOAD_MORE_BATCH_SIZE: 20, // Partituras por "carregar mais"
  MAX_LOAD_LIMIT: 50, // Limite máximo por requisição

  // Cache management
  CACHE_CLEANUP_DAYS: 30, // Dias para considerar cache expirado
  CACHE_ACCESS_UPDATE_BATCH: 100, // Atualizar estatísticas a cada N acessos

  // Performance thresholds
  SLOW_CACHE_THRESHOLD: 1000, // ms - considerar lento
  LARGE_WORK_THRESHOLD: 100, // Número de partituras para considerar "grande"
} as const;

/**
 * 🚀 Configurações do Sistema de Background Jobs
 */
export const JOBS_CONFIG = {
  // Concorrência e processamento
  MAX_CONCURRENT_JOBS: 3, // Jobs simultâneos
  DEFAULT_JOB_PRIORITY: 5, // Prioridade padrão (1-10)
  HIGH_PRIORITY: 8, // Prioridade alta
  MAX_PRIORITY: 10, // Prioridade máxima

  // Retry configuration
  DEFAULT_MAX_RETRIES: 3,
  RETRY_DELAYS: [1000, 5000, 15000], // ms - delays entre tentativas
  STUCK_JOB_TIMEOUT: 60 * 60 * 1000, // 1 hora em ms

  // Queue processing
  QUEUE_PROCESS_INTERVAL: 30 * 1000, // 30 segundos
  BATCH_PROCESSING_DELAY: 100, // ms entre lotes

  // Cleanup configuration
  COMPLETED_JOBS_RETENTION: 30, // dias
  FAILED_JOBS_RETENTION: 7, // dias
  LOG_CLEANUP_BATCH_SIZE: 1000,

  // Health monitoring
  HEALTH_CHECK_INTERVAL: 5 * 60 * 1000, // 5 minutos
  MAX_FAILURES_PER_HOUR: 5,
  MAX_PENDING_JOBS: 50,
  MAX_PROCESSING_JOBS: 10,
} as const;

/**
 * 🚀 Configurações do IMSLP Scraper
 */
export const SCRAPER_CONFIG = {
  // Request configuration
  REQUEST_TIMEOUT: 30000, // 30 segundos
  USER_AGENT:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',

  // Rate limiting
  MIN_REQUEST_INTERVAL: 1000, // 1 segundo entre requests
  MAX_RETRIES_PER_URL: 3,
  BACKOFF_MULTIPLIER: 2,

  // Batch processing
  BATCH_SIZE: 10, // URLs processadas por lote
  BATCH_DELAY: 100, // ms entre itens do lote

  // Cache interno do scraper
  URL_CACHE_SIZE: 1000,
  URL_CACHE_TTL: 24 * 60 * 60 * 1000, // 24 horas

  // Pattern recognition
  PATTERN_LEARNING_THRESHOLD: 10, // Mínimo de exemplos para aprender padrão
  PATTERN_CONFIDENCE_THRESHOLD: 0.7, // Confiança mínima para usar padrão
} as const;

/**
 * 🚀 Configurações de Performance e Monitoramento
 */
export const PERFORMANCE_CONFIG = {
  // Monitoring thresholds
  SLOW_API_THRESHOLD: 2000, // ms
  VERY_SLOW_API_THRESHOLD: 5000, // ms

  // Logging levels
  LOG_LEVELS: {
    ERROR: 0,
    WARN: 1,
    INFO: 2,
    DEBUG: 3,
    TRACE: 4,
  },

  // Metrics collection
  METRICS_COLLECTION_INTERVAL: 60 * 1000, // 1 minuto
  METRICS_RETENTION_DAYS: 30,

  // Auto-scaling triggers
  HIGH_LOAD_THRESHOLD: 0.8, // 80% de utilização
  SCALE_UP_DELAY: 2 * 60 * 1000, // 2 minutos
  SCALE_DOWN_DELAY: 10 * 60 * 1000, // 10 minutos
} as const;

/**
 * 🚀 Configurações de Segurança e Rate Limiting
 */
export const SECURITY_CONFIG = {
  // Rate limiting por IP
  RATE_LIMIT_WINDOW: 15 * 60 * 1000, // 15 minutos
  RATE_LIMIT_MAX_REQUESTS: 100, // Requests por janela
  BURST_LIMIT: 20, // Burst máximo

  // API Keys validation
  API_KEY_LENGTH: 32,
  API_KEY_EXPIRY: 365 * 24 * 60 * 60 * 1000, // 1 ano

  // Content validation
  MAX_WORKID_LENGTH: 24, // MongoDB ObjectId
  MAX_URL_LENGTH: 2048,
  MAX_TITLE_LENGTH: 500,

  // CORS
  ALLOWED_ORIGINS: [
    'http://localhost:3000',
    'https://classicalhub.com',
    'https://*.classicalhub.com',
  ],
} as const;

/**
 * 🚀 Configurações de Banco de Dados
 */
export const DATABASE_CONFIG = {
  // Connection pooling
  MAX_CONNECTIONS: 10,
  CONNECTION_TIMEOUT: 30000, // 30 segundos
  IDLE_TIMEOUT: 300000, // 5 minutos

  // Query optimization
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  QUERY_TIMEOUT: 10000, // 10 segundos

  // Indexing strategy
  INDEX_REBUILD_INTERVAL: 24 * 60 * 60 * 1000, // 24 horas

  // Backup and maintenance
  BACKUP_RETENTION_DAYS: 30,
  VACUUM_INTERVAL: 7 * 24 * 60 * 60 * 1000, // 7 dias
} as const;

/**
 * 🚀 Feature Flags para Controle de Funcionalidades
 */
export const FEATURE_FLAGS = {
  // Otimizações
  ENABLE_INCREMENTAL_LOADING: true,
  ENABLE_SMART_CACHING: true,
  ENABLE_BACKGROUND_PROCESSING: true,
  ENABLE_AUTO_RETRY: true,

  // Experimentais
  ENABLE_PREDICTIVE_CACHING: false, // Cachear partituras relacionadas
  ENABLE_ML_RECOMMENDATIONS: false, // Recomendações por ML
  ENABLE_REAL_TIME_UPDATES: false, // Updates em tempo real

  // Debug e desenvolvimento
  ENABLE_DEBUG_LOGGING: process.env.NODE_ENV === 'development',
  ENABLE_PERFORMANCE_METRICS: true,
  ENABLE_ERROR_REPORTING: true,
} as const;

/**
 * 🚀 Configurações de Ambiente
 */
export const ENVIRONMENT_CONFIG = {
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_TEST: process.env.NODE_ENV === 'test',

  // URLs base
  BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
  API_BASE_URL: process.env.NEXT_PUBLIC_API_URL || '/api',

  // External services
  IMSLP_BASE_URL: 'https://imslp.org',

  // Monitoring
  SENTRY_DSN: process.env.SENTRY_DSN,
  ANALYTICS_ID: process.env.NEXT_PUBLIC_GA_ID,
} as const;

/**
 * 🚀 Configurações de UI/UX
 */
export const UI_CONFIG = {
  // Loading states
  SKELETON_ANIMATION_DURATION: 1500, // ms
  LOADING_DEBOUNCE_DELAY: 300, // ms

  // Transitions
  PAGE_TRANSITION_DURATION: 300, // ms
  MODAL_TRANSITION_DURATION: 200, // ms

  // Responsive breakpoints
  BREAKPOINTS: {
    SM: 640,
    MD: 768,
    LG: 1024,
    XL: 1280,
    '2XL': 1536,
  },

  // Virtualization thresholds
  VIRTUALIZE_THRESHOLD: 100, // Número de itens para ativar virtualização
  VIRTUAL_ITEM_HEIGHT: 80, // px

  // Accessibility
  FOCUS_VISIBLE_OUTLINE_WIDTH: 2, // px
  MIN_TOUCH_TARGET_SIZE: 44, // px
} as const;

/**
 * 🚀 Utilitários para Configuração
 */
export class ConfigManager {
  /**
   * Obter configuração com fallback
   */
  static get<T>(config: Record<string, any>, key: string, fallback: T): T {
    return config[key] ?? fallback;
  }

  /**
   * Validar configuração obrigatória
   */
  static require(config: Record<string, any>, key: string): any {
    const value = config[key];
    if (value === undefined || value === null) {
      throw new Error(`Configuração obrigatória não encontrada: ${key}`);
    }
    return value;
  }

  /**
   * Mesclar configurações
   */
  static merge(...configs: Record<string, any>[]): Record<string, any> {
    return Object.assign({}, ...configs);
  }

  /**
   * Validar limites numéricos
   */
  static validateRange(
    value: number,
    min: number,
    max: number,
    name: string
  ): number {
    if (value < min || value > max) {
      throw new Error(
        `${name} deve estar entre ${min} e ${max}, recebido: ${value}`
      );
    }
    return value;
  }

  /**
   * Converter tempo para millisegundos
   */
  static timeToMs(
    value: number,
    unit: 'seconds' | 'minutes' | 'hours' | 'days'
  ): number {
    const multipliers = {
      seconds: 1000,
      minutes: 60 * 1000,
      hours: 60 * 60 * 1000,
      days: 24 * 60 * 60 * 1000,
    };
    return value * multipliers[unit];
  }
}

/**
 * 🚀 Configuração Dinâmica (Runtime)
 */
export class RuntimeConfig {
  private static instance: RuntimeConfig;
  private config: Map<string, any> = new Map();

  static getInstance(): RuntimeConfig {
    if (!this.instance) {
      this.instance = new RuntimeConfig();
    }
    return this.instance;
  }

  set(key: string, value: any): void {
    this.config.set(key, value);
    console.log(
      `🔧 [CONFIG] Runtime config updated: ${key} = ${JSON.stringify(value)}`
    );
  }

  get<T>(key: string, fallback?: T): T | undefined {
    return this.config.get(key) ?? fallback;
  }

  has(key: string): boolean {
    return this.config.has(key);
  }

  delete(key: string): boolean {
    const deleted = this.config.delete(key);
    if (deleted) {
      console.log(`🔧 [CONFIG] Runtime config deleted: ${key}`);
    }
    return deleted;
  }

  clear(): void {
    this.config.clear();
    console.log(`🔧 [CONFIG] All runtime config cleared`);
  }

  export(): Record<string, any> {
    return Object.fromEntries(this.config);
  }
}

/**
 * 🚀 Validação de Configuração na Inicialização
 */
export function validateSystemConfig(): boolean {
  try {
    // Validar configurações críticas
    ConfigManager.validateRange(
      CACHE_CONFIG.INITIAL_LOAD_LIMIT,
      1,
      50,
      'INITIAL_LOAD_LIMIT'
    );
    ConfigManager.validateRange(
      JOBS_CONFIG.MAX_CONCURRENT_JOBS,
      1,
      10,
      'MAX_CONCURRENT_JOBS'
    );
    ConfigManager.validateRange(
      JOBS_CONFIG.DEFAULT_JOB_PRIORITY,
      1,
      10,
      'DEFAULT_JOB_PRIORITY'
    );

    // Validar URLs
    if (ENVIRONMENT_CONFIG.IS_PRODUCTION) {
      ConfigManager.require(ENVIRONMENT_CONFIG, 'BASE_URL');
    }

    console.log('✅ [CONFIG] Validação de configuração concluída com sucesso');
    return true;
  } catch (error) {
    console.error('❌ [CONFIG] Erro na validação de configuração:', error);
    return false;
  }
}

// Exportar instância singleton do runtime config
export const runtimeConfig = RuntimeConfig.getInstance();

// Exportar configuração consolidada
export const SYSTEM_CONFIG = {
  CACHE: CACHE_CONFIG,
  JOBS: JOBS_CONFIG,
  SCRAPER: SCRAPER_CONFIG,
  PERFORMANCE: PERFORMANCE_CONFIG,
  SECURITY: SECURITY_CONFIG,
  DATABASE: DATABASE_CONFIG,
  FEATURES: FEATURE_FLAGS,
  ENVIRONMENT: ENVIRONMENT_CONFIG,
  UI: UI_CONFIG,
} as const;

// Type para configuração tipada
export type SystemConfig = typeof SYSTEM_CONFIG;
