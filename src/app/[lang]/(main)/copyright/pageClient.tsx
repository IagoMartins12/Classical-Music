'use client';

import React from 'react';
import { GiGrandPiano } from 'react-icons/gi';
import {
  PiBook,
  PiCheck,
  PiEnvelopeSimple,
  PiEye,
  PiFileText,
  PiFlag,
  PiGlobe,
  PiLock,
  PiMusicNotes,
  PiScales,
  PiScroll,
  PiShield,
  PiUploadSimple,
  PiUsers,
  PiWarningCircle,
} from 'react-icons/pi';
import Link from '@/app/components/LocalizedLink';

// Importar componentes de animação
import {
  PageContainer,
  AnimatedContainer,
  AnimatedItem,
  AnimatedCard,
  FloatingElement,
} from '../../../components/animation/AnimatedComponents';
import { useTranslation } from '@/app/context/TranslationContext';
import { Stack, Inline } from '@/app/components/ui/Layout';
import { Text } from '@/app/components/ui/Text';

interface CopyrightSection {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  content: string[];
}

export default function CopyrightPage() {
  const { t } = useTranslation({ sections: ['pages/copyright'] });

  const copyrightData: CopyrightSection[] = [
    {
      id: 'our-commitment',
      title: t('copyright_section_0_title'),
      icon: PiShield,
      content: [
        t('copyright_section_0_content_0'),
        t('copyright_section_0_content_1'),
        t('copyright_section_0_content_2'),
        t('copyright_section_0_content_3'),
      ],
    },
    {
      id: 'public-domain',
      title: t('copyright_section_1_title'),
      icon: PiGlobe,
      content: [
        t('copyright_section_1_content_0'),
        t('copyright_section_1_content_1'),
        t('copyright_section_1_content_2'),
        t('copyright_section_1_content_3'),
      ],
    },
    {
      id: 'user-uploads',
      title: t('copyright_section_2_title'),
      icon: PiUploadSimple,
      content: [
        t('copyright_section_2_content_0'),
        t('copyright_section_2_content_1'),
        t('copyright_section_2_content_2'),
        t('copyright_section_2_content_3'),
        t('copyright_section_2_content_4'),
      ],
    },
    {
      id: 'moderation',
      title: t('copyright_section_3_title'),
      icon: PiUsers,
      content: [
        t('copyright_section_3_content_0'),
        t('copyright_section_3_content_1'),
        t('copyright_section_3_content_2'),
        t('copyright_section_3_content_3'),
        t('copyright_section_3_content_4'),
      ],
    },
    {
      id: 'reporting',
      title: t('copyright_section_4_title'),
      icon: PiFlag,
      content: [
        t('copyright_section_4_content_0'),
        t('copyright_section_4_content_1'),
        t('copyright_section_4_content_2'),
        t('copyright_section_4_content_3'),
        t('copyright_section_4_content_4'),
      ],
    },
    {
      id: 'dmca',
      title: t('copyright_section_5_title'),
      icon: PiFileText,
      content: [
        t('copyright_section_5_content_0'),
        t('copyright_section_5_content_1'),
        t('copyright_section_5_content_2'),
        t('copyright_section_5_content_3'),
        t('copyright_section_5_content_4'),
      ],
    },
    {
      id: 'fair-use',
      title: t('copyright_section_6_title'),
      icon: PiBook,
      content: [
        t('copyright_section_6_content_0'),
        t('copyright_section_6_content_1'),
        t('copyright_section_6_content_2'),
        t('copyright_section_6_content_3'),
        t('copyright_section_6_content_4'),
      ],
    },
    {
      id: 'permissions',
      title: t('copyright_section_7_title'),
      icon: PiLock,
      content: [
        t('copyright_section_7_content_0'),
        t('copyright_section_7_content_1'),
        t('copyright_section_7_content_2'),
        t('copyright_section_7_content_3'),
        t('copyright_section_7_content_4'),
      ],
    },
  ];

  const reportSteps = [
    {
      step: 1,
      title: t('copyright_report_step_0_title'),
      description: t('copyright_report_step_0_description'),
    },
    {
      step: 2,
      title: t('copyright_report_step_1_title'),
      description: t('copyright_report_step_1_description'),
    },
    {
      step: 3,
      title: t('copyright_report_step_2_title'),
      description: t('copyright_report_step_2_description'),
    },
    {
      step: 4,
      title: t('copyright_report_step_3_title'),
      description: t('copyright_report_step_3_description'),
    },
    {
      step: 5,
      title: t('copyright_report_step_4_title'),
      description: t('copyright_report_step_4_description'),
    },
  ];

  const publicDomainExamples = [
    {
      composer: t('copyright_composer_0_name'),
      period: t('copyright_composer_0_period'),
      status: t('copyright_composer_0_status'),
      reason: t('copyright_composer_0_reason'),
    },
    {
      composer: t('copyright_composer_1_name'),
      period: t('copyright_composer_1_period'),
      status: t('copyright_composer_1_status'),
      reason: t('copyright_composer_1_reason'),
    },
    {
      composer: t('copyright_composer_2_name'),
      period: t('copyright_composer_2_period'),
      status: t('copyright_composer_2_status'),
      reason: t('copyright_composer_2_reason'),
    },
    {
      composer: t('copyright_composer_3_name'),
      period: t('copyright_composer_3_period'),
      status: t('copyright_composer_3_status'),
      reason: t('copyright_composer_3_reason'),
    },
  ];

  const lastUpdated = t('copyright_last_updated');

  return (
    <PageContainer showBackground={true} className="classical-theme">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16">
        <div className="absolute inset-0"></div>
        <AnimatedContainer delay={0.1} staggerSpeed="normal">
          <div className="relative  ">
            <div className="text-center max-w-4xl mx-auto">
              <AnimatedItem direction="scale" springType="bouncy">
                <div className="inline-flex items-center px-6 py-3 rounded-full mb-8 bg-sup-2">
                  <PiShield className="w-5 h-5 text-ouro-texto mr-2" />
                  <span className="text-ouro-texto font-medium">
                    {t('copyright_jsx_span_children_0__proteção_legal')}
                  </span>
                </div>
              </AnimatedItem>

              <AnimatedItem direction="up" springType="gentle">
                <h1 className="text-4xl lg:text-6xl font-bold classical-title text-theme-primary mb-6">
                  {t('copyright_jsx_h1_children_0__direitos')}
                  <span className="text-gradient-brand block lg:inline ml-2 lg:ml-4">
                    {t('copyright_jsx_span_children_0__autorais')}
                  </span>
                </h1>
              </AnimatedItem>

              <AnimatedItem direction="up" springType="gentle">
                <p className="text-xl lg:text-2xl text-theme-secondary leading-relaxed classical-body medida-texto mx-auto">
                  {t('copyright_jsx_p_children_0__composer')}
                </p>
              </AnimatedItem>

              <AnimatedItem direction="up" springType="gentle">
                <div className="mt-8 inline-flex items-center space-x-2 text-theme-tertiary">
                  <PiFileText className="w-4 h-4" />
                  <span className="text-sm">
                    {t('copyright_jsx_span_children_0__última_atualização')}
                    {lastUpdated}
                  </span>
                </div>
              </AnimatedItem>
            </div>
          </div>
        </AnimatedContainer>
      </section>

      {/* Introduction */}
      <section className="">
        <AnimatedContainer delay={0.1} staggerSpeed="normal">
          <div className="">
            <div className="max-w-4xl mx-auto">
              <AnimatedCard hover="lift" className="classical-card !p-8 md:p-8">
                <div className=" flex flex-col md:flex-row items-start space-x-4">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <PiScales className="w-8 h-8 text-theme-primary" />
                  </div>
                  <Stack>
                    <h2 className="text-2xl font-bold classical-title text-theme-primary">
                      {t('copyright_jsx_h2_children_0__compromisso_legalidade')}
                    </h2>
                    <p className="text-lg text-theme-secondary classical-body leading-relaxed medida-texto">
                      {t('copyright_jsx_p_children_0__score')}
                    </p>
                  </Stack>
                </div>
              </AnimatedCard>
            </div>
          </div>
        </AnimatedContainer>
      </section>

      {/* Public Domain Examples */}
      <section className="py-8">
        <AnimatedContainer delay={0.1} staggerSpeed="normal">
          <div className=" ">
            <div className="max-w-4xl mx-auto">
              <Stack className="text-center mb-8">
                <h2 className="text-3xl font-bold classical-title text-theme-primary">
                  {t('copyright_jsx_h2_children_0__exemplos_domínio_público')}
                </h2>
                <p className="text-xl text-theme-secondary">
                  {t('copyright_jsx_p_children_0__composer_1')}
                </p>
              </Stack>

              <AnimatedCard hover="lift" className="classical-card">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {publicDomainExamples.map((example, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-theme-elevated rounded-lg"
                    >
                      <div>
                        <h3 className="font-semibold text-theme-primary">
                          {example.composer}
                        </h3>
                        <Text papel="rotulo" tom="fraco" as="p">
                          {example.period}
                        </Text>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {example.status}
                        </div>
                        <Text papel="legenda" tom="fraco" as="div">
                          {example.reason}
                        </Text>
                      </div>
                    </div>
                  ))}
                </div>
              </AnimatedCard>
            </div>
          </div>
        </AnimatedContainer>
      </section>

      {/* Copyright Sections */}
      <section className="">
        <AnimatedContainer delay={0.1} staggerSpeed="fast">
          <div className="">
            <div className="max-w-4xl mx-auto space-y-8">
              {copyrightData.map((section, index) => (
                <AnimatedItem
                  key={section.id}
                  direction="up"
                  springType="gentle"
                  delay={index * 0.1}
                >
                  <div className="classical-card !p-8 md:p-8">
                    <div className="flex flex-col md:flex-row items-start space-x-6">
                      <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0">
                        <section.icon className="w-7 h-7 text-theme-primary" />
                      </div>

                      <div className="flex-grow">
                        <h3 className="text-2xl font-bold classical-title text-theme-primary mb-6">
                          {section.title}
                        </h3>

                        <Stack>
                          {section.content.map((paragraph, pIndex) => (
                            <p
                              key={pIndex}
                              className="text-theme-secondary classical-body leading-relaxed"
                            >
                              {paragraph}
                            </p>
                          ))}
                        </Stack>
                      </div>
                    </div>
                  </div>
                </AnimatedItem>
              ))}
            </div>
          </div>
        </AnimatedContainer>
      </section>

      {/* Report Process */}
      <section className="py-8">
        <AnimatedContainer delay={0.1} staggerSpeed="normal">
          <div className=" ">
            <div className="max-w-4xl mx-auto">
              <Stack className="text-center mb-12">
                <h2 className="text-3xl font-bold classical-title text-theme-primary">
                  {t('copyright_jsx_h2_children_0__processo_report')}
                </h2>
                <p className="text-xl text-theme-secondary">
                  {t('copyright_jsx_p_children_0__como_reportar_violações')}
                </p>
              </Stack>

              <AnimatedCard hover="lift" className="classical-card !p-8 md:p-8">
                <Stack gap={6}>
                  {reportSteps.map((step, index) => (
                    <div
                      key={index}
                      className=" flex flex-col md:flex-row items-start space-x-4"
                    >
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {step.step}
                      </div>
                      <Stack gap={2}>
                        <h3 className="font-semibold text-theme-primary">
                          {step.title}
                        </h3>
                        <p className="text-theme-secondary">
                          {step.description}
                        </p>
                      </Stack>
                    </div>
                  ))}
                </Stack>
              </AnimatedCard>
            </div>
          </div>
        </AnimatedContainer>
      </section>

      {/* Important Notes */}
      <section className="">
        <AnimatedContainer delay={0.1} staggerSpeed="normal">
          <div className="">
            <div className="max-w-4xl mx-auto">
              <AnimatedCard hover="lift" className="classical-card !p-8 md:p-8">
                <div className=" flex flex-col md:flex-row items-start space-x-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0">
                    <PiWarningCircle className="w-6 h-6 text-theme-primary" />
                  </div>
                  <Stack>
                    <h3 className="text-xl font-bold classical-title text-theme-primary">
                      {t('copyright_jsx_h3_children_0__warning')}
                    </h3>
                    <ul className="space-y-3 text-theme-secondary">
                      <li className="flex items-start space-x-2">
                        <PiCheck className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>
                          {t(
                            'copyright_jsx_span_children_0__sempre_verifique_direitos'
                          )}
                        </span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <PiCheck className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>
                          {t(
                            'copyright_jsx_span_children_0__não_assumimos_responsabilidade'
                          )}
                        </span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <PiCheck className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>
                          {t(
                            'copyright_jsx_span_children_0__removemos_conteúdo_imediatamente'
                          )}
                        </span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <PiCheck className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>
                          {t(
                            'copyright_jsx_span_children_0__cooperamos_integralmente_detentores'
                          )}
                        </span>
                      </li>
                    </ul>
                  </Stack>
                </div>
              </AnimatedCard>
            </div>
          </div>
        </AnimatedContainer>
      </section>

      {/* Contact Section */}
      <section className="py-8 relative overflow-hidden">
        <div className="absolute inset-0"></div>

        <AnimatedContainer delay={0.1} staggerSpeed="normal">
          <div className="relative  ">
            <div className="max-w-4xl mx-auto">
              <AnimatedCard
                hover="lift"
                className="classical-card p-12 text-center"
              >
                <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8">
                  <PiEnvelopeSimple className="w-10 h-10 text-theme-primary" />
                </div>

                <h2 className="text-3xl lg:text-4xl font-bold classical-title text-theme-primary mb-6">
                  {t('copyright_jsx_h2_children_0__dmca_agent')}
                </h2>

                <p className="text-xl text-theme-secondary mb-8 classical-body medida-texto mx-auto">
                  {t(
                    'copyright_jsx_p_children_0__questões_relacionadas_direitos'
                  )}
                </p>

                <Stack className="mb-12">
                  <Inline gap={3} className="justify-center">
                    <PiEnvelopeSimple className="w-5 h-5 text-ouro-texto" />
                    <span className="text-theme-primary font-medium">
                      opusatlas@gmail.com
                    </span>
                  </Inline>
                  <Inline gap={3} className="justify-center">
                    <PiFlag className="w-5 h-5 text-ouro-texto" />
                    <span className="text-theme-primary font-medium">
                      {t(
                        'copyright_jsx_span_children_0__sistema_reports_plataforma'
                      )}
                    </span>
                  </Inline>
                </Stack>

                <div className="flex flex-col sm:flex-row gap-6 justify-center">
                  <Link
                    href="/contact"
                    className="btn-classical-primary flex items-center justify-center space-x-3 px-10 py-4 text-lg"
                  >
                    <PiEnvelopeSimple className="w-5 h-5" />
                    <span>
                      {t('copyright_jsx_span_children_0__contatar_dmca_agent')}
                    </span>
                  </Link>

                  <Link
                    href="/terms"
                    className="btn-classical-secondary flex items-center justify-center space-x-3 px-10 py-4 text-lg"
                  >
                    <PiFileText className="w-5 h-5" />
                    <span>
                      {t('copyright_jsx_span_children_0__termos_uso')}
                    </span>
                  </Link>
                </div>

                <Inline
                  gap={8}
                  className="justify-center mt-12 pt-8 border-t border-theme-secondary"
                >
                  <Inline gap={2} className="text-theme-tertiary">
                    <PiEye className="w-4 h-4" />
                    <span className="text-sm">
                      {t('copyright_jsx_span_children_0__resposta')}
                    </span>
                  </Inline>
                  <Inline gap={2} className="text-theme-tertiary">
                    <PiShield className="w-4 h-4" />
                    <span className="text-sm">
                      {t('copyright_jsx_span_children_0__legal')}
                    </span>
                  </Inline>
                </Inline>
              </AnimatedCard>
            </div>
          </div>
        </AnimatedContainer>
      </section>

      {/* Floating Elements */}
      <FloatingElement className="top-16 left-16 text-6xl" delay={0}>
        <PiMusicNotes />
      </FloatingElement>
      <FloatingElement className="bottom-16 right-16 text-5xl" delay={2}>
        <GiGrandPiano />
      </FloatingElement>
      <FloatingElement className="top-1/3 right-24 text-4xl" delay={1}>
        <PiScales />
      </FloatingElement>
      <FloatingElement className="bottom-1/3 left-24 text-4xl" delay={3}>
        <PiScroll />
      </FloatingElement>
    </PageContainer>
  );
}
