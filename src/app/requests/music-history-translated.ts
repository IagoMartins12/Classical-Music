import prisma from '@/app/libs/prismadb';
import { unstable_cache } from 'next/cache';
import { Language } from '@/app/stores/useLanguageStore';
import {
  EPOCH_CHRONOLOGICAL_ORDER_PT,
  translateEpochName,
} from '../utils/translations/epochTranslations';

// Interfaces para dados traduzidos
interface EpochDataTranslated {
  name: string;
  period: string;
  description: string;
  characteristics: string[];
  keyDevelopments: string[];
  musicalForms: string[];
  instruments: string[];
}

interface EpochComposersTranslated {
  epochId: string;
  epochName: string; // Nome traduzido para exibição
  composers: {
    id: string;
    name: string;
    fullName: string;
    portraitUrl: string | null;
    birthDate: string | null;
    deathDate: string | null;
    bio: string | null;
  }[];
  historicalData?: (EpochDataTranslated & { id: string }) | null;
}

// ✅ ADICIONADO: Compositores específicos por época (copiado do arquivo original)
const composersByEpoch = {
  Medieval: [
    'Guillaume de Machaut',
    'Hildegard von Bingen',
    'Léonin',
    'Pérotin',
    'Adam de la Halle',
    'Adam of Saint Victor',
    'Philippe de Vitry',
    'Walter von der Vogelweide',
    'Guido of Arezzo',
    'Conrad Paumann',
    'Notker',
    'Ciconia',
  ],
  Renascentista: [
    'Josquin des Prez',
    'Giovanni Pierluigi da Palestrina',
    'Orlando de Lassus',
    'Claudio Monteverdi',
    'Thomas Tallis',
    'Giovanni Gabrieli',
    'William Byrd',
    'Pierre de La Rue',
    'John Dunstable',
    'Johannes Ockeghem',
    'Cipriano de Rore',
  ],
  Barroco: [
    'Johann Sebastian Bach',
    'George Frideric Handel',
    'Antonio Vivaldi',
    'Claudio Monteverdi',
    'Domenico Scarlatti',
    'Jean-Baptiste Lully',
    'Johann Pachelbel',
    'Georg Philipp Telemann',
    'Arcangelo Corelli',
  ],
  Clássico: [
    'Wolfgang Amadeus Mozart',
    'Joseph Haydn',
    'Ludwig van Beethoven',
    'Franz Schubert',
    'Antonio Salieri',
    'Luigi Boccherini',
    'Muzio Clementi',
    'Michael Haydn',
  ],
  Rômantico: [
    'Frédéric Chopin',
    'Robert Schumann',
    'Hector Berlioz',
    'Felix Mendelssohn',
    'Franz Liszt',
    'Johannes Brahms',
    'Pyotr Ilyich Tchaikovsky',
    'Richard Wagner',
    'Franz Schubert',
    'Sergei Rachmaninoff',
    'Giuseppe Verdi',
    'Gustav Mahler',
  ],
  Modernismo: [
    'Igor Stravinsky',
    'Arnold Schoenberg',
    'Dmitri Shostakovich',
    'Béla Bartók',
    'Aaron Copland',
    'John Adams',
    'Thomas Adès',
    'Max Richter',
    'Kaija Saariaho',
    'Olivier Messiaen',
    'Philip Glass',
    'Steve Reich',
  ],
};

// Dados históricos traduzidos (usando nomes em português como chave)
const epochsHistoricalDataTranslated: Record<
  string,
  {
    pt: EpochDataTranslated;
    en: EpochDataTranslated;
  }
