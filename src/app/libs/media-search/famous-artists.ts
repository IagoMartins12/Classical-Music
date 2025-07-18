// app/libs/famous-artists.ts
export interface FamousArtist {
  name: string;
  searchVariations: string[]; // Variações do nome para busca
  priority: number; // 1-10 (10 = mais famoso)
  specialties?: string[]; // Especialidades (ex: "romantic", "bach", "chopin")
}

export interface InstrumentArtists {
  [instrument: string]: FamousArtist[];
}

/**
 * Base de dados de artistas/intérpretes famosos por instrumento
 */
export const FAMOUS_ARTISTS: InstrumentArtists = {
  piano: [
    // Lendas históricas
    {
      name: 'Vladimir Ashkenazy',
      searchVariations: ['Vladimir Ashkenazy', 'Ashkenazy'],
      priority: 10,
      specialties: ['chopin', 'rachmaninoff', 'romantic'],
    },
    {
      name: 'Arthur Rubinstein',
      searchVariations: ['Arthur Rubinstein', 'Rubinstein'],
      priority: 10,
      specialties: ['chopin', 'romantic'],
    },
    {
      name: 'Glenn Gould',
      searchVariations: ['Glenn Gould', 'Gould'],
      priority: 10,
      specialties: ['bach', 'baroque'],
    },
    {
      name: 'Martha Argerich',
      searchVariations: ['Martha Argerich', 'Marta Argerich', 'Argerich'],
      priority: 10,
      specialties: ['romantic', 'prokofiev', 'chopin'],
    },
    {
      name: 'Krystian Zimerman',
      searchVariations: ['Krystian Zimerman', 'Zimerman'],
      priority: 10,
      specialties: ['chopin', 'romantic', 'contemporary'],
    },

    // Grandes mestres
    {
      name: 'Daniel Barenboim',
      searchVariations: ['Daniel Barenboim', 'Barenboim'],
      priority: 9,
      specialties: ['beethoven', 'mozart', 'romantic'],
    },
    {
      name: 'Murray Perahia',
      searchVariations: ['Murray Perahia', 'Perahia'],
      priority: 9,
      specialties: ['bach', 'mozart', 'classical'],
    },
    {
      name: 'Alfred Brendel',
      searchVariations: ['Alfred Brendel', 'Brendel'],
      priority: 9,
      specialties: ['beethoven', 'schubert', 'classical'],
    },
    {
      name: 'Maurizio Pollini',
      searchVariations: ['Maurizio Pollini', 'Pollini'],
      priority: 9,
      specialties: ['chopin', 'contemporary', 'boulez'],
    },
    {
      name: 'András Schiff',
      searchVariations: ['András Schiff', 'Andras Schiff', 'Schiff'],
      priority: 9,
      specialties: ['bach', 'beethoven', 'schubert'],
    },

    // Grandes intérpretes contemporâneos
    {
      name: 'Lang Lang',
      searchVariations: ['Lang Lang'],
      priority: 8,
      specialties: ['romantic', 'chopin', 'liszt'],
    },
    {
      name: 'Yuja Wang',
      searchVariations: ['Yuja Wang'],
      priority: 8,
      specialties: ['romantic', 'contemporary', 'rachmaninoff'],
    },
    {
      name: 'Daniil Trifonov',
      searchVariations: ['Daniil Trifonov', 'Trifonov'],
      priority: 8,
      specialties: ['romantic', 'rachmaninoff', 'contemporary'],
    },
    {
      name: 'Evgeny Kissin',
      searchVariations: ['Evgeny Kissin', 'Kissin'],
      priority: 8,
      specialties: ['chopin', 'romantic', 'russian'],
    },
    {
      name: 'Marc-André Hamelin',
      searchVariations: ['Marc-André Hamelin', 'Hamelin'],
      priority: 8,
      specialties: ['virtuosic', 'contemporary', 'alkan'],
    },
  ],

  violin: [
    // Lendas
    {
      name: 'Itzhak Perlman',
      searchVariations: ['Itzhak Perlman', 'Perlman'],
      priority: 10,
      specialties: ['romantic', 'virtuosic'],
    },
    {
      name: 'Yehudi Menuhin',
      searchVariations: ['Yehudi Menuhin', 'Menuhin'],
      priority: 10,
      specialties: ['bach', 'classical', 'romantic'],
    },
    {
      name: 'Jascha Heifetz',
      searchVariations: ['Jascha Heifetz', 'Heifetz'],
      priority: 10,
      specialties: ['virtuosic', 'romantic', 'russian'],
    },
    {
      name: 'David Oistrakh',
      searchVariations: ['David Oistrakh', 'Oistrakh'],
      priority: 10,
      specialties: ['russian', 'romantic', 'brahms'],
    },

    // Grandes mestres
    {
      name: 'Anne-Sophie Mutter',
      searchVariations: ['Anne-Sophie Mutter', 'Mutter'],
      priority: 9,
      specialties: ['contemporary', 'romantic', 'mozart'],
    },
    {
      name: 'Joshua Bell',
      searchVariations: ['Joshua Bell', 'Bell'],
      priority: 9,
      specialties: ['romantic', 'american'],
    },
    {
      name: 'Hilary Hahn',
      searchVariations: ['Hilary Hahn', 'Hahn'],
      priority: 9,
      specialties: ['bach', 'contemporary', 'precise'],
    },
    {
      name: 'Maxim Vengerov',
      searchVariations: ['Maxim Vengerov', 'Vengerov'],
      priority: 9,
      specialties: ['romantic', 'virtuosic', 'russian'],
    },
  ],

  cello: [
    {
      name: 'Yo-Yo Ma',
      searchVariations: ['Yo-Yo Ma', 'Yo Yo Ma'],
      priority: 10,
      specialties: ['bach', 'romantic', 'contemporary'],
    },
    {
      name: 'Mstislav Rostropovich',
      searchVariations: ['Mstislav Rostropovich', 'Rostropovich'],
      priority: 10,
      specialties: ['russian', 'shostakovich', 'romantic'],
    },
    {
      name: 'Pablo Casals',
      searchVariations: ['Pablo Casals', 'Casals'],
      priority: 10,
      specialties: ['bach', 'classical', 'historical'],
    },
    {
      name: 'Jacqueline du Pré',
      searchVariations: ['Jacqueline du Pré', 'Jacqueline du Pre', 'du Pré'],
      priority: 9,
      specialties: ['elgar', 'romantic', 'emotional'],
    },
  ],

  orchestra: [
    // Grandes orquestras
    {
      name: 'Berlin Philharmonic',
      searchVariations: [
        'Berlin Philharmonic',
        'Berliner Philharmoniker',
        'BPO',
      ],
      priority: 10,
      specialties: ['german', 'romantic', 'beethoven'],
    },
    {
      name: 'Vienna Philharmonic',
      searchVariations: ['Vienna Philharmonic', 'Wiener Philharmoniker', 'VPO'],
      priority: 10,
      specialties: ['austrian', 'classical', 'mozart'],
    },
    {
      name: 'London Symphony Orchestra',
      searchVariations: ['London Symphony Orchestra', 'LSO'],
      priority: 9,
      specialties: ['british', 'romantic', 'elgar'],
    },
    {
      name: 'New York Philharmonic',
      searchVariations: ['New York Philharmonic', 'NYP'],
      priority: 9,
      specialties: ['american', 'contemporary', 'bernstein'],
    },
    {
      name: 'Royal Concertgebouw Orchestra',
      searchVariations: ['Concertgebouw', 'Royal Concertgebouw'],
      priority: 9,
      specialties: ['dutch', 'romantic', 'mahler'],
    },
  ],
};

