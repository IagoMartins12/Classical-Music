// app/confirm-student-invite/[token]/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  FiCheckCircle,
  FiAlertCircle,
  FiLoader,
  FiArrowRight,
  FiRefreshCw,
  FiBookOpen,
} from 'react-icons/fi';
import { GiGrandPiano } from 'react-icons/gi';
import Button from '@/app/components/Common/Button';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { useTranslation } from '@/app/hooks/useTranslation';

interface ConfirmationState {
  status: 'loading' | 'success' | 'error' | 'already-accepted';
  message: string;
  user?: {
    firstName: string;
    lastName: string;
    email: string;
    isStudent: boolean;
  };
  teacher?: {
    name: string;
  };
  relationship?: {
    id: string;
    maxLessonsPerWeek: number;
    lessonDuration: number;
    preferredDays: string[];
    preferredTimes: string[];
  };
  errorCode?: string;
  canResend?: boolean;
}

function getErrorTitle(errorCode?: string, t?: any): string {
  switch (errorCode) {
    case 'EXPIRED_TOKEN':
      return t('pages_token_error_title_expired_token');
    case 'USED_TOKEN':
      return t('pages_token_error_title_used_token');
    case 'INVALID_TOKEN':
      return t('pages_token_error_title_invalid_token');
    case 'NO_TOKEN':
      return t('pages_token_error_title_no_token');
    case 'CONNECTION_ERROR':
      return t('pages_token_error_title_connection_error');
    default:
      return t('pages_token_error_title_default');
  }
}

function getErrorDescription(errorCode?: string, t?: any): string {
  switch (errorCode) {
    case 'EXPIRED_TOKEN':
      return t('pages_token_error_description_expired_token');
    case 'USED_TOKEN':
      return t('pages_token_error_description_used_token');
    case 'INVALID_TOKEN':
      return t('pages_token_error_description_invalid_token');
    case 'NO_TOKEN':
      return t('pages_token_error_description_no_token');
    case 'CONNECTION_ERROR':
      return t('pages_token_error_description_connection_error');
    default:
      return t('pages_token_error_description_default');
  }
}

