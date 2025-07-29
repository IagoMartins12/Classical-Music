// app/hooks/useEmailVerification.ts
'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { resendAccountConfirmation } from '@/app/actions/auth';

interface UseEmailVerificationProps {
  userEmail: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

interface UseEmailVerificationReturn {
  isSending: boolean;
  emailSent: boolean;
  resendEmail: () => Promise<void>;
  resetEmailSent: () => void;
}

export function useEmailVerification({
  userEmail,
  onSuccess,
  onError,
}: UseEmailVerificationProps): UseEmailVerificationReturn {
  const [isSending, setIsSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const resendEmail = async () => {
    if (!userEmail || isSending) return;

    setIsSending(true);

    try {
      const result = await resendAccountConfirmation(userEmail);

      if (result.success) {
        setEmailSent(true);
        toast.success('Email de confirmação enviado!');
        onSuccess?.();
      } else {
        toast.error(result.message);
        onError?.(result.message);
      }
    } catch (error) {
      const errorMessage = 'Erro ao enviar email. Tente novamente.';
      console.error('Erro ao reenviar email:', error);
      toast.error(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsSending(false);
    }
  };

  const resetEmailSent = () => {
    setEmailSent(false);
  };

  return {
    isSending,
    emailSent,
    resendEmail,
    resetEmailSent,
  };
}
