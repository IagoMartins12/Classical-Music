// app/decline-student-invite/[token]/page.tsx
'use client';

import { legacyAuth } from '@/app/libs/api/compat';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { GiGrandPiano } from 'react-icons/gi';
import {
  PiArrowRight,
  PiCheckCircle,
  PiHouse,
  PiSpinnerGap,
  PiUser,
  PiWarningCircle,
  PiX,
} from 'react-icons/pi';
import Button from '@/app/components/Common/Button';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { useTranslation } from '@/app/context/TranslationContext';
import { Text } from '@/app/components/ui/Text';
import { Stack } from '@/app/components/ui/Layout';

interface DeclineState {
  status: 'loading' | 'success' | 'error' | 'already-processed';
  message: string;
  user?: {
    firstName: string;
    lastName: string;
    email: string;
  };
  teacher?: {
    name: string;
  };
  errorCode?: string;
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

export default function DeclineStudentInvitePage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const { t } = useTranslation({ sections: ['pagesToken'] });

  const [state, setState] = useState<DeclineState>({
    status: 'loading',
    message: t('pages_token_jsx_h1_children_0__processando_recusa'),
  });

  const [confirmDecline, setConfirmDecline] = useState(false);

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

    if (!confirmDecline) {
      setState({
        status: 'loading',
        message: 'Carregando convite...',
      });
      return;
    }

