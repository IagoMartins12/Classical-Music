import type { Metadata } from 'next';
import { CentralDeAjuda } from '@/app/components/ui/CentralDeAjuda';
import { CENTRAIS, metadataDaCentral } from '@/app/conteudo/ajuda/metadata';
import {
  routeLanguage,
  type LangParams,
} from '@/app/utils/translations/routeLanguage';

// O texto mora em `conteudo/ajuda`; a página só escolhe o conteúdo e o idioma.
interface LangPageProps {
  params: LangParams;
}

export async function generateMetadata({
  params,
}: LangPageProps): Promise<Metadata> {
  return metadataDaCentral('faq', await routeLanguage(params));
}

/** Texto puro da resposta, para os dados estruturados (sem a marcação). */
const textoPuro = (s: string) =>
  s.replace(/\*\*/g, '').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1');

export default async function Pagina({ params }: LangPageProps) {
  const idioma = await routeLanguage(params);
  const central = CENTRAIS.faq[idioma];
  // FAQPage: as perguntas e respostas, lidas pelo Google como tal.
  const dados = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    inLanguage: idioma === 'pt' ? 'pt-BR' : 'en',
    mainEntity: central.grupos.flatMap((g) =>
      g.itens.map((i) => ({
        '@type': 'Question',
        name: i.titulo,
        acceptedAnswer: {
          '@type': 'Answer',
          text: i.blocos
            .map((b) =>
              typeof b === 'string'
                ? textoPuro(b)
                : 'lista' in b
                  ? b.lista.map(textoPuro).join(' ')
                  : ''
            )
            .join(' '),
        },
      }))
    ),
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(dados).replace(/</g, '\\u003c'),
        }}
      />
      <CentralDeAjuda qual="faq" central={central} idioma={idioma} />
    </>
  );
}
