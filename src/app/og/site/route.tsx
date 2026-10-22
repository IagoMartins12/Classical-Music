import { cartaoDeCompartilhamento } from '@/app/utils/ogCard';

export const revalidate = 86400;

/**
 * O cartão padrão do site (`/og/site?l=en`), para toda página sem o seu:
 * home, listas, planos, ajuda, termos. Mesmo motivo das rotas de compositor e
 * obra: endereço direto, no host que está no ar, leve e na proporção certa.
 */
export function GET(request: Request) {
  const english = new URL(request.url).searchParams.get('l') === 'en';
  const image = cartaoDeCompartilhamento(
    english
      ? {
          rotulo: 'Classical music',
          titulo: 'Opus Atlas',
          linhas: [
            'Composers, works and public-domain scores',
            'The classical music encyclopedia',
          ],
        }
      : {
          rotulo: 'Música clássica',
          titulo: 'Opus Atlas',
          linhas: [
            'Compositores, obras e partituras de domínio público',
            'Enciclopédia de música clássica',
          ],
        }
  );
  image.headers.set(
    'Cache-Control',
    'public, max-age=86400, s-maxage=604800, stale-while-revalidate=604800'
  );
  return image;
}
