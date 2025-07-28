// // scripts/fix-famous-works-subtitles.ts

// import { PrismaClient } from '@prisma/client';
// import fs from 'fs/promises';
// import path from 'path';

// const prisma = new PrismaClient();

// interface WorkToFix {
//   id: string;
//   title: string;
//   currentSubtitle: string | null;
//   composerName: string;
//   opOrCatalog: string | null;
//   newSubtitle: string;
//   matchedBy: string; // Como foi identificada a peça
// }

// interface FamousWorkPattern {
//   composer: string; // Nome do compositor (sobrenome)
//   patterns: string[]; // Padrões para identificar no título
//   opus?: string; // Número de opus (opcional)
//   catalog?: string; // Número de catálogo (K, BWV, etc.)
//   subtitles: string[]; // Subtítulos a serem adicionados
//   priority: number; // Prioridade (obras mais famosas têm prioridade maior)
// }

// class FamousWorksSubtitleFixer {
//   // Base de dados COMPLETA de peças famosas
//   private famousWorks: FamousWorkPattern[] = [
//     // === LUDWIG VAN BEETHOVEN ===
//     {
//       composer: 'Beethoven',
//       patterns: [
//         'Symphony No.5',
//         'Symphony No. 5',
//         'Sinfonia No.5',
//         'Sinfonia n.5',
//       ],
//       opus: 'Op.67',
//       subtitles: [
//         'Sinfonia do Destino',
//         'Fate Symphony',
//         'Destiny Symphony',
//         'Symphony of Fate',
//       ],
//       priority: 100,
//     },
//     {
//       composer: 'Beethoven',
//       patterns: [
//         'Symphony No.9',
//         'Symphony No. 9',
//         'Sinfonia No.9',
//         'Sinfonia n.9',
//       ],
//       opus: 'Op.125',
//       subtitles: ['Coral', 'Choral', 'Ode to Joy', 'Ode à Alegria'],
//       priority: 100,
//     },
//     {
//       composer: 'Beethoven',
//       patterns: ['Symphony No.6', 'Symphony No. 6', 'Sinfonia No.6'],
//       opus: 'Op.68',
//       subtitles: ['Pastoral', 'Pastorale', 'Sinfonia Pastoral'],
//       priority: 95,
//     },
//     {
//       composer: 'Beethoven',
//       patterns: ['Symphony No.3', 'Symphony No. 3', 'Sinfonia No.3'],
//       opus: 'Op.55',
//       subtitles: ['Eroica', 'Heroica'],
//       priority: 90,
//     },
//     {
//       composer: 'Beethoven',
//       patterns: [
//         'Piano Sonata No.14',
//         'Sonata para Piano No.14',
//         'Piano Sonata No. 14',
//       ],
//       opus: 'Op.27',
//       subtitles: ['Moonlight Sonata', 'Sonata ao Luar', 'Sonata Claro de Luna'],
//       priority: 100,
//     },
//     {
//       composer: 'Beethoven',
//       patterns: [
//         'Piano Sonata No.8',
//         'Sonata para Piano No.8',
//         'Piano Sonata No. 8',
//       ],
//       opus: 'Op.13',
//       subtitles: ['Pathétique', 'Patética', 'Pathétique Sonata'],
//       priority: 95,
//     },
//     {
//       composer: 'Beethoven',
//       patterns: [
//         'Piano Sonata No.23',
//         'Sonata para Piano No.23',
//         'Piano Sonata No. 23',
//       ],
//       opus: 'Op.57',
//       subtitles: ['Appassionata', 'Apaixonada'],
//       priority: 90,
//     },
//     {
//       composer: 'Beethoven',
//       patterns: [
//         'Piano Concerto No.5',
//         'Concerto para Piano No.5',
//         'Piano Concerto No. 5',
//       ],
//       opus: 'Op.73',
//       subtitles: ['Emperor', 'Imperador'],
//       priority: 90,
//     },
//     {
//       composer: 'Beethoven',
//       patterns: ['Violin Concerto', 'Concerto para Violino'],
//       opus: 'Op.61',
//       subtitles: [
//         'Beethoven Violin Concerto',
//         'Concerto para Violino em Ré maior',
//       ],
//       priority: 85,
//     },
//     {
//       composer: 'Beethoven',
//       patterns: ['Für Elise', 'Para Elisa', 'Bagatelle'],
//       catalog: 'WoO 59',
//       subtitles: ['Bagatelle', 'Para Elisa', 'Für Elise'],
//       priority: 100,
//     },

//     // === WOLFGANG AMADEUS MOZART ===
//     {
//       composer: 'Mozart',
//       patterns: [
//         'Piano Sonata No.16',
//         'Piano Sonata No. 16',
//         'Sonata para Piano No.16',
//       ],
//       catalog: 'K.545',
//       subtitles: [
//         'Sonata Facile',
//         'Sonata Fácil',
//         'Easy Sonata',
//         'Sonata for Beginners',
//       ],
//       priority: 95,
//     },
//     {
//       composer: 'Mozart',
//       patterns: [
//         'Piano Sonata No.11',
//         'Piano Sonata No. 11',
//         'Sonata para Piano No.11',
//       ],
//       catalog: 'K.331',
//       subtitles: ['Turkish March Sonata', 'Sonata da Marcha Turca'],
//       priority: 90,
//     },
//     {
//       composer: 'Mozart',
//       patterns: ['Symphony No.40', 'Symphony No. 40', 'Sinfonia No.40'],
//       catalog: 'K.550',
//       subtitles: ['Great G minor Symphony', 'Grande Sinfonia em Sol menor'],
//       priority: 95,
//     },
//     {
//       composer: 'Mozart',
//       patterns: ['Symphony No.41', 'Symphony No. 41', 'Sinfonia No.41'],
//       catalog: 'K.551',
//       subtitles: ['Jupiter', 'Júpiter'],
//       priority: 95,
//     },
//     {
//       composer: 'Mozart',
//       patterns: ['Requiem', 'Réquiem'],
//       catalog: 'K.626',
//       subtitles: ['Requiem Mass', 'Missa de Réquiem', 'Mozart Requiem'],
//       priority: 100,
//     },
//     {
//       composer: 'Mozart',
//       patterns: [
//         'Piano Concerto No.21',
//         'Concerto para Piano No.21',
//         'Piano Concerto No. 21',
//       ],
//       catalog: 'K.467',
//       subtitles: [
//         'Elvira Madigan',
//         'Concerto Elvira Madigan',
//         'Elvira Madigan Theme',
//       ],
//       priority: 85,
//     },
//     {
//       composer: 'Mozart',
//       patterns: ['Eine kleine Nachtmusik', 'Uma Pequena Serenata Noturna'],
//       catalog: 'K.525',
//       subtitles: [
//         'Serenade No.13',
//         'Serenata No.13',
//         'Little Night Music',
//         'Pequena Serenata Noturna',
//         'A Little Night Music',
//       ],
//       priority: 100,
//     },
//     {
//       composer: 'Mozart',
//       patterns: ['Lacrimosa'],
//       catalog: 'K.626',
//       subtitles: ['Lacrimosa', 'Lacrimosa (from Requiem)'],
//       priority: 80,
//     },

