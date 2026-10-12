'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useDeferredValue, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { PiArrowDown, PiArrowUp, PiPlus, PiTrash } from 'react-icons/pi';
import ConfirmModal from '@/app/components/ConfirmModal';
import { Button } from '@/app/components/ui/Button';
import { Field } from '@/app/components/ui/Field';
import { Icon } from '@/app/components/ui/Icon';
import { Selecao } from '@/app/components/ui/Selecao';
import { Sheet } from '@/app/components/ui/Sheet';
import { cx } from '@/app/components/ui/cx';
import { COLLECTIONS } from '@/app/conteudo/site/collections';
import { useRouteLanguage } from '@/app/hooks/useRouteLanguage';
import {
  type CollectionDetail,
  type CollectionEntry,
  type CollectionKind,
  collectionCandidates,
  createCollection,
  deleteCollection,
  updateCollection,
} from '@/app/requests/collections';
import { ComposerField, type ComposerOption } from '../edit/ComposerField';
import { Portrait } from '../Portrait';
import { entryDetail, entryTitle } from './pieces';

const KINDS: CollectionKind[] = ['WORK', 'COMPOSER', 'SCORE'];

type Item = CollectionEntry;

/**
 * Creating or editing a collection, in one column: the kind (fixed once
 * created) and who sees it in the same select as the upload forms, name
 * and description, then the catalog search and the items in order, each
 * with a note. A score is added by choosing its work first. Closing asks
 * first when something changed.
 */
