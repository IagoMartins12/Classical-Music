'use client';

import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { PiArrowLeft, PiArrowRight, PiStarFill, PiX } from 'react-icons/pi';
import Link from '@/app/components/LocalizedLink';
import { Button, classesDeBotao } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import { VistoQueSeDesenha } from '@/app/components/ui/VistoQueSeDesenha';
import { cx } from '@/app/components/ui/cx';
import { WELCOME, type WelcomeCopy } from '@/app/conteudo/site/welcome';
import { useAuth } from '@/app/hooks/useAuth';
import { useOverlayLanguage } from '@/app/hooks/useRouteLanguage';
import { useSessionUpdate } from '@/app/hooks/useSessionUpdate';
import { legacyOnboarding } from '@/app/libs/api/compat';
import { findComposerById } from '@/app/requests/catalog-search';
import {
  useOnboardingModal,
  type OnboardingData,
} from '@/app/stores/authStore';
import {
  canProceedWithPhone,
  getPhoneValidationMessage,
} from '@/app/utils/phones_and_location/phoneValidation';
import { Portrait } from '../Portrait';
import {
  InstrumentsStep,
  ProfileStep,
  StudyStep,
  TasteStep,
  YouStep,
  type StepProps,
  type WelcomeOptions,
} from './WelcomeSteps';

const STEPS = ['you', 'instruments', 'study', 'taste', 'profile'] as const;

/**
 * The welcome questions after sign-up, full screen: who you are, what you
 * play, how you study, what you like and your profile — and, beside them on
 * wide screens, the answers taking shape as they come. The draft lives in
 * the auth store (saved in the browser), so closing midway keeps them.
 */
