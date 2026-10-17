'use client';

import Image from 'next/image';
import { CaixaDeMarcar } from '@/app/components/ui/CaixaDeMarcar';
import { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import {
  PiBookmarkSimple,
  PiCamera,
  PiChalkboardTeacher,
  PiCheck,
  PiFileText,
  PiHeart,
  PiMagnifyingGlass,
  PiNotePencil,
  PiStack,
  PiStar,
  PiStarFill,
  PiX,
} from 'react-icons/pi';
import type { IconType } from 'react-icons';
import { iniciais } from '@/app/components/blog/site/pecas';
import { LocationField } from '@/app/components/site/profile/LocationField';
import { PhoneField } from '@/app/components/site/profile/PhoneField';
import { Field } from '@/app/components/ui/Field';
import { Icon } from '@/app/components/ui/Icon';
import { Selecao } from '@/app/components/ui/Selecao';
import { SelecaoComBusca } from '@/app/components/ui/SelecaoComBusca';
import { cx } from '@/app/components/ui/cx';
import { ERAS, eraOf } from '@/app/conteudo/site/eras';
import {
  PRACTICE_MINUTES,
  STUDY_HORIZONS,
  type IntroItem,
  type WelcomeCopy,
} from '@/app/conteudo/site/welcome';
import { useSessionUpdate } from '@/app/hooks/useSessionUpdate';
import { uploadAvatarRequest } from '@/app/requests/account-client';
import {
  composerOptions,
  findComposerById,
} from '@/app/requests/catalog-search';
import type { OnboardingData } from '@/app/stores/authStore';
import { Portrait } from '../Portrait';
import { chip } from '../choice';

export interface WelcomeOptions {
  instruments: Array<{ id: string; name: string; category: string | null }>;
  composers: Array<{
    id: string;
    name: string;
    fullName: string;
    portraitUrl: string | null;
    epochName: string | null;
  }>;
  epochs: Array<{ id: string; name: string }>;
}

export interface StepProps {
  data: OnboardingData;
  update: (patch: Partial<OnboardingData>) => void;
  copy: WelcomeCopy;
  language: 'pt' | 'en';
}

type Level = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
const LEVELS: Level[] = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];
const USER_TYPES = [
  'MUSIC_STUDENT',
  'PROFESSIONAL',
  'TEACHER',
  'CASUAL_USER',
] as const;

function Group({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <fieldset className={cx('flex flex-col gap-3', className)}>
      <legend className="t-rotulo mb-3 text-texto-suave">{label}</legend>
      {children}
    </fieldset>
  );
}

function Pills<T extends string | number>({
  options,
  value,
  label,
  onPick,
}: {
  options: readonly T[];
  value: T | undefined;
  label: (option: T) => string;
  onPick: (option: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          aria-pressed={value === option}
          onClick={() => onPick(option)}
          className={chip(value === option)}
        >
          {label(option)}
        </button>
      ))}
    </div>
  );
}

/**
 * The person's picture, or their initials in gold Garamond on a plain disc —
 * the same as the account menu and the profile, never a cropped letter.
 * The disc's surface comes in `className`, against what is around it.
 */
export function WelcomeAvatar({
  name,
  image,
  className,
}: {
  name: string;
  image: string | null;
  className?: string;
}) {
  return (
    <span
      className={cx(
        'relative grid shrink-0 place-items-center overflow-hidden rounded-full font-display leading-none text-ouro-texto shadow-[var(--sombra-1)]',
        className
      )}
    >
      {image ? (
        <Image src={image} alt="" fill sizes="128px" className="object-cover" />
      ) : (
        <span aria-hidden="true">{iniciais(name) || '?'}</span>
      )}
    </span>
  );
}

const INTRO: [IntroItem, IconType][] = [
  ['repertoire', PiBookmarkSimple],
  ['scores', PiFileText],
  ['favorites', PiHeart],
  ['notes', PiNotePencil],
  ['collections', PiStack],
  ['lessons', PiChalkboardTeacher],
];

/**
 * The first step: what Opus Atlas keeps for the person, before any question.
 * A reading list, not a grid of cards — the picture of the atlas sits beside
 * it on wide screens.
 */