export function CollectionEditor({
  open,
  editing,
  onClose,
  onSaved,
  onDeleted,
}: {
  open: boolean;
  /** The collection being edited; none to create. */
  editing: CollectionDetail | null;
  onClose: () => void;
  onSaved: (collection: CollectionDetail) => void;
  onDeleted?: () => void;
}) {
  const { language } = useRouteLanguage();
  const copy = COLLECTIONS[language];
  const t = copy.editor;
  const [kind, setKind] = useState<CollectionKind>('WORK');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [items, setItems] = useState<Item[]>([]);
  const [search, setSearch] = useState('');
  /** Scores: the work picked first, then one of its scores. */
  const [work, setWork] = useState<CollectionEntry | null>(null);
  const [scoreId, setScoreId] = useState('');
  /** Works and scores: an optional composer that narrows the search. */
  const [filtro, setFiltro] = useState<ComposerOption | null>(null);
  const [touched, setTouched] = useState(false);
  const [tried, setTried] = useState(false);
  const [saving, setSaving] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const term = useDeferredValue(search.trim());

  useEffect(() => {
    if (!open) return;
    setKind(editing?.kind ?? 'WORK');
    setTitle(editing?.title ?? '');
    setDescription(editing?.description ?? '');
    setIsPublic(editing?.isPublic ?? true);
    setItems(editing?.items ?? []);
    setSearch('');
    setWork(null);
    setScoreId('');
    setFiltro(null);
    setTouched(false);
    setTried(false);
  }, [open, editing]);

  // Scores search the works; the chosen work then lists its scores.
  const searchKind: CollectionKind = kind === 'SCORE' ? 'WORK' : kind;
  const filtrando = searchKind === 'WORK' && !!filtro;
  const results = useQuery({
    queryKey: ['collection-candidates', searchKind, term, filtro?.id ?? null],
    queryFn: () =>
      collectionCandidates({
        kind: searchKind,
        q: term || undefined,
        composerId: filtrando ? filtro!.id : undefined,
      }),
    enabled:
      open && (term.length >= 2 || filtrando) && !(kind === 'SCORE' && work),
    staleTime: 60_000,
    // Keep the last list while the next one loads: no list folding and
    // unfolding on every key.
    placeholderData: keepPreviousData,
  });
  const buscando = open && (term.length >= 2 || filtrando);
  const scores = useQuery({
    queryKey: ['collection-candidates', 'SCORE', work?.refId],
    queryFn: () => collectionCandidates({ kind: 'SCORE', workId: work!.refId }),
    enabled: open && kind === 'SCORE' && !!work,
    staleTime: 60_000,
  });
  const offers = (results.data ?? []).filter(
    (r) => kind === 'SCORE' || !items.some((i) => i.refId === r.refId)
  );
  const scoreOptions = (scores.data ?? []).filter(
    (r) => !items.some((i) => i.refId === r.refId)
  );
  const add = (entry: CollectionEntry) => {
    change();
    setItems((list) => [...list, { ...entry, note: null }]);
  };

  const change = () => setTouched(true);
  const move = (from: number, to: number) => {
    change();
    setItems((list) => {
      const next = [...list];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  };

  const close = () => {
    setLeaving(false);
    onClose();
  };
  const requestClose = () => (touched && !saving ? setLeaving(true) : close());
  const nameError = title.trim().length < 3 ? t.nameError : undefined;

  const save = async () => {
    setTried(true);
    if (nameError) return;
    setSaving(true);
    const input = {
      title: title.trim(),
      description: description.trim() || undefined,
      isPublic,
      items: items.map((i) => ({
        refId: i.refId,
        note: i.note?.trim() || undefined,
      })),
    };
    const result = await (
      editing
        ? updateCollection(editing.id, input)
        : createCollection({ ...input, kind })
    ).catch(() => null);
    setSaving(false);
    if (!result?.ok) return toast.error(result?.error || t.failed);
    toast.success(t.saved);
    onSaved(result.data as CollectionDetail);
    close();
  };

  const remove = async () => {
    if (!editing) return;
    const result = await deleteCollection(editing.id).catch(() => null);
    setDeleting(false);
    if (!result?.ok) return toast.error(t.failed);
    toast.success(t.deleted);
    close();
    onDeleted?.();
  };

  return (
    <>
      <Sheet
        aberto={open}
        aoFechar={requestClose}
        titulo={editing ? t.editTitle : t.newTitle}
        descricao={t.intro}
        largura="m"
        rodape={
          <div className="flex w-full flex-wrap items-center justify-between gap-3">
            {editing ? (
              <Button
                variante="perigo"
                tamanho="p"
                icone={PiTrash}
                onClick={() => setDeleting(true)}
              >
                {t.delete}
              </Button>
            ) : (
              <span />
            )}
            <div className="flex gap-2">
              <Button
                variante="fantasma"
                onClick={requestClose}
                disabled={saving}
              >
                {t.cancel}
              </Button>
              <Button
                variante="primario"
                carregando={saving}
                onClick={() => void save()}
              >
                {t.save}
              </Button>
            </div>
          </div>
        }
      >
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <span className="t-rotulo" id="collection-kind">
                {t.what}
              </span>
              <Selecao
                aria-labelledby="collection-kind"
                opcoes={KINDS.map((k) => ({
                  value: k,
                  label: copy.kinds[k].plural,
                }))}
                valor={kind}
                disabled={!!editing || items.length > 0}
                aoMudar={(k) => {
                  change();
                  setKind(k as CollectionKind);
                  setWork(null);
                  setSearch('');
                }}
              />
              <span className="t-legenda">
                {editing
                  ? t.fixed(copy.kinds[kind].plural)
                  : items.length
                    ? t.switchHint
                    : copy.kindHints[kind]}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <span className="t-rotulo" id="collection-who">
                {t.who}
              </span>
              <Selecao
                aria-labelledby="collection-who"
                opcoes={[
                  { value: 'public', label: copy.publicLabel },
                  { value: 'private', label: copy.privateLabel },
                ]}
                valor={isPublic ? 'public' : 'private'}
                aoMudar={(v) => {
                  change();
                  setIsPublic(v === 'public');
                }}
              />
              <span className="t-legenda">
                {isPublic ? t.publicHint : t.privateHint}
              </span>
            </div>
          </div>
          <Field
            label={t.name}
            maxLength={80}
            placeholder={t.namePlaceholder}
            value={title}
            onChange={(e) => {
              change();
              setTitle(e.target.value);
            }}
            erro={tried ? nameError : undefined}
          />
          <Field.Area
            label={t.description}
            rows={3}
            maxLength={500}
            value={description}
            onChange={(e) => {
              change();
              setDescription(e.target.value);
            }}
          />

          <div className="flex flex-col gap-2 border-t border-linha pt-6">
            {kind === 'SCORE' && work ? (
              <div className="flex flex-col gap-3">
                <span className="t-rotulo">{t.workFirst}</span>
                <span className="flex items-center justify-between gap-3 rounded-controle bg-sup-2 px-3 py-2">
                  <Portrait
                    name={work.composerName ?? work.title}
                    src={work.portraitUrl}
                    sizes="36px"
                    className="h-9 w-9 shrink-0 rounded-full text-[0.8125rem]"
                  />
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate">{entryTitle('WORK', work)}</span>
                    <span className="t-legenda truncate">
                      {entryDetail('WORK', work, copy, language)}
                    </span>
                  </span>
                  <Button
                    variante="fantasma"
                    tamanho="p"
                    className="shrink-0 whitespace-nowrap"
                    onClick={() => {
                      setWork(null);
                      setScoreId('');
                    }}
                  >
                    {t.otherWork}
                  </Button>
                </span>
                {scores.isPending ? (
                  <span className="loading-skeleton h-11 rounded-controle" />
                ) : !scoreOptions.length ? (
                  <span className="t-legenda">{t.noScores}</span>
                ) : (
                  <div className="flex items-end gap-2">
                    <div className="flex min-w-0 flex-1 flex-col gap-2">
                      <span className="t-rotulo" id="collection-score">
                        {t.score}
                      </span>
                      <Selecao
                        aria-labelledby="collection-score"
                        placeholder={t.scorePick}
                        opcoes={scoreOptions.map((o) => ({
                          value: o.refId,
                          label: [
                            o.title,
                            o.edition,
                            o.pageCount && copy.pages(o.pageCount),
                          ]
                            .filter(Boolean)
                            .join(' · '),
                        }))}
                        valor={scoreId}
                        aoMudar={setScoreId}
                      />
                    </div>
                    <Button
                      icone={PiPlus}
                      disabled={!scoreId}
                      onClick={() => {
                        const picked = scoreOptions.find(
                          (o) => o.refId === scoreId
                        );
                        if (picked) add(picked);
                        setScoreId('');
                      }}
                    >
                      {t.addScore}
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <>
                {searchKind === 'WORK' && (
                  <ComposerField
                    key={kind}
                    className="mb-2"
                    label={t.composerFilter}
                    placeholder={t.composerPlaceholder}
                    hint={t.composerFilterHint}
                    clearLabel={t.clearComposer}
                    value={filtro}
                    onChange={setFiltro}
                    onClear={() => setFiltro(null)}
                  />
                )}
                <Field
                  label={
                    kind === 'SCORE'
                      ? t.workFirst
                      : t.add(copy.kinds[kind].plural)
                  }
                  type="search"
                  placeholder={
                    kind === 'SCORE'
                      ? t.workSearch
                      : t.search(copy.kinds[kind].singular)
                  }
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {buscando && (
                  <div className="min-h-40" aria-busy={results.isFetching}>
                    {results.isPending ? (
                      <ul className="flex flex-col gap-1" aria-hidden="true">
                        {[0, 1, 2].map((i) => (
                          <li
                            key={i}
                            className="flex items-center gap-3 px-3 py-2"
                          >
                            <span className="loading-skeleton h-9 w-9 shrink-0 rounded-full" />
                            <span className="flex flex-1 flex-col gap-1.5">
                              <span className="loading-skeleton h-3.5 w-2/3 rounded" />
                              <span className="loading-skeleton h-3 w-1/3 rounded" />
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : !offers.length ? (
                      <span className="t-legenda">{t.noResults}</span>
                    ) : (
                      <ul
                        className={cx(
                          'flex flex-col gap-1 transition-opacity duration-[var(--t-resposta)]',
                          results.isPlaceholderData && 'opacity-60'
                        )}
                      >
                        {offers.map((o) => (
                          <li key={o.refId}>
                            <button
                              type="button"
                              onClick={() => {
                                if (kind === 'SCORE') {
                                  setWork(o);
                                  setSearch('');
                                } else add(o);
                              }}
                              className="flex w-full items-center gap-3 rounded-controle px-3 py-2 text-left hover:bg-sup-2"
                            >
                              <Portrait
                                name={o.composerName ?? o.title}
                                src={o.portraitUrl}
                                sizes="36px"
                                className="h-9 w-9 shrink-0 rounded-full text-[0.8125rem]"
                              />
                              <span className="flex min-w-0 flex-1 flex-col">
                                <span className="truncate">
                                  {entryTitle(searchKind, o)}
                                </span>
                                <span className="t-legenda truncate">
                                  {entryDetail(searchKind, o, copy, language)}
                                </span>
                              </span>
                              <Icon
                                de={PiPlus}
                                tamanho="p"
                                className="shrink-0 text-ouro-texto"
                              />
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <span className="t-rotulo">{t.inIt(items.length)}</span>
            {items.length ? (
              <ol className="flex flex-col gap-2">
                {items.map((item, i) => (
                  <li
                    key={item.refId}
                    className="flex flex-col gap-2 rounded-controle bg-sup-2 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <Portrait
                        name={item.composerName ?? item.title}
                        src={item.portraitUrl}
                        sizes="36px"
                        className="h-9 w-9 shrink-0 rounded-full text-[0.8125rem]"
                      />
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate">
                          {entryTitle(kind, item)}
                        </span>
                        <span className="t-legenda truncate">
                          {entryDetail(kind, item, copy, language)}
                        </span>
                      </span>
                      <Button
                        tamanho="p"
                        variante="fantasma"
                        icone={PiArrowUp}
                        rotulo={t.up}
                        disabled={i === 0}
                        onClick={() => move(i, i - 1)}
                      />
                      <Button
                        tamanho="p"
                        variante="fantasma"
                        icone={PiArrowDown}
                        rotulo={t.down}
                        disabled={i === items.length - 1}
                        onClick={() => move(i, i + 1)}
                      />
                      <Button
                        tamanho="p"
                        variante="fantasma"
                        icone={PiTrash}
                        rotulo={t.remove}
                        onClick={() => {
                          change();
                          setItems((list) =>
                            list.filter((x) => x.refId !== item.refId)
                          );
                        }}
                      />
                    </div>
                    <input
                      aria-label={t.note(entryTitle(kind, item))}
                      value={item.note ?? ''}
                      maxLength={200}
                      placeholder={t.notePlaceholder}
                      onChange={(e) => {
                        change();
                        const note = e.target.value;
                        setItems((list) =>
                          list.map((x) =>
                            x.refId === item.refId ? { ...x, note } : x
                          )
                        );
                      }}
                      className="input-classical min-h-9 rounded-controle px-3 text-[0.875rem]"
                    />
                  </li>
                ))}
              </ol>
            ) : (
              <span className="t-rotulo text-texto-suave">{t.emptyItems}</span>
            )}
          </div>
        </div>
      </Sheet>
      <ConfirmModal
        isOpen={leaving}
        onClose={() => setLeaving(false)}
        onConfirm={close}
        type="warning"
        title={t.leaveTitle}
        message={t.leaveText}
        confirmText={t.leaveConfirm}
      />
      <ConfirmModal
        isOpen={deleting}
        onClose={() => setDeleting(false)}
        onConfirm={() => void remove()}
        type="danger"
        title={t.deleteTitle}
        message={t.deleteText}
        confirmText={t.delete}
      />
    </>
  );
}
