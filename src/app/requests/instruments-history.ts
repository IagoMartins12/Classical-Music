// app/requests/instruments-history.ts
import prisma from '@/app/libs/prismadb';
import { unstable_cache } from 'next/cache';

interface InstrumentWithWorks {
  id: string;
  name: string;
  historicalData: InstrumentHistoricalData;
  works: {
    id: string;
    title: string;
    composer: {
      id: string;
      name: string;
      fullName: string;
      portraitUrl: string | null;
      epochName: string | null;
    };
    opOrCatalog: string | null;
    compositionYear: string | null;
    tone: string | null;
    mediaDuration: string | null;
    imslpPermlink: string;
    videoUrl: string | null;
  }[];
}

interface InstrumentHistoricalData {
  name: string;
  category: string;
  origin: string;
  inventor: string | null;
  inventionPeriod: string;
  description: string;
  detailedHistory: string;
  characteristics: string[];
  evolution: string[];
  notableFeatures: string[];
  famousPerformers: string[];
  imageUrl: string;
  iconName: string;
}

// Configurações de compositores por instrumento
interface ComposerPreferences {
  [instrumentName: string]: {
    preferredComposerId?: string; // ID do compositor preferido
    excludedComposerIds?: string[]; // IDs dos compositores excluídos
  };
}

// Configurações avançadas de obras por instrumento
interface WorksPreferences {
  [instrumentName: string]: {
    composerWorks?: {
      [composerId: string]: {
        count: number; // Quantidade de obras deste compositor
        specificWorkIds?: string[]; // IDs de obras específicas que devem aparecer
        specificWorkTitles?: string[]; // Títulos de obras específicas (fallback se ID não encontrado)
      };
    };
    totalMaxWorks?: number; // Máximo total de obras a exibir (padrão: 20)
    fallbackToAutomatic?: boolean; // Se deve usar seleção automática para completar (padrão: true)
  };
}

// Instrumentos principais com dados históricos detalhados
const targetInstruments = [
  'Piano',
  'Órgão',
  'Violoncelo',
  'Violino',
  'Clavicórdio',
  'Orquestra',
  'Harpa',
];

