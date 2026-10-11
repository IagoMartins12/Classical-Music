'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  PiFlag,
  PiLockSimple,
  PiNotePencil,
  PiPencilSimple,
  PiSealCheck,
  PiThumbsDown,
  PiThumbsUp,
  PiTrash,
} from 'react-icons/pi';
import ConfirmModal from '@/app/components/ConfirmModal';
import { Button } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import { Selecao } from '@/app/components/ui/Selecao';
import { cx } from '@/app/components/ui/cx';
import {
  ANNOTATIONS,
  type AnnotationsCopy,
} from '@/app/conteudo/site/annotations';
import { PERSONAL } from '@/app/conteudo/site/personal';
import { useAuth } from '@/app/hooks/useAuth';
import { useRouteLanguage } from '@/app/hooks/useRouteLanguage';
import { useSignInGate } from '@/app/hooks/useSignInGate';
import {
  deleteAnnotationRequest,
  listAnnotations,
  voteAnnotationRequest,
} from '@/app/requests/library';
import type {
  AnnotationCategory,
  AnnotationScope,
  WorkAnnotation,
} from '@/app/stores/useAnnotationsStore';
import { chip } from '../choice';
import { ReportSheet } from '../ReportButton';
import { AnnotationSheet } from './AnnotationSheet';

type Order = 'helpful' | 'recent' | 'measure';
const PAGE = 50;
const MAX_PAGES = 4;

async function workAnnotations(workId: string) {
  const all: WorkAnnotation[] = [];
  for (let page = 1; page <= MAX_PAGES; page++) {
    const result = await listAnnotations(
      new URLSearchParams({
        workId,
        sortBy: 'helpful',
        limit: String(PAGE),
        page: String(page),
      })
    );
    if (!result.ok) throw new Error('annotations');
    all.push(...result.data.annotations);
    if (!result.data.pagination.hasMore) break;
  }
  return all;
}

const short = 180;

/** Where the note sits: measures, section, movement, page, hand. */
function place(a: WorkAnnotation, copy: AnnotationsCopy) {
  return [
    a.scope === 'ENTIRE_WORK'
      ? copy.where_.whole
      : copy.where_.measure(a.measureStart, a.measureEnd),
    a.section,
    a.movement,
    a.pageNumber && copy.where_.page(a.pageNumber),
    a.hand && copy.where_.hand(a.hand),
  ]
    .filter(Boolean)
    .join(' · ');
}

