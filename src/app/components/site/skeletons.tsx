import { AreaCarregando } from '@/app/components/ui/Skeleton';
import { cx } from '@/app/components/ui/cx';

/**
 * Loading shapes for the redesigned main pages. Each one copies the page's
 * container, column counts and block sizes, so nothing jumps when the real
 * content arrives. Surfaces only; the shimmer stops with reduced motion.
 */

/** One block of the shape; size and corners come from the caller. */
function Skeleton({ className }: { className: string }) {
  return (
    <span
      aria-hidden="true"
      className={cx(
        'loading-skeleton block',
        !/\brounded/.test(className) && 'rounded-[6px]',
        className
      )}
    />
  );
}

function ListHeroBones() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-[clamp(3rem,8vw,6rem)] w-[min(32rem,80%)] rounded-controle" />
      <Skeleton className="h-5 w-[min(36rem,90%)]" />
    </div>
  );
}

function ControlsBones({ filters }: { filters: number }) {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-14 w-full rounded-full" />
      <div className="flex flex-wrap items-center gap-2">
        {Array.from({ length: filters }, (_, i) => (
          <Skeleton key={i} className="h-10 w-40 rounded-full" />
        ))}
        <Skeleton className="ml-auto h-10 w-24 rounded-full" />
      </div>
    </div>
  );
}

/** Composers: portrait cards five across; rows on phones. */
export function ComposersSkeleton({ label }: { label: string }) {
  return (
    <AreaCarregando rotulo={label}>
      <div className="section-wrap flex flex-col gap-8 py-12">
        <ListHeroBones />
        <ControlsBones filters={3} />
        <ul className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-5 max-sm:grid-cols-1 max-sm:gap-y-4">
          {Array.from({ length: 10 }, (_, i) => (
            <li
              key={i}
              className="flex flex-col gap-3 max-sm:flex-row max-sm:items-center max-sm:gap-4"
            >
              <Skeleton className="aspect-[4/5] w-full rounded-card max-sm:aspect-square max-sm:h-14 max-sm:w-14 max-sm:rounded-full" />
              <span className="flex flex-col gap-2 max-sm:flex-1">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </span>
            </li>
          ))}
        </ul>
      </div>
    </AreaCarregando>
  );
}

/** Works: cards three across; rows on phones. */
export function WorksSkeleton({ label }: { label: string }) {
  return (
    <AreaCarregando rotulo={label}>
      <div className="section-wrap flex flex-col gap-8 py-12">
        <ListHeroBones />
        <ControlsBones filters={4} />
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }, (_, i) => (
            <li
              key={i}
              className="flex flex-col gap-2 rounded-card bg-sup-2 p-5 max-sm:flex-row max-sm:items-center max-sm:gap-4 max-sm:bg-none max-sm:px-0"
            >
              <Skeleton className="hidden h-12 w-12 shrink-0 rounded-full max-sm:block" />
              <span className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-6 w-4/5" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="mt-4 h-3 w-1/3 max-sm:hidden" />
              </span>
            </li>
          ))}
        </ul>
      </div>
    </AreaCarregando>
  );
}

/** Home: the hero (copy and search beside the atlas) and the popular row. */
export function HomeSkeleton({ label }: { label: string }) {
  return (
    <AreaCarregando rotulo={label}>
      <div className="section-wrap grid grid-cols-1 items-center gap-10 py-16 md:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] md:py-12 lg:gap-12">
        <div className="flex flex-col gap-6 max-md:items-center">
          <span className="flex w-full flex-col gap-3 max-md:items-center">
            <Skeleton className="h-14 w-[min(26rem,90%)] rounded-controle" />
            <Skeleton className="h-14 w-[min(20rem,70%)] rounded-controle" />
          </span>
          <span className="flex w-full max-w-[52ch] flex-col gap-2.5 max-md:items-center">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-11/12" />
            <Skeleton className="h-4 w-2/3" />
          </span>
          <span className="flex w-full max-w-xl flex-col gap-4 max-md:items-center">
            <Skeleton className="h-14 w-full rounded-full" />
            <span className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Skeleton className="h-11 w-full rounded-controle sm:w-48" />
              <Skeleton className="h-11 w-full rounded-controle sm:w-52" />
            </span>
            <Skeleton className="h-4 w-44" />
          </span>
        </div>
        <Skeleton className="aspect-square w-full rounded-full max-md:hidden" />
      </div>
      <div className="section-wrap flex flex-col gap-6 py-12">
        <Skeleton className="h-10 w-72 rounded-controle" />
        <div className="flex gap-5 overflow-hidden">
          {Array.from({ length: 6 }, (_, i) => (
            <span key={i} className="flex w-[11rem] shrink-0 flex-col gap-3">
              <Skeleton className="aspect-[4/5] w-full rounded-card" />
              <Skeleton className="h-5 w-3/4" />
            </span>
          ))}
        </div>
      </div>
    </AreaCarregando>
  );
}