> = {
  Medieval: {
    pt: {
      name: 'Medieval',
      period: '500-1400',
      description:
        'O período medieval marca o início da música ocidental documentada, caracterizado pelo canto gregoriano e o desenvolvimento da notação musical.',
      characteristics: [
        'Música predominantemente vocal e religiosa',
        'Uso de modos eclesiásticos',
        'Desenvolvimento da polifonia',
        'Notação musical primitiva',
      ],
      keyDevelopments: [
        'Sistema de notação musical',
        'Polifonia primitiva',
        'Formas litúrgicas',
        'Modos gregorianos',
      ],
      musicalForms: ['Canto Gregoriano', 'Organum', 'Moteto', 'Conductus'],
      instruments: ['Voz humana', 'Órgão', 'Alaúde', 'Harpa', 'Flauta doce'],
    },
    en: {
      name: 'Medieval',
      period: '500-1400',
      description:
        'The medieval period marks the beginning of documented Western music, characterized by Gregorian chant and the development of musical notation.',
      characteristics: [
        'Predominantly vocal and religious music',
        'Use of ecclesiastical modes',
        'Development of polyphony',
        'Primitive musical notation',
      ],
      keyDevelopments: [
        'Musical notation system',
        'Primitive polyphony',
        'Liturgical forms',
        'Gregorian modes',
      ],
      musicalForms: ['Gregorian Chant', 'Organum', 'Motet', 'Conductus'],
      instruments: ['Human voice', 'Organ', 'Lute', 'Harp', 'Recorder'],
    },
  },

  Renascentista: {
    pt: {
      name: 'Renascentista',
      period: '1400-1600',
      description:
        'O Renascentista trouxe maior complexidade harmônica, polifonia refinada e o florescimento da música secular junto à religiosa.',
      characteristics: [
        'Polifonia complexa e equilibrada',
        'Música secular ganha importância',
        'Harmonias mais ricas',
        'Textura clara e balanceada',
      ],
      keyDevelopments: [
        'Imprensa musical',
        'Polifonia madura',
        'Música secular',
        'Instrumentos aperfeiçoados',
      ],
      musicalForms: ['Missa', 'Moteto', 'Madrigal', 'Chanson'],
      instruments: [
        'Cravo',
        'Alaúde',
        'Viola da gamba',
        'Flauta doce',
        'Sacabuxa',
      ],
    },
    en: {
      name: 'Renaissance',
      period: '1400-1600',
      description:
        'The Renaissance brought greater harmonic complexity, refined polyphony and the flourishing of secular music alongside religious.',
      characteristics: [
        'Complex and balanced polyphony',
        'Secular music gains importance',
        'Richer harmonies',
        'Clear and balanced texture',
      ],
      keyDevelopments: [
        'Music printing',
        'Mature polyphony',
        'Secular music',
        'Improved instruments',
      ],
      musicalForms: ['Mass', 'Motet', 'Madrigal', 'Chanson'],
      instruments: [
        'Harpsichord',
        'Lute',
        'Viola da gamba',
        'Recorder',
        'Sackbut',
      ],
    },
  },

  Barroco: {
    pt: {
      name: 'Barroco',
      period: '1600-1750',
      description:
        'O período barroco revolucionou a música com o sistema tonal, o baixo contínuo e formas musicais que perduram até hoje.',
      characteristics: [
        'Sistema tonal estabelecido',
        'Baixo contínuo',
        'Contrastes dinâmicos marcantes',
        'Ornamentação elaborada',
      ],
      keyDevelopments: [
        'Ópera italiana',
        'Concerto grosso',
        'Fuga e contraponto',
        'Harmonia funcional',
      ],
      musicalForms: ['Fuga', 'Concerto', 'Suíte', 'Ópera', 'Oratório'],
      instruments: [
        'Cravo',
        'Órgão',
        'Violino',
        'Violoncelo',
        'Oboé',
        'Trompete',
      ],
    },
    en: {
      name: 'Baroque',
      period: '1600-1750',
      description:
        'The Baroque period revolutionized music with the tonal system, basso continuo and musical forms that endure to this day.',
      characteristics: [
        'Established tonal system',
        'Basso continuo',
        'Striking dynamic contrasts',
        'Elaborate ornamentation',
      ],
      keyDevelopments: [
        'Italian opera',
        'Concerto grosso',
        'Fugue and counterpoint',
        'Functional harmony',
      ],
      musicalForms: ['Fugue', 'Concerto', 'Suite', 'Opera', 'Oratorio'],
      instruments: [
        'Harpsichord',
        'Organ',
        'Violin',
        'Cello',
        'Oboe',
        'Trumpet',
      ],
    },
  },

  Clássico: {
    pt: {
      name: 'Clássico',
      period: '1750-1820',
      description:
        'O período clássico estabeleceu formas musicais fundamentais com clareza, equilíbrio e elegância, definindo estruturas que influenciam a música até hoje.',
      characteristics: [
        'Formas musicais claras e equilibradas',
        'Desenvolvimento temático',
        'Dinâmicas graduais',
        'Textura homofônica predominante',
      ],
      keyDevelopments: [
        'Forma sonata',
        'Sinfonia clássica',
        'Quarteto de cordas',
        'Piano forte',
      ],
      musicalForms: ['Sinfonia', 'Sonata', 'Concerto', 'Quarteto de cordas'],
      instruments: ['Piano forte', 'Orquestra clássica', 'Clarinete', 'Trompa'],
    },
    en: {
      name: 'Classical',
      period: '1750-1820',
      description:
        'The Classical period established fundamental musical forms with clarity, balance and elegance, defining structures that influence music to this day.',
      characteristics: [
        'Clear and balanced musical forms',
        'Thematic development',
        'Gradual dynamics',
        'Predominantly homophonic texture',
      ],
      keyDevelopments: [
        'Sonata form',
        'Classical symphony',
        'String quartet',
        'Fortepiano',
      ],
      musicalForms: ['Symphony', 'Sonata', 'Concerto', 'String Quartet'],
      instruments: ['Fortepiano', 'Classical orchestra', 'Clarinet', 'Horn'],
    },
  },

  Rômantico: {
    pt: {
      name: 'Rômantico',
      period: '1820-1900',
      description:
        'O romantismo expandiu a expressão emocional na música, com harmonias mais complexas, formas mais livres e a busca pela originalidade artística.',
      characteristics: [
        'Expressão emocional intensa',
        'Harmonia cromática avançada',
        'Formas musicais expandidas',
        'Individualismo artístico',
      ],
      keyDevelopments: [
        'Leitmotiv wagneriano',
        'Poema sinfônico',
        'Escolas nacionais',
        'Virtuosismo instrumental',
      ],
      musicalForms: [
        'Poema Sinfônico',
        'Lied',
        'Balada',
        'Rapsódia',
        'Ópera romântica',
      ],
      instruments: ['Piano moderno', 'Orquestra expandida', 'Tuba', 'Saxofone'],
    },
    en: {
      name: 'Romantic',
      period: '1820-1900',
      description:
        'Romanticism expanded emotional expression in music, with more complex harmonies, freer forms and the pursuit of artistic originality.',
      characteristics: [
        'Intense emotional expression',
        'Advanced chromatic harmony',
        'Expanded musical forms',
        'Artistic individualism',
      ],
      keyDevelopments: [
        'Wagnerian leitmotif',
        'Symphonic poem',
        'National schools',
        'Instrumental virtuosity',
      ],
      musicalForms: [
        'Symphonic Poem',
        'Lied',
        'Ballad',
        'Rhapsody',
        'Romantic Opera',
      ],
      instruments: ['Modern piano', 'Expanded orchestra', 'Tuba', 'Saxophone'],
    },
  },

  Modernismo: {
    pt: {
      name: 'Modernismo',
      period: '1900-presente',
      description:
        'O período moderno quebrou convenções tradicionais, explorando novas linguagens harmônicas, técnicas composicionais e tecnologias.',
      characteristics: [
        'Ruptura com o sistema tonal',
        'Experimentação radical',
        'Técnicas estendidas',
        'Influência da tecnologia',
      ],
      keyDevelopments: [
        'Atonalismo e serialismo',
        'Música eletrônica',
        'Técnicas aleatórias',
        'Minimalismo',
      ],
      musicalForms: [
        'Música serial',
        'Música aleatória',
        'Música eletrônica',
        'Minimalismo',
      ],
      instruments: [
        'Instrumentos eletrônicos',
        'Técnicas estendidas',
        'Computadores',
        'Sintetizadores',
      ],
    },
    en: {
      name: 'Modernism',
      period: '1900-present',
      description:
        'The modern period broke traditional conventions, exploring new harmonic languages, compositional techniques and technologies.',
      characteristics: [
        'Break with the tonal system',
        'Radical experimentation',
        'Extended techniques',
        'Technology influence',
      ],
      keyDevelopments: [
        'Atonalism and serialism',
        'Electronic music',
        'Chance techniques',
        'Minimalism',
      ],
      musicalForms: [
        'Serial music',
        'Chance music',
        'Electronic music',
        'Minimalism',
      ],
      instruments: [
        'Electronic instruments',
        'Extended techniques',
        'Computers',
        'Synthesizers',
      ],
    },
  },
};

