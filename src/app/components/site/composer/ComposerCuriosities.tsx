'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import toast from 'react-hot-toast';
import {
  PiFlag,
  PiLightbulb,
  PiLockSimple,
  PiPlus,
  PiTrash,
} from 'react-icons/pi';
import { Button } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import { cx } from '@/app/components/ui/cx';
import { CONTRIBUTE } from '@/app/conteudo/site/contribute';
import { useAuth } from '@/app/hooks/useAuth';
import { useRouteLanguage } from '@/app/hooks/useRouteLanguage';
import { useSignInGate } from '@/app/hooks/useSignInGate';
import {
  type Curiosity,
  fetchCuriosities,
  removeCuriosity,
} from '@/app/requests/contributions';
import { ReportSheet } from '../ReportButton';
import { useContribute } from '../contribute/Contribute';

/**
 * The composer's curiosities: the editorial ones and what people shared,
 * with who shared it. Painted from the server; a signed-in visitor
 * refetches to also see their own held ones. "Acrescentar" opens the
 * contribution sheet on its curiosity tab.
 */
export function ComposerCuriosities({
  composerId,
  name,
  initial,
  heading,
  wide,
}: {
  composerId: string;
  name: string;
  initial: Curiosity[];
  heading: string;
  /** Alone in the row: two columns from tablet up. */
  wide: boolean;
}) {
  const { language } = useRouteLanguage();
  const copy = CONTRIBUTE[language].curiosities;
  const { isAuthenticated } = useAuth();
  const allowed = useSignInGate();
  const client = useQueryClient();
  const router = useRouter();
  const key = ['curiosities', composerId, language];
  const { data: list = initial } = useQuery({
    queryKey: key,
    queryFn: () => fetchCuriosities(composerId, language),
    initialData: initial,
    // The server copy may be an hour old: signed in, fetch the live list.
    initialDataUpdatedAt: 0,
    enabled: isAuthenticated,
  });
  const { open } = useContribute();
  const [reporting, setReporting] = useState<Curiosity | null>(null);

  const update = (next: (current: Curiosity[]) => Curiosity[]) =>
    client.setQueryData<Curiosity[]>(key, (current) => next(current ?? list));

  const remove = async (curiosity: Curiosity) => {
    const result = await removeCuriosity(curiosity.id).catch(() => null);
    if (!result?.ok) return toast.error(CONTRIBUTE[language].failed);
    update((current) => current.filter((c) => c.id !== curiosity.id));
    toast.success(copy.removed);
    router.refresh();
  };

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="t-titulo max-sm:!text-[1.75rem]">{heading}</h2>
        {list.length > 0 && (
          <Button
            variante="fantasma"
            tamanho="p"
            icone={PiPlus}
            onClick={() => open('curiosity')}
          >
            {copy.add}
          </Button>
        )}
      </div>
      {list.length ? (
        <Paginas
          itens={list}
          rotulo={heading}
          rotuloDaPagina={(i, n) =>
            language === 'en' ? `Page ${i} of ${n}` : `Página ${i} de ${n}`
          }
          classeDaPagina={cx(
            'grid grid-cols-1 gap-3',
            wide && 'md:grid-cols-2'
          )}
          render={(c) => (
            <li
              key={c.id}
              className="flex items-start gap-3 rounded-card bg-sup-2 p-4"
            >
              <Icon
                de={PiLightbulb}
                tamanho="m"
                className="mt-0.5 shrink-0 text-ouro-texto"
              />
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="t-rotulo">{c.text}</span>
                {c.source === 'USER' && (c.author || c.mine) && (
                  <span className="t-legenda flex flex-wrap items-center gap-x-2">
                    {c.mine
                      ? c.author
                        ? copy.you
                        : copy.youUnsigned
                      : copy.by(c.author?.name ?? '')}
                    {c.held && (
                      <Icon
                        de={PiLockSimple}
                        tamanho="pp"
                        rotulo={copy.held}
                        className="text-texto-fraco"
                      />
                    )}
                  </span>
                )}
              </div>
              {c.source === 'USER' &&
                (c.mine ? (
                  <Button
                    tamanho="p"
                    variante="fantasma"
                    icone={PiTrash}
                    rotulo={copy.remove}
                    onClick={() => void remove(c)}
                  />
                ) : (
                  <Button
                    tamanho="p"
                    variante="fantasma"
                    icone={PiFlag}
                    rotulo={copy.report}
                    onClick={() => allowed('report') && setReporting(c)}
                  />
                ))}
            </li>
          )}
        />
      ) : (
        <div className="flex flex-col items-start gap-4 rounded-card bg-sup-2 p-6">
          <p className="t-corpo text-texto-suave">{copy.first(name)}</p>
          <Button
            variante="secundario"
            icone={PiPlus}
            onClick={() => open('curiosity')}
          >
            {copy.add}
          </Button>
        </div>
      )}
      <ReportSheet
        entityType="curiosity"
        entityId={reporting?.id ?? ''}
        name={reporting?.text.slice(0, 60) ?? ''}
        open={!!reporting}
        onClose={() => setReporting(null)}
      />
    </section>
  );
}

