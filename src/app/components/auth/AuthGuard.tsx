// components/auth/AuthGuard.tsx
'use client';

import { useAuth } from '@/app/hooks/useAuth';
import { useLoginModal } from '@/app/stores/authStore';
import React from 'react';
import Button from '../Common/Button';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showLoginPrompt?: boolean;
}

const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  fallback,
  showLoginPrompt = true,
}) => {
  const { isAuthenticated, isLoading } = useAuth();
  const { open: openLogin } = useLoginModal();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-3 border-brand-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-theme-secondary">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (fallback) {
      return <>{fallback}</>;
    }

    if (showLoginPrompt) {
      return (
        <div className="text-center py-12">
          <div className="classical-card max-w-md mx-auto p-8">
            <h3 className="text-xl font-semibold text-theme-primary mb-4">
              Login Necessário
            </h3>
            <p className="text-theme-secondary mb-6">
              Você precisa estar logado para acessar esta funcionalidade.
            </p>
            <Button onClick={openLogin} className="w-full">
              Fazer Login
            </Button>
          </div>
        </div>
      );
    }

    return null;
  }

  return <>{children}</>;
};

export default AuthGuard;
