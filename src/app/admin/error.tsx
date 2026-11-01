'use client';

import { ErroNaCasca } from '@/app/components/site/status/ErroNaCasca';

/**
 * Erro numa tela do painel: aparece dentro da casca, e o resto do painel
 * continua navegável. O "tentar de novo" remonta só esta tela.
 */
export default function ErroNoPainel(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErroNaCasca {...props} />;
}