// Dados históricos dos instrumentos
const instrumentsHistoricalData: Record<string, InstrumentHistoricalData> = {
  Piano: {
    name: 'Piano',
    category: 'Cordofone',
    origin: 'Itália',
    inventor: 'Bartolomeo Cristofori',
    inventionPeriod: '1700-1720',
    description:
      'O piano é um instrumento musical de teclas que produz som através do impacto de martelos em cordas tensionadas. Revolucionou a música com sua capacidade de expressar dinâmicas variadas.',
    detailedHistory:
      'O piano foi inventado por Bartolomeo Cristofori em Florença, Itália, por volta de 1700. Cristofori era um especialista em instrumentos de teclado e trabalhava para a família Médici. Seu objetivo era criar um instrumento que pudesse variar o volume do som conforme a força aplicada às teclas, superando as limitações do cravo. O nome original era "gravicembalo col piano e forte" (cravo com suave e forte), que posteriormente foi encurtado para "pianoforte" e finalmente "piano". Durante o século XVIII, o piano passou por melhorias significativas, especialmente na Alemanha e Áustria. No século XIX, com a Revolução Industrial, houve avanços técnicos importantes como a estrutura de ferro fundido, que permitiu maior tensão das cordas e volume sonoro mais potente.',
    characteristics: [
      '88 teclas (52 brancas, 36 pretas)',
      'Capacidade de expressão dinâmica (forte e piano)',
      'Sustentação de notas através de pedais',
      'Ampla extensão tonal (mais de 7 oitavas)',
    ],
    evolution: [
      'Evolução do clavicórdio e cravo',
      'Desenvolvimento do piano forte por Cristofori',
      'Aperfeiçoamento durante o período romântico',
      'Piano moderno com estrutura de ferro',
    ],
    notableFeatures: [
      'Mecanismo de escape',
      'Pedal sustain, sostenuto e una corda',
      'Cordas cruzadas para melhor ressonância',
      'Estrutura de ferro fundido',
    ],
    famousPerformers: [
      'Frédéric Chopin',
      'Franz Liszt',
      'Vladimir Horowitz',
      'Glenn Gould',
      'Martha Argerich',
    ],
    imageUrl: '/instruments/piano.jpg',
    iconName: 'Piano',
  },
  Órgão: {
    name: 'Órgão',
    category: 'Aerofone',
    origin: 'Grécia Antiga',
    inventor: 'Ctésibio de Alexandria',
    inventionPeriod: '285-222 a.C.',
    description:
      'O órgão é um instrumento de teclas que produz som através de tubos alimentados por ar comprimido. É considerado o "rei dos instrumentos" pela sua majestade sonora.',
    detailedHistory:
      'O órgão é um dos instrumentos mais antigos da música ocidental, com suas origens remontando ao órgão hidráulico (hydraulis) inventado por Ctésibio de Alexandria no século III a.C. Este instrumento utilizava água para regular a pressão do ar. Durante a Era Medieval, o órgão evoluiu significativamente, tornando-se central na música litúrgica cristã. Os órgãos medievais eram menores e mais simples, mas gradualmente cresceram em tamanho e complexidade. No Renascimento e Barroco, o órgão atingiu grande sofisticação técnica e artística, especialmente na Alemanha, onde mestres como Arp Schnitger construíram instrumentos magníficos. O órgão foi fundamental para o desenvolvimento da música de Bach e outros compositores barrocos.',
    characteristics: [
      'Múltiplos teclados (manuais) e pedaleira',
      'Registros para diferentes timbres',
      'Tubos de metal e madeira',
      'Sistema de insuflação de ar',
    ],
    evolution: [
      'Órgão hidráulico na antiguidade',
      'Desenvolvimento na Era Medieval',
      'Órgão de tubos no Renascimento',
      'Órgão elétrico e digital modernos',
    ],
    notableFeatures: [
      'Registros de diferentes famílias sonoras',
      'Acoplamentos entre teclados',
      'Tremolo e outros efeitos',
      'Tubos de diferentes materiais e formatos',
    ],
    famousPerformers: [
      'Johann Sebastian Bach',
      'César Franck',
      'Olivier Messiaen',
      'Marie-Claire Alain',
      'Cameron Carpenter',
    ],
    imageUrl: '/instruments/organ.jpg',
    iconName: 'Music',
  },
  Violoncelo: {
    name: 'Violoncelo',
    category: 'Cordofone',
    origin: 'Itália',
    inventor: 'Andrea Amati',
    inventionPeriod: '1560-1570',
    description:
      'O violoncelo é um instrumento de cordas friccionadas da família do violino, tocado com arco. Possui uma sonoridade rica e expressiva, sendo fundamental na música de câmara e orquestral.',
    detailedHistory:
      'O violoncelo desenvolveu-se na Itália durante o século XVI como parte da família do violino criada por Andrea Amati em Cremona. Inicialmente chamado de "violone" ou "bass violin", o instrumento evoluiu da viola da gamba, mas com modificações estruturais importantes. Durante o período Barroco, o violoncelo estabeleceu-se tanto como instrumento solista quanto como base harmônica do ensemble. Compositores como Luigi Boccherini e mais tarde Bach, com suas Suítes para Violoncelo Solo, elevaram o instrumento a novas alturas artísticas. No século XIX, com virtuosos como Bernhard Romberg e mais tarde Pablo Casals no século XX, o violoncelo consolidou-se como um dos principais instrumentos solistas da música clássica.',
    characteristics: [
      'Quatro cordas afinadas em quintas (C-G-D-A)',
      'Tocado sentado com o instrumento entre as pernas',
      'Arco de crina de cavalo',
      'Extensão de mais de 4 oitavas',
    ],
    evolution: [
      'Desenvolvimento a partir da viola da gamba',
      'Padronização no século XVI',
      'Aperfeiçoamento pelos lutiers italianos',
      'Técnicas modernas no século XX',
    ],
    notableFeatures: [
      'Espigão para apoio no chão',
      'Cavalete móvel para ajuste',
      'Craveiro de ébano',
      'Tampo de abeto e fundo de maple',
    ],
    famousPerformers: [
      'Pablo Casals',
      'Mstislav Rostropovich',
      'Yo-Yo Ma',
      'Jacqueline du Pré',
      'Mischa Maisky',
    ],
    imageUrl: '/instruments/cello.jpg',
    iconName: 'Music2',
  },
  Violino: {
    name: 'Violino',
    category: 'Cordofone',
    origin: 'Itália',
    inventor: 'Andrea Amati',
    inventionPeriod: '1555-1560',
    description:
      'O violino é o menor e mais agudo instrumento da família das cordas friccionadas. É considerado um dos instrumentos mais expressivos e versáteis da música clássica.',
    detailedHistory:
      'O violino foi criado por Andrea Amati em Cremona, Itália, por volta de 1555-1560, evoluindo de instrumentos medievais como a fidula e a lira da braccio. A cidade de Cremona tornou-se o centro mundial da construção de violinos, especialmente através das famílias Amati, Guarneri e Stradivarius. Antonio Stradivarius (1644-1737) levou a arte da luteria a sua máxima expressão, criando instrumentos que até hoje são considerados insuperáveis. Durante o período Barroco, virtuosos como Arcangelo Corelli e Antonio Vivaldi desenvolveram técnicas que definiram o repertório violinístico. No século XIX, Niccolò Paganini revolucionou a técnica do instrumento, inspirando compositores como Brahms, Tchaikovsky e Mendelssohn a escreverem grandes concertos.',
    characteristics: [
      'Quatro cordas afinadas em quintas (G-D-A-E)',
      'Tocado apoiado no ombro e queixo',
      'Arco de crina de cavalo',
      'Técnicas avançadas como vibrato e glissando',
    ],
    evolution: [
      'Evolução da fidula medieval',
      'Aperfeiçoamento em Cremona',
      'Era dourada com Stradivarius',
      'Técnicas virtuosísticas modernas',
    ],
    notableFeatures: [
      'Queixeira para apoio',
      'Espaleira para conforto',
      'Cravelhas de ébano',
      'Verniz especial para proteção',
    ],
    famousPerformers: [
      'Niccolò Paganini',
      'Jascha Heifetz',
      'Itzhak Perlman',
      'Anne-Sophie Mutter',
      'Hilary Hahn',
    ],
    imageUrl: '/instruments/violin.jpg',
    iconName: 'Music3',
  },
  Clavicórdio: {
    name: 'Clavicórdio',
    category: 'Cordofone',
    origin: 'Europa',
    inventor: 'Desconhecido',
    inventionPeriod: 'Século XIV',
    description:
      'O clavicórdio é um instrumento de teclas onde as cordas são percutidas diretamente por lâminas metálicas. Foi um dos precursores do piano, muito usado na música doméstica.',
    detailedHistory:
      'O clavicórdio desenvolveu-se no século XIV a partir do monocórdio medieval, um instrumento de uma só corda usado para ensino musical. Sua característica única é que as teclas fazem contato direto com as cordas através de tangentes de metal, permitindo controle expressivo único entre os instrumentos de teclado históricos. Durante o Renascimento e Barroco, foi amplamente usado para música doméstica e como instrumento de estudo, especialmente na Alemanha. Carl Philipp Emanuel Bach, filho de J.S. Bach, foi um dos grandes defensores do clavicórdio, preferindo-o ao cravo pela sua capacidade expressiva. O instrumento permitia técnicas como o "Bebung" (vibrato obtido pela variação da pressão na tecla), impossível em outros instrumentos de teclado da época.',
    characteristics: [
      'Teclas conectadas diretamente às cordas',
      'Som delicado e íntimo',
      'Capacidade de vibrato (Bebung)',
      'Dinâmica sensível ao toque',
    ],
    evolution: [
      'Origem no monocórdio medieval',
      'Desenvolvimento no Renascimento',
      'Apogeu no período Barroco',
      'Declínio com chegada do piano',
    ],
    notableFeatures: [
      'Tangentes de latão',
      'Cordas paralelas ao teclado',
      'Abafadores de feltro',
      'Construção simples e portátil',
    ],
    famousPerformers: [
      'Carl Philipp Emanuel Bach',
      'Gustav Leonhardt',
      'Andreas Staier',
      'Miklos Spanyi',
      'Richard Troeger',
    ],
    imageUrl: '/instruments/clavichord.jpg',
    iconName: 'Music4',
  },
  Orquestra: {
    name: 'Orquestra',
    category: 'Ensemble',
    origin: 'Europa',
    inventor: 'Evolução gradual',
    inventionPeriod: 'Século XVII',
    description:
      'A orquestra é um grande conjunto instrumental que reúne as principais famílias de instrumentos: cordas, madeiras, metais e percussão, criando uma paleta sonora incomparável.',
    detailedHistory:
      'A orquestra moderna evoluiu gradualmente a partir dos pequenos conjuntos instrumentais do século XVII. Durante o período Barroco, Jean-Baptiste Lully na França e outros compositores começaram a padronizar grupos instrumentais para acompanhar óperas e música de câmara. A orquestra clássica foi consolidada por compositores como Haydn e Mozart, estabelecendo a formação básica com cordas, oboés, fagotes, trompas e eventualmente clarinetes. Durante o Romantismo, a orquestra expandiu-se dramaticamente com Berlioz, Wagner e Mahler, que adicionaram instrumentos como tuba, harpa, celesta e seções de percussão expandidas. A orquestra sinfônica moderna, com 80-100 músicos, representa séculos de evolução musical e continua sendo um dos conjuntos mais versáteis e expressivos da música.',
    characteristics: [
      'Seção de cordas como base',
      'Madeiras, metais e percussão',
      'Regente para coordenação',
      '80-100 músicos em orquestra sinfônica',
    ],
    evolution: [
      'Pequenos conjuntos barrocos',
      'Orquestra clássica padronizada',
      'Expansão no romantismo',
      'Orquestra moderna gigantesca',
    ],
    notableFeatures: [
      'Disposição padronizada no palco',
      'Hierarquia de spallas e primeiras partes',
      'Naipes especializados',
      'Versatilidade de gêneros',
    ],
    famousPerformers: [
      'Herbert von Karajan',
      'Leonard Bernstein',
      'Carlos Kleiber',
      'Gustavo Dudamel',
      'Marin Alsop',
    ],
    imageUrl: '/instruments/orchestra.jpg',
    iconName: 'Users',
  },
  Harpa: {
    name: 'Harpa',
    category: 'Cordofone',
    origin: 'Mesopotâmia/Egito',
    inventor: 'Civilizações antigas',
    inventionPeriod: '3000 a.C.',
    description:
      'A harpa é um dos instrumentos mais antigos da humanidade, produzindo som através de cordas pinçadas. Evoluiu de simples arcos musicais para instrumentos sofisticados.',
    detailedHistory:
      'A harpa é um dos instrumentos musicais mais antigos conhecidos, com evidências arqueológicas datando de cerca de 3000 a.C. na Mesopotâmia e Egito. Evoluiu de simples arcos musicais para instrumentos cada vez mais sofisticados. Na Irlanda medieval, a harpa céltica tornou-se símbolo nacional e inspirou uma rica tradição musical. Durante o período Barroco, a harpa ganhou lugar na música de câmara e orquestral, mas foi no Classicismo e Romantismo que realmente floresceu. A harpa moderna de pedais duplos foi desenvolvida por Sébastien Érard em 1810, permitindo acesso completo à escala cromática. Este sistema revolucionário permitiu que a harpa se tornasse um instrumento solista virtuosístico, com um repertório que inclui concertos de Mozart, Debussy, Ravel e muitos outros compositores.',
    characteristics: [
      'Cordas de diferentes comprimentos',
      'Pedais para alterações cromáticas',
      'Sonoridade etérea e celestial',
      '47 cordas na harpa de concerto',
    ],
    evolution: [
      'Harpa arqueada primitiva',
      'Harpa angular assíria',
      'Harpa irlandesa medieval',
      'Harpa de pedais moderna',
    ],
    notableFeatures: [
      'Sistema de pedais duplo',
      'Cordas de tripa e nylon',
      'Coluna ornamentada',
      'Técnicas de glissando',
    ],
    famousPerformers: [
      'Nicanor Zabaleta',
      'Catrin Finch',
      'Emmanuel Ceysson',
      'Isabelle Moretti',
      'Lavinia Meijer',
    ],
    imageUrl: '/instruments/harp.jpg',
    iconName: 'Music',
  },
};

