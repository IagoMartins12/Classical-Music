// app/hooks/useEmailRefresh.ts - Versão Robusta com API Backup
'use client';

import { useCallback, useState } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useToast } from './useToast';
import { useLanguageStore } from '../stores/useLanguageStore';

interface UseEmailRefreshReturn {
  isRefreshing: boolean;
  refreshEmailStatus: () => Promise<void>;
}

export function useEmailRefresh(): UseEmailRefreshReturn {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { update } = useSession();

  const { language } = useLanguageStore();
  const refreshEmailStatus = async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);

    try {
      const messageSucessfull =
        language === 'pt'
          ? 'Email confirmado com sucesso!'
          : 'Email confirmed successfully!';
      // Método 1: Forçar atualização da sessão NextAuth (principal)
      const updatedSession = await update();

      if (updatedSession?.user?.emailVerified) {
        // Email foi confirmado via sessão!
        console.log('✅ Email confirmado via sessão');
        toast.success(messageSucessfull);

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
          const messageSucessfull =
            language === 'pt'
              ? 'Email confirmado! Atualizando...'
              : 'Email confirmed! Updating...';
          toast.success(messageSucessfull);

          // Forçar mais uma atualização da sessão
          await update();

          setTimeout(() => {
            window.location.reload();
          }, 1500);
          return;
        }
      }

      const errorMensage =
        language === 'pt'
          ? 'Email ainda não foi confirmado. Verifique sua caixa de entrada e tente novamente.'
          : 'Email has not been confirmed yet. Please check your inbox and try again.';
      // Email ainda não foi confirmado por nenhum método
      toast.error(errorMensage);
      console.log('❌ Email ainda não confirmado por nenhum método');
    } catch {
      const errorMensage =
        language === 'pt'
          ? 'Erro ao verificar confirmação. Tente novamente.'
          : 'Error checking confirmation. Please try again.';
      toast.error(errorMensage);
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
export function useEmailRefreshSimple() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { update } = useSession();
  const router = useRouter();
  const toast = useToast();

  const refreshEmailStatus = useCallback(async () => {
    setIsRefreshing(true);

    try {
      console.log('🔄 Verificando status de verificação...');

      // Atualizar a sessão para pegar dados frescos do banco
      const updatedSession = await update();

      if (updatedSession?.user) {
        console.log('✅ Sessão atualizada:', {
          teacherVerified: updatedSession.user.teacherVerified,
          studentInviteStatus: updatedSession.user.studentInviteStatus,
          teste: updatedSession.user.isTeacher,
          teste2: updatedSession.user.isStudent,
        });

        // Verificar se teacher foi verificado
        if (
          updatedSession.user.isTeacher &&
          updatedSession.user.teacherVerified
        ) {
          toast.success('Professor verificado! Redirecionando...');
          setTimeout(() => {
            router.refresh(); // Força reload da página para aplicar as verificações do layout
          }, 1000);
          return;
        }

        // Verificar se student foi aceito
        if (updatedSession.user.studentInviteStatus === 'ACCEPTED') {
          toast.success('Convite aceito! Redirecionando...');
          setTimeout(() => {
            router.refresh(); // Força reload da página para aplicar as verificações do layout
          }, 1000);
          return;
        }

        if (updatedSession.user.studentInviteStatus === 'PENDING') {
          console.log('caiu aqui');
          toast.info('Aguardando aprovação do convite.');
        } else if (updatedSession.user.studentInviteStatus === 'DECLINED') {
          toast.error('Seu convite foi recusado.');
        } else if (updatedSession.user.studentInviteStatus === 'EXPIRED') {
          toast.error('Seu convite expirou. Entre em contato com o professor.');
        } else if (
          !updatedSession.user.isStudent &&
          !updatedSession.user.isTeacher &&
          updatedSession.user.teacherVerified
        ) {
          toast.error(
            'Seu convite foi declinado. Entre em contato com o nosso suporte.'
          );

          setTimeout(() => {
            router.push('/'); // Força reload da página para aplicar as verificações do layout
          }, 2000);
        }
      } else {
        toast.error('Erro ao verificar status. Tente fazer login novamente.');
      }
    } catch (error) {
      console.error('❌ Erro ao verificar status:', error);
      toast.error('Erro ao verificar status. Tente novamente.');
    } finally {
      setIsRefreshing(false);
    }
  }, [update, router, toast]);

  return {
    isRefreshing,
    refreshEmailStatus,
  };
}
