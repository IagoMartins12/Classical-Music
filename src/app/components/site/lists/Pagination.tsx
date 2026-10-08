import { PiArrowLeft, PiArrowRight } from 'react-icons/pi';
import Link from '@/app/components/LocalizedLink';
import { Icon } from '@/app/components/ui/Icon';
import { cx } from '@/app/components/ui/cx';
import type { ListsCopy } from '@/app/conteudo/site/lists';
import { listHref, type ListQuery } from '@/app/utils/listParams';

/** 1 … 4 5 [6] 7 8 … 120: the first, the last and two around the current. */
export function pageWindow(current: number, total: number): (number | null)[] {
  const pages = new Set([1, total]);
  for (let p = current - 2; p <= current + 2; p++)
    if (p >= 1 && p <= total) pages.add(p);
  const sorted = [...pages].sort((a, b) => a - b);
  return sorted.flatMap((p, i) =>
    i > 0 && p - sorted[i - 1] > 1 ? [null, p] : [p]
  );
}

/** Plain links, so every page of a list is reachable and indexable. */
export function Pagination({
  path,
  query,
  page,
  pages,
  copy,
}: {
  path: string;
  query: ListQuery;
  page: number;
  pages: number;
  copy: ListsCopy['common'];
}) {
  if (pages <= 1) return null;
  const href = (p: number) => listHref(path, query, { page: String(p) });
  const edge =
    'inline-flex min-h-10 items-center gap-1.5 rounded-full px-3 t-rotulo';
  return (
    <nav
      aria-label={copy.pages}
      className="flex items-center justify-between gap-3 border-t border-[var(--linha)] pt-6"
    >
      {page > 1 ? (
        <Link
          href={href(page - 1)}
          rel="prev"
          className={cx(edge, 'text-ouro-texto hover:bg-sup-2')}
        >
          <Icon de={PiArrowLeft} tamanho="pp" /> {copy.previous}
        </Link>
      ) : (
        <span className={cx(edge, 'text-texto-fraco')}>{copy.previous}</span>
      )}
      <ol className="flex items-center gap-1 max-sm:hidden">
        {pageWindow(page, pages).map((p, i) =>
          p === null ? (
            <li
              key={`gap-${i}`}
              aria-hidden="true"
              className="px-1 text-texto-fraco"
            >
              …
            </li>
          ) : (
            <li key={p}>
              <Link
                href={href(p)}
                aria-label={copy.page(p)}
                aria-current={p === page ? 'page' : undefined}
                className={cx(
                  't-dado grid h-10 min-w-10 place-items-center rounded-full px-2 text-[0.875rem]',
                  p === page
                    ? 'tint-ouro text-ouro-na-tinta'
                    : 'text-texto-suave hover:bg-sup-2'
                )}
              >
                {p}
              </Link>
            </li>
          )
        )}
      </ol>
      <span className="t-legenda sm:hidden">
        {page} / {pages}
      </span>
      {page < pages ? (
        <Link
          href={href(page + 1)}
          rel="next"
          className={cx(edge, 'text-ouro-texto hover:bg-sup-2')}
        >
          {copy.next} <Icon de={PiArrowRight} tamanho="pp" />
        </Link>
      ) : (
        <span className={cx(edge, 'text-texto-fraco')}>{copy.next}</span>
      )}
    </nav>
  );
}
