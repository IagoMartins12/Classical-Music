// Exemplo prático completo de configuração de preferências
// InstrumentsPageServer.tsx

import { InstrumentsPageClient } from './pageClient';
import { loadPageTranslationsWithCommon } from '@/app/utils/translations/serverTranslations';
import { TranslationProvider } from '@/app/context/TranslationContext';
import type { Language } from '@/app/utils/translations/serverTranslations';
import {
  getCachedInstrumentsStatsTranslated,
  getCachedInstrumentsWithWorksTranslated,
  getCachedTopComposersByInstrumentTranslated,
} from '@/app/requests/cached-requests/cached-instruments';

// A curadoria da página (instrumentos, compositores em destaque, obras
// escolhidas) mora na API desde a Etapa 3: `GET /instruments/showcase`, em
// `catalog/instruments/instrument-showcase.config.ts`.

// 🚀 IMPLEMENTAÇÃO NO SERVIDOR
/**
 * O idioma chega de cima (do segmento `[lang]`), não do cookie: ler cookie
 * aqui tornaria a página dinâmica e desligaria o cache — ver
 * `utils/translations/routeLanguage.ts`.
 */
export async function InstrumentsPageServer({
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

  const [instrumentsWithWorks, instrumentsStats, topComposersByInstrument] =
    await Promise.all([
      getCachedInstrumentsWithWorksTranslated(language),
      getCachedInstrumentsStatsTranslated(),
      getCachedTopComposersByInstrumentTranslated(),
    ]);

  const enrichedInstruments = instrumentsWithWorks.map((instrument) => {
    const stats = instrumentsStats.find(
      (s) => s.instrumentName === instrument.name
    );
    const topComposers = topComposersByInstrument.find(
      (t) => t.instrumentName === instrument.name
    );

    return {
      ...instrument,
      stats: stats || { totalWorks: 0, totalUsers: 0 },
      topComposers: topComposers?.topComposers || [],
    };
  });
  const { translations } = await loadPageTranslationsWithCommon(language, [
    'pages/instruments',
  ]);

  return (
    <TranslationProvider language={language} translations={translations}>
      <InstrumentsPageClient instruments={enrichedInstruments} />
    </TranslationProvider>
  );
}

// 📊 RESULTADO ESPERADO:
/*
  PIANO (20 obras):
  ✅ 6 de Chopin (incluindo Ballade No. 1 + Polonaise)
  ✅ 4 de Bach (incluindo Well-Tempered Clavier)
  ✅ 3 de Beethoven (quaisquer)
  ✅ 2 de Mozart (quaisquer)
  ✅ 5 de outros compositores (completa automaticamente)
  
  VIOLINO (18 obras):
  ✅ 4 de Vivaldi (incluindo Quatro Estações + Concerto em Lá menor)
  ✅ 4 de Paganini (incluindo Caprice 24 + Concerto 1)
  ✅ 3 de Bach (incluindo Partita 2)
  ✅ 7 de outros compositores
  
  VIOLONCELO (15 obras):
  ✅ 6 de Bach (incluindo Suítes 1, 2, 3)
  ✅ 2 de Dvořák (incluindo Concerto em Si menor)
  ✅ 1 de Elgar (Concerto em Mi menor)
  ✅ 6 de outros compositores
  
  E assim por diante para cada instrumento...
  */
