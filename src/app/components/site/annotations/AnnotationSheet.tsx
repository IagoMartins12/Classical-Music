'use client';

import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import ConfirmModal from '@/app/components/ConfirmModal';
import { Button } from '@/app/components/ui/Button';
import { CaixaDeMarcar } from '@/app/components/ui/CaixaDeMarcar';
import { CampoDeFichas } from '@/app/components/ui/CampoDeFichas';
import { Field } from '@/app/components/ui/Field';
import { Selecao } from '@/app/components/ui/Selecao';
import { Sheet } from '@/app/components/ui/Sheet';
import { cx } from '@/app/components/ui/cx';
import { ANNOTATIONS } from '@/app/conteudo/site/annotations';
import { PERSONAL } from '@/app/conteudo/site/personal';
import { useRouteLanguage } from '@/app/hooks/useRouteLanguage';
import {
  createAnnotationRequest,
  updateAnnotationRequest,
} from '@/app/requests/library';
import type {
  AnnotationCategory,
  AnnotationDifficulty,
  AnnotationScope,
  WorkAnnotation,
} from '@/app/stores/useAnnotationsStore';
import { chip } from '../choice';

const CATEGORIES: AnnotationCategory[] = [
  'TECHNIQUE',
  'INTERPRETATION',
  'THEORY',
  'PRACTICE_TIP',
  'PERFORMANCE',
  'HISTORICAL',
  'GENERAL',
];
const SCOPES: AnnotationScope[] = [
  'SPECIFIC_MEASURE',
  'SECTION',
  'MOVEMENT',
  'ENTIRE_WORK',
];
const HANDS = ['', 'left', 'right', 'both'] as const;
const LEVELS: AnnotationDifficulty[] = [
  'ALL_LEVELS',
  'BEGINNER',
  'INTERMEDIATE',
  'ADVANCED',
];

interface Form {
  title: string;
  content: string;
  tags: string[];
  category: AnnotationCategory;
  scope: AnnotationScope;
  measureStart: string;
  measureEnd: string;
  pageNumber: string;
  movement: string;
  section: string;
  hand: string;
  voice: string;
  instrument: string;
  difficulty: AnnotationDifficulty;
  isPublic: boolean;
}

const fromAnnotation = (a?: WorkAnnotation | null): Form => ({
  title: a?.title ?? '',
  content: a?.content ?? '',
  tags: a?.tags ?? [],
  category: a?.category ?? 'TECHNIQUE',
  scope: a?.scope ?? 'SPECIFIC_MEASURE',
  measureStart: a?.measureStart ? String(a.measureStart) : '',
  measureEnd: a?.measureEnd ? String(a.measureEnd) : '',
  pageNumber: a?.pageNumber ? String(a.pageNumber) : '',
  movement: a?.movement ?? '',
  section: a?.section ?? '',
  hand: a?.hand ?? '',
  voice: a?.voice ?? '',
  instrument: a?.instrument ?? '',
  difficulty: a?.difficulty ?? 'ALL_LEVELS',
  isPublic: a?.isPublic ?? true,
});

const num = (v: string) => (v.trim() ? Number(v) : undefined);

/**
 * Writing or editing a work annotation: a margin note with its place
 * (measures, section, movement, page, hand), its kind, level and tags, as
 * in sketch A. Same fields and rules as before; closing asks for
 * confirmation only after a change.
 */
