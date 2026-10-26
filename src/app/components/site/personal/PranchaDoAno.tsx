import LocalizedLink from '@/app/components/LocalizedLink';
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
import { Portrait } from '@/app/components/site/Portrait';
import { cx } from '@/app/components/ui/cx';
import type { RetroCard } from '@/app/requests/retrospective';
import {
  ANEIS,
  LADO_DO_CORPO,
  PAUTA,
  RAIO_DO_RETRATO,
  RAIO_DO_ROTULO,
  arco,
  desenhoDo,
  textoDo,
  type Desenho,
} from '@/app/utils/pranchaRetro';

type Idioma = 'pt' | 'en';

/**
 * One card of the retrospective as a plate of the atlas (`utils/pranchaRetro`):
 * the orbits of the home globe, the card's label engraved along the outer
 * ring, and in the middle what the card is about: the number, the
 * composer's portrait, the instrument, the era, the month. Around it, the
 * card's own drawing: stars, an arc, a staff, the days, faces in orbit.
 *
 * Decorative (`aria-hidden`, as every orbit): the card's text says it all.
 * `chave` makes the ids unique when several plates share a page.
 */
export function PranchaDoAno({
  card,
  chave,
  idioma,
  gerando = false,
  className,
}: {
  card: RetroCard | null;
  chave: string;
  idioma: Idioma;
  /** Still being made: only the rings, drawing themselves over and over. */
  gerando?: boolean;
  className?: string;
}) {
  const d = card ? desenhoDo(card, idioma) : null;
  const corpos = d?.corpos ?? [];

  return (
    <Moldura
      sempre
      seal={!d || d.centro.tipo === 'selo'}
      centro={d ? <Centro d={d} /> : undefined}
      regua={<Regua o={0.3} />}
      className={cx(gerando && 'retro-gerando', className)}
    >
      {(d?.pauta ? PAUTA : ANEIS).map((r, i) => (
        <Anel
          key={r}
          r={r}
          i={i}
          o={d?.pauta ? 0.4 : 0.22 + i * 0.08}
          w={d?.pauta ? 1 : 1 + i * 0.1}
        />
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
      {d?.arco != null && (
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
          strokeDasharray={`${arco(d.arco)} 9999`}
          transform={`rotate(-90 ${C} ${C})`}
        />
      )}
      {d?.estrelas.map((e, i) => {
        const p = at(e.r, e.deg);
        return (
          <circle
            key={`e${i}`}
            className="retro-estrela"
            cx={p.x}
            cy={p.y}
            r={4}
            fill="currentColor"
            style={{ ['--i' as string]: i }}
          />
        );
      })}
      {d?.dias.map((deg, i) => {
        const a = at(ANEIS[1] - 10, deg);
        const b = at(ANEIS[1] + 10, deg);
        return (
          <line
            key={`d${i}`}
            className="retro-estrela"
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            style={{ ['--i' as string]: i }}
          />
        );
      })}
      {d?.mes != null &&
        Array.from({ length: 12 }, (_, m) => {
          const a = at(ANEIS[2] - 12, -90 + m * 30);
          const b = at(ANEIS[2] + 12, -90 + m * 30);
          return (
            <line
              key={`m${m}`}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke="currentColor"
              strokeWidth={1.4}
              opacity={m === d.mes ? 1 : 0.45}
            />
          );
        })}
      {d?.centro.tipo === 'retrato' && (
        <circle
          cx={C}
          cy={C}
          r={RAIO_DO_RETRATO + 8}
          fill="none"
          stroke="currentColor"
          strokeWidth={1.2}
          opacity={0.7}
        />
      )}
      {corpos.map((c, i) => {
        const corpo = (
          <Corpo
            key={`c${i}`}
            r={c.r}
            deg={c.deg}
            icone={c.icone}
            texto={c.texto}
            rosto={c.rosto}
            tamanho={c.texto && c.texto.length > 2 ? 76 : LADO_DO_CORPO}
          />
        );
        // Badges sit still at the end of their arc; faces and icons orbit.
        return c.fixo ? (
          corpo
        ) : (
          <Gira key={`g${i}`} segundos={140 + i * 50} reverso={i % 2 === 1}>
            {corpo}
          </Gira>
        );
      })}
    </Moldura>
  );
}

function Centro({ d }: { d: Desenho }) {
  const meio = 'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2';
  switch (d.centro.tipo) {
    case 'numero':
      return (
        <span
          className={cx(
            meio,
            'font-display leading-none text-texto tabular-nums'
          )}
          // The number keeps its size against the plate (container units).
          style={{ fontSize: d.centro.valor.length > 5 ? '9cqw' : '13cqw' }}
        >
          {d.centro.valor}
        </span>
      );
    case 'retrato':
      return (
        <Portrait
          name={d.centro.rosto.name}
          src={d.centro.rosto.url}
          sizes="(min-width: 640px) 160px, 40vw"
          decorative
          className={cx(
            meio,
            'retro-entra aspect-square w-[32%] rounded-full text-[4cqw]'
          )}
        />
      );
    case 'icone': {
      const Icone = d.centro.icone;
      return (
        <Icone
          aria-hidden
          className={cx(meio, 'retro-entra h-[26%] w-[26%] text-ouro-texto')}
        />
      );
    }
    case 'palavra':
      return (
        <span
          className={cx(
            meio,
            'retro-entra flex w-[36%] flex-col items-center gap-[1.2cqw] text-center'
          )}
        >
          <span
            className="font-display leading-none text-texto"
            style={{
              fontSize: d.centro.texto.length > 10 ? '5.6cqw' : '7.4cqw',
            }}
          >
            {d.centro.texto}
          </span>
          {d.centro.legenda && (
            <span className="t-dado text-[2.8cqw] tracking-[0.12em] text-ouro-texto tabular-nums">
              {d.centro.legenda}
            </span>
          )}
        </span>
      );
    default:
      return null;
  }
}

/**
 * The card's words under its plate, the same in the story and on the shared
 * page: the title, the detail as a sentence, and the next works linked.
 */
export function TextoDoCartao({
  card,
  idioma,
  className,
}: {
  card: RetroCard;
  idioma: Idioma;
  className?: string;
}) {
  const t = textoDo(card, desenhoDo(card, idioma));
  return (
    <div className={cx('flex flex-col gap-3', className)}>
      <h2 className="font-display text-[clamp(1.75rem,7vw,2.25rem)] leading-[1.1] text-balance">
        {t.titulo}
      </h2>
      {(t.detalhe || t.numeroSoNoDesenho) && (
        <p className="t-corpo text-texto-suave">
          {/* The plate is decorative: the reader hears the number here. */}
          {t.numeroSoNoDesenho && (
            <span className="sr-only">{card.value} </span>
          )}
          {t.detalhe}
        </p>
      )}
      {card.list && card.list.length > 0 && (
        <ol className="flex flex-col gap-1 pt-1">
          {card.list.map((item, i) => {
            const href = card.links?.[i];
            const conteudo = (
              <>
                <span className="font-display text-[1.125rem] leading-none text-ouro-texto tabular-nums">
                  {i + 1}
                </span>
                <span className="t-corpo">{item}</span>
              </>
            );
            return (
              <li key={item}>
                {href ? (
                  <LocalizedLink
                    href={href}
                    className="-mx-2 flex items-baseline gap-3 rounded-controle px-2 py-1.5 underline-offset-4 hover:bg-sup-2 hover:underline"
                  >
                    {conteudo}
                  </LocalizedLink>
                ) : (
                  <span className="flex items-baseline gap-3 py-1.5">
                    {conteudo}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