// ✅ ATUALIZADO: Funções traduzidas com filtragem específica de compositores
export const getComposersByEpochTranslated = unstable_cache(
  async (language: Language): Promise<EpochComposersTranslated[]> => {
    // ✅ ADICIONADO: Todos os nomes de compositores específicos em um array único
    const allComposerNames = Object.values(composersByEpoch).flat();

    // ✅ ATUALIZADO: Query com filtragem específica de compositores (igual ao arquivo original)
    const composersData = await prisma.composer.findMany({
      where: {
        AND: [
          {
            epoch: {
              name: { in: EPOCH_CHRONOLOGICAL_ORDER_PT }, // Busca em português
            },
          },
          {
            OR: allComposerNames.map((composerName) => ({
              OR: [
                {
                  fullName: {
                    equals: composerName,
                    mode: 'insensitive',
                  },
                },
                {
                  name: {
                    equals: composerName,
                    mode: 'insensitive',
                  },
                },
                // Fallback para contains se equals não encontrar
                {
                  fullName: {
                    contains: composerName,
                    mode: 'insensitive',
                  },
                },
                {
                  name: {
                    contains: composerName,
                    mode: 'insensitive',
                  },
                },
              ],
            })),
          },
        ],
      },
      select: {
        id: true,
        name: true,
        fullName: true,
        portraitUrl: true,
        birthDate: true,
        deathDate: true,
        bio: true,
        epoch: {
          select: { id: true, name: true },
        },
      },
      orderBy: [{ birthDate: 'asc' }, { name: 'asc' }],
    });

    // Agrupar por época
    const epochsMap = new Map<string, EpochComposersTranslated>();

    // Inicializar épocas na ordem correta
    EPOCH_CHRONOLOGICAL_ORDER_PT.forEach((epochNamePt) => {
      const epochData = composersData.find((c) => c.epoch.name === epochNamePt);
      if (epochData) {
        const translatedData = epochsHistoricalDataTranslated[epochNamePt];
        const langData =
          language === 'en' ? translatedData?.en : translatedData?.pt;

        epochsMap.set(epochNamePt, {
          epochId: epochData.epoch.id,
          epochName: translateEpochName(epochNamePt, language), // Nome traduzido
          composers: [],
          historicalData: langData
            ? {
                id: epochData.epoch.id,
                ...langData,
              }
            : null,
        });
      }
    });

    // ✅ ATUALIZADO: Distribuir compositores por época com limite de 12 (igual ao original)
    composersData.forEach((composer) => {
      const epochData = epochsMap.get(composer.epoch.name);
      if (epochData && epochData.composers.length < 12) {
        epochData.composers.push({
          id: composer.id,
          name: composer.name,
          fullName: composer.fullName,
          portraitUrl: composer.portraitUrl,
          birthDate: composer.birthDate,
          deathDate: composer.deathDate,
          bio: composer.bio,
        });
      }
    });

    return Array.from(epochsMap.values());
  },
  ['composers-by-epoch-translated-v2'], // ✅ Versioning para nova implementação
  {
    revalidate: 3600,
    tags: ['composers', 'epochs', 'music-history'],
  }
);

