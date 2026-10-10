'use client';

import { useState } from 'react';
import { PiArrowsClockwise, PiFunnel } from 'react-icons/pi';
import { Button } from '@/app/components/ui/Button';
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

  const draw = async (next: string) => {
    setBusy(true);
    const { musicalFacts } = await import('@/app/utils/musicalFacts');
    const pool =
      next === 'all'
        ? musicalFacts
        : musicalFacts.filter((f) => f.category === next);
    setFacts(shuffle(pool).slice(0, 4) as MusicalFact[]);
    setBusy(false);
  };

  if (!facts.length) return null;

  return (
    <div className="flex flex-col gap-6">
      <SectionHeading title={copy.title} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="w-56 max-sm:w-full">
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
        >
          {copy.shuffle}
        </Button>
      </div>
      <ul className="grid grid-cols-1 gap-6 md:grid-cols-2" aria-live="polite">
        {facts.map((fact) => (
          <li
            key={fact.id}
            className="flex flex-col gap-3 rounded-card bg-sup-2 p-6"
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
