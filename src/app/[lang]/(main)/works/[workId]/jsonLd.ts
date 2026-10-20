import type { getWorkById } from '@/app/requests/work-page-details';

type Work = NonNullable<Awaited<ReturnType<typeof getWorkById>>>;

const SITE = 'https://opusatlas.com.br';

/** schema.org `MusicComposition` da obra, para o `JsonLd` da página. */
export function workJsonLd(work: Work, language: 'pt' | 'en') {
  const url = `${SITE}/works/${work.id}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'MusicComposition',
    name: work.title,
    composer: { '@type': 'Person', name: work.composer.fullName },
    dateCreated: work.compositionYear,
    genre: work.epoch?.name,
    instrument: work.instrument?.name,
    url,
    inLanguage: language === 'pt' ? 'pt-BR' : 'en-US',
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    isPartOf: { '@type': 'WebSite', name: 'Opus Atlas', url: SITE },
    musicArrangement: work.opOrCatalog,
    // O link de partitura só entra quando a obra o tem.
    ...(work.imslpPermlink
      ? {
          associatedMedia: {
            '@type': 'MediaObject',
            name:
              language === 'pt'
                ? `${work.title} — partitura gratuita`
                : `${work.title} — free score`,
            url: work.imslpPermlink,
            encodingFormat: 'application/pdf',
          },
        }
      : {}),
  };
}
