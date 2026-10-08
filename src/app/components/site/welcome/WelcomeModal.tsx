'use client';

import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Link from '@/app/components/LocalizedLink';
import { Button, classesDeBotao } from '@/app/components/ui/Button';
import { Sheet } from '@/app/components/ui/Sheet';
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
 * The welcome questions after sign-up: who you are, what you play, how you
 * study, what you like and your profile. The draft lives in the auth store
 * (saved in the browser), so closing midway keeps the answers.
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

  const index = Math.min(Math.max(storedStep, 1), STEPS.length) - 1;
  const step = STEPS[index];
  const last = index === STEPS.length - 1;
  const phoneOk = canProceedWithPhone(data.phone ?? '');
  const canGo =
    step === 'you' ? !!data.userType : step === 'profile' ? phoneOk : true;

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
    if (!isOpen) return null;

    if (finished) {
      setFinished(false);
      complete();
    } else close();
  };

  if (finished) {
    return (
      <Sheet
        aberto={isOpen}
        aoFechar={closeAll}
        titulo={copy.done.title(data.firstName ?? '')}
        largura="m"
      >
        <div className="flex flex-col items-center gap-5 py-6 text-center">
          <span className="tint-ouro grid h-16 w-16 place-items-center rounded-full text-ouro-na-tinta">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="engraving h-8 w-8"
            >
              <path pathLength={1} d="M5 12.5l4.5 4.5L19 7.5" />
            </svg>
          </span>
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
      </Sheet>
    );
  }

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
  ) : !options.data &&
    step !== 'you' &&
    step !== 'study' &&
    step !== 'profile' ? (
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

  return (
    <Sheet
      aberto={isOpen}
      aoFechar={closeAll}
      titulo={titles[step].title}
      descricao={titles[step].text}
      largura="g"
      rodape={
        <div className="flex w-full items-center gap-3">
          <span
            className="t-dado text-[0.8125rem] text-texto-suave"
            aria-live="polite"
          >
            {copy.step(index + 1, STEPS.length)}
          </span>
          <span aria-hidden="true" className="flex flex-1 gap-1">
            {STEPS.map((s, n) => (
              <span
                key={s}
                className={
                  n <= index
                    ? 'h-1 flex-1 rounded-full fill-ouro'
                    : 'h-1 flex-1 rounded-full bg-[var(--linha)]'
                }
              />
            ))}
          </span>
          {index > 0 && (
            <Button
              variante="fantasma"
              onClick={() => setStep(index)}
              disabled={isLoading}
            >
              {copy.back}
            </Button>
          )}
          <Button
            variante="primario"
            onClick={next}
            disabled={!canGo && step === 'you'}
            carregando={isLoading}
          >
            {last ? copy.finish : copy.next}
          </Button>
        </div>
      }
    >
      {body}
    </Sheet>
  );
}
