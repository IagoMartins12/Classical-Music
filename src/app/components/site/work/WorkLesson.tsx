'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import {
  PiArrowSquareOut,
  PiFilmSlate,
  PiInstagramLogo,
  PiPencilSimple,
  PiTiktokLogo,
  PiTrash,
} from 'react-icons/pi';
import ConfirmModal from '@/app/components/ConfirmModal';
import { Button, classesDeBotao } from '@/app/components/ui/Button';
import { Field } from '@/app/components/ui/Field';
import { Icon } from '@/app/components/ui/Icon';
import { Sheet } from '@/app/components/ui/Sheet';
import { WORK } from '@/app/conteudo/site/work';
import { useRouteLanguage } from '@/app/hooks/useRouteLanguage';
import { useSession } from '@/app/libs/session';
import type { WorkDetails } from '@/app/requests/work-page-details';
import {
  clearWorkMediaRequest,
  updateWorkMediaRequest,
  uploadWorkMediaFileRequest,
} from '@/app/requests/work-media';
import { canEditCatalog } from '@/app/utils/permissions';
import { chip } from '../choice';
import { LiteYouTube } from '../LiteYouTube';

type Source = 'youtube' | 'instagram' | 'tiktok' | 'local';
interface Lesson {
  url: string;
  title: string;
  type: string;
  source: Source;
}

const youtubeId = (url: string) =>
  /(?:youtu\.be\/|[?&]v=|\/shorts\/|\/embed\/)([\w-]{11})/.exec(url)?.[1] ??
  null;
const sourceOf = (url: string): Source | null =>
  youtubeId(url)
    ? 'youtube'
    : /instagram\.com\//.test(url)
      ? 'instagram'
      : /tiktok\.com\//.test(url)
        ? 'tiktok'
        : null;
const TYPES = ['video', 'reels', 'live'] as const;

function fromWork(work: WorkDetails): Lesson | null {
  const url = work.videoAulaUrl || work.videoAulaFile;
  if (!url) return null;
  return {
    url,
    title: work.videoAulaTitle || work.title,
    type: work.videoAulaType || 'video',
    source:
      (work.videoAulaFile
        ? 'local'
        : (sourceOf(url) ?? (work.videoAulaSource as Source))) || 'youtube',
  };
}

/**
 * The video lesson, last on the work page: YouTube plays in place, an
 * uploaded file in the browser's player, Instagram and TikTok open on
 * their sites. Curators and the work's creator can add, edit or remove it.
 */
export function WorkLesson({ work }: { work: WorkDetails }) {
  const copy = WORK[useRouteLanguage().language].lesson;
  const { data: session } = useSession();
  const canEdit =
    canEditCatalog(session?.user) ||
    (!!work.createdBy && work.createdBy === session?.user?.id);
  const [lesson, setLesson] = useState(() => fromWork(work));
  const [editing, setEditing] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [busy, setBusy] = useState(false);

  if (!lesson && !canEdit) return null;

  const remove = async () => {
    setBusy(true);
    const response = await clearWorkMediaRequest(work.id, 'video-aula').catch(
      () => null
    );
    setBusy(false);
    if (!response?.ok) {
      toast.error(copy.failed);
      return;
    }
    setLesson(null);
    setRemoving(false);
    toast.success(copy.removed);
  };

  const external =
    lesson && (lesson.source === 'instagram' || lesson.source === 'tiktok');
  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="t-titulo max-sm:!text-[1.75rem]">{copy.title}</h2>
          <span className="t-rotulo text-texto-suave">{copy.by}</span>
        </div>
        {lesson && canEdit && (
          <div className="flex gap-2">
            <Button
              tamanho="p"
              variante="fantasma"
              icone={PiPencilSimple}
              onClick={() => setEditing(true)}
            >
              {copy.edit}
            </Button>
            <Button
              tamanho="p"
              variante="fantasma"
              icone={PiTrash}
              onClick={() => setRemoving(true)}
            >
              {copy.remove}
            </Button>
          </div>
        )}
      </div>

      {!lesson ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-card bg-sup-2 p-5">
          <span className="flex items-center gap-3 t-rotulo text-texto-suave">
            <Icon de={PiFilmSlate} tamanho="m" className="text-texto-fraco" />{' '}
            {copy.none}
          </span>
          <Button icone={PiFilmSlate} onClick={() => setEditing(true)}>
            {copy.add}
          </Button>
        </div>
      ) : lesson.source === 'youtube' && youtubeId(lesson.url) ? (
        <div className="max-w-4xl">
          <LiteYouTube id={youtubeId(lesson.url)!} title={lesson.title} />
        </div>
      ) : lesson.source === 'local' ? (
        <video
          src={lesson.url}
          controls
          preload="metadata"
          className="aspect-video w-full max-w-4xl rounded-card bg-sup-2"
        />
      ) : external ? (
        <div className="flex max-w-xl items-center gap-4 rounded-card bg-sup-2 p-4">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-controle bg-[var(--fundo)] text-texto-suave">
            <Icon
              de={
                lesson.source === 'instagram' ? PiInstagramLogo : PiTiktokLogo
              }
              tamanho="m"
            />
          </span>
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="truncate font-medium">{lesson.title}</span>
            <span className="t-legenda">
              {copy.types[lesson.type] ?? lesson.type}
            </span>
          </span>
          <a
            href={lesson.url}
            target="_blank"
            rel="noopener noreferrer"
            className={classesDeBotao('secundario', 'p')}
          >
            {copy.open(lesson.source === 'instagram' ? 'Instagram' : 'TikTok')}{' '}
            <Icon de={PiArrowSquareOut} tamanho="pp" />
          </a>
        </div>
      ) : null}

      {canEdit && (
        <LessonSheet
          open={editing}
          onClose={() => setEditing(false)}
          work={work}
          lesson={lesson}
          onSaved={setLesson}
        />
      )}
      <ConfirmModal
        isOpen={removing}
        onClose={() => setRemoving(false)}
        onConfirm={remove}
        type="danger"
        title={copy.removeTitle}
        message={copy.removeText}
        confirmText={copy.remove}
        isLoading={busy}
      />
    </section>
  );
}

