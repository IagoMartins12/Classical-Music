import { workTitle } from '@/app/components/site/workTitle';
import { eraName } from '@/app/conteudo/site/eras';
import type { getWorkById } from '@/app/requests/work-page-details';
import { ID_DO_SITE, trilha, urlDe } from '@/app/utils/seo';

type Work = NonNullable<Awaited<ReturnType<typeof getWorkById>>>;

/**
 * The work page for search engines and AI answers, as one `@graph`: the page,
 * the `MusicComposition` and the breadcrumb (composers › composer › work).
 *
 * The composer is a reference to the person on the composer page
 * (`composer/[composerId]/jsonLd`, same `@id`), not a loose name: that link is
 * what tells an engine "this Sonata belongs to this Beethoven". The IMSLP
 * page is `sameAs` (the same composition described elsewhere), not a PDF —
 * it was declared as one.
 */
export function workJsonLd(work: Work, language: 'pt' | 'en') {
  const caminho = `/works/${work.id}`;
  const url = urlDe(caminho, language);
  const caminhoDoCompositor = `/composer/${work.composer.id}`;
  const nome = workTitle(work.title, work.opOrCatalog);
  const ano = work.compositionYear?.match(/\d{4}/)?.[0];
  const generos = [
    ...new Set([
      // The catalog's placeholders ("não definido", "pieces") are not genres.
      ...(work.workGenresArr ?? []).filter(
        (g) => !/^(não definido|pieces|peças|obras|works)$/i.test(g.trim())
      ),
      eraName(work.epoch?.name ?? work.composer.epochName, language),
    ]),
  ].filter(Boolean);
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${url}#page`,
        url,
        name: `${nome} — ${work.composer.fullName}`,
        inLanguage: language === 'pt' ? 'pt-BR' : 'en-US',
        isPartOf: { '@id': ID_DO_SITE },
        mainEntity: { '@id': `${url}#work` },
        breadcrumb: { '@id': `${url}#breadcrumb` },
      },
      {
        '@type': 'MusicComposition',
        '@id': `${url}#work`,
        name: work.title,
        alternateName: nome !== work.title ? nome : undefined,
        url,
        composer: {
          '@type': 'Person',
          '@id': `${urlDe(caminhoDoCompositor, language)}#person`,
          name: work.composer.fullName,
          url: urlDe(caminhoDoCompositor, language),
        },
        dateCreated: ano,
        musicalKey: work.tone || undefined,
        genre: generos.length ? generos : undefined,
        // The parts of a larger work, and the larger work of a part.
        includedComposition: work.childWorks?.length
          ? work.childWorks.map((m) => ({
              '@type': 'MusicComposition',
              name: m.title,
              url: urlDe(`/works/${m.id}`, language),
            }))
          : undefined,
        isPartOf: work.parentWork
          ? {
              '@type': 'MusicComposition',
              name: work.parentWork.title,
              url: urlDe(`/works/${work.parentWork.id}`, language),
            }
          : undefined,
        sameAs: /^https?:\/\//.test(work.imslpPermlink)
          ? [work.imslpPermlink]
          : undefined,
      },
      trilha(
        [
          ['Opus Atlas', '/'],
          [language === 'pt' ? 'Compositores' : 'Composers', '/composers'],
          [work.composer.fullName, caminhoDoCompositor],
          [nome, caminho],
        ],
        language,
        `${url}#breadcrumb`
      ),
    ],
  };
}
