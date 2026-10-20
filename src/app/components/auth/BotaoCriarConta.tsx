'use client';

import type { ReactNode } from 'react';
import { useAuth } from '@/app/hooks/useAuth';
import { useRegisterModal } from '@/app/stores/authStore';
import { Button } from '@/app/components/ui/Button';

/**
 * "Criar conta grátis" — abre o cadastro. Para quem já entrou, o botão não
 * tem o que fazer: mostra `seLogado` (um link para o próximo passo) ou some.
 *
 * Substitui o `AboutUsButton`, que crescia sob o cursor e, na versão
 * "login", também abria o cadastro.
 */
export function BotaoCriarConta({
  children,
  variante = 'secundario',
  seLogado = null,
  className,
}: {
  children: ReactNode;
  variante?: 'primario' | 'secundario';
  seLogado?: ReactNode;
  className?: string;
}) {
  const { isAuthenticated } = useAuth();
  const { open } = useRegisterModal();

  if (isAuthenticated) return <>{seLogado}</>;

  return (
    <Button variante={variante} onClick={open} className={className}>
      {children}
    </Button>
  );
}
