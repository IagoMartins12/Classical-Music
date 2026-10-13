// components/authModals/LoginModal.tsx - VERSÃO COM TRATAMENTO DE ERROS MELHORADO E TRADUÇÕES
'use client';

import React, { useState, useEffect } from 'react';
import Link from '@/app/components/LocalizedLink';
import {
  signInWithGoogle,
  signInWithPassword,
  useSession,
} from '@/app/libs/session';
import { FcGoogle } from 'react-icons/fc';
import { GiGrandPiano } from 'react-icons/gi';
import { PiEnvelopeSimple, PiLock, PiWarning } from 'react-icons/pi';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { useLoginModal } from '@/app/stores/authStore';
import Modal from '../../Modal';
import Button from '../../Common/Button';
import Input from '../../Common/Inputs';
import ForgotPasswordModal from '../ForgotPasswordModal';
import { useTranslation } from '@/app/hooks/useTranslation';
import { Language } from '@/app/stores/useLanguageStore';
import { Text } from '@/app/components/ui/Text';
import { Stack } from '@/app/components/ui/Layout';

const errorMessages: Record<string, { pt: string; en: string }> = {
  Callback: {
    pt: 'Este email já está cadastrado com senha. Use "Entrar com Email" ou redefina sua senha.',
    en: 'This email is already registered with a password. Use "Sign in with Email" or reset your password.',
  },
  OAuthCallback: {
    pt: 'Erro na autenticação com Google. Tente novamente.',
    en: 'Google authentication error. Please try again.',
  },
  OAuthSignin: {
    pt: 'Erro ao conectar com Google. Verifique suas permissões.',
    en: 'Error connecting to Google. Check your permissions.',
  },
  OAuthCreateAccount: {
    pt: 'Este email já está em uso. Tente fazer login com email e senha.',
    en: 'This email is already in use. Try signing in with email and password.',
  },
  EmailCreateAccount: {
    pt: 'Este email já está em uso.',
    en: 'This email is already in use.',
  },
  Signin: {
    pt: 'Email ou senha incorretos.',
    en: 'Incorrect email or password.',
  },
  SessionRequired: {
    pt: 'Sessão expirada. Faça login novamente.',
    en: 'Session expired. Please sign in again.',
  },
  AccessDenied: {
    pt: 'Acesso negado pelo Google.',
    en: 'Access denied by Google.',
  },
  Verification: {
    pt: 'Erro na verificação. Tente novamente.',
    en: 'Verification error. Please try again.',
  },
  DEFAULT: {
    pt: 'Erro ao autenticar. Tente novamente.',
    en: 'Authentication error. Please try again.',
  },
};

const getErrorMessage = (errorCode: string | null, language: Language) => {
  if (!errorCode) return null;
  const msg = errorMessages[errorCode] || errorMessages.DEFAULT;
  return msg[language as 'pt' | 'en'];
};

/**
 * O pedido de login que veio pela URL (`/?login=1&callbackUrl=…`), montado
 * pelo middleware para `/login` e para o painel sem sessão.
 *
 * O destino só vale se for caminho **deste** site: `/perfil` sim,
 * `//outro.com` ou `https://outro.com` não. Sem essa trava, qualquer um
 * montaria um link do Opus Atlas que, depois do login, levaria a pessoa para
 * fora — o redirecionamento aberto que o phishing usa.
 */
function pedidoDeLoginNaUrl(): { pedido: boolean; destino: string | null } {
  if (typeof window === 'undefined') return { pedido: false, destino: null };
  const params = new URLSearchParams(window.location.search);
  const bruto = params.get('callbackUrl');
  const destino =
    bruto &&
    bruto.startsWith('/') &&
    !bruto.startsWith('//') &&
    !bruto.startsWith('/\\')
      ? bruto
      : null;
  return { pedido: params.get('login') === '1', destino };
}

/** Tira `login` e `callbackUrl` da barra de endereço, sem navegar. */
function limparPedidoDeLogin() {
  const url = new URL(window.location.href);
  if (!url.searchParams.has('login') && !url.searchParams.has('callbackUrl')) {
    return;
  }
  url.searchParams.delete('login');
  url.searchParams.delete('callbackUrl');
  window.history.replaceState({}, '', url.toString());
}

