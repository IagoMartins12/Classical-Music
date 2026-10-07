/** 3 curiosidades por época, das 300 de utils.ts (musicalFacts). */
export const CURIOSIDADES_EPOCA: Record<
  string,
  { titulo: string; texto: string }[]
> = {
  Medieval: [
    {
      titulo: 'Canto Gregoriano',
      texto:
        'O canto gregoriano, desenvolvido na Idade Média, era totalmente monofônico (uma única melodia) e cantado sem acompanhamento instrumental, criando uma atmosfera transcendental única.',
    },
    {
      titulo: 'Primeira Notação',
      texto:
        "Guido d'Arezzo (c. 991-1033) revolucionou a música ao criar o sistema de notação com pautas de quatro linhas, predecessor do sistema atual de cinco linhas.",
    },
    {
      titulo: 'Trovadores e Trouvères',
      texto:
        'Os trovadores do sul da França e os trouvères do norte criaram as primeiras canções seculares documentadas, estabelecendo tradições que influenciariam toda a música ocidental.',
    },
  ],
  Renascentista: [
    {
      titulo: 'Impressão Musical',
      texto:
        'Ottaviano Petrucci foi o primeiro a imprimir música em moveable type (1501), revolucionando a disseminação de partituras na Europa.',
    },
    {
      titulo: 'Madrigal Renascentista',
      texto:
        'O madrigal renascentista combinava poesia refinada com música polifônica complexa, sendo o equivalente musical da literatura humanística.',
    },
    {
      titulo: 'Imitação Polifônica',
      texto:
        'A técnica de imitação polifônica, onde cada voz repete o mesmo tema em momentos diferentes, foi aperfeiçoada no Renascimento.',
    },
  ],
  Barroco: [
    {
      titulo: 'Bach e seus Filhos',
      texto:
        'Johann Sebastian Bach teve 20 filhos, e quatro deles (Wilhelm Friedemann, Carl Philipp Emanuel, Johann Christoph Friedrich e Johann Christian) tornaram-se compositores renomados.',
    },
    {
      titulo: 'Nascimento da Ópera',
      texto:
        'A primeira ópera conhecida, "Dafne" de Jacopo Peri (1598), marcou o nascimento de um gênero que dominaria a música por séculos.',
    },
    {
      titulo: 'Baixo Contínuo',
      texto:
        'O baixo contínuo (basso continuo) era a "espinha dorsal" da música barroca, com cravo ou órgão realizando harmonias a partir de cifras.',
    },
  ],
  Clássico: [
    {
      titulo: 'Mozart Precoce',
      texto:
        'Mozart começou a compor aos 5 anos e escreveu sua primeira sinfonia aos 8 anos, demonstrando um talento extraordinário desde a infância.',
    },
    {
      titulo: 'Forma Sonata',
      texto:
        'A forma sonata clássica (exposição-desenvolvimento-recapitulação) tornou-se a estrutura fundamental da música instrumental.',
    },
    {
      titulo: 'Revolução do Piano',
      texto:
        'O fortepiano substituiu o cravo por permitir dinâmicas graduais, revolucionando a expressividade musical no período clássico.',
    },
  ],
  Romântico: [
    {
      titulo: 'Amor e Música',
      texto:
        'Schumann dedicou seu "Ano das Canções" (1840) a Clara Wieck, compondo 138 lieder no ano de seu casamento.',
    },
    {
      titulo: 'Música Programática',
      texto:
        'A "Sinfonia Fantástica" de Berlioz revolucionou a música sinfônica ao contar uma história específica através de música.',
    },
    {
      titulo: 'Liszt Popstar',
      texto:
        'Franz Liszt causava "Lisztomania" - histeria coletiva em seus concertos, sendo considerado o primeiro popstar da música clássica.',
    },
  ],
  Modernismo: [
    {
      titulo: 'Debussy Impressionista',
      texto:
        'Debussy odiava ser chamado de "impressionista", preferindo "simbolista", mas sua música evoca cores e atmosferas como a pintura impressionista.',
    },
    {
      titulo: 'La Mer',
      texto:
        '"La Mer" de Debussy foi composta longe do mar, no interior da França, mostrando como a música pode capturar essências emocionais.',
    },
    {
      titulo: 'Escalas Exóticas',
      texto:
        'Debussy usou escalas pentafônicas, octatônicas e de tons inteiros, expandindo o vocabulário harmônico para além do sistema tonal.',
    },
  ],
};
