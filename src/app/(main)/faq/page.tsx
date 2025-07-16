'use client';

import React, { useState } from 'react';
import {
  FiHelpCircle,
  FiBookOpen,
  FiHeart,
  FiUpload,
  FiMusic,
  FiUser,
  FiPlay,
  FiChevronDown,
  FiChevronUp,
  FiSearch,
  FiMessageCircle,
  FiMail,
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

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
}

const faqData: FAQItem[] = [
  {
    id: '1',
    category: 'Geral',
    icon: FiHelpCircle,
    question: 'O que é o Classical Hub?',
    answer:
      'O Classical Hub é uma plataforma completa para o estudo e apreciação da música clássica. Combinamos uma enciclopédia detalhada de compositores e obras com ferramentas práticas de estudo, sistema de favoritos, anotações e muito mais. Nossa base de dados inclui informações do IMSLP e permite uploads da comunidade.',
  },
  {
    id: '2',
    category: 'Geral',
    icon: FiUser,
    question: 'Preciso criar conta para usar a plataforma?',
    answer:
      'Você pode explorar nossa enciclopédia e visualizar informações básicas sem conta. Porém, para acessar recursos como favoritos, anotações, modo estudo, lista de "quero aprender" e uploads, é necessário criar uma conta gratuita.',
  },
  {
    id: '3',
    category: 'Favoritos',
    icon: FiHeart,
    question: 'Como funciona o sistema de favoritos?',
    answer:
      'Você pode favoritar compositores, obras e partituras específicas. Seus favoritos ficam salvos em seu perfil e podem ser organizados em listas personalizadas. Também oferecemos recomendações baseadas em seus favoritos.',
  },
  {
    id: '4',
    category: 'Partituras',
    icon: FiMusic,
    question: 'De onde vêm as partituras da plataforma?',
    answer:
      'Nossas partituras vêm principalmente do IMSLP (International Music Score Library Project), garantindo que sejam de domínio público. Também permitimos uploads da comunidade, que passam por moderação para garantir qualidade e legalidade.',
  },
  {
    id: '5',
    category: 'Estudo',
    icon: FiPlay,
    question: 'Como funciona o modo estudo?',
    answer:
      'O modo estudo oferece cronômetro, metrônomo, anotações na partitura, marcadores e sistema de progresso. Você pode definir metas, registrar sessões de prática e acompanhar seu desenvolvimento ao longo do tempo.',
  },
  {
    id: '6',
    category: 'Anotações',
    icon: FiBookOpen,
    question: 'Posso fazer anotações nas partituras?',
    answer:
      'Sim! Oferecemos um sistema completo de anotações que inclui marcações de texto, destaques, desenhos, dedilhados, dinâmicas e marcações de tempo. Suas anotações podem ser privadas ou compartilhadas com a comunidade.',
  },
  {
    id: '7',
    category: 'Upload',
    icon: FiUpload,
    question: 'Como posso contribuir com uploads?',
    answer:
      'Usuários verificados podem fazer upload de compositores, obras e partituras. Todos os uploads passam por moderação para garantir qualidade e precisão. Temos um sistema de pontuação que recompensa contribuições de qualidade.',
  },
  {
    id: '8',
    category: 'Geral',
    icon: FiSearch,
    question: 'Como encontrar uma obra específica?',
    answer:
      'Use nossa busca avançada por título, compositor, opus, instrumento ou período histórico. Também oferecemos filtros por dificuldade e categorias para facilitar a descoberta de novas obras.',
  },
  {
    id: '9',
    category: 'Estudo',
    icon: FiBookOpen,
    question: 'O que são as listas "Quero Aprender" e "Já Aprendi"?',
    answer:
      'São ferramentas para organizar seu aprendizado. "Quero Aprender" funciona como uma lista de desejos musicais, enquanto "Já Aprendi" registra seu progresso e conquistas, permitindo avaliar seu desenvolvimento.',
  },
  {
    id: '10',
    category: 'Moderação',
    icon: FiUser,
    question: 'Como reportar conteúdo inadequado?',
    answer:
      'Cada compositor, obra e partitura tem um botão de report. Nossa equipe de moderação analisa todos os reports em até 48 horas. Valorizamos muito a qualidade e precisão das informações na plataforma.',
  },
];

const categories = [
  'Todos',
  'Geral',
  'Favoritos',
  'Partituras',
  'Estudo',
  'Anotações',
  'Upload',
  'Moderação',
];

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const filteredFAQs = faqData.filter((item) => {
    const matchesCategory =
      activeCategory === 'Todos' || item.category === activeCategory;
    const matchesSearch =
      item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleExpanded = (id: string) => {
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
                    Central de Ajuda
                  </span>
                </div>
              </AnimatedItem>

              <AnimatedItem direction="up" springType="gentle">
                <h1 className="text-4xl lg:text-6xl font-bold classical-title text-theme-primary mb-6">
                  Perguntas
                  <span className="text-gradient-brand block lg:inline lg:ml-4">
                    Frequentes
                  </span>
                </h1>
              </AnimatedItem>

              <AnimatedItem direction="up" springType="gentle">
                <p className="text-xl lg:text-2xl text-theme-secondary leading-relaxed classical-body">
                  Encontre respostas rápidas para as dúvidas mais comuns sobre o
                  Classical Hub e suas funcionalidades.
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
                  <input
                    type="text"
                    placeholder="Buscar perguntas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input-classical w-full"
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
          <div className="section-wrap">
            <div className="max-w-4xl mx-auto space-y-4">
              {filteredFAQs.length === 0 ? (
                <AnimatedCard
                  hover="lift"
                  className="classical-card p-8 text-center"
                >
                  <FiSearch className="w-12 h-12 text-theme-tertiary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-theme-primary mb-2">
                    Nenhuma pergunta encontrada
                  </h3>
                  <p className="text-theme-secondary">
                    Tente ajustar sua busca ou categoria selecionada.
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
                Não encontrou sua resposta?
              </h2>

              <p className="text-xl text-theme-secondary mb-12 classical-body">
                Nossa equipe está sempre pronta para ajudar você a aproveitar ao
                máximo o Classical Hub.
              </p>

              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Link
                  href="/contact"
                  className="btn-classical-primary flex items-center justify-center space-x-3 px-10 py-4 text-lg"
                >
                  <FiMail className="w-5 h-5" />
                  <span>Entre em Contato</span>
                </Link>

                <Link
                  href="/help"
                  className="btn-classical-secondary flex items-center justify-center space-x-3 px-10 py-4 text-lg"
                >
                  <FiBookOpen className="w-5 h-5" />
                  <span>Central de Ajuda</span>
                </Link>
              </div>

              <div className="flex items-center justify-center space-x-8 mt-12 pt-8 border-t border-theme-secondary">
                <div className="flex items-center space-x-2 text-theme-tertiary">
                  <FiHelpCircle className="w-4 h-4" />
                  <span className="text-sm">Resposta em até 24h</span>
                </div>
                <div className="flex items-center space-x-2 text-theme-tertiary">
                  <FiUser className="w-4 h-4" />
                  <span className="text-sm">Suporte especializado</span>
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
