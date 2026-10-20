'use client';

import { useState } from 'react';
import { PiHeart, PiHeartFill } from 'react-icons/pi';
import toast from 'react-hot-toast';
import { Icon } from '@/app/components/ui/Icon';
import { classesDeBotao } from '@/app/components/ui/Button';
import { cx } from '@/app/components/ui/cx';
import { useEsboco } from './pecas';

/**
 * O coração de favoritar, em todo cartão de compositor, obra, partitura e
 * coleção (pedido de 06/10). Dentro de um link, o clique só favorita: não
 * navega nem dispara o "cartão vira página". Sem conta, abre o entrar.
 *
 * `sobre`: em cima de uma foto (véu escuro, para ler em qualquer retrato).
 * `comTexto`: o botão com rótulo, ao lado do compartilhar (06/10, 2ª rodada).
 * `valor`/`aoMudar`: controlado, quando dois corações falam da mesma coisa
 * (o da foto e o do botão, no compositor).
 */
export function Coracao({
  rotulo,
  sobre = false,
  inicial = false,
  comTexto = false,
  valor,
  aoMudar,
  className,
}: {
  rotulo: string;
  sobre?: boolean;
  inicial?: boolean;
  comTexto?: boolean;
  valor?: boolean;
  aoMudar?: (v: boolean) => void;
  className?: string;
}) {
  const { logado, abrirEntrar } = useEsboco();
  const [interno, setInterno] = useState(inicial);
  const [pulso, setPulso] = useState(0);
  const fav = valor ?? interno;

  const coracao = (
    <span
      key={pulso}
      className={cx(
        'grid place-items-center',
        pulso > 0 && fav && 'coracao-bate'
      )}
    >
      <Icon de={fav ? PiHeartFill : PiHeart} tamanho="m" />
    </span>
  );

  return (
    <button
      type="button"
      aria-pressed={fav}
      aria-label={
        comTexto
          ? undefined
          : fav
            ? `Tirar ${rotulo} dos favoritos`
            : `Favoritar ${rotulo}`
      }
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!logado) return abrirEntrar();
        setInterno(!fav);
        aoMudar?.(!fav);
        setPulso((p) => p + 1);
        if (!fav) toast.success(`${rotulo} nos favoritos`);
      }}
      className={cx(
        comTexto
          ? cx(classesDeBotao(fav ? 'primario' : 'secundario', 'm'), 'gap-2')
          : cx(
              'group/fav grid h-9 w-9 shrink-0 place-items-center rounded-full transition-colors duration-[var(--t-toque)] [@media(pointer:coarse)]:h-11 [@media(pointer:coarse)]:w-11',
              sobre
                ? 'bg-[var(--veu-foto)] text-sobre-foto hover:text-[var(--ouro)]'
                : 'text-texto-fraco hover:bg-sup-2 hover:text-ouro-texto',
              fav && (sobre ? '!text-[var(--ouro)]' : '!text-ouro-texto')
            ),
        className
      )}
    >
      {coracao}
      {comTexto && (fav ? 'Nos favoritos' : 'Favoritar')}
    </button>
  );
}
