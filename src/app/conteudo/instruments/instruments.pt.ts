import type { InstrumentChapter } from './types';

export const INSTRUMENTS_PT: InstrumentChapter[] = [
  {
    key: 'piano',
    name: 'Piano',
    when: 'Florença, por volta de 1700',
    lede: 'O piano nasceu para resolver um problema do cravo: tocar mais forte ou mais fraco conforme a força do dedo. Em pouco mais de um século, virou o instrumento de casa, de estudo e de concerto.',
    howItWorks:
      'Cada tecla move um martelo coberto de feltro que bate na corda e volta na hora, deixando a corda vibrar. Quanto mais força no dedo, mais rápido o martelo e mais forte o som. Ao soltar a tecla, um abafador pousa na corda e corta o som. O pedal da direita levanta todos os abafadores de uma vez, e as notas continuam soando. Nos agudos, cada nota tem três cordas afinadas juntas; nos graves, uma ou duas cordas grossas, enroladas com fio de cobre.',
    story: [
      'Bartolomeo Cristofori cuidava dos instrumentos da família Médici, em Florença, e por volta de 1700 construiu um cravo com martelos no lugar das penas. Chamou-o de gravicembalo col piano e forte, cravo com suave e forte. O nome encurtou para pianoforte e depois para piano. A peça-chave da invenção era o escape, o mecanismo que deixa o martelo cair de volta logo depois de bater.',
      'No século XVIII, construtores alemães e austríacos melhoraram a ideia. Mozart tocava pianos leves e claros, de Viena. Beethoven queria mais volume e mais graves, e pianos ingleses, mais pesados, chegaram até ele. Em 1821, em Paris, Sébastien Érard patenteou o duplo escape, que permite repetir a mesma nota muito rápido, a base da técnica virtuosa de Liszt.',
      'O salto seguinte veio com o ferro. Estruturas de ferro fundido aguentaram cordas muito mais tensas e um som mais cheio, e a fábrica Steinway, em Nova York, cruzou as cordas graves por cima das médias em 1859. No fim do século XIX, o piano já tinha a forma e as 88 teclas que tem hoje.',
    ],
    timeline: [
      {
        year: 'c. 1700',
        text: 'Cristofori constrói o primeiro piano em Florença.',
      },
      {
        year: '1780s',
        text: 'Os pianos vienenses de Stein e Walter, que Mozart usava.',
      },
      {
        year: '1821',
        text: 'Érard patenteia o duplo escape e as notas repetidas ficam rápidas.',
      },
      {
        year: '1859',
        text: 'Steinway cruza as cordas sobre uma estrutura de ferro.',
      },
      { year: 'fim do séc. XIX', text: 'As 88 teclas viram padrão.' },
    ],
    repertoire:
      'Quase todos os grandes compositores escreveram para o piano. Mozart deixou concertos em que ele mesmo era o solista. Beethoven escreveu 32 sonatas que acompanham toda a sua vida. Chopin escreveu quase só para o instrumento, Liszt levou a técnica ao limite e Debussy e Ravel exploraram suas cores. No século XX, Rachmaninoff, Prokofiev e Villa-Lobos continuaram a tradição.',
    listenFirst: [
      {
        composer: 'Wolfgang Amadeus Mozart',
        work: 'Sonata em dó maior, K. 545',
        workId: '686c90a13d4f77ce841eb4d8',
        note: 'Escrita “para iniciantes”, clara e alegre. Muita gente aprende a tocar com ela.',
      },
      {
        composer: 'Frédéric Chopin',
        work: 'Balada nº 1, op. 23',
        workId: '686345f5204a67621b0bfbc5',
        note: 'Dez minutos de drama: começa sussurrando e termina numa tempestade.',
      },
      {
        composer: 'Claude Debussy',
        work: 'Clair de lune',
        workId: '68711dbfd4375027987dac04',
        note: 'O pedal deixa as notas se misturarem como luz na água.',
      },
      {
        composer: 'Sergei Rachmaninoff',
        work: 'Concerto para piano nº 2',
        workId: '686c75f43d4f77ce841eaf10',
        note: 'Começa com acordes que imitam sinos e cresce até melodias enormes.',
      },
    ],
    didYouKnow: [
      'O piano de Cristofori mais antigo que sobreviveu, de 1720, está no Metropolitan Museum de Nova York e ainda pode ser tocado.',
      'Somadas, as cordas de um piano de cauda puxam a estrutura com uma força de cerca de vinte toneladas.',
    ],
  },
  {
    key: 'harpsichord',
    name: 'Cravo',
    when: 'Europa, séculos XIV e XV',
    lede: 'O cravo foi o teclado da Renascença e do Barroco. Seu som brilhante e preciso sustentou o baixo contínuo de quase toda a música da época e voltou aos palcos no século XX.',
    howItWorks:
      'Ao apertar a tecla, uma peça de madeira chamada saltarelo sobe e uma pequena palheta, antigamente feita de pena de ave, belisca a corda. A força do dedo quase não muda o volume. Para variar o som, o cravista troca de registro, acionando outra fileira de cordas, ou passa para um segundo teclado. A expressão vem da articulação, do ritmo e dos ornamentos.',
    story: [
      'A primeira menção escrita a um clavicembalum é de 1397, em Pádua. Nos séculos seguintes, cada região criou seu estilo de construção. Em Antuérpia, a família Ruckers fez cravos tão admirados que, cem anos depois, eram reformados em vez de substituídos.',
      'No Barroco, o cravo estava em todo lugar: tocava acordes no baixo contínuo de óperas, cantatas e sonatas e tinha um repertório solo enorme. Na França, François Couperin e Jean-Philippe Rameau escreveram peças com títulos poéticos. Domenico Scarlatti compôs centenas de sonatas curtas para a corte de Lisboa e de Madri, e Bach publicou as Variações Goldberg para um cravo de dois teclados.',
      'Com o piano, o cravo quase sumiu no século XIX. Quem o trouxe de volta foi a polonesa Wanda Landowska, que tocava num instrumento construído pela Pleyel e encomendou obras novas, como os concertos de Manuel de Falla e Francis Poulenc. Hoje, conjuntos de música antiga usam cópias de cravos históricos.',
    ],
    timeline: [
      { year: '1397', text: 'Primeira menção escrita, em Pádua.' },
      {
        year: 'séc. XVI–XVII',
        text: 'A família Ruckers, em Antuérpia, define o cravo flamengo.',
      },
      { year: '1741', text: 'Bach publica as Variações Goldberg.' },
      { year: '1912', text: 'Wanda Landowska volta a tocá-lo em concerto.' },
    ],
    repertoire:
      'Bach, Couperin, Rameau, Scarlatti e Handel formam o núcleo. No contínuo, o cravo está em quase toda a música barroca. No século XX, Falla, Poulenc e György Ligeti escreveram para ele.',
    listenFirst: [
      {
        composer: 'Johann Sebastian Bach',
        work: 'Variações Goldberg: Ária',
        workId: '6866f533e541852612e01658',
        note: 'Uma sarabanda tranquila que gera trinta variações.',
      },
      {
        composer: 'Domenico Scarlatti',
        work: 'Sonata em ré menor, K. 141',
        workId: '6868eeea4d7d232942159a80',
        note: 'Notas repetidas em velocidade, com sabor de violão espanhol.',
      },
      {
        composer: 'Jean-Philippe Rameau',
        work: 'La Poule',
        workId: '686b55114206d8332943ef35',
        note: 'O cacarejo de uma galinha transformado em música.',
      },
      {
        composer: 'François Couperin',
        work: 'Les Barricades mystérieuses',
        workId: '6869c6fdc93ef3be836d5e91',
        note: 'Notas que se sobrepõem e criam uma trama hipnótica.',
      },
    ],
    didYouKnow: [
      'Um cravo francês podia ter a tampa pintada com paisagens por artistas da época. Alguns valem mais pela pintura do que pelo instrumento.',
      'Ligeti escreveu Continuum, de 1968, para cravo tocado tão rápido que as notas viram um único som contínuo.',
    ],
  },
  {
    key: 'organ',
    name: 'Órgão',
    when: 'Alexandria, século III a.C.',
    lede: 'O órgão é o instrumento mais antigo de teclado e o maior de todos. Com ar passando por tubos, consegue sussurrar ou fazer tremer uma catedral inteira.',
    howItWorks:
      'Um fole, hoje elétrico, mantém o ar sob pressão. Cada tecla abre a passagem de ar para tubos de metal ou de madeira, e cada tubo toca uma única nota, com um único timbre. Os registros, acionados por puxadores ao lado dos teclados, escolhem quais fileiras de tubos soam: flautas, palhetas, sons fortes ou delicados. O organista toca com as mãos em dois ou mais teclados, os manuais, e com os pés numa pedaleira.',
    story: [
      'O engenheiro grego Ctésibio, em Alexandria, inventou no século III a.C. o hydraulis, um órgão em que a água regulava a pressão do ar. O instrumento soava em arenas e festas romanas. Em 757, o imperador bizantino deu um órgão de presente ao rei franco Pepino, e a partir daí ele foi entrando nas igrejas da Europa ocidental.',
      'Na Idade Média e no Renascimento, os órgãos cresceram junto com as catedrais. No Barroco, a Alemanha do norte tinha os construtores mais famosos, como Arp Schnitger, e organistas como Dieterich Buxtehude e Johann Sebastian Bach escreveram prelúdios, fugas e corais que ainda são o centro do repertório.',
      'No século XIX, o francês Aristide Cavaillé-Coll construiu órgãos capazes de imitar uma orquestra, e Charles-Marie Widor e César Franck escreveram sinfonias para órgão solo. No século XX, Olivier Messiaen usou o instrumento para pintar cores e cantos de pássaros.',
    ],
    timeline: [
      {
        year: 'séc. III a.C.',
        text: 'Ctésibio inventa o hydraulis em Alexandria.',
      },
      {
        year: '757',
        text: 'Bizâncio presenteia o rei franco Pepino com um órgão.',
      },
      {
        year: 'séc. XVII–XVIII',
        text: 'Os grandes órgãos barrocos do norte da Alemanha.',
      },
      {
        year: 'séc. XIX',
        text: 'Os órgãos sinfônicos de Cavaillé-Coll, na França.',
      },
    ],
    repertoire:
      'Bach é o centro, com prelúdios e fugas, tocatas e corais. Antes dele, Frescobaldi e Buxtehude; depois, Mendelssohn, Franck, Widor, Vierne e Messiaen. Saint-Saëns juntou o órgão à orquestra na Sinfonia nº 3.',
    listenFirst: [
      {
        composer: 'Johann Sebastian Bach',
        work: 'Tocata e Fuga em ré menor, BWV 565',
        workId: '6875fd05abb1ea4be867ea61',
        note: 'A abertura mais famosa do órgão. Há discussão se é mesmo de Bach.',
      },
      {
        composer: 'Charles-Marie Widor',
        work: 'Sinfonia nº 5: Tocata',
        workId: '686bd79be24dbc674e7f0412',
        note: 'Mãos rapidíssimas sobre uma melodia grave nos pés. Muito tocada em casamentos.',
      },
      {
        composer: 'Camille Saint-Saëns',
        work: 'Sinfonia nº 3, “com órgão”: final',
        workId: '6875007bfed73ac7cb1c0179',
        note: 'O órgão entra com um acorde enorme que enche a sala.',
      },
      {
        composer: 'Olivier Messiaen',
        work: 'La Nativité du Seigneur: Dieu parmi nous',
        composerId: '685ee607c6bd886c5b497da5',
        note: 'Cores e acordes que só o órgão consegue sustentar.',
      },
    ],
    didYouKnow: [
      'Mozart chamou o órgão de “rei dos instrumentos” numa carta de 1777, e o apelido ficou.',
      'O órgão com mais tubos do mundo fica no Boardwalk Hall de Atlantic City, nos Estados Unidos, com mais de trinta mil tubos.',
    ],
  },
  {
    key: 'violin',
    name: 'Violino',
    when: 'Cremona, por volta de 1550',
    lede: 'O violino é o menor e mais agudo da família das cordas e o que mais se aproxima da voz humana. Os melhores ainda são os que foram feitos em Cremona há mais de trezentos anos.',
    howItWorks:
      'Tem quatro cordas, afinadas em sol, ré, lá e mi, de cinco em cinco notas. O arco, com crina de cavalo esfregada em breu, prende e solta a corda centenas de vezes por segundo, e ela vibra. O cavalete passa essa vibração ao tampo de abeto, e o corpo oco amplifica o som. Uma pequena vareta de madeira escondida dentro, a alma, liga tampo e fundo e muda muito o timbre.',
    story: [
      'Os primeiros violinos que sobreviveram foram feitos por Andrea Amati em Cremona, na Itália, por volta de 1560. A cidade virou o centro do ofício: Nicolò Amati, seu neto, ensinou a geração seguinte, e dela saíram Antonio Stradivari e a família Guarneri. Os instrumentos feitos ali entre 1650 e 1750 são até hoje os mais cobiçados.',
      'No Barroco, o violino deixou de ser instrumento de dança e virou estrela. Corelli e Vivaldi escreveram sonatas e concertos que exigiam técnica nova, e Bach deixou seis Sonatas e Partitas para violino sozinho. No fim do século XVIII, o arqueiro francês François Tourte criou o arco moderno, mais longo e curvado para dentro, capaz de mais volume e de golpes variados.',
      'No século XIX, Niccolò Paganini fez do violino um espetáculo de virtuosismo, e os grandes concertos românticos, de Beethoven, Mendelssohn, Brahms e Tchaikovsky, formaram o repertório que os solistas tocam até hoje. Na orquestra, os violinos são o grupo mais numeroso, divididos em primeiros e segundos.',
    ],
    timeline: [
      {
        year: 'c. 1560',
        text: 'Os violinos mais antigos de Andrea Amati, em Cremona.',
      },
      { year: '1700–1720', text: 'O período áureo de Antonio Stradivari.' },
      {
        year: '1720',
        text: 'Bach escreve as Sonatas e Partitas para violino solo.',
      },
      { year: 'c. 1785', text: 'François Tourte cria o arco moderno.' },
    ],
    repertoire:
      'Vivaldi, Bach, os concertos românticos de Beethoven, Mendelssohn, Brahms e Tchaikovsky, os Caprichos de Paganini e, no século XX, Sibelius, Prokofiev, Bartók e Berg. No Brasil, Villa-Lobos e Camargo Guarnieri escreveram para o instrumento.',
    listenFirst: [
      {
        composer: 'Antonio Vivaldi',
        work: 'As Quatro Estações: O Verão, presto',
        workId: '68787c2d30e79c884ed67bb3',
        note: 'O violino solo faz a tempestade de granizo.',
      },
      {
        composer: 'Johann Sebastian Bach',
        work: 'Partita nº 2: Chaconne',
        workId: '6861a1fb0b6936a3c6cf8f23',
        note: 'Quinze minutos de um violino sozinho, como se fosse uma orquestra.',
      },
      {
        composer: 'Felix Mendelssohn',
        work: 'Concerto para violino em mi menor',
        workId: '68787e7930e79c884ed67c4d',
        note: 'O solista entra logo no segundo compasso com uma melodia inesquecível.',
      },
      {
        composer: 'Niccolò Paganini',
        work: 'Capricho nº 24',
        workId: '68609a3a0b6936a3c6cf5c62',
        note: 'Um tema com variações que testam todas as técnicas do instrumento.',
      },
    ],
    didYouKnow: [
      'Restam cerca de seiscentos instrumentos de Stradivari. Os melhores violinos dele já foram vendidos por mais de quinze milhões de dólares.',
      'O violino preferido de Paganini, um Guarneri apelidado de Il Cannone pelo som potente, fica guardado na prefeitura de Gênova e ainda é tocado em ocasiões especiais.',
    ],
  },
  {
    key: 'viola',
    name: 'Viola',
    when: 'Itália, por volta de 1550',
    lede: 'A viola é um pouco maior que o violino e soa cinco notas abaixo. Fica no meio da orquestra e do quarteto, com um timbre mais escuro e aveludado.',
    howItWorks:
      'Tem quatro cordas, afinadas em dó, sol, ré e lá, e se toca apoiada no ombro, como o violino. O tamanho não é padronizado: cada violista escolhe um corpo que caiba no braço. A música para viola é escrita na clave de dó, que quase só ela usa, porque a extensão do instrumento fica entre a dos violinos e a dos violoncelos.',
    story: [
      'A viola nasceu junto com o violino, nas oficinas do norte da Itália no século XVI. Por muito tempo, seu papel foi preencher a harmonia no meio da orquestra, e ela recebeu pouca música própria.',
      'No período clássico, o quarteto de cordas deu à viola mais destaque. Mozart gostava de tocá-la nas reuniões de quarteto, e sabe-se de uma noite em Viena, em 1784, em que ele fez a viola num quarteto com Haydn, Dittersdorf e Vanhal. Sua Sinfonia Concertante, K. 364, põe viola e violino lado a lado como solistas.',
      'O século XIX ainda olhava a viola com desconfiança, mas Berlioz escreveu Harold en Italie para ela, e no século XX surgiram concertos e sonatas que firmaram seu repertório solo, de Hindemith, ele mesmo violista, Walton e Bartók.',
    ],
    timeline: [
      {
        year: 'séc. XVI',
        text: 'Nasce junto com o violino no norte da Itália.',
      },
      {
        year: '1779',
        text: 'Mozart escreve a Sinfonia Concertante para violino e viola.',
      },
      { year: '1834', text: 'Berlioz compõe Harold en Italie.' },
      {
        year: '1945',
        text: 'Bartók morre deixando um concerto para viola por terminar.',
      },
    ],
    repertoire:
      'Os quartetos de Haydn, Mozart e Beethoven dão à viola o papel do meio. Como solista: Mozart, Berlioz, Brahms (as duas sonatas op. 120, também para clarinete), Hindemith, Walton e Bartók.',
    listenFirst: [
      {
        composer: 'Wolfgang Amadeus Mozart',
        work: 'Sinfonia Concertante, K. 364: Andante',
        workId: '687034782b5a360ec93afb6c',
        note: 'Violino e viola conversam como dois cantores de ópera.',
      },
      {
        composer: 'Hector Berlioz',
        work: 'Harold en Italie',
        workId: '68672d85e541852612e0220f',
        note: 'A viola é o personagem que caminha pelas montanhas italianas.',
      },
      {
        composer: 'Johannes Brahms',
        work: 'Sonata para viola op. 120 nº 2',
        workId: '686448268f28004160328d53',
        note: 'Calorosa e outonal, escrita no fim da vida de Brahms.',
      },
      {
        composer: 'Béla Bartók',
        work: 'Concerto para viola',
        workId: '6878009723ddc84386c1c24c',
        note: 'A última obra do compositor, completada depois da morte dele por Tibor Serly, seu amigo.',
      },
    ],
    didYouKnow: [
      'Paganini encomendou Harold en Italie a Berlioz, mas desistiu de tocar porque achou que a viola descansava demais.',
      'Os violistas são alvo de piadas entre músicos há séculos, e eles mesmos costumam contar as melhores.',
    ],
  },
  {
    key: 'cello',
    name: 'Violoncelo',
    when: 'Itália, por volta de 1560',
    lede: 'O violoncelo tem a extensão mais parecida com a da voz humana, do baixo profundo ao tenor agudo. Tocado sentado, com o instrumento entre os joelhos, é capaz de cantar e de sustentar a orquestra inteira.',
    howItWorks:
      'Tem quatro cordas, afinadas em dó, sol, ré e lá, uma oitava abaixo da viola. O instrumento se apoia no chão por uma haste de metal, o espigão, e o músico toca sentado, com o arco atravessando o corpo. Por ser grande, o violoncelo tem uma caixa de ressonância que dá aos graves um som cheio e às notas agudas um brilho próximo do canto.',
    story: [
      'O violoncelo surgiu em meados do século XVI, nas oficinas de Andrea Amati e de outros luthiers italianos, com o nome de violone e variações dele. No começo, servia quase só para tocar a linha grave do baixo contínuo.',
      'No fim do século XVII, cordas com núcleo de tripa enrolado em metal deixaram o instrumento menor e mais ágil, e ele ganhou repertório solo. Bach escreveu seis Suítes para violoncelo solo, Vivaldi dezenas de concertos e Boccherini, ele mesmo violoncelista, sonatas e concertos. O espigão só se generalizou no século XIX; antes, o instrumento ficava preso entre as pernas.',
      'No Romantismo e no século XX, o violoncelo ganhou os concertos de Schumann, Dvořák, Elgar e Shostakovich. Villa-Lobos escreveu as Bachianas Brasileiras nº 1 para uma orquestra só de violoncelos, e o catalão Pablo Casals mudou a história do instrumento ao gravar as Suítes de Bach.',
    ],
    timeline: [
      {
        year: 'c. 1560',
        text: 'Primeiros instrumentos, ainda chamados de violone.',
      },
      {
        year: 'c. 1720',
        text: 'Bach escreve as seis Suítes para violoncelo solo.',
      },
      { year: 'séc. XIX', text: 'O espigão se torna padrão.' },
      { year: '1936–1939', text: 'Pablo Casals grava as Suítes de Bach.' },
    ],
    repertoire:
      'As Suítes de Bach, os concertos de Haydn, Boccherini, Schumann, Dvořák, Elgar e Shostakovich, as sonatas de Beethoven e Brahms. No Brasil, Villa-Lobos dedicou ao instrumento as Bachianas nº 1 e a parte central das Bachianas nº 5.',
    listenFirst: [
      {
        composer: 'Johann Sebastian Bach',
        work: 'Suíte nº 1: Prelúdio',
        workId: '686406a2204a67621b0c21a9',
        note: 'Acordes desdobrados num violoncelo sozinho. Talvez a peça mais conhecida do instrumento.',
      },
      {
        composer: 'Camille Saint-Saëns',
        work: 'O Carnaval dos Animais: O Cisne',
        workId: '68699a7cc93ef3be836d550c',
        note: 'Uma melodia longa sobre ondas do piano.',
      },
      {
        composer: 'Antonín Dvořák',
        work: 'Concerto para violoncelo',
        workId: '6863fbbe204a67621b0c1f68',
        note: 'O concerto mais tocado do repertório, cheio de melodias boêmias.',
      },
      {
        composer: 'Edward Elgar',
        work: 'Concerto para violoncelo',
        workId: '6863fca8204a67621b0c1f96',
        note: 'Começa com acordes do solista que soam como uma lembrança dolorosa.',
      },
    ],
    didYouKnow: [
      'Pablo Casals encontrou as Suítes de Bach aos treze anos, numa loja de partituras usadas em Barcelona. Estudou-as por mais de dez anos antes de tocá-las em público.',
      'O Carnaval dos Animais foi proibido de publicação por Saint-Saëns em vida, achava a obra frívola demais. Só O Cisne ele liberou.',
    ],
  },
  {
    key: 'double-bass',
    name: 'Contrabaixo',
    when: 'Europa, século XVI',
    lede: 'O contrabaixo é o maior e mais grave instrumento de cordas da orquestra. Quase sempre no fundo do palco, é ele que dá o chão em que tudo se apoia.',
    howItWorks:
      'Diferente dos outros da família, é afinado de quatro em quatro notas: mi, lá, ré e sol, para que a mão alcance as notas sem saltos enormes. Sua música soa uma oitava abaixo do que está escrito, para evitar linhas suplementares sem fim. O músico toca em pé ou num banco alto, com arco ou beliscando as cordas, o pizzicato. Há dois tipos de arco, o francês e o alemão, segurados de jeitos diferentes.',
    story: [
      'O contrabaixo descende do violone, membro grave da família das violas da gamba, e por isso tem ombros caídos e afinação em quartas, ao contrário do violino. Durante o Barroco e o Clássico, dobrava a linha dos violoncelos uma oitava abaixo.',
      'Dois virtuoses mudaram a fama do instrumento. Domenico Dragonetti, amigo de Beethoven, tocava em Londres e impressionava pela técnica. No século XIX, Giovanni Bottesini, chamado de Paganini do contrabaixo, escreveu concertos e fantasias para mostrar que o instrumento também podia cantar.',
      'No século XX, o contrabaixo ganhou outro palco no jazz, tocado em pizzicato. Na música de concerto, compositores como Saint-Saëns e Mahler lhe deram solos marcantes, e hoje há concursos e repertório solo próprios.',
    ],
    timeline: [
      {
        year: 'séc. XVI',
        text: 'Nasce do violone, da família das violas da gamba.',
      },
      { year: 'c. 1800', text: 'Dragonetti brilha em Londres.' },
      {
        year: '1819',
        text: 'Schubert põe o contrabaixo no Quinteto “A Truta”.',
      },
      { year: 'séc. XX', text: 'Vira a base do jazz, em pizzicato.' },
    ],
    repertoire:
      'Na orquestra, todo o repertório sinfônico. Como solista: os concertos de Dittersdorf, Vanhal e Koussevitzky e as obras de Bottesini. Na câmara, o Quinteto “A Truta”, de Schubert.',
    listenFirst: [
      {
        composer: 'Camille Saint-Saëns',
        work: 'O Carnaval dos Animais: O Elefante',
        workId: '68699a7cc93ef3be836d550c',
        note: 'O contrabaixo dança uma valsa pesada e engraçada.',
      },
      {
        composer: 'Gustav Mahler',
        work: 'Sinfonia nº 1: terceiro movimento',
        workId: '68714339d4375027987db4ed',
        note: 'Começa com um solo de contrabaixo tocando Frère Jacques em tom menor, como uma marcha fúnebre.',
      },
      {
        composer: 'Franz Schubert',
        work: 'Quinteto “A Truta”: tema e variações',
        workId: '686c87c63d4f77ce841eb2fa',
        note: 'O contrabaixo dá peso a um conjunto que tinha só um violino.',
      },
      {
        composer: 'Giovanni Bottesini',
        work: 'Concerto para contrabaixo nº 2',
        workId: '6865599ac4eec286b4aafe98',
        note: 'Mostra como o instrumento pode ser lírico e ágil.',
      },
    ],
    didYouKnow: [
      'Dragonetti tocou com Beethoven a sonata para violoncelo em sol menor, na parte do violoncelo, num contrabaixo. Conta-se que isso mudou o que Beethoven passou a pedir dos contrabaixos na orquestra.',
      'Alguns contrabaixistas usam uma extensão mecânica na corda mais grave para chegar ao dó, nota que a orquestra pede em obras de Beethoven e Mahler.',
    ],
  },
  {
    key: 'harp',
    name: 'Harpa',
    when: 'Egito e Mesopotâmia, há mais de 4 mil anos',
    lede: 'A harpa é um dos instrumentos mais antigos que existem. A de concerto, com 47 cordas e sete pedais, consegue tocar em qualquer tonalidade e dá à orquestra um brilho que nenhum outro instrumento tem.',
    howItWorks:
      'As cordas são beliscadas com os dedos, sem o mindinho, e cada uma toca uma nota. Para mudar de tonalidade, a harpista usa sete pedais, um para cada nota da escala (todas as cordas de dó, todas de ré, e assim por diante). Cada pedal tem três posições, que deixam a nota bemol, natural ou sustenido. As cordas de dó são vermelhas e as de fá, pretas ou azuis, para a harpista se orientar.',
    story: [
      'Pinturas egípcias de mais de quatro mil anos já mostram harpas, e túmulos da Mesopotâmia guardaram instrumentos de cordas ricamente decorados. Na Idade Média, a harpa acompanhava bardos e trovadores, e na Irlanda e no País de Gales virou símbolo nacional.',
      'O problema era tocar em várias tonalidades. Harpas com ganchos e depois com pedais simples resolveram em parte. Em 1810, o construtor francês Sébastien Érard patenteou a harpa de pedais de dupla ação, a que se usa até hoje, em que cada pedal tem três posições.',
      'Com ela, a harpa entrou de vez na orquestra romântica, com Berlioz, Wagner e Tchaikovsky, e ganhou repertório solo e de câmara com Debussy, Ravel e Fauré.',
    ],
    timeline: [
      {
        year: 'c. 3000 a.C.',
        text: 'Harpas aparecem na arte do Egito e da Mesopotâmia.',
      },
      {
        year: 'Idade Média',
        text: 'Instrumento de bardos e símbolo da Irlanda.',
      },
      {
        year: '1810',
        text: 'Érard patenteia a harpa de pedais de dupla ação.',
      },
      {
        year: '1904–1905',
        text: 'Debussy e Ravel escrevem obras-chave para harpa.',
      },
    ],
    repertoire:
      'Handel escreveu um concerto para harpa, Mozart o Concerto para flauta e harpa, K. 299. Debussy (Danses sacrée et profane), Ravel (Introdução e Allegro) e Fauré deram à harpa obras de câmara essenciais. Na orquestra, está nos balés de Tchaikovsky e nas óperas de Wagner.',
    listenFirst: [
      {
        composer: 'Wolfgang Amadeus Mozart',
        work: 'Concerto para flauta e harpa, K. 299',
        workId: '6866910ae541852612e00297',
        note: 'Escrito para um duque flautista e sua filha harpista, em Paris.',
      },
      {
        composer: 'Maurice Ravel',
        work: 'Introdução e Allegro',
        workId: '68689a464d7d23294215890a',
        note: 'Harpa, quarteto de cordas, flauta e clarinete numa peça luminosa.',
      },
      {
        composer: 'Claude Debussy',
        work: 'Danses sacrée et profane',
        workId: '6864bc2f8f2800416032a441',
        note: 'Duas danças, uma solene e outra leve, para harpa e cordas.',
      },
      {
        composer: 'Piotr Tchaikovsky',
        work: 'O Quebra-Nozes: Valsa das Flores',
        workId: '6875b54dabb1ea4be867daf4',
        note: 'Começa com uma cadência longa da harpa sozinha.',
      },
    ],
    didYouKnow: [
      'A harpa aparece no brasão da Irlanda e é o símbolo da cerveja Guinness, que registrou o desenho virado para o outro lado.',
      'A Introdução e Allegro de Ravel foi encomendada pela fábrica Érard para mostrar sua harpa de pedais, e as Danses de Debussy pela concorrente Pleyel, para promover uma harpa cromática que acabou não pegando.',
    ],
  },
  {
    key: 'guitar',
    name: 'Violão',
    when: 'Espanha, século XVI',
    lede: 'O violão, a guitarra clássica, é o instrumento de cordas mais tocado do mundo. Saiu das ruas e dos salões espanhóis para as salas de concerto no século XX, e no Brasil ganhou uma tradição própria.',
    howItWorks:
      'Tem seis cordas, hoje de náilon, afinadas em mi, lá, ré, sol, si e mi. O músico belisca as cordas com os dedos e as unhas da mão direita e aperta as cordas contra os trastes com a esquerda. O tampo, quase sempre de abeto ou cedro, é reforçado por dentro com varetas de madeira em forma de leque, que definem boa parte do som.',
    story: [
      'Na Espanha do século XVI, a vihuela, de cordas duplas, tinha repertório refinado, e ao mesmo tempo uma guitarra menor, de quatro e depois cinco ordens de cordas, era tocada em toda parte. Por volta de 1800, o instrumento passou a ter seis cordas simples, e Fernando Sor, em Paris e Londres, e Mauro Giuliani, em Viena, escreveram para ele.',
      'O formato moderno veio do construtor espanhol Antonio de Torres, que, a partir de 1850, aumentou o corpo e fixou o leque de varetas. Francisco Tárrega criou a técnica moderna e peças como Recuerdos de la Alhambra. No século XX, Andrés Segovia levou o violão às grandes salas e pediu obras a compositores como Villa-Lobos, Castelnuovo-Tedesco e Manuel Ponce. Depois da Segunda Guerra, as cordas de náilon substituíram as de tripa.',
      'No Brasil, o violão está na base do choro, do samba e da bossa nova e também tem tradição de concerto. Villa-Lobos escreveu os Doze Estudos e os Cinco Prelúdios, e violonistas como Dilermando Reis, Garoto, Baden Powell e o Duo Assad circularam entre o popular e o erudito.',
    ],
    timeline: [
      {
        year: 'séc. XVI',
        text: 'Vihuela e guitarra de quatro ordens na Espanha.',
      },
      { year: 'c. 1800', text: 'O violão de seis cordas simples.' },
      { year: 'c. 1850', text: 'Antonio de Torres define o violão moderno.' },
      { year: '1939', text: 'Joaquín Rodrigo compõe o Concierto de Aranjuez.' },
    ],
    repertoire:
      'Sor, Giuliani e Tárrega formam a base clássica e romântica. No século XX, Villa-Lobos, Rodrigo, Ponce, Britten (Nocturnal), Brouwer e Piazzolla ampliaram o repertório. Muita música barroca para alaúde, inclusive de Bach, é tocada no violão.',
    listenFirst: [
      {
        composer: 'Francisco Tárrega',
        work: 'Recuerdos de la Alhambra',
        workId: '686debc1c3a93a29566ccbef',
        note: 'O trêmulo, uma nota repetida rapidíssimo, imita uma fonte de água.',
      },
      {
        composer: 'Joaquín Rodrigo',
        work: 'Concierto de Aranjuez: Adagio',
        composerId: '685f3042c6bd886c5b4988f3',
        note: 'O corne inglês e o violão dividem uma das melodias mais famosas do século.',
      },
      {
        composer: 'Heitor Villa-Lobos',
        work: 'Prelúdio nº 1',
        workId: '686d92dbe3de9a37f27c539c',
        note: 'Uma melodia nos baixos, com o sabor das serestas cariocas.',
      },
      {
        composer: 'Agustín Barrios',
        work: 'La Catedral',
        workId: '68694b9c4d7d23294215ad65',
        note: 'Três movimentos inspirados numa catedral de Montevidéu.',
      },
    ],
    didYouKnow: [
      'Villa-Lobos aprendeu violão contra a vontade da mãe, que via com maus olhos as rodas de choro do Rio, onde ele tocou na juventude.',
      'As primeiras cordas de náilon foram desenvolvidas pela DuPont em parceria com o fabricante Albert Augustine, com testes feitos por Segovia, que não encontrava boas cordas de tripa durante a guerra.',
    ],
  },
  {
    key: 'flute',
    name: 'Flauta',
    when: 'Pré-história; flauta moderna em 1847',
    lede: 'Flautas de osso com mais de 35 mil anos estão entre os instrumentos mais antigos já encontrados. A flauta transversal moderna, de metal e cheia de chaves, é de 1847.',
    howItWorks:
      'A flauta não tem palheta. O músico sopra por cima de um orifício, como quem faz soar uma garrafa, e o ar se divide na borda e faz vibrar a coluna de ar dentro do tubo. Os dedos abrem e fecham orifícios por meio de chaves, mudando o comprimento dessa coluna e, com ele, a nota. Soprando mais forte e com a boca mais tensa, a flauta salta para a região aguda.',
    story: [
      'Na caverna de Hohle Fels, na Alemanha, arqueólogos encontraram uma flauta feita de osso de abutre com mais de 35 mil anos. Flautas de vários tipos existiram em quase todas as culturas. Na Europa, a flauta doce, tocada na vertical, dominou a Renascença, e a transversal, de madeira e com uma chave só, ganhou espaço no Barroco.',
      'O rei Frederico, o Grande, da Prússia, tocava flauta, compunha para ela e tinha como professor Johann Joachim Quantz, que escreveu um tratado famoso sobre o instrumento. Bach escreveu uma Partita para flauta solo, e Mozart, que dizia não gostar muito dela, deixou dois concertos e um quarteto.',
      'Em 1847, o flautista e ourives alemão Theobald Boehm criou a flauta de metal com tubo cilíndrico e um sistema de chaves que permite tocar afinado em todas as tonalidades. É a flauta que se usa até hoje. No século XX, Debussy escreveu Syrinx para flauta sozinha, e no Brasil a flauta é a voz principal do choro, com mestres como Pixinguinha e Altamiro Carrilho.',
    ],
    timeline: [
      {
        year: 'c. 35000 a.C.',
        text: 'Flauta de osso de abutre de Hohle Fels.',
      },
      {
        year: 'Renascença',
        text: 'A flauta doce domina a música instrumental.',
      },
      {
        year: 'séc. XVIII',
        text: 'A transversal barroca, de madeira, na corte prussiana.',
      },
      { year: '1847', text: 'Theobald Boehm cria a flauta moderna de metal.' },
    ],
    repertoire:
      'Bach, Telemann, Quantz e Vivaldi no Barroco; Mozart no Clássico; Debussy, Ravel, Poulenc, Prokofiev e Varèse (Density 21.5) no século XX. Na orquestra, solos marcantes no Prélude à l’après-midi d’un faune e em Daphnis et Chloé.',
    listenFirst: [
      {
        composer: 'Claude Debussy',
        work: 'Prélude à l’après-midi d’un faune',
        workId: '686dad4ac3a93a29566cbe15',
        note: 'Abre com a flauta sozinha numa melodia que não se decide.',
      },
      {
        composer: 'Claude Debussy',
        work: 'Syrinx',
        workId: '687512ecfed73ac7cb1c05f3',
        note: 'Três minutos para flauta solo, sobre o deus Pã.',
      },
      {
        composer: 'Wolfgang Amadeus Mozart',
        work: 'Concerto para flauta nº 1, K. 313',
        workId: '686686c8e541852612e00068',
        note: 'Leve e elegante, um retrato do estilo clássico.',
      },
      {
        composer: 'Pixinguinha',
        work: 'Carinhoso',
        note: 'O choro que é quase um hino brasileiro, com a flauta à frente.',
      },
    ],
    didYouKnow: [
      'Na orquestra, a flauta tem um parente menor e mais agudo, o flautim, que soa uma oitava acima e atravessa a orquestra inteira mesmo em tutti.',
      'Density 21.5, de Varèse, tem esse nome por causa da densidade da platina, de que era feita a flauta do solista que a encomendou.',
    ],
  },
  {
    key: 'oboe',
    name: 'Oboé',
    when: 'Corte francesa, por volta de 1650',
    lede: 'O oboé tem um som penetrante e expressivo, que se ouve no meio de toda a orquestra. É ele que dá a nota para todos afinarem antes do concerto.',
    howItWorks:
      'O oboé usa uma palheta dupla: duas lâminas finas de cana amarradas uma contra a outra, que vibram quando o músico sopra entre elas. A palheta fica presa no alto de um tubo cônico de madeira, quase sempre de granadilha, com chaves de metal. Cada oboísta costuma fazer as próprias palhetas à mão, e elas mudam muito o som.',
    story: [
      'O oboé descende da charamela, um instrumento barulhento de palheta dupla usado ao ar livre na Idade Média. Por volta de 1650, músicos da corte de Luís XIV, como os da família Hotteterre, criaram um instrumento mais suave, em três partes, para tocar dentro dos palácios. O nome vem do francês hautbois, madeira alta.',
      'O novo oboé se espalhou rápido. No Barroco, Bach o usou em quase todas as cantatas, muitas vezes ao lado da voz, e Vivaldi, Albinoni e Marcello escreveram concertos para ele. No Clássico, Mozart compôs o Concerto em dó maior e o Quarteto com oboé.',
      'No século XIX, recebeu um sistema de chaves mais completo, e no século XX ganhou obras de Richard Strauss, Poulenc e Britten. A família inclui o oboé d’amore, mais grave, e o corne inglês, que não é inglês nem trompa.',
    ],
    timeline: [
      {
        year: 'Idade Média',
        text: 'A charamela, de palheta dupla, toca ao ar livre.',
      },
      { year: 'c. 1650', text: 'Nasce o oboé na corte de Luís XIV.' },
      {
        year: '1777',
        text: 'Mozart escreve o Concerto para oboé em dó maior.',
      },
      { year: '1945', text: 'Richard Strauss compõe seu Concerto para oboé.' },
    ],
    repertoire:
      'As cantatas e Paixões de Bach, os concertos de Vivaldi, Marcello e Albinoni, o Concerto de Mozart, o de Strauss, as sonatas de Poulenc e as Seis Metamorfoses segundo Ovídio, de Britten, para oboé sozinho.',
    listenFirst: [
      {
        composer: 'Alessandro Marcello',
        work: 'Concerto para oboé em ré menor: Adagio',
        workId: '686b891c4206d8332943fa26',
        note: 'Uma melodia tão bonita que Bach a transcreveu para cravo.',
      },
      {
        composer: 'Wolfgang Amadeus Mozart',
        work: 'Concerto para oboé em dó maior, K. 314',
        workId: '686b88844206d8332943fa07',
        note: 'Alegre e virtuosístico, cheio de ornamentos.',
      },
      {
        composer: 'Piotr Tchaikovsky',
        work: 'O Lago dos Cisnes: tema dos cisnes',
        workId: '68713852d4375027987db272',
        note: 'O oboé canta o tema principal do balé.',
      },
      {
        composer: 'Richard Strauss',
        work: 'Concerto para oboé',
        workId: '686b8a6d4206d8332943fa72',
        note: 'Escrito no fim da Segunda Guerra, quase sem pausas para respirar.',
      },
    ],
    didYouKnow: [
      'O oboé dá o lá para a orquestra afinar porque sua afinação é estável e o som se destaca entre os outros instrumentos.',
      'O Concerto de Strauss nasceu de uma pergunta de um soldado americano, John de Lancie, oboísta, que o visitou em 1945 e perguntou se ele já tinha pensado em escrever para o instrumento.',
    ],
  },
  {
    key: 'clarinet',
    name: 'Clarinete',
    when: 'Nuremberg, por volta de 1700',
    lede: 'O clarinete é o mais jovem das madeiras da orquestra e um dos mais versáteis. Vai do sussurro quase inaudível ao grito, e passou pela música de concerto, pelo jazz, pelo klezmer e pelo choro.',
    howItWorks:
      'Usa uma palheta simples, presa a uma boquilha, que vibra contra ela quando o músico sopra. O tubo é cilíndrico, e isso faz o clarinete saltar não para a oitava, como a flauta e o oboé, mas para a nota doze graus acima. Por isso ele tem registros com timbres bem diferentes: o grave, escuro e quente, chamado chalumeau, e o médio e agudo, mais brilhantes.',
    story: [
      'Por volta de 1700, em Nuremberg, Johann Christoph Denner acrescentou uma chave a um instrumento simples chamado chalumeau e criou o clarinete. O nome vem de clarino, o registro agudo do trompete, que o novo instrumento lembrava.',
      'Mozart ajudou a firmar o clarinete na música de concerto. Encantado pelo som do clarinetista Anton Stadler, escreveu para ele o Quinteto, K. 581, e o Concerto, K. 622, uma de suas últimas obras. No século XIX, Carl Maria von Weber escreveu concertos para Heinrich Baermann, e Brahms, já pensando em parar de compor, voltou a escrever ao ouvir Richard Mühlfeld e deixou quatro obras-primas para clarinete.',
      'No século XX, o clarinete virou estrela do jazz com Benny Goodman, que encomendou obras a Bartók e Copland. A Rhapsody in Blue, de Gershwin, abre com um glissando de clarinete famoso. No Brasil, é um dos instrumentos centrais do choro, com Abel Ferreira e Paulo Moura.',
    ],
    timeline: [
      { year: 'c. 1700', text: 'Denner cria o clarinete em Nuremberg.' },
      {
        year: '1789–1791',
        text: 'Mozart escreve o Quinteto e o Concerto para Stadler.',
      },
      { year: '1891', text: 'Brahms volta a compor por causa de Mühlfeld.' },
      { year: '1924', text: 'O glissando que abre a Rhapsody in Blue.' },
    ],
    repertoire:
      'Mozart, Weber e Brahms formam o núcleo clássico e romântico. No século XX: Debussy (Première Rhapsodie), Stravinsky (Três Peças), Poulenc, Copland, Bartók (Contrastes) e Messiaen (Abîme des oiseaux).',
    listenFirst: [
      {
        composer: 'Wolfgang Amadeus Mozart',
        work: 'Concerto para clarinete, K. 622: Adagio',
        workId: '6864459e8f28004160328ccd',
        note: 'Uma das melodias mais serenas de Mozart.',
      },
      {
        composer: 'Johannes Brahms',
        work: 'Quinteto para clarinete, op. 115',
        workId: '686447458f28004160328d23',
        note: 'Outonal e nostálgico, escrito para Mühlfeld.',
      },
      {
        composer: 'George Gershwin',
        work: 'Rhapsody in Blue',
        workId: '686e0394c3a93a29566cd0f9',
        note: 'O clarinete sobe deslizando por duas oitavas logo no começo.',
      },
      {
        composer: 'Olivier Messiaen',
        work: 'Quarteto para o fim do tempo: Abîme des oiseaux',
        composerId: '685ee607c6bd886c5b497da5',
        note: 'Clarinete sozinho, entre silêncios e cantos de pássaros.',
      },
    ],
    didYouKnow: [
      'O glissando da Rhapsody in Blue nasceu num ensaio: o clarinetista da banda de Paul Whiteman, Ross Gorman, fez a escala deslizando por brincadeira, e Gershwin pediu que ficasse assim.',
      'Mozart escreveu o Concerto para um clarinete especial de Stadler, que descia mais no grave. A partitura original se perdeu, e o que se toca hoje é uma adaptação para o clarinete comum.',
    ],
  },
  {
    key: 'bassoon',
    name: 'Fagote',
    when: 'Europa, século XVI',
    lede: 'O fagote é o baixo das madeiras. Com um tubo de mais de dois metros dobrado ao meio, pode ser engraçado, melancólico ou misterioso, e tem um dos solos mais famosos do século XX.',
    howItWorks:
      'Como o oboé, usa uma palheta dupla, presa a um tubo curvo de metal, o tudel. O tubo de madeira tem cerca de dois metros e meio e é dobrado em U para caber nas mãos. O músico fecha orifícios com os dedos e aciona muitas chaves, inclusive com os polegares. O contrafagote, primo maior, desce uma oitava abaixo e é o instrumento mais grave da orquestra.',
    story: [
      'O fagote descende do dulciano, instrumento de palheta dupla da Renascença feito de um só bloco de madeira. No século XVII, ganhou partes separadas e o formato que conhecemos.',
      'No Barroco, dobrava o baixo contínuo junto com o violoncelo, e Vivaldi escreveu dezenas de concertos para ele, mais do que para qualquer outro instrumento de sopro. Mozart compôs seu Concerto para fagote aos dezoito anos. No século XIX, fabricantes alemães, como Heckel, e franceses desenvolveram sistemas diferentes de chaves, que existem até hoje.',
      'Os compositores aproveitaram suas muitas personalidades: Dukas o usou para as vassouras enfeitiçadas de O Aprendiz de Feiticeiro, Prokofiev para o avô de Pedro e o Lobo, e Stravinsky abriu A Sagração da Primavera com o fagote tocando no limite agudo, num som estranho que poucos reconheceram.',
    ],
    timeline: [
      { year: 'séc. XVI', text: 'O dulciano, de uma peça só.' },
      { year: 'séc. XVII', text: 'O fagote em partes separadas.' },
      { year: '1774', text: 'Mozart escreve o Concerto para fagote.' },
      { year: '1913', text: 'O solo agudo que abre a Sagração da Primavera.' },
    ],
    repertoire:
      'Os concertos de Vivaldi, o de Mozart, o de Weber; a Sonata de Saint-Saëns; solos célebres na orquestra em Dukas, Stravinsky, Tchaikovsky (Sinfonia nº 4) e Ravel (Boléro).',
    listenFirst: [
      {
        composer: 'Igor Stravinsky',
        work: 'A Sagração da Primavera: introdução',
        workId: '6875c17fabb1ea4be867dd7b',
        note: 'O fagote sozinho, tão agudo que parece outro instrumento.',
      },
      {
        composer: 'Paul Dukas',
        work: 'O Aprendiz de Feiticeiro',
        note: 'As vassouras marcham ao som dos fagotes.',
      },
      {
        composer: 'Wolfgang Amadeus Mozart',
        work: 'Concerto para fagote, K. 191',
        workId: '6863591e204a67621b0bffd8',
        note: 'Mozart aos dezoito anos, brincando com saltos e graves.',
      },
      {
        composer: 'Camille Saint-Saëns',
        work: 'Sonata para fagote e piano',
        workId: '68635b84204a67621b0c005b',
        note: 'Uma das últimas obras do compositor, lírica e leve.',
      },
    ],
    didYouKnow: [
      'Na estreia da Sagração, conta-se que Saint-Saëns, ao ouvir o começo, perguntou que instrumento era aquele e saiu da sala.',
      'Vivaldi escreveu cerca de quarenta concertos para fagote, provavelmente para músicos e alunas do Ospedale della Pietà, em Veneza.',
    ],
  },
  {
    key: 'horn',
    name: 'Trompa',
    when: 'Corte francesa, por volta de 1650',
    lede: 'A trompa nasceu nas caçadas e virou o metal mais versátil da orquestra. Seu som redondo pode soar heroico, distante ou nostálgico, e casa tanto com os metais quanto com as madeiras.',
    howItWorks:
      'O som nasce dos lábios do músico, que vibram dentro do bocal, como em todos os metais. O tubo, enrolado em círculos, tem cerca de quatro metros, e a campana fica virada para trás. As válvulas desviam o ar por trechos extras de tubo e mudam a nota. A mão direita, dentro da campana, ajusta a afinação e o timbre e pode até abafar o som.',
    story: [
      'A trompa de caça, um tubo enrolado sem válvulas, entrou na música de concerto no fim do século XVII. Essa trompa natural só tocava as notas de uma série harmônica, e para mudar de tonalidade o músico trocava pedaços de tubo, os crooks.',
      'No século XVIII, trompistas descobriram que, colocando a mão dentro da campana em posições diferentes, conseguiam tocar notas intermediárias. Com essa técnica, Mozart escreveu quatro concertos para o amigo Joseph Leutgeb, e Beethoven e Brahms escreveram solos difíceis para a trompa natural.',
      'As válvulas, patenteadas na Alemanha em 1818, permitiram tocar todas as notas com facilidade. A orquestra romântica passou a usar quatro trompas ou mais, e Wagner, Richard Strauss, Mahler e Tchaikovsky lhes deram alguns dos solos mais famosos do repertório.',
    ],
    timeline: [
      { year: 'c. 1650', text: 'A trompa de caça entra na música de corte.' },
      { year: 'c. 1760', text: 'A técnica da mão na campana.' },
      {
        year: '1783–1791',
        text: 'Os quatro concertos de Mozart para Leutgeb.',
      },
      { year: '1818', text: 'Patente das válvulas, na Alemanha.' },
    ],
    repertoire:
      'Os concertos de Mozart e de Richard Strauss, o Trio op. 40 de Brahms, solos na orquestra de Beethoven, Brahms, Tchaikovsky, Wagner e Mahler. Muitas trilhas de cinema dão à trompa as melodias heroicas.',
    listenFirst: [
      {
        composer: 'Wolfgang Amadeus Mozart',
        work: 'Concerto para trompa nº 4, K. 495: rondó',
        workId: '6867e16beb4bea6e4b755def',
        note: 'O final que imita uma caçada a cavalo.',
      },
      {
        composer: 'Piotr Tchaikovsky',
        work: 'Sinfonia nº 5: segundo movimento',
        workId: '687504acfed73ac7cb1c026b',
        note: 'Um solo de trompa longo e terno sobre as cordas.',
      },
      {
        composer: 'Richard Strauss',
        work: 'Till Eulenspiegel',
        workId: '6875f39fabb1ea4be867e841',
        note: 'A trompa apresenta o malandro Till logo no começo.',
      },
      {
        composer: 'Johannes Brahms',
        work: 'Trio para trompa, violino e piano, op. 40',
        workId: '6867e2a1eb4bea6e4b755e33',
        note: 'Escrito para a trompa natural, que Brahms preferia.',
      },
    ],
    didYouKnow: [
      'Nos manuscritos dos concertos para Leutgeb, Mozart deixou piadas: anotações como “força, seu burro” e tinta de cores diferentes para provocar o amigo.',
      'A trompa é o único metal tocado com a campana virada para trás, e por isso o som chega ao público refletido pela parede do fundo do palco.',
    ],
  },
  {
    key: 'trumpet',
    name: 'Trompete',
    when: 'Egito antigo, há mais de 3 mil anos',
    lede: 'Trompetes anunciaram reis, batalhas e festas por milênios. Na orquestra, dão brilho e força aos momentos de triunfo, e no século XX ganharam outra vida no jazz.',
    howItWorks:
      'O músico vibra os lábios no bocal, e o tubo de metal, com cerca de um metro e meio enrolado, amplifica o som. Três válvulas abrem trechos extras de tubo e permitem tocar todas as notas. Variando a tensão dos lábios e a força do sopro, o trompetista escolhe as notas de cada série. Surdinas encaixadas na campana mudam o timbre, do abafado ao metálico.',
    story: [
      'No túmulo de Tutancâmon, no Egito, foram encontrados dois trompetes, um de prata e um de bronze, com mais de três mil anos. Durante a Idade Média e a Renascença, o trompete era instrumento de cerimônia e de guerra, tocado por músicos de corte junto com os tímpanos.',
      'No Barroco, o trompete natural, sem válvulas, chegava às notas agudas em que a série harmônica fica mais próxima, o registro clarino. Bach e Handel escreveram partes brilhantes e dificílimas para ele, como no Concerto de Brandemburgo nº 2.',
      'Em 1796, Haydn compôs um concerto para o trompete de chaves de Anton Weidinger, que já tocava todas as notas. As válvulas chegaram no século XIX, e o trompete moderno ganhou solos célebres em Mahler, Mussorgsky e Ravel. No jazz, Louis Armstrong, Miles Davis e Wynton Marsalis, que também grava repertório clássico, fizeram do trompete uma voz única.',
    ],
    timeline: [
      { year: 'c. 1320 a.C.', text: 'Os trompetes do túmulo de Tutancâmon.' },
      { year: 'Barroco', text: 'O registro clarino do trompete natural.' },
      {
        year: '1796',
        text: 'Haydn escreve o concerto para o trompete de chaves.',
      },
      {
        year: 'séc. XIX',
        text: 'As válvulas tornam todas as notas possíveis.',
      },
    ],
    repertoire:
      'Bach (Brandemburgo nº 2, Oratório de Natal), Handel (Messias), os concertos de Haydn e Hummel, e solos orquestrais em Mahler (Sinfonia nº 5), Mussorgsky/Ravel (Quadros de uma Exposição) e Stravinsky.',
    listenFirst: [
      {
        composer: 'Joseph Haydn',
        work: 'Concerto para trompete: final',
        workId: '68764cd1abb1ea4be867fdda',
        note: 'Alegre e virtuosístico, para o primeiro trompete que tocava todas as notas.',
      },
      {
        composer: 'Jeremiah Clarke',
        work: 'Prince of Denmark’s March',
        workId: '686d9ff0c3a93a29566cbb40',
        note: 'A conhecida “Trumpet Voluntary”, por muito tempo atribuída a Purcell.',
      },
      {
        composer: 'Modest Mussorgsky / Maurice Ravel',
        work: 'Quadros de uma Exposição: Promenade',
        workId: '686d30c8e3de9a37f27c419c',
        note: 'O trompete sozinho abre a obra.',
      },
      {
        composer: 'Gustav Mahler',
        work: 'Sinfonia nº 5: Marcha fúnebre',
        workId: '68750437fed73ac7cb1c0252',
        note: 'Começa com um chamado solitário de trompete.',
      },
    ],
    didYouKnow: [
      'Os trompetes de Tutancâmon foram tocados numa transmissão da BBC em 1939. No ensaio, o de prata rachou quando o músico encaixou nele um bocal moderno.',
      'Por séculos, os trompetistas de corte formaram uma guilda fechada, e era proibido ensinar o ofício a quem não fosse dela.',
    ],
  },
  {
    key: 'timpani',
    name: 'Tímpanos',
    when: 'Europa, século XV',
    lede: 'Os tímpanos são os tambores afinados da orquestra. Além de marcar o ritmo, tocam notas definidas e podem sustentar o drama de uma sinfonia inteira.',
    howItWorks:
      'Cada tímpano é uma grande bacia de cobre coberta por uma pele, de animal ou plástica. Quanto mais esticada a pele, mais aguda a nota. Nos tímpanos modernos, um pedal estica ou solta a pele, e o músico muda a afinação no meio da música. Baquetas com cabeças de feltro, madeira ou outros materiais mudam o som, do macio ao seco.',
    story: [
      'Os tímpanos vieram do Oriente Médio, onde tambores de bacia, os naqqara, acompanhavam exércitos a cavalo. No século XV, chegaram às cortes europeias, sempre em par com os trompetes, como símbolo de poder.',
      'No Barroco, entraram na orquestra com os trompetes, tocando em geral duas notas, a tônica e a dominante, e marcando os momentos festivos. Haydn, Mozart e Beethoven passaram a usá-los também para criar tensão e surpresa.',
      'No século XIX, Berlioz pediu vários timpanistas ao mesmo tempo, e no fim do século surgiram os tímpanos de pedal, que mudam de nota rapidamente. Compositores como Bartók passaram a escrever glissandos e melodias para eles.',
    ],
    timeline: [
      { year: 'séc. XV', text: 'Chegam às cortes europeias com os trompetes.' },
      { year: 'Barroco', text: 'Entram na orquestra em par.' },
      {
        year: '1830',
        text: 'Berlioz usa quatro timpanistas na Sinfonia Fantástica.',
      },
      { year: 'fim do séc. XIX', text: 'Os tímpanos de pedal.' },
    ],
    repertoire:
      'Os tímpanos estão em quase todo o repertório sinfônico. Momentos marcantes: Haydn (Sinfonia nº 103), Beethoven (Concerto para violino e Sinfonia nº 9), Berlioz (Sinfonia Fantástica), Richard Strauss (Assim falou Zaratustra) e Bartók (Música para cordas, percussão e celesta).',
    listenFirst: [
      {
        composer: 'Joseph Haydn',
        work: 'Sinfonia nº 103, “Rufo de tímpano”',
        workId: '68714598d4375027987db58b',
        note: 'A sinfonia começa com um rufo de tímpano sozinho.',
      },
      {
        composer: 'Ludwig van Beethoven',
        work: 'Concerto para violino: início',
        workId: '687877ed30e79c884ed67a8b',
        note: 'Cinco batidas suaves de tímpano abrem o concerto.',
      },
      {
        composer: 'Richard Strauss',
        work: 'Assim falou Zaratustra: introdução',
        workId: '686240352d0344907e76e1a3',
        note: 'Os tímpanos respondem aos metais no nascer do sol mais famoso da música.',
      },
      {
        composer: 'Hector Berlioz',
        work: 'Sinfonia Fantástica: Cena no campo',
        workId: '68713f88d4375027987db40f',
        note: 'No fim, quatro timpanistas imitam um trovão distante.',
      },
    ],
    didYouKnow: [
      'No scherzo da Nona Sinfonia, Beethoven afinou os tímpanos em oitava, coisa rara na época, e o tímpano chega a interromper a orquestra.',
      'Timpanistas costumam encostar o ouvido na pele, em silêncio, para conferir a afinação enquanto a orquestra toca.',
    ],
  },
  {
    key: 'voice',
    name: 'Voz',
    when: 'Desde sempre',
    lede: 'A voz é o instrumento mais antigo e o único que todo mundo carrega. Quase toda a música ocidental começou cantada, e a voz continua no centro da ópera, do coral e da canção.',
    howItWorks:
      'O ar dos pulmões faz vibrar as pregas vocais, na laringe, e a garganta, a boca e o nariz moldam e amplificam o som. O canto lírico treina a respiração e o espaço interno para projetar a voz sobre uma orquestra sem microfone. As vozes se dividem por extensão e timbre: soprano, mezzo-soprano e contralto nas femininas; tenor, barítono e baixo nas masculinas.',
    story: [
      'O canto gregoriano, a polifonia renascentista e o madrigal foram escritos para vozes, muitas vezes sem instrumento nenhum. Com a ópera, por volta de 1600, nasceu a figura do cantor solista e, com ela, técnicas para cantar mais alto, mais longo e com mais agilidade.',
      'Nos séculos XVII e XVIII, os castrati, cantores castrados ainda meninos para manter a voz aguda, foram as grandes estrelas da ópera, como Farinelli. No século XIX, o bel canto italiano de Rossini, Bellini e Donizetti valorizou a beleza do som e a agilidade, e Verdi e Wagner exigiram vozes mais potentes. Ao mesmo tempo, Schubert e Schumann criaram a canção de câmara para voz e piano.',
      'No século XX, a voz explorou novos caminhos, do canto falado de Schoenberg às técnicas estendidas. O movimento de música antiga trouxe de volta o contratenor, homem que canta no registro agudo, e grupos vocais pequenos recuperaram o repertório medieval e renascentista.',
    ],
    timeline: [
      { year: 'séc. IX', text: 'O canto gregoriano é organizado.' },
      { year: 'c. 1600', text: 'Nasce a ópera e o cantor solista.' },
      { year: 'séc. XVIII', text: 'A era dos castrati.' },
      { year: 'séc. XIX', text: 'O bel canto e o lied.' },
    ],
    repertoire:
      'Missas e motetos da Renascença, óperas de Monteverdi a Puccini, oratórios de Bach e Handel, lieder de Schubert, Schumann e Brahms, canções de Fauré e Debussy. No Brasil, a canção de câmara de Villa-Lobos, Camargo Guarnieri e Francisco Mignone.',
    listenFirst: [
      {
        composer: 'Wolfgang Amadeus Mozart',
        work: 'A Flauta Mágica: Der Hölle Rache',
        workId: '686530ebc4eec286b4aaf569',
        note: 'A ária da Rainha da Noite sobe até um fá agudíssimo.',
      },
      {
        composer: 'Giacomo Puccini',
        work: 'Turandot: Nessun dorma',
        workId: '68765344abb1ea4be867ff49',
        note: 'A ária de tenor mais famosa do mundo.',
      },
      {
        composer: 'Georges Bizet',
        work: 'Carmen: Habanera',
        workId: '6863e9be204a67621b0c1be0',
        note: 'Uma mezzo-soprano sedutora sobre um ritmo de dança cubana.',
      },
      {
        composer: 'Heitor Villa-Lobos',
        work: 'Bachianas Brasileiras nº 5: Ária',
        workId: '68633e1a204a67621b0bfa15',
        note: 'A soprano canta sem palavras sobre oito violoncelos.',
      },
    ],
    didYouKnow: [
      'Farinelli cantou durante cerca de dez anos, toda noite, as mesmas quatro canções para o rei Filipe V da Espanha, que sofria de depressão.',
      'A ária da Rainha da Noite foi escrita para a cunhada de Mozart, Josepha Hofer, que tinha uma extensão aguda fora do comum.',
    ],
  },
];
