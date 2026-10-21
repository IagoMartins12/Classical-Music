import { getWorkById } from '@/app/requests/work-page-details';
import { OG_SIZE, OG_TYPE, cartaoDeCompartilhamento } from '@/app/utils/ogCard';

export const size = OG_SIZE;
export const contentType = OG_TYPE;
export const alt = 'Opus Atlas';
export const revalidate = 3600;

/** A imagem que o WhatsApp e as redes mostram ao colar o link da obra. */
export default async function Image({
  params,
}: {
  params: Promise<{ lang: string; workId: string }>;
}) {
  const { lang, workId } = await params;
  const english = lang === 'en';
  const work = await getWorkById(workId);

  if (!work)
    return cartaoDeCompartilhamento({
      rotulo: english ? 'Work' : 'Obra',
      titulo: 'Opus Atlas',
      linhas: [
        english
          ? 'The classical music encyclopedia'
          : 'Enciclopédia de música clássica',
      ],
    });

  return cartaoDeCompartilhamento({
    rotulo: english ? 'Work' : 'Obra',
    titulo: [work.title, work.opOrCatalog].filter(Boolean).join(', '),
    linhas: [work.composer.fullName || work.composer.name],
  });
}
