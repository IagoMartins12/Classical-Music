'use client';

import { PiArrowsClockwise, PiCheck, PiEnvelopeSimple } from 'react-icons/pi';
import Link from '@/app/components/LocalizedLink';
import { Button, classesDeBotao } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import { cx } from '@/app/components/ui/cx';
import { VistoQueSeDesenha } from '@/app/components/ui/VistoQueSeDesenha';
import { EMAIL_VERIFICATION } from '@/app/conteudo/site/email-verification';
import type { Idioma } from '@/app/conteudo/legal/tipos';
import { useEmailRefresh } from '@/app/hooks/useEmailRefresh';
import { useEmailVerification } from '@/app/hooks/useEmailVerification';
import { PersonalNav } from '@/app/components/site/personal/PersonalNav';

/**
 * Contributing asks for a confirmed email. A personal page (the tabs stay,
 * to move to the others) and a task page, like contact: the
 * address and the two actions lead; what is open now, what opens after and
 * what to try when the email does not arrive sit beside them.
 */
export default function EmailVerificationRequired({
  userEmail,
  idioma,
}: {
  userEmail: string;
  idioma: Idioma;
}) {
  const t = EMAIL_VERIFICATION[idioma];
  const { isSending, emailSent, resendEmail } = useEmailVerification({
    userEmail,
  });
  const { isRefreshing, refreshEmailStatus } = useEmailRefresh();

  return (
    <div className="flex flex-col">
      <PersonalNav />
      <div className="section-wrap pb-20 pt-8 md:pt-12">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,7fr)_minmax(0,4fr)] lg:gap-16">
          <section className="flex flex-col items-start gap-6">
            <span className="entra t-legenda text-ouro-texto">{t.eyebrow}</span>
            <h1
              className="entra max-w-[18ch] font-display text-[clamp(2.25rem,5vw,3.25rem)] leading-[1.1]"
              style={{ ['--i' as string]: 1 }}
            >
              {t.title}
            </h1>
            <p
              className="entra t-corpo max-w-[var(--largura-texto)] text-lg text-texto-suave"
              style={{ ['--i' as string]: 2 }}
            >
              {t.text}
            </p>

            <div
              className="entra flex w-full max-w-xl items-center gap-4 rounded-card bg-sup-2 p-5"
              style={{ ['--i' as string]: 3 }}
            >
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full tint-ouro text-ouro-na-tinta">
                {emailSent ? (
                  <VistoQueSeDesenha className="h-6 w-6" />
                ) : (
                  <Icon de={PiEnvelopeSimple} tamanho="m" />
                )}
              </span>
              <span className="flex min-w-0 flex-col">
                <span className="t-rotulo text-texto-suave">{t.sentTo}</span>
                <span className="truncate font-medium text-texto">
                  {userEmail}
                </span>
                {emailSent && (
                  <span role="status" className="t-rotulo text-ouro-texto">
                    {t.sent}
                  </span>
                )}
              </span>
            </div>

            <div
              className="entra flex w-full flex-wrap gap-3"
              style={{ ['--i' as string]: 4 }}
            >
              <Button
                variante="primario"
                icone={emailSent ? PiArrowsClockwise : PiEnvelopeSimple}
                carregando={isSending}
                onClick={resendEmail}
                className="max-sm:w-full"
              >
                {emailSent ? t.resend : t.send}
              </Button>
              <Button
                icone={PiCheck}
                carregando={isRefreshing}
                onClick={refreshEmailStatus}
                className="max-sm:w-full"
              >
                {t.confirmed}
              </Button>
              <Link
                href="/"
                className={cx(classesDeBotao('fantasma'), 'max-sm:w-full')}
              >
                {t.home}
              </Link>
            </div>
          </section>

          <aside
            className="entra flex flex-col gap-10 lg:pt-10"
            style={{ ['--i' as string]: 3 }}
          >
            <Lista titulo={t.now} itens={t.nowItems} />
            <Lista titulo={t.after} itens={t.afterItems} />
            <section className="flex flex-col gap-3">
              <h2 className="font-display text-[1.375rem]">{t.help}</h2>
              <ul className="t-corpo flex flex-col gap-2 text-texto-suave">
                {t.helpItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <Link
                href="/contact"
                className="t-corpo text-texto underline decoration-[var(--linha-forte)] underline-offset-4 hover:decoration-[var(--ouro)]"
              >
                {t.contact}
              </Link>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}

function Lista({ titulo, itens }: { titulo: string; itens: string[] }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-display text-[1.375rem]">{titulo}</h2>
      <ul className="flex flex-col divide-y divide-[var(--linha)]">
        {itens.map((item) => (
          <li key={item} className="flex items-center gap-3 py-2.5">
            <Icon de={PiCheck} tamanho="p" className="text-ouro-texto" />
            <span className="t-corpo">{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
