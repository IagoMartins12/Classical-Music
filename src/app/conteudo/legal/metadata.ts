import { imagemPadrao } from '@/app/utils/ogImagem';
import type { Metadata } from 'next';
import { alternatesFor, SITE_URL } from '@/app/utils/seoAlternates';
import { TERMOS } from './termos';
import { PRIVACIDADE } from './privacidade';
import { DIREITOS_AUTORAIS } from './direitosAutorais';
import type { Idioma } from './tipos';

const DOCS = {
  terms: TERMOS,
  privacy: PRIVACIDADE,
  copyright: DIREITOS_AUTORAIS,
};

/** O metadata dos documentos legais, tirado do próprio documento. */
export function metadataDoDocumento(
  qual: keyof typeof DOCS,
  idioma: Idioma
): Metadata {
  const doc = DOCS[qual][idioma];
  const titulo = `${doc.titulo} | Opus Atlas`;
  return {
    title: titulo,
    description: doc.abertura,
    creator: 'Opus Atlas',
    openGraph: {
      title: titulo,
      description: doc.abertura,
      type: 'article',
      locale: idioma === 'pt' ? 'pt_BR' : 'en_US',
      url: `${SITE_URL}${idioma === 'en' ? '/en' : ''}/${qual}`,
      siteName: 'Opus Atlas',
      images: imagemPadrao(idioma),
    },
    twitter: { card: 'summary', title: titulo, description: doc.abertura },
    robots: { index: true, follow: true },
    alternates: alternatesFor(`/${qual}`, idioma),
  };
}
