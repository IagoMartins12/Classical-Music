'use client';

import { useEffect } from 'react';
import { Button } from '@/app/components/ui/Button';
import { Erro } from '@/app/components/ui/Estados';

/**
 * Erro numa tela do painel: aparece dentro da casca, e o resto do painel
 * continua navegável. O "tentar de novo" remonta só esta tela.
 */
export default function ErroNoPainel({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Erro
      titulo="Esta tela do painel não abriu"
      descricao={`${error.message || 'Erro inesperado.'} O resto do painel segue funcionando.`}
      acao={
        <Button tamanho="p" onClick={reset}>
          Tentar de novo
        </Button>
      }
    />
  );
}
