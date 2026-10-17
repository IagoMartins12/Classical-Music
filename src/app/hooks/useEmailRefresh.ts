// app/hooks/useEmailRefresh.ts - Versão Robusta com API Backup
'use client';

import { useCallback, useState } from 'react';
import { useSession } from '@/app/libs/session';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useToast } from './useToast';
import { useLanguageStore } from '../stores/useLanguageStore';
import { porIdioma } from '@/app/utils/porIdioma';

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
      // A check this fast only flashed the spinner: it stays at least a
      // moment, so the person sees the question was asked.
      const [updatedSession] = await Promise.all([
        update(),
        new Promise((resolve) => setTimeout(resolve, 700)),
      ]);

      if (updatedSession?.user?.emailVerified) {
        // Email foi confirmado via sessão!
        console.log('✅ Email confirmado via sessão');
        toast.success(messageSucessfull);

        // The button keeps loading until the page reloads with access.
        setTimeout(() => {
          window.location.reload();
        }, 1500);
        return;
      }

      // A sessão vem da API: se `update()` não trouxe o e-mail confirmado,
      // ele não está confirmado.
      const errorMensage =
        language === 'pt'
          ? 'Email ainda não foi confirmado. Verifique sua caixa de entrada e tente novamente.'
          : 'Email has not been confirmed yet. Please check your inbox and try again.';
      // Email ainda não foi confirmado por nenhum método
      toast.error(errorMensage);
      setIsRefreshing(false);
      console.log('❌ Email ainda não confirmado por nenhum método');
    } catch {
      const errorMensage =
        language === 'pt'
          ? 'Erro ao verificar confirmação. Tente novamente.'
          : 'Error checking confirmation. Please try again.';
      toast.error(errorMensage);
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
          toast.success(
            porIdioma(
              'Professor verificado. Abrindo o portal…',
              'Teacher verified. Opening the portal…'
            )
          );
          setTimeout(() => {
            router.refresh(); // Força reload da página para aplicar as verificações do layout
          }, 1000);
          return;
        }

        // Verificar se student foi aceito
        if (updatedSession.user.studentInviteStatus === 'ACCEPTED') {
          toast.success(
            porIdioma(
              'Convite aceito. Abrindo o portal…',
              'Invite accepted. Opening the portal…'
            )
          );
          setTimeout(() => {
            router.refresh(); // Força reload da página para aplicar as verificações do layout
          }, 1000);
          return;
        }

        if (updatedSession.user.studentInviteStatus === 'PENDING') {
          console.log('caiu aqui');
          toast.info(
            porIdioma(
              'Aguardando a aprovação do convite.',
              'Waiting for the invite to be approved.'
            )
          );
        } else if (updatedSession.user.studentInviteStatus === 'DECLINED') {
          toast.error(
            porIdioma('Seu convite foi recusado.', 'Your invite was declined.')
          );
        } else if (updatedSession.user.studentInviteStatus === 'EXPIRED') {
          toast.error(
            porIdioma(
              'Seu convite expirou. Fale com o professor.',
              'Your invite expired. Talk to your teacher.'
            )
          );
        } else if (
          !updatedSession.user.isStudent &&
          !updatedSession.user.isTeacher &&
          updatedSession.user.teacherVerified
        ) {
          toast.error(
            porIdioma(
              'Seu convite foi recusado. Fale com o suporte.',
              'Your invite was declined. Contact support.'
            )
          );

          setTimeout(() => {
            router.push('/'); // Força reload da página para aplicar as verificações do layout
          }, 2000);
        }
      } else {
        toast.error(
          porIdioma(
            'Não foi possível verificar. Entre de novo.',
            'Could not check. Sign in again.'
          )
        );
      }
    } catch (error) {
      console.error('❌ Erro ao verificar status:', error);
      toast.error(
        porIdioma(
          'Não foi possível verificar. Tente de novo.',
          'Could not check. Try again.'
        )
      );
    } finally {
      setIsRefreshing(false);
    }
  }, [update, router, toast]);

  return {
    isRefreshing,
    refreshEmailStatus,
  };
}
