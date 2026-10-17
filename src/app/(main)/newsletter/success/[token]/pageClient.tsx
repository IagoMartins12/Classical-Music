'use client';

import { useSearchParams } from 'next/navigation';
import { PiArrowRight, PiEnvelopeSimple } from 'react-icons/pi';
import Link from '@/app/components/LocalizedLink';
import { TokenFrame } from '@/app/components/site/tokens/TokenFrame';
import { classesDeBotao } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import { useTranslation } from '@/app/context/TranslationContext';

/** Where the person lands after a newsletter link, by what happened. */
const CASOS = {
  confirmed: {
    prefixo: 'success_confirmed',
    destino: '/composers',
    feito: true,
  },
  subscribed: { prefixo: 'success_subscribed', destino: '/', feito: false },
  already_unsubscribed: {
    prefixo: 'success_already_unsubscribed',
    destino: '/',
    feito: false,
  },
  default: { prefixo: 'success_default', destino: '/', feito: true },
} as const;

/**
 * The newsletter's answer to a link from the e-mail, in the frame of every
 * e-mail link: what happened, what it means, and where to go next.
 */
export default function NewsletterSuccessContent() {
  const tipo = useSearchParams()?.get('type') ?? 'confirmed';
  const { t } = useTranslation({ sections: ['pages/newsletter'] });
  const caso = CASOS[tipo as keyof typeof CASOS] ?? CASOS.default;

  return (
    <TokenFrame
      icon={PiEnvelopeSimple}
      done={caso.feito}
      title={t(`${caso.prefixo}_title`)}
      text={
        <>
          <span className="block text-texto">
            {t(`${caso.prefixo}_subtitle`)}
          </span>
          {t(`${caso.prefixo}_message`)}
        </>
      }
    >
      <Link href={caso.destino} className={classesDeBotao('primario')}>
        {t(`${caso.prefixo}_button`)} <Icon de={PiArrowRight} tamanho="p" />
      </Link>
      {caso.destino !== '/' && (
        <Link href="/" className={classesDeBotao('fantasma')}>
          {t('success_home_title')}
        </Link>
      )}
    </TokenFrame>
  );
}
