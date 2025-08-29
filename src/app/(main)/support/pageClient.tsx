'use client';

import React, { JSX, useState } from 'react';
import {
  FiTool,
  FiSmartphone,
  FiHeadphones,
  FiRefreshCw,
  FiSettings,
  FiMessageCircle,
  FiMail,
  FiClock,
  FiActivity,
  FiServer,
  FiUpload,
  FiUser,
  FiGlobe,
  FiUserCheck,
  FiHeart,
  FiArrowRight,
} from 'react-icons/fi';
import { GiMusicalNotes, GiGrandPiano, GiScrollQuill } from 'react-icons/gi';
import { LuComputer } from 'react-icons/lu';
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

const getPriorityColor = (priority: string): string => {
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

export default function SupportPage(): JSX.Element {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedSolution, setExpandedSolution] = useState<string | null>(null);

  const { t } = useTranslation({ sections: ['pages/support'] });

  const toggleSolution = (solutionId: string): void => {
    setExpandedSolution(expandedSolution === solutionId ? null : solutionId);
  };

  const supportCategories: SupportCategory[] = [
    {
      id: 'login-account',
      title: t('support_category_login_account_title'),
      description: t('support_category_login_account_description'),
      icon: FiSettings,
      color: 'from-blue-500 to-purple-500',
      solutions: [
        {
          id: 'forgot-password',
          problem: t('support_solution_forgot_password_problem'),
          solution: t('support_solution_forgot_password_solution'),
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
          id: 'google-login-conflict',
          problem: t('support_solution_google_login_conflict_problem'),
          solution: t('support_solution_google_login_conflict_solution'),
          steps: [
            'Se o email é o mesmo, use o método original de login',
            'Use "Esqueci a senha" se necessário',
          ],
          priority: 'high',
        },
        {
          id: 'email-not-verified',
          problem: t('support_solution_email_not_verified_problem'),
          solution: t('support_solution_email_not_verified_solution'),
          steps: [
            'Verifique a caixa de entrada do email cadastrado',
            'Procure também na pasta de spam/lixo eletrônico',
            'Clique no link de verificação no email',
            'Se não recebeu, solicite reenvio nas configurações',
            'Email não verificado impede uploads, mas não uso geral',
          ],
          priority: 'medium',
        },
        {
          id: 'account-locked',
          problem: t('support_solution_account_locked_problem'),
          solution: t('support_solution_account_locked_solution'),
          steps: [
            'Aguarde 15 minutos antes de tentar novamente',
            'Certifique-se de usar a senha correta',
            'Use "Esqueci a senha" se necessário',
            'Entre em contato se o problema persistir',
          ],
          priority: 'medium',
        },
      ],
    },
    {
      id: 'onboarding-profile',
      title: t('support_category_onboarding_profile_title'),
      description: t('support_category_onboarding_profile_description'),
      icon: FiUser,
      color: 'from-green-500 to-blue-500',
      solutions: [
        {
          id: 'phone-validation',
          problem: t('support_solution_phone_validation_problem'),
          solution: t('support_solution_phone_validation_solution'),
          steps: [
            'Selecione o país correto na lista',
            'Digite apenas os números do telefone (sem código do país)',
            'O sistema adiciona automaticamente o código (+55, +1, etc.)',
            'Telefone é opcional - pode pular se houver problemas',
            'Verifique se o número está no formato correto para seu país',
          ],
          priority: 'medium',
        },
        {
          id: 'location-not-found',
          problem: t('support_solution_location_not_found_problem'),
          solution: t('support_solution_location_not_found_solution'),
          steps: [
            'Digite o nome da cidade em português ou inglês',
            'Se não encontrar, escolha uma cidade próxima',
            'Você pode atualizar depois nas configurações',
            'Localização é opcional para uso da plataforma',
          ],
          priority: 'low',
        },
        {
          id: 'onboarding-stuck',
          problem: t('support_solution_onboarding_stuck_problem'),
          solution: t('support_solution_onboarding_stuck_solution'),
          steps: [
            'Recarregue a página (F5 ou Ctrl+R)',
            'Tente usar o botão "Continuar depois"',
            'Limpe o cache do navegador',
            'Complete o onboarding depois nas configurações',
          ],
          priority: 'medium',
        },
      ],
    },
    {
      id: 'search-navigation',
      title: t('support_category_search_navigation_title'),
      description: t('support_category_search_navigation_description'),
      icon: FiGlobe,
      color: 'from-purple-500 to-pink-500',
      solutions: [
        {
          id: 'search-no-results',
          problem: t('support_solution_search_no_results_problem'),
          solution: t('support_solution_search_no_results_solution'),
          steps: [
            'Verifique a ortografia do nome',
            'Tente apenas o sobrenome do compositor',
            'Use termos em português ou inglês',
            'Remova acentos se estiver usando',
            'Tente buscar por época musical',
          ],
          priority: 'medium',
        },
        {
          id: 'filters-not-working',
          problem: t('support_solution_filters_not_working_problem'),
          solution: t('support_solution_filters_not_working_solution'),
          steps: [
            'Clique em "Limpar filtros" se disponível',
            'Recarregue a página',
            'Aplique apenas um filtro por vez',
            'Verifique se há resultados para os filtros escolhidos',
          ],
          priority: 'low',
        },
        {
          id: 'slow-search',
          problem: t('support_solution_slow_search_problem'),
          solution: t('support_solution_slow_search_solution'),
          steps: [
            'Aguarde até 10 segundos para carregamento',
            'Use termos de busca mais específicos',
            'Evite usar muitos filtros simultaneamente',
            'Verifique sua conexão de internet',
          ],
          priority: 'low',
        },
      ],
    },
    {
      id: 'media-players',
      title: t('support_category_media_players_title'),
      description: t('support_category_media_players_description'),
      icon: FiHeadphones,
      color: 'from-orange-500 to-red-500',
      solutions: [
        {
          id: 'spotify-not-playing',
          problem: t('support_solution_spotify_not_playing_problem'),
          solution: t('support_solution_spotify_not_playing_solution'),
          steps: [
            'Certifique-se de ter uma conta Spotify (gratuita ou premium)',
            'Permita reprodução automática no navegador',
            'Desative bloqueadores de anúncio para o Spotify',
            'Tente fazer login no Spotify em outra aba',
            'Use fones de ouvido se não ouvir som',
          ],
          priority: 'medium',
        },
        {
          id: 'youtube-blocked',
          problem: t('support_solution_youtube_blocked_problem'),
          solution: t('support_solution_youtube_blocked_solution'),
          steps: [
            'Desative bloqueadores de anúncio temporariamente',
            'Permita reprodução de vídeos no navegador',
            'Verifique se YouTube não está bloqueado na rede',
            'Tente abrir o vídeo diretamente no YouTube',
            'Recarregue a página se necessário',
          ],
          priority: 'medium',
        },
        {
          id: 'audio-delay',
          problem: t('support_solution_audio_delay_problem'),
          solution: t('support_solution_audio_delay_solution'),
          steps: [
            'Feche outros programas que usam áudio',
            'Recarregue a página completamente',
            'Tente usar fones de ouvido',
            'Verifique se há atualizações do navegador',
          ],
          priority: 'low',
        },
      ],
    },
    {
      id: 'uploads-system',
      title: t('support_category_uploads_system_title'),
      description: t('support_category_uploads_system_description'),
      icon: FiUpload,
      color: 'from-red-500 to-purple-500',
      solutions: [
        {
          id: 'upload-failed',
          problem: t('support_solution_upload_failed_problem'),
          solution: t('support_solution_upload_failed_solution'),
          steps: [
            'Confirme que o arquivo não excede 50MB',
            'Verifique se o formato é PDF para partituras',
            'Teste com uma conexão mais estável',
            'Tente comprimir o arquivo se muito grande',
            'Aguarde alguns minutos antes de tentar novamente',
          ],
          priority: 'high',
        },
        {
          id: 'imslp-extraction-error',
          problem: t('support_solution_imslp_extraction_error_problem'),
          solution: t('support_solution_imslp_extraction_error_solution'),
          steps: [
            'Confirme que o link é de uma página de compositor ou obra do IMSLP',
            'Copie o link completo da barra de endereços',
            'Tente acessar o link manualmente para verificar se funciona',
            'Aguarde alguns minutos e tente novamente',
            'Se persistir, preencha manualmente os dados',
          ],
          priority: 'medium',
        },
        {
          id: 'moderation-delay',
          problem: t('support_solution_moderation_delay_problem'),
          solution: t('support_solution_moderation_delay_solution'),
          steps: [
            'Aguarde até 48h para análise inicial',
            'Revisão completa pode levar 3-7 dias',
            'Uploads com dados completos são mais rápidos',
            'Use links do IMSLP para acelerar processo',
            'Verifique se não há duplicatas',
          ],
          priority: 'low',
        },
        {
          id: 'upload-rejected',
          problem: t('support_solution_upload_rejected_problem'),
          solution: t('support_solution_upload_rejected_solution'),
          steps: [
            'Verifique o email de notificação com motivo da rejeição',
            'Corrija as informações conforme feedback',
            'Certifique-se de que não é duplicata',
            'Use fontes confiáveis para as informações',
            'Reenvie com as correções necessárias',
          ],
          priority: 'medium',
        },
      ],
    },
    {
      id: 'teacher-student',
      title: t('support_category_teacher_student_title'),
      description: t('support_category_teacher_student_description'),
      icon: FiUserCheck,
      color: 'from-indigo-500 to-blue-500',
      solutions: [
        {
          id: 'teacher-access-denied',
          problem: t('support_solution_teacher_access_denied_problem'),
          solution: t('support_solution_teacher_access_denied_solution'),
          steps: [
            'Verifique se enviou comprovação de qualificação',
            'Inclua diploma ou certificados de ensino musical',
            'Forneça informações sobre experiência docente',
            'Aguarde resposta da equipe em até 7 dias úteis',
            'Entre em contato se não receber feedback',
          ],
          priority: 'medium',
        },
        {
          id: 'student-invite-error',
          problem: t('support_solution_student_invite_error_problem'),
          solution: t('support_solution_student_invite_error_solution'),
          steps: [
            'Confirme que o aluno tem conta no Opus Atlas',
            'Verifique se o email está digitado corretamente',
            'Certifique-se de que você tem status de professor aprovado',
            'Aguarde alguns minutos antes de tentar novamente',
            'Peça para o aluno verificar spam/lixo eletrônico',
          ],
          priority: 'medium',
        },
        {
          id: 'calendar-not-syncing',
          problem: t('support_solution_calendar_not_syncing_problem'),
          solution: t('support_solution_calendar_not_syncing_solution'),
          steps: [
            'Recarregue a página do modo aluno',
            'Verifique se está conectado à internet',
            'Confirme que o professor agendou as aulas',
            'Tente fazer logout e login novamente',
            'Entre em contato com o professor se necessário',
          ],
          priority: 'medium',
        },
      ],
    },
    {
      id: 'favorites-annotations',
      title: t('support_category_favorites_annotations_title'),
      description: t('support_category_favorites_annotations_description'),
      icon: FiHeart,
      color: 'from-pink-500 to-red-500',
      solutions: [
        {
          id: 'favorites-not-saving',
          problem: t('support_solution_favorites_not_saving_problem'),
          solution: t('support_solution_favorites_not_saving_solution'),
          steps: [
            'Confirme que está conectado em sua conta',
            'Verifique se há conexão com internet',
            'Tente deslogar e logar novamente',
            'Limpe o cache do navegador',
            'Tente favoritar novamente',
          ],
          priority: 'medium',
        },
        {
          id: 'annotation-error',
          problem: t('support_solution_annotation_error_problem'),
          solution: t('support_solution_annotation_error_solution'),
          steps: [
            'Confirme que selecionou uma obra',
            'Preencha título e conteúdo da anotação',
            'Verifique se não excedeu limite de caracteres',
            'Certifique-se de estar logado',
            'Tente recarregar a página se necessário',
          ],
          priority: 'medium',
        },
        {
          id: 'annotations-not-visible',
          problem: t('support_solution_annotations_not_visible_problem'),
          solution: t('support_solution_annotations_not_visible_solution'),
          steps: [
            'Acesse suas anotações no perfil',
            'Verifique se estão marcadas como "Público"',
            'Anotações privadas só você pode ver',
            'Aguarde moderação para anotações públicas',
            'Verifique se não foram rejeitadas por moderação',
          ],
          priority: 'low',
        },
      ],
    },
    {
      id: 'performance',
      title: t('support_category_performance_title'),
      description: t('support_category_performance_description'),
      icon: FiActivity,
      color: 'from-yellow-500 to-orange-500',
      solutions: [
        {
          id: 'slow-loading',
          problem: t('support_solution_slow_loading_problem'),
          solution: t('support_solution_slow_loading_solution'),
          steps: [
            'Verifique a velocidade da sua internet',
            'Feche abas desnecessárias do navegador',
            'Limpe cookies e cache do navegador',
            'Desative extensões não essenciais',
            'Reinicie o navegador',
            'Tente usar modo anônimo/incógnito',
          ],
          priority: 'medium',
        },
        {
          id: 'browser-crash',
          problem: t('support_solution_browser_crash_problem'),
          solution: t('support_solution_browser_crash_solution'),
          steps: [
            'Atualize seu navegador para a versão mais recente',
            'Verifique se há atualizações do sistema operacional',
            'Libere memória RAM fechando outros programas',
            'Tente usar um navegador diferente',
            'Reinicie o computador se necessário',
          ],
          priority: 'high',
        },
        {
          id: 'cache-issues',
          problem: t('support_solution_cache_issues_problem'),
          solution: t('support_solution_cache_issues_solution'),
          steps: [
            'Pressione Ctrl+F5 (Windows) ou Cmd+Shift+R (Mac)',
            'Ou acesse configurações do navegador',
            'Encontre opção "Limpar dados de navegação"',
            'Selecione "Cache" e "Cookies"',
            'Confirme a limpeza e recarregue o site',
          ],
          priority: 'medium',
        },
      ],
    },
    {
      id: 'mobile-issues',
      title: t('support_category_mobile_issues_title'),
      description: t('support_category_mobile_issues_description'),
      icon: FiSmartphone,
      color: 'from-teal-500 to-green-500',
      solutions: [
        {
          id: 'mobile-layout',
          problem: t('support_solution_mobile_layout_problem'),
          solution: t('support_solution_mobile_layout_solution'),
          steps: [
            'Atualize o aplicativo do navegador',
            'Limpe o cache do navegador mobile',
            'Tente no modo paisagem (horizontal)',
            'Reinicie o dispositivo',
            'Verifique se há atualizações do sistema',
            'Tente usar Chrome ou Safari atualizados',
          ],
          priority: 'medium',
        },
        {
          id: 'touch-not-working',
          problem: t('support_solution_touch_not_working_problem'),
          solution: t('support_solution_touch_not_working_solution'),
          steps: [
            'Limpe a tela do dispositivo',
            'Remova películas ou capas que possam interferir',
            'Teste com diferentes dedos',
            'Reinicie o dispositivo',
            'Verifique se há atualizações do sistema',
            'Tente usar diferentes gestos (toque longo, duplo toque)',
          ],
          priority: 'high',
        },
        {
          id: 'mobile-audio',
          problem: t('support_solution_mobile_audio_problem'),
          solution: t('support_solution_mobile_audio_solution'),
          steps: [
            'Certifique-se que o volume não está no mute',
            'Verifique se o site tem permissão para reproduzir áudio',
            'Tente usar fones de ouvido',
            'Feche outros apps que usam áudio',
            'Reinicie o navegador',
            'Teste com diferentes players (Spotify, YouTube)',
          ],
          priority: 'medium',
        },
      ],
    },
  ];

  return (
    <PageContainer showBackground={true} className="classical-theme">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 via-accent-purple/5 to-accent-blue/5"></div>
        <AnimatedContainer delay={0.1} staggerSpeed="normal">
          <div className="relative p">
            <div className="text-center max-w-4xl mx-auto">
              <AnimatedItem direction="scale" springType="bouncy">
                <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-brand-primary/20 to-brand-secondary/20 border border-brand-primary/30 rounded-full mb-8">
                  <FiTool className="w-5 h-5 text-brand-primary mr-2" />
                  <span className="text-brand-primary font-medium">
                    {t(
                      'support_animatedcontainer_animateditem_suporte_técnico'
                    )}
                  </span>
                </div>
              </AnimatedItem>

              <AnimatedItem direction="up" springType="gentle">
                <h1 className="text-4xl lg:text-6xl font-bold classical-title text-theme-primary mb-6">
                  {t('support_animatedcontainer_animateditem_suporte')}
                  <span className="text-gradient-brand block lg:inline lg:ml-4">
                    {t('support_animatedcontainer_animateditem_técnico')}
                  </span>
                </h1>
              </AnimatedItem>

              <AnimatedItem direction="up" springType="gentle">
                <p className="text-xl lg:text-2xl text-theme-secondary leading-relaxed classical-body">
                  {t('support_jsx_p_children_0__soluções_rápidas_problemas')}
                </p>
              </AnimatedItem>
            </div>
          </div>
          <AnimatedMusicalNotes />
        </AnimatedContainer>
      </section>

      {/* Support Categories */}
      {!selectedCategory && (
        <section className="py-8">
          <AnimatedContainer delay={0.1} staggerSpeed="fast">
            <div className="section-wrap">
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl lg:text-4xl font-bold classical-title text-theme-primary mb-4">
                    {t(
                      'support_pagecontainer_animatedcontainer_categorias_suporte'
                    )}
                  </h2>
                  <p className="text-xl text-theme-secondary max-w-3xl mx-auto">
                    {t('support_jsx_p_children_0__encontre_soluções_rápidas')}
                  </p>
                </div>

                <SequentialGrid cols={3} gap={8} delayBetweenItems={0.1}>
                  {supportCategories.map((category) => (
                    <div
                      key={category.id}
                      className={`classical-card p-6 group flex flex-col items-center justify-center cursor-pointer transition-all  ${
                        selectedCategory === category.id
                          ? 'ring-2 ring-brand-primary'
                          : ''
                      }`}
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      <div
                        className={`w-16 h-16 bg-gradient-to-br  rounded-2xl flex items-center justify-center mb-6`}
                      >
                        <category.icon className="w-8 h-8 text-theme-primary" />
                      </div>

                      <h3 className="text-xl font-semibold classical-title text-theme-primary mb-3">
                        {category.title}
                      </h3>

                      <p className="text-theme-secondary text-center classical-body mb-4">
                        {category.description}
                      </p>

                      <div className="text-brand-primary font-medium">
                        {category.solutions.length}
                        {t('support_animatedcontainer_sequentialgrid_soluções')}
                      </div>
                    </div>
                  ))}
                </SequentialGrid>
              </div>
            </div>
          </AnimatedContainer>
        </section>
      )}

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
                        <button
                          onClick={() => setSelectedCategory(null)}
                          className="inline-flex items-center text-brand-primary hover:text-brand-primary/80 mb-4 transition-colors"
                        >
                          <FiArrowRight className="w-4 h-4 mr-2 rotate-180" />
                          {t('support_pagecontainer_animatedcontainer_voltar')}
                        </button>
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
                                className="w-full p-6 text-left focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-inset hover:bg-theme-elevated/50 transition-colors cursor-pointer"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-4">
                                    <div className="w-8 h-8 bg-gradient-to-r from-accent-red to-accent-amber rounded-lg flex items-center justify-center flex-shrink-0">
                                      <span className="text-white font-bold text-sm">
                                        !
                                      </span>
                                    </div>
                                    <div className="flex-grow">
                                      <div className="flex items-center space-x-2 mb-1">
                                        <h4 className="text-lg font-semibold classical-title text-theme-primary">
                                          {solution.problem}
                                        </h4>
                                        <span className="text-sm text-brand-primary font-medium">
                                          {expandedSolution === solution.id
                                            ? t(
                                                'support_jsx_span_children_0__fechar'
                                              )
                                            : t(
                                                'support_jsx_span_children_0__ver_solução'
                                              )}
                                        </span>
                                      </div>
                                      <p className="text-theme-secondary mt-1 classical-body">
                                        {solution.solution}
                                      </p>
                                      <div className="flex items-center space-x-3 mt-2">
                                        <span
                                          className={`text-xs font-medium px-2 py-1 rounded-full bg-theme-elevated ${getPriorityColor(
                                            solution.priority
                                          )}`}
                                        >
                                          {t(
                                            'support_animatedcontainer_animateditem_prioridade'
                                          )}{' '}
                                          {solution.priority === 'high'
                                            ? t(
                                                'support_jsx_span_children_0__alta'
                                              )
                                            : solution.priority === 'medium'
                                            ? t(
                                                'support_jsx_span_children_0__média'
                                              )
                                            : t(
                                                'support_jsx_span_children_0__baixa'
                                              )}
                                        </span>
                                        {solution.steps && (
                                          <span className="text-xs text-theme-tertiary">
                                            📋 {solution.steps.length}{' '}
                                            {t(
                                              'support_jsx_span_children_0__passos'
                                            )}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex-shrink-0 ml-4">
                                    <div className="flex flex-col items-center space-y-1">
                                      <FiRefreshCw
                                        className={`w-5 h-5 text-brand-primary transition-transform duration-300 ${
                                          expandedSolution === solution.id
                                            ? 'rotate-180'
                                            : ''
                                        }`}
                                      />
                                      <span className="text-xs text-theme-tertiary">
                                        {expandedSolution === solution.id
                                          ? t(
                                              'support_jsx_span_children_0__fechar'
                                            )
                                          : t(
                                              'support_jsx_span_children_0__abrir'
                                            )}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </button>

                              {expandedSolution === solution.id &&
                                solution.steps && (
                                  <div className="px-6 pb-6 border-t border-theme-secondary/20">
                                    <div className="pt-4">
                                      <div className="border-brand-primary/20 pl-4">
                                        <h5 className="font-semibold classical-title text-theme-primary mb-4 flex items-center">
                                          <span className="w-6 h-6 bg-brand-primary text-white rounded-full flex items-center justify-center text-sm font-medium mr-2">
                                            ✓
                                          </span>
                                          {t(
                                            'support_animatedcontainer_animateditem_passos_resolver'
                                          )}
                                        </h5>
                                        <ol className="space-y-3">
                                          {solution.steps.map(
                                            (step, stepIndex) => (
                                              <li
                                                key={stepIndex}
                                                className="flex items-start space-x-3"
                                              >
                                                <span className="w-7 h-7 bg-brand-primary text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">
                                                  {stepIndex + 1}
                                                </span>
                                                <span className="text-theme-secondary classical-body leading-relaxed">
                                                  {step}
                                                </span>
                                              </li>
                                            )
                                          )}
                                        </ol>

                                        <div className="mt-6 pt-4 border-t border-theme-secondary/10">
                                          <button
                                            onClick={() =>
                                              setExpandedSolution(null)
                                            }
                                            className="text-brand-primary hover:text-brand-primary/80 text-sm font-medium transition-colors"
                                          >
                                            {t(
                                              'support_animatedcontainer_animateditem_fechar'
                                            )}
                                          </button>
                                        </div>
                                      </div>
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
          <div className="relative ">
            <AnimatedCard
              hover="lift"
              className="classical-card p-12 text-center max-w-4xl mx-auto"
            >
              <div className="w-20 h-20 bg-brand-gradient rounded-3xl flex items-center justify-center mx-auto mb-8">
                <FiMessageCircle className="w-10 h-10 text-theme-primary" />
              </div>

              <h2 className="text-3xl lg:text-4xl font-bold classical-title text-theme-primary mb-6">
                {t('support_jsx_h2_children_0__problema_não_resolvido')}
              </h2>

              <p className="text-xl text-theme-secondary mb-12 classical-body">
                {t('support_jsx_p_children_0__nossa_equipe_suporte')}
              </p>

              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Link
                  href="/contact"
                  className="btn-classical-primary flex items-center justify-center space-x-3 px-10 py-4 text-lg"
                >
                  <FiMail className="w-5 h-5" />
                  <span>{t('support_animatedcard_link_contatar_suporte')}</span>
                </Link>

                <Link
                  href="/help"
                  className="btn-classical-secondary flex items-center justify-center space-x-3 px-10 py-4 text-lg"
                >
                  <FiTool className="w-5 h-5" />
                  <span>{t('support_animatedcard_link_central_ajuda')}</span>
                </Link>
              </div>

              <div className="flex items-center justify-center space-x-8 mt-12 pt-8 border-t border-theme-secondary">
                <div className="flex items-center space-x-2 text-theme-tertiary">
                  <FiClock className="w-4 h-4" />
                  <span className="text-sm">
                    {t('support_jsx_span_children_0__resposta_2h')}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-theme-tertiary">
                  <FiServer className="w-4 h-4" />
                  <span className="text-sm">
                    {t('support_jsx_span_children_0__monitoramento_24_7')}
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
