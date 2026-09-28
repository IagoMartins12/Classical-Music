// app/confirm-email-change/[token]/page.tsx
'use client';

import { legacyAuth } from '@/app/libs/api/compat';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { signOut } from '@/app/libs/session';
import { GiGrandPiano } from 'react-icons/gi';
import {
  PiArrowsClockwise,
  PiCheckCircle,
  PiEnvelopeSimple,
  PiHouse,
  PiSignOut,
  PiSpinnerGap,
  PiWarning,
} from 'react-icons/pi';
import Button from '@/app/components/Common/Button';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '@/app/stores/authStore';
import { useFavoritesStore } from '@/app/stores/useFavoritesStore';
import { useLearningStore } from '@/app/stores/useLearningStore';
import { useAuth } from '@/app/hooks/useAuth';
import { useTranslation } from '@/app/context/TranslationContext';
import { Text } from '@/app/components/ui/Text';
import { Card } from '@/app/components/ui/Card';
import { Stack } from '@/app/components/ui/Layout';

interface ConfirmationResult {
  success: boolean;
  message: string;
  errorCode?: string;
  alreadyConfirmed?: boolean;
  data?: {
    oldEmail: string;
    newEmail: string;
    firstName: string;
  };
}

export default function ConfirmEmailChangePage() {
  const params = useParams();
  const router = useRouter();
  const [result, setResult] = useState<ConfirmationResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isResending, setIsResending] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const { t } = useTranslation({ sections: ['pagesToken'] });

  // 🆕 NOVO: Hooks para logout
  const { logout: authLogout } = useAuthStore();
  const { logout } = useAuth();
  const { reset } = useLearningStore();
  const { reset: resetFavorite } = useFavoritesStore();

  const token = params.token as string;

  useEffect(() => {
    if (token) {
      confirmEmailChange();
    }
  }, [token]);

  const confirmEmailChange = async () => {
    setIsLoading(true);
    try {
      const data = await legacyAuth.confirmEmailChange(token);
      setResult(data);

      console.log('data', data);
      if (data.success && data.data) {
        // Não atualizar a sessão - vamos deslogar o usuário
        toast.success(
          t('pages_token_jsx_h2_children_0__email_alterado_sucesso')
        );

        // 🆕 NOVO: Auto-logout após 3 segundos
        setTimeout(() => {
          handleAutoLogout();
        }, 3000);
      } else if (!data.success) {
        toast.error(data.error);
      }
    } catch (error) {
      console.error('Erro ao confirmar mudança de email:', error);
      setResult({
        success: false,
        message: t('pages_token_jsx_p_children_0__não_foi_possível_processar'),
        errorCode: 'NETWORK_ERROR',
      });
      toast.error('Erro de rede. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // 🆕 NOVO: Função para logout automático
  const handleAutoLogout = async () => {
    setIsLoggingOut(true);
    try {
      // Usar o mesmo padrão do navbar
      resetFavorite();
      logout();
      reset();
      authLogout();
      await signOut({ redirect: false });

      toast.success('Redirecionando para fazer login novamente...', {
        duration: 4000,
      });

      // Redirecionar para home após logout
      setTimeout(() => {
        router.push('/');
      }, 10000);
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Erro ao fazer logout');
      // Ainda assim redirecionar
      setTimeout(() => {
        router.push('/');
      }, 1000);
    }
  };

  // 🆕 NOVO: Função para logout manual
  const handleManualLogout = async () => {
    setIsLoggingOut(true);
    try {
      resetFavorite();
      logout();
      reset();
      authLogout();
      await signOut({ redirect: false });

      toast.success('Logout realizado com sucesso!');
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Erro ao fazer logout');
      router.push('/');
    }
  };

  const handleResendConfirmation = async () => {
    setIsResending(true);
    try {
      const data = await legacyAuth.resendEmailChange();

      if (data.success) {
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Erro ao reenviar confirmação:', error);
      toast.error('Erro ao reenviar confirmação.');
    } finally {
      setIsResending(false);
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full flex items-center justify-center shadow-theme-glow animate-pulse">
              <PiSpinnerGap className="w-8 h-8 text-theme-primary animate-spin" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-theme-primary classical-title mb-4">
            {t('pages_token_jsx_h2_children_0__confirmando_mudança_email')}
          </h2>
          <p className="text-theme-secondary">
            {t('pages_token_jsx_p_children_0__aguarde_processamento')}
          </p>
        </div>
      );
    }

    if (!result) {
      return (
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full flex items-center justify-center">
              <PiWarning className="w-8 h-8" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-theme-primary classical-title mb-4">
            {t('pages_token_jsx_h2_children_0__erro_ao_processar')}
          </h2>
          <p className="text-theme-secondary mb-6">
            {t('pages_token_jsx_p_children_0__não_foi_possível_processar')}
          </p>
          <Button variant="primary" onClick={() => router.push('/')}>
            {t('pages_token_jsx_button_children_0__voltar_ao_início')}
          </Button>
        </div>
      );
    }

    if (result.success) {
      return (
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full flex items-center justify-center shadow-theme-glow animate-pulse">
              <PiCheckCircle className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-theme-primary classical-title mb-4">
            {t('pages_token_jsx_h2_children_0__email_alterado_sucesso')}
          </h2>
          <p className="text-theme-secondary mb-6">{result.message}</p>

          {result.data && (
            <Stack className="rounded-lg p-6 mb-6 bg-sup-2">
              <h3 className="font-semibold flex items-center justify-center">
                <PiEnvelopeSimple className="w-5 h-5 mr-2" />
                {t('pages_token_jsx_h3_children_0__resumo_alteração')}
              </h3>
              <Stack gap={2} className="text-sm">
                <div className="flex justify-between">
                  <span className="text-theme-secondary">
                    {t('pages_token_jsx_span_children_0__email_anterior')}
                  </span>
                  <span className="text-theme-primary font-mono">
                    {result.data.oldEmail}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-theme-secondary">
                    {t('pages_token_jsx_span_children_0__novo_email')}
                  </span>
                  <span className="text-theme-primary font-mono font-bold">
                    {result.data.newEmail}
                  </span>
                </div>
              </Stack>
            </Stack>
          )}

          {/* 🆕 NOVO: Aviso sobre logout necessário */}
          <div className="rounded-lg p-4 mb-6 bg-sup-2">
            <div className="flex items-start">
              <PiSignOut className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium mb-2">
                  {t('pages_token_jsx_h4_children_0__logout_necessário')}
                </h4>
                <p className="text-sm opacity-90 mb-3">
                  {t('pages_token_jsx_p_children_0__logout_segurança')}
                </p>
                {isLoggingOut ? (
                  <div className="flex items-center justify-center">
                    <PiSpinnerGap className="w-4 h-4 animate-spin mr-2" />
                    <span className="text-sm">
                      {t('pages_token_jsx_span_children_0__fazendo_logout')}
                    </span>
                  </div>
                ) : (
                  <div className="text-xs opacity-70">
                    {t('pages_token_jsx_div_children_0__logout_automático')}
                  </div>
                )}
              </div>
            </div>
          </div>

          <Stack gap={2} className="rounded-lg p-4 mb-6 bg-sup-2">
            <h4 className="font-medium flex items-center justify-center">
              <PiCheckCircle className="w-4 h-4 mr-2" />
              {t('pages_token_jsx_h4_children_0__funcionalidades_restauradas')}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              <div>
                {t('pages_token_jsx_div_children_0__upload_compositores')}
              </div>
              <div>{t('pages_token_jsx_div_children_0__upload_obras')}</div>
              <div>
                {t('pages_token_jsx_div_children_0__upload_partituras')}
              </div>
              <div>
                {t('pages_token_jsx_div_children_0__funcionalidades_premium')}
              </div>
            </div>
          </Stack>

          <Stack gap={3}>
            {/* 🆕 NOVO: Botão para logout manual (caso queira acelerar) */}
            <Button
              variant="primary"
              size="lg"
              onClick={handleManualLogout}
              leftIcon={
                isLoggingOut ? (
                  <PiSpinnerGap className="animate-spin" />
                ) : (
                  <PiSignOut />
                )
              }
              className="w-full"
              disabled={isLoggingOut}
            >
              {isLoggingOut
                ? t('pages_token_jsx_button_children_0__fazendo_logout')
                : t('pages_token_jsx_button_children_0__fazer_logout_agora')}
            </Button>

            <Button
              variant="ghost"
              size="lg"
              onClick={() => router.push('/')}
              rightIcon={<PiHouse />}
              className="w-full"
              disabled={isLoggingOut}
            >
              {t('pages_token_jsx_button_children_0__ir_para_home')}
            </Button>
          </Stack>

          {/* 🆕 NOVO: Instruções para próximo login */}
          <div className="text-center pt-4 border-t border-theme-secondary mt-6">
            <Text papel="legenda" tom="fraco" as="p">
              {t('pages_token_jsx_p_children_0__próximo_login')}{' '}
              <span className="font-mono text-theme-primary">
                {result.data?.newEmail}
              </span>{' '}
              {t('pages_token_jsx_span_children_0__para_entrar')}
            </Text>
          </div>
        </div>
      );
    }

    // Error cases
    return (
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full flex items-center justify-center">
            <PiWarning className="w-8 h-8" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-theme-primary classical-title mb-4">
          {result.errorCode === 'EXPIRED_TOKEN'
            ? t('pages_token_jsx_h2_children_0__link_expirado')
            : result.errorCode === 'USED_TOKEN'
              ? t('pages_token_jsx_h2_children_0__link_já_utilizado')
              : result.errorCode === 'EMAIL_TAKEN'
                ? t('pages_token_jsx_h2_children_0__email_indisponível')
                : t('pages_token_jsx_h2_children_0__erro_na_confirmação_alt')}
        </h2>

        <p className="text-theme-secondary mb-6">{result.message}</p>

        <Stack>
          {result.errorCode === 'EXPIRED_TOKEN' && (
            <div className="rounded-lg p-4 bg-sup-2">
              <p className="text-sm">
                {t('pages_token_jsx_p_children_0__link_expirado_dica')}
              </p>
            </div>
          )}

          {result.errorCode === 'EMAIL_TAKEN' && (
            <div className="rounded-lg p-4 bg-sup-2">
              <p className="text-sm">
                {t('pages_token_jsx_p_children_0__email_indisponível_dica')}
              </p>
            </div>
          )}

          {result.errorCode === 'USED_TOKEN' && (
            <div className="rounded-lg p-4 bg-sup-2">
              <p className="text-sm">
                {t('pages_token_jsx_p_children_0__link_já_usado')}
              </p>
            </div>
          )}

          <Stack gap={3}>
            {(result.errorCode === 'EXPIRED_TOKEN' ||
              result.errorCode === 'NETWORK_ERROR') && (
              <>
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={handleResendConfirmation}
                  isLoading={isResending}
                  leftIcon={<PiArrowsClockwise />}
                  className="w-full"
                >
                  {t(
                    'pages_token_jsx_button_children_0__reenviar_confirmação_alt'
                  )}
                </Button>

                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => router.push('/profile')}
                  className="w-full"
                >
                  {t(
                    'pages_token_jsx_button_children_0__solicitar_nova_mudança'
                  )}
                </Button>
              </>
            )}

            {result.errorCode === 'EMAIL_TAKEN' && (
              <Button
                variant="primary"
                size="lg"
                onClick={() => router.push('/profile')}
                className="w-full"
              >
                {t('pages_token_jsx_button_children_0__tentar_outro_email')}
              </Button>
            )}

            <Button
              variant="ghost"
              size="lg"
              onClick={() => router.push('/')}
              rightIcon={<PiHouse />}
              className="w-full"
            >
              {t('pages_token_jsx_button_children_0__voltar_ao_início')}
            </Button>
          </Stack>
        </Stack>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-xl w-full">
        <Card densidade="larga">
          {/* Header with logo */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-theme-glow">
                <GiGrandPiano className="w-6 h-6 text-theme-primary" />
              </div>
            </div>
            <h1 className="text-lg font-bold text-theme-primary classical-title">
              {t('pages_token_jsx_h1_children_0__opus_atlas')}
            </h1>
            <Text papel="rotulo" tom="fraco" as="p">
              {t('pages_token_jsx_p_children_0__confirmação_mudança_email')}
            </Text>
          </div>

          {renderContent()}
        </Card>

        {/* Footer */}
        <div className="text-center mt-6">
          <Text papel="legenda" tom="fraco" as="p">
            {t('pages_token_jsx_p_children_0__problemas_contato')}{' '}
            <a
              href="mailto:suporte@opusatlas.com"
              className="text-ouro-texto hover:underline"
            >
              {t('pages_token_jsx_a_children_0__suporte')}
            </a>
          </Text>
        </div>
      </div>
    </div>
  );
}
