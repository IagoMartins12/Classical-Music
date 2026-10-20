import type { Metadata } from 'next';
import { DocumentoLegal } from '@/app/components/ui/DocumentoLegal';
import { metadataDoDocumento } from '@/app/conteudo/legal/metadata';
import {
  routeLanguage,
  type LangParams,
} from '@/app/utils/translations/routeLanguage';

// O texto mora em `conteudo/legal`; a página só escolhe o documento e o idioma.
interface LangPageProps {
  params: LangParams;
}

export async function generateMetadata({
  params,
}: LangPageProps): Promise<Metadata> {
  return metadataDoDocumento('terms', await routeLanguage(params));
}

export default async function Pagina({ params }: LangPageProps) {
  return <DocumentoLegal qual="terms" idioma={await routeLanguage(params)} />;
}