/** Curiosidades por página: até quatro, sem carrossel; mais que isso, de 4 em 4. */
const POR_PAGINA = 4;

function Paginas({
  itens,
  render,
  rotulo,
  rotuloDaPagina,
  classeDaPagina,
}: {
  itens: Curiosity[];
  render: (c: Curiosity) => ReactNode;
  rotulo: string;
  rotuloDaPagina: (i: number, total: number) => string;
  classeDaPagina: string;
}) {
  const trilho = useRef<HTMLDivElement>(null);
  const [atual, setAtual] = useState(0);
  const paginas: Curiosity[][] = [];
  for (let i = 0; i < itens.length; i += POR_PAGINA)
    paginas.push(itens.slice(i, i + POR_PAGINA));

  useEffect(() => {
    const el = trilho.current;
    if (!el || paginas.length < 2) return;
    const medir = () =>
      setAtual(Math.round(el.scrollLeft / Math.max(el.clientWidth, 1)));
    el.addEventListener('scroll', medir, { passive: true });
    return () => el.removeEventListener('scroll', medir);
  }, [paginas.length]);

  if (paginas.length < 2)
    return <ul className={classeDaPagina}>{itens.map(render)}</ul>;

  const irPara = (i: number) => {
    const el = trilho.current;
    if (!el) return;
    const reduzido = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    el.scrollTo({
      left: i * el.clientWidth,
      behavior: reduzido ? 'auto' : 'smooth',
    });
  };

  return (
    <div className="flex flex-col gap-1">
      <div
        ref={trilho}
        aria-label={rotulo}
        className="flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {paginas.map((pagina, i) => (
          <ul
            key={i}
            aria-label={rotuloDaPagina(i + 1, paginas.length)}
            className={cx(
              'w-full shrink-0 snap-start content-start',
              classeDaPagina
            )}
          >
            {pagina.map(render)}
          </ul>
        ))}
      </div>
      {/* Os pontos, como no carrossel do site: um por página. */}
      <div role="group" aria-label={rotulo} className="flex justify-center">
        {paginas.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={rotuloDaPagina(i + 1, paginas.length)}
            aria-current={i === atual ? 'true' : undefined}
            onClick={() => irPara(i)}
            className="group grid h-11 min-w-8 place-items-center px-1"
          >
            <span
              aria-hidden="true"
              className={cx(
                'block h-2 rounded-full transition-[width,background-color] duration-[var(--t-resposta)] ease-saida motion-reduce:transition-none',
                i === atual
                  ? 'w-6 bg-ouro'
                  : 'w-2 bg-linha-forte group-hover:bg-texto-fraco'
              )}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
