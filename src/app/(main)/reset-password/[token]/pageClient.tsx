// app/reset-password/[token]/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  FiLock,
  FiEye,
  FiEyeOff,
  FiCheckCircle,
  FiAlertCircle,
  FiLoader,
  FiArrowRight,
  FiClock,
} from 'react-icons/fi';
import { GiGrandPiano } from 'react-icons/gi';
import Button from '@/app/components/Common/Button';
import Input from '@/app/components/Common/Inputs';
import Link from 'next/link';
import {
  usePasswordReset,
  useResetPasswordForm,
} from '@/app/hooks/usePasswordReset';
import { useTranslation } from '@/app/context/TranslationContext';

interface ResetPageState {
  step: 'validating' | 'form' | 'success' | 'error';
  tokenData?: {
    email: string;
    firstName: string;
    expiresAt: string;
    minutesLeft: number;
  };
  errorCode?: string;
}

export default function ResetPasswordPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;
  const { t } = useTranslation({ sections: ['pages/reset-password'] });

  const [pageState, setPageState] = useState<ResetPageState>({
    step: 'validating',
  });

  const {
    loading,
    error,
    validateResetToken,
    resetPassword,
    validatePasswordStrength,
    getPasswordStrengthColor,
    getPasswordStrengthText,
  } = usePasswordReset();

  const {
    formData,
    showPassword,
    showConfirmPassword,
    updateField,
    setShowPassword,
    setShowConfirmPassword,
    validateForm,
    resetForm,
  } = useResetPasswordForm();

  useEffect(() => {
    if (!token) {
      setPageState({
        step: 'error',
        errorCode: 'NO_TOKEN',
      });
      return;
    }

    validateToken();
  }, [token]);

  const validateToken = async () => {
    const result = await validateResetToken(token);

    if (result.valid && result.user) {
      setPageState({
        step: 'form',
        tokenData: result.user,
      });
    } else {
      setPageState({
        step: 'error',
        errorCode: result.errorCode,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formValidation = validateForm();
    if (!formValidation.valid) {
      return;
    }

    const passwordValidation = validatePasswordStrength(formData.password);
    if (!passwordValidation.valid) {
      return;
    }

    const result = await resetPassword({
      token,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
    });

    if (result.success) {
      setPageState({ step: 'success' });
      resetForm();

      // Redirecionar para login após sucesso
      setTimeout(() => {
        router.push('/?login=true');
      }, 5000);
    }
  };

  const getTimeLeftDisplay = (
    minutesLeft: number
  ): { text: string; color: string } => {
    if (minutesLeft > 30) {
      return {
        text: t('time_minutes').replace('{count}', minutesLeft.toString()),
        color: 'text-accent-green',
      };
    } else if (minutesLeft > 10) {
      return {
        text: t('time_minutes').replace('{count}', minutesLeft.toString()),
        color: 'text-accent-amber',
      };
    } else {
      return {
        text: t('time_minutes').replace('{count}', minutesLeft.toString()),
        color: 'text-accent-red',
      };
    }
  };

  const renderValidatingStep = () => (
    <div className="text-center">
      <div className="w-20 h-20 bg-gradient-to-br from-brand-primary to-accent-purple rounded-full flex items-center justify-center mx-auto mb-6 shadow-theme-glow animate-pulse">
        <FiLoader className="w-10 h-10 text-white animate-spin" />
      </div>
      <h1 className="text-3xl font-bold text-theme-primary classical-title mb-4">
        {t('validating_title')}
      </h1>
      <p className="text-theme-secondary text-lg">{t('validating_subtitle')}</p>
    </div>
  );

  const renderFormStep = () => {
    const passwordStrength = validatePasswordStrength(formData.password);
    const formValidation = validateForm();
    const timeLeft = pageState.tokenData
      ? getTimeLeftDisplay(pageState.tokenData.minutesLeft)
      : null;

    return (
      <>
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-accent-red to-accent-amber rounded-full flex items-center justify-center mx-auto mb-4 shadow-theme-glow">
            <FiLock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-theme-primary classical-title mb-2">
            {t('form_title')}
          </h1>
          <p className="text-theme-secondary">
            {t('form_subtitle').replace(
              '{firstName}',
              pageState.tokenData?.firstName || ''
            )}
          </p>
        </div>

        {/* Informações do Token */}
        {pageState.tokenData && (
          <div className="bg-theme-secondary rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-theme-tertiary">
                  {t('reset_for_label')}
                </p>
                <p className="font-medium text-theme-primary">
                  {pageState.tokenData.email}
                </p>
              </div>
              {timeLeft && (
                <div className="text-right">
                  <div className="flex items-center">
                    <FiClock className="w-4 h-4 text-theme-tertiary mr-1" />
                    <span className={`text-sm font-medium ${timeLeft.color}`}>
                      {timeLeft.text}
                    </span>
                  </div>
                  <p className="text-xs text-theme-tertiary">
                    {t('time_remaining_label')}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Erro geral */}
          {error && (
            <div className="p-3 rounded-lg bg-accent-red bg-opacity-10 border border-accent-red text-accent-red text-sm">
              <div className="flex items-center">
                <FiAlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Nova Senha */}
          <div>
            <Input
              label={t('password_label')}
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={(e) => updateField('password', e.target.value)}
              leftIcon={<FiLock className="w-4 h-4" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-theme-tertiary hover:text-theme-primary"
                >
                  {showPassword ? (
                    <FiEyeOff className="w-4 h-4" />
                  ) : (
                    <FiEye className="w-4 h-4" />
                  )}
                </button>
              }
              placeholder={t('password_placeholder')}
              disabled={loading}
              autoComplete="new-password"
            />

            {/* Indicador de força da senha */}
            {formData.password && (
              <div className="mt-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-theme-tertiary">
                    {t('password_strength_label')}
                  </span>
                  <span
                    className={`font-medium ${getPasswordStrengthColor(
                      passwordStrength.score
                    )}`}
                  >
                    {getPasswordStrengthText(passwordStrength.score)}
                  </span>
                </div>
                <div className="mt-1 w-full bg-theme-secondary rounded-full h-2">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      passwordStrength.score <= 2
                        ? 'bg-accent-red'
                        : passwordStrength.score <= 3
                        ? 'bg-accent-amber'
                        : passwordStrength.score <= 4
                        ? 'bg-accent-blue'
                        : 'bg-accent-green'
                    }`}
                    style={{ width: `${(passwordStrength.score / 6) * 100}%` }}
                  ></div>
                </div>
                {passwordStrength.errors.length > 0 && (
                  <ul className="mt-2 text-xs text-accent-red space-y-1">
                    {passwordStrength.errors.map((error, index) => (
                      <li key={index} className="flex items-center">
                        <span className="w-1 h-1 bg-accent-red rounded-full mr-2"></span>
                        {error}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* Confirmar Senha */}
          <div>
            <Input
              label={t('confirm_password_label')}
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={(e) => updateField('confirmPassword', e.target.value)}
              leftIcon={<FiLock className="w-4 h-4" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-theme-tertiary hover:text-theme-primary"
                >
                  {showConfirmPassword ? (
                    <FiEyeOff className="w-4 h-4" />
                  ) : (
                    <FiEye className="w-4 h-4" />
                  )}
                </button>
              }
              placeholder={t('confirm_password_placeholder')}
              disabled={loading}
              autoComplete="new-password"
              error={
                formData.confirmPassword &&
                formData.password !== formData.confirmPassword
                  ? t('passwords_no_match')
                  : undefined
              }
            />
          </div>

          {/* Dicas de Segurança */}
          <div className="bg-accent-blue bg-opacity-10 border border-accent-blue rounded-lg p-4">
            <h4 className="text-sm font-medium text-accent-blue mb-2">
              {t('security_tips_title')}
            </h4>
            <ul className="text-xs text-accent-blue opacity-80 space-y-1">
              <li>{t('security_tip_1')}</li>
              <li>{t('security_tip_2')}</li>
              <li>{t('security_tip_3')}</li>
              <li>{t('security_tip_4')}</li>
            </ul>
          </div>

          {/* Botão de Submissão */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={loading}
            disabled={!passwordStrength.valid || !formValidation.valid}
            className="w-full"
          >
            {loading ? t('submit_button_loading') : t('submit_button')}
          </Button>
        </form>

        {/* Link para voltar ao login */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm text-theme-tertiary hover:text-brand-primary transition-colors"
          >
            {t('back_to_login_link')}
          </Link>
        </div>
      </>
    );
  };

  const renderSuccessStep = () => (
    <div className="text-center">
      <div className="w-20 h-20 bg-gradient-to-br from-accent-green to-accent-blue rounded-full flex items-center justify-center mx-auto mb-6 shadow-theme-glow animate-bounce">
        <FiCheckCircle className="w-10 h-10 text-white" />
      </div>
      <h1 className="text-3xl font-bold text-theme-primary classical-title mb-4">
        {t('success_title')}
      </h1>
      <p className="text-theme-secondary text-lg mb-6">
        {t('success_subtitle')}
      </p>

      <div className="bg-accent-green bg-opacity-10 border border-accent-green rounded-xl p-6 mb-8">
        <h3 className="text-xl font-semibold text-accent-green mb-2">
          {t('success_all_done')}
        </h3>
        <p className="text-accent-green opacity-80">
          {t('success_description')}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Button
          variant="primary"
          size="lg"
          rightIcon={<FiArrowRight />}
          onClick={() => router.push('/?login=true')}
          className="animate-pulse"
        >
          {t('login_button')}
        </Button>

        <Button variant="ghost" size="lg" onClick={() => router.push('/')}>
          {t('go_to_site_button')}
        </Button>
      </div>

      <div className="mt-8 text-sm text-theme-tertiary">
        {t('success_redirect_message')}
      </div>
    </div>
  );

  const renderErrorStep = () => (
    <div className="text-center">
      <div className="w-20 h-20 bg-gradient-to-br from-accent-red to-accent-amber rounded-full flex items-center justify-center mx-auto mb-6 shadow-theme-glow">
        <FiAlertCircle className="w-10 h-10 text-white" />
      </div>
      <h1 className="text-3xl font-bold text-theme-primary classical-title mb-4">
        {t('error_title')}
      </h1>
      <p className="text-theme-secondary text-lg mb-6">
        {getErrorMessage(pageState.errorCode)}
      </p>

      <div className="bg-accent-red bg-opacity-10 border border-accent-red rounded-xl p-6 mb-8">
        <div className="flex items-center justify-center mb-3">
          <FiAlertCircle className="w-5 h-5 text-accent-red mr-2" />
          <span className="font-medium text-accent-red">
            {getErrorTitle(pageState.errorCode)}
          </span>
        </div>
        <p className="text-accent-red opacity-80 text-sm">
          {getErrorDescription(pageState.errorCode)}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Button
          variant="primary"
          size="lg"
          onClick={() => router.push('/?forgot-password=true')}
        >
          {t('request_new_reset_button')}
        </Button>

        <Button variant="ghost" size="lg" onClick={() => router.push('/')}>
          {t('back_to_login_button')}
        </Button>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (pageState.step) {
      case 'validating':
        return renderValidatingStep();
      case 'form':
        return renderFormStep();
      case 'success':
        return renderSuccessStep();
      case 'error':
        return renderErrorStep();
      default:
        return renderValidatingStep();
    }
  };

  // Funções auxiliares para mensagens de erro
  function getErrorMessage(errorCode?: string): string {
    switch (errorCode) {
      case 'EXPIRED_TOKEN':
        return t('error_expired_token_message');
      case 'USED_TOKEN':
        return t('error_used_token_message');
      case 'INVALID_TOKEN':
        return t('error_invalid_token_message');
      case 'NO_TOKEN':
        return t('error_no_token_message');
      default:
        return t('error_subtitle');
    }
  }

  function getErrorTitle(errorCode?: string): string {
    switch (errorCode) {
      case 'EXPIRED_TOKEN':
        return t('error_expired_token_title');
      case 'USED_TOKEN':
        return t('error_used_token_title');
      case 'INVALID_TOKEN':
        return t('error_invalid_token_title');
      case 'NO_TOKEN':
        return t('error_no_token_title');
      default:
        return t('error_default_title');
    }
  }

  function getErrorDescription(errorCode?: string): string {
    switch (errorCode) {
      case 'EXPIRED_TOKEN':
        return t('error_expired_token_description');
      case 'USED_TOKEN':
        return t('error_used_token_description');
      case 'INVALID_TOKEN':
        return t('error_invalid_token_description');
      case 'NO_TOKEN':
        return t('error_no_token_description');
      default:
        return t('error_default_description');
    }
  }

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
                Opus Atlas
              </span>
            </Link>
          </div>

          {/* Content */}
          {renderContent()}

          {/* Footer */}
          <div className="mt-12 pt-8 border-t border-theme-secondary text-center">
            <p className="text-sm text-theme-tertiary">
              {t('need_help')}{' '}
              <Link
                href="/support"
                className="text-brand-primary hover:underline"
              >
                {t('contact_support')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
