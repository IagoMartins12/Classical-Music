// components/authModals/ForgotPasswordModal.tsx
'use client';

import React, { useState } from 'react';
import {
  FiMail,
  FiArrowLeft,
  FiCheckCircle,
  FiAlertCircle,
  FiClock,
} from 'react-icons/fi';
import Button from '../../Common/Button';
import Input from '../../Common/Inputs';
import Modal from '../../Modal';
import { useTranslation } from '@/app/hooks/useTranslation';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBackToLogin: () => void;
}

interface ForgotPasswordState {
  step: 'email' | 'success' | 'error';
  email: string;
  isLoading: boolean;
  error: string | null;
  remainingAttempts?: number;
  rateLimited: boolean;
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  onBackToLogin,
}) => {
  const { t } = useTranslation({ sections: ['components/auth-modals'] });
  const [state, setState] = useState<ForgotPasswordState>({
    step: 'email',
    email: '',
    isLoading: false,
    error: null,
    rateLimited: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setState((prev) => ({
      ...prev,
      email: e.target.value,
      error: null, // Limpar erro quando usuário digita
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!state.email.trim()) {
      setState((prev) => ({
        ...prev,
        error: t('forgot_password_modal_email_required'),
      }));
      return;
    }

    // Validar formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(state.email)) {
      setState((prev) => ({
        ...prev,
        error: t('forgot_password_modal_email_invalid'),
      }));
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: state.email.trim(),
        }),
      });

      const result = await response.json();

      if (result.success) {
        setState((prev) => ({
          ...prev,
          step: 'success',
          isLoading: false,
          remainingAttempts: result.remainingAttempts,
        }));
      } else {
        // Tratar rate limiting
        if (response.status === 429) {
          setState((prev) => ({
            ...prev,
            step: 'error',
            error: result.error,
            isLoading: false,
            rateLimited: true,
            remainingAttempts: result.remainingAttempts,
          }));
        } else {
          setState((prev) => ({
            ...prev,
            error: result.error || 'Erro ao processar solicitação',
            isLoading: false,
          }));
        }
      }
    } catch (error) {
      console.error('Erro ao solicitar reset de senha:', error);
      setState((prev) => ({
        ...prev,
        error: t('forgot_password_modal_connection_error'),
        isLoading: false,
      }));
    }
  };

  const handleClose = () => {
    // Resetar estado ao fechar
    setState({
      step: 'email',
      email: '',
      isLoading: false,
      error: null,
      rateLimited: false,
    });
    onClose();
  };

  const handleBackToLogin = () => {
    handleClose();
    onBackToLogin();
  };

  const renderEmailStep = () => (
    <>
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-accent-amber to-accent-red rounded-full flex items-center justify-center shadow-theme-glow">
            <FiMail className="w-8 h-8 text-white" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-theme-primary classical-title mb-2">
          {t('forgot_password_modal_title')}
        </h2>
        <p className="text-theme-secondary">
          {t('forgot_password_modal_subtitle')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {state.error && (
          <div className="p-3 rounded-lg bg-accent-red bg-opacity-10 border border-accent-red text-accent-red text-sm">
            <div className="flex items-center">
              <FiAlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
              <span>{state.error}</span>
            </div>
          </div>
        )}

        <Input
          label={t('forgot_password_modal_email_label')}
          type="email"
          name="email"
          value={state.email}
          onChange={handleInputChange}
          leftIcon={<FiMail className="w-4 h-4" />}
          placeholder={t('forgot_password_modal_email_placeholder')}
          disabled={state.isLoading}
          autoComplete="email"
          autoFocus
        />

        <div className="space-y-4">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={state.isLoading}
            className="w-full"
          >
            {state.isLoading
              ? t('forgot_password_modal_submit_loading')
              : t('forgot_password_modal_submit_button')}
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="lg"
            className="w-full items-center justify-center flex"
            leftIcon={<FiArrowLeft />}
            onClick={handleBackToLogin}
            disabled={state.isLoading}
          >
            {t('forgot_password_modal_back_button')}
          </Button>
        </div>
      </form>

      <div className="mt-6 text-center">
        <div className="bg-theme-secondary rounded-lg p-4">
          <h4 className="text-sm font-medium text-theme-primary mb-2">
            {t('forgot_password_modal_security_tip_title')}
          </h4>
          <p className="text-xs text-theme-tertiary">
            {t('forgot_password_modal_security_tip_text')}
          </p>
        </div>
      </div>
    </>
  );

  const renderSuccessStep = () => (
    <>
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-accent-green to-accent-blue rounded-full flex items-center justify-center shadow-theme-glow">
            <FiCheckCircle className="w-8 h-8 text-white" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-theme-primary classical-title mb-2">
          {t('forgot_password_success_title')}
        </h2>
        <p className="text-theme-secondary">
          {t('forgot_password_success_subtitle')}
        </p>
      </div>

      <div className="space-y-6">
        <div className="bg-accent-green bg-opacity-10 border border-accent-green rounded-lg p-4">
          <div className="flex items-start">
            <FiMail className="w-5 h-5 text-accent-green mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-accent-green mb-1">
                {t('forgot_password_success_check_title')}
              </h4>
              <p className="text-sm text-accent-green opacity-80">
                {t('forgot_password_success_check_text')}{' '}
                <strong>{state.email}</strong>
              </p>
            </div>
          </div>
        </div>

        <div className="bg-theme-secondary rounded-lg p-4 space-y-3">
          <h4 className="text-sm font-medium text-theme-primary flex items-center">
            <FiClock className="w-4 h-4 mr-2" />
            {t('forgot_password_success_steps_title')}
          </h4>
          <ul className="text-sm text-theme-tertiary space-y-2">
            <li className="flex items-start">
              <span className="text-brand-primary mr-2">1.</span>
              {t('forgot_password_success_step_1')}
            </li>
            <li className="flex items-start">
              <span className="text-brand-primary mr-2">2.</span>
              {t('forgot_password_success_step_2')}
            </li>
            <li className="flex items-start">
              <span className="text-brand-primary mr-2">3.</span>
              {t('forgot_password_success_step_3')}
            </li>
          </ul>
        </div>

        {state.remainingAttempts !== undefined &&
          state.remainingAttempts < 5 && (
            <div className="bg-accent-amber bg-opacity-10 border border-accent-amber rounded-lg p-3">
              <div className="flex items-center">
                <FiAlertCircle className="w-4 h-4 text-accent-amber mr-2" />
                <span className="text-sm text-accent-amber">
                  {t('forgot_password_success_attempts_warning')}{' '}
                  {state.remainingAttempts}{' '}
                  {t('forgot_password_success_attempts_text')}
                </span>
              </div>
            </div>
          )}

        <div className="space-y-3">
          <Button
            variant="ghost"
            size="lg"
            className="w-full"
            leftIcon={<FiArrowLeft />}
            onClick={handleBackToLogin}
          >
            {t('forgot_password_modal_back_button')}
          </Button>

          <button
            onClick={handleClose}
            className="w-full text-sm text-theme-tertiary hover:text-theme-primary transition-colors"
          >
            {t('forgot_password_success_close_button')}
          </button>
        </div>
      </div>
    </>
  );

  const renderErrorStep = () => (
    <>
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-accent-red to-accent-amber rounded-full flex items-center justify-center shadow-theme-glow">
            <FiAlertCircle className="w-8 h-8 text-white" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-theme-primary classical-title mb-2">
          {state.rateLimited
            ? t('forgot_password_error_title_rate_limit')
            : t('forgot_password_error_title_general')}
        </h2>
        <p className="text-theme-secondary">
          {state.rateLimited
            ? t('forgot_password_error_subtitle_rate_limit')
            : t('forgot_password_error_subtitle_general')}
        </p>
      </div>

      <div className="space-y-6">
        <div className="bg-accent-red bg-opacity-10 border border-accent-red rounded-lg p-4">
          <div className="flex items-start">
            <FiAlertCircle className="w-5 h-5 text-accent-red mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-accent-red mb-1">
                {state.rateLimited
                  ? t('forgot_password_error_rate_limit_title')
                  : t('forgot_password_error_general_title')}
              </h4>
              <p className="text-sm text-accent-red opacity-80">
                {state.error}
              </p>
            </div>
          </div>
        </div>

        {state.rateLimited && (
          <div className="bg-theme-secondary rounded-lg p-4">
            <h4 className="text-sm font-medium text-theme-primary mb-2">
              {t('forgot_password_error_what_to_do')}
            </h4>
            <ul className="text-sm text-theme-tertiary space-y-1">
              <li>{t('forgot_password_error_wait')}</li>
              <li>{t('forgot_password_error_check_email')}</li>
              <li>{t('forgot_password_error_contact')}</li>
            </ul>
          </div>
        )}

        <div className="space-y-3">
          {!state.rateLimited && (
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={() =>
                setState((prev) => ({ ...prev, step: 'email', error: null }))
              }
            >
              {t('forgot_password_error_try_again_button')}
            </Button>
          )}

          <Button
            variant="ghost"
            size="lg"
            className="w-full"
            leftIcon={<FiArrowLeft />}
            onClick={handleBackToLogin}
          >
            {t('forgot_password_modal_back_button')}
          </Button>
        </div>
      </div>
    </>
  );

  const renderContent = () => {
    switch (state.step) {
      case 'email':
        return renderEmailStep();
      case 'success':
        return renderSuccessStep();
      case 'error':
        return renderErrorStep();
      default:
        return renderEmailStep();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      maxWidth="lg"
      showCloseButton={true}
    >
      {renderContent()}
    </Modal>
  );
};

export default ForgotPasswordModal;
