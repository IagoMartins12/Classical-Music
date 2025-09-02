'use client';

import React, { JSX, useState } from 'react';
import {
  FiBook,
  FiVideo,
  FiUser,
  FiUpload,
  FiSearch,
  FiPlay,
  FiMessageCircle,
  FiArrowRight,
  FiBookOpen,
  FiHelpCircle,
  FiHeart,
  FiUserCheck,
  FiFlag,
  FiMail,
  FiTarget,
} from 'react-icons/fi';
import { GiMusicalNotes, GiGrandPiano, GiScrollQuill } from 'react-icons/gi';
import AnimatedMusicalNotes from '../../components/AnimatedMusicalNotes';
import Link from 'next/link';
import {
  PageContainer,
  AnimatedContainer,
  AnimatedItem,
  AnimatedCard,
  SequentialGrid,
  FloatingElement,
} from '../../components/animation/AnimatedComponents';
import { useTranslation } from '@/app/context/TranslationContext';

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
  type: 'article' | 'interactive';
  duration?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  content: string;
}

const getDifficultyColor = (difficulty: string): string => {
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

// Componente para exibir cards de guias
interface GuideCardProps {
  guide: Guide;
  t: (key: string) => string;
}

function renderInlineBold(text: string) {
  if (!text.includes('**')) {
    return text;
  }

  const parts = text.split(/(\*\*.*?\*\*)/g);

  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} className="font-semibold text-theme-primary">
          {part.substring(2, part.length - 2)}
        </strong>
      );
    }
    return part;
  });
}

function renderMarkdownInline(line: string, lineIndex: number) {
  const parts = line.split(/(\*\*.*?\*\*)/g);

  return (
    <p key={lineIndex} className="mb-2 leading-relaxed">
      {parts.map((part, partIndex) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong
              key={`${lineIndex}-${partIndex}`}
              className="font-semibold text-theme-primary"
            >
              {part.substring(2, part.length - 2)}
            </strong>
          );
        }
        return part;
      })}
    </p>
  );
}

