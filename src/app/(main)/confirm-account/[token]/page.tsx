// app/confirm-account/[token]/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  FiCheckCircle,
  FiAlertCircle,
  FiLoader,
  FiArrowRight,
  FiRefreshCw,
} from 'react-icons/fi';
import { GiGrandPiano } from 'react-icons/gi';
import Button from '@/app/components/Common/Button';
import Link from 'next/link';

interface ConfirmationState {
  status: 'loading' | 'success' | 'error' | 'already-confirmed';
  message: string;
  user?: {
    firstName: string;
    email: string;
    onboardingCompleted: boolean;
  };
  errorCode?: string;
  canResend?: boolean;
}

export default function ConfirmAccountPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [state, setState] = useState<ConfirmationState>({
    status: 'loading',
    message: 'Processando confirmação...',
  });

  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setState({
        status: 'error',
        message: 'Token de confirmação não fornecido',
        errorCode: 'NO_TOKEN',
      });
      return;
    }

    confirmAccount();
  }, [token]);

  const confirmAccount = async () => {
    try {
      setState({
        status: 'loading',
        message: 'Confirmando sua conta...',
      });

      const response = await fetch(`/api/auth/confirm-account/${token}`);
      const result = await response.json();

      if (result.success) {
        setState({
          status: result.alreadyConfirmed ? 'already-confirmed' : 'success',
          message: result.message,
          user: result.user,
        });

        // Redirecionar após sucesso (com delay para mostrar mensagem)
        setTimeout(() => {
          if (result.user?.onboardingCompleted) {
            router.push('/');
          } else {
            // Redirecionar para onboarding se não completado
            router.push('/?onboarding=true');
          }
        }, 3000);
      } else {
        setState({
          status: 'error',
          message: result.error,
          errorCode: result.errorCode,
          canResend: result.errorCode === 'EXPIRED_TOKEN',
        });
      }
    } catch (error) {
      console.error('Erro na confirmação:', error);
      setState({
        status: 'error',
        message: 'Erro de conexão. Tente novamente.',
        errorCode: 'CONNECTION_ERROR',
      });
    }
  };

  const handleResendConfirmation = async () => {
    if (!token) return;

    setResendLoading(true);
    setResendSuccess(false);

    try {
      const response = await fetch(`/api/auth/confirm-account/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'resend' }),
      });

      const result = await response.json();

      if (result.success) {
        setResendSuccess(true);
        setState((prev) => ({
          ...prev,
          message:
            'Novo email de confirmação enviado! Verifique sua caixa de entrada.',
        }));
      } else {
        setState((prev) => ({
          ...prev,
          message: result.error || 'Erro ao reenviar confirmação',
        }));
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        message: 'Erro de conexão ao reenviar email',
      }));
    } finally {
      setResendLoading(false);
    }
  };

  const renderContent = () => {
    switch (state.status) {
      case 'loading':
        return (
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-brand-primary to-accent-purple rounded-full flex items-center justify-center mx-auto mb-6 shadow-theme-glow animate-pulse">
              <FiLoader className="w-10 h-10 text-white animate-spin" />
            </div>
            <h1 className="text-3xl font-bold text-theme-primary classical-title mb-4">
              Confirmando sua conta...
            </h1>
            <p className="text-theme-secondary text-lg">{state.message}</p>
            <div className="mt-8">
              <div className="w-32 h-1 bg-theme-secondary rounded-full mx-auto overflow-hidden">
                <div className="h-full bg-gradient-to-r from-brand-primary to-accent-purple rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        );

      case 'success':
        return (
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-accent-green to-accent-blue rounded-full flex items-center justify-center mx-auto mb-6 shadow-theme-glow animate-bounce">
              <FiCheckCircle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-theme-primary classical-title mb-4">
              🎉 Conta Confirmada!
            </h1>
            <p className="text-theme-secondary text-lg mb-6">{state.message}</p>

            {state.user && (
              <div className="bg-accent-green bg-opacity-10 border border-accent-green rounded-xl p-6 mb-8">
                <h3 className="text-xl font-semibold text-accent-green mb-2">
                  Bem-vindo, {state.user.firstName}! 🎼
                </h3>
                <p className="text-accent-green opacity-80">
                  Sua conta <strong>{state.user.email}</strong> foi confirmada
                  com sucesso.
                  {!state.user.onboardingCompleted &&
                    ' Vamos completar seu perfil!'}
                </p>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              <Button
                variant="primary"
                size="lg"
                rightIcon={<FiArrowRight />}
                onClick={() =>
                  router.push(
                    state.user?.onboardingCompleted ? '/' : '/?onboarding=true'
                  )
                }
                className="animate-pulse"
              >
                {state.user?.onboardingCompleted
                  ? 'Ir para o Site'
                  : 'Completar Perfil'}
              </Button>

              <Button
                variant="ghost"
                size="lg"
                onClick={() => router.push('/')}
              >
                Explorar Opus Atlas
              </Button>
            </div>

            <div className="mt-8 text-sm text-theme-tertiary">
              Redirecionando automaticamente em alguns segundos...
            </div>
          </div>
        );

      case 'already-confirmed':
        return (
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-accent-blue to-accent-purple rounded-full flex items-center justify-center mx-auto mb-6 shadow-theme-glow">
              <FiCheckCircle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-theme-primary classical-title mb-4">
              ✅ Já Confirmado
            </h1>
            <p className="text-theme-secondary text-lg mb-6">{state.message}</p>

            {state.user && (
              <div className="bg-accent-blue bg-opacity-10 border border-accent-blue rounded-xl p-6 mb-8">
                <h3 className="text-xl font-semibold text-accent-blue mb-2">
                  Olá, {state.user.firstName}! 👋
                </h3>
                <p className="text-accent-blue opacity-80">
                  Sua conta já estava confirmada. Você pode fazer login
                  normalmente.
                </p>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              <Button
                variant="primary"
                size="lg"
                rightIcon={<FiArrowRight />}
                onClick={() => router.push('/')}
              >
                Fazer Login
              </Button>

              <Button
                variant="ghost"
                size="lg"
                onClick={() => router.push('/')}
              >
                Ir para o Site
              </Button>
            </div>
          </div>
        );

      case 'error':
        return (
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-accent-red to-accent-amber rounded-full flex items-center justify-center mx-auto mb-6 shadow-theme-glow">
              <FiAlertCircle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-theme-primary classical-title mb-4">
              ❌ Erro na Confirmação
            </h1>
            <p className="text-theme-secondary text-lg mb-6">{state.message}</p>

            <div className="bg-accent-red bg-opacity-10 border border-accent-red rounded-xl p-6 mb-8">
              <div className="flex items-center justify-center mb-3">
                <FiAlertCircle className="w-5 h-5 text-accent-red mr-2" />
                <span className="font-medium text-accent-red">
                  {getErrorTitle(state.errorCode)}
                </span>
              </div>
              <p className="text-accent-red opacity-80 text-sm">
                {getErrorDescription(state.errorCode)}
              </p>
            </div>

            <div className="space-y-4">
              {state.canResend && (
                <Button
                  variant="primary"
                  size="lg"
                  leftIcon={resendSuccess ? <FiCheckCircle /> : <FiRefreshCw />}
                  onClick={handleResendConfirmation}
                  isLoading={resendLoading}
                  disabled={resendSuccess}
                  className="w-full"
                >
                  {resendSuccess ? 'Email Enviado!' : 'Reenviar Confirmação'}
                </Button>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={() => router.push('/')}
                >
                  Voltar ao Site
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  leftIcon={<FiRefreshCw />}
                  onClick={confirmAccount}
                >
                  Tentar Novamente
                </Button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

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
              Precisa de ajuda?{' '}
              <Link
                href="/support"
                className="text-brand-primary hover:underline"
              >
                Entre em contato
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Funções auxiliares para mensagens de erro
function getErrorTitle(errorCode?: string): string {
  switch (errorCode) {
    case 'EXPIRED_TOKEN':
      return 'Token Expirado';
    case 'USED_TOKEN':
      return 'Link Já Utilizado';
    case 'INVALID_TOKEN':
      return 'Token Inválido';
    case 'NO_TOKEN':
      return 'Token Não Fornecido';
    case 'CONNECTION_ERROR':
      return 'Erro de Conexão';
    default:
      return 'Erro Desconhecido';
  }
}

function getErrorDescription(errorCode?: string): string {
  switch (errorCode) {
    case 'EXPIRED_TOKEN':
      return 'O link de confirmação expirou. Você pode solicitar um novo link abaixo.';
    case 'USED_TOKEN':
      return 'Este link de confirmação já foi utilizado anteriormente.';
    case 'INVALID_TOKEN':
      return 'O link de confirmação é inválido ou foi corrompido.';
    case 'NO_TOKEN':
      return 'Nenhum token de confirmação foi fornecido na URL.';
    case 'CONNECTION_ERROR':
      return 'Não foi possível conectar ao servidor. Verifique sua conexão.';
    default:
      return 'Ocorreu um erro inesperado durante a confirmação.';
  }
}
