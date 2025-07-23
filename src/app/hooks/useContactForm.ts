// app/hooks/useContactForm.ts
import { useState, useCallback } from 'react';

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  category: string;
  priority: string;
  subscribeNewsletter?: boolean;
  sourceUrl?: string;
  userAgent?: string;
}

interface ContactFormResponse {
  success: boolean;
  message: string;
  error?: string;
  ticketId?: string;
}

interface UseContactFormReturn {
  submitForm: (data: ContactFormData) => Promise<void>;
  loading: boolean;
  success: boolean;
  error: string | null;
  reset: () => void;
}

export const useContactForm = (): UseContactFormReturn => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitForm = useCallback(async (data: ContactFormData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result: ContactFormResponse = await response.json();

      if (result.success) {
        setSuccess(true);
        setError(null);
      } else {
        setError(result.error || 'Erro ao enviar mensagem');
        setSuccess(false);
      }
    } catch (err) {
      console.error('Erro no envio do formulário:', err);
      setError('Erro de conexão. Tente novamente.');
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setLoading(false);
    setSuccess(false);
    setError(null);
  }, []);

  return {
    submitForm,
    loading,
    success,
    error,
    reset,
  };
};
