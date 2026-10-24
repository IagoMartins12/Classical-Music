import { SITE_URL } from './seoAlternates';

/**
 * A imagem de compartilhamento padrão, para o `openGraph` de cada página: o
 * logo do Opus Atlas. Compositor e obra têm a sua (a foto do compositor, ver
 * `og/composer` e `og/work`).
 *
 * Toda página que declara `openGraph` precisa trazer a sua: o Next troca o
 * objeto inteiro do segmento de cima pelo da página, e a imagem do layout
 * sumia (a home ia para o WhatsApp sem imagem nenhuma).
 */
export const LOGO_DE_COMPARTILHAMENTO = `${SITE_URL}/brand/opus-atlas-og.jpg`;

// O idioma fica na assinatura: o logo é o mesmo nas duas línguas.
export const imagemPadrao = (_idioma: 'pt' | 'en' = 'pt') => [
  { url: LOGO_DE_COMPARTILHAMENTO, width: 1200, height: 630, alt: 'Opus Atlas' },
];
