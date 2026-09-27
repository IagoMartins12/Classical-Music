'use client';

import React from 'react';
import { GiGrandPiano, GiMusicalScore } from 'react-icons/gi';
import {
  PiBookOpen,
  PiChalkboardTeacher,
  PiGlobe,
  PiHeadphones,
  PiHeart,
  PiMedal,
  PiMetronome,
  PiMusicNotes,
  PiPencilLine,
  PiScroll,
  PiStar,
  PiTarget,
  PiUploadSimple,
  PiUsers,
} from 'react-icons/pi';
import AnimatedMusicalNotes from '../../../components/AnimatedMusicalNotes';
import Link from '@/app/components/LocalizedLink';
import {
  PageContainer,
  AnimatedContainer,
  AnimatedItem,
  AnimatedCard,
  SequentialGrid,
  FloatingElement,
} from '../../../components/animation/AnimatedComponents';
import AboutUsButton from '@/app/components/AboutUsButton';
import { useTranslation } from '@/app/context/TranslationContext';
import { Stack, Inline } from '@/app/components/ui/Layout';
import { Text } from '@/app/components/ui/Text';

export default function AboutPage() {
  const { t, language } = useTranslation({ sections: ['pages/about-us'] });
  const features = [
    {
      icon: PiMusicNotes,
      title: t('about_feature_0_title'),
      description: t('about_feature_0_description'),
    },
    {
      icon: GiMusicalScore,
      title: t('about_feature_1_title'),
      description: t('about_feature_1_description'),
    },
    {
      icon: PiChalkboardTeacher,
      title: t('about_feature_2_title'),
      description: t('about_feature_2_description'),
    },
    {
      icon: PiPencilLine,
      title: t('about_feature_3_title'),
      description: t('about_feature_3_description'),
    },
    {
      icon: PiTarget,
      title: t('about_feature_4_title'),
      description: t('about_feature_4_description'),
    },
    {
      icon: PiUploadSimple,
      title: t('about_feature_5_title'),
      description: t('about_feature_5_description'),
    },
  ];

  const values = [
    {
      icon: PiHeart,
      title: t('about_value_0_title'),
      description: t('about_value_0_description'),
    },
    {
      icon: PiGlobe,
      title: t('about_value_1_title'),
      description: t('about_value_1_description'),
    },
    {
      icon: PiStar,
      title: t('about_value_2_title'),
      description: t('about_value_2_description'),
    },
  ];

  return (
    <PageContainer showBackground={true} className="classical-theme">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16">
        <div className="absolute inset-0"></div>
        <AnimatedContainer delay={0.1} staggerSpeed="normal">
          <div className="relative section-wrap">
            <div className="text-center max-w-4xl mx-auto">
              <AnimatedItem direction="scale" springType="bouncy">
                <div className="inline-flex items-center px-6 py-3 rounded-full mb-8 bg-sup-2">
                  <GiGrandPiano className="w-5 h-5 text-ouro-texto mr-2" />
                  <span className="text-ouro-texto font-medium">
                    {t('about_hero_badge')}
                  </span>
                </div>
              </AnimatedItem>

              <AnimatedItem direction="up" springType="gentle">
                <h1 className="text-4xl lg:text-6xl font-bold classical-title text-theme-primary mb-6">
                  {t('about_hero_title_1')}
                  <span className="text-gradient-brand block lg:inline ml-2 lg:ml-4">
                    {t('about_hero_title_2')}
                  </span>
                </h1>
              </AnimatedItem>

              <AnimatedItem direction="up" springType="gentle">
                <p className="text-xl lg:text-2xl text-theme-secondary leading-relaxed classical-body medida-texto mx-auto">
                  {t('about_hero_description')}
                </p>
              </AnimatedItem>

              <AnimatedItem direction="up" springType="gentle">
                <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
                  <AboutUsButton action="register" language={language} />
                  <Link
                    href="/composers"
                    className="btn-classical-secondary flex items-center justify-center space-x-2 px-8 py-4 text-lg"
                  >
                    <PiBookOpen className="w-5 h-5" />
                    <span>{t('about_hero_explore_btn')}</span>
                  </Link>
                </div>
              </AnimatedItem>
            </div>
          </div>

          <AnimatedMusicalNotes />
        </AnimatedContainer>
      </section>

      {/* Mission Section */}
      <section className="py-8">
        <AnimatedContainer delay={0.1} staggerSpeed="normal">
          <div className="section-wrap">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-sup-2">
                  <PiTarget className="w-4 h-4 mr-2" />
                  <span className="font-medium text-sm">
                    {t('about_mission_badge')}
                  </span>
                </div>

                <h2 className="text-3xl lg:text-4xl font-bold classical-title text-theme-primary">
                  {t('about_mission_title')}
                </h2>

                <Stack gap={6}>
                  <p className="text-lg text-theme-secondary leading-relaxed classical-body medida-texto">
                    {t('about_mission_paragraph_1')}
                  </p>

                  <p className="text-lg text-theme-secondary leading-relaxed classical-body medida-texto">
                    {t('about_mission_paragraph_2')}
                  </p>

                  <AnimatedCard
                    hover="lift"
                    className="flex items-start space-x-4 p-6 rounded-2xl bg-sup-2"
                  >
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0">
                      <PiHeart className="w-6 h-6 text-theme-primary" />
                    </div>
                    <Stack gap={2}>
                      <h3 className="font-semibold text-theme-primary classical-title">
                        {t('about_mission_highlight_title')}
                      </h3>
                      <p className="text-theme-secondary">
                        {t('about_mission_highlight_description')}
                      </p>
                    </Stack>
                  </AnimatedCard>
                </Stack>
              </div>

              <div className="relative">
                <AnimatedCard
                  hover="lift"
                  className="classical-card p-8 relative overflow-hidden"
                >
                  <div className="relative z-10">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-ouro-texto classical-title">
                          {t('about_stats_composers')}
                        </div>
                        <Text papel="rotulo" tom="fraco" as="div">
                          {t('about_stats_composers_label')}
                        </Text>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-ouro-texto classical-title">
                          {t('about_stats_works')}
                        </div>
                        <Text papel="rotulo" tom="fraco" as="div">
                          {t('about_stats_works_label')}
                        </Text>
                      </div>
                    </div>

                    <Stack className="mt-8 pt-6 border-t border-theme-secondary">
                      <h4 className="font-semibold text-theme-primary classical-title">
                        {t('about_stats_resources_title')}
                      </h4>
                      <Stack gap={3}>
                        <Inline gap={3}>
                          <div className="w-2 h-2 rounded-full"></div>
                          <Text papel="rotulo" tom="suave">
                            {t('about_stats_resource_1')}
                          </Text>
                        </Inline>
                        <Inline gap={3}>
                          <div className="w-2 h-2 rounded-full"></div>
                          <Text papel="rotulo" tom="suave">
                            {t('about_stats_resource_2')}
                          </Text>
                        </Inline>
                        <Inline gap={3}>
                          <div className="w-2 h-2 rounded-full"></div>
                          <Text papel="rotulo" tom="suave">
                            {t('about_stats_resource_3')}
                          </Text>
                        </Inline>
                        <Inline gap={3}>
                          <div className="w-2 h-2 rounded-full"></div>
                          <Text papel="rotulo" tom="suave">
                            {t('about_stats_resource_4')}
                          </Text>
                        </Inline>
                      </Stack>
                    </Stack>
                  </div>
                </AnimatedCard>
              </div>
            </div>
          </div>
        </AnimatedContainer>
      </section>

      {/* Features Section */}
      <section className="py-8 bg-gradient-to-b from-transparent">
        <AnimatedContainer delay={0.1} staggerSpeed="fast">
          <div className="section-wrap">
            <div className="text-center mb-16">
              <div className="inline-flex items-center px-4 py-2 rounded-full mb-6 bg-sup-2">
                <PiStar className="w-4 h-4 mr-2" />
                <span className="font-medium text-sm">
                  {t('about_features_badge')}
                </span>
              </div>

              <h2 className="text-3xl lg:text-4xl font-bold classical-title text-theme-primary mb-6">
                {t('about_features_title')}
              </h2>

              <p className="text-xl text-theme-secondary medida-texto mx-auto classical-body">
                {t('about_features_description')}
              </p>
            </div>

            {/* Animação Sequencial para Features */}
            <SequentialGrid
              cols={3}
              gap={8}
              delayBetweenItems={0.15}
              className=""
            >
              {features.map((feature, index) => (
                <FeatureCard key={index} feature={feature} />
              ))}
            </SequentialGrid>
          </div>
        </AnimatedContainer>
      </section>

      {/* Values Section */}
      <section className="py-8">
        <AnimatedContainer delay={0.1} staggerSpeed="normal">
          <div className="section-wrap">
            <div className="text-center mb-16">
              <div className="inline-flex items-center px-4 py-2 rounded-full mb-6 bg-sup-2">
                <PiHeart className="w-4 h-4 text-ouro-texto mr-2" />
                <Text papel="rotulo" tom="ouro" className="font-medium">
                  {t('about_values_badge')}
                </Text>
              </div>

              <h2 className="text-3xl lg:text-4xl font-bold classical-title text-theme-primary mb-6">
                {t('about_values_title')}
              </h2>
            </div>

            {/* Animação Sequencial para Values */}
            <SequentialGrid
              cols={3}
              gap={8}
              delayBetweenItems={0.2}
              className=""
            >
              {values.map((value, index) => (
                <ValueCard key={index} value={value} />
              ))}
            </SequentialGrid>
          </div>
        </AnimatedContainer>
      </section>

      {/* CTA Section */}
      <section className="py-8 relative overflow-hidden">
        <div className="absolute inset-0"></div>

        <AnimatedContainer delay={0.1} staggerSpeed="normal">
          <div className="relative section-wrap">
            <AnimatedCard
              hover="lift"
              className="classical-card p-12 text-center max-w-4xl mx-auto"
            >
              <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8">
                <PiMetronome className="w-10 h-10 text-theme-primary" />
              </div>

              <h2 className="text-3xl lg:text-4xl font-bold classical-title text-theme-primary mb-6">
                {t('about_cta_title')}
              </h2>

              <p className="text-xl text-theme-secondary mb-12 classical-body medida-texto mx-auto">
                {t('about_cta_description')}
              </p>

              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <AboutUsButton action="login" language={language} />

                <Link
                  href="/"
                  className="btn-classical-secondary flex items-center justify-center space-x-3 px-10 py-4 text-lg"
                >
                  <PiHeadphones className="w-5 h-5" />
                  <span>{t('about_cta_explore_btn')}</span>
                </Link>
              </div>

              <Inline
                gap={8}
                className="justify-center mt-12 pt-8 border-t border-theme-secondary"
              >
                <Inline gap={2} className="text-theme-tertiary">
                  <PiUsers className="w-4 h-4" />
                  <span className="text-sm">{t('about_cta_stat_1')}</span>
                </Inline>
                <Inline gap={2} className="text-theme-tertiary">
                  <PiStar className="w-4 h-4" />
                  <span className="text-sm">{t('about_cta_stat_2')}</span>
                </Inline>
                <Inline gap={2} className="text-theme-tertiary">
                  <PiMedal className="w-4 h-4" />
                  <span className="text-sm">{t('about_cta_stat_3')}</span>
                </Inline>
              </Inline>
            </AnimatedCard>
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
        <PiScroll />
      </FloatingElement>
      <FloatingElement className="bottom-1/3 left-24 text-4xl" delay={3}>
        <PiMetronome />
      </FloatingElement>
    </PageContainer>
  );
}

// Componente para Feature Card
interface FeatureCardProps {
  feature: {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    description: string;
  };
}

function FeatureCard({ feature }: FeatureCardProps) {
  return (
    <AnimatedCard hover="lift" className="classical-card p-6">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
        <feature.icon className="w-8 h-8 text-theme-primary" />
      </div>

      <h3 className="text-xl font-semibold text-theme-primary classical-title mb-4">
        {feature.title}
      </h3>

      <p className="text-theme-secondary leading-relaxed classical-body">
        {feature.description}
      </p>
    </AnimatedCard>
  );
}

// Componente para Value Card
interface ValueCardProps {
  value: {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    description: string;
  };
}

function ValueCard({ value }: ValueCardProps) {
  return (
    <div className="text-center group">
      <AnimatedItem
        hover="scale"
        className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6"
      >
        <value.icon className="w-10 h-10 text-theme-primary" />
      </AnimatedItem>

      <h3 className="text-2xl font-semibold text-theme-primary classical-title mb-4 transition-colors duration-300">
        {value.title}
      </h3>

      <p className="text-theme-secondary leading-relaxed classical-body text-lg medida-texto mx-auto">
        {value.description}
      </p>
    </div>
  );
}
