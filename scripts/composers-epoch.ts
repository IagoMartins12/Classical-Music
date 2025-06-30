import { PrismaClient } from '@prisma/client';
import * as readline from 'readline';

const prisma = new PrismaClient();

// Interfaces
interface EpochInfo {
  id: string;
  name: string;
  startYear: number;
  endYear: number;
}

interface ComposerData {
  id: string;
  name: string;
  fullName: string;
  birthDate: string | null;
  deathDate: string | null;
  epochId: string;
  epochName: string;
  worksCount: number;
}

interface ComposerCorrection {
  id: string;
  name: string;
  fullName: string;
  birthDate: string | null;
  deathDate: string | null;
  currentEpochName: string;
  correctEpochName: string;
  currentEpochId: string;
  correctEpochId: string;
  reason: string;
  worksCount: number;
}

// Definição das épocas
const EPOCHS: EpochInfo[] = [
  {
    id: '685d59bc1e3db0c5aaa8941b',
    name: 'Medieval',
    startYear: 476,
    endYear: 1399,
  },
  {
    id: '685d59d81e3db0c5aaa89425',
    name: 'Renascentista',
    startYear: 1400,
    endYear: 1599,
  },
  {
    id: '685d59e11e3db0c5aaa8942d',
    name: 'Barroco',
    startYear: 1600,
    endYear: 1749,
  },
  {
    id: '685d59eb1e3db0c5aaa89435',
    name: 'Clássico',
    startYear: 1750,
    endYear: 1819,
  },
  {
    id: '685d59f31e3db0c5aaa89439',
    name: 'Romântico',
    startYear: 1820,
    endYear: 1910,
  },
  {
    id: '685d59ff1e3db0c5aaa8943f',
    name: 'Modernismo',
    startYear: 1911,
    endYear: 1949,
  },
  {
    id: '685d5a061e3db0c5aaa89443',
    name: 'Contemporâneo',
    startYear: 1950,
    endYear: 2024,
  },
];