function GuideCard({ guide, t }: GuideCardProps): JSX.Element {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const IconComponent = getTypeIcon(guide.type);

  return (
    <div className="classical-card overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 md:p-6 text-left focus:outline-none hover:bg-theme-elevated/50 transition-colors cursor-pointer"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-accent-blue to-accent-purple rounded-xl flex items-center justify-center flex-shrink-0">
              <IconComponent className="w-6 h-6 text-theme-primary" />
            </div>
            <div className="flex-grow">
              <div className="flex items-center space-x-2 mb-1">
                <h4 className="text-lg font-semibold classical-title text-theme-primary">
                  {guide.title}
                </h4>
                <span className="text-sm text-brand-primary hidden md:flex font-medium">
                  {isExpanded ? t('help_guide_close') : t('help_guide_open')}
                </span>

                <span className="text-sm text-brand-primary block md:hidden font-medium">
                  {isExpanded ? (
                    <FiArrowRight className="w-5 h-5 text-brand-primary rotate-90 transition-transform duration-300" />
                  ) : (
                    <FiArrowRight className="w-5 h-5 text-brand-primary transition-transform duration-300" />
                  )}
                </span>
              </div>
              <p className="text-theme-secondary text-sm mt-1 classical-body">
                {guide.description}
              </p>
              <div className="flex items-center space-x-3 mt-2">
                {guide.duration && (
                  <span className="text-sm text-theme-tertiary">
                    📖 {guide.duration}
                  </span>
                )}
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full bg-theme-elevated ${getDifficultyColor(
                    guide.difficulty
                  )}`}
                >
                  {t(`help_difficulty_${guide.difficulty}`)}
                </span>
                <span className="text-xs hidden md:flex text-theme-tertiary">
                  {guide.type === 'article'
                    ? `📄 ${t('help_type_article')}`
                    : `🎯 ${t('help_type_interactive')}`}
                </span>
              </div>
            </div>
          </div>
          <div className="flex-shrink-0 ml-4 hidden md:flex">
            <div className="flex flex-col items-center space-y-1">
              {isExpanded ? (
                <FiArrowRight className="w-5 h-5 text-brand-primary rotate-90 transition-transform duration-300" />
              ) : (
                <FiArrowRight className="w-5 h-5 text-brand-primary transition-transform duration-300" />
              )}
              <span className="text-xs text-theme-tertiary">
                {isExpanded ? t('help_guide_close') : t('help_guide_open')}
              </span>
            </div>
          </div>
        </div>
      </button>

      {isExpanded && (
        <div className="px-6 pb-6 border-t border-theme-secondary/20">
          <div className="pt-4">
            <div className="border-brand-primary/20 pl-4">
              <div className="prose prose-sm max-w-none text-theme-secondary classical-body">
                {guide.content.split('\n').map((line, index) => {
                  if (line.trim() === '') return <br key={index} />;

                  if (line.startsWith('# ')) {
                    return (
                      <h3
                        key={index}
                        className="text-lg font-bold text-theme-primary mt-4 mb-2 classical-title"
                      >
                        {line.substring(2)}
                      </h3>
                    );
                  }

                  if (line.startsWith('## ')) {
                    return (
                      <h4
                        key={index}
                        className="text-base font-semibold text-theme-primary mt-3 mb-2"
                      >
                        {line.substring(3)}
                      </h4>
                    );
                  }

                  if (line.startsWith('### ')) {
                    return (
                      <h5
                        key={index}
                        className="text-sm font-semibold text-theme-primary mt-2 mb-1"
                      >
                        {line.substring(4)}
                      </h5>
                    );
                  }

                  if (line.startsWith('- ')) {
                    return (
                      <li key={index} className="ml-4 mb-1 list-disc">
                        {renderInlineBold(line.substring(2))}
                      </li>
                    );
                  }

                  if (line.match(/^\d+\./)) {
                    return (
                      <div key={index} className="ml-4 mb-1 font-medium">
                        {renderInlineBold(line)}
                      </div>
                    );
                  }

                  // Linha inteira em negrito (título/destaque)
                  if (
                    line.startsWith('**') &&
                    line.endsWith('**') &&
                    line.length > 4
                  ) {
                    return (
                      <p
                        key={index}
                        className="font-semibold mb-2 text-theme-primary"
                      >
                        {line.substring(2, line.length - 2)}
                      </p>
                    );
                  }

                  // Linha com markdown inline
                  if (line.includes('**')) {
                    return renderMarkdownInline(line, index);
                  }

                  // Parágrafo normal
                  return (
                    <p key={index} className="mb-2 leading-relaxed">
                      {line}
                    </p>
                  );
                })}
              </div>

              {/* Botão para fechar */}
              <div className="mt-6 pt-4 border-t border-theme-secondary/10">
                <button
                  onClick={() => setIsExpanded(false)}
                  className="text-brand-primary hover:text-brand-primary/80 text-sm font-medium transition-colors"
                >
                  {t('help_guide_close_guide')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function HelpPage(): JSX.Element {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { t } = useTranslation({ sections: ['pages/help'] });

  const helpCategories: HelpCategory[] = [
    {
      id: 'getting-started',
      title: t('help_category_0_title'),
      description: t('help_category_0_description'),
      icon: FiPlay,
      color: 'from-green-500 to-blue-500',
      guides: [
        {
          id: 'create-account',
          title: t('help_guide_0_0_title'),
          description: t('help_guide_0_0_description'),
          type: 'article',
          duration: t('help_guide_0_0_duration'),
          difficulty: 'beginner',
          content: t('help_guide_0_0_content'),
        },
        {
          id: 'onboarding-guide',
          title: t('help_guide_0_1_title'),
          description: t('help_guide_0_1_description'),
          type: 'interactive',
          duration: t('help_guide_0_1_duration'),
          difficulty: 'beginner',
          content: t('help_guide_0_1_content'),
        },
        {
          id: 'first-navigation',
          title: t('help_guide_0_2_title'),
          description: t('help_guide_0_2_description'),
          type: 'article',
          duration: t('help_guide_0_2_duration'),
          difficulty: 'beginner',
          content: t('help_guide_0_2_content'),
        },
      ],
    },
    {
      id: 'search-explore',
      title: t('help_category_1_title'),
      description: t('help_category_1_description'),
      icon: FiSearch,
      color: 'from-blue-500 to-purple-500',
      guides: [
        {
          id: 'search-composers',
          title: t('help_guide_1_0_title'),
          description: t('help_guide_1_0_description'),
          type: 'article',
          duration: t('help_guide_1_0_duration'),
          difficulty: 'beginner',
          content: t('help_guide_1_0_content'),
        },
        {
          id: 'search-works',
          title: t('help_guide_1_1_title'),
          description: t('help_guide_1_1_description'),
          type: 'article',
          duration: t('help_guide_1_1_duration'),
          difficulty: 'intermediate',
          content: t('help_guide_1_1_content'),
        },
      ],
    },
    {
      id: 'student-mode',
      title: t('help_category_2_title'),
      description: t('help_category_2_description'),
      icon: FiUserCheck,
      color: 'from-purple-500 to-pink-500',
      guides: [
        {
          id: 'student-access',
          title: t('help_guide_2_0_title'),
          description: t('help_guide_2_0_description'),
          type: 'article',
          duration: t('help_guide_2_0_duration'),
          difficulty: 'beginner',
          content: t('help_guide_2_0_content'),
        },
        {
          id: 'student-tools',
          title: t('help_guide_2_1_title'),
          description: t('help_guide_2_1_description'),
          type: 'interactive',
          duration: t('help_guide_2_1_duration'),
          difficulty: 'intermediate',
          content: t('help_guide_2_1_content'),
        },
      ],
    },
    {
      id: 'uploads',
      title: t('help_category_3_title'),
      description: t('help_category_3_description'),
      icon: FiUpload,
      color: 'from-orange-500 to-red-500',
      guides: [
        {
          id: 'upload-composer',
          title: t('help_guide_3_0_title'),
          description: t('help_guide_3_0_description'),
          type: 'article',
          duration: t('help_guide_3_0_duration'),
          difficulty: 'intermediate',
          content: t('help_guide_3_0_content'),
        },
        {
          id: 'upload-work',
          title: t('help_guide_3_1_title'),
          description: t('help_guide_3_1_description'),
          type: 'article',
          duration: t('help_guide_3_1_duration'),
          difficulty: 'advanced',
          content: t('help_guide_3_1_content'),
        },
      ],
    },
    {
      id: 'favorites',
      title: t('help_category_4_title'),
      description: t('help_category_4_description'),
      icon: FiHeart,
      color: 'from-pink-500 to-red-500',
      guides: [
        {
          id: 'favorite-composers',
          title: t('help_guide_4_0_title'),
          description: t('help_guide_4_0_description'),
          type: 'article',
          duration: t('help_guide_4_0_duration'),
          difficulty: 'beginner',
          content: t('help_guide_4_0_content'),
        },
        {
          id: 'favorite-works',
          title: t('help_guide_4_1_title'),
          description: t('help_guide_4_1_description'),
          type: 'article',
          duration: t('help_guide_4_1_duration'),
          difficulty: 'beginner',
          content: t('help_guide_4_1_content'),
        },
      ],
    },
    {
      id: 'learning-system',
      title: t('help_category_5_title'),
      description: t('help_category_5_description'),
      icon: FiTarget,
      color: 'from-green-500 to-teal-500',
      guides: [
        {
          id: 'want-to-learn',
          title: t('help_guide_5_0_title'),
          description: t('help_guide_5_0_description'),
          type: 'article',
          duration: t('help_guide_5_0_duration'),
          difficulty: 'beginner',
          content: t('help_guide_5_0_content'),
        },
        {
          id: 'learned-system',
          title: t('help_guide_5_1_title'),
          description: t('help_guide_5_1_description'),
          type: 'article',
          duration: t('help_guide_5_1_duration'),
          difficulty: 'intermediate',
          content: t('help_guide_5_1_content'),
        },
      ],
    },
    {
      id: 'annotations',
      title: t('help_category_6_title'),
      description: t('help_category_6_description'),
      icon: FiBookOpen,
      color: 'from-indigo-500 to-purple-500',
      guides: [
        {
          id: 'annotation-basics',
          title: t('help_guide_6_0_title'),
          description: t('help_guide_6_0_description'),
          type: 'article',
          duration: t('help_guide_6_0_duration'),
          difficulty: 'beginner',
          content: t('help_guide_6_0_content'),
        },
        {
          id: 'annotation-advanced',
          title: t('help_guide_6_1_title'),
          description: t('help_guide_6_1_description'),
          type: 'article',
          duration: t('help_guide_6_1_duration'),
          difficulty: 'advanced',
          content: t('help_guide_6_1_content'),
        },
      ],
    },
    {
      id: 'newsletter',
      title: t('help_category_7_title'),
      description: t('help_category_7_description'),
      icon: FiMail,
      color: 'from-teal-500 to-green-500',
      guides: [
        {
          id: 'newsletter-subscription',
          title: t('help_guide_7_0_title'),
          description: t('help_guide_7_0_description'),
          type: 'article',
          duration: t('help_guide_7_0_duration'),
          difficulty: 'beginner',
          content: t('help_guide_7_0_content'),
        },
      ],
    },
    {
      id: 'moderation',
      title: t('help_category_8_title'),
      description: t('help_category_8_description'),
      icon: FiFlag,
      color: 'from-red-500 to-pink-500',
      guides: [
        {
          id: 'report-content',
          title: t('help_guide_8_0_title'),
          description: t('help_guide_8_0_description'),
          type: 'article',
          duration: t('help_guide_8_0_duration'),
          difficulty: 'beginner',
          content: t('help_guide_8_0_content'),
        },
        {
          id: 'verification-system',
          title: t('help_guide_8_1_title'),
          description: t('help_guide_8_1_description'),
          type: 'article',
          duration: t('help_guide_8_1_duration'),
          difficulty: 'intermediate',
          content: t('help_guide_8_1_content'),
        },
      ],
    },
  ];

  const renderStep = (): JSX.Element => {
    if (!selectedCategory) {
      return (
        <section className="py-8">
          <AnimatedContainer delay={0.1} staggerSpeed="fast">
            <div>
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl lg:text-4xl font-bold classical-title text-theme-primary mb-4">
                    {t('help_jsx_h2_children_0__categorias_ajuda')}
                  </h2>
                  <p className="text-xl text-theme-secondary max-w-3xl mx-auto">
                    {t('help_jsx_p_children_0__escolha_categoria_que')}
                  </p>
                </div>

                <SequentialGrid cols={3} gap={8} delayBetweenItems={0.1}>
                  {helpCategories.map((category) => (
                    <div
                      key={category.id}
                      className={`classical-card p-6 group flex flex-col items-center justify-center cursor-pointer transition-all ${
                        selectedCategory === category.id
                          ? 'ring-2 ring-brand-primary'
                          : ''
                      }`}
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      <div
                        className={`w-16 h-16 bg-gradient-to-br rounded-2xl flex items-center justify-center mb-6`}
                      >
                        <category.icon className="w-8 h-8 text-theme-primary" />
                      </div>

                      <h3 className="text-xl font-semibold classical-title text-theme-primary mb-3">
                        {category.title}
                      </h3>

                      <p className="text-theme-secondary text-center classical-body mb-4">
                        {category.description}
                      </p>

                      <div className="text-brand-primary font-medium flex items-center">
                        <span>
                          {category.guides.length}{' '}
                          {t('help_jsx_span_children_0__guias')}
                        </span>
                        <FiArrowRight className="w-4 h-4 ml-2" />
                      </div>
                    </div>
                  ))}
                </SequentialGrid>
              </div>
            </div>
          </AnimatedContainer>
        </section>
      );
    }

    const category = helpCategories.find((cat) => cat.id === selectedCategory);
    if (!category) return <div></div>;

    return (
      <section className="py-8">
        <AnimatedContainer delay={0.1} staggerSpeed="fast">
          <div>
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="inline-flex items-center text-brand-primary hover:text-brand-primary/80 mb-4 transition-colors"
                >
                  <FiArrowRight className="w-4 h-4 mr-2 rotate-180" />
                  {t('help_jsx_button_children_0__voltar')}
                </button>
                <h3 className="text-2xl font-bold classical-title text-theme-primary mb-2">
                  {category.title}
                </h3>
                <p className="text-theme-secondary">{category.description}</p>
              </div>

              <div className="space-y-4">
                {category.guides.map((guide, index) => (
                  <AnimatedItem
                    key={guide.id}
                    direction="up"
                    springType="gentle"
                    delay={index * 0.1}
                  >
                    <GuideCard guide={guide} t={t} />
                  </AnimatedItem>
                ))}
              </div>
            </div>
          </div>
        </AnimatedContainer>
      </section>
    );
  };

  return (
    <PageContainer showBackground={true} className="classical-theme">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 via-accent-purple/5 to-accent-blue/5"></div>
        <AnimatedContainer delay={0.1} staggerSpeed="normal">
          <div className="relative">
            <div className="text-center max-w-4xl mx-auto">
              <AnimatedItem direction="scale" springType="bouncy">
                <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-brand-primary/20 to-brand-secondary/20 border border-brand-primary/30 rounded-full mb-8">
                  <FiHelpCircle className="w-5 h-5 text-brand-primary mr-2" />
                  <span className="text-brand-primary font-medium">
                    {t('help_jsx_span_children_0__tutoriais_guias')}
                  </span>
                </div>
              </AnimatedItem>

              <AnimatedItem direction="up" springType="gentle">
                <h1 className="text-4xl lg:text-6xl font-bold classical-title text-theme-primary mb-6">
                  {t('help_jsx_h1_children_0__central')}
                  <span className="text-gradient-brand block lg:inline lg:ml-4">
                    {t('help_jsx_span_children_0__ajuda')}
                  </span>
                </h1>
              </AnimatedItem>

              <AnimatedItem direction="up" springType="gentle">
                <p className="text-xl lg:text-2xl text-theme-secondary leading-relaxed classical-body">
                  {t('help_jsx_p_children_0__pratica')}
                </p>
              </AnimatedItem>
            </div>
          </div>
          <AnimatedMusicalNotes />
        </AnimatedContainer>
      </section>

      {/* Quick Access */}
      <section className="">
        <AnimatedContainer delay={0.1} staggerSpeed="normal">
          <div className="">
            <div className="max-w-4xl mx-auto">
              <AnimatedCard hover="lift" className="classical-card p-8 mb-12">
                <div className="text-center">
                  <h2 className="text-2xl font-bold classical-title text-theme-primary mb-6">
                    {t('help_jsx_h2_children_0__acesso_rápido')}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Link
                      href="/faq"
                      className="flex items-center justify-center space-x-3 p-4 bg-gradient-to-r from-accent-blue/10 to-accent-purple/10 border border-accent-blue/20 rounded-lg hover:border-accent-blue/40 transition-all"
                    >
                      <FiHelpCircle className="w-5 h-5 text-accent-blue" />
                      <span className="text-theme-primary font-medium">
                        {t('help_jsx_link_children_0__perguntas_frequentes')}
                      </span>
                    </Link>

                    <Link
                      href="/contact"
                      className="flex items-center justify-center space-x-3 p-4 bg-gradient-to-r from-accent-green/10 to-accent-blue/10 border border-accent-green/20 rounded-lg hover:border-accent-green/40 transition-all"
                    >
                      <FiMessageCircle className="w-5 h-5 text-accent-green" />
                      <span className="text-theme-primary font-medium">
                        {t('help_jsx_link_children_0__fale_conosco')}
                      </span>
                    </Link>

                    <Link
                      href="/support"
                      className="flex items-center justify-center space-x-3 p-4 bg-gradient-to-r from-accent-red/10 to-accent-amber/10 border border-accent-red/20 rounded-lg hover:border-accent-red/40 transition-all"
                    >
                      <FiUser className="w-5 h-5 text-accent-red" />
                      <span className="text-theme-primary font-medium">
                        {t('help_jsx_link_children_0__suporte_técnico')}
                      </span>
                    </Link>
                  </div>
                </div>
              </AnimatedCard>
            </div>
          </div>
        </AnimatedContainer>
      </section>

      {/* Main Content */}
      {renderStep()}

      {/* Contact Section */}
      <section className="py-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-primary/10 via-accent-purple/5 to-accent-blue/10"></div>

        <AnimatedContainer delay={0.1} staggerSpeed="normal">
          <div className="relative">
            <AnimatedCard
              hover="lift"
              className="classical-card p-12 text-center max-w-4xl mx-auto"
            >
              <div className="w-20 h-20 bg-brand-gradient rounded-3xl flex items-center justify-center mx-auto mb-8">
                <FiMessageCircle className="w-10 h-10 text-theme-primary" />
              </div>

              <h2 className="text-3xl lg:text-4xl font-bold classical-title text-theme-primary mb-6">
                {t('help_jsx_h2_children_0__ainda_precisa_ajuda')}
              </h2>

              <p className="text-xl text-theme-secondary mb-12 classical-body">
                {t('help_jsx_p_children_0__nossa_equipe_suporte')}
              </p>

              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Link
                  href="/contact"
                  className="btn-classical-primary flex items-center justify-center space-x-3 px-10 py-4 text-lg"
                >
                  <FiMessageCircle className="w-5 h-5" />
                  <span>{t('help_jsx_link_children_0__fale_conosco_1')}</span>
                </Link>

                <Link
                  href="/support"
                  className="btn-classical-secondary flex items-center justify-center space-x-3 px-10 py-4 text-lg"
                >
                  <FiUser className="w-5 h-5" />
                  <span>
                    {t('help_jsx_link_children_0__suporte_técnico_1')}
                  </span>
                </Link>
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
