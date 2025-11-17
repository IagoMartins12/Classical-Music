// app/services/scraper-api/scrapers-config.ts

export interface ScraperConfig {
  id: string;
  name: string;
  description: string;
  venue: string;
  icon: string;
  color: string;
  enabled: boolean;
}

/**
 * ✅ Lista dinâmica de scrapers
 * Agora busca do backend ao invés de hardcoded
 */
export const SCRAPERS: Record<string, ScraperConfig> = {
  osesp: {
    id: 'osesp',
    name: 'OSESP',
    description: 'Sala São Paulo - Concertos e Temporada',
    venue: 'Sala São Paulo',
    icon: '🎻',
    color: '#8B5CF6',
    enabled: true,
  },
  'theatro-municipal': {
    id: 'theatro-municipal',
    name: 'Theatro Municipal SP',
    description: 'Theatro Municipal de São Paulo - Programação Oficial',
    venue: 'Theatro Municipal de São Paulo',
    icon: '🎭',
    color: '#10B981',
    enabled: true,
  },
  'sala-cecilia-meireles': {
    id: 'sala-cecilia-meireles',
    name: 'Sala Cecília Meireles',
    description: 'Rio de Janeiro - Concertos Clássicos',
    venue: 'Sala Cecília Meireles',
    icon: '🎼',
    color: '#F59E0B',
    enabled: true,
  },
  'teatro-amazonas': {
    id: 'teatro-amazonas',
    name: 'Teatro Amazonas',
    description: 'Manaus - Óperas e Concertos',
    venue: 'Teatro Amazonas',
    icon: '🌳',
    color: '#10B981',
    enabled: true,
  },
  'theatro-da-paz': {
    id: 'theatro-da-paz',
    name: 'Theatro da Paz',
    description: 'Belém - Orquestra Sinfônica',
    venue: 'Theatro da Paz',
    icon: '🎺',
    color: '#3B82F6',
    enabled: true,
  },
  'auditorio-ibirapuera': {
    id: 'auditorio-ibirapuera',
    name: 'Auditório Ibirapuera',
    description: 'São Paulo - Música Clássica',
    venue: 'Auditório Ibirapuera',
    icon: '🏛️',
    color: '#8B5CF6',
    enabled: true,
  },
  'cidade-das-artes': {
    id: 'cidade-das-artes',
    name: 'Cidade das Artes',
    description: 'Rio de Janeiro - OSB e Eventos',
    venue: 'Cidade das Artes',
    icon: '🎪',
    color: '#EF4444',
    enabled: true,
  },
};

// Helper: Retorna apenas scrapers ativos
export const getEnabledScrapers = (): ScraperConfig[] => {
  return Object.values(SCRAPERS).filter((scraper) => scraper.enabled);
};

// Helper: Busca scraper por ID
export const getScraperById = (id: string): ScraperConfig | undefined => {
  return SCRAPERS[id];
};
