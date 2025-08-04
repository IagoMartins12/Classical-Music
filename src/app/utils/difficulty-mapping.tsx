// app/utils/difficulty-mapping.ts - Sistema de Mapeamento de Dificuldade

import { DifficultyLevel } from '@prisma/client';

export interface DifficultyMapping {
  enumLevel: DifficultyLevel;
  imslpLevels: string[];
  rcmLevels: string[];
  description: string;
  color: string;
  icon: string;
}

// 🎯 MAPEAMENTO PRINCIPAL: IMSLP -> SEU ENUM
export const DIFFICULTY_MAPPINGS: Record<DifficultyLevel, DifficultyMapping> = {
  BEGINNER: {
    enumLevel: 'BEGINNER',
    imslpLevels: ['1', '2', '3', '4'],
    rcmLevels: ['Prep A', 'Prep B', '1', '2'],
    description: 'Iniciante - Primeiros anos de estudo',
    color: 'text-green-500 bg-green-500/10 border-green-500/30',
    icon: '🌱',
  },
  INTERMEDIATE: {
    enumLevel: 'INTERMEDIATE',
    imslpLevels: ['5', '6', '7', '8'],
    rcmLevels: ['3', '4', '5', '6', '7'],
    description: 'Intermediário - Estudante em desenvolvimento',
    color: 'text-blue-500 bg-blue-500/10 border-blue-500/30',
    icon: '🎓',
  },
  ADVANCED: {
    enumLevel: 'ADVANCED',
    imslpLevels: ['9', '10', '11', '12'],
    rcmLevels: ['8', '9', '10'],
    description: 'Avançado - Nível profissional/virtuoso',
    color: 'text-purple-500 bg-purple-500/10 border-purple-500/30',
    icon: '🏆',
  },
};

// 🔄 MAPEAR NÍVEL IMSLP PARA SEU ENUM
export function mapIMSLPToEnum(
  imslpLevel: string,
  system: string = 'IMSLP'
): DifficultyLevel {
  // Para sistema RCM
  if (system === 'RCM') {
    for (const [enumKey, mapping] of Object.entries(DIFFICULTY_MAPPINGS)) {
      if (mapping.rcmLevels.includes(imslpLevel)) {
        return enumKey as DifficultyLevel;
      }
    }
  }

  // Para sistema IMSLP (padrão)
  for (const [enumKey, mapping] of Object.entries(DIFFICULTY_MAPPINGS)) {
    if (mapping.imslpLevels.includes(imslpLevel)) {
      return enumKey as DifficultyLevel;
    }
  }

  // Fallback: tentar converter para número e mapear
  const levelNum = parseInt(imslpLevel);
  if (!isNaN(levelNum)) {
    if (levelNum <= 4) return 'BEGINNER';
    if (levelNum <= 8) return 'INTERMEDIATE';
    return 'ADVANCED';
  }

  // Último fallback
  return 'BEGINNER';
}

// 🔄 MAPEAR SEU ENUM PARA NÍVEIS IMSLP
export function mapEnumToIMSLP(enumLevel: DifficultyLevel): string[] {
  return DIFFICULTY_MAPPINGS[enumLevel].imslpLevels;
}

// 🎨 OBTER INFORMAÇÕES VISUAIS DO NÍVEL
export function getDifficultyDisplay(
  enumLevel?: DifficultyLevel,
  imslpLevel?: string,
  system?: string
): {
  level: DifficultyLevel;
  mapping: DifficultyMapping;
  detailedLevel: any;
  displayText: string;
  colorClass: string;
  icon: string;
} {
  // Se tem nível IMSLP, usar ele como base
  let level = enumLevel;
  if (!level && imslpLevel) {
    level = mapIMSLPToEnum(imslpLevel, system);
  }

  // Fallback
  if (!level) {
    level = 'BEGINNER';
  }

  const mapping = DIFFICULTY_MAPPINGS[level];

  // Texto detalhado
  let detailedLevel = level;
  let displayText = mapping.description;

  if (imslpLevel && system) {
    detailedLevel = String(`${system} ${imslpLevel}`);
    displayText = `${mapping.description} (${system} Nível ${imslpLevel})`;
  }

  return {
    level,
    mapping,
    detailedLevel,
    displayText,
    colorClass: mapping.color,
    icon: mapping.icon,
  };
}

