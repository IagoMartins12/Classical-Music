import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PiPencilSimple } from 'react-icons/pi';
import { ApproveArticleButton } from '@/app/components/blog/admin/ApproveArticleButton';
import { PaginaDoArtigo } from '@/app/components/blog/site/PaginaDoArtigo';
import { classesDeBotao } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import { BLOG } from '@/app/conteudo/blog';
import {
  getServerAccessToken,
  getServerSession,
} from '@/app/libs/api/server-session';
import { lerArtigo } from '@/app/requests/blog/leitura';
import { rotasDoBlog } from '@/app/utils/blog/rotas';
import { metadadosDoArtigo } from '@/app/utils/blog/seo';
import { getServerLanguageStatic } from '@/app/utils/translations/serverTranslations';

/**
 * A prévia do artigo: a mesma página que o leitor vai ver, com uma faixa de
 * quem administra (editar, aprovar e publicar). Só para a equipe; fora do
 * buscador; sem contar visita.
 */

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ slug: string }> };

async function carregar(slug: string) {
  const session = await getServerSession();
  if (!session?.user || (session.user.role ?? 0) < 1) return null;
  return lerArtigo(slug, { token: await getServerAccessToken() });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const artigo = await carregar(slug);
  if (!artigo) return { robots: { index: false, follow: false } };
  return metadadosDoArtigo(artigo, 'pt', { previa: true });
}

export default async function Previa({ params }: Props) {
  const idioma = await getServerLanguageStatic();
  const t = BLOG[idioma].previa;
  const { slug } = await params;
  const artigo = await carregar(slug);
  if (!artigo) notFound();

  return (
    <>
      <div className="sticky top-16 z-elevado border-b border-linha bg-sup-2">
        <div className="mx-auto flex w-full max-w-[1360px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-10">
          <p className="t-rotulo text-texto-suave">{t.faixa}</p>
          <div className="flex flex-wrap gap-2">
            <Link
              href={rotasDoBlog.editar(artigo.id)}
              className={classesDeBotao('secundario', 'p')}
            >
              <Icon de={PiPencilSimple} tamanho="pp" />
              {t.editar}
            </Link>
            {artigo.status !== 'PUBLISHED' && (
              <ApproveArticleButton articleId={artigo.id} slug={artigo.slug} />
            )}
          </div>
        </div>
      </div>
      <PaginaDoArtigo
        artigo={artigo}
        idioma={idioma}
        maisDaCategoria={[]}
        previa
      />
    </>
  );
}
