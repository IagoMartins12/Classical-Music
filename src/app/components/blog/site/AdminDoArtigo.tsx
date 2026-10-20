'use client';

import Link from 'next/link';
import { PiPencilSimple } from 'react-icons/pi';
import { useIsBlogAdmin } from '@/app/components/blog/AdminOnly';
import { classesDeBotao } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import { BLOG, type Idioma } from '@/app/conteudo/blog';
import { rotasDoBlog } from '@/app/utils/blog/rotas';

/**
 * O que só a equipe vê no artigo: editar e o número de visitas. Decide no
 * navegador: a página é estática e não lê a sessão no servidor.
 */
export function AdminDoArtigo({
  idioma,
  artigoId,
  visitas,
}: {
  idioma: Idioma;
  artigoId: string;
  visitas: number;
}) {
  const admin = useIsBlogAdmin();
  if (!admin) return null;
  const t = BLOG[idioma].artigo;

  return (
    <div className="flex w-full flex-wrap items-center gap-x-4 gap-y-2">
      <Link
        href={rotasDoBlog.editar(artigoId)}
        className={classesDeBotao('secundario', 'p')}
      >
        <Icon de={PiPencilSimple} tamanho="pp" />
        {t.editar}
      </Link>
      <span className="t-legenda t-dado">{t.visitas(visitas)}</span>
    </div>
  );
}