//     // === FRÉDÉRIC CHOPIN ===
//     {
//       composer: 'Chopin',
//       patterns: ['Minute Waltz', 'Valsa do Minuto', 'Waltz in D-flat major'],
//       opus: 'Op.64',
//       subtitles: [
//         'Waltz in D-flat major',
//         'Valsa em Ré bemol maior',
//         'Valsa do Cãozinho',
//         'Minute Waltz',
//       ],
//       priority: 95,
//     },
//     {
//       composer: 'Chopin',
//       patterns: ['Funeral March', 'Marcha Fúnebre'],
//       opus: 'Op.35',
//       subtitles: [
//         'Piano Sonata No.2',
//         'Sonata No.2 para Piano',
//         'Funeral March',
//       ],
//       priority: 90,
//     },
//     {
//       composer: 'Chopin',
//       patterns: [
//         'Revolutionary Étude',
//         'Estudo Revolucionário',
//         'Étude in C minor',
//       ],
//       opus: 'Op.10',
//       subtitles: [
//         'Étude Op.10 No.12',
//         'Estudo Op.10 No.12',
//         'Revolutionary Étude',
//         'Estudo Revolucionário',
//       ],
//       priority: 85,
//     },
//     {
//       composer: 'Chopin',
//       patterns: [
//         'Raindrop Prelude',
//         'Prelúdio da Gota',
//         'Prelude in D-flat major',
//       ],
//       opus: 'Op.28',
//       subtitles: [
//         'Prelude No.15',
//         'Prelúdio No.15',
//         'Raindrop Prelude',
//         'Prelúdio da Gota',
//         'Prelúdio da Chuva',
//       ],
//       priority: 80,
//     },
//     {
//       composer: 'Chopin',
//       patterns: ['Winter Wind', 'Vento de Inverno'],
//       opus: 'Op.25',
//       subtitles: [
//         'Étude Op.25 No.11',
//         'Estudo Op.25 No.11',
//         'Winter Wind',
//         'Vento de Inverno',
//       ],
//       priority: 75,
//     },
//     {
//       composer: 'Chopin',
//       patterns: ['Ocean Étude', 'Estudo do Oceano'],
//       opus: 'Op.25',
//       subtitles: [
//         'Étude Op.25 No.12',
//         'Estudo Op.25 No.12',
//         'Ocean Étude',
//         'Estudo do Oceano',
//       ],
//       priority: 75,
//     },
//     {
//       composer: 'Chopin',
//       patterns: ['Tristesse', 'Estudo da Tristeza', 'Étude in E major'],
//       opus: 'Op.10',
//       subtitles: ['Tristesse', 'Estudo da Tristeza', 'Étude Op.10 No.3'],
//       priority: 80,
//     },
//     {
//       composer: 'Chopin',
//       patterns: [
//         'Heroic Polonaise',
//         'Polonaise Heroica',
//         'Polonaise in A-flat major',
//       ],
//       opus: 'Op.53',
//       subtitles: ['Heroic Polonaise', 'Polonaise Heroica', 'Polonaise Op.53'],
//       priority: 85,
//     },
//     {
//       composer: 'Chopin',
//       patterns: ['Nocturne in E-flat major', 'Noturno em Mi bemol maior'],
//       opus: 'Op.9',
//       subtitles: [
//         'Nocturne Op.9 No.2',
//         'Noturno em Mi bemol maior',
//         'Famous Nocturne',
//       ],
//       priority: 90,
//     },

//     // === JOHANN SEBASTIAN BACH ===
//     {
//       composer: 'Bach',
//       patterns: ['Brandenburg Concerto', 'Concerto de Brandenburg'],
//       catalog: 'BWV 1046',
//       subtitles: ['Brandenburg Concertos', 'Concertos de Brandenburg'],
//       priority: 95,
//     },
//     {
//       composer: 'Bach',
//       patterns: [
//         'The Well-Tempered Clavier',
//         'O Cravo Bem Temperado',
//         'Prelude No. 1 in C major',
//       ],
//       catalog: 'BWV 846',
//       subtitles: [
//         '48 Preludes and Fugues',
//         '48 Prelúdios e Fugas',
//         'Prelúdio em Dó maior',
//         'Prelúdio do Cravo Bem Temperado',
//       ],
//       priority: 90,
//     },
//     {
//       composer: 'Bach',
//       patterns: ['Goldberg Variations', 'Variações Goldberg'],
//       catalog: 'BWV 988',
//       subtitles: [
//         'Aria with Diverse Variations',
//         'Aria com Variações Diversas',
//         'Variações Goldberg – Ária',
//       ],
//       priority: 90,
//     },
//     {
//       composer: 'Bach',
//       patterns: ['Toccata and Fugue', 'Tocata e Fuga'],
//       catalog: 'BWV 565',
//       subtitles: [
//         'Toccata and Fugue in D minor',
//         'Tocata e Fuga em Ré menor',
//         'Toccata em Ré menor',
//       ],
//       priority: 95,
//     },
//     {
//       composer: 'Bach',
//       patterns: ['Air on the G String', 'Ária na Corda Sol'],
//       catalog: 'BWV 1068',
//       subtitles: [
//         'Air from Orchestral Suite No.3',
//         'Ária da Suíte Orquestral No.3',
//         'Ária na Corda Sol',
//       ],
//       priority: 95,
//     },
//     {
//       composer: 'Bach',
//       patterns: ["Jesu, Joy of Man's Desiring", 'Jesus, Alegria dos Homens'],
//       catalog: 'BWV 147',
//       subtitles: [
//         'Chorale from Cantata 147',
//         'Coral da Cantata 147',
//         'Jesus, Alegria dos Homens',
//       ],
//       priority: 90,
//     },

//     // === CLAUDE DEBUSSY ===
//     {
//       composer: 'Debussy',
//       patterns: [
//         'Clair de Lune',
//         'Claro de Luna',
//         'Clare de Lune',
//         'Claro de Lua',
//       ],
//       catalog: 'L.75',
//       subtitles: [
//         'Suite Bergamasque',
//         'Suíte Bergamasque',
//         'Clair de lune',
//         'Clare de Lune',
//         'Claro de Lua',
//       ],
//       priority: 100,
//     },
//     {
//       composer: 'Debussy',
//       patterns: ['La Mer', 'O Mar'],
//       catalog: 'L.109',
//       subtitles: ['The Sea', 'Três Esboços Sinfônicos'],
//       priority: 85,
//     },
//     {
//       composer: 'Debussy',
//       patterns: [
//         "Prélude à l'après-midi d'un faune",
//         'Prelúdio à Tarde de um Fauno',
//       ],
//       catalog: 'L.86',
//       subtitles: [
//         'Prelude to the Afternoon of a Faun',
//         'Prelúdio à Tarde de um Fauno',
//       ],
//       priority: 85,
//     },
//     {
//       composer: 'Debussy',
//       patterns: ['Arabesque No. 1', 'Arabesque'],
//       catalog: 'L.66',
//       subtitles: ['Arabesque', 'First Arabesque', 'Primeira Arabesque'],
//       priority: 80,
//     },
//     {
//       composer: 'Debussy',
//       patterns: [
//         'La fille aux cheveux de lin',
//         'A Menina dos Cabelos de Linho',
//       ],
//       catalog: 'L.117',
//       subtitles: [
//         'The Girl with the Flaxen Hair',
//         'A Menina dos Cabelos de Linho',
//       ],
//       priority: 75,
//     },
//     {
//       composer: 'Debussy',
//       patterns: ["Golliwogg's Cakewalk", 'Cakewalk de Golliwogg'],
//       catalog: 'L.113',
//       subtitles: ["Children's Corner", 'Cakewalk de Golliwogg'],
//       priority: 70,
//     },
//     {
//       composer: 'Debussy',
//       patterns: ["L'isle joyeuse", 'A Ilha Alegre'],
//       catalog: 'L.106',
//       subtitles: ['The Isle of Joy', 'A Ilha Alegre'],
//       priority: 70,
//     },

//     // === ERIK SATIE ===
//     {
//       composer: 'Satie',
//       patterns: ['Gymnopédie', 'Gymnopédie No. 1', 'Primeira Gymnopédie'],
//       subtitles: [
//         'Trois Gymnopédies',
//         'Três Gymnopédies',
//         'Gymnopédie',
//         'Primeira Gymnopédie',
//       ],
//       priority: 85,
//     },
//     {
//       composer: 'Satie',
//       patterns: ['Gnossienne', 'Gnossienne No. 1'],
//       subtitles: ['Gnossienne', 'First Gnossienne', 'Primeira Gnossienne'],
//       priority: 75,
//     },

//     // === ROBERT SCHUMANN ===
//     {
//       composer: 'Schumann',
//       patterns: ['Carnaval', 'Carnaval'],
//       opus: 'Op.9',
//       subtitles: ['Scènes mignonnes', 'Cenas Mignonnes'],
//       priority: 85,
//     },
//     {
//       composer: 'Schumann',
//       patterns: ['Kinderszenen', 'Cenas Infantis', 'Träumerei', 'Devaneio'],
//       opus: 'Op.15',
//       subtitles: [
//         'Scenes from Childhood',
//         'Cenas da Infância',
//         'Träumerei',
//         'Devaneio',
//         'Dreaming',
//       ],
//       priority: 85,
//     },