// 📊 ESTATÍSTICAS DE MAPEAMENTO
export function getDifficultyStats(
  works: Array<{
    difficultyLevel?: DifficultyLevel;
    imslpDifficultyLevel?: string;
    imslpDifficultySystem?: string;
  }>
): {
  byEnum: Record<DifficultyLevel, number>;
  byIMSLPLevel: Record<string, number>;
  bySystem: Record<string, number>;
  totalWithEnum: number;
  totalWithIMSLP: number;
  mappingAccuracy: number;
} {
  const stats = {
    byEnum: { BEGINNER: 0, INTERMEDIATE: 0, ADVANCED: 0 } as Record<
      DifficultyLevel,
      number
    >,
    byIMSLPLevel: {} as Record<string, number>,
    bySystem: {} as Record<string, number>,
    totalWithEnum: 0,
    totalWithIMSLP: 0,
    mappingAccuracy: 0,
  };

  let correctMappings = 0;
  let totalMappings = 0;

  for (const work of works) {
    // Contar por enum
    if (work.difficultyLevel) {
      stats.byEnum[work.difficultyLevel]++;
      stats.totalWithEnum++;
    }

    // Contar por IMSLP
    if (work.imslpDifficultyLevel) {
      stats.byIMSLPLevel[work.imslpDifficultyLevel] =
        (stats.byIMSLPLevel[work.imslpDifficultyLevel] || 0) + 1;
      stats.totalWithIMSLP++;
    }

    // Contar por sistema
    if (work.imslpDifficultySystem) {
      stats.bySystem[work.imslpDifficultySystem] =
        (stats.bySystem[work.imslpDifficultySystem] || 0) + 1;
    }

    // Verificar precisão do mapeamento
    if (work.difficultyLevel && work.imslpDifficultyLevel) {
      totalMappings++;
      const expectedEnum = mapIMSLPToEnum(
        work.imslpDifficultyLevel,
        work.imslpDifficultySystem
      );
      if (expectedEnum === work.difficultyLevel) {
        correctMappings++;
      }
    }
  }

  stats.mappingAccuracy =
    totalMappings > 0 ? (correctMappings / totalMappings) * 100 : 0;

  return stats;
}

// 🔍 BUSCAR OBRAS POR DIFICULDADE (ENUM + IMSLP)
export function filterWorksByDifficulty(
  works: any[],
  filters: {
    enumLevel?: DifficultyLevel;
    imslpLevel?: string;
    imslpSystem?: string;
    allowBoth?: boolean; // Se true, usa OR; se false, usa AND
  }
): any[] {
  return works.filter((work) => {
    const matchesEnum =
      !filters.enumLevel || work.difficultyLevel === filters.enumLevel;
    const matchesIMSLP =
      !filters.imslpLevel || work.imslpDifficultyLevel === filters.imslpLevel;
    const matchesSystem =
      !filters.imslpSystem ||
      work.imslpDifficultySystem === filters.imslpSystem;

    if (filters.allowBoth) {
      // OR: corresponde se atende qualquer critério
      return (
        (filters.enumLevel && matchesEnum) ||
        (filters.imslpLevel && matchesIMSLP && matchesSystem)
      );
    } else {
      // AND: deve atender todos os critérios especificados
      return matchesEnum && matchesIMSLP && matchesSystem;
    }
  });
}

// 🎨 COMPONENTE HELPER: Badge de Dificuldade
export function DifficultyBadge({
  enumLevel,
  imslpLevel,
  system,
  showDetailed = false,
  size = 'md',
}: {
  enumLevel?: DifficultyLevel;
  imslpLevel?: string;
  system?: string;
  showDetailed?: boolean;
  size?: 'sm' | 'md' | 'lg';
}) {
  const display = getDifficultyDisplay(enumLevel, imslpLevel, system);

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  return (
    <div className="flex items-center space-x-2">
      {/* Badge Principal (Enum) */}
      <span
        className={`inline-flex items-center ${sizeClasses[size]} rounded-full font-semibold border ${display.colorClass}`}
      >
        <span className="mr-1">{display.icon}</span>
        {display.level}
      </span>

      {/* Badge Detalhado (IMSLP) */}
      {showDetailed && imslpLevel && (
        <span
          className={`inline-flex items-center ${sizeClasses[size]} rounded-full font-medium border-2 border-dashed border-gray-300 text-gray-600 bg-gray-50`}
        >
          {system || 'IMSLP'} {imslpLevel}
        </span>
      )}
    </div>
  );
}

// 📋 INFORMAÇÕES DETALHADAS PARA UI
export const DIFFICULTY_INFO_COMBINED = {
  ENUM_SYSTEM: {
    name: 'Sistema Simplificado',
    description: 'Classificação geral em 3 níveis para facilitar a navegação',
    levels: DIFFICULTY_MAPPINGS,
  },
  IMSLP_DETAILED: {
    name: 'Sistema Detalhado IMSLP',
    description: 'Classificação precisa de 1-12 baseada na comunidade IMSLP',
    levels: {
      '1-4': 'Iniciante - Primeiros anos de estudo',
      '5-8': 'Intermediário - Desenvolvimento técnico',
      '9-12': 'Avançado - Nível profissional',
    },
  },
  MAPPING_EXPLANATION: `
    Nosso sistema combina o melhor dos dois mundos:
    • **Classificação Simples**: 3 níveis fáceis de entender
    • **Classificação Detalhada**: 12 níveis precisos do IMSLP
    • **Mapeamento Automático**: Converte automaticamente entre os sistemas
    • **Flexibilidade**: Use qualquer um ou ambos para filtrar
  `,
};

export default {
  mapIMSLPToEnum,
  mapEnumToIMSLP,
  getDifficultyDisplay,
  getDifficultyStats,
  filterWorksByDifficulty,
  DifficultyBadge,
  DIFFICULTY_MAPPINGS,
  DIFFICULTY_INFO_COMBINED,
};
