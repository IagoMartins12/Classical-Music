// app/requests/music-history-translated.ts — história da música, pela API (Etapa 3)
import { apiFetch } from '@/app/libs/api/client';
import { bioTeaser } from '@/app/requests/bio-teaser';
import type { ApiSchema } from '@/app/libs/api/types';
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
    /** Resumo, não a biografia inteira — ver `bioTeaser`. */
    bio: string | null;
  }[];
  historicalData?: (EpochDataTranslated & { id: string }) | null;
}

// ✅ ADICIONADO: Compositores específicos por época (copiado do arquivo original)
export const composersByEpoch = {
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

  Romântico: {
    pt: {
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

/**
 * Cache do `fetch` do Next. A curadoria (a lista de `composersByEpoch`, o
 * limite de 12 por época e a ordem cronológica) mora na API desde a Etapa 1;
 * aqui ficam a tradução e o texto histórico, que é conteúdo do front. A API
 * avisa pelas tags `composers` e `epochs` quando o dado muda.
 */
const MUSIC_HISTORY_CACHE = {
  revalidate: 86400,
  tags: ['composers', 'epochs'],
};

function historicalDataFor(epochNamePt: string, language: Language) {
  const translatedData = epochsHistoricalDataTranslated[epochNamePt];
  return language === 'en' ? translatedData?.en : translatedData?.pt;
}

export async function getComposersByEpochTranslated(
  language: Language
): Promise<EpochComposersTranslated[]> {
  const groups = await apiFetch<ApiSchema<'EpochComposersGroupDto'>[]>(
    '/epochs/composers-by-epoch',
    { next: MUSIC_HISTORY_CACHE, buildFallback: [] }
  );

  return groups.map((group) => {
    const langData = historicalDataFor(group.epochName, language);

    return {
      epochId: group.epochId,
      epochName: translateEpochName(group.epochName, language),
      composers: group.composers.map((composer) => ({
        id: composer.id,
        name: composer.name,
        fullName: composer.fullName,
        portraitUrl: composer.portraitUrl ?? null,
        birthDate: composer.birthDate ?? null,
        deathDate: composer.deathDate ?? null,
        bio: bioTeaser(composer.bio),
      })),
      historicalData: langData ? { id: group.epochId, ...langData } : null,
    };
  });
}

export async function getEpochsHistoricalDataTranslated(
  language: Language
): Promise<(EpochDataTranslated & { id: string })[]> {
  const epochs = await apiFetch<ApiSchema<'EpochItemDto'>[]>('/epochs', {
    next: MUSIC_HISTORY_CACHE,
    buildFallback: [],
  });

  // Na ordem cronológica, só as épocas que existem no banco.
  return EPOCH_CHRONOLOGICAL_ORDER_PT.flatMap((epochNamePt) => {
    const epoch = epochs.find((e) => e.name === epochNamePt);
    if (!epoch) return [];

    return [
      {
        id: epoch.id,
        ...(historicalDataFor(epochNamePt, language) || {
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
      },
    ];
  });
}

export async function getComposersTimelineTranslated(language: Language) {
  const composers = await apiFetch<ApiSchema<'TimelineComposerItemDto'>[]>(
    '/epochs/timeline',
    { next: MUSIC_HISTORY_CACHE, buildFallback: [] }
  );

  return composers.map((composer) => ({
    id: composer.id,
    name: composer.name,
    fullName: composer.fullName,
    portraitUrl: composer.portraitUrl ?? null,
    birthDate: composer.birthDate ?? null,
    deathDate: composer.deathDate ?? null,
    bio: bioTeaser(composer.bio),
    epoch: { name: composer.epochName },
    epochName: translateEpochName(composer.epochName, language),
    birthYear: composer.birthYear ?? null,
    deathYear: composer.deathYear ?? null,
  }));
}
