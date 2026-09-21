// app/main/composers/pageServer.tsx
import ComposersClient from '@/app/[lang]/(main)/composers/pageClient';
import { TranslationProvider } from '@/app/context/TranslationContext';
import {
  getComposersCountTranslated,
  getComposersWithPaginationTranslated,
  getEpochsCacheTranslated,
} from '@/app/requests/composers-translated';
import {
  loadPageTranslationsWithCommon,
  type Language,
} from '@/app/utils/translations/serverTranslations';

const ITEMS_PER_PAGE = 30;

/**
 * O idioma chega de cima (do segmento `[lang]`), não do cookie: ler cookie
 * aqui tornaria a página dinâmica e desligaria o cache — ver
 * `utils/translations/routeLanguage.ts`.
 */
export default async function ComposersPageServer({
  page,
  search,
  epochId,
  language,
}: {
  page: number;
  search: string;
  epochId: string;
  language: Language;
}) {
  /**
   * **Sem `catch` que devolve lista vazia, de propósito.**
   *
   * Esta página é guardada em cache. Devolver uma lista vazia quando a API
   * falha produz um HTTP 200 sem conteúdo — e o Next guarda exatamente isso,
   * por todo o tempo de revalidação. Uma instabilidade de trinta segundos
   * durante uma varredura do Google viraria página vazia indexada.
   *
   * Deixando o erro subir, o Next devolve 500 e **não guarda nada**: o pedido
   * seguinte tenta de novo. Falha passageira vira indisponibilidade
   * passageira, que é o que ela é.
   */
  // Detectar idioma no servidor

  // Executar requests com idioma - todas as funções já retornam dados traduzidos
  const [composersData, epochsData, totalCount] = await Promise.all([
    getComposersWithPaginationTranslated(
      {
        page,
        limit: ITEMS_PER_PAGE,
        search,
        epochId,
      },
      language
    ),
    getEpochsCacheTranslated(language),
    getComposersCountTranslated({ search, epochId }),
  ]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  // Transformar dados das épocas para manter compatibilidade
  // (manter o formato original mas exibir nomes traduzidos)
  const epochs = epochsData.map((epoch) => ({
    id: epoch.id,
    name: epoch.name, // Nome original para filtros funcionarem
  }));
  const { translations } = await loadPageTranslationsWithCommon(language, [
    'pages/composers',
  ]);
  return (
    <TranslationProvider language={language} translations={translations}>
      <ComposersClient
        composers={composersData} // ✅ Dados já vêm com épocas traduzidas
        epochs={epochs} // ✅ Épocas com nomes originais para filtro funcionar
        currentPage={page}
        totalPages={totalPages}
        totalCount={totalCount}
        searchTerm={search}
        selectedEpoch={epochId}
      />
    </TranslationProvider>
  );
}
