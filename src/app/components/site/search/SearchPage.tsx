import { PiArrowRight, PiMagnifyingGlass } from 'react-icons/pi';
import Link from '@/app/components/LocalizedLink';
import { Button } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import { cx } from '@/app/components/ui/cx';
import type { Idioma } from '@/app/conteudo/legal/tipos';
import { SEARCH } from '@/app/conteudo/site/search';
import { toArticlePreview } from '@/app/requests/blog/composer-articles';
import { listComposers, listWorks } from '@/app/requests/catalog-lists';
import { searchSite } from '@/app/requests/site-search';
import { localizeHref } from '@/app/utils/localizedRoutes';
import { rotasDoBlog } from '@/app/utils/blog/rotas';
import { ArticleCards } from '../composer/FurtherReading';
import { ComposerItem } from '../lists/ComposerItem';
import { WorkItem } from '../lists/WorkItem';

const WORKS_SHOWN = 8;
const COMPOSERS_SHOWN = 4;
const ARTICLES_SHOWN = 6;
const textLink =
  'underline decoration-transparent underline-offset-4 hover:decoration-[var(--ouro)]';

/**
 * "Resultados para…": works lead, composers and articles beside them. Each
 * group links to its full, paginated list (the lists search the same way),
 * so this page never has to paginate three things at once.
 */
export async function SearchPage({
  language,
  q,
}: {
  language: Idioma;
  q: string;
}) {
  const copy = SEARCH[language];
  const fmt = (n: number) =>
    n.toLocaleString(language === 'pt' ? 'pt-BR' : 'en-US');
  const ready = q.length >= 2;

  const [works, composers, site] = ready
    ? await Promise.all([
        listWorks({ page: 1, sort: 'title', search: q }),
        listComposers({ page: 1, sort: 'featured', search: q }),
        searchSite(q, ARTICLES_SHOWN).catch(() => null),
      ])
    : [null, null, null];
  const articles = (site?.articles ?? []).map(toArticlePreview);
  const empty = ready && !works?.total && !composers?.total && !articles.length;
  const encoded = encodeURIComponent(q);
  const tabs = [
    { label: copy.tabs.all, href: null },
    {
      label: copy.tabs.works,
      href: `/works?search=${encoded}`,
      n: works?.total,
    },
    {
      label: copy.tabs.composers,
      href: `/composers?search=${encoded}`,
      n: composers?.total,
    },
    { label: copy.tabs.articles, href: rotasDoBlog.busca(q) },
  ];

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
          {tabs.map((tab) =>
            tab.href ? (
              <Link
                key={tab.label}
                href={tab.href}
                className="inline-flex min-h-10 shrink-0 items-center rounded-full bg-sup-2 px-4 text-[0.9375rem] text-texto-suave hover:text-texto"
              >
                {tab.label}
                {tab.n ? (
                  <span className="t-dado ml-2 text-[0.8125rem] text-texto-fraco">
                    {fmt(tab.n)}
                  </span>
                ) : null}
              </Link>
            ) : (
              <span
                key={tab.label}
                aria-current="page"
                className="inline-flex min-h-10 shrink-0 items-center rounded-full tint-ouro px-4 text-[0.9375rem] text-ouro-na-tinta"
              >
                {tab.label}
              </span>
            )
          )}
        </nav>
      )}

      {empty && (
        <div className="flex flex-col items-start gap-2 rounded-card bg-sup-2 p-8">
          <p className="font-display text-[1.5rem]">{copy.none(q)}</p>
          <p className="t-rotulo text-texto-suave">{copy.noneText}</p>
        </div>
      )}

      {ready && !empty && (
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,8fr)_minmax(0,4fr)]">
          <section
            className={cx(
              'flex flex-col gap-3',
              !works?.total && 'max-lg:hidden'
            )}
          >
            <h2 className="t-subtitulo">{copy.works}</h2>
            {works && works.total > 0 && (
              <>
                <ul
                  data-view="list"
                  className="flex flex-col divide-y divide-[var(--linha)]"
                >
                  {works.works.slice(0, WORKS_SHOWN).map((work) => (
                    <WorkItem key={work.id} work={work} language={language} />
                  ))}
                </ul>
                {works.total > WORKS_SHOWN && (
                  <Link
                    href={`/works?search=${encoded}`}
                    className={cx(
                      'inline-flex items-center gap-1.5 self-start t-rotulo text-ouro-texto',
                      textLink
                    )}
                  >
                    {copy.seeAllWorks(fmt(works.total))}{' '}
                    <Icon de={PiArrowRight} tamanho="pp" />
                  </Link>
                )}
              </>
            )}
          </section>
          <aside className="flex flex-col gap-10">
            {composers && composers.total > 0 && (
              <section className="flex flex-col gap-3">
                <h2 className="t-legenda">{copy.composers}</h2>
                <ul
                  data-view="list"
                  className="flex flex-col divide-y divide-[var(--linha)]"
                >
                  {composers.composers
                    .slice(0, COMPOSERS_SHOWN)
                    .map((composer) => (
                      <ComposerItem
                        key={composer.id}
                        composer={composer}
                        language={language}
                      />
                    ))}
                </ul>
                {composers.total > COMPOSERS_SHOWN && (
                  <Link
                    href={`/composers?search=${encoded}`}
                    className={cx(
                      'inline-flex items-center gap-1.5 self-start t-rotulo text-ouro-texto',
                      textLink
                    )}
                  >
                    {copy.seeAllComposers(fmt(composers.total))}{' '}
                    <Icon de={PiArrowRight} tamanho="pp" />
                  </Link>
                )}
              </section>
            )}
            {articles.length > 0 && (
              <section className="flex flex-col gap-3 [&_ul]:grid-cols-1!">
                <h2 className="t-legenda">{copy.articles}</h2>
                <ArticleCards articles={articles} />
                <Link
                  href={rotasDoBlog.busca(q)}
                  className={cx(
                    'inline-flex items-center gap-1.5 self-start t-rotulo text-ouro-texto',
                    textLink
                  )}
                >
                  {copy.moreArticles} <Icon de={PiArrowRight} tamanho="pp" />
                </Link>
              </section>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}
