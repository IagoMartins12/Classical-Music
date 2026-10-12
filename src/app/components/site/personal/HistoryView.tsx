'use client';

import { useQuery } from '@tanstack/react-query';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Fragment, useState } from 'react';
import {
  PiArrowLeft,
  PiCaretDown,
  PiDatabase,
  PiFileText,
  PiMusicNotes,
  PiUser,
} from 'react-icons/pi';
import Link from 'next/link';
import { Aba, Abas } from '@/app/components/ui/Abas';
import { Button, classesDeBotao } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import { Selecao } from '@/app/components/ui/Selecao';
import { cx } from '@/app/components/ui/cx';
import { PERSONAL } from '@/app/conteudo/site/personal';
import { useRouteLanguage } from '@/app/hooks/useRouteLanguage';
import { getUploadHistory } from '@/app/requests/uploads-client';
import { formatFieldName, formatValue } from '@/app/utils/historyFormat';

interface Entry {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  changes: Record<string, unknown> | null;
  createdAt: string;
}

const TYPES = ['all', 'composer', 'work', 'score'] as const;
const ACTIONS = ['all', 'create', 'update', 'delete'] as const;
const ICONS: Record<string, typeof PiUser> = {
  composer: PiUser,
  work: PiMusicNotes,
  score: PiFileText,
};

/** The record's own name, when the change carried one. */
function nameOf(changes: Entry['changes']) {
  const pick = (v: unknown) =>
    typeof v === 'string'
      ? v
      : v && typeof v === 'object' && 'to' in v && typeof v.to === 'string'
        ? v.to
        : null;
  return pick(changes?.title) ?? pick(changes?.fullName) ?? pick(changes?.name);
}

function hrefOf(e: Entry) {
  if (e.action === 'delete') return null;
  if (e.entityType === 'composer') return `/composer/${e.entityId}`;
  if (e.entityType === 'work') return `/works/${e.entityId}`;
  return null;
}

/**
 * "Histórico de envios": every create, edit and delete in the archive, by
 * day, newest first. Filters and page live in the URL; an edit opens its
 * field-by-field changes.
 */
