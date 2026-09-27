// DetailedMusicHistory.tsx - Versão completa em TypeScript
import { useTranslation } from '@/app/context/TranslationContext';
import React, { useState, useCallback, memo, JSX } from 'react';
import { GiGrandPiano, GiViolin } from 'react-icons/gi';
import {
  PiBookOpen,
  PiCaretDown,
  PiClock,
  PiFileText,
  PiGlobe,
  PiLock,
  PiMusicNotes,
  PiScroll,
  PiStar,
  PiTrendUp,
  PiUser,
} from 'react-icons/pi';
import { Stack, Inline } from '@/app/components/ui/Layout';
import { Text } from '@/app/components/ui/Text';
import { Card } from '@/app/components/ui/Card';

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
    const { t } = useTranslation({ sections: ['pages/music-history'] });

    const handleToggle = useCallback(() => {
      onToggle(id);
    }, [id, onToggle]);

    return (
      <div className="mb-6 classical-card overflow-hidden transition-all duration-200 will-change-transform">
        {/* Header - Always Visible */}
        <div
          className="p-2 sm:p-6 cursor-pointer select-none group"
          onClick={handleToggle}
        >
          <div className="flex items-center justify-between">
            <Inline gap={3}>
              <div
                className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform duration-200 will-change-transform`}
              >
                {icon}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-theme-primary classical-title transition-colors duration-200">
                  {title}
                </h3>
                <Text papel="rotulo" tom="fraco" as="p">
                  {subtitle}
                </Text>
              </div>
            </Inline>
            <Inline gap={2}>
              <Text
                papel="rotulo"
                tom="fraco"
                className="font-medium hidden sm:block"
              >
                {isExpanded
                  ? t('detailed_jsx_span_children_0__recolher')
                  : t('detailed_jsx_span_children_0__expandir')}
              </Text>
              <div
                className={`w-8 h-8 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center transition-transform duration-300 will-change-transform ${
                  isExpanded ? 'rotate-180' : 'rotate-0'
                }`}
              >
                <PiCaretDown className="w-4 h-4 text-theme-primary" />
              </div>
            </Inline>
          </div>
        </div>

        {/* Content - Expandable com animação otimizada */}
        <div
          className={`transition-all duration-300 ease-out overflow-hidden will-change-auto ${
            isExpanded
              ? 'max-h-[200vh] opacity-100 transform scale-y-100'
              : 'max-h-0 opacity-0 transform scale-y-95'
          }`}
          style={{
            transformOrigin: 'top',
          }}
        >
          <div className="px-4 md:px-6 pb-6 border-t border-theme-secondary">
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
  const { t } = useTranslation({ sections: ['pages/music-history'] });

  const eras: Era[] = [
    {
      period: t('detailed_jsx_h4_children_0__musica_antiga'),
      years: t('detailed_jsx_span_children_0__c_500_1600'),
      sub: t('detailed_jsx_span_children_0__medieval_renascentista'),
      gradient: '',
    },
    {
      period: t('detailed_jsx_h4_children_0__pratica_comum'),
      years: t('detailed_jsx_span_children_0__c_1600_1910'),
      sub: t('detailed_jsx_span_children_0__barroco_classico_romantico'),
      gradient: '',
    },
    {
      period: t('detailed_jsx_h4_children_0__moderno_contemporaneo'),
      years: t('detailed_jsx_span_children_0__c_1890_presente'),
      sub: t('detailed_jsx_span_children_0__seculo_xx_xxi'),
      gradient: '',
    },
  ];

  return (
    <AccordionSection
      id="timeline-overview"
      icon={<PiLock className="w-6 h-6 text-theme-primary" />}
      title={t('detailed_jsx_h3_children_0__periodos_historicos')}
      subtitle={t('detailed_jsx_p_children_0__divisao_cronologica')}
      gradient=""
      isExpanded={isExpanded}
      onToggle={onToggle}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {eras.map((era, index) => (
          <div
            key={index}
            className="classical-card-simple p-4 md:p-6 group hover:scale-102 transition-all duration-200 will-change-transform"
          >
            <div
              className={`w-8 h-8 bg-gradient-to-br ${era.gradient} rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-200`}
            >
              <PiClock className="w-4 h-4 text-theme-primary" />
            </div>
            <h4 className="font-bold text-lg text-theme-primary classical-title mb-2 transition-colors duration-200">
              {era.period}
            </h4>
            <p
              className={`text-ouro-texto font-semibold mb-2 bg-gradient-to-r ${era.gradient} bg-clip-text text-transparent`}
            >
              {era.years}
            </p>
            <Text papel="rotulo" tom="suave" as="p">
              {era.sub}
            </Text>
          </div>
        ))}
      </div>
    </AccordionSection>
  );
});

TimelineOverview.displayName = 'TimelineOverview';

// Componente para Origins
const OriginsSection = memo<SectionProps>(({ isExpanded, onToggle }) => {
  const { t } = useTranslation({ sections: ['pages/music-history'] });

  return (
    <AccordionSection
      id="origins"
      icon={<PiScroll className="w-6 h-6 text-theme-primary" />}
      title={t('detailed_jsx_h3_children_0__origens_antigas')}
      subtitle={t('detailed_jsx_p_children_0__fundamentos_musica_ocidental')}
      gradient=""
      isExpanded={isExpanded}
      onToggle={onToggle}
    >
      <div className="classical-body text-theme-secondary">
        <p className="text-lg leading-relaxed mb-6">
          {t('detailed_jsx_p_children_0__origem_musica_classica')}
        </p>
        <div className="border-l-4 rounded-xl p-6 my-6 transform transition-all duration-200 hover:scale-101">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
              <PiStar className="w-4 h-4 text-theme-primary" />
            </div>
            <div>
              <p className="text-theme-primary font-medium">
                <strong>Curiosidade:</strong>{' '}
                {t('detailed_jsx_p_children_0__curiosidade_pouco_restou')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </AccordionSection>
  );
});

OriginsSection.displayName = 'OriginsSection';

// Componente para Medieval Period
const MedievalSection = memo<SectionProps>(({ isExpanded, onToggle }) => {
  const { t } = useTranslation({ sections: ['pages/music-history'] });

  return (
    <AccordionSection
      id="medieval"
      icon={<PiMusicNotes className="w-6 h-6 text-theme-primary" />}
      title={t('detailed_jsx_h3_children_0__mundo_medieval')}
      subtitle={t('detailed_jsx_p_children_0__nascimento_musica_organizada')}
      gradient=""
      isExpanded={isExpanded}
      onToggle={onToggle}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="classical-body text-theme-secondary">
          <Inline
            as="h4"
            gap={2}
            className="text-xl font-semibold text-theme-primary classical-title mb-4"
          >
            <div className="w-6 h-6 rounded-lg flex items-center justify-center">
              <PiMusicNotes className="w-3 h-3 text-theme-primary" />
            </div>
            <span>{t('detailed_jsx_h4_children_0__canto_gregoriano')}</span>
          </Inline>
          <p className="mb-4 leading-relaxed">
            {t('detailed_jsx_p_children_0__imagine_se_mosteiro')}
          </p>
          <p className="mb-4 leading-relaxed">
            {t('detailed_jsx_p_children_0__nao_havia_instrumentos')}
          </p>
        </div>
        <div className="classical-body text-theme-secondary">
          <Inline
            as="h4"
            gap={2}
            className="text-xl font-semibold text-theme-primary classical-title mb-4"
          >
            <div className="w-6 h-6 rounded-lg flex items-center justify-center">
              <PiTrendUp className="w-3 h-3 text-theme-primary" />
            </div>
            <span>{t('detailed_jsx_h4_children_0__revolucao_polifonia')}</span>
          </Inline>
          <p className="mb-4 leading-relaxed">
            {t('detailed_jsx_p_children_0__tudo_mudou_quando')}
          </p>
          <p className="mb-4 leading-relaxed">
            {t('detailed_jsx_p_children_0__escola_notre_dame')}
          </p>
        </div>
      </div>
      <div className="mt-8 border-l-4 rounded-xl p-6">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
            <GiViolin className="w-4 h-4 text-theme-primary" />
          </div>
          <Stack gap={2}>
            <h4 className="font-semibold text-theme-primary classical-title">
              {t('detailed_jsx_h4_children_0__instrumentos_tipicos_periodo')}
            </h4>
            <p className="text-theme-secondary leading-relaxed">
              {t('detailed_jsx_p_children_0__cordas_harpa_alaude')}
            </p>
          </Stack>
        </div>
      </div>
    </AccordionSection>
  );
});

MedievalSection.displayName = 'MedievalSection';

// Componente para Renaissance
const RenaissanceSection = memo<SectionProps>(({ isExpanded, onToggle }) => {
  const { t } = useTranslation({ sections: ['pages/music-history'] });

  return (
    <AccordionSection
      id="renaissance"
      icon={<PiGlobe className="w-6 h-6 text-theme-primary" />}
      title={t('detailed_jsx_h3_children_0__renascimento_humanizacao')}
      subtitle={t('detailed_jsx_p_children_0__era_humanismo_expressao')}
      gradient=""
      isExpanded={isExpanded}
      onToggle={onToggle}
    >
      <div className="classical-body text-theme-secondary">
        <p className="text-lg leading-relaxed mb-6">
          {t('detailed_jsx_p_children_0__se_periodo_medieval')}
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card
            nivel={2}
            className="group hover:scale-102 transition-all duration-200"
          >
            <Inline gap={3} className="mb-4">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                <PiUser className="w-4 h-4 text-theme-primary" />
              </div>
              <h4 className="text-xl font-semibold text-theme-primary classical-title transition-colors duration-200">
                {t('detailed_jsx_h4_children_0__mestres_franco_flamengos')}
              </h4>
            </Inline>
            <p className="leading-relaxed">
              {t('detailed_jsx_p_children_0__josquin_des_prez')}
            </p>
          </Card>
          <Card
            nivel={2}
            className="group hover:scale-102 transition-all duration-200"
          >
            <Inline gap={3} className="mb-4">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                <PiMusicNotes className="w-4 h-4 text-theme-primary" />
              </div>
              <h4 className="text-xl font-semibold text-theme-primary classical-title transition-colors duration-200">
                {t('detailed_jsx_h4_children_0__madrigal_italiano')}
              </h4>
            </Inline>
            <p className="leading-relaxed">
              {t('detailed_jsx_p_children_0__esta_forma_musical')}
            </p>
          </Card>
        </div>

        <div className="border-l-4 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
              <PiFileText className="w-4 h-4 text-theme-primary" />
            </div>
            <Stack gap={2}>
              <h4 className="font-semibold text-theme-primary classical-title">
                {t('detailed_jsx_h4_children_0__revolucao_imprensa')}
              </h4>
              <p className="text-theme-secondary leading-relaxed">
                {t('detailed_jsx_p_children_0__invencao_imprensa_gutenberg')}
              </p>
            </Stack>
          </div>
        </div>
      </div>
    </AccordionSection>
  );
});

RenaissanceSection.displayName = 'RenaissanceSection';

// Componente para Baroque
const BaroqueSection = memo<SectionProps>(({ isExpanded, onToggle }) => {
  const { t } = useTranslation({ sections: ['pages/music-history'] });

  const composers: Composer[] = [
    {
      name: 'Johann Sebastian Bach',
      description: t('detailed_jsx_p_children_0__johann_sebastian_bach'),
      gradient: '',
    },
    {
      name: 'George Frideric Handel',
      description: t('detailed_jsx_p_children_0__george_frideric_handel'),
      gradient: '',
    },
    {
      name: 'Antonio Vivaldi',
      description: t('detailed_jsx_p_children_0__antonio_vivaldi'),
      gradient: '',
    },
  ];

  return (
    <AccordionSection
      id="baroque"
      icon={<PiMusicNotes className="w-6 h-6 text-theme-primary" />}
      title={t('detailed_jsx_h3_children_0__barroco_era_gigantes')}
      subtitle={t('detailed_jsx_p_children_0__grandiosidade_virtuosismo')}
      gradient=""
      isExpanded={isExpanded}
      onToggle={onToggle}
    >
      <div className="classical-body text-theme-secondary">
        <p className="text-lg leading-relaxed mb-6">
          {t('detailed_jsx_p_children_0__seculo_xvii_trouxe')}
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {composers.map((composer, index) => (
            <Card
              nivel={2}
              key={index}
              className="group hover:scale-102 transition-all duration-200 will-change-transform"
            >
              <Inline gap={3} className="mb-3">
                <div
                  className={`w-8 h-8 bg-gradient-to-br ${composer.gradient} rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-200`}
                >
                  <PiUser className="w-4 h-4 text-theme-primary" />
                </div>
                <h4 className="font-semibold text-theme-primary classical-title transition-colors duration-200">
                  {composer.name}
                </h4>
              </Inline>
              <p className="text-sm leading-relaxed">{composer.description}</p>
            </Card>
          ))}
        </div>

        <div className="border-l-4 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
              <GiGrandPiano className="w-4 h-4 text-theme-primary" />
            </div>
            <Stack gap={2}>
              <h4 className="font-semibold text-theme-primary classical-title">
                {t('detailed_jsx_h4_children_0__nascimento_opera')}
              </h4>
              <p className="text-theme-secondary leading-relaxed">
                {t('detailed_jsx_p_children_0__opera_nasceu_tentativa')}
              </p>
            </Stack>
          </div>
        </div>
      </div>
    </AccordionSection>
  );
});

BaroqueSection.displayName = 'BaroqueSection';

// Componente para Classical
const ClassicalSection = memo<SectionProps>(({ isExpanded, onToggle }) => {
  const { t } = useTranslation({ sections: ['pages/music-history'] });

  const composers: Composer[] = [
    {
      name: 'Joseph Haydn',
      description: t('detailed_jsx_p_children_0__joseph_haydn'),
      gradient: '',
    },
    {
      name: 'Wolfgang Amadeus Mozart',
      description: t('detailed_jsx_p_children_0__wolfgang_amadeus_mozart'),
      gradient: '',
    },
    {
      name: 'Ludwig van Beethoven',
      description: t('detailed_jsx_p_children_0__ludwig_van_beethoven'),
      gradient: '',
    },
  ];

  return (
    <AccordionSection
      id="classical"
      icon={<PiUser className="w-6 h-6 text-theme-primary" />}
      title={t('detailed_jsx_h3_children_0__classicismo_busca_perfeicao')}
      subtitle={t('detailed_jsx_p_children_0__equilibrio_clareza_perfeicao')}
      gradient=""
      isExpanded={isExpanded}
      onToggle={onToggle}
    >
      <div className="classical-body text-theme-secondary">
        <p className="text-lg leading-relaxed mb-6">
          {t('detailed_jsx_p_children_0__depois_excessos_barrocos')}
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {composers.map((composer, index) => (
            <Card
              nivel={2}
              key={index}
              className="group hover:scale-102 transition-all duration-200 will-change-transform"
            >
              <Inline gap={3} className="mb-3">
                <div
                  className={`w-8 h-8 bg-gradient-to-br ${composer.gradient} rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-200`}
                >
                  <PiStar className="w-4 h-4 text-theme-primary" />
                </div>
                <h4 className="font-semibold text-theme-primary classical-title transition-colors duration-200">
                  {composer.name}
                </h4>
              </Inline>
              <p className="text-sm leading-relaxed">{composer.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </AccordionSection>
  );
});

ClassicalSection.displayName = 'ClassicalSection';

// Componente para Romantic
const RomanticSection = memo<SectionProps>(({ isExpanded, onToggle }) => {
  const { t } = useTranslation({ sections: ['pages/music-history'] });

  const composers: Composer[] = [
    {
      name: 'Franz Schubert',
      description: t('detailed_jsx_p_children_0__franz_schubert'),
      gradient: '',
    },
    {
      name: 'Frédéric Chopin',
      description: t('detailed_jsx_p_children_0__frederic_chopin'),
      gradient: '',
    },
    {
      name: 'Franz Liszt',
      description: t('detailed_jsx_p_children_0__franz_liszt'),
      gradient: '',
    },
    {
      name: 'Richard Wagner',
      description: t('detailed_jsx_p_children_0__richard_wagner'),
      gradient: '',
    },
  ];

  return (
    <AccordionSection
      id="romantic"
      icon={<PiMusicNotes className="w-6 h-6 text-theme-primary" />}
      title={t('detailed_jsx_h3_children_0__romantismo_musica_coracao')}
      subtitle={t('detailed_jsx_p_children_0__individualismo_emocao_expressao')}
      gradient=""
      isExpanded={isExpanded}
      onToggle={onToggle}
    >
      <div className="classical-body text-theme-secondary">
        <p className="text-lg leading-relaxed mb-6">
          {t('detailed_jsx_p_children_0__seculo_xix_foi')}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {composers.map((composer, index) => (
            <Card
              nivel={2}
              key={index}
              className="group hover:scale-102 transition-all duration-200 will-change-transform"
            >
              <Inline gap={3} className="mb-3">
                <div
                  className={`w-8 h-8 bg-gradient-to-br ${composer.gradient} rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-200`}
                >
                  <PiUser className="w-4 h-4 text-theme-primary" />
                </div>
                <h4 className="font-semibold text-theme-primary classical-title transition-colors duration-200">
                  {composer.name}
                </h4>
              </Inline>
              <p className="text-sm leading-relaxed">{composer.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </AccordionSection>
  );
});

RomanticSection.displayName = 'RomanticSection';

// Componente para Modern
const ModernSection = memo<SectionProps>(({ isExpanded, onToggle }) => {
  const { t } = useTranslation({ sections: ['pages/music-history'] });

  return (
    <AccordionSection
      id="modern"
      icon={<PiBookOpen className="w-6 h-6 text-theme-primary" />}
      title={t('detailed_jsx_h3_children_0__seculo_xx_revolucao')}
      subtitle={t('detailed_jsx_p_children_0__quebra_paradigmas_novas')}
      gradient=""
      isExpanded={isExpanded}
      onToggle={onToggle}
    >
      <div className="classical-body text-theme-secondary">
        <p className="text-lg leading-relaxed mb-6">
          {t('detailed_jsx_p_children_0__seculo_xx_comecou')}
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="space-y-6">
            <Inline
              as="h4"
              gap={2}
              className="text-xl font-semibold text-theme-primary classical-title mb-4"
            >
              <div className="w-6 h-6 rounded-lg flex items-center justify-center">
                <PiTrendUp className="w-3 h-3 text-theme-primary" />
              </div>
              <span>
                {t('detailed_jsx_h4_children_0__revolucoes_harmonicas')}
              </span>
            </Inline>
            <Stack>
              <Card
                nivel={2}
                densidade="compacta"
                className="group hover:scale-102 transition-all duration-200"
              >
                <p className="text-sm leading-relaxed">
                  <strong className="text-ouro-texto">
                    Arnold Schoenberg:
                  </strong>{' '}
                  {t('detailed_jsx_p_children_0__arnold_schoenberg')}
                </p>
              </Card>
              <Card
                nivel={2}
                densidade="compacta"
                className="group hover:scale-102 transition-all duration-200"
              >
                <p className="text-sm leading-relaxed">
                  <strong className="text-ouro-texto">Claude Debussy:</strong>{' '}
                  {t('detailed_jsx_p_children_0__claude_debussy')}
                </p>
              </Card>
            </Stack>
          </div>
          <div className="space-y-6">
            <Inline
              as="h4"
              gap={2}
              className="text-xl font-semibold text-theme-primary classical-title mb-4"
            >
              <div className="w-6 h-6 rounded-lg flex items-center justify-center">
                <PiGlobe className="w-3 h-3 text-theme-primary" />
              </div>
              <span>
                {t('detailed_jsx_h4_children_0__identidades_nacionais')}
              </span>
            </Inline>
            <Stack>
              <Card
                nivel={2}
                densidade="compacta"
                className="group hover:scale-102 transition-all duration-200"
              >
                <p className="text-sm leading-relaxed">
                  <strong className="text-ouro-texto">Béla Bartók:</strong>{' '}
                  {t('detailed_jsx_p_children_0__bela_bartok')}
                </p>
              </Card>
              <Card
                nivel={2}
                densidade="compacta"
                className="group hover:scale-102 transition-all duration-200"
              >
                <p className="text-sm leading-relaxed">
                  <strong className="text-ouro-texto">
                    Heitor Villa-Lobos:
                  </strong>{' '}
                  {t('detailed_jsx_p_children_0__heitor_villa_lobos')}
                </p>
              </Card>
            </Stack>
          </div>
        </div>

        <div className="border-l-4 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
              <PiStar className="w-4 h-4 text-theme-primary" />
            </div>
            <Stack gap={2}>
              <h4 className="font-semibold text-theme-primary classical-title">
                {t('detailed_jsx_h4_children_0__experimentalismo_radical')}
              </h4>
              <p className="text-theme-secondary leading-relaxed">
                {t('detailed_jsx_p_children_0__john_cage_levou')}
              </p>
            </Stack>
          </div>
        </div>
      </div>
    </AccordionSection>
  );
});

ModernSection.displayName = 'ModernSection';

// Componente para Contemporary Music
const ContemporarySection = memo<SectionProps>(({ isExpanded, onToggle }) => {
  const { t } = useTranslation({ sections: ['pages/music-history'] });

  return (
    <AccordionSection
      id="contemporary"
      icon={<PiGlobe className="w-6 h-6 text-theme-primary" />}
      title={t('detailed_jsx_h3_children_0__musica_hoje_tradicao')}
      subtitle={t(
        'detailed_jsx_p_children_0__convergencia_estilos_tecnologias'
      )}
      gradient=""
      isExpanded={isExpanded}
      onToggle={onToggle}
    >
      <div className="classical-body text-theme-secondary">
        <p className="text-lg leading-relaxed mb-6">
          {t('detailed_jsx_p_children_0__vivemos_epoca_unica')}
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card
            nivel={2}
            className="group hover:scale-102 transition-all duration-200"
          >
            <Inline gap={3} className="mb-4">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                <PiClock className="w-4 h-4 text-theme-primary" />
              </div>
              <h4 className="font-semibold text-theme-primary classical-title transition-colors duration-200">
                {t('detailed_jsx_h4_children_0__retorno_simplicidade')}
              </h4>
            </Inline>
            <p className="text-sm leading-relaxed">
              {t('detailed_jsx_p_children_0__compositores_como_arvo')}
            </p>
          </Card>
          <Card
            nivel={2}
            className="group hover:scale-102 transition-all duration-200"
          >
            <Inline gap={3} className="mb-4">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                <PiTrendUp className="w-4 h-4 text-theme-primary" />
              </div>
              <h4 className="font-semibold text-theme-primary classical-title transition-colors duration-200">
                {t('detailed_jsx_h4_children_0__tecnologia_ia')}
              </h4>
            </Inline>
            <p className="text-sm leading-relaxed">
              {t('detailed_jsx_p_children_0__computadores_podem_gerar')}
            </p>
          </Card>
        </div>

        <Stack className="border-l-4 rounded-xl p-6 text-center">
          <div className="flex items-center justify-center">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center">
              <PiStar className="w-6 h-6 text-theme-primary" />
            </div>
          </div>
          <p className="text-theme-primary text-lg font-medium classical-subtitle italic">
            &quot;{t('detailed_jsx_p_children_0__musica_classica_nao')}&quot;
          </p>
        </Stack>
      </div>
    </AccordionSection>
  );
});

ContemporarySection.displayName = 'ContemporarySection';

// Componente para Popular Music
const PopularMusicSection = memo<SectionProps>(({ isExpanded, onToggle }) => {
  const { t } = useTranslation({ sections: ['pages/music-history'] });

  return (
    <AccordionSection
      id="popular-music"
      icon={<PiMusicNotes className="w-6 h-6 text-theme-primary" />}
      title={t('detailed_jsx_h3_children_0__musica_erudita_popular')}
      subtitle={t('detailed_jsx_p_children_0__fronteiras_dissolvem_qualidade')}
      gradient=""
      isExpanded={isExpanded}
      onToggle={onToggle}
    >
      <div className="classical-body text-theme-secondary">
        <p className="text-lg leading-relaxed mb-6">
          {t('detailed_jsx_p_children_0__relacao_entre_musica')}
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card
            nivel={2}
            className="group hover:scale-102 transition-all duration-200"
          >
            <Inline gap={3} className="mb-4">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                <PiUser className="w-4 h-4 text-theme-primary" />
              </div>
              <h4 className="font-semibold text-theme-primary classical-title transition-colors duration-200">
                {t(
                  'detailed_jsx_h4_children_0__caracteristicas_musica_erudita'
                )}
              </h4>
            </Inline>
            <ul className="text-sm space-y-2 leading-relaxed">
              <li className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"></div>
                <span>
                  {t(
                    'detailed_jsx_li_children_0__maior_complexidade_harmonica'
                  )}
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"></div>
                <span>{t('detailed_jsx_li_children_0__mais_modulacoes')}</span>
              </li>
              <li className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"></div>
                <span>{t('detailed_jsx_li_children_0__menos_repeticao')}</span>
              </li>
              <li className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"></div>
                <span>
                  {t('detailed_jsx_li_children_0__frases_musicais_vastas')}
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"></div>
                <span>
                  {t('detailed_jsx_li_children_0__obras_maior_duracao')}
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"></div>
                <span>
                  {t(
                    'detailed_jsx_li_children_0__tradicionalmente_instrumentos'
                  )}
                </span>
              </li>
            </ul>
          </Card>
          <Card
            nivel={2}
            className="group hover:scale-102 transition-all duration-200"
          >
            <Inline gap={3} className="mb-4">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                <PiMusicNotes className="w-4 h-4 text-theme-primary" />
              </div>
              <h4 className="font-semibold text-theme-primary classical-title transition-colors duration-200">
                {t('detailed_jsx_h4_children_0__pontes_entre_mundos')}
              </h4>
            </Inline>
            <ul className="text-sm space-y-2 leading-relaxed">
              <li className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"></div>
                <span>
                  {t('detailed_jsx_li_children_0__jazz_complexidade')}
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"></div>
                <span>{t('detailed_jsx_li_children_0__rock_progressivo')}</span>
              </li>
              <li className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"></div>
                <span>{t('detailed_jsx_li_children_0__choro_brasileiro')}</span>
              </li>
              <li className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"></div>
                <span>{t('detailed_jsx_li_children_0__tom_jobim')}</span>
              </li>
              <li className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"></div>
                <span>
                  {t('detailed_jsx_li_children_0__villa_lobos_bebendo')}
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"></div>
                <span>
                  {t('detailed_jsx_li_children_0__guitarra_eletrica')}
                </span>
              </li>
            </ul>
          </Card>
        </div>

        <div className="border-l-4 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
              <PiStar className="w-4 h-4 text-theme-primary" />
            </div>
            <div>
              <p className="text-theme-secondary leading-relaxed">
                <strong className="text-ouro-texto">Reflexão:</strong>{' '}
                {t('detailed_jsx_p_children_0__reflexao_villa_lobos')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </AccordionSection>
  );
});

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
    <div className="w-full py-4 md:py-20 lg:py-20 relative overflow-hidden">
      {/* Background Pattern Otimizado */}
      <div className="absolute inset-0 pointer-events-none opacity-5 will-change-auto">
        <div className="absolute top-40 left-40 w-32 md:w-96 max-w-full h-96 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-60 right-60 w-64 h-64 rounded-full blur-2xl animate-pulse"
          style={{ animationDelay: '1s' }}
        ></div>
        <div
          className="absolute top-1/3 left-1/4 w-48 h-48 rounded-full blur-xl animate-pulse"
          style={{ animationDelay: '2s' }}
        ></div>
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
