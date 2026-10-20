'use client';

import { useQuery } from '@tanstack/react-query';
import type { RefObject } from 'react';
import { PiChatCircleText, PiLifebuoy, PiStarFill } from 'react-icons/pi';
import Link from '@/app/components/LocalizedLink';
import { Button, classesDeBotao } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import { VistoQueSeDesenha } from '@/app/components/ui/VistoQueSeDesenha';
import { eraName } from '@/app/conteudo/site/eras';
import type { WelcomeCopy } from '@/app/conteudo/site/welcome';
import { findComposerById } from '@/app/requests/catalog-search';
import type { OnboardingData } from '@/app/stores/authStore';
import { Portrait } from '../Portrait';
import { WelcomeAvatar, type WelcomeOptions } from './WelcomeSteps';

/**
 * The end of the welcome: congratulations, the profile as others will see
 * it, and where to turn with a question.
 */
export function WelcomeDone({
  data,
  image,
  copy,
  language,
  options,
  heading,
  onClose,
}: {
  data: OnboardingData;
  image: string | null;
  copy: WelcomeCopy;
  language: 'pt' | 'en';
  options: WelcomeOptions | undefined;
  heading: RefObject<HTMLHeadingElement | null>;
  onClose: () => void;
}) {
  const t = copy.done;
  const name = [data.firstName, data.lastName].filter(Boolean).join(' ');
  const listed = options?.composers.find(
    (c) => c.id === data.favoriteComposerId
  );
  // A composer found by name is not among the suggested ones.
  const searched = useQuery({
    queryKey: ['composer', data.favoriteComposerId],
    enabled: !!data.favoriteComposerId && !listed,
    staleTime: 60 * 60_000,
    queryFn: () => findComposerById(data.favoriteComposerId!),
  });
  const composer = listed ?? searched.data ?? null;
  const epoch = options?.epochs.find((e) => e.id === data.favoriteEpochId);
  const facts = [
    data.experienceLevel && copy.levels[data.experienceLevel],
    data.practiceTimePerWeek !== undefined &&
      copy.study.minutes(data.practiceTimePerWeek),
  ].filter(Boolean);
  const place = [data.location?.city?.name, data.location?.country?.name]
    .filter(Boolean)
    .join(', ');

  return (
    <div className="h-full overflow-y-auto px-5 py-10 lg:px-10">
      <div className="mx-auto grid min-h-full max-w-5xl items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,25rem)] lg:gap-16">
        <div className="entra flex flex-col items-start gap-6">
          <span className="grid h-16 w-16 place-items-center rounded-full tint-ouro text-ouro-na-tinta">
            <VistoQueSeDesenha className="h-8 w-8" />
          </span>
          <h2
            ref={heading}
            tabIndex={-1}
            className="font-display text-[clamp(2.25rem,4.5vw,3.5rem)] leading-[1.05] outline-none"
          >
            {t.title(data.firstName ?? '')}
          </h2>
          <p className="t-corpo max-w-[52ch] text-lg text-texto-suave">
            {t.text}
          </p>
          <div className="flex flex-wrap gap-3">
            <Button variante="primario" onClick={onClose}>
              {t.start}
            </Button>
            <Link
              href="/profile"
              onClick={onClose}
              className={classesDeBotao()}
            >
              {t.profile}
            </Link>
          </div>

          {/* Where to turn with a question, before it becomes a problem. */}
          <section className="mt-4 flex w-full max-w-xl flex-col gap-3 border-t border-[var(--linha)] pt-6">
            <h3 className="font-display text-[1.375rem]">{t.help}</h3>
            <p className="t-rotulo text-texto-suave">{t.helpText}</p>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              <Link
                href="/help"
                onClick={onClose}
                className="inline-flex min-h-10 items-center gap-2 t-rotulo text-ouro-texto underline decoration-transparent underline-offset-4 hover:decoration-[var(--ouro)]"
              >
                <Icon de={PiLifebuoy} tamanho="p" /> {t.helpCenter}
              </Link>
              <Link
                href="/contact"
                onClick={onClose}
                className="inline-flex min-h-10 items-center gap-2 t-rotulo text-ouro-texto underline decoration-transparent underline-offset-4 hover:decoration-[var(--ouro)]"
              >
                <Icon de={PiChatCircleText} tamanho="p" /> {t.contact}
              </Link>
            </div>
          </section>
        </div>

        {/* The profile as others will see it, from the answers just given. */}
        <aside
          aria-label={t.card}
          className="entra flex flex-col gap-6 rounded-card bg-sup-2 p-6 shadow-[var(--sombra-1)] sm:p-8"
          style={{ ['--i' as string]: 1 }}
        >
          <div className="flex flex-col items-center gap-2 text-center">
            <WelcomeAvatar
              name={name}
              image={image}
              className="h-24 w-24 bg-[var(--fundo)] text-[2rem]"
            />
            <span className="mt-2 font-display text-[1.75rem] leading-tight text-ouro-texto">
              {name || '—'}
            </span>
            {data.userType && (
              <span className="t-rotulo text-texto-suave">
                {copy.you.types[data.userType][0]}
              </span>
            )}
            {place && <span className="t-legenda">{place}</span>}
          </div>

          {data.bio && (
            <p className="t-rotulo border-t border-[var(--linha)] pt-5 text-center text-texto-suave">
              {data.bio}
            </p>
          )}

          <dl className="flex flex-col gap-4 border-t border-[var(--linha)] pt-5">
            {!!data.instruments?.length && (
              <div className="flex flex-col gap-2">
                <dt className="t-legenda">{t.instruments}</dt>
                <dd className="flex flex-wrap gap-1.5">
                  {data.instruments.map((i) => (
                    <span
                      key={i.id}
                      className="inline-flex items-center gap-1.5 rounded-full bg-[var(--fundo)] px-3 py-1 text-[0.875rem]"
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
                </dd>
                {facts.length > 0 && (
                  <dd className="t-rotulo text-texto-suave">
                    {facts.join(' · ')}
                  </dd>
                )}
              </div>
            )}
            {epoch && (
              <div className="flex flex-col gap-1">
                <dt className="t-legenda">{t.era}</dt>
                <dd className="font-display text-[1.25rem]">
                  {eraName(epoch.name, language)}
                </dd>
              </div>
            )}
            {composer && (
              <div className="flex flex-col gap-2">
                <dt className="t-legenda">{t.composer}</dt>
                <dd className="flex items-center gap-3">
                  <Portrait
                    name={composer.name}
                    src={composer.portraitUrl ?? null}
                    sizes="48px"
                    className="h-12 w-12 shrink-0 rounded-full"
                  />
                  <span className="font-display text-[1.25rem] leading-snug">
                    {composer.fullName || composer.name}
                  </span>
                </dd>
              </div>
            )}
          </dl>
        </aside>
      </div>
    </div>
  );
}
