// app/components/EmailVerificationBanner.tsx
'use client';

import { useState } from 'react';
import {
  PiArrowsClockwise,
  PiCheckCircle,
  PiEnvelopeSimple,
  PiX,
} from 'react-icons/pi';
import { AnimatedItem } from '../../animation/AnimatedComponents';
import Button from '../../Common/Button';
import { useEmailVerification } from '@/app/hooks/useEmailVerification';
import { Inline } from '@/app/components/ui/Layout';
import { Text } from '@/app/components/ui/Text';

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
        className={`bg-atencao/10 border border-atencao/30 backdrop-blur-sm ${className}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Inline gap={3}>
              <div className="w-10 h-10 bg-atencao/20 rounded-xl flex items-center justify-center">
                <PiEnvelopeSimple className="w-5 h-5 text-atencao" />
              </div>

              <div className="flex-1">
                <Inline gap={2}>
                  <h4 className="text-sm font-semibold text-theme-primary">
                    📧 Confirme seu email para fazer uploads
                  </h4>
                  {emailSent && (
                    <Inline gap={1}>
                      <PiCheckCircle className="w-4 h-4 text-ok" />
                      <span className="text-xs text-ok font-medium">
                        Email enviado!
                      </span>
                    </Inline>
                  )}
                </Inline>
                <Text papel="legenda" tom="suave" as="p" className="mt-1">
                  Olá{userName ? ` ${userName}` : ''}! Para adicionar
                  compositores e partituras, confirme o email{' '}
                  <strong>{userEmail}</strong>
                </Text>
              </div>
            </Inline>

            <Inline gap={2}>
              <Button
                onClick={resendEmail}
                variant="ghost"
                size="sm"
                isLoading={isSending}
                leftIcon={
                  <PiArrowsClockwise
                    className={`w-4 h-4 ${isSending ? 'animate-spin' : ''}`}
                  />
                }
                className="text-atencao hover:text-atencao hover:bg-atencao/10 border-atencao/30"
              >
                {emailSent ? 'Reenviar' : 'Enviar Email'}
              </Button>

              {dismissible && (
                <button
                  onClick={() => setIsDismissed(true)}
                  className="w-8 h-8 rounded-lg bg-sup-2/20 hover:bg-sup-2/30 flex items-center justify-center text-theme-tertiary hover:text-texto transition-colors"
                  aria-label="Fechar aviso"
                >
                  <PiX className="w-4 h-4" />
                </button>
              )}
            </Inline>
          </div>
        </div>
      </div>
    </AnimatedItem>
  );
}
