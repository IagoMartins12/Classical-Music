'use client';

import { useQuery } from '@tanstack/react-query';
import { PiArrowRight } from 'react-icons/pi';
import Link from '@/app/components/LocalizedLink';
import { Icon } from '@/app/components/ui/Icon';
import { cx } from '@/app/components/ui/cx';
import { ON_THIS_DAY, daySlug, today } from '@/app/conteudo/site/onThisDay';
import { useRouteLanguage } from '@/app/hooks/useRouteLanguage';
import { getOnThisDay } from '@/app/requests/on-this-day';
import { Portrait } from '../Portrait';

/**
 * "Chopin was born on a day like today": the best-known composer born today,
 * inside the Explore menu. Loaded when the menu opens, kept for an hour.
 */
export function OnThisDayCallout({
  onNavigate,
  className,
}: {
  onNavigate?: () => void;
  className?: string;
}) {
  const copy = ON_THIS_DAY[useRouteLanguage().language];
  const date = today();
  const { data } = useQuery({
    queryKey: ['on-this-day', daySlug(date)],
    queryFn: () => getOnThisDay(date.month, date.day),
    staleTime: 60 * 60 * 1000,
  });
  const star = data?.born.find((c) => c.birthYear);
  if (!star?.birthYear) return null;
  return (
    <Link
      href="/on-this-day"
      onClick={onNavigate}
      className={cx(
        'group flex items-center gap-4 rounded-card bg-sup-2 p-4',
        className
      )}
    >
      <Portrait
        name={star.fullName}
        src={star.portraitUrl}
        sizes="56px"
        className="h-16 w-14 shrink-0 rounded-controle"
      />
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="font-display text-[1.125rem] leading-snug group-hover:text-ouro-texto">
          {copy.callout(star.name, star.birthYear)}
        </span>
        <span className="inline-flex items-center gap-1 t-rotulo text-ouro-texto">
          {copy.calloutMore} <Icon de={PiArrowRight} tamanho="pp" />
        </span>
      </span>
    </Link>
  );
}

/**
 * The same day, as one more entry of the Explore menu: title and a line,
 * like its neighbours, naming the best-known composer born today.
 */
export function OnThisDayMenuEntry({
  onNavigate,
  active,
}: {
  onNavigate?: () => void;
  active?: boolean;
}) {
  const copy = ON_THIS_DAY[useRouteLanguage().language];
  const date = today();
  const { data } = useQuery({
    queryKey: ['on-this-day', daySlug(date)],
    queryFn: () => getOnThisDay(date.month, date.day),
    staleTime: 60 * 60 * 1000,
  });
  const star = data?.born.find((c) => c.birthYear);
  return (
    <Link
      href="/on-this-day"
      onClick={onNavigate}
      aria-current={active ? 'page' : undefined}
      className="group flex items-start gap-3 rounded-controle p-3 hover:bg-sup-2"
    >
      {star && (
        <Portrait
          name={star.fullName}
          src={star.portraitUrl}
          sizes="48px"
          className="h-14 w-11 shrink-0 rounded-controle text-[0.875rem]"
        />
      )}
      <span className="flex min-w-0 flex-col gap-1">
        <span className="font-display text-[1.25rem] transition-colors group-hover:text-ouro-texto">
          {copy.menuEntry}
        </span>
        <span className="t-rotulo text-texto-suave">
          {star?.birthYear
            ? copy.menuDetail(star.name, star.birthYear)
            : copy.menuFallback}
        </span>
      </span>
    </Link>
  );
}
