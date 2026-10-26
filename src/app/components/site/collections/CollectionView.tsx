'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { PiFlag, PiPencilSimple, PiStar } from 'react-icons/pi';
import Link from '@/app/components/LocalizedLink';
import { Button } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import { COLLECTIONS } from '@/app/conteudo/site/collections';
import { useRouteLanguage } from '@/app/hooks/useRouteLanguage';
import { useSignInGate } from '@/app/hooks/useSignInGate';
import { useSession } from '@/app/libs/session';
import {
  type CollectionDetail,
  featureCollection,
} from '@/app/requests/collections';
import { localizeHref } from '@/app/utils/localizedRoutes';
import { isAdmin } from '@/app/utils/permissions';
import { SITE_URL } from '@/app/utils/seoAlternates';
import { FavoriteHeart } from '../FavoriteHeart';
import { Portrait } from '../Portrait';
import { ReportSheet } from '../ReportButton';
import { ShareAction } from '../ShareAction';
import { relativeTime } from '../relativeTime';
import { collectionHref } from './CollectionCard';
import { CollectionEditor } from './CollectionEditor';
import {
  CollectionHeart,
  entryDetail,
  entryHref,
  entryTitle,
  Faces,
  KIND_ICON,
} from './pieces';

/**
 * A collection page (sketch A): the title like a magazine cover, who made
 * it and who sees it, then the items in order with their notes. Owner
 * actions are decided in the browser, so the public page stays cached.
 */
export function CollectionView({ initial }: { initial: CollectionDetail }) {
  const { language } = useRouteLanguage();
  const copy = COLLECTIONS[language];
  const router = useRouter();
  const { data: session } = useSession();
  const allowed = useSignInGate();
  const [c, setC] = useState(initial);
  const [count, setCount] = useState(initial.favoritesCount);
  const [editing, setEditing] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [featured, setFeatured] = useState(initial.featuredOnHome);
  const mine = c.mine || session?.user?.id === c.owner.id;
  const admin = isAdmin(session?.user);
  const plural = copy.kinds[c.kind].plural;
  const url = `${SITE_URL}${localizeHref(collectionHref(c), language)}`;

  const toggleFeatured = async () => {
    const result = await featureCollection(c.id, !featured).catch(() => null);
    if (!result?.ok) return toast.error(result?.error ?? '');
    setFeatured(result.data.featuredOnHome);
    toast.success(copy.feature.done(result.data.featuredOnHome));
  };

  return (
    <div className="section-wrap flex flex-col gap-12 py-12">
      <header className="grid grid-cols-1 gap-8 md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] md:items-end">
        <div className="flex flex-col gap-4">
          <h1 className="font-display text-[clamp(2.75rem,7vw,5rem)] leading-[0.95]">
            {c.title}
          </h1>
          {c.description && (
            <p className="t-corpo max-w-[56ch] whitespace-pre-line text-texto-suave">
              {c.description}
            </p>
          )}
          <span
            suppressHydrationWarning
            className="t-rotulo inline-flex flex-wrap items-center gap-x-2 gap-y-1 text-texto-suave"
          >
            <Icon de={KIND_ICON[c.kind]} tamanho="p" />
            {plural} · {c.isPublic ? copy.public : copy.private} · {copy.by}{' '}
            <span className="text-texto">{c.owner.name}</span> ·{' '}
            {copy.updated(relativeTime(c.updatedAt, language))}
          </span>
          {c.held && mine && <span className="t-legenda">{copy.held}</span>}
        </div>
        <div className="flex flex-col items-start gap-4 md:items-end">
          <Faces faces={c.faces} size="h-12 w-12" />
          <div className="flex flex-wrap gap-2">
            {!mine && c.isPublic && (
              <CollectionHeart
                id={c.id}
                title={c.title}
                initial={c.favorited}
                onChange={(_, n) => setCount(n)}
                className="!h-11 !w-11 bg-sup-2"
              />
            )}
            {c.isPublic && (
              <ShareAction
                title={copy.shareTitle(c.title)}
                url={url}
                image={c.faces[0]?.portraitUrl}
                imageName={c.title}
              />
            )}
            {mine && (
              <Button icone={PiPencilSimple} onClick={() => setEditing(true)}>
                {copy.edit}
              </Button>
            )}
            {admin && c.isPublic && (
              <Button icone={PiStar} onClick={() => void toggleFeatured()}>
                {featured ? copy.feature.off : copy.feature.on}
              </Button>
            )}
            {!mine && (
              <Button
                icone={PiFlag}
                rotulo={copy.report}
                onClick={() => allowed('report') && setReporting(true)}
              />
            )}
          </div>
          <span className="t-legenda">
            {copy.favorites(count)} · {copy.items(c.items.length, plural)}
          </span>
        </div>
      </header>

      <ol className="flex flex-col divide-y divide-[var(--linha)]">
        {c.items.map((item, i) => {
          const href = entryHref(c.kind, item);
          const title = entryTitle(c.kind, item);
          const body = (
            <>
              {c.kind === 'COMPOSER' ? (
                <Portrait
                  name={item.composerName ?? item.title}
                  src={item.portraitUrl}
                  sizes="48px"
                  className="h-12 w-12 shrink-0 rounded-full"
                />
              ) : (
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-controle bg-sup-2 text-texto-suave">
                  <Icon de={KIND_ICON[c.kind]} tamanho="m" />
                </span>
              )}
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="font-display text-[1.375rem] leading-snug group-hover:text-ouro-texto">
                  {title}
                </span>
                <span className="t-rotulo text-texto-suave">
                  {entryDetail(c.kind, item, copy, language)}
                </span>
                {item.note && (
                  <span className="mt-1 font-display text-[1.0625rem] italic text-texto-suave">
                    “{item.note}”
                  </span>
                )}
              </span>
            </>
          );
          return (
            <li
              key={item.refId}
              // The row is the card of the page it opens (a score's is its
              // work's): it turns into that page's header and darkens with
              // the loading ring in its middle, as in every list
              // (`CartoesQueViram`).
              data-vira={
                c.kind === 'COMPOSER'
                  ? `compositor-${item.refId}`
                  : c.kind === 'WORK'
                    ? `obra-${item.refId}`
                    : item.workId
                      ? `obra-${item.workId}`
                      : undefined
              }
              className="relative grid grid-cols-[2.5rem_minmax(0,1fr)_auto] items-start gap-4 rounded-card py-5"
            >
              <span className="font-display text-[1.75rem] leading-none text-texto-fraco">
                {i + 1}
              </span>
              {href ? (
                <Link
                  href={href}
                  className="group flex min-w-0 items-start gap-4"
                >
                  {body}
                </Link>
              ) : (
                <span className="flex min-w-0 items-start gap-4">{body}</span>
              )}
              {c.kind !== 'SCORE' && (
                <FavoriteHeart
                  type={c.kind === 'COMPOSER' ? 'composer' : 'work'}
                  id={item.refId}
                  name={title}
                />
              )}
            </li>
          );
        })}
      </ol>

      {mine && (
        <CollectionEditor
          open={editing}
          editing={c}
          onClose={() => setEditing(false)}
          onSaved={(saved) => {
            setC(saved);
            if (saved.isPublic !== c.isPublic)
              router.replace(collectionHref(saved));
          }}
          onDeleted={() => router.push('/my-collections')}
        />
      )}
      <ReportSheet
        entityType="collection"
        entityId={c.id}
        name={c.title}
        open={reporting}
        onClose={() => setReporting(false)}
      />
    </div>
  );
}