// Lista de compositores famosos com suas épocas corretas (300+ compositores)
const FAMOUS_COMPOSERS_EPOCHS: Record<string, string> = {
  // MEDIEVAL (476-1399)
  'guillaume de machaut': 'Medieval',
  machaut: 'Medieval',
  pérotin: 'Medieval',
  perotin: 'Medieval',
  léonin: 'Medieval',
  leonin: 'Medieval',
  'hildegard von bingen': 'Medieval',
  hildegard: 'Medieval',
  'guillaume dufay': 'Medieval',
  dufay: 'Medieval',
  'gilles binchois': 'Medieval',
  binchois: 'Medieval',
  'john dunstable': 'Medieval',
  dunstable: 'Medieval',
  'francesco landini': 'Medieval',
  landini: 'Medieval',
  'philippe de vitry': 'Medieval',
  vitry: 'Medieval',

  // RENASCENTISTA (1400-1599)
  'giovanni pierluigi da palestrina': 'Renascentista',
  palestrina: 'Renascentista',
  'josquin des prez': 'Renascentista',
  josquin: 'Renascentista',
  'claudio monteverdi': 'Renascentista',
  monteverdi: 'Renascentista',
  'orlando di lasso': 'Renascentista',
  lassus: 'Renascentista',
  'william byrd': 'Renascentista',
  byrd: 'Renascentista',
  'thomas tallis': 'Renascentista',
  tallis: 'Renascentista',
  'giovanni gabrieli': 'Renascentista',
  gabrieli: 'Renascentista',
  'andrea gabrieli': 'Renascentista',
  'carlo gesualdo': 'Renascentista',
  gesualdo: 'Renascentista',
  'tomás luis de victoria': 'Renascentista',
  victoria: 'Renascentista',
  'luca marenzio': 'Renascentista',
  marenzio: 'Renascentista',
  'john dowland': 'Renascentista',
  dowland: 'Renascentista',
  'clement janequin': 'Renascentista',
  janequin: 'Renascentista',
  'pierre de la rue': 'Renascentista',
  'la rue': 'Renascentista',

  // BARROCO (1600-1749)
  'johann sebastian bach': 'Barroco',
  bach: 'Barroco',
  'j.s. bach': 'Barroco',
  'george frideric handel': 'Barroco',
  handel: 'Barroco',
  händel: 'Barroco',
  'antonio vivaldi': 'Barroco',
  vivaldi: 'Barroco',
  'georg philipp telemann': 'Barroco',
  telemann: 'Barroco',
  'arcangelo corelli': 'Barroco',
  corelli: 'Barroco',
  'henry purcell': 'Barroco',
  purcell: 'Barroco',
  'jean-philippe rameau': 'Barroco',
  rameau: 'Barroco',
  'domenico scarlatti': 'Barroco',
  'd. scarlatti': 'Barroco',
  'alessandro scarlatti': 'Barroco',
  'a. scarlatti': 'Barroco',
  'johann pachelbel': 'Barroco',
  pachelbel: 'Barroco',
  'dietrich buxtehude': 'Barroco',
  buxtehude: 'Barroco',
  'jean-baptiste lully': 'Barroco',
  lully: 'Barroco',
  'marc-antoine charpentier': 'Barroco',
  charpentier: 'Barroco',
  'françois couperin': 'Barroco',
  couperin: 'Barroco',
  'giuseppe tartini': 'Barroco',
  tartini: 'Barroco',
  'antonio caldara': 'Barroco',
  caldara: 'Barroco',
  'benedetto marcello': 'Barroco',
  marcello: 'Barroco',
  'alessandro stradella': 'Barroco',
  stradella: 'Barroco',
  'heinrich schütz': 'Barroco',
  schutz: 'Barroco',
  schütz: 'Barroco',
  'johann jacob froberger': 'Barroco',
  froberger: 'Barroco',
  'girolamo frescobaldi': 'Barroco',
  frescobaldi: 'Barroco',

  // CLÁSSICO (1750-1819)
  'wolfgang amadeus mozart': 'Clássico',
  mozart: 'Clássico',
  'w.a. mozart': 'Clássico',
  'joseph haydn': 'Clássico',
  haydn: 'Clássico',
  'franz joseph haydn': 'Clássico',
  'ludwig van beethoven': 'Clássico',
  beethoven: 'Clássico',
  'luigi boccherini': 'Clássico',
  boccherini: 'Clássico',
  'muzio clementi': 'Clássico',
  clementi: 'Clássico',
  'carl philipp emanuel bach': 'Clássico',
  'c.p.e. bach': 'Clássico',
  'johann christian bach': 'Clássico',
  'j.c. bach': 'Clássico',
  'christoph willibald gluck': 'Clássico',
  gluck: 'Clássico',
  'domenico cimarosa': 'Clássico',
  cimarosa: 'Clássico',
  'giovanni paisiello': 'Clássico',
  paisiello: 'Clássico',
  'michael haydn': 'Clássico',
  salieri: 'Clássico',
  'antonio salieri': 'Clássico',
  'luigi cherubini': 'Clássico',
  cherubini: 'Clássico',
  'johann nepomuk hummel': 'Clássico',
  hummel: 'Clássico',

  // ROMÂNTICO (1820-1910)
  'franz schubert': 'Romântico',
  schubert: 'Romântico',
  'frédéric chopin': 'Romântico',
  'frederic chopin': 'Romântico',
  chopin: 'Romântico',
  'robert schumann': 'Romântico',
  schumann: 'Romântico',
  'clara schumann': 'Romântico',
  'clara wieck': 'Romântico',
  'felix mendelssohn': 'Romântico',
  mendelssohn: 'Romântico',
  'franz liszt': 'Romântico',
  liszt: 'Romântico',
  'johannes brahms': 'Romântico',
  brahms: 'Romântico',
  'richard wagner': 'Romântico',
  wagner: 'Romântico',
  'giuseppe verdi': 'Romântico',
  verdi: 'Romântico',
  'pyotr ilyich tchaikovsky': 'Romântico',
  tchaikovsky: 'Romântico',
  'piotr tchaikovsky': 'Romântico',
  'antonín dvořák': 'Romântico',
  dvorak: 'Romântico',
  dvořák: 'Romântico',
  'edvard grieg': 'Romântico',
  grieg: 'Romântico',
  'camille saint-saëns': 'Romântico',
  'saint-saens': 'Romântico',
  'saint-saëns': 'Romântico',
  'césar franck': 'Romântico',
  franck: 'Romântico',
  'anton bruckner': 'Romântico',
  bruckner: 'Romântico',
  'gustav mahler': 'Romântico',
  mahler: 'Romântico',
  'richard strauss': 'Romântico',
  'r. strauss': 'Romântico',
  'sergei rachmaninoff': 'Romântico',
  rachmaninoff: 'Romântico',
  rachmaninov: 'Romântico',
  'giacomo puccini': 'Romântico',
  puccini: 'Romântico',
  'gaetano donizetti': 'Romântico',
  donizetti: 'Romântico',
  'vincenzo bellini': 'Romântico',
  bellini: 'Romântico',
  'gioachino rossini': 'Romântico',
  rossini: 'Romântico',
  'hector berlioz': 'Romântico',
  berlioz: 'Romântico',
  'georges bizet': 'Romântico',
  bizet: 'Romântico',
  'gabriel fauré': 'Romântico',
  faure: 'Romântico',
  fauré: 'Romântico',
  'jules massenet': 'Romântico',
  massenet: 'Romântico',
  'nikolai rimsky-korsakov': 'Romântico',
  'rimsky-korsakov': 'Romântico',
  'modest mussorgsky': 'Romântico',
  mussorgsky: 'Romântico',
  'alexander borodin': 'Romântico',
  borodin: 'Romântico',
  'mily balakirev': 'Romântico',
  balakirev: 'Romântico',
  'alexander scriabin': 'Romântico',
  scriabin: 'Romântico',
  'bedřich smetana': 'Romântico',
  smetana: 'Romântico',
  'leoš janáček': 'Romântico',
  janacek: 'Romântico',
  janáček: 'Romântico',
  'jean sibelius': 'Romântico',
  sibelius: 'Romântico',
  'carl nielsen': 'Romântico',
  nielsen: 'Romântico',
  'manuel de falla': 'Romântico',
  falla: 'Romântico',
  'isaac albéniz': 'Romântico',
  albeniz: 'Romântico',
  albéniz: 'Romântico',
  'enrique granados': 'Romântico',
  granados: 'Romântico',
  'edward elgar': 'Romântico',
  elgar: 'Romântico',
  'ralph vaughan williams': 'Romântico',
  'vaughan williams': 'Romântico',
  'gustav holst': 'Romântico',
  holst: 'Romântico',
  'charles ives': 'Romântico',
  ives: 'Romântico',
  'antonín leopold dvořák': 'Romântico',

  // MODERNISMO (1911-1949)
  'claude debussy': 'Modernismo',
  debussy: 'Modernismo',
  'maurice ravel': 'Modernismo',
  ravel: 'Modernismo',
  'igor stravinsky': 'Modernismo',
  stravinsky: 'Modernismo',
  'béla bartók': 'Modernismo',
  bartok: 'Modernismo',
  bartók: 'Modernismo',
  'sergei prokofiev': 'Modernismo',
  prokofiev: 'Modernismo',
  'dmitri shostakovich': 'Modernismo',
  shostakovich: 'Modernismo',
  'arnold schoenberg': 'Modernismo',
  schoenberg: 'Modernismo',
  schönberg: 'Modernismo',
  'alban berg': 'Modernismo',
  berg: 'Modernismo',
  'anton webern': 'Modernismo',
  webern: 'Modernismo',
  'paul hindemith': 'Modernismo',
  hindemith: 'Modernismo',
  'aaron copland': 'Modernismo',
  copland: 'Modernismo',
  'george gershwin': 'Modernismo',
  gershwin: 'Modernismo',
  'erik satie': 'Modernismo',
  satie: 'Modernismo',
  'darius milhaud': 'Modernismo',
  milhaud: 'Modernismo',
  'arthur honegger': 'Modernismo',
  honegger: 'Modernismo',
  'francis poulenc': 'Modernismo',
  poulenc: 'Modernismo',
  'germaine tailleferre': 'Modernismo',
  tailleferre: 'Modernismo',
  'georges auric': 'Modernismo',
  auric: 'Modernismo',
  'louis durey': 'Modernismo',
  durey: 'Modernismo',
  'ottorino respighi': 'Modernismo',
  respighi: 'Modernismo',
  'heitor villa-lobos': 'Modernismo',
  'villa-lobos': 'Modernismo',
  'villa lobos': 'Modernismo',
  'karol szymanowski': 'Modernismo',
  szymanowski: 'Modernismo',
  'zoltán kodály': 'Modernismo',
  kodaly: 'Modernismo',
  kodály: 'Modernismo',
  'carl orff': 'Modernismo',
  orff: 'Modernismo',
  'edgard varèse': 'Modernismo',
  varese: 'Modernismo',
  varèse: 'Modernismo',
  'olivier messiaen': 'Modernismo',
  messiaen: 'Modernismo',
  'lili boulanger': 'Modernismo',
  'nadia boulanger': 'Modernismo',
  'samuel barber': 'Modernismo',
  barber: 'Modernismo',
  'william walton': 'Modernismo',
  walton: 'Modernismo',
  'benjamin britten': 'Modernismo',
  britten: 'Modernismo',
  'henry cowell': 'Modernismo',
  cowell: 'Modernismo',
  'charles ruggles': 'Modernismo',
  ruggles: 'Modernismo',
  'ruth crawford seeger': 'Modernismo',
  crawford: 'Modernismo',
  'carl ruggles': 'Modernismo',
  'conlon nancarrow': 'Modernismo',
  nancarrow: 'Modernismo',

  // CONTEMPORÂNEO (1950-2024)
  'john cage': 'Contemporâneo',
  cage: 'Contemporâneo',
  'philip glass': 'Contemporâneo',
  glass: 'Contemporâneo',
  'steve reich': 'Contemporâneo',
  reich: 'Contemporâneo',
  'terry riley': 'Contemporâneo',
  riley: 'Contemporâneo',
  'la monte young': 'Contemporâneo',
  young: 'Contemporâneo',
  'morton feldman': 'Contemporâneo',
  feldman: 'Contemporâneo',
  'earle brown': 'Contemporâneo',
  brown: 'Contemporâneo',
  'christian wolff': 'Contemporâneo',
  wolff: 'Contemporâneo',
  'pierre boulez': 'Contemporâneo',
  boulez: 'Contemporâneo',
  'karlheinz stockhausen': 'Contemporâneo',
  stockhausen: 'Contemporâneo',
  'luigi nono': 'Contemporâneo',
  nono: 'Contemporâneo',
  'luciano berio': 'Contemporâneo',
  berio: 'Contemporâneo',
  'bruno maderna': 'Contemporâneo',
  maderna: 'Contemporâneo',
  'elliott carter': 'Contemporâneo',
  carter: 'Contemporâneo',
  'milton babbitt': 'Contemporâneo',
  babbitt: 'Contemporâneo',
  'roger sessions': 'Contemporâneo',
  sessions: 'Contemporâneo',
  'george crumb': 'Contemporâneo',
  crumb: 'Contemporâneo',
  'krzysztof penderecki': 'Contemporâneo',
  penderecki: 'Contemporâneo',
  'witold lutosławski': 'Contemporâneo',
  lutoslawski: 'Contemporâneo',
  lutosławski: 'Contemporâneo',
  'henryk górecki': 'Contemporâneo',
  gorecki: 'Contemporâneo',
  górecki: 'Contemporâneo',
  'arvo pärt': 'Contemporâneo',
  part: 'Contemporâneo',
  pärt: 'Contemporâneo',
  'alfred schnittke': 'Contemporâneo',
  schnittke: 'Contemporâneo',
  'sofia gubaidulina': 'Contemporâneo',
  gubaidulina: 'Contemporâneo',
  'gyorgy ligeti': 'Contemporâneo',
  ligeti: 'Contemporâneo',
  'györgy ligeti': 'Contemporâneo',
  'iannis xenakis': 'Contemporâneo',
  xenakis: 'Contemporâneo',
  'toru takemitsu': 'Contemporâneo',
  takemitsu: 'Contemporâneo',
  'john adams': 'Contemporâneo',
  adams: 'Contemporâneo',
  'minimalist adams': 'Contemporâneo',
  'michael nyman': 'Contemporâneo',
  nyman: 'Contemporâneo',
  'harold budd': 'Contemporâneo',
  budd: 'Contemporâneo',
  'gavin bryars': 'Contemporâneo',
  bryars: 'Contemporâneo',
  'tom johnson': 'Contemporâneo',
  johnson: 'Contemporâneo',
  'frederic rzewski': 'Contemporâneo',
  rzewski: 'Contemporâneo',
  'alvin lucier': 'Contemporâneo',
  lucier: 'Contemporâneo',
  'pauline oliveros': 'Contemporâneo',
  oliveros: 'Contemporâneo',
  'meredith monk': 'Contemporâneo',
  monk: 'Contemporâneo',
  'laurie anderson': 'Contemporâneo',
  anderson: 'Contemporâneo',
  'frank zappa': 'Contemporâneo',
  zappa: 'Contemporâneo',
  björk: 'Contemporâneo',
  bjork: 'Contemporâneo',
  'max richter': 'Contemporâneo',
  richter: 'Contemporâneo',
  'ólafur arnalds': 'Contemporâneo',
  arnalds: 'Contemporâneo',
  'nils frahm': 'Contemporâneo',
  frahm: 'Contemporâneo',
  'johann johannsson': 'Contemporâneo',
  johannsson: 'Contemporâneo',
  'jóhann jóhannsson': 'Contemporâneo',
};

