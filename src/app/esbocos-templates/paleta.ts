/**
 * The email palette, as hex (clients ignore CSS variables), taken from the
 * site tokens in globals.css. Fonts are email-safe stacks: EB Garamond
 * where the client loads web fonts (Apple Mail, iOS), Georgia elsewhere.
 */
export type Tema = 'claro' | 'escuro';

export interface Paleta {
  fora: string;
  papel: string;
  papel2: string;
  texto: string;
  suave: string;
  fraco: string;
  ouro: string;
  ouroTexto: string;
  linha: string;
  botao: string;
  botaoTexto: string;
}

export const PALETAS: Record<Tema, Paleta> = {
  claro: {
    fora: '#efe8da',
    papel: '#fbf8f2',
    papel2: '#f4ede0',
    texto: '#1c1b22',
    suave: '#5b5766',
    fraco: '#6b6678',
    ouro: '#bb860a',
    ouroTexto: '#855f00',
    linha: '#e4dccb',
    botao: '#d4af37',
    botaoTexto: '#1c1b22',
  },
  escuro: {
    fora: '#0c0d12',
    papel: '#191a24',
    papel2: '#21222e',
    texto: '#f3f1ec',
    suave: '#b5b1c0',
    fraco: '#8f8b9c',
    ouro: '#d4af37',
    ouroTexto: '#e0bc5c',
    linha: 'rgba(243, 241, 236, 0.12)',
    botao: '#d4af37',
    botaoTexto: '#0c0d12',
  },
};

export const SERIFA = "'EB Garamond', Georgia, 'Times New Roman', serif";
export const SANS =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
export const SELO = '/brand/opus-atlas-seal.webp';

/**
 * Light pages get the darker gold assets (`-claro`): email clients drop CSS
 * filters, so the contrast has to live in the file.
 */
export const selo = (tema: Tema) =>
  tema === 'claro' ? '/brand/opus-atlas-seal-claro.webp' : SELO;
