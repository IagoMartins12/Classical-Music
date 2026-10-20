'use client';

import Link from 'next/link';
import { SeloVerificada } from '@/app/components/ui/SeloVerificada';
import { Coracao } from './coracao';
import { Retrato, anos } from './pecas';

/**
 * O cartão de compositor dos carrosséis (populares da home e "Do mesmo
 * tempo"), no tamanho de antes (06/10, 2ª rodada): o retrato é o que chama.
 * Largura do carrossel: `LARGURA_CARTAO_COMPOSITOR`.
 */

export const LARGURA_CARTAO_COMPOSITOR = 'minmax(14.5rem,16.5rem)';

export function CartaoCompositor({
  id,
  nome,
  nomeCompleto,
  retrato,
  nasc,
  morte,
  legenda,
  verificado,
  href,
}: {
  id: string;
  nome: string;
  nomeCompleto?: string;
  retrato?: string | null;
  nasc: number;
  morte?: number | null;
  legenda?: string;
  verificado?: boolean;
  href: string;
}) {
  return (
    <div role="listitem" className="relative snap-start">
      <Coracao
        rotulo={nome}
        sobre
        className="absolute right-3 top-3 z-elevado"
      />
      <Link
        href={href}
        data-vira={`compositor-${id}`}
        className="group flex flex-col gap-3"
      >
        <Retrato
          nome={nomeCompleto ?? nome}
          src={retrato}
          sizes="264px"
          className="aspect-[4/5] w-full rounded-card text-[2.5rem] shadow-[var(--sombra-1)]"
        />
        <span className="flex flex-col gap-0.5">
          <span className="flex items-center gap-1.5 font-display text-[1.4375rem] leading-tight group-hover:text-ouro-texto">
            <span className="truncate">{nome}</span>
            {verificado && (
              <SeloVerificada className="h-4 w-4 shrink-0 text-verificado" />
            )}
          </span>
          <span className="t-dado text-[0.8125rem] text-texto-fraco">
            {anos(nasc, morte ?? undefined)}
            {legenda ? ` · ${legenda}` : ''}
          </span>
        </span>
      </Link>
    </div>
  );
}
