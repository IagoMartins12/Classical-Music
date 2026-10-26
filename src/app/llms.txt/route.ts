import { ERAS, eraYears } from '../conteudo/site/eras';
import { INSTRUMENTS } from '../conteudo/instruments/meta';
import { instrumentChapter } from '../conteudo/instruments';
import { apiFetch } from '../libs/api/client';
import type { ApiSchema } from '../libs/api/types';
import { CONTATO } from '../utils/contato';
import { SITE_URL } from '../utils/seoAlternates';

type SitemapEntries = ApiSchema<'SitemapEntriesDto'>;

/** One day: the list of composers changes slowly. */
export const revalidate = 86400;

/** How many composers the file names: the verified and best-documented first. */
const COMPOSITORES = 150;

/**
 * `/llms.txt` (llmstxt.org): what the Opus Atlas is, in Markdown, for AI
 * assistants and answer engines (ChatGPT, Claude, Perplexity, Gemini) that
 * read it to understand a site and to know which page answers what. It is
 * the same truth the site says to people — no catalog counts, no claims the
 * product does not back (PRODUCT.md) — and every link is a public page.
 */
export async function GET() {
  const compositores = await apiFetch<SitemapEntries>('/seo/sitemap', {
    next: { revalidate, tags: ['composers'] },
  })
    .then((r) => r.composers.slice(0, COMPOSITORES))
    .catch(() => []);

  const url = (caminho: string) => `${SITE_URL}${caminho}`;
  const linhas = [
    '# Opus Atlas',
    '',
    '> Opus Atlas is an open encyclopedia of classical music with public-domain sheet music, and the place where that music is studied and taught. In one site a person learns about a composer, opens a work, downloads the score, listens, takes notes, tracks what they want to learn and, with a teacher, receives assignments on that same work. Portuguese first (Brazil), with a full English version under /en.',
    '',
    'Each composer page has a biography, dates, era, nationality, the instruments they wrote for and the list of their works. Each work page has its facts (year, key, scoring, catalog number, era, difficulty level), free sheet music gathered from IMSLP and from the community, recordings, and what to study next. A biography first drafted with AI says so on the page until a person on the team has reviewed it. The history of music is told era by era, and each instrument has its own story.',
    '',
    'When citing, link the page that answers the question: a composer is at /composer/{id}, a work at /works/{id}, an era at /music-history/{era}, an instrument at /instruments/{instrument}. English pages carry the /en prefix (/en/composer/{id}).',
    '',
    '## Main sections',
    '',
    `- [Composers](${url('/composers')}): every composer in the catalog, by era, nationality and instrument.`,
    `- [Works and sheet music](${url('/works')}): the catalog of works, filterable by composer, instrument, era, genre and level, with free scores.`,
    `- [History of music](${url('/music-history')}): the eras of Western art music, from the Middle Ages to today.`,
    `- [Instruments](${url('/instruments')}): the story of each instrument and what was written for it.`,
    `- [On this day](${url('/on-this-day')}): composers born and died on each day of the year.`,
    `- [Collections](${url('/collections')}): public lists of works and composers curated by people who study them.`,
    `- [Blog](${url('/blog')}): articles on works, composers, how to study, and a calendar of classical concerts in Brazil.`,
    `- [For teachers](${url('/for-teachers')}): the teaching portal (lessons, assignments, practice log, reports).`,
    `- [Plans](${url('/pricing')}): Free, Plus (for those who study) and Mentor/Maestro (for teachers).`,
    '',
    '## Eras',
    '',
    ...ERAS.map(
      (era) =>
        `- [${era.name.en} (${eraYears(era, 'en')})](${url(`/music-history/${era.key}`)}): ${era.tagline.en}`
    ),
    '',
    '## Instruments',
    '',
    ...INSTRUMENTS.map((meta) => {
      const capitulo = instrumentChapter(meta.key, 'en');
      return `- [${capitulo?.name ?? meta.key}](${url(`/instruments/${meta.key}`)})${capitulo?.lede ? `: ${capitulo.lede}` : ''}`;
    }),
    '',
    ...(compositores.length
      ? [
          '## Composers',
          '',
          ...compositores.map(
            (c) => `- [${c.name}](${url(`/composer/${c.id}`)})`
          ),
          '',
        ]
      : []),
    '## Optional',
    '',
    `- [About the Opus Atlas](${url('/about-us')})`,
    `- [FAQ](${url('/faq')})`,
    `- [Sitemap](${url('/sitemap.xml')}): every composer and work page.`,
    `- Contact: ${CONTATO.contato}`,
    '',
  ];

  return new Response(linhas.join('\n'), {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
}