//     // === FRANZ LISZT ===
//     {
//       composer: 'Liszt',
//       patterns: ['Liebestraum', 'Sonho de Amor', 'Liebesträume No. 3'],
//       catalog: 'S.541',
//       subtitles: ['Love Dream', 'Sonhos de Amor', 'Sonho de Amor'],
//       priority: 90,
//     },
//     {
//       composer: 'Liszt',
//       patterns: ['Hungarian Rhapsody', 'Rapsódia Húngara'],
//       catalog: 'S.244',
//       subtitles: [
//         'Hungarian Rhapsodies',
//         'Rapsódias Húngaras',
//         'Rapsódia Húngara Nº 2',
//       ],
//       priority: 85,
//     },
//     {
//       composer: 'Liszt',
//       patterns: ['La Campanella', 'La Campanella', 'O Sino Pequeno'],
//       catalog: 'S.141',
//       subtitles: [
//         'The Little Bell',
//         'O Sininho',
//         'La Campanella',
//         'O Sino Pequeno',
//       ],
//       priority: 85,
//     },
//     {
//       composer: 'Liszt',
//       patterns: ['Mephisto Waltz', 'Valsa Mephisto'],
//       catalog: 'S.514',
//       subtitles: ['Mephisto Waltz No. 1', 'Valsa Mephisto'],
//       priority: 75,
//     },
//     {
//       composer: 'Liszt',
//       patterns: ['Funérailles'],
//       catalog: 'S.173',
//       subtitles: ['Funérailles', 'Harmonies poétiques et religieuses'],
//       priority: 70,
//     },

//     // === FRANZ SCHUBERT ===
//     {
//       composer: 'Schubert',
//       patterns: ['Symphony No.8', 'Sinfonia No.8'],
//       catalog: 'D.759',
//       subtitles: ['Unfinished', 'Inacabada'],
//       priority: 95,
//     },
//     {
//       composer: 'Schubert',
//       patterns: ['Ave Maria', 'Ave Maria'],
//       opus: 'Op.52',
//       subtitles: ['Schubert Ave Maria', 'Ave Maria de Schubert'],
//       priority: 100,
//     },
//     {
//       composer: 'Schubert',
//       patterns: ['Trout Quintet', 'Quinteto da Truta'],
//       catalog: 'D.667',
//       subtitles: ['Piano Quintet', 'Quinteto para Piano'],
//       priority: 85,
//     },
//     {
//       composer: 'Schubert',
//       patterns: ['Death and the Maiden', 'A Morte e a Donzela'],
//       catalog: 'D.810',
//       subtitles: ['String Quartet No.14', 'Quarteto de Cordas No.14'],
//       priority: 80,
//     },
//     {
//       composer: 'Schubert',
//       patterns: ['Impromptu in G-flat major', 'Impromptu'],
//       opus: 'Op.90',
//       subtitles: ['Impromptu G-flat major', 'Impromptu Op.90 No.3'],
//       priority: 75,
//     },

//     // === JOHANNES BRAHMS ===
//     {
//       composer: 'Brahms',
//       patterns: ['Hungarian Dance', 'Dança Húngara'],
//       catalog: 'WoO 1',
//       subtitles: ['Hungarian Dances', 'Danças Húngaras', 'Dança Húngara Nº 5'],
//       priority: 90,
//     },
//     {
//       composer: 'Brahms',
//       patterns: ['Symphony No.1', 'Sinfonia No.1'],
//       opus: 'Op.68',
//       subtitles: ["Beethoven's 10th", 'A 10ª de Beethoven'],
//       priority: 85,
//     },
//     {
//       composer: 'Brahms',
//       patterns: ['Lullaby', 'Canção de Ninar'],
//       opus: 'Op.49',
//       subtitles: ["Brahms' Lullaby", 'Canção de Ninar de Brahms', 'Wiegenlied'],
//       priority: 95,
//     },
//     {
//       composer: 'Brahms',
//       patterns: ['Waltz in A-flat major', 'Valsa de Brahms'],
//       opus: 'Op.39',
//       subtitles: ['Waltz Op.39 No.15', 'Valsa de Brahms'],
//       priority: 70,
//     },

//     // === FELIX MENDELSSOHN ===
//     {
//       composer: 'Mendelssohn',
//       patterns: ['Wedding March', 'Marcha Nupcial'],
//       opus: 'Op.61',
//       subtitles: [
//         "A Midsummer Night's Dream",
//         'Sonho de uma Noite de Verão',
//         'Marcha Nupcial (de Mendelssohn)',
//       ],
//       priority: 95,
//     },
//     {
//       composer: 'Mendelssohn',
//       patterns: ['Violin Concerto', 'Concerto para Violino'],
//       opus: 'Op.64',
//       subtitles: [
//         'Mendelssohn Violin Concerto',
//         'Concerto para Violino de Mendelssohn',
//       ],
//       priority: 90,
//     },
//     {
//       composer: 'Mendelssohn',
//       patterns: ['Songs Without Words', 'Spring Song', 'Canção da Primavera'],
//       opus: 'Op.62',
//       subtitles: ['Spring Song', 'Canção da Primavera', 'Songs Without Words'],
//       priority: 75,
//     },

//     // === PYOTR ILYICH TCHAIKOVSKY ===
//     {
//       composer: 'Tchaikovsky',
//       patterns: ['Symphony No.6', 'Sinfonia No.6'],
//       opus: 'Op.74',
//       subtitles: ['Pathétique', 'Patética'],
//       priority: 95,
//     },
//     {
//       composer: 'Tchaikovsky',
//       patterns: ['1812 Overture', 'Abertura 1812'],
//       opus: 'Op.49',
//       subtitles: ['Festival Overture', 'Abertura Festival', 'Abertura 1812'],
//       priority: 90,
//     },
//     {
//       composer: 'Tchaikovsky',
//       patterns: ['Swan Lake', 'O Lago dos Cisnes', 'Lago dos Cisnes'],
//       opus: 'Op.20',
//       subtitles: ['Ballet', 'Balé', 'O Lago dos Cisnes', 'Lago dos Cisnes'],
//       priority: 100,
//     },
//     {
//       composer: 'Tchaikovsky',
//       patterns: [
//         'The Nutcracker',
//         'O Quebra-Nozes',
//         'Dance of the Sugar Plum Fairy',
//         'Dança da Fada Açucarada',
//       ],
//       opus: 'Op.71',
//       subtitles: [
//         'Ballet',
//         'Balé',
//         'O Quebra-Nozes',
//         'Dança da Fada Açucarada',
//       ],
//       priority: 100,
//     },
//     {
//       composer: 'Tchaikovsky',
//       patterns: ['Piano Concerto No.1', 'Concerto para Piano No.1'],
//       opus: 'Op.23',
//       subtitles: [
//         'Tchaikovsky Piano Concerto',
//         'Concerto para Piano de Tchaikovsky',
//       ],
//       priority: 95,
//     },

//     // === EDVARD GRIEG ===
//     {
//       composer: 'Grieg',
//       patterns: [
//         'Peer Gynt Suite',
//         'Suíte Peer Gynt',
//         'In the Hall of the Mountain King',
//         'Na Gruta do Rei da Montanha',
//       ],
//       opus: 'Op.46',
//       subtitles: [
//         'In the Hall of the Mountain King',
//         'No Palácio do Rei da Montanha',
//         'Na Gruta do Rei da Montanha',
//       ],
//       priority: 95,
//     },
//     {
//       composer: 'Grieg',
//       patterns: ['Piano Concerto', 'Concerto para Piano'],
//       opus: 'Op.16',
//       subtitles: ['Grieg Piano Concerto', 'Concerto para Piano de Grieg'],
//       priority: 90,
//     },
//     {
//       composer: 'Grieg',
//       patterns: ['Morning Mood', 'Manhã'],
//       opus: 'Op.46',
//       subtitles: ['Morning Mood', 'Manhã', 'Peer Gynt Suite No. 1'],
//       priority: 85,
//     },
//     {
//       composer: 'Grieg',
//       patterns: ['Arietta'],
//       opus: 'Op.12',
//       subtitles: ['Lyric Pieces', 'Arietta'],
//       priority: 70,
//     },

