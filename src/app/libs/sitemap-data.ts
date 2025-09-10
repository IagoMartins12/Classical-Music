// app/lib/sitemap-data.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const allFamousNames = [
  'Ludwig van Beethoven',
  'Wolfgang Amadeus Mozart',
  'Johann Sebastian Bach',
  'Richard Wagner',
  'Joseph Haydn',
  'Johannes Brahms',
  'Franz Schubert',
  'Peter Ilyich Tchaikovsky',
  'George Frideric Handel',
  'Igor Stravinsky',
  'Robert Schumann',
  'Felix Mendelssohn',
  'Claude Debussy',
  'Gustav Mahler',
  'Franz Liszt',
  'Maurice Ravel',
  'Antonín Dvořák',
  'Antonio Vivaldi',
  'Dmitri Shostakovich',
  'Steve Reich',
  'Frédéric Chopin',
  'Serge Prokofiev',
  'Béla Bartók',
  'Hector Berlioz',
  'Anton Bruckner',
  'Giovanni Pierluigi da Palestrina',
  'Claudio Monteverdi',
  'Jean Sibelius',
  'Ralph Vaughan Williams',
  'Modest Mussorgsky',
  'Giacomo Puccini',
  'Henry Purcell',
  'Gioacchino Rossini',
  'Edward Elgar',
  'Sergei Rachmaninoff',
  'Camille Saint-Saëns',
  'Josquin Des Prez',
  'Nikolai Rimsky-Korsakov',
  'Carl Maria von Weber',
  'Jean-Philippe Rameau',
  'Jean-Baptiste Lully',
  'Gabriel Fauré',
  'Edvard Grieg',
  'Christoph Willibald Gluck',
  'Arnold Schoenberg',
  'Charles Ives',
  'Paul Hindemith',
  'Olivier Messiaen',
  'Aaron Copland',
  'Francois Couperin',
  'William Byrd',
  'Erik Satie',
  'Benjamin Britten',
  'Bedrick Smetana',
  'César Franck',
  'Alexander Nikolayevich Scriabin',
  'Georges Bizet',
  'Domenico Scarlatti',
  'Georg Philipp Telemann',
  'Anton Webern',
  'Roland de Lassus',
  'George Gershwin',
  'Gaetano Donizetti',
  'Carl Philipp Emanuel Bach',
  'Archangelo Corelli',
  'Thomas Tallis',
  'Johann Strauss II',
  'Leos Janácek',
  'Guillaume de Machaut',
  'Alban Berg',
  'Alexander Borodin',
  'Vincenzo Bellini',
  'Charles Gounod',
  'Jules Massenet',
  'Francis Poulenc',
  'Giovanni Gabrieli',
  'Pérotin',
  'Heinrich Schütz',
  'John Cage',
  'Giovanni Battista Pergolesi',
  'John Dowland',
  'Gustav Holst',
  'Dietrich Buxtehude',
  'Ottorino Respighi',
  'Guillaume Dufay',
  'Hugo Wolf',
  'Carl Nielsen',
  'William Walton',
  'Darius Milhaud',
  'Orlando Gibbons',
  'Giacomo Meyerbeer',
  'Samuel Barber',
  'Tomás Luis de Victoria',
  'Léonin',
  'Manuel de Falla',
  'Hildegard von Bingen',
  'Mikhail Glinka',
  'Alexander Glazunov',
  'Don Carlo Gesualdo',
  'Richard Strauss',
  'Philip Glass',
  'John Williams',
  'Leonard Bernstein',
  'Heitor Villa-Lobos',
  'Clara Schumann',
  'Carl Orff',
  'Max Bruch',
  'Arvo Pärt',
  'Ennio Morricone',
];

// COMPOSITORES: Apenas os famosos
export async function getComposersForSitemap() {
  try {
    const composers = await prisma.composer.findMany({
      where: {
        OR: [
          { fullName: { in: allFamousNames } },
          { name: { in: allFamousNames } },
        ],
      },
      select: {
        id: true,
        fullName: true,
        updatedAt: true,
        createdAt: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    console.log(`📊 Sitemap: ${composers.length} famous composers found`);

    return composers.map((composer) => ({
      id: composer.id,
      name: composer.fullName,
      updatedAt: composer.updatedAt || composer.createdAt,
    }));
  } catch (error) {
    console.error('Error fetching composers for sitemap:', error);
    return [];
  }
}

// OBRAS: Estratégia inteligente usando FavoriteWork
export async function getWorksForSitemap() {
  try {
    // Primeiro, pegar IDs dos compositores famosos
    const famousComposers = await prisma.composer.findMany({
      where: {
        OR: [
          { fullName: { in: allFamousNames } },
          { name: { in: allFamousNames } },
        ],
      },
      select: { id: true },
    });

    const famousComposerIds = famousComposers.map((c) => c.id);

    // ESTRATÉGIA HÍBRIDA: Obras mais populares + obras de compositores famosos
    const [popularWorks, famousComposerWorks] = await Promise.all([
      // 1. Top 500 obras mais favoritadas (independente do compositor)
      prisma.work.findMany({
        select: {
          id: true,
          title: true,
          updatedAt: true,
          createdAt: true,
          _count: {
            select: {
              favoriteBy: true,
            },
          },
        },
        orderBy: {
          favoriteBy: {
            _count: 'desc',
          },
        },
        take: 500,
      }),

      // 2. Top 1500 obras dos compositores famosos (ordenadas por favoritos)
      prisma.work.findMany({
        where: {
          composerId: { in: famousComposerIds },
        },
        select: {
          id: true,
          title: true,
          updatedAt: true,
          createdAt: true,
          _count: {
            select: {
              favoriteBy: true,
            },
          },
        },
        orderBy: {
          favoriteBy: {
            _count: 'desc',
          },
        },
        take: 1500,
      }),
    ]);

    // Combinar e remover duplicatas
    const workIds = new Set<string>();
    const combinedWorks: Array<{
      id: string;
      title: string;
      updatedAt: Date;
      favoriteCount: number;
    }> = [];

    // Adicionar obras populares primeiro (prioridade)
    for (const work of popularWorks) {
      if (!workIds.has(work.id)) {
        workIds.add(work.id);
        combinedWorks.push({
          id: work.id,
          title: work.title,
          updatedAt: work.updatedAt || work.createdAt,
          favoriteCount: work._count.favoriteBy,
        });
      }
    }

    // Adicionar obras de compositores famosos
    for (const work of famousComposerWorks) {
      if (!workIds.has(work.id)) {
        workIds.add(work.id);
        combinedWorks.push({
          id: work.id,
          title: work.title,
          updatedAt: work.updatedAt || work.createdAt,
          favoriteCount: work._count.favoriteBy,
        });
      }
    }

    // Ordenar por popularidade final
    combinedWorks.sort((a, b) => b.favoriteCount - a.favoriteCount);

    console.log(
      `📊 Sitemap: ${combinedWorks.length} works selected (${popularWorks.length} popular + ${famousComposerWorks.length} from famous composers, ${combinedWorks.length - workIds.size} duplicates removed)`
    );

    return combinedWorks.slice(0, 2000).map((work) => ({
      id: work.id,
      title: work.title,
      updatedAt: work.updatedAt,
      favoriteCount: work.favoriteCount,
    }));
  } catch (error) {
    console.error('Error fetching works for sitemap:', error);
    return [];
  }
}
