'use client';

import { useEffect, useRef, useState, type ComponentType } from 'react';
import AccountSettingsSection from '@/app/components/profile/AccountSettingsSection';
import FavoritesSection from '@/app/components/profile/FavoritesSection';
import InstrumentsSection from '@/app/components/profile/InstrumentsSection';
import MusicalPreferencesSection from '@/app/components/profile/MusicalPreferencesSection';
import PersonalInfoSection from '@/app/components/profile/PersonalInfoSection';
import PrivacySection from '@/app/components/profile/PrivacySection';
import SubscriptionSection from '@/app/components/profile/SubscriptionSection';
import { Button } from '@/app/components/ui/Button';
import { cx } from '@/app/components/ui/cx';
import { EsqueletoPerfil } from '@/app/components/ui/Carregando';
import { PERSONAL } from '@/app/conteudo/site/personal';
import { useAuth } from '@/app/hooks/useAuth';
import { useRouteLanguage } from '@/app/hooks/useRouteLanguage';
import type { User } from '@/app/hooks/userStore';
import { useAuthStore } from '@/app/stores/authStore';

type SectionProps = { user: User; updateUser: (data: Partial<User>) => void };

const SECTIONS: [
  keyof (typeof PERSONAL)['pt']['profile']['sections'],
  ComponentType<SectionProps>,
][] = [
  ['personal', PersonalInfoSection],
  ['instruments', InstrumentsSection],
  ['preferences', MusicalPreferencesSection],
  ['favorites', FavoritesSection],
  ['privacy', PrivacySection],
  ['subscription', SubscriptionSection],
  ['account', AccountSettingsSection],
];

type Key = (typeof SECTIONS)[number][0];

/**
 * The section in the reading band of the window (a third from the top):
 * the jump list marks it in gold as the person scrolls.
 */
function useSecaoAtual(ativo: boolean) {
  const [atual, setAtual] = useState<Key>(SECTIONS[0][0]);
  useEffect(() => {
    if (!ativo) return;
    const obs = new IntersectionObserver(
      (entradas) => {
        const vista = entradas.find((e) => e.isIntersecting);
        if (vista) setAtual(vista.target.id.replace('profile-', '') as Key);
      },
      { rootMargin: '-30% 0px -60% 0px' }
    );
    for (const [key] of SECTIONS) {
      const el = document.getElementById(`profile-${key}`);
      if (el) obs.observe(el);
    }
    return () => obs.disconnect();
  }, [ativo]);
  return [atual, setAtual] as const;
}

/** The profile's sections on one page, with a jump list beside them. */
export function ProfileView() {
  const copy = PERSONAL[useRouteLanguage().language].profile;
  const { user, isAuthenticated, updateUser } = useAuth();
  const openOnboarding = useAuthStore((s) => s.openOnboardingModal);
  const pronto = !!(isAuthenticated && user?.onboardingCompleted);
  const [atual, setAtual] = useSecaoAtual(pronto);
  const lista = useRef<HTMLElement>(null);

  // On phones the list is a strip: keep the current one in sight.
  useEffect(() => {
    lista.current
      ?.querySelector<HTMLElement>('[aria-current="true"]')
      ?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [atual]);

  // A link straight to a section (pricing's "Ver minha assinatura"): the
  // page paints after the account loads, too late for the browser's own jump.
  useEffect(() => {
    if (!pronto) return;
    const alvo = window.location.hash.replace('#profile-', '') as Key;
    if (!SECTIONS.some(([key]) => key === alvo)) return;
    document
      .getElementById(`profile-${alvo}`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setAtual(alvo);
  }, [pronto, setAtual]);

  if (!isAuthenticated || !user) return <EsqueletoPerfil />;

  if (!user.onboardingCompleted) {
    return (
      <div className="flex flex-col items-start gap-3 rounded-card bg-sup-2 p-8">
        <p className="font-display text-[1.5rem]">{copy.onboardingTitle}</p>
        <p className="t-rotulo text-texto-suave">{copy.onboardingText}</p>
        <Button variante="primario" onClick={openOnboarding}>
          {copy.onboardingAction}
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-[11rem_minmax(0,1fr)]">
      <nav
        ref={lista}
        aria-label={copy.sectionsLabel}
        className="scroll-strip flex gap-1 overflow-x-auto md:sticky md:top-24 md:flex-col md:self-start"
      >
        {SECTIONS.map(([key]) => (
          <a
            key={key}
            href={`#profile-${key}`}
            aria-current={atual === key || undefined}
            onClick={() => setAtual(key)}
            className={cx(
              'relative inline-flex min-h-10 shrink-0 items-center rounded-controle px-3 text-[0.9375rem] transition-colors duration-[var(--t-toque)]',
              atual === key
                ? 'bg-sup-2 font-medium text-ouro-texto before:absolute before:inset-y-2 before:left-0 before:w-0.5 before:rounded-full before:bg-[var(--ouro)] max-md:before:hidden'
                : 'text-texto-suave hover:bg-sup-2 hover:text-texto'
            )}
          >
            {copy.sections[key]}
          </a>
        ))}
      </nav>
      <div className="flex min-w-0 flex-col gap-6">
        {SECTIONS.map(([key, Section]) => (
          <section key={key} id={`profile-${key}`} className="scroll-mt-24">
            <Section user={user} updateUser={updateUser} />
          </section>
        ))}
      </div>
    </div>
  );
}
