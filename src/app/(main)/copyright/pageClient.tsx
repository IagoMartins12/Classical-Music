'use client';

import React from 'react';
import {
  FiShield,
  FiFileText,
  FiUpload,
  FiAlertCircle,
  FiCheck,
  FiMail,
  FiFlag,
  FiGlobe,
  FiUsers,
  FiBook,
  FiEye,
  FiLock,
} from 'react-icons/fi';
import { GiMusicalNotes, GiGrandPiano, GiScrollQuill } from 'react-icons/gi';
import AnimatedMusicalNotes from '../../components/AnimatedMusicalNotes';
import Link from 'next/link';

// Importar componentes de animação
import {
  PageContainer,
  AnimatedContainer,
  AnimatedItem,
  AnimatedCard,
  FloatingElement,
} from '../../components/animation/AnimatedComponents';
import { FaBalanceScale } from 'react-icons/fa';
import { useTranslation } from '@/app/context/TranslationContext';

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
      icon: FiShield,
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
      icon: FiGlobe,
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
      icon: FiUpload,
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
      icon: FiUsers,
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
      icon: FiFlag,
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
      icon: FiFileText,
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
      icon: FiBook,
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
      icon: FiLock,
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
        <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 via-accent-purple/5 to-accent-blue/5"></div>
        <AnimatedContainer delay={0.1} staggerSpeed="normal">
          <div className="relative section-wrap">
            <div className="text-center max-w-4xl mx-auto">
              <AnimatedItem direction="scale" springType="bouncy">
                <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-brand-primary/20 to-brand-secondary/20 border border-brand-primary/30 rounded-full mb-8">
                  <FiShield className="w-5 h-5 text-brand-primary mr-2" />
                  <span className="text-brand-primary font-medium">
                    {t('copyright_jsx_span_children_0__proteção_legal')}
                  </span>
                </div>
              </AnimatedItem>

              <AnimatedItem direction="up" springType="gentle">
                <h1 className="text-4xl lg:text-6xl font-bold classical-title text-theme-primary mb-6">
                  {t('copyright_jsx_h1_children_0__direitos')}
                  <span className="text-gradient-brand block lg:inline lg:ml-4">
                    {t('copyright_jsx_span_children_0__autorais')}
                  </span>
                </h1>
              </AnimatedItem>

              <AnimatedItem direction="up" springType="gentle">
                <p className="text-xl lg:text-2xl text-theme-secondary leading-relaxed classical-body">
                  {t('copyright_jsx_p_children_0__composer')}
                </p>
              </AnimatedItem>

              <AnimatedItem direction="up" springType="gentle">
                <div className="mt-8 inline-flex items-center space-x-2 text-theme-tertiary">
                  <FiFileText className="w-4 h-4" />
                  <span className="text-sm">
                    {t('copyright_jsx_span_children_0__última_atualização')}
                    {lastUpdated}
                  </span>
                </div>
              </AnimatedItem>
            </div>
          </div>
          <AnimatedMusicalNotes />
        </AnimatedContainer>
      </section>

      {/* Introduction */}
      <section className="">
        <AnimatedContainer delay={0.1} staggerSpeed="normal">
          <div className="">
            <div className="max-w-4xl mx-auto">
              <AnimatedCard hover="lift" className="classical-card p-8">
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-accent-blue to-accent-purple rounded-2xl flex items-center justify-center flex-shrink-0">
                    <FaBalanceScale className="w-8 h-8 text-theme-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold classical-title text-theme-primary mb-4">
                      {t('copyright_jsx_h2_children_0__compromisso_legalidade')}
                    </h2>
                    <p className="text-lg text-theme-secondary classical-body leading-relaxed">
                      {t('copyright_jsx_p_children_0__score')}
                    </p>
                  </div>
                </div>
              </AnimatedCard>
            </div>
          </div>
        </AnimatedContainer>
      </section>

      {/* Public Domain Examples */}
      <section className="py-8">
        <AnimatedContainer delay={0.1} staggerSpeed="normal">
          <div className="section-wrap">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold classical-title text-theme-primary mb-4">
                  {t('copyright_jsx_h2_children_0__exemplos_domínio_público')}
                </h2>
                <p className="text-xl text-theme-secondary">
                  {t('copyright_jsx_p_children_0__composer_1')}
                </p>
              </div>

              <AnimatedCard hover="lift" className="classical-card p-8">
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
                        <p className="text-sm text-theme-tertiary">
                          {example.period}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-accent-green">
                          {example.status}
                        </div>
                        <div className="text-xs text-theme-tertiary">
                          {example.reason}
                        </div>
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
                  <div className="classical-card p-8">
                    <div className="flex items-start space-x-6">
                      <div className="w-14 h-14 bg-gradient-to-br from-accent-blue to-accent-purple rounded-xl flex items-center justify-center flex-shrink-0">
                        <section.icon className="w-7 h-7 text-theme-primary" />
                      </div>

                      <div className="flex-grow">
                        <h3 className="text-2xl font-bold classical-title text-theme-primary mb-6">
                          {section.title}
                        </h3>

                        <div className="space-y-4">
                          {section.content.map((paragraph, pIndex) => (
                            <p
                              key={pIndex}
                              className="text-theme-secondary classical-body leading-relaxed"
                            >
                              {paragraph}
                            </p>
                          ))}
                        </div>
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
          <div className="section-wrap">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold classical-title text-theme-primary mb-4">
                  {t('copyright_jsx_h2_children_0__processo_report')}
                </h2>
                <p className="text-xl text-theme-secondary">
                  {t('copyright_jsx_p_children_0__como_reportar_violações')}
                </p>
              </div>

              <AnimatedCard hover="lift" className="classical-card p-8">
                <div className="space-y-6">
                  {reportSteps.map((step, index) => (
                    <div key={index} className="flex items-start space-x-4">
                      <div className="w-8 h-8 bg-brand-gradient rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {step.step}
                      </div>
                      <div>
                        <h3 className="font-semibold text-theme-primary mb-2">
                          {step.title}
                        </h3>
                        <p className="text-theme-secondary">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
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
              <AnimatedCard hover="lift" className="classical-card p-8">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-accent-amber to-accent-red rounded-xl flex items-center justify-center flex-shrink-0">
                    <FiAlertCircle className="w-6 h-6 text-theme-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold classical-title text-theme-primary mb-4">
                      {t('copyright_jsx_h3_children_0__warning')}
                    </h3>
                    <ul className="space-y-3 text-theme-secondary">
                      <li className="flex items-start space-x-2">
                        <FiCheck className="w-4 h-4 text-accent-green mt-0.5 flex-shrink-0" />
                        <span>
                          {t(
                            'copyright_jsx_span_children_0__sempre_verifique_direitos'
                          )}
                        </span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <FiCheck className="w-4 h-4 text-accent-green mt-0.5 flex-shrink-0" />
                        <span>
                          {t(
                            'copyright_jsx_span_children_0__não_assumimos_responsabilidade'
                          )}
                        </span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <FiCheck className="w-4 h-4 text-accent-green mt-0.5 flex-shrink-0" />
                        <span>
                          {t(
                            'copyright_jsx_span_children_0__removemos_conteúdo_imediatamente'
                          )}
                        </span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <FiCheck className="w-4 h-4 text-accent-green mt-0.5 flex-shrink-0" />
                        <span>
                          {t(
                            'copyright_jsx_span_children_0__cooperamos_integralmente_detentores'
                          )}
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </AnimatedCard>
            </div>
          </div>
        </AnimatedContainer>
      </section>

      {/* Contact Section */}
      <section className="py-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-primary/10 via-accent-purple/5 to-accent-blue/10"></div>

        <AnimatedContainer delay={0.1} staggerSpeed="normal">
          <div className="relative section-wrap">
            <div className="max-w-4xl mx-auto">
              <AnimatedCard
                hover="lift"
                className="classical-card p-12 text-center"
              >
                <div className="w-20 h-20 bg-brand-gradient rounded-3xl flex items-center justify-center mx-auto mb-8">
                  <FiMail className="w-10 h-10 text-theme-primary" />
                </div>

                <h2 className="text-3xl lg:text-4xl font-bold classical-title text-theme-primary mb-6">
                  {t('copyright_jsx_h2_children_0__dmca_agent')}
                </h2>

                <p className="text-xl text-theme-secondary mb-8 classical-body">
                  {t(
                    'copyright_jsx_p_children_0__questões_relacionadas_direitos'
                  )}
                </p>

                <div className="space-y-4 mb-12">
                  <div className="flex items-center justify-center space-x-3">
                    <FiMail className="w-5 h-5 text-brand-primary" />
                    <span className="text-theme-primary font-medium">
                      dmca@classicalhub.com
                    </span>
                  </div>
                  <div className="flex items-center justify-center space-x-3">
                    <FiFlag className="w-5 h-5 text-brand-primary" />
                    <span className="text-theme-primary font-medium">
                      {t(
                        'copyright_jsx_span_children_0__sistema_reports_plataforma'
                      )}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-6 justify-center">
                  <Link
                    href="/contact"
                    className="btn-classical-primary flex items-center justify-center space-x-3 px-10 py-4 text-lg"
                  >
                    <FiMail className="w-5 h-5" />
                    <span>
                      {t('copyright_jsx_span_children_0__contatar_dmca_agent')}
                    </span>
                  </Link>

                  <Link
                    href="/terms"
                    className="btn-classical-secondary flex items-center justify-center space-x-3 px-10 py-4 text-lg"
                  >
                    <FiFileText className="w-5 h-5" />
                    <span>
                      {t('copyright_jsx_span_children_0__termos_uso')}
                    </span>
                  </Link>
                </div>

                <div className="flex items-center justify-center space-x-8 mt-12 pt-8 border-t border-theme-secondary">
                  <div className="flex items-center space-x-2 text-theme-tertiary">
                    <FiEye className="w-4 h-4" />
                    <span className="text-sm">
                      {t('copyright_jsx_span_children_0__resposta')}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-theme-tertiary">
                    <FiShield className="w-4 h-4" />
                    <span className="text-sm">
                      {t('copyright_jsx_span_children_0__legal')}
                    </span>
                  </div>
                </div>
              </AnimatedCard>
            </div>
          </div>
        </AnimatedContainer>
      </section>

      {/* Floating Elements */}
      <FloatingElement
        className="top-16 left-16 text-6xl text-brand-primary/5"
        delay={0}
      >
        <GiMusicalNotes />
      </FloatingElement>
      <FloatingElement
        className="bottom-16 right-16 text-5xl text-accent-purple/5"
        delay={2}
      >
        <GiGrandPiano />
      </FloatingElement>
      <FloatingElement
        className="top-1/3 right-24 text-4xl text-accent-blue/5"
        delay={1}
      >
        <FaBalanceScale />
      </FloatingElement>
      <FloatingElement
        className="bottom-1/3 left-24 text-4xl text-brand-secondary/5"
        delay={3}
      >
        <GiScrollQuill />
      </FloatingElement>
    </PageContainer>
  );
}
