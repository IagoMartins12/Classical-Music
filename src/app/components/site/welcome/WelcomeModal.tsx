'use client';

import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { PiArrowLeft, PiArrowRight, PiX } from 'react-icons/pi';
import { Button } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import { cx } from '@/app/components/ui/cx';
import { WELCOME } from '@/app/conteudo/site/welcome';
import { useAuth } from '@/app/hooks/useAuth';
import { useOverlayLanguage } from '@/app/hooks/useRouteLanguage';
import { useSessionUpdate } from '@/app/hooks/useSessionUpdate';
import { legacyOnboarding } from '@/app/libs/api/compat';
import { useOnboardingModal } from '@/app/stores/authStore';
import {
  canProceedWithPhone,
  getPhoneValidationMessage,
} from '@/app/utils/phones_and_location/phoneValidation';
import { BrandSeal } from '../BrandSeal';
import { WelcomeDone } from './WelcomeDone';
import {
  InstrumentsStep,
  IntroStep,
  ProfileStep,
  StudyStep,
  TasteStep,
  YouStep,
  type StepProps,
  type WelcomeOptions,
} from './WelcomeSteps';

const STEPS = [
  'intro',
  'you',
  'instruments',
  'study',
  'taste',
  'profile',
] as const;

/**
 * The welcome after sign-up, full screen: what Opus Atlas keeps for you,
 * then who you are, what you play, how you study, what you like and your
 * profile. The draft lives in
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
    if (!isOpen) {
      if (dialog.open) dialog.close();
      return;
    }
    if (!dialog.open) dialog.showModal();
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
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
  const firstName = data.firstName ?? user?.firstName ?? '';
  const titles = {
    intro: { title: copy.greeting(firstName), text: copy.intro.text },
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
  ) : step === 'intro' ? (
    <IntroStep {...props} />
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
        <WelcomeDone
          data={data}
          image={data.image ?? user?.image ?? null}
          copy={copy}
          language={language}
          options={options.data}
          heading={heading}
          onClose={closeAll}
        />
      ) : (
        <div className="grid h-full grid-rows-[auto_minmax(0,1fr)_auto]">
          <header className="flex items-center gap-4 px-5 py-4 lg:px-10">
            <span className="font-display text-[1.25rem] text-ouro-texto">
              Opus Atlas
            </span>
            <ol
              aria-hidden="true"
              className="mx-auto hidden max-w-2xl flex-1 grid-cols-6 gap-2 sm:grid"
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
            className={cx(
              'entra flex min-h-0 flex-col gap-8 overflow-y-auto px-5 py-6 lg:px-[max(2.5rem,calc((100%-64rem)/2))] lg:py-10',
              step === 'intro' && 'items-center text-center'
            )}
          >
            <div
              className={cx(
                'flex max-w-[44rem] flex-col gap-3',
                step === 'intro' && 'items-center'
              )}
            >
              {/* The first page opens on Opus Atlas itself: its seal. */}
              {step === 'intro' && (
                <BrandSeal
                  reveal
                  priority
                  sizes="176px"
                  className="mb-4 w-28 sm:w-36 lg:w-44"
                />
              )}
              <h2
                ref={heading}
                tabIndex={-1}
                className="font-display text-[clamp(2rem,4vw,3.25rem)] leading-tight outline-none"
              >
                {titles[step].title}
              </h2>
              <p className="t-corpo text-texto-suave">{titles[step].text}</p>
            </div>
            {body}
          </main>

          <footer className="flex items-center justify-between gap-3 border-t border-[var(--linha)] px-5 py-4 lg:px-[max(2.5rem,calc((100%-64rem)/2))]">
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
                {last
                  ? copy.finish
                  : step === 'intro'
                    ? copy.intro.start
                    : copy.next}
                {!last && <Icon de={PiArrowRight} tamanho="p" />}
              </Button>
            </div>
          </footer>
        </div>
      )}
    </dialog>
  );
}
