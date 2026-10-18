// components/authModals/LoginModal.tsx - VERSÃO COM TRATAMENTO DE ERROS MELHORADO E TRADUÇÕES
'use client';

import { AUTH } from '@/app/conteudo/textos/auth';
import { useTextos } from '@/app/hooks/useTextos';
import React, { useState, useEffect } from 'react';
import Link from '@/app/components/LocalizedLink';
import {
  signInWithGoogle,
  signInWithPassword,
  useSession,
} from '@/app/libs/session';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { useLoginModal } from '@/app/stores/authStore';
import { Button } from '@/app/components/ui/Button';
import { Field } from '@/app/components/ui/Field';
import { Sheet } from '@/app/components/ui/Sheet';
import { Language } from '@/app/stores/useLanguageStore';
import ForgotPasswordModal from '../ForgotPasswordModal';
import { AvisoDeAuth, BotaoGoogle, Divisor, SeloPiano } from '../pecas';

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
  const { t, language } = useTextos(AUTH);

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
      <Sheet
        aberto={isOpen}
        aoFechar={handleClose}
        titulo={t('login_modal_title')}
        descricao={t('login_modal_subtitle')}
        largura="p"
      >
        <div className="flex flex-col gap-6">
          <SeloPiano />
          {emailConflictError && (
            <AvisoDeAuth
              titulo={t('login_modal_email_conflict_title')}
              acoes={
                <>
                  <Button
                    variante="texto"
                    type="button"
                    onClick={() => {
                      setEmailConflictError(null);
                      // Focar no campo de email para facilitar o login
                      document
                        .querySelector<HTMLInputElement>('input[name="email"]')
                        ?.focus();
                    }}
                  >
                    {t('login_modal_email_conflict_action_login')}
                  </Button>
                  <Button
                    variante="texto"
                    type="button"
                    onClick={handleForgotPassword}
                  >
                    {t('login_modal_email_conflict_action_forgot')}
                  </Button>
                </>
              }
            >
              {emailConflictError}
            </AvisoDeAuth>
          )}

          <form
            onSubmit={handleSubmit}
            noValidate
            className="flex flex-col gap-5"
          >
            <Field
              label={t('login_modal_email_label')}
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder={t('login_modal_email_placeholder')}
              disabled={isLoading || isGoogleLoading}
              autoComplete="email"
            />
            <Field.Senha
              label={t('login_modal_password_label')}
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder={t('login_modal_password_placeholder')}
              disabled={isLoading || isGoogleLoading}
              autoComplete="current-password"
              rotuloMostrar={t('password_show')}
              rotuloOcultar={t('password_hide')}
            />
            <div className="-mt-2 flex justify-end">
              <Button
                variante="texto"
                type="button"
                onClick={handleForgotPassword}
                disabled={isLoading || isGoogleLoading}
              >
                {t('login_modal_forgot_password')}
              </Button>
            </div>
            <Button
              type="submit"
              variante="primario"
              carregando={isLoading}
              disabled={isGoogleLoading}
              className="w-full"
            >
              {t('login_modal_submit_button')}
            </Button>
          </form>

          <Divisor texto={t('login_modal_divider_text')} />

          <BotaoGoogle
            onClick={handleGoogleSignIn}
            carregando={isGoogleLoading}
            disabled={isLoading}
          >
            {t('login_modal_google_button')}
          </BotaoGoogle>

          <p className="t-rotulo text-center text-texto-suave">
            {t('login_modal_register_text')}{' '}
            <Button
              variante="texto"
              type="button"
              onClick={switchToRegister}
              disabled={isLoading || isGoogleLoading}
            >
              {t('login_modal_register_link')}
            </Button>
          </p>

          {/* Termos e privacidade: ao seguir o link, o modal fecha — a página
              abre inteira, sem o login por cima. */}
          <p className="t-legenda text-center">
            {t('login_modal_terms_text')}{' '}
            <Link
              href="/terms"
              onClick={handleClose}
              className="text-ouro-texto underline decoration-transparent underline-offset-4 hover:decoration-[var(--ouro)]"
            >
              {t('login_modal_terms_link')}
            </Link>{' '}
            {t('login_modal_terms_and')}{' '}
            <Link
              href="/privacy"
              onClick={handleClose}
              className="text-ouro-texto underline decoration-transparent underline-offset-4 hover:decoration-[var(--ouro)]"
            >
              {t('login_modal_privacy_link')}
            </Link>
          </p>
        </div>
      </Sheet>

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