    declineInvite();
  }, [token, confirmDecline]);

  const declineInvite = async () => {
    try {
      setState({
        status: 'loading',
        message: t('pages_token_jsx_p_children_0__processando_recusa_convite'),
      });

      const result = await legacyAuth.declineStudentInvite(token);

      if (result.success) {
        setState({
          status: result.alreadyProcessed ? 'already-processed' : 'success',
          message: result.message,
          user: result.user,
          teacher: result.teacher,
        });

        // Toast de confirmação
        if (!result.alreadyProcessed) {
          toast.success('Convite recusado com sucesso');
        }

        // Redirecionar após sucesso
        setTimeout(() => {
          router.push('/');
        }, 10000);
      } else {
        setState({
          status: 'error',
          message: result.error,
          errorCode: result.errorCode,
        });

        toast.error(result.error);
      }
    } catch (error) {
      console.error('Erro na recusa:', error);
      setState({
        status: 'error',
        message: t('pages_token_jsx_span_children_0__erro_conexão_reenviar'),
        errorCode: 'CONNECTION_ERROR',
      });
      toast.error('Erro de conexão');
    }
  };

  const renderContent = () => {
    if (!confirmDecline && state.status === 'loading') {
      return (
        <div className="text-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-theme-glow">
            <PiWarningCircle className="w-10 h-10 text-theme-primary" />
          </div>
          <h1 className="text-3xl font-bold text-theme-primary classical-title mb-4">
            {t('pages_token_jsx_h1_children_0__confirmar_recusa')}
          </h1>
          <p className="text-theme-secondary text-lg mb-6">
            {t('pages_token_jsx_p_children_0__certeza_recusar_convite')}
          </p>

          <Stack className="bg-theme-elevated rounded-xl p-6 mb-8">
            <h3 className="text-xl font-semibold">
              {t('pages_token_jsx_h3_children_0__ação_irreversível')}
            </h3>
            <Stack gap={3} className="opacity-90 text-left">
              <p
                className="text-sm"
                dangerouslySetInnerHTML={{
                  __html: t('pages_token_jsx_p_children_0__se_recusar_convite'),
                }}
              />
              <ul className="text-sm space-y-2 ml-4">
                <li>
                  {t('pages_token_jsx_li_children_0__relacionamento_removido')}
                </li>
                <li>
                  {t('pages_token_jsx_li_children_0__não_aparecerá_lista')}
                </li>
                <li>
                  {t('pages_token_jsx_li_children_0__necessário_novo_convite')}
                </li>
                <li>
                  {t('pages_token_jsx_li_children_0__configurações_afetadas')}
                </li>
              </ul>
            </Stack>
          </Stack>

          <Stack gap={3} className="bg-theme-elevated rounded-xl p-6 mb-8">
            <h4 className="font-medium">
              {t('pages_token_jsx_h4_children_0__alternativas')}
            </h4>
            <p className="opacity-80 text-sm">
              {t('pages_token_jsx_p_children_0__alternativas_texto')}
            </p>
          </Stack>

          <Stack>
            <div className="grid md:grid-cols-2 gap-4">
              <Button
                variant="ghost"
                size="lg"
                onClick={() => router.push('/')}
                leftIcon={<PiHouse />}
              >
                {t('pages_token_jsx_button_children_0__voltar_ao_site')}
              </Button>

              <Button
                variant="delete"
                size="lg"
                onClick={() => setConfirmDecline(true)}
                leftIcon={<PiX />}
                className=""
              >
                {t('pages_token_jsx_button_children_0__confirmar_recusa')}
              </Button>
            </div>
          </Stack>
        </div>
      );
    }

    switch (state.status) {
      case 'loading':
        return (
          <div className="text-center">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-theme-glow animate-pulse">
              <PiSpinnerGap className="w-10 h-10 text-theme-primary animate-spin" />
            </div>
            <h1 className="text-3xl font-bold text-theme-primary classical-title mb-4">
              {t('pages_token_jsx_h1_children_0__processando_recusa')}
            </h1>
            <p className="text-theme-secondary text-lg">{state.message}</p>
            <div className="mt-8">
              <div className="w-32 h-1 bg-theme-secondary rounded-full mx-auto overflow-hidden">
                <div className="h-full rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        );

      case 'success':
        return (
          <div className="text-center">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-theme-glow">
              <PiCheckCircle className="w-10 h-10 text-theme-primary" />
            </div>
            <h1 className="text-3xl font-bold text-theme-primary classical-title mb-4">
              {t('pages_token_jsx_h1_children_0__convite_recusado')}
            </h1>
            <p className="text-theme-secondary text-lg mb-6">{state.message}</p>

            {state.user && state.teacher && (
              <div className="bg-theme-secondary border border-theme-secondary rounded-xl p-6 mb-8">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mr-3">
                    <PiUser className="w-6 h-6 text-theme-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-theme-primary">
                      {t(
                        'pages_token_jsx_h3_children_0__convite_recusado_nome',
                        { firstName: state.user.firstName }
                      )}
                    </h3>
                    <p className="text-theme-secondary opacity-80">
                      {t('pages_token_jsx_p_children_0__não_será_aluno', {
                        teacherName: state.teacher.name,
                      })}
                    </p>
                  </div>
                </div>

                <div className="bg-theme-primary rounded-lg p-4 mt-4">
                  <Text
                    papel="rotulo"
                    tom="forte"
                    as="p"
                    className="opacity-90"
                  >
                    {t(
                      'pages_token_jsx_p_children_0__relacionamento_removido_notificado',
                      { teacherName: state.teacher.name }
                    )}
                  </Text>
                </div>
              </div>
            )}

            <Stack gap={3} className="border rounded-xl p-6 mb-8">
              <h4 className="font-medium">
                {t('pages_token_jsx_h4_children_0__e_agora')}
              </h4>
              <Stack gap={2} className="opacity-80 text-sm text-left">
                <p>
                  {t('pages_token_jsx_p_children_0__pode_continuar_estudando')}
                </p>
                <p>{t('pages_token_jsx_p_children_0__explore_biblioteca')}</p>
                <p>{t('pages_token_jsx_p_children_0__use_ferramentas')}</p>
                <p>{t('pages_token_jsx_p_children_0__mudar_ideia')}</p>
              </Stack>
            </Stack>

            <div className="grid md:grid-cols-2 gap-4">
              <Button
                variant="primary"
                size="lg"
                rightIcon={<PiArrowRight />}
                onClick={() => router.push('/')}
                className="animate-pulse"
              >
                {t('pages_token_jsx_button_children_0__explorar_opus_atlas')}
              </Button>

              <Button
                variant="ghost"
                size="lg"
                onClick={() => router.push('/profile')}
              >
                {t('pages_token_jsx_button_children_0__meu_perfil')}
              </Button>
            </div>

            <Text papel="rotulo" tom="fraco" as="div" className="mt-8">
              <span>
                {t('pages_token_jsx_span_children_0__redirecionando_site')}
              </span>
            </Text>
          </div>
        );

      case 'already-processed':
        return (
          <div className="text-center">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-theme-glow">
              <PiCheckCircle className="w-10 h-10 text-theme-primary" />
            </div>
            <h1 className="text-3xl font-bold text-theme-primary classical-title mb-4">
              {t('pages_token_jsx_h1_children_0__já_processado')}
            </h1>
            <p className="text-theme-secondary text-lg mb-6">{state.message}</p>

            <div className="bg-theme-secondary border border-theme-secondary rounded-xl p-6 mb-8">
              <p className="text-theme-primary opacity-80">
                {t('pages_token_jsx_p_children_0__convite_já_processado')}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <Button
                variant="primary"
                size="lg"
                rightIcon={<PiArrowRight />}
                onClick={() => router.push('/')}
              >
                {t('pages_token_jsx_button_children_0__ir_para_o_site')}
              </Button>

              <Button
                variant="ghost"
                size="lg"
                onClick={() => router.push('/profile')}
              >
                {t('pages_token_jsx_button_children_0__meu_perfil')}
              </Button>
            </div>
          </div>
        );

      case 'error':
        return (
          <div className="text-center">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-theme-glow">
              <PiWarningCircle className="w-10 h-10 text-theme-primary" />
            </div>
            <h1 className="text-3xl font-bold text-theme-primary classical-title mb-4">
              {t('pages_token_jsx_h1_children_0__erro_ao_processar')}
            </h1>
            <p className="text-theme-secondary text-lg mb-6">{state.message}</p>

            <Stack gap={3} className="border rounded-xl p-6 mb-8">
              <div className="flex items-center justify-center">
                <PiWarningCircle className="w-5 h-5 mr-2" />
                <span className="font-medium">
                  {getErrorTitle(state.errorCode, t)}
                </span>
              </div>
              <p className="opacity-80 text-sm">
                {getErrorDescription(state.errorCode, t)}
              </p>
            </Stack>

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
                onClick={() => setConfirmDecline(true)}
              >
                {t('pages_token_jsx_button_children_0__tentar_novamente')}
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-10 -left-10 w-40 h-40 opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-10 -right-10 w-60 h-60 opacity-10 rounded-full blur-3xl"></div>
        <GiGrandPiano className="absolute top-20 right-20 w-12 h-12 opacity-5 rotate-12" />
        <GiGrandPiano className="absolute bottom-20 left-20 w-16 h-16 opacity-5 -rotate-12" />
      </div>

      <div className="relative w-full max-w-2xl">
        <div className="classical-card p-8 md:p-12 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center group mb-6">
              <div className="relative">
                <GiGrandPiano className="w-10 h-10 mr-3 text-ouro-texto icon-glow transition-all duration-300 group-hover:scale-110" />
              </div>
              <span className="text-2xl font-bold text-gradient-brand classical-title">
                {t('pages_token_jsx_h1_children_0__opus_atlas')}
              </span>
            </Link>
            <Text papel="rotulo" tom="fraco" as="div" className="mb-4">
              {t('pages_token_jsx_div_children_0__recusar_convite_aluno')}
            </Text>
          </div>

          {/* Content */}
          {renderContent()}

          {/* Footer */}
          <div className="mt-12 pt-8 border-t border-theme-secondary text-center">
            <Text papel="rotulo" tom="fraco" as="p">
              {t('pages_token_jsx_p_children_0__precisa_ajuda')}{' '}
              <Link href="/support" className="text-ouro-texto hover:underline">
                {t('pages_token_jsx_link_children_0__entre_contato')}
              </Link>
            </Text>
          </div>
        </div>
      </div>
    </div>
  );
}
