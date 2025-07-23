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

// 300 Curiosidades Musicais para Opus Atlas
export const musicalFacts = [
  // PERÍODO MEDIEVAL (25 curiosidades)
  {
    id: '1',
    type: 'curiosity',
    icon: '⛪',
    title: 'Canto Gregoriano',
    content:
      'O canto gregoriano, desenvolvido na Idade Média, era totalmente monofônico (uma única melodia) e cantado sem acompanhamento instrumental, criando uma atmosfera transcendental única.',
    category: 'Medieval',
  },
  {
    id: '2',
    type: 'innovation',
    icon: '📜',
    title: 'Primeira Notação',
    content:
      "Guido d'Arezzo (c. 991-1033) revolucionou a música ao criar o sistema de notação com pautas de quatro linhas, predecessor do sistema atual de cinco linhas.",
    category: 'Medieval',
  },
  {
    id: '3',
    type: 'curiosity',
    icon: '🎭',
    title: 'Trovadores e Trouvères',
    content:
      'Os trovadores do sul da França e os trouvères do norte criaram as primeiras canções seculares documentadas, estabelecendo tradições que influenciariam toda a música ocidental.',
    category: 'Medieval',
  },
  {
    id: '4',
    type: 'technique',
    icon: '🎵',
    title: 'Organum',
    content:
      'O organum foi a primeira forma de polifonia organizada, onde uma segunda voz era adicionada ao canto gregoriano, marcando o início da harmonia ocidental.',
    category: 'Medieval',
  },
  {
    id: '5',
    type: 'curiosity',
    icon: '🏰',
    title: 'Escola de Notre-Dame',
    content:
      'A Escola de Notre-Dame de Paris (séc. XII-XIII) foi o primeiro centro de composição polifônica, onde Léonin e Pérotin criaram obras revolucionárias.',
    category: 'Medieval',
  },
  {
    id: '6',
    type: 'instrument',
    icon: '🎻',
    title: 'Viola da Gamba',
    content:
      'A viola da gamba medieval tinha trastes como um violão e era tocada entre as pernas, sendo precursora do violoncelo moderno.',
    category: 'Medieval',
  },
  {
    id: '7',
    type: 'curiosity',
    icon: '📿',
    title: 'Dies Irae',
    content:
      'A melodia do "Dies Irae" (Dia da Ira) medieval foi citada por centenas de compositores posteriores, de Mozart a John Williams em Star Wars.',
    category: 'Medieval',
  },
  {
    id: '8',
    type: 'innovation',
    icon: '🎼',
    title: 'Ars Nova',
    content:
      'O movimento Ars Nova (séc. XIV) introduziu valores rítmicos menores e maior complexidade, revolucionando a música com compositores como Machaut.',
    category: 'Medieval',
  },
  {
    id: '9',
    type: 'curiosity',
    icon: '🎪',
    title: 'Saltarello',
    content:
      'O saltarello era uma dança medieval italiana tão energética que seu nome significa "pequeno salto", sendo executada em festas populares.',
    category: 'Medieval',
  },
  {
    id: '10',
    type: 'technique',
    icon: '🔄',
    title: 'Rondeau Medieval',
    content:
      'O rondeau medieval tinha a forma ABACA, onde o refrão (A) sempre retornava, influenciando formas musicais por séculos.',
    category: 'Medieval',
  },
  {
    id: '11',
    type: 'curiosity',
    icon: '🎶',
    title: 'Manuscrito de Montpellier',
    content:
      'O Manuscrito de Montpellier (séc. XIII) contém alguns dos primeiros motetos polifônicos, revelando a sofisticação da música medieval.',
    category: 'Medieval',
  },
  {
    id: '12',
    type: 'instrument',
    icon: '🥁',
    title: 'Tabor Medieval',
    content:
      'O tabor era um pequeno tambor tocado com uma mão enquanto a outra tocava uma flauta de três buracos, criando uma "orquestra de um homem só".',
    category: 'Medieval',
  },
  {
    id: '13',
    type: 'curiosity',
    icon: '📚',
    title: 'Carmina Burana Original',
    content:
      'Os "Carmina Burana" originais eram canções de estudantes e clérigos medievais alemães, muito antes da famosa versão de Carl Orff.',
    category: 'Medieval',
  },
  {
    id: '14',
    type: 'technique',
    icon: '🎭',
    title: 'Hoquetus',
    content:
      'O hoquetus era uma técnica medieval onde as vozes se alternavam rapidamente, criando um efeito de "soluço" musical muito característico.',
    category: 'Medieval',
  },
  {
    id: '15',
    type: 'curiosity',
    icon: '🌟',
    title: 'Hildegard von Bingen',
    content:
      'Hildegard von Bingen (1098-1179) foi uma das primeiras compositoras conhecidas, criando cantos visionários que ela afirmava receber em revelações divinas.',
    category: 'Medieval',
  },
  {
    id: '16',
    type: 'innovation',
    icon: '🎵',
    title: 'Solmização',
    content:
      "Guido d'Arezzo criou o sistema de solmização (ut-re-mi-fa-sol-la), baseado no hino a São João Batista, que ainda usamos hoje.",
    category: 'Medieval',
  },
  {
    id: '17',
    type: 'curiosity',
    icon: '🏛️',
    title: 'Música Bizantina',
    content:
      'A música bizantina desenvolveu um sistema de notação próprio com "neumas" que indicavam não apenas alturas, mas também ornamentações complexas.',
    category: 'Medieval',
  },
  {
    id: '18',
    type: 'instrument',
    icon: '🎹',
    title: 'Órgão Portativo',
    content:
      'O órgão portativo medieval era carregado e tocado por uma pessoa só, que bombeava o ar com uma mão e tocava com a outra.',
    category: 'Medieval',
  },
  {
    id: '19',
    type: 'curiosity',
    icon: '🎯',
    title: 'Conductus',
    content:
      'O conductus era um tipo de música medieval processional, cantada enquanto o clero se movia durante cerimônias religiosas.',
    category: 'Medieval',
  },
  {
    id: '20',
    type: 'technique',
    icon: '🔢',
    title: 'Modos Medievais',
    content:
      'A música medieval usava oito modos eclesiásticos, cada um com caráter emocional específico, muito antes do sistema maior-menor moderno.',
    category: 'Medieval',
  },
  {
    id: '21',
    type: 'curiosity',
    icon: '📖',
    title: 'Cancioneiro da Vaticana',
    content:
      'O Cancioneiro da Biblioteca Vaticana preserva centenas de canções medievais que poderiam ter sido perdidas para sempre.',
    category: 'Medieval',
  },
  {
    id: '22',
    type: 'innovation',
    icon: '⚖️',
    title: 'Tempus Perfectum',
    content:
      'Na música medieval, o "tempus perfectum" (tempo perfeito) era ternário, considerado divino, enquanto o binário era "imperfeito".',
    category: 'Medieval',
  },
  {
    id: '23',
    type: 'curiosity',
    icon: '🎪',
    title: 'Goliardos',
    content:
      'Os goliardos eram estudantes clérigos errantes que criaram canções satíricas e bebedeiras, desafiando a música religiosa oficial.',
    category: 'Medieval',
  },
  {
    id: '24',
    type: 'instrument',
    icon: '🪘',
    title: 'Alaúde Medieval',
    content:
      'O alaúde chegou à Europa através dos árabes na Espanha, tornando-se o instrumento secular mais popular da Idade Média tardia.',
    category: 'Medieval',
  },
  {
    id: '25',
    type: 'curiosity',
    icon: '🌙',
    title: 'Sérénade Medieval',
    content:
      'As primeiras serenatas eram canções de amor noturnas dos trovadores, cantadas sob as janelas das damas na corte medieval.',
    category: 'Medieval',
  },

  // PERÍODO RENASCENTISTA (25 curiosidades)
  {
    id: '26',
    type: 'innovation',
    icon: '📰',
    title: 'Impressão Musical',
    content:
      'Ottaviano Petrucci foi o primeiro a imprimir música em moveable type (1501), revolucionando a disseminação de partituras na Europa.',
    category: 'Renascimento',
  },
  {
    id: '27',
    type: 'curiosity',
    icon: '🎭',
    title: 'Madrigal Renascentista',
    content:
      'O madrigal renascentista combinava poesia refinada com música polifônica complexa, sendo o equivalente musical da literatura humanística.',
    category: 'Renascimento',
  },
  {
    id: '28',
    type: 'technique',
    icon: '🎵',
    title: 'Imitação Polifônica',
    content:
      'A técnica de imitação polifônica, onde cada voz repete o mesmo tema em momentos diferentes, foi aperfeiçoada no Renascimento.',
    category: 'Renascimento',
  },
  {
    id: '29',
    type: 'curiosity',
    icon: '⛪',
    title: 'Missa Pange Lingua',
    content:
      'A "Missa Pange Lingua" de Josquin des Prez é considerada uma das obras-primas da polifonia renascentista, baseada em um hino gregoriano.',
    category: 'Renascimento',
  },
  {
    id: '30',
    type: 'innovation',
    icon: '🎼',
    title: 'Concílio de Trento',
    content:
      'O Concílio de Trento (1545-1563) quase baniu a polifonia da música sacra, mas a "Missa Papae Marcelli" de Palestrina a salvou.',
    category: 'Renascimento',
  },
  {
    id: '31',
    type: 'curiosity',
    icon: '🏰',
    title: 'Escola Franco-Flamenga',
    content:
      'Os compositores franco-flamengos dominaram a música europeia por 200 anos, espalhando-se por toda a Europa como maestros de capela.',
    category: 'Renascimento',
  },
  {
    id: '32',
    type: 'instrument',
    icon: '🎹',
    title: 'Cravo Renascentista',
    content:
      'O cravo se tornou o rei dos instrumentos de teclado no Renascimento, com alguns exemplares tendo dois teclados e pedais.',
    category: 'Renascimento',
  },
  {
    id: '33',
    type: 'curiosity',
    icon: '📚',
    title: 'Chanson Francesa',
    content:
      'A chanson francesa renascentista influenciou toda a música secular europeia, com compositores como Clément Janequin imitando sons da natureza.',
    category: 'Renascimento',
  },
  {
    id: '34',
    type: 'technique',
    icon: '🎭',
    title: 'Palavra e Música',
    content:
      'Os compositores renascentistas desenvolveram a arte de "pintar" palavras com música, usando técnicas como melismas em palavras como "alegria".',
    category: 'Renascimento',
  },
  {
    id: '35',
    type: 'curiosity',
    icon: '🎪',
    title: 'Dança da Corte',
    content:
      'As danças de corte renascentistas como pavana e galharda eram verdadeiros espetáculos sociais, com coreografias complexas.',
    category: 'Renascimento',
  },
  {
    id: '36',
    type: 'innovation',
    icon: '🌟',
    title: 'Camerata Florentina',
    content:
      'A Camerata Florentina tentou recriar o drama grego antigo, acabando por inventar a ópera no final do século XVI.',
    category: 'Renascimento',
  },
  {
    id: '37',
    type: 'curiosity',
    icon: '🎵',
    title: 'Lamento di Arianna',
    content:
      'O "Lamento di Arianna" de Monteverdi foi tão popular que existia em versão operística e em versão madrigal.',
    category: 'Renascimento',
  },
  {
    id: '38',
    type: 'instrument',
    icon: '🎻',
    title: 'Família das Violas',
    content:
      'No Renascimento, a família das violas tinha seis tamanhos diferentes, do soprano ao contra-baixo, cada um com afinação específica.',
    category: 'Renascimento',
  },
  {
    id: '39',
    type: 'curiosity',
    icon: '🏛️',
    title: 'Música Veneziana',
    content:
      'A Basílica de São Marcos em Veneza tinha dois coros opostos, criando o estilo policoral com efeitos estereofônicos únicos.',
    category: 'Renascimento',
  },
  {
    id: '40',
    type: 'technique',
    icon: '🔄',
    title: 'Cantus Firmus',
    content:
      'A técnica do cantus firmus usava melodias pré-existentes (geralmente gregorianas) como base estrutural para composições polifônicas.',
    category: 'Renascimento',
  },
  {
    id: '41',
    type: 'curiosity',
    icon: '📖',
    title: 'El Maestro',
    content:
      '"El Maestro" de Luis de Milán (1536) foi o primeiro livro de música para vihuela impresso na Espanha, influenciando toda a música de cordas.',
    category: 'Renascimento',
  },
  {
    id: '42',
    type: 'innovation',
    icon: '🎭',
    title: 'Intermezzi',
    content:
      'Os intermezzi eram espetáculos musicais entre os atos de peças teatrais, precursores diretos da ópera barroca.',
    category: 'Renascimento',
  },
  {
    id: '43',
    type: 'curiosity',
    icon: '🌹',
    title: 'Guerra dos Madrigais',
    content:
      'Houve uma verdadeira "guerra" estilística entre madrigalistas italianos, com compositores criando versões rivais das mesmas poesias.',
    category: 'Renascimento',
  },
  {
    id: '44',
    type: 'instrument',
    icon: '🎺',
    title: 'Sacabuxa',
    content:
      'A sacabuxa renascentista era o ancestral do trombone moderno, mas com sonoridade mais suave e adaptada à música vocal.',
    category: 'Renascimento',
  },
  {
    id: '45',
    type: 'curiosity',
    icon: '📜',
    title: 'Cancionero de Palacio',
    content:
      'O Cancionero de Palacio preserva a música da corte espanhola dos Reis Católicos, mostrando a fusão de tradições cristãs, árabes e judaicas.',
    category: 'Renascimento',
  },
  {
    id: '46',
    type: 'technique',
    icon: '🎯',
    title: 'Musica Ficta',
    content:
      'A musica ficta permitia aos intérpretes acrescentar acidentes não escritos, criando uma dimensão interpretativa perdida hoje.',
    category: 'Renascimento',
  },
  {
    id: '47',
    type: 'curiosity',
    icon: '🎪',
    title: "Commedia dell'Arte Musical",
    content:
      "A commedia dell'arte influenciou a música renascentista, com compositores criando canções para os personagens típicos como Arlequim.",
    category: 'Renascimento',
  },
  {
    id: '48',
    type: 'innovation',
    icon: '🔢',
    title: 'Temperamento Mesotônico',
    content:
      'O temperamento mesotônico renascentista privilegiava certas tonalidades, criando cores harmônicas distintas para cada tom.',
    category: 'Renascimento',
  },
  {
    id: '49',
    type: 'curiosity',
    icon: '👑',
    title: 'Henrique VIII Compositor',
    content:
      'O rei Henrique VIII da Inglaterra era compositor talentoso, tendo escrito "Greensleeves" e outras canções populares.',
    category: 'Renascimento',
  },
  {
    id: '50',
    type: 'instrument',
    icon: '🎶',
    title: 'Consort Inglês',
    content:
      'O "consort" inglês reunia instrumentos da mesma família (como violas) em diferentes tamanhos, criando texturas homogêneas únicas.',
    category: 'Renascimento',
  },

  // PERÍODO BARROCO (50 curiosidades)
  {
    id: '51',
    type: 'curiosity',
    icon: '🎼',
    title: 'Bach e seus Filhos',
    content:
      'Johann Sebastian Bach teve 20 filhos, e quatro deles (Wilhelm Friedemann, Carl Philipp Emanuel, Johann Christoph Friedrich e Johann Christian) tornaram-se compositores renomados.',
    category: 'Barroco',
  },
  {
    id: '52',
    type: 'innovation',
    icon: '🎭',
    title: 'Nascimento da Ópera',
    content:
      'A primeira ópera conhecida, "Dafne" de Jacopo Peri (1598), marcou o nascimento de um gênero que dominaria a música por séculos.',
    category: 'Barroco',
  },
  {
    id: '53',
    type: 'technique',
    icon: '🎵',
    title: 'Baixo Contínuo',
    content:
      'O baixo contínuo (basso continuo) era a "espinha dorsal" da música barroca, com cravo ou órgão realizando harmonias a partir de cifras.',
    category: 'Barroco',
  },
  {
    id: '54',
    type: 'curiosity',
    icon: '👑',
    title: 'Luís XIV e Lully',
    content:
      'Luís XIV, o Rei Sol, dançava pessoalmente nas óperas de Lully, estabelecendo a ópera francesa como espetáculo da realeza.',
    category: 'Barroco',
  },
  {
    id: '55',
    type: 'instrument',
    icon: '🎻',
    title: 'Stradivarius',
    content:
      'Antonio Stradivari (1644-1737) produziu cerca de 1.100 instrumentos, dos quais 650 sobrevivem hoje, valendo milhões de dólares cada.',
    category: 'Barroco',
  },
  {
    id: '56',
    type: 'curiosity',
    icon: '⛪',
    title: 'Bach Esquecido',
    content:
      'Bach foi quase esquecido após sua morte, sendo redescoberto apenas quando Mendelssohn regeu a "Paixão segundo São Mateus" em 1829.',
    category: 'Barroco',
  },
  {
    id: '57',
    type: 'technique',
    icon: '🔄',
    title: 'Fuga',
    content:
      'A fuga barroca é como uma conversa musical onde um tema é apresentado e depois imitado por outras vozes em diferentes alturas.',
    category: 'Barroco',
  },
  {
    id: '58',
    type: 'curiosity',
    icon: '🎪',
    title: 'Castrati',
    content:
      'Os castrati eram cantores masculinos castrados na infância para manter voz aguda, sendo as maiores estrelas da ópera barroca.',
    category: 'Barroco',
  },
  {
    id: '59',
    type: 'innovation',
    icon: '🎹',
    title: 'Temperamento Igual',
    content:
      'Bach demonstrou as possibilidades do temperamento igual no "Cravo Bem Temperado", permitindo tocar em todas as 24 tonalidades.',
    category: 'Barroco',
  },
  {
    id: '60',
    type: 'curiosity',
    icon: '🌊',
    title: 'Água Musicada',
    content:
      'A "Música Aquática" de Händel foi composta para acompanhar o rei Jorge I numa festa em barcos no Rio Tâmisa em 1717.',
    category: 'Barroco',
  },
  {
    id: '61',
    type: 'instrument',
    icon: '🎺',
    title: 'Trompete Barroco',
    content:
      'Os trompetes barrocos não tinham válvulas e tocavam apenas notas da série harmônica, exigindo técnica extraordinária dos músicos.',
    category: 'Barroco',
  },
  {
    id: '62',
    type: 'curiosity',
    icon: '💰',
    title: 'Vivaldi Empresário',
    content:
      'Vivaldi não era apenas compositor, mas também empresário musical, produzindo suas próprias óperas e gerenciando teatros em Veneza.',
    category: 'Barroco',
  },
  {
    id: '63',
    type: 'technique',
    icon: '🎭',
    title: 'Affekt',
    content:
      'A teoria dos Affekt (afetos) ditava que cada peça deveria expressar uma única emoção de forma consistente e intensa.',
    category: 'Barroco',
  },
  {
    id: '64',
    type: 'curiosity',
    icon: '🎻',
    title: 'As Quatro Estações',
    content:
      'Vivaldi escreveu "As Quatro Estações" como música programática, incluindo sonetos que descrevem cada movimento de forma detalhada.',
    category: 'Barroco',
  },
  {
    id: '65',
    type: 'innovation',
    icon: '🏛️',
    title: 'Concerto Grosso',
    content:
      'O concerto grosso criou o contraste entre solistas (concertino) e orquestra (ripieno), estabelecendo o princípio do concerto moderno.',
    category: 'Barroco',
  },
  {
    id: '66',
    type: 'curiosity',
    icon: '📚',
    title: 'Rameau Teórico',
    content:
      'Jean-Philippe Rameau revolucionou a teoria musical com seu "Tratado de Harmonia" (1722), estabelecendo bases da harmonia tonal.',
    category: 'Barroco',
  },
  {
    id: '67',
    type: 'instrument',
    icon: '🎹',
    title: 'Cravo vs Piano',
    content:
      'O cravo barroco não podia fazer crescendos ou diminuendos, mas compensava com ornamentação elaborada e registros variados.',
    category: 'Barroco',
  },
  {
    id: '68',
    type: 'curiosity',
    icon: '🎵',
    title: 'Händel vs Bach',
    content:
      'Händel e Bach nasceram no mesmo ano (1685) na Alemanha, mas Händel tornou-se famoso internacionalmente enquanto Bach permaneceu local.',
    category: 'Barroco',
  },
  {
    id: '69',
    type: 'technique',
    icon: '⚡',
    title: 'Ritornello',
    content:
      'A forma ritornello alterava seções do grupo completo (tutti) com seções solísticas, criando dinamismo e contraste.',
    category: 'Barroco',
  },
  {
    id: '70',
    type: 'curiosity',
    icon: '🏰',
    title: 'Corte de Versalhes',
    content:
      'A música em Versalhes seguia etiqueta rígida: até a duração das peças era determinada pelo protocolo real francês.',
    category: 'Barroco',
  },
  {
    id: '71',
    type: 'instrument',
    icon: '🥁',
    title: 'Tímpanos Barrocos',
    content:
      'Os tímpanos barrocos eram afinados manualmente com chaves, limitando as mudanças de altura durante a performance.',
    category: 'Barroco',
  },
  {
    id: '72',
    type: 'curiosity',
    icon: '🎭',
    title: 'Ópera Seria',
    content:
      'A ópera seria seguia regras rígidas: exatamente seis personagens, alternância de recitativos e árias, e finais felizes obrigatórios.',
    category: 'Barroco',
  },
  {
    id: '73',
    type: 'innovation',
    icon: '🎼',
    title: 'Suite de Danças',
    content:
      'A suíte barroca padronizou a sequência Allemande-Courante-Sarabande-Gigue, representando diferentes países e características.',
    category: 'Barroco',
  },
  {
    id: '74',
    type: 'curiosity',
    icon: '🌟',
    title: 'Farinelli',
    content:
      'Farinelli, o castrato mais famoso, tinha alcance vocal de três oitavas e meio e podia sustentar notas por mais de um minuto.',
    category: 'Barroco',
  },
  {
    id: '75',
    type: 'technique',
    icon: '🎯',
    title: 'Ornamentação',
    content:
      'A ornamentação barroca era parcialmente improvisada, com cada país desenvolvendo símbolos e estilos próprios de decoração.',
    category: 'Barroco',
  },
  {
    id: '76',
    type: 'curiosity',
    icon: '⛪',
    title: 'Paixões de Bach',
    content:
      'Bach compôs pelo menos cinco Paixões, mas apenas duas sobreviveram completas: segundo São Mateus e segundo São João.',
    category: 'Barroco',
  },
  {
    id: '77',
    type: 'instrument',
    icon: '🎵',
    title: 'Viola da Gamba',
    content:
      'A viola da gamba tinha até sete cordas e trastes, permitindo expressividade única que influenciou compositores como Bach.',
    category: 'Barroco',
  },
  {
    id: '78',
    type: 'curiosity',
    icon: '🇮🇹',
    title: 'Escola Napolitana',
    content:
      'Nápoles era o centro mundial da ópera no século XVIII, com conservatórios que treinavam os melhores cantores da Europa.',
    category: 'Barroco',
  },
  {
    id: '79',
    type: 'innovation',
    icon: '🎹',
    title: 'Invenções de Bach',
    content:
      'Bach criou as "Invenções" especificamente como material didático, estabelecendo princípios pedagógicos ainda usados hoje.',
    category: 'Barroco',
  },
  {
    id: '80',
    type: 'curiosity',
    icon: '☕',
    title: 'Cantata do Café',
    content:
      'Bach compôs a humorística "Cantata do Café" satirizando o vício feminino no café, bebida nova e controversa na época.',
    category: 'Barroco',
  },
  {
    id: '81',
    type: 'technique',
    icon: '🔄',
    title: 'Imitação Canônica',
    content:
      'O cânone barroco era mathematical music, com vozes seguindo regras estritas de imitação em diferentes intervalos de tempo.',
    category: 'Barroco',
  },
  {
    id: '82',
    type: 'curiosity',
    icon: '🎪',
    title: 'Intermezzi Cômicos',
    content:
      'Os intermezzi cômicos entre atos de óperas sérias acabaram evoluindo para a ópera bufa, gênero independente.',
    category: 'Barroco',
  },
  {
    id: '83',
    type: 'instrument',
    icon: '🎺',
    title: 'Trompa Natural',
    content:
      'A trompa natural barroca usava diferentes tubos (crooks) para mudar de tonalidade, cada um alterando a cor do som.',
    category: 'Barroco',
  },
  {
    id: '84',
    type: 'curiosity',
    icon: '🌊',
    title: 'Tempestades Musicais',
    content:
      'As "tempestades" eram tópica musical barroca, com escalas rápidas, tremolo e dinâmicas contrastantes pintando a fúria natural.',
    category: 'Barroco',
  },
  {
    id: '85',
    type: 'innovation',
    icon: '📖',
    title: 'Partitura Moderna',
    content:
      'O sistema de partitura moderno, com chaves, armaduras e fórmulas de compasso padronizadas, foi estabelecido no Barroco.',
    category: 'Barroco',
  },
  {
    id: '86',
    type: 'curiosity',
    icon: '🎭',
    title: 'Ópera de Hambúrgo',
    content:
      'A Ópera de Hambúrgo foi o primeiro teatro lírico público da Alemanha, democratizando o acesso à ópera além da aristocracia.',
    category: 'Barroco',
  },
  {
    id: '87',
    type: 'technique',
    icon: '🎨',
    title: 'Madrigalismo Tardio',
    content:
      'O madrigalismo barroco levou a pintura musical ao extremo, com notas literalmente "subindo" em palavras como "céu".',
    category: 'Barroco',
  },
  {
    id: '88',
    type: 'curiosity',
    icon: '⏰',
    title: 'Goldberg Variations',
    content:
      'As Variações Goldberg foram encomendadas pelo Conde Keyserlingk para curar sua insônia, devendo ser tocadas durante a noite.',
    category: 'Barroco',
  },
  {
    id: '89',
    type: 'instrument',
    icon: '🎹',
    title: 'Clavicórdio',
    content:
      'O clavicórdio permitia vibrato (bebung) e controle dinâmico, sendo o instrumento de teclado mais expressivo da época.',
    category: 'Barroco',
  },
  {
    id: '90',
    type: 'curiosity',
    icon: '🎼',
    title: 'Guerra dos Buffões',
    content:
      'A "Guerre des Bouffons" em Paris dividiu intelectuais entre ópera francesa (Rameau) e italiana (Pergolesi), influenciando a estética.',
    category: 'Barroco',
  },
  {
    id: '91',
    type: 'innovation',
    icon: '🎵',
    title: 'Forma Sonata Primitiva',
    content:
      'A forma sonata começou a emergir no Barroco tardio, com Domenico Scarlatti explorando desenvolvimentos temáticos em suas sonatas.',
    category: 'Barroco',
  },
  {
    id: '92',
    type: 'curiosity',
    icon: '🏰',
    title: 'Música de Câmara',
    content:
      'A música de câmara barroca era literalmente música para "câmaras" (quartos) pequenos, contrastando com música de igreja ou teatro.',
    category: 'Barroco',
  },
  {
    id: '93',
    type: 'technique',
    icon: '⚖️',
    title: 'Rhetorica Musical',
    content:
      'Compositores barrocos estudavam retórica clássica, aplicando figuras de linguagem como anáfora e quiasmo na música.',
    category: 'Barroco',
  },
  {
    id: '94',
    type: 'curiosity',
    icon: '🎻',
    title: 'Escola de Violino',
    content:
      'Arcangelo Corelli estabeleceu a escola italiana de violino, padronizando técnicas de arco e dedilhado ainda usadas hoje.',
    category: 'Barroco',
  },
  {
    id: '95',
    type: 'instrument',
    icon: '🎶',
    title: 'Família de Flautas',
    content:
      'No Barroco existiam flautas em várias afinações (soprano, alto, tenor), cada uma com características timbrísticas específicas.',
    category: 'Barroco',
  },
  {
    id: '96',
    type: 'curiosity',
    icon: '📜',
    title: 'Manuscritos de Bach',
    content:
      'Bach copiava música de outros compositores para estudo, incluindo toda a obra de Vivaldi, absorvendo o estilo italiano.',
    category: 'Barroco',
  },
  {
    id: '97',
    type: 'innovation',
    icon: '🎭',
    title: 'Recitativo',
    content:
      'O recitativo secco (com apenas cravo) permitia declamação natural do texto, aproximando a ópera da fala humana.',
    category: 'Barroco',
  },
  {
    id: '98',
    type: 'curiosity',
    icon: '🌟',
    title: 'Academia de Arcádia',
    content:
      'A Academia de Arcádia em Roma padronizou libretos de ópera, estabelecendo temas pastorais e estruturas dramáticas.',
    category: 'Barroco',
  },
  {
    id: '99',
    type: 'technique',
    icon: '🎯',
    title: 'Concertato',
    content:
      'O estilo concertato barroco contrastava grupos instrumentais e vocais, criando efeitos de eco e diálogo espacial.',
    category: 'Barroco',
  },
  {
    id: '100',
    type: 'curiosity',
    icon: '🎼',
    title: 'Arte da Fuga',
    content:
      'Bach morreu enquanto trabalhava na "Arte da Fuga", deixando a última fuga incompleta precisamente onde introduz seu nome.',
    category: 'Barroco',
  },

  // PERÍODO CLÁSSICO (50 curiosidades)
  {
    id: '101',
    type: 'curiosity',
    icon: '🎼',
    title: 'Mozart Precoce',
    content:
      'Mozart começou a compor aos 5 anos e escreveu sua primeira sinfonia aos 8 anos, demonstrando um talento extraordinário desde a infância.',
    category: 'Clássico',
  },
  {
    id: '102',
    type: 'innovation',
    icon: '🏛️',
    title: 'Forma Sonata',
    content:
      'A forma sonata clássica (exposição-desenvolvimento-recapitulação) tornou-se a estrutura fundamental da música instrumental.',
    category: 'Clássico',
  },
  {
    id: '103',
    type: 'curiosity',
    icon: '🎹',
    title: 'Revolução do Piano',
    content:
      'O fortepiano substituiu o cravo por permitir dinâmicas graduais, revolucionando a expressividade musical no período clássico.',
    category: 'Clássico',
  },
  {
    id: '104',
    type: 'technique',
    icon: '⚖️',
    title: 'Clareza e Equilíbrio',
    content:
      'O estilo clássico priorizava clareza formal, equilíbrio entre seções e elegância melódica sobre complexidade contrapuntística.',
    category: 'Clássico',
  },
  {
    id: '105',
    type: 'curiosity',
    icon: '👑',
    title: 'Haydn "Pai da Sinfonia"',
    content:
      'Haydn compôs 104 sinfonias, estabelecendo o gênero sinfônico e ganhando o título de "Pai da Sinfonia".',
    category: 'Clássico',
  },
  {
    id: '106',
    type: 'innovation',
    icon: '🎭',
    title: 'Ópera Buffa',
    content:
      'A ópera buffa democratizou a ópera com personagens comuns e situações cotidianas, contrastando com a ópera seria aristocrática.',
    category: 'Clássico',
  },
  {
    id: '107',
    type: 'curiosity',
    icon: '🎵',
    title: 'Quarteto de Cordas',
    content:
      'Haydn praticamente inventou o quarteto de cordas moderno, compondo 83 quartetos que definiram o gênero.',
    category: 'Clássico',
  },
  {
    id: '108',
    type: 'instrument',
    icon: '🎺',
    title: 'Clarinete Clássico',
    content:
      'Mozart foi um dos primeiros compositores a explorar totalmente o clarinete, escrevendo seu famoso Concerto em Lá maior.',
    category: 'Clássico',
  },
  {
    id: '109',
    type: 'curiosity',
    icon: '⛪',
    title: 'Requiem de Mozart',
    content:
      'Mozart estava compondo seu Requiem quando morreu, deixando a obra inacabada e envolta em mistério até hoje.',
    category: 'Clássico',
  },
  {
    id: '110',
    type: 'technique',
    icon: '🎯',
    title: 'Desenvolvimento Motívico',
    content:
      'Beethoven levou o desenvolvimento motívico ao extremo, construindo movimentos inteiros a partir de fragmentos melódicos simples.',
    category: 'Clássico',
  },
  {
    id: '111',
    type: 'curiosity',
    icon: '🏰',
    title: 'Corte de Esterházy',
    content:
      'Haydn trabalhou 30 anos para a família Esterházy, isolado mas com orquestra própria para experimentar suas composições.',
    category: 'Clássico',
  },
  {
    id: '112',
    type: 'innovation',
    icon: '🎶',
    title: 'Concerto Clássico',
    content:
      'O concerto clássico estabeleceu o padrão de três movimentos (rápido-lento-rápido) e a cadenza como momento de virtuosismo.',
    category: 'Clássico',
  },
  {
    id: '113',
    type: 'curiosity',
    icon: '🎭',
    title: 'As Bodas de Fígaro',
    content:
      'A ópera "As Bodas de Fígaro" de Mozart foi inicialmente censurada por críticar a aristocracia, mas conseguiu estrear em Viena.',
    category: 'Clássico',
  },
  {
    id: '114',
    type: 'technique',
    icon: '🔄',
    title: 'Rondó Clássico',
    content:
      'A forma rondó (ABACA ou ABACABA) tornou-se padrão para movimentos finais, proporcionando leveza e memorabilidade.',
    category: 'Clássico',
  },
  {
    id: '115',
    type: 'curiosity',
    icon: '🌟',
    title: 'Mannheim Rocket',
    content:
      'A Orquestra de Mannheim criou o "foguete de Mannheim" - escalas ascendentes rápidas que causavam sensação na audiência.',
    category: 'Clássico',
  },
  {
    id: '116',
    type: 'instrument',
    icon: '🥁',
    title: 'Tímpanos Temperados',
    content:
      'No período clássico, os tímpanos começaram a ser afinados cromàticamente, expandindo suas possibilidades melódicas.',
    category: 'Clássico',
  },
  {
    id: '117',
    type: 'curiosity',
    icon: '💰',
    title: 'Mozart e Dinheiro',
    content:
      'Apesar do talento, Mozart teve problemas financeiros crônicos, morrendo pobre e sendo enterrado numa vala comum.',
    category: 'Clássico',
  },
  {
    id: '118',
    type: 'innovation',
    icon: '🎼',
    title: 'Orquestra Clássica',
    content:
      'A orquestra clássica padronizou instrumentação: cordas, madeiras aos pares, 2 trompas e às vezes trompetes e tímpanos.',
    category: 'Clássico',
  },
  {
    id: '119',
    type: 'curiosity',
    icon: '🎹',
    title: 'Sonatas de Scarlatti',
    content:
      'Domenico Scarlatti compôs 555 sonatas para cravo, explorando técnicas que anteciparam o virtuosismo pianístico.',
    category: 'Clássico',
  },
  {
    id: '120',
    type: 'technique',
    icon: '⚡',
    title: 'Sturm und Drang',
    content:
      'O movimento "Sturm und Drang" influenciou compositores como Haydn a usar tonalidades menores e expressões dramáticas.',
    category: 'Clássico',
  },
  {
    id: '121',
    type: 'curiosity',
    icon: '🎪',
    title: 'Música Turca',
    content:
      'A "música turca" estava na moda no século XVIII, com Mozart incorporando percussão exótica no Rapto do Serralho.',
    category: 'Clássico',
  },
  {
    id: '122',
    type: 'instrument',
    icon: '🎻',
    title: 'Escola de Arco',
    content:
      'O arco moderno foi aperfeiçoado por François Tourte, permitindo maior controle dinâmico e articulação.',
    category: 'Clássico',
  },
  {
    id: '123',
    type: 'curiosity',
    icon: '📚',
    title: 'C.P.E. Bach',
    content:
      'Carl Philipp Emanuel Bach, filho de J.S. Bach, foi considerado o maior compositor de sua época, influenciando Mozart.',
    category: 'Clássico',
  },
  {
    id: '124',
    type: 'innovation',
    icon: '🎭',
    title: 'Singspiel',
    content:
      'O Singspiel alemão combinava música e diálogos falados, democratizando a ópera em língua vernácula.',
    category: 'Clássico',
  },
  {
    id: '125',
    type: 'curiosity',
    icon: '🌙',
    title: 'Sonata ao Luar',
    content:
      'A "Sonata ao Luar" de Beethoven só recebeu esse nome após sua morte - ele a dedicou à Condessa Giulietta Guicciardi.',
    category: 'Clássico',
  },
  {
    id: '126',
    type: 'technique',
    icon: '🎯',
    title: 'Tema com Variações',
    content:
      'As variações clássicas exploravam diferentes aspectos de um tema: ornamentação, mudança de modo, alteração rítmica.',
    category: 'Clássico',
  },
  {
    id: '127',
    type: 'curiosity',
    icon: '🎵',
    title: 'Minueto e Trio',
    content:
      'O minueto era a única forma de dança que sobreviveu na sinfonia clássica, sempre no terceiro movimento.',
    category: 'Clássico',
  },
  {
    id: '128',
    type: 'instrument',
    icon: '🎺',
    title: 'Trompa Clássica',
    content:
      'Mozart revolucionou a escrita para trompa, tratando-a como instrumento melódico e não apenas de apoio harmônico.',
    category: 'Clássico',
  },
  {
    id: '129',
    type: 'curiosity',
    icon: '🏛️',
    title: 'Concertos Públicos',
    content:
      'O período clássico viu o nascimento dos concertos públicos, democratizando o acesso à música além da aristocracia.',
    category: 'Clássico',
  },
  {
    id: '130',
    type: 'innovation',
    icon: '📖',
    title: 'Publicação Musical',
    content:
      'A impressão musical em larga escala permitiu disseminação internacional das obras, criando um "mercado" musical.',
    category: 'Clássico',
  },
  {
    id: '131',
    type: 'curiosity',
    icon: '🎼',
    title: 'Sinfonia Pastoral',
    content:
      'A 6ª Sinfonia de Beethoven foi uma das primeiras sinfonias programáticas, descrevendo cenas da vida rural.',
    category: 'Clássico',
  },
  {
    id: '132',
    type: 'technique',
    icon: '🔄',
    title: 'Modulação Clássica',
    content:
      'As modulações clássicas seguiam rotas harmônicas previsíveis: tônica para dominante na exposição, explorações no desenvolvimento.',
    category: 'Clássico',
  },
  {
    id: '133',
    type: 'curiosity',
    icon: '🎭',
    title: 'Don Giovanni',
    content:
      'A ópera "Don Giovanni" de Mozart foi chamada de "ópera das óperas" por muitos críticos e compositores posteriores.',
    category: 'Clássico',
  },
  {
    id: '134',
    type: 'instrument',
    icon: '🎹',
    title: 'Sonata para Piano',
    content:
      'Beethoven expandiu a sonata para piano de entretenimento doméstico para forma artística profunda e pessoal.',
    category: 'Clássico',
  },
  {
    id: '135',
    type: 'curiosity',
    icon: '👂',
    title: 'Surdez de Beethoven',
    content:
      'Beethoven começou a perder audição aos 28 anos, mas compôs suas obras mais importantes já completamente surdo.',
    category: 'Clássico',
  },
  {
    id: '136',
    type: 'innovation',
    icon: '🎶',
    title: 'Frase Musical',
    content:
      'O período clássico estabeleceu a frase de 8 compassos (antecedente-consequente) como unidade básica da música.',
    category: 'Clássico',
  },
  {
    id: '137',
    type: 'curiosity',
    icon: '🌟',
    title: 'Crianças Prodígio',
    content:
      'Além de Mozart, o período clássico teve muitas crianças prodígio, incluindo Hummel, que estudou com Mozart.',
    category: 'Clássico',
  },
  {
    id: '138',
    type: 'technique',
    icon: '⚖️',
    title: 'Proporção Áurea',
    content:
      'Muitas obras clássicas seguem proporções matemáticas, com clímaxes ocorrendo em pontos de proporção áurea.',
    category: 'Clássico',
  },
  {
    id: '139',
    type: 'curiosity',
    icon: '🎹',
    title: 'Competição Musical',
    content:
      'Mozart e Clementi fizeram uma famosa competição de piano diante do Imperador José II em 1781.',
    category: 'Clássico',
  },
  {
    id: '140',
    type: 'instrument',
    icon: '🎵',
    title: 'Flauta Clássica',
    content:
      'A flauta de madeira foi gradualmente substituída pela de metal no período clássico, mudando seu timbre.',
    category: 'Clássico',
  },
  {
    id: '141',
    type: 'curiosity',
    icon: '📜',
    title: 'Cartas de Mozart',
    content:
      'As cartas de Mozart revelam sua personalidade irreverente e humor escatológico, contrastando com sua música sublime.',
    category: 'Clássico',
  },
  {
    id: '142',
    type: 'innovation',
    icon: '🎭',
    title: 'Ópera Reformada',
    content:
      'Gluck reformou a ópera eliminando ornamentação excessiva e priorizando drama e expressão natural.',
    category: 'Clássico',
  },
  {
    id: '143',
    type: 'curiosity',
    icon: '🏰',
    title: 'Salzbur​go',
    content:
      'Mozart odiava trabalhar para o Arcebispo de Salzburgo, chegando a ser literalmente "chutado" para fora do palácio.',
    category: 'Clássico',
  },
  {
    id: '144',
    type: 'technique',
    icon: '🎯',
    title: 'Cadência Clássica',
    content:
      'A cadência perfeita (V-I) tornou-se fundamental na música clássica, criando pontos de repouso estruturais.',
    category: 'Clássico',
  },
  {
    id: '145',
    type: 'curiosity',
    icon: '🎼',
    title: 'Sinfonia nº 41',
    content:
      'A última sinfonia de Mozart (nº 41 "Júpiter") termina com uma fuga dupla que combina cinco temas simultaneamente.',
    category: 'Clássico',
  },
  {
    id: '146',
    type: 'instrument',
    icon: '🎺',
    title: 'Serpentão',
    content:
      'O serpentão, precursor da tuba, era usado em igrejas e bandas militares por seu som poderoso nos graves.',
    category: 'Clássico',
  },
  {
    id: '147',
    type: 'curiosity',
    icon: '💫',
    title: 'Estrela Cadente',
    content:
      'Haydn incluiu efeitos especiais como tiros de canhão na "Sinfonia Militar" e relógio na "Sinfonia do Relógio".',
    category: 'Clássico',
  },
  {
    id: '148',
    type: 'innovation',
    icon: '📚',
    title: 'Educação Musical',
    content:
      'O método de Clementi "Gradus ad Parnassum" estabeleceu princípios de ensino pianístico ainda usados hoje.',
    category: 'Clássico',
  },
  {
    id: '149',
    type: 'curiosity',
    icon: '🎵',
    title: 'Divertimento',
    content:
      'Os divertimenti eram música de entretenimento para eventos sociais, mais leves que sinfonias mas ainda sofisticados.',
    category: 'Clássico',
  },
  {
    id: '150',
    type: 'technique',
    icon: '🌟',
    title: 'Estilo Galante',
    content:
      'O estilo galante priorizava melodias elegantes e acompanhamentos simples, rejeitando a complexidade barroca.',
    category: 'Clássico',
  },

  // PERÍODO ROMÂNTICO (50 curiosidades)
  {
    id: '151',
    type: 'curiosity',
    icon: '💕',
    title: 'Amor e Música',
    content:
      'Schumann dedicou seu "Ano das Canções" (1840) a Clara Wieck, compondo 138 lieder no ano de seu casamento.',
    category: 'Romântico',
  },
  {
    id: '152',
    type: 'innovation',
    icon: '🎼',
    title: 'Música Programática',
    content:
      'A "Sinfonia Fantástica" de Berlioz revolucionou a música sinfônica ao contar uma história específica através de música.',
    category: 'Romântico',
  },
  {
    id: '153',
    type: 'curiosity',
    icon: '🎹',
    title: 'Liszt Popstar',
    content:
      'Franz Liszt causava "Lisztomania" - histeria coletiva em seus concertos, sendo considerado o primeiro popstar da música clássica.',
    category: 'Romântico',
  },
  {
    id: '154',
    type: 'technique',
    icon: '🌊',
    title: 'Rubato',
    content:
      'O rubato romântico permitia flexibilidade temporal expressiva, com Chopin sendo mestre nesta técnica interpretativa.',
    category: 'Romântico',
  },
  {
    id: '155',
    type: 'instrument',
    icon: '🎹',
    title: 'Piano Romântico',
    content:
      'O piano romântico ganhou pedais, maior extensão e som mais poderoso, inspirando o virtuosismo de Liszt e Chopin.',
    category: 'Romântico',
  },
  {
    id: '156',
    type: 'curiosity',
    icon: '🌙',
    title: 'Noturnos de Chopin',
    content:
      'Chopin criou o noturno pianístico moderno, inspirado nos noturnos para piano de John Field mas com maior sofisticação.',
    category: 'Romântico',
  },
  {
    id: '157',
    type: 'innovation',
    icon: '🎭',
    title: 'Leitmotiv',
    content:
      'Wagner desenvolveu o sistema de leitmotiv - temas musicais associados a personagens, objetos ou ideias específicas.',
    category: 'Romântico',
  },
  {
    id: '158',
    type: 'curiosity',
    icon: '💰',
    title: 'Paganini Diabólico',
    content:
      'Paganini era tão virtuoso que rumores diziam ter vendido a alma ao diabo - suas técnicas violinísticas pareciam impossíveis.',
    category: 'Romântico',
  },
  {
    id: '159',
    type: 'technique',
    icon: '🎨',
    title: 'Miniatura Musical',
    content:
      'O Romantismo valorizou formas pequenas como o lied, mazurca e impromptu, explorando momentos íntimos de expressão.',
    category: 'Romântico',
  },
  {
    id: '160',
    type: 'curiosity',
    icon: '🏰',
    title: 'Castelos e Natureza',
    content:
      'Os românticos se inspiravam na natureza e ruínas medievais - Mendelssohn compôs após visitar as Hébridas na Escócia.',
    category: 'Romântico',
  },
  {
    id: '161',
    type: 'instrument',
    icon: '🎺',
    title: 'Válvulas de Bronze',
    content:
      'A invenção das válvulas transformou trompetes e trompas em instrumentos cromáticos, expandindo suas possibilidades.',
    category: 'Romântico',
  },
  {
    id: '162',
    type: 'curiosity',
    icon: '📚',
    title: 'Literatura e Música',
    content:
      'Berlioz baseou obras em Shakespeare, Byron e Goethe, estabelecendo conexões profundas entre música e literatura.',
    category: 'Romântico',
  },
  {
    id: '163',
    type: 'innovation',
    icon: '🎶',
    title: 'Forma Cíclica',
    content:
      'Berlioz e Liszt desenvolveram a forma cíclica, onde temas retornam transformados ao longo de obras multi-movimentos.',
    category: 'Romântico',
  },
  {
    id: '164',
    type: 'curiosity',
    icon: '🌟',
    title: 'Virtuosismo Transcendental',
    content:
      'Os "Estudos Transcendentais" de Liszt levaram a técnica pianística aos limites extremos da possibilidade humana.',
    category: 'Romântico',
  },
  {
    id: '165',
    type: 'technique',
    icon: '🎭',
    title: 'Drama Musical',
    content:
      'Wagner revolucionou a ópera com "dramas musicais" onde música, texto e cenário formavam uma obra de arte total.',
    category: 'Romântico',
  },
  {
    id: '166',
    type: 'curiosity',
    icon: '🏔️',
    title: 'Alpinismo Musical',
    content:
      'Liszt compôs "Années de Pèlerinage" baseado em suas viagens pela Suíça e Itália, criando "cartões postais" musicais.',
    category: 'Romântico',
  },
  {
    id: '167',
    type: 'instrument',
    icon: '🎻',
    title: 'Violino Romântico',
    content:
      'O arco de Tourte e cordas de metal permitiram maior potência sonora, atendendo às demandas expressivas românticas.',
    category: 'Romântico',
  },
  {
    id: '168',
    type: 'curiosity',
    icon: '💔',
    title: 'Amor Não Correspondido',
    content:
      'Brahms amou Clara Schumann por toda vida, mas nunca se casaram - essa tensão emocional permeia sua música.',
    category: 'Romântico',
  },
  {
    id: '169',
    type: 'innovation',
    icon: '🎼',
    title: 'Poema Sinfônico',
    content:
      'Liszt inventou o poema sinfônico - forma orquestral de um movimento que narra história ou evoca imagens.',
    category: 'Romântico',
  },
  {
    id: '170',
    type: 'curiosity',
    icon: '🌹',
    title: 'Baladas de Chopin',
    content:
      'As quatro baladas de Chopin foram inspiradas por poemas de Adam Mickiewicz, criando narrativas musicais abstratas.',
    category: 'Romântico',
  },
  {
    id: '171',
    type: 'technique',
    icon: '🎨',
    title: 'Colorismo Orquestral',
    content:
      'Berlioz foi pioneiro na orquestração colorística, usando timbres instrumentais como um pintor usa cores.',
    category: 'Romântico',
  },
  {
    id: '172',
    type: 'curiosity',
    icon: '🎪',
    title: 'Circo Musical',
    content:
      'Paganini se apresentava como showman, usando efeitos teatrais e chegando a tocar uma sonata inteira numa só corda.',
    category: 'Romântico',
  },
  {
    id: '173',
    type: 'instrument',
    icon: '🎹',
    title: 'Harmonium',
    content:
      'O harmonium (órgão portátil) tornou-se popular na música doméstica, influenciando compositores como Dvořák.',
    category: 'Romântico',
  },
  {
    id: '174',
    type: 'curiosity',
    icon: '🎵',
    title: 'Canção sem Palavras',
    content:
      'Mendelssohn criou as "Canções sem Palavras" - peças pianísticas que cantam melodias sem texto.',
    category: 'Romântico',
  },
  {
    id: '175',
    type: 'innovation',
    icon: '🌍',
    title: 'Nacionalismo Musical',
    content:
      'O Romantismo incentivou nacionalismos musicais, com compositores usando folclore e história pátria como inspiração.',
    category: 'Romântico',
  },
  {
    id: '176',
    type: 'curiosity',
    icon: '💊',
    title: 'Tuberculose Romântica',
    content:
      'Muitos compositores românticos morreram de tuberculose (Chopin, Bellini), doença que simbolizava sensibilidade artística.',
    category: 'Romântico',
  },
  {
    id: '177',
    type: 'technique',
    icon: '🎭',
    title: 'Transformação Temática',
    content:
      'Liszt desenvolveu a transformação temática, onde um tema aparece em diferentes caracteres ao longo da obra.',
    category: 'Romântico',
  },
  {
    id: '178',
    type: 'curiosity',
    icon: '🎼',
    title: 'Sinfonia Inacabada',
    content:
      'A "Sinfonia Inacabada" de Schubert tem apenas dois movimentos, permanecendo um mistério por que foi abandonada.',
    category: 'Romântico',
  },
  {
    id: '179',
    type: 'instrument',
    icon: '🎺',
    title: 'Saxofone',
    content:
      'Adolphe Sax inventou o saxofone em 1840, mas este só se tornou popular no jazz, raramente usado na música clássica.',
    category: 'Romântico',
  },
  {
    id: '180',
    type: 'curiosity',
    icon: '🏛️',
    title: 'Conservatórios',
    content:
      'O século XIX viu a expansão dos conservatórios nacionais, profissionalizando o ensino musical e criando "escolas" nacionais.',
    category: 'Romântico',
  },
  {
    id: '181',
    type: 'innovation',
    icon: '🎭',
    title: 'Gesamtkunstwerk',
    content:
      'Wagner concebeu a "obra de arte total" onde música, drama, poesia e artes visuais se uniriam em experiência transcendente.',
    category: 'Romântico',
  },
  {
    id: '182',
    type: 'curiosity',
    icon: '🌊',
    title: 'Barcarola Veneziana',
    content:
      'As barcarolas evocavam as canções dos gondoleiros venezianos, criando atmosferas aquáticas e nostálgicas.',
    category: 'Romântico',
  },
  {
    id: '183',
    type: 'technique',
    icon: '🎨',
    title: 'Impressionismo Precursor',
    content:
      'Liszt antecipou o impressionismo em obras como "Os Jogos de Água na Villa d\'Este", explorando atmosferas sonoras.',
    category: 'Romântico',
  },
  {
    id: '184',
    type: 'curiosity',
    icon: '📖',
    title: 'Crítica Musical',
    content:
      'Schumann foi pioneiro da crítica musical moderna, "descobrindo" Chopin e defendendo Brahms em seus escritos.',
    category: 'Romântico',
  },
  {
    id: '185',
    type: 'instrument',
    icon: '🎹',
    title: 'Piano de Cauda',
    content:
      'O piano de cauda romântico atingiu dimensões monumentais, com alguns instrumentos de Liszt tendo mais de 3 metros.',
    category: 'Romântico',
  },
  {
    id: '186',
    type: 'curiosity',
    icon: '🎪',
    title: 'Tournées Virtuosísticas',
    content:
      'As tournées de concertos se tornaram fenômeno social, com virtuoses viajando pela Europa como verdadeiras celebridades.',
    category: 'Romântico',
  },
  {
    id: '187',
    type: 'innovation',
    icon: '🎵',
    title: 'Ciclo de Canções',
    content:
      'Schubert e Schumann criaram ciclos de lieder que contam histórias completas, como "A Bela Moleira" e "Amor de Poeta".',
    category: 'Romântico',
  },
  {
    id: '188',
    type: 'curiosity',
    icon: '🌙',
    title: 'Sonambulismo Musical',
    content:
      'A ópera "La Sonnambula" de Bellini explorou o tema romântico do sonambulismo e estados alterados de consciência.',
    category: 'Romântico',
  },
  {
    id: '189',
    type: 'technique',
    icon: '🎭',
    title: 'Melodia Infinita',
    content:
      'Wagner desenvolveu a "melodia infinita", evitando cadências e criando fluxo musical contínuo sem pausas estruturais.',
    category: 'Romântico',
  },
  {
    id: '190',
    type: 'curiosity',
    icon: '🏰',
    title: 'Bayreuth',
    content:
      'Wagner construiu seu próprio teatro em Bayreuth especificamente para apresentar suas óperas, ainda ativo hoje.',
    category: 'Romântico',
  },
  {
    id: '191',
    type: 'instrument',
    icon: '🎺',
    title: 'Tuba Wagneriana',
    content:
      'Wagner encomendou tubas especiais para "O Anel", criando instrumentos únicos para sua sonoridade épica.',
    category: 'Romântico',
  },
  {
    id: '192',
    type: 'curiosity',
    icon: '💔',
    title: 'Morte de Amor',
    content:
      'O "Liebestod" (Morte de Amor) de Wagner influenciou toda a música posterior, explorando êxtase erótico e morte.',
    category: 'Romântico',
  },
  {
    id: '193',
    type: 'innovation',
    icon: '🎼',
    title: 'Orquestra Romântica',
    content:
      'A orquestra romântica expandiu dramaticamente, com Berlioz chegando a escrever para mais de 400 instrumentistas.',
    category: 'Romântico',
  },
  {
    id: '194',
    type: 'curiosity',
    icon: '🌟',
    title: 'Clara Wieck',
    content:
      'Clara Schumann foi uma das primeiras pianistas profissionais, mantendo carreira de concertista por mais de 60 anos.',
    category: 'Romântico',
  },
  {
    id: '195',
    type: 'technique',
    icon: '🎨',
    title: 'Sinestesia Musical',
    content:
      'Compositores românticos exploraram sinestesia, associando cores a tonalidades e criando "pinturas" sonoras.',
    category: 'Romântico',
  },
  {
    id: '196',
    type: 'curiosity',
    icon: '📜',
    title: 'Manuscritos Perdidos',
    content:
      'Muitas obras românticas foram perdidas ou destruídas - Schumann queimou várias composições por autocrítica excessiva.',
    category: 'Romântico',
  },
  {
    id: '197',
    type: 'instrument',
    icon: '🎻',
    title: 'Viola Romântica',
    content:
      'A viola ganhou importância no Romantismo, com Berlioz compondo "Haroldo na Itália" especificamente para o instrumento.',
    category: 'Romântico',
  },
  {
    id: '198',
    type: 'curiosity',
    icon: '🎭',
    title: 'Ópera Verista',
    content:
      'O verismo operístico retratou a vida cotidiana com realismo brutal, contrastando com o escapismo romântico anterior.',
    category: 'Romântico',
  },
  {
    id: '199',
    type: 'innovation',
    icon: '🎵',
    title: 'Forma Livre',
    content:
      'Compositores românticos experimentaram formas livres, criando estruturas únicas para cada obra em vez de moldes pré-existentes.',
    category: 'Romântico',
  },
  {
    id: '200',
    type: 'curiosity',
    icon: '🌹',
    title: 'Salões Musicais',
    content:
      'Os salões parisienses eram centros da vida musical romântica, onde compositores apresentavam primeiras audições de obras.',
    category: 'Romântico',
  },

  // IMPRESSIONISMO (25 curiosidades)
  {
    id: '201',
    type: 'innovation',
    icon: '🎨',
    title: 'Debussy Impressionista',
    content:
      'Debussy odiava ser chamado de "impressionista", preferindo "simbolista", mas sua música evoca cores e atmosferas como a pintura impressionista.',
    category: 'Impressionismo',
  },
  {
    id: '202',
    type: 'curiosity',
    icon: '🌊',
    title: 'La Mer',
    content:
      '"La Mer" de Debussy foi composta longe do mar, no interior da França, mostrando como a música pode capturar essências emocionais.',
    category: 'Impressionismo',
  },
  {
    id: '203',
    type: 'technique',
    icon: '🎵',
    title: 'Escalas Exóticas',
    content:
      'Debussy usou escalas pentafônicas, octatônicas e de tons inteiros, expandindo o vocabulário harmônico para além do sistema tonal.',
    category: 'Impressionismo',
  },
  {
    id: '204',
    type: 'curiosity',
    icon: '🏮',
    title: 'Influência Oriental',
    content:
      'A Exposição Universal de Paris (1889) introduziu música javanesa a Debussy, influenciando profundamente seu estilo harmônico.',
    category: 'Impressionismo',
  },
  {
    id: '205',
    type: 'instrument',
    icon: '🎹',
    title: 'Piano Impressionista',
    content:
      'Os impressionistas exploraram novos efeitos pianísticos usando pedais, harmônicos e texturas que imitavam orquestras.',
    category: 'Impressionismo',
  },
  {
    id: '206',
    type: 'innovation',
    icon: '🌫️',
    title: 'Atmosfera Musical',
    content:
      'Ravel e Debussy priorizaram atmosfera sobre desenvolvimento temático, criando "quadros" sonoros ao invés de argumentos musicais.',
    category: 'Impressionismo',
  },
  {
    id: '207',
    type: 'curiosity',
    icon: '🌸',
    title: 'Jardins na Chuva',
    content:
      '"Jardins na Chuva" de Debussy usa técnicas pianísticas que realmente evocam gotas de chuva e folhas tremulando.',
    category: 'Impressionismo',
  },
  {
    id: '208',
    type: 'technique',
    icon: '🎭',
    title: 'Paralelismos',
    content:
      'Os acordes paralelos impressionistas criavam coloração harmônica única, abandonando as regras de condução de vozes tradicionais.',
    category: 'Impressionismo',
  },
  {
    id: '209',
    type: 'curiosity',
    icon: '🎪',
    title: 'Bolero de Ravel',
    content:
      'O "Bolero" cresceu de uma experiência rítmica para obra icônica, com Ravel surpreendido pelo sucesso popular.',
    category: 'Impressionismo',
  },
  {
    id: '210',
    type: 'instrument',
    icon: '🎺',
    title: 'Instrumentação Sutil',
    content:
      'Ravel foi mestre da orquestração sutil, usando combinações inusitadas de instrumentos para criar timbres únicos.',
    category: 'Impressionismo',
  },
  {
    id: '211',
    type: 'innovation',
    icon: '⏰',
    title: 'Tempo Suspenso',
    content:
      'A música impressionista muitas vezes parece suspender o tempo, criando momentos de contemplação estática.',
    category: 'Impressionismo',
  },
  {
    id: '212',
    type: 'curiosity',
    icon: '🌙',
    title: 'Clair de Lune',
    content:
      '"Clair de Lune" tornou-se a peça impressionista mais famosa, mas é apenas o terceiro movimento da "Suite Bergamasque".',
    category: 'Impressionismo',
  },
  {
    id: '213',
    type: 'technique',
    icon: '🎨',
    title: 'Forma Fluida',
    content:
      'Os impressionistas evitavam formas rígidas, preferindo estruturas orgânicas que fluem como água ou luz.',
    category: 'Impressionismo',
  },
  {
    id: '214',
    type: 'curiosity',
    icon: '🎭',
    title: 'Pelléas et Mélisande',
    content:
      'A ópera "Pelléas et Mélisande" de Debussy revolucionou o gênero com recitativo naturalístico e orquestra sussurrante.',
    category: 'Impressionismo',
  },
  {
    id: '215',
    type: 'instrument',
    icon: '🎵',
    title: 'Harpa Impressionista',
    content:
      'A harpa ganhou protagonismo no impressionismo, com glissandos e harmônicos criando efeitos aquáticos e etéreos.',
    category: 'Impressionismo',
  },
  {
    id: '216',
    type: 'innovation',
    icon: '🌈',
    title: 'Harmonia Colorística',
    content:
      'A harmonia impressionista priorizava cor sobre função, usando acordes como "cores" em uma paleta sonora.',
    category: 'Impressionismo',
  },
  {
    id: '217',
    type: 'curiosity',
    icon: '🏰',
    title: 'Catedral Submersa',
    content:
      '"A Catedral Submersa" evoca lenda bretã sobre catedral que emerge das águas, demonstrando narrativa impressionista.',
    category: 'Impressionismo',
  },
  {
    id: '218',
    type: 'technique',
    icon: '🌊',
    title: 'Fluidity Rhythm',
    content:
      'Os ritmos impressionistas fluem sem acentos marcados, criando sensação de movimento orgânico e natural.',
    category: 'Impressionismo',
  },
  {
    id: '219',
    type: 'curiosity',
    icon: '🎹',
    title: 'Ravel vs Debussy',
    content:
      'Embora agrupados, Ravel era mais clássico e preciso, enquanto Debussy era mais experimental e atmosférico.',
    category: 'Impressionismo',
  },
  {
    id: '220',
    type: 'instrument',
    icon: '🎻',
    title: 'Cordas Impressionistas',
    content:
      'Técnicas como surdina, harmônicos artificiais e tremolo criavam texturas veladas características do impressionismo.',
    category: 'Impressionismo',
  },
  {
    id: '221',
    type: 'innovation',
    icon: '🎵',
    title: 'Modalidade',
    content:
      'O retorno aos modos antigos deu aos impressionistas alternativas ao sistema tonal maior-menor tradicional.',
    category: 'Impressionismo',
  },
  {
    id: '222',
    type: 'curiosity',
    icon: '🌺',
    title: 'Estampes',
    content:
      'As "Estampes" de Debussy retratam paisagens exóticas: Pagodes (Ásia), Soirée dans Grenade (Espanha), Jardins na Chuva (França).',
    category: 'Impressionismo',
  },
  {
    id: '223',
    type: 'technique',
    icon: '🎭',
    title: 'Simbolismo Musical',
    content:
      'A música impressionista frequentemente simbolizava estados emocionais através de gestos musicais sutis e sugestivos.',
    category: 'Impressionismo',
  },
  {
    id: '224',
    type: 'curiosity',
    icon: '🦢',
    title: 'Pavane',
    content:
      'A "Pavane para uma Infanta Defunta" de Ravel não tem significado fúnebre - o título evoca apenas sonoridades nostálgicas.',
    category: 'Impressionismo',
  },
  {
    id: '225',
    type: 'instrument',
    icon: '🎺',
    title: 'Metais Velados',
    content:
      'Instrumentos de metal com surdina criavam timbres pastéis essenciais à paleta sonora impressionista.',
    category: 'Impressionismo',
  },

  // MODERNISMO/CONTEMPORÂNEO (50 curiosidades)
  {
    id: '226',
    type: 'innovation',
    icon: '🎵',
    title: 'Atonalidade',
    content:
      'Schoenberg abandonou totalmente o sistema tonal em 1908, criando a primeira música verdadeiramente atonal da história.',
    category: 'Moderno',
  },
  {
    id: '227',
    type: 'curiosity',
    icon: '🌊',
    title: 'Sagração da Primavera',
    content:
      'A estreia de "A Sagração da Primavera" de Stravinsky (1913) causou um motim no teatro, dividindo o público.',
    category: 'Moderno',
  },
  {
    id: '228',
    type: 'technique',
    icon: '🔢',
    title: 'Dodecafonismo',
    content:
      'Schoenberg criou o sistema dodecafônico, usando todas as 12 notas cromáticas em sequências específicas (séries).',
    category: 'Moderno',
  },
  {
    id: '229',
    type: 'curiosity',
    icon: '🎭',
    title: 'Pierrot Lunaire',
    content:
      '"Pierrot Lunaire" de Schoenberg usa Sprechgesang - técnica vocal entre fala e canto que ainda causa controvérsia.',
    category: 'Moderno',
  },
  {
    id: '230',
    type: 'innovation',
    icon: '🎹',
    title: 'Piano Preparado',
    content:
      'John Cage inseriu objetos entre as cordas do piano, criando um "gamelan de um homem só" com sonoridades únicas.',
    category: 'Moderno',
  },
  {
    id: '231',
    type: 'curiosity',
    icon: '⏰',
    title: '4\'33"',
    content:
      'A peça "4\'33"" de Cage consiste em 4 minutos e 33 segundos de silêncio, questionando a própria definição de música.',
    category: 'Moderno',
  },
  {
    id: '232',
    type: 'technique',
    icon: '🎵',
    title: 'Politonalidade',
    content:
      'Compositores como Milhaud usaram múltiplas tonalidades simultaneamente, criando complexidade harmônica única.',
    category: 'Moderno',
  },
  {
    id: '233',
    type: 'curiosity',
    icon: '🌟',
    title: 'Bartók Etnomusicólogo',
    content:
      'Bartók coletou milhares de melodias folclóricas com fonógrafo, preservando tradições musicais do Leste Europeu.',
    category: 'Moderno',
  },
  {
    id: '234',
    type: 'instrument',
    icon: '🎹',
    title: 'Ondas Martenot',
    content:
      'As Ondas Martenot, instrumento eletrônico inventado em 1928, foram usadas por Messiaen e Honegger.',
    category: 'Moderno',
  },
  {
    id: '235',
    type: 'innovation',
    icon: '📡',
    title: 'Música Eletrônica',
    content:
      'A música eletrônica nasceu na década de 1950 com estúdios em Paris e Colônia experimentando com fitas magnéticas.',
    category: 'Moderno',
  },
  {
    id: '236',
    type: 'curiosity',
    icon: '🎺',
    title: 'Trompete de Brinquedo',
    content:
      'Mahler incluiu instrumentos infantis como trompete de brinquedo em sinfonias, antecipando experimentações modernas.',
    category: 'Moderno',
  },
  {
    id: '237',
    type: 'technique',
    icon: '🔄',
    title: 'Música Aleatória',
    content:
      'Cage e outros criaram música aleatória onde intérpretes fazem escolhas durante a performance, nunca resultando igual.',
    category: 'Moderno',
  },
  {
    id: '238',
    type: 'curiosity',
    icon: '🌍',
    title: 'Messiaen Ornitólogo',
    content:
      'Messiaen transcreveu cantos de pássaros do mundo todo, incorporando-os em obras como "Catálogo dos Pássaros".',
    category: 'Moderno',
  },
  {
    id: '239',
    type: 'innovation',
    icon: '⚡',
    title: 'Música Espectral',
    content:
      'Compositores espectrais como Grisey analisam espectros sonoros cientificamente, baseando harmonias em acústica.',
    category: 'Moderno',
  },
  {
    id: '240',
    type: 'curiosity',
    icon: '🎪',
    title: 'Cirque du Soleil Clássico',
    content:
      'Ligeti\'s "Atmosphères" foi usada em "2001: Uma Odisseia no Espaço", levando música de vanguarda ao cinema mainstream.',
    category: 'Moderno',
  },
  {
    id: '241',
    type: 'technique',
    icon: '🎨',
    title: 'Microtonalidade',
    content:
      'Compositores como Partch criaram instrumentos afinados em intervalos menores que semitons, expandindo o espectro tonal.',
    category: 'Moderno',
  },
  {
    id: '242',
    type: 'curiosity',
    icon: '🏗️',
    title: 'Xenakis Arquiteto',
    content:
      'Iannis Xenakis era arquiteto (trabalhou com Le Corbusier) e aplicou princípios matemáticos e arquitetônicos à música.',
    category: 'Moderno',
  },
  {
    id: '243',
    type: 'instrument',
    icon: '🎻',
    title: 'Técnicas Estendidas',
    content:
      'Técnicas estendidas como col legno, sul ponticello e multifônicos expandiram dramaticamente as possibilidades instrumentais.',
    category: 'Moderno',
  },
  {
    id: '244',
    type: 'innovation',
    icon: '💻',
    title: 'Música por Computador',
    content:
      'O IRCAM em Paris pioneirou música por computador, com Boulez criando centro de pesquisa musical e tecnológica.',
    category: 'Moderno',
  },
  {
    id: '245',
    type: 'curiosity',
    icon: '🌌',
    title: 'Música Espacial',
    content:
      'Stockhausen compôs para performances em múltiplos andares, criando experiências musicais tridimensionais.',
    category: 'Moderno',
  },
  {
    id: '246',
    type: 'technique',
    icon: '🔧',
    title: 'Serialismo Integral',
    content:
      'Boulez e outros aplicaram organização serial não apenas a alturas, mas também a durações, dinâmicas e articulações.',
    category: 'Moderno',
  },
  {
    id: '247',
    type: 'curiosity',
    icon: '🎭',
    title: 'Teatro Musical',
    content:
      'Kagel e outros criaram "teatro musical" onde instrumentistas também atuam, borrando fronteiras entre artes.',
    category: 'Moderno',
  },
  {
    id: '248',
    type: 'instrument',
    icon: '🎹',
    title: 'Sintetizadores',
    content:
      'Sintetizadores como o Moog revolucionaram música experimental, com compositores explorando sons impossíveis acusticamente.',
    category: 'Moderno',
  },
  {
    id: '249',
    type: 'innovation',
    icon: '🔄',
    title: 'Minimalismo',
    content:
      'Steve Reich e Philip Glass criaram minimalismo musical, usando repetição e mudança gradual para hipnotizar audientes.',
    category: 'Moderno',
  },
  {
    id: '250',
    type: 'curiosity',
    icon: '🌊',
    title: 'Música Ambiente',
    content:
      'Brian Eno criou o conceito de "música ambiente" - música que pode ser ignorada mas que enriquece o ambiente sonoro.',
    category: 'Moderno',
  },
  {
    id: '251',
    type: 'technique',
    icon: '📊',
    title: 'Análise Espectral',
    content:
      'Compositores modernos usam análise espectral por computador para compreender e manipular timbres com precisão científica.',
    category: 'Moderno',
  },
  {
    id: '252',
    type: 'curiosity',
    icon: '🎪',
    title: 'Happenings Musicais',
    content:
      'Nos anos 1960, compositores criaram "happenings" - eventos multimídia onde música se misturava com arte visual e performance.',
    category: 'Moderno',
  },
  {
    id: '253',
    type: 'innovation',
    icon: '🔊',
    title: 'Live Electronics',
    content:
      'Música eletroacústica ao vivo combina instrumentos tradicionais com eletrônicos, criando interação em tempo real.',
    category: 'Moderno',
  },
  {
    id: '254',
    type: 'curiosity',
    icon: '🌍',
    title: 'World Music Fusion',
    content:
      'Compositores como Tan Dun fusionam tradições musicais orientais e ocidentais, criando linguagem musical verdadeiramente global.',
    category: 'Moderno',
  },
  {
    id: '255',
    type: 'technique',
    icon: '🎯',
    title: 'Música Gestual',
    content:
      'Lachenmann e outros exploraram "música gestual" onde o gesto físico de tocar é tão importante quanto o som resultante.',
    category: 'Moderno',
  },
  {
    id: '256',
    type: 'curiosity',
    icon: '🏢',
    title: 'Música Urbana',
    content:
      'Compositores incorporam sons urbanos - trânsito, construção, multidões - como material musical legítimo.',
    category: 'Moderno',
  },
  {
    id: '257',
    type: 'instrument',
    icon: '📱',
    title: 'Apps Musicais',
    content:
      'Smartphones e tablets tornaram-se instrumentos musicais legítimos, com apps permitindo performances complexas.',
    category: 'Moderno',
  },
  {
    id: '258',
    type: 'innovation',
    icon: '🤖',
    title: 'IA Compositora',
    content:
      'Inteligência artificial já compõe música autonomamente, levantando questões sobre criatividade e autoria artística.',
    category: 'Moderno',
  },
  {
    id: '259',
    type: 'curiosity',
    icon: '🌌',
    title: 'Música Cósmica',
    content:
      'Compositores usam dados astronômicos - pulsares, radiação cósmica - como fonte de material musical.',
    category: 'Moderno',
  },
  {
    id: '260',
    type: 'technique',
    icon: '🔄',
    title: 'Looping ao Vivo',
    content:
      'Steve Reich pioneirou loop delay, técnica hoje comum onde performers criam camadas em tempo real.',
    category: 'Moderno',
  },
  {
    id: '261',
    type: 'curiosity',
    icon: '🏛️',
    title: 'Neo-Romantismo',
    content:
      'Compositores como John Adams retornaram à tonalidade e melodia, criando "neo-romantismo" acessível ao público.',
    category: 'Moderno',
  },
  {
    id: '262',
    type: 'innovation',
    icon: '🎮',
    title: 'Música Interativa',
    content:
      'Música interativa responde a ações do público ou intérpretes, criando experiências únicas a cada performance.',
    category: 'Moderno',
  },
  {
    id: '263',
    type: 'curiosity',
    icon: '🧬',
    title: 'Música Genética',
    content:
      'Compositores traduzem sequências de DNA em música, explorando padrões da vida como material compositivo.',
    category: 'Moderno',
  },
  {
    id: '264',
    type: 'technique',
    icon: '🌐',
    title: 'Teleconcertos',
    content:
      'Internet permite performances colaborativas globais, com músicos em continentes diferentes tocando juntos.',
    category: 'Moderno',
  },
  {
    id: '265',
    type: 'curiosity',
    icon: '🎭',
    title: 'Ópera Contemporânea',
    content:
      'Óperas modernas abordam temas atuais - terrorismo, mudança climática, redes sociais - mantendo o gênero relevante.',
    category: 'Moderno',
  },
  {
    id: '266',
    type: 'instrument',
    icon: '🎺',
    title: 'Instrumentos Híbridos',
    content:
      'Luthiers criam instrumentos híbridos combinando tradições diferentes, expandindo possibilidades sonoras.',
    category: 'Moderno',
  },
  {
    id: '267',
    type: 'innovation',
    icon: '🔬',
    title: 'Psicoacústica',
    content:
      'Compositores usam pesquisa psicoacústica para criar ilusões auditivas e efeitos perceptivos específicos.',
    category: 'Moderno',
  },
  {
    id: '268',
    type: 'curiosity',
    icon: '🌿',
    title: 'Eco-Música',
    content:
      'Movimento de "eco-música" incorpora sons naturais e consciência ambiental nas composições contemporâneas.',
    category: 'Moderno',
  },
  {
    id: '269',
    type: 'technique',
    icon: '🎨',
    title: 'Notação Gráfica',
    content:
      'Partituras contemporâneas usam símbolos visuais, cores e formas gráficas para comunicar ideias musicais.',
    category: 'Moderno',
  },
  {
    id: '270',
    type: 'curiosity',
    icon: '🏠',
    title: 'Música Doméstica',
    content:
      'Pandemia levou compositores a criar obras para performance doméstica, adaptando-se a realidades contemporâneas.',
    category: 'Moderno',
  },
  {
    id: '271',
    type: 'innovation',
    icon: '🎧',
    title: 'Música Binaural',
    content:
      'Gravação binaural cria experiências 3D através de fones, permitindo composições específicas para este meio.',
    category: 'Moderno',
  },
  {
    id: '272',
    type: 'curiosity',
    icon: '⚡',
    title: 'Música Energética',
    content:
      'Compositores exploram sons de fontes energéticas - eletricidade, magnetismo - como material musical.',
    category: 'Moderno',
  },
  {
    id: '273',
    type: 'technique',
    icon: '🔢',
    title: 'Algoritmos Musicais',
    content:
      'Algoritmos matemáticos geram estruturas musicais complexas, explorando padrões impossíveis para mente humana.',
    category: 'Moderno',
  },
  {
    id: '274',
    type: 'curiosity',
    icon: '🎪',
    title: 'Flashmobs Musicais',
    content:
      'Flashmobs musicais levam música clássica a espaços públicos, democratizando acesso e surpreendendo transeuntes.',
    category: 'Moderno',
  },
  {
    id: '275',
    type: 'instrument',
    icon: '🌊',
    title: 'Aquafone',
    content:
      'Instrumentos aquáticos usam água como meio sonoro, explorando acústica líquida para efeitos únicos.',
    category: 'Moderno',
  },

  // TEORIA E TÉCNICA GERAL (25 curiosidades finais)
  {
    id: '276',
    type: 'theory',
    icon: '🎵',
    title: 'Círculo das Quintas',
    content:
      'O círculo das quintas organiza todas as tonalidades em relação matemática perfeita, sendo ferramenta fundamental da harmonia.',
    category: 'Teoria',
  },
  {
    id: '277',
    type: 'curiosity',
    icon: '🔢',
    title: 'Proporção Divina',
    content:
      'A proporção áurea (1:1.618) aparece em muitas obras clássicas, desde Bach até Debussy, criando satisfação estética.',
    category: 'Teoria',
  },
  {
    id: '278',
    type: 'technique',
    icon: '🎯',
    title: 'Análise Schenkeriana',
    content:
      'Heinrich Schenker desenvolveu método analítico que reduz obras a estruturas fundamentais, revelando lógica profunda.',
    category: 'Teoria',
  },
  {
    id: '279',
    type: 'curiosity',
    icon: '🌊',
    title: 'Efeito Doppler Musical',
    content:
      'Compositores exploram efeito Doppler (mudança de altura por movimento) criando ilusões espaciais na música.',
    category: 'Teoria',
  },
  {
    id: '280',
    type: 'innovation',
    icon: '📊',
    title: 'Análise por Computador',
    content:
      'Software moderno analisa milhares de obras simultaneamente, revelando padrões estatísticos na música clássica.',
    category: 'Teoria',
  },
  {
    id: '281',
    type: 'curiosity',
    icon: '🧠',
    title: 'Neurociência Musical',
    content:
      'Pesquisas revelam que música ativa múltiplas áreas cerebrais simultaneamente, sendo "ginástica" para o cérebro.',
    category: 'Teoria',
  },
  {
    id: '282',
    type: 'technique',
    icon: '🎨',
    title: 'Teoria dos Conjuntos',
    content:
      'Teoria dos conjuntos aplica matemática à análise musical, especialmente útil para música atonal e serial.',
    category: 'Teoria',
  },
  {
    id: '283',
    type: 'curiosity',
    icon: '🔊',
    title: 'Síntese Subtrativa',
    content:
      'Instrumentos acústicos funcionam por síntese subtrativa - produzem espectro rico que é filtrado pela ressonância.',
    category: 'Teoria',
  },
  {
    id: '284',
    type: 'innovation',
    icon: '🎼',
    title: 'Música Fractal',
    content:
      'Composições fractais repetem padrões em diferentes escalas, criando autossimilaridade hipnótica.',
    category: 'Teoria',
  },
  {
    id: '285',
    type: 'curiosity',
    icon: '🌟',
    title: 'Frequência 440 Hz',
    content:
      'A afinação em 440 Hz para o Lá foi padronizada internacionalmente apenas em 1939, variando muito antes disso.',
    category: 'Teoria',
  },
  {
    id: '286',
    type: 'technique',
    icon: '⚖️',
    title: 'Contraponto Espécies',
    content:
      'O sistema de cinco espécies do contraponto de Fux ainda é base do ensino musical, codificando movimento de vozes.',
    category: 'Teoria',
  },
  {
    id: '287',
    type: 'curiosity',
    icon: '🎭',
    title: 'Síndrome do Ouvido Absoluto',
    content:
      'Apenas 1 em 10.000 pessoas tem ouvido absoluto, capacidade mais comum entre músicos que começaram muito cedo.',
    category: 'Teoria',
  },
  {
    id: '288',
    type: 'innovation',
    icon: '🔄',
    title: 'Transformações Neo-Riemannianas',
    content:
      'Teoria neo-riemanniana explica progressões harmônicas românticas através de transformações geométricas.',
    category: 'Teoria',
  },
  {
    id: '289',
    type: 'curiosity',
    icon: '🌈',
    title: 'Sinestesia Musical',
    content:
      'Cerca de 4% das pessoas experienciam sinestesia, vendo cores específicas para diferentes notas musicais.',
    category: 'Teoria',
  },
  {
    id: '290',
    type: 'technique',
    icon: '📏',
    title: 'Métrica Assimétrica',
    content:
      'Métricas como 5/8 ou 7/8 criam assimetrias rítmicas que desafiam expectativas baseadas em métrica binária.',
    category: 'Teoria',
  },
  {
    id: '291',
    type: 'curiosity',
    icon: '🔊',
    title: 'Batimentos Acústicos',
    content:
      'Batimentos entre frequências próximas criam pulsações audíveis, fenômeno usado para afinar instrumentos.',
    category: 'Teoria',
  },
  {
    id: '292',
    type: 'innovation',
    icon: '🎯',
    title: 'Análise Paradigmática',
    content:
      'Análise paradigmática de Ruwet organiza música em segmentos similares, revelando estruturas repetitivas ocultas.',
    category: 'Teoria',
  },
  {
    id: '293',
    type: 'curiosity',
    icon: '⏰',
    title: 'Tempo Psicológico',
    content:
      'Percepção temporal na música varia dramaticamente - trechos lentos parecem mais longos que indicam cronômetros.',
    category: 'Teoria',
  },
  {
    id: '294',
    type: 'technique',
    icon: '🎨',
    title: 'Klangfarbenmelodie',
    content:
      'Schoenberg criou "melodia de timbres" onde cores instrumentais, não alturas, criam linha melódica.',
    category: 'Teoria',
  },
  {
    id: '295',
    type: 'curiosity',
    icon: '🧮',
    title: 'Sequência de Fibonacci',
    content:
      'Sequência de Fibonacci aparece naturalmente na música, influenciando proporções em obras de Bartók e outros.',
    category: 'Teoria',
  },
  {
    id: '296',
    type: 'innovation',
    icon: '🌐',
    title: 'Topologia Musical',
    content:
      'Topologia musical estuda transformações contínuas entre objetos musicais, criando "geometria" harmônica.',
    category: 'Teoria',
  },
  {
    id: '297',
    type: 'curiosity',
    icon: '🎵',
    title: 'Escala Cromática Natural',
    content:
      'A série harmônica natural produz microtons entre semitons, mas instrumentos temperados aproximam estas frequências.',
    category: 'Teoria',
  },
  {
    id: '298',
    type: 'technique',
    icon: '📊',
    title: 'Análise Estatística',
    content:
      'Análise estatística revela "impressões digitais" composicionais únicas para cada compositor através de padrões.',
    category: 'Teoria',
  },
  {
    id: '299',
    type: 'curiosity',
    icon: '🌟',
    title: 'Música das Esferas',
    content:
      'Kepler calculou "música das esferas" baseada em órbitas planetárias, conectando astronomia e harmonia musical.',
    category: 'Teoria',
  },
  {
    id: '300',
    type: 'innovation',
    icon: '🚀',
    title: 'Futuro da Música',
    content:
      'A música clássica continua evoluindo com novas tecnologias, mantendo tradições milenares enquanto explora possibilidades infinitas.',
    category: 'Futuro',
  },
];

// Função para embaralhar e selecionar curiosidades
export const getRandomFacts = (count = 4) => {
  const shuffled = [...musicalFacts].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// Função para obter fatos por categoria
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
