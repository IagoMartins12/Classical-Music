'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { PiCamera } from 'react-icons/pi';
import { Button } from '@/app/components/ui/Button';
import { asList } from './asList';
import { CampoDeFichas } from '@/app/components/ui/CampoDeFichas';
import { Field } from '@/app/components/ui/Field';
import { Rotulado } from '@/app/components/ui/Rotulado';
import { Selecao } from '@/app/components/ui/Selecao';
import { SelecaoComBusca } from '@/app/components/ui/SelecaoComBusca';
import { SeletorDeData } from '@/app/components/ui/SeletorDeData';
import {
  canonicalNationality,
  nationalityOptions,
} from '@/app/conteudo/site/countries';
import { EDIT } from '@/app/conteudo/site/edit';
import { useRouteLanguage } from '@/app/hooks/useRouteLanguage';
import type { ApiSchema } from '@/app/libs/api/types';
import {
  saveComposerRequest,
  uploadComposerImage,
} from '@/app/requests/uploads-client';
import { Portrait } from '../Portrait';
import { EditPage, EditSection, useEditForm } from './EditPage';

type Composer = ApiSchema<'ComposerUploadResponseDto'>;
type Named = { id: string; name: string };

const s = (v: string | null | undefined) => v ?? '';

/** Editing a composer upload: identity, life, roles, biography, sources. */
export function ComposerEditForm({
  composer,
  epochs,
  roles,
}: {
  composer: Composer;
  epochs: Named[];
  roles: Named[];
}) {
  const { language } = useRouteLanguage();
  const router = useRouter();
  const copy = EDIT[language];
  const t = copy.composer;
  const { form, set, dirty, discard, commit } = useEditForm({
    name: composer.name,
    fullName: composer.fullName,
    alternativeNames: asList(composer.alternativeNames),
    portraitUrl: s(composer.portraitUrl),
    birthDate: s(composer.birthDate),
    deathDate: s(composer.deathDate),
    nationality: s(composer.nationality),
    epochId: composer.epochId,
    primaryRoleId: composer.primaryRoleId,
    roles: asList(composer.roles),
    instruments: asList(composer.instruments),
    bio: s(composer.bio),
    bioEn: s(composer.bioEn),
    imslpId: s(composer.imslpId),
    permLinkImslp: s(composer.permLinkImslp),
    wikipediaLink: s(composer.wikipediaLink),
    videoUrl: s(composer.videoUrl),
    imslpCategories: asList(composer.imslpCategories),
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [tried, setTried] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const missing = (v: string) =>
    tried && !v.trim() ? copy.required : undefined;

  const save = async () => {
    setTried(true);
    if (!form.name.trim() || !form.fullName.trim()) return;
    setSaving(true);
    const epochName = epochs.find((e) => e.id === form.epochId)?.name;
    const response = await saveComposerRequest(composer.id, {
      ...form,
      epochName,
    }).catch(() => null);
    setSaving(false);
    if (!response?.ok) {
      toast.error(copy.failed);
      return;
    }
    commit();
    toast.success(copy.saved);
    // A página pública (e o cache do roteador) já vê o que foi gravado.
    router.refresh();
  };

  const upload = async (file: File) => {
    setUploading(true);
    const result = await uploadComposerImage(file, composer.id);
    setUploading(false);
    if (!result.success) {
      toast.error(result.message || copy.failed);
      return;
    }
    set({ portraitUrl: result.imageUrl });
    toast.success(t.portraitSaved);
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
      kind="composer"
      id={composer.id}
      name={form.fullName || composer.fullName}
      viewHref={`/composer/${composer.id}`}
      updatedAt={composer.updatedAt}
      dirty={dirty}
      saving={saving}
      onSave={() => void save()}
      onDiscard={discard}
    >
      <EditSection title={t.identity}>
        <div className="flex items-center gap-4 sm:col-span-2">
          <Portrait
            name={form.fullName || '?'}
            src={form.portraitUrl}
            sizes="80px"
            className="h-20 w-20 shrink-0 rounded-full text-[1.5rem]"
          />
          <Button
            tamanho="p"
            icone={PiCamera}
            carregando={uploading}
            onClick={() => fileRef.current?.click()}
          >
            {t.portraitChange}
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            tabIndex={-1}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void upload(file);
              e.target.value = '';
            }}
          />
        </div>
        {field('name', t.name, { ajuda: t.nameHelp, erro: missing(form.name) })}
        {field('fullName', t.fullName, { erro: missing(form.fullName) })}
        <CampoDeFichas
          className="sm:col-span-2"
          rotulo={t.alternative}
          ajuda={t.alternativeHelp}
          valores={form.alternativeNames}
          aoMudar={(alternativeNames) => set({ alternativeNames })}
        />
      </EditSection>

      <EditSection title={t.life}>
        {(['birthDate', 'deathDate'] as const).map((key) => (
          <Rotulado key={key} label={key === 'birthDate' ? t.birth : t.death}>
            {(id) => (
              <SeletorDeData
                id={id}
                valor={form[key]}
                aoMudar={(texto) => set({ [key]: texto })}
              />
            )}
          </Rotulado>
        ))}
        {/* Shown in the select's spelling ("Alemão" → Germany); the stored
            text only changes when someone picks another country. */}
        <Rotulado label={t.nationality}>
          {(id) => (
            <SelecaoComBusca
              id={id}
              opcoes={nationalityOptions(
                language,
                canonicalNationality(form.nationality)
              )}
              valor={canonicalNationality(form.nationality)}
              aoMudar={(nationality) => set({ nationality })}
              limpavel
            />
          )}
        </Rotulado>
        <label className="flex flex-col gap-2">
          <span className="t-rotulo">{t.epoch}</span>
          <Selecao
            aria-label={t.epoch}
            opcoes={epochs.map((e) => ({ value: e.id, label: e.name }))}
            valor={form.epochId}
            aoMudar={(epochId) => set({ epochId })}
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="t-rotulo">{t.role}</span>
          <Selecao
            aria-label={t.role}
            opcoes={roles.map((r) => ({ value: r.id, label: r.name }))}
            valor={form.primaryRoleId}
            aoMudar={(primaryRoleId) => set({ primaryRoleId })}
          />
        </label>
        <CampoDeFichas
          rotulo={t.roles}
          valores={form.roles}
          aoMudar={(roles) => set({ roles })}
        />
        <CampoDeFichas
          className="sm:col-span-2"
          rotulo={t.instruments}
          valores={form.instruments}
          aoMudar={(instruments) => set({ instruments })}
        />
      </EditSection>

      <EditSection title={t.text}>
        <Field.Area
          className="sm:col-span-2"
          label={t.bio}
          rows={8}
          value={form.bio}
          onChange={(e) => set({ bio: e.target.value })}
        />
        <Field.Area
          className="sm:col-span-2"
          label={t.bioEn}
          rows={8}
          value={form.bioEn}
          onChange={(e) => set({ bioEn: e.target.value })}
        />
      </EditSection>

      <EditSection title={t.links}>
        {field('imslpId', t.imslpId)}
        {field('permLinkImslp', t.imslpLink, { type: 'url', inputMode: 'url' })}
        {field('wikipediaLink', t.wikipedia, { type: 'url', inputMode: 'url' })}
        {field('videoUrl', t.video, { type: 'url', inputMode: 'url' })}
        <CampoDeFichas
          className="sm:col-span-2"
          rotulo={t.categories}
          valores={form.imslpCategories}
          aoMudar={(imslpCategories) => set({ imslpCategories })}
        />
      </EditSection>
    </EditPage>
  );
}
