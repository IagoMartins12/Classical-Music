'use client';

import React, { useState } from 'react';
import {
  FiTool,
  FiSmartphone,
  FiHeadphones,
  FiAlertCircle,
  FiRefreshCw,
  FiDownload,
  FiSettings,
  FiMessageCircle,
  FiMail,
  FiClock,
  FiCheckCircle,
  FiInfo,
  FiActivity,
  FiServer,
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
import { BiBug } from 'react-icons/bi';
import { LuComputer } from 'react-icons/lu';

interface SupportCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  solutions: Solution[];
}

interface Solution {
  id: string;
  problem: string;
  solution: string;
  steps?: string[];
  priority: 'high' | 'medium' | 'low';
}

const supportCategories: SupportCategory[] = [
  {
    id: 'login-account',
    title: 'Login e Conta',
    description: 'Problemas com acesso à conta e autenticação',
    icon: FiSettings,
    color: 'from-accent-blue to-accent-purple',
    solutions: [
      {
        id: 'forgot-password',
        problem: 'Esqueci minha senha',
        solution:
          'Use a opção "Esqueci a senha" na tela de login para redefinir sua senha.',
        steps: [
          'Clique em "Esqueci a senha" na tela de login',
          'Digite seu email cadastrado',
          'Verifique seu email para o link de redefinição',
          'Clique no link e defina uma nova senha',
          'Faça login com a nova senha',
        ],
        priority: 'high',
      },
      {
        id: 'email-not-verified',
        problem: 'Email não verificado',
        solution:
          'Verifique sua caixa de entrada e spam para o email de verificação.',
        steps: [
          'Verifique a caixa de entrada do email cadastrado',
          'Procure também na pasta de spam/lixo eletrônico',
          'Clique no link de verificação no email',
          'Se não recebeu, solicite reenvio nas configurações',
        ],
        priority: 'high',
      },
      {
        id: 'account-locked',
        problem: 'Conta bloqueada',
        solution:
          'Aguarde 15 minutos ou entre em contato conosco se persistir.',
        priority: 'medium',
      },
    ],
  },
  {
    id: 'playback-audio',
    title: 'Reprodução e Áudio',
    description: 'Problemas com reprodução de áudio e metrônomo',
    icon: FiHeadphones,
    color: 'from-accent-green to-accent-blue',
    solutions: [
      {
        id: 'no-audio',
        problem: 'Sem áudio no metrônomo',
        solution:
          'Verifique as configurações de áudio do navegador e do sistema.',
        steps: [
          'Certifique-se que o volume não está no mute',
          'Verifique se o site tem permissão para reproduzir áudio',
          'Teste com outros sites de áudio',
          'Reinicie o navegador',
          'Tente usar fones de ouvido',
        ],
        priority: 'high',
      },
      {
        id: 'audio-delay',
        problem: 'Atraso no áudio',
        solution:
          'Ajuste as configurações de buffer de áudio nas configurações.',
        steps: [
          'Vá em Configurações > Áudio',
          'Diminua o buffer de áudio',
          'Feche outras abas que usem áudio',
          'Use uma conexão mais estável',
        ],
        priority: 'medium',
      },
      {
        id: 'metronome-sync',
        problem: 'Metrônomo fora de sincronia',
        solution: 'Redefina o metrônomo e verifique a performance do sistema.',
        priority: 'low',
      },
    ],
  },
  {
    id: 'pdf-scores',
    title: 'PDFs e Partituras',
    description: 'Problemas com visualização e download de partituras',
    icon: FiDownload,
    color: 'from-accent-purple to-accent-red',
    solutions: [
      {
        id: 'pdf-not-loading',
        problem: 'PDF não carrega',
        solution: 'Limpe o cache do navegador e tente novamente.',
        steps: [
          'Pressione Ctrl+F5 (Windows) ou Cmd+Shift+R (Mac)',
          'Limpe o cache do navegador',
          'Desative extensões temporariamente',
          'Tente em modo anônimo/privado',
          'Verifique sua conexão de internet',
        ],
        priority: 'high',
      },
      {
        id: 'annotations-not-saving',
        problem: 'Anotações não salvam',
        solution: 'Verifique se está logado e se tem permissão para salvar.',
        steps: [
          'Confirme que está logado na conta',
          'Verifique se a partitura permite anotações',
          'Tente fazer logout e login novamente',
          'Salve as anotações manualmente',
        ],
        priority: 'medium',
      },
      {
        id: 'slow-pdf',
        problem: 'PDF carrega lentamente',
        solution: 'Otimize as configurações de qualidade do PDF.',
        priority: 'low',
      },
    ],
  },
  {
    id: 'performance',
    title: 'Performance e Velocidade',
    description: 'Problemas de lentidão e travamentos',
    icon: FiActivity,
    color: 'from-accent-red to-accent-amber',
    solutions: [
      {
        id: 'slow-loading',
        problem: 'Site carrega lentamente',
        solution: 'Otimize sua conexão e configurações do navegador.',
        steps: [
          'Verifique a velocidade da sua internet',
          'Feche abas desnecessárias',
          'Limpe cookies e cache',
          'Desative extensões não essenciais',
          'Reinicie o navegador',
        ],
        priority: 'medium',
      },
      {
        id: 'browser-crash',
        problem: 'Navegador trava',
        solution: 'Atualize o navegador e verifique recursos do sistema.',
        steps: [
          'Atualize seu navegador para a versão mais recente',
          'Verifique se há atualizações do sistema',
          'Libere memória RAM fechando outros programas',
          'Reinicie o computador se necessário',
        ],
        priority: 'high',
      },
      {
        id: 'memory-usage',
        problem: 'Alto uso de memória',
        solution: 'Otimize o uso de abas e recursos do navegador.',
        priority: 'low',
      },
    ],
  },
  {
    id: 'mobile-issues',
    title: 'Problemas Mobile',
    description: 'Questões específicas de dispositivos móveis',
    icon: FiSmartphone,
    color: 'from-accent-amber to-accent-green',
    solutions: [
      {
        id: 'mobile-layout',
        problem: 'Layout quebrado no mobile',
        solution: 'Atualize o app ou use o navegador mais recente.',
        steps: [
          'Atualize o aplicativo do navegador',
          'Limpe o cache do navegador mobile',
          'Reinicie o dispositivo',
          'Tente no modo paisagem',
          'Verifique se há atualizações do sistema',
        ],
        priority: 'medium',
      },
      {
        id: 'touch-not-working',
        problem: 'Toque não funciona',
        solution: 'Verifique se a tela está limpa e calibrada.',
        steps: [
          'Limpe a tela do dispositivo',
          'Remova películas ou capas que possam interferir',
          'Teste com outros dedos',
          'Reinicie o dispositivo',
          'Verifique se há atualizações do sistema',
        ],
        priority: 'high',
      },
      {
        id: 'mobile-audio',
        problem: 'Áudio não funciona no mobile',
        solution: 'Verifique as configurações de áudio e permissões.',
        priority: 'medium',
      },
    ],
  },
  {
    id: 'uploads-moderation',
    title: 'Uploads e Moderação',
    description: 'Problemas com envio e moderação de conteúdo',
    icon: BiBug,
    color: 'from-brand-primary to-brand-secondary',
    solutions: [
      {
        id: 'upload-failed',
        problem: 'Upload falha',
        solution: 'Verifique o tamanho e formato do arquivo.',
        steps: [
          'Confirme que o arquivo não excede 10MB',
          'Verifique se o formato é suportado (PDF, JPG, PNG)',
          'Tente uma conexão mais estável',
          'Comprima o arquivo se necessário',
          'Tente novamente após alguns minutos',
        ],
        priority: 'high',
      },
      {
        id: 'moderation-delay',
        problem: 'Moderação demorada',
        solution: 'Aguarde até 48h para revisão manual.',
        priority: 'low',
      },
      {
        id: 'content-rejected',
        problem: 'Conteúdo rejeitado',
        solution: 'Revise as diretrizes e reenvie com correções.',
        priority: 'medium',
      },
    ],
  },
];

