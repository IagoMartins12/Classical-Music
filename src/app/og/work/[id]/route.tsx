import { getWorkById } from '@/app/requests/work-page-details';
import { cartaoDeCompartilhamento } from '@/app/utils/ogCard';

export const revalidate = 3600;

/** A imagem de compartilhamento de uma obra (`/og/work/<id>?l=en`). */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const english = new URL(request.url).searchParams.get('l') === 'en';
  const work = await getWorkById(id);

  const image = work
    ? cartaoDeCompartilhamento({
        rotulo: english ? 'Work' : 'Obra',
        titulo: [work.title, work.opOrCatalog].filter(Boolean).join(', '),
        linhas: [work.composer.fullName || work.composer.name],
      })
    : cartaoDeCompartilhamento({
        rotulo: english ? 'Work' : 'Obra',
        titulo: 'Opus Atlas',
        linhas: [
          english
            ? 'The classical music encyclopedia'
            : 'Enciclopédia de música clássica',
        ],
      });

  image.headers.set(
    'Cache-Control',
    'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800'
  );
  return image;
}
