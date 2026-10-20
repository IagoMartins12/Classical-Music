import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ListaDeArtigos } from '@/app/components/blog/site/ListaDeArtigos';
import {
  Avatar,
  JsonLd,
  PAGINA,
  Trilha,
} from '@/app/components/blog/site/pecas';
import { cx } from '@/app/components/ui/cx';
import { BLOG } from '@/app/conteudo/blog';
import {
  lerAutor,
  listarArtigos,
  listarMaisLidos,
} from '@/app/requests/blog/leitura';
import { mesEAno } from '@/app/utils/blog/formatos';
import { rotasDoBlog } from '@/app/utils/blog/rotas';
import { jsonLdDoAutor, metadadosDePagina } from '@/app/utils/blog/seo';
import {
  routeLanguage,
  type LangParams,
} from '@/app/utils/translations/routeLanguage';

/**
 * Quem escreve no blog: a foto (ou as iniciais), o nome, a bio, desde
 * quando escreve, sobre o que escreve, e os artigos.
 *
 * O nome do autor é link em todo artigo; antes levava a `/autor/...`, um
 * endereço que nunca existiu. A API só tem perfil para quem publicou (uma
 * conta qualquer responde 404).
 */

type Props = {
  params: LangParams<{ username: string }>;
  searchParams: Promise<{ page?: string }>;
};

const pagina = (valor?: string) => Math.max(1, Number(valor) || 1);

export async function generateMetadata({
  params,
  searchParams,
}: Props): Promise<Metadata> {
  const idioma = await routeLanguage(params);
  const { username } = await params;
  const n = pagina((await searchParams).page);
  const perfil = await lerAutor(decodeURIComponent(username), { idioma });
  if (!perfil) return { robots: { index: false } };
  const sufixo = n > 1 ? `?page=${n}` : '';
  const t = BLOG[idioma].autor;
  return metadadosDePagina({
    idioma,
    titulo: BLOG[idioma].lista.comPagina(perfil.autor.nome, n),
    descricao:
      perfil.autor.bio || t.metaDescricao(perfil.autor.nome, perfil.artigos),
    caminhoPt: rotasDoBlog.autor(perfil.autor.usuario, 'pt') + sufixo,
    caminhoEn: rotasDoBlog.autor(perfil.autor.usuario, 'en') + sufixo,
    imagem: perfil.autor.imagem,
  });
}

export default async function Autor({ params, searchParams }: Props) {
  const idioma = await routeLanguage(params);
  const { username } = await params;
  const n = pagina((await searchParams).page);
  const t = BLOG[idioma];

  const perfil = await lerAutor(decodeURIComponent(username), { idioma });
  if (!perfil) notFound();

  const [{ artigos, paginacao }, maisLidos] = await Promise.all([
    listarArtigos(
      { autorId: perfil.autor.id, pagina: n, porPagina: 12 },
      { idioma }
    ),
    listarMaisLidos(5, { idioma }),
  ]);
  const caminho = rotasDoBlog.autor(perfil.autor.usuario, idioma);

  const abertura = (
    <header className={cx(PAGINA, 'pt-8 lg:pt-12')}>
      <Trilha
        idioma={idioma}
        passos={[{ nome: t.nav.blog, href: rotasDoBlog.inicio(idioma) }]}
      />
      <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-8">
        <Avatar autor={perfil.autor} tamanho="gg" />
        <div className="flex min-w-0 flex-col gap-3">
          <div>
            <h1 className="font-display text-[2.5rem] leading-[1.03] tracking-[-0.015em] text-balance sm:text-[3.5rem]">
              {perfil.autor.nome}
            </h1>
            {perfil.autor.usuario &&
              perfil.autor.usuario !== perfil.autor.id &&
              perfil.autor.usuario !== perfil.autor.nome && (
                <p className="t-dado text-[0.875rem] text-texto-fraco">
                  @{perfil.autor.usuario}
                </p>
              )}
          </div>
          <p className="max-w-[56ch] text-[1.125rem] leading-[1.55] text-texto-suave">
            {perfil.autor.bio || t.autor.semBio}
          </p>
          <p className="flex flex-wrap gap-x-4 gap-y-1 text-[0.875rem] text-texto-fraco">
            <span className="t-dado">{t.autor.artigos(perfil.artigos)}</span>
            {perfil.visitas > 0 && (
              <span className="t-dado">{t.autor.leituras(perfil.visitas)}</span>
            )}
            {perfil.desde && (
              <span>{t.autor.desde(mesEAno(perfil.desde, idioma))}</span>
            )}
          </p>
          {perfil.categorias.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="t-legenda mr-1">{t.autor.escreveSobre}</span>
              {perfil.categorias.map((c) => (
                <Link
                  key={c.id}
                  href={rotasDoBlog.categoria(c.slug, idioma)}
                  className="inline-flex min-h-9 items-center rounded-full border border-linha-forte px-3.5 text-sm text-texto-suave transition-[border-color,color] duration-[var(--t-resposta)] ease-saida hover:border-ouro/45 hover:text-ouro-texto [@media(pointer:coarse)]:min-h-[var(--alvo)]"
                >
                  {c.nome}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
      <h2 className="t-titulo mt-14 border-t border-linha pt-8">
        {t.autor.artigosDe(perfil.autor.nome.split(' ')[0])}
      </h2>
    </header>
  );

  return (
    <>
      <JsonLd dados={jsonLdDoAutor(perfil)} />
      <ListaDeArtigos
        idioma={idioma}
        titulo={perfil.autor.nome}
        descricao={perfil.autor.bio || t.autor.semBio}
        abertura={abertura}
        artigos={artigos}
        paginacao={paginacao}
        caminho={caminho}
        maisLidos={maisLidos}
      />
    </>
  );
}
