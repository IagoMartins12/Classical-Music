'use client';

import React, { JSX, useState } from 'react';
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

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
}

const faqData: FAQItem[] = [
  // GERAL
  {
    id: '1',
    category: 'Geral',
    icon: FiHelpCircle,
    question: 'O que é o Opus Atlas?',
    answer:
      'O Opus Atlas é uma plataforma completa para o estudo e apreciação da música clássica. Combinamos uma enciclopédia detalhada de compositores e obras com ferramentas práticas de organização, sistema de favoritos, anotações colaborativas e muito mais. Nossa base de dados integra informações do IMSLP e permite contribuições da comunidade através de uploads moderados.',
  },
  {
    id: '2',
    category: 'Geral',
    icon: FiUser,
    question: 'Preciso criar conta para usar a plataforma?',
    answer:
      'Você pode explorar nossa enciclopédia e visualizar informações básicas sem conta. Porém, para acessar recursos como favoritos, anotações, listas "quero aprender/já aprendi", modo aluno e uploads, é necessário criar uma conta gratuita. O cadastro pode ser feito com email ou através do Google.',
  },
  {
    id: '3',
    category: 'Geral',
    icon: FiSearch,
    question: 'Como encontrar uma obra específica?',
    answer:
      'Use nossa busca avançada que permite filtrar por: título da obra, compositor, instrumento (piano, violino, orquestra, etc.), período musical (barroco, clássico, romântico), gênero musical (sonata, concerto, sinfonia) e nível de dificuldade. Você também pode combinar múltiplos filtros para resultados mais precisos.',
  },
  {
    id: '4',
    category: 'Geral',
    icon: FiGlobe,
    question: 'Como funciona a busca de compositores?',
    answer:
      'A busca de compositores permite filtrar por nome (completo ou parcial) e período musical. Digite o nome do compositor ou use filtros por época como Barroco, Clássico, Romântico, Impressionista, etc. A busca inclui nomes alternativos e transliterações, facilitando encontrar compositores independente da grafia utilizada.',
  },
  {
    id: '5',
    category: 'Geral',
    icon: FiPlay,
    question: 'Posso ouvir as obras na plataforma?',
    answer:
      'Sim! Muitas obras incluem players integrados com Spotify e YouTube. Algumas também possuem áudios customizados de fontes alternativas. Além disso, professores podem adicionar vídeo-aulas específicas para suas turmas. O sistema de mídia é continuamente expandido para oferecer mais opções de escuta.',
  },

  // FAVORITOS
  {
    id: '6',
    category: 'Favoritos',
    icon: FiHeart,
    question: 'Como funciona o sistema de favoritos?',
    answer:
      'Você pode favoritar compositores, obras e partituras específicas. Cada tipo de favorito tem suas particularidades: compositores geram recomendações personalizadas, obras podem ser organizadas por instrumentos e dificuldade, e partituras específicas permitem escolher a melhor edição para seu estudo. Todos os favoritos ficam organizados em seu perfil.',
  },
  {
    id: '7',
    category: 'Favoritos',
    icon: FiMusic,
    question: 'Posso favoritar partituras específicas de uma obra?',
    answer:
      'Sim! Para cada obra, você pode escolher partituras específicas para favoritar. Isso é útil porque uma mesma obra pode ter múltiplas versões: partitura completa, partes separadas, diferentes editores ou arranjos. Você pode comparar versões, ler comentários da comunidade e favoritar aquela que melhor atende suas necessidades.',
  },
  {
    id: '8',
    category: 'Favoritos',
    icon: FiLayers,
    question: 'Como organizar meus favoritos?',
    answer:
      'Seus favoritos são automaticamente organizados por tipo (compositores, obras, partituras) e podem ser filtrados por instrumento, época musical, dificuldade e outras características. Você também pode adicionar notas pessoais e usar o sistema de tags para criação de categorias personalizadas como "para recital", "estudando agora", etc.',
  },

  // PARTITURAS
  {
    id: '9',
    category: 'Partituras',
    icon: FiMusic,
    question: 'De onde vêm as partituras da plataforma?',
    answer:
      'Nossas partituras vêm principalmente do IMSLP (International Music Score Library Project), garantindo que sejam de domínio público. Também permitimos uploads da comunidade, que passam por rigorosa moderação para garantir qualidade e legalidade. Todas as partituras respeitam direitos autorais e são verificadas quanto à sua legitimidade.',
  },
  {
    id: '10',
    category: 'Partituras',
    icon: FiUpload,
    question: 'Posso fazer download das partituras?',
    answer:
      'Sim! Todas as partituras disponíveis na plataforma podem ser baixadas gratuitamente em formato PDF. Como são de domínio público, você pode usar para estudo pessoal, ensino ou performance. Recomendamos sempre verificar a qualidade da digitalização antes do download através do preview disponível.',
  },
  {
    id: '11',
    category: 'Partituras',
    icon: FiBookOpen,
    question: 'Como escolher entre diferentes versões de uma partitura?',
    answer:
      'Para cada obra, mostramos informações detalhadas de cada partitura: editor, ano de publicação, qualidade da digitalização, número de páginas e avaliações da comunidade. Você pode visualizar previews, ler comentários de outros usuários e comparar diferentes edições para escolher a mais adequada ao seu nível e objetivo.',
  },

  // APRENDIZADO
  {
    id: '12',
    category: 'Aprendizado',
    icon: FiTarget,
    question: 'O que são as listas "Quero Aprender" e "Já Aprendi"?',
    answer:
      'São ferramentas para organizar seu progresso musical. "Quero Aprender" funciona como uma lista de metas musicais onde você pode definir prioridades, adicionar notas sobre motivação e escolher partituras específicas para estudar. "Já Aprendi" registra suas conquistas, permitindo avaliar seu desenvolvimento e manter histórico do repertório dominado.',
  },
  {
    id: '13',
    category: 'Aprendizado',
    icon: FiPlay,
    question: 'Como acompanhar meu progresso de estudo?',
    answer:
      'O sistema permite registrar quando você inicia o estudo de uma obra, acompanhar o progresso, definir seu nível de domínio (1-10), documentar dificuldades encontradas e registrar quando considera a obra aprendida. Você também pode adicionar notas sobre técnicas usadas, tempo dedicado e performances realizadas.',
  },
  {
    id: '14',
    category: 'Aprendizado',
    icon: FiUserCheck,
    question: 'Como funciona o modo aluno com professor?',
    answer:
      'Professores qualificados podem solicitar acesso à moderação e, se aprovados, recebem ferramentas para convidar alunos. Alunos que aceitam o convite ganham acesso a calendário de aulas, sistema de tarefas, comunicação direta com o professor e relatórios de progresso. É uma plataforma completa para ensino musical personalizado.',
  },

  // ANOTAÇÕES
  {
    id: '15',
    category: 'Anotações',
    icon: FiBookOpen,
    question: 'Como funciona o sistema de anotações?',
    answer:
      'As anotações no Opus Atlas são comentários sobre obras musicais, não marcações diretas no PDF. Você pode criar anotações sobre interpretação, técnica, teoria musical, dicas de estudo ou contexto histórico. Elas podem ser privadas ou públicas, sendo categorizadas por tipo, dificuldade e localização na obra (compassos específicos, movimento, seção).',
  },
  {
    id: '16',
    category: 'Anotações',
    icon: FiLayers,
    question: 'Posso fazer anotações em partituras específicas?',
    answer:
      'As anotações são feitas na obra musical, não diretamente no PDF da partitura. Você pode especificar a localização (compassos, movimento, seção) e a anotação fica associada à obra. Isso permite que a comunidade construa conhecimento colaborativo sobre interpretação, técnica e análise musical de cada peça.',
  },
  {
    id: '17',
    category: 'Anotações',
    icon: FiHeart,
    question: 'Como contribuir com anotações úteis para a comunidade?',
    answer:
      'Crie anotações públicas com informações específicas e úteis: dedilhados eficazes, dicas de interpretação, análises harmônicas ou contexto histórico. Use linguagem clara, especifique localização precisa (números de compasso) e adicione tags relevantes. Anotações úteis recebem votos positivos da comunidade e ajudam sua reputação na plataforma.',
  },

  // UPLOADS
  {
    id: '18',
    category: 'Upload',
    icon: FiUpload,
    question: 'Como posso contribuir com uploads?',
    answer:
      'Usuários com email verificado podem fazer upload de compositores, obras e partituras. Para compositores e obras, você pode usar links do IMSLP para extração automática de informações. Todos os uploads passam por moderação para garantir qualidade e precisão. Há um sistema de pontuação que recompensa contribuições de alta qualidade.',
  },
  {
    id: '19',
    category: 'Upload',
    icon: FiGlobe,
    question: 'Como usar o IMSLP para facilitar uploads?',
    answer:
      'Ao criar um novo compositor ou obra, você pode colar o link da página do IMSLP correspondente. O sistema extrai automaticamente informações como nome completo, datas, biografia, nacionalidade, época musical e muito mais. Isso acelera o processo e garante precisão dos dados, bastando apenas revisar e complementar as informações extraídas.',
  },
  {
    id: '20',
    category: 'Upload',
    icon: FiSettings,
    question: 'Quanto tempo leva para um upload ser aprovado?',
    answer:
      'A moderação ocorre em duas fases: análise inicial (24-48h) para verificar duplicatas e dados básicos, seguida de revisão detalhada (3-7 dias) por especialistas. Uploads com dados completos e de fontes confiáveis como IMSLP são aprovados mais rapidamente. O sistema notifica sobre o status e solicita correções quando necessário.',
  },

  // MODERAÇÃO
  {
    id: '21',
    category: 'Moderação',
    icon: FiFlag,
    question: 'Como reportar conteúdo inadequado?',
    answer:
      'Cada compositor, obra e partitura tem um botão de report. Descreva o problema específico: informações incorretas, duplicatas, problemas técnicos ou violações de direitos autorais. Nossa equipe analisa todos os reports em até 48 horas. Valorizamos muito a qualidade e precisão das informações na plataforma.',
  },
  {
    id: '22',
    category: 'Moderação',
    icon: FiSettings,
    question: 'O que significa conteúdo "verificado"?',
    answer:
      'Conteúdo verificado passou por análise especializada da nossa equipe de moderação, que confirmou a precisão de dados biográficos, atribuições de obras e qualidade das informações. Apenas moderadores qualificados podem fazer verificações. É um selo de qualidade que indica confiabilidade acadêmica e educacional.',
  },
  {
    id: '23',
    category: 'Moderação',
    icon: FiUser,
    question: 'Como posso me tornar um moderador?',
    answer:
      'Moderadores são selecionados com base em expertise musical, histórico de contribuições de qualidade na plataforma e formação relevante (música, musicologia). Demonstre conhecimento através de uploads precisos, reports úteis e anotações valiosas. Eventualmente convidamos usuários destacados para integrar a equipe de moderação.',
  },

  // NEWSLETTER
  {
    id: '24',
    category: 'Newsletter',
    icon: FiMail,
    question: 'Como funciona a newsletter do Opus Atlas?',
    answer:
      'Nossa newsletter semanal inclui novos compositores e obras adicionados, contribuições destacadas da comunidade, dicas de estudo e atualizações da plataforma. O conteúdo é personalizado baseado em seus favoritos e atividade. Você pode se inscrever durante o cadastro ou nas configurações do perfil.',
  },
  {
    id: '25',
    category: 'Newsletter',
    icon: FiSettings,
    question: 'Posso cancelar a newsletter?',
    answer:
      'Sim! Você pode cancelar a qualquer momento clicando em "Descadastrar" no final de qualquer email da newsletter, ou desmarcando a opção nas configurações do seu perfil. O cancelamento é imediato e você pode se reinscrever quando quiser.',
  },

  // CONTA
  {
    id: '26',
    category: 'Conta',
    icon: FiUser,
    question: 'Como alterar informações do meu perfil?',
    answer:
      'Acesse "Meu Perfil" > "Configurações" para alterar informações pessoais, preferências musicais, instrumentos, localização e configurações de privacidade. Você também pode completar o onboarding novamente para atualizar suas preferências musicais e descobrir novos recursos personalizados.',
  },
  {
    id: '27',
    category: 'Conta',
    icon: FiSettings,
    question: 'Como excluir minha conta?',
    answer:
      'Para excluir sua conta, vá em "Configurações" > "Privacidade e Segurança" > "Excluir Conta". Todos os seus dados pessoais serão removidos, mas contribuições públicas (uploads aprovados, anotações públicas) podem ser mantidas para preservar o conhecimento da comunidade, sem identificação pessoal.',
  },
];

const categories: string[] = [
  'Todos',
  'Geral',
  'Favoritos',
  'Partituras',
  'Aprendizado',
  'Anotações',
  'Upload',
  'Moderação',
  'Newsletter',
  'Conta',
];

export default function FAQPage(): JSX.Element {
  const [activeCategory, setActiveCategory] = useState<string>('Todos');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const filteredFAQs = faqData.filter((item) => {
    const matchesCategory =
      activeCategory === 'Todos' || item.category === activeCategory;
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
                  Opus Atlas e suas funcionalidades.
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
                    placeholder="Buscar perguntas..."
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
                máximo o Opus Atlas.
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
