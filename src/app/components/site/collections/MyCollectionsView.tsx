'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { PiPlus } from 'react-icons/pi';
import { Aba, Abas } from '@/app/components/ui/Abas';
import { Button } from '@/app/components/ui/Button';
import { COLLECTIONS } from '@/app/conteudo/site/collections';
import { useAuth } from '@/app/hooks/useAuth';
import { useRouteLanguage } from '@/app/hooks/useRouteLanguage';
import {
  type CollectionDetail,
  fetchCollection,
  myCollections,
} from '@/app/requests/collections';
import { CollectionCard } from './CollectionCard';
import { CollectionEditor } from './CollectionEditor';
import { CollectionView } from './CollectionView';

export const MY_COLLECTIONS_KEY = ['collections', 'mine'] as const;

/** "Coleções" on the personal pages: yours and the ones you favorited. */
export function MyCollectionsView() {
  const { language } = useRouteLanguage();
  const copy = COLLECTIONS[language];
  const { user } = useAuth();
  const client = useQueryClient();
  const list = useQuery({
    queryKey: MY_COLLECTIONS_KEY,
    queryFn: myCollections,
  });
  const [tab, setTab] = useState<'mine' | 'favorites'>('mine');
  const [editor, setEditor] = useState<CollectionDetail | 'new' | null>(null);
  const mine = list.data?.mine ?? [];
  const favorites = list.data?.favorites ?? [];
  const shown = tab === 'mine' ? mine : favorites;
  const refresh = () =>
    client.invalidateQueries({ queryKey: MY_COLLECTIONS_KEY });

  const edit = async (id: string) => {
    const detail = await fetchCollection(id).catch(() => null);
    if (detail) setEditor(detail);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Abas rotulo={copy.mine.tabs}>
          <Aba ativa={tab === 'mine'} onClick={() => setTab('mine')}>
            {copy.mine.mine(mine.length)}
          </Aba>
          <Aba ativa={tab === 'favorites'} onClick={() => setTab('favorites')}>
            {copy.mine.favorites(favorites.length)}
          </Aba>
        </Abas>
        <Button
          variante="primario"
          icone={PiPlus}
          onClick={() =>
            user?.emailVerified ? setEditor('new') : toast(copy.mine.verify)
          }
        >
          {copy.mine.create}
        </Button>
      </div>

      {list.isPending ? (
        <ul
          className="grid grid-cols-1 gap-3 md:grid-cols-2"
          aria-hidden="true"
        >
          {[0, 1].map((i) => (
            <li key={i} className="loading-skeleton h-44 rounded-card" />
          ))}
        </ul>
      ) : shown.length ? (
        <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {shown.map((c) => (
            <CollectionCard
              key={c.id}
              collection={c}
              onEdit={tab === 'mine' ? () => void edit(c.id) : undefined}
            />
          ))}
        </ul>
      ) : (
        <p className="t-rotulo rounded-card bg-sup-2 p-6 text-texto-suave">
          {tab === 'mine' ? copy.mine.emptyMine : copy.mine.emptyFavorites}
        </p>
      )}

      <CollectionEditor
        open={!!editor}
        editing={editor === 'new' ? null : editor}
        onClose={() => setEditor(null)}
        onSaved={() => void refresh()}
        onDeleted={() => void refresh()}
      />
    </div>
  );
}

/** The favorited collections, for the "Coleções" tab of the favorites page. */
export function FavoriteCollections() {
  const copy = COLLECTIONS[useRouteLanguage().language];
  const list = useQuery({
    queryKey: MY_COLLECTIONS_KEY,
    queryFn: myCollections,
  });
  const favorites = list.data?.favorites ?? [];
  if (list.isPending) return null;
  return favorites.length ? (
    <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {favorites.map((c) => (
        <CollectionCard key={c.id} collection={c} />
      ))}
    </ul>
  ) : (
    <p className="t-rotulo rounded-card bg-sup-2 p-6 text-texto-suave">
      {copy.mine.emptyFavorites}
    </p>
  );
}

/** A private collection, read with the session (its own page on your shelf). */
export function PrivateCollection({ id }: { id: string }) {
  const copy = COLLECTIONS[useRouteLanguage().language];
  const detail = useQuery({
    queryKey: ['collections', 'detail', id],
    queryFn: () => fetchCollection(id),
    retry: false,
  });
  if (detail.isPending)
    return (
      <div className="section-wrap loading-skeleton my-12 h-72 rounded-card" />
    );
  if (!detail.data)
    return (
      <p className="section-wrap t-corpo py-16 text-texto-suave">
        {copy.notFound}
      </p>
    );
  return <CollectionView initial={detail.data} />;
}
