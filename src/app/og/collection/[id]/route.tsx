import { publicCollection } from '@/app/requests/collections';
import {
  cartaoDeColecao,
  cartaoDeCompartilhamento,
  retratoComoDados,
} from '@/app/utils/ogCard';

export const revalidate = 3600;

const TIPOS = {
  pt: {
    WORK: ['obra', 'obras'],
    COMPOSER: ['compositor', 'compositores'],
    SCORE: ['partitura', 'partituras'],
  },
  en: {
    WORK: ['work', 'works'],
    COMPOSER: ['composer', 'composers'],
    SCORE: ['score', 'scores'],
  },
} as const;

/**
 * The image WhatsApp and the networks show for a public collection
 * (`/og/collection/<id>?l=en`): its title and what it gathers, beside the
 * portraits of its composers (owner's request, 29/10: "a thumb with their
 * photos"). Its own direct address, as `og/composer`.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const lingua =
    new URL(request.url).searchParams.get('l') === 'en' ? 'en' : 'pt';
  const c = await publicCollection(id);
  const rotulo = lingua === 'en' ? 'Collection' : 'Coleção';

  let image;
  if (!c?.isPublic) {
    image = cartaoDeCompartilhamento({
      rotulo,
      titulo: 'Opus Atlas',
      linhas: [
        lingua === 'en'
          ? 'The classical music encyclopedia'
          : 'Enciclopédia de música clássica',
      ],
    });
  } else {
    // The faces, without repeating a portrait; the downloads run together.
    const urls = [
      ...new Set(
        c.faces.map((f) => f.portraitUrl).filter((u): u is string => !!u)
      ),
    ].slice(0, 4);
    const retratos = (await Promise.all(urls.map(retratoComoDados))).filter(
      (d): d is string => !!d
    );
    const [um, varios] = TIPOS[lingua][c.kind];
    image = cartaoDeColecao({
      rotulo,
      titulo: c.title,
      linhas: [
        `${c.itemCount} ${c.itemCount === 1 ? um : varios}`,
        `${lingua === 'en' ? 'by' : 'por'} ${c.owner.name}`,
      ],
      retratos,
    });
  }

  image.headers.set(
    'Cache-Control',
    'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800'
  );
  return image;
}
