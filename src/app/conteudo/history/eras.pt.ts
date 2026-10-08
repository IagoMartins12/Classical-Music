import type { EraChapter } from './types';

export const ERAS_PT: EraChapter[] = [
  {
    key: 'medieval',
    lede: 'Quase toda a música medieval que conhecemos foi cantada em igrejas e mosteiros, porque eram eles que sabiam escrever música. Ao longo de quase mil anos, uma melodia sozinha em latim virou duas, três, quatro vozes ao mesmo tempo.',
    story: [
      'O ponto de partida é o canto gregoriano, também chamado cantochão: melodias em latim, sem acompanhamento, cantadas em uníssono pelos monges. O nome homenageia o papa Gregório I, que morreu em 604, mas a atribuição é lendária. O repertório que chegou até nós foi organizado bem depois, nos séculos VIII e IX, quando os reis carolíngios quiseram que todas as igrejas do império cantassem do mesmo jeito.',
      'Para cantar igual em lugares distantes, era preciso escrever. Os primeiros sinais, os neumas, apareceram no século IX e mostravam só o desenho da melodia: sobe, desce, ondula. Quem já sabia a música se lembrava dela olhando os sinais. Por volta de 1025, o monge Guido d’Arezzo propôs linhas horizontais para fixar a altura de cada nota e um método para ensinar a ler à primeira vista. A pauta que usamos hoje vem daí.',
      'A grande novidade dos séculos seguintes foi cantar mais de uma linha ao mesmo tempo. No começo, uma segunda voz acompanhava o canto em intervalos fixos, como uma sombra. Em Paris, por volta de 1200, os músicos da catedral de Notre-Dame, Léonin e depois Pérotin, escreveram peças em que vozes novas se movem livres e rápidas sobre notas muito longas do canto antigo. Pérotin chegou a quatro vozes, uma ousadia para a época.',
      'Fora das igrejas, havia canção de amor. Os trovadores do sul da França escreviam em occitano, os troveiros no norte em francês antigo e os Minnesänger na Alemanha. Pouca dessa música sobreviveu com a melodia anotada, e quase nada com o ritmo. Do mesmo período vem Hildegard von Bingen, abadessa alemã que compôs cantos de linhas largas e escreveu o Ordo Virtutum, um drama musical sobre virtudes e a alma.',
      'No século XIV, um tratado ligado a Philippe de Vitry deu nome a uma arte nova, a ars nova, com uma notação capaz de registrar ritmos muito mais variados. O poeta e compositor Guillaume de Machaut escreveu a Messe de Nostre Dame, a primeira missa polifônica completa que conhecemos feita por um único autor.',
    ],
    sound:
      'No canto gregoriano, ouça uma linha só, sem pulso marcado, que segue o ritmo das palavras latinas. Na polifonia que vem depois, repare que as vozes se encontram em quintas, quartas e oitavas, o que dá um som oco e luminoso. As terças, que hoje soam doces, eram tratadas como imperfeitas e quase nunca encerravam uma frase.',
    changes: [
      {
        title: 'A música passa a ser escrita',
        text: 'Dos neumas, que lembravam o contorno da melodia, até a pauta com linhas de Guido d’Arezzo. Pela primeira vez, alguém podia cantar uma música que nunca tinha ouvido.',
      },
      {
        title: 'Mais de uma voz ao mesmo tempo',
        text: 'O organum junta uma segunda voz ao canto. Em Notre-Dame, as vozes ganham independência e chegam a quatro.',
      },
      {
        title: 'O ritmo ganha notação',
        text: 'Primeiro em padrões repetidos, depois, com a ars nova, em figuras que permitem anotar ritmos variados e sobrepostos.',
      },
      {
        title: 'Surge a canção em língua do povo',
        text: 'Trovadores e troveiros cantam o amor e a cavalaria em occitano e francês, longe do latim da igreja.',
      },
    ],
    forms: [
      {
        name: 'Canto gregoriano',
        text: 'Melodia em latim, sem acompanhamento, para a missa e as horas do dia no mosteiro.',
      },
      {
        name: 'Organum',
        text: 'O canto antigo em notas longas, com uma ou mais vozes novas por cima.',
      },
      {
        name: 'Moteto',
        text: 'Várias vozes, cada uma com seu próprio texto, às vezes em línguas diferentes ao mesmo tempo.',
      },
      {
        name: 'Missa',
        text: 'As partes fixas da celebração (Kyrie, Gloria, Credo, Sanctus, Agnus Dei) postas em polifonia.',
      },
      {
        name: 'Canção de formas fixas',
        text: 'Ballade, rondeau e virelai: poemas com refrão, cada um com seu esquema de repetição.',
      },
    ],
    instruments: [
      'Voz',
      'Órgão',
      'Viela',
      'Harpa',
      'Saltério',
      'Alaúde',
      'Flauta doce',
      'Charamela',
    ],
    listenFirst: [
      {
        composer: 'Anônimo',
        work: 'Victimae paschali laudes',
        note: 'Uma sequência gregoriana de Páscoa. Boa para sentir o canto em uníssono, sem pressa.',
      },
      {
        composer: 'Hildegard von Bingen',
        work: 'O vis aeternitatis',
        note: 'Linhas muito largas, que sobem e descem uma oitava inteira em poucas notas.',
      },
      {
        composer: 'Pérotin',
        work: 'Viderunt omnes',
        note: 'Quatro vozes dançando sobre notas que duram vários segundos. O efeito é de catedral sonora.',
      },
      {
        composer: 'Anônimo',
        work: 'Sumer is icumen in',
        note: 'Um cânone inglês do século XIII sobre a chegada do verão, com o cuco cantando.',
      },
      {
        composer: 'Guillaume de Machaut',
        work: 'Messe de Nostre Dame',
        note: 'Comece pelo Kyrie: quatro vozes, ritmos que se encaixam e um som áspero e brilhante.',
      },
    ],
    didYouKnow: [
      'Os nomes das notas vêm de um hino a São João Batista, Ut queant laxis. Cada verso começa uma nota acima do anterior, e Guido usou as sílabas iniciais (ut, re, mi, fa, sol, la) para ensinar a cantar. O ut virou dó séculos depois, por ser mais fácil de cantar.',
      'Sumer is icumen in é um dos cânones mais antigos que se conhecem: até seis vozes cantam a mesma melodia, entrando uma depois da outra.',
      'Hildegard von Bingen também escreveu sobre medicina, plantas e visões místicas, e trocava cartas com papas e imperadores.',
    ],
  },
  {
    key: 'renaissance',
    lede: 'No Renascimento, as vozes ganharam o mesmo peso e passaram a conversar entre si, imitando umas às outras. A imprensa levou partituras a quem nunca tinha entrado numa catedral.',
    story: [
      'No começo do século XV, compositores do norte da Europa, vindos da região que hoje é a Bélgica, o norte da França e a Holanda, dominavam as capelas mais ricas do continente. Guillaume Du Fay e depois Johannes Ockeghem escreveram missas em que todas as vozes têm melodia própria, em vez de uma voz principal com acompanhamento.',
      'Josquin des Prez, que trabalhou em Milão, Roma e Ferrara, levou essa escrita a um equilíbrio novo. Na técnica que dominou a época, a imitação, uma voz apresenta uma frase e as outras repetem a mesma frase logo depois, cada uma em sua altura. O resultado é uma trama em que nenhuma voz manda. Josquin também cuidava do texto: dava para entender as palavras, e a música acompanhava o sentido delas.',
      'Em 1501, em Veneza, Ottaviano Petrucci publicou o Harmonice Musices Odhecaton, o primeiro livro de música polifônica impresso com tipos móveis. Antes, cada cópia era feita à mão. Com a imprensa, a mesma peça circulava em várias cidades e a música de um compositor podia ficar famosa longe de onde ele vivia.',
      'A Reforma protestante e a reação católica mexeram na música de igreja. Lutero queria a congregação cantando em alemão, e daí nasceu o coral luterano, de melodia simples e marcada. Do lado católico, o Concílio de Trento discutiu se a polifonia deixava o texto ininteligível. Giovanni Pierluigi da Palestrina escreveu missas de clareza exemplar, e uma lenda diz que sua Missa Papae Marcelli convenceu os cardeais a não proibir a polifonia. Não há prova disso, mas o estilo de Palestrina virou modelo de escrita por séculos.',
      'Fora da igreja, o madrigal italiano tomou conta das cortes: poemas de amor cantados a quatro ou cinco vozes, com a música desenhando cada palavra. Na Inglaterra, Thomas Tallis escreveu Spem in alium para quarenta vozes, e John Dowland compôs canções com alaúde de uma melancolia famosa. Os instrumentos, que antes só dobravam as vozes, começaram a ter repertório próprio.',
    ],
    sound:
      'Repare como uma frase passa de voz em voz, como um eco que chega de lugares diferentes. As terças e sextas agora soam consonantes, então o conjunto fica mais macio e cheio que na música medieval. Nos madrigais, preste atenção nas palavras: “suspiro” costuma vir com uma pausa, “morrer” com uma dissonância, “subir” com uma escala que sobe.',
    changes: [
      {
        title: 'Todas as vozes valem o mesmo',
        text: 'A imitação faz cada linha ter melodia própria. O ouvido acompanha uma trama, em vez de uma voz principal.',
      },
      {
        title: 'A partitura impressa',
        text: 'A partir de 1501, livros de música circulam pela Europa. O compositor ganha nome e o repertório se espalha.',
      },
      {
        title: 'O texto passa a ser ouvido',
        text: 'Compositores buscam que as palavras sejam entendidas, e a música pinta o sentido delas.',
      },
      {
        title: 'Os instrumentos ganham voz',
        text: 'Alaúde, viola da gamba e teclado deixam de só acompanhar e recebem danças, fantasias e variações.',
      },
    ],
    forms: [
      {
        name: 'Missa',
        text: 'Agora inteira em polifonia imitativa, muitas vezes construída sobre uma melodia conhecida.',
      },
      {
        name: 'Moteto',
        text: 'Peça sacra em latim, com um único texto e vozes que se imitam.',
      },
      {
        name: 'Madrigal',
        text: 'Poema secular cantado a várias vozes, com a música desenhando as palavras.',
      },
      {
        name: 'Coral luterano',
        text: 'Hino em alemão, de melodia simples, para a congregação cantar junto.',
      },
      {
        name: 'Pavana e galharda',
        text: 'Par de danças, uma lenta e solene, outra rápida e saltada.',
      },
      {
        name: 'Fantasia',
        text: 'Peça instrumental livre, que imita a escrita das vozes.',
      },
    ],
    instruments: [
      'Voz a cappella',
      'Alaúde',
      'Viola da gamba',
      'Flauta doce',
      'Sacabuxa',
      'Corneto',
      'Órgão',
      'Virginal',
    ],
    listenFirst: [
      {
        composer: 'Josquin des Prez',
        work: 'Ave Maria… virgo serena',
        note: 'As vozes entram uma a uma com a mesma frase. Ótima para ouvir a imitação acontecendo.',
      },
      {
        composer: 'Giovanni Pierluigi da Palestrina',
        work: 'Missa Papae Marcelli',
        note: 'Clareza total: dá para seguir cada linha e entender o texto.',
      },
      {
        composer: 'Thomas Tallis',
        work: 'Spem in alium',
        note: 'Quarenta vozes independentes. Com fones de ouvido, o som parece girar ao seu redor.',
      },
      {
        composer: 'John Dowland',
        work: 'Flow, my tears',
        note: 'Uma voz e um alaúde. A canção mais conhecida do período na Inglaterra.',
      },
      {
        composer: 'Carlo Gesualdo',
        work: 'Moro, lasso, al mio duolo',
        note: 'Um madrigal com acordes tão estranhos que parecem do século XX.',
      },
    ],
    didYouKnow: [
      'Spem in alium foi escrita para oito coros de cinco vozes. Em alguns trechos, as quarenta cantam ao mesmo tempo, e em outros o som passa de coro em coro pela sala.',
      'Antes da imprensa, uma única missa copiada à mão podia levar semanas para ficar pronta. O Odhecaton, de 1501, reunia cerca de cem peças num só volume.',
      'Os madrigalistas chamavam de “pintura de palavras” o hábito de ilustrar o texto com a música. O efeito era tão conhecido que virou piada entre os próprios compositores.',
    ],
  },
  {
    key: 'baroque',
    lede: 'Por volta de 1600, em Florença, alguns músicos quiseram fazer a música servir ao drama. Daí nasceram a ópera, o baixo contínuo e uma linguagem de contrastes que vai até a morte de Bach, em 1750.',
    story: [
      'Um grupo de intelectuais florentinos, a Camerata, acreditava que a tragédia grega era inteiramente cantada e quis reviver esse ideal. A solução foi uma voz solista, que declama o texto com liberdade, apoiada por acordes. Assim surgiram as primeiras óperas, por volta de 1600. Em 1607, em Mântua, Claudio Monteverdi estreou L’Orfeo, a primeira ópera que ainda hoje se apresenta com frequência.',
      'Por baixo da voz, ficava o baixo contínuo: uma linha grave tocada por violoncelo, fagote ou viola da gamba, com acordes improvisados no cravo, no órgão ou no alaúde a partir de números escritos na partitura. Esse alicerce sustentou quase toda a música do período, da ópera à música de câmara. Ao mesmo tempo, os modos antigos deram lugar ao sistema de tonalidades maiores e menores que ainda organiza a maior parte da música ocidental.',
      'Na Itália, Arcangelo Corelli fixou o concerto grosso, em que um pequeno grupo de solistas dialoga com a orquestra, e Antonio Vivaldi escreveu centenas de concertos para um solista, muitos para as alunas do Ospedale della Pietà, em Veneza. Suas Quatro Estações, publicadas em 1725, descrevem em música os sonetos que as acompanham: o canto dos pássaros, a tempestade, o caçador.',
      'Na França, Jean-Baptiste Lully comandou a música da corte de Luís XIV e criou a ópera francesa, ligada à dança. Na Inglaterra, Henry Purcell escreveu Dido and Aeneas. Na Alemanha, Johann Sebastian Bach, organista e mestre de capela, reuniu tudo isso. Escreveu cantatas para os domingos de Leipzig, as Paixões, os Concertos de Brandemburgo e O Cravo Bem Temperado, uma coleção de prelúdios e fugas em todas as vinte e quatro tonalidades.',
      'George Frideric Handel, nascido no mesmo ano que Bach, fez carreira em Londres com óperas italianas e depois com oratórios em inglês, como o Messias, estreado em Dublin em 1742. Domenico Scarlatti, em Madri e Lisboa, deixou centenas de sonatas curtas para cravo. Quando Bach morreu, seu estilo já parecia antiquado para os jovens, e é por isso que a data marca, por convenção, o fim do Barroco.',
    ],
    sound:
      'Escute a linha grave: ela quase nunca para e dá um pulso constante, como um motor. As mudanças de volume vêm em blocos, de forte para piano, sem crescendo gradual. Cada movimento costuma manter um único estado de espírito do começo ao fim, alegria, lamento ou triunfo, e os cantores e instrumentistas enfeitam a melodia com ornamentos.',
    changes: [
      {
        title: 'Nasce a ópera',
        text: 'A voz solista declama o drama com acompanhamento simples. Em poucas décadas, a ópera vira o espetáculo mais caro e popular da Europa.',
      },
      {
        title: 'O baixo contínuo sustenta tudo',
        text: 'Uma linha grave com acordes improvisados dá o alicerce harmônico de quase toda a música do período.',
      },
      {
        title: 'O sistema tonal se firma',
        text: 'Maior e menor substituem os modos antigos. As tonalidades ganham caráter próprio e a música passa a viajar entre elas.',
      },
      {
        title: 'O violino toma a frente',
        text: 'Os luthiers de Cremona, como Stradivari e Guarneri, fazem os violinos que até hoje são referência, e o concerto põe o instrumento em destaque.',
      },
    ],
    forms: [
      {
        name: 'Ópera',
        text: 'Drama cantado, com recitativos que contam a história e árias que param o tempo para uma emoção.',
      },
      {
        name: 'Oratório e Paixão',
        text: 'Drama sacro sem cenário, para coro, solistas e orquestra.',
      },
      {
        name: 'Cantata',
        text: 'Peça vocal em vários movimentos. Bach escreveu uma para quase cada domingo do ano em Leipzig.',
      },
      {
        name: 'Concerto',
        text: 'Solista ou pequeno grupo contra a orquestra, em geral em três movimentos: rápido, lento, rápido.',
      },
      {
        name: 'Suíte',
        text: 'Sequência de danças estilizadas: allemande, courante, sarabande e gigue.',
      },
      {
        name: 'Fuga',
        text: 'Um tema curto entra em cada voz, uma depois da outra, e é trabalhado até o fim da peça.',
      },
    ],
    instruments: [
      'Violino',
      'Violoncelo',
      'Viola da gamba',
      'Cravo',
      'Órgão',
      'Oboé barroco',
      'Flauta transversal',
      'Trompete natural',
      'Tímpanos',
      'Teorba',
    ],
    listenFirst: [
      {
        composer: 'Antonio Vivaldi',
        work: 'As Quatro Estações: A Primavera',
        note: 'Siga os pássaros nos violinos solo e o trovão nas cordas graves.',
      },
      {
        composer: 'Johann Sebastian Bach',
        work: 'Prelúdio em dó maior, BWV 846',
        note: 'O primeiro do Cravo Bem Temperado. Só acordes desdobrados, e mesmo assim não cansa.',
      },
      {
        composer: 'Johann Sebastian Bach',
        work: 'Concerto de Brandemburgo nº 3',
        note: 'Cordas divididas em três grupos que se respondem o tempo todo.',
      },
      {
        composer: 'Henry Purcell',
        work: 'When I am laid in earth (Lamento de Dido)',
        note: 'Uma linha grave que desce e se repete por baixo de toda a ária.',
      },
      {
        composer: 'George Frideric Handel',
        work: 'Messias: Hallelujah',
        note: 'Coro e trompetes em festa. O trecho mais cantado do repertório coral.',
      },
    ],
    didYouKnow: [
      'Aos vinte anos, Bach caminhou cerca de quatrocentos quilômetros de Arnstadt a Lübeck para ouvir o organista Dieterich Buxtehude, e ficou por lá meses a mais do que a licença permitia.',
      'Vivaldi era padre e tinha o apelido de “il Prete Rosso”, o padre ruivo, por causa da cor do cabelo.',
      'Conta-se que o rei George II se levantou durante o Hallelujah na estreia londrina do Messias e que, por isso, a plateia fica de pé até hoje. Não há registro que confirme a história.',
    ],
  },
  {
    key: 'classical',
    lede: 'Entre 1750 e 1820, a música buscou clareza: melodias que se cantam de cabeça, frases equilibradas e formas que o ouvinte acompanha sem esforço. Foi o tempo de Haydn, Mozart e do jovem Beethoven, em Viena.',
    story: [
      'A geração seguinte a Bach queria uma música mais leve e direta. Os filhos dele, Carl Philipp Emanuel e Johann Christian, ajudaram a trocar a trama de vozes do Barroco por uma melodia clara com acompanhamento. Em Mannheim, uma orquestra famosa pela disciplina inventou efeitos que encantavam o público, como o crescendo longo, em que o som aumenta aos poucos até explodir.',
      'O ideal do Iluminismo, de razão e clareza, chegou à música na forma sonata: um movimento que apresenta dois temas contrastantes, os desenvolve e depois os traz de volta. Essa arquitetura organizou sinfonias, quartetos, sonatas e concertos por mais de um século. O baixo contínuo desapareceu, e a orquestra se padronizou com cordas, madeiras aos pares, trompas, trompetes e tímpanos.',
      'Joseph Haydn passou quase trinta anos a serviço da família Esterházy, num palácio isolado na Hungria. Ali, com uma orquestra à disposição, testou ideias e acabou fixando a sinfonia e o quarteto de cordas como gêneros. Quando o patrão morreu, foi a Londres e escreveu as doze sinfonias londrinas para salas de concerto lotadas.',
      'Wolfgang Amadeus Mozart viajou a Europa como criança prodígio e se fixou em Viena em 1781, uma das primeiras carreiras de músico independente, sem patrão fixo. Escreveu em todos os gêneros: As Bodas de Fígaro, Don Giovanni e A Flauta Mágica na ópera, concertos para piano em que ele mesmo era o solista, sinfonias e o Réquiem, que deixou inacabado ao morrer, aos trinta e cinco anos.',
      'Nesse período, a música saiu dos palácios e das igrejas para salas de concerto pagas e para a casa da classe média, onde o piano substituiu o cravo. Ludwig van Beethoven chegou a Viena em 1792 para estudar com Haydn. Suas primeiras obras seguem os modelos clássicos, mas a Sinfonia nº 3, a Eroica, de 1804, já é longa e dramática demais para caber neles. Com ele, a música começa a virar romântica.',
    ],
    sound:
      'Repare na melodia, que fica em primeiro plano, e no acompanhamento discreto por baixo, muitas vezes um acorde desdobrado em notas repetidas. As frases vêm em pares, uma pergunta e uma resposta de mesmo tamanho. O volume agora cresce e diminui aos poucos, e a música muda de humor dentro de um mesmo movimento.',
    changes: [
      {
        title: 'A forma sonata',
        text: 'Dois temas, desenvolvimento e retorno. A arquitetura que organiza o primeiro movimento de quase toda sinfonia, sonata e quarteto.',
      },
      {
        title: 'A orquestra se padroniza',
        text: 'Sem baixo contínuo, com madeiras aos pares e o clarinete chegando. É a base da orquestra sinfônica moderna.',
      },
      {
        title: 'O piano substitui o cravo',
        text: 'Ele toca forte e piano conforme a força do dedo, e se torna o instrumento de casa e de concerto.',
      },
      {
        title: 'Nasce o concerto público',
        text: 'Ingressos pagos, salas abertas à burguesia e músicos que vivem de público, não só de patrão.',
      },
    ],
    forms: [
      {
        name: 'Sinfonia',
        text: 'Obra orquestral em quatro movimentos, em geral rápido, lento, minueto e final rápido.',
      },
      {
        name: 'Quarteto de cordas',
        text: 'Dois violinos, viola e violoncelo, em conversa de igual para igual.',
      },
      {
        name: 'Sonata para piano',
        text: 'Três ou quatro movimentos, o primeiro quase sempre em forma sonata.',
      },
      {
        name: 'Concerto para piano',
        text: 'Solista e orquestra, com uma cadência em que o solista toca sozinho e se exibe.',
      },
      {
        name: 'Ópera buffa',
        text: 'Comédia cantada, com personagens do cotidiano e muita ação no palco.',
      },
      {
        name: 'Tema e variações',
        text: 'Uma melodia simples, repetida com roupas cada vez diferentes.',
      },
    ],
    instruments: [
      'Pianoforte',
      'Quarteto de cordas',
      'Clarinete',
      'Trompa natural',
      'Flauta',
      'Oboé',
      'Fagote',
      'Orquestra clássica',
    ],
    listenFirst: [
      {
        composer: 'Wolfgang Amadeus Mozart',
        work: 'Eine kleine Nachtmusik, K. 525',
        note: 'Uma serenata para cordas. Equilíbrio clássico em estado puro.',
      },
      {
        composer: 'Joseph Haydn',
        work: 'Sinfonia nº 94, “Surpresa”',
        note: 'No segundo movimento, uma melodia baixinha e, de repente, um acorde fortíssimo.',
      },
      {
        composer: 'Wolfgang Amadeus Mozart',
        work: 'Sinfonia nº 40, K. 550',
        note: 'O primeiro tema é dos mais conhecidos da música. Repare na inquietação que corre por baixo.',
      },
      {
        composer: 'Wolfgang Amadeus Mozart',
        work: 'Concerto para clarinete, K. 622: Adagio',
        note: 'Escrito meses antes de morrer, para um instrumento que ele ajudou a firmar na orquestra.',
      },
      {
        composer: 'Ludwig van Beethoven',
        work: 'Sonata para piano nº 8, “Patética”',
        note: 'Clássica na forma, mas com uma fúria que já anuncia o Romantismo.',
      },
    ],
    didYouKnow: [
      'Na Sinfonia nº 45, a “Despedida”, Haydn fez os músicos apagarem as velas e saírem um a um no final. Era um recado ao príncipe Esterházy: a orquestra queria voltar para casa depois de uma temporada longa demais no palácio de verão.',
      'Aos catorze anos, em Roma, Mozart ouviu o Miserere de Allegri na Capela Sistina, uma peça cuja partitura não podia sair dali, e o escreveu de memória depois. O episódio está contado numa carta do pai dele.',
      'O nome “Surpresa” não é de Haydn. Veio do público de Londres, que adorou o susto do acorde fortíssimo no meio do movimento lento.',
    ],
  },
  {
    key: 'romantic',
    lede: 'No século XIX, a música passou a falar do indivíduo: paixão, natureza, saudade, a pátria. As orquestras cresceram, o piano virou o centro da casa e o virtuose virou celebridade.',
    story: [
      'Beethoven abriu o caminho. Surdo nos últimos anos, escreveu obras cada vez mais pessoais e amplas, e na Sinfonia nº 9, de 1824, pôs um coro e solistas cantando a Ode à Alegria de Schiller no último movimento. Para os compositores seguintes, ele era a prova de que a música podia dizer coisas que as palavras não alcançavam.',
      'Em Viena, Franz Schubert transformou a canção para voz e piano, o lied, em arte maior. Escreveu mais de seiscentas, entre elas Erlkönig, em que um só cantor faz o narrador, o pai, a criança doente e o rei dos elfos, enquanto o piano galopa sem parar. Robert Schumann e Clara Schumann, pianista das mais admiradas da época, seguiram esse caminho, assim como Johannes Brahms, amigo íntimo do casal.',
      'O piano, agora com estrutura de ferro e um mecanismo mais rápido, tornou-se o instrumento do século. Frédéric Chopin escreveu quase só para ele: noturnos, baladas, estudos, e mazurcas e polonaises que levavam a Paris a lembrança da Polônia. Franz Liszt inventou o recital de piano solo como o conhecemos e causou nas plateias um furor que o poeta Heinrich Heine chamou de Lisztomania. Niccolò Paganini fez o mesmo com o violino.',
      'A orquestra ganhou tamanho e cor. Hector Berlioz contou na Sinfonia Fantástica, de 1830, a história de um artista obcecado por uma mulher, com um tema que volta em cada movimento. Na ópera, Giuseppe Verdi deu à Itália La traviata e Aida, e Richard Wagner criou dramas enormes como O Anel do Nibelungo, em que cada personagem e ideia tem seu motivo musical. O acorde que abre seu Tristão e Isolda, de 1865, ficou famoso por demorar a resolver.',
      'Muitos compositores buscaram na música do próprio povo uma voz nacional: o Grupo dos Cinco na Rússia, Bedřich Smetana e Antonín Dvořák na Boêmia, Edvard Grieg na Noruega. Piotr Tchaikovsky escreveu balés que nunca saíram de cartaz, como O Quebra-Nozes. No Brasil, Carlos Gomes estreou Il Guarany no Teatro alla Scala, em Milão, em 1870, e a ópera entrou no repertório dos teatros italianos.',
    ],
    sound:
      'Ouça melodias longas, que respiram como o canto, e uma harmonia mais carregada, cheia de notas de passagem e mudanças de cor. O tempo estica e encolhe (o rubato), o volume vai do quase silêncio ao estrondo, e a orquestra soma metais e percussão para pintar paisagens. As obras são ou muito curtas, peças de um minuto para piano, ou muito longas.',
    changes: [
      {
        title: 'A música conta histórias',
        text: 'Poemas sinfônicos e sinfonias com programa descrevem paisagens, lendas e dramas pessoais.',
      },
      {
        title: 'O virtuose vira estrela',
        text: 'Liszt e Paganini lotam salas sozinhos. Nasce o recital e a figura do intérprete como celebridade.',
      },
      {
        title: 'A orquestra cresce',
        text: 'Mais metais, válvulas nas trompas e trompetes, a tuba, a harpa e percussão nova. Algumas obras pedem mais de cem músicos.',
      },
      {
        title: 'Cada povo busca sua voz',
        text: 'Danças, canções e lendas locais entram na música de concerto, da Rússia ao Brasil.',
      },
    ],
    forms: [
      {
        name: 'Lied',
        text: 'Canção para voz e piano sobre um poema, muitas vezes reunida em ciclos.',
      },
      {
        name: 'Peça de caráter',
        text: 'Obra curta para piano com um clima definido: noturno, impromptu, intermezzo.',
      },
      {
        name: 'Poema sinfônico',
        text: 'Obra orquestral em um movimento que narra ou descreve algo fora da música.',
      },
      {
        name: 'Drama musical',
        text: 'A ópera de Wagner: música contínua, sem números separados, com motivos para cada ideia.',
      },
      {
        name: 'Estudo de concerto',
        text: 'Peça técnica que também é música para o palco, como os de Chopin e Liszt.',
      },
      {
        name: 'Balé',
        text: 'Música para dança narrativa, com Tchaikovsky como o grande nome.',
      },
    ],
    instruments: [
      'Piano moderno',
      'Orquestra ampliada',
      'Tuba',
      'Trompa de válvulas',
      'Harpa de pedais',
      'Flautim',
      'Corne inglês',
      'Saxofone',
    ],
    listenFirst: [
      {
        composer: 'Franz Schubert',
        work: 'Erlkönig',
        note: 'Um cantor, quatro personagens. O piano faz o cavalo galopando do começo ao fim.',
      },
      {
        composer: 'Frédéric Chopin',
        work: 'Noturno op. 9 nº 2',
        note: 'A melodia canta como uma voz de ópera sobre um acompanhamento que balança.',
      },
      {
        composer: 'Ludwig van Beethoven',
        work: 'Sinfonia nº 9: final',
        note: 'A melodia da Ode à Alegria aparece primeiro nos violoncelos e contrabaixos, sem palavras, antes do coro.',
      },
      {
        composer: 'Bedřich Smetana',
        work: 'Moldava',
        note: 'O rio nasce em duas flautas e atravessa a Boêmia até Praga.',
      },
      {
        composer: 'Antonín Dvořák',
        work: 'Sinfonia nº 9, “Do Novo Mundo”: Largo',
        note: 'O corne inglês canta uma das melodias mais conhecidas do repertório.',
      },
    ],
    didYouKnow: [
      'Chopin pediu que o coração voltasse à Polônia depois da morte. A irmã o levou escondido de Paris a Varsóvia, onde ele está guardado num pilar da Igreja da Santa Cruz.',
      'Heine usou a palavra Lisztomania em 1844 para descrever as plateias de Liszt: fãs que guardavam pontas de charuto e cordas arrebentadas do piano.',
      'Il Guarany, de Carlos Gomes, é baseada no romance O Guarani, de José de Alencar, e a abertura é, há décadas, a música que abre A Voz do Brasil no rádio.',
    ],
  },
  {
    key: 'modern',
    lede: 'Na primeira metade do século XX, os compositores questionaram as regras que pareciam eternas: a tonalidade, o pulso regular, a orquestra de sempre. Em poucos anos, Paris e Viena ouviram mais novidades do que em um século inteiro.',
    story: [
      'Claude Debussy abriu a porta com o Prélude à l’après-midi d’un faune, de 1894. A flauta que começa a peça não leva a lugar nenhum previsível: acordes deslizam sem resolver, escalas de tons inteiros apagam a sensação de centro. Chamaram isso de impressionismo, nome que Debussy detestava. Maurice Ravel, na mesma Paris, levou a orquestração a uma precisão de relojoeiro, que se ouve no Boléro de 1928.',
      'Em 29 de maio de 1913, A Sagração da Primavera, de Igor Stravinsky, estreou no Théâtre des Champs-Élysées com o balé de Nijinsky. Ritmos que mudam a cada compasso, acordes batidos com violência e a coreografia estranha provocaram vaias e brigas na plateia. Um ano antes, em Berlim, o vienense Arnold Schoenberg tinha estreado Pierrot lunaire, música sem tonalidade nenhuma. Pouco depois, ele criou o dodecafonismo, em que as doze notas da escala são organizadas numa série. Seus alunos Alban Berg e Anton Webern formaram com ele a chamada Segunda Escola de Viena.',
      'Outros foram buscar o novo no antigo e no popular. Béla Bartók percorreu aldeias da Hungria e da Romênia com um fonógrafo, gravando camponeses, e pôs esses ritmos e escalas na música de concerto. Stravinsky e Sergei Prokofiev voltaram às formas do século XVIII com olhos modernos, o neoclassicismo. George Gershwin juntou jazz e orquestra na Rhapsody in Blue, de 1924.',
      'No Brasil, Heitor Villa-Lobos misturou o choro carioca, a música indígena e o que ouviu em viagens pelo interior com a técnica europeia. Nas Bachianas Brasileiras, escritas entre 1930 e 1945, ele aproxima Bach da música brasileira. A Ária da nº 5, para soprano e violoncelos, é uma das obras brasileiras mais tocadas no mundo.',
      'A política entrou na música. Na União Soviética, Dmitri Shostakovich foi atacado em 1936 por um editorial do Pravda contra sua ópera Lady Macbeth do Distrito de Mtsensk, e passou a vida equilibrando o que podia e o que queria dizer. Em 1941, preso num campo alemão, Olivier Messiaen escreveu o Quarteto para o fim do tempo e o estreou para os prisioneiros. Ao mesmo tempo, o rádio e o disco levavam toda essa música a quem nunca tinha ido a uma sala de concerto.',
    ],
    sound:
      'Não espere que os acordes resolvam onde a música antiga resolveria. Em Debussy, ouça a cor dos acordes mais do que a direção deles. Em Stravinsky, sinta o ritmo, que muda de compasso a todo momento e bate como percussão. Em Schoenberg, a melodia salta entre notas distantes e a dissonância não pede desculpas. Em Bartók e Villa-Lobos, procure a música do povo por trás da escrita.',
    changes: [
      {
        title: 'A tonalidade deixa de mandar',
        text: 'Escalas de tons inteiros, modos antigos, música sem centro tonal e, com Schoenberg, a série de doze notas.',
      },
      {
        title: 'O ritmo vira protagonista',
        text: 'Compassos que mudam a cada instante e acentos irregulares, como na Sagração da Primavera.',
      },
      {
        title: 'O folclore e o jazz entram na sala',
        text: 'Bartók grava camponeses, Villa-Lobos ouve o choro, Gershwin traz o blues para a orquestra.',
      },
      {
        title: 'A gravação muda quem ouve',
        text: 'Rádio e disco espalham a música de concerto. Pela primeira vez, dá para ouvir a mesma interpretação muitas vezes.',
      },
    ],
    forms: [
      {
        name: 'Balé',
        text: 'Ganha centralidade com os Balés Russos de Diaghilev, que encomendam Stravinsky, Ravel e Prokofiev.',
      },
      {
        name: 'Música serial',
        text: 'Obras construídas sobre uma série com as doze notas, sem repetir nenhuma antes de usar todas.',
      },
      {
        name: 'Neoclassicismo',
        text: 'Formas do século XVIII, como o concerto grosso e a suíte, com harmonia moderna.',
      },
      {
        name: 'Música de câmara para formações novas',
        text: 'Grupos inesperados, como o de Pierrot lunaire, com voz falada-cantada.',
      },
      {
        name: 'Trilha sonora',
        text: 'O cinema falado, a partir de 1927, abre um campo novo para compositores de concerto.',
      },
    ],
    instruments: [
      'Orquestra enorme e, depois, pequenos conjuntos',
      'Percussão ampliada',
      'Celesta',
      'Xilofone',
      'Saxofone',
      'Piano percussivo',
      'Ondes Martenot',
    ],
    listenFirst: [
      {
        composer: 'Claude Debussy',
        work: 'Clair de lune',
        note: 'Para piano solo. A porta de entrada mais suave para o som de Debussy.',
      },
      {
        composer: 'Maurice Ravel',
        work: 'Boléro',
        note: 'Uma melodia repetida por quinze minutos, mudando só de instrumento e crescendo sem parar.',
      },
      {
        composer: 'Igor Stravinsky',
        work: 'A Sagração da Primavera: Augúrios primaveris',
        note: 'O mesmo acorde batido com acentos que você não consegue prever.',
      },
      {
        composer: 'Heitor Villa-Lobos',
        work: 'Bachianas Brasileiras nº 5: Ária',
        note: 'Soprano e oito violoncelos. A melodia sem palavras do começo é inesquecível.',
      },
      {
        composer: 'Sergei Prokofiev',
        work: 'Pedro e o Lobo',
        note: 'Uma história para crianças em que cada personagem é um instrumento.',
      },
    ],
    didYouKnow: [
      'Na estreia da Sagração, o barulho na plateia era tão alto que os bailarinos não ouviam a orquestra. Nijinsky ficou nos bastidores, de pé numa cadeira, gritando a contagem dos tempos.',
      'O Quarteto para o fim do tempo foi escrito para os instrumentos que havia no campo: violino, violoncelo, clarinete e um piano velho. A estreia foi em janeiro de 1941, para centenas de prisioneiros e guardas, num barracão gelado.',
      'Em Pedro e o Lobo, o pássaro é a flauta, o pato é o oboé, o gato é o clarinete, o avô é o fagote, o lobo são três trompas e Pedro são as cordas.',
    ],
  },
  {
    key: 'contemporary',
    lede: 'Depois de 1950, cada compositor passou a escolher sua própria linguagem. Silêncio, ruído, computador, repetição hipnótica e a volta da melodia convivem, e a música de concerto conversa com o cinema, o videogame e a música popular.',
    story: [
      'Logo depois da guerra, em Darmstadt, na Alemanha, jovens como Pierre Boulez e Karlheinz Stockhausen levaram a ideia de série de Schoenberg ao extremo, organizando não só as notas, mas também as durações, as intensidades e os timbres. Ao mesmo tempo, em Paris, Pierre Schaeffer gravava sons do mundo, trens, panelas, vozes, e os montava em fita magnética: a música concreta, de 1948. Em Colônia, um estúdio de rádio produziu as primeiras peças feitas inteiramente com sons eletrônicos.',
      'Do outro lado do Atlântico, John Cage foi por outro caminho e deixou o acaso decidir. Usou moedas e o I Ching para compor, colocou parafusos e borrachas entre as cordas do piano, o piano preparado, e em 1952 apresentou 4’33”, em que o pianista não toca nada por quatro minutos e trinta e três segundos. A obra é feita dos sons da sala e de quem está nela.',
      'Na década de 1960, György Ligeti escreveu peças como Atmosphères, em que dezenas de instrumentos tocam notas vizinhas ao mesmo tempo e o resultado é uma nuvem de som que muda devagar. Stanley Kubrick usou essa música em 2001: Uma Odisseia no Espaço. Krzysztof Penderecki compôs o Treno às vítimas de Hiroshima com cordas que rangem e gritam.',
      'Em reação a tanta complexidade, surgiu nos Estados Unidos o minimalismo. Terry Riley, Steve Reich e Philip Glass escreveram música feita de padrões curtos repetidos por muito tempo, que mudam aos poucos. Na Estônia, Arvo Pärt criou um estilo de pouquíssimas notas, o tintinnabuli, que soa ao mesmo tempo antigo e novo. Essas músicas atraíram um público que tinha se afastado da música contemporânea.',
      'Hoje, a música de concerto convive com o cinema, o videogame e o pop. John Williams escreve trilhas que orquestras do mundo inteiro tocam em concerto. Compositoras como Kaija Saariaho e Caroline Shaw, premiada com o Pulitzer em 2013 pela Partita for 8 Voices, ampliaram o que a voz e a orquestra podem fazer. No Brasil, o grupo Música Nova, de Gilberto Mendes, e compositores como Almeida Prado e Marlos Nobre fizeram a ponte entre a vanguarda e as raízes brasileiras.',
    ],
    sound:
      'Aqui, a pergunta útil é “o que este compositor está explorando?”. Pode ser um único acorde que se transforma devagar, um padrão repetido até virar transe, sons gravados do mundo, o silêncio ou uma melodia simples que volta depois de décadas de abstração. Ouça sem esperar uma forma conhecida e preste atenção na textura e no tempo.',
    changes: [
      {
        title: 'O som eletrônico',
        text: 'Fita magnética, sintetizador e computador viram instrumentos. Qualquer som pode ser material musical.',
      },
      {
        title: 'O acaso e o silêncio',
        text: 'Cage deixa moedas e o ambiente decidirem. A partitura passa a propor caminhos, em vez de fixar tudo.',
      },
      {
        title: 'A repetição volta',
        text: 'O minimalismo constrói obras longas com padrões curtos e reaproxima o público da música nova.',
      },
      {
        title: 'As fronteiras se dissolvem',
        text: 'Concerto, cinema, videogame, jazz e pop se misturam, e a orquestra toca trilha sonora em sala lotada.',
      },
    ],
    forms: [
      {
        name: 'Música eletroacústica',
        text: 'Sons gravados ou sintetizados, sozinhos ou junto de instrumentos ao vivo.',
      },
      {
        name: 'Obra aberta',
        text: 'Partitura com escolhas deixadas ao intérprete ou ao acaso.',
      },
      {
        name: 'Minimalismo',
        text: 'Padrões curtos que se repetem e mudam aos poucos, criando uma sensação de transe.',
      },
      {
        name: 'Massa sonora',
        text: 'Texturas em que muitas notas próximas soam juntas, como nas obras de Ligeti.',
      },
      {
        name: 'Ópera contemporânea',
        text: 'Dramas sobre temas atuais, como Einstein on the Beach ou Nixon in China.',
      },
      {
        name: 'Trilha de cinema e videogame',
        text: 'Música orquestral feita para a imagem, que hoje enche salas de concerto.',
      },
    ],
    instruments: [
      'Sintetizador',
      'Fita magnética',
      'Computador',
      'Piano preparado',
      'Técnicas estendidas',
      'Voz com técnicas novas',
      'Percussão de todo o mundo',
    ],
    listenFirst: [
      {
        composer: 'Arvo Pärt',
        work: 'Spiegel im Spiegel',
        note: 'Violino ou violoncelo e piano, com pouquíssimas notas. Calma do primeiro ao último compasso.',
      },
      {
        composer: 'Steve Reich',
        work: 'Music for 18 Musicians',
        note: 'Pulsos que se repetem e se transformam por quase uma hora. Deixe-se levar.',
      },
      {
        composer: 'Philip Glass',
        work: 'Metamorphosis One',
        note: 'Piano solo, repetição e uma melancolia que conquista na primeira escuta.',
      },
      {
        composer: 'György Ligeti',
        work: 'Atmosphères',
        note: 'Uma nuvem de som que muda de cor. A mesma de 2001: Uma Odisseia no Espaço.',
      },
      {
        composer: 'John Adams',
        work: 'Short Ride in a Fast Machine',
        note: 'Quatro minutos de orquestra em alta velocidade, com um bloco de madeira marcando o pulso.',
      },
    ],
    didYouKnow: [
      'Na estreia de 4’33”, em 1952, o pianista David Tudor fechava e abria a tampa do teclado para marcar os três movimentos, e acompanhava o tempo num cronômetro.',
      'Numa igreja em Halberstadt, na Alemanha, um órgão toca desde 2001 uma peça de Cage chamada ORGAN²/ASLSP. A execução está programada para terminar em 2640, e cada mudança de acorde reúne visitantes.',
      'Kubrick usou a música de Ligeti em 2001 sem pedir autorização. O compositor só descobriu ao assistir ao filme e foi à Justiça contra o estúdio.',
    ],
  },
];
