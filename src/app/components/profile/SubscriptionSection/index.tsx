'use client';

import { GerenciarAssinatura } from '@/app/components/profile/AccountSettingsSection/GerenciarAssinatura';
import { PERSONAL } from '@/app/conteudo/site/personal';
import { useRouteLanguage } from '@/app/hooks/useRouteLanguage';

/**
 * "Assinatura" in the profile: the plan, changing it, paying and
 * cancelling, in its own section beside "Você" and "Instrumentos".
 * Pricing's "Ver minha assinatura" lands here (`#profile-subscription`).
 */
export default function SubscriptionSection() {
  const { language } = useRouteLanguage();
  const t = PERSONAL[language].profile.subscription;
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-lg font-semibold text-texto">{t.title}</h3>
        <p className="t-rotulo text-texto-suave">{t.text}</p>
      </div>
      <GerenciarAssinatura idioma={language} />
    </div>
  );
}
