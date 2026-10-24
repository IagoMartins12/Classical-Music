import type { Metadata } from 'next';
import { Vazio } from '@/app/components/ui/Estados';
import { cx } from '@/app/components/ui/cx';
import {
  CartaoDaPrateleira,
  MaisLidos,
  Peca,
} from '@/app/components/blog/site/cartoes';
import { Carrossel } from '@/app/components/blog/site/Carrossel';
import { Newsletter } from '@/app/components/blog/site/interacoes';
import {
  JsonLd,
  PAGINA,
  TituloDeSecao,
} from '@/app/components/blog/site/pecas';
import {
  AgendaDaSemana,
  DestaqueDaCategoria,
} from '@/app/components/blog/site/secoes';
import { BLOG, type Idioma } from '@/app/conteudo/blog';
import { tolerarApiForaNoBuild } from '@/app/libs/api/build-tolerance';
import {
  listarArtigos,
  listarCategorias,
  listarDestaques,
  listarMaisLidos,
  type CategoriaDoBlog,
  type ResumoDeArtigo,
} from '@/app/requests/blog/leitura';
import {
  loadCalendar,
  type CalendarEventData,
} from '@/app/requests/calendar-requests';
import { rotasDoBlog } from '@/app/utils/blog/rotas';
import { jsonLdDoBlog, metadadosDePagina } from '@/app/utils/blog/seo';
import {
  routeLanguage,
  type LangParams,
} from '@/app/utils/translations/routeLanguage';

/**
 * O início do blog (escolha de 30/09/2026).
 *
 * **Computador: o esboço C.** O topo é um mosaico com o título sobre a capa;
 * os últimos correm numa prateleira; as categorias com mais artigos ganham
 * uma composição própria. **Telefone: o esboço A.** O mesmo HTML vira capa
 * em cima e texto embaixo, e a prateleira vira linhas com miniatura. **A
 * agenda da semana é a do A** nos dois (a "junção" pedida).
 *
 * A inscrição por e-mail fica ao lado dos mais lidos (pedido de 01/10): é
 * ali, depois de ver o que o blog publica, que ela faz sentido.
 */

export const revalidate = 300;

interface Props {
  params: LangParams;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const idioma = await routeLanguage(params);
  const t = BLOG[idioma];
  return metadadosDePagina({
    idioma,
    titulo: t.meta.titulo,
    descricao: t.meta.descricao,
    caminhoPt: rotasDoBlog.inicio('pt'),
    caminhoEn: rotasDoBlog.inicio('en'),
  });
}

/**
 * As seções de categoria do início: as marcadas no painel, na ordem de
 * "Início do blog" (arrastável), quantas forem. Categoria marcada sem
 * artigo publicado não aparece (seção vazia é buraco na página).
 */
async function categoriasEmDestaque(
  categorias: CategoriaDoBlog[],
  idioma: Idioma
) {
  const comArtigos = await Promise.all(
    categorias
      .filter((c) => c.noInicio)
      .sort((a, b) => (a.ordemNoInicio ?? 999) - (b.ordemNoInicio ?? 999))
      .map(async (categoria) => ({
        categoria,
        artigos: (
          await listarArtigos(
            { categoria: categoria.slug, porPagina: 4 },
            { idioma }
          )
        ).artigos,
      }))
  );
  return comArtigos.filter((c) => c.artigos.length > 0);
}

/** Os concertos dos próximos sete dias (o que já começou fica de fora). */
async function semana(): Promise<CalendarEventData[]> {
  const agora = new Date();
  const fim = new Date(agora.getTime() + 7 * 86_400_000);
  const { events } = await loadCalendar(agora, fim);
  return events
    .filter((e) => e.start >= agora && e.start <= fim)
    .sort((a, b) => a.start.getTime() - b.start.getTime())
    .slice(0, 5);
}

async function carregar(idioma: Idioma) {
  const [destaques, recentes, maisLidos, categorias] = await Promise.all([
    listarDestaques(3, { idioma }),
    listarArtigos({ porPagina: 12 }, { idioma }),
    listarMaisLidos(5, { idioma }),
    listarCategorias({ idioma }),
  ]);

  // Sem destaques escolhidos no painel, o topo mostra os mais recentes.
  const topo = [...destaques];
  for (const artigo of recentes.artigos) {
    if (topo.length >= 3) break;
    if (!topo.some((a) => a.id === artigo.id)) topo.push(artigo);
  }
  const ultimos = recentes.artigos
    .filter((a) => !topo.some((t) => t.id === a.id))
    .slice(0, 8);

  const [secoes, agenda] = await Promise.all([
    categoriasEmDestaque(categorias, idioma),
    semana().catch(() => []),
  ]);

  return { topo, ultimos, maisLidos, secoes, agenda };
}

const VAZIO = {
  topo: [] as ResumoDeArtigo[],
  ultimos: [] as ResumoDeArtigo[],
  maisLidos: [] as ResumoDeArtigo[],
  secoes: [] as Array<{
    categoria: CategoriaDoBlog;
    artigos: ResumoDeArtigo[];
  }>,
  agenda: [] as CalendarEventData[],
};