//     // === SERGEI RACHMANINOFF ===
//     {
//       composer: 'Rachmaninoff',
//       patterns: ['Piano Concerto No.2', 'Concerto para Piano No.2'],
//       opus: 'Op.18',
//       subtitles: [
//         'Rachmaninoff Piano Concerto No.2',
//         'Concerto para Piano No.2 de Rachmaninoff',
//       ],
//       priority: 95,
//     },
//     {
//       composer: 'Rachmaninoff',
//       patterns: ['Prelude in C-sharp minor', 'Prelúdio em Dó sustenido menor'],
//       opus: 'Op.3',
//       subtitles: [
//         'The Bells of Moscow',
//         'Os Sinos de Moscou',
//         'Prelúdio dramático',
//       ],
//       priority: 90,
//     },
//     {
//       composer: 'Rachmaninoff',
//       patterns: [
//         'Rhapsody on a Theme of Paganini',
//         'Rapsódia sobre um Tema de Paganini',
//       ],
//       opus: 'Op.43',
//       subtitles: ['Paganini Rhapsody', 'Rapsódia Paganini'],
//       priority: 85,
//     },
//     {
//       composer: 'Rachmaninoff',
//       patterns: ['Vocalise'],
//       opus: 'Op.34',
//       subtitles: ['Vocalise', 'Rachmaninoff Vocalise'],
//       priority: 80,
//     },

//     // === MAURICE RAVEL ===
//     {
//       composer: 'Ravel',
//       patterns: ['Boléro', 'Bolero'],
//       catalog: 'M.81',
//       subtitles: ['Ravel Boléro', 'Bolero de Ravel'],
//       priority: 100,
//     },
//     {
//       composer: 'Ravel',
//       patterns: [
//         'Pavane for a Dead Princess',
//         'Pavana para uma Infanta Defunta',
//         'Pavane pour une infante défunte',
//       ],
//       catalog: 'M.19',
//       subtitles: [
//         'Pavane pour une infante défunte',
//         'Pavana para uma Princesa Morta',
//         'Pavana para uma Infanta Defunta',
//       ],
//       priority: 85,
//     },
//     {
//       composer: 'Ravel',
//       patterns: ['Gaspard de la nuit', 'Ondine', 'Scarbo'],
//       catalog: 'M.55',
//       subtitles: ['Ondina', 'Scarbo', 'Gaspard de la nuit'],
//       priority: 75,
//     },
//     {
//       composer: 'Ravel',
//       patterns: ['Le tombeau de Couperin', 'Rigaudon'],
//       catalog: 'M.68',
//       subtitles: ['Túmulo de Couperin', 'Le tombeau de Couperin'],
//       priority: 70,
//     },

//     // === ANTONIO VIVALDI ===
//     {
//       composer: 'Vivaldi',
//       patterns: [
//         'The Four Seasons',
//         'As Quatro Estações',
//         'Spring',
//         'La Primavera',
//         'Winter',
//         "L'Inverno",
//       ],
//       opus: 'Op.8',
//       subtitles: [
//         'Le quattro stagioni',
//         'Quatro Estações',
//         'As Quatro Estações: Primavera',
//         'As Quatro Estações: Inverno',
//       ],
//       priority: 100,
//     },

//     // === GEORGE FRIDERIC HANDEL ===
//     {
//       composer: 'Handel',
//       patterns: ['Messiah', 'Messias', 'Hallelujah Chorus', 'Aleluia'],
//       catalog: 'HWV 56',
//       subtitles: ['Hallelujah Chorus', 'Coro Aleluia', 'Aleluia do Messias'],
//       priority: 95,
//     },
//     {
//       composer: 'Handel',
//       patterns: ['Water Music', 'Música Aquática'],
//       catalog: 'HWV 348',
//       subtitles: ['Suite for Orchestra', 'Suíte para Orquestra'],
//       priority: 85,
//     },

//     // === JOHANN PACHELBEL ===
//     {
//       composer: 'Pachelbel',
//       patterns: ['Canon in D', 'Canon de Pachelbel', 'Canon'],
//       subtitles: ['Canon de Pachelbel', 'Canon in D major'],
//       priority: 95,
//     },

//     // === ISAAC ALBÉNIZ ===
//     {
//       composer: 'Albéniz',
//       patterns: ['Asturias', 'Leyenda', 'Suite Española'],
//       subtitles: [
//         'Asturias (Leyenda)',
//         'Astúrias – Lenda',
//         'Suite Española No. 5',
//       ],
//       priority: 80,
//     },

//     // === MODEST MUSSORGSKY ===
//     {
//       composer: 'Mussorgsky',
//       patterns: [
//         'Pictures at an Exhibition',
//         'Quadros de uma Exposição',
//         'Night on Bald Mountain',
//         'Noite no Monte Calvo',
//       ],
//       subtitles: [
//         'Quadros de uma Exposição',
//         'Pictures at an Exhibition',
//         'Noite no Monte Calvo',
//         'Night on Bald Mountain',
//       ],
//       priority: 85,
//     },

//     // === CAMILLE SAINT-SAËNS ===
//     {
//       composer: 'Saint-Saëns',
//       patterns: [
//         'Carnival of the Animals',
//         'Carnaval dos Animais',
//         'The Swan',
//         'O Cisne',
//       ],
//       catalog: 'R.125',
//       subtitles: [
//         'Le carnaval des animaux',
//         'O Carnaval dos Bichos',
//         'O Cisne',
//       ],
//       priority: 90,
//     },
//     {
//       composer: 'Saint-Saëns',
//       patterns: ['Danse macabre', 'Dança Macabra'],
//       opus: 'Op.40',
//       subtitles: ['Dance of Death', 'Dança da Morte'],
//       priority: 80,
//     },

//     // === JEAN SIBELIUS ===
//     {
//       composer: 'Sibelius',
//       patterns: ['Finlandia', 'Finlândia'],
//       opus: 'Op.26',
//       subtitles: ['Tone Poem', 'Poema Sinfônico', 'Finlândia'],
//       priority: 90,
//     },

//     // === JOHANN STRAUSS II ===
//     {
//       composer: 'Strauss',
//       patterns: ['The Blue Danube', 'O Danúbio Azul'],
//       opus: 'Op.314',
//       subtitles: [
//         'Blue Danube Waltz',
//         'Valsa do Danúbio Azul',
//         'O Danúbio Azul',
//       ],
//       priority: 95,
//     },
//     {
//       composer: 'Strauss',
//       patterns: ['Tritsch-Tratsch-Polka', 'Polca do Fuxico'],
//       opus: 'Op.214',
//       subtitles: ['Polca do Fuxico', 'Tritsch-Tratsch-Polka'],
//       priority: 75,
//     },

//     // === GEORGES BIZET ===
//     {
//       composer: 'Bizet',
//       patterns: ['Carmen', 'Habanera', 'Toreador Song', 'Canção do Toureiro'],
//       catalog: 'WD 31',
//       subtitles: [
//         'Opera',
//         'Ópera',
//         "L'amour est un oiseau rebelle",
//         'Canção do Toureiro',
//       ],
//       priority: 100,
//     },

//     // === GIUSEPPE VERDI ===
//     {
//       composer: 'Verdi',
//       patterns: ['La traviata', 'A Traviata'],
//       subtitles: ['Opera', 'Ópera'],
//       priority: 95,
//     },
//     {
//       composer: 'Verdi',
//       patterns: ['Aida', 'Aída'],
//       subtitles: ['Opera', 'Ópera'],
//       priority: 95,
//     },
//     {
//       composer: 'Verdi',
//       patterns: ['Rigoletto', 'La Donna è Mobile'],
//       subtitles: ['Opera', 'Ópera', 'A mulher é volúvel'],
//       priority: 95,
//     },
//     {
//       composer: 'Verdi',
//       patterns: ['Dies Irae'],
//       subtitles: ['Requiem', 'Dia da Ira'],
//       priority: 85,
//     },

//     // === GIACOMO PUCCINI ===
//     {
//       composer: 'Puccini',
//       patterns: ['La bohème', 'A Boêmia'],
//       subtitles: ['Opera', 'Ópera'],
//       priority: 95,
//     },
//     {
//       composer: 'Puccini',
//       patterns: ['Tosca', 'Tosca'],
//       subtitles: ['Opera', 'Ópera'],
//       priority: 90,
//     },
//     {
//       composer: 'Puccini',
//       patterns: ['Madama Butterfly', 'Madame Butterfly'],
//       subtitles: ['Opera', 'Ópera'],
//       priority: 90,
//     },

//     // === RICHARD WAGNER ===
//     {
//       composer: 'Wagner',
//       patterns: ['Ride of the Valkyries', 'Cavalgada das Valquírias'],
//       subtitles: ['Die Walküre', 'A Valquíria', 'Cavalgada das Valquírias'],
//       priority: 95,
//     },
//     {
//       composer: 'Wagner',
//       patterns: ['Wedding March', 'Marcha Nupcial', 'Bridal Chorus'],
//       subtitles: ['Lohengrin', 'Here Comes the Bride', 'Marcha Nupcial'],
//       priority: 90,
//     },