export function WelcomeModal() {
  const language = useOverlayLanguage();
  const copy = WELCOME[language];
  const { user } = useAuth();
  const {
    isOpen,
    close,
    step: storedStep,
    setStep,
    data,
    updateData,
    isLoading,
    setLoading,
    complete,
  } = useOnboardingModal();
  const { updateUserSession } = useSessionUpdate();
  const [finished, setFinished] = useState(false);
  const [phoneTouched, setPhoneTouched] = useState(false);
  const ref = useRef<HTMLDialogElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const openRef = useRef(isOpen);
  openRef.current = isOpen;

  const options = useQuery({
    queryKey: ['welcome-options'],
    enabled: isOpen,
    staleTime: 60 * 60_000,
    queryFn: async () => {
      const result = await legacyOnboarding.options();
      if (!result.success) throw new Error('options');
      return result.data as WelcomeOptions;
    },
  });

  // Start the profile step from what the account already has.
  useEffect(() => {
    if (!isOpen || !user) return;
    const seed: Partial<typeof data> = {};
    if (data.firstName === undefined && user.firstName)
      seed.firstName = user.firstName;
    if (data.lastName === undefined && user.lastName)
      seed.lastName = user.lastName;
    if (Object.keys(seed).length) updateData(seed);
  }, [isOpen, user?.id]);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) {
      dialog.showModal();
      document.documentElement.style.overflow = 'hidden';
    }
    if (!isOpen && dialog.open) dialog.close();
    return () => {
      document.documentElement.style.overflow = '';
    };
  }, [isOpen]);

  const index = Math.min(Math.max(storedStep, 1), STEPS.length) - 1;
  const step = STEPS[index];
  const last = index === STEPS.length - 1;
  const phoneOk = canProceedWithPhone(data.phone ?? '');
  const canGo =
    step === 'you' ? !!data.userType : step === 'profile' ? phoneOk : true;

  // Each step starts at its title, for whoever reads with a screen reader.
  useEffect(() => {
    if (isOpen) heading.current?.focus({ preventScroll: true });
  }, [isOpen, index, finished]);

  const finish = async () => {
    setLoading(true);
    const result = await legacyOnboarding
      .complete(data)
      .catch(() => ({ success: false }));
    setLoading(false);
    if (!result.success) return toast.error(copy.saveError);
    await updateUserSession();
    setFinished(true);
  };

  const next = () => {
    if (step === 'profile') setPhoneTouched(true);
    if (!canGo) return;
    if (last) void finish();
    else setStep(index + 2);
  };

  const closeAll = () => {
    if (finished) {
      setFinished(false);
      complete();
    } else close();
  };

  const props: StepProps = { data, update: updateData, copy, language };
  const titles = {
    you: copy.you,
    instruments: copy.instruments,
    study: copy.study,
    taste: copy.taste,
    profile: copy.profile,
  };

  const body = options.isError ? (
    <div className="flex flex-col items-start gap-3">
      <p className="t-rotulo text-texto-suave">{copy.loadError}</p>
      <Button tamanho="p" onClick={() => options.refetch()}>
        {copy.retry}
      </Button>
    </div>
  ) : !options.data && (step === 'instruments' || step === 'taste') ? (
    <span
      aria-hidden="true"
      className="loading-skeleton block h-64 rounded-card"
    />
  ) : step === 'you' ? (
    <YouStep {...props} />
  ) : step === 'instruments' ? (
    <InstrumentsStep {...props} options={options.data!} />
  ) : step === 'study' ? (
    <StudyStep {...props} />
  ) : step === 'taste' ? (
    <TasteStep {...props} options={options.data!} />
  ) : (
    <ProfileStep
      {...props}
      image={user?.image ?? null}
      phoneError={
        phoneTouched && !phoneOk
          ? (getPhoneValidationMessage(data.phone ?? '') ?? undefined)
          : undefined
      }
    />
  );

  const firstName = data.firstName ?? user?.firstName ?? '';

  return (
    <dialog
      ref={ref}
      aria-label={finished ? copy.done.title(firstName) : titles[step].title}
      // Escape closes the dialog by itself; only that closing is passed on.
      onClose={(event) => {
        if (event.target === ref.current && openRef.current) closeAll();
      }}
      className="m-0 h-dvh max-h-none w-screen max-w-none bg-fundo p-0 text-texto backdrop:bg-[var(--bg-overlay)]"
    >
      {finished ? (
        <div className="grid h-full place-items-center px-5 py-10">
          <div className="entra flex max-w-lg flex-col items-center gap-6 text-center">
            <span className="grid h-24 w-24 place-items-center rounded-full tint-ouro text-ouro-na-tinta">
              <VistoQueSeDesenha className="h-12 w-12" />
            </span>
            <h2
              ref={heading}
              tabIndex={-1}
              className="font-display text-[clamp(2rem,4vw,3rem)] leading-tight outline-none"
            >
              {copy.done.title(firstName)}
            </h2>
            <p className="t-corpo max-w-[40ch] text-texto-suave">
              {copy.done.text}
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button variante="primario" onClick={closeAll}>
                {copy.done.start}
              </Button>
              <Link
                href="/profile"
                onClick={closeAll}
                className={classesDeBotao()}
              >
                {copy.done.profile}
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid h-full grid-rows-[auto_minmax(0,1fr)_auto] lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
          <header className="flex items-center gap-4 px-5 py-4 lg:col-span-2 lg:px-10">
            <span className="font-display text-[1.25rem] text-ouro-texto">
              Opus Atlas
            </span>
            <ol
              aria-hidden="true"
              className="mx-auto hidden max-w-xl flex-1 grid-cols-5 gap-2 sm:grid"
            >
              {copy.steps.map((label, n) => (
                <li key={label} className="flex flex-col gap-1.5">
                  <span
                    className={cx(
                      'h-[3px] rounded-full transition-colors duration-[var(--t-entrada)]',
                      n <= index ? 'bg-[var(--ouro)]' : 'bg-[var(--linha)]'
                    )}
                  />
                  <span
                    className={cx('t-legenda', n === index && '!text-texto')}
                  >
                    {label}
                  </span>
                </li>
              ))}
            </ol>
            <span className="t-legenda mx-auto sm:hidden" aria-live="polite">
              {copy.step(index + 1, STEPS.length)}
            </span>
            <Button
              variante="fantasma"
              tamanho="p"
              icone={PiX}
              rotulo={copy.close}
              onClick={closeAll}
              className="ml-auto sm:ml-0"
            />
          </header>

          <main
            key={step}
            className="entra flex min-h-0 flex-col gap-8 overflow-y-auto px-5 py-6 lg:px-10 lg:py-10"
          >
            <div className="flex max-w-[44rem] flex-col gap-3">
              <h2
                ref={heading}
                tabIndex={-1}
                className="font-display text-[clamp(2rem,4vw,3.25rem)] leading-tight outline-none"
              >
                {step === 'you' && (
                  <span className="block text-ouro-texto">
                    {copy.greeting(firstName)}
                  </span>
                )}
                {titles[step].title}
              </h2>
              <p className="t-corpo text-texto-suave">{titles[step].text}</p>
            </div>
            {body}
          </main>

          <Preview
            data={data}
            copy={copy}
            options={options.data}
            image={data.image ?? user?.image ?? null}
          />

          <footer className="flex items-center justify-between gap-3 border-t border-[var(--linha)] px-5 py-4 lg:col-start-1 lg:px-10">
            <Button
              variante="fantasma"
              onClick={closeAll}
              className="whitespace-nowrap max-sm:px-2"
            >
              {copy.later}
            </Button>
            <div className="flex items-center gap-2">
              {index > 0 && (
                <Button
                  icone={PiArrowLeft}
                  onClick={() => setStep(index)}
                  disabled={isLoading}
                >
                  <span className="max-sm:sr-only">{copy.back}</span>
                </Button>
              )}
              <Button
                variante="primario"
                onClick={next}
                disabled={!canGo && step === 'you'}
                carregando={isLoading}
              >
                {last ? copy.finish : copy.next}
                {!last && <Icon de={PiArrowRight} tamanho="p" />}
              </Button>
            </div>
          </footer>
        </div>
      )}
    </dialog>
  );
}

