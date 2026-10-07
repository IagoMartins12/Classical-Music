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

export {
  musicalFacts,
  getRandomFacts,
  getFactsByCategory,
  getFactsByType,
  categories,
  factTypes,
} from './musicalFacts';
