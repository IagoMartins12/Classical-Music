// components/blog/AdminOnly — mostra o conteúdo só para administrador
'use client';

import type { ReactNode } from 'react';
import { useSession } from '@/app/libs/session';

interface AdminOnlyProps {
  children: ReactNode;
  /**
   * Quando a página já sabe (a prévia só abre para administrador), manda
   * aqui; sem isso, decide pela sessão no navegador. Assim a página pública
   * do artigo não lê cookie no servidor e pode ser estática (ISR).
   */
  show?: boolean;
}

export function useIsBlogAdmin(): boolean {
  const { data: session } = useSession();
  return (session?.user?.role ?? 0) >= 1;
}

export function AdminOnly({ children, show }: AdminOnlyProps) {
  const isAdmin = useIsBlogAdmin();

  return (show ?? isAdmin) ? <>{children}</> : null;
}