// Função para extrair ano de uma string de data
function extractYear(dateString: string | null): number | null {
  if (!dateString) return null;

  // Procurar por padrões de 4 dígitos (anos)
  const yearMatch = dateString.match(/\b(1[0-9]{3}|20[0-9]{2})\b/);
  if (yearMatch) {
    return parseInt(yearMatch[0]);
  }

  return null;
}

// Função para determinar época baseada no ano
function getEpochByYear(year: number): EpochInfo | null {
  return (
    EPOCHS.find((epoch) => year >= epoch.startYear && year <= epoch.endYear) ||
    null
  );
}

// Função para determinar época correta do compositor
function getCorrectEpoch(
  composer: ComposerData
): { epochId: string; epochName: string; reason: string } | null {
  const normalizedName = composer.name.toLowerCase().trim();
  const normalizedFullName = composer.fullName.toLowerCase().trim();

  // 1. Verificar lista de compositores famosos conhecidos
  if (
    FAMOUS_COMPOSERS_EPOCHS[normalizedName] ||
    FAMOUS_COMPOSERS_EPOCHS[normalizedFullName]
  ) {
    const correctEpochName =
      FAMOUS_COMPOSERS_EPOCHS[normalizedName] ||
      FAMOUS_COMPOSERS_EPOCHS[normalizedFullName];
    const epoch = EPOCHS.find((e) => e.name === correctEpochName);
    if (epoch) {
      return {
        epochId: epoch.id,
        epochName: epoch.name,
        reason: 'Lista de compositores famosos',
      };
    }
  }

  // 2. Baseado na data de nascimento (período produtivo: +25 anos)
  const birthYear = extractYear(composer.birthDate);
  if (birthYear) {
    const productiveYear = birthYear + 25; // Idade produtiva média
    const epoch = getEpochByYear(productiveYear);
    if (epoch) {
      return {
        epochId: epoch.id,
        epochName: epoch.name,
        reason: `Baseado no ano de nascimento (${birthYear}) + período produtivo`,
      };
    }
  }

  // 3. Baseado na data de morte (-25 anos)
  const deathYear = extractYear(composer.deathDate);
  if (deathYear) {
    const productiveYear = deathYear - 25;
    const epoch = getEpochByYear(productiveYear);
    if (epoch) {
      return {
        epochId: epoch.id,
        epochName: epoch.name,
        reason: `Baseado no ano de morte (${deathYear}) - período produtivo`,
      };
    }
  }

  return null;
}

