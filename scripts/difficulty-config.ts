// scripts/difficulty-config.ts - Configuração do Scraper

export const SCRAPER_CONFIG = {
  // URLs e endpoints
  BASE_URL: 'https://imslp.org/wiki/Special:DiffPage/DiffMain',
  IMSLP_BASE: 'https://imslp.org',

  // Timing e rate limiting
  DELAYS: {
    BETWEEN_REQUESTS: 2000, // 2 segundos entre requisições
    BETWEEN_PAGES: 3000, // 3 segundos entre páginas
    BETWEEN_UPDATES: 100, // 100ms entre atualizações do banco
    BETWEEN_SEARCHES: 50, // 50ms entre buscas no banco
  },

  // Configurações de paginação
  PAGINATION: {
    DEFAULT_ITEMS_PER_PAGE: 100, // Máximo para eficiência
    MAX_PAGES: 100, // Limite de segurança
    TIMEOUT_PER_REQUEST: 30000, // 30 segundos timeout
  },

  // Headers para requests
  HEADERS: {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Accept-Encoding': 'gzip, deflate',
    DNT: '1',
    Connection: 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
  },

  // Arquivos de estado e resultados
  FILES: {
    STATE: 'difficulty-scraper-state.json',
    RESULTS: 'difficulty-analysis-results.json',
    LOGS: 'difficulty-scraper.log',
    COMPOSERS_LOG: 'difficulty-composers-state.log',
  },

  // Configurações de retry
  RETRY: {
    MAX_ATTEMPTS: 3,
    DELAY_MULTIPLIER: 2,
    INITIAL_DELAY: 1000,
  },

  // Filtros e validação
  VALIDATION: {
    MIN_TITLE_LENGTH: 3,
    MIN_COMPOSER_LENGTH: 2,
    MAX_TITLE_LENGTH: 500,
    REQUIRED_FIELDS: [
      'workTitle',
      'composerName',
      'sourceId',
      'difficultyLevel',
    ],
  },

  // Sistemas de dificuldade suportados
  DIFFICULTY_SYSTEMS: {
    IMSLP: {
      name: 'IMSLP',
      levels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
      pattern: /Lvl\s*(\d+)/i,
    },
    RCM: {
      name: 'RCM',
      levels: [
        'Prep A',
        'Prep B',
        '1',
        '2',
        '3',
        '4',
        '5',
        '6',
        '7',
        '8',
        '9',
        '10',
      ],
      pattern: /RCM\s*(Prep\s*[AB]|\d+)/i,
    },
    ABRSM: {
      name: 'ABRSM',
      levels: ['1', '2', '3', '4', '5', '6', '7', '8'],
      pattern: /ABRSM\s*(\d+)/i,
    },
  },

  // Configurações de logging
  LOGGING: {
    LEVEL: 'info', // 'debug', 'info', 'warn', 'error'
    MAX_LOG_SIZE: 10 * 1024 * 1024, // 10MB
    MAX_LOG_FILES: 5,
  },
};

// ============================================================================
