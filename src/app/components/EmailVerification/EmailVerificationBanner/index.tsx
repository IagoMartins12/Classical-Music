// app/components/EmailVerificationBanner.tsx
'use client';

import { useState } from 'react';
import { FiMail, FiX, FiRefreshCw, FiCheckCircle } from 'react-icons/fi';
import { AnimatedItem } from '../../animation/AnimatedComponents';
import Button from '../../Common/Button';
import { useEmailVerification } from '@/app/hooks/useEmailVerification';

interface EmailVerificationBannerProps {
  userEmail?: string | null;
  userName?: string;
  dismissible?: boolean;
  className?: string;
}

export default function EmailVerificationBanner({
  userEmail,
  userName,
  dismissible = true,
  className = '',
}: EmailVerificationBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  const { isSending, emailSent, resendEmail } = useEmailVerification({
    userEmail,
  });

  if (isDismissed) return null;

  return (
    <AnimatedItem direction="down" springType="gentle">
      <div
        className={`bg-gradient-to-r from-accent-amber/10 to-accent-blue/10 border border-accent-amber/30 backdrop-blur-sm ${className}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-accent-amber/20 to-accent-blue/20 rounded-xl flex items-center justify-center">
                <FiMail className="w-5 h-5 text-accent-amber" />
              </div>

              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h4 className="text-sm font-semibold text-theme-primary">
                    📧 Confirme seu email para fazer uploads
                  </h4>
                  {emailSent && (
                    <div className="flex items-center space-x-1">
                      <FiCheckCircle className="w-4 h-4 text-accent-green" />
                      <span className="text-xs text-accent-green font-medium">
                        Email enviado!
                      </span>
                    </div>
                  )}
                </div>
                <p className="text-xs text-theme-secondary mt-1">
                  Olá{userName ? ` ${userName}` : ''}! Para adicionar
                  compositores e partituras, confirme o email{' '}
                  <strong>{userEmail}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                onClick={resendEmail}
                variant="ghost"
                size="sm"
                isLoading={isSending}
                leftIcon={
                  <FiRefreshCw
                    className={`w-4 h-4 ${isSending ? 'animate-spin' : ''}`}
                  />
                }
                className="text-accent-amber hover:text-accent-amber hover:bg-accent-amber/10 border-accent-amber/30"
              >
                {emailSent ? 'Reenviar' : 'Enviar Email'}
              </Button>

              {dismissible && (
                <button
                  onClick={() => setIsDismissed(true)}
                  className="w-8 h-8 rounded-lg bg-theme-tertiary/20 hover:bg-theme-tertiary/30 flex items-center justify-center text-theme-tertiary hover:text-theme-primary transition-colors"
                  aria-label="Fechar aviso"
                >
                  <FiX className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </AnimatedItem>
  );
}
