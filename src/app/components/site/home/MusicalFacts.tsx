'use client';

import { useRef, useState, type CSSProperties } from 'react';
import { PiArrowsClockwise, PiFunnel } from 'react-icons/pi';
import { Button } from '@/app/components/ui/Button';
import { cx } from '@/app/components/ui/cx';
import { Selecao } from '@/app/components/ui/Selecao';
import type { Idioma } from '@/app/conteudo/legal/tipos';
import type { HomeCopy } from '@/app/conteudo/site/home';
import { SectionHeading } from '../SectionHeading';

export interface MusicalFact {
  id: string;
  category: string;
  title: Record<Idioma, string>;
  content: Record<Idioma, string>;
}

/** Category labels in English; Portuguese uses the stored name as is. */
const CATEGORY_EN: Record<string, string> = {
  Medieval: 'Medieval',
  Renascimento: 'Renaissance',
  Barroco: 'Baroque',
  Clássico: 'Classical',
  Romântico: 'Romantic',
  Impressionismo: 'Impressionism',
  Moderno: 'Modern',
  Teoria: 'Theory',
  Futuro: 'Future',
};
const CATEGORIES = Object.keys(CATEGORY_EN);
const label = (category: string, language: Idioma) =>
  language === 'en' ? (CATEGORY_EN[category] ?? category) : category;

const shuffle = <T,>(items: readonly T[]) =>
  [...items].sort(() => Math.random() - 0.5);

/** A slight tilt per card, so the pile looks dealt by hand. */
const TILT = [-5, 4, -2, 6];
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
const calm = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

type Pile = 'gather' | 'deal' | null;

/**
 * "Curiosidades musicais": the era filter, shuffle and four facts, two per
 * row. The first four come from the server;
 * the full list (a few hundred facts) loads only when someone filters or
 * shuffles.
 */
export function MusicalFacts({
  copy,
  language,
  initial,
}: {
  copy: HomeCopy['facts'];
  language: Idioma;
  initial: MusicalFact[];
}) {
  const [facts, setFacts] = useState(initial);
  const [category, setCategory] = useState('all');
  const [busy, setBusy] = useState(false);
  const [pile, setPile] = useState<Pile>(null);
  const [offsets, setOffsets] = useState<{ x: number; y: number }[]>([]);
  const list = useRef<HTMLUListElement>(null);

  // How far each card travels to the middle of the list.
  const measure = () => {
    const ul = list.current;
    if (!ul) return [];
    const box = ul.getBoundingClientRect();
    return [...ul.children].map((li) => {
      const card = li.getBoundingClientRect();
      return {
        x: box.left + box.width / 2 - (card.left + card.width / 2),
        y: box.top + box.height / 2 - (card.top + card.height / 2),
      };
    });
  };

  const draw = async (next: string) => {
    setBusy(true);
    const animate = !calm();
    if (animate) {
      setOffsets(measure());
      setPile('gather');
    }
    const [{ musicalFacts }] = await Promise.all([
      import('@/app/utils/musicalFacts'),
      animate ? wait(420) : null,
    ]);
    const pool =
      next === 'all'
        ? musicalFacts
        : musicalFacts.filter((f) => f.category === next);
    setFacts(shuffle(pool).slice(0, 4) as MusicalFact[]);
    if (animate) {
      setPile('deal');
      await wait(900);
      setPile(null);
    }
    setBusy(false);
  };

  const cardStyle = (i: number): CSSProperties => {
    const o = offsets[i] ?? { x: 0, y: 0 };
    return {
      ['--x' as string]: `${o.x}px`,
      ['--y' as string]: `${o.y}px`,
      ['--r' as string]: `${TILT[i % TILT.length]}deg`,
      ['--i' as string]: i,
    };
  };

  if (!facts.length) return null;

  return (
    <div className="flex flex-col gap-6">
      <SectionHeading title={copy.title} />
      {/* No celular, filtro e embaralhar dividem a mesma linha. */}
      <div className="flex items-center justify-between gap-3 sm:flex-wrap">
        <div className="w-56 max-sm:min-w-0 max-sm:flex-1">
          <Selecao
            aria-label={copy.filter}
            icone={PiFunnel}
            disabled={busy}
            opcoes={[
              { value: 'all', label: copy.all },
              ...CATEGORIES.map((c) => ({
                value: c,
                label: label(c, language),
              })),
            ]}
            valor={category}
            aoMudar={(next) => {
              setCategory(next);
              void draw(next);
            }}
          />
        </div>
        <Button
          icone={PiArrowsClockwise}
          disabled={busy}
          onClick={() => void draw(category)}
          className={cx('shrink-0', pile && '[&_svg]:animate-spin')}
        >
          {copy.shuffle}
        </Button>
      </div>
      <ul
        ref={list}
        className="grid grid-cols-1 gap-6 md:grid-cols-2"
        aria-live="polite"
      >
        {facts.map((fact, i) => (
          <li
            key={fact.id}
            style={cardStyle(i)}
            className={cx(
              'flex flex-col gap-3 rounded-card bg-sup-2 p-6',
              pile && 'shadow-[var(--sombra-1)]',
              pile === 'gather' && 'fato-recolhe',
              pile === 'deal' && 'fato-distribui'
            )}
          >
            <div className="flex items-baseline justify-between gap-4">
              <h3 className="t-subtitulo">{fact.title[language]}</h3>
              <span className="t-rotulo shrink-0 text-texto-fraco">
                {label(fact.category, language)}
              </span>
            </div>
            <p className="t-corpo text-texto-suave">{fact.content[language]}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
