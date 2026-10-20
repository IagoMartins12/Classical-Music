'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { PiMedal, PiTrophy } from 'react-icons/pi';
import Link from '@/app/components/LocalizedLink';
import { Button, classesDeBotao } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import { Sheet } from '@/app/components/ui/Sheet';
import { cx } from '@/app/components/ui/cx';
import { PERSONAL } from '@/app/conteudo/site/personal';
import { useRouteLanguage } from '@/app/hooks/useRouteLanguage';
import { apiFetch } from '@/app/libs/api/client';
import type { ApiSchema } from '@/app/libs/api/types';

export type AchievementCategory = ApiSchema<'LockedAchievementDto'>['category'];
type Stats = ApiSchema<'AchievementStatsResponseDto'>;
type List = ApiSchema<'AchievementListResponseDto'>;

const NEXT_SHOWN = 3;

/** Level, XP and unlocked achievements, shared by every personal page. */
export function useAchievements() {
  const stats = useQuery({
    queryKey: ['achievements', 'stats'],
    queryFn: () => apiFetch<Stats>('/achievements/stats'),
    // XP and level change with every action: each time a page that shows them
    // opens, it asks again instead of trusting the last minute.
    staleTime: 0,
    refetchOnMount: 'always',
  });
  const list = useQuery({
    queryKey: ['achievements', 'list'],
    queryFn: () => apiFetch<List>('/achievements'),
    staleTime: 0,
    refetchOnMount: 'always',
  });
  return { stats, list };
}

export function Bar({
  value,
  max,
  className,
}: {
  value: number;
  max: number;
  className?: string;
}) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <span
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      className={cx(
        'block h-1.5 overflow-hidden rounded-full bg-[var(--linha)]',
        className
      )}
    >
      <span
        className="block h-full rounded-full fill-ouro transition-[width] duration-[var(--t-resposta)]"
        style={{ width: `${pct}%` }}
      />
    </span>
  );
}

/**
 * Level and XP, then only this page's achievements: how many of its kind are
 * unlocked and the ones closest to unlocking. The full list is the
 * achievements page.
 */
export function ProgressPanel({ category }: { category: AchievementCategory }) {
  const { language } = useRouteLanguage();
  const copy = PERSONAL[language].progress;
  const fmt = (n: number) =>
    n.toLocaleString(language === 'pt' ? 'pt-BR' : 'en-US');
  const { stats, list } = useAchievements();

  if (stats.isError || list.isError) {
    return <p className="t-rotulo text-texto-suave">{copy.error}</p>;
  }
  if (!stats.data || !list.data) {
    return (
      <span
        className="loading-skeleton block h-48 rounded-card"
        aria-hidden="true"
      />
    );
  }
  const s = stats.data;
  const unlocked = list.data.unlocked.filter((a) => a.category === category);
  const locked = list.data.locked.filter((a) => a.category === category);
  const pending = [...locked]
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, NEXT_SHOWN);

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3 rounded-card bg-sup-2 p-5">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[var(--fundo)] text-ouro-texto">
            <Icon de={PiTrophy} tamanho="g" />
          </span>
          <span className="flex flex-col">
            <span className="font-display text-[1.5rem] leading-none">
              {copy.level(s.level)}
            </span>
            <span className="t-dado text-[0.8125rem] text-texto-suave">
              {copy.xp(fmt(s.totalXP))}
            </span>
          </span>
        </div>
        <Bar value={s.xpIntoLevel} max={s.xpIntoLevel + s.xpToNextLevel} />
        <span className="t-legenda">{copy.toNext(fmt(s.xpToNextLevel))}</span>
        <span className="t-rotulo text-texto-suave">
          {copy.unlockedHere(
            unlocked.length,
            unlocked.length + locked.length,
            copy.kinds[category]
          )}
        </span>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="t-legenda">{copy.next}</h2>
        {pending.length ? (
          <ul className="flex flex-col gap-3">
            {pending.map((a) => (
              <li key={a.badgeId} className="flex flex-col gap-2">
                <span className="flex items-baseline justify-between gap-3">
                  <span className="font-medium">{a.name}</span>
                  <span className="t-dado shrink-0 text-[0.75rem] text-texto-fraco">
                    {copy.of(a.progress, a.maxProgress)} ·{' '}
                    {copy.reward(a.xpReward)}
                  </span>
                </span>
                <Bar value={a.progress} max={a.maxProgress} />
                <span className="t-legenda">{a.description}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="t-rotulo text-texto-suave">
            {unlocked.length ? copy.emptyHere : copy.empty}
          </p>
        )}
      </section>

      <Link
        href="/achievements"
        className={cx(classesDeBotao('texto'), 'self-start')}
      >
        <Icon de={PiMedal} /> {copy.all}
      </Link>
    </div>
  );
}

/** Phones: the panel behind a button, in a sheet. */
export function ProgressButton({
  category,
}: {
  category: AchievementCategory;
}) {
  const copy = PERSONAL[useRouteLanguage().language].progress;
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        tamanho="p"
        icone={PiTrophy}
        onClick={() => setOpen(true)}
        className="lg:hidden"
      >
        {copy.show}
      </Button>
      <Sheet
        aberto={open}
        aoFechar={() => setOpen(false)}
        titulo={copy.title}
        largura="p"
      >
        {open && <ProgressPanel category={category} />}
      </Sheet>
    </>
  );
}