// OTIMIZAÇÃO 1: Busca instrumentos com suas obras (UMA query para tudo)
export const getInstrumentsWithWorks = unstable_cache(
  async (
    composerPreferences: ComposerPreferences = {},
    worksPreferences: WorksPreferences = {}
  ): Promise<InstrumentWithWorks[]> => {
    // Primeiro, busca apenas os instrumentos básicos
    const instruments = await prisma.instrument.findMany({
      where: {
        name: {
          in: targetInstruments,
          mode: 'insensitive',
        },
      },
      select: {
        id: true,
        name: true,
      },
    });

    // Para cada instrumento, faz uma query específica e otimizada
    const instrumentsWithWorks = await Promise.all(
      instruments.map(async (instrument) => {
        const worksPrefs = worksPreferences[instrument.name];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let selectedWorks: any[] = [];

        if (worksPrefs?.composerWorks) {
          // Modo avançado: obras específicas por compositor
          for (const [composerId, prefs] of Object.entries(
            worksPrefs.composerWorks
          )) {
            // eslint-disable-next-line
            let composerWorks: any[] = [];

            // Se há obras específicas definidas por ID
            if (prefs.specificWorkIds?.length) {
              const specificWorks = await prisma.work.findMany({
                where: {
                  id: { in: prefs.specificWorkIds },
                  instrumentId: instrument.id,
                  composerId: composerId,
                },
                select: {
                  id: true,
                  title: true,
                  opOrCatalog: true,
                  compositionYear: true,
                  tone: true,
                  mediaDuration: true,
                  imslpPermlink: true,
                  composer: {
                    select: {
                      id: true,
                      name: true,
                      fullName: true,
                      portraitUrl: true,
                      epochName: true,
                    },
                  },
                },
                orderBy: [{ compositionYear: 'asc' }, { title: 'asc' }],
              });
              composerWorks.push(...specificWorks);
            }

            // Se há obras específicas definidas por título (fallback)
            if (prefs.specificWorkTitles?.length) {
              const titleWorks = await prisma.work.findMany({
                where: {
                  instrumentId: instrument.id,
                  composerId: composerId,
                  OR: prefs.specificWorkTitles.map((title) => ({
                    title: {
                      contains: title,
                      mode: 'insensitive' as const,
                    },
                  })),
                  id: { notIn: composerWorks.map((w) => w.id) }, // Evita duplicatas
                },
                select: {
                  id: true,
                  title: true,
                  opOrCatalog: true,
                  compositionYear: true,
                  tone: true,
                  mediaDuration: true,
                  imslpPermlink: true,
                  composer: {
                    select: {
                      id: true,
                      name: true,
                      fullName: true,
                      portraitUrl: true,
                      epochName: true,
                    },
                  },
                },
                orderBy: [{ compositionYear: 'asc' }, { title: 'asc' }],
              });
              composerWorks.push(...titleWorks);
            }

            // Completa com outras obras do mesmo compositor se necessário
            const remainingCount = prefs.count - composerWorks.length;
            if (remainingCount > 0) {
              const additionalWorks = await prisma.work.findMany({
                where: {
                  instrumentId: instrument.id,
                  composerId: composerId,
                  id: { notIn: composerWorks.map((w) => w.id) }, // Evita duplicatas
                },
                select: {
                  id: true,
                  title: true,
                  opOrCatalog: true,
                  compositionYear: true,
                  tone: true,
                  mediaDuration: true,
                  imslpPermlink: true,
                  composer: {
                    select: {
                      id: true,
                      name: true,
                      fullName: true,
                      portraitUrl: true,
                      epochName: true,
                    },
                  },
                },
                orderBy: [{ compositionYear: 'asc' }, { title: 'asc' }],
                take: remainingCount,
              });
              composerWorks.push(...additionalWorks);
            }

            selectedWorks.push(...composerWorks);
          }

          // Se deve completar automaticamente até o limite
          if (worksPrefs.fallbackToAutomatic !== false) {
            const maxWorks = Math.min(worksPrefs.totalMaxWorks || 20, 20);
            const remainingCount = maxWorks - selectedWorks.length;

            if (remainingCount > 0) {
              // Busca compositores com mais obras para este instrumento (excluindo já selecionados)
              const additionalWorks = await prisma.work.findMany({
                where: {
                  instrumentId: instrument.id,
                  id: { notIn: selectedWorks.map((w) => w.id) },
                },
                select: {
                  id: true,
                  title: true,
                  opOrCatalog: true,
                  compositionYear: true,
                  tone: true,
                  mediaDuration: true,
                  imslpPermlink: true,
                  composer: {
                    select: {
                      id: true,
                      name: true,
                      fullName: true,
                      portraitUrl: true,
                      epochName: true,
                    },
                  },
                },
                orderBy: [{ compositionYear: 'asc' }, { title: 'asc' }],
                take: remainingCount,
              });
              selectedWorks.push(...additionalWorks);
            }
          }
        } else {
          // Modo padrão: busca as 20 melhores obras (por compositores com mais obras)
          const composerPrefs = composerPreferences[instrument.name];
          // eslint-disable-next-line
          let whereClause: any = {
            instrumentId: instrument.id,
          };

          // Se há compositor preferido, filtra por ele
          if (composerPrefs?.preferredComposerId) {
            whereClause.composerId = composerPrefs.preferredComposerId;
          }

          // Se há compositores excluídos, remove eles
          if (composerPrefs?.excludedComposerIds?.length) {
            whereClause.composerId = {
              ...whereClause.composerId,
              notIn: composerPrefs.excludedComposerIds,
            };
          }

          selectedWorks = await prisma.work.findMany({
            where: whereClause,
            select: {
              id: true,
              title: true,
              opOrCatalog: true,
              compositionYear: true,
              tone: true,
              mediaDuration: true,
              imslpPermlink: true,
              composer: {
                select: {
                  id: true,
                  name: true,
                  fullName: true,
                  portraitUrl: true,
                  epochName: true,
                },
              },
            },
            orderBy: [{ compositionYear: 'asc' }, { title: 'asc' }],
            take: 20, // Limita direto na query
          });
        }

        // Garante máximo de 20 obras
        selectedWorks = selectedWorks.slice(0, 20);

        return {
          id: instrument.id,
          name: instrument.name,
          historicalData: instrumentsHistoricalData[instrument.name] || {
            name: instrument.name,
            category: 'Indefinido',
            origin: 'Desconhecido',
            inventor: null,
            inventionPeriod: 'Indefinido',
            description: 'Informações históricas não disponíveis.',
            detailedHistory: 'História detalhada não disponível.',
            characteristics: [],
            evolution: [],
            notableFeatures: [],
            famousPerformers: [],
            imageUrl: '/instruments/default.jpg',
            iconName: 'Music',
          },
          works: selectedWorks.map((work) => ({
            id: work.id,
            title: work.title,
            composer: work.composer,
            opOrCatalog: work.opOrCatalog,
            compositionYear: work.compositionYear,
            tone: work.tone,
            mediaDuration: work.mediaDuration,
            imslpPermlink: work.imslpPermlink,
            videoUrl: work.videoUrl,
          })),
        };
      })
    );

    return instrumentsWithWorks;
  },
  ['instruments-with-works-v3'], // Nova versão do cache
  {
    revalidate: 3600, // 1 hora
    tags: ['instruments', 'works', 'composers'],
  }
);