export default async function InicioDoBlog({ params }: Props) {
  const idioma = await routeLanguage(params);
  const t = BLOG[idioma];
  const { topo, ultimos, maisLidos, secoes, agenda } =
    await tolerarApiForaNoBuild(() => carregar(idioma), VAZIO, 'blog: início');

  const [principal, ...laterais] = topo;

  return (
    <>
      <JsonLd dados={jsonLdDoBlog(idioma, [...topo, ...ultimos])} />
      <h1 className="sr-only">{t.inicio.h1}</h1>

      {principal && (
        // Celular e tablet: as principais num carrossel, como as outras
        // prateleiras do blog (24/10; antes eram uma embaixo da outra).
        <section
          aria-label={t.inicio.destaques}
          className="entra pt-6 lg:hidden"
        >
          <Carrossel
            sempre
            largura="min(86vw,26rem)"
            rotulo={t.inicio.destaques}
            idioma={idioma}
            cabecalho={null}
            className="[&>div:nth-child(2)]:mt-0"
          >
            {topo.map((artigo, i) => (
              <div role="listitem" key={artigo.id} className="snap-start">
                <Peca artigo={artigo} idioma={idioma} prioridade={i === 0} />
              </div>
            ))}
          </Carrossel>
        </section>
      )}

      {principal ? (
        <section
          aria-label={t.inicio.destaques}
          className={cx(PAGINA, 'pt-6 max-lg:hidden lg:pt-6')}
        >
          <div
            className={cx(
              'entra grid gap-10 lg:gap-3',
              laterais.length > 0 &&
                'lg:h-[min(74dvh,660px)] lg:grid-cols-12 lg:grid-rows-2'
            )}
          >
            <Peca
              artigo={principal}
              idioma={idioma}
              grande
              prioridade
              className={cx(
                laterais.length > 0
                  ? 'lg:col-span-7 lg:row-span-2'
                  : 'lg:min-h-[min(64dvh,560px)]'
              )}
            />
            {laterais.map((artigo, i) => (
              <Peca
                key={artigo.id}
                artigo={artigo}
                idioma={idioma}
                // On phones the first one is above the fold too.
                prioridade={i === 0}
                className={cx(
                  'lg:col-span-5',
                  laterais.length === 1 && 'lg:row-span-2'
                )}
              />
            ))}
          </div>
        </section>
      ) : (
        <div className={cx(PAGINA, 'py-24')}>
          <Vazio titulo={t.inicio.vazio} />
        </div>
      )}

      {ultimos.length > 0 && (
        <section aria-labelledby="ultimos" className="mt-16 lg:mt-20">
          {/* Carrossel no computador e no telefone (01/10: no telefone eram
              linhas com miniatura, do esboço A). */}
          <Carrossel
            sempre
            largura="min(72vw,17.5rem)"
            rotulo={t.inicio.ultimos}
            idioma={idioma}
            cabecalho={
              <TituloDeSecao
                id="ultimos"
                href={rotasDoBlog.artigos(idioma)}
                rotuloDoLink={t.inicio.todos}
              >
                {t.inicio.ultimos}
              </TituloDeSecao>
            }
          >
            {ultimos.map((artigo) => (
              <div role="listitem" key={artigo.id} className="lg:snap-start">
                <CartaoDaPrateleira artigo={artigo} idioma={idioma} vertical />
              </div>
            ))}
          </Carrossel>
        </section>
      )}

      <div
        className={cx(
          PAGINA,
          'mt-16 grid gap-x-12 gap-y-16 lg:mt-20 lg:grid-cols-12'
        )}
      >
        <div className="flex min-w-0 flex-col gap-20 lg:col-span-8">
          {secoes.map(({ categoria, artigos }) => (
            <DestaqueDaCategoria
              key={categoria.id}
              categoria={categoria}
              artigos={artigos}
              idioma={idioma}
            />
          ))}
          {secoes.length === 0 && maisLidos.length > 0 && (
            <MaisLidos
              artigos={maisLidos}
              idioma={idioma}
              id="mais-lidos-topo"
            />
          )}
        </div>
        <aside className="max-lg:order-first lg:col-span-4">
          <AgendaDaSemana
            eventos={agenda}
            idioma={idioma}
            className="lg:sticky lg:top-24"
          />
        </aside>
      </div>

      {secoes.length > 0 && maisLidos.length > 0 && (
        <div
          className={cx(PAGINA, 'mt-24 grid gap-x-12 gap-y-14 lg:grid-cols-12')}
        >
          <MaisLidos
            artigos={maisLidos}
            idioma={idioma}
            comResumo
            className="lg:col-span-8"
          />
          <aside
            aria-labelledby="newsletter-inicio"
            className="flex flex-col gap-4 lg:col-span-4 lg:pt-14"
          >
            <h2 id="newsletter-inicio" className="t-subtitulo">
              {t.newsletter.titulo}
            </h2>
            <p className="t-rotulo text-texto-suave">{t.newsletter.texto}</p>
            <Newsletter idioma={idioma} origem="blog-inicio" empilhado />
          </aside>
        </div>
      )}
    </>
  );
}
