import { getComposerById } from '@/app/requests/composer-details';
import { composerYears } from '@/app/components/site/composerYears';
import { translateEpochName } from '@/app/utils/translations/epochTranslations';
import { OG_SIZE, OG_TYPE, cartaoDeCompartilhamento } from '@/app/utils/ogCard';

export const size = OG_SIZE;
export const contentType = OG_TYPE;
export const alt = 'Opus Atlas';
export const revalidate = 3600;

/** A imagem que o WhatsApp e as redes mostram ao colar o link do compositor. */
export default async function Image({
  params,
}: {
  params: Promise<{ lang: string; composerId: string }>;
}) {
  const { lang, composerId } = await params;
  const english = lang === 'en';
  const composer = await getComposerById(composerId);

  if (!composer)
    return cartaoDeCompartilhamento({
      rotulo: english ? 'Composer' : 'Compositor',
      titulo: 'Opus Atlas',
      linhas: [
        english
          ? 'The classical music encyclopedia'
          : 'Enciclopédia de música clássica',
      ],
    });

  return cartaoDeCompartilhamento({
    rotulo: english ? 'Composer' : 'Compositor',
    titulo: composer.fullName || composer.name,
    linhas: [
      composerYears(
        composer.birthDate,
        composer.deathDate,
        english ? 'b.' : 'n.'
      ),
      [
        composer.nationality,
        composer.epochName
          ? translateEpochName(composer.epochName, english ? 'en' : 'pt')
          : '',
      ]
        .filter(Boolean)
        .join(' · '),
    ],
  });
}
