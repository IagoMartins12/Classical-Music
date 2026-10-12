import type { ReactNode } from 'react';
import AdsProvider from '@/app/components/Ads/AdsProvider';
import Footer from '@/app/components/Footer';
import { FavoritesProvider } from '@/app/providers/FavoritesProvider';
import { Avisos } from '@/app/components/ui/Avisos';
import type { Idioma } from '@/app/conteudo/blog';
import {
  listarCategorias,
  type CategoriaRef,
} from '@/app/requests/blog/leitura';
import { ProvedorDeEventos } from './DetalheDoEvento';
import { CabecalhoDoBlog } from './Cabecalho';

/**
 * A casca das páginas públicas do blog: cabeçalho do blog, rodapé do site.
 *
 * Serve às duas metades do blog — as páginas em `[lang]` (geradas e
 * guardadas por idioma) e as por pessoa em `app/blog/(site)` (salvos,
 * curtidos, busca, prévia) — para as duas não divergirem.
 *
 * Sem as categorias (API fora do ar), o cabeçalho segue sem a faixa delas:
 * a página não cai por causa da navegação.
 */
export async function CascaDoBlog({
  idioma,
  children,
}: {
  idioma: Idioma;
  children: ReactNode;
}) {
  let categorias: CategoriaRef[] = [];
  try {
    categorias = (await listarCategorias({ revalidate: 600, idioma })).map(
      (c) => ({ id: c.id, nome: c.nome, slug: c.slug, noMenu: c.noMenu })
    );
  } catch {
    categorias = [];
  }

  return (
    <AdsProvider>
      <FavoritesProvider>
        <div className="flex min-h-dvh flex-col bg-fundo text-texto">
          <a
            href="#conteudo"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-aviso focus:rounded-controle focus:bg-sup-2 focus:px-4 focus:py-3"
          >
            {idioma === 'pt' ? 'Pular para o conteúdo' : 'Skip to content'}
          </a>
          <CabecalhoDoBlog idioma={idioma} categorias={categorias} />
          <main id="conteudo" className="flex-1 pb-24">
            <ProvedorDeEventos idioma={idioma}>{children}</ProvedorDeEventos>
          </main>
          <Footer />
        </div>
        <Avisos />
      </FavoritesProvider>
    </AdsProvider>
  );
}