export const getEpochsHistoricalDataTranslated = unstable_cache(
  async (
    language: Language
  ): Promise<(EpochDataTranslated & { id: string })[]> => {
    // Buscar épocas em português (como estão no banco)
    const epochs = await prisma.epoch.findMany({
      where: {
        name: { in: EPOCH_CHRONOLOGICAL_ORDER_PT }, // Busca em português
      },
      select: { id: true, name: true },
    });

    // Mapear na ordem cronológica com dados traduzidos
    return EPOCH_CHRONOLOGICAL_ORDER_PT.map((epochNamePt) => {
      const epoch = epochs.find((e) => e.name === epochNamePt);
      if (!epoch) return null;

      const translatedData = epochsHistoricalDataTranslated[epochNamePt];
      const langData =
        language === 'en' ? translatedData?.en : translatedData?.pt;

      return {
        id: epoch.id,
        ...(langData || {
          name: translateEpochName(epochNamePt, language),
          period:
            language === 'en' ? 'Period not defined' : 'Período não definido',
          description:
            language === 'en'
              ? 'Historical information not available.'
              : 'Informações históricas não disponíveis.',
          characteristics: [],
          keyDevelopments: [],
          musicalForms: [],
          instruments: [],
        }),
      };
    }).filter(
      (epoch): epoch is EpochDataTranslated & { id: string } => epoch !== null
    );
  },
  ['epochs-historical-data-translated-v2'], // ✅ Versioning
  {
    revalidate: 86400,
    tags: ['epochs', 'music-history'],
  }
);

