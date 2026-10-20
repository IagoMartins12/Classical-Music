// components/authModals/RegisterModal.tsx - VERSÃO COM ACEITAÇÃO DE TERMOS LGPD E TRADUÇÕES
'use client';

import { AUTH } from '@/app/conteudo/textos/auth';
import { useTextos } from '@/app/hooks/useTextos';
import React, { useState, useEffect } from 'react';
import { registerWithPassword, signInWithGoogle } from '@/app/libs/session';
import { toast } from 'react-hot-toast';
import {
  useOnboardingModal,
  usePromptModal,
  useRegisterModal,
} from '@/app/stores/authStore';
import { Button } from '@/app/components/ui/Button';
import { Field } from '@/app/components/ui/Field';
import { Sheet } from '@/app/components/ui/Sheet';
import { Language } from '@/app/stores/useLanguageStore';
import TermsAcceptance from '../TermsAcceptance';
import { AvisoDeAuth, BotaoGoogle, Divisor, SeloPiano } from '../pecas';
const registerErrorMessages: Record<string, { pt: string; en: string }> = {
  Callback: {
    pt: 'Este email já está cadastrado com senha. Use "Fazer login" ou redefina sua senha.',
    en: 'This email is already registered with a password. Use "Sign in" or reset your password.',
  },
  OAuthCallback: {
    pt: 'Erro na autenticação com o Google. Tente novamente.',
    en: 'Google authentication error. Please try again.',
  },
  OAuthSignin: {
    pt: 'Erro ao conectar com o Google. Verifique suas permissões.',
    en: 'Error connecting with Google. Check your permissions.',
  },
  OAuthCreateAccount: {
    pt: 'Este email já está em uso. Tente entrar com email e senha.',
    en: 'This email is already in use. Try signing in with email and password.',
  },
  EmailCreateAccount: {
    pt: 'Este email já está em uso.',
    en: 'This email is already in use.',
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
    pt: 'Erro ao tentar registrar. Tente novamente.',
    en: 'Error during registration. Please try again.',
  },
};
const getRegisterErrorMessage = (
  errorCode: string | null,
  language: Language
) => {
  if (!errorCode) return null;
  const msg = registerErrorMessages[errorCode] || registerErrorMessages.DEFAULT;
  return msg[language as 'pt' | 'en'];
};

