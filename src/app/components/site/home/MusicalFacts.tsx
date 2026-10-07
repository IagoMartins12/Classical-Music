'use client';

import { useState } from 'react';
import { PiArrowsClockwise, PiBookOpen, PiFunnel } from 'react-icons/pi';
import { Button } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import { Revelar } from '@/app/components/ui/Revelar';
import type { Idioma } from '@/app/conteudo/legal/tipos';
import type { HomeCopy } from '@/app/conteudo/site/home';

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
 * "Curiosidades Musicais", as on today's home: title, the era filter,
 * shuffle and four facts, two per row. The first four come from the server;
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
    <Revelar as="section" className="section-wrap flex flex-col gap-8 py-12">
      <div className="flex items-start gap-4">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-card bg-sup-2 text-ouro-texto">
          <Icon de={PiBookOpen} tamanho="m" />
        </span>
        <div className="flex flex-col gap-1">
          <h2 className="t-titulo max-sm:!text-[1.75rem]">{copy.title}</h2>
          <p className="t-corpo text-texto-suave">{copy.subtitle}</p>
        </div>
      </div>
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <label className="flex items-center gap-3">
          <span className="inline-flex items-center gap-2 t-rotulo text-texto-suave">
            <Icon de={PiFunnel} tamanho="p" /> {copy.filter}
          </span>
          <select
            value={category}
            disabled={busy}
            onChange={(event) => {
              setCategory(event.target.value);
              void draw(event.target.value);
            }}
            className="input-classical min-h-10 min-w-[150px] rounded-controle px-3 text-[0.9375rem]"
          >
            <option value="all">{copy.all}</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {label(c, language)}
              </option>
            ))}
          </select>
        </label>
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
    </Revelar>
  );
}
