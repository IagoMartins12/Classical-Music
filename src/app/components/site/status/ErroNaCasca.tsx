'use client';

import Link from '@/app/components/LocalizedLink';
import { PiHouse } from 'react-icons/pi';
import { Button, classesDeBotao } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import { useRouteLanguage } from '@/app/hooks/useRouteLanguage';
import { STATUS } from '@/app/conteudo/site/status';
import { StatusPage } from './StatusPage';
import { useRecarregarPorCodigoAntigo } from './useRecarregarPorCodigoAntigo';

const HREFS = {
  composers: '/composers',
  works: '/works',
  history: '/music-history',
};

/**
 * A page failed inside a route group that has a shell (header, footer, portal
 * bar): the same "Op. 500" page of the other status pages (owner's decision,
 * 31/10), **in the shell's content area**, so the rest stays standing. "Try
 * again" re-mounts only this screen.
 */
export function ErroNaCasca({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const recarregar = useRecarregarPorCodigoAntigo(error);
  const { language } = useRouteLanguage();
  if (recarregar) return null;

  const copy = STATUS[language];
  const t = copy.error;
  return (
    <StatusPage
      number="500"
      name={t.name}
      op={copy.op}
      title={t.title}
      text={error.digest ? `${t.text} (${error.digest})` : t.text}
      pathsLabel={copy.paths}
      paths={(['composers', 'works', 'history'] as const).map((key) => ({
        label: copy.links[key][0],
        text: copy.links[key][1],
        href: HREFS[key],
      }))}
      quote={copy.quote}
      action={
        <div className="flex flex-wrap justify-center gap-3">
          <Button variante="primario" onClick={reset}>
            {t.retry}
          </Button>
          <Link href="/" className={classesDeBotao()}>
            <Icon de={PiHouse} /> {t.home}
          </Link>
        </div>
      }
    />
  );
}