export function AnnotationSheet({
  open,
  onClose,
  onSaved,
  workId,
  editing,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: (annotation: WorkAnnotation) => void;
  workId: string;
  editing?: WorkAnnotation | null;
}) {
  const { language } = useRouteLanguage();
  const copy = ANNOTATIONS[language];
  const t = copy.sheet;
  const names = PERSONAL[language].annotations;
  const [form, setForm] = useState<Form>(() => fromAnnotation(editing));
  const [touched, setTouched] = useState(false);
  const [tried, setTried] = useState(false);
  const [saving, setSaving] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm(fromAnnotation(editing));
    setTouched(false);
    setTried(false);
  }, [open, editing]);

  const set = (patch: Partial<Form>) => {
    setTouched(true);
    setForm((f) => ({ ...f, ...patch }));
  };

  const errors = useMemo(() => {
    const e: Partial<Record<keyof Form, string>> = {};
    if (!form.title.trim()) e.title = t.errors.title;
    if (!form.content.trim()) e.content = t.errors.content;
    if (form.scope === 'SPECIFIC_MEASURE') {
      if (!(Number(form.measureStart) >= 1)) e.measureStart = t.errors.measure;
      else if (
        form.measureEnd &&
        Number(form.measureEnd) < Number(form.measureStart)
      )
        e.measureEnd = t.errors.measureEnd;
    }
    if (form.scope === 'MOVEMENT' && !form.movement.trim())
      e.movement = t.errors.movement;
    if (form.scope === 'SECTION' && !form.section.trim())
      e.section = t.errors.section;
    return e;
  }, [form, t]);
  const shown = (key: keyof Form) => (tried ? errors[key] : undefined);

  const close = () => {
    setLeaving(false);
    onClose();
  };
  const requestClose = () => (touched && !saving ? setLeaving(true) : close());

  const save = async () => {
    setTried(true);
    if (Object.keys(errors).length) return;
    setSaving(true);
    const data: Partial<WorkAnnotation> = {
      workId,
      title: form.title.trim(),
      content: form.content.trim(),
      tags: form.tags,
      category: form.category,
      scope: form.scope,
      measureStart:
        form.scope === 'SPECIFIC_MEASURE' ? num(form.measureStart) : undefined,
      measureEnd:
        form.scope === 'SPECIFIC_MEASURE' ? num(form.measureEnd) : undefined,
      pageNumber: num(form.pageNumber),
      movement: form.movement.trim() || undefined,
      section: form.section.trim() || undefined,
      hand: form.hand || undefined,
      voice: form.voice.trim() || undefined,
      instrument: form.instrument.trim() || undefined,
      difficulty: form.difficulty,
      isPublic: form.isPublic,
    };
    const result = await (
      editing
        ? updateAnnotationRequest(editing.id, data)
        : createAnnotationRequest(data)
    ).catch(() => null);
    setSaving(false);
    if (!result?.ok) return toast.error(copy.failed);
    toast.success(form.isPublic ? t.published : t.saved);
    onSaved(result.data.annotation);
    close();
  };

  return (
    <>
      <Sheet
        aberto={open}
        aoFechar={requestClose}
        titulo={editing ? t.editTitle : t.new}
        descricao={t.intro}
        largura="g"
        rodape={
          <div className="flex w-full flex-wrap items-center justify-between gap-3">
            <CaixaDeMarcar
              rotulo={t.public}
              marcado={form.isPublic}
              aoMudar={(isPublic) => set({ isPublic })}
            />
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
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
          <div className="flex flex-col gap-5">
            <Field
              label={t.titleField}
              maxLength={100}
              value={form.title}
              placeholder={t.titlePlaceholder}
              onChange={(e) => set({ title: e.target.value })}
              erro={shown('title')}
            />
            <Field.Area
              label={t.content}
              rows={7}
              maxLength={2000}
              value={form.content}
              placeholder={t.contentPlaceholder}
              onChange={(e) => set({ content: e.target.value })}
              erro={shown('content')}
            />
            <CampoDeFichas
              rotulo={t.tags}
              valores={form.tags}
              aoMudar={(tags) => set({ tags })}
              placeholder={t.tagsPlaceholder}
              ajuda={t.tagsHelp}
              maximo={10}
            />
          </div>
          <div className="flex flex-col gap-6">
            <fieldset className="flex flex-col gap-2">
              <legend className="t-rotulo mb-2">{t.category}</legend>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORIES.map((c) => {
                  const active = form.category === c;
                  return (
                    <button
                      key={c}
                      type="button"
                      aria-pressed={active}
                      onClick={() => set({ category: c })}
                      className={cx(
                        'flex flex-col items-start gap-0.5 rounded-controle p-3 text-left transition-colors duration-[var(--t-toque)]',
                        active ? 'tint-ouro' : 'bg-sup-2 hover:text-ouro-texto'
                      )}
                    >
                      <span
                        className={cx(
                          'text-[0.875rem] font-medium',
                          active && 'text-ouro-na-tinta'
                        )}
                      >
                        {names.categories[c]}
                      </span>
                      <span className="t-legenda line-clamp-1">
                        {t.categoryHints[c]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </fieldset>
            <fieldset className="flex flex-col gap-3">
              <legend className="t-rotulo mb-2">{t.where}</legend>
              <div className="flex flex-wrap gap-2">
                {SCOPES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    aria-pressed={form.scope === s}
                    onClick={() => set({ scope: s })}
                    className={chip(form.scope === s)}
                  >
                    {copy.scopes[s]}
                  </button>
                ))}
              </div>
              {form.scope === 'SPECIFIC_MEASURE' && (
                <div className="grid grid-cols-3 gap-2">
                  <Field
                    label={t.from}
                    inputMode="numeric"
                    value={form.measureStart}
                    onChange={(e) =>
                      set({ measureStart: e.target.value.replace(/\D/g, '') })
                    }
                    erro={shown('measureStart')}
                  />
                  <Field
                    label={t.to}
                    inputMode="numeric"
                    value={form.measureEnd}
                    onChange={(e) =>
                      set({ measureEnd: e.target.value.replace(/\D/g, '') })
                    }
                    erro={shown('measureEnd')}
                  />
                  <Field
                    label={t.page}
                    inputMode="numeric"
                    value={form.pageNumber}
                    onChange={(e) =>
                      set({ pageNumber: e.target.value.replace(/\D/g, '') })
                    }
                  />
                </div>
              )}
              {(form.scope === 'MOVEMENT' ||
                form.scope === 'SPECIFIC_MEASURE') && (
                <Field
                  label={t.movement}
                  value={form.movement}
                  placeholder={t.movementPlaceholder}
                  onChange={(e) => set({ movement: e.target.value })}
                  erro={shown('movement')}
                />
              )}
              {form.scope === 'SECTION' && (
                <Field
                  label={t.section}
                  value={form.section}
                  placeholder={t.sectionPlaceholder}
                  onChange={(e) => set({ section: e.target.value })}
                  erro={shown('section')}
                />
              )}
            </fieldset>
            <fieldset className="flex flex-col gap-2">
              <legend className="t-rotulo mb-2">{t.hand}</legend>
              <div className="flex flex-wrap gap-2">
                {HANDS.map((h) => (
                  <button
                    key={h || 'none'}
                    type="button"
                    aria-pressed={form.hand === h}
                    onClick={() => set({ hand: h })}
                    className={chip(form.hand === h)}
                  >
                    {copy.hands[h]}
                  </button>
                ))}
              </div>
            </fieldset>
            <label className="flex flex-col gap-2">
              <span className="t-rotulo">{t.level}</span>
              <Selecao
                aria-label={t.level}
                opcoes={LEVELS.map((l) => ({
                  value: l,
                  label: names.levels[l],
                }))}
                valor={form.difficulty}
                aoMudar={(v) => set({ difficulty: v as AnnotationDifficulty })}
              />
            </label>
            <details className="group flex flex-col gap-3">
              <summary className="t-rotulo cursor-pointer text-texto-suave hover:text-texto">
                {t.more}
              </summary>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Field
                  label={t.voice}
                  value={form.voice}
                  placeholder={t.voicePlaceholder}
                  onChange={(e) => set({ voice: e.target.value })}
                />
                <Field
                  label={t.instrument}
                  value={form.instrument}
                  placeholder={t.instrumentPlaceholder}
                  onChange={(e) => set({ instrument: e.target.value })}
                />
              </div>
            </details>
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
        cancelText={t.keepEditing}
        acaoPerigosa
      />
    </>
  );
}
