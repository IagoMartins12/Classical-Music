'use client';

import { PiGlobeSimple, PiLockSimple, PiPencilSimple } from 'react-icons/pi';
import Link from '@/app/components/LocalizedLink';
import { Button } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import { COLLECTIONS } from '@/app/conteudo/site/collections';
import { useRouteLanguage } from '@/app/hooks/useRouteLanguage';
import type { CollectionSummary } from '@/app/requests/collections';
import { relativeTime } from '../relativeTime';
import { CollectionHeart, Faces, KIND_ICON } from './pieces';

/** Public collections live at `/collections`; private ones on your shelf. */
export const collectionHref = (c: { id: string; isPublic: boolean }) =>
  c.isPublic ? `/collections/${c.id}` : `/my-collections/${c.id}`;

/** A collection as a card: faces, kind, who sees it, title and counts. */
export function CollectionCard({
  collection: c,
  onEdit,
}: {
  collection: CollectionSummary;
  /** Yours: the pencil instead of the heart. */
  onEdit?: () => void;
}) {
  const { language } = useRouteLanguage();
  const copy = COLLECTIONS[language];
  return (
    <li className="flex flex-col gap-4 rounded-card bg-sup-2 p-5">
      <div className="flex items-start gap-4">
        <Faces faces={c.faces} />
        <span className="t-legenda ml-auto inline-flex items-center gap-1.5">
          <Icon de={KIND_ICON[c.kind]} tamanho="pp" />
          {copy.kinds[c.kind].plural}
          <span aria-hidden="true">·</span>
          <Icon de={c.isPublic ? PiGlobeSimple : PiLockSimple} tamanho="pp" />
          {c.isPublic ? copy.publicLabel : copy.privateLabel}
          {c.held && (
            <Icon
              de={PiLockSimple}
              tamanho="pp"
              rotulo={copy.held}
              className="text-texto-fraco"
            />
          )}
        </span>
      </div>
      <Link href={collectionHref(c)} className="group flex flex-col gap-1">
        <span className="font-display text-[1.375rem] leading-snug group-hover:text-ouro-texto">
          {c.title}
        </span>
        {c.description && (
          <span className="t-rotulo line-clamp-2 text-texto-suave">
            {c.description}
          </span>
        )}
      </Link>
      <div className="mt-auto flex items-center justify-between gap-3">
        {/* Relative time: the server and the browser may round differently. */}
        <span className="t-legenda" suppressHydrationWarning>
          {c.owner.name} · {copy.favoritedShort(c.favoritesCount)} ·{' '}
          {copy.updated(relativeTime(c.updatedAt, language))}
        </span>
        {onEdit ? (
          <Button
            tamanho="p"
            variante="fantasma"
            icone={PiPencilSimple}
            rotulo={copy.editCollection}
            onClick={onEdit}
          />
        ) : (
          !c.mine && (
            <CollectionHeart id={c.id} title={c.title} initial={c.favorited} />
          )
        )}
      </div>
    </li>
  );
}
