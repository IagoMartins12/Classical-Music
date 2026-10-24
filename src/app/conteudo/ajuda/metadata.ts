import { imagemPadrao } from '@/app/utils/ogImagem';
import type { Metadata } from 'next';
import { alternatesFor, SITE_URL } from '@/app/utils/seoAlternates';
import { GUIAS } from './guias';
import { FAQ } from './faq';
import { SUPORTE } from './suporte';
import type { Idioma } from '../legal/tipos';

export const CENTRAIS = { help: GUIAS, faq: FAQ, support: SUPORTE };

/** O metadata das páginas de ajuda, tirado do próprio conteúdo. */
export function metadataDaCentral(
  qual: keyof typeof CENTRAIS,
  idioma: Idioma
): Metadata {
  const c = CENTRAIS[qual][idioma];
  const titulo = `${c.titulo} | Opus Atlas`;
  return {
    title: titulo,
    description: c.abertura,
    openGraph: {
      title: titulo,
      description: c.abertura,
      type: 'website',
      locale: idioma === 'pt' ? 'pt_BR' : 'en_US',
      url: `${SITE_URL}${idioma === 'en' ? '/en' : ''}/${qual}`,
      siteName: 'Opus Atlas',
      images: imagemPadrao(idioma),
    },
    twitter: { card: 'summary', title: titulo, description: c.abertura },
    robots: { index: true, follow: true },
    alternates: alternatesFor(`/${qual}`, idioma),
  };
}
