import type { getComposerById } from '@/app/requests/composer-details';

type Composer = NonNullable<Awaited<ReturnType<typeof getComposerById>>>;

const SITE = 'https://opusatlas.com.br';

/** schema.org `Person` do compositor, para o `JsonLd` da página. */
export function composerJsonLd(composer: Composer) {
  const url = `${SITE}/composer/${composer.id}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': url,
    name: composer.fullName,
    alternateName: composer.name,
    description: composer.bio || undefined,
    birthDate: composer.birthDate,
    deathDate: composer.deathDate,
    nationality: composer.nationality,
    jobTitle: 'Composer',
    genre: composer.epochName,
    url,
    image: composer.portraitUrl,
    sameAs: composer.wikipediaLink ? [composer.wikipediaLink] : undefined,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
  };
}
