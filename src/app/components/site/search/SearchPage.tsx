import type { ReactNode } from 'react';
import { PiArrowRight, PiMagnifyingGlass } from 'react-icons/pi';
import Link from '@/app/components/LocalizedLink';
import { Button, classesDeBotao } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import { cx } from '@/app/components/ui/cx';
import type { Idioma } from '@/app/conteudo/legal/tipos';
import { SEARCH } from '@/app/conteudo/site/search';
import type { BlogArticlePreview } from '@/app/requests/blog/composer-articles';
import {
  buscarArtigos,
  type ResumoDeArtigo,
} from '@/app/requests/blog/leitura';
import { listComposers, listWorks } from '@/app/requests/catalog-lists';
import { localizeHref } from '@/app/utils/localizedRoutes';
import { ArticleCards } from '../composer/FurtherReading';
import { ComposerItem } from '../lists/ComposerItem';
import { WorkItem } from '../lists/WorkItem';

export const SEARCH_TABS = ['all', 'works', 'composers', 'articles'] as const;
export type SearchTab = (typeof SEARCH_TABS)[number];

const WORKS_SHOWN = 8;
const COMPOSERS_SHOWN = 4;
const ARTICLES_SHOWN = 6;
/** "Load all" reads every page at once: past this many, a sharper search. */
const MAX_PAGES = 10;
const textLink =
  'underline decoration-transparent underline-offset-4 hover:decoration-[var(--ouro)]';

const range = (pages: number) => Array.from({ length: pages }, (_, i) => i + 1);

const toPreview = (a: ResumoDeArtigo): BlogArticlePreview => ({
  id: a.id,
  title: a.titulo,
  slug: a.slug,
  coverImage: a.capa ?? undefined,
  publishedAt: a.publicadoEm ? new Date(a.publicadoEm) : null,
  readTime: a.minutos || undefined,
  authorName: a.autor.nome || undefined,
  authorImage: a.autor.imagem ?? undefined,
});

/**
 * "Resultados para…". "All" shows works first, composers and articles
 * beside them; each tab lists one kind in full, here, with "Load more" and
 * "Load all" — the search never sends the visitor to another list.
 * `pages` is how many pages the open tab shows.
 */
