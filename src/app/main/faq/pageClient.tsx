'use client';

import React, { JSX, useState, useEffect } from 'react';
import {
  FiHelpCircle,
  FiBookOpen,
  FiHeart,
  FiUpload,
  FiMusic,
  FiUser,
  FiChevronDown,
  FiChevronUp,
  FiSearch,
  FiMessageCircle,
  FiMail,
  FiTarget,
  FiUserCheck,
  FiFlag,
  FiGlobe,
  FiPlay,
  FiSettings,
  FiLayers,
} from 'react-icons/fi';
import { GiMusicalNotes, GiGrandPiano, GiScrollQuill } from 'react-icons/gi';
import AnimatedMusicalNotes from '../../components/AnimatedMusicalNotes';
import Link from 'next/link';
import {
  PageContainer,
  AnimatedContainer,
  AnimatedItem,
  AnimatedCard,
  FloatingElement,
} from '../../components/animation/AnimatedComponents';
import Input from '@/app/components/Common/Inputs';
import { useTranslation } from '@/app/hooks/useTranslation';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
}

export default function FAQPage(): JSX.Element {
  const { t } = useTranslation({ sections: ['pages/faq'] });

  const [activeCategory, setActiveCategory] = useState<string>(
    t('faq_category_todos')
  );
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Update active category when language changes
  useEffect(() => {
    setActiveCategory(t('faq_category_todos'));
  }, [t]);

  const faqData: FAQItem[] = [
    // GERAL
    {
      id: '1',
      category: t('faq_category_geral'),
      icon: FiHelpCircle,
      question: t('faq_item_0_question'),
      answer: t('faq_item_0_answer'),
    },
    {
      id: '2',
      category: t('faq_category_geral'),
      icon: FiUser,
      question: t('faq_item_1_question'),
      answer: t('faq_item_1_answer'),
    },
    {
      id: '3',
      category: t('faq_category_geral'),
      icon: FiSearch,
      question: t('faq_item_2_question'),
      answer: t('faq_item_2_answer'),
    },
    {
      id: '4',
      category: t('faq_category_geral'),
      icon: FiGlobe,
      question: t('faq_item_3_question'),
      answer: t('faq_item_3_answer'),
    },
    {
      id: '5',
      category: t('faq_category_geral'),
      icon: FiPlay,
      question: t('faq_item_4_question'),
      answer: t('faq_item_4_answer'),
    },

    // FAVORITOS
    {
      id: '6',
      category: t('faq_category_favoritos'),
      icon: FiHeart,
      question: t('faq_item_5_question'),
      answer: t('faq_item_5_answer'),
    },
    {
      id: '7',
      category: t('faq_category_favoritos'),
      icon: FiMusic,
      question: t('faq_item_6_question'),
      answer: t('faq_item_6_answer'),
    },

    // PARTITURAS
    {
      id: '9',
      category: t('faq_category_partituras'),
      icon: FiMusic,
      question: t('faq_item_7_question'),
      answer: t('faq_item_7_answer'),
    },
    {
      id: '10',
      category: t('faq_category_partituras'),
      icon: FiUpload,
      question: t('faq_item_8_question'),
      answer: t('faq_item_8_answer'),
    },
    {
      id: '11',
      category: t('faq_category_partituras'),
      icon: FiBookOpen,
      question: t('faq_item_9_question'),
      answer: t('faq_item_9_answer'),
    },

    // APRENDIZADO
    {
      id: '12',
      category: t('faq_category_aprendizado'),
      icon: FiTarget,
      question: t('faq_item_10_question'),
      answer: t('faq_item_10_answer'),
    },
    {
      id: '13',
      category: t('faq_category_aprendizado'),
      icon: FiPlay,
      question: t('faq_item_11_question'),
      answer: t('faq_item_11_answer'),
    },
    {
      id: '14',
      category: t('faq_category_aprendizado'),
      icon: FiUserCheck,
      question: t('faq_item_12_question'),
      answer: t('faq_item_12_answer'),
    },

    // ANOTAÇÕES
    {
      id: '15',
      category: t('faq_category_anotacoes'),
      icon: FiBookOpen,
      question: t('faq_item_13_question'),
      answer: t('faq_item_13_answer'),
    },
    {
      id: '16',
      category: t('faq_category_anotacoes'),
      icon: FiLayers,
      question: t('faq_item_14_question'),
      answer: t('faq_item_14_answer'),
    },
    {
      id: '17',
      category: t('faq_category_anotacoes'),
      icon: FiHeart,
      question: t('faq_item_15_question'),
      answer: t('faq_item_15_answer'),
    },

    // UPLOADS
    {
      id: '18',
      category: t('faq_category_upload'),
      icon: FiUpload,
      question: t('faq_item_16_question'),
      answer: t('faq_item_16_answer'),
    },
    {
      id: '19',
      category: t('faq_category_upload'),
      icon: FiGlobe,
      question: t('faq_item_17_question'),
      answer: t('faq_item_17_answer'),
    },
    {
      id: '20',
      category: t('faq_category_upload'),
      icon: FiSettings,
      question: t('faq_item_18_question'),
      answer: t('faq_item_18_answer'),
    },

    // MODERAÇÃO
    {
      id: '21',
      category: t('faq_category_moderacao'),
      icon: FiFlag,
      question: t('faq_item_19_question'),
      answer: t('faq_item_19_answer'),
    },
    {
      id: '22',
      category: t('faq_category_moderacao'),
      icon: FiSettings,
      question: t('faq_item_20_question'),
      answer: t('faq_item_20_answer'),
    },

    // NEWSLETTER
    {
      id: '24',
      category: t('faq_category_newsletter'),
      icon: FiMail,
      question: t('faq_item_21_question'),
      answer: t('faq_item_21_answer'),
    },
    {
      id: '25',
      category: t('faq_category_newsletter'),
      icon: FiSettings,
      question: t('faq_item_22_question'),
      answer: t('faq_item_22_answer'),
    },

    // CONTA
    {
      id: '26',
      category: t('faq_category_conta'),
      icon: FiUser,
      question: t('faq_item_23_question'),
      answer: t('faq_item_23_answer'),
    },
    {
      id: '27',
      category: t('faq_category_conta'),
      icon: FiSettings,
      question: t('faq_item_24_question'),
      answer: t('faq_item_24_answer'),
    },
  ];

  const categories: string[] = [
    t('faq_category_todos'),
    t('faq_category_geral'),
    t('faq_category_favoritos'),
    t('faq_category_partituras'),
    t('faq_category_aprendizado'),
    t('faq_category_anotacoes'),
    t('faq_category_upload'),
    t('faq_category_moderacao'),
    t('faq_category_newsletter'),
    t('faq_category_conta'),
  ];

  const filteredFAQs = faqData.filter((item) => {
    const allCategory = t('faq_category_todos');
    const matchesCategory =
      activeCategory === allCategory || item.category === activeCategory;
    const matchesSearch =
      item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleExpanded = (id: string): void => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

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
                    {t('faq_jsx_span_children_0__central_ajuda')}
                  </span>
                </div>
              </AnimatedItem>

              <AnimatedItem direction="up" springType="gentle">
                <h1 className="text-4xl lg:text-6xl font-bold classical-title text-theme-primary mb-6">
                  {t('faq_jsx_h1_children_0__perguntas')}
                  <span className="text-gradient-brand block lg:inline lg:ml-4">
                    {t('faq_jsx_span_children_0__frequentes')}
                  </span>
                </h1>
              </AnimatedItem>

              <AnimatedItem direction="up" springType="gentle">
                <p className="text-xl lg:text-2xl text-theme-secondary leading-relaxed classical-body">
                  {t('faq_jsx_p_children_0__encontre_respostas_rápidas')}
                </p>
              </AnimatedItem>
            </div>
          </div>
          <AnimatedMusicalNotes />
        </AnimatedContainer>
      </section>

      {/* Search and Filters */}
      <section className="">
        <AnimatedContainer delay={0.1} staggerSpeed="normal">
          <div className="section-wrap">
            <div className="max-w-4xl mx-auto">
              {/* Search Bar */}
              <AnimatedCard hover="lift" className="classical-card p-6 mb-8">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-theme-tertiary w-5 h-5" />
                  <Input
                    type="text"
                    placeholder={t('faq_jsx_input_placeholder_buscar')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input-classical w-full pl-12"
                  />
                </div>
              </AnimatedCard>

              {/* Category Filters */}
              <div className="flex flex-wrap gap-3 justify-center mb-8">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                      activeCategory === category
                        ? 'bg-brand-gradient text-theme-primary'
                        : 'bg-theme-elevated text-theme-secondary hover:text-brand-primary hover:bg-interactive-hover'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </AnimatedContainer>
      </section>

      {/* FAQ Items */}
      <section className="">
        <AnimatedContainer delay={0.1} staggerSpeed="fast">
          <div className="">
            <div className="max-w-4xl mx-auto space-y-4">
              {filteredFAQs.length === 0 ? (
                <AnimatedCard
                  hover="lift"
                  className="classical-card p-8 text-center"
                >
                  <FiSearch className="w-12 h-12 text-theme-tertiary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-theme-primary mb-2">
                    {t('faq_jsx_h3_children_0__nenhuma_pergunta_encontrada')}
                  </h3>
                  <p className="text-theme-secondary">
                    {t('faq_jsx_p_children_0__tente_ajustar_sua')}
                  </p>
                </AnimatedCard>
              ) : (
                filteredFAQs.map((item) => (
                  <AnimatedItem
                    key={item.id}
                    direction="up"
                    springType="gentle"
                  >
                    <div className="classical-card overflow-hidden">
                      <button
                        onClick={() => toggleExpanded(item.id)}
                        className="w-full p-6 text-left focus:outline-none"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-accent-blue to-accent-purple rounded-xl flex items-center justify-center flex-shrink-0">
                              <item.icon className="w-6 h-6 text-theme-primary" />
                            </div>
                            <div className="flex-grow">
                              <div className="text-sm text-brand-primary font-medium mb-1">
                                {item.category}
                              </div>
                              <h3 className="text-lg font-semibold text-theme-primary">
                                {item.question}
                              </h3>
                            </div>
                          </div>
                          <div className="flex-shrink-0 ml-4">
                            {expandedItems.has(item.id) ? (
                              <FiChevronUp className="w-5 h-5 text-theme-secondary" />
                            ) : (
                              <FiChevronDown className="w-5 h-5 text-theme-secondary" />
                            )}
                          </div>
                        </div>
                      </button>

                      {expandedItems.has(item.id) && (
                        <div className="px-6 pb-6">
                          <div className="pl-16">
                            <div className="border-l-2 border-brand-primary/20 pl-4">
                              <p className="text-theme-secondary leading-relaxed">
                                {item.answer}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </AnimatedItem>
                ))
              )}
            </div>
          </div>
        </AnimatedContainer>
      </section>

      {/* Contact Section */}
      <section className=" relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-primary/10 via-accent-purple/5 to-accent-blue/10"></div>

        <AnimatedContainer delay={0.1} staggerSpeed="normal">
          <div className="relative section-wrap">
            <AnimatedCard
              hover="lift"
              className="classical-card p-12 text-center max-w-4xl mx-auto"
            >
              <div className="w-20 h-20 bg-brand-gradient rounded-3xl flex items-center justify-center mx-auto mb-8">
                <FiMessageCircle className="w-10 h-10 text-theme-primary" />
              </div>

              <h2 className="text-3xl lg:text-4xl font-bold classical-title text-theme-primary mb-6">
                {t('faq_jsx_h2_children_0__nao_encontrou_resposta')}
              </h2>

              <p className="text-xl text-theme-secondary mb-12 classical-body">
                {t('faq_jsx_p_children_0__nossa_equipe_sempre')}
              </p>

              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Link
                  href="/contact"
                  className="btn-classical-primary flex items-center justify-center space-x-3 px-10 py-4 text-lg"
                >
                  <FiMail className="w-5 h-5" />
                  <span>{t('faq_jsx_link_children_0__entre_contato')}</span>
                </Link>

                <Link
                  href="/help"
                  className="btn-classical-secondary flex items-center justify-center space-x-3 px-10 py-4 text-lg"
                >
                  <FiBookOpen className="w-5 h-5" />
                  <span>{t('faq_jsx_link_children_0__central_ajuda')}</span>
                </Link>
              </div>

              <div className="flex items-center justify-center space-x-8 mt-12 pt-8 border-t border-theme-secondary">
                <div className="flex items-center space-x-2 text-theme-tertiary">
                  <FiHelpCircle className="w-4 h-4" />
                  <span className="text-sm">
                    {t('faq_jsx_span_children_0__resposta_24h')}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-theme-tertiary">
                  <FiUser className="w-4 h-4" />
                  <span className="text-sm">
                    {t('faq_jsx_span_children_0__suporte_especializado')}
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
        <FiHelpCircle />
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
