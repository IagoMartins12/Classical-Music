'use client';

import React, { useState } from 'react';
import {
  FiBook,
  FiVideo,
  FiUser,
  FiUpload,
  FiSearch,
  FiPlay,
  FiSettings,
  FiMessageCircle,
  FiDownload,
  FiStar,
  FiArrowRight,
  FiBookOpen,
  FiHelpCircle,
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
  SequentialGrid,
  FloatingElement,
} from '../../components/animation/AnimatedComponents';

interface HelpCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  guides: Guide[];
}

interface Guide {
  id: string;
  title: string;
  description: string;
  type: 'article' | 'video' | 'interactive';
  duration?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

const helpCategories: HelpCategory[] = [
  {
    id: 'getting-started',
    title: 'Primeiros Passos',
    description: 'Aprenda a usar o Opus Atlas desde o início',
    icon: FiPlay,
    color: 'from-accent-green to-accent-blue',
    guides: [
      {
        id: 'first-steps',
        title: 'Como criar sua conta',
        description: 'Guia completo para criar e configurar sua conta',
        type: 'article',
        duration: '5 min',
        difficulty: 'beginner',
      },
      {
        id: 'profile-setup',
        title: 'Configurando seu perfil musical',
        description: 'Defina suas preferências e instrumentos',
        type: 'video',
        duration: '8 min',
        difficulty: 'beginner',
      },
      {
        id: 'first-favorites',
        title: 'Seus primeiros favoritos',
        description: 'Como favoritar compositores, obras e partituras',
        type: 'interactive',
        duration: '3 min',
        difficulty: 'beginner',
      },
    ],
  },
  {
    id: 'search-explore',
    title: 'Busca e Exploração',
    description: 'Encontre compositores, obras e partituras facilmente',
    icon: FiSearch,
    color: 'from-accent-blue to-accent-purple',
    guides: [
      {
        id: 'advanced-search',
        title: 'Busca avançada',
        description:
          'Use filtros e operadores para encontrar exatamente o que precisa',
        type: 'article',
        duration: '7 min',
        difficulty: 'intermediate',
      },
      {
        id: 'browse-categories',
        title: 'Navegando por categorias',
        description: 'Explore obras por período, instrumento e gênero',
        type: 'video',
        duration: '6 min',
        difficulty: 'beginner',
      },
      {
        id: 'discover-composers',
        title: 'Descobrindo novos compositores',
        description: 'Estratégias para expandir seu repertório musical',
        type: 'article',
        duration: '10 min',
        difficulty: 'intermediate',
      },
    ],
  },
  {
    id: 'study-mode',
    title: 'Modo Estudo',
    description: 'Aproveite ao máximo as ferramentas de estudo',
    icon: FiBook,
    color: 'from-accent-purple to-accent-red',
    guides: [
      {
        id: 'study-mode-intro',
        title: 'Introdução ao modo estudo',
        description: 'Visão geral de todas as ferramentas disponíveis',
        type: 'video',
        duration: '12 min',
        difficulty: 'beginner',
      },
      {
        id: 'metronome-timer',
        title: 'Usando cronômetro e metrônomo',
        description: 'Configure e use as ferramentas de timing',
        type: 'interactive',
        duration: '5 min',
        difficulty: 'beginner',
      },
      {
        id: 'practice-sessions',
        title: 'Registrando sessões de estudo',
        description: 'Acompanhe seu progresso e defina metas',
        type: 'article',
        duration: '8 min',
        difficulty: 'intermediate',
      },
    ],
  },
  {
    id: 'annotations',
    title: 'Anotações e Marcações',
    description: 'Faça anotações inteligentes nas partituras',
    icon: FiBookOpen,
    color: 'from-accent-amber to-accent-green',
    guides: [
      {
        id: 'annotation-basics',
        title: 'Básico das anotações',
        description: 'Como criar e gerenciar suas anotações',
        type: 'video',
        duration: '10 min',
        difficulty: 'beginner',
      },
      {
        id: 'advanced-annotations',
        title: 'Anotações avançadas',
        description: 'Dedilhados, dinâmicas e marcações especiais',
        type: 'article',
        duration: '15 min',
        difficulty: 'advanced',
      },
      {
        id: 'sharing-annotations',
        title: 'Compartilhando anotações',
        description: 'Como contribuir com a comunidade',
        type: 'interactive',
        duration: '6 min',
        difficulty: 'intermediate',
      },
    ],
  },
  {
    id: 'uploads',
    title: 'Sistema de Uploads',
    description: 'Contribua com compositores, obras e partituras',
    icon: FiUpload,
    color: 'from-accent-red to-accent-purple',
    guides: [
      {
        id: 'upload-guidelines',
        title: 'Diretrizes de upload',
        description: 'Regras e melhores práticas para uploads',
        type: 'article',
        duration: '12 min',
        difficulty: 'intermediate',
      },
      {
        id: 'upload-composer',
        title: 'Como adicionar um compositor',
        description: 'Processo completo de upload de compositor',
        type: 'video',
        duration: '18 min',
        difficulty: 'advanced',
      },
      {
        id: 'moderation-process',
        title: 'Processo de moderação',
        description: 'Entenda como funciona a revisão de uploads',
        type: 'article',
        duration: '8 min',
        difficulty: 'intermediate',
      },
    ],
  },
  {
    id: 'account-settings',
    title: 'Conta e Configurações',
    description: 'Gerencie sua conta e personalize a experiência',
    icon: FiSettings,
    color: 'from-brand-primary to-brand-secondary',
    guides: [
      {
        id: 'account-security',
        title: 'Segurança da conta',
        description: 'Proteja sua conta e dados pessoais',
        type: 'article',
        duration: '6 min',
        difficulty: 'beginner',
      },
      {
        id: 'privacy-settings',
        title: 'Configurações de privacidade',
        description: 'Controle o que é público em seu perfil',
        type: 'video',
        duration: '9 min',
        difficulty: 'intermediate',
      },
      {
        id: 'notification-settings',
        title: 'Gerenciando notificações',
        description: 'Configure quando e como receber notificações',
        type: 'interactive',
        duration: '4 min',
        difficulty: 'beginner',
      },
    ],
  },
];

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'beginner':
      return 'text-accent-green';
    case 'intermediate':
      return 'text-accent-amber';
    case 'advanced':
      return 'text-accent-red';
    default:
      return 'text-theme-secondary';
  }
};

