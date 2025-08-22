'use client';
import React from 'react';
import {
  FiHeart,
  FiUsers,
  FiBookOpen,
  FiTarget,
  FiStar,
  FiTrendingUp,
  FiAward,
  FiGlobe,
  FiHeadphones,
} from 'react-icons/fi';
import {
  GiMusicalNotes,
  GiGrandPiano,
  GiScrollQuill,
  GiMetronome,
} from 'react-icons/gi';
import AnimatedMusicalNotes from '../../components/AnimatedMusicalNotes';
import Link from 'next/link';

// Importar componentes de animação
import {
  PageContainer,
  AnimatedContainer,
  AnimatedItem,
  AnimatedCard,
  SequentialGrid,
  FloatingElement,
} from '../../components/animation/AnimatedComponents';
import AboutUsButton from './AboutUsButton';
import { useTranslation } from '@/app/hooks/useTranslation';

export default function AboutPage() {
  const { t } = useTranslation({ sections: ['page/aboutUs'] });

  const features = [
    {
      icon: GiMusicalNotes,
      title: 'Enciclopédia Completa',
      description:
        'Explore compositores, peças e períodos históricos da música clássica com informações detalhadas e curadas por especialistas.',
    },
    {
      icon: FiBookOpen,
      title: 'Ferramentas de Estudo',
      description:
        'Cronômetro, metrônomo, anotações e modo de estudo personalizado para potencializar sua prática musical.',
    },
    {
      icon: FiTarget,
      title: 'Progresso Personalizado',
      description:
        'Acompanhe seu desenvolvimento com estatísticas, metas e um diário de estudo completo.',
    },
    {
      icon: FiUsers,
      title: 'Comunidade Musical',
      description:
        'Compartilhe dicas, anotações e experiências com outros entusiastas da música clássica.',
    },
    {
      icon: FiAward,
      title: 'Desafios Semanais',
      description:
        'Descubra novas peças adaptadas ao seu nível e mantenha-se motivado com desafios constantes.',
    },
    {
      icon: FiTrendingUp,
      title: 'Quiz Interativos',
      description:
        'Teste seus conhecimentos sobre períodos, compositores e teoria musical de forma divertida.',
    },
  ];

  const values = [
    {
      icon: FiHeart,
      title: 'Paixão pela Música',
      description:
        'Acreditamos que a música clássica tem o poder de transformar vidas e conectar pessoas através dos séculos.',
    },
    {
      icon: FiGlobe,
      title: 'Acessibilidade',
      description:
        'Democratizamos o acesso ao conhecimento musical, tornando a música clássica acessível para todos.',
    },
    {
      icon: FiStar,
      title: 'Excelência',
      description:
        'Comprometemo-nos com a qualidade e precisão das informações, oferecendo conteúdo confiável e bem curado.',
    },
  ];

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
                  <GiGrandPiano className="w-5 h-5 text-brand-primary mr-2" />
                  <span className="text-brand-primary font-medium">
                    {t('aboutUs_jsx_span_children_0__welcome')}
                  </span>
                </div>
              </AnimatedItem>

              <AnimatedItem direction="up" springType="gentle">
                <h1 className="text-4xl lg:text-6xl font-bold classical-title text-theme-primary mb-6">
                  {t('aboutUs_jsx_h1_children_0__sua_jornada_pela')}
                  <span className="text-gradient-brand block lg:inline lg:ml-4">
                    {t('aboutUs_jsx_span_children_0__music')}
                  </span>
                </h1>
              </AnimatedItem>

              <AnimatedItem direction="up" springType="gentle">
                <p className="text-xl lg:text-2xl text-theme-secondary leading-relaxed classical-body">
                  {t('aboutUs_jsx_p_children_0__music')}
                </p>
              </AnimatedItem>

              <AnimatedItem direction="up" springType="gentle">
                <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
                  <AboutUsButton action="register" />
                  <Link
                    href="/composers"
                    className="btn-classical-secondary flex items-center justify-center space-x-2 px-8 py-4 text-lg"
                  >
                    <FiBookOpen className="w-5 h-5" />
                    <span>
                      {t('aboutUs_jsx_span_children_0__explore_enciclopédia')}
                    </span>
                  </Link>
                </div>
              </AnimatedItem>
            </div>
          </div>

          {/* Floating Music Notes */}
          <AnimatedMusicalNotes />
        </AnimatedContainer>
      </section>

      {/* Mission Section */}
      <section className="py-8">
        <AnimatedContainer delay={0.1} staggerSpeed="normal">
          <div className="section-wrap">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-accent-blue/20 to-accent-purple/20 border border-accent-blue/30 rounded-full">
                  <FiTarget className="w-4 h-4 text-accent-blue mr-2" />
                  <span className="text-accent-blue font-medium text-sm">
                    {t('aboutUs_jsx_span_children_0__nossa_missão')}
                  </span>
                </div>

                <h2 className="text-3xl lg:text-4xl font-bold classical-title text-theme-primary">
                  {t('aboutUs_jsx_h2_children_0__music')}
                </h2>

                <div className="space-y-6">
                  <p className="text-lg text-theme-secondary leading-relaxed classical-body">
                    {t('aboutUs_jsx_p_children_0__music_1')}
                  </p>

                  <p className="text-lg text-theme-secondary leading-relaxed classical-body">
                    {t('aboutUs_jsx_p_children_0__study')}
                  </p>

                  <AnimatedCard
                    hover="lift"
                    className="flex items-start space-x-4 p-6 bg-gradient-to-r from-brand-primary/5 to-brand-secondary/5 border border-brand-primary/20 rounded-2xl"
                  >
                    <div className="w-12 h-12 bg-brand-gradient rounded-xl flex items-center justify-center flex-shrink-0">
                      <FiHeart className="w-6 h-6 text-theme-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-theme-primary classical-title mb-2">
                        {t('aboutUs_jsx_h3_children_0__music')}
                      </h3>
                      <p className="text-theme-secondary">
                        {t('aboutUs_jsx_p_children_0__music_2')}
                      </p>
                    </div>
                  </AnimatedCard>
                </div>
              </div>

              <div className="relative">
                <AnimatedCard
                  hover="lift"
                  className="classical-card p-8 relative overflow-hidden"
                >
                  <div className="absolute top-4 right-4 text-6xl text-brand-primary/5">
                    <GiScrollQuill />
                  </div>

                  <div className="relative z-10">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-brand-primary classical-title">
                          {t('aboutUs_jsx_div_children_0__text')}
                        </div>
                        <div className="text-theme-tertiary text-sm">
                          {t('aboutUs_jsx_div_children_0__composer')}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-brand-primary classical-title">
                          {t('aboutUs_jsx_div_children_0__text_1')}
                        </div>
                        <div className="text-theme-tertiary text-sm">
                          {t('aboutUs_jsx_div_children_0__peças')}
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-theme-secondary">
                      <h4 className="font-semibold text-theme-primary classical-title mb-4">
                        {t('aboutUs_jsx_h4_children_0__recursos_disponíveis')}
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-brand-primary rounded-full"></div>
                          <span className="text-theme-secondary text-sm">
                            {t(
                              'aboutUs_jsx_span_children_0__biografias_detalhadas'
                            )}
                          </span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-accent-blue rounded-full"></div>
                          <span className="text-theme-secondary text-sm">
                            {t('aboutUs_jsx_span_children_0__score')}
                          </span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-accent-purple rounded-full"></div>
                          <span className="text-theme-secondary text-sm">
                            {t('aboutUs_jsx_span_children_0__study')}
                          </span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-accent-green rounded-full"></div>
                          <span className="text-theme-secondary text-sm">
                            {t('aboutUs_jsx_span_children_0__comunidade_ativa')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </AnimatedCard>
              </div>
            </div>
          </div>
        </AnimatedContainer>
      </section>

      {/* Features Section */}
      <section className="py-8 bg-gradient-to-b from-transparent to-theme-secondary/30">
        <AnimatedContainer delay={0.1} staggerSpeed="fast">
          <div className="section-wrap">
            <div className="text-center mb-16">
              <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-accent-purple/20 to-accent-blue/20 border border-accent-purple/30 rounded-full mb-6">
                <FiStar className="w-4 h-4 text-accent-purple mr-2" />
                <span className="text-accent-purple font-medium text-sm">
                  {t('aboutUs_jsx_span_children_0__funcionalidades')}
                </span>
              </div>

              <h2 className="text-3xl lg:text-4xl font-bold classical-title text-theme-primary mb-6">
                {t('aboutUs_jsx_h2_children_0__tudo_precisa_lugar')}
              </h2>

              <p className="text-xl text-theme-secondary max-w-3xl mx-auto classical-body">
                {t('aboutUs_jsx_p_children_0__music_3')}
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
              <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-brand-primary/20 to-brand-secondary/20 border border-brand-primary/30 rounded-full mb-6">
                <FiHeart className="w-4 h-4 text-brand-primary mr-2" />
                <span className="text-brand-primary font-medium text-sm">
                  {t('aboutUs_jsx_span_children_0__nossos_valores')}
                </span>
              </div>

              <h2 className="text-3xl lg:text-4xl font-bold classical-title text-theme-primary mb-6">
                {t('aboutUs_jsx_h2_children_0__princípios_nos_guiam')}
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
        <div className="absolute inset-0 bg-gradient-to-r from-brand-primary/10 via-accent-purple/5 to-accent-blue/10"></div>

        <AnimatedContainer delay={0.1} staggerSpeed="normal">
          <div className="relative section-wrap">
            <AnimatedCard
              hover="lift"
              className="classical-card p-12 text-center max-w-4xl mx-auto"
            >
              <div className="w-20 h-20 bg-brand-gradient rounded-3xl flex items-center justify-center mx-auto mb-8">
                <GiMetronome className="w-10 h-10 text-theme-primary" />
              </div>

              <h2 className="text-3xl lg:text-4xl font-bold classical-title text-theme-primary mb-6">
                {t('aboutUs_jsx_h2_children_0__pronto_começar_sua')}
              </h2>

              <p className="text-xl text-theme-secondary mb-12 classical-body">
                {t('aboutUs_jsx_p_children_0__music_4')}
              </p>

              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <AboutUsButton action="login" />

                <Link
                  href="/"
                  className="btn-classical-secondary flex items-center justify-center space-x-3 px-10 py-4 text-lg"
                >
                  <FiHeadphones className="w-5 h-5" />
                  <span>
                    {t('aboutUs_jsx_span_children_0__explorar_cadastro')}
                  </span>
                </Link>
              </div>

              <div className="flex items-center justify-center space-x-8 mt-12 pt-8 border-t border-theme-secondary">
                <div className="flex items-center space-x-2 text-theme-tertiary">
                  <FiUsers className="w-4 h-4" />
                  <span className="text-sm">
                    {t('aboutUs_jsx_span_children_0__user')}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-theme-tertiary">
                  <FiStar className="w-4 h-4" />
                  <span className="text-sm">
                    {t('aboutUs_jsx_span_children_0__avaliação')}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-theme-tertiary">
                  <FiAward className="w-4 h-4" />
                  <span className="text-sm">
                    {t('aboutUs_jsx_span_children_0__totalmente_gratuito')}
                  </span>
                </div>
              </div>
            </AnimatedCard>
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
        <GiScrollQuill />
      </FloatingElement>
      <FloatingElement
        className="bottom-1/3 left-24 text-4xl text-brand-secondary/5"
        delay={3}
      >
        <GiMetronome />
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
      <div className="w-16 h-16 bg-gradient-to-br from-accent-blue to-accent-purple rounded-2xl flex items-center justify-center mb-6">
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
        className="w-20 h-20 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-3xl flex items-center justify-center mx-auto mb-6"
      >
        <value.icon className="w-10 h-10 text-theme-primary" />
      </AnimatedItem>

      <h3 className="text-2xl font-semibold text-theme-primary classical-title mb-4 group-hover:text-brand-primary transition-colors duration-300">
        {value.title}
      </h3>

      <p className="text-theme-secondary leading-relaxed classical-body text-lg">
        {value.description}
      </p>
    </div>
  );
}
