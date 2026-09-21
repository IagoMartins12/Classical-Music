// app/[lang]/(main)/composers/filtered/page.tsx — a lista com busca,
// época ou paginação
//
// **Esta rota não é para ser acessada direto.** Ela existe para que
// `/composers` possa ser estática: o `middleware.ts` reescreve para cá quando
// a URL traz query string, e redireciona para `/composers` quem chegar aqui
// pelo endereço. O que ela desenha é o mesmo de `../page.tsx` — ver
// `../view.tsx`.
import { Metadata } from 'next';
import {
  routeLanguage,
  type LangParams,
} from '@/app/utils/translations/routeLanguage';
import {
  ComposersView,
  composersMetadata,
  type ComposersSearchParams,
} from '../view';

interface FilteredComposersPageProps {
  params: LangParams;
  searchParams: Promise<ComposersSearchParams>;
}

// Com parâmetro não há o que guardar: cada combinação é uma resposta.
export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
  searchParams,
}: FilteredComposersPageProps): Promise<Metadata> {
  return composersMetadata(await routeLanguage(params), await searchParams);
}

export default async function FilteredComposersPage({
  params,
  searchParams,
}: FilteredComposersPageProps) {
  const language = await routeLanguage(params);
  const resolved = await searchParams;

  return (
    <ComposersView
      page={Number(resolved.page) || 1}
      search={resolved.search || ''}
      epochId={resolved.epoch || ''}
      language={language}
    />
  );
}
