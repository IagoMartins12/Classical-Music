'use client';

import type { ComponentType } from 'react';
import AccountSettingsSection from '@/app/components/profile/AccountSettingsSection';
import InstrumentsSection from '@/app/components/profile/InstrumentsSection';
import MusicalPreferencesSection from '@/app/components/profile/MusicalPreferencesSection';
import PersonalInfoSection from '@/app/components/profile/PersonalInfoSection';
import PrivacySection from '@/app/components/profile/PrivacySection';
import { Button } from '@/app/components/ui/Button';
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
  ['privacy', PrivacySection],
  ['account', AccountSettingsSection],
];

/** The profile's five sections on one page, with a jump list beside them. */
export function ProfileView() {
  const copy = PERSONAL[useRouteLanguage().language].profile;
  const { user, isAuthenticated, updateUser } = useAuth();
  const openOnboarding = useAuthStore((s) => s.openOnboardingModal);

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
        aria-label={copy.sectionsLabel}
        className="scroll-strip flex gap-1 overflow-x-auto md:sticky md:top-24 md:flex-col md:self-start"
      >
        {SECTIONS.map(([key]) => (
          <a
            key={key}
            href={`#profile-${key}`}
            className="inline-flex min-h-10 shrink-0 items-center rounded-controle px-3 text-[0.9375rem] text-texto-suave hover:bg-sup-2 hover:text-texto"
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
