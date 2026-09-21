// app/[lang]/(main)/works/page.tsx — o catálogo, sem filtro nem paginação
//
// Esta é a variante que o Next gera e guarda: ela não lê `searchParams`, e é
// por isso que pode ser estática. A variante com parâmetros mora em
// `filtered/page.tsx`; quem decide é o `middleware.ts`. Ver `view.tsx`.
import { Metadata } from 'next';
import {
  routeLanguage,
  type LangParams,
} from '@/app/utils/translations/routeLanguage';
import { WorksView, worksMetadata } from './view';

interface WorksPageProps {
  params: LangParams;
}

export const revalidate = 1800; // 30 minutos

export async function generateMetadata({
  params,
}: WorksPageProps): Promise<Metadata> {
  return worksMetadata(await routeLanguage(params));
}

export default async function WorksPage({ params }: WorksPageProps) {
  const language = await routeLanguage(params);

  return <WorksView searchParams={{}} language={language} />;
}
