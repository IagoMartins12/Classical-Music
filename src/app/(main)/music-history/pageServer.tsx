// main/music-history/pageServer.tsx
import { MusicHistoryPageClient } from '@/app/main/music-history/pageClient';
import {
  getComposersByEpochTranslated,
  getComposersTimelineTranslated,
  getEpochsHistoricalDataTranslated,
} from '@/app/requests/music-history-translated';
import { getServerLanguage } from '@/app/utils/translations/serverTranslation';

export async function MusicHistoryPageServer() {
  try {
    // Detectar idioma no servidor
    const language = await getServerLanguage();

    // Executar requests com idioma - todas as funções já retornam dados traduzidos
    const [epochsWithComposers, epochsHistoricalData, composersTimeline] =
      await Promise.all([
        getComposersByEpochTranslated(language),
        getEpochsHistoricalDataTranslated(language), // ✅ Função adicionada
        getComposersTimelineTranslated(language),
      ]);

    // ✅ OPCIONAL: Se você quiser manter compatibilidade com o código antigo
    // Combina dados das épocas (mas os dados já vêm traduzidos)
    const enrichedEpochs = epochsWithComposers.map((epoch) => {
      const historicalData = epochsHistoricalData.find(
        (h) => h.name === epoch.epochName
      );
      return {
        ...epoch,
        historicalData: historicalData || epoch.historicalData, // Usa o que já vem traduzido
      };
    });

    return (
      <MusicHistoryPageClient
        epochs={enrichedEpochs} // ✅ Dados já traduzidos
        composersTimeline={composersTimeline} // ✅ Dados já traduzidos
      />
    );
  } catch (error) {
    console.error('Erro ao carregar dados da história musical:', error);
    return <MusicHistoryPageClient epochs={[]} composersTimeline={[]} />;
  }
}