// ✅ ATUALIZADO: Timeline com filtragem específica de compositores
export const getComposersTimelineTranslated = unstable_cache(
  async (language: Language) => {
    // ✅ ADICIONADO: Mesma lógica de filtragem específica
    const allComposerNames = Object.values(composersByEpoch).flat();

    // ✅ ATUALIZADO: Query com filtragem específica (igual ao getComposersByEpochTranslated)
    const composers = await prisma.composer.findMany({
      where: {
        AND: [
          {
            epoch: {
              name: { in: EPOCH_CHRONOLOGICAL_ORDER_PT }, // Busca em português
            },
          },
          {
            OR: allComposerNames.map((composerName) => ({
              OR: [
                {
                  fullName: {
                    equals: composerName,
                    mode: 'insensitive',
                  },
                },
                {
                  name: {
                    equals: composerName,
                    mode: 'insensitive',
                  },
                },
                // Fallback para contains se equals não encontrar
                {
                  fullName: {
                    contains: composerName,
                    mode: 'insensitive',
                  },
                },
                {
                  name: {
                    contains: composerName,
                    mode: 'insensitive',
                  },
                },
              ],
            })),
          },
        ],
      },
      select: {
        id: true,
        name: true,
        fullName: true,
        portraitUrl: true,
        birthDate: true,
        deathDate: true,
        bio: true,
        epoch: { select: { name: true } },
      },
      orderBy: { birthDate: 'asc' },
    });

    return composers.map((composer) => ({
      ...composer,
      epochName: translateEpochName(composer.epoch.name, language), // Nome traduzido
      birthYear: composer.birthDate
        ? parseInt(composer.birthDate.split('-')[0])
        : null,
      deathYear: composer.deathDate
        ? parseInt(composer.deathDate.split('-')[0])
        : null,
    }));
  },
  ['composers-timeline-translated-v2'], // ✅ Versioning
  {
    revalidate: 86400,
    tags: ['composers', 'timeline', 'music-history'],
  }
);

// ✅ ADICIONADO: Função para limpar cache (igual ao arquivo original)
export async function revalidateMusicHistoryTranslatedCache() {
  const { revalidateTag } = await import('next/cache');

  // Remove caches antigos
  revalidateTag('music-history');
  revalidateTag('composers');
  revalidateTag('epochs');
  revalidateTag('timeline');

  // Remove caches das versões traduzidas
  revalidateTag('composers-by-epoch-translated');
  revalidateTag('epochs-historical-data-translated');
  revalidateTag('composers-timeline-translated');

  // Remove caches das versões otimizadas com filtragem específica
  revalidateTag('composers-by-epoch-translated-v2');
  revalidateTag('epochs-historical-data-translated-v2');
  revalidateTag('composers-timeline-translated-v2');
}
