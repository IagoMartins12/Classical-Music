import { MusicHistoryPageClient } from '@/app/components/MusicHistoryPageClient';
import {
  getComposersByEpoch,
  getEpochsHistoricalData,
  getComposersTimeline,
} from '@/app/requests/music-history';

export async function MusicHistoryPageServer() {
  try {
    // Executa as requests em paralelo para melhor performance
    const [epochsWithComposers, epochsHistoricalData, composersTimeline] =
      await Promise.all([
        getComposersByEpoch(),
        getEpochsHistoricalData(),
        getComposersTimeline(),
      ]);

    // Combina os dados das épocas com informações históricas
    const enrichedEpochs = epochsWithComposers.map((epoch) => {
      const historicalData = epochsHistoricalData.find(
        (h) => h.name === epoch.epochName
      );
      return {
        ...epoch,
        historicalData: historicalData || null,
      };
    });

    return (
      <MusicHistoryPageClient
        epochs={enrichedEpochs}
        composersTimeline={composersTimeline}
        // epochsHistoricalData={epochsHistoricalData}
      />
    );
  } catch (error) {
    console.error('Erro ao carregar dados da história musical:', error);

    // Fallback com dados mockados em caso de erro
    return <MusicHistoryPageClient epochs={[]} composersTimeline={[]} />;
  }
}
