'use client';

import { useSaidas } from '@/app/components/ui/useSaida';
import ConfirmModal from '@/app/components/ConfirmModal';
import { ANNOTATIONS } from '@/app/conteudo/site/annotations';
import { AnnotationSheet } from '../annotations/AnnotationSheet';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import {
  PiGlobeSimple,
  PiLockSimple,
  PiMagnifyingGlass,
  PiPencilSimple,
  PiThumbsUp,
  PiTrash,
} from 'react-icons/pi';
import toast from 'react-hot-toast';
import Link from '@/app/components/LocalizedLink';
import { Button, classesDeBotao } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import { Selecao } from '@/app/components/ui/Selecao';
import { PERSONAL, type PersonalCopy } from '@/app/conteudo/site/personal';
import { useAuth } from '@/app/hooks/useAuth';
import { useRouteLanguage } from '@/app/hooks/useRouteLanguage';
import {
  deleteAnnotationRequest,
  listAnnotations,
} from '@/app/requests/library';
import type { WorkAnnotation } from '@/app/stores/useAnnotationsStore';
import { ListResults, ViewToggle } from '../lists/ViewToggle';
import { workTitle } from '../workTitle';
import { chip } from '../choice';

type Visibility = 'all' | 'public' | 'private';
/** The API serves 50 per page; a person's notes rarely pass a few pages. */
const PAGE_LIMIT = 50;
const MAX_PAGES = 10;

async function allMyAnnotations(userId: string) {
  const all: WorkAnnotation[] = [];
  for (let page = 1; page <= MAX_PAGES; page++) {
    const result = await listAnnotations(
      new URLSearchParams({
        userId,
        sortBy: 'recent',
        limit: String(PAGE_LIMIT),
        page: String(page),
      })
    );
    if (!result.ok) throw new Error('annotations');
    all.push(...result.data.annotations);
    if (!result.data.pagination.hasMore) break;
  }
  return all;
}

const normalize = (s: string) =>
  s
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();

/** "Your annotations": every note you left on a work, filtered by visibility, work and text. */
export function AnnotationsView() {
  const { language } = useRouteLanguage();
  const copy = PERSONAL[language].annotations;
  const sheetCopy = ANNOTATIONS[language];
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const key = ['annotations', 'mine', user?.id];
  const { data, isError, isPending } = useQuery({
    queryKey: key,
    enabled: !!user?.id,
    queryFn: () => allMyAnnotations(user!.id),
  });
  const [visibility, setVisibility] = useState<Visibility>('all');
  const [workId, setWorkId] = useState('');
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<WorkAnnotation | null>(null);
  const [removing, setRemoving] = useState<WorkAnnotation | null>(null);
  const annotations = useMemo(() => data ?? [], [data]);

  const works = useMemo(() => {
    const seen = new Map<string, string>();
    for (const a of annotations) {
      if (a.work && !seen.has(a.workId))
        seen.set(a.workId, workTitle(a.work.title, a.work.opOrCatalog));
    }
    return [...seen].map(([value, label]) => ({ value, label }));
  }, [annotations]);

  const visible = useMemo(() => {
    const q = normalize(query.trim());
    return annotations.filter(
      (a) =>
        (visibility === 'all' || (visibility === 'public') === a.isPublic) &&
        (!workId || a.workId === workId) &&
        (!q ||
          normalize(
            `${a.title} ${a.content} ${a.work?.title ?? ''} ${a.tags.join(' ')}`
          ).includes(q))
    );
  }, [annotations, visibility, workId, query]);

  const refresh = () => queryClient.invalidateQueries({ queryKey: key });
  const remove = async () => {
    if (!removing) return;
    // The confirmation closes and the card leaves while the API removes it;
    // a failure brings it back.
    const item = removing;
    setRemoving(null);
    const exit = leaving.sair(item.id);
    const result = await deleteAnnotationRequest(item.id).catch(() => null);
    await exit;
    if (result?.ok) {
      toast.success(copy.removed);
      refresh();
    } else {
      leaving.voltar(item.id);
      toast.error(copy.removeFailed);
    }
  };
  const leaving = useSaidas();

  if (isError) return <p className="t-rotulo text-texto-suave">{copy.error}</p>;
  if (isPending)
    return (
      <span
        aria-hidden="true"
        className="loading-skeleton block h-64 rounded-card"
      />
    );

  if (!annotations.length) {
    return (
      <div className="flex flex-col items-start gap-3 rounded-card bg-sup-2 p-8">
        <p className="font-display text-[1.5rem]">{copy.empty}</p>
        <p className="t-rotulo text-texto-suave">{copy.emptyText}</p>
        <Link href="/works" className={classesDeBotao('primario', 'p')}>
          {copy.explore}
        </Link>
      </div>
    );
  }

  const counts = {
    all: annotations.length,
    public: annotations.filter((a) => a.isPublic).length,
    private: annotations.filter((a) => !a.isPublic).length,
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label={copy.title}
        >
          {(['all', 'public', 'private'] as const).map((v) => (
            <button
              key={v}
              type="button"
              aria-pressed={visibility === v}
              onClick={() => setVisibility(v)}
              className={chip(visibility === v)}
            >
              {copy.filters[v]} · {counts[v]}
            </button>
          ))}
        </div>
        <ViewToggle />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <label className="search-field flex min-h-11 min-w-0 flex-1 basis-64 items-center gap-3 rounded-full bg-sup-2 px-5">
          <Icon de={PiMagnifyingGlass} className="text-texto-fraco" />
          <span className="sr-only">{copy.search}</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={copy.search}
            className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-texto-fraco"
          />
        </label>
        {works.length > 1 && (
          <div className="w-64 max-sm:w-full">
            <Selecao
              aria-label={copy.allWorks}
              className="min-h-11! rounded-full! py-0!"
              opcoes={[{ value: '', label: copy.allWorks }, ...works]}
              valor={workId}
              aoMudar={setWorkId}
            />
          </div>
        )}
      </div>

      {visible.length ? (
        <ListResults className="cascata grid grid-cols-1 gap-4 divide-[var(--linha)] xl:grid-cols-2 max-sm:gap-0 max-sm:divide-y data-[view=list]:grid-cols-1! data-[view=list]:gap-0 data-[view=list]:divide-y">
          {visible.map((a) => (
            <AnnotationCard
              key={a.id}
              annotation={a}
              copy={copy}
              language={language}
              onEdit={() => setEditing(a)}
              onRemove={() => setRemoving(a)}
              itemRef={leaving.refDe(a.id)}
            />
          ))}
        </ListResults>
      ) : (
        <p className="t-rotulo text-texto-suave">{copy.noResults}</p>
      )}

      <AnnotationSheet
        open={!!editing}
        onClose={() => setEditing(null)}
        onSaved={() => void refresh()}
        workId={editing?.workId ?? ''}
        editing={editing}
      />
      <ConfirmModal
        isOpen={!!removing}
        onClose={() => setRemoving(null)}
        onConfirm={remove}
        type="danger"
        title={sheetCopy.removeTitle}
        message={sheetCopy.removeText}
        confirmText={sheetCopy.removeConfirm}
      />
    </div>
  );
}

