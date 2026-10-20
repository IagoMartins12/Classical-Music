import { PiPlus } from 'react-icons/pi';
import Link from '@/app/components/LocalizedLink';
import { Icon } from '@/app/components/ui/Icon';
import { Revelar } from '@/app/components/ui/Revelar';
import type { Idioma } from '@/app/conteudo/legal/tipos';
import { COLLECTIONS } from '@/app/conteudo/site/collections';
import type { CollectionSummary } from '@/app/requests/collections';
import { SectionHeading } from '../SectionHeading';
import { CollectionHeart, Faces } from '../collections/pieces';

/**
 * "Coleções" on the home page: only the ones the team featured, as rows
 * (sketch `home-final.tsx`). None featured, no section.
 */
export function HomeCollections({
  language,
  collections,
}: {
  language: Idioma;
  collections: CollectionSummary[];
}) {
  if (!collections.length) return null;
  const copy = COLLECTIONS[language];
  return (
    <Revelar as="section" className="section-wrap flex flex-col gap-6 py-12">
      <SectionHeading
        title={copy.title}
        subtitle={copy.subtitle}
        action={{ label: copy.all, href: '/collections' }}
      />
      <ul className="grid grid-cols-1 divide-y divide-[var(--linha)] lg:grid-cols-2 lg:gap-x-14">
        {collections.map((c) => (
          <li key={c.id} className="flex items-center gap-2">
            <Link
              href={`/collections/${c.id}`}
              className="group flex min-w-0 flex-1 items-center gap-4 py-4"
            >
              <Faces faces={c.faces} />
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate font-display text-[1.3125rem] leading-snug group-hover:text-ouro-texto">
                  {c.title}
                </span>
                <span className="t-rotulo truncate text-texto-suave">
                  {copy.kinds[c.kind].plural} · {c.owner.name} ·{' '}
                  {copy.favoritedShort(c.favoritesCount)}
                </span>
              </span>
            </Link>
            <CollectionHeart
              id={c.id}
              title={c.title}
              initial={false}
              ownerId={c.owner.id}
            />
          </li>
        ))}
      </ul>
      <Link
        href="/my-collections"
        className="t-rotulo inline-flex items-center gap-2 self-start text-texto-suave underline-offset-4 hover:text-ouro-texto hover:underline"
      >
        <Icon de={PiPlus} tamanho="p" /> {copy.build}
      </Link>
    </Revelar>
  );
}