/**
 * Obtém artistas famosos para um instrumento específico
 */
export function getFamousArtistsForInstrument(
  instrument: string
): FamousArtist[] {
  const normalizedInstrument = instrument.toLowerCase();

  // Mapear instrumentos similares
  const instrumentMap: { [key: string]: string } = {
    piano: 'piano',
    violino: 'violin',
    violin: 'violin',
    violoncelo: 'cello',
    cello: 'cello',
    orquestra: 'orchestra',
    orchestra: 'orchestra',
    orquestral: 'orchestra',
  };

  const mappedInstrument =
    instrumentMap[normalizedInstrument] || normalizedInstrument;
  return FAMOUS_ARTISTS[mappedInstrument] || [];
}

/**
 * Gera queries de busca priorizando artistas famosos
 */
export function generateArtistPriorityQueries(
  originalQuery: string,
  composerName: string,
  instrument?: string,
  workStyle?: string
): Array<{
  query: string;
  strategy: string;
  priority: number;
  artist?: string;
}> {
  const queries: Array<{
    query: string;
    strategy: string;
    priority: number;
    artist?: string;
  }> = [];

  if (!instrument) {
    // Se não tem instrumento, retorna query original
    return [
      {
        query: originalQuery,
        strategy: 'no-instrument',
        priority: 50,
      },
    ];
  }

  const famousArtists = getFamousArtistsForInstrument(instrument);

  // Filtrar artistas por especialidade se temos informação de estilo/compositor
  const relevantArtists = filterArtistsByRelevance(
    famousArtists,
    composerName,
    workStyle
  );

  // Gerar queries com artistas famosos (prioridade alta)
  relevantArtists.slice(0, 5).forEach((artist, index) => {
    artist.searchVariations.forEach((variation, varIndex) => {
      queries.push({
        query: `${originalQuery} ${variation}`,
        strategy: 'famous-artist',
        priority: 95 - index - varIndex, // Prioridade muito alta
        artist: artist.name,
      });
    });
  });

  // Query original sem artista (prioridade média)
  queries.push({
    query: originalQuery,
    strategy: 'original',
    priority: 50,
  });

  // Query genérica com instrumento (prioridade baixa)
  queries.push({
    query: `${originalQuery} ${instrument}`,
    strategy: 'with-instrument',
    priority: 30,
  });

  return queries.sort((a, b) => b.priority - a.priority);
}