//     // === GIOACHINO ROSSINI ===
//     {
//       composer: 'Rossini',
//       patterns: ['William Tell Overture', 'Abertura de Guilherme Tell'],
//       subtitles: [
//         'William Tell Overture: Finale',
//         'Abertura de Guilherme Tell',
//       ],
//       priority: 85,
//     },
//     {
//       composer: 'Rossini',
//       patterns: ['Barber of Seville', 'Largo al factotum', 'Fígaro'],
//       subtitles: ['Fígaro! Canção do Barbeiro', 'Barber of Seville'],
//       priority: 80,
//     },

//     // === EDWARD ELGAR ===
//     {
//       composer: 'Elgar',
//       patterns: ['Pomp and Circumstance', 'Marcha da Coroação'],
//       opus: 'Op.39',
//       subtitles: [
//         'Marcha da Coroação',
//         'Marcha Triunfal',
//         'Pomp and Circumstance March No. 1',
//       ],
//       priority: 85,
//     },

//     // === ANTONÍN DVOŘÁK ===
//     {
//       composer: 'Dvořák',
//       patterns: ['Symphony No.9', 'Sinfonia No.9'],
//       opus: 'Op.95',
//       subtitles: ['From the New World', 'Do Novo Mundo', 'New World Symphony'],
//       priority: 100,
//     },
//     {
//       composer: 'Dvořák',
//       patterns: ['Cello Concerto', 'Concerto para Violoncelo'],
//       opus: 'Op.104',
//       subtitles: [
//         'Dvořák Cello Concerto',
//         'Concerto para Violoncelo de Dvořák',
//       ],
//       priority: 90,
//     },

//     // === NIKOLAI RIMSKY-KORSAKOV ===
//     {
//       composer: 'Rimsky-Korsakov',
//       patterns: ['Flight of the Bumblebee', 'O Voo do Besouro'],
//       subtitles: ['Flight of the Bumblebee', 'O Voo do Besouro'],
//       priority: 85,
//     },

//     // === HENRY PURCELL ===
//     {
//       composer: 'Purcell',
//       patterns: ["Dido's Lament", 'Lamento de Dido'],
//       subtitles: ['Dido and Aeneas', 'Lamento de Dido'],
//       priority: 75,
//     },

//     // === ARCANGELO CORELLI ===
//     {
//       composer: 'Corelli',
//       patterns: ['Christmas Concerto', 'Concerto de Natal'],
//       opus: 'Op.6',
//       subtitles: ['Concerto Grosso Op. 6 No. 8', 'Concerto de Natal'],
//       priority: 75,
//     },

//     // === DOMENICO SCARLATTI ===
//     {
//       composer: 'Scarlatti',
//       patterns: ['Sonata in E major', 'Sonata K.380'],
//       catalog: 'K.380',
//       subtitles: ['Sonata K.380 de Scarlatti'],
//       priority: 70,
//     },

//     // === MANUEL DE FALLA ===
//     {
//       composer: 'Falla',
//       patterns: ['Ritual Fire Dance', 'Dança Ritual do Fogo'],
//       subtitles: ['Ritual Fire Dance', 'Dança Ritual do Fogo'],
//       priority: 75,
//     },

//     // === HEITOR VILLA-LOBOS ===
//     {
//       composer: 'Villa-Lobos',
//       patterns: ['Bachianas Brasileiras', 'Ária'],
//       subtitles: ['Bachianas Brasileiras No. 5', 'Ária das Bachianas nº 5'],
//       priority: 80,
//     },

//     // === ERNESTO NAZARETH ===
//     {
//       composer: 'Nazareth',
//       patterns: ['Odeon'],
//       subtitles: ['Odeon (tango brasileiro)', 'Tango brasileiro'],
//       priority: 70,
//     },

//     // === ENRIQUE GRANADOS ===
//     {
//       composer: 'Granados',
//       patterns: ['Quejas', 'la maja y el ruiseñor'],
//       subtitles: ['Lamentos, ou a moça e o rouxinol', 'Quejas'],
//       priority: 70,
//     },

//     // === BÉLA BARTÓK ===
//     {
//       composer: 'Bartók',
//       patterns: ['Romanian Folk Dances', 'Danças Folclóricas Romenas'],
//       subtitles: ['Romanian Folk Dances', 'Danças Folclóricas Romenas'],
//       priority: 75,
//     },

//     // === ALEXANDER SCRIABIN ===
//     {
//       composer: 'Scriabin',
//       patterns: ['Étude in D-sharp minor', 'Estudo Dramático'],
//       opus: 'Op.8',
//       subtitles: ['Estudo Dramático de Scriabin', 'Étude Op.8 No.12'],
//       priority: 70,
//     },

//     // === GEORGE GERSHWIN ===
//     {
//       composer: 'Gershwin',
//       patterns: ['Rhapsody in Blue', 'Rapsódia em Azul'],
//       subtitles: ['Rhapsody in Blue', 'Rapsódia em Azul'],
//       priority: 90,
//     },
//     {
//       composer: 'Gershwin',
//       patterns: ['Summertime'],
//       subtitles: ['Summertime', 'Porgy and Bess'],
//       priority: 85,
//     },

//     // === SAMUEL BARBER ===
//     {
//       composer: 'Barber',
//       patterns: ['Adagio for Strings', 'Adágio para Cordas'],
//       subtitles: ['Adagio for Strings', 'Adágio para Cordas'],
//       priority: 85,
//     },

//     // === PHILIP GLASS ===
//     {
//       composer: 'Glass',
//       patterns: ['Opening', 'Glassworks'],
//       subtitles: ['Opening (Glassworks)', 'Abertura (Glassworks)'],
//       priority: 70,
//     },

//     // === ARAM KHACHATURIAN ===
//     {
//       composer: 'Khachaturian',
//       patterns: ['Sabre Dance', 'Dança do Sabre'],
//       subtitles: ['Sabre Dance', 'Dança do Sabre'],
//       priority: 75,
//     },

//     // === ALEXANDER BORODIN ===
//     {
//       composer: 'Borodin',
//       patterns: ['Polovtsian Dances', 'Danças Polovetsianas'],
//       subtitles: ['Prince Igor', 'Danças Polovetsianas'],
//       priority: 75,
//     },

//     // === PAUL DUKAS ===
//     {
//       composer: 'Dukas',
//       patterns: ["The Sorcerer's Apprentice", 'O Aprendiz de Feiticeiro'],
//       subtitles: ["The Sorcerer's Apprentice", 'O Aprendiz de Feiticeiro'],
//       priority: 80,
//     },

//     // === OTTORINO RESPIGHI ===
//     {
//       composer: 'Respighi',
//       patterns: ['Pines of Rome', 'Os Pinheiros de Roma'],
//       subtitles: ['The Pines of the Appian Way', 'Os Pinheiros de Roma'],
//       priority: 75,
//     },

//     // === IGOR STRAVINSKY ===
//     {
//       composer: 'Stravinsky',
//       patterns: ['The Firebird', 'Pássaro de Fogo'],
//       subtitles: ['The Firebird: Finale', 'Pássaro de Fogo – Final'],
//       priority: 80,
//     },
//     {
//       composer: 'Stravinsky',
//       patterns: ['The Rite of Spring', 'A Sagração da Primavera'],
//       subtitles: [
//         'The Rite of Spring: Dance of the Earth',
//         'A Sagração da Primavera',
//       ],
//       priority: 85,
//     },

//     // === CÉSAR FRANCK ===
//     {
//       composer: 'Franck',
//       patterns: ['Panis Angelicus', 'Pão dos Anjos'],
//       subtitles: ['Panis Angelicus', 'Pão dos Anjos'],
//       priority: 75,
//     },

//     // === CHARLES GOUNOD ===
//     {
//       composer: 'Gounod',
//       patterns: ['Ave Maria'],
//       subtitles: ['Ave Maria de Gounod', 'Ave Maria (sobre prelúdio de Bach)'],
//       priority: 85,
//     },

//     // === ANTONIO SALIERI ===
//     {
//       composer: 'Salieri',
//       patterns: ['La Folia', 'Variations on La Folia'],
//       subtitles: ['26 Variations on La Folia di Spagna', 'La Folia'],
//       priority: 65,
//     },

