// app/[lang]/(main)/teachers/page.tsx — a lista, sem filtro
//
// Esta é a variante que o Next gera e guarda: ela não lê `searchParams`, e é
// por isso que pode ser estática. A variante com filtros mora em
// `filtered/page.tsx`; quem decide é o `middleware.ts`. Ver `view.tsx`.
import { Metadata } from 'next';
import {
  routeLanguage,
  type LangParams,
} from '@/app/utils/translations/routeLanguage';
import {
  DEFAULT_TEACHER_FILTERS,
  TeachersView,
  teachersMetadata,
} from './view';

interface TeachersPageProps {
  params: LangParams;
}

// Lista pública de professores: ISR de uma hora.
export const revalidate = 3600;

export async function generateMetadata({
  params,
}: TeachersPageProps): Promise<Metadata> {
  return teachersMetadata(await routeLanguage(params));
}

export default async function PublicTeachersPage({
  params,
}: TeachersPageProps) {
  await routeLanguage(params);

  return <TeachersView filters={DEFAULT_TEACHER_FILTERS} />;
}
