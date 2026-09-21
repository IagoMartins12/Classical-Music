// main/music-history/pageServer.tsx
import { MusicHistoryPageClient } from '@/app/[lang]/(main)/music-history/pageClient';
import { TranslationProvider } from '@/app/context/TranslationContext';
import type { Language } from '@/app/utils/translations/serverTranslations';
import {
  getCachedComposersByEpochTranslated,
  getCachedComposersTimelineTranslated,
  getCachedEpochsHistoricalDataTranslated,
} from '@/app/requests/cached-requests/cached-music-history-functions';

import { loadPageTranslationsWithCommon } from '@/app/utils/translations/serverTranslations';

/**
 * O idioma chega de cima (do segmento `[lang]`), não do cookie: ler cookie
 * aqui tornaria a página dinâmica e desligaria o cache — ver
 * `utils/translations/routeLanguage.ts`.
 */
export async function MusicHistoryPageServer({
  language,
}: {
  language: Language;
}) {
  /**
   * **Sem `catch` que devolve conteúdo vazio, de propósito.**
   *
   * Esta página é guardada em cache. Devolver vazio quando a API falha produz
   * um HTTP 200 sem conteúdo — e o Next guarda exatamente isso, por todo o
   * tempo de revalidação. Uma instabilidade de trinta segundos durante uma
   * varredura do Google viraria página vazia indexada.
   *
   * Deixando o erro subir, o Next devolve 500 e **não guarda nada**: o pedido
   * seguinte tenta de novo.
   */

  // Executar requests com idioma - todas as funções já retornam dados traduzidos
  const [epochsWithComposers, epochsHistoricalData, composersTimeline] =
    await Promise.all([
      getCachedComposersByEpochTranslated(language),
      getCachedEpochsHistoricalDataTranslated(language), // ✅ Função adicionada
      getCachedComposersTimelineTranslated(language),
    ]);

  const enrichedEpochs = epochsWithComposers.map((epoch) => {
    const historicalData = epochsHistoricalData.find(
      (h) => h.name === epoch.epochName
    );
    return {
      ...epoch,
      historicalData: historicalData || epoch.historicalData, // Usa o que já vem traduzido
    };
  });

  const { translations } = await loadPageTranslationsWithCommon(language, [
    'pages/music-history',
  ]);
  return (
    <TranslationProvider language={language} translations={translations}>
      <MusicHistoryPageClient
        epochs={enrichedEpochs} // ✅ Dados já traduzidos
        composersTimeline={composersTimeline} // ✅ Dados já traduzidos
      />
    </TranslationProvider>
  );
}