//     // === DMITRI SHOSTAKOVICH ===
//     {
//       composer: 'Shostakovich',
//       patterns: ['Waltz No. 2', 'Valsa nº 2'],
//       subtitles: ['Jazz Suite No. 2', 'Valsa nº 2 de Shostakovich'],
//       priority: 75,
//     },

//     // === CARL ORFF ===
//     {
//       composer: 'Orff',
//       patterns: ['Carmina Burana', 'O Fortuna'],
//       subtitles: ['O Fortuna', 'Carmina Burana'],
//       priority: 85,
//     },

//     // === JULES MASSENET ===
//     {
//       composer: 'Massenet',
//       patterns: ['Méditation', 'Thaïs'],
//       subtitles: ['Méditation (from Thaïs)', 'Meditação de Thaïs'],
//       priority: 75,
//     },

//     // === AARON COPLAND ===
//     {
//       composer: 'Copland',
//       patterns: ['Fanfare for the Common Man', 'Fanfarra para o Homem Comum'],
//       subtitles: ['Fanfare', 'Fanfarra'],
//       priority: 80,
//     },
//   ];

//   // Normalizar texto para comparação
//   private normalizeText(text: string): string {
//     if (!text || typeof text !== 'string') {
//       return '';
//     }

//     try {
//       return (
//         text
//           .toLowerCase()
//           // Remover caracteres de controle e não imprimíveis primeiro
//           .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
//           .replace(/\uFEFF/g, '') // Remove BOM
//           // Normalizar acentos
//           .replace(/[àáâãäå]/g, 'a')
//           .replace(/[èéêë]/g, 'e')
//           .replace(/[ìíîï]/g, 'i')
//           .replace(/[òóôõö]/g, 'o')
//           .replace(/[ùúûü]/g, 'u')
//           .replace(/[ç]/g, 'c')
//           .replace(/[ñ]/g, 'n')
//           // Remover pontuação e caracteres especiais
//           .replace(/[^\w\s]/g, ' ')
//           // Normalizar espaços
//           .replace(/\s+/g, ' ')
//           .trim()
//       );
//     } catch (error: any) {
//       console.warn(`⚠️ Erro ao normalizar texto "${text}": ${error.message}`);
//       return '';
//     }
//   }

//   // Verificar se uma obra corresponde a um padrão famoso
//   private matchesFamousWork(
//     work: any,
//     pattern: FamousWorkPattern
//   ): { matches: boolean; matchedBy: string } {
//     try {
//       const workTitle = this.normalizeText(work.title || '');
//       const composerName = this.normalizeText(work.composer?.name || '');
//       const opOrCatalog = work.opOrCatalog || '';

//       // Verificar se o compositor corresponde
//       const normalizedPatternComposer = this.normalizeText(pattern.composer);
//       if (!composerName.includes(normalizedPatternComposer)) {
//         return { matches: false, matchedBy: '' };
//       }

//       // Verificar padrões no título
//       for (const titlePattern of pattern.patterns) {
//         const normalizedPattern = this.normalizeText(titlePattern);
//         if (workTitle.includes(normalizedPattern)) {
//           let matchedBy = `title: "${titlePattern}"`;

//           // Verificar opus/catálogo se especificado
//           if (pattern.opus && opOrCatalog.includes(pattern.opus)) {
//             matchedBy += ` + opus: "${pattern.opus}"`;
//           } else if (pattern.catalog && opOrCatalog.includes(pattern.catalog)) {
//             matchedBy += ` + catalog: "${pattern.catalog}"`;
//           }

//           return { matches: true, matchedBy };
//         }
//       }

//       // Se não encontrou por título, verificar apenas por opus/catálogo (para casos específicos)
//       if (pattern.opus && opOrCatalog.includes(pattern.opus)) {
//         return { matches: true, matchedBy: `opus: "${pattern.opus}"` };
//       }
//       if (pattern.catalog && opOrCatalog.includes(pattern.catalog)) {
//         return { matches: true, matchedBy: `catalog: "${pattern.catalog}"` };
//       }

//       return { matches: false, matchedBy: '' };
//     } catch (error: any) {
//       console.warn(
//         `⚠️ Erro ao verificar padrão para obra ${work?.id}: ${error.message}`
//       );
//       return { matches: false, matchedBy: '' };
//     }
//   }

//   // Buscar todas as obras que podem receber subtítulos
//   async findWorksToFix(): Promise<WorkToFix[]> {
//     try {
//       console.log('🔍 Buscando obras famosas para adicionar subtítulos...');

//       // Buscar works em lotes menores para evitar problemas de memória/corrupção
//       const BATCH_SIZE = 1000;
//       let allWorks: any[] = [];
//       let offset = 0;
//       let hasMore = true;

//       while (hasMore) {
//         try {
//           console.log(
//             `📊 Buscando lote ${
//               Math.floor(offset / BATCH_SIZE) + 1
//             } (offset: ${offset})...`
//           );

//           const batch = await prisma.work.findMany({
//             skip: offset,
//             take: BATCH_SIZE,
//             include: {
//               composer: {
//                 select: {
//                   name: true,
//                   fullName: true,
//                 },
//               },
//             },
//             orderBy: [{ composer: { name: 'asc' } }, { title: 'asc' }],
//           });

//           if (batch.length === 0) {
//             hasMore = false;
//           } else {
//             // Filtrar registros que podem ter dados corrompidos
//             const validBatch = batch.filter((work) => {
//               try {
//                 // Verificar se os campos principais são válidos
//                 return (
//                   work &&
//                   work.id &&
//                   work.title &&
//                   typeof work.title === 'string' &&
//                   work.title.length > 0 &&
//                   work.title.length < 1000
//                 ); // Evitar títulos excessivamente longos
//               } catch (error) {
//                 console.warn(`⚠️ Registro inválido encontrado: ${work?.id}`);
//                 return false;
//               }
//             });

//             allWorks.push(...validBatch);
//             offset += BATCH_SIZE;

//             // Parar se retornou menos que o esperado
//             if (batch.length < BATCH_SIZE) {
//               hasMore = false;
//             }
//           }
//         } catch (batchError: any) {
//           console.error(
//             `❌ Erro no lote offset ${offset}:`,
//             batchError.message
//           );

//           // Tentar buscar registros individuais neste lote para identificar o problema
//           try {
//             console.log('🔍 Tentando buscar registros individuais...');
//             const individualWorks = await this.findWorksIndividually(
//               offset,
//               BATCH_SIZE
//             );
//             allWorks.push(...individualWorks);
//           } catch (individualError) {
//             console.error(
//               `❌ Erro ao buscar registros individuais:`,
//               individualError
//             );
//           }

//           offset += BATCH_SIZE;

//           // Se muitos erros consecutivos, parar
//           if (offset > BATCH_SIZE * 10) {
//             console.error('❌ Muitos erros consecutivos, parando busca');
//             break;
//           }
//         }
//       }

//       console.log(`📊 Total de obras válidas encontradas: ${allWorks.length}`);

//       const worksToFix: WorkToFix[] = [];

//       for (const work of allWorks) {
//         try {
//           // Verificação adicional de segurança
//           if (!work || !work.title || !work.composer) {
//             continue;
//           }

//           // Normalizar campos para evitar problemas
//           const safeWork = {
//             ...work,
//             title: this.sanitizeString(work.title),
//             subtitle: work.subtitle ? this.sanitizeString(work.subtitle) : null,
//             opOrCatalog: work.opOrCatalog
//               ? this.sanitizeString(work.opOrCatalog)
//               : null,
//           };

//           // Verificar cada padrão de obra famosa
//           for (const pattern of this.famousWorks) {
//             const { matches, matchedBy } = this.matchesFamousWork(
//               safeWork,
//               pattern
//             );

//             if (matches) {
//               const newSubtitle = pattern.subtitles.join(', ');

//               // Só adicionar se não tem subtítulo ou se o atual é diferente
//               if (!safeWork.subtitle || safeWork.subtitle !== newSubtitle) {
//                 worksToFix.push({
//                   id: safeWork.id,
//                   title: safeWork.title,
//                   currentSubtitle: safeWork.subtitle,
//                   composerName: safeWork.composer?.fullName || 'Desconhecido',
//                   opOrCatalog: safeWork.opOrCatalog,
//                   newSubtitle: newSubtitle,
//                   matchedBy: matchedBy,
//                 });
//               }

//               // Parar na primeira correspondência para evitar duplicatas
//               break;
//             }
//           }
//         } catch (workError: any) {
//           console.warn(
//             `⚠️ Erro ao processar obra ${work?.id}: ${workError.message}`
//           );
//           continue;
//         }
//       }

