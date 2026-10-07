'use client';

import type { ReactNode } from 'react';
import { cx } from '@/app/components/ui/cx';

/**
 * Liga/desliga com rótulo e ajuda — "Verificada", "Ativa". Um `checkbox` de
 * verdade (teclado, leitor de tela, formulário), com a linha inteira
 * clicável. Sem trilho colorido de "switch": o estado se lê no visto e no
 * texto da ajuda, que muda com ele.
 */
export function Interruptor({
  rotulo,
  ajuda,
  ligado,
  aoMudar,
  disabled = false,
  className,
}: {
  rotulo: ReactNode;
  ajuda?: ReactNode;
  ligado: boolean;
  aoMudar: (ligado: boolean) => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <label
      className={cx(
        'flex cursor-pointer items-start gap-3 rounded-controle bg-sup-2 px-4 py-3',
        disabled && 'cursor-not-allowed opacity-60',
        className
      )}
    >
      <input
        type="checkbox"
        checked={ligado}
        disabled={disabled}
        onChange={(e) => aoMudar(e.target.checked)}
        className="mt-1 h-4 w-4 shrink-0 accent-[var(--ouro)]"
      />
      <span className="flex flex-col gap-0.5">
        <span className="text-[0.9375rem] font-medium text-texto">
          {rotulo}
        </span>
        {ajuda && <span className="t-legenda">{ajuda}</span>}
      </span>
    </label>
  );
}
