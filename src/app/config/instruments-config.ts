// app/config/instruments-config.ts

/**
 * Configuração para personalizar a exibição de compositores nos instrumentos
 */

// IDs dos compositores que você quer destacar para cada instrumento
export const FEATURED_COMPOSERS_CONFIG: Record<string, string> = {
  Piano: '683bb049320ed96f5ac321a8', // Forçar Chopin como destaque para Piano
  Violino: '683e8b81e7761f110cd5fa5c', // Forçar Paganini como destaque para Violino
  //Violoncelo: 'bach-id', // Forçar Bach como destaque para Violoncelo
  Órgão: '683b7522320ed96f5ac31a76', // Bach também para Órgão
  Harpa: '683ebee8e7761f110cd60015', // Salzedo para Harpa
  // Adicione mais conforme necessário
};

// IDs dos compositores que você NÃO quer que apareçam como destaque
// export const EXCLUDED_COMPOSERS_CONFIG: Record<string, string[]> = {
//   Piano: ['compositor-generico-id'], // Excluir compositores genéricos
//   Violino: ['compositor-menor-id', 'compositor-indesejado-id'],
//   Órgão: ['compositor-contemporaneo-id'], // Talvez prefira focar nos clássicos
//   // Adicione mais conforme necessário
// };

/**
 * Configuração de cores temáticas para diferentes seções
 */
export const INSTRUMENT_THEME_COLORS = {
  // Cores principais
  primary: {
    background: 'from-black via-gray-900 to-slate-900',
    cardBackground: 'from-gray-800/40 to-gray-900/40',
    border: 'border-gray-700/50',
    hoverBorder: 'hover:border-amber-500/30',
  },

  // Cores de destaque
  accent: {
    primary: 'text-amber-400',
    secondary: 'text-amber-200',
    icon: 'from-amber-600 to-amber-700',
    button: 'bg-amber-600 hover:bg-amber-700',
  },

  // Cores de seções específicas
  sections: {
    history: 'from-indigo-900/20 to-purple-900/20 border-indigo-700/30',
    composer: 'from-amber-900/20 to-yellow-900/20 border-amber-600/30',
    characteristics: 'bg-gray-800/30 border-gray-700/50',
    evolution: 'bg-gray-800/30 border-gray-700/50',
    performers: 'bg-gray-800/30 border-gray-700/50',
    works: 'bg-gray-800/40 border-gray-700/50',
  },

  // Estados interativos
  interactive: {
    hover: 'hover:bg-gray-700/30',
    expanded: 'bg-gray-800/20',
    transition: 'transition-all duration-300',
  },
} as const;

/**
 * Configuração de ícones personalizados para instrumentos
 */
export const INSTRUMENT_ICONS_CONFIG = {
  Piano: 'GiGrandPiano',
  Violino: 'GiViolin',
  Violoncelo: 'FaMusic',
  Órgão: 'GiPipeOrgan',
  Harpa: 'GiHarp',
  Orquestra: 'FaUsers',
  Clavicórdio: 'GiPipeOrgan',
} as const;

/**
 * Configuração de ordenação de instrumentos
 */
export const INSTRUMENT_ORDER_CONFIG: string[] = [
  'Piano',
  'Órgão',
  'Violino',
  'Violoncelo',
  'Harpa',
  'Clavicórdio',
  'Orquestra',
];

/**
 * Configuração de metadados dos instrumentos
 */
export const INSTRUMENT_METADATA_CONFIG = {
  showCompositionYear: true,
  showTone: true,
  showDuration: true,
  showOpusCatalog: true,
  maxWorksPerInstrument: 20,
  maxTopComposers: 5,
  defaultExpandedState: false, // Instrumentos começam colapsados
  defaultWorksExpandedState: false, // Obras começam colapsadas
} as const;

/**
 * Configuração de animações
 */
export const ANIMATION_CONFIG = {
  staggerDelay: 0.1, // Delay entre animações de instrumentos
  workStaggerDelay: 0.05, // Delay entre animações de obras
  expandDuration: 500, // Duração da animação de expansão (ms)
  hoverDuration: 300, // Duração da animação de hover (ms)
} as const;

/**
 * Textos customizáveis
 */
export const TEXTS_CONFIG = {
  title: 'Instrumentos da Música Clássica',
  subtitle:
    'Explore a rica história e evolução dos instrumentos que moldaram a música clássica',
  labels: {
    instruments: 'Instrumentos',
    works: 'Obras',
    users: 'Usuários',
    featuredComposer: 'Compositor Destaque',
    basicInfo: 'Informações Básicas',
    history: 'História do Instrumento',
    characteristics: 'Características',
    evolution: 'Evolução Histórica',
    performers: 'Intérpretes Famosos',
    selectedWorks: 'Obras Selecionadas',
    show: 'Mostrar',
    hide: 'Ocultar',
    worksRegistered: 'obras cadastradas',
    origin: 'Origem',
    inventor: 'Inventor',
    period: 'Período',
    category: 'Categoria',
    activeUsers: 'Usuários Ativos',
    ancestralOrigin: 'Origem Ancestral',
  },
} as const;