function AnnotationCard({
  annotation: a,
  mine,
  language,
  onEdit,
  onRemove,
}: {
  annotation: WorkAnnotation;
  mine: boolean;
  language: 'pt' | 'en';
  onEdit: () => void;
  onRemove: () => void;
}) {
  const copy = ANNOTATIONS[language];
  const names = PERSONAL[language].annotations;
  const allowed = useSignInGate();
  const [vote, setVote] = useState<boolean | null>(a.userVote);
  const [helpful, setHelpful] = useState(a.helpfulCount);
  const [open, setOpen] = useState(false);
  const [reporting, setReporting] = useState(false);
  const long = a.content.length > short;
  const name =
    [a.user.firstName, a.user.lastName].filter(Boolean).join(' ') ||
    a.user.username ||
    '?';
  const role = a.user.userType ? copy.roles[a.user.userType] : null;
  const date = new Intl.DateTimeFormat(language === 'pt' ? 'pt-BR' : 'en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(a.createdAt));

  const cast = async (isHelpful: boolean) => {
    if (!allowed('annotate')) return;
    const result = await voteAnnotationRequest(a.id, isHelpful).catch(
      () => null
    );
    if (!result?.ok) return toast.error(copy.failed);
    setVote(result.data.userVote);
    setHelpful(result.data.helpfulCount);
  };

  return (
    <li className="flex flex-col gap-3 rounded-card bg-sup-2 p-5">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="inline-flex min-h-6 items-center rounded-full bg-[var(--fundo)] px-2.5 text-[0.75rem] text-texto-suave">
          {names.categories[a.category]}
        </span>
        <span className="t-legenda">{place(a, copy)}</span>
        <span className="t-legenda ml-auto">{names.levels[a.difficulty]}</span>
      </div>
      <h3 className="font-display text-[1.3125rem] leading-snug">{a.title}</h3>
      <p className="t-rotulo whitespace-pre-line text-texto-suave">
        {long && !open ? `${a.content.slice(0, short)}…` : a.content}{' '}
        {long && (
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="text-ouro-texto underline-offset-4 hover:underline"
          >
            {open ? copy.less : copy.more}
          </button>
        )}
      </p>
      {a.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {a.tags.map((tag) => (
            <span key={tag} className="t-dado text-[0.75rem] text-texto-fraco">
              #{tag}
            </span>
          ))}
        </div>
      )}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-[var(--linha)] pt-3">
        <span className="t-rotulo flex min-w-0 items-center gap-2">
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[var(--fundo)] font-display text-ouro-texto">
            {name[0]}
          </span>
          <span className="truncate">{mine ? copy.you : name}</span>
          {role && <span className="text-texto-fraco">· {role}</span>}
          {a.isVerified && (
            <Icon
              de={PiSealCheck}
              tamanho="pp"
              rotulo={copy.verified}
              className="text-verificado"
            />
          )}
          <span className="text-texto-fraco">· {date}</span>
          {(!a.isPublic || a.isHidden) && (
            <Icon
              de={PiLockSimple}
              tamanho="pp"
              rotulo={a.isHidden ? copy.held : copy.privateNote}
              className="text-texto-fraco"
            />
          )}
        </span>
        <span className="ml-auto flex items-center gap-1">
          <button
            type="button"
            aria-pressed={vote === true}
            onClick={() => void cast(true)}
            className={cx(
              'inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 text-[0.8125rem]',
              vote === true
                ? 'tint-ouro text-ouro-na-tinta'
                : 'text-texto-suave hover:bg-[var(--fundo)]'
            )}
          >
            <Icon de={PiThumbsUp} tamanho="p" /> {copy.helpful} · {helpful}
          </button>
          <button
            type="button"
            aria-pressed={vote === false}
            aria-label={copy.notHelpful}
            onClick={() => void cast(false)}
            className={cx(
              'grid h-9 w-9 place-items-center rounded-full',
              vote === false
                ? 'text-texto'
                : 'text-texto-fraco hover:bg-[var(--fundo)]'
            )}
          >
            <Icon de={PiThumbsDown} tamanho="p" />
          </button>
          {!mine && (
            <Button
              tamanho="p"
              variante="fantasma"
              icone={PiFlag}
              rotulo={copy.report}
              onClick={() => allowed('report') && setReporting(true)}
            />
          )}
          {mine && (
            <>
              <Button
                tamanho="p"
                variante="fantasma"
                icone={PiPencilSimple}
                rotulo={copy.edit}
                onClick={onEdit}
              />
              <Button
                tamanho="p"
                variante="fantasma"
                icone={PiTrash}
                rotulo={copy.remove}
                onClick={onRemove}
              />
            </>
          )}
        </span>
      </div>
      {!mine && (
        <ReportSheet
          entityType="annotation"
          entityId={a.id}
          name={a.title}
          open={reporting}
          onClose={() => setReporting(false)}
        />
      )}
    </li>
  );
}

/**
 * "Anotações de quem toca", as in sketch A: the work's margin notes,
 * filtered by kind and place and ordered by helpfulness, date or measure.
 * Each note can be voted helpful; your own can be edited and deleted.
 */
