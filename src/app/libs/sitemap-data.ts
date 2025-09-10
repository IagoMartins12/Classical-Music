// app/libs/sitemap-data.ts - CORRIGIDO para usar nosso proxy Prisma
import prisma from '@/app/libs/prismadb'; // ✅ USAR NOSSO PROXY

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

// ✅ USAR DIRETAMENTE NOSSO PROXY - Não criar nova instância
// ❌ REMOVIDO: let prisma: PrismaClient | null = null;
// ❌ REMOVIDO: function getPrismaClient() { ... }

// COMPOSITORES: Usar nosso proxy diretamente
export async function getComposersForSitemap() {
  try {
    console.log('📊 Buscando compositores para sitemap...');

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
      take: 100, // Limitar para performance
    });

    console.log(`📊 Sitemap: ${composers.length} famous composers found`);

    return composers.map((composer) => ({
      id: composer.id,
      name: composer.fullName,
      updatedAt: composer.updatedAt || composer.createdAt,
    }));
  } catch (error) {
    console.error('Error fetching composers for sitemap:', error);

    // ✅ FALLBACK: Retornar dados estáticos baseados nos seus dados reais
    const staticComposers = [
      {
        id: '685d8f9a8803000f9b61d151',
        name: 'Johann Sebastian Bach',
        updatedAt: new Date(),
      },
      {
        id: '685f4a93c6bd886c5b498cce',
        name: 'Franz Schubert',
        updatedAt: new Date(),
      },
      {
        id: '685e7ff8c6bd886c5b496e2a',
        name: 'Joseph Haydn',
        updatedAt: new Date(),
      },
      {
        id: '685ef349c6bd886c5b497f8f',
        name: 'Wolfgang Amadeus Mozart',
        updatedAt: new Date(),
      },
      {
        id: '685f8b71c6bd886c5b4995fe',
        name: 'Antonio Vivaldi',
        updatedAt: new Date(),
      },
      {
        id: '685e7a9fc6bd886c5b496d62',
        name: 'George Frideric Handel',
        updatedAt: new Date(),
      },
      {
        id: '685ec880c6bd886c5b497957',
        name: 'Franz Liszt',
        updatedAt: new Date(),
      },
    ];

    console.log(
      `📝 Using static composer data: ${staticComposers.length} composers`
    );
    return staticComposers;
  }
}

// OBRAS: Usar nosso proxy diretamente
export async function getWorksForSitemap() {
  try {
    console.log('🎶 Buscando obras para sitemap...');

    // Buscar compositores famosos primeiro
    const famousComposers = await prisma.composer.findMany({
      where: {
        OR: [
          { fullName: { in: allFamousNames } },
          { name: { in: allFamousNames } },
        ],
      },
      select: { id: true },
      take: 50,
    });

    const famousComposerIds = famousComposers.map((c) => c.id);

    // Buscar obras dos compositores famosos + obras populares
    const [popularWorks, famousComposerWorks] = await Promise.all([
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

    // ✅ FALLBACK: Retornar dados estáticos baseados nos seus dados reais
    const staticWorks = [
      {
        id: '688c29660c933f2b957d5aee',
        title: 'Experience',
        updatedAt: new Date(),
        favoriteCount: 0,
      },
      {
        id: '6879bfbc68d244782048d0fc',
        title: 'Œuvres célèbres pour orgue, Walter Kraft',
        updatedAt: new Date(),
        favoriteCount: 0,
      },
      {
        id: '6879bfb468d244782048d0fa',
        title: 'Œuvres complètes pour piano',
        updatedAt: new Date(),
        favoriteCount: 0,
      },
      {
        id: '6879bfb068d244782048d0f9',
        title: 'Œuvres complètes pour orgue',
        updatedAt: new Date(),
        favoriteCount: 0,
      },
    ];

    console.log(`📝 Using static works data: ${staticWorks.length} works`);
    return staticWorks;
  }
}
