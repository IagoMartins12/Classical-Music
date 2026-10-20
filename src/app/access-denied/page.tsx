import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AccessDeniedView } from '@/app/components/site/status/StatusViews';
import { STATUS } from '@/app/conteudo/site/status';
import { CookieLanguageProvider } from '@/app/hooks/useRouteLanguage';
import { getServerLanguageStatic } from '@/app/utils/translations/serverTranslations';

export async function generateMetadata(): Promise<Metadata> {
  const language = await getServerLanguageStatic();
  return {
    title: STATUS[language].denied.metaTitle,
    robots: { index: false, follow: true },
  };
}

/** Outside the localized routes: the language comes from the cookie. */
export default async function Page() {
  return (
    <CookieLanguageProvider language={await getServerLanguageStatic()}>
      <Suspense>
        <AccessDeniedView />
      </Suspense>
    </CookieLanguageProvider>
  );
}