//       return worksToFix;
//     } catch (error: any) {
//       console.error('❌ Erro ao buscar obras para correção:', error.message);
//       return [];
//     }
//   }

//   // Método auxiliar para buscar registros individuais quando há erro no lote
//   private async findWorksIndividually(
//     offset: number,
//     batchSize: number
//   ): Promise<any[]> {
//     const works: any[] = [];

//     for (let i = offset; i < offset + batchSize; i++) {
//       try {
//         const work = await prisma.work.findFirst({
//           skip: i,
//           take: 1,
//           include: {
//             composer: {
//               select: {
//                 name: true,
//                 fullName: true,
//               },
//             },
//           },
//         });

//         if (work) {
//           works.push(work);
//         }
//       } catch (error: any) {
//         console.warn(`⚠️ Erro no registro ${i}: ${error.message}`);
//         continue;
//       }
//     }

//     return works;
//   }

//   // Método auxiliar para sanitizar strings
//   private sanitizeString(str: string): string {
//     if (!str || typeof str !== 'string') {
//       return '';
//     }

//     try {
//       // Remover caracteres de controle e não imprimíveis
//       return str
//         .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove caracteres de controle
//         .replace(/\uFEFF/g, '') // Remove BOM (Byte Order Mark)
//         .trim();
//     } catch (error) {
//       console.warn('⚠️ Erro ao sanitizar string:', error);
//       return '';
//     }
//   }

//   // Ordenar obras por importância/famosidade
//   private sortByFamousness(works: WorkToFix[]): WorkToFix[] {
//     return works.sort((a, b) => {
//       // Encontrar a prioridade de cada obra
//       const priorityA = this.getFamousWorkPriority(a.title, a.composerName);
//       const priorityB = this.getFamousWorkPriority(b.title, b.composerName);

//       if (priorityA !== priorityB) {
//         return priorityB - priorityA; // Maior prioridade primeiro
//       }

//       // Se mesma prioridade, ordenar por compositor e depois título
//       const composerCompare = a.composerName.localeCompare(b.composerName);
//       if (composerCompare !== 0) return composerCompare;

//       return a.title.localeCompare(b.title);
//     });
//   }

//   // Obter prioridade de uma obra específica
//   private getFamousWorkPriority(title: string, composerName: string): number {
//     const normalizedTitle = this.normalizeText(title);
//     const normalizedComposer = this.normalizeText(composerName);

//     for (const pattern of this.famousWorks) {
//       if (normalizedComposer.includes(this.normalizeText(pattern.composer))) {
//         for (const titlePattern of pattern.patterns) {
//           if (normalizedTitle.includes(this.normalizeText(titlePattern))) {
//             return pattern.priority;
//           }
//         }
//       }
//     }

//     return 0;
//   }

//   // Mostrar preview das correções
//   async showPreview(): Promise<WorkToFix[]> {
//     console.log('🚀 Iniciando análise de obras famosas...\n');

//     const worksToFix = await this.findWorksToFix();

//     if (worksToFix.length === 0) {
//       console.log('✅ Nenhuma obra famosa encontrada que precise de subtítulo');
//       return [];
//     }

//     // Ordenar por famosidade
//     const sortedWorks = this.sortByFamousness(worksToFix);

//     console.log(
//       `\n📋 PREVIEW DOS SUBTÍTULOS (${sortedWorks.length} obras afetadas):`
//     );
//     console.log(''.padEnd(120, '='));

//     // Separar por nível de prioridade
//     const veryFamous = sortedWorks.filter(
//       (w) => this.getFamousWorkPriority(w.title, w.composerName) >= 90
//     );
//     const famous = sortedWorks.filter((w) => {
//       const priority = this.getFamousWorkPriority(w.title, w.composerName);
//       return priority >= 70 && priority < 90;
//     });
//     const lessFamous = sortedWorks.filter(
//       (w) => this.getFamousWorkPriority(w.title, w.composerName) < 70
//     );

//     if (veryFamous.length > 0) {
//       console.log(`\n🌟 OBRAS MUITO FAMOSAS (${veryFamous.length}):`);
//       console.log(''.padEnd(80, '-'));

//       veryFamous.forEach((work, index) => {
//         console.log(`\n${index + 1}. ${work.composerName} - ${work.title}`);
//         console.log(`   📝 Op/Cat: ${work.opOrCatalog || 'N/A'}`);
//         console.log(
//           `   📛 Subtítulo atual: ${work.currentSubtitle || '(nenhum)'}`
//         );
//         console.log(`   ➡️ Novo subtítulo: "${work.newSubtitle}"`);
//         console.log(`   🎯 Identificado por: ${work.matchedBy}`);
//       });
//     }

//     if (famous.length > 0) {
//       console.log(`\n⭐ OBRAS FAMOSAS (${famous.length}):`);
//       console.log(''.padEnd(80, '-'));

//       famous.slice(0, 15).forEach((work, index) => {
//         console.log(`\n${index + 1}. ${work.composerName} - ${work.title}`);
//         console.log(`   ➡️ "${work.newSubtitle}"`);
//         console.log(`   🎯 ${work.matchedBy}`);
//       });

//       if (famous.length > 15) {
//         console.log(`\n   ... e mais ${famous.length - 15} obras famosas`);
//       }
//     }

//     if (lessFamous.length > 0) {
//       console.log(`\n📚 OUTRAS OBRAS CONHECIDAS (${lessFamous.length}):`);
//       console.log(''.padEnd(80, '-'));

//       lessFamous.slice(0, 10).forEach((work, index) => {
//         console.log(
//           `${index + 1}. ${work.composerName} - ${work.title} → "${
//             work.newSubtitle
//           }"`
//         );
//       });

//       if (lessFamous.length > 10) {
//         console.log(`   ... e mais ${lessFamous.length - 10} obras`);
//       }
//     }

//     console.log(`\n📊 RESUMO:`);
//     console.log(`   - Total de obras a corrigir: ${sortedWorks.length}`);
//     console.log(`   - Obras muito famosas: ${veryFamous.length}`);
//     console.log(`   - Obras famosas: ${famous.length}`);
//     console.log(`   - Outras obras: ${lessFamous.length}`);

//     // Estatísticas por compositor
//     const composerStats = sortedWorks.reduce((acc, work) => {
//       acc[work.composerName] = (acc[work.composerName] || 0) + 1;
//       return acc;
//     }, {} as Record<string, number>);

//     console.log(`\n🎼 Top 10 compositores com mais obras identificadas:`);
//     Object.entries(composerStats)
//       .sort(([, a], [, b]) => b - a)
//       .slice(0, 10)
//       .forEach(([composer, count], index) => {
//         console.log(`   ${index + 1}. ${composer}: ${count} obras`);
//       });

//     return sortedWorks;
//   }

//   // Executar as correções
//   async executeCorrections(worksToFix: WorkToFix[]): Promise<void> {
//     if (worksToFix.length === 0) {
//       console.log('📭 Nenhuma correção para executar');
//       return;
//     }

//     console.log(`\n🔧 Executando correções em ${worksToFix.length} obras...`);

//     let successCount = 0;
//     let errorCount = 0;

//     for (const work of worksToFix) {
//       try {
//         await prisma.work.update({
//           where: { id: work.id },
//           data: { subtitle: work.newSubtitle },
//         });

//         console.log(`✅ ${work.composerName} - ${work.title}`);
//         console.log(`   → "${work.newSubtitle}"`);
//         successCount++;
//       } catch (error) {
//         console.error(`❌ Erro ao corrigir "${work.title}":`, error);
//         errorCount++;
//       }

//       // Delay pequeno para não sobrecarregar o banco
//       await new Promise((resolve) => setTimeout(resolve, 50));
//     }

//     console.log(`\n🎉 CORREÇÕES CONCLUÍDAS:`);
//     console.log(`   ✅ Sucessos: ${successCount}`);
//     console.log(`   ❌ Erros: ${errorCount}`);
//     console.log(`   📊 Total: ${worksToFix.length}`);

//     // Salvar log das correções
//     const logContent = worksToFix
//       .map(
//         (work) =>
//           `${work.composerName} | ${work.title} | "${
//             work.currentSubtitle || ''
//           }" → "${work.newSubtitle}" | ${work.opOrCatalog || 'N/A'} | ${
//             work.matchedBy
//           }`
//       )
//       .join('\n');

