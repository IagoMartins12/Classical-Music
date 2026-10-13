'use client';

import { useState, type FormEvent } from 'react';
import {
  PiCheckCircle,
  PiInstagramLogo,
  PiLinkedinLogo,
  PiTiktokLogo,
  PiXLogo,
} from 'react-icons/pi';
import Link from '@/app/components/LocalizedLink';
import { BrandLink } from '@/app/components/site/header/BrandLink';
import { ABRIR_PASSOS } from '@/app/components/site/pwa/eventos';
import { Button } from '@/app/components/ui/Button';
import { Field } from '@/app/components/ui/Field';
import { Icon } from '@/app/components/ui/Icon';
import { FOOTER, type FooterCopy } from '@/app/conteudo/site/footer';
import { useRouteLanguage } from '@/app/hooks/useRouteLanguage';
import {
  resendNewsletterConfirmation,
  subscribeToNewsletter,
} from '@/app/requests/newsletter';
import { CONTATO, mailto } from '@/app/utils/contato';

const COLUMNS = {
  explore: {
    history: '/music-history',
    composers: '/composers',
    works: '/works',
    instruments: '/instruments',
    blog: '/blog',
  },
  atlas: {
    about: '/about-us',
    plans: '/pricing',
    teachers: '/for-teachers',
    app: null,
  },
  help: {
    help: '/help',
    faq: '/faq',
    contact: '/contact',
    support: '/support',
  },
  legal: { terms: '/terms', privacy: '/privacy', copyright: '/copyright' },
} as const;

const SOCIAL = [
  {
    icon: PiInstagramLogo,
    href: 'https://www.instagram.com/opusatlas/',
    label: 'Instagram',
  },
  { icon: PiXLogo, href: 'https://x.com/Opus_Atlas', label: 'X' },
  {
    icon: PiLinkedinLogo,
    href: 'https://www.linkedin.com/company/opus-atlas/about/',
    label: 'LinkedIn',
  },
  {
    icon: PiTiktokLogo,
    href: 'https://www.tiktok.com/@opusatlas5',
    label: 'TikTok',
  },
];

const linkClass =
  't-rotulo text-texto-suave underline decoration-transparent underline-offset-4 transition-colors hover:text-texto hover:decoration-[var(--ouro)]';

/**
 * The site footer: the brand, four columns of links and the newsletter.
 * Every word comes from `conteudo/site/footer.ts`, so nothing waits on a
 * translation file. "Instalar o app" opens the PWA steps.
 */
