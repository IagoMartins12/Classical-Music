'use client';

import { useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import toast from 'react-hot-toast';
import {
  PiEnvelopeSimple,
  PiLightbulb,
  PiListBullets,
  PiPencilSimpleLine,
  PiTextAlignLeft,
  PiYoutubeLogo,
} from 'react-icons/pi';
import ConfirmModal from '@/app/components/ConfirmModal';
import { Button } from '@/app/components/ui/Button';
import { CaixaDeMarcar } from '@/app/components/ui/CaixaDeMarcar';
import { tonalityOptions } from '@/app/utils/tonalities';
import { Field } from '@/app/components/ui/Field';
import { Icon } from '@/app/components/ui/Icon';
import { Sheet } from '@/app/components/ui/Sheet';
import { cx } from '@/app/components/ui/cx';
import { CONTRIBUTE } from '@/app/conteudo/site/contribute';
import { useAuth } from '@/app/hooks/useAuth';
import { useRouteLanguage } from '@/app/hooks/useRouteLanguage';
import { useSignInGate } from '@/app/hooks/useSignInGate';
import { legacyAuth } from '@/app/libs/api/compat';
import {
  addCuriosity,
  contribute,
  type Curiosity,
} from '@/app/requests/contributions';
import { youtubeId } from '../youtube';

export type ContributionKind = 'bio' | 'curiosity' | 'video' | 'data';

export type ContributionTarget = {
  type: 'composer' | 'work';
  id: string;
  /** How the sheet names it ("Completar Chopin"). */
  name: string;
  /** Current values of the fields people can change. */
  current: Record<string, string | null | undefined>;
};

/** XP each kind earns, as in the API (`contribution-rules.ts`). */
const XP: Record<ContributionKind, number> = {
  bio: 120,
  curiosity: 30,
  video: 40,
  data: 20,
};

const ICONS = {
  bio: PiTextAlignLeft,
  curiosity: PiLightbulb,
  video: PiYoutubeLogo,
  data: PiListBullets,
};

/** The detail fields per record, in the API's order. */
const DATA_FIELDS = {
  composer: ['birthDate', 'deathDate', 'nationality', 'wikipediaLink'],
  work: [
    'compositionYear',
    'tone',
    'instrumentation',
    'dedicateTo',
    'firstPublishDate',
    'subtitle',
  ],
} as const;

const KINDS: Record<ContributionTarget['type'], ContributionKind[]> = {
  composer: ['bio', 'curiosity', 'video', 'data'],
  work: ['video', 'data'],
};

/** Where each record keeps its video: a link on the composer, an id on the work. */
const VIDEO_FIELD = { composer: 'videoUrl', work: 'youtubeVideoId' } as const;

const BIO_MIN = 300;
const CURIOSITY_MIN = 20;

const Context = createContext<{
  open: (kind: ContributionKind) => void;
  target: ContributionTarget;
} | null>(null);

/** Opens the contribution sheet from anywhere inside `ContributeProvider`. */
export function useContribute() {
  const context = useContext(Context);
  if (!context) throw new Error('useContribute outside ContributeProvider');
  return context;
}

/**
 * The gate and the sheet, once per page: a visitor signs in first; an
 * unconfirmed email is asked to confirm (biographies, curiosities and
 * videos carry the author's name); a confirmed one contributes.
 */
export function ContributeProvider({
  target,
  children,
}: {
  target: ContributionTarget;
  children: ReactNode;
}) {
  const { user, isAuthenticated } = useAuth();
  const allowed = useSignInGate();
  const [kind, setKind] = useState<ContributionKind | null>(null);
  const [verifying, setVerifying] = useState(false);

  const open = useCallback(
    (next: ContributionKind) => {
      if (!isAuthenticated) return void allowed('contribute');
      if (!user?.emailVerified) return setVerifying(true);
      setKind(next);
    },
    [isAuthenticated, user?.emailVerified, allowed]
  );
  const value = useMemo(() => ({ open, target }), [open, target]);

  return (
    <Context.Provider value={value}>
      {children}
      <VerifySheet
        open={verifying}
        email={user?.email ?? ''}
        onClose={() => setVerifying(false)}
      />
      {kind && (
        <ContributeSheet
          kind={kind}
          target={target}
          onKind={setKind}
          onClose={() => setKind(null)}
        />
      )}
    </Context.Provider>
  );
}

function VerifySheet({
  open,
  email,
  onClose,
}: {
  open: boolean;
  email: string;
  onClose: () => void;
}) {
  const copy = CONTRIBUTE[useRouteLanguage().language].verify;
  const [sending, setSending] = useState(false);
  const resend = async () => {
    setSending(true);
    const result = await legacyAuth
      .resendConfirmationByEmail(email)
      .catch(() => null);
    setSending(false);
    if (!result?.success) return toast.error(result?.message ?? '');
    toast.success(copy.sent(email));
    onClose();
  };
  return (
    <Sheet
      aberto={open}
      aoFechar={onClose}
      titulo={copy.title}
      descricao={copy.intro}
      largura="p"
      rodape={
        <div className="flex justify-end gap-2">
          <Button variante="fantasma" onClick={onClose}>
            {copy.later}
          </Button>
          <Button
            variante="primario"
            icone={PiEnvelopeSimple}
            carregando={sending}
            onClick={() => void resend()}
          >
            {copy.resend}
          </Button>
        </div>
      }
    >
      <p className="t-rotulo text-texto-suave">{copy.body(email)}</p>
    </Sheet>
  );
}

/**
 * "Completar": one tab per kind, as in the sketch. Starts from what is
 * there; a detail tab sends each changed field as its own contribution, so
 * each can be reported and undone on its own.
 */
function ContributeSheet({
  kind,
  target,
  onKind,
  onClose,
}: {
  kind: ContributionKind;
  target: ContributionTarget;
  onKind: (kind: ContributionKind) => void;
  onClose: () => void;
}) {
  const { language } = useRouteLanguage();
  const copy = CONTRIBUTE[language];
  const router = useRouter();
  const client = useQueryClient();
  const bioField = language === 'en' ? 'bioEn' : 'bio';
  const fields = DATA_FIELDS[target.type];
  const initialData = Object.fromEntries(
    fields.map((f) => [f, target.current[f] ?? ''])
  );

  const [bio, setBio] = useState(target.current[bioField] ?? '');
  const [curiosity, setCuriosity] = useState('');
  const [source, setSource] = useState('');
  const [showAuthor, setShowAuthor] = useState(false);
  const videoField = VIDEO_FIELD[target.type];
  const currentVideo = target.current[videoField];
  const [video, setVideo] = useState(
    target.type === 'work' && currentVideo
      ? `https://www.youtube.com/watch?v=${currentVideo}`
      : (currentVideo ?? '')
  );
  const [data, setData] = useState<Record<string, string>>(initialData);
  const [touched, setTouched] = useState(false);
  const [tried, setTried] = useState(false);
  const [saving, setSaving] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const touch =
    <T,>(set: (value: T) => void) =>
    (value: T) => {
      setTouched(true);
      set(value);
    };
  const changed = fields.filter(
    (f) => data[f].trim() && data[f].trim() !== initialData[f].trim()
  );
  const error =
    kind === 'bio' && bio.trim().length < BIO_MIN
      ? copy.bio.min
      : kind === 'curiosity' && curiosity.trim().length < CURIOSITY_MIN
        ? copy.curiosity.min
        : kind === 'video' && !youtubeId(video)
          ? copy.video.invalid
          : kind === 'data' && !changed.length
            ? copy.data.nothing
            : null;

  const close = () => {
    setLeaving(false);
    onClose();
  };
  const requestClose = () => (touched && !saving ? setLeaving(true) : close());

  const send = async (): Promise<string | null> => {
    const extra = source.trim() || undefined;
    if (kind === 'curiosity') {
      const result = await addCuriosity(target.id, {
        text: curiosity.trim(),
        language,
        source: extra,
        showAuthor,
      });
      if (!result.ok) return result.error;
      client.setQueryData<Curiosity[]>(
        ['curiosities', target.id, language],
        (list) => [...(list ?? []), result.data]
      );
      return null;
    }
    const entries: [string, string][] =
      kind === 'bio'
        ? [[bioField, bio.trim()]]
        : kind === 'video'
          ? [[videoField, video.trim()]]
          : changed.map((f) => [f, data[f].trim()]);
    for (const [field, value] of entries) {
      const result = await contribute({
        entityType: target.type,
        entityId: target.id,
        field,
        value,
        source: extra,
      });
      if (!result.ok) return result.error;
    }
    return null;
  };

  const publish = async () => {
    setTried(true);
    if (error) return;
    setSaving(true);
    const failure = await send().catch(() => copy.failed);
    setSaving(false);
    if (failure) return toast.error(failure || copy.failed);
    toast.success(copy.published);
    close();
    // Também a curiosidade: a lista local já mostra a nova, e o refresh limpa
    // o cache do roteador das outras páginas que a mostram.
    router.refresh();
  };

  const kinds = KINDS[target.type];
  const shownError = tried ? (error ?? undefined) : undefined;

  return (
    <>
      <Sheet
        aberto
        aoFechar={requestClose}
        titulo={copy.title(target.name)}
        descricao={copy.intro}
        largura="m"
        rodape={
          <div className="flex w-full flex-wrap items-center justify-between gap-3">
            <span className="t-legenda">{copy.xpLater(XP[kind])}</span>
            <div className="ml-auto flex gap-2">
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
          </div>
        }
      >
        <div className="flex flex-col gap-5">
          {kinds.length > 1 && (
            <div
              role="tablist"
              aria-label={copy.tabs}
              className="grid grid-cols-2 gap-2 sm:grid-cols-4"
            >
              {kinds.map((k) => (
                <button
                  key={k}
                  type="button"
                  role="tab"
                  aria-selected={kind === k}
                  onClick={() => {
                    setTried(false);
                    onKind(k);
                  }}
                  className={cx(
                    'flex min-h-16 flex-col items-start justify-center gap-1 rounded-card px-3 text-left transition-colors duration-[var(--t-toque)]',
                    kind === k
                      ? 'tint-ouro text-ouro-na-tinta'
                      : 'bg-sup-2 text-texto-suave hover:text-texto'
                  )}
                >
                  <Icon de={ICONS[k]} tamanho="m" />
                  <span className="text-[0.875rem]">{copy.kinds[k]}</span>
                </button>
              ))}
            </div>
          )}

          {kind === 'bio' && (
            <>
              <Field.Area
                label={copy.bio.label(copy.languages[language])}
                rows={9}
                maxLength={12_000}
                placeholder={copy.bio.placeholder}
                ajuda={copy.bio.count(bio.length)}
                value={bio}
                onChange={(e) => touch(setBio)(e.target.value)}
                erro={shownError}
              />
              <Field
                label={`${copy.bio.source} ${copy.bio.sourceHint}`}
                placeholder={copy.bio.sourcePlaceholder}
                maxLength={300}
                value={source}
                onChange={(e) => touch(setSource)(e.target.value)}
              />
            </>
          )}

          {kind === 'curiosity' && (
            <>
              <Field.Area
                label={copy.curiosity.label}
                rows={3}
                maxLength={280}
                placeholder={copy.curiosity.placeholder}
                value={curiosity}
                onChange={(e) => touch(setCuriosity)(e.target.value)}
                erro={shownError}
              />
              <Field
                label={copy.curiosity.source}
                placeholder={copy.curiosity.sourcePlaceholder}
                maxLength={300}
                value={source}
                onChange={(e) => touch(setSource)(e.target.value)}
              />
              <CaixaDeMarcar
                rotulo={copy.curiosity.showName}
                ajuda={copy.curiosity.showNameHint}
                marcado={showAuthor}
                aoMudar={touch(setShowAuthor)}
              />
            </>
          )}

          {kind === 'video' && (
            <Field
              label={copy.video.label}
              ajuda={copy.video.hint}
              inputMode="url"
              placeholder="https://www.youtube.com/watch?v=…"
              value={video}
              onChange={(e) => touch(setVideo)(e.target.value)}
              erro={shownError}
            />
          )}

          {kind === 'data' && (
            <div className="flex flex-col gap-2">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {fields.map((f) =>
                  f === 'tone' ? (
                    <Field.Selecao
                      key={f}
                      label={copy.fields[f]}
                      value={data[f]}
                      onChange={(e) =>
                        touch(setData)({ ...data, [f]: e.target.value })
                      }
                    >
                      <option value="">{'—'}</option>
                      {tonalityOptions(
                        language,
                        target.current[f] ?? undefined
                      ).map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </Field.Selecao>
                  ) : (
                    <Field
                      key={f}
                      label={copy.fields[f]}
                      maxLength={f === 'instrumentation' ? 300 : 200}
                      value={data[f]}
                      onChange={(e) =>
                        touch(setData)({ ...data, [f]: e.target.value })
                      }
                    />
                  )
                )}
              </div>
              {shownError && (
                <p role="alert" className="t-legenda text-erro">
                  {shownError}
                </p>
              )}
            </div>
          )}
        </div>
      </Sheet>
      <ConfirmModal
        isOpen={leaving}
        onClose={() => setLeaving(false)}
        onConfirm={close}
        type="warning"
        title={copy.leaveTitle}
        message={copy.leaveText}
        confirmText={copy.leaveConfirm}
      />
    </>
  );
}

/**
 * "Ajude a completar": what is missing, as buttons that open the right
 * tab. Nothing missing, nothing shown.
 */
export function CompleteInvite({
  missing,
}: {
  missing: { key: string; kind: ContributionKind }[];
}) {
  const { language } = useRouteLanguage();
  const copy = CONTRIBUTE[language];
  const { open, target } = useContribute();
  const { user, isAuthenticated } = useAuth();
  if (!missing.length) return null;
  const labels = missing.map((m) => copy.invite.missing[m.key] ?? m.key);
  const list =
    labels.length > 1
      ? `${labels.slice(0, -1).join(', ')}${copy.invite.and}${labels.at(-1)}`
      : labels[0];
  return (
    <div className="flex flex-col gap-4 rounded-card bg-sup-2 p-5">
      <span className="flex items-start gap-3">
        <Icon
          de={PiPencilSimpleLine}
          tamanho="m"
          className="mt-0.5 shrink-0 text-ouro-texto"
        />
        <span className="flex flex-col gap-1">
          <span className="font-medium">
            {copy.invite.title(
              target.type === 'composer' ? copy.composerTarget : copy.workTarget
            )}
          </span>
          <span className="t-rotulo text-texto-suave">
            {copy.invite.body(list)}
          </span>
        </span>
      </span>
      <div className="flex flex-wrap gap-2 pl-8">
        {missing.map((m, i) => (
          <Button key={m.key} tamanho="p" onClick={() => open(m.kind)}>
            + {labels[i]}
          </Button>
        ))}
      </div>
      {isAuthenticated && !user?.emailVerified && (
        <span className="t-legenda pl-8">
          {copy.invite.unverified}{' '}
          <button
            type="button"
            onClick={() => open(missing[0].kind)}
            className="text-ouro-texto underline-offset-4 hover:underline"
          >
            {copy.invite.how}
          </button>
        </span>
      )}
    </div>
  );
}

/** "Algo errado nesta página? Corrija um dado ou envie uma obra que falta." */
export function WrongOnThisPage({ uploadHref }: { uploadHref: string }) {
  const copy = CONTRIBUTE[useRouteLanguage().language].wrong;
  const { open } = useContribute();
  const link = 'text-ouro-texto underline-offset-4 hover:underline';
  return (
    <p className="t-rotulo mt-16 text-texto-suave">
      {copy.lead}{' '}
      <button type="button" onClick={() => open('data')} className={link}>
        {copy.fix}
      </button>{' '}
      {copy.or}{' '}
      <Link href={uploadHref} className={link}>
        {copy.upload}
      </Link>
      .
    </p>
  );
}
