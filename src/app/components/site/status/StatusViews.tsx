'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { TentarDeNovo } from '@/app/components/ui/TentarDeNovo';
import type { ReactNode } from 'react';
import {
  PiArrowLeft,
  PiEnvelopeSimple,
  PiHouse,
  PiMagnifyingGlass,
  PiSignIn,
} from 'react-icons/pi';
import { CabecalhoDoBlog } from '@/app/components/blog/site/Cabecalho';
import { SiteFooter } from '@/app/components/site/footer/SiteFooter';
import Link from '@/app/components/LocalizedLink';
import { Button, classesDeBotao } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import { STATUS, type StatusCopy } from '@/app/conteudo/site/status';
import { useRouteLanguage } from '@/app/hooks/useRouteLanguage';
import { useRegisterModal } from '@/app/stores/authStore';
import { CONTATO } from '@/app/utils/contato';
import { localizeHref, stripLanguagePrefix } from '@/app/utils/localizedRoutes';
import { SiteHeader } from '../header/SiteHeader';
import { StatusPage, type StatusPath } from './StatusPage';

type Area = 'site' | 'blog' | 'portal';

function areaOf(path: string): Area {
  if (path.startsWith('/blog')) return 'blog';
  if (path.startsWith('/teacher') || path.startsWith('/student'))
    return 'portal';
  return 'site';
}

const link = (copy: StatusCopy, key: string, href: string): StatusPath => {
  const [label, text] = copy.links[key];
  return { label, text, href };
};

/** The header that fits where the visitor was, and the footer. */
function Chrome({ area, children }: { area: Area; children: ReactNode }) {
  const { language } = useRouteLanguage();
  return (
    <>
      {area === 'blog' ? (
        <CabecalhoDoBlog idioma={language} categorias={[]} />
      ) : (
        <SiteHeader />
      )}
      <main className="flex min-h-[70vh] flex-col justify-center">
        {children}
      </main>
      <SiteFooter />
    </>
  );
}

const textLink =
  'underline decoration-transparent underline-offset-4 hover:decoration-[var(--ouro)]';

export function NotFoundView() {
  const { language, path } = useRouteLanguage();
  const pathname = usePathname() ?? '/';
  const copy = STATUS[language];
  const t = copy.notFound;
  const area = areaOf(stripLanguagePrefix(path));
  const paths: Record<Area, StatusPath[]> = {
    site: [
      link(copy, 'composers', '/composers'),
      link(copy, 'works', '/works'),
      link(copy, 'history', '/music-history'),
    ],
    blog: [
      link(copy, 'articles', '/blog/articles'),
      link(copy, 'calendar', '/blog/calendar'),
      link(copy, 'encyclopedia', '/composers'),
    ],
    portal: [
      link(copy, 'teacher', '/teacher'),
      link(copy, 'student', '/student'),
      link(copy, 'encyclopedia', '/composers'),
    ],
  };
  const mail = `mailto:${CONTATO.contato}?subject=${encodeURIComponent(`Link quebrado: ${pathname}`)}`;

  return (
    <Chrome area={area}>
      <StatusPage
        number="404"
        name={t.name}
        op={copy.op}
        title={t[area].title}
        text={t[area].text}
        pathsLabel={copy.paths}
        paths={paths[area]}
        quote={t.quote}
        action={
          <form
            role="search"
            action={localizeHref(
              area === 'blog' ? '/blog/search' : '/search',
              language
            )}
            className="search-field flex w-full max-w-xl items-center gap-2 rounded-full bg-sup-2 p-1.5 pl-5 shadow-[var(--sombra-1)]"
          >
            <Icon
              de={PiMagnifyingGlass}
              tamanho="m"
              className="shrink-0 text-texto-fraco"
            />
            <label htmlFor="status-search" className="sr-only">
              {t.search}
            </label>
            <input
              id="status-search"
              name="q"
              type="search"
              enterKeyHint="search"
              placeholder={t.placeholder}
              className="min-h-11 min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-texto-fraco"
            />
            <Button
              variante="primario"
              type="submit"
              className="shrink-0 rounded-full"
            >
              {t.submit}
            </Button>
          </form>
        }
        note={
          <a
            href={mail}
            className={`inline-flex min-h-10 items-center gap-2 t-legenda ${textLink}`}
          >
            <Icon de={PiEnvelopeSimple} tamanho="pp" /> {t.report}
          </a>
        }
      />
    </Chrome>
  );
}

export function SignInView() {
  const { language } = useRouteLanguage();
  const params = useSearchParams();
  const next = params?.get('next') || params?.get('callbackUrl') || '/';
  const { open: openRegister } = useRegisterModal();
  const copy = STATUS[language];
  const t = copy.signIn;
  const login = `/login?callbackUrl=${encodeURIComponent(next)}`;
  return (
    <Chrome area="site">
      <StatusPage
        number="401"
        name={t.name}
        op={copy.op}
        title={t.title}
        text={t.text}
        pathsLabel={copy.paths}
        paths={[
          link(copy, 'composers', '/composers'),
          link(copy, 'open', '/works'),
          link(copy, 'plans', '/pricing'),
        ]}
        quote={copy.quote}
        action={
          <div className="flex flex-wrap justify-center gap-3">
            <a href={login} className={classesDeBotao('primario')}>
              <Icon de={PiSignIn} /> {t.signIn}
            </a>
            <Button onClick={openRegister}>{t.signUp}</Button>
          </div>
        }
      />
    </Chrome>
  );
}

export function AccessDeniedView() {
  const { language } = useRouteLanguage();
  const copy = STATUS[language];
  const t = copy.denied;
  return (
    <Chrome area="site">
      <StatusPage
        number="403"
        name={t.name}
        op={copy.op}
        title={t.title}
        pathsLabel={copy.paths}
        paths={[
          link(copy, 'studies', '/learning'),
          link(copy, 'composers', '/composers'),
          link(copy, 'works', '/works'),
        ]}
        quote={copy.quote}
        action={
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/" className={classesDeBotao('primario')}>
              <Icon de={PiHouse} /> {t.home}
            </Link>
            <Button
              variante="fantasma"
              icone={PiArrowLeft}
              onClick={() => history.back()}
            >
              {t.back}
            </Button>
          </div>
        }
        note={<span className="t-rotulo text-texto-fraco">{t.untouched}</span>}
      />
    </Chrome>
  );
}

export function ErrorView({ digest }: { digest?: string }) {
  const { language } = useRouteLanguage();
  const copy = STATUS[language];
  const t = copy.error;
  const mail = `mailto:${CONTATO.suporte}?subject=${encodeURIComponent(`Erro no site${digest ? ` (${digest})` : ''}`)}`;
  return (
    <Chrome area="site">
      <StatusPage
        number="500"
        name={t.name}
        op={copy.op}
        title={t.title}
        text={t.text}
        pathsLabel={copy.paths}
        paths={[
          link(copy, 'composers', '/composers'),
          link(copy, 'works', '/works'),
          link(copy, 'history', '/music-history'),
        ]}
        quote={copy.quote}
        action={
          <div className="flex flex-wrap justify-center gap-3">
            <TentarDeNovo variante="primario">{t.retry}</TentarDeNovo>
            <Link href="/" className={classesDeBotao()}>
              <Icon de={PiHouse} /> {t.home}
            </Link>
          </div>
        }
        note={
          <a
            href={mail}
            className={`inline-flex min-h-10 items-center gap-2 t-legenda ${textLink}`}
          >
            <Icon de={PiEnvelopeSimple} tamanho="pp" /> {t.report}
          </a>
        }
      />
    </Chrome>
  );
}
