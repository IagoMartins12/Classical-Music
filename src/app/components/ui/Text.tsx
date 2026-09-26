import type { ElementType, ReactNode } from 'react';
import { cx } from './cx';

/**
 * Texto, por papel e não por par de classes.
 *
 * **O que isto substitui.** `text-sm text-theme-tertiary` aparece 380 vezes no
 * front, `text-sm text-theme-secondary` 261, `text-theme-tertiary text-xs` 268.
 * Cada uma dessas combinações é uma decisão de hierarquia tomada de novo, e a
 * medição mostrou onde isso deu: **2.954 usos de 14px e 1.304 de 12px contra
 * 49 de 16px**. O corpo de leitura do produto quase não existe; o site inteiro
 * está em tamanho de rótulo.
 *
 * Aqui o papel é que escolhe tamanho, entrelinha, família e tom. Quem escreve
 * a tela diz "isto é corpo", não "isto é 14px cinza".
 */

type Papel =
  | 'display'
  | 'titulo'
  | 'subtitulo'
  | 'secao'
  | 'corpo'
  | 'rotulo'
  | 'legenda';

type Tom = 'forte' | 'suave' | 'fraco' | 'ouro' | 'erro' | 'ok' | 'atencao';

const PAPEL: Record<Papel, string> = {
  display: 't-display',
  titulo: 't-titulo',
  subtitulo: 't-subtitulo',
  secao: 't-secao',
  corpo: 't-corpo',
  rotulo: 't-rotulo',
  legenda: 't-legenda',
};

/** A tag que cada papel usa quando ninguém diz o contrário. */
const TAG: Record<Papel, ElementType> = {
  display: 'h1',
  titulo: 'h2',
  subtitulo: 'h3',
  secao: 'h4',
  corpo: 'p',
  rotulo: 'span',
  legenda: 'span',
};

const TOM: Record<Tom, string> = {
  forte: 'text-texto',
  suave: 'text-texto-suave',
  fraco: 'text-texto-fraco',
  ouro: 'text-ouro-texto',
  erro: 'text-erro',
  ok: 'text-ok',
  atencao: 'text-atencao',
};

interface TextProps {
  papel?: Papel;
  tom?: Tom;
  /** Números de catálogo, anos, durações: largura fixa alinha a coluna. */
  dado?: boolean;
  /** Limita a medida a 68 caracteres, para leitura longa. */
  medida?: boolean;
  as?: ElementType;
  className?: string;
  children: ReactNode;
}

export function Text({
  papel = 'corpo',
  tom,
  dado = false,
  medida = false,
  as,
  className,
  children,
}: TextProps) {
  const Tag = as ?? TAG[papel];

  return (
    <Tag
      className={cx(
        PAPEL[papel],
        tom && TOM[tom],
        dado && 't-dado',
        medida && 'max-w-[68ch]',
        className
      )}
    >
      {children}
    </Tag>
  );
}
