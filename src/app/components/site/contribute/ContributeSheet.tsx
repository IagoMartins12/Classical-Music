'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import ConfirmModal from '@/app/components/ConfirmModal';
import { Button } from '@/app/components/ui/Button';
import { Field } from '@/app/components/ui/Field';
import { Selecao } from '@/app/components/ui/Selecao';
import { Sheet } from '@/app/components/ui/Sheet';
import { CONTRIBUTE } from '@/app/conteudo/site/contribute';
import { useRouteLanguage } from '@/app/hooks/useRouteLanguage';
import { contribute } from '@/app/requests/contributions';
import { chip } from '../choice';
import { youtubeId } from '../youtube';

/** The fields each record accepts, in the API's order (`contribution-rules.ts`). */
const CORRECTIONS = {
  composer: ['birthDate', 'deathDate', 'nationality', 'wikipediaLink'],
  work: [
    'compositionYear',
    'firstPublishDate',
    'tone',
    'dedicateTo',
    'instrumentation',
    'subtitle',
  ],
} as const;

type Kind = 'bio' | 'video' | 'correction';
const BIO_MIN = 300;

export type ContributionTarget = {
  type: 'composer' | 'work';
  id: string;
  name: string;
  /** Current values, to start from what is there. */
  current: Record<string, string | null | undefined>;
};

/**
 * "Contribuir": improve a composer (biography, video, a detail) or a work
 * (a detail) you did not create. It goes live at once; the toast says how
 * much XP it earned. Curiosities have their own sheet, in their block.
 */
export function ContributeSheet({
  open,
  onClose,
  target,
}: {
  open: boolean;
  onClose: () => void;
  target: ContributionTarget;
}) {
  const { language } = useRouteLanguage();
  const copy = CONTRIBUTE[language];
  const router = useRouter();
  const kinds: Kind[] =
    target.type === 'composer'
      ? ['bio', 'video', 'correction']
      : ['correction'];
  const corrections = CORRECTIONS[target.type];
  const bioField = language === 'en' ? 'bioEn' : 'bio';

  const [kind, setKind] = useState<Kind>(kinds[0]);
  const [field, setField] = useState<string>(corrections[0]);
  const [value, setValue] = useState('');
  const [touched, setTouched] = useState(false);
  const [tried, setTried] = useState(false);
  const [saving, setSaving] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const fieldOf = (k: Kind, f: string) =>
    k === 'bio' ? bioField : k === 'video' ? 'videoUrl' : f;
  const startFrom = (k: Kind, f: string) => target.current[fieldOf(k, f)] ?? '';

  useEffect(() => {
    if (!open) return;
    const first = kinds[0];
    setKind(first);
    setField(corrections[0]);
    setValue(startFrom(first, corrections[0]));
    setTouched(false);
    setTried(false);
    // Reset only when the sheet opens.
  }, [open]);

  const pick = (k: Kind, f = field) => {
    setKind(k);
    setField(f);
    setValue(startFrom(k, f));
    setTried(false);
  };

  const clean = value.trim();
  const error =
    kind === 'bio' && clean.length < BIO_MIN
      ? copy.bio.min
      : kind === 'video' && !youtubeId(clean)
        ? copy.video.invalid
        : !clean
          ? copy.correction.empty
          : clean === startFrom(kind, field).trim()
            ? copy.correction.same
            : null;

  const close = () => {
    setLeaving(false);
    onClose();
  };
  const requestClose = () => (touched && !saving ? setLeaving(true) : close());

  const publish = async () => {
    setTried(true);
    if (error) return;
    setSaving(true);
    const result = await contribute({
      entityType: target.type,
      entityId: target.id,
      field: fieldOf(kind, field),
      value: clean,
    }).catch(() => null);
    setSaving(false);
    if (!result?.ok) return toast.error(result?.error || copy.failed);
    toast.success(copy.published(result.data.xp));
    close();
    router.refresh();
  };

  return (
    <>
      <Sheet
        aberto={open}
        aoFechar={requestClose}
        titulo={copy.title(target.name)}
        descricao={copy.intro}
        largura={kind === 'bio' ? 'g' : 'm'}
        rodape={
          <div className="flex justify-end gap-2">
            <Button
              variante="fantasma"
              onClick={requestClose}
              disabled={saving}
            >
              {copy.cancel}
            </Button>
            <Button
              variante="primario"
              carregando={saving}
              onClick={() => void publish()}
            >
              {copy.publish}
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-6">
          {kinds.length > 1 && (
            <fieldset className="flex flex-col gap-2">
              <legend className="t-rotulo mb-2">{copy.what}</legend>
              <div className="flex flex-wrap gap-2">
                {kinds.map((k) => (
                  <button
                    key={k}
                    type="button"
                    aria-pressed={kind === k}
                    onClick={() => pick(k)}
                    className={chip(kind === k)}
                  >
                    {copy.kinds[k]}
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          {kind === 'bio' && (
            <Field.Area
              label={copy.bio.label}
              ajuda={copy.bio.help(copy.languages[language])}
              rows={16}
              maxLength={12_000}
              value={value}
              onChange={(e) => {
                setTouched(true);
                setValue(e.target.value);
              }}
              erro={tried ? (error ?? undefined) : undefined}
            />
          )}

          {kind === 'video' && (
            <Field
              label={copy.video.label}
              ajuda={copy.video.help}
              inputMode="url"
              placeholder="https://www.youtube.com/watch?v=…"
              value={value}
              onChange={(e) => {
                setTouched(true);
                setValue(e.target.value);
              }}
              erro={tried ? (error ?? undefined) : undefined}
            />
          )}

          {kind === 'correction' && (
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <span className="t-rotulo" id="contribute-field">
                  {copy.correction.field}
                </span>
                <Selecao
                  aria-labelledby="contribute-field"
                  opcoes={corrections.map((f) => ({
                    value: f,
                    label: copy.fields[f],
                  }))}
                  valor={field}
                  aoMudar={(f) => pick('correction', f)}
                />
              </div>
              <Field
                label={copy.correction.value}
                ajuda={copy.correction.help}
                maxLength={field === 'instrumentation' ? 300 : 200}
                value={value}
                onChange={(e) => {
                  setTouched(true);
                  setValue(e.target.value);
                }}
                erro={tried ? (error ?? undefined) : undefined}
              />
            </div>
          )}
        </div>
      </Sheet>
      <ConfirmModal
        isOpen={leaving}
        onClose={() => setLeaving(false)}
        onConfirm={close}
        title={copy.leaveTitle}
        message={copy.leaveText}
        confirmText={copy.leaveConfirm}
        type="warning"
      />
    </>
  );
}
