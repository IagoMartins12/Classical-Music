'use client';

import { useMemo, useState } from 'react';
import { Icon } from '@/app/components/ui/Icon';
import { PiMedal } from 'react-icons/pi';
import { PERSONAL } from '@/app/conteudo/site/personal';
import { useRouteLanguage } from '@/app/hooks/useRouteLanguage';
import { chip } from '../choice';
import { Medal } from './Medal';
import {
  Bar,
  useAchievements,
  type AchievementCategory,
} from './ProgressPanel';

type Filter = 'all' | AchievementCategory;

/**
 * "Suas conquistas", as in sketch A: the level with the XP bar, the medals
 * already won and the ones on the way (closest first), filtered by kind.
 */
export function AchievementsView() {
  const { language } = useRouteLanguage();
  const copy = PERSONAL[language].achievements;
  const locale = language === 'pt' ? 'pt-BR' : 'en-US';
  const fmt = (n: number) => n.toLocaleString(locale);
  const date = (iso: string) =>
    new Intl.DateTimeFormat(locale, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(iso));
  const { stats, list } = useAchievements();
  const [filter, setFilter] = useState<Filter>('all');

  const categories = useMemo(() => {
    const all = [...(list.data?.unlocked ?? []), ...(list.data?.locked ?? [])];
    return [...new Set(all.map((a) => a.category))];
  }, [list.data]);

  if (stats.isError || list.isError)
    return <p className="t-rotulo text-texto-suave">{copy.error}</p>;
  if (!stats.data || !list.data) {
    return (
      <div className="flex flex-col gap-10" aria-hidden="true">
        <span className="loading-skeleton block h-24 rounded-card" />
        <span className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 5 }, (_, i) => (
            <span
              key={i}
              className="loading-skeleton block h-44 rounded-card"
            />
          ))}
        </span>
        <span className="loading-skeleton block h-40 rounded-card" />
      </div>
    );
  }

  const s = stats.data;
  const keep = <T extends { category: AchievementCategory }>(a: T) =>
    filter === 'all' || a.category === filter;
  const unlocked = [...list.data.unlocked]
    .filter(keep)
    .sort((a, b) => b.unlockedAt.localeCompare(a.unlockedAt));
  const locked = [...list.data.locked]
    .filter(keep)
    .sort((a, b) => b.percentage - a.percentage);

  return (
    <div className="flex flex-col gap-10">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-[auto_minmax(0,1fr)] md:items-center">
        <span className="flex items-baseline gap-3">
          <span className="font-display text-[4rem] leading-none text-ouro-texto">
            {s.level}
          </span>
          <span className="t-rotulo text-texto-suave">{copy.level}</span>
        </span>
        <div className="flex flex-col gap-2">
          <span className="t-rotulo">
            {copy.xpLine(fmt(s.totalXP), fmt(s.xpToNextLevel), s.level + 1)}
          </span>
          <Bar
            value={s.xpIntoLevel}
            max={s.xpIntoLevel + s.xpToNextLevel}
            className="h-2"
          />
          <span className="t-legenda">{copy.note}</span>
        </div>
      </div>

      {categories.length > 1 && (
        <div
          className="scroll-strip flex gap-2 overflow-x-auto"
          role="group"
          aria-label={copy.title}
        >
          {(['all', ...categories] as Filter[]).map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={filter === c}
              onClick={() => setFilter(c)}
              className={chip(filter === c)}
            >
              {copy.categories[c]}
            </button>
          ))}
        </div>
      )}

      <section className="flex flex-col gap-4">
        <h2 className="t-subtitulo">{copy.unlocked(unlocked.length)}</h2>
        {unlocked.length ? (
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {unlocked.map((a, i) => (
              <li
                key={a.badgeId}
                className="flex flex-col items-center gap-3 rounded-card bg-sup-2 p-5 text-center"
              >
                <span
                  className="tint-ouro grid h-16 w-16 place-items-center rounded-full text-ouro-na-tinta"
                  style={{ ['--i' as string]: i }}
                >
                  <Medal className="h-10 w-10" />
                </span>
                <span className="font-medium leading-snug">{a.name}</span>
                <span className="t-legenda">{a.description}</span>
                <span className="t-dado mt-auto text-[0.75rem] text-texto-suave">
                  {copy.on(date(a.unlockedAt))} · {copy.reward(a.xpReward)}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="t-rotulo rounded-card bg-sup-2 p-6 text-texto-suave">
            {copy.noneYet}
          </p>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="t-subtitulo">{copy.onTheWay}</h2>
        {locked.length ? (
          <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {locked.map((a) => (
              <li
                key={a.badgeId}
                className="flex items-start gap-4 rounded-card bg-sup-2 p-5"
              >
                <Icon
                  de={PiMedal}
                  tamanho="m"
                  className="mt-0.5 text-texto-fraco"
                />
                <span className="flex min-w-0 flex-1 flex-col gap-2">
                  <span className="flex items-baseline justify-between gap-3">
                    <span className="font-medium">{a.name}</span>
                    <span className="t-dado shrink-0 text-[0.75rem] text-texto-fraco">
                      {copy.of(a.progress, a.maxProgress)} ·{' '}
                      {copy.reward(a.xpReward)}
                    </span>
                  </span>
                  <Bar value={a.progress} max={a.maxProgress} />
                  <span className="t-legenda">{a.description}</span>
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="t-rotulo rounded-card bg-sup-2 p-6 text-texto-suave">
            {copy.allDone}
          </p>
        )}
      </section>
    </div>
  );
}
