'use client';

import React from 'react';
import {
  FiShield,
  FiFileText,
  FiUpload,
  FiUser,
  FiHeart,
  FiAlertCircle,
  FiCheck,
  FiMail,
} from 'react-icons/fi';
import {
  GiMusicalNotes,
  GiGrandPiano,
  GiScrollQuill,
  GiGavel,
} from 'react-icons/gi';
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

interface TermsSection {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  content: string[];
}

export default function TermsPage() {
  const { t } = useTranslation({ sections: ['pages/terms'] });

  const termsData: TermsSection[] = [
    {
      id: 'acceptance',
      title: t('terms_section_0_title'),
      icon: FiCheck,
      content: [
        t('terms_section_0_content_0'),
        t('terms_section_0_content_1'),
        t('terms_section_0_content_2'),
      ],
    },
    {
      id: 'use',
      title: t('terms_section_1_title'),
      icon: FiUser,
      content: [
        t('terms_section_1_content_0'),
        t('terms_section_1_content_1'),
        t('terms_section_1_content_2'),
        t('terms_section_1_content_3'),
      ],
    },
    {
      id: 'content',
      title: t('terms_section_2_title'),
      icon: FiFileText,
      content: [
        t('terms_section_2_content_0'),
        t('terms_section_2_content_1'),
        t('terms_section_2_content_2'),
        t('terms_section_2_content_3'),
      ],
    },
    {
      id: 'uploads',
      title: t('terms_section_3_title'),
      icon: FiUpload,
      content: [
        t('terms_section_3_content_0'),
        t('terms_section_3_content_1'),
        t('terms_section_3_content_2'),
        t('terms_section_3_content_3'),
        t('terms_section_3_content_4'),
      ],
    },
    {
      id: 'user-conduct',
      title: t('terms_section_4_title'),
      icon: FiShield,
      content: [
        t('terms_section_4_content_0'),
        t('terms_section_4_content_1'),
        t('terms_section_4_content_2'),
        t('terms_section_4_content_3'),
        t('terms_section_4_content_4'),
      ],
    },
    {
      id: 'favorites',
      title: t('terms_section_5_title'),
      icon: FiHeart,
      content: [
        t('terms_section_5_content_0'),
        t('terms_section_5_content_1'),
        t('terms_section_5_content_2'),
        t('terms_section_5_content_3'),
      ],
    },
    {
      id: 'limitations',
      title: t('terms_section_6_title'),
      icon: FiAlertCircle,
      content: [
        t('terms_section_6_content_0'),
        t('terms_section_6_content_1'),
        t('terms_section_6_content_2'),
        t('terms_section_6_content_3'),
      ],
    },
    {
      id: 'termination',
      title: t('terms_section_7_title'),
      icon: GiGavel,
      content: [
        t('terms_section_7_content_0'),
        t('terms_section_7_content_1'),
        t('terms_section_7_content_2'),
        t('terms_section_7_content_3'),
      ],
    },
  ];

  const lastUpdated = t('terms_last_updated');

  return (
    <PageContainer showBackground={true} className=" section-wrap">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 via-accent-purple/5 to-accent-blue/5"></div>
        <AnimatedContainer delay={0.1} staggerSpeed="normal">
          <div className="relative ">
            <div className="text-center max-w-4xl mx-auto">
              <AnimatedItem direction="scale" springType="bouncy">
                <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-brand-primary/20 to-brand-secondary/20 border border-brand-primary/30 rounded-full mb-8">
                  <FiFileText className="w-5 h-5 text-brand-primary mr-2" />
                  <span className="text-brand-primary font-medium">
                    {t('terms_jsx_span_children_0__termos_legais')}
                  </span>
                </div>
              </AnimatedItem>

              <AnimatedItem direction="up" springType="gentle">
                <h1 className="text-4xl lg:text-6xl font-bold classical-title text-theme-primary mb-6">
                  {t('terms_jsx_h1_children_0__termos')}
                  <span className="text-gradient-brand block lg:inline lg:ml-4">
                    {t('terms_jsx_span_children_0__uso')}
                  </span>
                </h1>
              </AnimatedItem>

              <AnimatedItem direction="up" springType="gentle">
                <p className="text-xl lg:text-2xl text-theme-secondary leading-relaxed classical-body">
                  {t('terms_jsx_p_children_0__music')}
                </p>
              </AnimatedItem>

              <AnimatedItem direction="up" springType="gentle">
                <div className="mt-8 inline-flex items-center space-x-2 text-theme-tertiary">
                  <FiShield className="w-4 h-4" />
                  <span className="text-sm">
                    {t('terms_jsx_span_children_0__última_atualização')}{' '}
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
                      {t('terms_jsx_h2_children_0__welcome')}
                    </h2>
                    <p className="text-lg text-theme-secondary classical-body leading-relaxed">
                      {t('terms_jsx_p_children_0__create')}
                    </p>
                  </div>
                </div>
              </AnimatedCard>
            </div>
          </div>
        </AnimatedContainer>
      </section>

      {/* Terms Sections */}
      <section className="">
        <AnimatedContainer delay={0.1} staggerSpeed="fast">
          <div className="">
            <div className="max-w-4xl mx-auto space-y-8">
              {termsData.map((section, index) => (
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
                      {t('terms_jsx_h3_children_0__considerações_importantes')}
                    </h3>
                    <ul className="space-y-3 text-theme-secondary">
                      <li className="flex items-start space-x-2">
                        <FiCheck className="w-4 h-4 text-accent-green mt-0.5 flex-shrink-0" />
                        <span>
                          {t(
                            'terms_jsx_span_children_0__opus_atlas_plataforma'
                          )}
                        </span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <FiCheck className="w-4 h-4 text-accent-green mt-0.5 flex-shrink-0" />
                        <span>
                          {t(
                            'terms_jsx_span_children_0__respeitamos_direitos_autorais'
                          )}
                        </span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <FiCheck className="w-4 h-4 text-accent-green mt-0.5 flex-shrink-0" />
                        <span>
                          {t('terms_jsx_span_children_0__valorizar_qualidade')}
                        </span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <FiCheck className="w-4 h-4 text-accent-green mt-0.5 flex-shrink-0" />
                        <span>
                          {t(
                            'terms_jsx_span_children_0__promovemos_comunidade_colaborativa'
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

      {/* Contact and Related Links */}
      <section className=" relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-primary/10 via-accent-purple/5 to-accent-blue/10"></div>

        <AnimatedContainer delay={0.1} staggerSpeed="normal">
          <div className="relative ">
            <div className="max-w-4xl mx-auto">
              <AnimatedCard
                hover="lift"
                className="classical-card p-12 text-center"
              >
                <div className="w-20 h-20 bg-brand-gradient rounded-3xl flex items-center justify-center mx-auto mb-8">
                  <FiMail className="w-10 h-10 text-theme-primary" />
                </div>

                <h2 className="text-3xl lg:text-4xl font-bold classical-title text-theme-primary mb-6">
                  {t('terms_jsx_h2_children_0__dúvidas_sobre_termos')}
                </h2>

                <p className="text-xl text-theme-secondary mb-12 classical-body">
                  {t('terms_jsx_p_children_0__tiver_alguma_dúvida')}
                </p>

                <div className="flex flex-col sm:flex-row gap-6 justify-center">
                  <Link
                    href="/contact"
                    className="btn-classical-primary flex items-center justify-center space-x-3 px-10 py-4 text-lg"
                  >
                    <FiMail className="w-5 h-5" />
                    <span>{t('terms_jsx_span_children_0__entre_contato')}</span>
                  </Link>

                  <Link
                    href="/privacy"
                    className="btn-classical-secondary flex items-center justify-center space-x-3 px-10 py-4 text-lg"
                  >
                    <FiShield className="w-5 h-5" />
                    <span>
                      {t('terms_jsx_span_children_0__política_privacidade')}
                    </span>
                  </Link>
                </div>

                <div className="flex items-center justify-center space-x-8 mt-12 pt-8 border-t border-theme-secondary">
                  <Link
                    href="/faq"
                    className="flex items-center space-x-2 text-theme-tertiary hover:text-brand-primary transition-colors"
                  >
                    <FiFileText className="w-4 h-4" />
                    <span className="text-sm">
                      {t('terms_jsx_span_children_0__perguntas_frequentes')}
                    </span>
                  </Link>
                  <Link
                    href="/help"
                    className="flex items-center space-x-2 text-theme-tertiary hover:text-brand-primary transition-colors"
                  >
                    <FiUser className="w-4 h-4" />
                    <span className="text-sm">
                      {t('terms_jsx_span_children_0__central_ajuda')}
                    </span>
                  </Link>
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
