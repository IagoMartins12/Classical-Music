import { PiPlus } from 'react-icons/pi';
import Link from '@/app/components/LocalizedLink';
import { Icon } from '@/app/components/ui/Icon';
import type { Idioma } from '@/app/conteudo/legal/tipos';
import { COLLECTIONS } from '@/app/conteudo/site/collections';
import type { CollectionSummary } from '@/app/requests/collections';
import { CollectionCard } from './CollectionCard';

/** `/collections`: the public ones, the team's picks first. */
export function CollectionsIndex({
  language,
  collections,
}: {
  language: Idioma;
  collections: CollectionSummary[];
}) {
  const copy = COLLECTIONS[language];
  return (
    <div className="section-wrap flex flex-col gap-10 py-12">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-3">
          <h1 className="t-titulo">{copy.title}</h1>
          <p className="t-corpo max-w-[56ch] text-texto-suave">
            {copy.subtitle}
          </p>
        </div>
        <Link
          href="/my-collections"
          className="t-rotulo inline-flex items-center gap-2 text-texto-suave underline-offset-4 hover:text-ouro-texto hover:underline"
        >
          <Icon de={PiPlus} tamanho="p" /> {copy.build}
        </Link>
      </header>
      {collections.length ? (
        <ul className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {collections.map((c) => (
            <CollectionCard key={c.id} collection={c} />
          ))}
        </ul>
      ) : (
        <p className="t-rotulo rounded-card bg-sup-2 p-6 text-texto-suave">
          {copy.empty}
        </p>
      )}
    </div>
  );
}
