// app/lib/sitemap-data.ts
import { PrismaClient } from '@prisma/client';

// Lista estática para fallback durante build
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

let prisma: PrismaClient | null = null;

// Inicializar Prisma apenas se possível
function getPrismaClient() {
  if (!prisma) {
    try {
      prisma = new PrismaClient();
    } catch {
      console.warn('⚠️ Prisma unavailable during build:');
      return null;
    }
  }
  return prisma;
}

// Verificar se estamos em build time
function isBuildTime() {
  return (
    process.env.NODE_ENV === 'production' &&
    !process.env.DATABASE_URL?.includes('27017')
  );
}

// COMPOSITORES: Com fallback para build time
export async function getComposersForSitemap() {
  const client = getPrismaClient();

  if (!client || isBuildTime()) {
    console.log('📝 Using static composer data for build time');
    // Retornar IDs fictícios para os compositores famosos
    return allFamousNames.slice(0, 50).map((name, index) => ({
      id: `static-composer-${index}`,
      name,
      updatedAt: new Date(),
    }));
  }

  try {
    const composers = await client.composer.findMany({
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
    // Fallback para dados estáticos
    return allFamousNames.slice(0, 50).map((name, index) => ({
      id: `fallback-composer-${index}`,
      name,
      updatedAt: new Date(),
    }));
  }
}

// OBRAS: Com fallback para build time
export async function getWorksForSitemap() {
  const client = getPrismaClient();

  if (!client || isBuildTime()) {
    console.log('📝 Using static works data for build time');
    // Retornar algumas obras estáticas famosas
    const famousWorks = [
      'Moonlight Sonata',
      'Für Elise',
      'Canon in D',
      'Ave Maria',
      'Swan Lake',
      'The Four Seasons',
      'Bolero',
      'Carmen',
      'Ninth Symphony',
      'Well-Tempered Clavier',
    ];

    return famousWorks.map((title, index) => ({
      id: `static-work-${index}`,
      title,
      updatedAt: new Date(),
      favoriteCount: 100 - index,
    }));
  }

  try {
    // Código original da função...
    const famousComposers = await client.composer.findMany({
      where: {
        OR: [
          { fullName: { in: allFamousNames } },
          { name: { in: allFamousNames } },
        ],
      },
      select: { id: true },
    });

    const famousComposerIds = famousComposers.map((c) => c.id);

    const [popularWorks, famousComposerWorks] = await Promise.all([
      client.work.findMany({
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
      client.work.findMany({
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

    combinedWorks.sort((a, b) => b.favoriteCount - a.favoriteCount);

    console.log(`📊 Sitemap: ${combinedWorks.length} works selected`);

    return combinedWorks.slice(0, 2000);
  } catch (error) {
    console.error('Error fetching works for sitemap:', error);
    // Fallback para dados estáticos
    return [];
  }
}
