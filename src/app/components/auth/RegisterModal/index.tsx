// components/authModals/RegisterModal.tsx - VERSÃO COM ACEITAÇÃO DE TERMOS LGPD E TRADUÇÕES
'use client';

import React, { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import {
  FiMail,
  FiLock,
  FiUser,
  FiCheckCircle,
  FiAlertTriangle,
} from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { GiGrandPiano } from 'react-icons/gi';
import { registerUser } from '@/app/actions/auth';
import { toast } from 'react-hot-toast';
import {
  useOnboardingModal,
  usePromptModal,
  useRegisterModal,
} from '@/app/stores/authStore';
import Modal from '../../Modal';
import Button from '../../Common/Button';
import Input from '../../Common/Inputs';
import TermsAcceptance from '../TermsAcceptance';
import { useTranslation } from '@/app/hooks/useTranslation';
import { Language } from '@/app/stores/useLanguageStore';
interface RegisterStep {
  step: 'form' | 'success' | 'confirmation-sent';
  userData?: {
    firstName?: string;
    email?: string;
    isLoggedIn?: boolean;
    registrationMethod?: 'credentials' | 'google';
  };
}
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
  const { t, language } = useTranslation({
    sections: ['components/auth-modals'],
  });

  const [registerStep, setRegisterStep] = useState<RegisterStep>({
    step: 'form',
  });
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

  // Verificar se retornou de um registro Google
  useEffect(() => {
    if (isOpen) {
      checkGoogleRegistrationReturn();
      checkUrlErrors();
    }
  }, [isOpen]);

  // Verificar retorno do registro Google
  const checkGoogleRegistrationReturn = () => {
    if (typeof window === 'undefined') return;

    // 🔧 VERIFICAR ERRO NA URL PRIMEIRO
    const currentUrl = new URL(window.location.href);
    const urlError = currentUrl.searchParams.get('error');

    if (urlError) {
      console.log(
        '❌ Erro na URL detectado, não processando como sucesso:',
        urlError
      );

      // Limpar todas as flags de sucesso em caso de erro
      sessionStorage.removeItem('google-register-pending');
      sessionStorage.removeItem('google-register-email');
      sessionStorage.removeItem('google-register-name');
      sessionStorage.removeItem('google-register-timestamp');

      // Não processar como sucesso - o checkUrlErrors() irá lidar com o erro
      return;
    }

    // Verificar flags apenas se NÃO há erro
    const googleRegisterFlag = sessionStorage.getItem(
      'google-register-pending'
    );
    const googleRegisterEmail = sessionStorage.getItem('google-register-email');
    const googleRegisterName = sessionStorage.getItem('google-register-name');
    const googleRegisterTimestamp = sessionStorage.getItem(
      'google-register-timestamp'
    );

    // 🔧 LÓGICA MAIS RIGOROSA: Só processar como sucesso se:
    // 1. Há flag de pending
    // 2. Há timestamp recente (últimos 5 minutos)
    // 3. NÃO há erro na URL
    // 4. Há dados válidos
    if (googleRegisterFlag === 'true' && googleRegisterTimestamp && !urlError) {
      const now = Date.now();
      const timestamp = parseInt(googleRegisterTimestamp);
      const timeDiff = now - timestamp;

      // Verificar se é recente (últimos 5 minutos)
      if (timeDiff < 5 * 60 * 1000) {
        console.log('✅ Retorno de registro Google válido detectado');

        // Limpar flags antes de processar
        sessionStorage.removeItem('google-register-pending');
        sessionStorage.removeItem('google-register-email');
        sessionStorage.removeItem('google-register-name');
        sessionStorage.removeItem('google-register-timestamp');

        // Mostrar tela de confirmação para usuário Google
        setRegisterStep({
          step: 'confirmation-sent',
          userData: {
            firstName: googleRegisterName || 'Usuário',
            email: googleRegisterEmail || '',
            isLoggedIn: true,
            registrationMethod: 'google',
          },
        });

        toast.success(t('register_modal_google_tip_registered'));
      } else {
        console.log('⏰ Timestamp muito antigo, limpando flags:', timeDiff);

        // Timestamp muito antigo - limpar flags
        sessionStorage.removeItem('google-register-pending');
        sessionStorage.removeItem('google-register-email');
        sessionStorage.removeItem('google-register-name');
        sessionStorage.removeItem('google-register-timestamp');
      }
    }
  };

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
    } else if (formData.password.length < 6) {
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

  const performAutoLogin = async (email: string, password: string) => {
    try {
      console.log('🔄 Fazendo login automático após registro...');

      const result = await signIn('credentials', {
        email: email.trim(),
        password: password,
        redirect: false,
      });

      if (result?.error) {
        console.error('❌ Erro no login automático:', result.error);
        toast.error(t('register_modal_auto_login_error'));
        return false;
      } else {
        console.log('✅ Login automático realizado com sucesso!');
        toast.success(t('register_modal_auto_login_success'));
        return true;
      }
    } catch (error) {
      console.error('❌ Erro no login automático:', error);
      toast.error(t('register_modal_auto_login_error'));
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setEmailConflictError(null);

    try {
      const result = await registerUser({
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });

      if (result.success) {
        const loginSuccess = await performAutoLogin(
          formData.email.trim(),
          formData.password
        );

        setRegisterStep({
          step: 'confirmation-sent',
          userData: {
            firstName: formData.username.trim(),
            email: formData.email.trim(),
            isLoggedIn: loginSuccess,
            registrationMethod: 'credentials',
          },
        });
      } else {
        if (
          result.message.includes('já existe') ||
          result.message.includes('já cadastrado')
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

    try {
      console.log('🔄 Iniciando registro com Google...');

      // Salvar flags no sessionStorage antes do redirect
      sessionStorage.setItem('google-register-pending', 'true');
      sessionStorage.setItem(
        'google-register-timestamp',
        Date.now().toString()
      );

      // Fazer o signIn com redirect
      const result = await signIn('google', {
        redirect: true,
        callbackUrl: window.location.origin + '/?google-register=true',
      });

      if (result?.error) {
        console.error('❌ Erro no Google SignUp:', result.error);

        // Limpar flags em caso de erro
        sessionStorage.removeItem('google-register-pending');
        sessionStorage.removeItem('google-register-timestamp');

        switch (result.error) {
          case 'Callback':
            setEmailConflictError(
              t('register_modal_email_conflict_credentials')
            );
            toast.error(t('register_modal_email_exists'));
            break;
          case 'OAuthCallback':
            toast.error(t('register_modal_google_oauth_error'));
            break;
          case 'OAuthSignin':
            toast.error(t('register_modal_google_signin_error'));
            break;
          case 'OAuthCreateAccount':
            setEmailConflictError(t('register_modal_email_conflict_google'));
            toast.error(t('register_modal_email_exists'));
            break;
          case 'EmailCreateAccount':
            setEmailConflictError(t('register_modal_email_conflict_google'));
            toast.error(t('register_modal_email_exists'));
            break;
          case 'AccessDenied':
            toast.error(t('register_modal_google_access_denied'));
            break;
          default:
            toast.error(t('register_modal_google_error'));
        }
      }
    } catch (error) {
      console.error('❌ Erro no Google SignUp:', error);

      // Limpar flags em caso de erro
      sessionStorage.removeItem('google-register-pending');
      sessionStorage.removeItem('google-register-timestamp');

      toast.error(t('register_modal_google_error'));
    } finally {
      setIsGoogleLoading(false);
    }
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
    setRegisterStep({ step: 'form' });
    close();
  };

  const handleBackToLogin = () => {
    handleClose();
    switchToLogin();
  };

  const handleProceedToOnboarding = () => {
    close();
    setTimeout(() => {
      openOnboarding();
    }, 300);
  };

  const renderConfirmationSent = () => (
    <>
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-accent-green to-accent-blue rounded-full flex items-center justify-center shadow-theme-glow animate-pulse">
            <FiCheckCircle className="w-8 h-8 text-white" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-theme-primary classical-title mb-2">
          {t('register_success_title')}
        </h2>
        <p className="text-theme-secondary">
          {registerStep.userData?.registrationMethod === 'google'
            ? t('register_success_subtitle_google')
            : t('register_success_subtitle_credentials')}
        </p>
      </div>

      <div className="space-y-6">
        {/* Status de login - não mostrar para usuários Google */}
        {!registerStep.userData?.isLoggedIn &&
          registerStep.userData?.registrationMethod !== 'google' && (
            <div className="bg-accent-amber bg-opacity-10 border border-accent-amber rounded-lg p-4">
              <div className="flex items-start">
                <FiAlertTriangle className="w-5 h-5 text-accent-amber mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-accent-amber mb-1">
                    {t('register_success_login_manual_title')}
                  </h4>
                  <p className="text-sm text-accent-amber opacity-80">
                    {t('register_success_login_manual_text')}
                  </p>
                </div>
              </div>
            </div>
          )}

        {/* Informações específicas para Google vs Email */}
        {registerStep.userData?.registrationMethod === 'google' ? (
          <div className="bg-accent-blue bg-opacity-10 border border-accent-blue rounded-lg p-4">
            <div className="flex items-start">
              <div>
                <h4 className="font-medium text-accent-blue mb-1">
                  {t('register_success_google_verified_title')}
                </h4>
                <p className="text-sm text-accent-blue opacity-80 mb-2">
                  {t('register_success_google_verified_text')}{' '}
                  <strong>{registerStep.userData?.email}</strong>
                </p>
                <div className="text-xs text-accent-blue opacity-70 space-y-1">
                  <p>{t('register_success_google_features')}</p>
                  <p>{t('register_success_google_immediate')}</p>
                  <p>{t('register_success_google_quick_login')}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-accent-blue bg-opacity-10 border border-accent-blue rounded-lg p-4">
            <div className="flex items-start">
              <div>
                <h4 className="font-medium text-accent-blue mb-1">
                  {t('register_success_email_sent_title')}
                </h4>
                <p className="text-sm text-accent-blue opacity-80 mb-2">
                  {t('register_success_email_sent_text')}{' '}
                  <strong>{registerStep.userData?.email}</strong>
                </p>
                <div className="text-xs text-accent-blue opacity-70 space-y-1">
                  <p>
                    • <strong>{t('register_success_email_normal_use')}</strong>
                  </p>
                  <p>
                    • <strong>{t('register_success_email_uploads')}</strong>
                  </p>
                  <p>
                    • <strong>{t('register_success_email_profile')}</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-theme-secondary rounded-lg p-4 space-y-3">
          <h4 className="text-sm font-medium text-theme-primary flex items-center">
            <FiCheckCircle className="w-4 h-4 mr-2" />
            {t('register_success_next_steps')}
          </h4>
          <ul className="text-sm text-theme-tertiary space-y-2">
            <li className="flex items-start">
              <span className="text-brand-primary mr-2 font-medium">1.</span>
              {t('register_success_step_1')}
            </li>
            <li className="flex items-start">
              <span className="text-brand-primary mr-2 font-medium">2.</span>
              {t('register_success_step_2')}
            </li>
            {registerStep.userData?.registrationMethod !== 'google' && (
              <li className="flex items-start">
                <span className="text-brand-primary mr-2 font-medium">3.</span>
                {t('register_success_step_3_credentials')}
              </li>
            )}
            <li className="flex items-start">
              <span className="text-brand-primary mr-2 font-medium">
                {registerStep.userData?.registrationMethod === 'google'
                  ? '3.'
                  : '4.'}
              </span>
              {registerStep.userData?.registrationMethod === 'google'
                ? t('register_success_step_3_google')
                : t('register_success_step_4_credentials')}
            </li>
          </ul>
        </div>

        <div className="space-y-3">
          {registerStep.userData?.isLoggedIn ? (
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={handleProceedToOnboarding}
            >
              {t('register_success_complete_profile_button')}
            </Button>
          ) : (
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={handleBackToLogin}
            >
              {t('register_success_login_button')}
            </Button>
          )}

          <Button
            variant="ghost"
            size="lg"
            className="w-full"
            onClick={handleClose}
          >
            {registerStep.userData?.isLoggedIn
              ? t('register_success_explore_button')
              : t('register_success_close_button')}
          </Button>
        </div>

        {/* Informação adicional - adaptada para Google */}
        <div className="text-center pt-4 border-t border-theme-secondary">
          {registerStep.userData?.registrationMethod === 'google' ? (
            <p className="text-xs text-theme-tertiary">
              {t('register_success_google_tip')}
            </p>
          ) : (
            <p className="text-xs text-theme-tertiary">
              {t('register_success_email_tip')}
              <br />
              {t('register_success_email_tip_2')}
            </p>
          )}
        </div>
      </div>
    </>
  );

  const renderRegistrationForm = () => (
    <>
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-brand-gradient rounded-full flex items-center justify-center shadow-theme-glow">
            <GiGrandPiano className="w-8 h-8 text-theme-primary" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-theme-primary classical-title mb-2">
          {t('register_modal_title')}
        </h2>
        <p className="text-theme-secondary">{t('register_modal_subtitle')}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {errors.general && (
          <div className="p-3 rounded-lg bg-accent-red bg-opacity-10 border border-accent-red text-accent-red text-sm">
            {errors.general}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4">
          <div>
            <Input
              label={t('register_modal_username_label')}
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              leftIcon={<FiUser className="w-4 h-4" />}
              placeholder={t('register_modal_username_placeholder')}
              error={errors.username}
              disabled={isLoading || isGoogleLoading}
              autoComplete="username"
            />
            <p className="text-xs text-theme-tertiary mt-1">
              {t('register_modal_username_hint')}
            </p>
          </div>
        </div>

        <Input
          label={t('register_modal_email_label')}
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          leftIcon={<FiMail className="w-4 h-4" />}
          placeholder={t('register_modal_email_placeholder')}
          error={errors.email || emailConflictError}
          disabled={isLoading || isGoogleLoading}
          autoComplete="email"
        />

        <Input
          label={t('register_modal_password_label')}
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          leftIcon={<FiLock className="w-4 h-4" />}
          placeholder={t('register_modal_password_placeholder')}
          isPassword
          error={errors.password}
          disabled={isLoading || isGoogleLoading}
          autoComplete="new-password"
        />

        <Input
          label={t('register_modal_confirm_password_label')}
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleInputChange}
          leftIcon={<FiLock className="w-4 h-4" />}
          placeholder={t('register_modal_confirm_password_placeholder')}
          isPassword
          error={errors.confirmPassword}
          disabled={isLoading || isGoogleLoading}
          autoComplete="new-password"
        />

        {/* 🆕 NOVO: Componente de Aceitação de Termos */}
        <TermsAcceptance
          accepted={termsAccepted}
          onChange={setTermsAccepted}
          error={errors.terms}
          disabled={isLoading || isGoogleLoading}
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isLoading}
          className="w-full"
          disabled={isGoogleLoading}
        >
          {t('register_modal_submit_button')}
        </Button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-theme-secondary" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-theme-elevated text-theme-tertiary">
            {t('register_modal_divider_text')}
          </span>
        </div>
      </div>

      <Button
        variant="google"
        size="lg"
        onClick={handleGoogleSignIn}
        isLoading={isGoogleLoading}
        leftIcon={<FcGoogle />}
        className="w-full"
        disabled={isLoading}
      >
        {t('register_modal_google_button')}
      </Button>

      <div className="mt-8 text-center">
        <p className="text-theme-secondary">
          {t('register_modal_login_text')}{' '}
          <button
            onClick={switchToLogin}
            className="text-brand-primary hover:text-brand-secondary font-medium transition-colors"
            disabled={isLoading || isGoogleLoading}
          >
            {t('register_modal_login_link')}
          </button>
        </p>
      </div>
    </>
  );

  const renderContent = () => {
    switch (registerStep.step) {
      case 'confirmation-sent':
        return renderConfirmationSent();
      case 'form':
      default:
        return renderRegistrationForm();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      maxWidth="xl"
      showCloseButton={true}
      setPr
    >
      {renderContent()}
    </Modal>
  );
};

export default RegisterModal;