const RegisterModal: React.FC = () => {
  const { isOpen, close, switchToLogin } = useRegisterModal();
  const { open: openOnboarding } = useOnboardingModal();
  const { t, language } = useTextos(AUTH);

  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Estado para erro específico de conflito de email
  const [emailConflictError, setEmailConflictError] = useState<string | null>(
    null
  );

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  // 🆕 NOVO: Estado para aceitação de termos
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // A volta do Google com conta nova abre as boas-vindas pelo
  // `GoogleRegistrationHandler` (a API marca `?new-user=true`); aqui só o erro.
  useEffect(() => {
    if (isOpen) {
      checkUrlErrors();
    }
  }, [isOpen]);

  // 🔧 FUNÇÃO CORRIGIDA - checkUrlErrors
  const checkUrlErrors = () => {
    if (typeof window === 'undefined') return;

    const currentUrl = new URL(window.location.href);
    const error = currentUrl.searchParams.get('error');
    const errorDescription = currentUrl.searchParams.get('error_description');

    if (error) {
      console.log('🔍 Erro detectado na URL (Register):', {
        error,
        errorDescription,
      });

      // 🆕 NOVO: Limpar flags de sucesso quando há erro
      sessionStorage.removeItem('google-register-pending');
      sessionStorage.removeItem('google-register-email');
      sessionStorage.removeItem('google-register-name');
      sessionStorage.removeItem('google-register-timestamp');

      const errorMessage = getRegisterErrorMessage(error, language);
      const shouldShowConflictError = false;

      if (
        ['Callback', 'OAuthCreateAccount', 'EmailCreateAccount'].includes(error)
      ) {
        setEmailConflictError(errorMessage);
      } else {
        toast.error(errorMessage);
      }

      if (shouldShowConflictError) {
        setEmailConflictError(errorMessage);
      } else {
        toast.error(errorMessage);
      }

      // Limpar URL dos parâmetros de erro
      const cleanUrl = new URL(window.location.href);
      cleanUrl.searchParams.delete('error');
      cleanUrl.searchParams.delete('error_description');
      cleanUrl.searchParams.delete('code');
      cleanUrl.searchParams.delete('state');
      window.history.replaceState({}, '', cleanUrl.toString());
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    const cleanedValue =
      name === 'username' || name === 'email'
        ? value.replace(/\s/g, '')
        : value;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : cleanedValue,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }

    if (emailConflictError) {
      setEmailConflictError(null);
    }
  };

  // 🆕 ATUALIZADO: Validação incluindo termos
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.username.trim()) {
      newErrors.username = t('register_modal_username_required');
    } else if (formData.username.trim().length < 2) {
      newErrors.username = t('register_modal_username_min_length');
    } else if (formData.username.includes(' ')) {
      newErrors.username = t('register_modal_username_no_spaces');
    } else if (!/^[a-zA-Z0-9_-]+$/.test(formData.username)) {
      newErrors.username = t('register_modal_username_invalid_chars');
    }

    if (!formData.email.trim()) {
      newErrors.email = t('register_modal_email_required');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('register_modal_email_invalid');
    }

    if (!formData.password.trim()) {
      newErrors.password = t('register_modal_password_required');
    } else if (formData.password.length < 8) {
      newErrors.password = t('register_modal_password_min_length');
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = t('register_modal_confirm_password_required');
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('register_modal_passwords_no_match');
    }

    // 🆕 NOVO: Validação de termos obrigatória
    if (!termsAccepted) {
      newErrors.terms = t('register_modal_terms_required');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setEmailConflictError(null);

    try {
      // A API cria a conta, manda a confirmação e já abre a sessão.
      const result = await registerWithPassword({
        email: formData.email.trim(),
        password: formData.password,
        firstName: formData.username.trim(),
      });

      if (result.ok) {
        // A conta nasce com a sessão aberta: as boas-vindas abrem na hora
        // (pedido do dono, 01/10). O aviso de confirmação vai no toast e no
        // banner de e-mail não confirmado.
        toast.success(t('register_modal_auto_login_success'));
        handleProceedToOnboarding();
      } else {
        if (
          result.key.toLowerCase().includes('já existe') ||
          result.key.toLowerCase().includes('já cadastrado')
        ) {
          setEmailConflictError(result.message);
        } else {
          setErrors({ general: result.message });
        }
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({ general: t('register_modal_internal_error') });
      toast.error(t('register_modal_internal_error'));
    } finally {
      setIsLoading(false);
    }
  };

  // 🆕 ATUALIZADO: handleGoogleSignIn com verificação de termos
  const handleGoogleSignIn = async () => {
    // 🆕 NOVA VALIDAÇÃO: Verificar termos antes do Google
    if (!termsAccepted) {
      setErrors({
        terms: t('register_modal_terms_google_required'),
      });
      toast.error(t('register_modal_terms_accept_error'));
      return;
    }

    setIsGoogleLoading(true);
    setEmailConflictError(null);

    // Volta para a mesma página; conta nova chega com `?new-user=true` e as
    // boas-vindas abrem lá.
    signInWithGoogle();
  };

  const { open } = usePromptModal();
  const handleClose = () => {
    setFormData({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    });
    setTermsAccepted(false); // 🆕 NOVO: Reset dos termos
    open();
    setErrors({});
    setEmailConflictError(null);
    close();
  };

  const handleProceedToOnboarding = () => {
    close();
    setTimeout(() => {
      openOnboarding();
    }, 300);
  };

  return (
    <Sheet
      aberto={isOpen}
      aoFechar={handleClose}
      titulo={t('register_modal_title')}
      descricao={t('register_modal_subtitle')}
      largura="p"
      emblema={<SeloPiano />}
    >
      <div className="flex flex-col gap-6">
        <form
          onSubmit={handleSubmit}
          noValidate
          className="flex flex-col gap-5"
        >
          {errors.general && <AvisoDeAuth>{errors.general}</AvisoDeAuth>}

          <Field
            label={t('register_modal_username_label')}
            type="text"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            placeholder={t('register_modal_username_placeholder')}
            ajuda={t('register_modal_username_hint')}
            erro={errors.username}
            disabled={isLoading || isGoogleLoading}
            autoComplete="username"
          />
          <Field
            label={t('register_modal_email_label')}
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder={t('register_modal_email_placeholder')}
            erro={errors.email || emailConflictError || undefined}
            disabled={isLoading || isGoogleLoading}
            autoComplete="email"
          />
          <Field.Senha
            label={t('register_modal_password_label')}
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder={t('register_modal_password_placeholder')}
            erro={errors.password}
            disabled={isLoading || isGoogleLoading}
            autoComplete="new-password"
            rotuloMostrar={t('password_show')}
            rotuloOcultar={t('password_hide')}
          />
          <Field.Senha
            label={t('register_modal_confirm_password_label')}
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            placeholder={t('register_modal_confirm_password_placeholder')}
            erro={errors.confirmPassword}
            disabled={isLoading || isGoogleLoading}
            autoComplete="new-password"
            rotuloMostrar={t('password_show')}
            rotuloOcultar={t('password_hide')}
          />

          <TermsAcceptance
            accepted={termsAccepted}
            onChange={setTermsAccepted}
            error={errors.terms}
            disabled={isLoading || isGoogleLoading}
          />

          <Button
            type="submit"
            variante="primario"
            carregando={isLoading}
            disabled={isGoogleLoading}
            className="w-full"
          >
            {t('register_modal_submit_button')}
          </Button>
        </form>

        <Divisor texto={t('register_modal_divider_text')} />

        <BotaoGoogle
          onClick={handleGoogleSignIn}
          carregando={isGoogleLoading}
          disabled={isLoading}
        >
          {t('register_modal_google_button')}
        </BotaoGoogle>

        <p className="t-rotulo text-center text-texto-suave">
          {t('register_modal_login_text')}{' '}
          <Button
            variante="texto"
            type="button"
            onClick={switchToLogin}
            disabled={isLoading || isGoogleLoading}
          >
            {t('register_modal_login_link')}
          </Button>
        </p>
      </div>
    </Sheet>
  );
};

export default RegisterModal;
