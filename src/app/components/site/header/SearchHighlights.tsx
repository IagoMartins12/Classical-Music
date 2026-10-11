'use client';

import { useQuery } from '@tanstack/react-query';
import {
  PiArrowRight,
  PiBooks,
  PiCake,
  PiGuitar,
  PiMusicNotes,
} from 'react-icons/pi';
import Link from '@/app/components/LocalizedLink';
import { Icon } from '@/app/components/ui/Icon';
import type { HeaderCopy } from '@/app/conteudo/site/header';
import { catalogApi } from '@/app/libs/api/catalog';
import { Portrait } from '../Portrait';

const FEATURED = 8;

/**
 * What the search sheet shows before anything is typed: a row of featured
 * composers and a few shortcuts into the site.
 */
export function SearchHighlights({
  copy,
  onNavigate,
}: {
  copy: HeaderCopy['search'];
  onNavigate?: () => void;
}) {
  const famous = useQuery({
    queryKey: ['search', 'famous'],
    queryFn: catalogApi.famousComposers,
    staleTime: 60 * 60_000,
  });
  const links = [
    { href: '/on-this-day', label: copy.links.onThisDay, icon: PiCake },
    { href: '/music-history', label: copy.links.history, icon: PiBooks },
    { href: '/instruments', label: copy.links.instruments, icon: PiGuitar },
    {
      href: '/works?level=BEGINNER',
      label: copy.links.beginner,
      icon: PiMusicNotes,
    },
  ];

  return (
    <div className="mt-6 flex flex-col gap-6 text-left">
      <section className="flex flex-col gap-3">
        <h3 className="t-legenda">{copy.featured}</h3>
        <ul className="grid grid-cols-4 gap-x-3 gap-y-4 sm:grid-cols-8">
          {(famous.data ?? Array.from({ length: FEATURED }, () => null))
            .slice(0, FEATURED)
            .map((c, i) =>
              c ? (
                <li key={c.id}>
                  <Link
                    href={`/composer/${c.id}`}
                    onClick={onNavigate}
                    className="group flex flex-col items-center gap-2 text-center"
                  >
                    <Portrait
                      name={c.fullName ?? c.name}
                      src={c.portraitUrl}
                      sizes="56px"
                      className="h-14 w-14 rounded-full text-[1rem]"
                    />
                    <span className="t-rotulo w-full truncate group-hover:text-ouro-texto">
                      {c.name}
                    </span>
                  </Link>
                </li>
              ) : (
                <li
                  key={i}
                  className="flex flex-col items-center gap-2"
                  aria-hidden="true"
                >
                  <span className="loading-skeleton block h-14 w-14 rounded-full" />
                  <span className="loading-skeleton block h-3 w-12 rounded" />
                </li>
              )
            )}
        </ul>
      </section>
      <section className="flex flex-col gap-1">
        <h3 className="t-legenda mb-2">{copy.shortcuts}</h3>
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={onNavigate}
            className="group flex min-h-11 items-center gap-3 rounded-controle px-3 hover:bg-sup-2"
          >
            <Icon
              de={link.icon}
              className="text-texto-fraco group-hover:text-ouro-texto"
            />
            <span className="flex-1">{link.label}</span>
            <Icon de={PiArrowRight} tamanho="pp" className="text-texto-fraco" />
          </Link>
        ))}
      </section>
    </div>
  );
}