const getDifficultyLabel = (difficulty: string) => {
  switch (difficulty) {
    case 'beginner':
      return 'Iniciante';
    case 'intermediate':
      return 'Intermediário';
    case 'advanced':
      return 'Avançado';
    default:
      return difficulty;
  }
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'article':
      return FiBook;
    case 'video':
      return FiVideo;
    case 'interactive':
      return FiPlay;
    default:
      return FiBook;
  }
};

export default function HelpPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

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
                  <FiHelpCircle className="w-5 h-5 text-brand-primary mr-2" />
                  <span className="text-brand-primary font-medium">
                    Tutoriais e Guias
                  </span>
                </div>
              </AnimatedItem>

              <AnimatedItem direction="up" springType="gentle">
                <h1 className="text-4xl lg:text-6xl font-bold classical-title text-theme-primary mb-6">
                  Central de
                  <span className="text-gradient-brand block lg:inline lg:ml-4">
                    Ajuda
                  </span>
                </h1>
              </AnimatedItem>

              <AnimatedItem direction="up" springType="gentle">
                <p className="text-xl lg:text-2xl text-theme-secondary leading-relaxed classical-body">
                  Guias completos, tutoriais em vídeo e dicas para dominar todas
                  as funcionalidades do Opus Atlas.
                </p>
              </AnimatedItem>
            </div>
          </div>
          <AnimatedMusicalNotes />
        </AnimatedContainer>
      </section>

      {/* Quick Access */}
      <section className="py-8">
        <AnimatedContainer delay={0.1} staggerSpeed="normal">
          <div className="section-wrap">
            <div className="max-w-4xl mx-auto">
              <AnimatedCard hover="lift" className="classical-card p-8 mb-12">
                <div className="text-center">
                  <h2 className="text-2xl font-bold classical-title text-theme-primary mb-6">
                    Acesso Rápido
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Link
                      href="/faq"
                      className="flex items-center justify-center space-x-3 p-4 bg-gradient-to-r from-accent-blue/10 to-accent-purple/10 border border-accent-blue/20 rounded-lg hover:border-accent-blue/40 transition-all"
                    >
                      <FiHelpCircle className="w-5 h-5 text-accent-blue" />
                      <span className="text-theme-primary font-medium">
                        Perguntas Frequentes
                      </span>
                    </Link>

                    <Link
                      href="/contact"
                      className="flex items-center justify-center space-x-3 p-4 bg-gradient-to-r from-accent-green/10 to-accent-blue/10 border border-accent-green/20 rounded-lg hover:border-accent-green/40 transition-all"
                    >
                      <FiMessageCircle className="w-5 h-5 text-accent-green" />
                      <span className="text-theme-primary font-medium">
                        Fale Conosco
                      </span>
                    </Link>

                    <Link
                      href="/support"
                      className="flex items-center justify-center space-x-3 p-4 bg-gradient-to-r from-accent-red/10 to-accent-amber/10 border border-accent-red/20 rounded-lg hover:border-accent-red/40 transition-all"
                    >
                      <FiUser className="w-5 h-5 text-accent-red" />
                      <span className="text-theme-primary font-medium">
                        Suporte Técnico
                      </span>
                    </Link>
                  </div>
                </div>
              </AnimatedCard>
            </div>
          </div>
        </AnimatedContainer>
      </section>

      {/* Help Categories */}
      <section className="py-8">
        <AnimatedContainer delay={0.1} staggerSpeed="fast">
          <div className="section-wrap">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl lg:text-4xl font-bold classical-title text-theme-primary mb-4">
                  Categorias de Ajuda
                </h2>
                <p className="text-xl text-theme-secondary max-w-3xl mx-auto">
                  Escolha a categoria que melhor se adequa à sua necessidade
                </p>
              </div>

              <SequentialGrid cols={3} gap={8} delayBetweenItems={0.1}>
                {helpCategories.map((category) => (
                  <AnimatedCard
                    key={category.id}
                    hover="lift"
                    className={`classical-card p-6 cursor-pointer transition-all ${
                      selectedCategory === category.id
                        ? 'ring-2 ring-brand-primary'
                        : ''
                    }`}
                    onClick={() =>
                      setSelectedCategory(
                        selectedCategory === category.id ? null : category.id
                      )
                    }
                  >
                    <div
                      className={`w-16 h-16 bg-gradient-to-br ${category.color} rounded-2xl flex items-center justify-center mb-6`}
                    >
                      <category.icon className="w-8 h-8 text-theme-primary" />
                    </div>

                    <h3 className="text-xl font-semibold classical-title text-theme-primary mb-3">
                      {category.title}
                    </h3>

                    <p className="text-theme-secondary classical-body mb-4">
                      {category.description}
                    </p>

                    <div className="text-brand-primary font-medium flex items-center">
                      <span>{category.guides.length} guias</span>
                      <FiArrowRight className="w-4 h-4 ml-2" />
                    </div>
                  </AnimatedCard>
                ))}
              </SequentialGrid>
            </div>
          </div>
        </AnimatedContainer>
      </section>

      {/* Selected Category Guides */}
      {selectedCategory && (
        <section className="py-8">
          <AnimatedContainer delay={0.1} staggerSpeed="fast">
            <div className="section-wrap">
              <div className="max-w-4xl mx-auto">
                {(() => {
                  const category = helpCategories.find(
                    (cat) => cat.id === selectedCategory
                  );
                  if (!category) return null;

                  return (
                    <div>
                      <div className="text-center mb-8">
                        <h3 className="text-2xl font-bold classical-title text-theme-primary mb-2">
                          {category.title}
                        </h3>
                        <p className="text-theme-secondary">
                          {category.description}
                        </p>
                      </div>

                      <div className="space-y-4">
                        {category.guides.map((guide, index) => {
                          const IconComponent = getTypeIcon(guide.type);
                          return (
                            <AnimatedItem
                              key={guide.id}
                              direction="up"
                              springType="gentle"
                              delay={index * 0.1}
                            >
                              <div className="classical-card p-6 hover:border-brand-primary/40 transition-all cursor-pointer">
                                <div className="flex items-start space-x-4">
                                  <div className="w-12 h-12 bg-gradient-to-br from-accent-blue to-accent-purple rounded-xl flex items-center justify-center flex-shrink-0">
                                    <IconComponent className="w-6 h-6 text-theme-primary" />
                                  </div>

                                  <div className="flex-grow">
                                    <div className="flex items-center justify-between mb-2">
                                      <h4 className="text-lg font-semibold classical-title text-theme-primary">
                                        {guide.title}
                                      </h4>
                                      <div className="flex items-center space-x-3">
                                        {guide.duration && (
                                          <span className="text-sm text-theme-tertiary">
                                            {guide.duration}
                                          </span>
                                        )}
                                        <span
                                          className={`text-sm font-medium ${getDifficultyColor(
                                            guide.difficulty
                                          )}`}
                                        >
                                          {getDifficultyLabel(guide.difficulty)}
                                        </span>
                                      </div>
                                    </div>

                                    <p className="text-theme-secondary classical-body">
                                      {guide.description}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </AnimatedItem>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </AnimatedContainer>
        </section>
      )}

      {/* Popular Resources */}
      <section className="py-8 bg-gradient-to-b from-transparent to-theme-secondary/30">
        <AnimatedContainer delay={0.1} staggerSpeed="normal">
          <div className="section-wrap">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold classical-title text-theme-primary mb-4">
                  Recursos Populares
                </h2>
                <p className="text-xl text-theme-secondary">
                  Os guias mais acessados pela comunidade
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <AnimatedCard hover="lift" className="classical-card p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <FiStar className="w-5 h-5 text-accent-amber" />
                    <span className="text-accent-amber font-medium">
                      Mais Popular
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold classical-title text-theme-primary mb-3">
                    Guia Completo do Modo Estudo
                  </h3>
                  <p className="text-theme-secondary classical-body mb-4">
                    Aprenda a usar todas as ferramentas de estudo para maximizar
                    seu aprendizado musical.
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FiVideo className="w-4 h-4 text-accent-blue" />
                      <span className="text-sm text-theme-tertiary">
                        25 min
                      </span>
                    </div>
                    <span className="text-sm text-accent-green font-medium">
                      Iniciante
                    </span>
                  </div>
                </AnimatedCard>

                <AnimatedCard hover="lift" className="classical-card p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <FiDownload className="w-5 h-5 text-accent-green" />
                    <span className="text-accent-green font-medium">
                      Prático
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold classical-title text-theme-primary mb-3">
                    Fazendo Uploads de Qualidade
                  </h3>
                  <p className="text-theme-secondary classical-body mb-4">
                    Dicas e melhores práticas para contribuir com conteúdo de
                    alta qualidade para a comunidade.
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FiBook className="w-4 h-4 text-accent-blue" />
                      <span className="text-sm text-theme-tertiary">
                        15 min
                      </span>
                    </div>
                    <span className="text-sm text-accent-red font-medium">
                      Avançado
                    </span>
                  </div>
                </AnimatedCard>
              </div>
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
                  <FiMessageCircle className="w-10 h-10 text-theme-primary" />
                </div>

                <h2 className="text-3xl lg:text-4xl font-bold classical-title text-theme-primary mb-6">
                  Ainda precisa de ajuda?
                </h2>

                <p className="text-xl text-theme-secondary mb-12 classical-body">
                  Nossa equipe de suporte está sempre pronta para ajudar você a
                  aproveitar ao máximo o Opus Atlas.
                </p>

                <div className="flex flex-col sm:flex-row gap-6 justify-center">
                  <Link
                    href="/contact"
                    className="btn-classical-primary flex items-center justify-center space-x-3 px-10 py-4 text-lg"
                  >
                    <FiMessageCircle className="w-5 h-5" />
                    <span>Fale Conosco</span>
                  </Link>

                  <Link
                    href="/support"
                    className="btn-classical-secondary flex items-center justify-center space-x-3 px-10 py-4 text-lg"
                  >
                    <FiUser className="w-5 h-5" />
                    <span>Suporte Técnico</span>
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
        <FiBook />
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
