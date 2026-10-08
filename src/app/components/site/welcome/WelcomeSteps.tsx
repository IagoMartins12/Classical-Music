'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { PiCamera, PiCheck, PiStar, PiStarFill, PiX } from 'react-icons/pi';
import InternationalPhoneInput from '@/app/components/Common/InternationalPhoneInput';
import LocationSelector from '@/app/components/Common/LocationSelector';
import { Field } from '@/app/components/ui/Field';
import { Icon } from '@/app/components/ui/Icon';
import { cx } from '@/app/components/ui/cx';
import { ERAS, eraOf } from '@/app/conteudo/site/eras';
import {
  PRACTICE_MINUTES,
  STUDY_HORIZONS,
  type WelcomeCopy,
} from '@/app/conteudo/site/welcome';
import { useSessionUpdate } from '@/app/hooks/useSessionUpdate';
import { uploadAvatarRequest } from '@/app/requests/account-client';
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
              <select
                aria-label={`${i.name}: ${copy.study.level}`}
                value={i.level}
                onChange={(e) =>
                  patch(i.id, { level: e.target.value as Level })
                }
                className="input-classical min-h-10 rounded-full px-4 text-[0.9375rem]"
              >
                {LEVELS.map((l) => (
                  <option key={l} value={l}>
                    {copy.levels[l]}
                  </option>
                ))}
              </select>
              <label className="t-rotulo flex min-h-10 items-center gap-2">
                <input
                  type="checkbox"
                  checked={i.isLearning}
                  onChange={(e) =>
                    patch(i.id, { isLearning: e.target.checked })
                  }
                  className="h-4 w-4 accent-[var(--ouro)]"
                />
                {copy.instruments.learning}
              </label>
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
  const [everyEra, setEveryEra] = useState(false);
  // The seven eras the site tells, each matched to its catalog epoch.
  const eras = ERAS.flatMap((era) => {
    const epoch = options.epochs.find((e) => eraOf(e.name)?.key === era.key);
    return epoch ? [{ era, epoch }] : [];
  });
  const chosenEra = eraOf(
    options.epochs.find((e) => e.id === data.favoriteEpochId)?.name
  );
  const composers =
    chosenEra && !everyEra
      ? options.composers.filter(
          (c) => eraOf(c.epochName)?.key === chosenEra.key
        )
      : options.composers;

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
        <div className="grid grid-cols-3 gap-x-3 gap-y-4 sm:grid-cols-5">
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
        {chosenEra &&
          !everyEra &&
          options.composers.length > composers.length && (
            <button
              type="button"
              onClick={() => setEveryEra(true)}
              className="t-rotulo self-start text-ouro-texto hover:underline"
            >
              {copy.taste.allComposers}
            </button>
          )}
      </Group>
    </div>
  );
}

export function ProfileStep({
  data,
  update,
  copy,
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
      <div className="flex items-center gap-4">
        <Portrait
          name={name || '?'}
          src={data.image ?? image}
          sizes="80px"
          className="h-20 w-20 shrink-0 rounded-full text-[1.5rem]"
        />
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
        <LocationSelector
          value={data.location ?? {}}
          onChange={(location) => update({ location })}
          showLabels={false}
        />
      </Group>
      <div className="flex flex-col gap-1.5">
        <InternationalPhoneInput
          label={t.phone}
          value={data.phone ?? ''}
          onChange={(phone) => update({ phone })}
          error={phoneError}
        />
        <p className="t-legenda">{t.phoneHelp}</p>
      </div>
      <Group label={t.privacy}>
        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={data.profilePublic ?? true}
            onChange={(e) => update({ profilePublic: e.target.checked })}
            className="mt-1 h-4 w-4 accent-[var(--ouro)]"
          />
          <span className="flex flex-col">
            <span>{t.public}</span>
            <span className="t-rotulo text-texto-suave">{t.publicHelp}</span>
          </span>
        </label>
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={data.showLocation ?? false}
            onChange={(e) => update({ showLocation: e.target.checked })}
            className="h-4 w-4 accent-[var(--ouro)]"
          />
          {t.showLocation}
        </label>
      </Group>
    </div>
  );
}