export async function SearchPage({
  language,
  q,
  tab,
  pages,
}: {
  language: Idioma;
  q: string;
  tab: SearchTab;
  pages: number;
}) {
  const copy = SEARCH[language];
  const fmt = (n: number) =>
    n.toLocaleString(language === 'pt' ? 'pt-BR' : 'en-US');
  const ready = q.length >= 2;
  const shown = Math.min(Math.max(pages, 1), MAX_PAGES);
  const pagesOf = (kind: SearchTab) => range(tab === kind ? shown : 1);

  const [works, composers, articles] = ready
    ? await Promise.all([
        Promise.all(
          pagesOf('works').map((page) =>
            listWorks({ page, sort: 'title', search: q })
          )
        ),
        Promise.all(
          pagesOf('composers').map((page) =>
            listComposers({ page, sort: 'featured', search: q })
          )
        ),
        Promise.all(
          pagesOf('articles').map((pagina) =>
            buscarArtigos({ q, pagina, idioma: language })
          )
        ).catch(() => null),
      ])
    : [null, null, null];

  const found = {
    works: works?.flatMap((p) => p.works) ?? [],
    composers: composers?.flatMap((p) => p.composers) ?? [],
    articles: articles?.flatMap((p) => p.artigos.map(toPreview)) ?? [],
  };
  const totals = {
    works: works?.[0]?.total ?? 0,
    composers: composers?.[0]?.total ?? 0,
    articles: articles?.[0]?.paginacao.total ?? 0,
  };
  const lastPage = {
    works: works?.[0]?.pages ?? 1,
    composers: composers?.[0]?.pages ?? 1,
    articles: articles?.[0]?.paginacao.paginas ?? 1,
  };
  const empty = ready && !totals.works && !totals.composers && !totals.articles;

  const href = (next: SearchTab, more?: number) => {
    const params = new URLSearchParams({ q });
    if (next !== 'all') params.set('tab', next);
    if (more && more > 1) params.set('pages', String(more));
    return `/search?${params}`;
  };
  const tabs: { key: SearchTab; label: string; n?: number }[] = [
    { key: 'all', label: copy.tabs.all },
    { key: 'works', label: copy.tabs.works, n: totals.works },
    { key: 'composers', label: copy.tabs.composers, n: totals.composers },
    { key: 'articles', label: copy.tabs.articles, n: totals.articles },
  ];

  const seeAll = (kind: Exclude<SearchTab, 'all'>, label: string) => (
    <Link
      href={href(kind)}
      scroll={false}
      className={cx(
        'inline-flex items-center gap-1.5 self-start t-rotulo text-ouro-texto',
        textLink
      )}
    >
      {label} <Icon de={PiArrowRight} tamanho="pp" />
    </Link>
  );

  /** The open tab's foot: how many are shown, and the way to more. */
  const more = (kind: Exclude<SearchTab, 'all'>, count: number) => {
    const total = totals[kind];
    const hasMore = count < total && shown < lastPage[kind];
    const all = Math.min(lastPage[kind], MAX_PAGES);
    return (
      <div className="flex flex-col items-center gap-3 border-t border-[var(--linha)] pt-6">
        <span className="t-dado text-[0.8125rem] text-texto-suave">
          {copy.showing(fmt(count), fmt(total))}
        </span>
        {hasMore && (
          <div className="flex flex-wrap justify-center gap-2">
            <Link
              href={href(kind, shown + 1)}
              scroll={false}
              className={classesDeBotao('secundario')}
            >
              {copy.loadMore}
            </Link>
            {all > shown + 1 && (
              <Link
                href={href(kind, all)}
                scroll={false}
                className={classesDeBotao('fantasma')}
              >
                {copy.loadAll}
              </Link>
            )}
          </div>
        )}
        {count < total && !hasMore && (
          <p className="t-rotulo text-texto-suave">{copy.narrow}</p>
        )}
      </div>
    );
  };

  const list = (children: ReactNode) => (
    <ul
      data-view="list"
      className="cascata flex flex-col divide-y divide-[var(--linha)]"
    >
      {children}
    </ul>
  );

  return (
    <div className="section-wrap flex flex-col gap-10 py-12">
      <div className="flex max-w-3xl flex-col gap-5">
        <form
          role="search"
          action={localizeHref('/search', language)}
          className="search-field flex min-h-14 items-center gap-3 rounded-full bg-sup-2 pl-5 pr-2"
        >
          <Icon
            de={PiMagnifyingGlass}
            tamanho="m"
            className="text-texto-fraco"
          />
          <label htmlFor="site-search" className="sr-only">
            {copy.placeholder}
          </label>
          <input
            id="site-search"
            name="q"
            type="search"
            defaultValue={q}
            minLength={2}
            maxLength={120}
            autoFocus={!ready}
            placeholder={copy.placeholder}
            className="min-w-0 flex-1 bg-transparent text-[1.0625rem] outline-none placeholder:text-texto-fraco"
          />
          {tab !== 'all' && <input type="hidden" name="tab" value={tab} />}
          <Button
            type="submit"
            variante="primario"
            tamanho="p"
            className="rounded-full"
          >
            {copy.submit}
          </Button>
        </form>
        {ready ? (
          <h1 className="rise font-display text-[clamp(2.25rem,5vw,3.75rem)] leading-tight">
            {copy.resultsFor} <span className="text-ouro-texto">“{q}”</span>
          </h1>
        ) : (
          <div className="flex flex-col gap-2">
            <h1 className="rise font-display text-[clamp(2.25rem,5vw,3.75rem)] leading-tight">
              {copy.prompt}
            </h1>
            <p className="t-corpo max-w-[56ch] text-texto-suave">
              {copy.promptText}
            </p>
          </div>
        )}
      </div>

      {ready && !empty && (
        <nav
          aria-label={copy.tabsLabel}
          className="scroll-strip -mx-4 flex gap-2 overflow-x-auto px-4"
        >
          {tabs.map((t) => {
            const active = t.key === tab;
            return (
              <Link
                key={t.key}
                href={href(t.key)}
                scroll={false}
                aria-current={active ? 'page' : undefined}
                className={cx(
                  'inline-flex min-h-10 shrink-0 items-center rounded-full px-4 text-[0.9375rem] transition-colors duration-[var(--t-toque)]',
                  active
                    ? 'tint-ouro text-ouro-na-tinta'
                    : 'bg-sup-2 text-texto-suave hover:text-texto'
                )}
              >
                {t.label}
                {t.n ? (
                  <span
                    className={cx(
                      't-dado ml-2 text-[0.8125rem]',
                      active ? 'text-ouro-na-tinta' : 'text-texto-fraco'
                    )}
                  >
                    {fmt(t.n)}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>
      )}

      {empty && (
        <div className="flex flex-col items-start gap-2 rounded-card bg-sup-2 p-8">
          <p className="font-display text-[1.5rem]">{copy.none(q)}</p>
          <p className="t-rotulo text-texto-suave">{copy.noneText}</p>
        </div>
      )}

      {ready && !empty && tab === 'all' && (
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,8fr)_minmax(0,4fr)]">
          <section
            className={cx(
              'flex flex-col gap-3',
              !totals.works && 'max-lg:hidden'
            )}
          >
            <h2 className="t-subtitulo">{copy.works}</h2>
            {totals.works > 0 && (
              <>
                {list(
                  found.works
                    .slice(0, WORKS_SHOWN)
                    .map((work) => (
                      <WorkItem key={work.id} work={work} language={language} />
                    ))
                )}
                {totals.works > WORKS_SHOWN &&
                  seeAll('works', copy.seeAllWorks(fmt(totals.works)))}
              </>
            )}
          </section>
          <aside className="flex flex-col gap-10">
            {totals.composers > 0 && (
              <section className="flex flex-col gap-3">
                <h2 className="t-legenda">{copy.composers}</h2>
                {list(
                  found.composers
                    .slice(0, COMPOSERS_SHOWN)
                    .map((composer) => (
                      <ComposerItem
                        key={composer.id}
                        composer={composer}
                        language={language}
                      />
                    ))
                )}
                {totals.composers > COMPOSERS_SHOWN &&
                  seeAll(
                    'composers',
                    copy.seeAllComposers(fmt(totals.composers))
                  )}
              </section>
            )}
            {totals.articles > 0 && (
              <section className="flex flex-col gap-3 [&_ul]:grid-cols-1!">
                <h2 className="t-legenda">{copy.articles}</h2>
                <ArticleCards
                  articles={found.articles.slice(0, ARTICLES_SHOWN)}
                />
                {totals.articles > ARTICLES_SHOWN &&
                  seeAll('articles', copy.seeAllArticles(fmt(totals.articles)))}
              </section>
            )}
          </aside>
        </div>
      )}

      {ready && !empty && tab === 'works' && (
        <section className="flex flex-col gap-3">
          <h2 className="sr-only">{copy.works}</h2>
          {list(
            found.works.map((work) => (
              <WorkItem key={work.id} work={work} language={language} />
            ))
          )}
          {more('works', found.works.length)}
        </section>
      )}

      {ready && !empty && tab === 'composers' && (
        <section className="flex flex-col gap-3">
          <h2 className="sr-only">{copy.composers}</h2>
          {list(
            found.composers.map((composer) => (
              <ComposerItem
                key={composer.id}
                composer={composer}
                language={language}
              />
            ))
          )}
          {more('composers', found.composers.length)}
        </section>
      )}

      {ready && !empty && tab === 'articles' && (
        <section className="flex flex-col gap-6">
          <h2 className="sr-only">{copy.articles}</h2>
          <ArticleCards articles={found.articles} />
          {more('articles', found.articles.length)}
        </section>
      )}
    </div>
  );
}
