import { OG_SIZE, OG_TYPE, cartaoDeCompartilhamento } from '@/app/utils/ogCard';

export const size = OG_SIZE;
export const contentType = OG_TYPE;
export const alt = 'Opus Atlas — Enciclopédia de Música Clássica';

/** O cartão padrão do site, para toda página que não tem o seu. */
export default function Image() {
  return cartaoDeCompartilhamento({
    rotulo: 'Música clássica',
    titulo: 'Opus Atlas',
    linhas: [
      'Compositores, obras e partituras de domínio público',
      'Enciclopédia de música clássica',
    ],
  });
}
