// app/decline-teacher-invite/[token]/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  FiCheckCircle,
  FiAlertCircle,
  FiLoader,
  FiArrowRight,
  FiHome,
  FiX,
} from 'react-icons/fi';
import { GiGrandPiano } from 'react-icons/gi';
import Button from '@/app/components/Common/Button';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import {
  getErrorDescription,
  getErrorTitle,
} from '../../confirm-teacher-invite/[token]/page';

interface DeclineState {
  status: 'loading' | 'success' | 'error' | 'already-processed';
  message: string;
  user?: {
    firstName: string;
    lastName: string;
    email: string;
  };
  errorCode?: string;
}

export default function DeclineTeacherInvitePage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [state, setState] = useState<DeclineState>({
    status: 'loading',
    message: 'Processando recusa...',
  });

  const [confirmDecline, setConfirmDecline] = useState(false);

  useEffect(() => {
    if (!token) {
      setState({
        status: 'error',
        message: 'Token de convite não fornecido',
        errorCode: 'NO_TOKEN',
      });
      return;
    }

    if (!confirmDecline) {
      setState({
        status: 'loading',
        message: 'Carregando convite...',
      });
      return;
    }

    declineInvite();
  }, [token, confirmDecline]);

  const declineInvite = async () => {
    try {
      setState({
        status: 'loading',
        message: 'Processando recusa do convite...',
      });

      const response = await fetch(`/api/invites/teacher/decline/${token}`);
      const result = await response.json();

      if (result.success) {
        setState({
          status: result.alreadyProcessed ? 'already-processed' : 'success',
          message: result.message,
          user: result.user,
        });

        // Toast de confirmação
        if (!result.alreadyProcessed) {
          toast.success('Convite recusado com sucesso');
        }

        // Redirecionar após sucesso
        setTimeout(() => {
          router.push('/');
        }, 5000);
      } else {
        setState({
          status: 'error',
          message: result.error,
          errorCode: result.errorCode,
        });

        toast.error(result.error);
      }
    } catch (error) {
      console.error('Erro na recusa:', error);
      setState({
        status: 'error',
        message: 'Erro de conexão. Tente novamente.',
        errorCode: 'CONNECTION_ERROR',
      });
      toast.error('Erro de conexão');
    }
  };

  const renderContent = () => {
    if (!confirmDecline && state.status === 'loading') {
      return (
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-accent-amber to-accent-red rounded-full flex items-center justify-center mx-auto mb-6 shadow-theme-glow">
            <FiAlertCircle className="w-10 h-10 text-theme-primary" />
          </div>
          <h1 className="text-3xl font-bold text-theme-primary classical-title mb-4">
            ⚠️ Confirmar Recusa
          </h1>
          <p className="text-theme-secondary text-lg mb-6">
            Tem certeza de que deseja recusar o convite para ser professor?
          </p>

          <div className="bg-accent-amber bg-opacity-10 border border-accent-amber rounded-xl p-6 mb-8">
            <h3 className="text-xl font-semibold text-accent-amber mb-4">
              ⚠️ Esta ação é irreversível
            </h3>
            <div className="text-accent-amber opacity-90 space-y-3 text-left">
              <p className="text-sm">
                <strong>Se você recusar este convite:</strong>
              </p>
              <ul className="text-sm space-y-2 ml-4">
                <li>• Seu status voltará para usuário comum (role 0)</li>
                <li>• Você perderá acesso às funcionalidades de professor</li>
                <li>
                  • Será necessário um novo convite do administrador para se
                  tornar professor novamente
                </li>
                <li>
                  • Suas configurações de perfil de professor serão desativadas
                </li>
              </ul>
            </div>
          </div>

          <div className="space-y-4">
            <div className="text-center">
              <p className="text-theme-tertiary text-sm mb-6">
                Esta decisão pode ser revertida apenas com um novo convite do
                administrador.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <Button
                variant="ghost"
                size="lg"
                onClick={() => router.push('/')}
                leftIcon={<FiHome />}
              >
                Voltar ao Site
              </Button>

              <Button
                variant="delete"
                size="lg"
                onClick={() => setConfirmDecline(true)}
                leftIcon={<FiX />}
                className="bg-gradient-to-r from-accent-red to-accent-amber"
              >
                Confirmar Recusa
              </Button>
            </div>
          </div>
        </div>
      );
    }

    switch (state.status) {
      case 'loading':
        return (
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-accent-amber to-accent-red rounded-full flex items-center justify-center mx-auto mb-6 shadow-theme-glow animate-pulse">
              <FiLoader className="w-10 h-10 text-theme-primary animate-spin" />
            </div>
            <h1 className="text-3xl font-bold text-theme-primary classical-title mb-4">
              Processando recusa...
            </h1>
            <p className="text-theme-secondary text-lg">{state.message}</p>
            <div className="mt-8">
              <div className="w-32 h-1 bg-theme-secondary rounded-full mx-auto overflow-hidden">
                <div className="h-full bg-gradient-to-r from-accent-amber to-accent-red rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        );

      case 'success':
        return (
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-accent-blue to-theme-primary rounded-full flex items-center justify-center mx-auto mb-6 shadow-theme-glow">
              <FiCheckCircle className="w-10 h-10 text-theme-primary" />
            </div>
            <h1 className="text-3xl font-bold text-theme-primary classical-title mb-4">
              ✅ Convite Recusado
            </h1>
            <p className="text-theme-secondary text-lg mb-6">{state.message}</p>

            {state.user && (
              <div className="bg-theme-secondary bg-opacity-50 border border-theme-secondary rounded-xl p-6 mb-8">
                <h3 className="text-xl font-semibold text-theme-primary mb-2">
                  Olá, {state.user.firstName}
                </h3>
                <p className="text-theme-secondary opacity-80">
                  Sua conta voltou ao status de usuário comum. Você pode
                  continuar aproveitando todos os recursos do Opus Atlas como
                  estudante de música clássica.
                </p>
              </div>
            )}

            <div className="bg-accent-blue bg-opacity-10 border border-accent-blue rounded-xl p-6 mb-8">
              <h4 className="font-medium text-accent-blue mb-3">
                💡 Ainda pode mudar de ideia?
              </h4>
              <p className="text-accent-blue opacity-80 text-sm">
                Se no futuro quiser se tornar professor, entre em contato com o
                administrador para solicitar um novo convite.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <Button
                variant="primary"
                size="lg"
                rightIcon={<FiArrowRight />}
                onClick={() => router.push('/')}
                className="animate-pulse"
              >
                Continuar Navegando
              </Button>

              <Button
                variant="ghost"
                size="lg"
                onClick={() => router.push('/profile')}
              >
                Meu Perfil
              </Button>
            </div>

            <div className="mt-8 text-sm text-theme-tertiary">
              <span>Redirecionando para o site em alguns segundos...</span>
            </div>
          </div>
        );

      case 'already-processed':
        return (
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-theme-primary to-accent-blue rounded-full flex items-center justify-center mx-auto mb-6 shadow-theme-glow">
              <FiCheckCircle className="w-10 h-10 text-theme-primary" />
            </div>
            <h1 className="text-3xl font-bold text-theme-primary classical-title mb-4">
              ℹ️ Já Processado
            </h1>
            <p className="text-theme-secondary text-lg mb-6">{state.message}</p>

            <div className="bg-theme-secondary bg-opacity-50 border border-theme-secondary rounded-xl p-6 mb-8">
              <p className="text-theme-primary opacity-80">
                Este convite já foi processado anteriormente. Não há mais ações
                necessárias.
              </p>
            </div>

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
                onClick={() => router.push('/profile')}
              >
                Meu Perfil
              </Button>
            </div>
          </div>
        );

      case 'error':
        return (
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-accent-red to-accent-amber rounded-full flex items-center justify-center mx-auto mb-6 shadow-theme-glow">
              <FiAlertCircle className="w-10 h-10 text-theme-primary" />
            </div>
            <h1 className="text-3xl font-bold text-theme-primary classical-title mb-4">
              ❌ Erro ao Processar
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
                onClick={() => setConfirmDecline(true)}
              >
                Tentar Novamente
              </Button>
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
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-accent-amber opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-10 -right-10 w-60 h-60 bg-accent-red opacity-10 rounded-full blur-3xl"></div>
        <GiGrandPiano className="absolute top-20 right-20 w-12 h-12 text-accent-amber opacity-5 rotate-12" />
        <GiGrandPiano className="absolute bottom-20 left-20 w-16 h-16 text-accent-red opacity-5 -rotate-12" />
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
            <div className="text-sm text-theme-tertiary mb-4">
              Recusar Convite de Professor
            </div>
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
