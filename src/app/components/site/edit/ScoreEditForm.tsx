'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { PiArrowSquareOut, PiFilePdf } from 'react-icons/pi';
import Link from '@/app/components/LocalizedLink';
import { classesDeBotao } from '@/app/components/ui/Button';
import { Field } from '@/app/components/ui/Field';
import { Icon } from '@/app/components/ui/Icon';
import { EDIT } from '@/app/conteudo/site/edit';
import { useRouteLanguage } from '@/app/hooks/useRouteLanguage';
import type { ApiSchema } from '@/app/libs/api/types';
import {
  errorOf,
  failedRequest,
  saveScoreRequest,
} from '@/app/requests/uploads-client';
import { EditPage, EditSection, useEditForm } from './EditPage';

type Score = ApiSchema<'ScoreUploadResponseDto'> & {
  work: {
    id: string;
    title: string;
    composer: { id: string; name: string; fullName: string | null };
  };
};

const s = (v: string | number | null | undefined) =>
  v == null ? '' : String(v);

/** Editing a score upload: its details; the file itself stays. */
export function ScoreEditForm({ score }: { score: Score }) {
  const { language } = useRouteLanguage();
  const router = useRouter();
  const copy = EDIT[language];
  const t = copy.score;
  const { form, set, dirty, discard, commit } = useEditForm({
    title: score.title,
    publisher: s(score.publisher),
    editor: s(score.editor),
    copyright: s(score.copyright),
    pageCount: s(score.pageCount),
    groupTitle: s(score.groupTitle),
    groupIndex: s(score.groupIndex),
  });
  const [saving, setSaving] = useState(false);
  const [tried, setTried] = useState(false);

  const save = async () => {
    setTried(true);
    if (!form.title.trim()) return;
    setSaving(true);
    const response = await saveScoreRequest(score.id, {
      ...form,
      title: form.title.trim(),
      pageCount: form.pageCount ? Number(form.pageCount) : null,
      groupIndex: form.groupIndex ? Number(form.groupIndex) : null,
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
      value={form[key]}
      onChange={(e) => set({ [key]: e.target.value } as Partial<typeof form>)}
      {...extra}
    />
  );
  const composer = score.work.composer.fullName || score.work.composer.name;

  return (
    <EditPage
      kind="score"
      id={score.id}
      name={form.title || score.title}
      viewHref={`/works/${score.work.id}#scores`}
      updatedAt={score.updatedAt}
      dirty={dirty}
      saving={saving}
      onSave={() => void save()}
      onDiscard={discard}
    >
      <EditSection title={t.work}>
        <Link
          href={`/works/${score.work.id}`}
          className="group flex flex-col sm:col-span-2"
        >
          <span className="font-display text-[1.375rem] group-hover:text-ouro-texto">
            {score.work.title}
          </span>
          <span className="t-rotulo text-texto-suave">{composer}</span>
        </Link>
      </EditSection>

      <EditSection title={t.file} note={t.fileNote}>
        <div className="flex items-center gap-3 rounded-card bg-sup-2 p-4 sm:col-span-2">
          <Icon
            de={PiFilePdf}
            tamanho="m"
            className="shrink-0 text-texto-fraco"
          />
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="truncate font-medium">{score.title}</span>
            <span className="t-legenda">{score.source}</span>
          </span>
          {score.downloadUrl && (
            <a
              href={score.downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={classesDeBotao('secundario', 'p')}
            >
              {t.open} <Icon de={PiArrowSquareOut} tamanho="pp" />
            </a>
          )}
        </div>
      </EditSection>

      <EditSection title={t.details}>
        <div className="sm:col-span-2">
          {field('title', t.title, {
            erro: tried && !form.title.trim() ? copy.required : undefined,
          })}
        </div>
        {field('publisher', t.publisher)}
        {field('editor', t.editor)}
        {field('copyright', t.copyright)}
        {field('pageCount', t.pages, { inputMode: 'numeric' })}
        {field('groupTitle', t.group, { ajuda: t.groupHelp })}
        {field('groupIndex', t.groupIndex, { inputMode: 'numeric' })}
      </EditSection>
    </EditPage>
  );
}