export function IntroStep({ copy }: StepProps) {
  return (
    <div className="flex flex-col gap-8">
      <ul className="cascata grid grid-cols-1 gap-x-10 sm:grid-cols-2">
        {INTRO.map(([key, icon]) => {
          const [title, text] = copy.intro.items[key];
          return (
            <li
              key={key}
              className="flex gap-4 border-t border-[var(--linha)] py-5"
            >
              <Icon
                de={icon}
                tamanho="m"
                className="mt-1 shrink-0 text-ouro-texto"
              />
              <span className="flex flex-col gap-1">
                <span className="font-display text-[1.375rem] leading-snug">
                  {title}
                </span>
                <span className="t-rotulo text-texto-suave">{text}</span>
              </span>
            </li>
          );
        })}
      </ul>
      <p className="t-corpo max-w-[56ch] text-texto-suave">{copy.intro.then}</p>
    </div>
  );
}

export function YouStep({ data, update, copy }: StepProps) {
  return (
    <div
      role="radiogroup"
      aria-label={copy.you.title}
      className="grid grid-cols-1 gap-3 sm:grid-cols-2"
    >
      {USER_TYPES.map((type) => {
        const [title, text] = copy.you.types[type];
        const active = data.userType === type;
        return (
          <button
            key={type}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => update({ userType: type })}
            className={cx(
              'flex items-start justify-between gap-3 rounded-card p-5 text-left transition-colors duration-[var(--t-toque)]',
              active
                ? 'tint-ouro text-ouro-na-tinta'
                : 'bg-sup-2 hover:text-ouro-texto'
            )}
          >
            <span className="flex flex-col gap-1">
              <span className="font-display text-[1.375rem] leading-tight">
                {title}
              </span>
              <span className={cx('t-rotulo', !active && 'text-texto-suave')}>
                {text}
              </span>
            </span>
            {active && <Icon de={PiCheck} className="mt-1" />}
          </button>
        );
      })}
    </div>
  );
}

