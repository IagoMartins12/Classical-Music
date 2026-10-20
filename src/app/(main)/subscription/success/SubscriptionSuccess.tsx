'use client';

import { PiCrown } from 'react-icons/pi';
import Link from '@/app/components/LocalizedLink';
import { TokenFrame } from '@/app/components/site/tokens/TokenFrame';
import { classesDeBotao } from '@/app/components/ui/Button';
import { SUBSCRIPTION } from '@/app/conteudo/site/subscription';
import { useRouteLanguage } from '@/app/hooks/useRouteLanguage';

/** Back from the checkout: the plan is on, two ways onward. */
export function SubscriptionSuccess() {
  const copy = SUBSCRIPTION[useRouteLanguage().language];
  return (
    <TokenFrame icon={PiCrown} title={copy.title} text={copy.text} done>
      <Link href="/learning" className={classesDeBotao('primario')}>
        {copy.studies}
      </Link>
      <Link href="/profile" className={classesDeBotao()}>
        {copy.account}
      </Link>
    </TokenFrame>
  );
}
