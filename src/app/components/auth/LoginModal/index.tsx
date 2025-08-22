// components/authModals/LoginModal.tsx - VERSÃO COM TRATAMENTO DE ERROS MELHORADO E TRADUÇÕES
'use client';

import React, { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { FiMail, FiLock, FiAlertTriangle } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { GiGrandPiano } from 'react-icons/gi';
import { useRouter } from 'next/navigation';

import { toast } from 'react-hot-toast';
import { useLoginModal } from '@/app/stores/authStore';
import Modal from '../../Modal';
import Button from '../../Common/Button';
import Input from '../../Common/Inputs';
import { useTranslation } from '@/app/hooks/useTranslation';
import ForgotPasswordModal from '../ForgotPasswordModal';

const LoginModal: React.FC = () => {
  const { isOpen, close, switchToRegister } = useLoginModal();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const router = useRouter();
  const { t } = useTranslation({ sections: ['components/auth-modals'] });

  // Estado para erro específico de conflito de email
  const [emailConflictError, setEmailConflictError] = useState<string | null>(
    null
  );

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // 🆕 NOVO: Verificar erros na URL quando o modal abrir
  useEffect(() => {
    checkUrlErrors();
  }, [isOpen]);

  // 🆕 NOVO: Função para verificar e processar erros na URL
  const checkUrlErrors = () => {
    if (typeof window === 'undefined') return;

    const currentUrl = new URL(window.location.href);
    const error = currentUrl.searchParams.get('error');
    const errorDescription = currentUrl.searchParams.get('error_description');

    if (error) {
      console.log('🔍 Erro detectado na URL:', { error, errorDescription });

      // Processar diferentes tipos de erro
      let errorMessage = '';
      let shouldShowConflictError = false;

      switch (error) {
        case 'Callback':
          errorMessage = t('login_modal_email_conflict_credentials');
          shouldShowConflictError = true;
          break;
        case 'OAuthCallback':
          errorMessage = t('login_modal_google_oauth_error');
          break;
        case 'OAuthSignin':
          errorMessage = t('login_modal_google_signin_error');
          break;
        case 'OAuthCreateAccount':
          errorMessage = t('login_modal_email_conflict_google');
          shouldShowConflictError = true;
          break;
        case 'EmailCreateAccount':
          errorMessage = t('register_modal_email_exists');
          shouldShowConflictError = true;
          break;
        case 'Signin':
          errorMessage = t('login_modal_credentials_error');
          break;
        case 'SessionRequired':
          errorMessage = t('login_modal_session_expired');
          break;
        case 'AccessDenied':
          errorMessage = t('login_modal_google_access_denied');
          break;
        case 'Verification':
          errorMessage = t('login_modal_verification_error');
          break;
        default:
          // Usar error_description se disponível
          errorMessage = errorDescription || t('login_modal_google_error');
      }

      // Mostrar erro apropriado
      if (shouldShowConflictError) {
        setEmailConflictError(errorMessage);
      } else {
        toast.error(errorMessage);
      }

      // 🆕 NOVO: Limpar URL dos parâmetros de erro
      const cleanUrl = new URL(window.location.href);
      cleanUrl.searchParams.delete('error');
      cleanUrl.searchParams.delete('error_description');
      cleanUrl.searchParams.delete('code');
      cleanUrl.searchParams.delete('state');

      // Atualizar URL sem recarregar a página
      window.history.replaceState({}, '', cleanUrl.toString());
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }

    // Limpar erro de conflito ao digitar
    if (emailConflictError) {
      setEmailConflictError(null);
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.email.trim()) {
      newErrors.email = t('login_modal_email_required');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('login_modal_email_invalid');
    }

    if (!formData.password.trim()) {
      newErrors.password = t('login_modal_password_required');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setEmailConflictError(null); // Limpar erro anterior

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setErrors({ general: t('login_modal_credentials_error') });
        toast.error(t('login_modal_credentials_error'));
      } else {
        toast.success(t('login_modal_success'));
        close();
        router.refresh();
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrors({ general: t('login_modal_internal_error') });
      toast.error(t('login_modal_internal_error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setEmailConflictError(null); // Limpar erro anterior

    try {
      console.log('🔄 Iniciando login com Google...');

      const result = await signIn('google', {
        redirect: false,
        callbackUrl: '/',
      });

      console.log('📊 Resultado do Google SignIn:', result);

      if (result?.error) {
        console.error('❌ Erro no Google SignIn:', result.error);

        // Tratar erros específicos do Google
        switch (result.error) {
          case 'Callback':
            setEmailConflictError(t('login_modal_email_conflict_credentials'));
            toast.error(t('register_modal_email_exists'));
            break;
          case 'OAuthCallback':
            toast.error(t('login_modal_google_oauth_error'));
            break;
          case 'OAuthSignin':
            toast.error(t('login_modal_google_signin_error'));
            break;
          case 'OAuthCreateAccount':
            setEmailConflictError(t('login_modal_email_conflict_google'));
            toast.error(t('register_modal_email_exists'));
            break;
          case 'EmailCreateAccount':
            setEmailConflictError(t('login_modal_email_conflict_google'));
            toast.error(t('register_modal_email_exists'));
            break;
          case 'AccessDenied':
            toast.error(t('login_modal_google_access_denied'));
            break;
          default:
            toast.error(t('login_modal_google_error'));
        }
      } else if (result?.url) {
        // Login bem-sucedido
        console.log('✅ Login Google bem-sucedido, redirecionando...');
        toast.success(t('login_modal_success'));
        close();

        // Redirecionar ou recarregar
        if (result.url !== window.location.href) {
          router.push(result.url);
        } else {
          router.refresh();
        }
      } else {
        // Caso não tenha erro nem URL, assume sucesso
        close();
        router.refresh();
      }
    } catch (error) {
      console.error('❌ Erro no Google SignIn:', error);
      toast.error(t('login_modal_google_error'));
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ email: '', password: '' });
    setErrors({});
    setEmailConflictError(null); // Limpar erro de conflito
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
        isOpen={isOpen}
        onClose={handleClose}
        maxWidth="lg"
        showCloseButton={true}
      >
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-brand-gradient rounded-full flex items-center justify-center shadow-theme-glow">
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
          <div className="mb-6 p-4 rounded-lg bg-accent-amber bg-opacity-10 border border-accent-amber">
            <div className="flex items-start">
              <FiAlertTriangle className="w-5 h-5 text-accent-amber mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-accent-amber mb-1">
                  {t('login_modal_email_conflict_title')}
                </h4>
                <p className="text-sm text-accent-amber opacity-90">
                  {emailConflictError}
                </p>
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
                    className="text-xs text-accent-amber hover:text-accent-amber opacity-80 hover:opacity-100 underline transition-opacity"
                  >
                    {t('login_modal_email_conflict_action_login')}
                  </button>
                  <span className="text-xs text-accent-amber opacity-50">
                    •
                  </span>
                  <button
                    onClick={handleForgotPassword}
                    className="text-xs text-accent-amber hover:text-accent-amber opacity-80 hover:opacity-100 underline transition-opacity"
                  >
                    {t('login_modal_email_conflict_action_forgot')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Email/Password Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* General Error */}
          {errors.general && (
            <div className="p-3 rounded-lg bg-accent-red bg-opacity-10 border border-accent-red text-accent-red text-sm">
              {errors.general}
            </div>
          )}

          {/* Email */}
          <Input
            label={t('login_modal_email_label')}
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            leftIcon={<FiMail className="w-4 h-4" />}
            placeholder={t('login_modal_email_placeholder')}
            error={errors.email}
            disabled={isLoading || isGoogleLoading}
            autoComplete="email"
          />

          {/* Password */}
          <Input
            label={t('login_modal_password_label')}
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            leftIcon={<FiLock className="w-4 h-4" />}
            placeholder={t('login_modal_password_placeholder')}
            isPassword
            error={errors.password}
            disabled={isLoading || isGoogleLoading}
            autoComplete="current-password"
          />

          {/* Forgot Password Link */}
          <div className="text-right">
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-sm text-brand-primary hover:text-brand-secondary transition-colors"
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
        </form>

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
              className="text-brand-primary hover:text-brand-secondary font-medium transition-colors"
              disabled={isLoading || isGoogleLoading}
            >
              {t('login_modal_register_link')}
            </button>
          </p>
        </div>

        {/* Terms */}
        <div className="mt-6 text-center">
          <p className="text-xs text-theme-tertiary">
            {t('login_modal_terms_text')}{' '}
            <a href="/terms" className="text-brand-primary hover:underline">
              {t('login_modal_terms_link')}
            </a>{' '}
            {t('login_modal_terms_and')}{' '}
            <a href="/privacy" className="text-brand-primary hover:underline">
              {t('login_modal_privacy_link')}
            </a>
          </p>
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
