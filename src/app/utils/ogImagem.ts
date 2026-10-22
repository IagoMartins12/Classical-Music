import { SITE_URL } from './seoAlternates';

/**
 * A imagem de compartilhamento padrão, para o `openGraph` de cada página.
 *
 * Toda página que declara `openGraph` precisa trazer a sua: o Next troca o
 * objeto inteiro do segmento de cima pelo da página, e a imagem do layout
 * sumia (a home ia para o WhatsApp sem imagem nenhuma).
 */
export const imagemPadrao = (idioma: 'pt' | 'en' = 'pt') => [
  {
    url: `${SITE_URL}/og/site${idioma === 'en' ? '?l=en' : ''}`,
    width: 1200,
    height: 630,
    alt: 'Opus Atlas',
  },
];