export function SiteFooter() {
  const { language } = useRouteLanguage();
  const copy = FOOTER[language];
  const year = new Date().getFullYear();

  return (
    <footer aria-label={copy.label} className="bg-sup-2">
      <div className="section-wrap grid grid-cols-1 gap-12 py-16 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-4">
            <BrandLink label={copy.home} className="self-start" />
            <p className="max-w-[44ch] t-rotulo text-texto-suave">
              {copy.tagline}
            </p>
          </div>
          <Newsletter copy={copy.newsletter} />
        </div>

        <nav className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4">
          {(Object.keys(COLUMNS) as (keyof typeof COLUMNS)[]).map((col) => {
            const column = copy.columns[col];
            return (
              <div key={col} className="flex flex-col gap-4">
                <h2 className="t-legenda font-medium uppercase tracking-[0.12em] text-texto-fraco">
                  {column.title}
                </h2>
                <ul className="flex flex-col gap-3">
                  {Object.entries(COLUMNS[col]).map(([key, href]) => {
                    const label = (column.links as Record<string, string>)[key];
                    return (
                      <li key={key}>
                        {href ? (
                          <Link href={href} className={linkClass}>
                            {label}
                          </Link>
                        ) : (
                          <button
                            type="button"
                            className={linkClass}
                            onClick={() =>
                              window.dispatchEvent(new Event(ABRIR_PASSOS))
                            }
                          >
                            {label}
                          </button>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </nav>
      </div>

      <div className="section-wrap">
        <div className="flex flex-col items-center justify-between gap-4 border-t border-linha py-6 md:flex-row">
          <p className="t-legenda max-md:text-center">
            © {year} {copy.rights}{' '}
            <a href={mailto('contato')} className={linkClass}>
              {CONTATO.contato}
            </a>
          </p>
          <ul aria-label={copy.follow} className="flex gap-1">
            {SOCIAL.map(({ icon, href, label }) => (
              <li key={label}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="grid h-10 w-10 place-items-center rounded-controle text-texto-suave transition-colors hover:bg-[var(--interactive-hover)] hover:text-texto"
                >
                  <Icon de={icon} tamanho="m" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}

type ErrorCode = keyof FooterCopy['newsletter']['errors'];
type State =
  | { kind: 'idle' }
  | { kind: 'sending' }
  | { kind: 'done'; status?: string; resent?: boolean }
  | { kind: 'error'; code: ErrorCode };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function Newsletter({ copy }: { copy: FooterCopy['newsletter'] }) {
  const [email, setEmail] = useState('');
  const [invalid, setInvalid] = useState(false);
  const [state, setState] = useState<State>({ kind: 'idle' });

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!EMAIL.test(email.trim())) return setInvalid(true);
    setState({ kind: 'sending' });
    const result = await subscribeToNewsletter({
      email: email.trim(),
      sourceUrl: window.location.href,
      utmSource: 'footer',
    }).catch(() => null);
    if (!result) return setState({ kind: 'error', code: 'CONNECTION_ERROR' });
    if (result.success)
      return setState({ kind: 'done', status: result.status });
    const code = result.errorCode as ErrorCode | undefined;
    setState({
      kind: 'error',
      code: code && code in copy.errors ? code : 'UNKNOWN',
    });
  };

  const resend = async () => {
    setState({ kind: 'sending' });
    const result = await resendNewsletterConfirmation(email).catch(() => null);
    setState(
      result?.success
        ? { kind: 'done', status: 'PENDING', resent: true }
        : { kind: 'error', code: result ? 'UNKNOWN' : 'CONNECTION_ERROR' }
    );
  };

  const another = () => {
    setEmail('');
    setState({ kind: 'idle' });
  };

  return (
    <section
      aria-labelledby="newsletter-titulo"
      id="newsletter"
      className="flex flex-col gap-4"
    >
      <div className="flex flex-col gap-1">
        <h2
          id="newsletter-titulo"
          className="font-display text-[1.5rem] leading-tight"
        >
          {copy.title}
        </h2>
        <p className="t-rotulo text-texto-suave">{copy.text}</p>
      </div>

      {state.kind === 'done' ? (
        <div role="status" className="flex flex-col items-start gap-2">
          <p className="flex items-center gap-2 font-medium text-texto">
            <span className="ponto-surge grid">
              <Icon de={PiCheckCircle} className="text-ouro-texto" />
            </span>
            {state.resent
              ? copy.resent
              : state.status === 'RESUBSCRIBED'
                ? copy.welcomeBack
                : copy.done}
          </p>
          {state.status === 'PENDING' && (
            <p className="t-rotulo text-texto-suave">{copy.confirm}</p>
          )}
          <button type="button" onClick={another} className={linkClass}>
            {copy.another}
          </button>
        </div>
      ) : (
        <form onSubmit={submit} noValidate className="flex flex-col gap-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
            <Field
              label={copy.email}
              rotuloOculto
              type="email"
              autoComplete="email"
              placeholder={copy.email}
              value={email}
              erro={invalid ? copy.invalid : undefined}
              onChange={(e) => {
                setEmail(e.target.value);
                setInvalid(false);
                if (state.kind === 'error') setState({ kind: 'idle' });
              }}
              className="flex-1"
            />
            <Button
              type="submit"
              variante="primario"
              carregando={state.kind === 'sending'}
            >
              {copy.submit}
            </Button>
          </div>
          {state.kind === 'error' && (
            <div
              role="alert"
              className="flex flex-wrap items-center gap-x-4 gap-y-1"
            >
              <p className="t-rotulo text-erro">{copy.errors[state.code]}</p>
              {state.code === 'PENDING_CONFIRMATION' && (
                <button
                  type="button"
                  onClick={() => void resend()}
                  className={linkClass}
                >
                  {copy.resend}
                </button>
              )}
            </div>
          )}
          <p className="t-legenda">
            {copy.consent}{' '}
            <Link
              href="/privacy"
              className="text-ouro-texto underline-offset-4 hover:underline"
            >
              {copy.privacy}
            </Link>
            . {copy.leave}
          </p>
        </form>
      )}
    </section>
  );
}