//     const logFile = path.join(
//       process.cwd(),
//       `famous-works-subtitles-${new Date().toISOString().split('T')[0]}.log`
//     );

//     await fs.writeFile(logFile, logContent);
//     console.log(`📝 Log salvo em: ${logFile}`);
//   }

//   async run(executeCorrections: boolean = false): Promise<void> {
//     try {
//       const worksToFix = await this.showPreview();

//       if (executeCorrections && worksToFix.length > 0) {
//         console.log('\n⚠️ EXECUTANDO CORREÇÕES...');
//         console.log(
//           'Esta operação irá adicionar subtítulos às obras famosas listadas acima.'
//         );

//         await this.executeCorrections(worksToFix);
//       } else if (worksToFix.length > 0) {
//         console.log('\n💡 Para executar as correções, use:');
//         console.log('   npm run fix-famous-subtitles:execute');
//       }
//     } catch (error: any) {
//       console.error('❌ Erro durante execução:', error.message);

//       // Tentar método alternativo em caso de erro
//       console.log('\n🔄 Tentando método alternativo...');
//       try {
//         await this.runAlternativeMethod(executeCorrections);
//       } catch (altError: any) {
//         console.error('❌ Método alternativo também falhou:', altError.message);
//       }
//     } finally {
//       await prisma.$disconnect();
//     }
//   }

//   // Método alternativo mais simples em caso de erro
//   async runAlternativeMethod(
//     executeCorrections: boolean = false
//   ): Promise<void> {
//     try {
//       console.log('🔄 Usando busca simplificada...');

//       // Buscar apenas campos essenciais
//       const works = await prisma.work.findMany({
//         select: {
//           id: true,
//           title: true,
//           subtitle: true,
//           opOrCatalog: true,
//           composer: {
//             select: {
//               name: true,
//               fullName: true,
//             },
//           },
//         },
//         where: {
//           title: { not: null },
//           composer: {
//             name: { not: null },
//           },
//         },
//         take: 5000, // Limitar para evitar problemas de memória
//       });

//       console.log(
//         `📊 Encontradas ${works.length} obras para análise alternativa`
//       );

//       const worksToFix: WorkToFix[] = [];

//       // Processar apenas compositores muito famosos para reduzir scope
//       const famousComposerWorks = works.filter((work) => {
//         const composerName = this.normalizeText(work.composer?.name || '');
//         return [
//           'beethoven',
//           'mozart',
//           'chopin',
//           'bach',
//           'tchaikovsky',
//           'debussy',
//         ].some((famous) => composerName.includes(famous));
//       });

//       console.log(
//         `🌟 Encontradas ${famousComposerWorks.length} obras de compositores muito famosos`
//       );

//       for (const work of famousComposerWorks) {
//         try {
//           for (const pattern of this.famousWorks.slice(0, 20)) {
//             // Apenas os 20 padrões mais importantes
//             const { matches, matchedBy } = this.matchesFamousWork(
//               work,
//               pattern
//             );

//             if (matches) {
//               const newSubtitle = pattern.subtitles.join(', ');

//               if (!work.subtitle || work.subtitle !== newSubtitle) {
//                 worksToFix.push({
//                   id: work.id,
//                   title: work.title,
//                   currentSubtitle: work.subtitle,
//                   composerName: work.composer?.fullName || 'Desconhecido',
//                   opOrCatalog: work.opOrCatalog,
//                   newSubtitle: newSubtitle,
//                   matchedBy: matchedBy,
//                 });
//               }
//               break;
//             }
//           }
//         } catch (workError: any) {
//           console.warn(
//             `⚠️ Erro ao processar obra ${work.id}: ${workError.message}`
//           );
//           continue;
//         }
//       }

//       console.log(
//         `\n📋 MÉTODO ALTERNATIVO - ${worksToFix.length} obras encontradas:`
//       );

//       if (worksToFix.length > 0) {
//         worksToFix.forEach((work, index) => {
//           console.log(`${index + 1}. ${work.composerName} - ${work.title}`);
//           console.log(`   ➡️ "${work.newSubtitle}"`);
//         });

//         if (executeCorrections) {
//           await this.executeCorrections(worksToFix);
//         }
//       } else {
//         console.log('✅ Nenhuma obra famosa encontrada no método alternativo');
//       }
//     } catch (error: any) {
//       console.error('❌ Erro no método alternativo:', error.message);
//     }
//   }

//   // Método para diagnosticar problemas nos dados
//   async diagnoseData(): Promise<void> {
//     try {
//       console.log('🔍 Verificando integridade dos dados...\n');

//       // Verificar total de works
//       const totalWorks = await prisma.work.count();
//       console.log(`📊 Total de works no banco: ${totalWorks}`);

//       // Verificar works sem título
//       const worksWithoutTitle = await prisma.work.count({
//         where: { title: null },
//       });
//       console.log(`❌ Works sem título: ${worksWithoutTitle}`);

//       // Verificar works sem compositor
//       const worksWithoutComposer = await prisma.work.count({
//         where: { composerId: null },
//       });
//       console.log(`❌ Works sem compositor: ${worksWithoutComposer}`);

//       // Tentar identificar registros problemáticos
//       console.log('\n🔍 Testando busca de registros...');

//       try {
//         const sampleWorks = await prisma.work.findMany({
//           take: 10,
//           select: {
//             id: true,
//             title: true,
//             composer: {
//               select: {
//                 name: true,
//               },
//             },
//           },
//         });

//         console.log(
//           `✅ Conseguiu buscar ${sampleWorks.length} registros de amostra`
//         );

//         // Mostrar alguns exemplos
//         sampleWorks.slice(0, 3).forEach((work, index) => {
//           console.log(
//             `${index + 1}. ${work.composer?.name || 'Sem compositor'} - ${
//               work.title || 'Sem título'
//             }`
//           );
//         });
//       } catch (sampleError: any) {
//         console.error(`❌ Erro ao buscar amostra: ${sampleError.message}`);
//       }

//       // Tentar buscar por compositor específico
//       console.log('\n🔍 Testando busca por compositores famosos...');

//       const famousComposers = ['Beethoven', 'Mozart', 'Chopin', 'Bach'];

//       for (const composerName of famousComposers) {
//         try {
//           const count = await prisma.work.count({
//             where: {
//               composer: {
//                 name: { contains: composerName, mode: 'insensitive' },
//               },
//             },
//           });
//           console.log(`✅ ${composerName}: ${count} obras`);
//         } catch (composerError: any) {
//           console.error(
//             `❌ Erro ao buscar ${composerName}: ${composerError.message}`
//           );
//         }
//       }

//       // Verificar caracteres problemáticos
//       console.log('\n🔍 Verificando caracteres problemáticos...');

//       try {
//         const worksWithLongTitles = await prisma.work.count({
//           where: {
//             title: { not: null },
//           },
//         });
//         console.log(`📊 Works com títulos: ${worksWithLongTitles}`);

//         // Tentar buscar work com título mais longo
//         console.log('📏 Testando busca de título mais longo...');
//       } catch (queryError: any) {
//         console.error(`❌ Erro na consulta: ${queryError.message}`);
//       }
//     } catch (error: any) {
//       console.error('❌ Erro no diagnóstico:', error.message);
//     }
//   }
// }

// async function main() {
//   const fixer = new FamousWorksSubtitleFixer();
//   const shouldExecute = process.argv.includes('execute');
//   const shouldDiagnose = process.argv.includes('diagnose');

//   console.log('🎵 Script de Adição de Subtítulos para Obras Famosas');
//   console.log(''.padEnd(55, '='));

//   if (shouldDiagnose) {
//     console.log('🔍 MODO DIAGNÓSTICO - Verificando integridade dos dados');
//     await fixer.diagnoseData();
//   } else if (shouldExecute) {
//     console.log('⚠️ MODO EXECUÇÃO - Os subtítulos serão aplicados!');
//     await fixer.run(shouldExecute);
//   } else {
//     console.log('👁️ MODO PREVIEW - Apenas mostrando o que será corrigido');
//     await fixer.run(shouldExecute);
//   }
// }

// if (require.main === module) {
//   main().catch(console.error);
// }

// export default FamousWorksSubtitleFixer;

// // Exemplo de uso:
// // npm run fix-famous-subtitles          -> mostra preview
// // npm run fix-famous-subtitles:execute  -> executa correções
// // npm run fix-famous-subtitles diagnose -> diagnostica problemas
