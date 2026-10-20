'use client';

import { useEffect, useRef, useState } from 'react';
import Image from '@/app/components/SmartImage';
import { cx } from '@/app/components/ui/cx';
import { Skeleton } from '@/app/components/ui/Skeleton';

/**
 * A capa de um artigo, com reserva.
 *
 * Sem imagem, ou com a imagem quebrada, entra a pauta (`.blog-pauta`): cinco
 * linhas e a inicial do título. O card nunca fica com um buraco nem com o
 * ícone de imagem quebrada do navegador — e nenhuma capa da base precisa ser
 * consertada para a página ficar de pé.
 */
export function Capa({
  src,
  alt,
  inicial,
  foco,
  sizes,
  prioridade = false,
  preencher = false,
  esqueleto = false,
  className,
}: {
  src: string | null | undefined;
  /** Vazio nos cards: o título ao lado já nomeia o link. */
  alt: string;
  /** A letra da reserva: a inicial do título. */
  inicial: string;
  /** `object-position`: onde está o assunto quando a imagem é cortada. */
  foco?: string;
  sizes: string;
  prioridade?: boolean;
  /** Ocupa a caixa do pai (com título por cima) em vez de ter proporção. */
  preencher?: boolean;
  /**
   * Esqueleto por cima até a imagem chegar. Para capa que troca de imagem
   * no mesmo lugar (o detalhe do evento): sem ele, a imagem anterior
   * ficava à vista enquanto a nova carregava.
   */
  esqueleto?: boolean;
  className?: string;
}) {
  const [falhou, setFalhou] = useState(false);
  const [carregou, setCarregou] = useState(false);
  const ref = useRef<HTMLImageElement>(null);

  // Outra imagem no mesmo lugar: esquece o estado da anterior.
  useEffect(() => {
    setFalhou(false);
    setCarregou(false);
  }, [src]);

  // A imagem pode falhar antes de o React assumir a página: aí o `onError`
  // já passou e ninguém ouviu. Conferir o estado dela ao montar cobre o caso.
  useEffect(() => {
    const el = ref.current;
    if (el?.complete && el.naturalWidth === 0) setFalhou(true);
  }, []);

  return (
    <span
      className={cx(
        'block overflow-hidden bg-sup-2',
        preencher ? 'absolute inset-0' : 'relative',
        className
      )}
    >
      {src && !falhou ? (
        <Image
          key={src}
          ref={ref}
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={prioridade}
          onError={() => setFalhou(true)}
          onLoad={() => setCarregou(true)}
          className="object-cover"
          style={{ objectPosition: foco }}
        />
      ) : null}
      {esqueleto && src && !falhou && !carregou && (
        <Skeleton className="absolute inset-0 !rounded-none" />
      )}
      {(!src || falhou) && (
        <span
          role={alt ? 'img' : undefined}
          aria-label={alt || undefined}
          aria-hidden={alt ? undefined : true}
          className="blog-pauta absolute inset-0"
        >
          <span className="blog-pauta-linhas" />
          <span className="blog-pauta-letra">
            {inicial.trim().charAt(0).toUpperCase() || 'O'}
          </span>
        </span>
      )}
    </span>
  );
}
