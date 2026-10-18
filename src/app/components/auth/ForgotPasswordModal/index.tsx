// components/authModals/ForgotPasswordModal.tsx
'use client';

import { AUTH } from '@/app/conteudo/textos/auth';
import { useTextos } from '@/app/hooks/useTextos';
import React, { useState } from 'react';
import { PiArrowLeft, PiEnvelopeSimple } from 'react-icons/pi';
import { Button } from '@/app/components/ui/Button';
import { Field } from '@/app/components/ui/Field';
import { Icon } from '@/app/components/ui/Icon';
import { Sheet } from '@/app/components/ui/Sheet';
import { legacyAuth } from '@/app/libs/api/compat';
import { AvisoDeAuth } from '../pecas';

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
  const { t } = useTextos(AUTH);
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
      const result = await legacyAuth.forgotPassword(state.email.trim());
      const response = { status: result.rateLimited ? 429 : 200 };

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

  const voltar = (
    <Button
      type="button"
      variante="fantasma"
      icone={PiArrowLeft}
      onClick={handleBackToLogin}
      disabled={state.isLoading}
      className="w-full"
    >
      {t('forgot_password_modal_back_button')}
    </Button>
  );

  const numerados = (itens: string[]) => (
    <ol className="flex flex-col gap-2">
      {itens.map((item, n) => (
        <li key={item} className="flex gap-3 t-rotulo text-texto-suave">
          <span className="font-display text-ouro-texto">{n + 1}.</span>
          {item}
        </li>
      ))}
    </ol>
  );

  const emailStep = (
    <div className="flex flex-col gap-6">
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        {state.error && <AvisoDeAuth>{state.error}</AvisoDeAuth>}
        <Field
          label={t('forgot_password_modal_email_label')}
          type="email"
          name="email"
          value={state.email}
          onChange={handleInputChange}
          placeholder={t('forgot_password_modal_email_placeholder')}
          disabled={state.isLoading}
          autoComplete="email"
          autoFocus
        />
        <Button
          type="submit"
          variante="primario"
          carregando={state.isLoading}
          className="w-full"
        >
          {state.isLoading
            ? t('forgot_password_modal_submit_loading')
            : t('forgot_password_modal_submit_button')}
        </Button>
        {voltar}
      </form>
      <div className="flex flex-col gap-1 rounded-card bg-sup-2 p-4">
        <span className="font-medium">
          {t('forgot_password_modal_security_tip_title')}
        </span>
        <span className="t-rotulo text-texto-suave">
          {t('forgot_password_modal_security_tip_text')}
        </span>
      </div>
    </div>
  );

  const successStep = (
    <div className="flex flex-col gap-6">
      <div className="flex gap-4 rounded-card bg-sup-2 p-4">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full tint-ouro text-ouro-na-tinta">
          <Icon de={PiEnvelopeSimple} tamanho="m" />
        </span>
        <div className="flex min-w-0 flex-col gap-1">
          <span className="font-medium">
            {t('forgot_password_success_check_title')}
          </span>
          <span className="t-rotulo text-texto-suave">
            {t('forgot_password_success_check_text')}{' '}
            <span className="break-all text-texto">{state.email}</span>
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <span className="t-legenda">
          {t('forgot_password_success_steps_title')}
        </span>
        {numerados([
          t('forgot_password_success_step_1'),
          t('forgot_password_success_step_2'),
          t('forgot_password_success_step_3'),
        ])}
      </div>
      <div className="flex flex-col gap-2">
        {voltar}
        <Button variante="texto" type="button" onClick={handleClose}>
          {t('forgot_password_success_close_button')}
        </Button>
      </div>
    </div>
  );

  const errorStep = (
    <div className="flex flex-col gap-6">
      <AvisoDeAuth
        titulo={
          state.rateLimited
            ? t('forgot_password_error_rate_limit_title')
            : t('forgot_password_error_general_title')
        }
      >
        {state.error}
      </AvisoDeAuth>
      {state.rateLimited && (
        <div className="flex flex-col gap-3">
          <span className="t-legenda">
            {t('forgot_password_error_what_to_do')}
          </span>
          {numerados([
            t('forgot_password_error_wait'),
            t('forgot_password_error_check_email'),
            t('forgot_password_error_contact'),
          ])}
        </div>
      )}
      <div className="flex flex-col gap-2">
        {!state.rateLimited && (
          <Button
            variante="primario"
            className="w-full"
            onClick={() =>
              setState((prev) => ({ ...prev, step: 'email', error: null }))
            }
          >
            {t('forgot_password_error_try_again_button')}
          </Button>
        )}
        {voltar}
      </div>
    </div>
  );

  const titulos = {
    email: [
      t('forgot_password_modal_title'),
      t('forgot_password_modal_subtitle'),
    ],
    success: [
      t('forgot_password_success_title'),
      t('forgot_password_success_subtitle'),
    ],
    error: state.rateLimited
      ? [
          t('forgot_password_error_title_rate_limit'),
          t('forgot_password_error_subtitle_rate_limit'),
        ]
      : [
          t('forgot_password_error_title_general'),
          t('forgot_password_error_subtitle_general'),
        ],
  }[state.step];

  return (
    <Sheet
      aberto={isOpen}
      aoFechar={handleClose}
      titulo={titulos[0]}
      descricao={titulos[1]}
      largura="p"
    >
      {state.step === 'success'
        ? successStep
        : state.step === 'error'
          ? errorStep
          : emailStep}
    </Sheet>
  );
};

export default ForgotPasswordModal;
