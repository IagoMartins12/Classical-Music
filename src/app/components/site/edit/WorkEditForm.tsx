'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { asList } from './asList';
import { CampoDeFichas } from '@/app/components/ui/CampoDeFichas';
import { Field } from '@/app/components/ui/Field';
import { Rotulado } from '@/app/components/ui/Rotulado';
import { Selecao } from '@/app/components/ui/Selecao';
import { SelecaoMultipla } from '@/app/components/ui/SelecaoMultipla';
import { SeletorDeAno } from '@/app/components/ui/SeletorDeAno';
import { EDIT } from '@/app/conteudo/site/edit';
import {
  escreverInstrumentacao,
  lerInstrumentacao,
  opcoesDeInstrumento,
  rotuloDoInstrumento,
} from '@/app/conteudo/site/instrumentacao';
import { useRouteLanguage } from '@/app/hooks/useRouteLanguage';
import type { ApiSchema } from '@/app/libs/api/types';
import {
  errorOf,
  failedRequest,
  saveWorkRequest,
} from '@/app/requests/uploads-client';
import { ComposerField } from './ComposerField';
import { EditPage, EditSection, useEditForm } from './EditPage';

type Work = ApiSchema<'WorkUploadResponseDto'>;
type Named = { id: string; name: string };

const s = (v: string | number | null | undefined) =>
  v == null ? '' : String(v);

