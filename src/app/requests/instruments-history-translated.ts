// app/requests/instruments-history-translated.ts
import prisma from '@/app/libs/prismadb';
import { unstable_cache } from 'next/cache';
import { Language } from '@/app/stores/useLanguageStore';

interface InstrumentWithWorksTranslated {
  id: string;
  name: string;
  historicalData: InstrumentHistoricalDataTranslated;
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

interface InstrumentHistoricalDataTranslated {
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
    preferredComposerId?: string;
    excludedComposerIds?: string[];
  };
}

// Configurações avançadas de obras por instrumento
interface WorksPreferences {
  [instrumentName: string]: {
    composerWorks?: {
      [composerId: string]: {
        count: number;
        specificWorkIds?: string[];
        specificWorkTitles?: string[];
      };
    };
    totalMaxWorks?: number;
    fallbackToAutomatic?: boolean;
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

// Dados históricos dos instrumentos traduzidos
const instrumentsHistoricalDataTranslated: Record<
  string,
  {
    pt: InstrumentHistoricalDataTranslated;
    en: InstrumentHistoricalDataTranslated;
  }
> = {
  Piano: {
    pt: {
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
    en: {
      name: 'Piano',
      category: 'Chordophone',
      origin: 'Italy',
      inventor: 'Bartolomeo Cristofori',
      inventionPeriod: '1700-1720',
      description:
        'The piano is a keyboard instrument that produces sound through the impact of hammers on tensioned strings. It revolutionized music with its ability to express varied dynamics.',
      detailedHistory:
        'The piano was invented by Bartolomeo Cristofori in Florence, Italy, around 1700. Cristofori was a specialist in keyboard instruments and worked for the Medici family. His goal was to create an instrument that could vary the volume of sound according to the force applied to the keys, overcoming the limitations of the harpsichord. The original name was "gravicembalo col piano e forte" (harpsichord with soft and loud), which was later shortened to "pianoforte" and finally "piano". During the 18th century, the piano underwent significant improvements, especially in Germany and Austria. In the 19th century, with the Industrial Revolution, there were important technical advances such as the cast iron frame, which allowed greater string tension and more powerful sound volume.',
      characteristics: [
        '88 keys (52 white, 36 black)',
        'Dynamic expression capability (forte and piano)',
        'Note sustain through pedals',
        'Wide tonal range (more than 7 octaves)',
      ],
      evolution: [
        'Evolution from clavichord and harpsichord',
        'Development of the fortepiano by Cristofori',
        'Refinement during the romantic period',
        'Modern piano with iron frame',
      ],
      notableFeatures: [
        'Escapement mechanism',
        'Sustain, sostenuto and una corda pedals',
        'Cross-stringing for better resonance',
        'Cast iron frame structure',
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
  },

  Órgão: {
    pt: {
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
    en: {
      name: 'Organ',
      category: 'Aerophone',
      origin: 'Ancient Greece',
      inventor: 'Ctesibius of Alexandria',
      inventionPeriod: '285-222 BC',
      description:
        'The organ is a keyboard instrument that produces sound through pipes fed by compressed air. It is considered the "king of instruments" for its sonic majesty.',
      detailedHistory:
        "The organ is one of the oldest instruments in Western music, with its origins dating back to the hydraulic organ (hydraulis) invented by Ctesibius of Alexandria in the 3rd century BC. This instrument used water to regulate air pressure. During the Medieval Era, the organ evolved significantly, becoming central to Christian liturgical music. Medieval organs were smaller and simpler, but gradually grew in size and complexity. In the Renaissance and Baroque periods, the organ reached great technical and artistic sophistication, especially in Germany, where masters like Arp Schnitger built magnificent instruments. The organ was fundamental to the development of Bach's music and other Baroque composers.",
      characteristics: [
        'Multiple keyboards (manuals) and pedal board',
        'Stops for different timbres',
        'Metal and wooden pipes',
        'Air inflow system',
      ],
      evolution: [
        'Hydraulic organ in antiquity',
        'Development in the Medieval Era',
        'Pipe organ in the Renaissance',
        'Modern electric and digital organs',
      ],
      notableFeatures: [
        'Stops from different sound families',
        'Couplers between keyboards',
        'Tremolo and other effects',
        'Pipes of different materials and shapes',
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
  },

  Violoncelo: {
    pt: {
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
    en: {
      name: 'Cello',
      category: 'Chordophone',
      origin: 'Italy',
      inventor: 'Andrea Amati',
      inventionPeriod: '1560-1570',
      description:
        'The cello is a bowed string instrument from the violin family, played with a bow. It has a rich and expressive sonority, being fundamental in chamber and orchestral music.',
      detailedHistory:
        'The cello developed in Italy during the 16th century as part of the violin family created by Andrea Amati in Cremona. Initially called "violone" or "bass violin", the instrument evolved from the viola da gamba, but with important structural modifications. During the Baroque period, the cello established itself both as a solo instrument and as the harmonic foundation of ensembles. Composers like Luigi Boccherini and later Bach, with his Cello Suites, elevated the instrument to new artistic heights. In the 19th century, with virtuosos like Bernhard Romberg and later Pablo Casals in the 20th century, the cello consolidated itself as one of the main solo instruments in classical music.',
      characteristics: [
        'Four strings tuned in fifths (C-G-D-A)',
        'Played seated with the instrument between the legs',
        'Horsehair bow',
        'Range of more than 4 octaves',
      ],
      evolution: [
        'Development from the viola da gamba',
        'Standardization in the 16th century',
        'Refinement by Italian luthiers',
        'Modern techniques in the 20th century',
      ],
      notableFeatures: [
        'Endpin for floor support',
        'Adjustable bridge',
        'Ebony fingerboard',
        'Spruce top and maple back',
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
  },

  Violino: {
    pt: {
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
    en: {
      name: 'Violin',
      category: 'Chordophone',
      origin: 'Italy',
      inventor: 'Andrea Amati',
      inventionPeriod: '1555-1560',
      description:
        'The violin is the smallest and highest-pitched instrument in the bowed string family. It is considered one of the most expressive and versatile instruments in classical music.',
      detailedHistory:
        "The violin was created by Andrea Amati in Cremona, Italy, around 1555-1560, evolving from medieval instruments like the fidula and lira da braccio. The city of Cremona became the world center of violin making, especially through the Amati, Guarneri and Stradivarius families. Antonio Stradivarius (1644-1737) took the art of lutherie to its highest expression, creating instruments that are still considered unsurpassable today. During the Baroque period, virtuosos like Arcangelo Corelli and Antonio Vivaldi developed techniques that defined the violin repertoire. In the 19th century, Niccolò Paganini revolutionized the instrument's technique, inspiring composers like Brahms, Tchaikovsky and Mendelssohn to write great concertos.",
      characteristics: [
        'Four strings tuned in fifths (G-D-A-E)',
        'Played resting on shoulder and chin',
        'Horsehair bow',
        'Advanced techniques like vibrato and glissando',
      ],
      evolution: [
        'Evolution from medieval fidula',
        'Refinement in Cremona',
        'Golden age with Stradivarius',
        'Modern virtuosic techniques',
      ],
      notableFeatures: [
        'Chinrest for support',
        'Shoulder rest for comfort',
        'Ebony tuning pegs',
        'Special varnish for protection',
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
  },

  Clavicórdio: {
    pt: {
      name: 'Clavicórdio',
      category: 'Cordofone',
      origin: 'Europa',
      inventor: null,
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
    en: {
      name: 'Clavichord',
      category: 'Chordophone',
      origin: 'Europe',
      inventor: null,
      inventionPeriod: '14th Century',
      description:
        "The clavichord is a keyboard instrument where strings are struck directly by metal blades. It was one of the piano's precursors, widely used in domestic music.",
      detailedHistory:
        'The clavichord developed in the 14th century from the medieval monochord, a single-string instrument used for musical education. Its unique characteristic is that the keys make direct contact with the strings through metal tangents, allowing unique expressive control among historical keyboard instruments. During the Renaissance and Baroque periods, it was widely used for domestic music and as a study instrument, especially in Germany. Carl Philipp Emanuel Bach, son of J.S. Bach, was one of the great advocates of the clavichord, preferring it to the harpsichord for its expressive capacity. The instrument allowed techniques like "Bebung" (vibrato obtained by varying pressure on the key), impossible on other keyboard instruments of the time.',
      characteristics: [
        'Keys connected directly to strings',
        'Delicate and intimate sound',
        'Vibrato capability (Bebung)',
        'Touch-sensitive dynamics',
      ],
      evolution: [
        'Origin in medieval monochord',
        'Development in the Renaissance',
        'Peak in the Baroque period',
        "Decline with piano's arrival",
      ],
      notableFeatures: [
        'Brass tangents',
        'Strings parallel to keyboard',
        'Felt dampers',
        'Simple and portable construction',
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
  },

  Orquestra: {
    pt: {
      name: 'Orquestra',
      category: 'Ensemble',
      origin: 'Europa',
      inventor: null,
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
    en: {
      name: 'Orchestra',
      category: 'Ensemble',
      origin: 'Europe',
      inventor: null,
      inventionPeriod: '17th Century',
      description:
        'The orchestra is a large instrumental ensemble that brings together the main instrument families: strings, woodwinds, brass and percussion, creating an incomparable sound palette.',
      detailedHistory:
        'The modern orchestra evolved gradually from small instrumental ensembles of the 17th century. During the Baroque period, Jean-Baptiste Lully in France and other composers began to standardize instrumental groups to accompany operas and chamber music. The classical orchestra was consolidated by composers like Haydn and Mozart, establishing the basic formation with strings, oboes, bassoons, horns and eventually clarinets. During Romanticism, the orchestra expanded dramatically with Berlioz, Wagner and Mahler, who added instruments like tuba, harp, celesta and expanded percussion sections. The modern symphony orchestra, with 80-100 musicians, represents centuries of musical evolution and continues to be one of the most versatile and expressive ensembles in music.',
      characteristics: [
        'String section as foundation',
        'Woodwinds, brass and percussion',
        'Conductor for coordination',
        '80-100 musicians in symphony orchestra',
      ],
      evolution: [
        'Small baroque ensembles',
        'Standardized classical orchestra',
        'Expansion in romanticism',
        'Modern gigantic orchestra',
      ],
      notableFeatures: [
        'Standardized stage arrangement',
        'Hierarchy of principals and first chairs',
        'Specialized sections',
        'Genre versatility',
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
  },

  Harpa: {
    pt: {
      name: 'Harpa',
      category: 'Cordofone',
      origin: 'Mesopotâmia/Egito',
      inventor: null,
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
    en: {
      name: 'Harp',
      category: 'Chordophone',
      origin: 'Mesopotamia/Egypt',
      inventor: null,
      inventionPeriod: '3000 BC',
      description:
        "The harp is one of humanity's oldest instruments, producing sound through plucked strings. It evolved from simple musical bows to sophisticated instruments.",
      detailedHistory:
        'The harp is one of the oldest known musical instruments, with archaeological evidence dating from around 3000 BC in Mesopotamia and Egypt. It evolved from simple musical bows to increasingly sophisticated instruments. In medieval Ireland, the Celtic harp became a national symbol and inspired a rich musical tradition. During the Baroque period, the harp gained a place in chamber and orchestral music, but it was in Classicism and Romanticism that it truly flourished. The modern double-action pedal harp was developed by Sébastien Érard in 1810, allowing complete access to the chromatic scale. This revolutionary system allowed the harp to become a virtuosic solo instrument, with a repertoire that includes concertos by Mozart, Debussy, Ravel and many other composers.',
      characteristics: [
        'Strings of different lengths',
        'Pedals for chromatic alterations',
        'Ethereal and celestial sonority',
        '47 strings in concert harp',
      ],
      evolution: [
        'Primitive arched harp',
        'Assyrian angular harp',
        'Medieval Irish harp',
        'Modern pedal harp',
      ],
      notableFeatures: [
        'Double pedal system',
        'Gut and nylon strings',
        'Ornate column',
        'Glissando techniques',
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
  },
};

// Função para obter dados históricos traduzidos por instrumento
function getTranslatedInstrumentData(
  instrumentName: string,
  language: Language
): InstrumentHistoricalDataTranslated {
  const translatedData = instrumentsHistoricalDataTranslated[instrumentName];
  if (!translatedData) {
    // Fallback para instrumentos não mapeados
    return {
      name: instrumentName,
      category: language === 'en' ? 'Undefined' : 'Indefinido',
      origin: language === 'en' ? 'Unknown' : 'Desconhecido',
      inventor: null,
      inventionPeriod: language === 'en' ? 'Undefined' : 'Indefinido',
      description:
        language === 'en'
          ? 'Historical information not available.'
          : 'Informações históricas não disponíveis.',
      detailedHistory:
        language === 'en'
          ? 'Detailed history not available.'
          : 'História detalhada não disponível.',
      characteristics: [],
      evolution: [],
      notableFeatures: [],
      famousPerformers: [],
      imageUrl: '/instruments/default.jpg',
      iconName: 'Music',
    };
  }

  return language === 'en' ? translatedData.en : translatedData.pt;
}

// FUNÇÃO PRINCIPAL: Busca instrumentos com obras traduzidas
export const getInstrumentsWithWorksTranslated = unstable_cache(
  async (
    language: Language,
    composerPreferences: ComposerPreferences = {},
    worksPreferences: WorksPreferences = {}
  ): Promise<InstrumentWithWorksTranslated[]> => {
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
        let selectedWorks: any[] = [];

        if (worksPrefs?.composerWorks) {
          // Modo avançado: obras específicas por compositor
          for (const [composerId, prefs] of Object.entries(
            worksPrefs.composerWorks
          )) {
            const composerWorks: any[] = [];

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
                  videoUrl: true,
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
                  videoUrl: true,
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
                  videoUrl: true,
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
                  videoUrl: true,
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
          const whereClause: any = {
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
              videoUrl: true,
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
          historicalData: getTranslatedInstrumentData(
            instrument.name,
            language
          ),
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
  ['instruments-with-works-translated-v1'],
  {
    revalidate: 3600, // 1 hora
    tags: ['instruments', 'works', 'composers', 'translated'],
  }
);

export const getInstrumentsStatsTranslated = unstable_cache(
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
  ['instruments-stats-translated-v1'],
  {
    revalidate: 7200, // 2 horas
    tags: ['instruments', 'stats', 'translated'],
  }
);

export const getTopComposersByInstrumentTranslated = unstable_cache(
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
  ['top-composers-by-instrument-translated-v1'],
  {
    revalidate: 7200, // 2 horas
    tags: ['instruments', 'composers', 'stats', 'translated'],
  }
);

// Função para limpar cache
export async function revalidateInstrumentsCacheTranslated() {
  const { revalidateTag } = await import('next/cache');

  revalidateTag('instruments');
  revalidateTag('works');
  revalidateTag('composers');
  revalidateTag('stats');
  revalidateTag('translated');
  revalidateTag('instruments-with-works-translated-v1');
  revalidateTag('instruments-stats-translated-v1');
  revalidateTag('top-composers-by-instrument-translated-v1');
}

// Exporta interfaces e tipos para uso externo
export type { ComposerPreferences, WorksPreferences };