// Função para obter nome da época pelo ID
function getEpochNameById(epochId: string): string {
  const epoch = EPOCHS.find((e) => e.id === epochId);
  return epoch ? epoch.name : 'Desconhecida';
}

// Função para criar interface readline
function createReadlineInterface(): readline.Interface {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
}

// Função para fazer pergunta ao usuário
function askQuestion(
  rl: readline.Interface,
  question: string
): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function analyzeAndFixFamousComposersEpochs(): Promise<void> {
  try {
    console.log('🎼 Iniciando análise dos compositores mais famosos...\n');

    // Buscar os 300 compositores com mais obras (proxy para "mais famosos")
    const topComposers: ComposerData[] = await prisma.composer
      .findMany({
        select: {
          id: true,
          name: true,
          fullName: true,
          birthDate: true,
          deathDate: true,
          epochId: true,
          _count: {
            select: {
              works: true,
            },
          },
        },
        orderBy: {
          works: {
            _count: 'desc',
          },
        },
        take: 300,
      })
      .then((composers) =>
        composers.map((composer) => ({
          id: composer.id,
          name: composer.name,
          fullName: composer.fullName,
          birthDate: composer.birthDate,
          deathDate: composer.deathDate,
          epochId: composer.epochId,
          epochName: getEpochNameById(composer.epochId),
          worksCount: composer._count.works,
        }))
      );

    console.log(
      `📊 Analisando os top ${topComposers.length} compositores por número de obras\n`
    );

    // Analisar cada compositor
    const corrections: ComposerCorrection[] = [];
    const epochCounts: Record<string, number> = {};

    console.log('🔍 Verificando épocas...\n');

    for (const composer of topComposers) {
      // Contar épocas atuais
      epochCounts[composer.epochName] =
        (epochCounts[composer.epochName] || 0) + 1;

      // Verificar se precisa correção
      const correctEpoch = getCorrectEpoch(composer);

      if (correctEpoch && correctEpoch.epochId !== composer.epochId) {
        corrections.push({
          id: composer.id,
          name: composer.name,
          fullName: composer.fullName,
          birthDate: composer.birthDate,
          deathDate: composer.deathDate,
          currentEpochName: composer.epochName,
          correctEpochName: correctEpoch.epochName,
          currentEpochId: composer.epochId,
          correctEpochId: correctEpoch.epochId,
          reason: correctEpoch.reason,
          worksCount: composer.worksCount,
        });
      }
    }

    // Exibir estatísticas atuais
    console.log('📊 DISTRIBUIÇÃO ATUAL POR ÉPOCAS:');
    Object.entries(epochCounts)
      .sort(([, a], [, b]) => b - a)
      .forEach(([epoch, count]) => {
        console.log(`- ${epoch}: ${count} compositores`);
      });

    console.log(`\n🔍 ANÁLISE COMPLETA:`);
    console.log(`- Total de compositores analisados: ${topComposers.length}`);
    console.log(`- Correções necessárias: ${corrections.length}`);
    console.log(
      `- Compositores corretos: ${topComposers.length - corrections.length}\n`
    );

    if (corrections.length > 0) {
      console.log('🔧 CORREÇÕES NECESSÁRIAS:\n');

      // Agrupar por tipo de correção
      const correctionsByEpoch: Record<string, ComposerCorrection[]> = {};
      for (const correction of corrections) {
        const key = `${correction.currentEpochName} → ${correction.correctEpochName}`;
        if (!correctionsByEpoch[key]) {
          correctionsByEpoch[key] = [];
        }
        correctionsByEpoch[key].push(correction);
      }

      // Exibir por categoria
      Object.entries(correctionsByEpoch).forEach(([change, composers]) => {
        console.log(`📝 ${change} (${composers.length} compositores):`);
        composers.slice(0, 5).forEach((composer) => {
          const birthInfo = composer.birthDate
            ? ` (nasc. ${composer.birthDate})`
            : '';
          console.log(
            `   • ${composer.name}${birthInfo} - ${composer.worksCount} obras`
          );
          console.log(`     Razão: ${composer.reason}`);
        });
        if (composers.length > 5) {
          console.log(`   ... e mais ${composers.length - 5} compositores\n`);
        } else {
          console.log('');
        }
      });

      // Mostrar casos mais importantes (compositores famosos)
      const famousCorrections = corrections.filter(
        (c) =>
          c.worksCount > 10 && // Compositores com muitas obras
          (FAMOUS_COMPOSERS_EPOCHS[c.name.toLowerCase()] ||
            FAMOUS_COMPOSERS_EPOCHS[c.fullName.toLowerCase()])
      );

      if (famousCorrections.length > 0) {
        console.log('⭐ COMPOSITORES FAMOSOS CLASSIFICADOS INCORRETAMENTE:');
        famousCorrections.forEach((composer, index) => {
          const birthInfo = composer.birthDate
            ? ` (${composer.birthDate})`
            : '';
          console.log(`${index + 1}. ${composer.fullName}${birthInfo}`);
          console.log(
            `   Atual: ${composer.currentEpochName} → Correto: ${composer.correctEpochName}`
          );
          console.log(
            `   Obras: ${composer.worksCount} | Razão: ${composer.reason}\n`
          );
        });
      }

      // Confirmar se deve aplicar as correções
      const rl = createReadlineInterface();

      const answer = await askQuestion(
        rl,
        `🚀 Aplicar ${corrections.length} correções? (s/N): `
      );

      rl.close();

      if (answer.toLowerCase() === 's' || answer.toLowerCase() === 'sim') {
        console.log('\n🔄 Aplicando correções...\n');

        let successCount = 0;
        let errorCount = 0;

        for (const correction of corrections) {
          try {
            await prisma.composer.update({
              where: { id: correction.id },
              data: { epochId: correction.correctEpochId },
            });

            successCount++;
            console.log(
              `✅ ${successCount}/${corrections.length}: ${correction.name} → ${correction.correctEpochName}`
            );
          } catch (error) {
            errorCount++;
            const errorMessage =
              error instanceof Error ? error.message : 'Erro desconhecido';
            console.log(
              `❌ Erro ao atualizar "${correction.name}": ${errorMessage}`
            );
          }
        }

        console.log(`\n🎉 CONCLUSÃO:`);
        console.log(`- ✅ Sucessos: ${successCount}`);
        console.log(`- ❌ Erros: ${errorCount}`);
        console.log(`- 📊 Total processado: ${corrections.length}\n`);

        // Verificação final
        console.log('🔍 Nova distribuição por épocas:\n');

        const finalComposers = await prisma.composer.findMany({
          select: {
            epochId: true,
            _count: {
              select: {
                works: true,
              },
            },
          },
          orderBy: {
            works: {
              _count: 'desc',
            },
          },
          take: 300,
        });

        const finalCounts: Record<string, number> = {};
        for (const composer of finalComposers) {
          const epochName = getEpochNameById(composer.epochId);
          finalCounts[epochName] = (finalCounts[epochName] || 0) + 1;
        }

        Object.entries(finalCounts)
          .sort(([, a], [, b]) => b - a)
          .forEach(([epoch, count]) => {
            console.log(`- ${epoch}: ${count} compositores`);
          });
      } else {
        console.log('\n⏸️ Operação cancelada pelo usuário.\n');
      }
    } else {
      console.log(
        '\n✨ Nenhuma correção necessária! Todos os compositores famosos estão nas épocas corretas.\n'
      );
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('❌ Erro durante a execução:', errorMessage);
  } finally {
    await prisma.$disconnect();
  }
}

// Função principal
async function main(): Promise<void> {
  console.log('🎼 CORRETOR DE ÉPOCAS DOS COMPOSITORES FAMOSOS\n');
  console.log('Este script irá:');
  console.log('1. Analisar os 300 compositores com mais obras');
  console.log('2. Verificar se estão na época correta baseado em:');
  console.log('   • Lista de compositores famosos conhecidos');
  console.log('   • Datas de nascimento/morte');
  console.log('   • Período produtivo estimado');
  console.log('3. Aplicar correções necessárias\n');

  await analyzeAndFixFamousComposersEpochs();
}

// Executar script
if (require.main === module) {
  main().catch((error) => {
    const errorMessage =
      error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('❌ Erro fatal:', errorMessage);
    process.exit(1);
  });
}

export {
  analyzeAndFixFamousComposersEpochs,
  getCorrectEpoch,
  extractYear,
  FAMOUS_COMPOSERS_EPOCHS,
  EPOCHS,
  type ComposerData,
  type ComposerCorrection,
  type EpochInfo,
};
