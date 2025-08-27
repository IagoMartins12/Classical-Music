// app/newsletter/confirm/[token]/page.tsx - ATUALIZADA COM SUPORTE A REINSCRIÇÃO
'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
  FiMail,
  FiCheckCircle,
  FiAlertCircle,
  FiLoader,
  FiArrowRight,
  FiHeart,
} from 'react-icons/fi';
import { GiGrandPiano } from 'react-icons/gi';
import Button from '@/app/components/Common/Button';
import Input from '@/app/components/Common/Inputs';
import Link from 'next/link';

interface ConfirmationState {
  status: 'loading' | 'success' | 'error' | 'already-confirmed';
  message: string;
  subscriberData?: {
    email: string;
    firstName?: string;
  };
  errorCode?: string;
}

interface ResubscribeState {
  status: 'idle' | 'loading' | 'success' | 'error';
  message: string;
}

export default function NewsletterConfirmPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const token = params.token as string;
  const emailParam = searchParams.get('email'); // Para reinscrição

  // Estados para confirmação normal
  const [confirmState, setConfirmState] = useState<ConfirmationState>({
    status: 'loading',
    message: 'Confirmando inscrição...',
  });

  // Estados para reinscrição
  const [resubscribeState, setResubscribeState] = useState<ResubscribeState>({
    status: 'idle',
    message: '',
  });

  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');

  // Determinar se é reinscrição ou confirmação
  const isResubscribe = !!emailParam && !token;

  useEffect(() => {
    if (isResubscribe) {
      // Modo reinscrição - pré-preencher email
      setEmail(emailParam);
    } else if (token) {
      // Modo confirmação normal - confirmar token
      if (!token) {
        setConfirmState({
          status: 'error',
          message: 'Token de confirmação não fornecido',
          errorCode: 'NO_TOKEN',
        });
        return;
      }
      confirmSubscription();
    }
  }, [token, emailParam, isResubscribe]);

  const confirmSubscription = async () => {
    try {
      setConfirmState({
        status: 'loading',
        message: 'Confirmando sua inscrição na newsletter...',
      });

      const response = await fetch(`/api/newsletter/confirm/${token}`);
      const result = await response.json();

      if (result.success) {
        setConfirmState({
          status: result.alreadyConfirmed ? 'already-confirmed' : 'success',
          message: result.message,
          subscriberData: result.subscriber,
        });

        // Redirecionar após sucesso (opcional)
        if (!result.alreadyConfirmed) {
          setTimeout(() => {
            router.push('/');
          }, 5000);
        }
      } else {
        setConfirmState({
          status: 'error',
          message: result.error,
          errorCode: result.errorCode,
        });
      }
    } catch (error) {
      console.error('Erro na confirmação:', error);
      setConfirmState({
        status: 'error',
        message: 'Erro de conexão. Tente novamente.',
        errorCode: 'CONNECTION_ERROR',
      });
    }
  };

  const handleResubscribe = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setResubscribeState({
        status: 'error',
        message: 'Email é obrigatório',
      });
      return;
    }

    setResubscribeState({
      status: 'loading',
      message: 'Processando reinscrição...',
    });

    try {
      const response = await fetch('/api/newsletter/resubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          firstName: firstName.trim(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResubscribeState({
          status: 'success',
          message:
            data.message ||
            'Reinscrição realizada! Verifique seu email para confirmar.',
        });
      } else {
        setResubscribeState({
          status: 'error',
          message: data.error || 'Erro ao se reinscrever',
        });
      }
    } catch (error) {
      console.error('Erro:', error);
      setResubscribeState({
        status: 'error',
        message: 'Erro de conexão. Tente novamente.',
      });
    }
  };

  // Renderizar página de reinscrição
  const renderResubscribePage = () => {
    if (resubscribeState.status === 'success') {
      return (
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-accent-green to-accent-blue rounded-full flex items-center justify-center mx-auto mb-6 shadow-theme-glow animate-bounce">
            <FiCheckCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-theme-primary classical-title mb-4">
            Bem-vindo de volta!
          </h1>
          <p className="text-theme-secondary text-lg mb-6">
            {resubscribeState.message}
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <Button
              variant="primary"
              size="lg"
              rightIcon={<FiArrowRight />}
              onClick={() => router.push('/')}
            >
              Voltar ao Início
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-accent-green to-accent-blue rounded-full flex items-center justify-center mx-auto mb-6 shadow-theme-glow">
          <FiHeart className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-theme-primary classical-title mb-4">
          Que bom te ver de volta!
        </h1>
        <p className="text-theme-secondary text-lg mb-8">
          Sentimos sua falta na nossa comunidade de música clássica. Vamos
          recomeçar sua jornada musical?
        </p>

        <form onSubmit={handleResubscribe} className="space-y-6 text-left">
          <div>
            <label className="block text-sm font-medium text-theme-secondary mb-2">
              Email *
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="input-classical-2 w-full"
              required
              disabled={resubscribeState.status === 'loading'}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-theme-secondary mb-2">
              Nome (opcional)
            </label>
            <Input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Seu nome"
              className="input-classical-2 w-full"
              disabled={resubscribeState.status === 'loading'}
            />
          </div>

          {resubscribeState.status === 'error' && (
            <div className="bg-accent-red bg-opacity-10 border border-accent-red rounded-xl p-4">
              <div className="flex items-center">
                <FiAlertCircle className="w-5 h-5 text-accent-red mr-2" />
                <p className="text-accent-red font-medium">
                  Ops! Algo deu errado
                </p>
              </div>
              <p className="text-accent-red opacity-80 text-sm mt-1">
                {resubscribeState.message}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={resubscribeState.status === 'loading' || !email}
            className="btn-classical-primary w-full flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {resubscribeState.status === 'loading' ? (
              <FiLoader className="w-5 h-5 animate-spin" />
            ) : (
              <FiMail className="w-5 h-5" />
            )}
            <span>
              {resubscribeState.status === 'loading'
                ? 'Reativando...'
                : 'Reativar minha inscrição'}
            </span>
          </button>

          <div className="text-center pt-4">
            <button
              type="button"
              onClick={() => router.push('/')}
              className="text-theme-secondary hover:text-brand-primary transition-colors"
            >
              Voltar ao início
            </button>
          </div>
        </form>

        {/* Benefícios */}
        <div className="mt-8 pt-6 border-t border-theme-secondary">
          <h4 className="text-lg font-semibold text-theme-primary mb-4">
            O que você vai receber:
          </h4>
          <div className="grid md:grid-cols-2 gap-4 text-left">
            <div className="bg-theme-secondary rounded-xl p-4">
              <FiMail className="w-6 h-6 text-brand-primary mb-2" />
              <h5 className="font-medium text-theme-primary mb-1">
                Newsletter Semanal
              </h5>
              <p className="text-sm text-theme-secondary">
                Descobertas musicais e novos compositores
              </p>
            </div>
            <div className="bg-theme-secondary rounded-xl p-4">
              <GiGrandPiano className="w-6 h-6 text-accent-purple mb-2" />
              <h5 className="font-medium text-theme-primary mb-1">
                Conteúdo Exclusivo
              </h5>
              <p className="text-sm text-theme-secondary">
                Partituras e análises musicais especiais
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderConfirmationContent = () => {
    switch (confirmState.status) {
      case 'loading':
        return (
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-brand-primary to-accent-purple rounded-full flex items-center justify-center mx-auto mb-6 shadow-theme-glow animate-pulse">
              <FiLoader className="w-10 h-10 text-white animate-spin" />
            </div>
            <h1 className="text-3xl font-bold text-theme-primary classical-title mb-4">
              Confirmando inscrição...
            </h1>
            <p className="text-theme-secondary text-lg">
              {confirmState.message}
            </p>
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
              Inscrição Confirmada!
            </h1>
            <p className="text-theme-secondary text-lg mb-6">
              Bem-vindo à nossa newsletter de música clássica!
            </p>

            {confirmState.subscriberData && (
              <div className="bg-accent-green bg-opacity-10 border border-accent-green rounded-xl p-6 mb-8">
                <h3 className="text-xl font-semibold text-accent-green mb-2 flex items-center justify-center">
                  <FiHeart className="w-5 h-5 mr-2" />
                  Obrigado,{' '}
                  {confirmState.subscriberData.firstName || 'Música Lover'}!
                </h3>
                <p className="text-accent-green opacity-80">
                  Sua inscrição para{' '}
                  <strong>{confirmState.subscriberData.email}</strong> foi
                  confirmada. Você começará a receber nossa newsletter semanal
                  com as melhores descobertas musicais!
                </p>
              </div>
            )}

            {/* Benefícios da Newsletter */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-theme-secondary rounded-xl p-6">
                <div className="w-12 h-12 bg-gradient-to-br from-accent-blue to-accent-purple rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiMail className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-semibold text-theme-primary mb-2">
                  Newsletter Semanal
                </h4>
                <p className="text-theme-tertiary text-sm">
                  Descubra novos compositores, obras e curiosidades sobre música
                  clássica
                </p>
              </div>

              <div className="bg-theme-secondary rounded-xl p-6">
                <div className="w-12 h-12 bg-gradient-to-br from-accent-amber to-accent-red rounded-full flex items-center justify-center mx-auto mb-4">
                  <GiGrandPiano className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-semibold text-theme-primary mb-2">
                  Conteúdo Exclusivo
                </h4>
                <p className="text-theme-tertiary text-sm">
                  Partituras, análises musicais e dicas de estudo exclusivas
                  para subscribers
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <Button
                variant="primary"
                size="lg"
                rightIcon={<FiArrowRight />}
                onClick={() => router.push('/')}
                className="animate-pulse"
              >
                Explorar Opus Atlas
              </Button>

              <Button
                variant="ghost"
                size="lg"
                onClick={() => router.push('/composers')}
              >
                Ver Compositores
              </Button>
            </div>

            <div className="mt-8 text-sm text-theme-tertiary">
              Redirecionando para o site em alguns segundos...
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
              Já Confirmado
            </h1>
            <p className="text-theme-secondary text-lg mb-6">
              Sua inscrição na newsletter já foi confirmada anteriormente
            </p>

            {confirmState.subscriberData && (
              <div className="bg-accent-blue bg-opacity-10 border border-accent-blue rounded-xl p-6 mb-8">
                <h3 className="text-xl font-semibold text-accent-blue mb-2">
                  Você já está recebendo nossa newsletter!
                </h3>
                <p className="text-accent-blue opacity-80">
                  Continue aproveitando nosso conteúdo sobre música clássica.
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
                Ir para o Site
              </Button>

              <Button
                variant="ghost"
                size="lg"
                onClick={() => router.push('/works')}
              >
                Ver Obras
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
              Erro na Confirmação
            </h1>
            <p className="text-theme-secondary text-lg mb-6">
              {confirmState.message}
            </p>

            <div className="bg-accent-red bg-opacity-10 border border-accent-red rounded-xl p-6 mb-8">
              <div className="flex items-center justify-center mb-3">
                <FiAlertCircle className="w-5 h-5 text-accent-red mr-2" />
                <span className="font-medium text-accent-red">
                  {getErrorTitle(confirmState.errorCode)}
                </span>
              </div>
              <p className="text-accent-red opacity-80 text-sm">
                {getErrorDescription(confirmState.errorCode)}
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => router.push('/')}
                >
                  Ir para o Site
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  onClick={confirmSubscription}
                >
                  Tentar Novamente
                </Button>
              </div>

              <div className="text-center">
                <p className="text-theme-tertiary text-sm mb-2">
                  Precisa de ajuda com sua inscrição?
                </p>
                <Link
                  href="/#newsletter"
                  className="text-brand-primary hover:underline text-sm"
                >
                  Tente se inscrever novamente
                </Link>
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

          {/* Content - renderiza baseado no modo */}
          {isResubscribe
            ? renderResubscribePage()
            : renderConfirmationContent()}

          {/* Footer */}
          <div className="mt-12 pt-8 border-t border-theme-secondary text-center">
            <p className="text-sm text-theme-tertiary">
              Dúvidas sobre nossa newsletter?{' '}
              <Link
                href="/newsletter/help"
                className="text-brand-primary hover:underline"
              >
                Central de Ajuda
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
      return 'Link Expirado';
    case 'USED_TOKEN':
      return 'Link Já Utilizado';
    case 'INVALID_TOKEN':
      return 'Link Inválido';
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
      return 'O link de confirmação expirou. Solicite uma nova inscrição.';
    case 'USED_TOKEN':
      return 'Este link já foi utilizado anteriormente.';
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
