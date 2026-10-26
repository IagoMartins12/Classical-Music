'use client';

import { useEffect, useState } from 'react';
import { PiLockSimple, PiSparkle } from 'react-icons/pi';
import Link from '@/app/components/LocalizedLink';
import { Button } from '@/app/components/ui/Button';
import { RecursoDoPlano } from '@/app/components/site/RecursoDoPlano';
import { Icon } from '@/app/components/ui/Icon';
import { cx } from '@/app/components/ui/cx';
import { RECOMMENDATIONS } from '@/app/conteudo/site/recommendations';
import { useRouteLanguage } from '@/app/hooks/useRouteLanguage';
import { useAuth } from '@/app/hooks/useAuth';
import {
  myRecommendations,
  workRecommendations,
  type Recommendations as Data,
} from '@/app/requests/recommendations';
import { workTitle } from './workTitle';

/**
 * Recomendações de peças (Plus): "Para estudar depois desta", na página da
 * obra, e "Recomendadas para você", nos estudos. Cada peça diz por que foi
 * escolhida. Sem o Plus, três títulos desfocados e o convite para o plano.
 */
export function Recommendations({
  source,
  className,
}: {
  source: { kind: 'work'; workId: string } | { kind: 'me' };
  className?: string;
}) {
  const { language } = useRouteLanguage();
  const copy = RECOMMENDATIONS[language];
  const { isAuthenticated } = useAuth();
  const [data, setData] = useState<Data | null>(null);
  const [failed, setFailed] = useState(false);
  const [planOpen, setPlanOpen] = useState(false);
  const key = source.kind === 'work' ? source.workId : 'me';

  useEffect(() => {
    let alive = true;
    setFailed(false);
    const load =
      source.kind === 'work'
        ? workRecommendations(source.workId)
        : myRecommendations();
    load.then((r) => alive && setData(r)).catch(() => alive && setFailed(true));
    return () => {
      alive = false;
    };
    // `source` muda junto com `key` e com o login.
  }, [key, isAuthenticated]);

  const head = source.kind === 'work' ? copy.work : copy.me;
  if (failed) return null;
  if (!data) {
    return (
      <section className={cx('flex flex-col gap-4', className)} aria-busy>
        <h2 className="t-titulo max-sm:!text-[1.75rem]">{head.title}</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className="loading-skeleton block h-28 rounded-card"
            />
          ))}
        </div>
      </section>
    );
  }
  if (!data.items.length && !data.locked) {
    if (source.kind === 'work') return null;
    return (
      <section className={cx('flex flex-col gap-3', className)}>
        <h2 className="t-titulo max-sm:!text-[1.75rem]">{head.title}</h2>
        <p className="t-rotulo text-texto-suave">{copy.me.empty}</p>
      </section>
    );
  }

  return (
    <section className={cx('flex flex-col gap-5', className)}>
      <div className="flex flex-col gap-1">
        <h2 className="t-titulo flex items-center gap-2 max-sm:!text-[1.75rem]">
          {head.title}
          <span className="tint-ouro rounded-full px-3 py-1 font-sans text-[0.875rem] font-medium leading-none text-ouro-na-tinta">
            Plus
          </span>
        </h2>
        <p className="t-rotulo text-texto-suave">{head.text}</p>
      </div>

      {/* Lista e convite na mesma célula: a seção cresce até caber o maior
          dos dois, e o convite não invade o que vem depois. */}
      <div className="grid">
        <ul
          className={cx(
            'col-start-1 row-start-1 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4',
            data.locked && 'pointer-events-none select-none blur-[6px]'
          )}
          aria-hidden={data.locked || undefined}
        >
          {data.items.map((w) => (
            <li key={w.id}>
              <Link
                href={`/works/${w.id}`}
                tabIndex={data.locked ? -1 : undefined}
                className="group flex h-full flex-col gap-2 rounded-card bg-sup-2 p-5"
              >
                <span className="font-display text-[1.1875rem] leading-snug group-hover:text-ouro-texto">
                  {workTitle(w.title, w.opOrCatalog)}
                </span>
                <span className="t-rotulo text-texto-suave">
                  {[w.composer.name, w.instrumentName]
                    .filter(Boolean)
                    .join(' · ')}
                </span>
                {w.reasons.length > 0 && (
                  <span className="mt-auto flex flex-wrap gap-1.5 pt-1">
                    {w.reasons.map((r) => (
                      <span
                        key={r}
                        className="rounded-full bg-[var(--fundo)] px-2 py-0.5 text-[0.75rem] text-texto-suave"
                      >
                        {copy.reasons[r]}
                      </span>
                    ))}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>

        {data.locked && (
          // `relative`: o desfoque da lista cria uma camada própria, que era
          // pintada por cima do convite.
          <div className="relative col-start-1 row-start-1 grid place-items-center p-4">
            <div className="sup-alta flex max-w-md flex-col items-center gap-3 rounded-card p-6 text-center shadow-[var(--sombra-2)]">
              <Icon de={PiLockSimple} className="text-ouro-texto" tamanho="m" />
              <p className="font-display text-[1.25rem]">
                {isAuthenticated ? copy.locked.title : copy.locked.signIn}
              </p>
              <p className="t-rotulo text-texto-suave">{copy.locked.text}</p>
              <Button
                variante="primario"
                tamanho="p"
                icone={PiSparkle}
                onClick={() => setPlanOpen(true)}
              >
                {copy.locked.action}
              </Button>
            </div>
          </div>
        )}
      </div>
      {data.locked && (
        <RecursoDoPlano
          recurso="recommendations"
          aberto={planOpen}
          aoFechar={() => setPlanOpen(false)}
        />
      )}
    </section>
  );
}
