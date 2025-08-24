// Função completa para obter curiosidades sobre compositores
export const getComposerCuriosities = (
  composerName: string
): Array<{
  id: string;
  icon: string;
  text: { pt: string; en: string };
}> => {
  const curiositiesMap: Record<
    string,
    Array<{ id: string; icon: string; text: { pt: string; en: string } }>
  > = {
    'Ludwig van Beethoven': [
      {
        id: '1',
        icon: '🦻',
        text: {
          pt: 'Compôs suas maiores obras enquanto lutava contra a surdez progressiva.',
          en: 'Composed his greatest works while struggling with progressive deafness.',
        },
      },
      {
        id: '2',
        icon: '☕',
        text: {
          pt: 'Contava exatamente 60 grãos de café para cada xícara que bebia.',
          en: 'Counted exactly 60 coffee beans for each cup he drank.',
        },
      },
      {
        id: '3',
        icon: '🎹',
        text: {
          pt: 'Quebrava teclas de piano com a força de sua interpretação.',
          en: 'Broke piano keys with the force of his playing.',
        },
      },
      {
        id: '4',
        icon: '💧',
        text: {
          pt: 'Derramava água gelada na cabeça para se manter concentrado enquanto compunha.',
          en: 'Poured cold water on his head to stay focused while composing.',
        },
      },
    ],
    'Paul Hindemith': [
      {
        id: '1',
        icon: '🎯',
        text: {
          pt: 'Podia tocar praticamente qualquer instrumento da orquestra.',
          en: 'Could play virtually any instrument in the orchestra.',
        },
      },
      {
        id: '2',
        icon: '🎓',
        text: {
          pt: 'Desenvolveu uma nova teoria harmônica baseada em princípios acústicos.',
          en: 'Developed a new harmonic theory based on acoustic principles.',
        },
      },
      {
        id: '3',
        icon: '🇺🇸',
        text: {
          pt: 'Emigrou para os EUA quando os nazistas baniram sua música.',
          en: 'Emigrated to the USA when the Nazis banned his music.',
        },
      },
      {
        id: '4',
        icon: '📚',
        text: {
          pt: 'Escreveu música para todos os instrumentos em seu projeto "Música de Câmara".',
          en: 'Wrote music for all instruments in his "Chamber Music" project.',
        },
      },
    ],
    'Olivier Messiaen': [
      {
        id: '1',
        icon: '🐦',
        text: {
          pt: 'Gravou e transcreveu cantos de pássaros para usar em suas composições.',
          en: 'Recorded and transcribed bird songs to use in his compositions.',
        },
      },
      {
        id: '2',
        icon: '🌈',
        text: {
          pt: 'Tinha sinestesia e via cores específicas para cada acorde.',
          en: 'Had synesthesia and saw specific colors for each chord.',
        },
      },
      {
        id: '3',
        icon: '⛪',
        text: {
          pt: 'Era organista da igreja Sainte-Trinité em Paris por mais de 60 anos.',
          en: 'Was organist at Sainte-Trinité church in Paris for over 60 years.',
        },
      },
      {
        id: '4',
        icon: '🕰️',
        text: {
          pt: 'Sua obra "Quarteto para o Fim dos Tempos" foi composta em um campo de concentração.',
          en: 'His work "Quartet for the End of Time" was composed in a concentration camp.',
        },
      },
    ],
    'Aaron Copland': [
      {
        id: '1',
        icon: '🤠',
        text: {
          pt: 'Criou o som da música americana com "Rodeo" e "Appalachian Spring".',
          en: 'Created the sound of American music with "Rodeo" and "Appalachian Spring".',
        },
      },
      {
        id: '2',
        icon: '🎬',
        text: {
          pt: 'Compôs trilhas sonoras para filmes, ganhando um Oscar.',
          en: 'Composed film soundtracks, winning an Oscar.',
        },
      },
      {
        id: '3',
        icon: '🎓',
        text: {
          pt: 'Foi mentor de Leonard Bernstein e outros grandes maestros americanos.',
          en: 'Was mentor to Leonard Bernstein and other great American conductors.',
        },
      },
      {
        id: '4',
        icon: '🇺🇸',
        text: {
          pt: 'Sua "Fanfarra para o Homem Comum" tornou-se um hino não-oficial americano.',
          en: 'His "Fanfare for the Common Man" became an unofficial American anthem.',
        },
      },
    ],
    'Francois Couperin': [
      {
        id: '1',
        icon: '👑',
        text: {
          pt: 'Era membro de uma dinastia musical que serviu à corte francesa por séculos.',
          en: 'Was member of a musical dynasty that served the French court for centuries.',
        },
      },
      {
        id: '2',
        icon: '🎹',
        text: {
          pt: 'Suas peças de cravo têm títulos poéticos como "A Misteriosa" e "Os Rouxinóis Amorosos".',
          en: 'His harpsichord pieces have poetic titles like "The Mysterious" and "The Amorous Nightingales".',
        },
      },
      {
        id: '3',
        icon: '📚',
        text: {
          pt: 'Escreveu um tratado sobre a arte de tocar cravo que influenciou gerações.',
          en: 'Wrote a treatise on the art of harpsichord playing that influenced generations.',
        },
      },
      {
        id: '4',
        icon: '🇫🇷',
        text: {
          pt: 'Representou o refinamento e elegância da música francesa barroca.',
          en: 'Represented the refinement and elegance of French Baroque music.',
        },
      },
    ],
    'William Byrd': [
      {
        id: '1',
        icon: '⛪',
        text: {
          pt: 'Foi o maior compositor inglês da era elisabetana.',
          en: 'Was the greatest English composer of the Elizabethan era.',
        },
      },
      {
        id: '2',
        icon: '🕊️',
        text: {
          pt: 'Permaneceu católico numa Inglaterra protestante, mas manteve favor real.',
          en: 'Remained Catholic in Protestant England, but maintained royal favor.',
        },
      },
      {
        id: '3',
        icon: '📜',
        text: {
          pt: 'Recebeu monopólio real para impressão de música na Inglaterra.',
          en: 'Received royal monopoly for music printing in England.',
        },
      },
      {
        id: '4',
        icon: '🎼',
        text: {
          pt: 'Suas missas latinas são consideradas obras-primas da polifonia sacra.',
          en: 'His Latin masses are considered masterpieces of sacred polyphony.',
        },
      },
    ],
    'Erik Satie': [
      {
        id: '1',
        icon: '🎪',
        text: {
          pt: 'Compôs peças com títulos excêntricos como "Três Peças na Forma de uma Pêra".',
          en: 'Composed pieces with eccentric titles like "Three Pieces in the Shape of a Pear".',
        },
      },
      {
        id: '2',
        icon: '☕',
        text: {
          pt: 'Frequentava cabarets de Montmartre e era figura do mundo boêmio parisiense.',
          en: 'Frequented Montmartre cabarets and was a figure in the Parisian bohemian world.',
        },
      },
      {
        id: '3',
        icon: '🎯',
        text: {
          pt: 'Influenciou Debussy, Ravel e os compositores do grupo "Les Six".',
          en: 'Influenced Debussy, Ravel and the composers of the "Les Six" group.',
        },
      },
      {
        id: '4',
        icon: '🔄',
        text: {
          pt: 'Criou a "música mobiliária", precursora da música ambiente.',
          en: 'Created "furniture music", precursor to ambient music.',
        },
      },
    ],
    'Benjamin Britten': [
      {
        id: '1',
        icon: '🌊',
        text: {
          pt: 'Sua ópera "Peter Grimes" revitalizou a ópera inglesa no século XX.',
          en: 'His opera "Peter Grimes" revitalized English opera in the 20th century.',
        },
      },
      {
        id: '2',
        icon: '🎭',
        text: {
          pt: 'Fundou o Festival de Aldeburgh, que continua ativo até hoje.',
          en: 'Founded the Aldeburgh Festival, which continues active today.',
        },
      },
      {
        id: '3',
        icon: '🎼',
        text: {
          pt: 'Especializou-se em escrever música para vozes jovens e crianças.',
          en: 'Specialized in writing music for young voices and children.',
        },
      },
      {
        id: '4',
        icon: '🏆',
        text: {
          pt: 'Foi o primeiro compositor a receber o título de Lord na Inglaterra.',
          en: 'Was the first composer to receive the title of Lord in England.',
        },
      },
    ],
    'Bedrick Smetana': [
      {
        id: '1',
        icon: '🇨🇿',
        text: {
          pt: 'É considerado o pai da música nacional tcheca com "Má vlast".',
          en: 'Is considered the father of Czech national music with "Má vlast".',
        },
      },
      {
        id: '2',
        icon: '🌊',
        text: {
          pt: 'Sua "Moldau" retrata musicalmente o rio que atravessa Praga.',
          en: 'His "Moldau" musically depicts the river that flows through Prague.',
        },
      },
      {
        id: '3',
        icon: '🦻',
        text: {
          pt: 'Compôs seu quarteto "Da Minha Vida" após ficar surdo.',
          en: 'Composed his quartet "From My Life" after becoming deaf.',
        },
      },
      {
        id: '4',
        icon: '🎭',
        text: {
          pt: 'Sua ópera "A Noiva Vendida" continua muito popular na República Tcheca.',
          en: 'His opera "The Bartered Bride" remains very popular in the Czech Republic.',
        },
      },
    ],
    'César Franck': [
      {
        id: '1',
        icon: '🇧🇪',
        text: {
          pt: 'Nasceu na Bélgica mas tornou-se o principal compositor francês de sua época.',
          en: 'Born in Belgium but became the leading French composer of his era.',
        },
      },
      {
        id: '2',
        icon: '⛪',
        text: {
          pt: 'Era organista da basílica Sainte-Clotilde em Paris.',
          en: 'Was organist at the Sainte-Clotilde basilica in Paris.',
        },
      },
      {
        id: '3',
        icon: '🎓',
        text: {
          pt: "Seus alunos no Conservatório incluíam Vincent d'Indy e Ernest Chausson.",
          en: "His students at the Conservatory included Vincent d'Indy and Ernest Chausson.",
        },
      },
      {
        id: '4',
        icon: '🎼',
        text: {
          pt: 'Sua Sinfonia em Ré menor é considerada a melhor sinfonia francesa do século XIX.',
          en: 'His Symphony in D minor is considered the best French symphony of the 19th century.',
        },
      },
    ],

    'Wolfgang Amadeus Mozart': [
      {
        id: '1',
        icon: '👶',
        text: {
          pt: 'Compôs sua primeira sinfonia aos 8 anos de idade.',
          en: 'Composed his first symphony at age 8.',
        },
      },
      {
        id: '2',
        icon: '🎯',
        text: {
          pt: 'Podia escrever música de cabeça para baixo e de trás para frente.',
          en: 'Could write music upside down and backwards.',
        },
      },
      {
        id: '3',
        icon: '🎭',
        text: {
          pt: 'Tinha uma risada tão característica que as pessoas o reconheciam só pelo som.',
          en: 'Had such a distinctive laugh that people could recognize him by sound alone.',
        },
      },
      {
        id: '4',
        icon: '🎮',
        text: {
          pt: 'Adorava jogos de cartas e apostas, o que frequentemente o deixava em dificuldades financeiras.',
          en: 'Loved card games and gambling, which often left him in financial difficulties.',
        },
      },
      {
        id: '5',
        icon: '🧠',
        text: {
          pt: 'Conseguia memorizar uma peça musical inteira após ouvi-la apenas uma vez.',
          en: 'Could memorize an entire musical piece after hearing it just once.',
        },
      },
    ],
    'Johann Sebastian Bach': [
      {
        id: '1',
        icon: '👨‍👩‍👧‍👦',
        text: {
          pt: 'Teve 20 filhos, dos quais vários se tornaram compositores famosos.',
          en: 'Had 20 children, several of whom became famous composers.',
        },
      },
      {
        id: '2',
        icon: '🔢',
        text: {
          pt: 'Usava números e proporções matemáticas como base para suas composições.',
          en: 'Used numbers and mathematical proportions as the basis for his compositions.',
        },
      },
      {
        id: '3',
        icon: '🏃‍♂️',
        text: {
          pt: 'Caminhou mais de 400 km para ouvir Dietrich Buxtehude tocar órgão.',
          en: 'Walked over 400 km to hear Dietrich Buxtehude play organ.',
        },
      },
      {
        id: '4',
        icon: '📜',
        text: {
          pt: 'Muitas de suas obras foram perdidas e redescoberta séculos depois.',
          en: 'Many of his works were lost and rediscovered centuries later.',
        },
      },
    ],
    'Richard Wagner': [
      {
        id: '1',
        icon: '🏰',
        text: {
          pt: 'Construiu seu próprio teatro de ópera em Bayreuth, ainda ativo hoje.',
          en: 'Built his own opera house in Bayreuth, still active today.',
        },
      },
      {
        id: '2',
        icon: '⏰',
        text: {
          pt: 'Suas óperas podem durar mais de 15 horas (como Der Ring des Nibelungen).',
          en: 'His operas can last over 15 hours (like Der Ring des Nibelungen).',
        },
      },
      {
        id: '3',
        icon: '🎪',
        text: {
          pt: 'Inventou novos instrumentos para suas óperas, como a tuba wagneriana.',
          en: 'Invented new instruments for his operas, such as the Wagner tuba.',
        },
      },
      {
        id: '4',
        icon: '📚',
        text: {
          pt: 'Escrevia seus próprios libretos, sendo ao mesmo tempo compositor e dramaturgo.',
          en: 'Wrote his own librettos, being both composer and playwright.',
        },
      },
    ],
    'Joseph Haydn': [
      {
        id: '1',
        icon: '😴',
        text: {
          pt: 'Compôs a "Sinfonia Surpresa" com um acorde forte para acordar a audiência.',
          en: 'Composed the "Surprise Symphony" with a loud chord to wake up the audience.',
        },
      },
      {
        id: '2',
        icon: '🎼',
        text: {
          pt: 'É considerado o "Pai da Sinfonia" e do quarteto de cordas.',
          en: 'Is considered the "Father of the Symphony" and string quartet.',
        },
      },
      {
        id: '3',
        icon: '🕯️',
        text: {
          pt: 'Na "Sinfonia do Adeus", os músicos saem do palco um a um até sobrar apenas dois violinistas.',
          en: 'In the "Farewell Symphony", musicians leave the stage one by one until only two violinists remain.',
        },
      },
      {
        id: '4',
        icon: '👑',
        text: {
          pt: 'Trabalhou para a família Esterházy por quase 30 anos, compondo mais de 100 sinfonias.',
          en: 'Worked for the Esterházy family for almost 30 years, composing over 100 symphonies.',
        },
      },
    ],
    'Johannes Brahms': [
      {
        id: '1',
        icon: '⏳',
        text: {
          pt: 'Levou 21 anos para completar sua primeira sinfonia por medo de ser comparado a Beethoven.',
          en: 'Took 21 years to complete his first symphony for fear of being compared to Beethoven.',
        },
      },
      {
        id: '2',
        icon: '☕',
        text: {
          pt: 'Bebia até 40 xícaras de café por dia.',
          en: 'Drank up to 40 cups of coffee per day.',
        },
      },
      {
        id: '3',
        icon: '🧸',
        text: {
          pt: 'Nunca se casou, mas teve um amor platônico duradouro por Clara Schumann.',
          en: 'Never married, but had a lasting platonic love for Clara Schumann.',
        },
      },
      {
        id: '4',
        icon: '🎹',
        text: {
          pt: 'Praticava piano com os dedos em jornais para não incomodar os vizinhos.',
          en: 'Practiced piano with his fingers on newspapers to avoid disturbing neighbors.',
        },
      },
    ],
    'Franz Schubert': [
      {
        id: '1',
        icon: '⚡',
        text: {
          pt: 'Compôs mais de 600 canções em sua curta vida de 31 anos.',
          en: 'Composed over 600 songs in his short 31-year life.',
        },
      },
      {
        id: '2',
        icon: '🛏️',
        text: {
          pt: 'Dormia de óculos para compor assim que acordasse.',
          en: 'Slept with his glasses on to compose as soon as he woke up.',
        },
      },
      {
        id: '3',
        icon: '🎵',
        text: {
          pt: 'Escreveu "Ave Maria" e "A Truta" que se tornaram clássicos instantâneos.',
          en: 'Wrote "Ave Maria" and "The Trout" which became instant classics.',
        },
      },
      {
        id: '4',
        icon: '📝',
        text: {
          pt: 'Podia compor até 8 canções em um único dia.',
          en: 'Could compose up to 8 songs in a single day.',
        },
      },
    ],
    'Peter Ilyich Tchaikovsky': [
      {
        id: '1',
        icon: '🩰',
        text: {
          pt: 'Compôs os três balés mais famosos: O Quebra-Nozes, O Lago dos Cisnes e A Bela Adormecida.',
          en: 'Composed the three most famous ballets: The Nutcracker, Swan Lake, and Sleeping Beauty.',
        },
      },
      {
        id: '2',
        icon: '💣',
        text: {
          pt: 'Usou canhões reais na abertura "1812" para simular batalhas.',
          en: 'Used real cannons in the "1812 Overture" to simulate battles.',
        },
      },
      {
        id: '3',
        icon: '☕',
        text: {
          pt: 'Tinha rituais obsessivos, como beber exatamente 4 xícaras de chá por dia.',
          en: 'Had obsessive rituals, like drinking exactly 4 cups of tea per day.',
        },
      },
      {
        id: '4',
        icon: '😰',
        text: {
          pt: 'Sofria de extrema timidez e ansiedade ao reger suas próprias obras.',
          en: 'Suffered from extreme shyness and anxiety when conducting his own works.',
        },
      },
    ],
    'George Frideric Handel': [
      {
        id: '1',
        icon: '👑',
        text: {
          pt: 'Compôs "Messiah" em apenas 24 dias.',
          en: 'Composed "Messiah" in just 24 days.',
        },
      },
      {
        id: '2',
        icon: '🌊',
        text: {
          pt: 'Sua "Música Aquática" foi tocada em barcos no Rio Tâmisa para o Rei George I.',
          en: 'His "Water Music" was performed on boats on the River Thames for King George I.',
        },
      },
      {
        id: '3',
        icon: '🔥',
        text: {
          pt: 'Sobreviveu a um incêndio que destruiu seu teatro e suas partituras.',
          en: 'Survived a fire that destroyed his theater and his scores.',
        },
      },
      {
        id: '4',
        icon: '🎆',
        text: {
          pt: 'Sua "Música para os Reais Fogos de Artifício" foi tocada com fogos de verdade.',
          en: 'His "Music for the Royal Fireworks" was performed with real fireworks.',
        },
      },
    ],
    'Igor Stravinsky': [
      {
        id: '1',
        icon: '😱',
        text: {
          pt: 'A estreia de "A Sagração da Primavera" causou um tumulto no teatro.',
          en: 'The premiere of "The Rite of Spring" caused a riot in the theater.',
        },
      },
      {
        id: '2',
        icon: '🎭',
        text: {
          pt: 'Revolucionou a música com ritmos complexos e dissonâncias ousadas.',
          en: 'Revolutionized music with complex rhythms and bold dissonances.',
        },
      },
      {
        id: '3',
        icon: '🚢',
        text: {
          pt: 'Mudou-se para os EUA durante a Segunda Guerra Mundial.',
          en: 'Moved to the USA during World War II.',
        },
      },
      {
        id: '4',
        icon: '🎨',
        text: {
          pt: 'Trabalhou com Picasso e outros artistas vanguardistas.',
          en: 'Worked with Picasso and other avant-garde artists.',
        },
      },
    ],
    'Robert Schumann': [
      {
        id: '1',
        icon: '✋',
        text: {
          pt: 'Machucou a mão tentando fortalecer um dedo, acabando com sua carreira de pianista.',
          en: 'Injured his hand trying to strengthen a finger, ending his piano career.',
        },
      },
      {
        id: '2',
        icon: '💕',
        text: {
          pt: 'Casou-se com Clara Wieck contra a vontade do pai dela, após uma batalha legal.',
          en: "Married Clara Wieck against her father's will, after a legal battle.",
        },
      },
      {
        id: '3',
        icon: '📝',
        text: {
          pt: 'Foi crítico musical influente antes de se dedicar completamente à composição.',
          en: 'Was an influential music critic before dedicating himself completely to composition.',
        },
      },
      {
        id: '4',
        icon: '🎭',
        text: {
          pt: 'Criou personagens fictícios (Florestan e Eusebius) que representavam aspectos de sua personalidade.',
          en: 'Created fictional characters (Florestan and Eusebius) that represented aspects of his personality.',
        },
      },
    ],
    'Felix Mendelssohn': [
      {
        id: '1',
        icon: '🎂',
        text: {
          pt: 'Compôs a abertura "Sonho de uma Noite de Verão" aos 17 anos.',
          en: 'Composed the "A Midsummer Night\'s Dream" overture at age 17.',
        },
      },
      {
        id: '2',
        icon: '🏺',
        text: {
          pt: 'Redescobriu e promoveu a música de Bach, que estava esquecida.',
          en: "Rediscovered and promoted Bach's music, which had been forgotten.",
        },
      },
      {
        id: '3',
        icon: '🎨',
        text: {
          pt: 'Era também um talentoso pintor e desenhista.',
          en: 'Was also a talented painter and draftsman.',
        },
      },
      {
        id: '4',
        icon: '🏃‍♂️',
        text: {
          pt: 'Morreu aos 38 anos, possivelmente de exaustão por excesso de trabalho.',
          en: 'Died at 38, possibly from exhaustion due to overwork.',
        },
      },
    ],
    'Claude Debussy': [
      {
        id: '1',
        icon: '🌊',
        text: {
          pt: 'Criou o impressionismo musical, inspirado pelos pintores impressionistas.',
          en: 'Created musical impressionism, inspired by impressionist painters.',
        },
      },
      {
        id: '2',
        icon: '🎹',
        text: {
          pt: '"Clair de Lune" tornou-se uma das peças de piano mais populares de todos os tempos.',
          en: '"Clair de Lune" became one of the most popular piano pieces of all time.',
        },
      },
      {
        id: '3',
        icon: '🏮',
        text: {
          pt: 'Foi influenciado pela música gamelan indonésia após ouvi-la na Exposição de Paris.',
          en: 'Was influenced by Indonesian gamelan music after hearing it at the Paris Exposition.',
        },
      },
      {
        id: '4',
        icon: '🚫',
        text: {
          pt: 'Rejeitava as regras tradicionais da harmonia, criando um novo vocabulário musical.',
          en: 'Rejected traditional harmony rules, creating a new musical vocabulary.',
        },
      },
    ],
    'Gustav Mahler': [
      {
        id: '1',
        icon: '📏',
        text: {
          pt: 'Suas sinfonias estão entre as mais longas já escritas, algumas durando mais de 90 minutos.',
          en: 'His symphonies are among the longest ever written, some lasting over 90 minutes.',
        },
      },
      {
        id: '2',
        icon: '🎤',
        text: {
          pt: 'Incluiu vozes humanas em várias de suas sinfonias.',
          en: 'Included human voices in several of his symphonies.',
        },
      },
      {
        id: '3',
        icon: '🎯',
        text: {
          pt: 'Dizia que "uma sinfonia deve conter o mundo inteiro".',
          en: 'Said that "a symphony must contain the whole world".',
        },
      },
      {
        id: '4',
        icon: '🎭',
        text: {
          pt: 'Foi um dos regentes mais importantes de sua época, dirigindo a Ópera de Viena.',
          en: 'Was one of the most important conductors of his time, directing the Vienna Opera.',
        },
      },
    ],
    'Franz Liszt': [
      {
        id: '1',
        icon: '⚡',
        text: {
          pt: 'Era considerado o primeiro "astro do rock" da música clássica, com fãs histéricas.',
          en: 'Was considered the first "rock star" of classical music, with hysterical fans.',
        },
      },
      {
        id: '2',
        icon: '🎹',
        text: {
          pt: 'Inventou o recital de piano solo e muitas técnicas pianísticas modernas.',
          en: 'Invented the solo piano recital and many modern piano techniques.',
        },
      },
      {
        id: '3',
        icon: '💔',
        text: {
          pt: "Teve vários romances famosos, incluindo com a Condessa Marie d'Agoult.",
          en: "Had several famous romances, including with Countess Marie d'Agoult.",
        },
      },
      {
        id: '4',
        icon: '⛪',
        text: {
          pt: 'Nos últimos anos, tornou-se padre e compôs música sacra.',
          en: 'In his later years, became a priest and composed sacred music.',
        },
      },
    ],
    'Maurice Ravel': [
      {
        id: '1',
        icon: '💃',
        text: {
          pt: '"Bolero" repete o mesmo tema 18 vezes com instrumentação crescente.',
          en: '"Bolero" repeats the same theme 18 times with growing instrumentation.',
        },
      },
      {
        id: '2',
        icon: '🎪',
        text: {
          pt: 'Era perfeccionista extremo e compunha muito lentamente.',
          en: 'Was an extreme perfectionist and composed very slowly.',
        },
      },
      {
        id: '3',
        icon: '🧸',
        text: {
          pt: 'Adorava brinquedos mecânicos e objetos em miniatura.',
          en: 'Loved mechanical toys and miniature objects.',
        },
      },
      {
        id: '4',
        icon: '✋',
        text: {
          pt: 'Sofreu de uma doença neurológica que o impediu de compor seus últimos anos.',
          en: 'Suffered from a neurological disease that prevented him from composing in his final years.',
        },
      },
    ],
    'Antonín Dvořák': [
      {
        id: '1',
        icon: '🚂',
        text: {
          pt: 'Era fascinado por trens e memorizava números de locomotivas.',
          en: 'Was fascinated by trains and memorized locomotive numbers.',
        },
      },
      {
        id: '2',
        icon: '🇺🇸',
        text: {
          pt: 'Sua "Sinfonia do Novo Mundo" foi composta durante sua estadia nos EUA.',
          en: 'His "New World Symphony" was composed during his stay in the USA.',
        },
      },
      {
        id: '3',
        icon: '🕊️',
        text: {
          pt: 'Criou melodias inspiradas em cantos de pássaros e música folclórica.',
          en: 'Created melodies inspired by bird songs and folk music.',
        },
      },
      {
        id: '4',
        icon: '🎓',
        text: {
          pt: 'Dirigiu o Conservatório Nacional de Nova York.',
          en: 'Directed the National Conservatory of New York.',
        },
      },
    ],
    'Antonio Vivaldi': [
      {
        id: '1',
        icon: '🌸',
        text: {
          pt: '"As Quatro Estações" é uma das obras mais reconhecidas da música clássica.',
          en: '"The Four Seasons" is one of the most recognized works in classical music.',
        },
      },
      {
        id: '2',
        icon: '⛪',
        text: {
          pt: 'Era padre, conhecido como "Il Prete Rosso" (O Padre Ruivo) devido a seu cabelo.',
          en: 'Was a priest, known as "Il Prete Rosso" (The Red Priest) due to his hair.',
        },
      },
      {
        id: '3',
        icon: '🎻',
        text: {
          pt: 'Compôs mais de 500 concertos, a maioria para violino.',
          en: 'Composed over 500 concertos, most for violin.',
        },
      },
      {
        id: '4',
        icon: '🏫',
        text: {
          pt: 'Ensinou música em um orfanato para meninas em Veneza.',
          en: 'Taught music at an orphanage for girls in Venice.',
        },
      },
    ],
    'Dmitri Shostakovich': [
      {
        id: '1',
        icon: '⚔️',
        text: {
          pt: 'Compôs sua "Sinfonia Leningrado" durante o cerco nazista a Leningrado.',
          en: 'Composed his "Leningrad Symphony" during the Nazi siege of Leningrad.',
        },
      },
      {
        id: '2',
        icon: '🤐',
        text: {
          pt: 'Usava códigos musicais para criticar o regime soviético sem ser detectado.',
          en: 'Used musical codes to criticize the Soviet regime without being detected.',
        },
      },
      {
        id: '3',
        icon: '⚽',
        text: {
          pt: 'Era árbitro de futebol registrado e grande fã do esporte.',
          en: 'Was a registered football referee and big fan of the sport.',
        },
      },
      {
        id: '4',
        icon: '😰',
        text: {
          pt: 'Vivia com medo constante de perseguição política.',
          en: 'Lived in constant fear of political persecution.',
        },
      },
    ],
    'Steve Reich': [
      {
        id: '1',
        icon: '🔄',
        text: {
          pt: 'Pioneiro da música minimalista com técnicas de repetição e mudança gradual.',
          en: 'Pioneer of minimalist music with techniques of repetition and gradual change.',
        },
      },
      {
        id: '2',
        icon: '📻',
        text: {
          pt: 'Usou gravações de vozes faladas como material musical em "Come Out".',
          en: 'Used recordings of spoken voices as musical material in "Come Out".',
        },
      },
      {
        id: '3',
        icon: '🎤',
        text: {
          pt: 'Estudou percussão africana em Gana para expandir sua linguagem musical.',
          en: 'Studied African percussion in Ghana to expand his musical language.',
        },
      },
      {
        id: '4',
        icon: '🏙️',
        text: {
          pt: '"Music for 18 Musicians" influenciou gerações de compositores contemporâneos.',
          en: '"Music for 18 Musicians" influenced generations of contemporary composers.',
        },
      },
    ],
    'Frédéric Chopin': [
      {
        id: '1',
        icon: '🇵🇱',
        text: {
          pt: 'Seu coração está enterrado em Varsóvia, mas seu corpo em Paris.',
          en: 'His heart is buried in Warsaw, but his body in Paris.',
        },
      },
      {
        id: '2',
        icon: '🎹',
        text: {
          pt: 'Quase toda sua música foi composta para piano solo.',
          en: 'Almost all his music was composed for solo piano.',
        },
      },
      {
        id: '3',
        icon: '💔',
        text: {
          pt: 'Teve um relacionamento tempestuoso com a escritora George Sand.',
          en: 'Had a tempestuous relationship with writer George Sand.',
        },
      },
      {
        id: '4',
        icon: '🏠',
        text: {
          pt: 'Passou a maior parte da vida adulta em Paris, mas sempre sentiu nostalgia da Polônia.',
          en: 'Spent most of his adult life in Paris, but always felt nostalgic for Poland.',
        },
      },
    ],
    'Serge Prokofiev': [
      {
        id: '1',
        icon: '🐺',
        text: {
          pt: '"Pedro e o Lobo" foi criado para ensinar instrumentos às crianças.',
          en: '"Peter and the Wolf" was created to teach instruments to children.',
        },
      },
      {
        id: '2',
        icon: '🎮',
        text: {
          pt: 'Retornou à União Soviética em 1936, deixando o sucesso internacional.',
          en: 'Returned to the Soviet Union in 1936, leaving international success behind.',
        },
      },
      {
        id: '3',
        icon: '♟️',
        text: {
          pt: 'Era um excelente jogador de xadrez e chegou a considerar a carreira profissional.',
          en: 'Was an excellent chess player and even considered a professional career.',
        },
      },
      {
        id: '4',
        icon: '🎭',
        text: {
          pt: 'Compôs "Romeu e Julieta", um dos balés mais populares do século XX.',
          en: 'Composed "Romeo and Juliet", one of the most popular ballets of the 20th century.',
        },
      },
    ],
    'Béla Bartók': [
      {
        id: '1',
        icon: '🎤',
        text: {
          pt: 'Gravou milhares de canções folclóricas da Europa Oriental.',
          en: 'Recorded thousands of folk songs from Eastern Europe.',
        },
      },
      {
        id: '2',
        icon: '🔬',
        text: {
          pt: 'Usou proporções matemáticas e a sequência de Fibonacci em suas composições.',
          en: 'Used mathematical proportions and the Fibonacci sequence in his compositions.',
        },
      },
      {
        id: '3',
        icon: '🦇',
        text: {
          pt: 'Estudou insetos como hobby científico paralelo à música.',
          en: 'Studied insects as a scientific hobby alongside music.',
        },
      },
      {
        id: '4',
        icon: '🇺🇸',
        text: {
          pt: 'Emigrou para os EUA durante a Segunda Guerra Mundial, morrendo em relativa pobreza.',
          en: 'Emigrated to the USA during World War II, dying in relative poverty.',
        },
      },
    ],
    'Hector Berlioz': [
      {
        id: '1',
        icon: '💀',
        text: {
          pt: 'Sua "Sinfonia Fantástica" narra sua obsessão amorosa e inclui uma marcha ao cadafalso.',
          en: 'His "Fantastic Symphony" narrates his romantic obsession and includes a march to the scaffold.',
        },
      },
      {
        id: '2',
        icon: '🎭',
        text: {
          pt: 'Escreveu críticas musicais sarcásticas para sobreviver financeiramente.',
          en: 'Wrote sarcastic music criticism to survive financially.',
        },
      },
      {
        id: '3',
        icon: '💊',
        text: {
          pt: 'Abandonou os estudos de medicina para se dedicar à música.',
          en: 'Abandoned medical studies to dedicate himself to music.',
        },
      },
      {
        id: '4',
        icon: '🎺',
        text: {
          pt: 'Expandiu drasticamente o tamanho e os recursos da orquestra.',
          en: 'Drastically expanded the size and resources of the orchestra.',
        },
      },
    ],
    'Anton Bruckner': [
      {
        id: '1',
        icon: '🔢',
        text: {
          pt: 'Tinha obsessão por números e contava tudo compulsivamente.',
          en: 'Had an obsession with numbers and counted everything compulsively.',
        },
      },
      {
        id: '2',
        icon: '⛪',
        text: {
          pt: 'Era profundamente religioso e organista de igreja.',
          en: 'Was deeply religious and a church organist.',
        },
      },
      {
        id: '3',
        icon: '📏',
        text: {
          pt: 'Suas sinfonias estão entre as mais longas do repertório romântico.',
          en: 'His symphonies are among the longest in the romantic repertoire.',
        },
      },
      {
        id: '4',
        icon: '🎓',
        text: {
          pt: 'Começou a compor sinfonias relativamente tarde, aos 40 anos.',
          en: 'Started composing symphonies relatively late, at age 40.',
        },
      },
    ],
    'Giovanni Pierluigi da Palestrina': [
      {
        id: '1',
        icon: '⛪',
        text: {
          pt: 'Salvou a polifonia sacra das reformas do Concílio de Trento.',
          en: 'Saved sacred polyphony from the reforms of the Council of Trent.',
        },
      },
      {
        id: '2',
        icon: '👼',
        text: {
          pt: 'Sua "Missa do Papa Marcelo" é considerada um modelo de música sacra.',
          en: 'His "Pope Marcellus Mass" is considered a model of sacred music.',
        },
      },
      {
        id: '3',
        icon: '🎵',
        text: {
          pt: 'Desenvolveu um estilo que equilibrava clareza textual e beleza musical.',
          en: 'Developed a style that balanced textual clarity and musical beauty.',
        },
      },
      {
        id: '4',
        icon: '🏛️',
        text: {
          pt: 'É considerado o maior compositor de música sacra do Renascimento.',
          en: 'Is considered the greatest composer of sacred music in the Renaissance.',
        },
      },
    ],
    'Claudio Monteverdi': [
      {
        id: '1',
        icon: '🎭',
        text: {
          pt: 'Criou a primeira ópera verdadeiramente dramática com "Orfeo".',
          en: 'Created the first truly dramatic opera with "Orfeo".',
        },
      },
      {
        id: '2',
        icon: '🌉',
        text: {
          pt: 'Fez a transição entre a música renascentista e barroca.',
          en: 'Made the transition between Renaissance and Baroque music.',
        },
      },
      {
        id: '3',
        icon: '⛪',
        text: {
          pt: 'Foi maestro da Basílica de São Marcos em Veneza.',
          en: "Was maestro of St. Mark's Basilica in Venice.",
        },
      },
      {
        id: '4',
        icon: '💔',
        text: {
          pt: 'Suas cartas revelam profunda tristeza pela morte prematura de sua esposa.',
          en: "His letters reveal profound sadness over his wife's premature death.",
        },
      },
    ],
    'Jean Sibelius': [
      {
        id: '1',
        icon: '🇫🇮',
        text: {
          pt: 'Tornou-se símbolo nacional da Finlândia com "Finlandia".',
          en: 'Became a national symbol of Finland with "Finlandia".',
        },
      },
      {
        id: '2',
        icon: '🌲',
        text: {
          pt: 'Suas sinfonias são inspiradas na natureza nórdica.',
          en: 'His symphonies are inspired by Nordic nature.',
        },
      },
      {
        id: '3',
        icon: '🤐',
        text: {
          pt: 'Parou de compor aos 60 anos e viveu mais 30 anos em silêncio criativo.',
          en: 'Stopped composing at 60 and lived another 30 years in creative silence.',
        },
      },
      {
        id: '4',
        icon: '🍷',
        text: {
          pt: 'Lutou contra o alcoolismo durante parte de sua vida.',
          en: 'Struggled with alcoholism during part of his life.',
        },
      },
    ],
    'Ralph Vaughan Williams': [
      {
        id: '1',
        icon: '🎵',
        text: {
          pt: 'Coletou canções folclóricas inglesas para preservar a tradição nacional.',
          en: 'Collected English folk songs to preserve national tradition.',
        },
      },
      {
        id: '2',
        icon: '⚔️',
        text: {
          pt: 'Serviu como motorista de ambulância na Primeira Guerra Mundial aos 40 anos.',
          en: 'Served as an ambulance driver in World War I at age 40.',
        },
      },
      {
        id: '3',
        icon: '🎓',
        text: {
          pt: 'Ensinou composição no Royal College of Music por décadas.',
          en: 'Taught composition at the Royal College of Music for decades.',
        },
      },
      {
        id: '4',
        icon: '🌅',
        text: {
          pt: 'Sua música evoca paisagens e tradições da Inglaterra rural.',
          en: 'His music evokes landscapes and traditions of rural England.',
        },
      },
    ],
    'Modest Mussorgsky': [
      {
        id: '1',
        icon: '🖼️',
        text: {
          pt: '"Quadros de uma Exposição" foi inspirado por pinturas de seu amigo Viktor Hartmann.',
          en: '"Pictures at an Exhibition" was inspired by paintings of his friend Viktor Hartmann.',
        },
      },
      {
        id: '2',
        icon: '🍺',
        text: {
          pt: 'Lutou contra o alcoolismo, que contribuiu para sua morte prematura.',
          en: 'Struggled with alcoholism, which contributed to his premature death.',
        },
      },
      {
        id: '3',
        icon: '🏛️',
        text: {
          pt: 'Era funcionário público e compunha música nas horas vagas.',
          en: 'Was a civil servant and composed music in his spare time.',
        },
      },
      {
        id: '4',
        icon: '🇷🇺',
        text: {
          pt: 'Membro do "Grupo dos Cinco", compositores russos nacionalistas.',
          en: 'Member of "The Five", Russian nationalist composers.',
        },
      },
    ],
    'Giacomo Puccini': [
      {
        id: '1',
        icon: '🎭',
        text: {
          pt: 'Compôs algumas das óperas mais populares: "La Bohème", "Tosca" e "Madama Butterfly".',
          en: 'Composed some of the most popular operas: "La Bohème", "Tosca" and "Madama Butterfly".',
        },
      },
      {
        id: '2',
        icon: '🚗',
        text: {
          pt: 'Era apaixonado por carros e lanchas de alta velocidade.',
          en: 'Was passionate about cars and high-speed boats.',
        },
      },
      {
        id: '3',
        icon: '🎯',
        text: {
          pt: 'Especializou-se em criar melodias extremamente cativantes e emotivas.',
          en: 'Specialized in creating extremely catchy and emotional melodies.',
        },
      },
      {
        id: '4',
        icon: '💔',
        text: {
          pt: 'Suas óperas frequentemente terminam tragicamente, mas são imensamente populares.',
          en: 'His operas often end tragically, but are immensely popular.',
        },
      },
    ],
    'Henry Purcell': [
      {
        id: '1',
        icon: '👑',
        text: {
          pt: 'Foi organista da Abadia de Westminster e compositor da corte inglesa.',
          en: 'Was organist at Westminster Abbey and composer to the English court.',
        },
      },
      {
        id: '2',
        icon: '⚰️',
        text: {
          pt: '"Music for the Funeral of Queen Mary" tornou-se uma de suas obras mais famosas.',
          en: '"Music for the Funeral of Queen Mary" became one of his most famous works.',
        },
      },
      {
        id: '3',
        icon: '🎭',
        text: {
          pt: 'Criou "Dido and Aeneas", considerada a primeira grande ópera inglesa.',
          en: 'Created "Dido and Aeneas", considered the first great English opera.',
        },
      },
      {
        id: '4',
        icon: '💀',
        text: {
          pt: 'Morreu aos 36 anos, possivelmente de tuberculose.',
          en: 'Died at 36, possibly from tuberculosis.',
        },
      },
    ],
    'Gioacchino Rossini': [
      {
        id: '1',
        icon: '⚡',
        text: {
          pt: 'Compunha tão rapidamente que era chamado de "Signor Crescendo".',
          en: 'Composed so quickly that he was called "Signor Crescendo".',
        },
      },
      {
        id: '2',
        icon: '🍝',
        text: {
          pt: 'Era um grande gourmand e deu nome a pratos culinários.',
          en: 'Was a great gourmand and gave his name to culinary dishes.',
        },
      },
      {
        id: '3',
        icon: '🎭',
        text: {
          pt: '"O Barbeiro de Sevilha" foi composta em apenas 13 dias.',
          en: '"The Barber of Seville" was composed in just 13 days.',
        },
      },
      {
        id: '4',
        icon: '🛌',
        text: {
          pt: 'Aposentou-se da ópera aos 37 anos e viveu confortavelmente por mais 40 anos.',
          en: 'Retired from opera at 37 and lived comfortably for another 40 years.',
        },
      },
    ],
    'Edward Elgar': [
      {
        id: '1',
        icon: '🎓',
        text: {
          pt: '"Pomp and Circumstance" é tocada em formaturas no mundo todo.',
          en: '"Pomp and Circumstance" is played at graduations worldwide.',
        },
      },
      {
        id: '2',
        icon: '🔤',
        text: {
          pt: 'As "Variações Enigma" contêm um mistério nunca completamente decifrado.',
          en: 'The "Enigma Variations" contain a mystery never completely deciphered.',
        },
      },
      {
        id: '3',
        icon: '🏆',
        text: {
          pt: 'Foi o primeiro compositor inglês a ganhar reconhecimento internacional em séculos.',
          en: 'Was the first English composer to gain international recognition in centuries.',
        },
      },
      {
        id: '4',
        icon: '🎹',
        text: {
          pt: 'Era autodidata e não teve educação musical formal.',
          en: 'Was self-taught and had no formal musical education.',
        },
      },
    ],
    'Sergei Rachmaninoff': [
      {
        id: '1',
        icon: '✋',
        text: {
          pt: 'Tinha mãos enormes que podiam alcançar uma décima terceira no piano.',
          en: 'Had enormous hands that could reach a thirteenth on the piano.',
        },
      },
      {
        id: '2',
        icon: '😔',
        text: {
          pt: 'Sofreu depressão severa após o fracasso de sua Primeira Sinfonia.',
          en: 'Suffered severe depression after the failure of his First Symphony.',
        },
      },
      {
        id: '3',
        icon: '🇺🇸',
        text: {
          pt: 'Emigrou para os EUA após a Revolução Russa e nunca mais retornou.',
          en: 'Emigrated to the USA after the Russian Revolution and never returned.',
        },
      },
      {
        id: '4',
        icon: '🎹',
        text: {
          pt: 'Era considerado um dos maiores pianistas de todos os tempos.',
          en: 'Was considered one of the greatest pianists of all time.',
        },
      },
    ],
    'John Williams': [
      {
        id: '1',
        icon: '⭐',
        text: {
          pt: 'Compôs as trilhas de Star Wars, Indiana Jones, Harry Potter e Jurassic Park.',
          en: 'Composed the soundtracks for Star Wars, Indiana Jones, Harry Potter and Jurassic Park.',
        },
      },
      {
        id: '2',
        icon: '🏆',
        text: {
          pt: 'Ganhou 5 Oscars e foi indicado mais de 50 vezes.',
          en: 'Won 5 Oscars and was nominated over 50 times.',
        },
      },
      {
        id: '3',
        icon: '🎺',
        text: {
          pt: 'Foi regente da Boston Pops Orchestra por 14 anos.',
          en: 'Was conductor of the Boston Pops Orchestra for 14 years.',
        },
      },
      {
        id: '4',
        icon: '🎬',
        text: {
          pt: 'Suas trilhas venderam mais de qualquer outro compositor de cinema da história.',
          en: 'His soundtracks have sold more than any other film composer in history.',
        },
      },
    ],
    'Leonard Bernstein': [
      {
        id: '1',
        icon: '🎭',
        text: {
          pt: 'Compôs "West Side Story", um dos musicais mais amados de todos os tempos.',
          en: 'Composed "West Side Story", one of the most beloved musicals of all time.',
        },
      },
      {
        id: '2',
        icon: '🎯',
        text: {
          pt: 'Foi o primeiro maestro americano nato a dirigir uma grande orquestra.',
          en: 'Was the first American-born conductor to lead a major orchestra.',
        },
      },
      {
        id: '3',
        icon: '📺',
        text: {
          pt: 'Seus concertos para jovens na TV educaram gerações sobre música clássica.',
          en: "His Young People's Concerts on TV educated generations about classical music.",
        },
      },
      {
        id: '4',
        icon: '🌟',
        text: {
          pt: 'Era maestro, compositor, pianista e educador - um talento múltiplo raro.',
          en: 'Was conductor, composer, pianist and educator - a rare multiple talent.',
        },
      },
    ],
    'Heitor Villa-Lobos': [
      {
        id: '1',
        icon: '🇧🇷',
        text: {
          pt: 'É o maior compositor brasileiro, com mais de 2.000 obras catalogadas.',
          en: "Is Brazil's greatest composer, with over 2,000 catalogued works.",
        },
      },
      {
        id: '2',
        icon: '🎸',
        text: {
          pt: 'Suas "Bachianas Brasileiras" misturam Bach com ritmos brasileiros.',
          en: 'His "Bachianas Brasileiras" mix Bach with Brazilian rhythms.',
        },
      },
      {
        id: '3',
        icon: '🌿',
        text: {
          pt: 'Viajou pelo interior do Brasil coletando música folclórica.',
          en: 'Traveled through the Brazilian interior collecting folk music.',
        },
      },
      {
        id: '4',
        icon: '🎓',
        text: {
          pt: 'Criou um sistema nacional de educação musical no Brasil.',
          en: 'Created a national music education system in Brazil.',
        },
      },
    ],
    'Clara Schumann': [
      {
        id: '1',
        icon: '🎹',
        text: {
          pt: 'Foi uma das maiores pianistas de sua época e compositora talentosa.',
          en: 'Was one of the greatest pianists of her time and a talented composer.',
        },
      },
      {
        id: '2',
        icon: '💕',
        text: {
          pt: 'Casou-se com Robert Schumann após uma batalha legal contra seu pai.',
          en: 'Married Robert Schumann after a legal battle against her father.',
        },
      },
      {
        id: '3',
        icon: '👶',
        text: {
          pt: 'Teve 8 filhos e ainda manteve carreira internacional como concertista.',
          en: 'Had 8 children and still maintained an international career as a concert pianist.',
        },
      },
      {
        id: '4',
        icon: '💰',
        text: {
          pt: 'Foi a principal sustento da família, ganhando mais que Robert com seus concertos.',
          en: "Was the family's main breadwinner, earning more than Robert with her concerts.",
        },
      },
    ],
    'Camille Saint-Saëns': [
      {
        id: '1',
        icon: '🦢',
        text: {
          pt: '"O Cisne" do "Carnaval dos Animais" tornou-se uma das melodias mais amadas.',
          en: '"The Swan" from "Carnival of the Animals" became one of the most beloved melodies.',
        },
      },
      {
        id: '2',
        icon: '🧠',
        text: {
          pt: 'Era uma criança prodígio que compôs sua primeira peça aos 3 anos.',
          en: 'Was a child prodigy who composed his first piece at age 3.',
        },
      },
      {
        id: '3',
        icon: '🔭',
        text: {
          pt: 'Tinha interesses científicos e chegou a escrever sobre astronomia.',
          en: 'Had scientific interests and even wrote about astronomy.',
        },
      },
      {
        id: '4',
        icon: '🌍',
        text: {
          pt: 'Viajou extensivamente, incluindo várias visitas ao Egito e Argélia.',
          en: 'Traveled extensively, including several visits to Egypt and Algeria.',
        },
      },
    ],
    'Josquin Des Prez': [
      {
        id: '1',
        icon: '👑',
        text: {
          pt: 'Foi considerado o maior compositor de sua época, admirado por reis e papas.',
          en: 'Was considered the greatest composer of his time, admired by kings and popes.',
        },
      },
      {
        id: '2',
        icon: '🎭',
        text: {
          pt: 'Revolucionou a polifonia renascentista com técnicas expressivas inovadoras.',
          en: 'Revolutionized Renaissance polyphony with innovative expressive techniques.',
        },
      },
      {
        id: '3',
        icon: '📝',
        text: {
          pt: 'Suas missas e motetos definiram o padrão da música sacra renascentista.',
          en: 'His masses and motets defined the standard for Renaissance sacred music.',
        },
      },
      {
        id: '4',
        icon: '🌍',
        text: {
          pt: 'Influenciou compositores por toda a Europa, sendo chamado de "Príncipe da Música".',
          en: 'Influenced composers throughout Europe, being called the "Prince of Music".',
        },
      },
    ],
    'Nikolai Rimsky-Korsakov': [
      {
        id: '1',
        icon: '🐝',
        text: {
          pt: 'Compôs "O Voo do Zangão", uma das peças mais tecnicamente desafiadoras.',
          en: 'Composed "Flight of the Bumblebee", one of the most technically challenging pieces.',
        },
      },
      {
        id: '2',
        icon: '⚓',
        text: {
          pt: 'Era oficial da Marinha Russa antes de se dedicar completamente à música.',
          en: 'Was a Russian Navy officer before dedicating himself completely to music.',
        },
      },
      {
        id: '3',
        icon: '🎨',
        text: {
          pt: 'Tinha sinestesia e associava tonalidades musicais com cores específicas.',
          en: 'Had synesthesia and associated musical keys with specific colors.',
        },
      },
      {
        id: '4',
        icon: '🇷🇺',
        text: {
          pt: 'Membro do "Grupo dos Cinco" e professor de Stravinsky.',
          en: 'Member of "The Five" and teacher of Stravinsky.',
        },
      },
    ],
    'Carl Maria von Weber': [
      {
        id: '1',
        icon: '🎭',
        text: {
          pt: 'Criou a primeira ópera romântica alemã com "Der Freischütz".',
          en: 'Created the first German Romantic opera with "Der Freischütz".',
        },
      },
      {
        id: '2',
        icon: '🎻',
        text: {
          pt: 'Revolucionou a técnica de regência, sendo um dos primeiros maestros modernos.',
          en: 'Revolutionized conducting technique, being one of the first modern conductors.',
        },
      },
      {
        id: '3',
        icon: '💀',
        text: {
          pt: 'Morreu em Londres aos 39 anos, sendo enterrado 18 anos depois na Alemanha.',
          en: 'Died in London at 39, being buried 18 years later in Germany.',
        },
      },
      {
        id: '4',
        icon: '🎼',
        text: {
          pt: 'Suas obras influenciaram diretamente Wagner e o desenvolvimento da ópera alemã.',
          en: 'His works directly influenced Wagner and the development of German opera.',
        },
      },
    ],
    'Jean-Philippe Rameau': [
      {
        id: '1',
        icon: '📚',
        text: {
          pt: 'Escreveu o "Tratado de Harmonia" que revolucionou a teoria musical.',
          en: 'Wrote the "Treatise on Harmony" that revolutionized musical theory.',
        },
      },
      {
        id: '2',
        icon: '🎹',
        text: {
          pt: 'Era considerado o maior compositor francês antes de Debussy.',
          en: 'Was considered the greatest French composer before Debussy.',
        },
      },
      {
        id: '3',
        icon: '🎭',
        text: {
          pt: 'Começou a compor óperas apenas aos 50 anos, mas criou obras-primas.',
          en: 'Started composing operas only at age 50, but created masterpieces.',
        },
      },
      {
        id: '4',
        icon: '🔬',
        text: {
          pt: 'Aplicou princípios científicos à análise da harmonia musical.',
          en: 'Applied scientific principles to the analysis of musical harmony.',
        },
      },
    ],
    'Jean-Baptiste Lully': [
      {
        id: '1',
        icon: '👑',
        text: {
          pt: 'Foi compositor oficial de Luís XIV e criador da ópera francesa.',
          en: 'Was official composer to Louis XIV and creator of French opera.',
        },
      },
      {
        id: '2',
        icon: '💀',
        text: {
          pt: 'Morreu após perfurar o pé com sua própria batuta de regência.',
          en: 'Died after piercing his foot with his own conducting staff.',
        },
      },
      {
        id: '3',
        icon: '🎭',
        text: {
          pt: 'Monopolizou a produção operística francesa por décadas.',
          en: 'Monopolized French operatic production for decades.',
        },
      },
      {
        id: '4',
        icon: '🇮🇹',
        text: {
          pt: 'Nasceu italiano mas se tornou mais francês que os próprios franceses.',
          en: 'Born Italian but became more French than the French themselves.',
        },
      },
    ],
    'Gabriel Fauré': [
      {
        id: '1',
        icon: '🌙',
        text: {
          pt: 'Compôs algumas das canções francesas mais belas, como "Clair de Lune".',
          en: 'Composed some of the most beautiful French songs, like "Clair de Lune".',
        },
      },
      {
        id: '2',
        icon: '🎓',
        text: {
          pt: 'Foi diretor do Conservatório de Paris e professor de Ravel.',
          en: 'Was director of the Paris Conservatory and teacher of Ravel.',
        },
      },
      {
        id: '3',
        icon: '🦻',
        text: {
          pt: 'Desenvolveu surdez progressiva, mas continuou compondo.',
          en: 'Developed progressive deafness, but continued composing.',
        },
      },
      {
        id: '4',
        icon: '⛪',
        text: {
          pt: 'Seu "Réquiem" é considerado uma das obras sacras mais serenas já escritas.',
          en: 'His "Requiem" is considered one of the most serene sacred works ever written.',
        },
      },
    ],
    'Edvard Grieg': [
      {
        id: '1',
        icon: '🇳🇴',
        text: {
          pt: 'Tornou-se o símbolo musical da Noruega com "Peer Gynt".',
          en: 'Became the musical symbol of Norway with "Peer Gynt".',
        },
      },
      {
        id: '2',
        icon: '🏔️',
        text: {
          pt: 'Sua música captura perfeitamente as paisagens e folclore noruegueses.',
          en: 'His music perfectly captures Norwegian landscapes and folklore.',
        },
      },
      {
        id: '3',
        icon: '🎹',
        text: {
          pt: 'Tinha mãos pequenas, o que influenciou seu estilo pianístico único.',
          en: 'Had small hands, which influenced his unique pianistic style.',
        },
      },
      {
        id: '4',
        icon: '💒',
        text: {
          pt: 'Casou-se com sua prima Nina, que era também uma talentosa cantora.',
          en: 'Married his cousin Nina, who was also a talented singer.',
        },
      },
    ],
    'Christoph Willibald Gluck': [
      {
        id: '1',
        icon: '🎭',
        text: {
          pt: 'Reformou a ópera, eliminando excessos vocais em favor do drama.',
          en: 'Reformed opera, eliminating vocal excesses in favor of drama.',
        },
      },
      {
        id: '2',
        icon: '🇫🇷',
        text: {
          pt: 'Sua "Orfeo ed Euridice" ainda é regularmente encenada hoje.',
          en: 'His "Orfeo ed Euridice" is still regularly performed today.',
        },
      },
      {
        id: '3',
        icon: '⚔️',
        text: {
          pt: 'Travou a famosa "Guerra dos Bufões" contra os defensores da ópera italiana.',
          en: 'Fought the famous "War of the Buffoons" against defenders of Italian opera.',
        },
      },
      {
        id: '4',
        icon: '👑',
        text: {
          pt: 'Foi compositor da corte imperial austríaca e professor de Maria Antonieta.',
          en: 'Was composer to the Austrian imperial court and teacher of Marie Antoinette.',
        },
      },
    ],
    'Arnold Schoenberg': [
      {
        id: '1',
        icon: '🔢',
        text: {
          pt: 'Inventou o sistema dodecafônico, revolucionando a música do século XX.',
          en: 'Invented the twelve-tone system, revolutionizing 20th-century music.',
        },
      },
      {
        id: '2',
        icon: '🎨',
        text: {
          pt: 'Era também pintor expressionista e amigo de Kandinsky.',
          en: 'Was also an expressionist painter and friend of Kandinsky.',
        },
      },
      {
        id: '3',
        icon: '🇺🇸',
        text: {
          pt: 'Fugiu dos nazistas e ensinou em Hollywood, influenciando a música de cinema.',
          en: 'Fled the Nazis and taught in Hollywood, influencing film music.',
        },
      },
      {
        id: '4',
        icon: '🎓',
        text: {
          pt: 'Seus alunos Berg e Webern formaram a "Segunda Escola de Viena".',
          en: 'His students Berg and Webern formed the "Second Viennese School".',
        },
      },
    ],
    'Charles Ives': [
      {
        id: '1',
        icon: '💼',
        text: {
          pt: 'Era executivo de seguros e compunha música experimental nas horas vagas.',
          en: 'Was an insurance executive and composed experimental music in his spare time.',
        },
      },
      {
        id: '2',
        icon: '🇺🇸',
        text: {
          pt: 'Criou a primeira música verdadeiramente americana, usando hinos e marchas populares.',
          en: 'Created the first truly American music, using hymns and popular marches.',
        },
      },
      {
        id: '3',
        icon: '🏆',
        text: {
          pt: 'Ganhou o Prêmio Pulitzer de Música em 1947.',
          en: 'Won the Pulitzer Prize for Music in 1947.',
        },
      },
      {
        id: '4',
        icon: '⚡',
        text: {
          pt: 'Experimentou com politonalidade e microtonalidade décadas antes de outros compositores.',
          en: 'Experimented with polytonality and microtonality decades before other composers.',
        },
      },
    ],

    'Alexander Nikolayevich Scriabin': [
      {
        id: '1',
        icon: '🌈',
        text: {
          pt: 'Tinha sinestesia e criou um "teclado de cores" para acompanhar sua música.',
          en: 'Had synesthesia and created a "color keyboard" to accompany his music.',
        },
      },
      {
        id: '2',
        icon: '🎹',
        text: {
          pt: 'Desenvolveu um sistema harmônico próprio baseado no "acorde místico".',
          en: 'Developed his own harmonic system based on the "mystic chord".',
        },
      },
      {
        id: '3',
        icon: '🧙‍♂️',
        text: {
          pt: 'Acreditava que sua música poderia transformar o mundo através da experiência mística.',
          en: 'Believed his music could transform the world through mystical experience.',
        },
      },
      {
        id: '4',
        icon: '💀',
        text: {
          pt: 'Morreu jovem, aos 43 anos, de uma infecção causada por um furúnculo.',
          en: 'Died young, at 43, from an infection caused by a boil.',
        },
      },
    ],
    'Georges Bizet': [
      {
        id: '1',
        icon: '🌹',
        text: {
          pt: 'Sua ópera "Carmen" é uma das mais populares de todos os tempos.',
          en: 'His opera "Carmen" is one of the most popular of all time.',
        },
      },
      {
        id: '2',
        icon: '💀',
        text: {
          pt: 'Morreu três meses após a estreia de "Carmen", sem saber de seu sucesso futuro.',
          en: 'Died three months after the premiere of "Carmen", unaware of its future success.',
        },
      },
      {
        id: '3',
        icon: '🎭',
        text: {
          pt: 'A ária "Habanera" de Carmen tornou-se um dos trechos operísticos mais conhecidos.',
          en: 'The "Habanera" aria from Carmen became one of the most famous operatic excerpts.',
        },
      },
      {
        id: '4',
        icon: '🇫🇷',
        text: {
          pt: 'Representou perfeitamente o espírito da ópera francesa do século XIX.',
          en: 'Perfectly represented the spirit of 19th-century French opera.',
        },
      },
    ],
    'Domenico Scarlatti': [
      {
        id: '1',
        icon: '🎹',
        text: {
          pt: 'Compôs mais de 550 sonatas para cravo, cada uma explorando técnicas diferentes.',
          en: 'Composed over 550 harpsichord sonatas, each exploring different techniques.',
        },
      },
      {
        id: '2',
        icon: '🇪🇸',
        text: {
          pt: 'Viveu na Espanha e incorporou elementos da música flamenca em suas obras.',
          en: 'Lived in Spain and incorporated elements of flamenco music in his works.',
        },
      },
      {
        id: '3',
        icon: '👑',
        text: {
          pt: 'Foi professor de música da Princesa Maria Bárbara.',
          en: 'Was music teacher to Princess Maria Barbara.',
        },
      },
      {
        id: '4',
        icon: '⚡',
        text: {
          pt: 'Suas sonatas exigiam técnicas pianísticas revolucionárias para a época.',
          en: 'His sonatas demanded piano techniques that were revolutionary for the time.',
        },
      },
    ],
    'Georg Philipp Telemann': [
      {
        id: '1',
        icon: '📝',
        text: {
          pt: 'Foi o compositor mais prolífico da história, com mais de 3.000 obras.',
          en: 'Was the most prolific composer in history, with over 3,000 works.',
        },
      },
      {
        id: '2',
        icon: '🎼',
        text: {
          pt: 'Era mais famoso que Bach durante sua vida.',
          en: 'Was more famous than Bach during his lifetime.',
        },
      },
      {
        id: '3',
        icon: '🎭',
        text: {
          pt: 'Compôs mais de 40 óperas e centenas de cantatas sacras.',
          en: 'Composed over 40 operas and hundreds of sacred cantatas.',
        },
      },
      {
        id: '4',
        icon: '🌍',
        text: {
          pt: 'Influenciou estilos musicais de toda a Europa em suas composições.',
          en: 'Influenced musical styles from all over Europe in his compositions.',
        },
      },
    ],
    'Anton Webern': [
      {
        id: '1',
        icon: '🔬',
        text: {
          pt: 'Suas obras são extremamente concisas - algumas duram menos de um minuto.',
          en: 'His works are extremely concise - some last less than a minute.',
        },
      },
      {
        id: '2',
        icon: '🎯',
        text: {
          pt: 'Levou o sistema dodecafônico de Schoenberg às últimas consequências.',
          en: "Took Schoenberg's twelve-tone system to its ultimate consequences.",
        },
      },
      {
        id: '3',
        icon: '💀',
        text: {
          pt: 'Foi morto acidentalmente por um soldado americano em 1945.',
          en: 'Was accidentally killed by an American soldier in 1945.',
        },
      },
      {
        id: '4',
        icon: '🌟',
        text: {
          pt: 'Influenciou profundamente a música serial do pós-guerra.',
          en: 'Profoundly influenced post-war serial music.',
        },
      },
    ],
    'Roland de Lassus': [
      {
        id: '1',
        icon: '🌍',
        text: {
          pt: 'Compôs em latim, francês, alemão e italiano, sendo verdadeiramente cosmopolita.',
          en: 'Composed in Latin, French, German and Italian, being truly cosmopolitan.',
        },
      },
      {
        id: '2',
        icon: '👑',
        text: {
          pt: 'Serviu na corte de Munique por mais de 30 anos.',
          en: 'Served at the Munich court for over 30 years.',
        },
      },
      {
        id: '3',
        icon: '🎵',
        text: {
          pt: 'Suas mais de 2.000 obras incluem desde música sacra até canções seculares.',
          en: 'His over 2,000 works include everything from sacred music to secular songs.',
        },
      },
      {
        id: '4',
        icon: '🏆',
        text: {
          pt: 'Foi considerado o maior compositor de sua época ao lado de Palestrina.',
          en: 'Was considered the greatest composer of his time alongside Palestrina.',
        },
      },
    ],
    'George Gershwin': [
      {
        id: '1',
        icon: '🎹',
        text: {
          pt: '"Rhapsody in Blue" revolucionou a música clássica americana incorporando jazz.',
          en: '"Rhapsody in Blue" revolutionized American classical music by incorporating jazz.',
        },
      },
      {
        id: '2',
        icon: '🎭',
        text: {
          pt: 'Compôs sucessos da Broadway como "I Got Rhythm" e "Summertime".',
          en: 'Composed Broadway hits like "I Got Rhythm" and "Summertime".',
        },
      },
      {
        id: '3',
        icon: '🧠',
        text: {
          pt: 'Morreu jovem, aos 38 anos, de um tumor cerebral.',
          en: 'Died young, at 38, from a brain tumor.',
        },
      },
      {
        id: '4',
        icon: '🎬',
        text: {
          pt: 'Sua música influenciou tanto o jazz quanto a música erudita americana.',
          en: 'His music influenced both jazz and American classical music.',
        },
      },
    ],
    'Gaetano Donizetti': [
      {
        id: '1',
        icon: '🎭',
        text: {
          pt: 'Compôs mais de 70 óperas, incluindo "L\'Elisir d\'Amore" e "Lucia di Lammermoor".',
          en: 'Composed over 70 operas, including "L\'Elisir d\'Amore" and "Lucia di Lammermoor".',
        },
      },
      {
        id: '2',
        icon: '⚡',
        text: {
          pt: 'Era conhecido pela velocidade com que compunha - podia escrever uma ópera em duas semanas.',
          en: 'Was known for the speed with which he composed - could write an opera in two weeks.',
        },
      },
      {
        id: '3',
        icon: '😢',
        text: {
          pt: 'Sua ária "Una furtiva lagrima" é uma das mais belas do repertório operístico.',
          en: 'His aria "Una furtiva lagrima" is one of the most beautiful in the operatic repertoire.',
        },
      },
      {
        id: '4',
        icon: '🇮🇹',
        text: {
          pt: 'Representou o auge do bel canto italiano ao lado de Bellini e Rossini.',
          en: 'Represented the peak of Italian bel canto alongside Bellini and Rossini.',
        },
      },
    ],
    'Carl Philipp Emanuel Bach': [
      {
        id: '1',
        icon: '👨‍👦',
        text: {
          pt: 'Filho de J.S. Bach, foi mais famoso que o pai durante sua vida.',
          en: 'Son of J.S. Bach, was more famous than his father during his lifetime.',
        },
      },
      {
        id: '2',
        icon: '👑',
        text: {
          pt: 'Serviu na corte de Frederico, o Grande, da Prússia.',
          en: 'Served at the court of Frederick the Great of Prussia.',
        },
      },
      {
        id: '3',
        icon: '🎹',
        text: {
          pt: 'Desenvolveu o estilo "empfindsamer Stil" (estilo sensível) no teclado.',
          en: 'Developed the "empfindsamer Stil" (sensitive style) on keyboard.',
        },
      },
      {
        id: '4',
        icon: '📚',
        text: {
          pt: 'Seu tratado sobre o teclado influenciou Mozart e Beethoven.',
          en: 'His treatise on keyboard influenced Mozart and Beethoven.',
        },
      },
    ],
    'Archangelo Corelli': [
      {
        id: '1',
        icon: '🎻',
        text: {
          pt: 'Estabeleceu as bases da técnica moderna do violino.',
          en: 'Established the foundations of modern violin technique.',
        },
      },
      {
        id: '2',
        icon: '🏛️',
        text: {
          pt: 'Seus concerti grossi definiram o gênero para gerações futuras.',
          en: 'His concerti grossi defined the genre for future generations.',
        },
      },
      {
        id: '3',
        icon: '🎼',
        text: {
          pt: 'Publicou apenas 6 conjuntos de obras, mas todas se tornaram clássicas.',
          en: 'Published only 6 sets of works, but all became classics.',
        },
      },
      {
        id: '4',
        icon: '🇮🇹',
        text: {
          pt: 'Foi o violinista mais famoso da Europa em sua época.',
          en: 'Was the most famous violinist in Europe in his time.',
        },
      },
    ],
    'Thomas Tallis': [
      {
        id: '1',
        icon: '👑',
        text: {
          pt: 'Serviu a quatro monarcas ingleses: Henrique VIII, Eduardo VI, Maria I e Elizabeth I.',
          en: 'Served four English monarchs: Henry VIII, Edward VI, Mary I and Elizabeth I.',
        },
      },
      {
        id: '2',
        icon: '🎤',
        text: {
          pt: 'Compôs "Spem in alium" para 40 vozes independentes.',
          en: 'Composed "Spem in alium" for 40 independent voices.',
        },
      },
      {
        id: '3',
        icon: '⛪',
        text: {
          pt: 'Adaptou-se às mudanças religiosas, compondo tanto música católica quanto protestante.',
          en: 'Adapted to religious changes, composing both Catholic and Protestant music.',
        },
      },
      {
        id: '4',
        icon: '📜',
        text: {
          pt: 'Recebeu monopólio real para publicação de música junto com William Byrd.',
          en: 'Received royal monopoly for music publication together with William Byrd.',
        },
      },
    ],
    'Johann Strauss II': [
      {
        id: '1',
        icon: '💃',
        text: {
          pt: 'É conhecido como o "Rei da Valsa" por suas valsas vienenses.',
          en: 'Is known as the "Waltz King" for his Viennese waltzes.',
        },
      },
      {
        id: '2',
        icon: '🎆',
        text: {
          pt: 'Sua "Valsa do Danúbio Azul" tornou-se um hino não-oficial da Áustria.',
          en: 'His "Blue Danube Waltz" became an unofficial anthem of Austria.',
        },
      },
      {
        id: '3',
        icon: '🎭',
        text: {
          pt: 'Compôs "Die Fledermaus", uma das operetas mais populares.',
          en: 'Composed "Die Fledermaus", one of the most popular operettas.',
        },
      },
      {
        id: '4',
        icon: '👨‍👦',
        text: {
          pt: 'Superou a fama de seu pai, Johann Strauss I, também compositor de valsas.',
          en: 'Surpassed the fame of his father, Johann Strauss I, also a waltz composer.',
        },
      },
    ],
    'Leos Janácek': [
      {
        id: '1',
        icon: '🗣️',
        text: {
          pt: 'Estudou os padrões melódicos da fala tcheca para criar sua linguagem musical.',
          en: 'Studied the melodic patterns of Czech speech to create his musical language.',
        },
      },
      {
        id: '2',
        icon: '🎭',
        text: {
          pt: 'Sua ópera "Jenůfa" só foi reconhecida quando ele já tinha 60 anos.',
          en: 'His opera "Jenůfa" was only recognized when he was already 60 years old.',
        },
      },
      {
        id: '3',
        icon: '🇨🇿',
        text: {
          pt: 'Incorporou elementos da música folclórica morávia em suas composições.',
          en: 'Incorporated elements of Moravian folk music in his compositions.',
        },
      },
      {
        id: '4',
        icon: '💔',
        text: {
          pt: 'Sua paixão tardia por Kamila Stösslová inspirou suas últimas obras-primas.',
          en: 'His late passion for Kamila Stösslová inspired his last masterpieces.',
        },
      },
    ],
    'Guillaume de Machaut': [
      {
        id: '1',
        icon: '⛪',
        text: {
          pt: 'Compôs a primeira missa polifônica completa da história.',
          en: 'Composed the first complete polyphonic mass in history.',
        },
      },
      {
        id: '2',
        icon: '📚',
        text: {
          pt: 'Foi também poeta e uma das principais figuras da literatura medieval francesa.',
          en: 'Was also a poet and one of the main figures of French medieval literature.',
        },
      },
      {
        id: '3',
        icon: '🎵',
        text: {
          pt: 'Desenvolveu formas musicais que influenciaram compositores por séculos.',
          en: 'Developed musical forms that influenced composers for centuries.',
        },
      },
      {
        id: '4',
        icon: '🏰',
        text: {
          pt: 'Viveu durante a Guerra dos Cem Anos e serviu a vários nobres franceses.',
          en: "Lived during the Hundred Years' War and served various French nobles.",
        },
      },
    ],
    'Alban Berg': [
      {
        id: '1',
        icon: '🎭',
        text: {
          pt: 'Sua ópera "Wozzeck" é considerada uma das maiores do século XX.',
          en: 'His opera "Wozzeck" is considered one of the greatest of the 20th century.',
        },
      },
      {
        id: '2',
        icon: '🔢',
        text: {
          pt: 'Usou códigos numéricos em suas obras, especialmente relacionados a datas importantes.',
          en: 'Used numerical codes in his works, especially related to important dates.',
        },
      },
      {
        id: '3',
        icon: '🎓',
        text: {
          pt: 'Foi aluno de Schoenberg e membro da "Segunda Escola de Viena".',
          en: 'Was a student of Schoenberg and member of the "Second Viennese School".',
        },
      },
      {
        id: '4',
        icon: '💀',
        text: {
          pt: 'Morreu jovem, deixando sua segunda ópera "Lulu" inacabada.',
          en: 'Died young, leaving his second opera "Lulu" unfinished.',
        },
      },
    ],
    'Alexander Borodin': [
      {
        id: '1',
        icon: '🔬',
        text: {
          pt: 'Era químico profissional e compunha música nas horas vagas.',
          en: 'Was a professional chemist and composed music in his spare time.',
        },
      },
      {
        id: '2',
        icon: '🇷🇺',
        text: {
          pt: 'Membro do "Grupo dos Cinco" compositores nacionalistas russos.',
          en: 'Member of "The Five" Russian nationalist composers.',
        },
      },
      {
        id: '3',
        icon: '🎭',
        text: {
          pt: 'Sua ópera "Príncipe Igor" contém as famosas "Danças Polovtsianas".',
          en: 'His opera "Prince Igor" contains the famous "Polovtsian Dances".',
        },
      },
      {
        id: '4',
        icon: '📚',
        text: {
          pt: 'Descobriu a reação Aldol na química, que leva seu nome.',
          en: 'Discovered the Aldol reaction in chemistry, which bears his name.',
        },
      },
    ],
    'Vincenzo Bellini': [
      {
        id: '1',
        icon: '🎵',
        text: {
          pt: 'Era mestre do bel canto, criando melodias de beleza incomparável.',
          en: 'Was a master of bel canto, creating melodies of incomparable beauty.',
        },
      },
      {
        id: '2',
        icon: '🌙',
        text: {
          pt: 'Sua ária "Casta diva" de "Norma" é uma das mais desafiadoras do repertório.',
          en: 'His aria "Casta diva" from "Norma" is one of the most challenging in the repertoire.',
        },
      },
      {
        id: '3',
        icon: '💀',
        text: {
          pt: 'Morreu aos 33 anos em Paris, no auge de sua carreira.',
          en: 'Died at 33 in Paris, at the height of his career.',
        },
      },
      {
        id: '4',
        icon: '🇮🇹',
        text: {
          pt: 'Influenciou profundamente Chopin e outros compositores românticos.',
          en: 'Profoundly influenced Chopin and other Romantic composers.',
        },
      },
    ],
    'Charles Gounod': [
      {
        id: '1',
        icon: '😈',
        text: {
          pt: 'Sua ópera "Fausto" foi uma das mais populares do século XIX.',
          en: 'His opera "Faust" was one of the most popular of the 19th century.',
        },
      },
      {
        id: '2',
        icon: '🙏',
        text: {
          pt: 'Compôs a famosa "Ave Maria" baseada em um prelúdio de Bach.',
          en: 'Composed the famous "Ave Maria" based on a Bach prelude.',
        },
      },
      {
        id: '3',
        icon: '⛪',
        text: {
          pt: 'Quase se tornou padre antes de se dedicar completamente à música.',
          en: 'Almost became a priest before dedicating himself completely to music.',
        },
      },
      {
        id: '4',
        icon: '🇫🇷',
        text: {
          pt: 'Representou o estilo operístico francês em sua forma mais refinada.',
          en: 'Represented French operatic style in its most refined form.',
        },
      },
    ],
    'Jules Massenet': [
      {
        id: '1',
        icon: '💔',
        text: {
          pt: 'Suas óperas "Manon" e "Werther" são marcos do romantismo francês.',
          en: 'His operas "Manon" and "Werther" are landmarks of French romanticism.',
        },
      },
      {
        id: '2',
        icon: '🎓',
        text: {
          pt: 'Foi professor no Conservatório de Paris por mais de 30 anos.',
          en: 'Was professor at the Paris Conservatory for over 30 years.',
        },
      },
      {
        id: '3',
        icon: '🎭',
        text: {
          pt: 'Especializou-se em criar personagens femininas complexas e cativantes.',
          en: 'Specialized in creating complex and captivating female characters.',
        },
      },
      {
        id: '4',
        icon: '🏆',
        text: {
          pt: 'Foi um dos compositores de ópera mais bem-sucedidos de sua época.',
          en: 'Was one of the most successful opera composers of his time.',
        },
      },
    ],
    'Francis Poulenc': [
      {
        id: '1',
        icon: '🎪',
        text: {
          pt: 'Membro do grupo "Les Six" que revolucionou a música francesa.',
          en: 'Member of the "Les Six" group that revolutionized French music.',
        },
      },
      {
        id: '2',
        icon: '🎭',
        text: {
          pt: 'Combinou elementos populares com sofisticação musical em suas obras.',
          en: 'Combined popular elements with musical sophistication in his works.',
        },
      },
      {
        id: '3',
        icon: '⛪',
        text: {
          pt: 'Teve uma conversão religiosa que inspirou suas obras sacras tardias.',
          en: 'Had a religious conversion that inspired his late sacred works.',
        },
      },
      {
        id: '4',
        icon: '🎹',
        text: {
          pt: 'Era também pianista acompanhador de grandes cantores de sua época.',
          en: 'Was also an accompanist pianist for great singers of his time.',
        },
      },
    ],
    'Giovanni Gabrieli': [
      {
        id: '1',
        icon: '🏛️',
        text: {
          pt: 'Desenvolveu o estilo policoral em São Marcos, Veneza.',
          en: "Developed the polychoral style at St. Mark's, Venice.",
        },
      },
      {
        id: '2',
        icon: '🎺',
        text: {
          pt: 'Foi pioneiro na escrita idiomática para instrumentos de sopro.',
          en: 'Was a pioneer in idiomatic writing for wind instruments.',
        },
      },
      {
        id: '3',
        icon: '🎵',
        text: {
          pt: 'Suas "Sacrae Symphoniae" revolucionaram a música instrumental.',
          en: 'His "Sacrae Symphoniae" revolutionized instrumental music.',
        },
      },
      {
        id: '4',
        icon: '👨‍🎓',
        text: {
          pt: 'Seus alunos incluíam Heinrich Schütz, que levou seu estilo para a Alemanha.',
          en: 'His students included Heinrich Schütz, who brought his style to Germany.',
        },
      },
    ],
    Pérotin: [
      {
        id: '1',
        icon: '⛪',
        text: {
          pt: 'Desenvolveu a polifonia na Escola de Notre-Dame em Paris.',
          en: 'Developed polyphony at the Notre-Dame School in Paris.',
        },
      },
      {
        id: '2',
        icon: '🎵',
        text: {
          pt: 'Criou os primeiros exemplos de música a quatro vozes da história.',
          en: 'Created the first examples of four-voice music in history.',
        },
      },
      {
        id: '3',
        icon: '🏗️',
        text: {
          pt: 'Sua música reflete a arquitetura gótica de Notre-Dame.',
          en: 'His music reflects the Gothic architecture of Notre-Dame.',
        },
      },
      {
        id: '4',
        icon: '📜',
        text: {
          pt: 'Seus organa são marcos da música medieval europeia.',
          en: 'His organa are landmarks of European medieval music.',
        },
      },
    ],
    'Heinrich Schütz': [
      {
        id: '1',
        icon: '🇩🇪',
        text: {
          pt: 'É considerado o maior compositor alemão antes de Bach.',
          en: 'Is considered the greatest German composer before Bach.',
        },
      },
      {
        id: '2',
        icon: '🇮🇹',
        text: {
          pt: 'Estudou com Giovanni Gabrieli em Veneza.',
          en: 'Studied with Giovanni Gabrieli in Venice.',
        },
      },
      {
        id: '3',
        icon: '⚔️',
        text: {
          pt: 'Viveu durante a Guerra dos Trinta Anos, que influenciou suas obras.',
          en: "Lived during the Thirty Years' War, which influenced his works.",
        },
      },
      {
        id: '4',
        icon: '🎼',
        text: {
          pt: 'Estabeleceu as bases da música sacra protestante alemã.',
          en: 'Established the foundations of German Protestant sacred music.',
        },
      },
    ],
    'John Cage': [
      {
        id: '1',
        icon: '🤫',
        text: {
          pt: 'Sua peça "4\'33"" consiste inteiramente de silêncio.',
          en: 'His piece "4\'33"" consists entirely of silence.',
        },
      },
      {
        id: '2',
        icon: '🎲',
        text: {
          pt: 'Usava o I Ching para determinar elementos aleatórios em suas composições.',
          en: 'Used the I Ching to determine random elements in his compositions.',
        },
      },
      {
        id: '3',
        icon: '🎹',
        text: {
          pt: 'Inventou o "piano preparado", colocando objetos entre as cordas.',
          en: 'Invented the "prepared piano", placing objects between the strings.',
        },
      },
      {
        id: '4',
        icon: '🧘',
        text: {
          pt: 'Era praticante de zen-budismo, que influenciou profundamente sua estética.',
          en: 'Was a practitioner of Zen Buddhism, which profoundly influenced his aesthetics.',
        },
      },
    ],
    'Giovanni Battista Pergolesi': [
      {
        id: '1',
        icon: '😂',
        text: {
          pt: 'Sua ópera cômica "La serva padrona" revolucionou o gênero.',
          en: 'His comic opera "La serva padrona" revolutionized the genre.',
        },
      },
      {
        id: '2',
        icon: '💀',
        text: {
          pt: 'Morreu aos 26 anos de tuberculose, mas deixou obras imortais.',
          en: 'Died at 26 from tuberculosis, but left immortal works.',
        },
      },
      {
        id: '3',
        icon: '⛪',
        text: {
          pt: 'Seu "Stabat Mater" é uma das mais belas obras sacras do século XVIII.',
          en: 'His "Stabat Mater" is one of the most beautiful sacred works of the 18th century.',
        },
      },
      {
        id: '4',
        icon: '🇮🇹',
        text: {
          pt: 'Influenciou o desenvolvimento da ópera buffa italiana.',
          en: 'Influenced the development of Italian opera buffa.',
        },
      },
    ],
    'John Dowland': [
      {
        id: '1',
        icon: '🎸',
        text: {
          pt: 'Foi o maior compositor para alaúde da história.',
          en: 'Was the greatest lute composer in history.',
        },
      },
      {
        id: '2',
        icon: '😢',
        text: {
          pt: 'Suas canções melancólicas como "Flow My Tears" definiram uma época.',
          en: 'His melancholic songs like "Flow My Tears" defined an era.',
        },
      },
      {
        id: '3',
        icon: '🌍',
        text: {
          pt: 'Viajou por toda a Europa, servindo em várias cortes.',
          en: 'Traveled throughout Europe, serving at various courts.',
        },
      },
      {
        id: '4',
        icon: '🎵',
        text: {
          pt: 'Suas "Lachrimae" influenciaram compositores por gerações.',
          en: 'His "Lachrimae" influenced composers for generations.',
        },
      },
    ],
    'Gustav Holst': [
      {
        id: '1',
        icon: '🪐',
        text: {
          pt: 'Sua suíte "Os Planetas" é uma das obras orquestrais mais populares.',
          en: 'His suite "The Planets" is one of the most popular orchestral works.',
        },
      },
      {
        id: '2',
        icon: '🏫',
        text: {
          pt: "Foi professor na St. Paul's Girls' School por quase 30 anos.",
          en: "Was teacher at St. Paul's Girls' School for almost 30 years.",
        },
      },
      {
        id: '3',
        icon: '🇮🇳',
        text: {
          pt: 'Interessou-se pela filosofia hindu e música indiana.',
          en: 'Became interested in Hindu philosophy and Indian music.',
        },
      },
      {
        id: '4',
        icon: '🎼',
        text: {
          pt: 'Marte, de "Os Planetas", influenciou muitas trilhas sonoras de filmes.',
          en: 'Mars, from "The Planets", influenced many film soundtracks.',
        },
      },
    ],
    'Dietrich Buxtehude': [
      {
        id: '1',
        icon: '🎹',
        text: {
          pt: 'Seus concertos de órgão em Lübeck atraíam músicos de toda a Europa.',
          en: 'His organ concerts in Lübeck attracted musicians from all over Europe.',
        },
      },
      {
        id: '2',
        icon: '🚶‍♂️',
        text: {
          pt: 'Bach caminhou 400 km para ouvi-lo tocar.',
          en: 'Bach walked 400 km to hear him play.',
        },
      },
      {
        id: '3',
        icon: '🎭',
        text: {
          pt: 'Criou os "Abendmusiken", concertos sacros noturnos muito populares.',
          en: 'Created the "Abendmusiken", very popular evening sacred concerts.',
        },
      },
      {
        id: '4',
        icon: '🎶',
        text: {
          pt: 'Influenciou profundamente o estilo de Bach e outros compositores barrocos.',
          en: 'Profoundly influenced the style of Bach and other Baroque composers.',
        },
      },
    ],
    'Ottorino Respighi': [
      {
        id: '1',
        icon: '🌲',
        text: {
          pt: 'Sua trilogia sinfônica "Pinheiros de Roma", "Fontes de Roma" e "Festivais Romanos" evoca a cidade eterna.',
          en: 'His symphonic trilogy "Pines of Rome", "Fountains of Rome" and "Roman Festivals" evokes the eternal city.',
        },
      },
      {
        id: '2',
        icon: '🐦',
        text: {
          pt: 'Incluiu gravações reais de cantos de pássaros em "Pinheiros de Roma".',
          en: 'Included real recordings of bird songs in "Pines of Rome".',
        },
      },
      {
        id: '3',
        icon: '🎻',
        text: {
          pt: 'Estudou com Rimsky-Korsakov em São Petersburgo.',
          en: 'Studied with Rimsky-Korsakov in St. Petersburg.',
        },
      },
      {
        id: '4',
        icon: '🇮🇹',
        text: {
          pt: 'Representou o neoclassicismo italiano do início do século XX.',
          en: 'Represented Italian neoclassicism of the early 20th century.',
        },
      },
    ],
    'Guillaume Dufay': [
      {
        id: '1',
        icon: '⛪',
        text: {
          pt: 'Compôs música para a consagração da cúpula de Santa Maria del Fiore em Florença.',
          en: 'Composed music for the consecration of the dome of Santa Maria del Fiore in Florence.',
        },
      },
      {
        id: '2',
        icon: '🎵',
        text: {
          pt: 'Desenvolveu técnicas que definiram a música renascentista.',
          en: 'Developed techniques that defined Renaissance music.',
        },
      },
      {
        id: '3',
        icon: '🌍',
        text: {
          pt: 'Viajou por toda a Europa, influenciando a música de sua época.',
          en: 'Traveled throughout Europe, influencing the music of his time.',
        },
      },
      {
        id: '4',
        icon: '📜',
        text: {
          pt: 'Suas missas e motetos estabeleceram padrões para gerações futuras.',
          en: 'His masses and motets established standards for future generations.',
        },
      },
    ],
    'Hugo Wolf': [
      {
        id: '1',
        icon: '🎵',
        text: {
          pt: 'Compôs mais de 300 lieders, revolucionando a canção artística alemã.',
          en: 'Composed over 300 lieder, revolutionizing the German art song.',
        },
      },
      {
        id: '2',
        icon: '📚',
        text: {
          pt: 'Suas canções baseadas em poemas de Goethe e Mörike são obras-primas.',
          en: 'His songs based on poems by Goethe and Mörike are masterpieces.',
        },
      },
      {
        id: '3',
        icon: '🧠',
        text: {
          pt: 'Sofreu de transtorno bipolar, que afetava drasticamente sua produtividade.',
          en: 'Suffered from bipolar disorder, which drastically affected his productivity.',
        },
      },
      {
        id: '4',
        icon: '🎭',
        text: {
          pt: 'Era crítico musical feroz, atacando Brahms mas defendendo Wagner.',
          en: 'Was a fierce music critic, attacking Brahms but defending Wagner.',
        },
      },
    ],
    'Carl Nielsen': [
      {
        id: '1',
        icon: '🇩🇰',
        text: {
          pt: 'É o compositor nacional da Dinamarca, com suas sinfonias sendo marcos.',
          en: "Is Denmark's national composer, with his symphonies being landmarks.",
        },
      },
      {
        id: '2',
        icon: '🎺',
        text: {
          pt: 'Sua Sinfonia nº 4 "Inextinguível" retrata a força vital da humanidade.',
          en: 'His Symphony No. 4 "Inextinguishable" portrays humanity\'s vital force.',
        },
      },
      {
        id: '3',
        icon: '🎼',
        text: {
          pt: 'Desenvolveu um estilo harmônico progressivo único.',
          en: 'Developed a unique progressive harmonic style.',
        },
      },
      {
        id: '4',
        icon: '🎭',
        text: {
          pt: 'Suas óperas "Saul e Davi" e "Maskarade" são clássicos dinamarqueses.',
          en: 'His operas "Saul and David" and "Maskarade" are Danish classics.',
        },
      },
    ],
    'William Walton': [
      {
        id: '1',
        icon: '🎬',
        text: {
          pt: 'Compôs trilhas sonoras para filmes shakespearianos famosos.',
          en: 'Composed soundtracks for famous Shakespearean films.',
        },
      },
      {
        id: '2',
        icon: '👑',
        text: {
          pt: 'Sua marcha "Crown Imperial" foi usada na coroação de Jorge VI.',
          en: 'His march "Crown Imperial" was used at the coronation of George VI.',
        },
      },
      {
        id: '3',
        icon: '🎻',
        text: {
          pt: 'Seu Concerto para Viola é considerado um dos melhores do repertório.',
          en: 'His Viola Concerto is considered one of the best in the repertoire.',
        },
      },
      {
        id: '4',
        icon: '🎭',
        text: {
          pt: 'Seu "Façade" combina poesia de Edith Sitwell com música experimental.',
          en: 'His "Façade" combines Edith Sitwell\'s poetry with experimental music.',
        },
      },
    ],
    'Darius Milhaud': [
      {
        id: '1',
        icon: '🎪',
        text: {
          pt: 'Membro do grupo "Les Six" e compositor extremamente prolífico.',
          en: 'Member of the "Les Six" group and extremely prolific composer.',
        },
      },
      {
        id: '2',
        icon: '🎵',
        text: {
          pt: 'Experimentou com politonalidade, usando várias tonalidades simultâneas.',
          en: 'Experimented with polytonality, using several simultaneous keys.',
        },
      },
      {
        id: '3',
        icon: '🌎',
        text: {
          pt: 'Incorporou elementos de jazz e música latina brasileira em suas obras.',
          en: 'Incorporated elements of jazz and Brazilian Latin music in his works.',
        },
      },
      {
        id: '4',
        icon: '🎓',
        text: {
          pt: 'Ensinou composição na França e nos Estados Unidos.',
          en: 'Taught composition in France and the United States.',
        },
      },
    ],
    'Orlando Gibbons': [
      {
        id: '1',
        icon: '👑',
        text: {
          pt: 'Foi organista da Capela Real inglesa e da Abadia de Westminster.',
          en: 'Was organist of the English Chapel Royal and Westminster Abbey.',
        },
      },
      {
        id: '2',
        icon: '🎹',
        text: {
          pt: 'Suas "Fantasias" para virginal são obras-primas da música elizabetana.',
          en: 'His "Fantasias" for virginal are masterpieces of Elizabethan music.',
        },
      },
      {
        id: '3',
        icon: '⛪',
        text: {
          pt: 'Compôs alguns dos mais belos anthems da música sacra inglesa.',
          en: 'Composed some of the most beautiful anthems in English sacred music.',
        },
      },
      {
        id: '4',
        icon: '💀',
        text: {
          pt: 'Morreu subitamente aos 41 anos durante uma viagem real.',
          en: 'Died suddenly at 41 during a royal journey.',
        },
      },
    ],
    'Giacomo Meyerbeer': [
      {
        id: '1',
        icon: '🎭',
        text: {
          pt: 'Dominou a ópera francesa com espetáculos grandiosos como "Os Huguenotes".',
          en: 'Dominated French opera with grand spectacles like "Les Huguenots".',
        },
      },
      {
        id: '2',
        icon: '💰',
        text: {
          pt: 'Era extremamente rico e podia financiar suas próprias produções operísticas.',
          en: 'Was extremely wealthy and could finance his own operatic productions.',
        },
      },
      {
        id: '3',
        icon: '🌍',
        text: {
          pt: 'Suas óperas foram as mais populares da Europa em meados do século XIX.',
          en: 'His operas were the most popular in Europe in the mid-19th century.',
        },
      },
      {
        id: '4',
        icon: '🎯',
        text: {
          pt: 'Influenciou Wagner, que depois o criticou publicamente.',
          en: 'Influenced Wagner, who later criticized him publicly.',
        },
      },
    ],
    'Samuel Barber': [
      {
        id: '1',
        icon: '😢',
        text: {
          pt: 'Seu "Adagio para Cordas" é uma das peças mais emocionantes da música americana.',
          en: 'His "Adagio for Strings" is one of the most moving pieces in American music.',
        },
      },
      {
        id: '2',
        icon: '🎭',
        text: {
          pt: 'Sua ópera "Vanessa" ganhou o Prêmio Pulitzer.',
          en: 'His opera "Vanessa" won the Pulitzer Prize.',
        },
      },
      {
        id: '3',
        icon: '🎵',
        text: {
          pt: 'Manteve um estilo tonal romântico numa época de experimentação.',
          en: 'Maintained a romantic tonal style in an era of experimentation.',
        },
      },
      {
        id: '4',
        icon: '🏆',
        text: {
          pt: 'Foi um dos compositores americanos mais premiados do século XX.',
          en: 'Was one of the most awarded American composers of the 20th century.',
        },
      },
    ],
    'Tomás Luis de Victoria': [
      {
        id: '1',
        icon: '⛪',
        text: {
          pt: 'É considerado o maior compositor espanhol do Renascimento.',
          en: 'Is considered the greatest Spanish composer of the Renaissance.',
        },
      },
      {
        id: '2',
        icon: '🇮🇹',
        text: {
          pt: 'Estudou em Roma e foi influenciado por Palestrina.',
          en: 'Studied in Rome and was influenced by Palestrina.',
        },
      },
      {
        id: '3',
        icon: '👑',
        text: {
          pt: 'Serviu na corte das infantas espanholas em Madrid.',
          en: 'Served at the court of the Spanish infantas in Madrid.',
        },
      },
      {
        id: '4',
        icon: '🎵',
        text: {
          pt: 'Suas obras sacras combinam fervor religioso com perfeição técnica.',
          en: 'His sacred works combine religious fervor with technical perfection.',
        },
      },
    ],
    Léonin: [
      {
        id: '1',
        icon: '⛪',
        text: {
          pt: 'Foi um dos primeiros compositores conhecidos da Escola de Notre-Dame.',
          en: 'Was one of the first known composers of the Notre-Dame School.',
        },
      },
      {
        id: '2',
        icon: '📚',
        text: {
          pt: 'Criou o "Magnus Liber Organi", coleção fundamental da polifonia medieval.',
          en: 'Created the "Magnus Liber Organi", fundamental collection of medieval polyphony.',
        },
      },
      {
        id: '3',
        icon: '🎵',
        text: {
          pt: 'Desenvolveu o organum, forma primitiva da polifonia.',
          en: 'Developed organum, primitive form of polyphony.',
        },
      },
      {
        id: '4',
        icon: '🏗️',
        text: {
          pt: 'Sua música reflete a construção da catedral gótica de Notre-Dame.',
          en: 'His music reflects the construction of the Gothic cathedral of Notre-Dame.',
        },
      },
    ],
    'Manuel de Falla': [
      {
        id: '1',
        icon: '💃',
        text: {
          pt: 'Suas obras capturam perfeitamente o espírito do flamenco andaluz.',
          en: 'His works perfectly capture the spirit of Andalusian flamenco.',
        },
      },
      {
        id: '2',
        icon: '🇪🇸',
        text: {
          pt: '"Noches en los jardines de España" evoca as paisagens espanholas.',
          en: '"Nights in the Gardens of Spain" evokes Spanish landscapes.',
        },
      },
      {
        id: '3',
        icon: '🎭',
        text: {
          pt: 'Seu balé "El sombrero de tres picos" é um clássico espanhol.',
          en: 'His ballet "The Three-Cornered Hat" is a Spanish classic.',
        },
      },
      {
        id: '4',
        icon: '🎹',
        text: {
          pt: 'Foi amigo de Debussy e Ravel em Paris.',
          en: 'Was a friend of Debussy and Ravel in Paris.',
        },
      },
    ],
    'Hildegard von Bingen': [
      {
        id: '1',
        icon: '👩‍⚕️',
        text: {
          pt: 'Foi abadessa, mística, médica e compositora na Alemanha medieval.',
          en: 'Was abbess, mystic, physician and composer in medieval Germany.',
        },
      },
      {
        id: '2',
        icon: '👁️',
        text: {
          pt: 'Dizia receber suas composições através de visões divinas.',
          en: 'Claimed to receive her compositions through divine visions.',
        },
      },
      {
        id: '3',
        icon: '🎵',
        text: {
          pt: 'Suas melodias gregorianas são únicas em beleza e expressividade.',
          en: 'Her Gregorian melodies are unique in beauty and expressiveness.',
        },
      },
      {
        id: '4',
        icon: '📚',
        text: {
          pt: 'Escreveu tratados sobre medicina, teologia e ciências naturais.',
          en: 'Wrote treatises on medicine, theology and natural sciences.',
        },
      },
    ],
    'Mikhail Glinka': [
      {
        id: '1',
        icon: '🇷🇺',
        text: {
          pt: 'É considerado o pai da música clássica russa.',
          en: 'Is considered the father of Russian classical music.',
        },
      },
      {
        id: '2',
        icon: '🎭',
        text: {
          pt: 'Sua ópera "Uma Vida pelo Czar" foi a primeira ópera russa importante.',
          en: 'His opera "A Life for the Tsar" was the first important Russian opera.',
        },
      },
      {
        id: '3',
        icon: '🎼',
        text: {
          pt: 'Influenciou todo o desenvolvimento posterior da música russa.',
          en: 'Influenced all subsequent development of Russian music.',
        },
      },
      {
        id: '4',
        icon: '🌍',
        text: {
          pt: 'Combinou elementos folclóricos russos com técnicas europeias.',
          en: 'Combined Russian folk elements with European techniques.',
        },
      },
    ],
    'Alexander Glazunov': [
      {
        id: '1',
        icon: '🩰',
        text: {
          pt: 'Compôs o balé "As Estações" e completou "Príncipe Igor" de Borodin.',
          en: 'Composed the ballet "The Seasons" and completed Borodin\'s "Prince Igor".',
        },
      },
      {
        id: '2',
        icon: '🎻',
        text: {
          pt: 'Seu Concerto para Violino é um dos mais populares do repertório.',
          en: 'His Violin Concerto is one of the most popular in the repertoire.',
        },
      },
      {
        id: '3',
        icon: '🎓',
        text: {
          pt: 'Foi diretor do Conservatório de São Petersburgo por décadas.',
          en: 'Was director of the St. Petersburg Conservatory for decades.',
        },
      },
      {
        id: '4',
        icon: '🧠',
        text: {
          pt: 'Tinha memória musical extraordinária e podia escrever obras inteiras de cor.',
          en: 'Had extraordinary musical memory and could write entire works from memory.',
        },
      },
    ],
    'Don Carlo Gesualdo': [
      {
        id: '1',
        icon: '🔪',
        text: {
          pt: 'Assassinou sua esposa e o amante dela, vivendo atormentado pela culpa.',
          en: 'Murdered his wife and her lover, living tormented by guilt.',
        },
      },
      {
        id: '2',
        icon: '🎵',
        text: {
          pt: 'Suas harmonias cromáticas eram séculos à frente de seu tempo.',
          en: 'His chromatic harmonies were centuries ahead of their time.',
        },
      },
      {
        id: '3',
        icon: '😈',
        text: {
          pt: 'Seus madrigais expressam tormento psicológico através de dissonâncias ousadas.',
          en: 'His madrigals express psychological torment through bold dissonances.',
        },
      },
      {
        id: '4',
        icon: '🏰',
        text: {
          pt: 'Era príncipe de Venosa e aristocrata italiano do Renascimento tardio.',
          en: 'Was Prince of Venosa and an Italian aristocrat of the late Renaissance.',
        },
      },
    ],
    'Richard Strauss': [
      {
        id: '1',
        icon: '🌅',
        text: {
          pt: 'Seu "Also sprach Zarathustra" foi usado no filme "2001: Uma Odisseia no Espaço".',
          en: 'His "Also sprach Zarathustra" was used in the film "2001: A Space Odyssey".',
        },
      },
      {
        id: '2',
        icon: '🎭',
        text: {
          pt: 'Compôs "Der Rosenkavalier", uma das óperas mais populares do século XX.',
          en: 'Composed "Der Rosenkavalier", one of the most popular operas of the 20th century.',
        },
      },
      {
        id: '3',
        icon: '🎺',
        text: {
          pt: 'Seus poemas sinfônicos revolucionaram a música orquestral.',
          en: 'His symphonic poems revolutionized orchestral music.',
        },
      },
      {
        id: '4',
        icon: '💰',
        text: {
          pt: 'Foi um dos primeiros compositores a ganhar muito dinheiro com direitos autorais.',
          en: 'Was one of the first composers to make a lot of money from copyright.',
        },
      },
    ],
    'Philip Glass': [
      {
        id: '1',
        icon: '🔄',
        text: {
          pt: 'Pioneiro do minimalismo, usando repetição e mudanças graduais.',
          en: 'Pioneer of minimalism, using repetition and gradual changes.',
        },
      },
      {
        id: '2',
        icon: '🎬',
        text: {
          pt: 'Compôs trilhas para filmes como "Koyaanisqatsi" e "The Hours".',
          en: 'Composed soundtracks for films like "Koyaanisqatsi" and "The Hours".',
        },
      },
      {
        id: '3',
        icon: '🚕',
        text: {
          pt: 'Trabalhou como taxista em Nova York para sustentar sua carreira musical.',
          en: 'Worked as a taxi driver in New York to support his musical career.',
        },
      },
      {
        id: '4',
        icon: '🎭',
        text: {
          pt: 'Sua ópera "Einstein on the Beach" dura 4 horas e meio sem intervalo.',
          en: 'His opera "Einstein on the Beach" lasts 4 and a half hours without intermission.',
        },
      },
    ],
    'Ennio Morricone': [
      {
        id: '1',
        icon: '🤠',
        text: {
          pt: 'Compôs a trilha icônica de "The Good, the Bad and the Ugly".',
          en: 'Composed the iconic soundtrack for "The Good, the Bad and the Ugly".',
        },
      },
      {
        id: '2',
        icon: '🏆',
        text: {
          pt: 'Recebeu um Oscar honorário em 2007 e ganhou outro em 2016 por "The Hateful Eight".',
          en: 'Received an honorary Oscar in 2007 and won another in 2016 for "The Hateful Eight".',
        },
      },
      {
        id: '3',
        icon: '🎬',
        text: {
          pt: 'Compôs mais de 400 trilhas sonoras para cinema e TV.',
          en: 'Composed over 400 soundtracks for film and TV.',
        },
      },
      {
        id: '4',
        icon: '🎺',
        text: {
          pt: 'Usava sons não-convencionais como assobios, chicotes e harmônicas em suas trilhas.',
          en: 'Used unconventional sounds like whistles, whips and harmonicas in his soundtracks.',
        },
      },
    ],
  };

  return (
    curiositiesMap[composerName] || [
      {
        id: '1',
        icon: '🎵',
        text: {
          pt: 'Um dos grandes mestres da música clássica.',
          en: 'One of the great masters of classical music.',
        },
      },
      {
        id: '2',
        icon: '🎼',
        text: {
          pt: 'Suas obras continuam inspirando músicos até hoje.',
          en: 'His works continue to inspire musicians to this day.',
        },
      },
      {
        id: '3',
        icon: '⭐',
        text: {
          pt: 'Deixou um legado duradouro na história da música.',
          en: 'Left a lasting legacy in music history.',
        },
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
    category: 'Renaissance',
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
    category: 'Renaissance',
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
    category: 'Renaissance',
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
    category: 'Renaissance',
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
    category: 'Renaissance',
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
    category: 'Renaissance',
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
    category: 'Renaissance',
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
    category: 'Renaissance',
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
    category: 'Renaissance',
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
    category: 'Renaissance',
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
    category: 'Renaissance',
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
    category: 'Renaissance',
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
    category: 'Renaissance',
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
    category: 'Renaissance',
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
    category: 'Renaissance',
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
    category: 'Renaissance',
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
    category: 'Renaissance',
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
    category: 'Renaissance',
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
    category: 'Renaissance',
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
    category: 'Renaissance',
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
    category: 'Renaissance',
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
    category: 'Renaissance',
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
    category: 'Renaissance',
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
    category: 'Renaissance',
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
    category: 'Renaissance',
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
    category: 'Baroque',
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
    category: 'Baroque',
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
    category: 'Baroque',
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
    category: 'Baroque',
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
    category: 'Baroque',
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
    category: 'Baroque',
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
    category: 'Baroque',
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
    category: 'Baroque',
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
    category: 'Baroque',
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
    category: 'Baroque',
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
    category: 'Baroque',
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
    category: 'Baroque',
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
    category: 'Baroque',
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
    category: 'Baroque',
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
    category: 'Baroque',
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
    category: 'Baroque',
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
    category: 'Baroque',
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
    category: 'Baroque',
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
    category: 'Baroque',
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
    category: 'Baroque',
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
    category: 'Baroque',
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
    category: 'Baroque',
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
    category: 'Baroque',
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
    category: 'Baroque',
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
    category: 'Baroque',
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
    category: 'Baroque',
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
    category: 'Baroque',
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
    category: 'Baroque',
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
    category: 'Baroque',
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
    category: 'Baroque',
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
    category: 'Baroque',
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
    category: 'Baroque',
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
    category: 'Baroque',
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
    category: 'Baroque',
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
    category: 'Baroque',
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
    category: 'Baroque',
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
    category: 'Baroque',
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
    category: 'Baroque',
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
    category: 'Baroque',
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
    category: 'Baroque',
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
    category: 'Baroque',
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
    category: 'Baroque',
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
    category: 'Baroque',
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
    category: 'Baroque',
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
    category: 'Baroque',
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
    category: 'Baroque',
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
    category: 'Baroque',
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
    category: 'Baroque',
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
    category: 'Baroque',
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
    category: 'Baroque',
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
    category: 'Classical',
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
    category: 'Classical',
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
    category: 'Classical',
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
    category: 'Classical',
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
    category: 'Classical',
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
    category: 'Classical',
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
    category: 'Classical',
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
    category: 'Classical',
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
    category: 'Classical',
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
    category: 'Classical',
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
    category: 'Classical',
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
    category: 'Classical',
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
    category: 'Classical',
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
    category: 'Classical',
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
    category: 'Classical',
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
    category: 'Classical',
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
    category: 'Classical',
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
    category: 'Classical',
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
    category: 'Classical',
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
    category: 'Classical',
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
    category: 'Classical',
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
    category: 'Classical',
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
    category: 'Classical',
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
    category: 'Classical',
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
    category: 'Classical',
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
    category: 'Classical',
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
    category: 'Classical',
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
    category: 'Classical',
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
    category: 'Classical',
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
    category: 'Classical',
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
    category: 'Classical',
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
    category: 'Classical',
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
    category: 'Classical',
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
    category: 'Classical',
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
    category: 'Classical',
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
    category: 'Classical',
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
    category: 'Classical',
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
    category: 'Classical',
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
    category: 'Classical',
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
    category: 'Classical',
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
    category: 'Classical',
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
    category: 'Classical',
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
    category: 'Classical',
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
    category: 'Classical',
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
    category: 'Classical',
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
    category: 'Classical',
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
    category: 'Classical',
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
    category: 'Classical',
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
    category: 'Classical',
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
    category: 'Classical',
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
    category: 'Romantic',
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
    category: 'Romantic',
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
    category: 'Romantic',
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
    category: 'Romantic',
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
    category: 'Romantic',
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
    category: 'Romantic',
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
    category: 'Romantic',
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
    category: 'Romantic',
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
    category: 'Romantic',
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
    category: 'Romantic',
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
    category: 'Romantic',
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
    category: 'Romantic',
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
    category: 'Romantic',
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
    category: 'Romantic',
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
    category: 'Romantic',
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
    category: 'Romantic',
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
    category: 'Romantic',
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
    category: 'Romantic',
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
    category: 'Romantic',
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
    category: 'Romantic',
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
    category: 'Romantic',
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
    category: 'Romantic',
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
    category: 'Romantic',
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
    category: 'Romantic',
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
    category: 'Romantic',
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
    category: 'Romantic',
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
    category: 'Romantic',
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
    category: 'Romantic',
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
    category: 'Romantic',
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
    category: 'Romantic',
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
    category: 'Romantic',
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
    category: 'Romantic',
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
    category: 'Romantic',
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
    category: 'Romantic',
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
    category: 'Romantic',
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
    category: 'Romantic',
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
    category: 'Romantic',
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
    category: 'Romantic',
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
    category: 'Romantic',
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
    category: 'Romantic',
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
    category: 'Romantic',
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
    category: 'Romantic',
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
    category: 'Romantic',
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
    category: 'Romantic',
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
    category: 'Romantic',
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
    category: 'Romantic',
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
    category: 'Romantic',
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
    category: 'Romantic',
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
    category: 'Romantic',
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
    category: 'Romantic',
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
    category: 'Impressionism',
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
    category: 'Impressionism',
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
    category: 'Impressionism',
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
    category: 'Impressionism',
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
    category: 'Impressionism',
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
    category: 'Impressionism',
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
    category: 'Impressionism',
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
    category: 'Impressionism',
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
    category: 'Impressionism',
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
    category: 'Impressionism',
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
    category: 'Impressionism',
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
    category: 'Impressionism',
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
    category: 'Impressionism',
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
    category: 'Impressionism',
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
    category: 'Impressionism',
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
    category: 'Impressionism',
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
    category: 'Impressionism',
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
    category: 'Impressionism',
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
    category: 'Impressionism',
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
    category: 'Impressionism',
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
    category: 'Impressionism',
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
    category: 'Impressionism',
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
    category: 'Impressionism',
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
    category: 'Impressionism',
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
    category: 'Impressionism',
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
    category: 'Modern',
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
    category: 'Modern',
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
    category: 'Modern',
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
    category: 'Modern',
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
    category: 'Modern',
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
    category: 'Modern',
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
    category: 'Modern',
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
    category: 'Modern',
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
    category: 'Modern',
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
    category: 'Modern',
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
    category: 'Modern',
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
    category: 'Modern',
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
    category: 'Modern',
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
    category: 'Modern',
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
    category: 'Modern',
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
    category: 'Modern',
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
    category: 'Modern',
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
    category: 'Modern',
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
    category: 'Modern',
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
    category: 'Modern',
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
    category: 'Modern',
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
    category: 'Modern',
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
    category: 'Modern',
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
    category: 'Modern',
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
    category: 'Modern',
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
    category: 'Modern',
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
    category: 'Modern',
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
    category: 'Modern',
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
    category: 'Modern',
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
    category: 'Modern',
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
    category: 'Modern',
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
    category: 'Modern',
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
    category: 'Modern',
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
    category: 'Modern',
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
    category: 'Modern',
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
    category: 'Modern',
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
    category: 'Modern',
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
    category: 'Modern',
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
    category: 'Modern',
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
    category: 'Modern',
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
    category: 'Modern',
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
    category: 'Modern',
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
    category: 'Modern',
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
    category: 'Modern',
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
    category: 'Modern',
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
    category: 'Modern',
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
    category: 'Modern',
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
    category: 'Modern',
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
    category: 'Modern',
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
    category: 'Modern',
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
    category: 'Theory',
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
    category: 'Theory',
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
    category: 'Theory',
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
    category: 'Theory',
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
    category: 'Theory',
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
    category: 'Theory',
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
    category: 'Theory',
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
    category: 'Theory',
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
    category: 'Theory',
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
    category: 'Theory',
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
    category: 'Theory',
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
    category: 'Theory',
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
    category: 'Theory',
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
    category: 'Theory',
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
    category: 'Theory',
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
    category: 'Theory',
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
    category: 'Theory',
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
    category: 'Theory',
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
    category: 'Theory',
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
    category: 'Theory',
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
    category: 'Theory',
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
    category: 'Theory',
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
    category: 'Theory',
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
    category: 'Theory',
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
    category: 'Future',
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
