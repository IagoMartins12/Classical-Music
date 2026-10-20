import { AreaCarregando, Skeleton } from '@/app/components/ui/Skeleton';

/**
 * The contact page (`ContactView`) while it loads: the heading on the left,
 * the four subjects two by two, the fields, and the channels beside them.
 */
export default function Carregando() {
  return (
    <AreaCarregando rotulo="Carregando contato">
      <div className="section-wrap pb-20 pt-8 md:pt-12">
        <div className="flex max-w-[var(--largura-texto)] flex-col gap-5">
          <Skeleton forma="bloco" className="h-12 w-[min(22rem,80%)] md:h-14" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>
        <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,7fr)_minmax(0,4fr)] lg:gap-16">
          <div className="flex flex-col gap-8">
            <Skeleton forma="bloco" className="h-7 w-40" />
            <div className="grid gap-3 sm:grid-cols-2">
              {Array.from({ length: 4 }, (_, i) => (
                <Skeleton
                  key={i}
                  forma="bloco"
                  className="h-20 w-full rounded-card"
                />
              ))}
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <Skeleton forma="bloco" className="h-11 w-full" />
              <Skeleton forma="bloco" className="h-11 w-full" />
            </div>
            <Skeleton forma="bloco" className="h-11 w-full" />
            <Skeleton forma="bloco" className="h-40 w-full" />
            <Skeleton forma="bloco" className="h-11 w-44" />
          </div>
          <div className="flex flex-col gap-4 lg:pt-14">
            <Skeleton forma="bloco" className="h-6 w-44" />
            {Array.from({ length: 3 }, (_, i) => (
              <Skeleton key={i} forma="bloco" className="h-12 w-full" />
            ))}
          </div>
        </div>
      </div>
    </AreaCarregando>
  );
}
