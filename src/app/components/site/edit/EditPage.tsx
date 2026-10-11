'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import toast from 'react-hot-toast';
import { PiArrowLeft, PiArrowSquareOut, PiTrash } from 'react-icons/pi';
import ConfirmModal from '@/app/components/ConfirmModal';
import Link from '@/app/components/LocalizedLink';
import { Button, classesDeBotao } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import { EDIT } from '@/app/conteudo/site/edit';
import { useRouteLanguage } from '@/app/hooks/useRouteLanguage';
import { deleteUpload, getCascadeInfo } from '@/app/requests/uploads-client';
import { PersonalNav } from '../personal/PersonalNav';

type Kind = 'composer' | 'work' | 'score';

/** A titled block of fields: the heading on the left, fields on the right. */
export function EditSection({
  title,
  note,
  children,
}: {
  title: string;
  note?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="grid grid-cols-1 gap-6 border-t border-[var(--linha)] py-8 lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-10">
      <div className="flex flex-col gap-1">
        <h2 className="t-subtitulo">{title}</h2>
        {note && <p className="t-legenda">{note}</p>}
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">{children}</div>
    </section>
  );
}

/**
 * The frame of the upload edit pages: the personal tabs (Uploads), the
 * record's name with "see on the site" and delete, the form in titled
 * sections, and a save bar fixed to the bottom that wakes up once something
 * changed. Leaving with unsaved changes asks first.
 */
export function EditPage({
  kind,
  id,
  name,
  viewHref,
  updatedAt,
  dirty,
  saving,
  onSave,
  onDiscard,
  children,
}: {
  kind: Kind;
  id: string;
  name: string;
  viewHref?: string;
  updatedAt?: string;
  dirty: boolean;
  saving: boolean;
  onSave: () => void;
  onDiscard: () => void;
  children: ReactNode;
}) {
  const { language } = useRouteLanguage();
  const copy = EDIT[language];
  const router = useRouter();
  const [removing, setRemoving] = useState(false);
  const [cascade, setCascade] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [leaving, setLeaving] = useState<string | null>(null);

  // The browser asks before closing or reloading with unsaved changes.
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const openRemove = async () => {
    setRemoving(true);
    setCascade(null);
    const info = await getCascadeInfo(kind, id).catch(() => null);
    if (info && (info.totalWorks || info.totalScores))
      setCascade(copy.removeWith(info.totalWorks, info.totalScores));
  };
  const remove = async () => {
    setBusy(true);
    const result = await deleteUpload(kind, id).catch(() => null);
    setBusy(false);
    if (!result?.ok) {
      toast.error(copy.failed);
      return;
    }
    toast.success(copy.removed);
    router.push('/upload');
  };
  const go = (href: string) => (dirty ? setLeaving(href) : router.push(href));
  const date =
    updatedAt &&
    new Intl.DateTimeFormat(language === 'pt' ? 'pt-BR' : 'en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(updatedAt));

  return (
    <div className="flex flex-col">
      <PersonalNav />
      <div className="section-wrap flex flex-col py-10">
        <button
          type="button"
          onClick={() => go('/upload')}
          className="t-rotulo mb-6 inline-flex items-center gap-2 self-start text-texto-suave hover:text-texto"
        >
          <Icon de={PiArrowLeft} tamanho="pp" /> {copy.back}
        </button>
        <header className="flex flex-wrap items-end justify-between gap-4 pb-8">
          <div className="flex min-w-0 flex-col gap-2">
            <p className="t-rotulo text-ouro-texto">{copy.kinds[kind]}</p>
            <h1 className="font-display text-[clamp(2.25rem,5vw,3.5rem)] leading-[1.02] tracking-[-0.015em] [overflow-wrap:anywhere]">
              {name}
            </h1>
            {date && <p className="t-legenda">{copy.updated(date)}</p>}
          </div>
          <div className="flex flex-wrap gap-2">
            {viewHref && (
              <Link
                href={viewHref}
                className={classesDeBotao('secundario', 'p')}
              >
                {copy.view} <Icon de={PiArrowSquareOut} tamanho="pp" />
              </Link>
            )}
            <Button
              tamanho="p"
              variante="fantasma"
              icone={PiTrash}
              onClick={() => void openRemove()}
            >
              {copy.remove}
            </Button>
          </div>
        </header>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (dirty) onSave();
          }}
          className="flex flex-col"
        >
          {children}
          <div className="sticky bottom-0 z-elevado -mx-4 mt-4 flex items-center justify-between gap-3 border-t border-[var(--linha)] bg-fundo/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10">
            <span className="t-rotulo text-texto-suave" aria-live="polite">
              {dirty ? copy.unsaved : copy.upToDate}
            </span>
            <span className="flex gap-2">
              {dirty && (
                <Button
                  variante="fantasma"
                  onClick={onDiscard}
                  disabled={saving}
                >
                  {copy.discard}
                </Button>
              )}
              <Button
                type="submit"
                variante="primario"
                disabled={!dirty}
                carregando={saving}
              >
                {copy.save}
              </Button>
            </span>
          </div>
        </form>
      </div>

      <ConfirmModal
        isOpen={removing}
        onClose={() => setRemoving(false)}
        onConfirm={remove}
        type="danger"
        title={copy.removeTitle(name)}
        message={cascade ? `${copy.removeText} ${cascade}` : copy.removeText}
        confirmText={copy.remove}
        isLoading={busy}
      />
      <ConfirmModal
        isOpen={!!leaving}
        onClose={() => setLeaving(null)}
        onConfirm={() => {
          const href = leaving!;
          setLeaving(null);
          onDiscard();
          router.push(href);
        }}
        type="warning"
        title={copy.leaveTitle}
        message={copy.leaveText}
        confirmText={copy.leaveConfirm}
        cancelText={copy.keepEditing}
        acaoPerigosa
      />
    </div>
  );
}

/** The form state, whether it moved from where it started, and a reset. */
export function useEditForm<T>(initial: T) {
  const [start, setStart] = useState(initial);
  const [form, setForm] = useState(initial);
  const dirty = JSON.stringify(form) !== JSON.stringify(start);
  return {
    form,
    set: (patch: Partial<T>) => setForm((f) => ({ ...f, ...patch })),
    dirty,
    discard: () => setForm(start),
    commit: () => setStart(form),
  };
}