export default function ConfirmStudentInvitePage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const { t } = useTranslation({ sections: ['pagesToken'] });

  const [state, setState] = useState<ConfirmationState>({
    status: 'loading',
    message: t('pages_token_jsx_h1_children_0__processando_convite'),
  });

  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setState({
        status: 'error',
        message: t(
          'pages_token_jsx_span_children_0__token_convite_não_fornecido'
        ),
        errorCode: 'NO_TOKEN',
      });
      return;
    }

    acceptInvite();
  }, [token]);

  const acceptInvite = async () => {
    try {
      setState({
        status: 'loading',
        message: t('pages_token_jsx_p_children_0__processando_convite_aluno'),
      });

      const response = await fetch(`/api/invites/student/accept/${token}`);
      const result = await response.json();

      if (result.success) {
        setState({
          status: result.alreadyAccepted ? 'already-accepted' : 'success',
          message: result.message,
          user: result.user,
          teacher: result.teacher,
          relationship: result.relationship,
        });

        // Toast de sucesso
        if (!result.alreadyAccepted) {
          toast.success(
            `🎉 Parabéns! Você agora é aluno de ${
              result.teacher?.name || 'seu professor'
            }!`
          );
        }

        // Redirecionar após sucesso (com delay para mostrar mensagem)
        setTimeout(() => {
          router.push('/student/profile');
        }, 10000);
      } else {
        setState({
          status: 'error',
          message: result.error,
          errorCode: result.errorCode,
          canResend: ['EXPIRED_TOKEN', 'CONNECTION_ERROR'].includes(
            result.errorCode
          ),
        });

        toast.error(result.error);
      }
    } catch (error) {
      console.error('Erro na aceitação:', error);
      setState({
        status: 'error',
        message: t('pages_token_jsx_span_children_0__erro_conexão_reenviar'),
        errorCode: 'CONNECTION_ERROR',
        canResend: true,
      });
      toast.error('Erro de conexão');
    }
  };

  const handleResendInvite = async () => {
    if (!token) return;

    setResendLoading(true);
    setResendSuccess(false);

    try {
      const response = await fetch(`/api/invites/student/accept/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'resend' }),
      });

      const result = await response.json();

      if (result.success) {
        setResendSuccess(true);
        setState((prev) => ({
          ...prev,
          message: t('pages_token_jsx_span_children_0__novo_email_confirmação'),
        }));
        toast.success('Email reenviado!');
      } else {
        setState((prev) => ({
          ...prev,
          message:
            result.error ||
            t('pages_token_jsx_span_children_0__erro_reenviar_confirmação'),
        }));
        toast.error(result.error);
      }
    } catch (error) {
      console.error('Erro ao reenviar:', error);
      setState((prev) => ({
        ...prev,
        message: t('pages_token_jsx_span_children_0__erro_conexão_reenviar'),
      }));
      toast.error('Erro de conexão');
    } finally {
      setResendLoading(false);
    }
  };

  const renderContent = () => {
    switch (state.status) {
      case 'loading':
        return (
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-brand-primary to-accent-purple rounded-full flex items-center justify-center mx-auto mb-6 shadow-theme-glow animate-pulse">
              <FiLoader className="w-10 h-10 text-theme-primary animate-spin" />
            </div>
            <h1 className="text-3xl font-bold text-theme-primary classical-title mb-4">
              {t('pages_token_jsx_h1_children_0__processando_convite')}
            </h1>
            <p className="text-theme-secondary text-lg">{state.message}</p>
            <div className="mt-8">
              <div className="w-32 h-1 bg-theme-secondary rounded-full mx-auto overflow-hidden">
                <div className="h-full bg-gradient-to-r from-brand-primary to-accent-purple rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        );

      case 'success':
        return (
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-accent-green to-accent-blue rounded-full flex items-center justify-center mx-auto mb-6 shadow-theme-glow animate-bounce">
              <FiCheckCircle className="w-10 h-10 text-theme-primary" />
            </div>
            <h1 className="text-3xl font-bold text-theme-primary classical-title mb-4">
              {t('pages_token_jsx_h1_children_0__convite_aceito')}
            </h1>
            <p className="text-theme-secondary text-lg mb-6">{state.message}</p>

            {state.user && state.teacher && (
              <div className="bg-accent-green bg-opacity-10 rounded-xl p-6 mb-8">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-accent-blue to-accent-purple rounded-full flex items-center justify-center mr-4">
                    <FiBookOpen className="w-8 h-8 text-theme-primary" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold text-accent-green">
                      {t('pages_token_jsx_h3_children_0__bem_vindo_aluno', {
                        firstName: state.user.firstName,
                      })}
                    </h3>
                    <p className="text-accent-green opacity-80">
                      {t('pages_token_jsx_p_children_0__agora_aluno_de', {
                        teacherName: state.teacher.name,
                      })}
                    </p>
                  </div>
                </div>

                {state.relationship && (
                  <div className="grid md:grid-cols-2 gap-4 mt-6">
                    <div className="classical-card-simple bg-opacity-10 rounded-lg p-4">
                      <h4 className="font-medium text-accent-green mb-2">
                        {t('pages_token_jsx_h4_children_0__seu_plano_estudos')}
                      </h4>
                      <ul className="text-xs text-accent-green opacity-90 space-y-1 text-left">
                        <li>
                          {t(
                            'pages_token_jsx_li_children_0__aulas_por_semana',
                            { maxLessons: state.relationship.maxLessonsPerWeek }
                          )}
                        </li>
                        <li>
                          {t(
                            'pages_token_jsx_li_children_0__minutos_por_aula',
                            { duration: state.relationship.lessonDuration }
                          )}
                        </li>
                        {state.relationship.preferredDays?.length > 0 && (
                          <li>
                            {t('pages_token_jsx_li_children_0__dias', {
                              days: state.relationship.preferredDays.join(', '),
                            })}
                          </li>
                        )}
                        {state.relationship.preferredTimes?.length > 0 && (
                          <li>
                            {t('pages_token_jsx_li_children_0__horários', {
                              times:
                                state.relationship.preferredTimes.join(', '),
                            })}
                          </li>
                        )}
                      </ul>
                    </div>
                    <div className="classical-card-simple bg-opacity-10 rounded-lg p-4">
                      <h4 className="font-medium text-accent-green mb-2">
                        {t('pages_token_jsx_h4_children_0__próximos_passos')}
                      </h4>
                      <ul className="text-xs text-accent-green opacity-90 space-y-1 text-left">
                        <li>
                          {t('pages_token_jsx_li_children_0__complete_perfil')}
                        </li>
                        <li>
                          {t('pages_token_jsx_li_children_0__defina_objetivos')}
                        </li>
                        <li>
                          {t(
                            'pages_token_jsx_li_children_0__aguarde_agendamento'
                          )}
                        </li>
                        <li>
                          {t(
                            'pages_token_jsx_li_children_0__prepare_se_aprender'
                          )}
                        </li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              <Button
                variant="primary"
                size="lg"
                rightIcon={<FiArrowRight />}
                onClick={() => router.push('/student/profile')}
                className="animate-pulse"
              >
                {t('pages_token_jsx_button_children_0__completar_perfil')}
              </Button>

              <Button
                variant="ghost"
                size="lg"
                onClick={() => router.push('/student')}
              >
                {t('pages_token_jsx_button_children_0__área_do_aluno')}
              </Button>
            </div>

            <div className="mt-8 text-sm text-theme-tertiary">
              <span>
                {t('pages_token_jsx_span_children_0__redirecionando_perfil')}
              </span>
            </div>
          </div>
        );

      case 'already-accepted':
        return (
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-accent-blue to-accent-purple rounded-full flex items-center justify-center mx-auto mb-6 shadow-theme-glow">
              <FiCheckCircle className="w-10 h-10 text-theme-primary" />
            </div>
            <h1 className="text-3xl font-bold text-theme-primary classical-title mb-4">
              {t('pages_token_jsx_h1_children_0__já_é_aluno')}
            </h1>
            <p className="text-theme-secondary text-lg mb-6">{state.message}</p>

            {state.user && state.teacher && (
              <div className="bg-accent-blue bg-opacity-10 border border-accent-blue rounded-xl p-6 mb-8">
                <h3 className="text-xl font-semibold text-accent-blue mb-2">
                  {t('pages_token_jsx_h3_children_0__olá_aluno', {
                    firstName: state.user.firstName,
                  })}
                </h3>
                <p className="text-accent-blue opacity-80">
                  {t('pages_token_jsx_p_children_0__já_é_aluno_de', {
                    teacherName: state.teacher.name,
                  })}
                </p>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              <Button
                variant="primary"
                size="lg"
                rightIcon={<FiArrowRight />}
                onClick={() => router.push('/student')}
              >
                {t('pages_token_jsx_button_children_0__área_do_aluno')}
              </Button>

              <Button
                variant="ghost"
                size="lg"
                onClick={() => router.push('/student/profile')}
              >
                {t('pages_token_jsx_button_children_0__editar_perfil')}
              </Button>
            </div>
          </div>
        );

      case 'error':
        return (
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-accent-red to-accent-amber rounded-full flex items-center justify-center mx-auto mb-6 shadow-theme-glow">
              <FiAlertCircle className="w-10 h-10 text-theme-primary" />
            </div>
            <h1 className="text-3xl font-bold text-theme-primary classical-title mb-4">
              {t('pages_token_jsx_h1_children_0__erro_no_convite')}
            </h1>
            <p className="text-theme-secondary text-lg mb-6">{state.message}</p>

            <div className="bg-accent-red bg-opacity-10 border border-accent-red rounded-xl p-6 mb-8">
              <div className="flex items-center justify-center mb-3">
                <FiAlertCircle className="w-5 h-5 text-accent-red mr-2" />
                <span className="font-medium text-accent-red">
                  {getErrorTitle(state.errorCode, t)}
                </span>
              </div>
              <p className="text-accent-red opacity-80 text-sm">
                {getErrorDescription(state.errorCode, t)}
              </p>
            </div>

            <div className="space-y-4">
              {state.canResend && (
                <Button
                  variant="primary"
                  size="lg"
                  leftIcon={resendSuccess ? <FiCheckCircle /> : <FiRefreshCw />}
                  onClick={handleResendInvite}
                  isLoading={resendLoading}
                  disabled={resendSuccess}
                  className="w-full"
                >
                  {resendSuccess
                    ? t('pages_token_jsx_button_children_0__email_enviado')
                    : t('pages_token_jsx_button_children_0__reenviar_convite')}
                </Button>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={() => router.push('/')}
                >
                  {t('pages_token_jsx_button_children_0__voltar_ao_site')}
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  leftIcon={<FiRefreshCw />}
                  onClick={acceptInvite}
                >
                  {t('pages_token_jsx_button_children_0__tentar_novamente')}
                </Button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-theme-primary via-theme-secondary to-theme-tertiary flex items-center justify-center p-4">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-brand-primary opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-10 -right-10 w-60 h-60 bg-accent-purple opacity-10 rounded-full blur-3xl"></div>
        <GiGrandPiano className="absolute top-20 right-20 w-12 h-12 text-brand-primary opacity-5 rotate-12" />
        <GiGrandPiano className="absolute bottom-20 left-20 w-16 h-16 text-accent-purple opacity-5 -rotate-12" />
      </div>

      <div className="relative w-full max-w-2xl">
        <div className="classical-card p-8 md:p-12 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center group mb-6">
              <div className="relative">
                <GiGrandPiano className="w-10 h-10 mr-3 text-brand-primary icon-glow transition-all duration-300 group-hover:scale-110" />
              </div>
              <span className="text-2xl font-bold text-gradient-brand classical-title">
                {t('pages_token_jsx_h1_children_0__opus_atlas')}
              </span>
            </Link>
            <div className="text-sm text-theme-tertiary mb-4">
              {t('pages_token_jsx_div_children_0__convite_de_aluno')}
            </div>
          </div>

          {/* Content */}
          {renderContent()}

          {/* Footer */}
          <div className="mt-12 pt-8 border-t border-theme-secondary text-center">
            <p className="text-sm text-theme-tertiary">
              {t('pages_token_jsx_p_children_0__precisa_ajuda')}{' '}
              <Link
                href="/support"
                className="text-brand-primary hover:underline"
              >
                {t('pages_token_jsx_link_children_0__entre_contato')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
