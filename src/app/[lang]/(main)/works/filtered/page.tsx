// app/[lang]/(main)/works/filtered/page.tsx — o catálogo com filtros,
// busca ou paginação
//
// **Esta rota não é para ser acessada direto.** Ela existe para que `/works`
// possa ser estática: o `middleware.ts` reescreve para cá quando a URL traz
// query string, e redireciona para `/works` quem chegar aqui pelo endereço. O
// que ela desenha é o mesmo de `../page.tsx` — ver `../view.tsx`.
import { Metadata } from 'next';
import {
  routeLanguage,
  type LangParams,
} from '@/app/utils/translations/routeLanguage';
import { WorksView, worksMetadata, type WorksSearchParams } from '../view';

interface FilteredWorksPageProps {
  params: LangParams;
  searchParams: Promise<WorksSearchParams>;
}

// Com parâmetro não há o que guardar: cada combinação é uma resposta.
export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
  searchParams,
}: FilteredWorksPageProps): Promise<Metadata> {
  return worksMetadata(await routeLanguage(params), await searchParams);
}

export default async function FilteredWorksPage({
  params,
  searchParams,
}: FilteredWorksPageProps) {
  const language = await routeLanguage(params);

  return <WorksView searchParams={await searchParams} language={language} />;
}
