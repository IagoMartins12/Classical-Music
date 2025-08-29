// app/requests/music-history.ts
import prisma from '@/app/libs/prismadb';
import { unstable_cache } from 'next/cache';

interface EpochComposers {
  epochId: string;
  epochName: string;
  composers: {
    id: string;
    name: string;
    fullName: string;
    portraitUrl: string | null;
    birthDate: string | null;
    deathDate: string | null;
    bio: string | null;
  }[];
}

interface EpochData {
  id: string;
  name: string;
  period: string;
  description: string;
  characteristics: string[];
  keyDevelopments: string[];
  musicalForms: string[];
  instruments: string[];
}

// Compositores específicos por época - agora com nomes exatos para busca mais eficiente
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
  Romântico: [
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

// Mock data para informações históricas das épocas (ordenado cronologicamente)
const epochsHistoricalData: Record<string, Omit<EpochData, 'id'>> = {
  Medieval: {
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
  Renascentista: {
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
  Barroco: {
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
  Clássico: {
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
  Romântico: {
    name: 'Romântico',
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
  Modernismo: {
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
};

// Ordem cronológica das épocas
const epochChronologicalOrder = [
  'Medieval',
  'Renascentista',
  'Barroco',
  'Clássico',
  'Romântico',
  'Modernismo',
];

// OTIMIZAÇÃO 1: Cache para compositores por época - UMA query para todas as épocas
export const getComposersByEpoch = unstable_cache(
  async (): Promise<EpochComposers[]> => {
    // Todos os nomes de compositores em um array único para busca mais eficiente
    const allComposerNames = Object.values(composersByEpoch).flat();

    // UMA query para buscar tudo de uma vez
    const composersData = await prisma.composer.findMany({
      where: {
        AND: [
          {
            epoch: {
              name: {
                in: epochChronologicalOrder,
              },
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
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [{ birthDate: 'asc' }, { name: 'asc' }],
    });

    // Agrupa por época em memória (muito mais rápido que múltiplas queries)
    const epochsMap = new Map<string, EpochComposers>();

    // Inicializa épocas na ordem correta
    epochChronologicalOrder.forEach((epochName) => {
      const epochData = composersData.find((c) => c.epoch.name === epochName);
      if (epochData) {
        epochsMap.set(epochName, {
          epochId: epochData.epoch.id,
          epochName: epochName,
          composers: [],
        });
      }
    });

    // Distribui compositores por época
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
  ['composers-by-epoch-v2'],
  {
    revalidate: 3600, // 1 hora
    tags: ['composers', 'epochs', 'music-history'],
  }
);

// OTIMIZAÇÃO 2: Dados históricos das épocas - retorna dados estáticos com IDs do BD
export const getEpochsHistoricalData = unstable_cache(
  async (): Promise<EpochData[]> => {
    // Uma query simples apenas para pegar IDs
    const epochs = await prisma.epoch.findMany({
      where: {
        name: {
          in: epochChronologicalOrder,
        },
      },
      select: {
        id: true,
        name: true,
      },
    });

    // Mapeia na ordem cronológica correta
    return epochChronologicalOrder
      .map((epochName) => {
        const epoch = epochs.find((e) => e.name === epochName);
        if (!epoch) return null;

        return {
          id: epoch.id,
          ...(epochsHistoricalData[epochName] || {
            name: epochName,
            period: 'Período não definido',
            description: 'Informações históricas não disponíveis.',
            characteristics: [],
            keyDevelopments: [],
            musicalForms: [],
            instruments: [],
          }),
        };
      })
      .filter((epoch): epoch is EpochData => epoch !== null);
  },
  ['epochs-historical-data-v2'],
  {
    revalidate: 86400, // 24 horas
    tags: ['epochs', 'music-history'],
  }
);

// OTIMIZAÇÃO 3: Timeline otimizada - MESMA query e filtros do getComposersByEpoch
export const getComposersTimeline = unstable_cache(
  async () => {
    // Todos os nomes de compositores em um array único (IGUAL ao getComposersByEpoch)
    const allComposerNames = Object.values(composersByEpoch).flat();

    // EXATAMENTE a mesma query do getComposersByEpoch
    const composers = await prisma.composer.findMany({
      where: {
        AND: [
          {
            epoch: {
              name: {
                in: epochChronologicalOrder,
              },
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
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        birthDate: 'asc',
      },
    });

    // Processa dados em memória para adicionar campos extras para timeline
    return composers.map((composer) => ({
      ...composer,
      epochName: composer.epoch.name,
      birthYear: composer.birthDate
        ? parseInt(composer.birthDate.split('-')[0])
        : null,
      deathYear: composer.deathDate
        ? parseInt(composer.deathDate.split('-')[0])
        : null,
    }));
  },
  ['composers-timeline-v2'],
  {
    revalidate: 86400, // 24 horas
    tags: ['composers', 'timeline', 'music-history'],
  }
);

// OTIMIZAÇÃO 4: Função para limpar cache com versioning
export async function revalidateMusicHistoryCache() {
  const { revalidateTag } = await import('next/cache');

  // Remove caches antigos
  revalidateTag('music-history');
  revalidateTag('composers');
  revalidateTag('epochs');
  revalidateTag('timeline');

  // Remove caches das versões otimizadas
  revalidateTag('composers-by-epoch-v2');
  revalidateTag('epochs-historical-data-v2');
  revalidateTag('composers-timeline-v2');
}
