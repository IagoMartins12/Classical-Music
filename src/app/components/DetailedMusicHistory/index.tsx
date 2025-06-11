// DetailedMusicHistory.tsx - Versão completa em TypeScript
import React, { useState, useCallback, memo, JSX } from 'react';
import {
  FiGlobe,
  FiMusic,
  FiUser,
  FiBookOpen,
  FiLock,
  FiClock,
  FiStar,
  FiFileText,
  FiTrendingUp,
  FiChevronDown,
} from 'react-icons/fi';
import {
  GiMusicalNotes,
  GiScrollQuill,
  GiGrandPiano,
  GiViolin,
} from 'react-icons/gi';

// Interfaces TypeScript
interface AccordionSectionProps {
  id: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  gradient: string;
  children: React.ReactNode;
  isExpanded: boolean;
  onToggle: (id: string) => void;
}

interface SectionProps {
  isExpanded: boolean;
  onToggle: (sectionId: string) => void;
}

interface Era {
  period: string;
  years: string;
  sub: string;
  gradient: string;
}

interface Composer {
  name: string;
  description: string;
  gradient: string;
}

// Componente AccordionSection otimizado
const AccordionSection = memo<AccordionSectionProps>(
  ({ id, icon, title, subtitle, gradient, children, isExpanded, onToggle }) => {
    const handleToggle = useCallback(() => {
      onToggle(id);
    }, [id, onToggle]);

    return (
      <div className="mb-6 classical-card overflow-hidden hover:shadow-theme-glow transition-all duration-200 will-change-transform">
        {/* Header - Always Visible */}
        <div
          className="p-6 cursor-pointer select-none group"
          onClick={handleToggle}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div
                className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform duration-200 will-change-transform`}
              >
                {icon}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-theme-primary classical-title group-hover:text-brand-primary transition-colors duration-200">
                  {title}
                </h3>
                <p className="text-theme-tertiary text-sm">{subtitle}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-theme-tertiary text-sm font-medium">
                {isExpanded ? 'Recolher' : 'Expandir'}
              </span>
              <div
                className={`w-8 h-8 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center transition-transform duration-300 will-change-transform ${
                  isExpanded ? 'rotate-180' : 'rotate-0'
                }`}
              >
                <FiChevronDown className="w-4 h-4 text-theme-primary" />
              </div>
            </div>
          </div>
        </div>

        {/* Content - Expandable com animação otimizada */}
        <div
          className={`transition-all duration-300 ease-out overflow-hidden will-change-auto ${
            isExpanded
              ? 'max-h-screen opacity-100 transform scale-y-100'
              : 'max-h-0 opacity-0 transform scale-y-95'
          }`}
          style={{
            transformOrigin: 'top',
          }}
        >
          <div className="px-6 pb-6 border-t border-theme-secondary">
            <div className="pt-6 transform transition-transform duration-200">
              {children}
            </div>
          </div>
        </div>
      </div>
    );
  }
);

AccordionSection.displayName = 'AccordionSection';

// Componente para Timeline Overview
const TimelineOverview = memo<SectionProps>(({ isExpanded, onToggle }) => {
  const eras: Era[] = [
    {
      period: 'Música Antiga',
      years: 'c. 500-1600',
      sub: 'Medieval e Renascentista',
      gradient: 'from-accent-gold to-brand-secondary',
    },
    {
      period: 'Prática Comum',
      years: 'c. 1600-1910',
      sub: 'Barroco, Clássico e Romântico',
      gradient: 'from-accent-blue to-accent-purple',
    },
    {
      period: 'Moderno/Contemporâneo',
      years: 'c. 1890-presente',
      sub: 'Século XX e XXI',
      gradient: 'from-accent-green to-accent-blue',
    },
  ];

  return (
    <AccordionSection
      id="timeline-overview"
      icon={<FiLock className="w-6 h-6 text-theme-primary" />}
      title="Períodos Históricos"
      subtitle="Divisão cronológica da evolução musical"
      gradient="from-accent-blue to-accent-purple"
      isExpanded={isExpanded}
      onToggle={onToggle}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {eras.map((era, index) => (
          <div
            key={index}
            className="classical-card-simple p-6 group hover:scale-102 transition-all duration-200 will-change-transform"
          >
            <div
              className={`w-8 h-8 bg-gradient-to-br ${era.gradient} rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-200`}
            >
              <FiClock className="w-4 h-4 text-theme-primary" />
            </div>
            <h4 className="font-bold text-lg text-theme-primary classical-title mb-2 group-hover:text-brand-primary transition-colors duration-200">
              {era.period}
            </h4>
            <p
              className={`text-brand-primary font-semibold mb-2 bg-gradient-to-r ${era.gradient} bg-clip-text text-transparent`}
            >
              {era.years}
            </p>
            <p className="text-theme-secondary text-sm">{era.sub}</p>
          </div>
        ))}
      </div>
    </AccordionSection>
  );
});

TimelineOverview.displayName = 'TimelineOverview';

// Componente para Origins
const OriginsSection = memo<SectionProps>(({ isExpanded, onToggle }) => (
  <AccordionSection
    id="origins"
    icon={<GiScrollQuill className="w-6 h-6 text-theme-primary" />}
    title="As Origens Antigas"
    subtitle="Fundamentos da música ocidental"
    gradient="from-accent-gold to-brand-secondary"
    isExpanded={isExpanded}
    onToggle={onToggle}
  >
    <div className="classical-body text-theme-secondary">
      <p className="text-lg leading-relaxed mb-6">
        A origem da música clássica ocidental estão na música litúrgica cristã,
        embora tenha influências que datam da Grécia Antiga; o desenvolvimento
        de determinadas tonalidades e escalas já havia sido estabelecido por
        antigos gregos como Aristoxeno e Pitágoras. Pitágoras criou um sistema
        de afinação, e ajudou a codificar a notação musical em uso na época.
        Antigos instrumentos usados na Grécia, como o aulo (um instrumento de
        palheta) e a lira (semelhante a uma pequena harpa) levaram ao eventual
        desenvolvimento dos instrumentos usados atualmente nas orquestras
        clássicas ocidentais.
      </p>
      <div className="bg-gradient-to-r from-accent-gold/10 to-brand-secondary/10 border-l-4 border-accent-gold rounded-xl p-6 my-6 transform transition-all duration-200 hover:scale-101">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-accent-gold to-brand-secondary rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
            <FiStar className="w-4 h-4 text-theme-primary" />
          </div>
          <div>
            <p className="text-theme-primary font-medium">
              <strong>Curiosidade:</strong> Pouco restou da música da
              Antiguidade em termos de evidências musicais, e a maior parte veio
              do mundo grego. A transmissão era oral e sujeita a mudanças a cada
              retransmissão.
            </p>
          </div>
        </div>
      </div>
    </div>
  </AccordionSection>
));

OriginsSection.displayName = 'OriginsSection';

// Componente para Medieval Period
const MedievalSection = memo<SectionProps>(({ isExpanded, onToggle }) => (
  <AccordionSection
    id="medieval"
    icon={<GiMusicalNotes className="w-6 h-6 text-theme-primary" />}
    title="O Mundo Medieval (c. 500-1400)"
    subtitle="Nascimento da música ocidental organizada"
    gradient="from-accent-purple to-accent-red"
    isExpanded={isExpanded}
    onToggle={onToggle}
  >
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="classical-body text-theme-secondary">
        <h4 className="text-xl font-semibold text-theme-primary classical-title mb-4 flex items-center space-x-2">
          <div className="w-6 h-6 bg-gradient-to-br from-accent-blue to-accent-purple rounded-lg flex items-center justify-center">
            <FiMusic className="w-3 h-3 text-theme-primary" />
          </div>
          <span>O Canto Gregoriano</span>
        </h4>
        <p className="mb-4 leading-relaxed">
          Imagine-se em um mosteiro no século IX. O silêncio é quebrado apenas
          pelo eco de vozes masculinas entoando melodias simples, mas
          profundamente espirituais. Este era o mundo do
          <strong className="text-brand-primary"> canto gregoriano</strong>,
          onde a música tinha um propósito único: elevar a alma a Deus.
        </p>
        <p className="mb-4 leading-relaxed">
          Não havia instrumentos, não havia harmonias complexas - apenas uma
          linha melódica pura que seguia o texto latino das orações. O{' '}
          <strong className="text-brand-primary">canto monofônico</strong> foi a
          forma dominante até cerca de 1100.
        </p>
      </div>
      <div className="classical-body text-theme-secondary">
        <h4 className="text-xl font-semibold text-theme-primary classical-title mb-4 flex items-center space-x-2">
          <div className="w-6 h-6 bg-gradient-to-br from-accent-green to-accent-blue rounded-lg flex items-center justify-center">
            <FiTrendingUp className="w-3 h-3 text-theme-primary" />
          </div>
          <span>A Revolução da Polifonia</span>
        </h4>
        <p className="mb-4 leading-relaxed">
          Tudo mudou quando alguns músicos ousados começaram a adicionar uma
          segunda voz ao canto gregoriano. Esta técnica, chamada{' '}
          <strong className="text-brand-primary">organum</strong>, foi o
          primeiro passo em direção à polifonia.
        </p>
        <p className="mb-4 leading-relaxed">
          A <strong className="text-brand-primary">Escola de Notre-Dame</strong>
          , em Paris, tornou-se o centro desta revolução musical com
          compositores como{' '}
          <strong className="text-brand-primary">Léonin e Pérotin</strong>, que
          criaram as primeiras composições polifônicas verdadeiramente
          sofisticadas.
        </p>
      </div>
    </div>
    <div className="mt-8 bg-gradient-to-r from-accent-purple/10 to-accent-red/10 border-l-4 border-accent-purple rounded-xl p-6">
      <div className="flex items-start space-x-3">
        <div className="w-8 h-8 bg-gradient-to-br from-accent-purple to-accent-red rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
          <GiViolin className="w-4 h-4 text-theme-primary" />
        </div>
        <div>
          <h4 className="font-semibold text-theme-primary mb-2 classical-title">
            Instrumentos Típicos do Período
          </h4>
          <p className="text-theme-secondary leading-relaxed">
            <strong className="text-accent-purple">Cordas:</strong> harpa,
            alaúde, viela, saltério •
            <strong className="text-accent-purple"> Sopros:</strong> flauta
            doce, charamela, trompete, gaita de foles •
            <strong className="text-accent-purple"> Teclados:</strong> órgão
            (principalmente em igrejas)
          </p>
        </div>
      </div>
    </div>
  </AccordionSection>
));

MedievalSection.displayName = 'MedievalSection';

// Componente para Renaissance
const RenaissanceSection = memo<SectionProps>(({ isExpanded, onToggle }) => (
  <AccordionSection
    id="renaissance"
    icon={<FiGlobe className="w-6 h-6 text-theme-primary" />}
    title="O Renascimento: A Humanização da Música (c. 1400-1600)"
    subtitle="Era do humanismo e da expressão individual"
    gradient="from-accent-green to-accent-blue"
    isExpanded={isExpanded}
    onToggle={onToggle}
  >
    <div className="classical-body text-theme-secondary">
      <p className="text-lg leading-relaxed mb-6">
        Se o período medieval foi dominado pela espiritualidade, o Renascimento
        trouxe algo novo: o{' '}
        <strong className="text-brand-primary">humanismo</strong>. A música
        deixou de ser apenas um meio de comunicação com o divino e tornou-se uma
        expressão da experiência humana.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="classical-card-simple p-6 group hover:scale-102 transition-all duration-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-accent-green to-accent-blue rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
              <FiUser className="w-4 h-4 text-theme-primary" />
            </div>
            <h4 className="text-xl font-semibold text-theme-primary classical-title group-hover:text-brand-primary transition-colors duration-200">
              Os Mestres Franco-Flamengos
            </h4>
          </div>
          <p className="leading-relaxed">
            <strong className="text-brand-primary">Josquin des Prez</strong>,
            talvez o maior compositor desta época, criou uma música de uma
            beleza e expressividade que ainda hoje nos emociona. Sua "Ave
            Maria... virgo serena" é um exemplo perfeito de como a técnica
            polifônica imitativa podia criar momentos de pura magia musical.
          </p>
        </div>
        <div className="classical-card-simple p-6 group hover:scale-102 transition-all duration-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-accent-blue to-accent-purple rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
              <GiMusicalNotes className="w-4 h-4 text-theme-primary" />
            </div>
            <h4 className="text-xl font-semibold text-theme-primary classical-title group-hover:text-brand-primary transition-colors duration-200">
              O Madrigal Italiano
            </h4>
          </div>
          <p className="leading-relaxed">
            Esta forma musical secular permitia aos compositores{' '}
            <strong className="text-brand-primary">"pintar" com música</strong>{' '}
            o significado das palavras. Se o texto falava de pássaros cantando,
            a música imitava o canto dos pássaros. Era uma revolução na
            expressividade musical.
          </p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-accent-green/10 to-accent-blue/10 border-l-4 border-accent-green rounded-xl p-6">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-accent-green to-accent-blue rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
            <FiFileText className="w-4 h-4 text-theme-primary" />
          </div>
          <div>
            <h4 className="font-semibold text-theme-primary mb-2 classical-title">
              A Revolução da Imprensa
            </h4>
            <p className="text-theme-secondary leading-relaxed">
              A invenção da imprensa por Gutenberg mudou tudo. Pela primeira
              vez, partituras podiam ser reproduzidas em massa, espalhando a
              música muito além dos centros de produção. Um compositor em Roma
              podia ter suas obras tocadas em Londres ou Praga.
            </p>
          </div>
        </div>
      </div>
    </div>
  </AccordionSection>
));

RenaissanceSection.displayName = 'RenaissanceSection';

// Componente para Baroque
const BaroqueSection = memo<SectionProps>(({ isExpanded, onToggle }) => {
  const composers: Composer[] = [
    {
      name: 'Johann Sebastian Bach',
      description:
        'Levou a música barroca ao seu ápice absoluto. "O Cravo Bem Temperado" demonstrou que o sistema temperado funcionava em todas as tonalidades. Suas fugas são exercícios de matemática musical que transbordam espiritualidade.',
      gradient: 'from-accent-red to-accent-purple',
    },
    {
      name: 'George Frideric Handel',
      description:
        'Criador de oratórios monumentais. "Messias" tornou-se a obra coral mais famosa da história, com seu "Hallelujah" fazendo multidões se levantarem espontaneamente há quase 300 anos.',
      gradient: 'from-accent-purple to-accent-blue',
    },
    {
      name: 'Antonio Vivaldi',
      description:
        'Revolucionou o concerto. Suas "Quatro Estações" foram as primeiras obras verdadeiramente programáticas, onde cada movimento pinta musicalmente cenas específicas das estações do ano.',
      gradient: 'from-accent-blue to-accent-green',
    },
  ];

  return (
    <AccordionSection
      id="baroque"
      icon={<FiMusic className="w-6 h-6 text-theme-primary" />}
      title="O Barroco: A Era dos Gigantes (c. 1600-1750)"
      subtitle="Grandiosidade e virtuosismo técnico"
      gradient="from-accent-red to-accent-purple"
      isExpanded={isExpanded}
      onToggle={onToggle}
    >
      <div className="classical-body text-theme-secondary">
        <p className="text-lg leading-relaxed mb-6">
          O século XVII trouxe uma revolução completa. Os compositores barrocos
          não estavam interessados na polidez renascentista - eles queriam{' '}
          <strong className="text-brand-primary">
            emocionar, surpreender, impressionar
          </strong>
          . Era a época das grandes cortes absolutistas, onde reis competiam em
          magnificência.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {composers.map((composer, index) => (
            <div
              key={index}
              className="classical-card-simple p-6 group hover:scale-102 transition-all duration-200 will-change-transform"
            >
              <div className="flex items-center space-x-3 mb-3">
                <div
                  className={`w-8 h-8 bg-gradient-to-br ${composer.gradient} rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-200`}
                >
                  <FiUser className="w-4 h-4 text-theme-primary" />
                </div>
                <h4 className="font-semibold text-theme-primary classical-title group-hover:text-brand-primary transition-colors duration-200">
                  {composer.name}
                </h4>
              </div>
              <p className="text-sm leading-relaxed">{composer.description}</p>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-r from-accent-red/10 to-accent-purple/10 border-l-4 border-accent-red rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-accent-red to-accent-purple rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
              <GiGrandPiano className="w-4 h-4 text-theme-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-theme-primary mb-2 classical-title">
                O Nascimento da Ópera
              </h4>
              <p className="text-theme-secondary leading-relaxed">
                A ópera nasceu da tentativa dos intelectuais florentinos de
                recriar o drama grego antigo. "L'Orfeo" de{' '}
                <strong className="text-brand-primary">Monteverdi</strong>{' '}
                (1607) mostrou que a música podia contar histórias de forma mais
                poderosa que qualquer outra arte.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AccordionSection>
  );
});

BaroqueSection.displayName = 'BaroqueSection';

// Componente para Classical
const ClassicalSection = memo<SectionProps>(({ isExpanded, onToggle }) => {
  const composers: Composer[] = [
    {
      name: 'Joseph Haydn',
      description:
        'O "Pai da Sinfonia" criou 104 sinfonias, evoluindo de obras simples até as monumentais "Sinfonias de Londres". Tinha um senso de humor único - a Sinfonia "Surpresa" tem um acorde forte no meio do movimento lento.',
      gradient: 'from-accent-blue to-accent-purple',
    },
    {
      name: 'Wolfgang Amadeus Mozart',
      description:
        'Representou a perfeição clássica em sua forma mais pura. Morto aos 35 anos, criou obras de qualidade incomparável. Suas óperas combinam sofisticação musical com profundidade psicológica nunca vista antes.',
      gradient: 'from-accent-purple to-accent-red',
    },
    {
      name: 'Ludwig van Beethoven',
      description:
        'Revolucionou o conceito de música. Suas nove sinfonias são uma jornada através da condição humana. A 3ª "Heroica" representava ideais revolucionários e mudou para sempre o rumo da música.',
      gradient: 'from-accent-red to-accent-green',
    },
  ];

  return (
    <AccordionSection
      id="classical"
      icon={<FiUser className="w-6 h-6 text-theme-primary" />}
      title="O Classicismo: A Busca pela Perfeição (c. 1750-1820)"
      subtitle="Equilíbrio, clareza e perfeição formal"
      gradient="from-accent-blue to-accent-purple"
      isExpanded={isExpanded}
      onToggle={onToggle}
    >
      <div className="classical-body text-theme-secondary">
        <p className="text-lg leading-relaxed mb-6">
          Depois dos excessos barrocos, o século XVIII trouxe uma busca pela{' '}
          <strong className="text-brand-primary">
            clareza, equilíbrio e perfeição formal
          </strong>
          . Era a época do Iluminismo, quando a razão reinava suprema.
          <strong className="text-brand-primary"> Viena</strong> tornou-se a
          capital musical do mundo.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {composers.map((composer, index) => (
            <div
              key={index}
              className="classical-card-simple p-6 group hover:scale-102 transition-all duration-200 will-change-transform"
            >
              <div className="flex items-center space-x-3 mb-3">
                <div
                  className={`w-8 h-8 bg-gradient-to-br ${composer.gradient} rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-200`}
                >
                  <FiStar className="w-4 h-4 text-theme-primary" />
                </div>
                <h4 className="font-semibold text-theme-primary classical-title group-hover:text-brand-primary transition-colors duration-200">
                  {composer.name}
                </h4>
              </div>
              <p className="text-sm leading-relaxed">{composer.description}</p>
            </div>
          ))}
        </div>
      </div>
    </AccordionSection>
  );
});

ClassicalSection.displayName = 'ClassicalSection';

// Componente para Romantic
const RomanticSection = memo<SectionProps>(({ isExpanded, onToggle }) => {
  const composers: Composer[] = [
    {
      name: 'Franz Schubert',
      description:
        'Criou o lied alemão. Seus ciclos "A Bela Moleira" e "Viagem de Inverno" são jornadas através da psique humana, explorando amor, perda, solidão e morte com honestidade emocional devastadora.',
      gradient: 'from-accent-red to-accent-purple',
    },
    {
      name: 'Frédéric Chopin',
      description:
        'Transformou o piano em uma orquestra inteira. Suas polonaises são manifestos políticos disfarçados de música de dança, carregando toda a melancolia e orgulho da Polônia ocupada.',
      gradient: 'from-accent-purple to-accent-blue',
    },
    {
      name: 'Franz Liszt',
      description:
        'Levou o virtuosismo a extremos nunca imaginados. Inventou o poema sinfônico, onde a orquestra conta uma história. Suas "Rapsódias Húngaras" celebram a música de seu país.',
      gradient: 'from-accent-blue to-accent-green',
    },
    {
      name: 'Richard Wagner',
      description:
        'Criou "dramas musicais" contínuos onde música e drama se fundiam. "O Anel do Nibelungo" são 16 horas de epopeia sobre poder, amor e redenção que mudaram o teatro musical.',
      gradient: 'from-accent-green to-accent-red',
    },
  ];

  return (
    <AccordionSection
      id="romantic"
      icon={<FiMusic className="w-6 h-6 text-theme-primary" />}
      title="O Romantismo: A Música do Coração (c. 1800-1910)"
      subtitle="Individualismo, emoção e expressão pessoal"
      gradient="from-accent-red to-accent-purple"
      isExpanded={isExpanded}
      onToggle={onToggle}
    >
      <div className="classical-body text-theme-secondary">
        <p className="text-lg leading-relaxed mb-6">
          O século XIX foi a era do{' '}
          <strong className="text-brand-primary">
            indivíduo, da emoção, da paixão
          </strong>
          . Os compositores românticos queriam expressar suas almas, contar suas
          histórias pessoais, fazer chorar e sonhar. Era também a época dos
          virtuoses.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {composers.map((composer, index) => (
            <div
              key={index}
              className="classical-card-simple p-6 group hover:scale-102 transition-all duration-200 will-change-transform"
            >
              <div className="flex items-center space-x-3 mb-3">
                <div
                  className={`w-8 h-8 bg-gradient-to-br ${composer.gradient} rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-200`}
                >
                  <FiUser className="w-4 h-4 text-theme-primary" />
                </div>
                <h4 className="font-semibold text-theme-primary classical-title group-hover:text-brand-primary transition-colors duration-200">
                  {composer.name}
                </h4>
              </div>
              <p className="text-sm leading-relaxed">{composer.description}</p>
            </div>
          ))}
        </div>
      </div>
    </AccordionSection>
  );
});

RomanticSection.displayName = 'RomanticSection';

// Componente para Modern
const ModernSection = memo<SectionProps>(({ isExpanded, onToggle }) => (
  <AccordionSection
    id="modern"
    icon={<FiBookOpen className="w-6 h-6 text-theme-primary" />}
    title="Século XX: Revolução e Experimentação"
    subtitle="Quebra de paradigmas e novas linguagens"
    gradient="from-accent-purple to-accent-blue"
    isExpanded={isExpanded}
    onToggle={onToggle}
  >
    <div className="classical-body text-theme-secondary">
      <p className="text-lg leading-relaxed mb-6">
        O século XX começou com uma obra que chocou o mundo:{' '}
        <strong className="text-brand-primary">
          "A Sagração da Primavera"
        </strong>
        de Stravinsky. Na estreia (1913), o público parisiense literalmente
        brigou durante a apresentação. Era o início de uma nova era de
        experimentação radical.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="space-y-6">
          <h4 className="text-xl font-semibold text-theme-primary classical-title mb-4 flex items-center space-x-2">
            <div className="w-6 h-6 bg-gradient-to-br from-accent-purple to-accent-blue rounded-lg flex items-center justify-center">
              <FiTrendingUp className="w-3 h-3 text-theme-primary" />
            </div>
            <span>Revoluções Harmônicas</span>
          </h4>
          <div className="space-y-4">
            <div className="classical-card-simple p-4 group hover:scale-102 transition-all duration-200">
              <p className="text-sm leading-relaxed">
                <strong className="text-brand-primary">
                  Arnold Schoenberg:
                </strong>{' '}
                Questionou os fundamentos da música ocidental com o sistema
                dodecafônico, onde todas as 12 notas têm igual importância.
              </p>
            </div>
            <div className="classical-card-simple p-4 group hover:scale-102 transition-all duration-200">
              <p className="text-sm leading-relaxed">
                <strong className="text-brand-primary">Claude Debussy:</strong>{' '}
                Criou o impressionismo musical, pintando atmosferas e climas
                sonoros onde a harmonia tradicional se dissolvia em nuances
                colorísticas.
              </p>
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <h4 className="text-xl font-semibold text-theme-primary classical-title mb-4 flex items-center space-x-2">
            <div className="w-6 h-6 bg-gradient-to-br from-accent-green to-accent-blue rounded-lg flex items-center justify-center">
              <FiGlobe className="w-3 h-3 text-theme-primary" />
            </div>
            <span>Identidades Nacionais</span>
          </h4>
          <div className="space-y-4">
            <div className="classical-card-simple p-4 group hover:scale-102 transition-all duration-200">
              <p className="text-sm leading-relaxed">
                <strong className="text-brand-primary">Béla Bartók:</strong>{' '}
                Coletou canções folclóricas dos vilarejos, criando composições
                simultaneamente ultramodernas e enraizadas na tradição
                camponesa.
              </p>
            </div>
            <div className="classical-card-simple p-4 group hover:scale-102 transition-all duration-200">
              <p className="text-sm leading-relaxed">
                <strong className="text-brand-primary">
                  Heitor Villa-Lobos:
                </strong>{' '}
                Criou síntese única entre tradição europeia e identidade
                brasileira. Suas "Bachianas Brasileiras" fundem Bach com o
                chorinho carioca.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-accent-purple/10 to-accent-blue/10 border-l-4 border-accent-purple rounded-xl p-6">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-accent-purple to-accent-blue rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
            <FiStar className="w-4 h-4 text-theme-primary" />
          </div>
          <div>
            <h4 className="font-semibold text-theme-primary mb-2 classical-title">
              Experimentalismo Radical
            </h4>
            <p className="text-theme-secondary leading-relaxed">
              <strong className="text-brand-primary">John Cage</strong> levou a
              experimentação aos extremos com "4'33"" - quatro minutos e trinta
              e três segundos de "silêncio" onde a música é formada pelos sons
              ambientais. Cage questionava a própria natureza da música e da
              escuta.
            </p>
          </div>
        </div>
      </div>
    </div>
  </AccordionSection>
));

ModernSection.displayName = 'ModernSection';

// Componente para Contemporary Music
const ContemporarySection = memo<SectionProps>(({ isExpanded, onToggle }) => (
  <AccordionSection
    id="contemporary"
    icon={<FiGlobe className="w-6 h-6 text-theme-primary" />}
    title="A Música Hoje: Tradição e Inovação"
    subtitle="Convergência de estilos e tecnologias"
    gradient="from-accent-blue to-accent-green"
    isExpanded={isExpanded}
    onToggle={onToggle}
  >
    <div className="classical-body text-theme-secondary">
      <p className="text-lg leading-relaxed mb-6">
        Vivemos em uma época única na história da música. Temos acesso
        simultâneo a toda a tradição musical ocidental - podemos ouvir Bach em
        instrumentos de época, Beethoven dirigido pelos maiores maestros,
        compositores contemporâneos experimentando com tecnologia digital.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="classical-card-simple p-6 group hover:scale-102 transition-all duration-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-accent-blue to-accent-green rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
              <FiClock className="w-4 h-4 text-theme-primary" />
            </div>
            <h4 className="font-semibold text-theme-primary classical-title group-hover:text-brand-primary transition-colors duration-200">
              Retorno à Simplicidade
            </h4>
          </div>
          <p className="text-sm leading-relaxed">
            Compositores como{' '}
            <strong className="text-brand-primary">Arvo Pärt</strong> e{' '}
            <strong className="text-brand-primary">Henryk Górecki</strong>{' '}
            retornaram a uma simplicidade quase medieval, criando música de
            espiritualidade profunda em reação aos excessos vanguardistas.
          </p>
        </div>
        <div className="classical-card-simple p-6 group hover:scale-102 transition-all duration-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-accent-green to-accent-blue rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
              <FiTrendingUp className="w-4 h-4 text-theme-primary" />
            </div>
            <h4 className="font-semibold text-theme-primary classical-title group-hover:text-brand-primary transition-colors duration-200">
              Tecnologia e IA
            </h4>
          </div>
          <p className="text-sm leading-relaxed">
            Computadores podem gerar música, algoritmos podem compor sinfonias,
            a inteligência artificial pode criar no estilo de qualquer
            compositor do passado. Mas ainda precisamos de músicos humanos para
            dar vida a estas criações.
          </p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-accent-blue/10 to-accent-green/10 border-l-4 border-accent-blue rounded-xl p-6 text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-accent-blue to-accent-green rounded-2xl flex items-center justify-center">
            <FiStar className="w-6 h-6 text-theme-primary" />
          </div>
        </div>
        <p className="text-theme-primary text-lg font-medium classical-subtitle italic">
          "A música clássica não é um museu de relíquias do passado - é uma
          tradição viva que continua evoluindo, questionando-se,
          reinventando-se. Cada geração redescobre seus clássicos e cria suas
          próprias obras-primas."
        </p>
      </div>
    </div>
  </AccordionSection>
));

ContemporarySection.displayName = 'ContemporarySection';

// Componente para Popular Music
const PopularMusicSection = memo<SectionProps>(({ isExpanded, onToggle }) => (
  <AccordionSection
    id="popular-music"
    icon={<FiMusic className="w-6 h-6 text-theme-primary" />}
    title="Música Erudita e Popular: Uma Relação Complexa"
    subtitle="Fronteiras que se dissolvem na qualidade artística"
    gradient="from-accent-green to-accent-blue"
    isExpanded={isExpanded}
    onToggle={onToggle}
  >
    <div className="classical-body text-theme-secondary">
      <p className="text-lg leading-relaxed mb-6">
        A relação entre música erudita e popular é uma questão polêmica,
        principalmente sobre o valor estético de cada uma. Contudo, muitas peças
        da música popular são reconhecidamente de elevado valor artístico - os
        "clássicos" dos Beatles, Genesis, Jacques Brel, Edith Piaf e Billie
        Holiday.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="classical-card-simple p-6 group hover:scale-102 transition-all duration-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-accent-green to-accent-blue rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
              <FiUser className="w-4 h-4 text-theme-primary" />
            </div>
            <h4 className="font-semibold text-theme-primary classical-title group-hover:text-brand-primary transition-colors duration-200">
              Características da Música Erudita
            </h4>
          </div>
          <ul className="text-sm space-y-2 leading-relaxed">
            <li className="flex items-start space-x-2">
              <div className="w-1.5 h-1.5 bg-accent-green rounded-full mt-2 flex-shrink-0"></div>
              <span>Maior complexidade harmônica e estrutural</span>
            </li>
            <li className="flex items-start space-x-2">
              <div className="w-1.5 h-1.5 bg-accent-green rounded-full mt-2 flex-shrink-0"></div>
              <span>Mais modulações (mudanças de tonalidade)</span>
            </li>
            <li className="flex items-start space-x-2">
              <div className="w-1.5 h-1.5 bg-accent-green rounded-full mt-2 flex-shrink-0"></div>
              <span>Menos repetição de trechos substanciais</span>
            </li>
            <li className="flex items-start space-x-2">
              <div className="w-1.5 h-1.5 bg-accent-green rounded-full mt-2 flex-shrink-0"></div>
              <span>Frases musicais mais vastas e elaboradas</span>
            </li>
            <li className="flex items-start space-x-2">
              <div className="w-1.5 h-1.5 bg-accent-green rounded-full mt-2 flex-shrink-0"></div>
              <span>Obras de maior duração (30 minutos a 3 horas)</span>
            </li>
            <li className="flex items-start space-x-2">
              <div className="w-1.5 h-1.5 bg-accent-green rounded-full mt-2 flex-shrink-0"></div>
              <span>Tradicionalmente instrumentos acústicos</span>
            </li>
          </ul>
        </div>
        <div className="classical-card-simple p-6 group hover:scale-102 transition-all duration-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-accent-blue to-accent-purple rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
              <FiMusic className="w-4 h-4 text-theme-primary" />
            </div>
            <h4 className="font-semibold text-theme-primary classical-title group-hover:text-brand-primary transition-colors duration-200">
              Pontes Entre os Mundos
            </h4>
          </div>
          <ul className="text-sm space-y-2 leading-relaxed">
            <li className="flex items-start space-x-2">
              <div className="w-1.5 h-1.5 bg-accent-blue rounded-full mt-2 flex-shrink-0"></div>
              <span>Jazz com complexidade rítmica única</span>
            </li>
            <li className="flex items-start space-x-2">
              <div className="w-1.5 h-1.5 bg-accent-blue rounded-full mt-2 flex-shrink-0"></div>
              <span>Rock progressivo com estruturas sinfônicas</span>
            </li>
            <li className="flex items-start space-x-2">
              <div className="w-1.5 h-1.5 bg-accent-blue rounded-full mt-2 flex-shrink-0"></div>
              <span>Choro brasileiro, tango, bossa nova</span>
            </li>
            <li className="flex items-start space-x-2">
              <div className="w-1.5 h-1.5 bg-accent-blue rounded-full mt-2 flex-shrink-0"></div>
              <span>Tom Jobim compondo sinfonias</span>
            </li>
            <li className="flex items-start space-x-2">
              <div className="w-1.5 h-1.5 bg-accent-blue rounded-full mt-2 flex-shrink-0"></div>
              <span>Villa-Lobos bebendo do folclore</span>
            </li>
            <li className="flex items-start space-x-2">
              <div className="w-1.5 h-1.5 bg-accent-blue rounded-full mt-2 flex-shrink-0"></div>
              <span>Guitarra elétrica na música contemporânea</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="bg-gradient-to-r from-accent-green/10 to-accent-blue/10 border-l-4 border-accent-green rounded-xl p-6">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-accent-green to-accent-blue rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
            <FiStar className="w-4 h-4 text-theme-primary" />
          </div>
          <div>
            <p className="text-theme-secondary leading-relaxed">
              <strong className="text-brand-primary">Reflexão:</strong>{' '}
              Villa-Lobos já na década de 1930 demonstrou que as barreiras entre
              os dois estilos são muito frágeis ao beber na fonte do Choro, da
              música popular brasileira e de Bach para compor suas Bachianas
              Brasileiras. A qualidade musical está sempre sujeita à avaliação
              subjetiva dos ouvintes do futuro.
            </p>
          </div>
        </div>
      </div>
    </div>
  </AccordionSection>
));

PopularMusicSection.displayName = 'PopularMusicSection';

// Componente principal
export function DetailedMusicHistory(): JSX.Element {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set()
  );

  const toggleSection = useCallback((sectionId: string): void => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  }, []);

  return (
    <div className="w-full bg-gradient-primary py-0 md:py-20 lg:py-20 relative overflow-hidden">
      {/* Background Pattern Otimizado */}
      <div className="absolute inset-0 pointer-events-none opacity-5 will-change-auto">
        <div className="absolute top-40 left-40 w-96 h-96 bg-brand-gradient rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-60 right-60 w-64 h-64 bg-accent-purple/30 rounded-full blur-2xl animate-pulse"
          style={{ animationDelay: '1s' }}
        ></div>
        <div
          className="absolute top-1/3 left-1/4 w-48 h-48 bg-accent-blue/20 rounded-full blur-xl animate-pulse"
          style={{ animationDelay: '2s' }}
        ></div>
      </div>

      {/* Floating musical notes otimizadas */}
      <div className="absolute inset-0 pointer-events-none will-change-auto">
        <div className="absolute top-32 left-16 text-4xl text-brand-primary/10 animate-float">
          <GiMusicalNotes />
        </div>
        <div
          className="absolute bottom-32 right-16 text-3xl text-brand-secondary/10 animate-float"
          style={{ animationDelay: '1s' }}
        >
          <FiMusic />
        </div>
        <div
          className="absolute top-1/2 right-32 text-2xl text-accent-purple/10 animate-float"
          style={{ animationDelay: '2s' }}
        >
          <GiGrandPiano />
        </div>
        <div
          className="absolute bottom-1/2 left-32 text-2xl text-accent-blue/10 animate-float"
          style={{ animationDelay: '0.5s' }}
        >
          <GiViolin />
        </div>
      </div>

      <div className="relative z-10">
        <TimelineOverview
          isExpanded={expandedSections.has('timeline-overview')}
          onToggle={toggleSection}
        />

        <OriginsSection
          isExpanded={expandedSections.has('origins')}
          onToggle={toggleSection}
        />

        <MedievalSection
          isExpanded={expandedSections.has('medieval')}
          onToggle={toggleSection}
        />

        <RenaissanceSection
          isExpanded={expandedSections.has('renaissance')}
          onToggle={toggleSection}
        />

        <BaroqueSection
          isExpanded={expandedSections.has('baroque')}
          onToggle={toggleSection}
        />

        <ClassicalSection
          isExpanded={expandedSections.has('classical')}
          onToggle={toggleSection}
        />

        <RomanticSection
          isExpanded={expandedSections.has('romantic')}
          onToggle={toggleSection}
        />

        <ModernSection
          isExpanded={expandedSections.has('modern')}
          onToggle={toggleSection}
        />

        <ContemporarySection
          isExpanded={expandedSections.has('contemporary')}
          onToggle={toggleSection}
        />

        <PopularMusicSection
          isExpanded={expandedSections.has('popular-music')}
          onToggle={toggleSection}
        />
      </div>

      {/* CSS otimizado para animações */}
      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          25% {
            transform: translateY(-10px) rotate(2deg);
          }
          50% {
            transform: translateY(-5px) rotate(-1deg);
          }
          75% {
            transform: translateY(-15px) rotate(1deg);
          }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .hover\\:scale-102:hover {
          transform: scale(1.02);
        }

        .hover\\:scale-101:hover {
          transform: scale(1.01);
        }

        /* Otimizações para melhor performance */
        .will-change-transform {
          will-change: transform;
        }

        .will-change-auto {
          will-change: auto;
        }
      `}</style>
    </div>
  );
}