const systemStatus = [
  {
    service: 'Plataforma Principal',
    status: 'operational',
    uptime: '99.9%',
  },
  {
    service: 'Sistema de Uploads',
    status: 'operational',
    uptime: '99.7%',
  },
  {
    service: 'Modo Estudo',
    status: 'operational',
    uptime: '99.8%',
  },
  {
    service: 'Base de Dados IMSLP',
    status: 'maintenance',
    uptime: '98.5%',
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'operational':
      return 'text-accent-green';
    case 'maintenance':
      return 'text-accent-amber';
    case 'degraded':
      return 'text-accent-red';
    default:
      return 'text-theme-secondary';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'operational':
      return FiCheckCircle;
    case 'maintenance':
      return FiTool;
    case 'degraded':
      return FiAlertCircle;
    default:
      return FiInfo;
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'text-accent-red';
    case 'medium':
      return 'text-accent-amber';
    case 'low':
      return 'text-accent-green';
    default:
      return 'text-theme-secondary';
  }
};

export default function SupportPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedSolution, setExpandedSolution] = useState<string | null>(null);

  const toggleSolution = (solutionId: string) => {
    setExpandedSolution(expandedSolution === solutionId ? null : solutionId);
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
                  <FiTool className="w-5 h-5 text-brand-primary mr-2" />
                  <span className="text-brand-primary font-medium">
                    Suporte Técnico
                  </span>
                </div>
              </AnimatedItem>

              <AnimatedItem direction="up" springType="gentle">
                <h1 className="text-4xl lg:text-6xl font-bold classical-title text-theme-primary mb-6">
                  Suporte
                  <span className="text-gradient-brand block lg:inline lg:ml-4">
                    Técnico
                  </span>
                </h1>
              </AnimatedItem>

              <AnimatedItem direction="up" springType="gentle">
                <p className="text-xl lg:text-2xl text-theme-secondary leading-relaxed classical-body">
                  Soluções rápidas para problemas técnicos e dúvidas sobre o
                  funcionamento da plataforma.
                </p>
              </AnimatedItem>
            </div>
          </div>
          <AnimatedMusicalNotes />
        </AnimatedContainer>
      </section>

      {/* System Status */}
      <section className="py-8">
        <AnimatedContainer delay={0.1} staggerSpeed="normal">
          <div className="section-wrap">
            <div className="max-w-4xl mx-auto">
              <AnimatedCard hover="lift" className="classical-card p-8 mb-12">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold classical-title text-theme-primary">
                    Status do Sistema
                  </h2>
                  <div className="flex items-center space-x-2 text-accent-green">
                    <FiCheckCircle className="w-5 h-5" />
                    <span className="font-medium">
                      Todos os Sistemas Operacionais
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {systemStatus.map((service, index) => {
                    const StatusIcon = getStatusIcon(service.status);
                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-theme-elevated rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <StatusIcon
                            className={`w-5 h-5 ${getStatusColor(
                              service.status
                            )}`}
                          />
                          <span className="text-theme-primary font-medium">
                            {service.service}
                          </span>
                        </div>
                        <div className="text-right">
                          <div
                            className={`text-sm font-medium ${getStatusColor(
                              service.status
                            )}`}
                          >
                            {service.status === 'operational'
                              ? 'Operacional'
                              : service.status === 'maintenance'
                              ? 'Manutenção'
                              : 'Degradado'}
                          </div>
                          <div className="text-xs text-theme-tertiary">
                            {service.uptime} uptime
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </AnimatedCard>
            </div>
          </div>
        </AnimatedContainer>
      </section>

      {/* Support Categories */}
      <section className="py-8">
        <AnimatedContainer delay={0.1} staggerSpeed="fast">
          <div className="section-wrap">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl lg:text-4xl font-bold classical-title text-theme-primary mb-4">
                  Categorias de Suporte
                </h2>
                <p className="text-xl text-theme-secondary max-w-3xl mx-auto">
                  Encontre soluções rápidas para os problemas mais comuns
                </p>
              </div>

              <SequentialGrid cols={3} gap={8} delayBetweenItems={0.1}>
                {supportCategories.map((category, index) => (
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

                    <div className="text-brand-primary font-medium">
                      {category.solutions.length} soluções
                    </div>
                  </AnimatedCard>
                ))}
              </SequentialGrid>
            </div>
          </div>
        </AnimatedContainer>
      </section>

      {/* Selected Category Solutions */}
      {selectedCategory && (
        <section className="py-8">
          <AnimatedContainer delay={0.1} staggerSpeed="fast">
            <div className="section-wrap">
              <div className="max-w-4xl mx-auto">
                {(() => {
                  const category = supportCategories.find(
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
                        {category.solutions.map((solution, index) => (
                          <AnimatedItem
                            key={solution.id}
                            direction="up"
                            springType="gentle"
                            delay={index * 0.1}
                          >
                            <div className="classical-card overflow-hidden">
                              <button
                                onClick={() => toggleSolution(solution.id)}
                                className="w-full p-6 text-left focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-inset"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-4">
                                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-accent-red to-accent-amber"></div>
                                    <div>
                                      <h4 className="text-lg font-semibold text-theme-primary">
                                        {solution.problem}
                                      </h4>
                                      <p className="text-theme-secondary mt-1">
                                        {solution.solution}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-3">
                                    <span
                                      className={`text-sm font-medium ${getPriorityColor(
                                        solution.priority
                                      )}`}
                                    >
                                      {solution.priority === 'high'
                                        ? 'Alta'
                                        : solution.priority === 'medium'
                                        ? 'Média'
                                        : 'Baixa'}
                                    </span>
                                    <FiRefreshCw
                                      className={`w-4 h-4 transition-transform ${
                                        expandedSolution === solution.id
                                          ? 'rotate-180'
                                          : ''
                                      }`}
                                    />
                                  </div>
                                </div>
                              </button>

                              {expandedSolution === solution.id &&
                                solution.steps && (
                                  <div className="px-6 pb-6">
                                    <div className="pl-7 border-l-2 border-brand-primary/20">
                                      <h5 className="font-semibold text-theme-primary mb-3">
                                        Passos para resolver:
                                      </h5>
                                      <ol className="space-y-2">
                                        {solution.steps.map(
                                          (step, stepIndex) => (
                                            <li
                                              key={stepIndex}
                                              className="flex items-start space-x-3"
                                            >
                                              <span className="w-6 h-6 bg-brand-primary text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                                                {stepIndex + 1}
                                              </span>
                                              <span className="text-theme-secondary">
                                                {step}
                                              </span>
                                            </li>
                                          )
                                        )}
                                      </ol>
                                    </div>
                                  </div>
                                )}
                            </div>
                          </AnimatedItem>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </AnimatedContainer>
        </section>
      )}

      {/* Emergency Contact */}
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
                  Problema não resolvido?
                </h2>

                <p className="text-xl text-theme-secondary mb-12 classical-body">
                  Nossa equipe de suporte técnico está pronta para ajudar você
                  com problemas mais complexos.
                </p>

                <div className="flex flex-col sm:flex-row gap-6 justify-center">
                  <Link
                    href="/contact"
                    className="btn-classical-primary flex items-center justify-center space-x-3 px-10 py-4 text-lg"
                  >
                    <FiMail className="w-5 h-5" />
                    <span>Contatar Suporte</span>
                  </Link>

                  <Link
                    href="/help"
                    className="btn-classical-secondary flex items-center justify-center space-x-3 px-10 py-4 text-lg"
                  >
                    <FiTool className="w-5 h-5" />
                    <span>Central de Ajuda</span>
                  </Link>
                </div>

                <div className="flex items-center justify-center space-x-8 mt-12 pt-8 border-t border-theme-secondary">
                  <div className="flex items-center space-x-2 text-theme-tertiary">
                    <FiClock className="w-4 h-4" />
                    <span className="text-sm">Resposta em até 2 horas</span>
                  </div>
                  <div className="flex items-center space-x-2 text-theme-tertiary">
                    <FiServer className="w-4 h-4" />
                    <span className="text-sm">Monitoramento 24/7</span>
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
        <LuComputer />
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
