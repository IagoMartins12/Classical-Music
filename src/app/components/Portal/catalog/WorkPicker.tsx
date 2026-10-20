'use client';

// O seletor de obra do acervo — compositor primeiro, depois a obra (pedido de
// 04/10), e a partitura da própria obra quando se quer apontar uma. Tudo vem
// das rotas do catálogo: nada de obra inventada nem "edição" à parte — a
// edição é a partitura que já está na base.

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { PiArrowLeft, PiCheck } from 'react-icons/pi';
import { Icon } from '@/app/components/ui/Icon';
import { cx } from '@/app/components/ui/cx';
import { errorText } from '@/app/hooks/portal/query';
import * as api from '@/app/requests/portal/api';
import { Avatar, SearchBox } from '../pieces';
import { useDebounced } from '../useDebounced';
import type { PickedScore } from './ScorePick';

export interface PickedWork {
  work: { id: string; title: string; composer: { id: string; name: string } };
  score: PickedScore | null;
}

/** O nome que a aula mostra: o completo, quando o acervo tem. */
const composerName = (c: api.CatalogComposer) => c.fullName?.trim() || c.name;

const years = (c: api.CatalogComposer) => {
  const b = c.birthDate?.slice(0, 4);
  const d = c.deathDate?.slice(0, 4);
  return b ? `${b}–${d ?? ''}` : (c.epochName ?? '');
};

