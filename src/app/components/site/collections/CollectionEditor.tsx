'use client';

import { useQuery } from '@tanstack/react-query';
import { useDeferredValue, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  PiArrowDown,
  PiArrowUp,
  PiGlobeSimple,
  PiLockSimple,
  PiPlus,
  PiStar,
  PiTrash,
} from 'react-icons/pi';
import ConfirmModal from '@/app/components/ConfirmModal';
import { Button } from '@/app/components/ui/Button';
import { Field } from '@/app/components/ui/Field';
import { Icon } from '@/app/components/ui/Icon';
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
import { entryDetail, entryTitle, KIND_ICON } from './pieces';

const KINDS: CollectionKind[] = ['WORK', 'COMPOSER', 'SCORE'];

type Item = CollectionEntry;

/** A radio as a card, like the sketch: tinted when chosen. */
function Choice({
  name,
  checked,
  disabled,
  onChange,
  icon,
  title,
  hint,
}: {
  name: string;
  checked: boolean;
  disabled?: boolean;
  onChange: () => void;
  icon: typeof PiPlus;
  title: string;
  hint: string;
}) {
  return (
    <label
      className={cx(
        'flex cursor-pointer items-start gap-3 rounded-controle p-3',
        checked ? 'tint-ouro' : 'bg-sup-2',
        disabled && 'cursor-not-allowed opacity-60'
      )}
    >
      <input
        type="radio"
        name={name}
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        className="mt-1 accent-[var(--ouro)]"
      />
      <span className="flex flex-col">
        <span
          className={cx(
            'inline-flex items-center gap-2 font-medium',
            checked && 'text-ouro-na-tinta'
          )}
        >
          <Icon de={icon} tamanho="p" />
          {title}
        </span>
        <span className="t-legenda">{hint}</span>
      </span>
    </label>
  );
}

/**
 * Creating or editing a collection, as in the sketch: the kind (fixed once
 * created), name, description, who sees it; on the side, search the
 * catalog and order the items, each with a note. Closing asks first when
 * something changed.
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
    setTouched(false);
    setTried(false);
  }, [open, editing]);

  const results = useQuery({
    queryKey: ['collection-candidates', kind, term],
    queryFn: () => collectionCandidates(kind, term),
    enabled: open && term.length >= 2,
    staleTime: 60_000,
  });
  const offers = (results.data ?? []).filter(
    (r) => !items.some((i) => i.refId === r.refId)
  );

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
        largura="g"
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
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <div className="flex flex-col gap-5">
            <fieldset className="flex flex-col gap-2">
              <legend className="t-rotulo mb-2">{t.what}</legend>
              {editing ? (
                <span className="t-rotulo inline-flex items-center gap-2 text-texto-suave">
                  <Icon de={KIND_ICON[kind]} tamanho="p" />
                  {t.fixed(copy.kinds[kind].plural)}
                </span>
              ) : (
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 lg:grid-cols-1">
                  {KINDS.map((k) => (
                    <Choice
                      key={k}
                      name="collection-kind"
                      checked={kind === k}
                      disabled={items.length > 0 && kind !== k}
                      onChange={() => {
                        change();
                        setKind(k);
                      }}
                      icon={KIND_ICON[k]}
                      title={copy.kinds[k].plural}
                      hint={copy.kindHints[k]}
                    />
                  ))}
                  {items.length > 0 && (
                    <span className="t-legenda">{t.switchHint}</span>
                  )}
                </div>
              )}
            </fieldset>
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
            <fieldset className="flex flex-col gap-2">
              <legend className="t-rotulo mb-2">{t.who}</legend>
              <Choice
                name="collection-visibility"
                checked={isPublic}
                onChange={() => {
                  change();
                  setIsPublic(true);
                }}
                icon={PiGlobeSimple}
                title={copy.publicLabel}
                hint={t.publicHint}
              />
              <Choice
                name="collection-visibility"
                checked={!isPublic}
                onChange={() => {
                  change();
                  setIsPublic(false);
                }}
                icon={PiLockSimple}
                title={copy.privateLabel}
                hint={t.privateHint}
              />
            </fieldset>
            <div className="flex items-start gap-3 rounded-controle bg-sup-2 p-3">
              <Icon
                de={PiStar}
                tamanho="p"
                className="mt-0.5 text-texto-fraco"
              />
              <span className="t-legenda">{t.home}</span>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Field
                label={t.add(copy.kinds[kind].plural)}
                type="search"
                placeholder={t.search(copy.kinds[kind].singular)}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {term.length >= 2 && results.isSuccess && !offers.length && (
                <span className="t-legenda">{t.noResults}</span>
              )}
              {offers.length > 0 && (
                <ul className="flex flex-col gap-1">
                  {offers.map((o) => (
                    <li key={o.refId}>
                      <button
                        type="button"
                        onClick={() => {
                          change();
                          setItems((list) => [...list, { ...o, note: null }]);
                        }}
                        className="flex w-full items-center gap-3 rounded-controle px-3 py-2 text-left hover:bg-sup-2"
                      >
                        <Icon
                          de={PiPlus}
                          tamanho="p"
                          className="shrink-0 text-ouro-texto"
                        />
                        <span className="flex min-w-0 flex-col">
                          <span className="truncate">
                            {entryTitle(kind, o)}
                          </span>
                          <span className="t-legenda truncate">
                            {entryDetail(kind, o, copy, language)}
                          </span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
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
                        <Icon
                          de={KIND_ICON[kind]}
                          tamanho="p"
                          className="shrink-0 text-texto-fraco"
                        />
                        <span className="min-w-0 flex-1 truncate">
                          {entryTitle(kind, item)}
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
                <span className="t-rotulo text-texto-suave">
                  {t.emptyItems}
                </span>
              )}
            </div>
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