/** Editing a work upload: identity, music, dates, classification, sources. */
export function WorkEditForm({
  work,
  instruments,
  epochs,
}: {
  work: Work;
  instruments: Named[];
  epochs: Named[];
}) {
  const { language } = useRouteLanguage();
  const router = useRouter();
  const copy = EDIT[language];
  const t = copy.work;
  const [composer, setComposer] = useState<{
    id: string;
    name: string;
    fullName?: string;
  } | null>(
    work.composer
      ? {
          id: work.composer.id,
          name: work.composer.name,
          fullName: work.composer.fullName ?? undefined,
        }
      : null
  );
  const { form, set, dirty, discard, commit } = useEditForm({
    title: work.title,
    subtitle: s(work.subtitle),
    popularName: s(work.popularName),
    popularNameEn: s(work.popularNameEn),
    famousParts: asList(work.famousParts),
    famousPartsEn: asList(work.famousPartsEn),
    composerId: work.composerId,
    opOrCatalog: s(work.opOrCatalog),
    workType: work.workType || 'INDIVIDUAL',
    movementNumber: s(work.movementNumber),
    parentWorkId: s(work.parentWorkId),
    instrumentId: work.instrumentId,
    instrumentation: s(work.instrumentation),
    epochId: work.epochId,
    tone: s(work.tone),
    workStyle: s(work.workStyle),
    moviment: s(work.moviment),
    mediaDuration: s(work.mediaDuration),
    compositionYear: s(work.compositionYear),
    firstPublishDate: s(work.firstPublishDate),
    dedicateTo: s(work.dedicateTo),
    categoryNames: asList(work.categoryNames),
    workGenresArr: asList(work.workGenresArr),
    imslpTags: asList(work.imslpTags),
    imslpId: s(work.imslpId),
    imslpPermlink: s(work.imslpPermlink),
    videoUrl: s(work.videoUrl),
  });
  const [saving, setSaving] = useState(false);
  const [tried, setTried] = useState(false);
  const titleError = tried && !form.title.trim() ? copy.required : undefined;

  const save = async () => {
    setTried(true);
    if (!form.title.trim()) return;
    setSaving(true);
    const response = await saveWorkRequest(work.id, {
      ...form,
      title: form.title.trim(),
      movementNumber: form.movementNumber ? Number(form.movementNumber) : null,
      // Text, as the API keeps it ("1830-1835 ca."): sent as a number it
      // was refused, and every save with a year failed.
      compositionYear: form.compositionYear.trim() || null,
    }).catch(failedRequest);
    setSaving(false);
    if (!response.ok) {
      toast.error(await errorOf(response, copy.failed));
      return;
    }
    commit();
    toast.success(copy.saved);
    // A página pública (e o cache do roteador) já vê o que foi gravado.
    router.refresh();
  };

  const field = (
    key: keyof typeof form,
    label: string,
    extra: Record<string, unknown> = {}
  ) => (
    <Field
      label={label}
      value={form[key] as string}
      onChange={(e) => set({ [key]: e.target.value } as Partial<typeof form>)}
      {...extra}
    />
  );

  return (
    <EditPage
      kind="work"
      id={work.id}
      name={form.title || work.title}
      viewHref={`/works/${work.id}`}
      updatedAt={work.updatedAt}
      dirty={dirty}
      saving={saving}
      onSave={() => void save()}
      onDiscard={discard}
    >
      <EditSection title={t.identity}>
        <div className="sm:col-span-2">
          {field('title', t.title, { erro: titleError, maxLength: 300 })}
        </div>
        <div className="sm:col-span-2">{field('subtitle', t.subtitle)}</div>
        {/* How people know it ("Sonata ao Luar") and its famous parts
            ("Clair de Lune"): shown on the page and searched. */}
        {field('popularName', t.popularName, {
          placeholder: t.popularNamePlaceholder,
          maxLength: 150,
        })}
        {field('popularNameEn', t.popularNameEn, {
          placeholder: t.popularNameEnPlaceholder,
          maxLength: 150,
        })}
        <CampoDeFichas
          className="sm:col-span-2"
          rotulo={t.famousParts}
          valores={form.famousParts}
          aoMudar={(famousParts) => set({ famousParts })}
        />
        <CampoDeFichas
          className="sm:col-span-2"
          rotulo={t.famousPartsEn}
          valores={form.famousPartsEn}
          aoMudar={(famousPartsEn) => set({ famousPartsEn })}
        />
        <ComposerField
          label={t.composer}
          placeholder={t.composerSearch}
          value={composer}
          onChange={(c) => {
            setComposer(c);
            set({ composerId: c.id });
          }}
        />
        {field('opOrCatalog', t.catalog, { placeholder: t.catalogPlaceholder })}
        <label className="flex flex-col gap-2">
          <span className="t-rotulo">{t.workType}</span>
          <Selecao
            aria-label={t.workType}
            opcoes={Object.entries(t.workTypes).map(([value, label]) => ({
              value,
              label,
            }))}
            valor={form.workType}
            aoMudar={(workType) => set({ workType })}
          />
        </label>
        {field('movementNumber', t.movementNumber, { inputMode: 'numeric' })}
        {field('parentWorkId', t.parent)}
      </EditSection>

      <EditSection title={t.music} note={copy.mediaNote}>
        <label className="flex flex-col gap-2">
          <span className="t-rotulo">{t.instrument}</span>
          <Selecao
            aria-label={t.instrument}
            opcoes={instruments.map((i) => ({ value: i.id, label: i.name }))}
            valor={form.instrumentId}
            aoMudar={(instrumentId) => set({ instrumentId })}
          />
        </label>
        {/* The stored text is read into the list (plurals, English); it is
            rewritten only when someone adds or removes an instrument. */}
        <SelecaoMultipla
          rotulo={t.instrumentation}
          opcoes={opcoesDeInstrumento(language)}
          valores={lerInstrumentacao(form.instrumentation)}
          rotuloDe={(v) => rotuloDoInstrumento(v, language)}
          aoMudar={(lista) =>
            set({ instrumentation: escreverInstrumentacao(lista) })
          }
          className="sm:col-span-2"
        />
        <label className="flex flex-col gap-2">
          <span className="t-rotulo">{t.epoch}</span>
          <Selecao
            aria-label={t.epoch}
            opcoes={epochs.map((e) => ({ value: e.id, label: e.name }))}
            valor={form.epochId}
            aoMudar={(epochId) => set({ epochId })}
          />
        </label>
        {field('tone', t.tone)}
        {field('workStyle', t.style)}
        {field('mediaDuration', t.duration)}
        <div className="sm:col-span-2">{field('moviment', t.movement)}</div>
      </EditSection>

      <EditSection title={t.dates}>
        <Rotulado label={t.year}>
          {(id) => (
            <SeletorDeAno
              id={id}
              valor={form.compositionYear}
              aoMudar={(compositionYear) => set({ compositionYear })}
            />
          )}
        </Rotulado>
        {field('firstPublishDate', t.published)}
        <div className="sm:col-span-2">{field('dedicateTo', t.dedication)}</div>
      </EditSection>

      <EditSection title={t.classification}>
        <CampoDeFichas
          className="sm:col-span-2"
          rotulo={t.categories}
          valores={form.categoryNames}
          aoMudar={(categoryNames) => set({ categoryNames })}
        />
        <CampoDeFichas
          className="sm:col-span-2"
          rotulo={t.genres}
          valores={form.workGenresArr}
          aoMudar={(workGenresArr) => set({ workGenresArr })}
        />
        <CampoDeFichas
          className="sm:col-span-2"
          rotulo={t.tags}
          valores={form.imslpTags}
          aoMudar={(imslpTags) => set({ imslpTags })}
        />
      </EditSection>

      <EditSection title={t.sources}>
        {field('imslpId', t.imslpId)}
        {field('imslpPermlink', t.imslpLink, { type: 'url', inputMode: 'url' })}
        <div className="sm:col-span-2">
          {field('videoUrl', t.video, { type: 'url', inputMode: 'url' })}
        </div>
      </EditSection>
    </EditPage>
  );
}