export function WorkAnnotations({ workId }: { workId: string }) {
  const { language } = useRouteLanguage();
  const copy = ANNOTATIONS[language];
  const names = PERSONAL[language].annotations;
  const { user } = useAuth();
  const allowed = useSignInGate();
  const client = useQueryClient();
  const key = ['annotations', 'work', workId, user?.id ?? 'guest'];
  const query = useQuery({
    queryKey: key,
    queryFn: () => workAnnotations(workId),
  });
  const [category, setCategory] = useState<AnnotationCategory | 'all'>('all');
  const [scope, setScope] = useState<AnnotationScope | 'all'>('all');
  const [order, setOrder] = useState<Order>('helpful');
  const [writing, setWriting] = useState(false);
  const [editing, setEditing] = useState<WorkAnnotation | null>(null);
  const [removing, setRemoving] = useState<WorkAnnotation | null>(null);
  const [busy, setBusy] = useState(false);
  const all = useMemo(() => query.data ?? [], [query.data]);

  const counts = useMemo(() => {
    const c = new Map<AnnotationCategory, number>();
    for (const a of all) c.set(a.category, (c.get(a.category) ?? 0) + 1);
    return c;
  }, [all]);

  const list = useMemo(() => {
    const kept = all.filter(
      (a) =>
        (category === 'all' || a.category === category) &&
        (scope === 'all' || a.scope === scope)
    );
    if (order === 'recent')
      return [...kept].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    if (order === 'measure')
      return [...kept].sort(
        (a, b) => (a.measureStart ?? Infinity) - (b.measureStart ?? Infinity)
      );
    return [...kept].sort((a, b) => b.helpfulCount - a.helpfulCount);
  }, [all, category, scope, order]);

  const refresh = () => client.invalidateQueries({ queryKey: ['annotations'] });
  const remove = async () => {
    if (!removing) return;
    setBusy(true);
    const result = await deleteAnnotationRequest(removing.id).catch(() => null);
    setBusy(false);
    if (!result?.ok) {
      toast.error(copy.failed);
      return;
    }
    toast.success(copy.removed);
    setRemoving(null);
    void refresh();
  };

  const publicCount = all.filter((a) => a.isPublic).length;

  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="t-titulo max-sm:!text-[1.75rem]">{copy.title}</h2>
          <span className="t-rotulo text-texto-suave">
            {publicCount ? copy.count(publicCount) : copy.none}
          </span>
        </div>
        <Button
          variante="primario"
          icone={PiNotePencil}
          onClick={() => allowed('annotate') && setWriting(true)}
        >
          {copy.write}
        </Button>
      </div>

      {all.length > 0 && (
        <>
          <div className="scroll-strip -mx-4 flex gap-2 overflow-x-auto px-4">
            <button
              type="button"
              aria-pressed={category === 'all'}
              onClick={() => setCategory('all')}
              className={chip(category === 'all')}
            >
              {copy.all}
            </button>
            {[...counts].map(([c, n]) => (
              <button
                key={c}
                type="button"
                aria-pressed={category === c}
                onClick={() => setCategory(c)}
                className={chip(category === c)}
              >
                {names.categories[c]} · {n}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="w-48">
              <Selecao
                aria-label={copy.where}
                className="min-h-10! rounded-full! py-0! text-[0.9375rem]"
                opcoes={[
                  { value: 'all', label: copy.anywhere },
                  ...(Object.keys(copy.scopes) as AnnotationScope[]).map(
                    (s) => ({ value: s, label: copy.scopes[s] })
                  ),
                ]}
                valor={scope}
                aoMudar={(v) => setScope(v as AnnotationScope | 'all')}
              />
            </div>
            <div className="w-48">
              <Selecao
                aria-label={copy.order}
                className="min-h-10! rounded-full! py-0! text-[0.9375rem]"
                opcoes={(Object.keys(copy.orders) as Order[]).map((o) => ({
                  value: o,
                  label: copy.orders[o],
                }))}
                valor={order}
                aoMudar={(v) => setOrder(v as Order)}
              />
            </div>
          </div>
        </>
      )}

      {query.isError ? (
        <p className="t-rotulo text-texto-suave">{copy.error}</p>
      ) : query.isPending ? (
        <ul
          className="grid grid-cols-1 gap-3 lg:grid-cols-2"
          aria-hidden="true"
        >
          {[0, 1].map((i) => (
            <li key={i} className="loading-skeleton h-44 rounded-card" />
          ))}
        </ul>
      ) : list.length ? (
        <ul className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {list.map((a) => (
            <AnnotationCard
              key={a.id}
              annotation={a}
              mine={!!user?.id && a.userId === user.id}
              language={language}
              onEdit={() => setEditing(a)}
              onRemove={() => setRemoving(a)}
            />
          ))}
        </ul>
      ) : (
        <p className="t-rotulo rounded-card bg-sup-2 p-6 text-texto-suave">
          {all.length ? copy.noMatch : copy.empty}
        </p>
      )}

      <AnnotationSheet
        open={writing || !!editing}
        onClose={() => {
          setWriting(false);
          setEditing(null);
        }}
        onSaved={() => void refresh()}
        workId={workId}
        editing={editing}
      />
      <ConfirmModal
        isOpen={!!removing}
        onClose={() => setRemoving(null)}
        onConfirm={remove}
        type="danger"
        title={copy.removeTitle}
        message={copy.removeText}
        confirmText={copy.removeConfirm}
        isLoading={busy}
      />
    </section>
  );
}