export const getInstrumentsStats = unstable_cache(
  async () => {
    // Busca apenas os instrumentos básicos primeiro
    const instruments = await prisma.instrument.findMany({
      where: {
        name: {
          in: targetInstruments,
          mode: 'insensitive',
        },
      },
      select: {
        id: true,
        name: true,
      },
    });

    // Para cada instrumento, faz uma query específica e otimizada usando aggregation
    const stats = await Promise.all(
      instruments.map(async (instrument) => {
        // Query otimizada para contar works sem carregar dados desnecessários
        const worksCount = await prisma.work.count({
          where: {
            instrumentId: instrument.id,
          },
        });

        // Query otimizada para contar usuários sem carregar dados desnecessários
        const usersCount = await prisma.userInstrument.count({
          where: {
            instrumentId: instrument.id,
          },
        });

        return {
          instrumentName: instrument.name,
          totalWorks: worksCount,
          totalUsers: usersCount,
        };
      })
    );

    return stats;
  },
  ['instruments-stats-v2'], // Nova versão
  {
    revalidate: 7200, // 2 horas
    tags: ['instruments', 'stats'],
  }
);

// OTIMIZAÇÃO 3: Top compositores por instrumento - VERSÃO OTIMIZADA
export const getTopComposersByInstrument = unstable_cache(
  async (composerPreferences: ComposerPreferences = {}) => {
    // Busca apenas os instrumentos básicos primeiro
    const instruments = await prisma.instrument.findMany({
      where: {
        name: {
          in: targetInstruments,
          mode: 'insensitive',
        },
      },
      select: {
        id: true,
        name: true,
      },
    });

    const results = await Promise.all(
      instruments.map(async (instrument) => {
        const preferences = composerPreferences[instrument.name] || {};

        // Se há um compositor preferido definido, busca ele especificamente
        if (preferences.preferredComposerId) {
          // Busca apenas o compositor preferido e conta suas obras
          const preferredComposer = await prisma.composer.findUnique({
            where: {
              id: preferences.preferredComposerId,
            },
            select: {
              id: true,
              name: true,
              fullName: true,
              portraitUrl: true,
              epochName: true,
            },
          });

          if (preferredComposer) {
            // Conta as obras do compositor preferido para este instrumento
            const worksCount = await prisma.work.count({
              where: {
                instrumentId: instrument.id,
                composerId: preferences.preferredComposerId,
              },
            });

            return {
              instrumentName: instrument.name,
              topComposers: [
                {
                  composer: preferredComposer,
                  count: worksCount,
                },
              ],
            };
          }
        }

        // Abordagem alternativa mais simples: group by na aplicação
        // Busca obras com apenas o composerId para este instrumento
        const worksWithComposer = await prisma.work.findMany({
          where: {
            instrumentId: instrument.id,
            // Filtra compositores excluídos se houver
            ...(preferences.excludedComposerIds?.length && {
              composerId: {
                notIn: preferences.excludedComposerIds,
              },
            }),
          },
          select: {
            composerId: true,
            composer: {
              select: {
                id: true,
                name: true,
                fullName: true,
                portraitUrl: true,
                epochName: true,
              },
            },
          },
        });

        // Group by compositor usando Map para melhor performance
        const composerCountMap = new Map<
          string,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          { composer: any; count: number }
        >();

        worksWithComposer.forEach((work) => {
          const composerId = work.composerId;
          if (composerCountMap.has(composerId)) {
            composerCountMap.get(composerId)!.count++;
          } else {
            composerCountMap.set(composerId, {
              composer: work.composer,
              count: 1,
            });
          }
        });

        // Converte para array e ordena por count descendente
        const topComposers = Array.from(composerCountMap.values())
          .sort((a, b) => b.count - a.count)
          .slice(0, 5); // Top 5 compositores

        return {
          instrumentName: instrument.name,
          topComposers,
        };
      })
    );

    return results;
  },
  ['top-composers-by-instrument-v2'], // Nova versão
  {
    revalidate: 7200, // 2 horas
    tags: ['instruments', 'composers', 'stats'],
  }
);

// Função para limpar cache - ATUALIZADA
export async function revalidateInstrumentsCache() {
  const { revalidateTag } = await import('next/cache');

  revalidateTag('instruments');
  revalidateTag('works');
  revalidateTag('composers');
  revalidateTag('stats');
  revalidateTag('instruments-with-works-v3');
  revalidateTag('instruments-stats-v2'); // Novo
  revalidateTag('top-composers-by-instrument-v2'); // Novo
}

// Exporta interfaces para uso externo
export type { ComposerPreferences, WorksPreferences };
