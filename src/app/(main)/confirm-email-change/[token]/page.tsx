// app/confirm-email-change/[token]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  FiCheckCircle,
  FiAlertTriangle,
  FiLoader,
  FiMail,
  FiArrowRight,
  FiRefreshCw,
} from 'react-icons/fi';
import { GiGrandPiano } from 'react-icons/gi';
import Button from '@/app/components/Common/Button';
import { toast } from 'react-hot-toast';

interface ConfirmationResult {
  success: boolean;
  message: string;
  errorCode?: string;
  alreadyConfirmed?: boolean;
  data?: {
    oldEmail: string;
    newEmail: string;
    firstName: string;
  };
}

export default function ConfirmEmailChangePage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, update: updateSession } = useSession();
  const [result, setResult] = useState<ConfirmationResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isResending, setIsResending] = useState(false);

  const token = params.token as string;

  useEffect(() => {
    if (token) {
      confirmEmailChange();
    }
  }, [token]);

  const confirmEmailChange = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/auth/confirm-email-change/${token}`, {
        method: 'GET',
      });

      const data = await response.json();
      setResult(data);

      if (data.success && data.data) {
        // 🆕 UPDATE SESSION WITH NEW EMAIL
        if (updateSession && session) {
          await updateSession({
            ...session,
            user: {
              ...session.user,
              email: data.data.newEmail,
              emailVerified: new Date(),
            },
          });
        }

        toast.success('Email alterado com sucesso! Sua sessão foi atualizada.');
      } else if (!data.success) {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Erro ao confirmar mudança de email:', error);
      setResult({
        success: false,
        message: 'Erro ao processar confirmação. Tente novamente.',
        errorCode: 'NETWORK_ERROR',
      });
      toast.error('Erro de rede. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    setIsResending(true);
    try {
      const response = await fetch(`/api/auth/confirm-email-change/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'resend' }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Erro ao reenviar confirmação:', error);
      toast.error('Erro ao reenviar confirmação.');
    } finally {
      setIsResending(false);
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-brand-gradient rounded-full flex items-center justify-center shadow-theme-glow animate-pulse">
              <FiLoader className="w-8 h-8 text-theme-primary animate-spin" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-theme-primary classical-title mb-4">
            Confirmando mudança de email...
          </h2>
          <p className="text-theme-secondary">
            Aguarde enquanto processamos sua solicitação.
          </p>
        </div>
      );
    }

    if (!result) {
      return (
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-accent-red/10 rounded-full flex items-center justify-center">
              <FiAlertTriangle className="w-8 h-8 text-accent-red" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-theme-primary classical-title mb-4">
            Erro ao processar
          </h2>
          <p className="text-theme-secondary mb-6">
            Não foi possível processar sua solicitação.
          </p>
          <Button variant="primary" onClick={() => router.push('/profile')}>
            Voltar ao Perfil
          </Button>
        </div>
      );
    }

    if (result.success) {
      return (
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-accent-green to-accent-blue rounded-full flex items-center justify-center shadow-theme-glow animate-pulse">
              <FiCheckCircle className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-theme-primary classical-title mb-4">
            ✅ Email alterado com sucesso!
          </h2>
          <p className="text-theme-secondary mb-6">{result.message}</p>

          {result.data && (
            <div className="bg-accent-green/10 border border-accent-green/20 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-accent-green mb-4 flex items-center justify-center">
                <FiMail className="w-5 h-5 mr-2" />
                Resumo da Alteração
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-theme-secondary">Email anterior:</span>
                  <span className="text-theme-primary font-mono">
                    {result.data.oldEmail}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-theme-secondary">Novo email:</span>
                  <span className="text-theme-primary font-mono font-bold">
                    {result.data.newEmail}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="bg-accent-blue/10 border border-accent-blue/20 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-accent-blue mb-2 flex items-center justify-center">
              <FiCheckCircle className="w-4 h-4 mr-2" />
              Funcionalidades Restauradas
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-accent-blue">
              <div>✅ Upload de compositores</div>
              <div>✅ Upload de obras</div>
              <div>✅ Upload de partituras</div>
              <div>✅ Funcionalidades premium</div>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              variant="primary"
              size="lg"
              onClick={() => router.push('/profile')}
              rightIcon={<FiArrowRight />}
              className="w-full"
            >
              Voltar ao Perfil
            </Button>
            <Button
              variant="ghost"
              size="lg"
              onClick={() => router.push('/')}
              className="w-full"
            >
              Ir para Home
            </Button>
          </div>
        </div>
      );
    }

    // Error cases
    return (
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-accent-red/10 rounded-full flex items-center justify-center">
            <FiAlertTriangle className="w-8 h-8 text-accent-red" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-theme-primary classical-title mb-4">
          {result.errorCode === 'EXPIRED_TOKEN'
            ? '⏰ Link Expirado'
            : result.errorCode === 'USED_TOKEN'
            ? '✅ Link Já Utilizado'
            : result.errorCode === 'EMAIL_TAKEN'
            ? '📧 Email Indisponível'
            : '❌ Erro na Confirmação'}
        </h2>

        <p className="text-theme-secondary mb-6">{result.message}</p>

        <div className="space-y-4">
          {result.errorCode === 'EXPIRED_TOKEN' && (
            <div className="bg-accent-amber/10 border border-accent-amber/20 rounded-lg p-4">
              <p className="text-accent-amber text-sm">
                💡 O link de confirmação expirou. Você pode solicitar uma nova
                mudança de email em seu perfil.
              </p>
            </div>
          )}

          {result.errorCode === 'EMAIL_TAKEN' && (
            <div className="bg-accent-red/10 border border-accent-red/20 rounded-lg p-4">
              <p className="text-accent-red text-sm">
                ⚠️ O email que você tentou usar já está sendo utilizado por
                outra conta. Tente com um email diferente.
              </p>
            </div>
          )}

          {result.errorCode === 'USED_TOKEN' && (
            <div className="bg-accent-green/10 border border-accent-green/20 rounded-lg p-4">
              <p className="text-accent-green text-sm">
                ✅ Este link já foi usado anteriormente. Se você ainda precisa
                alterar seu email, solicite uma nova mudança em seu perfil.
              </p>
            </div>
          )}

          <div className="space-y-3">
            {(result.errorCode === 'EXPIRED_TOKEN' ||
              result.errorCode === 'NETWORK_ERROR') && (
              <>
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={handleResendConfirmation}
                  isLoading={isResending}
                  leftIcon={<FiRefreshCw />}
                  className="w-full"
                >
                  Reenviar Confirmação
                </Button>

                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => router.push('/profile')}
                  className="w-full"
                >
                  Solicitar Nova Mudança
                </Button>
              </>
            )}

            {result.errorCode === 'EMAIL_TAKEN' && (
              <Button
                variant="primary"
                size="lg"
                onClick={() => router.push('/profile')}
                className="w-full"
              >
                Tentar Outro Email
              </Button>
            )}

            <Button
              variant="ghost"
              size="lg"
              onClick={() => router.push('/')}
              className="w-full"
            >
              Voltar ao Início
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-theme-background flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="classical-card p-8">
          {/* Header with logo */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-brand-gradient rounded-full flex items-center justify-center shadow-theme-glow">
                <GiGrandPiano className="w-6 h-6 text-theme-primary" />
              </div>
            </div>
            <h1 className="text-lg font-bold text-theme-primary classical-title">
              Opus Atlas
            </h1>
            <p className="text-sm text-theme-tertiary">
              Confirmação de Mudança de Email
            </p>
          </div>

          {renderContent()}
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-theme-tertiary">
            Problemas? Entre em contato com nosso{' '}
            <a
              href="mailto:suporte@opusatlas.com"
              className="text-brand-primary hover:underline"
            >
              suporte
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