const LoginModal: React.FC = () => {
  const { isOpen, open, close, switchToRegister } = useLoginModal();
  const { status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const router = useRouter();
  const { t, language, ready } = useTranslation({
    sections: ['components/auth-modals'],
  });

  // Estado para erro específico de conflito de email
  const [emailConflictError, setEmailConflictError] = useState<string | null>(
    null
  );

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  // `/login` e o painel sem sessão chegam aqui como `/?login=1`: abre o modal
  // para quem não entrou; quem já entrou (inclusive voltando do Google) segue
  // direto para o destino.
  useEffect(() => {
    const { pedido, destino } = pedidoDeLoginNaUrl();
    if (!pedido || status === 'loading') return;

    if (status === 'authenticated') {
      limparPedidoDeLogin();
      if (destino) router.replace(destino);
      return;
    }

    open();
  }, [status]);

  // 🆕 NOVO: Verificar erros na URL quando o modal abrir
  useEffect(() => {
    checkUrlErrors();
  }, [isOpen]);

  // 🆕 NOVO: Função para verificar e processar erros na URL
  const checkUrlErrors = () => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    const error = url.searchParams.get('error');

    if (error) {
      const errorMessage = getErrorMessage(error, language);

      // Se for conflito, exibe dentro do modal
      if (
        ['Callback', 'OAuthCreateAccount', 'EmailCreateAccount'].includes(error)
      ) {
        setEmailConflictError(errorMessage);
      } else {
        toast.error(errorMessage);
      }

      // limpar URL
      url.searchParams.delete('error');
      url.searchParams.delete('error_description');
      url.searchParams.delete('code');
      url.searchParams.delete('state');
      window.history.replaceState({}, '', url.toString());
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Limpar erro de conflito ao digitar
    if (emailConflictError) {
      setEmailConflictError(null);
    }
  };

  // No login nada aparece no modal: o erro é só o toast, e genérico — dizer
  // qual campo está errado ajuda quem tenta adivinhar. Regra de senha é do
  // cadastro.
  const validateForm = () => {
    if (!formData.email.trim() || !formData.password) {
      toast.error(t('login_modal_fill_fields'));
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setEmailConflictError(null); // Limpar erro anterior

    try {
      const result = await signInWithPassword(
        formData.email,
        formData.password
      );

      if (!result.ok) {
        toast.error(
          result.status === 429
            ? t('login_modal_too_many_attempts')
            : result.status === 0 || result.status >= 500
              ? t('login_modal_internal_error')
              : t('login_modal_credentials_error')
        );
      } else {
        toast.success(t('login_modal_success'));
        close();
        const { destino } = pedidoDeLoginNaUrl();
        limparPedidoDeLogin();
        if (destino) {
          router.push(destino);
        } else {
          router.refresh();
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error(t('login_modal_internal_error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setEmailConflictError(null); // Limpar erro anterior

    try {
      // A API conduz o login com o Google e devolve o navegador a esta página.
      // Com destino pedido, o Google devolve a pessoa direto para ele.
      signInWithGoogle(pedidoDeLoginNaUrl().destino ?? undefined);
    } catch (error) {
      console.error('❌ Erro no Google SignIn:', error);
      toast.error(t('login_modal_google_error'));
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ email: '', password: '' });
    setEmailConflictError(null); // Limpar erro de conflito
    // Fechou sem entrar: o pedido da URL não deve reabrir o modal.
    limparPedidoDeLogin();
    close();
  };

  const handleForgotPassword = () => {
    setForgotPasswordOpen(true);
  };

  const handleCloseForgotPassword = () => {
    setForgotPasswordOpen(false);
  };

  const handleBackToLoginFromForgot = () => {
    setForgotPasswordOpen(false);
  };

  return (
    <>
      <Modal
        carregando={!ready}
        isOpen={isOpen}
        onClose={handleClose}
        maxWidth="xl"
        showCloseButton={true}
        setPr
      >
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center shadow-theme-glow">
              <GiGrandPiano className="w-8 h-8 text-theme-primary" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-theme-primary classical-title mb-2">
            {t('login_modal_title')}
          </h2>
          <p className="text-theme-secondary">{t('login_modal_subtitle')}</p>
        </div>

        {/* Aviso de conflito de email */}
        {emailConflictError && (
          <div className="mb-6 p-4 rounded-lg bg-sup-2">
            <div className="flex items-start">
              <PiWarning className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium mb-1">
                  {t('login_modal_email_conflict_title')}
                </h4>
                <p className="text-sm opacity-90">{emailConflictError}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      setEmailConflictError(null);
                      // Focar no campo de email para facilitar o login
                      const emailInput = document.querySelector(
                        'input[name="email"]'
                      ) as HTMLInputElement;
                      if (emailInput) emailInput.focus();
                    }}
                    className="text-xs opacity-80 hover:opacity-100 underline transition-opacity"
                  >
                    {t('login_modal_email_conflict_action_login')}
                  </button>
                  <span className="text-xs opacity-50">•</span>
                  <button
                    onClick={handleForgotPassword}
                    className="text-xs opacity-80 hover:opacity-100 underline transition-opacity"
                  >
                    {t('login_modal_email_conflict_action_forgot')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Email/Password Form */}
        <Stack gap={6} as="form" onSubmit={handleSubmit}>
          {/* Email */}
          <Input
            label={t('login_modal_email_label')}
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            leftIcon={<PiEnvelopeSimple className="w-4 h-4" />}
            placeholder={t('login_modal_email_placeholder')}
            disabled={isLoading || isGoogleLoading}
            autoComplete="email"
          />

          {/* Password */}
          <Input
            label={t('login_modal_password_label')}
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            leftIcon={<PiLock className="w-4 h-4" />}
            placeholder={t('login_modal_password_placeholder')}
            isPassword
            disabled={isLoading || isGoogleLoading}
            autoComplete="current-password"
          />

          {/* Forgot Password Link */}
          <div className="text-right">
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-sm text-ouro-texto transition-colors"
              disabled={isLoading || isGoogleLoading}
            >
              {t('login_modal_forgot_password')}
            </button>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            className="w-full"
            disabled={isGoogleLoading}
          >
            {t('login_modal_submit_button')}
          </Button>
        </Stack>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-theme-secondary" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-theme-elevated text-theme-tertiary">
              {t('login_modal_divider_text')}
            </span>
          </div>
        </div>

        {/* Google Sign In */}
        <Button
          variant="google"
          size="lg"
          onClick={handleGoogleSignIn}
          isLoading={isGoogleLoading}
          leftIcon={<FcGoogle />}
          className="w-full"
          disabled={isLoading}
        >
          {t('login_modal_google_button')}
        </Button>

        {/* Register Link */}
        <div className="mt-8 text-center">
          <p className="text-theme-secondary">
            {t('login_modal_register_text')}{' '}
            <button
              onClick={switchToRegister}
              className="text-ouro-texto font-medium transition-colors"
              disabled={isLoading || isGoogleLoading}
            >
              {t('login_modal_register_link')}
            </button>
          </p>
        </div>

        {/* Termos e privacidade: ao seguir o link, o modal fecha — a página
            abre inteira, sem o login por cima. */}
        <div className="mt-6 text-center">
          <Text papel="legenda" tom="fraco" as="p">
            {t('login_modal_terms_text')}{' '}
            <Link
              href="/terms"
              onClick={handleClose}
              className="text-ouro-texto hover:underline"
            >
              {t('login_modal_terms_link')}
            </Link>{' '}
            {t('login_modal_terms_and')}{' '}
            <Link
              href="/privacy"
              onClick={handleClose}
              className="text-ouro-texto hover:underline"
            >
              {t('login_modal_privacy_link')}
            </Link>
          </Text>
        </div>
      </Modal>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={forgotPasswordOpen}
        onClose={handleCloseForgotPassword}
        onBackToLogin={handleBackToLoginFromForgot}
      />
    </>
  );
};

export default LoginModal;