export function InstrumentsStep({
  data,
  update,
  copy,
  options,
}: StepProps & { options: WelcomeOptions }) {
  const chosen = data.instruments ?? [];
  const set = (next: typeof chosen) => {
    // Always exactly one main instrument while any is picked.
    if (next.length && !next.some((i) => i.isPrimary))
      next = next.map((i, n) => ({ ...i, isPrimary: n === 0 }));
    update({ instruments: next });
  };
  const toggle = (instrument: WelcomeOptions['instruments'][number]) =>
    chosen.some((i) => i.id === instrument.id)
      ? set(chosen.filter((i) => i.id !== instrument.id))
      : set([
          ...chosen,
          {
            id: instrument.id,
            name: instrument.name,
            level: data.experienceLevel ?? 'BEGINNER',
            isPrimary: false,
            isLearning: data.userType === 'MUSIC_STUDENT',
          },
        ]);
  const patch = (id: string, change: Partial<(typeof chosen)[number]>) =>
    set(
      chosen.map((i) =>
        i.id === id
          ? { ...i, ...change }
          : change.isPrimary
            ? { ...i, isPrimary: false }
            : i
      )
    );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-2">
        {options.instruments.map((instrument) => {
          const active = chosen.some((i) => i.id === instrument.id);
          return (
            <button
              key={instrument.id}
              type="button"
              aria-pressed={active}
              onClick={() => toggle(instrument)}
              className={chip(active)}
            >
              {instrument.name}
            </button>
          );
        })}
      </div>
      {chosen.length ? (
        <ul className="flex flex-col divide-y divide-[var(--linha)]">
          {chosen.map((i) => (
            <li
              key={i.id}
              className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3"
            >
              <button
                type="button"
                aria-pressed={i.isPrimary}
                aria-label={
                  i.isPrimary
                    ? copy.instruments.primary
                    : copy.instruments.makePrimary(i.name)
                }
                title={
                  i.isPrimary
                    ? copy.instruments.primary
                    : copy.instruments.makePrimary(i.name)
                }
                onClick={() => patch(i.id, { isPrimary: true })}
                className="grid h-10 w-10 place-items-center rounded-full text-ouro-texto hover:bg-sup-2"
              >
                <Icon de={i.isPrimary ? PiStarFill : PiStar} />
              </button>
              <span className="min-w-0 flex-1 font-display text-[1.25rem]">
                {i.name}
              </span>
              <div className="w-40">
                <Selecao
                  aria-label={`${i.name}: ${copy.study.level}`}
                  className="min-h-10! rounded-full! py-0! text-[0.9375rem]"
                  opcoes={LEVELS.map((l) => ({
                    value: l,
                    label: copy.levels[l],
                  }))}
                  valor={i.level}
                  aoMudar={(level) => patch(i.id, { level: level as Level })}
                />
              </div>
              <CaixaDeMarcar
                rotulo={copy.instruments.learning}
                marcado={i.isLearning}
                aoMudar={(on) => patch(i.id, { isLearning: on })}
              />
              <button
                type="button"
                aria-label={copy.instruments.remove(i.name)}
                onClick={() =>
                  toggle({ id: i.id, name: i.name, category: null })
                }
                className="grid h-10 w-10 place-items-center rounded-full text-texto-fraco hover:bg-sup-2 hover:text-texto"
              >
                <Icon de={PiX} />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="t-rotulo text-texto-suave">{copy.instruments.none}</p>
      )}
    </div>
  );
}

export function StudyStep({ data, update, copy }: StepProps) {
  return (
    <div className="flex flex-col gap-8">
      <Group label={copy.study.level}>
        <Pills
          options={LEVELS}
          value={data.experienceLevel}
          label={(l) => copy.levels[l]}
          onPick={(experienceLevel) => update({ experienceLevel })}
        />
      </Group>
      <Group label={copy.study.practice}>
        <Pills
          options={PRACTICE_MINUTES}
          value={
            data.practiceTimePerWeek as
              | (typeof PRACTICE_MINUTES)[number]
              | undefined
          }
          label={copy.study.minutes}
          onPick={(practiceTimePerWeek) => update({ practiceTimePerWeek })}
        />
      </Group>
      {data.userType === 'MUSIC_STUDENT' && (
        <Group label={copy.study.horizon}>
          <Pills
            options={STUDY_HORIZONS}
            value={data.studyHorizon}
            label={(h) => copy.study.horizons[h]}
            onPick={(studyHorizon) => update({ studyHorizon })}
          />
        </Group>
      )}
    </div>
  );
}

export function TasteStep({
  data,
  update,
  copy,
  language,
  options,
}: StepProps & { options: WelcomeOptions }) {
  // A composer found by name, outside the suggested ones.
  const [found, setFound] = useState<
    WelcomeOptions['composers'][number] | null
  >(null);
  // The seven eras the site tells, each matched to its catalog epoch.
  const eras = ERAS.flatMap((era) => {
    const epoch = options.epochs.find((e) => eraOf(e.name)?.key === era.key);
    return epoch ? [{ era, epoch }] : [];
  });
  // The composers are not tied to the era: someone can love the medieval
  // and have Chopin as a favorite.
  const suggested = options.composers;
  const composers =
    found && !suggested.some((c) => c.id === found.id)
      ? [found, ...suggested]
      : suggested;

  const choose = async (id: string, label: string) => {
    if (!id) return update({ favoriteComposerId: undefined });
    update({ favoriteComposerId: id });
    const detail = await findComposerById(id).catch(() => null);
    setFound({
      id,
      name: detail?.name ?? label,
      fullName: detail?.fullName ?? label,
      portraitUrl: detail?.portraitUrl ?? null,
      epochName: detail?.epochName ?? null,
    });
  };

  return (
    <div className="flex flex-col gap-8">
      <Group label={copy.taste.era}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {eras.map(({ era, epoch }) => {
            const active = data.favoriteEpochId === epoch.id;
            return (
              <button
                key={era.key}
                type="button"
                aria-pressed={active}
                onClick={() =>
                  update({ favoriteEpochId: active ? undefined : epoch.id })
                }
                className={cx(
                  'group relative flex aspect-[4/3] items-end overflow-hidden rounded-card p-3 text-left',
                  active &&
                    'ring-2 ring-[var(--ouro)] ring-offset-2 ring-offset-[var(--fundo)]'
                )}
              >
                <Image
                  src={era.image}
                  alt=""
                  fill
                  sizes="(min-width: 640px) 180px, 45vw"
                  className="object-cover transition-transform duration-700 ease-[var(--saida)] group-hover:scale-[1.03] motion-reduce:transition-none"
                />
                <span
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-veu-foto via-veu-foto/45 to-transparent"
                />
                <span className="relative flex w-full items-end justify-between gap-2 text-sobre-foto">
                  <span className="font-display text-[1.125rem] leading-tight">
                    {era.name[language]}
                  </span>
                  {active && <Icon de={PiCheck} tamanho="pp" />}
                </span>
              </button>
            );
          })}
        </div>
      </Group>
      <Group label={copy.taste.composer}>
        {/* Someone not among the suggestions: the same search pill as the
            catalog's, above the portraits it adds to. */}
        <SelecaoComBusca
          buscar={composerOptions}
          valor={found && data.favoriteComposerId === found.id ? found.id : ''}
          rotulo={found?.fullName}
          icone={PiMagnifyingGlass}
          placeholder={copy.taste.search}
          vazio={copy.taste.searchEmpty}
          limpavel
          aria-label={copy.taste.search}
          aoMudar={(value, option) => void choose(value, option?.label ?? '')}
          className="!rounded-full sm:max-w-md"
        />
        <div className="grid grid-cols-3 gap-x-3 gap-y-4 pt-2 sm:grid-cols-5">
          {composers.map((c) => {
            const active = data.favoriteComposerId === c.id;
            return (
              <button
                key={c.id}
                type="button"
                aria-pressed={active}
                onClick={() =>
                  update({ favoriteComposerId: active ? undefined : c.id })
                }
                className="group flex flex-col items-center gap-2 text-center"
              >
                <Portrait
                  name={c.fullName}
                  src={c.portraitUrl}
                  sizes="72px"
                  className={cx(
                    'h-[4.5rem] w-[4.5rem] rounded-full text-[1.125rem]',
                    active &&
                      'ring-2 ring-[var(--ouro)] ring-offset-2 ring-offset-[var(--fundo)]'
                  )}
                />
                <span
                  className={cx(
                    't-rotulo leading-tight',
                    active ? 'text-ouro-texto' : 'group-hover:text-ouro-texto'
                  )}
                >
                  {c.name}
                </span>
              </button>
            );
          })}
        </div>
      </Group>
    </div>
  );
}

export function ProfileStep({
  data,
  update,
  copy,
  language,
  image,
  phoneError,
}: StepProps & { image: string | null; phoneError?: string }) {
  const { updateUserSession } = useSessionUpdate();
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const t = copy.profile;
  const name = [data.firstName, data.lastName].filter(Boolean).join(' ');

  const upload = async (file: File) => {
    setUploading(true);
    const result = await uploadAvatarRequest(file);
    setUploading(false);
    if (!result.success) return toast.error(result.message || t.photoError);
    update({ image: result.imageUrl });
    toast.success(t.photoSaved);
    void updateUserSession();
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-3 rounded-card bg-sup-2 p-6 text-center">
        <WelcomeAvatar
          name={name}
          image={data.image ?? image}
          className="h-28 w-28 bg-[var(--fundo)] text-[2.5rem]"
        />
        {name && (
          <span className="font-display text-[1.5rem] leading-tight text-ouro-texto">
            {name}
          </span>
        )}
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          aria-busy={uploading || undefined}
          className={cx(
            chip(false),
            uploading && 'animate-pulse motion-reduce:animate-none'
          )}
        >
          <Icon de={PiCamera} tamanho="pp" /> {t.photo}
        </button>
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field
          label={t.firstName}
          autoComplete="given-name"
          maxLength={80}
          value={data.firstName ?? ''}
          onChange={(e) => update({ firstName: e.target.value })}
        />
        <Field
          label={t.lastName}
          autoComplete="family-name"
          maxLength={80}
          value={data.lastName ?? ''}
          onChange={(e) => update({ lastName: e.target.value })}
        />
      </div>
      <Field.Area
        label={t.bio}
        ajuda={t.bioHelp}
        maxLength={2000}
        rows={3}
        value={data.bio ?? ''}
        onChange={(e) => update({ bio: e.target.value })}
      />
      <Group label={t.location} className="gap-0">
        <LocationField
          value={data.location ?? {}}
          onChange={(location) => update({ location })}
          language={language}
        />
      </Group>
      <PhoneField
        label={t.phone}
        countryLabel={language === 'pt' ? 'País do telefone' : 'Phone country'}
        value={data.phone ?? ''}
        onChange={(phone) => update({ phone })}
        error={phoneError}
        help={t.phoneHelp}
      />
      <Group label={t.privacy}>
        <CaixaDeMarcar
          rotulo={t.public}
          ajuda={t.publicHelp}
          marcado={data.profilePublic ?? true}
          aoMudar={(on) => update({ profilePublic: on })}
        />
        <CaixaDeMarcar
          rotulo={t.showLocation}
          marcado={data.showLocation ?? false}
          aoMudar={(on) => update({ showLocation: on })}
        />
      </Group>
    </div>
  );
}