function AnnotationCard({
  annotation: a,
  copy,
  language,
  onEdit,
  onRemove,
  itemRef,
}: {
  annotation: WorkAnnotation;
  copy: PersonalCopy['annotations'];
  language: 'pt' | 'en';
  onEdit: () => void;
  onRemove: () => void;
  /** The list's exit (`useSaidas`) reaches the card through this. */
  itemRef: (el: HTMLElement | null) => void;
}) {
  const where = [
    copy.measures(a.measureStart, a.measureEnd),
    a.movement && copy.movement(a.movement),
    a.hand && copy.hand(a.hand),
  ].filter(Boolean);
  const date = new Intl.DateTimeFormat(language === 'pt' ? 'pt-BR' : 'en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(a.createdAt));
  return (
    <li
      ref={itemRef}
      className="flex flex-col gap-3 rounded-card bg-sup-2 p-5 row:flex-row row:items-center row:gap-4 row:rounded-none row:bg-transparent! row:bg-none! row:px-0 row:py-4"
    >
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1 t-legenda">
          <span>{copy.categories[a.category]}</span>
          <span aria-hidden="true">·</span>
          <span className="inline-flex items-center gap-1">
            <Icon de={a.isPublic ? PiGlobeSimple : PiLockSimple} tamanho="pp" />
            {a.isPublic ? copy.public : copy.private}
          </span>
          <span aria-hidden="true">·</span>
          <span>{date}</span>
        </span>
        <span className="font-display text-[1.25rem] leading-snug row:truncate">
          {a.title}
        </span>
        {a.work && (
          <Link
            href={`/works/${a.workId}`}
            className="t-rotulo truncate text-texto-suave hover:text-ouro-texto"
          >
            {workTitle(a.work.title, a.work.opOrCatalog)} ·{' '}
            {a.work.composer.fullName}
          </Link>
        )}
        {where.length > 0 && (
          <span className="t-rotulo text-texto-suave row:hidden">
            {where.join(' · ')}
          </span>
        )}
        <p className="t-rotulo line-clamp-3 row:hidden">{a.content}</p>
        <span className="flex flex-wrap items-center gap-x-3 gap-y-1 t-legenda row:hidden">
          <span>{copy.levels[a.difficulty]}</span>
          {a.helpfulCount > 0 && (
            <span className="inline-flex items-center gap-1">
              <Icon de={PiThumbsUp} tamanho="pp" />{' '}
              {copy.helpful(a.helpfulCount)}
            </span>
          )}
        </span>
      </div>
      <div className="flex gap-2 row:shrink-0">
        <Button tamanho="p" icone={PiPencilSimple} onClick={onEdit}>
          <span className="row:sr-only">{copy.edit}</span>
        </Button>
        <Button
          tamanho="p"
          variante="fantasma"
          icone={PiTrash}
          onClick={onRemove}
        >
          <span className="row:sr-only">{copy.remove}</span>
        </Button>
      </div>
    </li>
  );
}