function LessonSheet({
  open,
  onClose,
  work,
  lesson,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  work: WorkDetails;
  lesson: Lesson | null;
  onSaved: (lesson: Lesson) => void;
}) {
  const copy = WORK[useRouteLanguage().language].lesson;
  const [from, setFrom] = useState<'link' | 'file'>(
    lesson?.source === 'local' ? 'file' : 'link'
  );
  const [url, setUrl] = useState(
    lesson && lesson.source !== 'local' ? lesson.url : ''
  );
  const [file, setFile] = useState<File | null>(null);
  const [type, setType] = useState(lesson?.type ?? 'video');
  const [title, setTitle] = useState(lesson?.title ?? '');
  const [saving, setSaving] = useState(false);
  const urlError =
    from === 'link' && url && !sourceOf(url) ? copy.invalidUrl : undefined;

  const save = async () => {
    if (from === 'link' && (!url || urlError)) return;
    if (from === 'file' && !file && lesson?.source !== 'local') return;
    setSaving(true);
    try {
      const data: Record<string, unknown> = {
        videoAulaTitle: title.trim() || copy.titlePlaceholder(work.title),
        videoAulaType: type,
        mediaSource: 'manual',
      };
      let next: Lesson;
      if (from === 'file' && file) {
        const upload = await uploadWorkMediaFileRequest(
          work.id,
          'WORK_VIDEO_LESSON',
          file
        );
        const result = await upload.json();
        if (!upload.ok) throw new Error();
        Object.assign(data, {
          videoAulaFile: result.url,
          videoAulaUrl: result.url,
          videoAulaSource: 'local',
        });
        next = {
          url: result.url,
          title: data.videoAulaTitle as string,
          type,
          source: 'local',
        };
      } else if (from === 'link') {
        const source = sourceOf(url)!;
        Object.assign(data, {
          videoAulaUrl: url,
          videoAulaFile: null,
          videoAulaSource: source,
        });
        next = { url, title: data.videoAulaTitle as string, type, source };
      } else {
        next = { ...lesson!, title: data.videoAulaTitle as string, type };
      }
      const response = await updateWorkMediaRequest(work.id, data);
      if (!response.ok) throw new Error();
      onSaved(next);
      toast.success(copy.saved);
      onClose();
    } catch {
      toast.error(copy.failed);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet
      aberto={open}
      aoFechar={onClose}
      titulo={copy.sheetTitle}
      descricao={work.title}
      largura="m"
      rodape={
        <div className="flex justify-end gap-2">
          <Button variante="fantasma" onClick={onClose}>
            {copy.cancel}
          </Button>
          <Button
            variante="primario"
            carregando={saving}
            onClick={() => void save()}
          >
            {copy.save}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-5">
        <fieldset className="flex flex-col gap-2">
          <legend className="t-rotulo mb-2">{copy.from}</legend>
          <div className="flex gap-2">
            {(['link', 'file'] as const).map((f) => (
              <button
                key={f}
                type="button"
                aria-pressed={from === f}
                onClick={() => setFrom(f)}
                className={chip(from === f)}
              >
                {f === 'link' ? copy.fromLink : copy.fromFile}
              </button>
            ))}
          </div>
        </fieldset>
        {from === 'link' ? (
          <Field
            label={copy.url}
            ajuda={copy.urlHelp}
            type="url"
            inputMode="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            erro={urlError}
            placeholder="https://"
          />
        ) : (
          <Field
            label={copy.file}
            ajuda={copy.fileHelp}
            type="file"
            accept="video/mp4,video/webm,video/quicktime"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        )}
        <fieldset className="flex flex-col gap-2">
          <legend className="t-rotulo mb-2">{copy.type}</legend>
          <div className="flex flex-wrap gap-2">
            {TYPES.map((t) => (
              <button
                key={t}
                type="button"
                aria-pressed={type === t}
                onClick={() => setType(t)}
                className={chip(type === t)}
              >
                {copy.types[t]}
              </button>
            ))}
          </div>
        </fieldset>
        <Field
          label={copy.titleField}
          value={title}
          placeholder={copy.titlePlaceholder(work.title)}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
    </Sheet>
  );
}
