import type { CSSProperties } from 'react';

/**
 * O nome que liga o card à página (e cada card a si mesmo na reordenação).
 * `classe` escolhe o tempo no CSS: `cartao` (560ms) ou `item-lista` (380ms).
 */
export function nomeDeTransicao(
  nome: string,
  classe: 'cartao' | 'item-lista' | 'cartao item-lista' = 'cartao item-lista'
): CSSProperties {
  return {
    viewTransitionName: nome,
    viewTransitionClass: classe,
  } as CSSProperties;
}