/**
 * The answers so far, as the profile will show them. Wide screens only —
 * on a phone the questions need the whole width.
 */
function Preview({
  data,
  copy,
  options,
  image,
}: {
  data: OnboardingData;
  copy: WelcomeCopy;
  options: WelcomeOptions | undefined;
  image: string | null;
}) {
  const name = [data.firstName, data.lastName].filter(Boolean).join(' ');
  const listed = options?.composers.find(
    (c) => c.id === data.favoriteComposerId
  );
  // A composer found by name is not among the suggested ones.
  const searched = useQuery({
    queryKey: ['composer', data.favoriteComposerId],
    enabled: !!data.favoriteComposerId && !!options && !listed,
    staleTime: 60 * 60_000,
    queryFn: () => findComposerById(data.favoriteComposerId!),
  });
  const composer = listed ?? searched.data ?? null;
  const era = options?.epochs.find((e) => e.id === data.favoriteEpochId);
  const facts = [
    data.experienceLevel && copy.levels[data.experienceLevel],
    data.practiceTimePerWeek !== undefined &&
      copy.study.minutes(data.practiceTimePerWeek),
  ].filter(Boolean);

  return (
    <aside
      aria-label={copy.preview.label}
      className="hidden min-h-0 flex-col gap-7 overflow-y-auto bg-sup-2 p-10 lg:col-start-2 lg:row-span-2 lg:row-start-2 lg:flex"
    >
      <span className="t-legenda">{copy.preview.title}</span>
      <div className="flex items-center gap-4">
        <Portrait
          name={name || '?'}
          src={image}
          sizes="64px"
          className="h-16 w-16 shrink-0 rounded-full text-[1.5rem]"
        />
        <span className="flex min-w-0 flex-col">
          <span
            className={cx(
              'truncate font-display text-[1.5rem] leading-tight',
              !name && 'text-texto-fraco'
            )}
          >
            {name || copy.preview.noName}
          </span>
          {data.userType && (
            <span className="t-rotulo text-texto-suave">
              {copy.you.types[data.userType][0]}
            </span>
          )}
        </span>
      </div>

      <PreviewRow label={copy.preview.instruments} empty={copy.preview.empty}>
        {data.instruments?.length ? (
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap gap-1.5">
              {data.instruments.map((i) => (
                <span
                  key={i.id}
                  className="item-entra inline-flex items-center gap-1.5 rounded-full bg-[var(--fundo)] px-3 py-1 text-[0.875rem]"
                >
                  {i.isPrimary && (
                    <Icon
                      de={PiStarFill}
                      tamanho="pp"
                      className="text-ouro-texto"
                    />
                  )}
                  {i.name}
                </span>
              ))}
            </div>
            {facts.length > 0 && (
              <span className="t-rotulo text-texto-suave">
                {facts.join(' · ')}
              </span>
            )}
          </div>
        ) : null}
      </PreviewRow>

      <PreviewRow label={copy.preview.era} empty={copy.preview.empty}>
        {era ? (
          <span className="font-display text-[1.25rem]">{era.name}</span>
        ) : null}
      </PreviewRow>

      <PreviewRow label={copy.preview.composer} empty={copy.preview.empty}>
        {composer ? (
          <span className="item-entra flex items-center gap-3">
            <Portrait
              name={composer.name}
              src={composer.portraitUrl ?? null}
              sizes="48px"
              className="h-12 w-12 shrink-0 rounded-full"
            />
            <span className="font-display text-[1.25rem] leading-snug">
              {composer.fullName || composer.name}
            </span>
          </span>
        ) : null}
      </PreviewRow>
    </aside>
  );
}

function PreviewRow({
  label,
  empty,
  children,
}: {
  label: string;
  empty: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="t-legenda">{label}</span>
      {children ?? <span className="t-rotulo text-texto-fraco">{empty}</span>}
    </div>
  );
}
