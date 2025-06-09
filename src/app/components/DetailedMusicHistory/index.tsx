import React from 'react';
import { BiGlobe, BiMusic, BiUser } from 'react-icons/bi';
import { BsMusicNote } from 'react-icons/bs';
import { CgLock } from 'react-icons/cg';
import { FaBookOpen, FaScroll } from 'react-icons/fa';

export function DetailedMusicHistory() {
  return (
    <div className="w-full bg-gradient-to-br from-slate-50 to-stone-100 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            A Jornada Completa da Música Clássica
          </h2>
          <p className="text-xl text-gray-700 max-w-4xl mx-auto leading-relaxed">
            Uma viagem através de mais de mil anos de evolução musical, desde os
            mosteiros medievais até as inovações contemporâneas que continuam
            moldando a arte sonora.
          </p>
        </div>

        {/* Timeline Overview */}
        <div className="mb-16 bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center mb-6">
            <CgLock className="h-8 w-8 text-blue-600 mr-3" />
            <h3 className="text-2xl font-bold text-gray-900">
              Períodos Históricos
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                period: 'Música Antiga',
                years: 'c. 500-1600',
                sub: 'Medieval e Renascentista',
              },
              {
                period: 'Prática Comum',
                years: 'c. 1600-1910',
                sub: 'Barroco, Clássico e Romântico',
              },
              {
                period: 'Moderno/Contemporâneo',
                years: 'c. 1890-presente',
                sub: 'Século XX e XXI',
              },
            ].map((era, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-blue-50 to-indigo-100 p-6 rounded-xl"
              >
                <h4 className="font-bold text-lg text-gray-900 mb-2">
                  {era.period}
                </h4>
                <p className="text-blue-700 font-semibold mb-1">{era.years}</p>
                <p className="text-gray-600 text-sm">{era.sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Origins Section */}
        <div className="mb-16 bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center mb-6">
            <FaScroll className="h-8 w-8 text-amber-600 mr-3" />
            <h3 className="text-2xl font-bold text-gray-900">
              As Origens Antigas
            </h3>
          </div>
          <div className="prose prose-lg max-w-none text-gray-700">
            <p className="text-lg leading-relaxed mb-6">
              A origem da música clássica ocidental estão na música litúrgica
              cristã, embora tenha influências que datam da Grécia Antiga; o
              desenvolvimento de determinadas tonalidades e escalas já havia
              sido estabelecido por antigos gregos como Aristoxeno e Pitágoras.
              Pitágoras criou um sistema de afinação, e ajudou a codificar a
              notação musical em uso na época. Antigos instrumentos usados na
              Grécia, como o aulo (um instrumento de palheta) e a lira
              (semelhante a uma pequena harpa) levaram ao eventual
              desenvolvimento dos instrumentos usados atualmente nas orquestras
              clássicas ocidentais. Este período na história da música, que vai
              até a queda do Império Romano (476 d.C.), é chamado de música da
              Antiguidade; pouco restou do período, no entanto, em termos de
              evidências musicais, e a sua maior parte veio do mundo grego.
            </p>
            <div className="bg-amber-50 border-l-4 border-amber-400 p-6 my-6">
              <p className="text-amber-800">
                <strong>Curiosidade:</strong> Pouco restou da música da
                Antiguidade em termos de evidências musicais, e a maior parte
                veio do mundo grego. A transmissão era oral e sujeita a mudanças
                a cada retransmissão.
              </p>
            </div>
          </div>
        </div>

        {/* Medieval Period */}
        <div className="mb-16 bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center mb-6">
            <BsMusicNote className="h-8 w-8 text-purple-600 mr-3" />
            <h3 className="text-2xl font-bold text-gray-900">
              O Mundo Medieval (c. 500-1400)
            </h3>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="prose prose-lg text-gray-700">
              <h4 className="text-xl font-semibold text-gray-900 mb-4">
                O Canto Gregoriano
              </h4>
              <p className="mb-4">
                Imagine-se em um mosteiro no século IX. O silêncio é quebrado
                apenas pelo eco de vozes masculinas entoando melodias simples,
                mas profundamente espirituais. Este era o mundo do
                <strong> canto gregoriano</strong>, onde a música tinha um
                propósito único: elevar a alma a Deus.
              </p>
              <p className="mb-4">
                Não havia instrumentos, não havia harmonias complexas - apenas
                uma linha melódica pura que seguia o texto latino das orações. O{' '}
                <strong>canto monofônico</strong> foi a forma dominante até
                cerca de 1100.
              </p>
            </div>
            <div className="prose prose-lg text-gray-700">
              <h4 className="text-xl font-semibold text-gray-900 mb-4">
                A Revolução da Polifonia
              </h4>
              <p className="mb-4">
                Tudo mudou quando alguns músicos ousados começaram a adicionar
                uma segunda voz ao canto gregoriano. Esta técnica, chamada{' '}
                <strong>organum</strong>, foi o primeiro passo em direção à
                polifonia.
              </p>
              <p className="mb-4">
                A <strong>Escola de Notre-Dame</strong>, em Paris, tornou-se o
                centro desta revolução musical com compositores como{' '}
                <strong>Léonin e Pérotin</strong>, que criaram as primeiras
                composições polifônicas verdadeiramente sofisticadas.
              </p>
            </div>
          </div>
          <div className="mt-8 bg-purple-50 border-l-4 border-purple-400 p-6">
            <h4 className="font-semibold text-purple-900 mb-2">
              Instrumentos Típicos do Período
            </h4>
            <p className="text-purple-800">
              <strong>Cordas:</strong> harpa, alaúde, viela, saltério •
              <strong>Sopros:</strong> flauta doce, charamela, trompete, gaita
              de foles •<strong>Teclados:</strong> órgão (principalmente em
              igrejas)
            </p>
          </div>
        </div>

        {/* Renaissance */}
        <div className="mb-16 bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center mb-6">
            <BiGlobe className="h-8 w-8 text-green-600 mr-3" />
            <h3 className="text-2xl font-bold text-gray-900">
              O Renascimento: A Humanização da Música (c. 1400-1600)
            </h3>
          </div>
          <div className="prose prose-lg max-w-none text-gray-700">
            <p className="text-lg leading-relaxed mb-6">
              Se o período medieval foi dominado pela espiritualidade, o
              Renascimento trouxe algo novo: o <strong>humanismo</strong>. A
              música deixou de ser apenas um meio de comunicação com o divino e
              tornou-se uma expressão da experiência humana.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div>
                <h4 className="text-xl font-semibold text-gray-900 mb-4">
                  Os Mestres Franco-Flamengos
                </h4>
                <p className="mb-4">
                  <strong>Josquin des Prez</strong>, talvez o maior compositor
                  desta época, criou uma música de uma beleza e expressividade
                  que ainda hoje nos emociona. Sua "Ave Maria... virgo serena" é
                  um exemplo perfeito de como a técnica polifônica imitativa
                  podia criar momentos de pura magia musical.
                </p>
              </div>
              <div>
                <h4 className="text-xl font-semibold text-gray-900 mb-4">
                  O Madrigal Italiano
                </h4>
                <p className="mb-4">
                  Esta forma musical secular permitia aos compositores{' '}
                  <strong>"pintar" com música</strong>o significado das
                  palavras. Se o texto falava de pássaros cantando, a música
                  imitava o canto dos pássaros. Era uma revolução na
                  expressividade musical.
                </p>
              </div>
            </div>

            <div className="bg-green-50 border-l-4 border-green-400 p-6">
              <h4 className="font-semibold text-green-900 mb-2">
                A Revolução da Imprensa
              </h4>
              <p className="text-green-800">
                A invenção da imprensa por Gutenberg mudou tudo. Pela primeira
                vez, partituras podiam ser reproduzidas em massa, espalhando a
                música muito além dos centros de produção. Um compositor em Roma
                podia ter suas obras tocadas em Londres ou Praga.
              </p>
            </div>
          </div>
        </div>

        {/* Baroque */}
        <div className="mb-16 bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center mb-6">
            <BiMusic className="h-8 w-8 text-red-600 mr-3" />
            <h3 className="text-2xl font-bold text-gray-900">
              O Barroco: A Era dos Gigantes (c. 1600-1750)
            </h3>
          </div>
          <div className="prose prose-lg max-w-none text-gray-700">
            <p className="text-lg leading-relaxed mb-6">
              O século XVII trouxe uma revolução completa. Os compositores
              barrocos não estavam interessados na polidez renascentista - eles
              queriam <strong>emocionar, surpreender, impressionar</strong>. Era
              a época das grandes cortes absolutistas, onde reis competiam em
              magnificência.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-red-50 p-6 rounded-xl">
                <h4 className="font-semibold text-red-900 mb-3">
                  Johann Sebastian Bach
                </h4>
                <p className="text-red-800 text-sm">
                  Levou a música barroca ao seu ápice absoluto. "O Cravo Bem
                  Temperado" demonstrou que o sistema temperado funcionava em
                  todas as tonalidades. Suas fugas são exercícios de matemática
                  musical que transbordam espiritualidade.
                </p>
              </div>
              <div className="bg-red-50 p-6 rounded-xl">
                <h4 className="font-semibold text-red-900 mb-3">
                  George Frideric Handel
                </h4>
                <p className="text-red-800 text-sm">
                  Criador de oratórios monumentais. "Messias" tornou-se a obra
                  coral mais famosa da história, com seu "Hallelujah" fazendo
                  multidões se levantarem espontaneamente há quase 300 anos.
                </p>
              </div>
              <div className="bg-red-50 p-6 rounded-xl">
                <h4 className="font-semibold text-red-900 mb-3">
                  Antonio Vivaldi
                </h4>
                <p className="text-red-800 text-sm">
                  Revolucionou o concerto. Suas "Quatro Estações" foram as
                  primeiras obras verdadeiramente programáticas, onde cada
                  movimento pinta musicalmente cenas específicas das estações do
                  ano.
                </p>
              </div>
            </div>

            <div className="bg-red-50 border-l-4 border-red-400 p-6">
              <h4 className="font-semibold text-red-900 mb-2">
                O Nascimento da Ópera
              </h4>
              <p className="text-red-800">
                A ópera nasceu da tentativa dos intelectuais florentinos de
                recriar o drama grego antigo. "L'Orfeo" de{' '}
                <strong>Monteverdi</strong> (1607) mostrou que a música podia
                contar histórias de forma mais poderosa que qualquer outra arte.
              </p>
            </div>
          </div>
        </div>

        {/* Classical */}
        <div className="mb-16 bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center mb-6">
            <BiUser className="h-8 w-8 text-blue-600 mr-3" />
            <h3 className="text-2xl font-bold text-gray-900">
              O Classicismo: A Busca pela Perfeição (c. 1750-1820)
            </h3>
          </div>
          <div className="prose prose-lg max-w-none text-gray-700">
            <p className="text-lg leading-relaxed mb-6">
              Depois dos excessos barrocos, o século XVIII trouxe uma busca pela{' '}
              <strong>clareza, equilíbrio e perfeição formal</strong>. Era a
              época do Iluminismo, quando a razão reinava suprema.
              <strong>Viena</strong> tornou-se a capital musical do mundo.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-blue-50 p-6 rounded-xl">
                <h4 className="font-semibold text-blue-900 mb-3">
                  Joseph Haydn
                </h4>
                <p className="text-blue-800 text-sm mb-3">
                  O "Pai da Sinfonia" criou 104 sinfonias, evoluindo de obras
                  simples até as monumentais "Sinfonias de Londres". Tinha um
                  senso de humor único - a Sinfonia "Surpresa" tem um acorde
                  forte no meio do movimento lento.
                </p>
              </div>
              <div className="bg-blue-50 p-6 rounded-xl">
                <h4 className="font-semibold text-blue-900 mb-3">
                  Wolfgang Amadeus Mozart
                </h4>
                <p className="text-blue-800 text-sm mb-3">
                  Representou a perfeição clássica em sua forma mais pura. Morto
                  aos 35 anos, criou obras de qualidade incomparável. Suas
                  óperas combinam sofisticação musical com profundidade
                  psicológica nunca vista antes.
                </p>
              </div>
              <div className="bg-blue-50 p-6 rounded-xl">
                <h4 className="font-semibold text-blue-900 mb-3">
                  Ludwig van Beethoven
                </h4>
                <p className="text-blue-800 text-sm mb-3">
                  Revolucionou o conceito de música. Suas nove sinfonias são uma
                  jornada através da condição humana. A 3ª "Heroica"
                  representava ideais revolucionários e mudou para sempre o rumo
                  da música.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Romantic */}
        <div className="mb-16 bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center mb-6">
            <BiMusic className="h-8 w-8 text-pink-600 mr-3" />
            <h3 className="text-2xl font-bold text-gray-900">
              O Romantismo: A Música do Coração (c. 1800-1910)
            </h3>
          </div>
          <div className="prose prose-lg max-w-none text-gray-700">
            <p className="text-lg leading-relaxed mb-6">
              O século XIX foi a era do{' '}
              <strong>indivíduo, da emoção, da paixão</strong>. Os compositores
              românticos queriam expressar suas almas, contar suas histórias
              pessoais, fazer chorar e sonhar. Era também a época dos virtuoses.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-pink-50 p-6 rounded-xl">
                <h4 className="font-semibold text-pink-900 mb-3">
                  Franz Schubert
                </h4>
                <p className="text-pink-800 text-sm">
                  Criou o <strong>lied alemão</strong>. Seus ciclos "A Bela
                  Moleira" e "Viagem de Inverno" são jornadas através da psique
                  humana, explorando amor, perda, solidão e morte com
                  honestidade emocional devastadora.
                </p>
              </div>
              <div className="bg-pink-50 p-6 rounded-xl">
                <h4 className="font-semibold text-pink-900 mb-3">
                  Frédéric Chopin
                </h4>
                <p className="text-pink-800 text-sm">
                  Transformou o piano em uma orquestra inteira. Suas polonaises
                  são manifestos políticos disfarçados de música de dança,
                  carregando toda a melancolia e orgulho da Polônia ocupada.
                </p>
              </div>
              <div className="bg-pink-50 p-6 rounded-xl">
                <h4 className="font-semibold text-pink-900 mb-3">
                  Franz Liszt
                </h4>
                <p className="text-pink-800 text-sm">
                  Levou o virtuosismo a extremos nunca imaginados. Inventou o{' '}
                  <strong>poema sinfônico</strong>, onde a orquestra conta uma
                  história. Suas "Rapsódias Húngaras" celebram a música de seu
                  país.
                </p>
              </div>
              <div className="bg-pink-50 p-6 rounded-xl">
                <h4 className="font-semibold text-pink-900 mb-3">
                  Richard Wagner
                </h4>
                <p className="text-pink-800 text-sm">
                  Criou "dramas musicais" contínuos onde música e drama se
                  fundiam. "O Anel do Nibelungo" são 16 horas de epopeia sobre
                  poder, amor e redenção que mudaram o teatro musical.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modern/Contemporary */}
        <div className="mb-16 bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center mb-6">
            <FaBookOpen className="h-8 w-8 text-purple-600 mr-3" />
            <h3 className="text-2xl font-bold text-gray-900">
              Século XX: Revolução e Experimentação
            </h3>
          </div>
          <div className="prose prose-lg max-w-none text-gray-700">
            <p className="text-lg leading-relaxed mb-6">
              O século XX começou com uma obra que chocou o mundo:{' '}
              <strong>"A Sagração da Primavera"</strong>
              de Stravinsky. Na estreia (1913), o público parisiense
              literalmente brigou durante a apresentação. Era o início de uma
              nova era de experimentação radical.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div>
                <h4 className="text-xl font-semibold text-gray-900 mb-4">
                  Revoluções Harmônicas
                </h4>
                <div className="space-y-4">
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-purple-800 text-sm">
                      <strong>Arnold Schoenberg:</strong> Questionou os
                      fundamentos da música ocidental com o sistema
                      dodecafônico, onde todas as 12 notas têm igual
                      importância.
                    </p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-purple-800 text-sm">
                      <strong>Claude Debussy:</strong> Criou o impressionismo
                      musical, pintando atmosferas e climas sonoros onde a
                      harmonia tradicional se dissolvia em nuances colorísticas.
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-xl font-semibold text-gray-900 mb-4">
                  Identidades Nacionais
                </h4>
                <div className="space-y-4">
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-purple-800 text-sm">
                      <strong>Béla Bartók:</strong> Coletou canções folclóricas
                      dos vilarejos, criando composições simultaneamente
                      ultramodernas e enraizadas na tradição camponesa.
                    </p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-purple-800 text-sm">
                      <strong>Heitor Villa-Lobos:</strong> Criou síntese única
                      entre tradição europeia e identidade brasileira. Suas
                      "Bachianas Brasileiras" fundem Bach com o chorinho
                      carioca.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 border-l-4 border-purple-400 p-6">
              <h4 className="font-semibold text-purple-900 mb-2">
                Experimentalismo Radical
              </h4>
              <p className="text-purple-800">
                <strong>John Cage</strong> levou a experimentação aos extremos
                com "4'33"" - quatro minutos e trinta e três segundos de
                "silêncio" onde a música é formada pelos sons ambientais. Cage
                questionava a própria natureza da música e da escuta.
              </p>
            </div>
          </div>
        </div>

        {/* Contemporary Music */}
        <div className="mb-16 bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center mb-6">
            <BiGlobe className="h-8 w-8 text-indigo-600 mr-3" />
            <h3 className="text-2xl font-bold text-gray-900">
              A Música Hoje: Tradição e Inovação
            </h3>
          </div>
          <div className="prose prose-lg max-w-none text-gray-700">
            <p className="text-lg leading-relaxed mb-6">
              Vivemos em uma época única na história da música. Temos acesso
              simultâneo a toda a tradição musical ocidental - podemos ouvir
              Bach em instrumentos de época, Beethoven dirigido pelos maiores
              maestros, compositores contemporâneos experimentando com
              tecnologia digital.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className="bg-indigo-50 p-6 rounded-xl">
                <h4 className="font-semibold text-indigo-900 mb-3">
                  Retorno à Simplicidade
                </h4>
                <p className="text-indigo-800 text-sm">
                  Compositores como <strong>Arvo Pärt</strong> e{' '}
                  <strong>Henryk Górecki</strong> retornaram a uma simplicidade
                  quase medieval, criando música de espiritualidade profunda em
                  reação aos excessos vanguardistas.
                </p>
              </div>
              <div className="bg-indigo-50 p-6 rounded-xl">
                <h4 className="font-semibold text-indigo-900 mb-3">
                  Tecnologia e IA
                </h4>
                <p className="text-indigo-800 text-sm">
                  Computadores podem gerar música, algoritmos podem compor
                  sinfonias, a inteligência artificial pode criar no estilo de
                  qualquer compositor do passado. Mas ainda precisamos de
                  músicos humanos para dar vida a estas criações.
                </p>
              </div>
            </div>

            <div className="bg-indigo-50 border-l-4 border-indigo-400 p-6">
              <p className="text-indigo-800 text-lg font-medium">
                "A música clássica não é um museu de relíquias do passado - é
                uma tradição viva que continua evoluindo, questionando-se,
                reinventando-se. Cada geração redescobre seus clássicos e cria
                suas próprias obras-primas."
              </p>
            </div>
          </div>
        </div>

        {/* Relationship with Popular Music */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center mb-6">
            <BiMusic className="h-8 w-8 text-emerald-600 mr-3" />
            <h3 className="text-2xl font-bold text-gray-900">
              Música Erudita e Popular: Uma Relação Complexa
            </h3>
          </div>
          <div className="prose prose-lg max-w-none text-gray-700">
            <p className="text-lg leading-relaxed mb-6">
              A relação entre música erudita e popular é uma questão polêmica,
              principalmente sobre o valor estético de cada uma. Contudo, muitas
              peças da música popular são reconhecidamente de elevado valor
              artístico - os "clássicos" dos Beatles, Genesis, Jacques Brel,
              Edith Piaf e Billie Holiday.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-emerald-50 p-6 rounded-xl">
                <h4 className="font-semibold text-emerald-900 mb-3">
                  Características da Música Erudita
                </h4>
                <ul className="text-emerald-800 text-sm space-y-2">
                  <li>• Maior complexidade harmônica e estrutural</li>
                  <li>• Mais modulações (mudanças de tonalidade)</li>
                  <li>• Menos repetição de trechos substanciais</li>
                  <li>• Frases musicais mais vastas e elaboradas</li>
                  <li>• Obras de maior duração (30 minutos a 3 horas)</li>
                  <li>• Tradicionalmente instrumentos acústicos</li>
                </ul>
              </div>
              <div className="bg-emerald-50 p-6 rounded-xl">
                <h4 className="font-semibold text-emerald-900 mb-3">
                  Pontes Entre os Mundos
                </h4>
                <ul className="text-emerald-800 text-sm space-y-2">
                  <li>• Jazz com complexidade rítmica única</li>
                  <li>• Rock progressivo com estruturas sinfônicas</li>
                  <li>• Choro brasileiro, tango, bossa nova</li>
                  <li>• Tom Jobim compondo sinfonias</li>
                  <li>• Villa-Lobos bebendo do folclore</li>
                  <li>• Guitarra elétrica na música contemporânea</li>
                </ul>
              </div>
            </div>

            <div className="mt-8 bg-emerald-50 border-l-4 border-emerald-400 p-6">
              <p className="text-emerald-800">
                <strong>Reflexão:</strong> Villa-Lobos já na década de 1930
                demonstrou que as barreiras entre os dois estilos são muito
                frágeis ao beber na fonte do Choro, da música popular brasileira
                e de Bach para compor suas Bachianas Brasileiras. A qualidade
                musical está sempre sujeita à avaliação subjetiva dos ouvintes
                do futuro.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