export function HistoryView() {
  const { language } = useRouteLanguage();
  const copy = PERSONAL[language].history;
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const type = params.get('type') ?? 'all';
  const action = params.get('action') ?? 'all';
  const page = Number(params.get('page')) || 1;
  const [open, setOpen] = useState<Set<string>>(new Set());

  const go = (patch: Record<string, string | undefined>) => {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries({ page: undefined, ...patch })) {
      if (!v || v === 'all' || (k === 'page' && v === '1')) next.delete(k);
      else next.set(k, v);
    }
    const qs = next.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const list = useQuery({
    queryKey: ['upload-history', type, action, page],
    queryFn: async () => {
      const result = await getUploadHistory<Entry>(
        new URLSearchParams({ page: String(page), type, action })
      );
      if (!result.ok) throw new Error(result.error);
      return result.data;
    },
  });

  const entries = list.data?.history ?? [];
  const totalPages = list.data?.pagination.totalPages ?? 1;
  const day = (d: string) =>
    new Intl.DateTimeFormat(language === 'pt' ? 'pt-BR' : 'en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(d));
  const time = (d: string) =>
    new Intl.DateTimeFormat(language === 'pt' ? 'pt-BR' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(d));

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/upload"
        className={cx(classesDeBotao('fantasma', 'p'), 'self-start')}
      >
        <Icon de={PiArrowLeft} tamanho="pp" /> {copy.back}
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Abas rotulo={copy.title}>
          {TYPES.map((t) => (
            <Aba key={t} ativa={type === t} onClick={() => go({ type: t })}>
              {copy.types[t]}
            </Aba>
          ))}
        </Abas>
        <Selecao
          aria-label={copy.actionLabel}
          className="min-h-10! w-max! rounded-full! py-0! text-[0.9375rem]"
          opcoes={ACTIONS.map((a) => ({ value: a, label: copy.actions[a] }))}
          valor={action}
          aoMudar={(a) => go({ action: a })}
        />
      </div>

      {list.isPending ? (
        <ul className="flex flex-col gap-3" aria-hidden="true">
          {[0, 1, 2, 3].map((i) => (
            <li key={i} className="loading-skeleton h-16 rounded-card" />
          ))}
        </ul>
      ) : list.error ? (
        <div className="flex flex-col items-start gap-3 rounded-card bg-sup-2 p-6">
          <p className="t-rotulo text-texto-suave">{copy.error}</p>
          <Button
            variante="fantasma"
            tamanho="p"
            onClick={() => list.refetch()}
          >
            {copy.retry}
          </Button>
        </div>
      ) : !entries.length ? (
        <p className="t-rotulo rounded-card bg-sup-2 p-6 text-texto-suave">
          {type === 'all' && action === 'all' ? copy.empty : copy.emptyFiltered}
        </p>
      ) : (
        <ol className="flex flex-col">
          {entries.map((e, i) => {
            const first =
              i === 0 || day(entries[i - 1].createdAt) !== day(e.createdAt);
            const bulk = e.changes?.bulkImport as
              | { successfulWorks: number; composerName: string }
              | undefined;
            const name = nameOf(e.changes);
            const href = hrefOf(e);
            const fields =
              e.action === 'update' && e.changes && !bulk
                ? Object.entries(e.changes).filter(
                    ([, v]) =>
                      v !== undefined &&
                      // A field sent but left as it was is not a change.
                      !(
                        v &&
                        typeof v === 'object' &&
                        'to' in v &&
                        JSON.stringify((v as { from?: unknown }).from) ===
                          JSON.stringify((v as { to?: unknown }).to)
                      )
                  )
                : [];
            const isOpen = open.has(e.id);
            return (
              <Fragment key={e.id}>
                {first && (
                  <li className="t-legenda pb-2 pt-6 first:pt-0">
                    {day(e.createdAt)}
                  </li>
                )}
                <li className="border-b border-linha py-3">
                  <div className="flex items-start gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-sup-2 text-ouro-texto">
                      <Icon
                        de={
                          bulk
                            ? PiDatabase
                            : (ICONS[e.entityType] ?? PiFileText)
                        }
                        tamanho="p"
                      />
                    </span>
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <p className="text-[0.9375rem] text-texto">
                        {bulk ? (
                          copy.bulk(bulk.successfulWorks, bulk.composerName)
                        ) : (
                          <>
                            {copy.sentence[e.action] ?? copy.sentence.update}{' '}
                            {copy.entity[e.entityType] ?? e.entityType}{' '}
                            {name &&
                              (href ? (
                                <Link
                                  href={href}
                                  className="font-display text-[1.0625rem] text-texto underline decoration-transparent underline-offset-4 hover:decoration-[var(--ouro)]"
                                >
                                  {name}
                                </Link>
                              ) : (
                                <span className="font-display text-[1.0625rem]">
                                  {name}
                                </span>
                              ))}
                          </>
                        )}
                      </p>
                      <span className="t-legenda">{time(e.createdAt)}</span>
                    </div>
                    {fields.length > 0 && (
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        onClick={() =>
                          setOpen((s) => {
                            const n = new Set(s);
                            if (n.has(e.id)) n.delete(e.id);
                            else n.add(e.id);
                            return n;
                          })
                        }
                        className="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-full px-3 text-[0.8125rem] text-texto-suave hover:bg-sup-2 hover:text-texto"
                      >
                        {isOpen ? copy.hide : copy.changes}
                        <Icon
                          de={PiCaretDown}
                          tamanho="pp"
                          className={cx(
                            'transition-transform',
                            isOpen && 'rotate-180'
                          )}
                        />
                      </button>
                    )}
                  </div>
                  {isOpen && (
                    <dl className="ml-13 mt-3 grid gap-2 rounded-card bg-sup-2 p-4 text-[0.875rem]">
                      {fields.map(([field, v]) => {
                        const change =
                          v && typeof v === 'object' && 'to' in v
                            ? (v as { from?: unknown; to?: unknown })
                            : null;
                        return (
                          <div
                            key={field}
                            className="grid gap-1 sm:grid-cols-[10rem_minmax(0,1fr)]"
                          >
                            <dt className="text-texto-fraco">
                              {formatFieldName(field)}
                            </dt>
                            <dd className="min-w-0 break-words text-texto">
                              {change ? (
                                <>
                                  <span className="text-texto-fraco line-through">
                                    {formatValue(change.from)}
                                  </span>{' '}
                                  <span className="text-texto-fraco">→</span>{' '}
                                  {formatValue(change.to)}
                                </>
                              ) : (
                                formatValue(v)
                              )}
                            </dd>
                          </div>
                        );
                      })}
                    </dl>
                  )}
                </li>
              </Fragment>
            );
          })}
        </ol>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-3">
          <Button
            variante="fantasma"
            tamanho="p"
            disabled={page <= 1}
            onClick={() => go({ page: String(page - 1) })}
          >
            {copy.previous}
          </Button>
          <span className="t-legenda">{copy.page(page, totalPages)}</span>
          <Button
            variante="fantasma"
            tamanho="p"
            disabled={page >= totalPages}
            onClick={() => go({ page: String(page + 1) })}
          >
            {copy.next}
          </Button>
        </div>
      )}
    </div>
  );
}
