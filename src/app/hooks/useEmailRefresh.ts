// app/hooks/useEmailRefresh.ts - Versão Robusta com API Backup
'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';

interface UseEmailRefreshReturn {
  isRefreshing: boolean;
  refreshEmailStatus: () => Promise<void>;
}

export function useEmailRefresh(): UseEmailRefreshReturn {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { update } = useSession();

  const refreshEmailStatus = async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);

    try {
      console.log('🔄 Verificando status do email...');

      // Método 1: Forçar atualização da sessão NextAuth (principal)
      const updatedSession = await update();

      if (updatedSession?.user?.emailVerified) {
        // Email foi confirmado via sessão!
        console.log('✅ Email confirmado via sessão');
        toast.success('Email confirmado com sucesso!');

        setTimeout(() => {
          window.location.reload();
        }, 1500);
        return;
      }

      // Método 2: Verificação via API como backup (opcional)
      console.log('🔍 Email não confirmado na sessão, verificando via API...');

      const apiResponse = await fetch('/api/auth/check-email-status', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (apiResponse.ok) {
        const { emailVerified } = await apiResponse.json();

        if (emailVerified) {
          console.log(
            '✅ Email confirmado via API - forçando refresh da sessão'
          );
          toast.success('Email confirmado! Atualizando...');

          // Forçar mais uma atualização da sessão
          await update();

          setTimeout(() => {
            window.location.reload();
          }, 1500);
          return;
        }
      }

      // Email ainda não foi confirmado por nenhum método
      toast.error(
        'Email ainda não foi confirmado. Verifique sua caixa de entrada e tente novamente.'
      );
      console.log('❌ Email ainda não confirmado por nenhum método');
    } catch (error) {
      console.error('❌ Erro ao verificar status do email:', error);
      toast.error('Erro ao verificar confirmação. Tente novamente.');
    } finally {
      setIsRefreshing(false);
    }
  };

  return {
    isRefreshing,
    refreshEmailStatus,
  };
}

// Versão simplificada (apenas NextAuth)
export function useEmailRefreshSimple(): UseEmailRefreshReturn {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { update } = useSession();

  const refreshEmailStatus = async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);

    try {
      // Apenas força atualização da sessão
      const updatedSession = await update();

      if (updatedSession?.user?.emailVerified) {
        toast.success('Email confirmado com sucesso!');
        setTimeout(() => window.location.reload(), 1500);
      } else {
        toast.error(
          'Email ainda não foi confirmado. Verifique sua caixa de entrada.'
        );
      }
    } catch (error) {
      console.error('Erro ao verificar:', error);
      toast.error('Erro ao verificar confirmação.');
    } finally {
      setIsRefreshing(false);
    }
  };

  return { isRefreshing, refreshEmailStatus };
}
