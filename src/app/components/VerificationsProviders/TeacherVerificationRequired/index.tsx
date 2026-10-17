'use client';

import { PiCheck, PiEnvelopeSimple } from 'react-icons/pi';
import Link from '@/app/components/LocalizedLink';
import { SiteHeader } from '@/app/components/site/header/SiteHeader';
import { Avisos } from '@/app/components/ui/Avisos';
import { Button, classesDeBotao } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import { cx } from '@/app/components/ui/cx';
import { useEmailRefreshSimple } from '@/app/hooks/useEmailRefresh';

/** The portal is Portuguese only, like the rest of the teacher area. */
const T = {
  eyebrow: 'Falta aceitar o convite',
  title: 'Aceite o convite para abrir o portal',
  text: (nome?: string | null) =>
    `${nome ? `${nome}, você` : 'Você'} foi convidado para dar aula no Opus Atlas. Abra o e-mail do convite e toque no link: o portal abre na hora.`,
  sentTo: 'O convite foi para',
  accepted: 'Já aceitei',
  contact: 'Falar com a gente',
  home: 'Voltar ao início',
  after: 'Depois de aceitar',
  afterItems: [
    'Aulas e agenda da semana',
    'Tarefas com prazo para cada aluno',
    'Relatórios de progresso',
    'Avisos antes da aula e do prazo',
  ],
  help: 'O e-mail não chegou?',
  helpItems: [
    'Olhe a caixa de spam e a aba de promoções.',
    'O convite pode ter chegado há alguns dias.',
    'Se não achar, fale com a gente: enviamos outro.',
  ],
};

/**
 * Someone invited to teach, before accepting. Subscribers of Mentor and
 * Maestro never see this: their portal opens at once. A task page, like the
 * email check: the address and the action lead, what opens after and what to
 * try when the email does not arrive sit beside them.
 */
export default function TeacherVerificationRequired({
  userEmail,
  userName,
}: {
  userEmail?: string | null;
  userName?: string | null;
}) {
  const { isRefreshing, refreshEmailStatus } = useEmailRefreshSimple();

  return (
    <>
      <SiteHeader />
      <main className="section-wrap pb-20 pt-10 md:pt-14">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,7fr)_minmax(0,4fr)] lg:gap-16">
          <section className="flex flex-col items-start gap-6">
            <span className="entra t-legenda text-ouro-texto">{T.eyebrow}</span>
            <h1
              className="entra max-w-[18ch] font-display text-[clamp(2.25rem,5vw,3.25rem)] leading-[1.1]"
              style={{ ['--i' as string]: 1 }}
            >
              {T.title}
            </h1>
            <p
              className="entra t-corpo max-w-[var(--largura-texto)] text-lg text-texto-suave"
              style={{ ['--i' as string]: 2 }}
            >
              {T.text(userName)}
            </p>

            {userEmail && (
              <div
                className="entra flex w-full max-w-xl items-center gap-4 rounded-card bg-sup-2 p-5"
                style={{ ['--i' as string]: 3 }}
              >
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full tint-ouro text-ouro-na-tinta">
                  <Icon de={PiEnvelopeSimple} tamanho="m" />
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className="t-rotulo text-texto-suave">{T.sentTo}</span>
                  <span className="truncate font-medium text-texto">
                    {userEmail}
                  </span>
                </span>
              </div>
            )}

            <div
              className="entra flex w-full flex-wrap gap-3"
              style={{ ['--i' as string]: 4 }}
            >
              <Button
                variante="primario"
                icone={PiCheck}
                carregando={isRefreshing}
                onClick={() => void refreshEmailStatus()}
                className="max-sm:w-full"
              >
                {T.accepted}
              </Button>
              <Link
                href="/contact"
                className={cx(classesDeBotao(), 'max-sm:w-full')}
              >
                {T.contact}
              </Link>
              <Link
                href="/"
                className={cx(classesDeBotao('fantasma'), 'max-sm:w-full')}
              >
                {T.home}
              </Link>
            </div>
          </section>

          <aside
            className="entra flex flex-col gap-10 lg:pt-10"
            style={{ ['--i' as string]: 3 }}
          >
            <section className="flex flex-col gap-3">
              <h2 className="font-display text-[1.375rem]">{T.after}</h2>
              <ul className="flex flex-col divide-y divide-[var(--linha)]">
                {T.afterItems.map((item) => (
                  <li key={item} className="flex items-center gap-3 py-2.5">
                    <Icon
                      de={PiCheck}
                      tamanho="p"
                      className="text-ouro-texto"
                    />
                    <span className="t-corpo">{item}</span>
                  </li>
                ))}
              </ul>
            </section>
            <section className="flex flex-col gap-3">
              <h2 className="font-display text-[1.375rem]">{T.help}</h2>
              <ul className="t-corpo flex flex-col gap-2 text-texto-suave">
                {T.helpItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          </aside>
        </div>
      </main>
      <Avisos />
    </>
  );
}
