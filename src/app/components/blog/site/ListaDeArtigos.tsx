import type { ReactNode } from 'react';
import { PiArticle } from 'react-icons/pi';
import { Vazio } from '@/app/components/ui/Estados';
import { cx } from '@/app/components/ui/cx';
import { BLOG, LISTA_COM_MAIS_LIDOS, type Idioma } from '@/app/conteudo/blog';
import type {
  CategoriaRef,
  Paginacao as PaginacaoDados,
  ResumoDeArtigo,
} from '@/app/requests/blog/leitura';
import { Capa } from './Capa';
import { Cartao, MaisLidos, VEU } from './cartoes';
import { CategoriasEmFichas, PAGINA, Paginacao } from './pecas';

/**
 * A lista de artigos (escolha de 30/09/2026: o esboço C, nos dois tamanhos).
 *
 * A página abre com uma capa do acervo e o título por cima; embaixo, as
 * categorias em fichas e a grade de cards. Serve a todos os artigos, a cada
 * categoria, a cada assunto (tag) e ao autor.
 *
 * **Os mais lidos ao lado** dependem de `LISTA_COM_MAIS_LIDOS`
 * (`conteudo/blog.ts`): desligada, a lista fica exatamente como o esboço.
 */
export function ListaDeArtigos({
  idioma,
  titulo,
  descricao,
  imagem,
  artigos,
  paginacao,
  caminho,
  categorias,
  categoriaAtual,
  maisLidos = [],
  abertura,
  semCapa = false,
}: {
  idioma: Idioma;
  titulo: string;
  descricao: string;
  /** A capa da abertura; sem ela, a do primeiro artigo com capa. */
  imagem?: string | null;
  artigos: ResumoDeArtigo[];
  paginacao: PaginacaoDados;
  caminho: string;
  categorias?: CategoriaRef[];
  categoriaAtual?: string;
  maisLidos?: ResumoDeArtigo[];
  /** No lugar da abertura com capa (a página do autor tem a sua). */
  abertura?: ReactNode;
  /** Abertura sem capa: só o título (a lista de todos os artigos). */
  semCapa?: boolean;
}) {
  const t = BLOG[idioma].lista;
  const fundo = imagem ?? artigos.find((a) => a.capa)?.capa ?? null;
  const comLateral = LISTA_COM_MAIS_LIDOS && maisLidos.length > 0;

  return (
    <>
      {abertura ?? (
        <header className="mx-auto w-full max-w-[1360px] lg:px-10 lg:pt-6">
          {semCapa ? (
            <div className="flex flex-col gap-3 px-4 pt-10 sm:px-6 lg:px-0 lg:pt-8">
              <h1 className="font-display text-[2.5rem] leading-[1.03] tracking-[-0.015em] text-balance sm:text-[3.5rem]">
                {titulo}
              </h1>
              <p className="max-w-[52ch] text-[1.1875rem] leading-[1.5] text-texto-suave">
                {descricao}
              </p>
            </div>
          ) : (
            <div className="relative isolate flex min-h-[17rem] items-end overflow-hidden lg:min-h-[20rem] lg:rounded-card">
              <Capa
                src={fundo}
                alt=""
                inicial={titulo}
                sizes="(min-width: 1360px) 1280px, 100vw"
                prioridade
                preencher
              />
              <span aria-hidden="true" className={VEU} />
              <div className="relative flex flex-col gap-3 p-5 sm:p-8 lg:p-12">
                <h1 className="font-display text-[2.5rem] leading-[1.03] tracking-[-0.015em] text-balance text-sobre-foto sm:text-[3.5rem]">
                  {titulo}
                </h1>
                <p className="max-w-[52ch] text-[1.125rem] leading-[1.5] text-sobre-foto/85">
                  {descricao}
                </p>
              </div>
            </div>
          )}
        </header>
      )}

      <div className={cx(PAGINA, 'mt-8')}>
        {/* A faixa ocupa o que sobra e rola; a contagem fica na ponta. */}
        <div className="flex items-center justify-between gap-4 max-sm:flex-col max-sm:items-stretch">
          {categorias && categorias.length > 0 ? (
            <CategoriasEmFichas
              categorias={categorias}
              atual={categoriaAtual}
              idioma={idioma}
              className="min-w-0 flex-1"
            />
          ) : (
            <span />
          )}
          <p className="t-legenda shrink-0">{t.contagem(paginacao.total)}</p>
        </div>

        <div
          className={cx(
            'mt-10 grid gap-x-12 gap-y-14',
            comLateral && 'lg:grid-cols-[minmax(0,1fr)_20rem]'
          )}
        >
          <div className="flex min-w-0 flex-col gap-12">
            {artigos.length === 0 ? (
              <Vazio
                icone={PiArticle}
                titulo={t.vazio}
                descricao={t.vazioDescricao}
              />
            ) : (
              <ul
                className={cx(
                  'grid gap-x-5 gap-y-12 sm:grid-cols-2',
                  comLateral ? 'xl:grid-cols-3' : 'lg:grid-cols-3'
                )}
              >
                {artigos.map((artigo) => (
                  <li key={artigo.id}>
                    <Cartao artigo={artigo} idioma={idioma} comResumo />
                  </li>
                ))}
              </ul>
            )}
            <Paginacao
              paginacao={paginacao}
              caminho={caminho}
              idioma={idioma}
            />
          </div>

          {comLateral && (
            <aside>
              <MaisLidos
                artigos={maisLidos}
                idioma={idioma}
                className="lg:sticky lg:top-24"
              />
            </aside>
          )}
        </div>
      </div>
    </>
  );
}
