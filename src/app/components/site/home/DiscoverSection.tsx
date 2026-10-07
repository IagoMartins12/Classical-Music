import { PiArrowRight } from 'react-icons/pi';
import Link from '@/app/components/LocalizedLink';
import { Icon } from '@/app/components/ui/Icon';
import { Revelar } from '@/app/components/ui/Revelar';
import type { Idioma } from '@/app/conteudo/legal/tipos';
import { eraName } from '@/app/conteudo/site/eras';
import type { HomeCopy } from '@/app/conteudo/site/home';
import { FavoriteHeart } from '../FavoriteHeart';
import { Portrait } from '../Portrait';
import { SectionHeading } from '../SectionHeading';

interface DiscoverComposer {
  id: string;
  name: string;
  fullName: string;
  portraitUrl: string | null;
  epochName?: string | null;
}
interface DiscoverWork {
  id: string;
  title: string;
  composerName: string;
  detail?: string | null;
}
export interface DiscoverGroup {
  composers: DiscoverComposer[];
  works: DiscoverWork[];
}

function Panel({
  title,
  text,
  group,
  language,
}: {
  title: string;
  text: string;
  group: DiscoverGroup;
  language: Idioma;
}) {
  return (
    <section className="flex flex-col gap-4 rounded-card bg-sup-2 p-5">
      <div className="flex flex-col gap-0.5">
        <h3 className="t-subtitulo">{title}</h3>
        <p className="t-rotulo text-texto-suave">{text}</p>
      </div>
      <ul className="flex flex-wrap gap-x-5 gap-y-3">
        {group.composers.slice(0, 4).map((c) => (
          <li key={c.id}>
            <Link
              href={`/composer/${c.id}`}
              className="group flex items-center gap-3"
            >
              <Portrait
                name={c.fullName}
                src={c.portraitUrl}
                sizes="44px"
                className="h-11 w-11 rounded-full text-[0.875rem]"
              />
              <span className="flex flex-col">
                <span className="font-display text-[1.0625rem] group-hover:text-ouro-texto">
                  {c.name}
                </span>
                {c.epochName && (
                  <span className="t-legenda">
                    {eraName(c.epochName, language)}
                  </span>
                )}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <ul className="flex flex-col divide-y divide-[var(--linha)]">
        {group.works.slice(0, 4).map((w) => (
          <li key={w.id} className="flex items-center gap-2">
            <Link
              href={`/works/${w.id}`}
              className="group flex min-w-0 flex-1 items-center justify-between gap-3 py-2.5"
            >
              <span className="flex min-w-0 flex-col">
                <span className="truncate group-hover:text-ouro-texto">
                  {w.title}
                </span>
                <span className="truncate t-rotulo text-texto-suave">
                  {[w.composerName, w.detail].filter(Boolean).join(' · ')}
                </span>
              </span>
              <Icon
                de={PiArrowRight}
                tamanho="p"
                className="shrink-0 text-texto-fraco"
              />
            </Link>
            <FavoriteHeart type="work" id={w.id} name={w.title} />
          </li>
        ))}
      </ul>
    </section>
  );
}

/** "Descobrir": random lesser-known picks beside what just arrived. */
export function DiscoverSection({
  copy,
  language,
  random,
  recent,
}: {
  copy: HomeCopy['discover'];
  language: Idioma;
  random: DiscoverGroup;
  recent: DiscoverGroup;
}) {
  const hasRandom = random.composers.length + random.works.length > 0;
  const hasRecent = recent.composers.length + recent.works.length > 0;
  if (!hasRandom && !hasRecent) return null;
  return (
    <Revelar as="section" className="section-wrap flex flex-col gap-6 py-12">
      <SectionHeading title={copy.title} />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {hasRandom && (
          <Panel
            title={copy.random}
            text={copy.randomText}
            group={random}
            language={language}
          />
        )}
        {hasRecent && (
          <Panel
            title={copy.recent}
            text={copy.recentText}
            group={recent}
            language={language}
          />
        )}
      </div>
    </Revelar>
  );
}
