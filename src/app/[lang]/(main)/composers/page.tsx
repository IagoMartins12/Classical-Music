// app/[lang]/(main)/composers/page.tsx — a lista, sem filtro nem paginação
//
// Esta é a variante que o Next gera e guarda: ela não lê `searchParams`, e é
// por isso que pode ser estática. A variante com parâmetros mora em
// `filtered/page.tsx`; quem decide é o `middleware.ts`. Ver `view.tsx`.
import { Metadata } from 'next';
import {
  routeLanguage,
  type LangParams,
} from '@/app/utils/translations/routeLanguage';
import { ComposersView, composersMetadata } from './view';

interface ComposersPageProps {
  params: LangParams;
}

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: ComposersPageProps): Promise<Metadata> {
  return composersMetadata(await routeLanguage(params));
}

export default async function ComposersPage({ params }: ComposersPageProps) {
  const language = await routeLanguage(params);

  return <ComposersView page={1} search="" epochId="" language={language} />;
}
