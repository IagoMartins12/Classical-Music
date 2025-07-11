// app/uploads/error.tsx
'use client';

import Button from '@/app/components/Common/Button';
import { useEffect } from 'react';
import { FiAlertCircle, FiRefreshCw } from 'react-icons/fi';

export default function UploadsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Erro na página de uploads:', error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-theme-primary">
      <div className="text-center max-w-md mx-auto p-8">
        <div className="w-16 h-16 bg-accent-red/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <FiAlertCircle className="w-8 h-8 text-accent-red" />
        </div>

        <h1 className="text-2xl font-bold text-theme-primary mb-4">
          Erro ao carregar uploads
        </h1>

        <p className="text-theme-secondary mb-6">
          Ocorreu um erro ao tentar carregar a página de uploads. Tente
          novamente ou entre em contato com o suporte.
        </p>

        <div className="flex justify-center space-x-3">
          <Button variant="primary" leftIcon={<FiRefreshCw />} onClick={reset}>
            Tentar Novamente
          </Button>

          <Button
            variant="secondary"
            onClick={() => (window.location.href = '/')}
          >
            Voltar ao Início
          </Button>
        </div>
      </div>
    </div>
  );
}
