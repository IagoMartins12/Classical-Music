import { countryOf } from '@/app/conteudo/site/countries';
import { eraName } from '@/app/conteudo/site/eras';
import type { getComposerById } from '@/app/requests/composer-details';
import { ID_DO_SITE, dataIso, resumo, trilha, urlDe } from '@/app/utils/seo';

type Composer = NonNullable<Awaited<ReturnType<typeof getComposerById>>>;

/**
 * The composer page for search engines and AI answers, as one `@graph`: the
 * page (`ProfilePage`), the person, and the breadcrumb. The person has its
 * own `@id`, so a work page can say "composed by this one" by reference
 * (`works/[workId]/jsonLd`), and the knowledge graph ties the two.
 *
 * Dates go in ISO 8601 from the date parts (the stored text, "16 December
 * 1770", is not a schema.org date); `sameAs` lists every page about the same
 * person elsewhere (Wikipedia, IMSLP), which is how engines confirm who it is.
 */
export function composerJsonLd(composer: Composer, language: 'pt' | 'en') {
  const caminho = `/composer/${composer.id}`;
  const url = urlDe(caminho, language);
  const bio = (language === 'en' && composer.bioEn) || composer.bio;
  const era = eraName(composer.epochName, language);
  const pais = countryOf(composer.nationality, language);
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ProfilePage',
        '@id': `${url}#page`,
        url,
        name: composer.fullName,
        inLanguage: language === 'pt' ? 'pt-BR' : 'en-US',
        isPartOf: { '@id': ID_DO_SITE },
        mainEntity: { '@id': `${url}#person` },
        breadcrumb: { '@id': `${url}#breadcrumb` },
      },
      {
        '@type': 'Person',
        '@id': `${url}#person`,
        name: composer.fullName,
        alternateName: [composer.name, composer.alternativeNames]
          .filter((n): n is string => !!n && n !== composer.fullName)
          .flatMap((n) => n.split(/\s*[;|]\s*/))
          .slice(0, 6),
        description: bio ? resumo(bio, 300) : undefined,
        birthDate: dataIso(composer.birth),
        deathDate: dataIso(composer.death),
        nationality: pais ? { '@type': 'Country', name: pais } : undefined,
        jobTitle: language === 'pt' ? 'Compositor' : 'Composer',
        knowsAbout: era || undefined,
        image: composer.portraitUrl,
        url,
        sameAs: [composer.wikipediaLink, composer.permLinkImslp].filter(
          (l): l is string => !!l && /^https?:\/\//.test(l)
        ),
      },
      trilha(
        [
          ['Opus Atlas', '/'],
          [language === 'pt' ? 'Compositores' : 'Composers', '/composers'],
          [composer.fullName, caminho],
        ],
        language,
        `${url}#breadcrumb`
      ),
    ],
  };
}