/**
 * Filtra artistas por relevância baseado no compositor e estilo
 */
function filterArtistsByRelevance(
  artists: FamousArtist[],
  composerName: string,
  workStyle?: string
): FamousArtist[] {
  const composer = composerName.toLowerCase();
  const style = workStyle?.toLowerCase();

  return artists
    .map((artist) => {
      let relevanceScore = artist.priority;

      // Bonus por especialidade no compositor
      if (artist.specialties) {
        if (artist.specialties.some((spec) => composer.includes(spec))) {
          relevanceScore += 20;
        }

        // Bonus por especialidade no estilo
        if (style && artist.specialties.some((spec) => style.includes(spec))) {
          relevanceScore += 10;
        }
      }

      return { ...artist, relevanceScore };
    })
    .sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
}

/**
 * Determina se um resultado é de um artista famoso
 */
export function isFromFamousArtist(
  resultArtist: string,
  instrument?: string
): { isFamous: boolean; artist?: FamousArtist } {
  if (!instrument) return { isFamous: false };

  const famousArtists = getFamousArtistsForInstrument(instrument);
  const normalizedResult = resultArtist.toLowerCase();

  for (const artist of famousArtists) {
    const found = artist.searchVariations.some(
      (variation) =>
        normalizedResult.includes(variation.toLowerCase()) ||
        variation.toLowerCase().includes(normalizedResult)
    );

    if (found) {
      return { isFamous: true, artist };
    }
  }

  return { isFamous: false };
}

/**
 * Calcula bonus de score para artistas famosos
 */
export function calculateFamousArtistBonus(
  resultArtist: string,
  instrument?: string
): number {
  const { isFamous, artist } = isFromFamousArtist(resultArtist, instrument);

  if (!isFamous || !artist) return 0;

  // Bonus baseado na prioridade do artista
  return artist.priority * 5; // 5-50 pontos de bonus
}
