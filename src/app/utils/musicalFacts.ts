/**
 * Musical facts (pt/en) shown on the home and the history pages. Kept out of
 * `utils.ts` so client code can load just this file, and only on demand.
 */
// 300 Curiosidades Musicais para Opus Atlas
export const musicalFacts = [
  // PERÍODO MEDIEVAL (25 curiosidades)
  {
    id: '1',
    type: 'curiosity',
    icon: '⛪',
    title: {
      pt: 'Canto Gregoriano',
      en: 'Gregorian Chant',
    },
    content: {
      pt: 'O canto gregoriano, desenvolvido na Idade Média, era totalmente monofônico (uma única melodia) e cantado sem acompanhamento instrumental, criando uma atmosfera transcendental única.',
      en: 'Gregorian chant, developed in the Middle Ages, was entirely monophonic (a single melody) and sung without instrumental accompaniment, creating a unique transcendental atmosphere.',
    },
    category: 'Medieval',
  },
  {
    id: '2',
    type: 'innovation',
    icon: '📜',
    title: {
      pt: 'Primeira Notação',
      en: 'First Notation',
    },
    content: {
      pt: "Guido d'Arezzo (c. 991-1033) revolucionou a música ao criar o sistema de notação com pautas de quatro linhas, predecessor do sistema atual de cinco linhas.",
      en: "Guido d'Arezzo (c. 991-1033) revolutionized music by creating the notation system with four-line staves, predecessor to the current five-line system.",
    },
    category: 'Medieval',
  },
  {
    id: '3',
    type: 'curiosity',
    icon: '🎭',
    title: {
      pt: 'Trovadores e Trouvères',
      en: 'Troubadours and Trouvères',
    },
    content: {
      pt: 'Os trovadores do sul da França e os trouvères do norte criaram as primeiras canções seculares documentadas, estabelecendo tradições que influenciariam toda a música ocidental.',
      en: 'The troubadours of southern France and the trouvères of the north created the first documented secular songs, establishing traditions that would influence all Western music.',
    },
    category: 'Medieval',
  },
  {
    id: '4',
    type: 'technique',
    icon: '🎵',
    title: {
      pt: 'Organum',
      en: 'Organum',
    },
    content: {
      pt: 'O organum foi a primeira forma de polifonia organizada, onde uma segunda voz era adicionada ao canto gregoriano, marcando o início da harmonia ocidental.',
      en: 'Organum was the first form of organized polyphony, where a second voice was added to Gregorian chant, marking the beginning of Western harmony.',
    },
    category: 'Medieval',
  },
  {
    id: '5',
    type: 'curiosity',
    icon: '🏰',
    title: {
      pt: 'Escola de Notre-Dame',
      en: 'Notre-Dame School',
    },
    content: {
      pt: 'A Escola de Notre-Dame de Paris (séc. XII-XIII) foi o primeiro centro de composição polifônica, onde Léonin e Pérotin criaram obras revolucionárias.',
      en: 'The Notre-Dame School of Paris (12th-13th centuries) was the first center of polyphonic composition, where Léonin and Pérotin created revolutionary works.',
    },
    category: 'Medieval',
  },
  {
    id: '6',
    type: 'instrument',
    icon: '🎻',
    title: {
      pt: 'Viola da Gamba',
      en: 'Viola da Gamba',
    },
    content: {
      pt: 'A viola da gamba medieval tinha trastes como um violão e era tocada entre as pernas, sendo precursora do violoncelo moderno.',
      en: 'The medieval viola da gamba had frets like a guitar and was played between the legs, being the precursor to the modern cello.',
    },
    category: 'Medieval',
  },
  {
    id: '7',
    type: 'curiosity',
    icon: '📿',
    title: {
      pt: 'Dies Irae',
      en: 'Dies Irae',
    },
    content: {
      pt: 'A melodia do "Dies Irae" (Dia da Ira) medieval foi citada por centenas de compositores posteriores, de Mozart a John Williams em Star Wars.',
      en: 'The medieval "Dies Irae" (Day of Wrath) melody was quoted by hundreds of later composers, from Mozart to John Williams in Star Wars.',
    },
    category: 'Medieval',
  },
  {
    id: '8',
    type: 'innovation',
    icon: '🎼',
    title: {
      pt: 'Ars Nova',
      en: 'Ars Nova',
    },
    content: {
      pt: 'O movimento Ars Nova (séc. XIV) introduziu valores rítmicos menores e maior complexidade, revolucionando a música com compositores como Machaut.',
      en: 'The Ars Nova movement (14th century) introduced smaller rhythmic values and greater complexity, revolutionizing music with composers like Machaut.',
    },
    category: 'Medieval',
  },
  {
    id: '9',
    type: 'curiosity',
    icon: '🎪',
    title: {
      pt: 'Saltarello',
      en: 'Saltarello',
    },
    content: {
      pt: 'O saltarello era uma dança medieval italiana tão energética que seu nome significa "pequeno salto", sendo executada em festas populares.',
      en: 'The saltarello was an Italian medieval dance so energetic that its name means "little jump," performed at popular festivities.',
    },
    category: 'Medieval',
  },
  {
    id: '10',
    type: 'technique',
    icon: '🔄',
    title: {
      pt: 'Rondeau Medieval',
      en: 'Medieval Rondeau',
    },
    content: {
      pt: 'O rondeau medieval tinha a forma ABACA, onde o refrão (A) sempre retornava, influenciando formas musicais por séculos.',
      en: 'The medieval rondeau had the form ABACA, where the refrain (A) always returned, influencing musical forms for centuries.',
    },
    category: 'Medieval',
  },
  {
    id: '11',
    type: 'curiosity',
    icon: '🎶',
    title: {
      pt: 'Manuscrito de Montpellier',
      en: 'Montpellier Manuscript',
    },
    content: {
      pt: 'O Manuscrito de Montpellier (séc. XIII) contém alguns dos primeiros motetos polifônicos, revelando a sofisticação da música medieval.',
      en: 'The Montpellier Manuscript (13th century) contains some of the first polyphonic motets, revealing the sophistication of medieval music.',
    },
    category: 'Medieval',
  },
  {
    id: '12',
    type: 'instrument',
    icon: '🥁',
    title: {
      pt: 'Tabor Medieval',
      en: 'Medieval Tabor',
    },
    content: {
      pt: 'O tabor era um pequeno tambor tocado com uma mão enquanto a outra tocava uma flauta de três buracos, criando uma "orquestra de um homem só".',
      en: 'The tabor was a small drum played with one hand while the other played a three-hole flute, creating a "one-man orchestra."',
    },
    category: 'Medieval',
  },
  {
    id: '13',
    type: 'curiosity',
    icon: '📚',
    title: {
      pt: 'Carmina Burana Original',
      en: 'Original Carmina Burana',
    },
    content: {
      pt: 'Os "Carmina Burana" originais eram canções de estudantes e clérigos medievais alemães, muito antes da famosa versão de Carl Orff.',
      en: 'The original "Carmina Burana" were songs by German medieval students and clerics, long before Carl Orff\'s famous version.',
    },
    category: 'Medieval',
  },
  {
    id: '14',
    type: 'technique',
    icon: '🎭',
    title: {
      pt: 'Hoquetus',
      en: 'Hocket',
    },
    content: {
      pt: 'O hoquetus era uma técnica medieval onde as vozes se alternavam rapidamente, criando um efeito de "soluço" musical muito característico.',
      en: 'Hocket was a medieval technique where voices alternated rapidly, creating a very characteristic musical "hiccup" effect.',
    },
    category: 'Medieval',
  },
  {
    id: '15',
    type: 'curiosity',
    icon: '🌟',
    title: {
      pt: 'Hildegard von Bingen',
      en: 'Hildegard von Bingen',
    },
    content: {
      pt: 'Hildegard von Bingen (1098-1179) foi uma das primeiras compositoras conhecidas, criando cantos visionários que ela afirmava receber em revelações divinas.',
      en: 'Hildegard von Bingen (1098-1179) was one of the first known female composers, creating visionary chants that she claimed to receive in divine revelations.',
    },
    category: 'Medieval',
  },
  {
    id: '16',
    type: 'innovation',
    icon: '🎵',
    title: {
      pt: 'Solmização',
      en: 'Solmization',
    },
    content: {
      pt: "Guido d'Arezzo criou o sistema de solmização (ut-re-mi-fa-sol-la), baseado no hino a São João Batista, que ainda usamos hoje.",
      en: "Guido d'Arezzo created the solmization system (ut-re-mi-fa-sol-la), based on the hymn to Saint John the Baptist, which we still use today.",
    },
    category: 'Medieval',
  },
  {
    id: '17',
    type: 'curiosity',
    icon: '🏛️',
    title: {
      pt: 'Música Bizantina',
      en: 'Byzantine Music',
    },
    content: {
      pt: 'A música bizantina desenvolveu um sistema de notação próprio com "neumas" que indicavam não apenas alturas, mas também ornamentações complexas.',
      en: 'Byzantine music developed its own notation system with "neumes" that indicated not only pitches, but also complex ornamentations.',
    },
    category: 'Medieval',
  },
  {
    id: '18',
    type: 'instrument',
    icon: '🎹',
    title: {
      pt: 'Órgão Portativo',
      en: 'Portative Organ',
    },
    content: {
      pt: 'O órgão portativo medieval era carregado e tocado por uma pessoa só, que bombeava o ar com uma mão e tocava com a outra.',
      en: 'The medieval portative organ was carried and played by one person, who pumped air with one hand and played with the other.',
    },
    category: 'Medieval',
  },
  {
    id: '19',
    type: 'curiosity',
    icon: '🎯',
    title: {
      pt: 'Conductus',
      en: 'Conductus',
    },
    content: {
      pt: 'O conductus era um tipo de música medieval processional, cantada enquanto o clero se movia durante cerimônias religiosas.',
      en: 'The conductus was a type of medieval processional music, sung while the clergy moved during religious ceremonies.',
    },
    category: 'Medieval',
  },
  {
    id: '20',
    type: 'technique',
    icon: '🔢',
    title: {
      pt: 'Modos Medievais',
      en: 'Medieval Modes',
    },
    content: {
      pt: 'A música medieval usava oito modos eclesiásticos, cada um com caráter emocional específico, muito antes do sistema maior-menor moderno.',
      en: 'Medieval music used eight ecclesiastical modes, each with specific emotional character, long before the modern major-minor system.',
    },
    category: 'Medieval',
  },
  {
    id: '21',
    type: 'curiosity',
    icon: '📖',
    title: {
      pt: 'Cancioneiro da Vaticana',
      en: 'Vatican Songbook',
    },
    content: {
      pt: 'O Cancioneiro da Biblioteca Vaticana preserva centenas de canções medievais que poderiam ter sido perdidas para sempre.',
      en: 'The Vatican Library Songbook preserves hundreds of medieval songs that could have been lost forever.',
    },
    category: 'Medieval',
  },
  {
    id: '22',
    type: 'innovation',
    icon: '⚖️',
    title: {
      pt: 'Tempus Perfectum',
      en: 'Tempus Perfectum',
    },
    content: {
      pt: 'Na música medieval, o "tempus perfectum" (tempo perfeito) era ternário, considerado divino, enquanto o binário era "imperfeito".',
      en: 'In medieval music, "tempus perfectum" (perfect time) was ternary, considered divine, while binary was "imperfect."',
    },
    category: 'Medieval',
  },
  {
    id: '23',
    type: 'curiosity',
    icon: '🎪',
    title: {
      pt: 'Goliardos',
      en: 'Goliards',
    },
    content: {
      pt: 'Os goliardos eram estudantes clérigos errantes que criaram canções satíricas e bebedeiras, desafiando a música religiosa oficial.',
      en: 'The goliards were wandering clerical students who created satirical and drinking songs, challenging official religious music.',
    },
    category: 'Medieval',
  },
  {
    id: '24',
    type: 'instrument',
    icon: '🪘',
    title: {
      pt: 'Alaúde Medieval',
      en: 'Medieval Lute',
    },
    content: {
      pt: 'O alaúde chegou à Europa através dos árabes na Espanha, tornando-se o instrumento secular mais popular da Idade Média tardia.',
      en: 'The lute arrived in Europe through the Arabs in Spain, becoming the most popular secular instrument of the late Middle Ages.',
    },
    category: 'Medieval',
  },
  {
    id: '25',
    type: 'curiosity',
    icon: '🌙',
    title: {
      pt: 'Sérénade Medieval',
      en: 'Medieval Serenade',
    },
    content: {
      pt: 'As primeiras serenatas eram canções de amor noturnas dos trovadores, cantadas sob as janelas das damas na corte medieval.',
      en: 'The first serenades were nocturnal love songs by troubadours, sung under the windows of ladies in medieval court.',
    },
    category: 'Medieval',
  },

  // PERÍODO RENASCENTISTA (25 curiosidades)
  {
    id: '26',
    type: 'innovation',
    icon: '📰',
    title: {
      pt: 'Impressão Musical',
      en: 'Music Printing',
    },
    content: {
      pt: 'Ottaviano Petrucci foi o primeiro a imprimir música em moveable type (1501), revolucionando a disseminação de partituras na Europa.',
      en: 'Ottaviano Petrucci was the first to print music with moveable type (1501), revolutionizing the dissemination of sheet music in Europe.',
    },
    category: 'Renascimento',
  },
  {
    id: '27',
    type: 'curiosity',
    icon: '🎭',
    title: {
      pt: 'Madrigal Renascentista',
      en: 'Renaissance Madrigal',
    },
    content: {
      pt: 'O madrigal renascentista combinava poesia refinada com música polifônica complexa, sendo o equivalente musical da literatura humanística.',
      en: 'The Renaissance madrigal combined refined poetry with complex polyphonic music, being the musical equivalent of humanistic literature.',
    },
    category: 'Renascimento',
  },
  {
    id: '28',
    type: 'technique',
    icon: '🎵',
    title: {
      pt: 'Imitação Polifônica',
      en: 'Polyphonic Imitation',
    },
    content: {
      pt: 'A técnica de imitação polifônica, onde cada voz repete o mesmo tema em momentos diferentes, foi aperfeiçoada no Renascimento.',
      en: 'The technique of polyphonic imitation, where each voice repeats the same theme at different times, was perfected in the Renaissance.',
    },
    category: 'Renascimento',
  },
  {
    id: '29',
    type: 'curiosity',
    icon: '⛪',
    title: {
      pt: 'Missa Pange Lingua',
      en: 'Missa Pange Lingua',
    },
    content: {
      pt: 'A "Missa Pange Lingua" de Josquin des Prez é considerada uma das obras-primas da polifonia renascentista, baseada em um hino gregoriano.',
      en: 'Josquin des Prez\'s "Missa Pange Lingua" is considered one of the masterpieces of Renaissance polyphony, based on a Gregorian hymn.',
    },
    category: 'Renascimento',
  },
  {
    id: '30',
    type: 'innovation',
    icon: '🎼',
    title: {
      pt: 'Concílio de Trento',
      en: 'Council of Trent',
    },
    content: {
      pt: 'O Concílio de Trento (1545-1563) quase baniu a polifonia da música sacra, mas a "Missa Papae Marcelli" de Palestrina a salvou.',
      en: 'The Council of Trent (1545-1563) almost banned polyphony from sacred music, but Palestrina\'s "Missa Papae Marcelli" saved it.',
    },
    category: 'Renascimento',
  },
  {
    id: '31',
    type: 'curiosity',
    icon: '🏰',
    title: {
      pt: 'Escola Franco-Flamenga',
      en: 'Franco-Flemish School',
    },
    content: {
      pt: 'Os compositores franco-flamengos dominaram a música europeia por 200 anos, espalhando-se por toda a Europa como maestros de capela.',
      en: 'Franco-Flemish composers dominated European music for 200 years, spreading throughout Europe as chapel masters.',
    },
    category: 'Renascimento',
  },
  {
    id: '32',
    type: 'instrument',
    icon: '🎹',
    title: {
      pt: 'Cravo Renascentista',
      en: 'Renaissance Harpsichord',
    },
    content: {
      pt: 'O cravo se tornou o rei dos instrumentos de teclado no Renascimento, com alguns exemplares tendo dois teclados e pedais.',
      en: 'The harpsichord became the king of keyboard instruments in the Renaissance, with some examples having two keyboards and pedals.',
    },
    category: 'Renascimento',
  },
  {
    id: '33',
    type: 'curiosity',
    icon: '📚',
    title: {
      pt: 'Chanson Francesa',
      en: 'French Chanson',
    },
    content: {
      pt: 'A chanson francesa renascentista influenciou toda a música secular europeia, com compositores como Clément Janequin imitando sons da natureza.',
      en: 'The Renaissance French chanson influenced all European secular music, with composers like Clément Janequin imitating sounds of nature.',
    },
    category: 'Renascimento',
  },
  {
    id: '34',
    type: 'technique',
    icon: '🎭',
    title: {
      pt: 'Palavra e Música',
      en: 'Word and Music',
    },
    content: {
      pt: 'Os compositores renascentistas desenvolveram a arte de "pintar" palavras com música, usando técnicas como melismas em palavras como "alegria".',
      en: 'Renaissance composers developed the art of "painting" words with music, using techniques like melismas on words like "joy."',
    },
    category: 'Renascimento',
  },
  {
    id: '35',
    type: 'curiosity',
    icon: '🎪',
    title: {
      pt: 'Dança da Corte',
      en: 'Court Dance',
    },
    content: {
      pt: 'As danças de corte renascentistas como pavana e galharda eram verdadeiros espetáculos sociais, com coreografias complexas.',
      en: 'Renaissance court dances like pavane and galliard were true social spectacles, with complex choreographies.',
    },
    category: 'Renascimento',
  },
  {
    id: '36',
    type: 'innovation',
    icon: '🌟',
    title: {
      pt: 'Camerata Florentina',
      en: 'Florentine Camerata',
    },
    content: {
      pt: 'A Camerata Florentina tentou recriar o drama grego antigo, acabando por inventar a ópera no final do século XVI.',
      en: 'The Florentine Camerata attempted to recreate ancient Greek drama, eventually inventing opera at the end of the 16th century.',
    },
    category: 'Renascimento',
  },
  {
    id: '37',
    type: 'curiosity',
    icon: '🎵',
    title: {
      pt: 'Lamento di Arianna',
      en: 'Lamento di Arianna',
    },
    content: {
      pt: 'O "Lamento di Arianna" de Monteverdi foi tão popular que existia em versão operística e em versão madrigal.',
      en: 'Monteverdi\'s "Lamento di Arianna" was so popular that it existed in both operatic and madrigal versions.',
    },
    category: 'Renascimento',
  },
  {
    id: '38',
    type: 'instrument',
    icon: '🎻',
    title: {
      pt: 'Família das Violas',
      en: 'Viola Family',
    },
    content: {
      pt: 'No Renascimento, a família das violas tinha seis tamanhos diferentes, do soprano ao contra-baixo, cada um com afinação específica.',
      en: 'In the Renaissance, the viola family had six different sizes, from soprano to contrabass, each with specific tuning.',
    },
    category: 'Renascimento',
  },
  {
    id: '39',
    type: 'curiosity',
    icon: '🏛️',
    title: {
      pt: 'Música Veneziana',
      en: 'Venetian Music',
    },
    content: {
      pt: 'A Basílica de São Marcos em Veneza tinha dois coros opostos, criando o estilo policoral com efeitos estereofônicos únicos.',
      en: "St. Mark's Basilica in Venice had two opposing choirs, creating the polychoral style with unique stereophonic effects.",
    },
    category: 'Renascimento',
  },
  {
    id: '40',
    type: 'technique',
    icon: '🔄',
    title: {
      pt: 'Cantus Firmus',
      en: 'Cantus Firmus',
    },
    content: {
      pt: 'A técnica do cantus firmus usava melodias pré-existentes (geralmente gregorianas) como base estrutural para composições polifônicas.',
      en: 'The cantus firmus technique used pre-existing melodies (usually Gregorian) as structural basis for polyphonic compositions.',
    },
    category: 'Renascimento',
  },
  {
    id: '41',
    type: 'curiosity',
    icon: '📖',
    title: {
      pt: 'El Maestro',
      en: 'El Maestro',
    },
    content: {
      pt: '"El Maestro" de Luis de Milán (1536) foi o primeiro livro de música para vihuela impresso na Espanha, influenciando toda a música de cordas.',
      en: '"El Maestro" by Luis de Milán (1536) was the first vihuela music book printed in Spain, influencing all string music.',
    },
    category: 'Renascimento',
  },
  {
    id: '42',
    type: 'innovation',
    icon: '🎭',
    title: {
      pt: 'Intermezzi',
      en: 'Intermezzi',
    },
    content: {
      pt: 'Os intermezzi eram espetáculos musicais entre os atos de peças teatrais, precursores diretos da ópera barroca.',
      en: 'Intermezzi were musical spectacles between acts of theatrical plays, direct precursors to Baroque opera.',
    },
    category: 'Renascimento',
  },
  {
    id: '43',
    type: 'curiosity',
    icon: '🌹',
    title: {
      pt: 'Guerra dos Madrigais',
      en: 'War of the Madrigals',
    },
    content: {
      pt: 'Houve uma verdadeira "guerra" estilística entre madrigalistas italianos, com compositores criando versões rivais das mesmas poesias.',
      en: 'There was a true stylistic "war" between Italian madrigalists, with composers creating rival versions of the same poems.',
    },
    category: 'Renascimento',
  },
  {
    id: '44',
    type: 'instrument',
    icon: '🎺',
    title: {
      pt: 'Sacabuxa',
      en: 'Sackbut',
    },
    content: {
      pt: 'A sacabuxa renascentista era o ancestral do trombone moderno, mas com sonoridade mais suave e adaptada à música vocal.',
      en: 'The Renaissance sackbut was the ancestor of the modern trombone, but with softer sound adapted to vocal music.',
    },
    category: 'Renascimento',
  },
  {
    id: '45',
    type: 'curiosity',
    icon: '📜',
    title: {
      pt: 'Cancionero de Palacio',
      en: 'Cancionero de Palacio',
    },
    content: {
      pt: 'O Cancionero de Palacio preserva a música da corte espanhola dos Reis Católicos, mostrando a fusão de tradições cristãs, árabes e judaicas.',
      en: 'The Cancionero de Palacio preserves music from the Spanish court of the Catholic Monarchs, showing the fusion of Christian, Arab, and Jewish traditions.',
    },
    category: 'Renascimento',
  },
  {
    id: '46',
    type: 'technique',
    icon: '🎯',
    title: {
      pt: 'Musica Ficta',
      en: 'Musica Ficta',
    },
    content: {
      pt: 'A musica ficta permitia aos intérpretes acrescentar acidentes não escritos, criando uma dimensão interpretativa perdida hoje.',
      en: 'Musica ficta allowed performers to add unwritten accidentals, creating an interpretive dimension lost today.',
    },
    category: 'Renascimento',
  },
  {
    id: '47',
    type: 'curiosity',
    icon: '🎪',
    title: {
      pt: "Commedia dell'Arte Musical",
      en: "Musical Commedia dell'Arte",
    },
    content: {
      pt: "A commedia dell'arte influenciou a música renascentista, com compositores criando canções para os personagens típicos como Arlequim.",
      en: "Commedia dell'arte influenced Renaissance music, with composers creating songs for typical characters like Harlequin.",
    },
    category: 'Renascimento',
  },
  {
    id: '48',
    type: 'innovation',
    icon: '🔢',
    title: {
      pt: 'Temperamento Mesotônico',
      en: 'Meantone Temperament',
    },
    content: {
      pt: 'O temperamento mesotônico renascentista privilegiava certas tonalidades, criando cores harmônicas distintas para cada tom.',
      en: 'Renaissance meantone temperament favored certain keys, creating distinct harmonic colors for each tone.',
    },
    category: 'Renascimento',
  },
  {
    id: '49',
    type: 'curiosity',
    icon: '👑',
    title: {
      pt: 'Henrique VIII Compositor',
      en: 'Henry VIII Composer',
    },
    content: {
      pt: 'O rei Henrique VIII da Inglaterra era compositor talentoso, tendo escrito "Greensleeves" e outras canções populares.',
      en: 'King Henry VIII of England was a talented composer, having written "Greensleeves" and other popular songs.',
    },
    category: 'Renascimento',
  },
  {
    id: '50',
    type: 'instrument',
    icon: '🎶',
    title: {
      pt: 'Consort Inglês',
      en: 'English Consort',
    },
    content: {
      pt: 'O "consort" inglês reunia instrumentos da mesma família (como violas) em diferentes tamanhos, criando texturas homogêneas únicas.',
      en: 'The English "consort" brought together instruments of the same family (like viols) in different sizes, creating unique homogeneous textures.',
    },
    category: 'Renascimento',
  },

  // PERÍODO BARROCO (50 curiosidades)
  {
    id: '51',
    type: 'curiosity',
    icon: '🎼',
    title: {
      pt: 'Bach e seus Filhos',
      en: 'Bach and his Sons',
    },
    content: {
      pt: 'Johann Sebastian Bach teve 20 filhos, e quatro deles (Wilhelm Friedemann, Carl Philipp Emanuel, Johann Christoph Friedrich e Johann Christian) tornaram-se compositores renomados.',
      en: 'Johann Sebastian Bach had 20 children, and four of them (Wilhelm Friedemann, Carl Philipp Emanuel, Johann Christoph Friedrich, and Johann Christian) became renowned composers.',
    },
    category: 'Barroco',
  },
  {
    id: '52',
    type: 'innovation',
    icon: '🎭',
    title: {
      pt: 'Nascimento da Ópera',
      en: 'Birth of Opera',
    },
    content: {
      pt: 'A primeira ópera conhecida, "Dafne" de Jacopo Peri (1598), marcou o nascimento de um gênero que dominaria a música por séculos.',
      en: 'The first known opera, "Dafne" by Jacopo Peri (1598), marked the birth of a genre that would dominate music for centuries.',
    },
    category: 'Barroco',
  },
  {
    id: '53',
    type: 'technique',
    icon: '🎵',
    title: {
      pt: 'Baixo Contínuo',
      en: 'Basso Continuo',
    },
    content: {
      pt: 'O baixo contínuo (basso continuo) era a "espinha dorsal" da música barroca, com cravo ou órgão realizando harmonias a partir de cifras.',
      en: 'The basso continuo was the "backbone" of Baroque music, with harpsichord or organ realizing harmonies from figured bass.',
    },
    category: 'Barroco',
  },
  {
    id: '54',
    type: 'curiosity',
    icon: '👑',
    title: {
      pt: 'Luís XIV e Lully',
      en: 'Louis XIV and Lully',
    },
    content: {
      pt: 'Luís XIV, o Rei Sol, dançava pessoalmente nas óperas de Lully, estabelecendo a ópera francesa como espetáculo da realeza.',
      en: "Louis XIV, the Sun King, personally danced in Lully's operas, establishing French opera as a royal spectacle.",
    },
    category: 'Barroco',
  },
  {
    id: '55',
    type: 'instrument',
    icon: '🎻',
    title: {
      pt: 'Stradivarius',
      en: 'Stradivarius',
    },
    content: {
      pt: 'Antonio Stradivari (1644-1737) produziu cerca de 1.100 instrumentos, dos quais 650 sobrevivem hoje, valendo milhões de dólares cada.',
      en: 'Antonio Stradivari (1644-1737) produced about 1,100 instruments, of which 650 survive today, each worth millions of dollars.',
    },
    category: 'Barroco',
  },
  {
    id: '56',
    type: 'curiosity',
    icon: '⛪',
    title: {
      pt: 'Bach Esquecido',
      en: 'Bach Forgotten',
    },
    content: {
      pt: 'Bach foi quase esquecido após sua morte, sendo redescoberto apenas quando Mendelssohn regeu a "Paixão segundo São Mateus" em 1829.',
      en: 'Bach was almost forgotten after his death, being rediscovered only when Mendelssohn conducted the "St. Matthew Passion" in 1829.',
    },
    category: 'Barroco',
  },
  {
    id: '57',
    type: 'technique',
    icon: '🔄',
    title: {
      pt: 'Fuga',
      en: 'Fugue',
    },
    content: {
      pt: 'A fuga barroca é como uma conversa musical onde um tema é apresentado e depois imitado por outras vozes em diferentes alturas.',
      en: 'The Baroque fugue is like a musical conversation where a theme is presented and then imitated by other voices at different pitches.',
    },
    category: 'Barroco',
  },
  {
    id: '58',
    type: 'curiosity',
    icon: '🎪',
    title: {
      pt: 'Castrati',
      en: 'Castrati',
    },
    content: {
      pt: 'Os castrati eram cantores masculinos castrados na infância para manter voz aguda, sendo as maiores estrelas da ópera barroca.',
      en: 'Castrati were male singers castrated in childhood to maintain high voices, being the biggest stars of Baroque opera.',
    },
    category: 'Barroco',
  },
  {
    id: '59',
    type: 'innovation',
    icon: '🎹',
    title: {
      pt: 'Temperamento Igual',
      en: 'Equal Temperament',
    },
    content: {
      pt: 'Bach demonstrou as possibilidades do temperamento igual no "Cravo Bem Temperado", permitindo tocar em todas as 24 tonalidades.',
      en: 'Bach demonstrated the possibilities of equal temperament in "The Well-Tempered Clavier," allowing performance in all 24 keys.',
    },
    category: 'Barroco',
  },
  {
    id: '60',
    type: 'curiosity',
    icon: '🌊',
    title: {
      pt: 'Água Musicada',
      en: 'Water Music',
    },
    content: {
      pt: 'A "Música Aquática" de Händel foi composta para acompanhar o rei Jorge I numa festa em barcos no Rio Tâmisa em 1717.',
      en: 'Handel\'s "Water Music" was composed to accompany King George I at a boat party on the River Thames in 1717.',
    },
    category: 'Barroco',
  },
  {
    id: '61',
    type: 'instrument',
    icon: '🎺',
    title: {
      pt: 'Trompete Barroco',
      en: 'Baroque Trumpet',
    },
    content: {
      pt: 'Os trompetes barrocos não tinham válvulas e tocavam apenas notas da série harmônica, exigindo técnica extraordinária dos músicos.',
      en: 'Baroque trumpets had no valves and played only notes from the harmonic series, requiring extraordinary technique from musicians.',
    },
    category: 'Barroco',
  },
  {
    id: '62',
    type: 'curiosity',
    icon: '💰',
    title: {
      pt: 'Vivaldi Empresário',
      en: 'Vivaldi Entrepreneur',
    },
    content: {
      pt: 'Vivaldi não era apenas compositor, mas também empresário musical, produzindo suas próprias óperas e gerenciando teatros em Veneza.',
      en: 'Vivaldi was not only a composer but also a musical entrepreneur, producing his own operas and managing theaters in Venice.',
    },
    category: 'Barroco',
  },
  {
    id: '63',
    type: 'technique',
    icon: '🎭',
    title: {
      pt: 'Affekt',
      en: 'Affekt',
    },
    content: {
      pt: 'A teoria dos Affekt (afetos) ditava que cada peça deveria expressar uma única emoção de forma consistente e intensa.',
      en: 'The theory of Affekt (affects) dictated that each piece should express a single emotion consistently and intensely.',
    },
    category: 'Barroco',
  },
  {
    id: '64',
    type: 'curiosity',
    icon: '🎻',
    title: {
      pt: 'As Quatro Estações',
      en: 'The Four Seasons',
    },
    content: {
      pt: 'Vivaldi escreveu "As Quatro Estações" como música programática, incluindo sonetos que descrevem cada movimento de forma detalhada.',
      en: 'Vivaldi wrote "The Four Seasons" as programmatic music, including sonnets that describe each movement in detail.',
    },
    category: 'Barroco',
  },
  {
    id: '65',
    type: 'innovation',
    icon: '🏛️',
    title: {
      pt: 'Concerto Grosso',
      en: 'Concerto Grosso',
    },
    content: {
      pt: 'O concerto grosso criou o contraste entre solistas (concertino) e orquestra (ripieno), estabelecendo o princípio do concerto moderno.',
      en: 'The concerto grosso created contrast between soloists (concertino) and orchestra (ripieno), establishing the principle of the modern concerto.',
    },
    category: 'Barroco',
  },
  {
    id: '66',
    type: 'curiosity',
    icon: '📚',
    title: {
      pt: 'Rameau Teórico',
      en: 'Rameau Theorist',
    },
    content: {
      pt: 'Jean-Philippe Rameau revolucionou a teoria musical com seu "Tratado de Harmonia" (1722), estabelecendo bases da harmonia tonal.',
      en: 'Jean-Philippe Rameau revolutionized music theory with his "Treatise on Harmony" (1722), establishing the foundations of tonal harmony.',
    },
    category: 'Barroco',
  },
  {
    id: '67',
    type: 'instrument',
    icon: '🎹',
    title: {
      pt: 'Cravo vs Piano',
      en: 'Harpsichord vs Piano',
    },
    content: {
      pt: 'O cravo barroco não podia fazer crescendos ou diminuendos, mas compensava com ornamentação elaborada e registros variados.',
      en: 'The Baroque harpsichord could not make crescendos or diminuendos, but compensated with elaborate ornamentation and varied registrations.',
    },
    category: 'Barroco',
  },
  {
    id: '68',
    type: 'curiosity',
    icon: '🎵',
    title: {
      pt: 'Händel vs Bach',
      en: 'Handel vs Bach',
    },
    content: {
      pt: 'Händel e Bach nasceram no mesmo ano (1685) na Alemanha, mas Händel tornou-se famoso internacionalmente enquanto Bach permaneceu local.',
      en: 'Handel and Bach were born in the same year (1685) in Germany, but Handel became internationally famous while Bach remained local.',
    },
    category: 'Barroco',
  },
  {
    id: '69',
    type: 'technique',
    icon: '⚡',
    title: {
      pt: 'Ritornello',
      en: 'Ritornello',
    },
    content: {
      pt: 'A forma ritornello alterava seções do grupo completo (tutti) com seções solísticas, criando dinamismo e contraste.',
      en: 'The ritornello form alternated full ensemble (tutti) sections with solo sections, creating dynamism and contrast.',
    },
    category: 'Barroco',
  },
  {
    id: '70',
    type: 'curiosity',
    icon: '🏰',
    title: {
      pt: 'Corte de Versalhes',
      en: 'Court of Versailles',
    },
    content: {
      pt: 'A música em Versalhes seguia etiqueta rígida: até a duração das peças era determinada pelo protocolo real francês.',
      en: 'Music at Versailles followed strict etiquette: even the duration of pieces was determined by French royal protocol.',
    },
    category: 'Barroco',
  },
  {
    id: '71',
    type: 'instrument',
    icon: '🥁',
    title: {
      pt: 'Tímpanos Barrocos',
      en: 'Baroque Timpani',
    },
    content: {
      pt: 'Os tímpanos barrocos eram afinados manualmente com chaves, limitando as mudanças de altura durante a performance.',
      en: 'Baroque timpani were tuned manually with keys, limiting pitch changes during performance.',
    },
    category: 'Barroco',
  },
  {
    id: '72',
    type: 'curiosity',
    icon: '🎭',
    title: {
      pt: 'Ópera Seria',
      en: 'Opera Seria',
    },
    content: {
      pt: 'A ópera seria seguia regras rígidas: exatamente seis personagens, alternância de recitativos e árias, e finais felizes obrigatórios.',
      en: 'Opera seria followed strict rules: exactly six characters, alternation of recitatives and arias, and mandatory happy endings.',
    },
    category: 'Barroco',
  },
  {
    id: '73',
    type: 'innovation',
    icon: '🎼',
    title: {
      pt: 'Suite de Danças',
      en: 'Dance Suite',
    },
    content: {
      pt: 'A suíte barroca padronizou a sequência Allemande-Courante-Sarabande-Gigue, representando diferentes países e características.',
      en: 'The Baroque suite standardized the sequence Allemande-Courante-Sarabande-Gigue, representing different countries and characteristics.',
    },
    category: 'Barroco',
  },
  {
    id: '74',
    type: 'curiosity',
    icon: '🌟',
    title: {
      pt: 'Farinelli',
      en: 'Farinelli',
    },
    content: {
      pt: 'Farinelli, o castrato mais famoso, tinha alcance vocal de três oitavas e meio e podia sustentar notas por mais de um minuto.',
      en: 'Farinelli, the most famous castrato, had a vocal range of three and a half octaves and could sustain notes for over a minute.',
    },
    category: 'Barroco',
  },
  {
    id: '75',
    type: 'technique',
    icon: '🎯',
    title: {
      pt: 'Ornamentação',
      en: 'Ornamentation',
    },
    content: {
      pt: 'A ornamentação barroca era parcialmente improvisada, com cada país desenvolvendo símbolos e estilos próprios de decoração.',
      en: 'Baroque ornamentation was partially improvised, with each country developing its own symbols and decoration styles.',
    },
    category: 'Barroco',
  },
  {
    id: '76',
    type: 'curiosity',
    icon: '⛪',
    title: {
      pt: 'Paixões de Bach',
      en: "Bach's Passions",
    },
    content: {
      pt: 'Bach compôs pelo menos cinco Paixões, mas apenas duas sobreviveram completas: segundo São Mateus e segundo São João.',
      en: 'Bach composed at least five Passions, but only two survived complete: St. Matthew and St. John.',
    },
    category: 'Barroco',
  },
  {
    id: '77',
    type: 'instrument',
    icon: '🎵',
    title: {
      pt: 'Viola da Gamba',
      en: 'Viola da Gamba',
    },
    content: {
      pt: 'A viola da gamba tinha até sete cordas e trastes, permitindo expressividade única que influenciou compositores como Bach.',
      en: 'The viola da gamba had up to seven strings and frets, allowing unique expressiveness that influenced composers like Bach.',
    },
    category: 'Barroco',
  },
  {
    id: '78',
    type: 'curiosity',
    icon: '🇮🇹',
    title: {
      pt: 'Escola Napolitana',
      en: 'Neapolitan School',
    },
    content: {
      pt: 'Nápoles era o centro mundial da ópera no século XVIII, com conservatórios que treinavam os melhores cantores da Europa.',
      en: 'Naples was the world center of opera in the 18th century, with conservatories that trained the best singers in Europe.',
    },
    category: 'Barroco',
  },
  {
    id: '79',
    type: 'innovation',
    icon: '🎹',
    title: {
      pt: 'Invenções de Bach',
      en: "Bach's Inventions",
    },
    content: {
      pt: 'Bach criou as "Invenções" especificamente como material didático, estabelecendo princípios pedagógicos ainda usados hoje.',
      en: 'Bach created the "Inventions" specifically as didactic material, establishing pedagogical principles still used today.',
    },
    category: 'Barroco',
  },
  {
    id: '80',
    type: 'curiosity',
    icon: '☕',
    title: {
      pt: 'Cantata do Café',
      en: 'Coffee Cantata',
    },
    content: {
      pt: 'Bach compôs a humorística "Cantata do Café" satirizando o vício feminino no café, bebida nova e controversa na época.',
      en: 'Bach composed the humorous "Coffee Cantata" satirizing women\'s addiction to coffee, a new and controversial drink at the time.',
    },
    category: 'Barroco',
  },
  {
    id: '81',
    type: 'technique',
    icon: '🔄',
    title: {
      pt: 'Imitação Canônica',
      en: 'Canonic Imitation',
    },
    content: {
      pt: 'O cânone barroco era mathematical music, com vozes seguindo regras estritas de imitação em diferentes intervalos de tempo.',
      en: 'The Baroque canon was mathematical music, with voices following strict rules of imitation at different time intervals.',
    },
    category: 'Barroco',
  },
  {
    id: '82',
    type: 'curiosity',
    icon: '🎪',
    title: {
      pt: 'Intermezzi Cômicos',
      en: 'Comic Intermezzi',
    },
    content: {
      pt: 'Os intermezzi cômicos entre atos de óperas sérias acabaram evoluindo para a ópera bufa, gênero independente.',
      en: 'Comic intermezzi between acts of serious operas eventually evolved into opera buffa, an independent genre.',
    },
    category: 'Barroco',
  },
  {
    id: '83',
    type: 'instrument',
    icon: '🎺',
    title: {
      pt: 'Trompa Natural',
      en: 'Natural Horn',
    },
    content: {
      pt: 'A trompa natural barroca usava diferentes tubos (crooks) para mudar de tonalidade, cada um alterando a cor do som.',
      en: 'The Baroque natural horn used different crooks to change key, each altering the color of sound.',
    },
    category: 'Barroco',
  },
  {
    id: '84',
    type: 'curiosity',
    icon: '🌊',
    title: {
      pt: 'Tempestades Musicais',
      en: 'Musical Storms',
    },
    content: {
      pt: 'As "tempestades" eram tópica musical barroca, com escalas rápidas, tremolo e dinâmicas contrastantes pintando a fúria natural.',
      en: 'Musical "storms" were a Baroque topic, with rapid scales, tremolo, and contrasting dynamics painting natural fury.',
    },
    category: 'Barroco',
  },
  {
    id: '85',
    type: 'innovation',
    icon: '📖',
    title: {
      pt: 'Partitura Moderna',
      en: 'Modern Score',
    },
    content: {
      pt: 'O sistema de partitura moderno, com chaves, armaduras e fórmulas de compasso padronizadas, foi estabelecido no Barroco.',
      en: 'The modern score system, with standardized clefs, key signatures, and time signatures, was established in the Baroque.',
    },
    category: 'Barroco',
  },
  {
    id: '86',
    type: 'curiosity',
    icon: '🎭',
    title: {
      pt: 'Ópera de Hambúrgo',
      en: 'Hamburg Opera',
    },
    content: {
      pt: 'A Ópera de Hambúrgo foi o primeiro teatro lírico público da Alemanha, democratizando o acesso à ópera além da aristocracia.',
      en: 'Hamburg Opera was the first public opera house in Germany, democratizing access to opera beyond the aristocracy.',
    },
    category: 'Barroco',
  },
  {
    id: '87',
    type: 'technique',
    icon: '🎨',
    title: {
      pt: 'Madrigalismo Tardio',
      en: 'Late Madrigalism',
    },
    content: {
      pt: 'O madrigalismo barroco levou a pintura musical ao extremo, com notas literalmente "subindo" em palavras como "céu".',
      en: 'Baroque madrigalism took musical painting to extremes, with notes literally "ascending" on words like "heaven."',
    },
    category: 'Barroco',
  },
  {
    id: '88',
    type: 'curiosity',
    icon: '⏰',
    title: {
      pt: 'Goldberg Variations',
      en: 'Goldberg Variations',
    },
    content: {
      pt: 'As Variações Goldberg foram encomendadas pelo Conde Keyserlingk para curar sua insônia, devendo ser tocadas durante a noite.',
      en: 'The Goldberg Variations were commissioned by Count Keyserlingk to cure his insomnia, meant to be played during the night.',
    },
    category: 'Barroco',
  },
  {
    id: '89',
    type: 'instrument',
    icon: '🎹',
    title: {
      pt: 'Clavicórdio',
      en: 'Clavichord',
    },
    content: {
      pt: 'O clavicórdio permitia vibrato (bebung) e controle dinâmico, sendo o instrumento de teclado mais expressivo da época.',
      en: 'The clavichord allowed vibrato (bebung) and dynamic control, being the most expressive keyboard instrument of the era.',
    },
    category: 'Barroco',
  },
  {
    id: '90',
    type: 'curiosity',
    icon: '🎼',
    title: {
      pt: 'Guerra dos Buffões',
      en: 'War of the Buffoons',
    },
    content: {
      pt: 'A "Guerre des Bouffons" em Paris dividiu intelectuais entre ópera francesa (Rameau) e italiana (Pergolesi), influenciando a estética.',
      en: 'The "Guerre des Bouffons" in Paris divided intellectuals between French opera (Rameau) and Italian (Pergolesi), influencing aesthetics.',
    },
    category: 'Barroco',
  },
  {
    id: '91',
    type: 'innovation',
    icon: '🎵',
    title: {
      pt: 'Forma Sonata Primitiva',
      en: 'Primitive Sonata Form',
    },
    content: {
      pt: 'A forma sonata começou a emergir no Barroco tardio, com Domenico Scarlatti explorando desenvolvimentos temáticos em suas sonatas.',
      en: 'Sonata form began to emerge in the late Baroque, with Domenico Scarlatti exploring thematic developments in his sonatas.',
    },
    category: 'Barroco',
  },
  {
    id: '92',
    type: 'curiosity',
    icon: '🏰',
    title: {
      pt: 'Música de Câmara',
      en: 'Chamber Music',
    },
    content: {
      pt: 'A música de câmara barroca era literalmente música para "câmaras" (quartos) pequenos, contrastando com música de igreja ou teatro.',
      en: 'Baroque chamber music was literally music for small "chambers" (rooms), contrasting with church or theater music.',
    },
    category: 'Barroco',
  },
  {
    id: '93',
    type: 'technique',
    icon: '⚖️',
    title: {
      pt: 'Rhetorica Musical',
      en: 'Musical Rhetoric',
    },
    content: {
      pt: 'Compositores barrocos estudavam retórica clássica, aplicando figuras de linguagem como anáfora e quiasmo na música.',
      en: 'Baroque composers studied classical rhetoric, applying figures of speech like anaphora and chiasmus in music.',
    },
    category: 'Barroco',
  },
  {
    id: '94',
    type: 'curiosity',
    icon: '🎻',
    title: {
      pt: 'Escola de Violino',
      en: 'Violin School',
    },
    content: {
      pt: 'Arcangelo Corelli estabeleceu a escola italiana de violino, padronizando técnicas de arco e dedilhado ainda usadas hoje.',
      en: 'Arcangelo Corelli established the Italian violin school, standardizing bow and fingering techniques still used today.',
    },
    category: 'Barroco',
  },
  {
    id: '95',
    type: 'instrument',
    icon: '🎶',
    title: {
      pt: 'Família de Flautas',
      en: 'Flute Family',
    },
    content: {
      pt: 'No Barroco existiam flautas em várias afinações (soprano, alto, tenor), cada uma com características timbrísticas específicas.',
      en: 'In the Baroque there were flutes in various tunings (soprano, alto, tenor), each with specific timbral characteristics.',
    },
    category: 'Barroco',
  },
  {
    id: '96',
    type: 'curiosity',
    icon: '📜',
    title: {
      pt: 'Manuscritos de Bach',
      en: "Bach's Manuscripts",
    },
    content: {
      pt: 'Bach copiava música de outros compositores para estudo, incluindo toda a obra de Vivaldi, absorvendo o estilo italiano.',
      en: "Bach copied music by other composers for study, including all of Vivaldi's work, absorbing the Italian style.",
    },
    category: 'Barroco',
  },
  {
    id: '97',
    type: 'innovation',
    icon: '🎭',
    title: {
      pt: 'Recitativo',
      en: 'Recitative',
    },
    content: {
      pt: 'O recitativo secco (com apenas cravo) permitia declamação natural do texto, aproximando a ópera da fala humana.',
      en: 'Recitativo secco (with harpsichord only) allowed natural text declamation, bringing opera closer to human speech.',
    },
    category: 'Barroco',
  },
  {
    id: '98',
    type: 'curiosity',
    icon: '🌟',
    title: {
      pt: 'Academia de Arcádia',
      en: 'Arcadian Academy',
    },
    content: {
      pt: 'A Academia de Arcádia em Roma padronizou libretos de ópera, estabelecendo temas pastorais e estruturas dramáticas.',
      en: 'The Arcadian Academy in Rome standardized opera librettos, establishing pastoral themes and dramatic structures.',
    },
    category: 'Barroco',
  },
  {
    id: '99',
    type: 'technique',
    icon: '🎯',
    title: {
      pt: 'Concertato',
      en: 'Concertato',
    },
    content: {
      pt: 'O estilo concertato barroco contrastava grupos instrumentais e vocais, criando efeitos de eco e diálogo espacial.',
      en: 'The Baroque concertato style contrasted instrumental and vocal groups, creating echo effects and spatial dialogue.',
    },
    category: 'Barroco',
  },
  {
    id: '100',
    type: 'curiosity',
    icon: '🎼',
    title: {
      pt: 'Arte da Fuga',
      en: 'Art of Fugue',
    },
    content: {
      pt: 'Bach morreu enquanto trabalhava na "Arte da Fuga", deixando a última fuga incompleta precisamente onde introduz seu nome.',
      en: 'Bach died while working on "The Art of Fugue," leaving the last fugue incomplete precisely where he introduces his name.',
    },
    category: 'Barroco',
  },

  // PERÍODO CLÁSSICO (50 curiosidades)
  {
    id: '101',
    type: 'curiosity',
    icon: '🎼',
    title: {
      pt: 'Mozart Precoce',
      en: 'Precocious Mozart',
    },
    content: {
      pt: 'Mozart começou a compor aos 5 anos e escreveu sua primeira sinfonia aos 8 anos, demonstrando um talento extraordinário desde a infância.',
      en: 'Mozart began composing at age 5 and wrote his first symphony at age 8, demonstrating extraordinary talent from childhood.',
    },
    category: 'Clássico',
  },
  {
    id: '102',
    type: 'innovation',
    icon: '🏛️',
    title: {
      pt: 'Forma Sonata',
      en: 'Sonata Form',
    },
    content: {
      pt: 'A forma sonata clássica (exposição-desenvolvimento-recapitulação) tornou-se a estrutura fundamental da música instrumental.',
      en: 'Classical sonata form (exposition-development-recapitulation) became the fundamental structure of instrumental music.',
    },
    category: 'Clássico',
  },
  {
    id: '103',
    type: 'curiosity',
    icon: '🎹',
    title: {
      pt: 'Revolução do Piano',
      en: 'Piano Revolution',
    },
    content: {
      pt: 'O fortepiano substituiu o cravo por permitir dinâmicas graduais, revolucionando a expressividade musical no período clássico.',
      en: 'The fortepiano replaced the harpsichord by allowing gradual dynamics, revolutionizing musical expressiveness in the Classical period.',
    },
    category: 'Clássico',
  },
  {
    id: '104',
    type: 'technique',
    icon: '⚖️',
    title: {
      pt: 'Clareza e Equilíbrio',
      en: 'Clarity and Balance',
    },
    content: {
      pt: 'O estilo clássico priorizava clareza formal, equilíbrio entre seções e elegância melódica sobre complexidade contrapuntística.',
      en: 'The Classical style prioritized formal clarity, balance between sections, and melodic elegance over contrapuntal complexity.',
    },
    category: 'Clássico',
  },
  {
    id: '105',
    type: 'curiosity',
    icon: '👑',
    title: {
      pt: 'Haydn "Pai da Sinfonia"',
      en: 'Haydn "Father of Symphony"',
    },
    content: {
      pt: 'Haydn compôs 104 sinfonias, estabelecendo o gênero sinfônico e ganhando o título de "Pai da Sinfonia".',
      en: 'Haydn composed 104 symphonies, establishing the symphonic genre and earning the title "Father of the Symphony."',
    },
    category: 'Clássico',
  },
  {
    id: '106',
    type: 'innovation',
    icon: '🎭',
    title: {
      pt: 'Ópera Buffa',
      en: 'Opera Buffa',
    },
    content: {
      pt: 'A ópera buffa democratizou a ópera com personagens comuns e situações cotidianas, contrastando com a ópera seria aristocrática.',
      en: 'Opera buffa democratized opera with common characters and everyday situations, contrasting with aristocratic opera seria.',
    },
    category: 'Clássico',
  },
  {
    id: '107',
    type: 'curiosity',
    icon: '🎵',
    title: {
      pt: 'Quarteto de Cordas',
      en: 'String Quartet',
    },
    content: {
      pt: 'Haydn praticamente inventou o quarteto de cordas moderno, compondo 83 quartetos que definiram o gênero.',
      en: 'Haydn virtually invented the modern string quartet, composing 83 quartets that defined the genre.',
    },
    category: 'Clássico',
  },
  {
    id: '108',
    type: 'instrument',
    icon: '🎺',
    title: {
      pt: 'Clarinete Clássico',
      en: 'Classical Clarinet',
    },
    content: {
      pt: 'Mozart foi um dos primeiros compositores a explorar totalmente o clarinete, escrevendo seu famoso Concerto em Lá maior.',
      en: 'Mozart was one of the first composers to fully explore the clarinet, writing his famous Concerto in A major.',
    },
    category: 'Clássico',
  },
  {
    id: '109',
    type: 'curiosity',
    icon: '⛪',
    title: {
      pt: 'Requiem de Mozart',
      en: "Mozart's Requiem",
    },
    content: {
      pt: 'Mozart estava compondo seu Requiem quando morreu, deixando a obra inacabada e envolta em mistério até hoje.',
      en: 'Mozart was composing his Requiem when he died, leaving the work unfinished and shrouded in mystery to this day.',
    },
    category: 'Clássico',
  },
  {
    id: '110',
    type: 'technique',
    icon: '🎯',
    title: {
      pt: 'Desenvolvimento Motívico',
      en: 'Motivic Development',
    },
    content: {
      pt: 'Beethoven levou o desenvolvimento motívico ao extremo, construindo movimentos inteiros a partir de fragmentos melódicos simples.',
      en: 'Beethoven took motivic development to extremes, building entire movements from simple melodic fragments.',
    },
    category: 'Clássico',
  },
  {
    id: '111',
    type: 'curiosity',
    icon: '🏰',
    title: {
      pt: 'Corte de Esterházy',
      en: 'Esterházy Court',
    },
    content: {
      pt: 'Haydn trabalhou 30 anos para a família Esterházy, isolado mas com orquestra própria para experimentar suas composições.',
      en: 'Haydn worked 30 years for the Esterházy family, isolated but with his own orchestra to experiment with his compositions.',
    },
    category: 'Clássico',
  },
  {
    id: '112',
    type: 'innovation',
    icon: '🎶',
    title: {
      pt: 'Concerto Clássico',
      en: 'Classical Concerto',
    },
    content: {
      pt: 'O concerto clássico estabeleceu o padrão de três movimentos (rápido-lento-rápido) e a cadenza como momento de virtuosismo.',
      en: 'The Classical concerto established the three-movement pattern (fast-slow-fast) and the cadenza as a moment of virtuosity.',
    },
    category: 'Clássico',
  },
  {
    id: '113',
    type: 'curiosity',
    icon: '🎭',
    title: {
      pt: 'As Bodas de Fígaro',
      en: 'The Marriage of Figaro',
    },
    content: {
      pt: 'A ópera "As Bodas de Fígaro" de Mozart foi inicialmente censurada por criticar a aristocracia, mas conseguiu estrear em Viena.',
      en: 'Mozart\'s opera "The Marriage of Figaro" was initially censored for criticizing the aristocracy, but managed to premiere in Vienna.',
    },
    category: 'Clássico',
  },
  {
    id: '114',
    type: 'technique',
    icon: '🔄',
    title: {
      pt: 'Rondó Clássico',
      en: 'Classical Rondo',
    },
    content: {
      pt: 'A forma rondó (ABACA ou ABACABA) tornou-se padrão para movimentos finais, proporcionando leveza e memorabilidade.',
      en: 'The rondo form (ABACA or ABACABA) became standard for final movements, providing lightness and memorability.',
    },
    category: 'Clássico',
  },
  {
    id: '115',
    type: 'curiosity',
    icon: '🌟',
    title: {
      pt: 'Mannheim Rocket',
      en: 'Mannheim Rocket',
    },
    content: {
      pt: 'A Orquestra de Mannheim criou o "foguete de Mannheim" - escalas ascendentes rápidas que causavam sensação na audiência.',
      en: 'The Mannheim Orchestra created the "Mannheim rocket" - rapid ascending scales that caused sensation in the audience.',
    },
    category: 'Clássico',
  },
  {
    id: '116',
    type: 'instrument',
    icon: '🥁',
    title: {
      pt: 'Tímpanos Temperados',
      en: 'Tempered Timpani',
    },
    content: {
      pt: 'No período clássico, os tímpanos começaram a ser afinados cromàticamente, expandindo suas possibilidades melódicas.',
      en: 'In the Classical period, timpani began to be tuned chromatically, expanding their melodic possibilities.',
    },
    category: 'Clássico',
  },
  {
    id: '117',
    type: 'curiosity',
    icon: '💰',
    title: {
      pt: 'Mozart e Dinheiro',
      en: 'Mozart and Money',
    },
    content: {
      pt: 'Apesar do talento, Mozart teve problemas financeiros crônicos, morrendo pobre e sendo enterrado numa vala comum.',
      en: 'Despite his talent, Mozart had chronic financial problems, dying poor and being buried in a common grave.',
    },
    category: 'Clássico',
  },
  {
    id: '118',
    type: 'innovation',
    icon: '🎼',
    title: {
      pt: 'Orquestra Clássica',
      en: 'Classical Orchestra',
    },
    content: {
      pt: 'A orquestra clássica padronizou instrumentação: cordas, madeiras aos pares, 2 trompas e às vezes trompetes e tímpanos.',
      en: 'The Classical orchestra standardized instrumentation: strings, woodwinds in pairs, 2 horns and sometimes trumpets and timpani.',
    },
    category: 'Clássico',
  },
  {
    id: '119',
    type: 'curiosity',
    icon: '🎹',
    title: {
      pt: 'Sonatas de Scarlatti',
      en: "Scarlatti's Sonatas",
    },
    content: {
      pt: 'Domenico Scarlatti compôs 555 sonatas para cravo, explorando técnicas que anteciparam o virtuosismo pianístico.',
      en: 'Domenico Scarlatti composed 555 sonatas for harpsichord, exploring techniques that anticipated pianistic virtuosity.',
    },
    category: 'Clássico',
  },
  {
    id: '120',
    type: 'technique',
    icon: '⚡',
    title: {
      pt: 'Sturm und Drang',
      en: 'Sturm und Drang',
    },
    content: {
      pt: 'O movimento "Sturm und Drang" influenciou compositores como Haydn a usar tonalidades menores e expressões dramáticas.',
      en: 'The "Sturm und Drang" movement influenced composers like Haydn to use minor keys and dramatic expressions.',
    },
    category: 'Clássico',
  },
  {
    id: '121',
    type: 'curiosity',
    icon: '🎪',
    title: {
      pt: 'Música Turca',
      en: 'Turkish Music',
    },
    content: {
      pt: 'A "música turca" estava na moda no século XVIII, com Mozart incorporando percussão exótica no Rapto do Serralho.',
      en: 'Turkish music was fashionable in the 18th century, with Mozart incorporating exotic percussion in The Abduction from the Seraglio.',
    },
    category: 'Clássico',
  },
  {
    id: '122',
    type: 'instrument',
    icon: '🎻',
    title: {
      pt: 'Escola de Arco',
      en: 'Bow School',
    },
    content: {
      pt: 'O arco moderno foi aperfeiçoado por François Tourte, permitindo maior controle dinâmico e articulação.',
      en: 'The modern bow was perfected by François Tourte, allowing greater dynamic control and articulation.',
    },
    category: 'Clássico',
  },
  {
    id: '123',
    type: 'curiosity',
    icon: '📚',
    title: {
      pt: 'C.P.E. Bach',
      en: 'C.P.E. Bach',
    },
    content: {
      pt: 'Carl Philipp Emanuel Bach, filho de J.S. Bach, foi considerado o maior compositor de sua época, influenciando Mozart.',
      en: "Carl Philipp Emanuel Bach, J.S. Bach's son, was considered the greatest composer of his time, influencing Mozart.",
    },
    category: 'Clássico',
  },
  {
    id: '124',
    type: 'innovation',
    icon: '🎭',
    title: {
      pt: 'Singspiel',
      en: 'Singspiel',
    },
    content: {
      pt: 'O Singspiel alemão combinava música e diálogos falados, democratizando a ópera em língua vernácula.',
      en: 'German Singspiel combined music and spoken dialogue, democratizing opera in vernacular language.',
    },
    category: 'Clássico',
  },
  {
    id: '125',
    type: 'curiosity',
    icon: '🌙',
    title: {
      pt: 'Sonata ao Luar',
      en: 'Moonlight Sonata',
    },
    content: {
      pt: 'A "Sonata ao Luar" de Beethoven só recebeu esse nome após sua morte - ele a dedicou à Condessa Giulietta Guicciardi.',
      en: 'Beethoven\'s "Moonlight Sonata" only received this name after his death - he dedicated it to Countess Giulietta Guicciardi.',
    },
    category: 'Clássico',
  },
  {
    id: '126',
    type: 'technique',
    icon: '🎯',
    title: {
      pt: 'Tema com Variações',
      en: 'Theme and Variations',
    },
    content: {
      pt: 'As variações clássicas exploravam diferentes aspectos de um tema: ornamentação, mudança de modo, alteração rítmica.',
      en: 'Classical variations explored different aspects of a theme: ornamentation, mode change, rhythmic alteration.',
    },
    category: 'Clássico',
  },
  {
    id: '127',
    type: 'curiosity',
    icon: '🎵',
    title: {
      pt: 'Minueto e Trio',
      en: 'Minuet and Trio',
    },
    content: {
      pt: 'O minueto era a única forma de dança que sobreviveu na sinfonia clássica, sempre no terceiro movimento.',
      en: 'The minuet was the only dance form that survived in the Classical symphony, always in the third movement.',
    },
    category: 'Clássico',
  },
  {
    id: '128',
    type: 'instrument',
    icon: '🎺',
    title: {
      pt: 'Trompa Clássica',
      en: 'Classical Horn',
    },
    content: {
      pt: 'Mozart revolucionou a escrita para trompa, tratando-a como instrumento melódico e não apenas de apoio harmônico.',
      en: 'Mozart revolutionized horn writing, treating it as a melodic instrument and not just harmonic support.',
    },
    category: 'Clássico',
  },
  {
    id: '129',
    type: 'curiosity',
    icon: '🏛️',
    title: {
      pt: 'Concertos Públicos',
      en: 'Public Concerts',
    },
    content: {
      pt: 'O período clássico viu o nascimento dos concertos públicos, democratizando o acesso à música além da aristocracia.',
      en: 'The Classical period saw the birth of public concerts, democratizing access to music beyond the aristocracy.',
    },
    category: 'Clássico',
  },
  {
    id: '130',
    type: 'innovation',
    icon: '📖',
    title: {
      pt: 'Publicação Musical',
      en: 'Music Publishing',
    },
    content: {
      pt: 'A impressão musical em larga escala permitiu disseminação internacional das obras, criando um "mercado" musical.',
      en: 'Large-scale music printing allowed international dissemination of works, creating a musical "market."',
    },
    category: 'Clássico',
  },
  {
    id: '131',
    type: 'curiosity',
    icon: '🎼',
    title: {
      pt: 'Sinfonia Pastoral',
      en: 'Pastoral Symphony',
    },
    content: {
      pt: 'A 6ª Sinfonia de Beethoven foi uma das primeiras sinfonias programáticas, descrevendo cenas da vida rural.',
      en: "Beethoven's 6th Symphony was one of the first programmatic symphonies, describing scenes of rural life.",
    },
    category: 'Clássico',
  },
  {
    id: '132',
    type: 'technique',
    icon: '🔄',
    title: {
      pt: 'Modulação Clássica',
      en: 'Classical Modulation',
    },
    content: {
      pt: 'As modulações clássicas seguiam rotas harmônicas previsíveis: tônica para dominante na exposição, explorações no desenvolvimento.',
      en: 'Classical modulations followed predictable harmonic routes: tonic to dominant in exposition, explorations in development.',
    },
    category: 'Clássico',
  },
  {
    id: '133',
    type: 'curiosity',
    icon: '🎭',
    title: {
      pt: 'Don Giovanni',
      en: 'Don Giovanni',
    },
    content: {
      pt: 'A ópera "Don Giovanni" de Mozart foi chamada de "ópera das óperas" por muitos críticos e compositores posteriores.',
      en: 'Mozart\'s opera "Don Giovanni" was called the "opera of operas" by many later critics and composers.',
    },
    category: 'Clássico',
  },
  {
    id: '134',
    type: 'instrument',
    icon: '🎹',
    title: {
      pt: 'Sonata para Piano',
      en: 'Piano Sonata',
    },
    content: {
      pt: 'Beethoven expandiu a sonata para piano de entretenimento doméstico para forma artística profunda e pessoal.',
      en: 'Beethoven expanded the piano sonata from domestic entertainment to a deep and personal artistic form.',
    },
    category: 'Clássico',
  },
  {
    id: '135',
    type: 'curiosity',
    icon: '👂',
    title: {
      pt: 'Surdez de Beethoven',
      en: "Beethoven's Deafness",
    },
    content: {
      pt: 'Beethoven começou a perder audição aos 28 anos, mas compôs suas obras mais importantes já completamente surdo.',
      en: 'Beethoven began losing his hearing at age 28, but composed his most important works while completely deaf.',
    },
    category: 'Clássico',
  },
  {
    id: '136',
    type: 'innovation',
    icon: '🎶',
    title: {
      pt: 'Frase Musical',
      en: 'Musical Phrase',
    },
    content: {
      pt: 'O período clássico estabeleceu a frase de 8 compassos (antecedente-consequente) como unidade básica da música.',
      en: 'The Classical period established the 8-bar phrase (antecedent-consequent) as the basic unit of music.',
    },
    category: 'Clássico',
  },
  {
    id: '137',
    type: 'curiosity',
    icon: '🌟',
    title: {
      pt: 'Crianças Prodígio',
      en: 'Child Prodigies',
    },
    content: {
      pt: 'Além de Mozart, o período clássico teve muitas crianças prodígio, incluindo Hummel, que estudou com Mozart.',
      en: 'Besides Mozart, the Classical period had many child prodigies, including Hummel, who studied with Mozart.',
    },
    category: 'Clássico',
  },
  {
    id: '138',
    type: 'technique',
    icon: '⚖️',
    title: {
      pt: 'Proporção Áurea',
      en: 'Golden Ratio',
    },
    content: {
      pt: 'Muitas obras clássicas seguem proporções matemáticas, com clímaxes ocorrendo em pontos de proporção áurea.',
      en: 'Many Classical works follow mathematical proportions, with climaxes occurring at golden ratio points.',
    },
    category: 'Clássico',
  },
  {
    id: '139',
    type: 'curiosity',
    icon: '🎹',
    title: {
      pt: 'Competição Musical',
      en: 'Musical Competition',
    },
    content: {
      pt: 'Mozart e Clementi fizeram uma famosa competição de piano diante do Imperador José II em 1781.',
      en: 'Mozart and Clementi had a famous piano competition before Emperor Joseph II in 1781.',
    },
    category: 'Clássico',
  },
  {
    id: '140',
    type: 'instrument',
    icon: '🎵',
    title: {
      pt: 'Flauta Clássica',
      en: 'Classical Flute',
    },
    content: {
      pt: 'A flauta de madeira foi gradualmente substituída pela de metal no período clássico, mudando seu timbre.',
      en: 'The wooden flute was gradually replaced by metal in the Classical period, changing its timbre.',
    },
    category: 'Clássico',
  },
  {
    id: '141',
    type: 'curiosity',
    icon: '📜',
    title: {
      pt: 'Cartas de Mozart',
      en: "Mozart's Letters",
    },
    content: {
      pt: 'As cartas de Mozart revelam sua personalidade irreverente e humor escatológico, contrastando com sua música sublime.',
      en: "Mozart's letters reveal his irreverent personality and scatological humor, contrasting with his sublime music.",
    },
    category: 'Clássico',
  },
  {
    id: '142',
    type: 'innovation',
    icon: '🎭',
    title: {
      pt: 'Ópera Reformada',
      en: 'Reformed Opera',
    },
    content: {
      pt: 'Gluck reformou a ópera eliminando ornamentação excessiva e priorizando drama e expressão natural.',
      en: 'Gluck reformed opera by eliminating excessive ornamentation and prioritizing drama and natural expression.',
    },
    category: 'Clássico',
  },
  {
    id: '143',
    type: 'curiosity',
    icon: '🏰',
    title: {
      pt: 'Salzburgo',
      en: 'Salzburg',
    },
    content: {
      pt: 'Mozart odiava trabalhar para o Arcebispo de Salzburgo, chegando a ser literalmente "chutado" para fora do palácio.',
      en: 'Mozart hated working for the Archbishop of Salzburg, literally being "kicked" out of the palace.',
    },
    category: 'Clássico',
  },
  {
    id: '144',
    type: 'technique',
    icon: '🎯',
    title: {
      pt: 'Cadência Clássica',
      en: 'Classical Cadence',
    },
    content: {
      pt: 'A cadência perfeita (V-I) tornou-se fundamental na música clássica, criando pontos de repouso estruturais.',
      en: 'The perfect cadence (V-I) became fundamental in Classical music, creating structural points of rest.',
    },
    category: 'Clássico',
  },
  {
    id: '145',
    type: 'curiosity',
    icon: '🎼',
    title: {
      pt: 'Sinfonia nº 41',
      en: 'Symphony No. 41',
    },
    content: {
      pt: 'A última sinfonia de Mozart (nº 41 "Júpiter") termina com uma fuga dupla que combina cinco temas simultaneamente.',
      en: 'Mozart\'s last symphony (No. 41 "Jupiter") ends with a double fugue that combines five themes simultaneously.',
    },
    category: 'Clássico',
  },
  {
    id: '146',
    type: 'instrument',
    icon: '🎺',
    title: {
      pt: 'Serpentão',
      en: 'Serpent',
    },
    content: {
      pt: 'O serpentão, precursor da tuba, era usado em igrejas e bandas militares por seu som poderoso nos graves.',
      en: 'The serpent, precursor to the tuba, was used in churches and military bands for its powerful bass sound.',
    },
    category: 'Clássico',
  },
  {
    id: '147',
    type: 'curiosity',
    icon: '💫',
    title: {
      pt: 'Estrela Cadente',
      en: 'Shooting Star',
    },
    content: {
      pt: 'Haydn incluiu efeitos especiais como tiros de canhão na "Sinfonia Militar" e relógio na "Sinfonia do Relógio".',
      en: 'Haydn included special effects like cannon shots in the "Military Symphony" and clock in the "Clock Symphony."',
    },
    category: 'Clássico',
  },
  {
    id: '148',
    type: 'innovation',
    icon: '📚',
    title: {
      pt: 'Educação Musical',
      en: 'Music Education',
    },
    content: {
      pt: 'O método de Clementi "Gradus ad Parnassum" estabeleceu princípios de ensino pianístico ainda usados hoje.',
      en: 'Clementi\'s method "Gradus ad Parnassum" established principles of piano teaching still used today.',
    },
    category: 'Clássico',
  },
  {
    id: '149',
    type: 'curiosity',
    icon: '🎵',
    title: {
      pt: 'Divertimento',
      en: 'Divertimento',
    },
    content: {
      pt: 'Os divertimenti eram música de entretenimento para eventos sociais, mais leves que sinfonias mas ainda sofisticados.',
      en: 'Divertimenti were entertainment music for social events, lighter than symphonies but still sophisticated.',
    },
    category: 'Clássico',
  },
  {
    id: '150',
    type: 'technique',
    icon: '🌟',
    title: {
      pt: 'Estilo Galante',
      en: 'Galant Style',
    },
    content: {
      pt: 'O estilo galante priorizava melodias elegantes e acompanhamentos simples, rejeitando a complexidade barroca.',
      en: 'The galant style prioritized elegant melodies and simple accompaniments, rejecting Baroque complexity.',
    },
    category: 'Clássico',
  }, // PERÍODO ROMÂNTICO (50 curiosidades)
  {
    id: '151',
    type: 'curiosity',
    icon: '💕',
    title: {
      pt: 'Amor e Música',
      en: 'Love and Music',
    },
    content: {
      pt: 'Schumann dedicou seu "Ano das Canções" (1840) a Clara Wieck, compondo 138 lieder no ano de seu casamento.',
      en: 'Schumann dedicated his "Year of Songs" (1840) to Clara Wieck, composing 138 lieder in the year of their marriage.',
    },
    category: 'Romântico',
  },
  {
    id: '152',
    type: 'innovation',
    icon: '🎼',
    title: {
      pt: 'Música Programática',
      en: 'Program Music',
    },
    content: {
      pt: 'A "Sinfonia Fantástica" de Berlioz revolucionou a música sinfônica ao contar uma história específica através de música.',
      en: 'Berlioz\'s "Symphonie Fantastique" revolutionized symphonic music by telling a specific story through music.',
    },
    category: 'Romântico',
  },
  {
    id: '153',
    type: 'curiosity',
    icon: '🎹',
    title: {
      pt: 'Liszt Popstar',
      en: 'Liszt Popstar',
    },
    content: {
      pt: 'Franz Liszt causava "Lisztomania" - histeria coletiva em seus concertos, sendo considerado o primeiro popstar da música clássica.',
      en: 'Franz Liszt caused "Lisztomania" - collective hysteria at his concerts, being considered the first popstar of classical music.',
    },
    category: 'Romântico',
  },
  {
    id: '154',
    type: 'technique',
    icon: '🌊',
    title: {
      pt: 'Rubato',
      en: 'Rubato',
    },
    content: {
      pt: 'O rubato romântico permitia flexibilidade temporal expressiva, com Chopin sendo mestre nesta técnica interpretativa.',
      en: 'Romantic rubato allowed expressive temporal flexibility, with Chopin being a master of this interpretive technique.',
    },
    category: 'Romântico',
  },
  {
    id: '155',
    type: 'instrument',
    icon: '🎹',
    title: {
      pt: 'Piano Romântico',
      en: 'Romantic Piano',
    },
    content: {
      pt: 'O piano romântico ganhou pedais, maior extensão e som mais poderoso, inspirando o virtuosismo de Liszt e Chopin.',
      en: 'The Romantic piano gained pedals, greater range, and more powerful sound, inspiring the virtuosity of Liszt and Chopin.',
    },
    category: 'Romântico',
  },
  {
    id: '156',
    type: 'curiosity',
    icon: '🌙',
    title: {
      pt: 'Noturnos de Chopin',
      en: "Chopin's Nocturnes",
    },
    content: {
      pt: 'Chopin criou o noturno pianístico moderno, inspirado nos noturnos para piano de John Field mas com maior sofisticação.',
      en: "Chopin created the modern pianistic nocturne, inspired by John Field's piano nocturnes but with greater sophistication.",
    },
    category: 'Romântico',
  },
  {
    id: '157',
    type: 'innovation',
    icon: '🎭',
    title: {
      pt: 'Leitmotiv',
      en: 'Leitmotif',
    },
    content: {
      pt: 'Wagner desenvolveu o sistema de leitmotiv - temas musicais associados a personagens, objetos ou ideias específicas.',
      en: 'Wagner developed the leitmotif system - musical themes associated with specific characters, objects, or ideas.',
    },
    category: 'Romântico',
  },
  {
    id: '158',
    type: 'curiosity',
    icon: '💰',
    title: {
      pt: 'Paganini Diabólico',
      en: 'Diabolic Paganini',
    },
    content: {
      pt: 'Paganini era tão virtuoso que rumores diziam ter vendido a alma ao diabo - suas técnicas violinísticas pareciam impossíveis.',
      en: 'Paganini was so virtuosic that rumors said he had sold his soul to the devil - his violin techniques seemed impossible.',
    },
    category: 'Romântico',
  },
  {
    id: '159',
    type: 'technique',
    icon: '🎨',
    title: {
      pt: 'Miniatura Musical',
      en: 'Musical Miniature',
    },
    content: {
      pt: 'O Romantismo valorizou formas pequenas como o lied, mazurca e impromptu, explorando momentos íntimos de expressão.',
      en: 'Romanticism valued small forms like the lied, mazurka, and impromptu, exploring intimate moments of expression.',
    },
    category: 'Romântico',
  },
  {
    id: '160',
    type: 'curiosity',
    icon: '🏰',
    title: {
      pt: 'Castelos e Natureza',
      en: 'Castles and Nature',
    },
    content: {
      pt: 'Os românticos se inspiravam na natureza e ruínas medievais - Mendelssohn compôs após visitar as Hébridas na Escócia.',
      en: 'Romantics were inspired by nature and medieval ruins - Mendelssohn composed after visiting the Hebrides in Scotland.',
    },
    category: 'Romântico',
  },
  {
    id: '161',
    type: 'instrument',
    icon: '🎺',
    title: {
      pt: 'Válvulas de Bronze',
      en: 'Brass Valves',
    },
    content: {
      pt: 'A invenção das válvulas transformou trompetes e trompas em instrumentos cromáticos, expandindo suas possibilidades.',
      en: 'The invention of valves transformed trumpets and horns into chromatic instruments, expanding their possibilities.',
    },
    category: 'Romântico',
  },
  {
    id: '162',
    type: 'curiosity',
    icon: '📚',
    title: {
      pt: 'Literatura e Música',
      en: 'Literature and Music',
    },
    content: {
      pt: 'Berlioz baseou obras em Shakespeare, Byron e Goethe, estabelecendo conexões profundas entre música e literatura.',
      en: 'Berlioz based works on Shakespeare, Byron, and Goethe, establishing deep connections between music and literature.',
    },
    category: 'Romântico',
  },
  {
    id: '163',
    type: 'innovation',
    icon: '🎶',
    title: {
      pt: 'Forma Cíclica',
      en: 'Cyclical Form',
    },
    content: {
      pt: 'Berlioz e Liszt desenvolveram a forma cíclica, onde temas retornam transformados ao longo de obras multi-movimentos.',
      en: 'Berlioz and Liszt developed cyclical form, where themes return transformed throughout multi-movement works.',
    },
    category: 'Romântico',
  },
  {
    id: '164',
    type: 'curiosity',
    icon: '🌟',
    title: {
      pt: 'Virtuosismo Transcendental',
      en: 'Transcendental Virtuosity',
    },
    content: {
      pt: 'Os "Estudos Transcendentais" de Liszt levaram a técnica pianística aos limites extremos da possibilidade humana.',
      en: 'Liszt\'s "Transcendental Études" pushed piano technique to the extreme limits of human possibility.',
    },
    category: 'Romântico',
  },
  {
    id: '165',
    type: 'technique',
    icon: '🎭',
    title: {
      pt: 'Drama Musical',
      en: 'Music Drama',
    },
    content: {
      pt: 'Wagner revolucionou a ópera com "dramas musicais" onde música, texto e cenário formavam uma obra de arte total.',
      en: 'Wagner revolutionized opera with "music dramas" where music, text, and staging formed a total work of art.',
    },
    category: 'Romântico',
  },
  {
    id: '166',
    type: 'curiosity',
    icon: '🏔️',
    title: {
      pt: 'Alpinismo Musical',
      en: 'Musical Mountaineering',
    },
    content: {
      pt: 'Liszt compôs "Années de Pèlerinage" baseado em suas viagens pela Suíça e Itália, criando "cartões postais" musicais.',
      en: 'Liszt composed "Années de Pèlerinage" based on his travels through Switzerland and Italy, creating musical "postcards."',
    },
    category: 'Romântico',
  },
  {
    id: '167',
    type: 'instrument',
    icon: '🎻',
    title: {
      pt: 'Violino Romântico',
      en: 'Romantic Violin',
    },
    content: {
      pt: 'O arco de Tourte e cordas de metal permitiram maior potência sonora, atendendo às demandas expressivas românticas.',
      en: 'The Tourte bow and metal strings allowed greater sonic power, meeting Romantic expressive demands.',
    },
    category: 'Romântico',
  },
  {
    id: '168',
    type: 'curiosity',
    icon: '💔',
    title: {
      pt: 'Amor Não Correspondido',
      en: 'Unrequited Love',
    },
    content: {
      pt: 'Brahms amou Clara Schumann por toda vida, mas nunca se casaram - essa tensão emocional permeia sua música.',
      en: 'Brahms loved Clara Schumann his whole life, but they never married - this emotional tension permeates his music.',
    },
    category: 'Romântico',
  },
  {
    id: '169',
    type: 'innovation',
    icon: '🎼',
    title: {
      pt: 'Poema Sinfônico',
      en: 'Symphonic Poem',
    },
    content: {
      pt: 'Liszt inventou o poema sinfônico - forma orquestral de um movimento que narra história ou evoca imagens.',
      en: 'Liszt invented the symphonic poem - a single-movement orchestral form that narrates a story or evokes images.',
    },
    category: 'Romântico',
  },
  {
    id: '170',
    type: 'curiosity',
    icon: '🌹',
    title: {
      pt: 'Baladas de Chopin',
      en: "Chopin's Ballades",
    },
    content: {
      pt: 'As quatro baladas de Chopin foram inspiradas por poemas de Adam Mickiewicz, criando narrativas musicais abstratas.',
      en: "Chopin's four ballades were inspired by poems by Adam Mickiewicz, creating abstract musical narratives.",
    },
    category: 'Romântico',
  },
  {
    id: '171',
    type: 'technique',
    icon: '🎨',
    title: {
      pt: 'Colorismo Orquestral',
      en: 'Orchestral Colorism',
    },
    content: {
      pt: 'Berlioz foi pioneiro na orquestração colorística, usando timbres instrumentais como um pintor usa cores.',
      en: 'Berlioz was a pioneer in coloristic orchestration, using instrumental timbres like a painter uses colors.',
    },
    category: 'Romântico',
  },
  {
    id: '172',
    type: 'curiosity',
    icon: '🎪',
    title: {
      pt: 'Circo Musical',
      en: 'Musical Circus',
    },
    content: {
      pt: 'Paganini se apresentava como showman, usando efeitos teatrais e chegando a tocar uma sonata inteira numa só corda.',
      en: 'Paganini performed as a showman, using theatrical effects and even playing an entire sonata on one string.',
    },
    category: 'Romântico',
  },
  {
    id: '173',
    type: 'instrument',
    icon: '🎹',
    title: {
      pt: 'Harmonium',
      en: 'Harmonium',
    },
    content: {
      pt: 'O harmonium (órgão portátil) tornou-se popular na música doméstica, influenciando compositores como Dvořák.',
      en: 'The harmonium (portable organ) became popular in domestic music, influencing composers like Dvořák.',
    },
    category: 'Romântico',
  },
  {
    id: '174',
    type: 'curiosity',
    icon: '🎵',
    title: {
      pt: 'Canção sem Palavras',
      en: 'Song without Words',
    },
    content: {
      pt: 'Mendelssohn criou as "Canções sem Palavras" - peças pianísticas que cantam melodias sem texto.',
      en: 'Mendelssohn created "Songs without Words" - piano pieces that sing melodies without text.',
    },
    category: 'Romântico',
  },
  {
    id: '175',
    type: 'innovation',
    icon: '🌍',
    title: {
      pt: 'Nacionalismo Musical',
      en: 'Musical Nationalism',
    },
    content: {
      pt: 'O Romantismo incentivou nacionalismos musicais, com compositores usando folclore e história pátria como inspiração.',
      en: 'Romanticism encouraged musical nationalism, with composers using folklore and national history as inspiration.',
    },
    category: 'Romântico',
  },
  {
    id: '176',
    type: 'curiosity',
    icon: '💊',
    title: {
      pt: 'Tuberculose Romântica',
      en: 'Romantic Tuberculosis',
    },
    content: {
      pt: 'Muitos compositores românticos morreram de tuberculose (Chopin, Bellini), doença que simbolizava sensibilidade artística.',
      en: 'Many Romantic composers died of tuberculosis (Chopin, Bellini), a disease that symbolized artistic sensitivity.',
    },
    category: 'Romântico',
  },
  {
    id: '177',
    type: 'technique',
    icon: '🎭',
    title: {
      pt: 'Transformação Temática',
      en: 'Thematic Transformation',
    },
    content: {
      pt: 'Liszt desenvolveu a transformação temática, onde um tema aparece em diferentes caracteres ao longo da obra.',
      en: 'Liszt developed thematic transformation, where a theme appears in different characters throughout the work.',
    },
    category: 'Romântico',
  },
  {
    id: '178',
    type: 'curiosity',
    icon: '🎼',
    title: {
      pt: 'Sinfonia Inacabada',
      en: 'Unfinished Symphony',
    },
    content: {
      pt: 'A "Sinfonia Inacabada" de Schubert tem apenas dois movimentos, permanecendo um mistério por que foi abandonada.',
      en: 'Schubert\'s "Unfinished Symphony" has only two movements, remaining a mystery why it was abandoned.',
    },
    category: 'Romântico',
  },
  {
    id: '179',
    type: 'instrument',
    icon: '🎺',
    title: {
      pt: 'Saxofone',
      en: 'Saxophone',
    },
    content: {
      pt: 'Adolphe Sax inventou o saxofone em 1840, mas este só se tornou popular no jazz, raramente usado na música clássica.',
      en: 'Adolphe Sax invented the saxophone in 1840, but it only became popular in jazz, rarely used in classical music.',
    },
    category: 'Romântico',
  },
  {
    id: '180',
    type: 'curiosity',
    icon: '🏛️',
    title: {
      pt: 'Conservatórios',
      en: 'Conservatories',
    },
    content: {
      pt: 'O século XIX viu a expansão dos conservatórios nacionais, profissionalizando o ensino musical e criando "escolas" nacionais.',
      en: 'The 19th century saw the expansion of national conservatories, professionalizing musical education and creating national "schools."',
    },
    category: 'Romântico',
  },
  {
    id: '181',
    type: 'innovation',
    icon: '🎭',
    title: {
      pt: 'Gesamtkunstwerk',
      en: 'Gesamtkunstwerk',
    },
    content: {
      pt: 'Wagner concebeu a "obra de arte total" onde música, drama, poesia e artes visuais se uniriam em experiência transcendente.',
      en: 'Wagner conceived the "total work of art" where music, drama, poetry, and visual arts would unite in a transcendent experience.',
    },
    category: 'Romântico',
  },
  {
    id: '182',
    type: 'curiosity',
    icon: '🌊',
    title: {
      pt: 'Barcarola Veneziana',
      en: 'Venetian Barcarolle',
    },
    content: {
      pt: 'As barcarolas evocavam as canções dos gondoleiros venezianos, criando atmosferas aquáticas e nostálgicas.',
      en: 'Barcarolles evoked the songs of Venetian gondoliers, creating aquatic and nostalgic atmospheres.',
    },
    category: 'Romântico',
  },
  {
    id: '183',
    type: 'technique',
    icon: '🎨',
    title: {
      pt: 'Impressionismo Precursor',
      en: 'Impressionism Precursor',
    },
    content: {
      pt: 'Liszt antecipou o impressionismo em obras como "Os Jogos de Água na Villa d\'Este", explorando atmosferas sonoras.',
      en: 'Liszt anticipated Impressionism in works like "Les jeux d\'eau à la Villa d\'Este," exploring sonic atmospheres.',
    },
    category: 'Romântico',
  },
  {
    id: '184',
    type: 'curiosity',
    icon: '📖',
    title: {
      pt: 'Crítica Musical',
      en: 'Music Criticism',
    },
    content: {
      pt: 'Schumann foi pioneiro da crítica musical moderna, "descobrindo" Chopin e defendendo Brahms em seus escritos.',
      en: 'Schumann was a pioneer of modern music criticism, "discovering" Chopin and defending Brahms in his writings.',
    },
    category: 'Romântico',
  },
  {
    id: '185',
    type: 'instrument',
    icon: '🎹',
    title: {
      pt: 'Piano de Cauda',
      en: 'Grand Piano',
    },
    content: {
      pt: 'O piano de cauda romântico atingiu dimensões monumentais, com alguns instrumentos de Liszt tendo mais de 3 metros.',
      en: "The Romantic grand piano reached monumental dimensions, with some of Liszt's instruments over 3 meters long.",
    },
    category: 'Romântico',
  },
  {
    id: '186',
    type: 'curiosity',
    icon: '🎪',
    title: {
      pt: 'Tournées Virtuosísticas',
      en: 'Virtuoso Tours',
    },
    content: {
      pt: 'As tournées de concertos se tornaram fenômeno social, com virtuoses viajando pela Europa como verdadeiras celebridades.',
      en: 'Concert tours became a social phenomenon, with virtuosos traveling across Europe as true celebrities.',
    },
    category: 'Romântico',
  },
  {
    id: '187',
    type: 'innovation',
    icon: '🎵',
    title: {
      pt: 'Ciclo de Canções',
      en: 'Song Cycle',
    },
    content: {
      pt: 'Schubert e Schumann criaram ciclos de lieder que contam histórias completas, como "A Bela Moleira" e "Amor de Poeta".',
      en: 'Schubert and Schumann created song cycles that tell complete stories, like "Die schöne Müllerin" and "Dichterliebe."',
    },
    category: 'Romântico',
  },
  {
    id: '188',
    type: 'curiosity',
    icon: '🌙',
    title: {
      pt: 'Sonambulismo Musical',
      en: 'Musical Sleepwalking',
    },
    content: {
      pt: 'A ópera "La Sonnambula" de Bellini explorou o tema romântico do sonambulismo e estados alterados de consciência.',
      en: 'Bellini\'s opera "La Sonnambula" explored the Romantic theme of sleepwalking and altered states of consciousness.',
    },
    category: 'Romântico',
  },
  {
    id: '189',
    type: 'technique',
    icon: '🎭',
    title: {
      pt: 'Melodia Infinita',
      en: 'Endless Melody',
    },
    content: {
      pt: 'Wagner desenvolveu a "melodia infinita", evitando cadências e criando fluxo musical contínuo sem pausas estruturais.',
      en: 'Wagner developed "endless melody," avoiding cadences and creating continuous musical flow without structural pauses.',
    },
    category: 'Romântico',
  },
  {
    id: '190',
    type: 'curiosity',
    icon: '🏰',
    title: {
      pt: 'Bayreuth',
      en: 'Bayreuth',
    },
    content: {
      pt: 'Wagner construiu seu próprio teatro em Bayreuth especificamente para apresentar suas óperas, ainda ativo hoje.',
      en: 'Wagner built his own theater in Bayreuth specifically to present his operas, still active today.',
    },
    category: 'Romântico',
  },
  {
    id: '191',
    type: 'instrument',
    icon: '🎺',
    title: {
      pt: 'Tuba Wagneriana',
      en: 'Wagner Tuba',
    },
    content: {
      pt: 'Wagner encomendou tubas especiais para "O Anel", criando instrumentos únicos para sua sonoridade épica.',
      en: 'Wagner commissioned special tubas for "The Ring," creating unique instruments for his epic sonority.',
    },
    category: 'Romântico',
  },
  {
    id: '192',
    type: 'curiosity',
    icon: '💔',
    title: {
      pt: 'Morte de Amor',
      en: 'Love Death',
    },
    content: {
      pt: 'O "Liebestod" (Morte de Amor) de Wagner influenciou toda a música posterior, explorando êxtase erótico e morte.',
      en: 'Wagner\'s "Liebestod" (Love Death) influenced all subsequent music, exploring erotic ecstasy and death.',
    },
    category: 'Romântico',
  },
  {
    id: '193',
    type: 'innovation',
    icon: '🎼',
    title: {
      pt: 'Orquestra Romântica',
      en: 'Romantic Orchestra',
    },
    content: {
      pt: 'A orquestra romântica expandiu dramaticamente, com Berlioz chegando a escrever para mais de 400 instrumentistas.',
      en: 'The Romantic orchestra expanded dramatically, with Berlioz writing for over 400 instrumentalists.',
    },
    category: 'Romântico',
  },
  {
    id: '194',
    type: 'curiosity',
    icon: '🌟',
    title: {
      pt: 'Clara Wieck',
      en: 'Clara Wieck',
    },
    content: {
      pt: 'Clara Schumann foi uma das primeiras pianistas profissionais, mantendo carreira de concertista por mais de 60 anos.',
      en: 'Clara Schumann was one of the first professional female pianists, maintaining a concert career for over 60 years.',
    },
    category: 'Romântico',
  },
  {
    id: '195',
    type: 'technique',
    icon: '🎨',
    title: {
      pt: 'Sinestesia Musical',
      en: 'Musical Synesthesia',
    },
    content: {
      pt: 'Compositores românticos exploraram sinestesia, associando cores a tonalidades e criando "pinturas" sonoras.',
      en: 'Romantic composers explored synesthesia, associating colors with keys and creating sonic "paintings."',
    },
    category: 'Romântico',
  },
  {
    id: '196',
    type: 'curiosity',
    icon: '📜',
    title: {
      pt: 'Manuscritos Perdidos',
      en: 'Lost Manuscripts',
    },
    content: {
      pt: 'Muitas obras românticas foram perdidas ou destruídas - Schumann queimou várias composições por autocrítica excessiva.',
      en: 'Many Romantic works were lost or destroyed - Schumann burned several compositions due to excessive self-criticism.',
    },
    category: 'Romântico',
  },
  {
    id: '197',
    type: 'instrument',
    icon: '🎻',
    title: {
      pt: 'Viola Romântica',
      en: 'Romantic Viola',
    },
    content: {
      pt: 'A viola ganhou importância no Romantismo, com Berlioz compondo "Haroldo na Itália" especificamente para o instrumento.',
      en: 'The viola gained importance in Romanticism, with Berlioz composing "Harold in Italy" specifically for the instrument.',
    },
    category: 'Romântico',
  },
  {
    id: '198',
    type: 'curiosity',
    icon: '🎭',
    title: {
      pt: 'Ópera Verista',
      en: 'Verismo Opera',
    },
    content: {
      pt: 'O verismo operístico retratou a vida cotidiana com realismo brutal, contrastando com o escapismo romântico anterior.',
      en: 'Operatic verismo portrayed everyday life with brutal realism, contrasting with earlier Romantic escapism.',
    },
    category: 'Romântico',
  },
  {
    id: '199',
    type: 'innovation',
    icon: '🎵',
    title: {
      pt: 'Forma Livre',
      en: 'Free Form',
    },
    content: {
      pt: 'Compositores românticos experimentaram formas livres, criando estruturas únicas para cada obra em vez de moldes pré-existentes.',
      en: 'Romantic composers experimented with free forms, creating unique structures for each work instead of pre-existing molds.',
    },
    category: 'Romântico',
  },
  {
    id: '200',
    type: 'curiosity',
    icon: '🌹',
    title: {
      pt: 'Salões Musicais',
      en: 'Musical Salons',
    },
    content: {
      pt: 'Os salões parisienses eram centros da vida musical romântica, onde compositores apresentavam primeiras audições de obras.',
      en: 'Parisian salons were centers of Romantic musical life, where composers presented premieres of works.',
    },
    category: 'Romântico',
  },

  // IMPRESSIONISMO (25 curiosidades)
  {
    id: '201',
    type: 'innovation',
    icon: '🎨',
    title: {
      pt: 'Debussy Impressionista',
      en: 'Debussy Impressionist',
    },
    content: {
      pt: 'Debussy odiava ser chamado de "impressionista", preferindo "simbolista", mas sua música evoca cores e atmosferas como a pintura impressionista.',
      en: 'Debussy hated being called an "impressionist," preferring "symbolist," but his music evokes colors and atmospheres like Impressionist painting.',
    },
    category: 'Impressionismo',
  },
  {
    id: '202',
    type: 'curiosity',
    icon: '🌊',
    title: {
      pt: 'La Mer',
      en: 'La Mer',
    },
    content: {
      pt: '"La Mer" de Debussy foi composta longe do mar, no interior da França, mostrando como a música pode capturar essências emocionais.',
      en: 'Debussy\'s "La Mer" was composed far from the sea, in inland France, showing how music can capture emotional essences.',
    },
    category: 'Impressionismo',
  },
  {
    id: '203',
    type: 'technique',
    icon: '🎵',
    title: {
      pt: 'Escalas Exóticas',
      en: 'Exotic Scales',
    },
    content: {
      pt: 'Debussy usou escalas pentafônicas, octatônicas e de tons inteiros, expandindo o vocabulário harmônico para além do sistema tonal.',
      en: 'Debussy used pentatonic, octatonic, and whole-tone scales, expanding harmonic vocabulary beyond the tonal system.',
    },
    category: 'Impressionismo',
  },
  {
    id: '204',
    type: 'curiosity',
    icon: '🏮',
    title: {
      pt: 'Influência Oriental',
      en: 'Oriental Influence',
    },
    content: {
      pt: 'A Exposição Universal de Paris (1889) introduziu música javanesa a Debussy, influenciando profundamente seu estilo harmônico.',
      en: 'The Paris Universal Exhibition (1889) introduced Javanese music to Debussy, profoundly influencing his harmonic style.',
    },
    category: 'Impressionismo',
  },
  {
    id: '205',
    type: 'instrument',
    icon: '🎹',
    title: {
      pt: 'Piano Impressionista',
      en: 'Impressionist Piano',
    },
    content: {
      pt: 'Os impressionistas exploraram novos efeitos pianísticos usando pedais, harmônicos e texturas que imitavam orquestras.',
      en: 'Impressionists explored new piano effects using pedals, harmonics, and textures that imitated orchestras.',
    },
    category: 'Impressionismo',
  },
  {
    id: '206',
    type: 'innovation',
    icon: '🌫️',
    title: {
      pt: 'Atmosfera Musical',
      en: 'Musical Atmosphere',
    },
    content: {
      pt: 'Ravel e Debussy priorizaram atmosfera sobre desenvolvimento temático, criando "quadros" sonoros ao invés de argumentos musicais.',
      en: 'Ravel and Debussy prioritized atmosphere over thematic development, creating sonic "paintings" instead of musical arguments.',
    },
    category: 'Impressionismo',
  },
  {
    id: '207',
    type: 'curiosity',
    icon: '🌸',
    title: {
      pt: 'Jardins na Chuva',
      en: 'Gardens in the Rain',
    },
    content: {
      pt: '"Jardins na Chuva" de Debussy usa técnicas pianísticas que realmente evocam gotas de chuva e folhas tremulando.',
      en: 'Debussy\'s "Gardens in the Rain" uses piano techniques that actually evoke raindrops and trembling leaves.',
    },
    category: 'Impressionismo',
  },
  {
    id: '208',
    type: 'technique',
    icon: '🎭',
    title: {
      pt: 'Paralelismos',
      en: 'Parallelisms',
    },
    content: {
      pt: 'Os acordes paralelos impressionistas criavam coloração harmônica única, abandonando as regras de condução de vozes tradicionais.',
      en: 'Impressionist parallel chords created unique harmonic coloration, abandoning traditional voice-leading rules.',
    },
    category: 'Impressionismo',
  },
  {
    id: '209',
    type: 'curiosity',
    icon: '🎪',
    title: {
      pt: 'Bolero de Ravel',
      en: "Ravel's Bolero",
    },
    content: {
      pt: 'O "Bolero" cresceu de uma experiência rítmica para obra icônica, com Ravel surpreendido pelo sucesso popular.',
      en: 'The "Bolero" grew from a rhythmic experiment to an iconic work, with Ravel surprised by its popular success.',
    },
    category: 'Impressionismo',
  },
  {
    id: '210',
    type: 'instrument',
    icon: '🎺',
    title: {
      pt: 'Instrumentação Sutil',
      en: 'Subtle Instrumentation',
    },
    content: {
      pt: 'Ravel foi mestre da orquestração sutil, usando combinações inusitadas de instrumentos para criar timbres únicos.',
      en: 'Ravel was a master of subtle orchestration, using unusual instrument combinations to create unique timbres.',
    },
    category: 'Impressionismo',
  },
  {
    id: '211',
    type: 'innovation',
    icon: '⏰',
    title: {
      pt: 'Tempo Suspenso',
      en: 'Suspended Time',
    },
    content: {
      pt: 'A música impressionista muitas vezes parece suspender o tempo, criando momentos de contemplação estática.',
      en: 'Impressionist music often seems to suspend time, creating moments of static contemplation.',
    },
    category: 'Impressionismo',
  },
  {
    id: '212',
    type: 'curiosity',
    icon: '🌙',
    title: {
      pt: 'Clair de Lune',
      en: 'Clair de Lune',
    },
    content: {
      pt: '"Clair de Lune" tornou-se a peça impressionista mais famosa, mas é apenas o terceiro movimento da "Suite Bergamasque".',
      en: '"Clair de Lune" became the most famous Impressionist piece, but is only the third movement of the "Suite Bergamasque."',
    },
    category: 'Impressionismo',
  },
  {
    id: '213',
    type: 'technique',
    icon: '🎨',
    title: {
      pt: 'Forma Fluida',
      en: 'Fluid Form',
    },
    content: {
      pt: 'Os impressionistas evitavam formas rígidas, preferindo estruturas orgânicas que fluem como água ou luz.',
      en: 'Impressionists avoided rigid forms, preferring organic structures that flow like water or light.',
    },
    category: 'Impressionismo',
  },
  {
    id: '214',
    type: 'curiosity',
    icon: '🎭',
    title: {
      pt: 'Pelléas et Mélisande',
      en: 'Pelléas et Mélisande',
    },
    content: {
      pt: 'A ópera "Pelléas et Mélisande" de Debussy revolucionou o gênero com recitativo naturalístico e orquestra sussurrante.',
      en: 'Debussy\'s opera "Pelléas et Mélisande" revolutionized the genre with naturalistic recitative and whispering orchestra.',
    },
    category: 'Impressionismo',
  },
  {
    id: '215',
    type: 'instrument',
    icon: '🎵',
    title: {
      pt: 'Harpa Impressionista',
      en: 'Impressionist Harp',
    },
    content: {
      pt: 'A harpa ganhou protagonismo no impressionismo, com glissandos e harmônicos criando efeitos aquáticos e etéreos.',
      en: 'The harp gained prominence in Impressionism, with glissandos and harmonics creating aquatic and ethereal effects.',
    },
    category: 'Impressionismo',
  },
  {
    id: '216',
    type: 'innovation',
    icon: '🌈',
    title: {
      pt: 'Harmonia Colorística',
      en: 'Coloristic Harmony',
    },
    content: {
      pt: 'A harmonia impressionista priorizava cor sobre função, usando acordes como "cores" em uma paleta sonora.',
      en: 'Impressionist harmony prioritized color over function, using chords as "colors" in a sonic palette.',
    },
    category: 'Impressionismo',
  },
  {
    id: '217',
    type: 'curiosity',
    icon: '🏰',
    title: {
      pt: 'Catedral Submersa',
      en: 'Sunken Cathedral',
    },
    content: {
      pt: '"A Catedral Submersa" evoca lenda bretã sobre catedral que emerge das águas, demonstrando narrativa impressionista.',
      en: '"The Sunken Cathedral" evokes a Breton legend about a cathedral that emerges from the waters, demonstrating Impressionist narrative.',
    },
    category: 'Impressionismo',
  },
  {
    id: '218',
    type: 'technique',
    icon: '🌊',
    title: {
      pt: 'Fluidity Rhythm',
      en: 'Rhythmic Fluidity',
    },
    content: {
      pt: 'Os ritmos impressionistas fluem sem acentos marcados, criando sensação de movimento orgânico e natural.',
      en: 'Impressionist rhythms flow without marked accents, creating a sense of organic and natural movement.',
    },
    category: 'Impressionismo',
  },
  {
    id: '219',
    type: 'curiosity',
    icon: '🎹',
    title: {
      pt: 'Ravel vs Debussy',
      en: 'Ravel vs Debussy',
    },
    content: {
      pt: 'Embora agrupados, Ravel era mais clássico e preciso, enquanto Debussy era mais experimental e atmosférico.',
      en: 'Though grouped together, Ravel was more classical and precise, while Debussy was more experimental and atmospheric.',
    },
    category: 'Impressionismo',
  },
  {
    id: '220',
    type: 'instrument',
    icon: '🎻',
    title: {
      pt: 'Cordas Impressionistas',
      en: 'Impressionist Strings',
    },
    content: {
      pt: 'Técnicas como surdina, harmônicos artificiais e tremolo criavam texturas veladas características do impressionismo.',
      en: 'Techniques like mutes, artificial harmonics, and tremolo created the veiled textures characteristic of Impressionism.',
    },
    category: 'Impressionismo',
  },
  {
    id: '221',
    type: 'innovation',
    icon: '🎵',
    title: {
      pt: 'Modalidade',
      en: 'Modality',
    },
    content: {
      pt: 'O retorno aos modos antigos deu aos impressionistas alternativas ao sistema tonal maior-menor tradicional.',
      en: 'The return to ancient modes gave Impressionists alternatives to the traditional major-minor tonal system.',
    },
    category: 'Impressionismo',
  },
  {
    id: '222',
    type: 'curiosity',
    icon: '🌺',
    title: {
      pt: 'Estampes',
      en: 'Estampes',
    },
    content: {
      pt: 'As "Estampes" de Debussy retratam paisagens exóticas: Pagodes (Ásia), Soirée dans Grenade (Espanha), Jardins na Chuva (França).',
      en: 'Debussy\'s "Estampes" portray exotic landscapes: Pagodes (Asia), Soirée dans Grenade (Spain), Gardens in the Rain (France).',
    },
    category: 'Impressionismo',
  },
  {
    id: '223',
    type: 'technique',
    icon: '🎭',
    title: {
      pt: 'Simbolismo Musical',
      en: 'Musical Symbolism',
    },
    content: {
      pt: 'A música impressionista frequentemente simbolizava estados emocionais através de gestos musicais sutis e sugestivos.',
      en: 'Impressionist music frequently symbolized emotional states through subtle and suggestive musical gestures.',
    },
    category: 'Impressionismo',
  },
  {
    id: '224',
    type: 'curiosity',
    icon: '🦢',
    title: {
      pt: 'Pavane',
      en: 'Pavane',
    },
    content: {
      pt: 'A "Pavane para uma Infanta Defunta" de Ravel não tem significado fúnebre - o título evoca apenas sonoridades nostálgicas.',
      en: 'Ravel\'s "Pavane for a Dead Princess" has no funereal meaning - the title evokes only nostalgic sonorities.',
    },
    category: 'Impressionismo',
  },
  {
    id: '225',
    type: 'instrument',
    icon: '🎺',
    title: {
      pt: 'Metais Velados',
      en: 'Veiled Brass',
    },
    content: {
      pt: 'Instrumentos de metal com surdina criavam timbres pastéis essenciais à paleta sonora impressionista.',
      en: 'Muted brass instruments created pastel timbres essential to the Impressionist sonic palette.',
    },
    category: 'Impressionismo',
  },

  // MODERNISMO/CONTEMPORÂNEO (50 curiosidades)
  {
    id: '226',
    type: 'innovation',
    icon: '🎵',
    title: {
      pt: 'Atonalidade',
      en: 'Atonality',
    },
    content: {
      pt: 'Schoenberg abandonou totalmente o sistema tonal em 1908, criando a primeira música verdadeiramente atonal da história.',
      en: 'Schoenberg completely abandoned the tonal system in 1908, creating the first truly atonal music in history.',
    },
    category: 'Moderno',
  },
  {
    id: '227',
    type: 'curiosity',
    icon: '🌊',
    title: {
      pt: 'Sagração da Primavera',
      en: 'Rite of Spring',
    },
    content: {
      pt: 'A estreia de "A Sagração da Primavera" de Stravinsky (1913) causou um motim no teatro, dividindo o público.',
      en: 'The premiere of Stravinsky\'s "The Rite of Spring" (1913) caused a riot in the theater, dividing the audience.',
    },
    category: 'Moderno',
  },
  {
    id: '228',
    type: 'technique',
    icon: '🔢',
    title: {
      pt: 'Dodecafonismo',
      en: 'Twelve-tone',
    },
    content: {
      pt: 'Schoenberg criou o sistema dodecafônico, usando todas as 12 notas cromáticas em sequências específicas (séries).',
      en: 'Schoenberg created the twelve-tone system, using all 12 chromatic notes in specific sequences (series).',
    },
    category: 'Moderno',
  },
  {
    id: '229',
    type: 'curiosity',
    icon: '🎭',
    title: {
      pt: 'Pierrot Lunaire',
      en: 'Pierrot Lunaire',
    },
    content: {
      pt: '"Pierrot Lunaire" de Schoenberg usa Sprechgesang - técnica vocal entre fala e canto que ainda causa controvérsia.',
      en: 'Schoenberg\'s "Pierrot Lunaire" uses Sprechgesang - a vocal technique between speech and song that still causes controversy.',
    },
    category: 'Moderno',
  },
  {
    id: '230',
    type: 'innovation',
    icon: '🎹',
    title: {
      pt: 'Piano Preparado',
      en: 'Prepared Piano',
    },
    content: {
      pt: 'John Cage inseriu objetos entre as cordas do piano, criando um "gamelan de um homem só" com sonoridades únicas.',
      en: 'John Cage inserted objects between piano strings, creating a "one-man gamelan" with unique sonorities.',
    },
    category: 'Moderno',
  },
  {
    id: '231',
    type: 'curiosity',
    icon: '⏰',
    title: {
      pt: '4\'33"',
      en: '4\'33"',
    },
    content: {
      pt: 'A peça "4\'33"" de Cage consiste em 4 minutos e 33 segundos de silêncio, questionando a própria definição de música.',
      en: 'Cage\'s piece "4\'33"" consists of 4 minutes and 33 seconds of silence, questioning the very definition of music.',
    },
    category: 'Moderno',
  },
  {
    id: '232',
    type: 'technique',
    icon: '🎵',
    title: {
      pt: 'Politonalidade',
      en: 'Polytonality',
    },
    content: {
      pt: 'Compositores como Milhaud usaram múltiplas tonalidades simultaneamente, criando complexidade harmônica única.',
      en: 'Composers like Milhaud used multiple keys simultaneously, creating unique harmonic complexity.',
    },
    category: 'Moderno',
  },
  {
    id: '233',
    type: 'curiosity',
    icon: '🌟',
    title: {
      pt: 'Bartók Etnomusicólogo',
      en: 'Bartók Ethnomusicologist',
    },
    content: {
      pt: 'Bartók coletou milhares de melodias folclóricas com fonógrafo, preservando tradições musicais do Leste Europeu.',
      en: 'Bartók collected thousands of folk melodies with a phonograph, preserving Eastern European musical traditions.',
    },
    category: 'Moderno',
  },
  {
    id: '234',
    type: 'instrument',
    icon: '🎹',
    title: {
      pt: 'Ondas Martenot',
      en: 'Ondes Martenot',
    },
    content: {
      pt: 'As Ondas Martenot, instrumento eletrônico inventado em 1928, foram usadas por Messiaen e Honegger.',
      en: 'The Ondes Martenot, electronic instrument invented in 1928, were used by Messiaen and Honegger.',
    },
    category: 'Moderno',
  },
  {
    id: '235',
    type: 'innovation',
    icon: '📡',
    title: {
      pt: 'Música Eletrônica',
      en: 'Electronic Music',
    },
    content: {
      pt: 'A música eletrônica nasceu na década de 1950 com estúdios em Paris e Colônia experimentando com fitas magnéticas.',
      en: 'Electronic music was born in the 1950s with studios in Paris and Cologne experimenting with magnetic tapes.',
    },
    category: 'Moderno',
  },
  {
    id: '236',
    type: 'curiosity',
    icon: '🎺',
    title: {
      pt: 'Trompete de Brinquedo',
      en: 'Toy Trumpet',
    },
    content: {
      pt: 'Mahler incluiu instrumentos infantis como trompete de brinquedo em sinfonias, antecipando experimentações modernas.',
      en: "Mahler included children's instruments like toy trumpet in symphonies, anticipating modern experimentations.",
    },
    category: 'Moderno',
  },
  {
    id: '237',
    type: 'technique',
    icon: '🔄',
    title: {
      pt: 'Música Aleatória',
      en: 'Aleatory Music',
    },
    content: {
      pt: 'Cage e outros criaram música aleatória onde intérpretes fazem escolhas durante a performance, nunca resultando igual.',
      en: 'Cage and others created aleatory music where performers make choices during performance, never resulting the same.',
    },
    category: 'Moderno',
  },
  {
    id: '238',
    type: 'curiosity',
    icon: '🌍',
    title: {
      pt: 'Messiaen Ornitólogo',
      en: 'Messiaen Ornithologist',
    },
    content: {
      pt: 'Messiaen transcreveu cantos de pássaros do mundo todo, incorporando-os em obras como "Catálogo dos Pássaros".',
      en: 'Messiaen transcribed bird songs from around the world, incorporating them in works like "Catalogue of Birds."',
    },
    category: 'Moderno',
  },
  {
    id: '239',
    type: 'innovation',
    icon: '⚡',
    title: {
      pt: 'Música Espectral',
      en: 'Spectral Music',
    },
    content: {
      pt: 'Compositores espectrais como Grisey analisam espectros sonoros cientificamente, baseando harmonias em acústica.',
      en: 'Spectral composers like Grisey scientifically analyze sound spectra, basing harmonies on acoustics.',
    },
    category: 'Moderno',
  },
  {
    id: '240',
    type: 'curiosity',
    icon: '🎪',
    title: {
      pt: 'Cirque du Soleil Clássico',
      en: 'Classical Cirque du Soleil',
    },
    content: {
      pt: 'Ligeti\'s "Atmosphères" foi usada em "2001: Uma Odisseia no Espaço", levando música de vanguarda ao cinema mainstream.',
      en: 'Ligeti\'s "Atmosphères" was used in "2001: A Space Odyssey," bringing avant-garde music to mainstream cinema.',
    },
    category: 'Moderno',
  },
  {
    id: '241',
    type: 'technique',
    icon: '🎨',
    title: {
      pt: 'Microtonalidade',
      en: 'Microtonality',
    },
    content: {
      pt: 'Compositores como Partch criaram instrumentos afinados em intervalos menores que semitons, expandindo o espectro tonal.',
      en: 'Composers like Partch created instruments tuned in intervals smaller than semitones, expanding the tonal spectrum.',
    },
    category: 'Moderno',
  },
  {
    id: '242',
    type: 'curiosity',
    icon: '🏗️',
    title: {
      pt: 'Xenakis Arquiteto',
      en: 'Xenakis Architect',
    },
    content: {
      pt: 'Iannis Xenakis era arquiteto (trabalhou com Le Corbusier) e aplicou princípios matemáticos e arquitetônicos à música.',
      en: 'Iannis Xenakis was an architect (worked with Le Corbusier) and applied mathematical and architectural principles to music.',
    },
    category: 'Moderno',
  },
  {
    id: '243',
    type: 'instrument',
    icon: '🎻',
    title: {
      pt: 'Técnicas Estendidas',
      en: 'Extended Techniques',
    },
    content: {
      pt: 'Técnicas estendidas como col legno, sul ponticello e multifônicos expandiram dramaticamente as possibilidades instrumentais.',
      en: 'Extended techniques like col legno, sul ponticello, and multiphonics dramatically expanded instrumental possibilities.',
    },
    category: 'Moderno',
  },
  {
    id: '244',
    type: 'innovation',
    icon: '💻',
    title: {
      pt: 'Música por Computador',
      en: 'Computer Music',
    },
    content: {
      pt: 'O IRCAM em Paris pioneirou música por computador, com Boulez criando centro de pesquisa musical e tecnológica.',
      en: 'IRCAM in Paris pioneered computer music, with Boulez creating a musical and technological research center.',
    },
    category: 'Moderno',
  },
  {
    id: '245',
    type: 'curiosity',
    icon: '🌌',
    title: {
      pt: 'Música Espacial',
      en: 'Spatial Music',
    },
    content: {
      pt: 'Stockhausen compôs para performances em múltiplos andares, criando experiências musicais tridimensionais.',
      en: 'Stockhausen composed for performances on multiple floors, creating three-dimensional musical experiences.',
    },
    category: 'Moderno',
  },
  {
    id: '246',
    type: 'technique',
    icon: '🔧',
    title: {
      pt: 'Serialismo Integral',
      en: 'Total Serialism',
    },
    content: {
      pt: 'Boulez e outros aplicaram organização serial não apenas a alturas, mas também a durações, dinâmicas e articulações.',
      en: 'Boulez and others applied serial organization not only to pitches, but also to durations, dynamics, and articulations.',
    },
    category: 'Moderno',
  },
  {
    id: '247',
    type: 'curiosity',
    icon: '🎭',
    title: {
      pt: 'Teatro Musical',
      en: 'Music Theater',
    },
    content: {
      pt: 'Kagel e outros criaram "teatro musical" onde instrumentistas também atuam, borrando fronteiras entre artes.',
      en: 'Kagel and others created "music theater" where instrumentalists also act, blurring boundaries between arts.',
    },
    category: 'Moderno',
  },
  {
    id: '248',
    type: 'instrument',
    icon: '🎹',
    title: {
      pt: 'Sintetizadores',
      en: 'Synthesizers',
    },
    content: {
      pt: 'Sintetizadores como o Moog revolucionaram música experimental, com compositores explorando sons impossíveis acusticamente.',
      en: 'Synthesizers like the Moog revolutionized experimental music, with composers exploring acoustically impossible sounds.',
    },
    category: 'Moderno',
  },
  {
    id: '249',
    type: 'innovation',
    icon: '🔄',
    title: {
      pt: 'Minimalismo',
      en: 'Minimalism',
    },
    content: {
      pt: 'Steve Reich e Philip Glass criaram minimalismo musical, usando repetição e mudança gradual para hipnotizar audientes.',
      en: 'Steve Reich and Philip Glass created musical minimalism, using repetition and gradual change to hypnotize audiences.',
    },
    category: 'Moderno',
  },
  {
    id: '250',
    type: 'curiosity',
    icon: '🌊',
    title: {
      pt: 'Música Ambiente',
      en: 'Ambient Music',
    },
    content: {
      pt: 'Brian Eno criou o conceito de "música ambiente" - música que pode ser ignorada mas que enriquece o ambiente sonoro.',
      en: 'Brian Eno created the concept of "ambient music" - music that can be ignored but enriches the sonic environment.',
    },
    category: 'Moderno',
  },
  {
    id: '251',
    type: 'technique',
    icon: '📊',
    title: {
      pt: 'Análise Espectral',
      en: 'Spectral Analysis',
    },
    content: {
      pt: 'Compositores modernos usam análise espectral por computador para compreender e manipular timbres com precisão científica.',
      en: 'Modern composers use computer spectral analysis to understand and manipulate timbres with scientific precision.',
    },
    category: 'Moderno',
  },
  {
    id: '252',
    type: 'curiosity',
    icon: '🎪',
    title: {
      pt: 'Happenings Musicais',
      en: 'Musical Happenings',
    },
    content: {
      pt: 'Nos anos 1960, compositores criaram "happenings" - eventos multimídia onde música se misturava com arte visual e performance.',
      en: 'In the 1960s, composers created "happenings" - multimedia events where music mixed with visual art and performance.',
    },
    category: 'Moderno',
  },
  {
    id: '253',
    type: 'innovation',
    icon: '🔊',
    title: {
      pt: 'Live Electronics',
      en: 'Live Electronics',
    },
    content: {
      pt: 'Música eletroacústica ao vivo combina instrumentos tradicionais com eletrônicos, criando interação em tempo real.',
      en: 'Live electroacoustic music combines traditional instruments with electronics, creating real-time interaction.',
    },
    category: 'Moderno',
  },
  {
    id: '254',
    type: 'curiosity',
    icon: '🌍',
    title: {
      pt: 'World Music Fusion',
      en: 'World Music Fusion',
    },
    content: {
      pt: 'Compositores como Tan Dun fusionam tradições musicais orientais e ocidentais, criando linguagem musical verdadeiramente global.',
      en: 'Composers like Tan Dun fuse Eastern and Western musical traditions, creating a truly global musical language.',
    },
    category: 'Moderno',
  },
  {
    id: '255',
    type: 'technique',
    icon: '🎯',
    title: {
      pt: 'Música Gestual',
      en: 'Gestural Music',
    },
    content: {
      pt: 'Lachenmann e outros exploraram "música gestual" onde o gesto físico de tocar é tão importante quanto o som resultante.',
      en: 'Lachenmann and others explored "gestural music" where the physical gesture of playing is as important as the resulting sound.',
    },
    category: 'Moderno',
  },
  {
    id: '256',
    type: 'curiosity',
    icon: '🏢',
    title: {
      pt: 'Música Urbana',
      en: 'Urban Music',
    },
    content: {
      pt: 'Compositores incorporam sons urbanos - trânsito, construção, multidões - como material musical legítimo.',
      en: 'Composers incorporate urban sounds - traffic, construction, crowds - as legitimate musical material.',
    },
    category: 'Moderno',
  },
  {
    id: '257',
    type: 'instrument',
    icon: '📱',
    title: {
      pt: 'Apps Musicais',
      en: 'Musical Apps',
    },
    content: {
      pt: 'Smartphones e tablets tornaram-se instrumentos musicais legítimos, com apps permitindo performances complexas.',
      en: 'Smartphones and tablets became legitimate musical instruments, with apps allowing complex performances.',
    },
    category: 'Moderno',
  },
  {
    id: '258',
    type: 'innovation',
    icon: '🤖',
    title: {
      pt: 'IA Compositora',
      en: 'AI Composer',
    },
    content: {
      pt: 'Inteligência artificial já compõe música autonomamente, levantando questões sobre criatividade e autoria artística.',
      en: 'Artificial intelligence already composes music autonomously, raising questions about creativity and artistic authorship.',
    },
    category: 'Moderno',
  },
  {
    id: '259',
    type: 'curiosity',
    icon: '🌌',
    title: {
      pt: 'Música Cósmica',
      en: 'Cosmic Music',
    },
    content: {
      pt: 'Compositores usam dados astronômicos - pulsares, radiação cósmica - como fonte de material musical.',
      en: 'Composers use astronomical data - pulsars, cosmic radiation - as a source of musical material.',
    },
    category: 'Moderno',
  },
  {
    id: '260',
    type: 'technique',
    icon: '🔄',
    title: {
      pt: 'Looping ao Vivo',
      en: 'Live Looping',
    },
    content: {
      pt: 'Steve Reich pioneirou loop delay, técnica hoje comum onde performers criam camadas em tempo real.',
      en: 'Steve Reich pioneered loop delay, a technique now common where performers create layers in real time.',
    },
    category: 'Moderno',
  },
  {
    id: '261',
    type: 'curiosity',
    icon: '🏛️',
    title: {
      pt: 'Neo-Romantismo',
      en: 'Neo-Romanticism',
    },
    content: {
      pt: 'Compositores como John Adams retornaram à tonalidade e melodia, criando "neo-romantismo" acessível ao público.',
      en: 'Composers like John Adams returned to tonality and melody, creating accessible "neo-romanticism" for the public.',
    },
    category: 'Moderno',
  },
  {
    id: '262',
    type: 'innovation',
    icon: '🎮',
    title: {
      pt: 'Música Interativa',
      en: 'Interactive Music',
    },
    content: {
      pt: 'Música interativa responde a ações do público ou intérpretes, criando experiências únicas a cada performance.',
      en: 'Interactive music responds to actions of the audience or performers, creating unique experiences each performance.',
    },
    category: 'Moderno',
  },
  {
    id: '263',
    type: 'curiosity',
    icon: '🧬',
    title: {
      pt: 'Música Genética',
      en: 'Genetic Music',
    },
    content: {
      pt: 'Compositores traduzem sequências de DNA em música, explorando padrões da vida como material compositivo.',
      en: 'Composers translate DNA sequences into music, exploring life patterns as compositional material.',
    },
    category: 'Moderno',
  },
  {
    id: '264',
    type: 'technique',
    icon: '🌐',
    title: {
      pt: 'Teleconcertos',
      en: 'Teleconcerts',
    },
    content: {
      pt: 'Internet permite performances colaborativas globais, com músicos em continentes diferentes tocando juntos.',
      en: 'Internet enables global collaborative performances, with musicians on different continents playing together.',
    },
    category: 'Moderno',
  },
  {
    id: '265',
    type: 'curiosity',
    icon: '🎭',
    title: {
      pt: 'Ópera Contemporânea',
      en: 'Contemporary Opera',
    },
    content: {
      pt: 'Óperas modernas abordam temas atuais - terrorismo, mudança climática, redes sociais - mantendo o gênero relevante.',
      en: 'Modern operas address current themes - terrorism, climate change, social networks - keeping the genre relevant.',
    },
    category: 'Moderno',
  },
  {
    id: '266',
    type: 'instrument',
    icon: '🎺',
    title: {
      pt: 'Instrumentos Híbridos',
      en: 'Hybrid Instruments',
    },
    content: {
      pt: 'Luthiers criam instrumentos híbridos combinando tradições diferentes, expandindo possibilidades sonoras.',
      en: 'Luthiers create hybrid instruments combining different traditions, expanding sonic possibilities.',
    },
    category: 'Moderno',
  },
  {
    id: '267',
    type: 'innovation',
    icon: '🔬',
    title: {
      pt: 'Psicoacústica',
      en: 'Psychoacoustics',
    },
    content: {
      pt: 'Compositores usam pesquisa psicoacústica para criar ilusões auditivas e efeitos perceptivos específicos.',
      en: 'Composers use psychoacoustic research to create auditory illusions and specific perceptual effects.',
    },
    category: 'Moderno',
  },
  {
    id: '268',
    type: 'curiosity',
    icon: '🌿',
    title: {
      pt: 'Eco-Música',
      en: 'Eco-Music',
    },
    content: {
      pt: 'Movimento de "eco-música" incorpora sons naturais e consciência ambiental nas composições contemporâneas.',
      en: 'The "eco-music" movement incorporates natural sounds and environmental awareness in contemporary compositions.',
    },
    category: 'Moderno',
  },
  {
    id: '269',
    type: 'technique',
    icon: '🎨',
    title: {
      pt: 'Notação Gráfica',
      en: 'Graphic Notation',
    },
    content: {
      pt: 'Partituras contemporâneas usam símbolos visuais, cores e formas gráficas para comunicar ideias musicais.',
      en: 'Contemporary scores use visual symbols, colors, and graphic forms to communicate musical ideas.',
    },
    category: 'Moderno',
  },
  {
    id: '270',
    type: 'curiosity',
    icon: '🏠',
    title: {
      pt: 'Música Doméstica',
      en: 'Domestic Music',
    },
    content: {
      pt: 'Pandemia levou compositores a criar obras para performance doméstica, adaptando-se a realidades contemporâneas.',
      en: 'The pandemic led composers to create works for domestic performance, adapting to contemporary realities.',
    },
    category: 'Moderno',
  },
  {
    id: '271',
    type: 'innovation',
    icon: '🎧',
    title: {
      pt: 'Música Binaural',
      en: 'Binaural Music',
    },
    content: {
      pt: 'Gravação binaural cria experiências 3D através de fones, permitindo composições específicas para este meio.',
      en: 'Binaural recording creates 3D experiences through headphones, allowing compositions specific to this medium.',
    },
    category: 'Moderno',
  },
  {
    id: '272',
    type: 'curiosity',
    icon: '⚡',
    title: {
      pt: 'Música Energética',
      en: 'Energy Music',
    },
    content: {
      pt: 'Compositores exploram sons de fontes energéticas - eletricidade, magnetismo - como material musical.',
      en: 'Composers explore sounds from energy sources - electricity, magnetism - as musical material.',
    },
    category: 'Moderno',
  },
  {
    id: '273',
    type: 'technique',
    icon: '🔢',
    title: {
      pt: 'Algoritmos Musicais',
      en: 'Musical Algorithms',
    },
    content: {
      pt: 'Algoritmos matemáticos geram estruturas musicais complexas, explorando padrões impossíveis para mente humana.',
      en: 'Mathematical algorithms generate complex musical structures, exploring patterns impossible for the human mind.',
    },
    category: 'Moderno',
  },
  {
    id: '274',
    type: 'curiosity',
    icon: '🎪',
    title: {
      pt: 'Flashmobs Musicais',
      en: 'Musical Flashmobs',
    },
    content: {
      pt: 'Flashmobs musicais levam música clássica a espaços públicos, democratizando acesso e surpreendendo transeuntes.',
      en: 'Musical flashmobs bring classical music to public spaces, democratizing access and surprising passersby.',
    },
    category: 'Moderno',
  },
  {
    id: '275',
    type: 'instrument',
    icon: '🌊',
    title: {
      pt: 'Aquafone',
      en: 'Aquaphone',
    },
    content: {
      pt: 'Instrumentos aquáticos usam água como meio sonoro, explorando acústica líquida para efeitos únicos.',
      en: 'Aquatic instruments use water as a sonic medium, exploring liquid acoustics for unique effects.',
    },
    category: 'Moderno',
  },

  // TEORIA E TÉCNICA GERAL (25 curiosidades finais)
  {
    id: '276',
    type: 'theory',
    icon: '🎵',
    title: {
      pt: 'Círculo das Quintas',
      en: 'Circle of Fifths',
    },
    content: {
      pt: 'O círculo das quintas organiza todas as tonalidades em relação matemática perfeita, sendo ferramenta fundamental da harmonia.',
      en: 'The circle of fifths organizes all keys in perfect mathematical relationship, being a fundamental tool of harmony.',
    },
    category: 'Teoria',
  },
  {
    id: '277',
    type: 'curiosity',
    icon: '🔢',
    title: {
      pt: 'Proporção Divina',
      en: 'Divine Proportion',
    },
    content: {
      pt: 'A proporção áurea (1:1.618) aparece em muitas obras clássicas, desde Bach até Debussy, criando satisfação estética.',
      en: 'The golden ratio (1:1.618) appears in many classical works, from Bach to Debussy, creating aesthetic satisfaction.',
    },
    category: 'Teoria',
  },
  {
    id: '278',
    type: 'technique',
    icon: '🎯',
    title: {
      pt: 'Análise Schenkeriana',
      en: 'Schenkerian Analysis',
    },
    content: {
      pt: 'Heinrich Schenker desenvolveu método analítico que reduz obras a estruturas fundamentais, revelando lógica profunda.',
      en: 'Heinrich Schenker developed an analytical method that reduces works to fundamental structures, revealing deep logic.',
    },
    category: 'Teoria',
  },
  {
    id: '279',
    type: 'curiosity',
    icon: '🌊',
    title: {
      pt: 'Efeito Doppler Musical',
      en: 'Musical Doppler Effect',
    },
    content: {
      pt: 'Compositores exploram efeito Doppler (mudança de altura por movimento) criando ilusões espaciais na música.',
      en: 'Composers explore the Doppler effect (pitch change through movement) creating spatial illusions in music.',
    },
    category: 'Teoria',
  },
  {
    id: '280',
    type: 'innovation',
    icon: '📊',
    title: {
      pt: 'Análise por Computador',
      en: 'Computer Analysis',
    },
    content: {
      pt: 'Software moderno analisa milhares de obras simultaneamente, revelando padrões estatísticos na música clássica.',
      en: 'Modern software analyzes thousands of works simultaneously, revealing statistical patterns in classical music.',
    },
    category: 'Teoria',
  },
  {
    id: '281',
    type: 'curiosity',
    icon: '🧠',
    title: {
      pt: 'Neurociência Musical',
      en: 'Musical Neuroscience',
    },
    content: {
      pt: 'Pesquisas revelam que música ativa múltiplas áreas cerebrais simultaneamente, sendo "ginástica" para o cérebro.',
      en: 'Research reveals that music activates multiple brain areas simultaneously, being "exercise" for the brain.',
    },
    category: 'Teoria',
  },
  {
    id: '282',
    type: 'technique',
    icon: '🎨',
    title: {
      pt: 'Teoria dos Conjuntos',
      en: 'Set Theory',
    },
    content: {
      pt: 'Teoria dos conjuntos aplica matemática à análise musical, especialmente útil para música atonal e serial.',
      en: 'Set theory applies mathematics to musical analysis, especially useful for atonal and serial music.',
    },
    category: 'Teoria',
  },
  {
    id: '283',
    type: 'curiosity',
    icon: '🔊',
    title: {
      pt: 'Síntese Subtrativa',
      en: 'Subtractive Synthesis',
    },
    content: {
      pt: 'Instrumentos acústicos funcionam por síntese subtrativa - produzem espectro rico que é filtrado pela ressonância.',
      en: 'Acoustic instruments work by subtractive synthesis - they produce rich spectrum that is filtered by resonance.',
    },
    category: 'Teoria',
  },
  {
    id: '284',
    type: 'innovation',
    icon: '🎼',
    title: {
      pt: 'Música Fractal',
      en: 'Fractal Music',
    },
    content: {
      pt: 'Composições fractais repetem padrões em diferentes escalas, criando autossimilaridade hipnótica.',
      en: 'Fractal compositions repeat patterns at different scales, creating hypnotic self-similarity.',
    },
    category: 'Teoria',
  },
  {
    id: '285',
    type: 'curiosity',
    icon: '🌟',
    title: {
      pt: 'Frequência 440 Hz',
      en: '440 Hz Frequency',
    },
    content: {
      pt: 'A afinação em 440 Hz para o Lá foi padronizada internacionalmente apenas em 1939, variando muito antes disso.',
      en: 'The 440 Hz tuning for A was internationally standardized only in 1939, varying greatly before that.',
    },
    category: 'Teoria',
  },
  {
    id: '286',
    type: 'technique',
    icon: '⚖️',
    title: {
      pt: 'Contraponto Espécies',
      en: 'Species Counterpoint',
    },
    content: {
      pt: 'O sistema de cinco espécies do contraponto de Fux ainda é base do ensino musical, codificando movimento de vozes.',
      en: "Fux's five-species counterpoint system is still the basis of musical education, codifying voice movement.",
    },
    category: 'Teoria',
  },
  {
    id: '287',
    type: 'curiosity',
    icon: '🎭',
    title: {
      pt: 'Síndrome do Ouvido Absoluto',
      en: 'Perfect Pitch Syndrome',
    },
    content: {
      pt: 'Apenas 1 em 10.000 pessoas tem ouvido absoluto, capacidade mais comum entre músicos que começaram muito cedo.',
      en: 'Only 1 in 10,000 people have perfect pitch, an ability more common among musicians who started very early.',
    },
    category: 'Teoria',
  },
  {
    id: '288',
    type: 'innovation',
    icon: '🔄',
    title: {
      pt: 'Transformações Neo-Riemannianas',
      en: 'Neo-Riemannian Transformations',
    },
    content: {
      pt: 'Teoria neo-riemanniana explica progressões harmônicas românticas através de transformações geométricas.',
      en: 'Neo-Riemannian theory explains Romantic harmonic progressions through geometric transformations.',
    },
    category: 'Teoria',
  },
  {
    id: '289',
    type: 'curiosity',
    icon: '🌈',
    title: {
      pt: 'Sinestesia Musical',
      en: 'Musical Synesthesia',
    },
    content: {
      pt: 'Cerca de 4% das pessoas experienciam sinestesia, vendo cores específicas para diferentes notas musicais.',
      en: 'About 4% of people experience synesthesia, seeing specific colors for different musical notes.',
    },
    category: 'Teoria',
  },
  {
    id: '290',
    type: 'technique',
    icon: '📏',
    title: {
      pt: 'Métrica Assimétrica',
      en: 'Asymmetric Meter',
    },
    content: {
      pt: 'Métricas como 5/8 ou 7/8 criam assimetrias rítmicas que desafiam expectativas baseadas em métrica binária.',
      en: 'Meters like 5/8 or 7/8 create rhythmic asymmetries that challenge expectations based on binary meter.',
    },
    category: 'Teoria',
  },
  {
    id: '291',
    type: 'curiosity',
    icon: '🔊',
    title: {
      pt: 'Batimentos Acústicos',
      en: 'Acoustic Beats',
    },
    content: {
      pt: 'Batimentos entre frequências próximas criam pulsações audíveis, fenômeno usado para afinar instrumentos.',
      en: 'Beats between close frequencies create audible pulsations, a phenomenon used to tune instruments.',
    },
    category: 'Teoria',
  },
  {
    id: '292',
    type: 'innovation',
    icon: '🎯',
    title: {
      pt: 'Análise Paradigmática',
      en: 'Paradigmatic Analysis',
    },
    content: {
      pt: 'Análise paradigmática de Ruwet organiza música em segmentos similares, revelando estruturas repetitivas ocultas.',
      en: "Ruwet's paradigmatic analysis organizes music into similar segments, revealing hidden repetitive structures.",
    },
    category: 'Teoria',
  },
  {
    id: '293',
    type: 'curiosity',
    icon: '⏰',
    title: {
      pt: 'Tempo Psicológico',
      en: 'Psychological Time',
    },
    content: {
      pt: 'Percepção temporal na música varia dramaticamente - trechos lentos parecem mais longos que indicam cronômetros.',
      en: 'Temporal perception in music varies dramatically - slow passages seem longer than chronometers indicate.',
    },
    category: 'Teoria',
  },
  {
    id: '294',
    type: 'technique',
    icon: '🎨',
    title: {
      pt: 'Klangfarbenmelodie',
      en: 'Klangfarbenmelodie',
    },
    content: {
      pt: 'Schoenberg criou "melodia de timbres" onde cores instrumentais, não alturas, criam linha melódica.',
      en: 'Schoenberg created "melody of timbres" where instrumental colors, not pitches, create melodic line.',
    },
    category: 'Teoria',
  },
  {
    id: '295',
    type: 'curiosity',
    icon: '🧮',
    title: {
      pt: 'Sequência de Fibonacci',
      en: 'Fibonacci Sequence',
    },
    content: {
      pt: 'Sequência de Fibonacci aparece naturalmente na música, influenciando proporções em obras de Bartók e outros.',
      en: 'The Fibonacci sequence appears naturally in music, influencing proportions in works by Bartók and others.',
    },
    category: 'Teoria',
  },
  {
    id: '296',
    type: 'innovation',
    icon: '🌐',
    title: {
      pt: 'Topologia Musical',
      en: 'Musical Topology',
    },
    content: {
      pt: 'Topologia musical estuda transformações contínuas entre objetos musicais, criando "geometria" harmônica.',
      en: 'Musical topology studies continuous transformations between musical objects, creating harmonic "geometry."',
    },
    category: 'Teoria',
  },
  {
    id: '297',
    type: 'curiosity',
    icon: '🎵',
    title: {
      pt: 'Escala Cromática Natural',
      en: 'Natural Chromatic Scale',
    },
    content: {
      pt: 'A série harmônica natural produz microtons entre semitons, mas instrumentos temperados aproximam estas frequências.',
      en: 'The natural harmonic series produces microtones between semitones, but tempered instruments approximate these frequencies.',
    },
    category: 'Teoria',
  },
  {
    id: '298',
    type: 'technique',
    icon: '📊',
    title: {
      pt: 'Análise Estatística',
      en: 'Statistical Analysis',
    },
    content: {
      pt: 'Análise estatística revela "impressões digitais" composicionais únicas para cada compositor através de padrões.',
      en: 'Statistical analysis reveals unique compositional "fingerprints" for each composer through patterns.',
    },
    category: 'Teoria',
  },
  {
    id: '299',
    type: 'curiosity',
    icon: '🌟',
    title: {
      pt: 'Música das Esferas',
      en: 'Music of the Spheres',
    },
    content: {
      pt: 'Kepler calculou "música das esferas" baseada em órbitas planetárias, conectando astronomia e harmonia musical.',
      en: 'Kepler calculated "music of the spheres" based on planetary orbits, connecting astronomy and musical harmony.',
    },
    category: 'Teoria',
  },
  {
    id: '300',
    type: 'innovation',
    icon: '🚀',
    title: {
      pt: 'Futuro da Música',
      en: 'Future of Music',
    },
    content: {
      pt: 'A música clássica continua evoluindo com novas tecnologias, mantendo tradições milenares enquanto explora possibilidades infinitas.',
      en: 'Classical music continues evolving with new technologies, maintaining millennial traditions while exploring infinite possibilities.',
    },
    category: 'Futuro',
  },
];

// Função para obter fatos aleatórios traduzidos
export const getRandomFacts = (count = 4) => {
  const shuffled = [...musicalFacts].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// Função para obter fatos por categoria traduzidos
export const getFactsByCategory = (category: string, count = 10) => {
  const filtered = musicalFacts.filter((fact) => fact.category === category);
  return filtered.sort(() => 0.5 - Math.random()).slice(0, count);
};

// Função para obter fatos por tipo
export const getFactsByType = (type: string, count = 10) => {
  const filtered = musicalFacts.filter((fact) => fact.type === type);
  return filtered.sort(() => 0.5 - Math.random()).slice(0, count);
};

// Todas as categorias disponíveis
export const categories = [
  'Medieval',
  'Renascimento',
  'Barroco',
  'Clássico',
  'Romântico',
  'Impressionismo',
  'Moderno',
  'Teoria',
  'Futuro',
];

// Todos os tipos disponíveis
export const factTypes = [
  'curiosity',
  'innovation',
  'technique',
  'instrument',
  'record',
  'anniversary',
  'theory',
];
