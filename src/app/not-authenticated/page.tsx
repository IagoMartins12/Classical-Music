import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { getServerSession } from '@/app/libs/api/server-session';
import { SignInView } from '@/app/components/site/status/StatusViews';
import { STATUS } from '@/app/conteudo/site/status';
import { CookieLanguageProvider } from '@/app/hooks/useRouteLanguage';
import { getServerLanguageStatic } from '@/app/utils/translations/serverTranslations';

export async function generateMetadata(): Promise<Metadata> {
  const language = await getServerLanguageStatic();
  return {
    title: STATUS[language].signIn.metaTitle,
    robots: { index: false, follow: true },
  };
}

/** A path on this site, never another origin (`//evil.com`, `https://…`). */
function caminhoSeguro(valor: string | null | undefined): string | null {
  if (!valor || !valor.startsWith('/') || valor.startsWith('//')) return null;
  return valor.startsWith('/not-authenticated') ? null : valor;
}

/**
 * Outside the localized routes: the language comes from the cookie.
 *
 * Signed in, the page has nothing to say (owner's decision, 29/10): it sends
 * the person on, to where they were going (`next`), else to the page they
 * came from, else home.
 */
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; callbackUrl?: string }>;
}) {
  const session = await getServerSession();
  if (session?.user?.id) {
    const { next, callbackUrl } = await searchParams;
    const h = await headers();
    let veio: string | null = null;
    try {
      const ref = new URL(h.get('referer') ?? '');
      if (ref.host === h.get('host')) veio = ref.pathname + ref.search;
    } catch {
      // No referer: home.
    }
    redirect(
      caminhoSeguro(next) ??
        caminhoSeguro(callbackUrl) ??
        caminhoSeguro(veio) ??
        '/'
    );
  }
  return (
    <CookieLanguageProvider language={await getServerLanguageStatic()}>
      <Suspense>
        <SignInView />
      </Suspense>
    </CookieLanguageProvider>
  );
}
