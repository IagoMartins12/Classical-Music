import { ScraperConfig } from '../scraper-api.types';

// ✅ Lista de TODOS os scrapers disponíveis
// Adicione novos scrapers aqui facilmente!
export const SCRAPERS: Record<string, ScraperConfig> = {
  osesp: {
    id: 'osesp',
    name: 'OSESP',
    description: 'Sala São Paulo - Concertos e Temporada',
    venue: 'Sala São Paulo',
    icon: '🎼',
    color: '#8B5CF6',
    endpoint: '/scrapers/osesp',
    enabled: true,
    supportsDateRange: false,
  },

  theatroMunicipal: {
    id: 'theatro-municipal',
    name: 'Theatro Municipal',
    description: 'Theatro Municipal de São Paulo - Programação Oficial',
    venue: 'Theatro Municipal de São Paulo',
    icon: '🎭',
    color: '#10B981',
    endpoint: '/scrapers/theatro-municipal',
    enabled: true,
    supportsDateRange: true,
    defaultDateRange: {
      start: new Date(),
      end: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
    },
  },

  // ✅ EXEMPLOS DE FUTUROS SCRAPERS (desabilitados por enquanto)
  salaCeciliaM: {
    id: 'sala-cecilia-meireles',
    name: 'Sala Cecília Meireles',
    description: 'Rio de Janeiro - Concertos Clássicos',
    venue: 'Sala Cecília Meireles',
    icon: '🎵',
    color: '#F59E0B',
    endpoint: '/scrapers/sala-cecilia-meireles',
    enabled: false, // Desabilitado até implementar
  },

  tmrj: {
    id: 'tmrj',
    name: 'Theatro Municipal RJ',
    description: 'Theatro Municipal do Rio de Janeiro',
    venue: 'Theatro Municipal do Rio de Janeiro',
    icon: '🏛️',
    color: '#EF4444',
    endpoint: '/scrapers/tmrj',
    enabled: false,
  },
};

// ✅ Helper: Retorna apenas scrapers ativos
export const getEnabledScrapers = (): ScraperConfig[] => {
  return Object.values(SCRAPERS).filter((scraper) => scraper.enabled);
};

// ✅ Helper: Busca scraper por ID
export const getScraperById = (id: string): ScraperConfig | undefined => {
  return SCRAPERS[id];
};
