'use client';

import Link from '@/app/components/LocalizedLink';
import { PiHouse } from 'react-icons/pi';
import { Button, classesDeBotao } from '@/app/components/ui/Button';
import { Erro } from '@/app/components/ui/Estados';
import { Icon } from '@/app/components/ui/Icon';
import { useRouteLanguage } from '@/app/hooks/useRouteLanguage';
import { STATUS } from '@/app/conteudo/site/status';
import { useRecarregarPorCodigoAntigo } from './useRecarregarPorCodigoAntigo';

/**
 * A page failed inside a route group that has a shell (header, footer, portal
 * bar): the error shows **in the shell's content area** and the rest of the
 * site stays standing. "Try again" re-mounts only this screen.
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

  const t = STATUS[language].error;
  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <Erro
        titulo={t.title}
        descricao={error.digest ? `${t.text} (${error.digest})` : t.text}
        acao={
          <div className="flex flex-wrap justify-center gap-3">
            <Button tamanho="p" variante="primario" onClick={reset}>
              {t.retry}
            </Button>
            <Link href="/" className={classesDeBotao('secundario', 'p')}>
              <Icon de={PiHouse} /> {t.home}
            </Link>
          </div>
        }
      />
    </div>
  );
}
