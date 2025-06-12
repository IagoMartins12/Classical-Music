// Função completa para obter curiosidades sobre compositores
export const getComposerCuriosities = (
  composerName: string
): Array<{
  id: string;
  icon: string;
  text: string;
}> => {
  const curiositiesMap: Record<
    string,
    Array<{ id: string; icon: string; text: string }>
  > = {
    'Ludwig van Beethoven': [
      {
        id: '1',
        icon: '🦻',
        text: 'Compôs suas maiores obras enquanto lutava contra a surdez progressiva.',
      },
      {
        id: '2',
        icon: '☕',
        text: 'Contava exatamente 60 grãos de café para cada xícara que bebia.',
      },
      {
        id: '3',
        icon: '🎹',
        text: 'Quebrava teclas de piano com a força de sua interpretação.',
      },
      {
        id: '4',
        icon: '💧',
        text: 'Derramava água gelada na cabeça para se manter concentrado enquanto compunha.',
      },
    ],
    'Wolfgang Amadeus Mozart': [
      {
        id: '1',
        icon: '👶',
        text: 'Compôs sua primeira sinfonia aos 8 anos de idade.',
      },
      {
        id: '2',
        icon: '🎯',
        text: 'Podia escrever música de cabeça para baixo e de trás para frente.',
      },
      {
        id: '3',
        icon: '🎭',
        text: 'Tinha uma risada tão característica que as pessoas o reconheciam só pelo som.',
      },
      {
        id: '4',
        icon: '🎮',
        text: 'Adorava jogos de cartas e apostas, o que frequentemente o deixava em dificuldades financeiras.',
      },
      {
        id: '5',
        icon: '🧠',
        text: 'Conseguia memorizar uma peça musical inteira após ouvi-la apenas uma vez.',
      },
    ],
    'Johann Sebastian Bach': [
      {
        id: '1',
        icon: '👨‍👩‍👧‍👦',
        text: 'Teve 20 filhos, dos quais vários se tornaram compositores famosos.',
      },
      {
        id: '2',
        icon: '🔢',
        text: 'Usava números e proporções matemáticas como base para suas composições.',
      },
      {
        id: '3',
        icon: '🏃‍♂️',
        text: 'Caminhou mais de 400 km para ouvir Dietrich Buxtehude tocar órgão.',
      },
      {
        id: '4',
        icon: '📜',
        text: 'Muitas de suas obras foram perdidas e redescoberta séculos depois.',
      },
    ],
    'Richard Wagner': [
      {
        id: '1',
        icon: '🏰',
        text: 'Construiu seu próprio teatro de ópera em Bayreuth, ainda ativo hoje.',
      },
      {
        id: '2',
        icon: '⏰',
        text: 'Suas óperas podem durar mais de 15 horas (como Der Ring des Nibelungen).',
      },
      {
        id: '3',
        icon: '🎪',
        text: 'Inventou novos instrumentos para suas óperas, como a tuba wagneriana.',
      },
      {
        id: '4',
        icon: '📚',
        text: 'Escrevia seus próprios libretos, sendo ao mesmo tempo compositor e dramaturgo.',
      },
    ],
    'Joseph Haydn': [
      {
        id: '1',
        icon: '😴',
        text: 'Compôs a "Sinfonia Surpresa" com um acorde forte para acordar a audiência.',
      },
      {
        id: '2',
        icon: '🎼',
        text: 'É considerado o "Pai da Sinfonia" e do quarteto de cordas.',
      },
      {
        id: '3',
        icon: '🕯️',
        text: 'Na "Sinfonia do Adeus", os músicos saem do palco um a um até sobrar apenas dois violinistas.',
      },
      {
        id: '4',
        icon: '👑',
        text: 'Trabalhou para a família Esterházy por quase 30 anos, compondo mais de 100 sinfonias.',
      },
    ],
    'Johannes Brahms': [
      {
        id: '1',
        icon: '⏳',
        text: 'Levou 21 anos para completar sua primeira sinfonia por medo de ser comparado a Beethoven.',
      },
      { id: '2', icon: '☕', text: 'Bebia até 40 xícaras de café por dia.' },
      {
        id: '3',
        icon: '🧸',
        text: 'Nunca se casou, mas teve um amor platônico duradouro por Clara Schumann.',
      },
      {
        id: '4',
        icon: '🎹',
        text: 'Praticava piano com os dedos em jornais para não incomodar os vizinhos.',
      },
    ],
    'Franz Schubert': [
      {
        id: '1',
        icon: '⚡',
        text: 'Compôs mais de 600 canções em sua curta vida de 31 anos.',
      },
      {
        id: '2',
        icon: '🛏️',
        text: 'Dormia de óculos para compor assim que acordasse.',
      },
      {
        id: '3',
        icon: '🎵',
        text: 'Escreveu "Ave Maria" e "A Truta" que se tornaram clássicos instantâneos.',
      },
      {
        id: '4',
        icon: '📝',
        text: 'Podia compor até 8 canções em um único dia.',
      },
    ],
    'Peter Ilyich Tchaikovsky': [
      {
        id: '1',
        icon: '🩰',
        text: 'Compôs os três balés mais famosos: O Quebra-Nozes, O Lago dos Cisnes e A Bela Adormecida.',
      },
      {
        id: '2',
        icon: '💣',
        text: 'Usou canhões reais na abertura "1812" para simular batalhas.',
      },
      {
        id: '3',
        icon: '☕',
        text: 'Tinha rituais obsessivos, como beber exatamente 4 xícaras de chá por dia.',
      },
      {
        id: '4',
        icon: '😰',
        text: 'Sofria de extrema timidez e ansiedade ao reger suas próprias obras.',
      },
    ],
    'George Frideric Handel': [
      { id: '1', icon: '👑', text: 'Compôs "Messiah" em apenas 24 dias.' },
      {
        id: '2',
        icon: '🌊',
        text: 'Sua "Música Aquática" foi tocada em barcos no Rio Tâmisa para o Rei George I.',
      },
      {
        id: '3',
        icon: '🔥',
        text: 'Sobreviveu a um incêndio que destruiu seu teatro e suas partituras.',
      },
      {
        id: '4',
        icon: '🎆',
        text: 'Sua "Música para os Reais Fogos de Artifício" foi tocada com fogos de verdade.',
      },
    ],
    'Igor Stravinsky': [
      {
        id: '1',
        icon: '😱',
        text: 'A estreia de "A Sagração da Primavera" causou um tumulto no teatro.',
      },
      {
        id: '2',
        icon: '🎭',
        text: 'Revolucionou a música com ritmos complexos e dissonâncias ousadas.',
      },
      {
        id: '3',
        icon: '🚢',
        text: 'Mudou-se para os EUA durante a Segunda Guerra Mundial.',
      },
      {
        id: '4',
        icon: '🎨',
        text: 'Trabalhou com Picasso e outros artistas vanguardistas.',
      },
    ],
    'Robert Schumann': [
      {
        id: '1',
        icon: '✋',
        text: 'Machucou a mão tentando fortalecer um dedo, acabando com sua carreira de pianista.',
      },
      {
        id: '2',
        icon: '💕',
        text: 'Casou-se com Clara Wieck contra a vontade do pai dela, após uma batalha legal.',
      },
      {
        id: '3',
        icon: '📝',
        text: 'Foi crítico musical influente antes de se dedicar completamente à composição.',
      },
      {
        id: '4',
        icon: '🎭',
        text: 'Criou personagens fictícios (Florestan e Eusebius) que representavam aspectos de sua personalidade.',
      },
    ],
    'Felix Mendelssohn': [
      {
        id: '1',
        icon: '🎂',
        text: 'Compôs a abertura "Sonho de uma Noite de Verão" aos 17 anos.',
      },
      {
        id: '2',
        icon: '🏺',
        text: 'Redescobriu e promoveu a música de Bach, que estava esquecida.',
      },
      {
        id: '3',
        icon: '🎨',
        text: 'Era também um talentoso pintor e desenhista.',
      },
      {
        id: '4',
        icon: '🏃‍♂️',
        text: 'Morreu aos 38 anos, possivelmente de exaustão por excesso de trabalho.',
      },
    ],
    'Claude Debussy': [
      {
        id: '1',
        icon: '🌊',
        text: 'Criou o impressionismo musical, inspirado pelos pintores impressionistas.',
      },
      {
        id: '2',
        icon: '🎹',
        text: '"Clair de Lune" tornou-se uma das peças de piano mais populares de todos os tempos.',
      },
      {
        id: '3',
        icon: '🏮',
        text: 'Foi influenciado pela música gamelan indonésia após ouvi-la na Exposição de Paris.',
      },
      {
        id: '4',
        icon: '🚫',
        text: 'Rejeitava as regras tradicionais da harmonia, criando um novo vocabulário musical.',
      },
    ],
    'Gustav Mahler': [
      {
        id: '1',
        icon: '📏',
        text: 'Suas sinfonias estão entre as mais longas já escritas, algumas durando mais de 90 minutos.',
      },
      {
        id: '2',
        icon: '🎤',
        text: 'Incluiu vozes humanas em várias de suas sinfonias.',
      },
      {
        id: '3',
        icon: '🎯',
        text: 'Dizia que "uma sinfonia deve conter o mundo inteiro".',
      },
      {
        id: '4',
        icon: '🎭',
        text: 'Foi um dos regentes mais importantes de sua época, dirigindo a Ópera de Viena.',
      },
    ],
    'Franz Liszt': [
      {
        id: '1',
        icon: '⚡',
        text: 'Era considerado o primeiro "astro do rock" da música clássica, com fãs histéricas.',
      },
      {
        id: '2',
        icon: '🎹',
        text: 'Inventou o recital de piano solo e muitas técnicas pianísticas modernas.',
      },
      {
        id: '3',
        icon: '💔',
        text: "Teve vários romances famosos, incluindo com a Condessa Marie d'Agoult.",
      },
      {
        id: '4',
        icon: '⛪',
        text: 'Nos últimos anos, tornou-se padre e compôs música sacra.',
      },
    ],
    'Maurice Ravel': [
      {
        id: '1',
        icon: '💃',
        text: '"Bolero" repete o mesmo tema 18 vezes com instrumentação crescente.',
      },
      {
        id: '2',
        icon: '🎪',
        text: 'Era perfeccionista extremo e compunha muito lentamente.',
      },
      {
        id: '3',
        icon: '🧸',
        text: 'Adorava brinquedos mecânicos e objetos em miniatura.',
      },
      {
        id: '4',
        icon: '✋',
        text: 'Sofreu de uma doença neurológica que o impediu de compor seus últimos anos.',
      },
    ],
    'Antonín Dvořák': [
      {
        id: '1',
        icon: '🚂',
        text: 'Era fascinado por trens e memorizava números de locomotivas.',
      },
      {
        id: '2',
        icon: '🇺🇸',
        text: 'Sua "Sinfonia do Novo Mundo" foi composta durante sua estadia nos EUA.',
      },
      {
        id: '3',
        icon: '🕊️',
        text: 'Criou melodias inspiradas em cantos de pássaros e música folclórica.',
      },
      {
        id: '4',
        icon: '🎓',
        text: 'Dirigiu o Conservatório Nacional de Nova York.',
      },
    ],
    'Antonio Vivaldi': [
      {
        id: '1',
        icon: '🌸',
        text: '"As Quatro Estações" é uma das obras mais reconhecidas da música clássica.',
      },
      {
        id: '2',
        icon: '⛪',
        text: 'Era padre, conhecido como "Il Prete Rosso" (O Padre Ruivo) devido a seu cabelo.',
      },
      {
        id: '3',
        icon: '🎻',
        text: 'Compôs mais de 500 concertos, a maioria para violino.',
      },
      {
        id: '4',
        icon: '🏫',
        text: 'Ensinou música em um orfanato para meninas em Veneza.',
      },
    ],
    'Dmitri Shostakovich': [
      {
        id: '1',
        icon: '⚔️',
        text: 'Compôs sua "Sinfonia Leningrado" durante o cerco nazista a Leningrado.',
      },
      {
        id: '2',
        icon: '🤐',
        text: 'Usava códigos musicais para criticar o regime soviético sem ser detectado.',
      },
      {
        id: '3',
        icon: '⚽',
        text: 'Era árbitro de futebol registrado e grande fã do esporte.',
      },
      {
        id: '4',
        icon: '😰',
        text: 'Vivia com medo constante de perseguição política.',
      },
    ],
    'Steve Reich': [
      {
        id: '1',
        icon: '🔄',
        text: 'Pioneiro da música minimalista com técnicas de repetição e mudança gradual.',
      },
      {
        id: '2',
        icon: '📻',
        text: 'Usou gravações de vozes faladas como material musical em "Come Out".',
      },
      {
        id: '3',
        icon: '🎤',
        text: 'Estudou percussão africana em Gana para expandir sua linguagem musical.',
      },
      {
        id: '4',
        icon: '🏙️',
        text: '"Music for 18 Musicians" influenciou gerações de compositores contemporâneos.',
      },
    ],
    'Frédéric Chopin': [
      {
        id: '1',
        icon: '🇵🇱',
        text: 'Seu coração está enterrado em Varsóvia, mas seu corpo em Paris.',
      },
      {
        id: '2',
        icon: '🎹',
        text: 'Quase toda sua música foi composta para piano solo.',
      },
      {
        id: '3',
        icon: '💔',
        text: 'Teve um relacionamento tempestuoso com a escritora George Sand.',
      },
      {
        id: '4',
        icon: '🏠',
        text: 'Passou a maior parte da vida adulta em Paris, mas sempre sentiu nostalgia da Polônia.',
      },
    ],
    'Serge Prokofiev': [
      {
        id: '1',
        icon: '🐺',
        text: '"Pedro e o Lobo" foi criado para ensinar instrumentos às crianças.',
      },
      {
        id: '2',
        icon: '🎮',
        text: 'Retornou à União Soviética em 1936, deixando o sucesso internacional.',
      },
      {
        id: '3',
        icon: '♟️',
        text: 'Era um excelente jogador de xadrez e chegou a considerar a carreira profissional.',
      },
      {
        id: '4',
        icon: '🎭',
        text: 'Compôs "Romeu e Julieta", um dos balés mais populares do século XX.',
      },
    ],
    'Béla Bartók': [
      {
        id: '1',
        icon: '🎤',
        text: 'Gravou milhares de canções folclóricas da Europa Oriental.',
      },
      {
        id: '2',
        icon: '🔬',
        text: 'Usou proporções matemáticas e a sequência de Fibonacci em suas composições.',
      },
      {
        id: '3',
        icon: '🦇',
        text: 'Estudou insetos como hobby científico paralelo à música.',
      },
      {
        id: '4',
        icon: '🇺🇸',
        text: 'Emigrou para os EUA durante a Segunda Guerra Mundial, morrendo em relativa pobreza.',
      },
    ],
    'Hector Berlioz': [
      {
        id: '1',
        icon: '💀',
        text: 'Sua "Sinfonia Fantástica" narra sua obsessão amorosa e inclui uma marcha ao cadafalso.',
      },
      {
        id: '2',
        icon: '🎭',
        text: 'Escreveu críticas musicais sarcásticas para sobreviver financeiramente.',
      },
      {
        id: '3',
        icon: '💊',
        text: 'Abandonou os estudos de medicina para se dedicar à música.',
      },
      {
        id: '4',
        icon: '🎺',
        text: 'Expandiu drasticamente o tamanho e os recursos da orquestra.',
      },
    ],
    'Anton Bruckner': [
      {
        id: '1',
        icon: '🔢',
        text: 'Tinha obsessão por números e contava tudo compulsivamente.',
      },
      {
        id: '2',
        icon: '⛪',
        text: 'Era profundamente religioso e organista de igreja.',
      },
      {
        id: '3',
        icon: '📏',
        text: 'Suas sinfonias estão entre as mais longas do repertório romântico.',
      },
      {
        id: '4',
        icon: '🎓',
        text: 'Começou a compor sinfonias relativamente tarde, aos 40 anos.',
      },
    ],
    'Giovanni Pierluigi da Palestrina': [
      {
        id: '1',
        icon: '⛪',
        text: 'Salvou a polifonia sacra das reformas do Concílio de Trento.',
      },
      {
        id: '2',
        icon: '👼',
        text: 'Sua "Missa do Papa Marcelo" é considerada um modelo de música sacra.',
      },
      {
        id: '3',
        icon: '🎵',
        text: 'Desenvolveu um estilo que equilibrava clareza textual e beleza musical.',
      },
      {
        id: '4',
        icon: '🏛️',
        text: 'É considerado o maior compositor de música sacra do Renascimento.',
      },
    ],
    'Claudio Monteverdi': [
      {
        id: '1',
        icon: '🎭',
        text: 'Criou a primeira ópera verdadeiramente dramática com "Orfeo".',
      },
      {
        id: '2',
        icon: '🌉',
        text: 'Fez a transição entre a música renascentista e barroca.',
      },
      {
        id: '3',
        icon: '⛪',
        text: 'Foi maestro da Basílica de São Marcos em Veneza.',
      },
      {
        id: '4',
        icon: '💔',
        text: 'Suas cartas revelam profunda tristeza pela morte prematura de sua esposa.',
      },
    ],
    'Jean Sibelius': [
      {
        id: '1',
        icon: '🇫🇮',
        text: 'Tornou-se símbolo nacional da Finlândia com "Finlandia".',
      },
      {
        id: '2',
        icon: '🌲',
        text: 'Suas sinfonias são inspiradas na natureza nórdica.',
      },
      {
        id: '3',
        icon: '🤐',
        text: 'Parou de compor aos 60 anos e viveu mais 30 anos em silêncio criativo.',
      },
      {
        id: '4',
        icon: '🍷',
        text: 'Lutou contra o alcoolismo durante parte de sua vida.',
      },
    ],
    'Ralph Vaughan Williams': [
      {
        id: '1',
        icon: '🎵',
        text: 'Coletou canções folclóricas inglesas para preservar a tradição nacional.',
      },
      {
        id: '2',
        icon: '⚔️',
        text: 'Serviu como motorista de ambulância na Primeira Guerra Mundial aos 40 anos.',
      },
      {
        id: '3',
        icon: '🎓',
        text: 'Ensinou composição no Royal College of Music por décadas.',
      },
      {
        id: '4',
        icon: '🌅',
        text: 'Sua música evoca paisagens e tradições da Inglaterra rural.',
      },
    ],
    'Modest Mussorgsky': [
      {
        id: '1',
        icon: '🖼️',
        text: '"Quadros de uma Exposição" foi inspirado por pinturas de seu amigo Viktor Hartmann.',
      },
      {
        id: '2',
        icon: '🍺',
        text: 'Lutou contra o alcoolismo, que contribuiu para sua morte prematura.',
      },
      {
        id: '3',
        icon: '🏛️',
        text: 'Era funcionário público e compunha nas horas vagas.',
      },
      {
        id: '4',
        icon: '🇷🇺',
        text: 'Membro do "Grupo dos Cinco", compositores russos nacionalistas.',
      },
    ],
    'Giacomo Puccini': [
      {
        id: '1',
        icon: '🎭',
        text: 'Compôs algumas das óperas mais populares: "La Bohème", "Tosca" e "Madama Butterfly".',
      },
      {
        id: '2',
        icon: '🚗',
        text: 'Era apaixonado por carros e lanchas de alta velocidade.',
      },
      {
        id: '3',
        icon: '🎯',
        text: 'Especializou-se em criar melodias extremamente cativantes e emotivas.',
      },
      {
        id: '4',
        icon: '💔',
        text: 'Suas óperas frequentemente terminam tragicamente, mas são imensamente populares.',
      },
    ],
    'Henry Purcell': [
      {
        id: '1',
        icon: '👑',
        text: 'Foi organista da Abadia de Westminster e compositor da corte inglesa.',
      },
      {
        id: '2',
        icon: '⚰️',
        text: '"Music for the Funeral of Queen Mary" tornou-se uma de suas obras mais famosas.',
      },
      {
        id: '3',
        icon: '🎭',
        text: 'Criou "Dido and Aeneas", considerada a primeira grande ópera inglesa.',
      },
      {
        id: '4',
        icon: '💀',
        text: 'Morreu aos 36 anos, possivelmente de tuberculose.',
      },
    ],
    'Gioacchino Rossini': [
      {
        id: '1',
        icon: '⚡',
        text: 'Compunha tão rapidamente que era chamado de "Signor Crescendo".',
      },
      {
        id: '2',
        icon: '🍝',
        text: 'Era um grande gourmand e deu nome a pratos culinários.',
      },
      {
        id: '3',
        icon: '🎭',
        text: '"O Barbeiro de Sevilha" foi composta em apenas 13 dias.',
      },
      {
        id: '4',
        icon: '🛌',
        text: 'Aposentou-se da ópera aos 37 anos e viveu confortavelmente por mais 40 anos.',
      },
    ],
    'Edward Elgar': [
      {
        id: '1',
        icon: '🎓',
        text: '"Pomp and Circumstance" é tocada em formaturas no mundo todo.',
      },
      {
        id: '2',
        icon: '🔤',
        text: 'As "Variações Enigma" contêm um mistério nunca completamente decifrado.',
      },
      {
        id: '3',
        icon: '🏆',
        text: 'Foi o primeiro compositor inglês a ganhar reconhecimento internacional em séculos.',
      },
      {
        id: '4',
        icon: '🎹',
        text: 'Era autodidata e não teve educação musical formal.',
      },
    ],
    'Sergei Rachmaninoff': [
      {
        id: '1',
        icon: '✋',
        text: 'Tinha mãos enormes que podiam alcançar uma décima terceira no piano.',
      },
      {
        id: '2',
        icon: '😔',
        text: 'Sofreu depressão severa após o fracasso de sua Primeira Sinfonia.',
      },
      {
        id: '3',
        icon: '🇺🇸',
        text: 'Emigrou para os EUA após a Revolução Russa e nunca mais retornou.',
      },
      {
        id: '4',
        icon: '🎹',
        text: 'Era considerado um dos maiores pianistas de todos os tempos.',
      },
    ],
    'Camille Saint-Saëns': [
      {
        id: '1',
        icon: '🦢',
        text: '"O Cisne" do "Carnaval dos Animais" tornou-se uma das melodias mais amadas.',
      },
      {
        id: '2',
        icon: '🧠',
        text: 'Era uma criança prodígio que compôs sua primeira peça aos 3 anos.',
      },
      {
        id: '3',
        icon: '🔭',
        text: 'Tinha interesses científicos e chegou a escrever sobre astronomia.',
      },
      {
        id: '4',
        icon: '🌍',
        text: 'Viajou extensivamente, incluindo várias visitas ao Egito e Argélia.',
      },
    ],
    'Josquin Des Prez': [
      {
        id: '1',
        icon: '👑',
        text: 'Foi considerado o maior compositor de sua época, admirado por reis e papas.',
      },
      {
        id: '2',
        icon: '🎭',
        text: 'Revolucionou a polifonia renascentista com técnicas expressivas inovadoras.',
      },
      {
        id: '3',
        icon: '📝',
        text: 'Suas missas e motetos definiram o padrão da música sacra renascentista.',
      },
      {
        id: '4',
        icon: '🌍',
        text: 'Influenciou compositores por toda a Europa, sendo chamado de "Príncipe da Música".',
      },
    ],
    'Nikolai Rimsky-Korsakov': [
      {
        id: '1',
        icon: '🐝',
        text: 'Compôs "O Voo do Zangão", uma das peças mais tecnicamente desafiadoras.',
      },
      {
        id: '2',
        icon: '⚓',
        text: 'Era oficial da Marinha Russa antes de se dedicar completamente à música.',
      },
      {
        id: '3',
        icon: '🎨',
        text: 'Tinha sinestesia e associava tonalidades musicais com cores específicas.',
      },
      {
        id: '4',
        icon: '🇷🇺',
        text: 'Membro do "Grupo dos Cinco" e professor de Stravinsky.',
      },
    ],
    'Carl Maria von Weber': [
      {
        id: '1',
        icon: '🎭',
        text: 'Criou a primeira ópera romântica alemã com "Der Freischütz".',
      },
      {
        id: '2',
        icon: '🎻',
        text: 'Revolucionou a técnica de regência, sendo um dos primeiros maestros modernos.',
      },
      {
        id: '3',
        icon: '💀',
        text: 'Morreu em Londres aos 39 anos, sendo enterrado 18 anos depois na Alemanha.',
      },
      {
        id: '4',
        icon: '🎼',
        text: 'Suas obras influenciaram diretamente Wagner e o desenvolvimento da ópera alemã.',
      },
    ],
    'Jean-Philippe Rameau': [
      {
        id: '1',
        icon: '📚',
        text: 'Escreveu o "Tratado de Harmonia" que revolucionou a teoria musical.',
      },
      {
        id: '2',
        icon: '🎹',
        text: 'Era considerado o maior compositor francês antes de Debussy.',
      },
      {
        id: '3',
        icon: '🎭',
        text: 'Começou a compor óperas apenas aos 50 anos, mas criou obras-primas.',
      },
      {
        id: '4',
        icon: '🔬',
        text: 'Aplicou princípios científicos à análise da harmonia musical.',
      },
    ],
    'Jean-Baptiste Lully': [
      {
        id: '1',
        icon: '👑',
        text: 'Foi compositor oficial de Luís XIV e criador da ópera francesa.',
      },
      {
        id: '2',
        icon: '💀',
        text: 'Morreu após perfurar o pé com sua própria batuta de regência.',
      },
      {
        id: '3',
        icon: '🎭',
        text: 'Monopolizou a produção operística francesa por décadas.',
      },
      {
        id: '4',
        icon: '🇮🇹',
        text: 'Nasceu italiano mas se tornou mais francês que os próprios franceses.',
      },
    ],
    'Gabriel Fauré': [
      {
        id: '1',
        icon: '🌙',
        text: 'Compôs algumas das canções francesas mais belas, como "Clair de Lune".',
      },
      {
        id: '2',
        icon: '🎓',
        text: 'Foi diretor do Conservatório de Paris e professor de Ravel.',
      },
      {
        id: '3',
        icon: '🦻',
        text: 'Desenvolveu surdez progressiva, mas continuou compondo.',
      },
      {
        id: '4',
        icon: '⛪',
        text: 'Seu "Réquiem" é considerado uma das obras sacras mais serenas já escritas.',
      },
    ],
    'Edvard Grieg': [
      {
        id: '1',
        icon: '🇳🇴',
        text: 'Tornou-se o símbolo musical da Noruega com "Peer Gynt".',
      },
      {
        id: '2',
        icon: '🏔️',
        text: 'Sua música captura perfeitamente as paisagens e folclore noruegueses.',
      },
      {
        id: '3',
        icon: '🎹',
        text: 'Tinha mãos pequenas, o que influenciou seu estilo pianístico único.',
      },
      {
        id: '4',
        icon: '💒',
        text: 'Casou-se com sua prima Nina, que era também uma talentosa cantora.',
      },
    ],
    'Christoph Willibald Gluck': [
      {
        id: '1',
        icon: '🎭',
        text: 'Reformou a ópera, eliminando excessos vocais em favor do drama.',
      },
      {
        id: '2',
        icon: '🇫🇷',
        text: 'Sua "Orfeo ed Euridice" ainda é regularmente encenada hoje.',
      },
      {
        id: '3',
        icon: '⚔️',
        text: 'Travou a famosa "Guerra dos Bufões" contra os defensores da ópera italiana.',
      },
      {
        id: '4',
        icon: '👑',
        text: 'Foi compositor da corte imperial austríaca e professor de Maria Antonieta.',
      },
    ],
    'Arnold Schoenberg': [
      {
        id: '1',
        icon: '🔢',
        text: 'Inventou o sistema dodecafônico, revolucionando a música do século XX.',
      },
      {
        id: '2',
        icon: '🎨',
        text: 'Era também pintor expressionista e amigo de Kandinsky.',
      },
      {
        id: '3',
        icon: '🇺🇸',
        text: 'Fugiu dos nazistas e ensinou em Hollywood, influenciando a música de cinema.',
      },
      {
        id: '4',
        icon: '🎓',
        text: 'Seus alunos Berg e Webern formaram a "Segunda Escola de Viena".',
      },
    ],
    'Charles Ives': [
      {
        id: '1',
        icon: '💼',
        text: 'Era executivo de seguros e compunha música experimental nas horas vagas.',
      },
      {
        id: '2',
        icon: '🇺🇸',
        text: 'Criou a primeira música verdadeiramente americana, usando hinos e marchas populares.',
      },
      {
        id: '3',
        icon: '🏆',
        text: 'Ganhou o Prêmio Pulitzer de Música em 1947.',
      },
      {
        id: '4',
        icon: '⚡',
        text: 'Experimentou com politonalidade e microtonalidade décadas antes de outros compositores.',
      },
    ],
    'Paul Hindemith': [
      {
        id: '1',
        icon: '🎯',
        text: 'Podia tocar praticamente qualquer instrumento da orquestra.',
      },
      {
        id: '2',
        icon: '🎓',
        text: 'Desenvolveu uma nova teoria harmônica baseada em princípios acústicos.',
      },
      {
        id: '3',
        icon: '🇺🇸',
        text: 'Emigrou para os EUA quando os nazistas baniram sua música.',
      },
      {
        id: '4',
        icon: '📚',
        text: 'Escreveu música para todos os instrumentos em seu projeto "Música de Câmara".',
      },
    ],
    'Olivier Messiaen': [
      {
        id: '1',
        icon: '🐦',
        text: 'Gravou e transcreveu cantos de pássaros para usar em suas composições.',
      },
      {
        id: '2',
        icon: '🌈',
        text: 'Tinha sinestesia e via cores específicas para cada acorde.',
      },
      {
        id: '3',
        icon: '⛪',
        text: 'Era organista da igreja Sainte-Trinité em Paris por mais de 60 anos.',
      },
      {
        id: '4',
        icon: '🕰️',
        text: 'Sua obra "Quarteto para o Fim dos Tempos" foi composta em um campo de concentração.',
      },
    ],
    'Aaron Copland': [
      {
        id: '1',
        icon: '🤠',
        text: 'Criou o som da música americana com "Rodeo" e "Appalachian Spring".',
      },
      {
        id: '2',
        icon: '🎬',
        text: 'Compôs trilhas sonoras para filmes, ganhando um Oscar.',
      },
      {
        id: '3',
        icon: '🎓',
        text: 'Foi mentor de Leonard Bernstein e outros grandes maestros americanos.',
      },
      {
        id: '4',
        icon: '🇺🇸',
        text: 'Sua "Fanfarra para o Homem Comum" tornou-se um hino não-oficial americano.',
      },
    ],
    'Francois Couperin': [
      {
        id: '1',
        icon: '👑',
        text: 'Era membro de uma dinastia musical que serviu à corte francesa por séculos.',
      },
      {
        id: '2',
        icon: '🎹',
        text: 'Suas peças de cravo têm títulos poéticos como "A Misteriosa" e "Os Rouxinóis Amorosos".',
      },
      {
        id: '3',
        icon: '📚',
        text: 'Escreveu um tratado sobre a arte de tocar cravo que influenciou gerações.',
      },
      {
        id: '4',
        icon: '🇫🇷',
        text: 'Representou o refinamento e elegância da música francesa barroca.',
      },
    ],
    'William Byrd': [
      {
        id: '1',
        icon: '⛪',
        text: 'Foi o maior compositor inglês da era elisabetana.',
      },
      {
        id: '2',
        icon: '🕊️',
        text: 'Permaneceu católico numa Inglaterra protestante, mas manteve favor real.',
      },
      {
        id: '3',
        icon: '📜',
        text: 'Recebeu monopólio real para impressão de música na Inglaterra.',
      },
      {
        id: '4',
        icon: '🎼',
        text: 'Suas missas latinas são consideradas obras-primas da polifonia sacra.',
      },
    ],
    'Erik Satie': [
      {
        id: '1',
        icon: '🎪',
        text: 'Compôs peças com títulos excêntricos como "Três Peças na Forma de uma Pêra".',
      },
      {
        id: '2',
        icon: '☕',
        text: 'Frequentava cabarets de Montmartre e era figura do mundo boêmio parisiense.',
      },
      {
        id: '3',
        icon: '🎯',
        text: 'Influenciou Debussy, Ravel e os compositores do grupo "Les Six".',
      },
      {
        id: '4',
        icon: '🔄',
        text: 'Criou a "música mobiliária", precursora da música ambiente.',
      },
    ],
    'Benjamin Britten': [
      {
        id: '1',
        icon: '🌊',
        text: 'Sua ópera "Peter Grimes" revitalizou a ópera inglesa no século XX.',
      },
      {
        id: '2',
        icon: '🎭',
        text: 'Fundou o Festival de Aldeburgh, que continua ativo até hoje.',
      },
      {
        id: '3',
        icon: '🎼',
        text: 'Especializou-se em escrever música para vozes jovens e crianças.',
      },
      {
        id: '4',
        icon: '🏆',
        text: 'Foi o primeiro compositor a receber o título de Lord na Inglaterra.',
      },
    ],
    'Bedrick Smetana': [
      {
        id: '1',
        icon: '🇨🇿',
        text: 'É considerado o pai da música nacional tcheca com "Má vlast".',
      },
      {
        id: '2',
        icon: '🌊',
        text: 'Sua "Moldau" retrata musicalmente o rio que atravessa Praga.',
      },
      {
        id: '3',
        icon: '🦻',
        text: 'Compôs seu quarteto "Da Minha Vida" após ficar surdo.',
      },
      {
        id: '4',
        icon: '🎭',
        text: 'Sua ópera "A Noiva Vendida" continua muito popular na República Tcheca.',
      },
    ],
    'César Franck': [
      {
        id: '1',
        icon: '🇧🇪',
        text: 'Nasceu na Bélgica mas tornou-se o principal compositor francês de sua época.',
      },
      {
        id: '2',
        icon: '⛪',
        text: 'Era organista da basílica Sainte-Clotilde em Paris.',
      },
      {
        id: '3',
        icon: '🎓',
        text: "Seus alunos no Conservatório incluíam Vincent d'Indy e Ernest Chausson.",
      },
      {
        id: '4',
        icon: '🎼',
        text: 'Sua Sinfonia em Ré menor é considerada a melhor sinfonia francesa do século XIX.',
      },
    ],
    'Alexander Nikolayevich Scriabin': [
      {
        id: '1',
        icon: '🌈',
        text: 'Tinha sinestesia e criou um "teclado de cores" para acompanhar sua música.',
      },
      {
        id: '2',
        icon: '🎹',
        text: 'Desenvolveu um sistema harmônico próprio baseado no "acorde místico".',
      },
      {
        id: '3',
        icon: '🧙‍♂️',
        text: 'Acreditava que sua música poderia transformar o mundo através da experiência mística.',
      },
      {
        id: '4',
        icon: '💀',
        text: 'Morreu jovem, aos 43 anos, de uma infecção causada por um furúnculo.',
      },
    ],
    'Georges Bizet': [
      {
        id: '1',
        icon: '🌹',
        text: 'Sua ópera "Carmen" é uma das mais populares de todos os tempos.',
      },
      {
        id: '2',
        icon: '💀',
        text: 'Morreu três meses após a estreia de "Carmen", sem saber de seu sucesso futuro.',
      },
      {
        id: '3',
        icon: '🎭',
        text: 'A ária "Habanera" de Carmen tornou-se um dos trechos operísticos mais conhecidos.',
      },
      {
        id: '4',
        icon: '🇫🇷',
        text: 'Representou perfeitamente o espírito da ópera francesa do século XIX.',
      },
    ],
    'Domenico Scarlatti': [
      {
        id: '1',
        icon: '🎹',
        text: 'Compôs mais de 550 sonatas para cravo, cada uma explorando técnicas diferentes.',
      },
      {
        id: '2',
        icon: '🇪🇸',
        text: 'Viveu na Espanha e incorporou elementos da música flamenca em suas obras.',
      },
      {
        id: '3',
        icon: '👑',
        text: 'Foi professor de música da Princesa Maria Bárbara.',
      },
      {
        id: '4',
        icon: '⚡',
        text: 'Suas sonatas exigiam técnicas pianísticas revolucionárias para a época.',
      },
    ],
    'Georg Philipp Telemann': [
      {
        id: '1',
        icon: '📝',
        text: 'Foi o compositor mais prolífico da história, com mais de 3.000 obras.',
      },
      {
        id: '2',
        icon: '🎼',
        text: 'Era mais famoso que Bach durante sua vida.',
      },
      {
        id: '3',
        icon: '🎭',
        text: 'Compôs mais de 40 óperas e centenas de cantatas sacras.',
      },
      {
        id: '4',
        icon: '🌍',
        text: 'Influenciou estilos musicais de toda a Europa em suas composições.',
      },
    ],
    'Anton Webern': [
      {
        id: '1',
        icon: '🔬',
        text: 'Suas obras são extremamente concisas - algumas duram menos de um minuto.',
      },
      {
        id: '2',
        icon: '🎯',
        text: 'Levou o sistema dodecafônico de Schoenberg às últimas consequências.',
      },
      {
        id: '3',
        icon: '💀',
        text: 'Foi morto acidentalmente por um soldado americano em 1945.',
      },
      {
        id: '4',
        icon: '🌟',
        text: 'Influenciou profundamente a música serial do pós-guerra.',
      },
    ],
    'Roland de Lassus': [
      {
        id: '1',
        icon: '🌍',
        text: 'Compôs em latim, francês, alemão e italiano, sendo verdadeiramente cosmopolita.',
      },
      {
        id: '2',
        icon: '👑',
        text: 'Serviu na corte de Munique por mais de 30 anos.',
      },
      {
        id: '3',
        icon: '🎵',
        text: 'Suas mais de 2.000 obras incluem desde música sacra até canções seculares.',
      },
      {
        id: '4',
        icon: '🏆',
        text: 'Foi considerado o maior compositor de sua época ao lado de Palestrina.',
      },
    ],
    'George Gershwin': [
      {
        id: '1',
        icon: '🎹',
        text: '"Rhapsody in Blue" revolucionou a música clássica americana incorporando jazz.',
      },
      {
        id: '2',
        icon: '🎭',
        text: 'Compôs sucessos da Broadway como "I Got Rhythm" e "Summertime".',
      },
      {
        id: '3',
        icon: '🧠',
        text: 'Morreu jovem, aos 38 anos, de um tumor cerebral.',
      },
      {
        id: '4',
        icon: '🎬',
        text: 'Sua música influenciou tanto o jazz quanto a música erudita americana.',
      },
    ],
    'Gaetano Donizetti': [
      {
        id: '1',
        icon: '🎭',
        text: 'Compôs mais de 70 óperas, incluindo "L\'Elisir d\'Amore" e "Lucia di Lammermoor".',
      },
      {
        id: '2',
        icon: '⚡',
        text: 'Era conhecido pela velocidade com que compunha - podia escrever uma ópera em duas semanas.',
      },
      {
        id: '3',
        icon: '😢',
        text: 'Sua ária "Una furtiva lagrima" é uma das mais belas do repertório operístico.',
      },
      {
        id: '4',
        icon: '🇮🇹',
        text: 'Representou o auge do bel canto italiano ao lado de Bellini e Rossini.',
      },
    ],
    'Carl Philipp Emanuel Bach': [
      {
        id: '1',
        icon: '👨‍👦',
        text: 'Filho de J.S. Bach, foi mais famoso que o pai durante sua vida.',
      },
      {
        id: '2',
        icon: '👑',
        text: 'Serviu na corte de Frederico, o Grande, da Prússia.',
      },
      {
        id: '3',
        icon: '🎹',
        text: 'Desenvolveu o estilo "empfindsamer Stil" (estilo sensível) no teclado.',
      },
      {
        id: '4',
        icon: '📚',
        text: 'Seu tratado sobre o teclado influenciou Mozart e Beethoven.',
      },
    ],
    'Archangelo Corelli': [
      {
        id: '1',
        icon: '🎻',
        text: 'Estabeleceu as bases da técnica moderna do violino.',
      },
      {
        id: '2',
        icon: '🏛️',
        text: 'Seus concerti grossi definiram o gênero para gerações futuras.',
      },
      {
        id: '3',
        icon: '🎼',
        text: 'Publicou apenas 6 conjuntos de obras, mas todas se tornaram clássicas.',
      },
      {
        id: '4',
        icon: '🇮🇹',
        text: 'Foi o violinista mais famoso da Europa em sua época.',
      },
    ],
    'Thomas Tallis': [
      {
        id: '1',
        icon: '👑',
        text: 'Serviu a quatro monarcas ingleses: Henrique VIII, Eduardo VI, Maria I e Elizabeth I.',
      },
      {
        id: '2',
        icon: '🎤',
        text: 'Compôs "Spem in alium" para 40 vozes independentes.',
      },
      {
        id: '3',
        icon: '⛪',
        text: 'Adaptou-se às mudanças religiosas, compondo tanto música católica quanto protestante.',
      },
      {
        id: '4',
        icon: '📜',
        text: 'Recebeu monopólio real para publicação de música junto com William Byrd.',
      },
    ],
    'Johann Strauss II': [
      {
        id: '1',
        icon: '💃',
        text: 'É conhecido como o "Rei da Valsa" por suas valsas vienenses.',
      },
      {
        id: '2',
        icon: '🎆',
        text: 'Sua "Valsa do Danúbio Azul" tornou-se um hino não-oficial da Áustria.',
      },
      {
        id: '3',
        icon: '🎭',
        text: 'Compôs "Die Fledermaus", uma das operetas mais populares.',
      },
      {
        id: '4',
        icon: '👨‍👦',
        text: 'Superou a fama de seu pai, Johann Strauss I, também compositor de valsas.',
      },
    ],
    'Leos Janácek': [
      {
        id: '1',
        icon: '🗣️',
        text: 'Estudou os padrões melódicos da fala tcheca para criar sua linguagem musical.',
      },
      {
        id: '2',
        icon: '🎭',
        text: 'Sua ópera "Jenůfa" só foi reconhecida quando ele já tinha 60 anos.',
      },
      {
        id: '3',
        icon: '🇨🇿',
        text: 'Incorporou elementos da música folclórica morávia em suas composições.',
      },
      {
        id: '4',
        icon: '💔',
        text: 'Sua paixão tardia por Kamila Stösslová inspirou suas últimas obras-primas.',
      },
    ],
    'Guillaume de Machaut': [
      {
        id: '1',
        icon: '⛪',
        text: 'Compôs a primeira missa polifônica completa da história.',
      },
      {
        id: '2',
        icon: '📚',
        text: 'Foi também poeta e uma das principais figuras da literatura medieval francesa.',
      },
      {
        id: '3',
        icon: '🎵',
        text: 'Desenvolveu formas musicais que influenciaram compositores por séculos.',
      },
      {
        id: '4',
        icon: '🏰',
        text: 'Viveu durante a Guerra dos Cem Anos e serviu a vários nobres franceses.',
      },
    ],
    'Alban Berg': [
      {
        id: '1',
        icon: '🎭',
        text: 'Sua ópera "Wozzeck" é considerada uma das maiores do século XX.',
      },
      {
        id: '2',
        icon: '🔢',
        text: 'Usou códigos numéricos em suas obras, especialmente relacionados a datas importantes.',
      },
      {
        id: '3',
        icon: '🎓',
        text: 'Foi aluno de Schoenberg e membro da "Segunda Escola de Viena".',
      },
      {
        id: '4',
        icon: '💀',
        text: 'Morreu jovem, deixando sua segunda ópera "Lulu" inacabada.',
      },
    ],
    'Alexander Borodin': [
      {
        id: '1',
        icon: '🔬',
        text: 'Era químico profissional e compunha música nas horas vagas.',
      },
      {
        id: '2',
        icon: '🇷🇺',
        text: 'Membro do "Grupo dos Cinco" compositores nacionalistas russos.',
      },
      {
        id: '3',
        icon: '🎭',
        text: 'Sua ópera "Príncipe Igor" contém as famosas "Danças Polovtsianas".',
      },
      {
        id: '4',
        icon: '📚',
        text: 'Descobriu a reação Aldol na química, que leva seu nome.',
      },
    ],
    'Vincenzo Bellini': [
      {
        id: '1',
        icon: '🎵',
        text: 'Era mestre do bel canto, criando melodias de beleza incomparável.',
      },
      {
        id: '2',
        icon: '🌙',
        text: 'Sua ária "Casta diva" de "Norma" é uma das mais desafiadoras do repertório.',
      },
      {
        id: '3',
        icon: '💀',
        text: 'Morreu aos 33 anos em Paris, no auge de sua carreira.',
      },
      {
        id: '4',
        icon: '🇮🇹',
        text: 'Influenciou profundamente Chopin e outros compositores românticos.',
      },
    ],
    'Charles Gounod': [
      {
        id: '1',
        icon: '😈',
        text: 'Sua ópera "Fausto" foi uma das mais populares do século XIX.',
      },
      {
        id: '2',
        icon: '🙏',
        text: 'Compôs a famosa "Ave Maria" baseada em um prelúdio de Bach.',
      },
      {
        id: '3',
        icon: '⛪',
        text: 'Quase se tornou padre antes de se dedicar completamente à música.',
      },
      {
        id: '4',
        icon: '🇫🇷',
        text: 'Representou o estilo operístico francês em sua forma mais refinada.',
      },
    ],
    'Jules Massenet': [
      {
        id: '1',
        icon: '💔',
        text: 'Suas óperas "Manon" e "Werther" são marcos do romantismo francês.',
      },
      {
        id: '2',
        icon: '🎓',
        text: 'Foi professor no Conservatório de Paris por mais de 30 anos.',
      },
      {
        id: '3',
        icon: '🎭',
        text: 'Especializou-se em criar personagens femininas complexas e cativantes.',
      },
      {
        id: '4',
        icon: '🏆',
        text: 'Foi um dos compositores de ópera mais bem-sucedidos de sua época.',
      },
    ],
    'Francis Poulenc': [
      {
        id: '1',
        icon: '🎪',
        text: 'Membro do grupo "Les Six" que revolucionou a música francesa.',
      },
      {
        id: '2',
        icon: '🎭',
        text: 'Combinou elementos populares com sofisticação musical em suas obras.',
      },
      {
        id: '3',
        icon: '⛪',
        text: 'Teve uma conversão religiosa que inspirou suas obras sacras tardias.',
      },
      {
        id: '4',
        icon: '🎹',
        text: 'Era também pianista acompanhador de grandes cantores de sua época.',
      },
    ],
    'Giovanni Gabrieli': [
      {
        id: '1',
        icon: '🏛️',
        text: 'Desenvolveu o estilo policoral em São Marcos, Veneza.',
      },
      {
        id: '2',
        icon: '🎺',
        text: 'Foi pioneiro na escrita idiomática para instrumentos de sopro.',
      },
      {
        id: '3',
        icon: '🎵',
        text: 'Suas "Sacrae Symphoniae" revolucionaram a música instrumental.',
      },
      {
        id: '4',
        icon: '👨‍🎓',
        text: 'Seus alunos incluíam Heinrich Schütz, que levou seu estilo para a Alemanha.',
      },
    ],
    Pérotin: [
      {
        id: '1',
        icon: '⛪',
        text: 'Desenvolveu a polifonia na Escola de Notre-Dame em Paris.',
      },
      {
        id: '2',
        icon: '🎵',
        text: 'Criou os primeiros exemplos de música a quatro vozes da história.',
      },
      {
        id: '3',
        icon: '🏗️',
        text: 'Sua música reflete a arquitetura gótica de Notre-Dame.',
      },
      {
        id: '4',
        icon: '📜',
        text: 'Seus organa são marcos da música medieval europeia.',
      },
    ],
    'Heinrich Schütz': [
      {
        id: '1',
        icon: '🇩🇪',
        text: 'É considerado o maior compositor alemão antes de Bach.',
      },
      { id: '2', icon: '🇮🇹', text: 'Estudou com Giovanni Gabrieli em Veneza.' },
      {
        id: '3',
        icon: '⚔️',
        text: 'Viveu durante a Guerra dos Trinta Anos, que influenciou suas obras.',
      },
      {
        id: '4',
        icon: '🎼',
        text: 'Estabeleceu as bases da música sacra protestante alemã.',
      },
    ],
    'John Cage': [
      {
        id: '1',
        icon: '🤫',
        text: 'Sua peça "4\'33"" consiste inteiramente de silêncio.',
      },
      {
        id: '2',
        icon: '🎲',
        text: 'Usava o I Ching para determinar elementos aleatórios em suas composições.',
      },
      {
        id: '3',
        icon: '🎹',
        text: 'Inventou o "piano preparado", colocando objetos entre as cordas.',
      },
      {
        id: '4',
        icon: '🧘',
        text: 'Era praticante de zen-budismo, que influenciou profundamente sua estética.',
      },
    ],
    'Giovanni Battista Pergolesi': [
      {
        id: '1',
        icon: '😂',
        text: 'Sua ópera cômica "La serva padrona" revolucionou o gênero.',
      },
      {
        id: '2',
        icon: '💀',
        text: 'Morreu aos 26 anos de tuberculose, mas deixou obras imortais.',
      },
      {
        id: '3',
        icon: '⛪',
        text: 'Seu "Stabat Mater" é uma das mais belas obras sacras do século XVIII.',
      },
      {
        id: '4',
        icon: '🇮🇹',
        text: 'Influenciou o desenvolvimento da ópera buffa italiana.',
      },
    ],
    'John Dowland': [
      {
        id: '1',
        icon: '🎸',
        text: 'Foi o maior compositor para alaúde da história.',
      },
      {
        id: '2',
        icon: '😢',
        text: 'Suas canções melancólicas como "Flow My Tears" definiram uma época.',
      },
      {
        id: '3',
        icon: '🌍',
        text: 'Viajou por toda a Europa, servindo em várias cortes.',
      },
      {
        id: '4',
        icon: '🎵',
        text: 'Suas "Lachrimae" influenciaram compositores por gerações.',
      },
    ],
    'Gustav Holst': [
      {
        id: '1',
        icon: '🪐',
        text: 'Sua suíte "Os Planetas" é uma das obras orquestrais mais populares.',
      },
      {
        id: '2',
        icon: '🏫',
        text: "Foi professor na St. Paul's Girls' School por quase 30 anos.",
      },
      {
        id: '3',
        icon: '🇮🇳',
        text: 'Interessou-se pela filosofia hindu e música indiana.',
      },
      {
        id: '4',
        icon: '🎼',
        text: 'Marte, de "Os Planetas", influenciou muitas trilhas sonoras de filmes.',
      },
    ],
    'Dietrich Buxtehude': [
      {
        id: '1',
        icon: '🎹',
        text: 'Seus concertos de órgão em Lübeck atraíam músicos de toda a Europa.',
      },
      { id: '2', icon: '🚶‍♂️', text: 'Bach caminhou 400 km para ouvi-lo tocar.' },
      {
        id: '3',
        icon: '🎭',
        text: 'Criou os "Abendmusiken", concertos sacros noturnos muito populares.',
      },
      {
        id: '4',
        icon: '🎶',
        text: 'Influenciou profundamente o estilo de Bach e outros compositores barrocos.',
      },
    ],
    'Ottorino Respighi': [
      {
        id: '1',
        icon: '🌲',
        text: 'Sua trilogia sinfônica "Pinheiros de Roma", "Fontes de Roma" e "Festivais Romanos" evoca a cidade eterna.',
      },
      {
        id: '2',
        icon: '🐦',
        text: 'Incluiu gravações reais de cantos de pássaros em "Pinheiros de Roma".',
      },
      {
        id: '3',
        icon: '🎻',
        text: 'Estudou com Rimsky-Korsakov em São Petersburgo.',
      },
      {
        id: '4',
        icon: '🇮🇹',
        text: 'Representou o neoclassicismo italiano do início do século XX.',
      },
    ],
    'Guillaume Dufay': [
      {
        id: '1',
        icon: '⛪',
        text: 'Compôs música para a consagração da cúpula de Santa Maria del Fiore em Florença.',
      },
      {
        id: '2',
        icon: '🎵',
        text: 'Desenvolveu técnicas que definiram a música renascentista.',
      },
      {
        id: '3',
        icon: '🌍',
        text: 'Viajou por toda a Europa, influenciando a música de sua época.',
      },
      {
        id: '4',
        icon: '📜',
        text: 'Suas missas e motetos estabeleceram padrões para gerações futuras.',
      },
    ],
    'Hugo Wolf': [
      {
        id: '1',
        icon: '🎵',
        text: 'Compôs mais de 300 lieders, revolucionando a canção artística alemã.',
      },
      {
        id: '2',
        icon: '📚',
        text: 'Suas canções baseadas em poemas de Goethe e Mörike são obras-primas.',
      },
      {
        id: '3',
        icon: '🧠',
        text: 'Sofreu de transtorno bipolar, que afetava drasticamente sua produtividade.',
      },
      {
        id: '4',
        icon: '🎭',
        text: 'Era crítico musical feroz, atacando Brahms mas defendendo Wagner.',
      },
    ],
    'Carl Nielsen': [
      {
        id: '1',
        icon: '🇩🇰',
        text: 'É o compositor nacional da Dinamarca, com suas sinfonias sendo marcos.',
      },
      {
        id: '2',
        icon: '🎺',
        text: 'Sua Sinfonia nº 4 "Inextinguível" retrata a força vital da humanidade.',
      },
      {
        id: '3',
        icon: '🎼',
        text: 'Desenvolveu um estilo harmônico progressivo único.',
      },
      {
        id: '4',
        icon: '🎭',
        text: 'Suas óperas "Saul e Davi" e "Maskarade" são clássicos dinamarqueses.',
      },
    ],
    'William Walton': [
      {
        id: '1',
        icon: '🎬',
        text: 'Compôs trilhas sonoras para filmes shakespearianos famosos.',
      },
      {
        id: '2',
        icon: '👑',
        text: 'Sua marcha "Crown Imperial" foi usada na coroação de Jorge VI.',
      },
      {
        id: '3',
        icon: '🎻',
        text: 'Seu Concerto para Viola é considerado um dos melhores do repertório.',
      },
      {
        id: '4',
        icon: '🎭',
        text: 'Seu "Façade" combina poesia de Edith Sitwell com música experimental.',
      },
    ],
    'Darius Milhaud': [
      {
        id: '1',
        icon: '🎪',
        text: 'Membro do grupo "Les Six" e compositor extremamente prolífico.',
      },
      {
        id: '2',
        icon: '🎵',
        text: 'Experimentou com politonalidade, usando várias tonalidades simultâneas.',
      },
      {
        id: '3',
        icon: '🌎',
        text: 'Incorporou elementos de jazz e música latina brasileira em suas obras.',
      },
      {
        id: '4',
        icon: '🎓',
        text: 'Ensinou composição na França e nos Estados Unidos.',
      },
    ],
    'Orlando Gibbons': [
      {
        id: '1',
        icon: '👑',
        text: 'Foi organista da Capela Real inglesa e da Abadia de Westminster.',
      },
      {
        id: '2',
        icon: '🎹',
        text: 'Suas "Fantasias" para virginal são obras-primas da música elizabetana.',
      },
      {
        id: '3',
        icon: '⛪',
        text: 'Compôs alguns dos mais belos anthems da música sacra inglesa.',
      },
      {
        id: '4',
        icon: '💀',
        text: 'Morreu subitamente aos 41 anos durante uma viagem real.',
      },
    ],
    'Giacomo Meyerbeer': [
      {
        id: '1',
        icon: '🎭',
        text: 'Dominou a ópera francesa com espetáculos grandiosos como "Os Huguenotes".',
      },
      {
        id: '2',
        icon: '💰',
        text: 'Era extremamente rico e podia financiar suas próprias produções operísticas.',
      },
      {
        id: '3',
        icon: '🌍',
        text: 'Suas óperas foram as mais populares da Europa em meados do século XIX.',
      },
      {
        id: '4',
        icon: '🎯',
        text: 'Influenciou Wagner, que depois o criticou publicamente.',
      },
    ],
    'Samuel Barber': [
      {
        id: '1',
        icon: '😢',
        text: 'Seu "Adagio para Cordas" é uma das peças mais emocionantes da música americana.',
      },
      {
        id: '2',
        icon: '🎭',
        text: 'Sua ópera "Vanessa" ganhou o Prêmio Pulitzer.',
      },
      {
        id: '3',
        icon: '🎵',
        text: 'Manteve um estilo tonal romântico numa época de experimentação.',
      },
      {
        id: '4',
        icon: '🏆',
        text: 'Foi um dos compositores americanos mais premiados do século XX.',
      },
    ],
    'Tomás Luis de Victoria': [
      {
        id: '1',
        icon: '⛪',
        text: 'É considerado o maior compositor espanhol do Renascimento.',
      },
      {
        id: '2',
        icon: '🇮🇹',
        text: 'Estudou em Roma e foi influenciado por Palestrina.',
      },
      {
        id: '3',
        icon: '👑',
        text: 'Serviu na corte das infantas espanholas em Madrid.',
      },
      {
        id: '4',
        icon: '🎵',
        text: 'Suas obras sacras combinam fervor religioso com perfeição técnica.',
      },
    ],
    Léonin: [
      {
        id: '1',
        icon: '⛪',
        text: 'Foi um dos primeiros compositores conhecidos da Escola de Notre-Dame.',
      },
      {
        id: '2',
        icon: '📚',
        text: 'Criou o "Magnus Liber Organi", coleção fundamental da polifonia medieval.',
      },
      {
        id: '3',
        icon: '🎵',
        text: 'Desenvolveu o organum, forma primitiva da polifonia.',
      },
      {
        id: '4',
        icon: '🏗️',
        text: 'Sua música reflete a construção da catedral gótica de Notre-Dame.',
      },
    ],
    'Manuel de Falla': [
      {
        id: '1',
        icon: '💃',
        text: 'Suas obras capturam perfeitamente o espírito do flamenco andaluz.',
      },
      {
        id: '2',
        icon: '🇪🇸',
        text: '"Noches en los jardines de España" evoca as paisagens espanholas.',
      },
      {
        id: '3',
        icon: '🎭',
        text: 'Seu balé "El sombrero de tres picos" é um clássico espanhol.',
      },
      { id: '4', icon: '🎹', text: 'Foi amigo de Debussy e Ravel em Paris.' },
    ],
    'Hildegard von Bingen': [
      {
        id: '1',
        icon: '👩‍⚕️',
        text: 'Foi abadessa, mística, médica e compositora na Alemanha medieval.',
      },
      {
        id: '2',
        icon: '👁️',
        text: 'Dizia receber suas composições através de visões divinas.',
      },
      {
        id: '3',
        icon: '🎵',
        text: 'Suas melodias gregorianas são únicas em beleza e expressividade.',
      },
      {
        id: '4',
        icon: '📚',
        text: 'Escreveu tratados sobre medicina, teologia e ciências naturais.',
      },
    ],
    'Mikhail Glinka': [
      {
        id: '1',
        icon: '🇷🇺',
        text: 'É considerado o pai da música clássica russa.',
      },
      {
        id: '2',
        icon: '🎭',
        text: 'Sua ópera "Uma Vida pelo Czar" foi a primeira ópera russa importante.',
      },
      {
        id: '3',
        icon: '🎼',
        text: 'Influenciou todo o desenvolvimento posterior da música russa.',
      },
      {
        id: '4',
        icon: '🌍',
        text: 'Combinou elementos folclóricos russos com técnicas europeias.',
      },
    ],
    'Alexander Glazunov': [
      {
        id: '1',
        icon: '🩰',
        text: 'Compôs o balé "As Estações" e completou "Príncipe Igor" de Borodin.',
      },
      {
        id: '2',
        icon: '🎻',
        text: 'Seu Concerto para Violino é um dos mais populares do repertório.',
      },
      {
        id: '3',
        icon: '🎓',
        text: 'Foi diretor do Conservatório de São Petersburgo por décadas.',
      },
      {
        id: '4',
        icon: '🧠',
        text: 'Tinha memória musical extraordinária e podia escrever obras inteiras de cor.',
      },
    ],
    'Don Carlo Gesualdo': [
      {
        id: '1',
        icon: '🔪',
        text: 'Assassinou sua esposa e o amante dela, vivendo atormentado pela culpa.',
      },
      {
        id: '2',
        icon: '🎵',
        text: 'Suas harmonias cromáticas eram séculos à frente de seu tempo.',
      },
      {
        id: '3',
        icon: '😈',
        text: 'Seus madrigais expressam tormento psicológico através de dissonâncias ousadas.',
      },
      {
        id: '4',
        icon: '🏰',
        text: 'Era príncipe de Venosa e aristocrata italiano do Renascimento tardio.',
      },
    ],
    'Richard Strauss': [
      {
        id: '1',
        icon: '🌅',
        text: 'Seu "Also sprach Zarathustra" foi usado no filme "2001: Uma Odisseia no Espaço".',
      },
      {
        id: '2',
        icon: '🎭',
        text: 'Compôs "Der Rosenkavalier", uma das óperas mais populares do século XX.',
      },
      {
        id: '3',
        icon: '🎺',
        text: 'Seus poemas sinfônicos revolucionaram a música orquestral.',
      },
      {
        id: '4',
        icon: '💰',
        text: 'Foi um dos primeiros compositores a ganhar muito dinheiro com direitos autorais.',
      },
    ],
    'Philip Glass': [
      {
        id: '1',
        icon: '🔄',
        text: 'Pioneiro do minimalismo, usando repetição e mudanças graduais.',
      },
      {
        id: '2',
        icon: '🎬',
        text: 'Compôs trilhas para filmes como "Koyaanisqatsi" e "The Hours".',
      },
      {
        id: '3',
        icon: '🚕',
        text: 'Trabalhou como taxista em Nova York para sustentar sua carreira musical.',
      },
      {
        id: '4',
        icon: '🎭',
        text: 'Sua ópera "Einstein on the Beach" dura 4 horas e meio sem intervalo.',
      },
    ],
    'John Williams': [
      {
        id: '1',
        icon: '⭐',
        text: 'Compôs as trilhas de Star Wars, Indiana Jones, Harry Potter e Jurassic Park.',
      },
      {
        id: '2',
        icon: '🏆',
        text: 'Ganhou 5 Oscars e foi indicado mais de 50 vezes.',
      },
      {
        id: '3',
        icon: '🎺',
        text: 'Foi regente da Boston Pops Orchestra por 14 anos.',
      },
      {
        id: '4',
        icon: '🎬',
        text: 'Suas trilhas venderam mais de qualquer outro compositor de cinema da história.',
      },
    ],
    'Leonard Bernstein': [
      {
        id: '1',
        icon: '🎭',
        text: 'Compôs "West Side Story", um dos musicais mais amados de todos os tempos.',
      },
      {
        id: '2',
        icon: '🎯',
        text: 'Foi o primeiro maestro americano nato a dirigir uma grande orquestra.',
      },
      {
        id: '3',
        icon: '📺',
        text: 'Seus concertos para jovens na TV educaram gerações sobre música clássica.',
      },
      {
        id: '4',
        icon: '🌟',
        text: 'Era maestro, compositor, pianista e educador - um talento múltiplo raro.',
      },
    ],
    'Heitor Villa-Lobos': [
      {
        id: '1',
        icon: '🇧🇷',
        text: 'É o maior compositor brasileiro, com mais de 2.000 obras catalogadas.',
      },
      {
        id: '2',
        icon: '🎸',
        text: 'Suas "Bachianas Brasileiras" misturam Bach com ritmos brasileiros.',
      },
      {
        id: '3',
        icon: '🌿',
        text: 'Viajou pelo interior do Brasil coletando música folclórica.',
      },
      {
        id: '4',
        icon: '🎓',
        text: 'Criou um sistema nacional de educação musical no Brasil.',
      },
    ],
    'Clara Schumann': [
      {
        id: '1',
        icon: '🎹',
        text: 'Foi uma das maiores pianistas de sua época e compositora talentosa.',
      },
      {
        id: '2',
        icon: '💕',
        text: 'Casou-se com Robert Schumann após uma batalha legal contra seu pai.',
      },
      {
        id: '3',
        icon: '👶',
        text: 'Teve 8 filhos e ainda manteve carreira internacional como concertista.',
      },
      {
        id: '4',
        icon: '💰',
        text: 'Foi a principal sustento da família, ganhando mais que Robert com seus concertos.',
      },
    ],
    'Carl Orff': [
      {
        id: '1',
        icon: '🔥',
        text: 'Sua "Carmina Burana" é uma das peças corais mais populares e dramáticas.',
      },
      {
        id: '2',
        icon: '🎭',
        text: 'O "O Fortuna" é usado em inúmeros filmes e comerciais.',
      },
      {
        id: '3',
        icon: '🎓',
        text: 'Desenvolveu um método revolucionário de educação musical para crianças.',
      },
      {
        id: '4',
        icon: '🥁',
        text: 'Enfatizava ritmo e percussão em suas composições e pedagogia.',
      },
    ],
    'Max Bruch': [
      {
        id: '1',
        icon: '🎻',
        text: 'Seu Concerto para Violino nº 1 é um dos mais tocados e amados do repertório.',
      },
      {
        id: '2',
        icon: '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
        text: 'Sua "Fantasia Escocesa" incorpora melodias folclóricas da Escócia.',
      },
      {
        id: '3',
        icon: '✡️',
        text: '"Kol Nidrei" para violoncelo é baseada em melodias judaicas tradicionais.',
      },
      {
        id: '4',
        icon: '😔',
        text: 'Ficou frustrado por ser lembrado apenas pelo Concerto para Violino.',
      },
    ],
    'Arvo Pärt': [
      {
        id: '1',
        icon: '🔔',
        text: 'Criou o estilo "tintinnabuli", inspirado no som de sinos.',
      },
      {
        id: '2',
        icon: '🤐',
        text: 'Passou 8 anos em silêncio criativo antes de desenvolver seu estilo único.',
      },
      {
        id: '3',
        icon: '🇪🇪',
        text: 'É o compositor estônio mais famoso internacionalmente.',
      },
      {
        id: '4',
        icon: '✨',
        text: 'Sua música minimalista e espiritual toca pessoas de todas as religiões.',
      },
    ],
    'Ennio Morricone': [
      {
        id: '1',
        icon: '🤠',
        text: 'Compôs a trilha icônica de "The Good, the Bad and the Ugly".',
      },
      {
        id: '2',
        icon: '🏆',
        text: 'Recebeu um Oscar honorário em 2007 e ganhou outro em 2016 por "The Hateful Eight".',
      },
      {
        id: '3',
        icon: '🎬',
        text: 'Compôs mais de 400 trilhas sonoras para cinema e TV.',
      },
      {
        id: '4',
        icon: '🎺',
        text: 'Usava sons não-convencionais como assobios, chicotes e harmônicas em suas trilhas.',
      },
    ],
  };

  return (
    curiositiesMap[composerName] || [
      {
        id: '1',
        icon: '🎵',
        text: 'Um dos grandes mestres da música clássica.',
      },
      {
        id: '2',
        icon: '🎼',
        text: 'Suas obras continuam inspirando músicos até hoje.',
      },
      {
        id: '3',
        icon: '⭐',
        text: 'Deixou um legado duradouro na história da música.',
      },
    ]
  );
};
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
  'Heitor Villa-Lobos', // Corrigido para o nome completo
  'Clara Schumann',
  'Carl Orff',
  'Max Bruch',
  'Arvo Pärt',
  'Ennio Morricone',
];
