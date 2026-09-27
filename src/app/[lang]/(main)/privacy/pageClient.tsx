'use client';

import React from 'react';
import { GiGrandPiano } from 'react-icons/gi';
import {
  PiCheck,
  PiCookie,
  PiDatabase,
  PiEnvelopeSimple,
  PiEye,
  PiGear,
  PiLock,
  PiMusicNotes,
  PiScroll,
  PiShareNetwork,
  PiShield,
  PiUser,
} from 'react-icons/pi';
import AnimatedMusicalNotes from '../../../components/AnimatedMusicalNotes';
import Link from '@/app/components/LocalizedLink';

// Importar componentes de animação
import {
  PageContainer,
  AnimatedContainer,
  AnimatedItem,
  AnimatedCard,
  SequentialGrid,
  FloatingElement,
} from '../../../components/animation/AnimatedComponents';
import { useTranslation } from '@/app/context/TranslationContext';
import { Stack, Inline } from '@/app/components/ui/Layout';
import { Text } from '@/app/components/ui/Text';

interface PrivacySection {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  content: string[];
}

export default function PrivacyPage() {
  const { t } = useTranslation({ sections: ['pages/privacy'] });

  const privacyData: PrivacySection[] = [
    {
      id: 'collection',
      title: t('privacy_section_0_title'),
      icon: PiDatabase,
      content: [
        t('privacy_section_0_content_0'),
        t('privacy_section_0_content_1'),
        t('privacy_section_0_content_2'),
        t('privacy_section_0_content_3'),
        t('privacy_section_0_content_4'),
      ],
    },
    {
      id: 'usage',
      title: t('privacy_section_1_title'),
      icon: PiEye,
      content: [
        t('privacy_section_1_content_0'),
        t('privacy_section_1_content_1'),
        t('privacy_section_1_content_2'),
        t('privacy_section_1_content_3'),
        t('privacy_section_1_content_4'),
        t('privacy_section_1_content_5'),
      ],
    },
    {
      id: 'sharing',
      title: t('privacy_section_2_title'),
      icon: PiShareNetwork,
      content: [
        t('privacy_section_2_content_0'),
        t('privacy_section_2_content_1'),
        t('privacy_section_2_content_2'),
        t('privacy_section_2_content_3'),
        t('privacy_section_2_content_4'),
      ],
    },
    {
      id: 'cookies',
      title: t('privacy_section_3_title'),
      icon: PiCookie,
      content: [
        t('privacy_section_3_content_0'),
        t('privacy_section_3_content_1'),
        t('privacy_section_3_content_2'),
        t('privacy_section_3_content_3'),
        t('privacy_section_3_content_4'),
      ],
    },
    {
      id: 'security',
      title: t('privacy_section_4_title'),
      icon: PiLock,
      content: [
        t('privacy_section_4_content_0'),
        t('privacy_section_4_content_1'),
        t('privacy_section_4_content_2'),
        t('privacy_section_4_content_3'),
        t('privacy_section_4_content_4'),
      ],
    },
    {
      id: 'rights',
      title: t('privacy_section_5_title'),
      icon: PiUser,
      content: [
        t('privacy_section_5_content_0'),
        t('privacy_section_5_content_1'),
        t('privacy_section_5_content_2'),
        t('privacy_section_5_content_3'),
        t('privacy_section_5_content_4'),
        t('privacy_section_5_content_5'),
      ],
    },
    {
      id: 'retention',
      title: t('privacy_section_6_title'),
      icon: PiGear,
      content: [
        t('privacy_section_6_content_0'),
        t('privacy_section_6_content_1'),
        t('privacy_section_6_content_2'),
        t('privacy_section_6_content_3'),
        t('privacy_section_6_content_4'),
      ],
    },
    {
      id: 'children',
      title: t('privacy_section_7_title'),
      icon: PiShield,
      content: [
        t('privacy_section_7_content_0'),
        t('privacy_section_7_content_1'),
        t('privacy_section_7_content_2'),
        t('privacy_section_7_content_3'),
      ],
    },
  ];

  const dataTypes = [
    {
      icon: PiUser,
      title: t('privacy_data_type_0_title'),
      description: t('privacy_data_type_0_description'),
      retention: t('privacy_data_type_0_retention'),
    },
    {
      icon: PiGear,
      title: t('privacy_data_type_1_title'),
      description: t('privacy_data_type_1_description'),
      retention: t('privacy_data_type_1_retention'),
    },
    {
      icon: PiDatabase,
      title: t('privacy_data_type_2_title'),
      description: t('privacy_data_type_2_description'),
      retention: t('privacy_data_type_2_retention'),
    },
    {
      icon: PiShareNetwork,
      title: t('privacy_data_type_3_title'),
      description: t('privacy_data_type_3_description'),
      retention: t('privacy_data_type_3_retention'),
    },
  ];

  const lastUpdated = t('privacy_last_updated');

  return (
    <PageContainer showBackground={true}>
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16">
        <div className="absolute inset-0"></div>
        <AnimatedContainer delay={0.1} staggerSpeed="normal">
          <div className="relative ">
            <div className="text-center coluna-leitura mx-auto">
              <AnimatedItem direction="scale" springType="bouncy">
                <div className="inline-flex items-center px-6 py-3 rounded-full mb-8 bg-sup-2">
                  <PiShield className="w-5 h-5 text-ouro-texto mr-2" />
                  <span className="text-ouro-texto font-medium">
                    {t('privacy_jsx_span_children_0__proteção_dados')}
                  </span>
                </div>
              </AnimatedItem>

              <AnimatedItem direction="up" springType="gentle">
                <h1 className="text-4xl lg:text-6xl font-bold classical-title text-theme-primary mb-6">
                  {t('privacy_jsx_h1_children_0__política')}
                  <span className="text-gradient-brand block lg:inline ml-2 lg:ml-4">
                    {t('privacy_jsx_span_children_0__privacidade')}
                  </span>
                </h1>
              </AnimatedItem>

              <AnimatedItem direction="up" springType="gentle">
                <p className="text-xl lg:text-2xl text-theme-secondary leading-relaxed classical-body medida-texto mx-auto">
                  {t('privacy_jsx_p_children_0__conheça_como_protegemos')}
                </p>
              </AnimatedItem>

              <AnimatedItem direction="up" springType="gentle">
                <div className="mt-8 inline-flex items-center space-x-2 text-theme-tertiary">
                  <PiLock className="w-4 h-4" />
                  <span className="text-sm">
                    {t('privacy_jsx_span_children_0__última_atualização')}
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
      <section className="py-8">
        <AnimatedContainer delay={0.1} staggerSpeed="normal">
          <div className="">
            <div className="coluna-leitura mx-auto">
              <AnimatedCard hover="lift" className="classical-card !p-8 md:p-8">
                <div className="flex items-start flex-col md:flex-row space-x-4">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <PiShield className="w-8 h-8 text-theme-primary" />
                  </div>
                  <Stack>
                    <h2 className="text-2xl font-bold classical-title text-theme-primary">
                      {t(
                        'privacy_jsx_h2_children_0__compromisso_sua_privacidade'
                      )}
                    </h2>
                    <p className="text-lg text-theme-secondary classical-body leading-relaxed medida-texto">
                      {t('privacy_jsx_p_children_0__music')}
                    </p>
                  </Stack>
                </div>
              </AnimatedCard>
            </div>
          </div>
        </AnimatedContainer>
      </section>

      {/* Data Types Overview */}
      <section className="py-8">
        <AnimatedContainer delay={0.1} staggerSpeed="fast">
          <div className="">
            <div className="coluna-leitura mx-auto">
              <Stack className="text-center mb-12">
                <h2 className="text-3xl font-bold classical-title text-theme-primary">
                  {t('privacy_jsx_h2_children_0__tipos_dados_coletados')}
                </h2>
                <p className="text-xl text-theme-secondary">
                  {t('privacy_jsx_p_children_0__visão_geral_diferentes')}
                </p>
              </Stack>

              <SequentialGrid cols={2} gap={6} delayBetweenItems={0.1}>
                {dataTypes.map((dataType, index) => (
                  <AnimatedCard
                    key={index}
                    hover="lift"
                    className="classical-card p-6"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0">
                        <dataType.icon className="w-6 h-6 text-theme-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold classical-title text-theme-primary mb-2">
                          {dataType.title}
                        </h3>
                        <Text
                          papel="rotulo"
                          tom="suave"
                          as="p"
                          className="mb-3"
                        >
                          {dataType.description}
                        </Text>
                        <Text papel="legenda" tom="fraco" as="div">
                          <span className="font-medium">
                            {t('privacy_jsx_span_children_0__retenção')}
                          </span>{' '}
                          {dataType.retention}
                        </Text>
                      </div>
                    </div>
                  </AnimatedCard>
                ))}
              </SequentialGrid>
            </div>
          </div>
        </AnimatedContainer>
      </section>

      {/* Privacy Sections */}
      <section className="py-8">
        <AnimatedContainer delay={0.1} staggerSpeed="fast">
          <div className="">
            <div className="coluna-leitura mx-auto space-y-8">
              {privacyData.map((section, index) => (
                <AnimatedItem
                  key={section.id}
                  direction="up"
                  springType="gentle"
                  delay={index * 0.1}
                >
                  <div className="classical-card !p-8 md:p-8">
                    <div className="flex items-start flex-col md:flex-row space-x-6">
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

      {/* Your Rights */}
      <section className="">
        <AnimatedContainer delay={0.1} staggerSpeed="normal">
          <div className="">
            <div className="coluna-leitura mx-auto">
              <AnimatedCard hover="lift" className="classical-card !p-8">
                <div className="flex items-start flex-col md:flex-row space-x-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0">
                    <PiCheck className="w-6 h-6 text-theme-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold classical-title text-theme-primary mb-4">
                      {t('privacy_jsx_h3_children_0__exercendo_seus_direitos')}
                    </h3>
                    <p className="text-theme-secondary mb-6">
                      {t('privacy_jsx_p_children_0__exercer_qualquer_seus')}
                    </p>
                    <Stack gap={3}>
                      <Inline gap={3}>
                        <PiEnvelopeSimple className="w-4 h-4 text-ouro-texto" />
                        <span className="text-theme-secondary">
                          privacidade@opusatlas.com
                        </span>
                      </Inline>
                      <Inline gap={3}>
                        <PiGear className="w-4 h-4 text-ouro-texto" />
                        <span className="text-theme-secondary">
                          {t('privacy_jsx_span_children_0__profile')}
                        </span>
                      </Inline>
                    </Stack>
                  </div>
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
          <div className="relative ">
            <div className="coluna-leitura mx-auto">
              <AnimatedCard
                hover="lift"
                className="classical-card p-12 text-center"
              >
                <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8">
                  <PiEnvelopeSimple className="w-10 h-10 text-theme-primary" />
                </div>

                <h2 className="text-3xl lg:text-4xl font-bold classical-title text-theme-primary mb-6">
                  {t('privacy_jsx_h2_children_0__dúvidas_sobre_privacidade')}
                </h2>

                <p className="text-xl text-theme-secondary mb-12 classical-body medida-texto mx-auto">
                  {t('privacy_jsx_p_children_0__nossa_equipe_está')}
                </p>

                <div className="flex flex-col sm:flex-row gap-6 justify-center">
                  <Link
                    href="/contact"
                    className="btn-classical-primary flex items-center justify-center space-x-3 px-10 py-4 text-lg"
                  >
                    <PiEnvelopeSimple className="w-5 h-5" />
                    <span>
                      {t('privacy_jsx_span_children_0__contatar_dpo')}
                    </span>
                  </Link>

                  <Link
                    href="/terms"
                    className="btn-classical-secondary flex items-center justify-center space-x-3 px-10 py-4 text-lg"
                  >
                    <PiShield className="w-5 h-5" />
                    <span>{t('privacy_jsx_span_children_0__termos_uso')}</span>
                  </Link>
                </div>

                <Inline
                  gap={8}
                  className="justify-center mt-12 pt-8 border-t border-theme-secondary"
                >
                  <Inline gap={2} className="text-theme-tertiary">
                    <PiShield className="w-4 h-4" />
                    <span className="text-sm">
                      {t('privacy_jsx_span_children_0__conformidade_lgpd')}
                    </span>
                  </Inline>
                  <Inline gap={2} className="text-theme-tertiary">
                    <PiLock className="w-4 h-4" />
                    <span className="text-sm">
                      {t('privacy_jsx_span_children_0__dados_criptografados')}
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
        <PiShield />
      </FloatingElement>
      <FloatingElement className="bottom-1/3 left-24 text-4xl" delay={3}>
        <PiScroll />
      </FloatingElement>
    </PageContainer>
  );
}
