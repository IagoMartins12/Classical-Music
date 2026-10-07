import { Carrossel } from '@/app/components/blog/site/Carrossel';
import type { Idioma } from '@/app/conteudo/legal/tipos';
import type { ComposerCopy } from '@/app/conteudo/site/composer';
import type { ComposerOverview } from '@/app/requests/composer-details';
import { COMPOSER_CARD_WIDTH, ComposerCard } from '../ComposerCard';

/** "Do mesmo tempo": composers alive in overlapping years. */
export function Contemporaries({
  composers,
  language,
  copy,
}: {
  composers: ComposerOverview['contemporaries'];
  language: Idioma;
  copy: ComposerCopy['sameTime'];
}) {
  if (!composers.length) return null;
  return (
    <section className="mt-20">
      <Carrossel
        sempre
        idioma={language}
        rotulo={copy.title}
        largura={COMPOSER_CARD_WIDTH}
        className="-mx-4 sm:-mx-6 lg:-mx-10"
        cabecalho={
          <div className="flex px-4 sm:px-6 lg:px-10 flex-wrap items-end justify-between gap-x-6 gap-y-2">
            <h2 className="t-titulo max-sm:!text-[1.75rem]">{copy.title}</h2>
            <span className="t-legenda">{copy.text}</span>
          </div>
        }
      >
        {composers.map((composer) => (
          <ComposerCard
            key={composer.id}
            language={language}
            composer={{
              ...composer,
              birthDate: composer.birthYear?.toString(),
              deathDate: composer.deathYear?.toString(),
            }}
          />
        ))}
      </Carrossel>
    </section>
  );
}
