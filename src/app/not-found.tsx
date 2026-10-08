'use client';

import { useEffect } from 'react';
import { NotFoundView } from '@/app/components/site/status/StatusViews';
import { STATUS } from '@/app/conteudo/site/status';
import { useRouteLanguage } from '@/app/hooks/useRouteLanguage';

/**
 * "Op. 404". Client-side because the header and the paths depend on where
 * the visitor was (site, blog or portal) and Next gives the root not-found no
 * path on the server. Never indexed: Next sends 404 and the page sets noindex.
 */
export default function NotFound() {
  const { language } = useRouteLanguage();
  useEffect(() => {
    document.title = STATUS[language].notFound.metaTitle;
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex';
    document.head.appendChild(meta);
    return () => meta.remove();
  }, [language]);
  return <NotFoundView />;
}