export function WorkPicker({
  onPick,
  withScore = false,
  selectedIds = [],
  onPickComposer,
}: {
  onPick: (picked: PickedWork) => void;
  /** Aula só com o compositor (técnica, escuta): oferece vincular só ele. */
  onPickComposer?: (composer: { id: string; name: string }) => void;
  /** Pede a partitura depois da obra (opcional para quem escolhe). */
  withScore?: boolean;
  selectedIds?: string[];
}) {
  const [term, setTerm] = useState('');
  const [composer, setComposer] = useState<api.CatalogComposer | null>(null);
  const [work, setWork] = useState<api.CatalogWork | null>(null);
  const q = useDebounced(term.trim(), 300);

  const composers = useQuery({
    queryKey: ['catalog', 'composers', q],
    queryFn: () => api.searchComposers(q),
    enabled: !composer && q.length >= 2,
    staleTime: 5 * 60_000,
  });
  const works = useQuery({
    queryKey: ['catalog', 'works', composer?.id, q],
    queryFn: () => api.composerWorks(composer!.id, q),
    enabled: Boolean(composer) && !work,
    staleTime: 5 * 60_000,
  });
  const scores = useQuery({
    queryKey: ['catalog', 'scores', work?.id],
    queryFn: () => api.workScores(work!.id),
    enabled: withScore && Boolean(work),
    staleTime: 5 * 60_000,
  });

  const finish = (w: api.CatalogWork, score: api.CatalogScore | null) => {
    onPick({
      work: {
        id: w.id,
        title: w.title,
        composer: { id: composer!.id, name: composerName(composer!) },
      },
      score: score && {
        id: score.id,
        title: score.title,
        source: score.source as PickedScore['source'],
      },
    });
    setWork(null);
    setTerm('');
  };

  const back = (
    <button
      type="button"
      onClick={() => (work ? setWork(null) : (setComposer(null), setTerm('')))}
      className="inline-flex min-h-9 w-fit items-center gap-1.5 text-sm font-medium text-ouro-texto"
    >
      <Icon de={PiArrowLeft} tamanho="p" />{' '}
      {work ? composer?.name : 'Outro compositor'}
    </button>
  );

  // Passo 3: a partitura da obra (ou nenhuma).
  if (work && withScore)
    return (
      <div className="flex flex-col gap-3">
        {back}
        <p className="font-display text-lg leading-snug">{work.title}</p>
        <span className="t-legenda">
          Qual partitura? A da base, para o aluno abrir direto.
        </span>
        <ul
          className="flex max-h-72 flex-col overflow-y-auto rolagem-discreta"
          aria-busy={scores.isFetching}
        >
          <li>
            <button
              type="button"
              onClick={() => finish(work, null)}
              className="w-full border-b border-linha py-2.5 text-left text-[0.9375rem] text-texto-suave hover:text-ouro-texto"
            >
              Sem partitura específica
            </button>
          </li>
          {(scores.data?.scores ?? []).map((s) => (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => finish(work, s)}
                className="flex w-full flex-col border-b border-linha py-2.5 text-left hover:text-ouro-texto"
              >
                <span className="text-[0.9375rem]">{s.title}</span>
                <span className="t-legenda">
                  {[s.editor, s.publisher, s.pageCount && `${s.pageCount} p.`]
                    .filter(Boolean)
                    .join(' · ') || s.source}
                </span>
              </button>
            </li>
          ))}
        </ul>
        {scores.data && scores.data.scores.length === 0 && (
          <p className="t-legenda">
            Esta obra ainda não tem partitura na base.
          </p>
        )}
      </div>
    );

  // Passo 2: as obras do compositor.
  if (composer)
    return (
      <div className="flex flex-col gap-3">
        <span className="flex flex-wrap items-center justify-between gap-2">
          {back}
          {onPickComposer && (
            <button
              type="button"
              onClick={() => (
                onPickComposer({
                  id: composer.id,
                  name: composerName(composer),
                }),
                setComposer(null),
                setTerm('')
              )}
              className="text-sm font-medium text-ouro-texto"
            >
              Vincular só {composer.name}
            </button>
          )}
        </span>
        <SearchBox
          value={term}
          onChange={setTerm}
          label={`Obra de ${composer.name}`}
        />
        {works.error ? (
          <p className="text-sm text-erro">{errorText(works.error)}</p>
        ) : (
          <ul
            className="flex max-h-72 flex-col overflow-y-auto rolagem-discreta"
            aria-busy={works.isFetching}
          >
            {(works.data?.works ?? []).map((w) => {
              const picked = selectedIds.includes(w.id);
              return (
                <li key={w.id}>
                  <button
                    type="button"
                    disabled={picked}
                    onClick={() => (withScore ? setWork(w) : finish(w, null))}
                    className={cx(
                      'flex w-full items-center justify-between gap-3 border-b border-linha py-2.5 text-left',
                      picked ? 'text-texto-fraco' : 'hover:text-ouro-texto'
                    )}
                  >
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate text-[0.9375rem]">
                        {w.title}
                      </span>
                      <span className="t-legenda truncate">
                        {[w.opOrCatalog, w.tone, w.instrument?.name]
                          .filter(Boolean)
                          .join(' · ')}
                      </span>
                    </span>
                    {picked && (
                      <Icon de={PiCheck} tamanho="p" rotulo="Já escolhida" />
                    )}
                  </button>
                </li>
              );
            })}
            {works.data && works.data.works.length === 0 && (
              <li className="py-3 text-sm text-texto-suave">
                Nenhuma obra com esse nome.
              </li>
            )}
          </ul>
        )}
      </div>
    );

  // Passo 1: o compositor.
  return (
    <div className="flex flex-col gap-3">
      <SearchBox value={term} onChange={setTerm} label="Compositor" />
      {q.length > 0 && q.length < 2 ? null : composers.error ? (
        <p className="text-sm text-erro">{errorText(composers.error)}</p>
      ) : (
        <ul
          className="flex max-h-72 flex-col overflow-y-auto rolagem-discreta"
          aria-busy={composers.isFetching}
        >
          {(composers.data ?? []).map((c) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => (setComposer(c), setTerm(''))}
                className="flex w-full items-center gap-3 border-b border-linha py-2 text-left hover:text-ouro-texto"
              >
                <Avatar name={c.name} image={c.portraitUrl} size="p" />
                <span className="flex min-w-0 flex-col">
                  <span className="truncate text-[0.9375rem]">
                    {composerName(c)}
                  </span>
                  <span className="t-legenda">{years(c)}</span>
                </span>
              </button>
            </li>
          ))}
          {composers.data && composers.data.length === 0 && (
            <li className="py-3 text-sm text-texto-suave">
              Nenhum compositor com esse nome.
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
