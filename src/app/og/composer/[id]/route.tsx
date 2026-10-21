import { composerYears } from '@/app/components/site/composerYears';
import { getComposerById } from '@/app/requests/composer-details';
import { cartaoDeCompartilhamento } from '@/app/utils/ogCard';
import { countryOf } from '@/app/conteudo/site/countries';
import { translateEpochName } from '@/app/utils/translations/epochTranslations';

export const revalidate = 3600;

/**
 * A imagem que o WhatsApp e as redes mostram ao colar o link de um compositor
 * (`/og/composer/<id>?l=en`). Endereço próprio e direto: a convenção
 * `opengraph-image` herdava o prefixo interno do idioma (`/pt/...`), que o
 * proxy redireciona — e robô de pré-visualização nem sempre segue redirecionamento.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const english = new URL(request.url).searchParams.get('l') === 'en';
  const composer = await getComposerById(id);

  const image = composer
    ? cartaoDeCompartilhamento({
        rotulo: english ? 'Composer' : 'Compositor',
        titulo: composer.fullName || composer.name,
        linhas: [
          composerYears(
            composer.birthDate,
            composer.deathDate,
            english ? 'b.' : 'n.'
          ),
          [
            countryOf(composer.nationality, english ? 'en' : 'pt'),
            composer.epochName
              ? translateEpochName(composer.epochName, english ? 'en' : 'pt')
              : '',
          ]
            .filter(Boolean)
            .join(' · '),
        ],
      })
    : cartaoDeCompartilhamento({
        rotulo: english ? 'Composer' : 'Compositor',
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
