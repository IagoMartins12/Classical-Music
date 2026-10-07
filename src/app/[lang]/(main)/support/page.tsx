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
  return metadataDaCentral('support', await routeLanguage(params));
}

export default async function Pagina({ params }: LangPageProps) {
  const idioma = await routeLanguage(params);
  return (
    <CentralDeAjuda
      qual="support"
      central={CENTRAIS.support[idioma]}
      idioma={idioma}
    />
  );
}
