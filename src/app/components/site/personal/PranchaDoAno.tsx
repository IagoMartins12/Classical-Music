import {
  Anel,
  C,
  Corpo,
  Gira,
  Moldura,
  Regua,
  Rotulo,
  at,
} from '@/app/components/site/orbits/Orbitas';
import { cx } from '@/app/components/ui/cx';
import type { RetroCard } from '@/app/requests/retrospective';
import {
  ANEIS,
  CORPOS_DO_PROXIMO,
  RAIO_DO_ROTULO,
  estrelas,
  medidaDo,
} from '@/app/utils/pranchaRetro';

/** The length of the outer ring's arc for a share. */
const arco = (p: number) => Math.round(2 * Math.PI * ANEIS[2] * p * 100) / 100;

/**
 * One card of the retrospective as a plate of the atlas (`utils/pranchaRetro`):
 * the orbits of the home globe, the card's label engraved along the outer
 * ring, and its number at the center, where the seal sits on the other
 * plates. The drawing comes from the number itself: a star per item, an arc
 * as long as a share, the next works as bodies on the rings.
 *
 * Decorative (`aria-hidden`, as every orbit): the card's text says it all.
 * `chave` makes the ids unique when several plates share a page.
 */
export function PranchaDoAno({
  card,
  chave,
  gerando = false,
  className,
}: {
  card: RetroCard | null;
  chave: string;
  /** Still being made: only the rings, drawing themselves over and over. */
  gerando?: boolean;
  className?: string;
}) {
  const medida = card ? medidaDo(card) : null;
  const proximo = card?.kind === 'next' ? (card.list ?? []).slice(0, 3) : [];
  const valor = card?.value ?? null;

  return (
    <Moldura
      sempre
      seal={!valor}
      centro={
        valor ? (
          <span
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-display leading-none text-texto tabular-nums"
            // The number keeps its size against the plate (container units).
            style={{ fontSize: valor.length > 5 ? '9cqw' : '13cqw' }}
          >
            {valor}
          </span>
        ) : undefined
      }
      regua={<Regua o={0.3} />}
      className={cx(gerando && 'retro-gerando', className)}
    >
      {ANEIS.map((r, i) => (
        <Anel key={r} r={r} i={i} o={0.22 + i * 0.08} w={1 + i * 0.1} />
      ))}
      {card && (
        <Rotulo
          id={`retro-rotulo-${chave}`}
          r={RAIO_DO_ROTULO}
          deg={-100}
          tamanho={14}
        >
          {card.eyebrow.toUpperCase()}
        </Rotulo>
      )}
      {medida?.tipo === 'fracao' && (
        <circle
          className="retro-arco"
          cx={C}
          cy={C}
          r={ANEIS[2]}
          fill="none"
          stroke="currentColor"
          strokeWidth={4}
          strokeLinecap="round"
          // Real length, not `pathLength`: the engraving rule would turn any
          // normalized circle into a whole ring (`.engraving`).
          strokeDasharray={`${arco(medida.p)} 9999`}
          transform={`rotate(-90 ${C} ${C})`}
        />
      )}
      {medida?.tipo === 'contagem' &&
        estrelas(medida.n).map((e, i) => {
          const p = at(e.r, e.deg);
          return (
            <circle
              key={i}
              className="retro-estrela"
              cx={p.x}
              cy={p.y}
              r={4}
              fill="currentColor"
              style={{ ['--i' as string]: i }}
            />
          );
        })}
      {proximo.map((_, i) => (
        <Gira key={i} segundos={140 + i * 50} reverso={i % 2 === 1}>
          <Corpo
            r={CORPOS_DO_PROXIMO[i].r}
            deg={CORPOS_DO_PROXIMO[i].deg}
            texto={String(i + 1)}
            tamanho={44}
          />
        </Gira>
      ))}
    </Moldura>
  );
}
