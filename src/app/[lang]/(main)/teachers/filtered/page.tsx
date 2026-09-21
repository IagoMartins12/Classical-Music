// app/[lang]/(main)/teachers/filtered/page.tsx — a lista com filtros
//
// **Esta rota não é para ser acessada direto.** Ela existe para que
// `/teachers` possa ser estática: o `middleware.ts` reescreve para cá quando a
// URL traz query string, e redireciona para `/teachers` quem chegar aqui pelo
// endereço. O que ela desenha é o mesmo de `../page.tsx` — ver `../view.tsx`.
import { Metadata } from 'next';
import {
  routeLanguage,
  type LangParams,
} from '@/app/utils/translations/routeLanguage';
import {
  TeachersView,
  teachersMetadata,
  toTeacherFilters,
  type TeacherSearchParams,
} from '../view';

interface FilteredTeachersPageProps {
  params: LangParams;
  searchParams?: Promise<TeacherSearchParams>;
}

// Com filtro não há o que guardar: cada combinação é uma resposta.
export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: FilteredTeachersPageProps): Promise<Metadata> {
  return teachersMetadata(await routeLanguage(params));
}

export default async function FilteredTeachersPage({
  params,
  searchParams,
}: FilteredTeachersPageProps) {
  await routeLanguage(params);

  return <TeachersView filters={toTeacherFilters(await searchParams)} />;
}
