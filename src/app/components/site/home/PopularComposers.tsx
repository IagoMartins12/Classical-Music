import { Carrossel } from '@/app/components/blog/site/Carrossel';
import type { Idioma } from '@/app/conteudo/legal/tipos';
import type { HomeCopy } from '@/app/conteudo/site/home';
import {
  COMPOSER_CARD_WIDTH,
  ComposerCard,
  type ComposerCardData,
} from '../ComposerCard';
import { SectionHeading } from '../SectionHeading';

export function PopularComposers({
  copy,
  language,
  composers,
}: {
  copy: HomeCopy['popular'];
  language: Idioma;
  composers: ComposerCardData[];
}) {
  if (!composers.length) return null;
  return (
    <section className="py-12">
      <Carrossel
        sempre
        idioma={language}
        rotulo={copy.title}
        largura={COMPOSER_CARD_WIDTH}
        cabecalho={
          <SectionHeading
            title={copy.title}
            action={{ label: copy.seeAll, href: '/composers' }}
          />
        }
      >
        {composers.map((composer) => (
          <ComposerCard
            key={composer.id}
            composer={composer}
            language={language}
          />
        ))}
      </Carrossel>
    </section>
  );
}
