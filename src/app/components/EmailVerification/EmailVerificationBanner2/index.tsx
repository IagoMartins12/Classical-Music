// app/components/EmailVerificationBanner.tsx - Banner to show email verification status
'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import {
  FiMail,
  FiAlertTriangle,
  FiX,
  FiRefreshCw,
  FiCheck,
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import Button from '../../Common/Button';

interface EmailVerificationBannerProps {
  onDismiss?: () => void;
  showOnVerified?: boolean; // Show banner even when verified (for other notifications)
  customMessage?: string;
  customType?: 'warning' | 'info' | 'success';
}

const EmailVerificationBanner2: React.FC<EmailVerificationBannerProps> = ({
  onDismiss,
  showOnVerified = false,
  customMessage,
  customType,
}) => {
  const { data: session } = useSession();
  const [isResending, setIsResending] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  const user = session?.user;
  const isEmailVerified = Boolean(user?.emailVerified);
  const hasEmail = Boolean(user?.email);

  // Don't show if user is not logged in or if email is verified and we shouldn't show on verified
  if (
    !user ||
    !hasEmail ||
    (isEmailVerified && !showOnVerified && !customMessage) ||
    isDismissed
  ) {
    return null;
  }

  const handleResendVerification = async () => {
    setIsResending(true);
    try {
      // This would call an API to resend verification
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Email de verificação enviado!');
      } else {
        toast.error(result.message || 'Erro ao enviar email');
      }
    } catch (error) {
      console.error('Erro ao reenviar verificação:', error);
      toast.error('Erro ao enviar email de verificação');
    } finally {
      setIsResending(false);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  // Determine banner type and content
  let bannerType = customType;
  let message = customMessage;
  let icon = <FiMail className="w-5 h-5" />;
  let bgColor = '';
  let textColor = '';
  let borderColor = '';

  if (!customMessage) {
    if (!isEmailVerified) {
      bannerType = 'warning';
      message =
        'Verifique seu email para acessar todas as funcionalidades, incluindo uploads de arquivos.';
      icon = <FiAlertTriangle className="w-5 h-5" />;
    } else {
      bannerType = 'success';
      message =
        'Email verificado com sucesso! Todas as funcionalidades estão disponíveis.';
      icon = <FiCheck className="w-5 h-5" />;
    }
  }

  // Set colors based on type
  switch (bannerType) {
    case 'warning':
      bgColor = 'bg-accent-amber/10';
      textColor = 'text-accent-amber';
      borderColor = 'border-accent-amber/20';
      break;
    case 'success':
      bgColor = 'bg-accent-green/10';
      textColor = 'text-accent-green';
      borderColor = 'border-accent-green/20';
      break;
    case 'info':
    default:
      bgColor = 'bg-accent-blue/10';
      textColor = 'text-accent-blue';
      borderColor = 'border-accent-blue/20';
      break;
  }

  return (
    <div className={`${bgColor} ${borderColor} border rounded-lg p-4 mb-6`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <div className={textColor}>{icon}</div>
          <div className="flex-1">
            <div className={`font-medium ${textColor} mb-1`}>
              {bannerType === 'warning' && '⚠️ Verificação de Email Pendente'}
              {bannerType === 'success' && '✅ Email Verificado'}
              {bannerType === 'info' && 'ℹ️ Informação'}
              {customType && !customMessage && 'Notificação'}
            </div>
            <p className={`text-sm ${textColor} opacity-90 mb-3`}>{message}</p>

            {bannerType === 'warning' && !isEmailVerified && (
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResendVerification}
                  isLoading={isResending}
                  leftIcon={<FiRefreshCw />}
                  className={`border-accent-amber text-accent-amber hover:bg-accent-amber hover:text-black`}
                >
                  Reenviar Verificação
                </Button>
              </div>
            )}

            {bannerType === 'success' && (
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDismiss}
                  className={`${textColor} hover:bg-accent-green/20`}
                >
                  Entendi
                </Button>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={handleDismiss}
          className={`${textColor} hover:opacity-60 transition-opacity p-1`}
        >
          <FiX className="w-4 h-4" />
        </button>
      </div>

      {/* Progress indicator for unverified email */}
      {bannerType === 'warning' && !isEmailVerified && (
        <div className="mt-4 pt-3 border-t border-accent-amber/20">
          <div className="flex items-center text-xs">
            <span className={`${textColor} opacity-75`}>
              Email: <strong>{user.email}</strong>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailVerificationBanner2;
