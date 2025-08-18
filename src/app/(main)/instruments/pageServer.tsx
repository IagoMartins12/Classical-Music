// Exemplo prático completo de configuração de preferências
// InstrumentsPageServer.tsx

import {
  getInstrumentsWithWorks,
  getInstrumentsStats,
  getTopComposersByInstrument,
  ComposerPreferences,
  WorksPreferences,
} from '@/app/requests/instruments-history';
import { InstrumentsPageClient } from './pageClient';

// 🎼 CONFIGURAÇÃO DE COMPOSITORES DESTAQUE
const composerPreferences: ComposerPreferences = {
  Piano: {
    preferredComposerId: '685e1087c6bd886c5b495d66', // Chopin como destaque para piano
  },
  Violino: {
    preferredComposerId: '685f0770c6bd886c5b4982af', // Paganini como destaque para violino
  },
  Violoncelo: {
    preferredComposerId: '685d8f9a8803000f9b61d151', // Bach como destaque para violoncelo
    // excludedComposerIds: ['composer-menor-id'], // Remove compositores menores
  },
  Órgão: {
    preferredComposerId: '685d8f9a8803000f9b61d151', // Bach também para órgão
  },
  Orquestra: {
    excludedComposerIds: ['683a7e9af8ced962eff7c0d8'], // Remove compositores menores
  },
};

// 🎯 CONFIGURAÇÃO GRANULAR DE OBRAS
const worksPreferences: WorksPreferences = {
  // PIANO: Repertório balanceado com obras obrigatórias
  Piano: {
    composerWorks: {
      '683bb049320ed96f5ac321a8': {
        count: 3, // 6 peças de Chopin
        // specificWorkTitles: [
        //   'Ballade No. 1', // OBRIGATÓRIA
        //   'Polonaise in A-flat major', // OBRIGATÓRIA
        // ],
        // Sistema vai buscar estas 2 específicas + 4 aleatórias de Chopin
      },
      // 'bach-id': {
      //   count: 4, // 4 peças de Bach
      // specificWorkTitles: [
      //   'Well-Tempered Clavier', // OBRIGATÓRIA
      // ],
      // Sistema vai buscar esta específica + 3 aleatórias de Bach
      // },
      // 'beethoven-id': {
      //   count: 3, // 3 peças de Beethoven (quaisquer)
      // },
      // 'mozart-id': {
      //   count: 2, // 2 peças de Mozart (quaisquer)
      // },
    },
    totalMaxWorks: 20, // Máximo de 20 obras
    fallbackToAutomatic: true, // Completa com outras obras se necessário
  },

  // VIOLINO: Foco em virtuosismo
  //   Violino: {
  //     composerWorks: {
  //       'vivaldi-id': {
  //         count: 4, // 4 peças de Vivaldi
  //         specificWorkTitles: [
  //           'Le quattro stagioni', // As Quatro Estações - OBRIGATÓRIA
  //           'Concerto in A minor', // OBRIGATÓRIA
  //         ],
  //       },
  //       'paganini-id': {
  //         count: 4, // 4 peças de Paganini
  //         specificWorkTitles: [
  //           'Caprice No. 24', // OBRIGATÓRIA
  //           'Violin Concerto No. 1', // OBRIGATÓRIA
  //         ],
  //       },
  //       'bach-id': {
  //         count: 3, // 3 peças de Bach
  //         specificWorkTitles: [
  //           'Partita No. 2', // OBRIGATÓRIA
  //         ],
  //       },
  //     },
  //     totalMaxWorks: 18,
  //     fallbackToAutomatic: true,
  //   },

  //   // VIOLONCELO: Repertório clássico essencial
  //   Violoncelo: {
  //     composerWorks: {
  //       'bach-id': {
  //         count: 6, // 6 peças de Bach (rei do violoncelo)
  //         specificWorkTitles: [
  //           'Suite No. 1 in G major', // OBRIGATÓRIA
  //           'Suite No. 2 in D minor', // OBRIGATÓRIA
  //           'Suite No. 3 in C major', // OBRIGATÓRIA
  //         ],
  //         // 3 específicas + 3 aleatórias de Bach
  //       },
  //       'dvorak-id': {
  //         count: 2, // 2 peças de Dvořák
  //         specificWorkTitles: [
  //           'Cello Concerto in B minor', // OBRIGATÓRIA
  //         ],
  //       },
  //       'elgar-id': {
  //         count: 1, // 1 peça de Elgar
  //         specificWorkTitles: [
  //           'Cello Concerto in E minor', // OBRIGATÓRIA
  //         ],
  //       },
  //     },
  //     totalMaxWorks: 15,
  //     fallbackToAutomatic: true,
  //   },

  //   // ÓRGÃO: Foco em Bach e música sacra
  //   Órgão: {
  //     composerWorks: {
  //       'bach-id': {
  //         count: 8, // 8 peças de Bach
  //         specificWorkTitles: [
  //           'Toccata and Fugue in D minor', // OBRIGATÓRIA
  //           'Passacaglia and Fugue in C minor', // OBRIGATÓRIA
  //           'Great Fantasia and Fugue', // OBRIGATÓRIA
  //         ],
  //       },
  //       'franck-id': {
  //         count: 3, // 3 peças de César Franck
  //         specificWorkTitles: [
  //           'Grande Pièce Symphonique', // OBRIGATÓRIA
  //         ],
  //       },
  //     },
  //     totalMaxWorks: 15,
  //     fallbackToAutomatic: true,
  //   },

  //   // HARPA: Repertório diversificado
  //   Harpa: {
  //     composerWorks: {
  //       'mozart-id': {
  //         count: 2, // 2 peças de Mozart
  //         specificWorkTitles: [
  //           'Concerto for Flute and Harp', // OBRIGATÓRIA
  //         ],
  //       },
  //       'debussy-id': {
  //         count: 3, // 3 peças de Debussy
  //         specificWorkTitles: [
  //           'Danses sacrée et profane', // OBRIGATÓRIA
  //         ],
  //       },
  //       'ravel-id': {
  //         count: 2, // 2 peças de Ravel
  //         specificWorkTitles: [
  //           'Introduction and Allegro', // OBRIGATÓRIA
  //         ],
  //       },
  //     },
  //     totalMaxWorks: 12,
  //     fallbackToAutomatic: true,
  //   },

  //   // CLAVICÓRDIO: Foco histórico
  //   Clavicórdio: {
  //     composerWorks: {
  //       'cpe-bach-id': {
  //         count: 4, // 4 peças de C.P.E. Bach
  //         specificWorkTitles: [
  //           'Prussian Sonatas', // OBRIGATÓRIAS
  //         ],
  //       },
  //       'js-bach-id': {
  //         count: 3, // 3 peças de J.S. Bach
  //         specificWorkTitles: [
  //           'Inventions', // OBRIGATÓRIAS
  //         ],
  //       },
  //     },
  //     totalMaxWorks: 10,
  //     fallbackToAutomatic: true,
  //   },

  //   // ORQUESTRA: Grandes sinfonias e concertos
  //   Orquestra: {
  //     composerWorks: {
  //       'beethoven-id': {
  //         count: 5, // 5 obras de Beethoven
  //         specificWorkTitles: [
  //           'Symphony No. 9', // OBRIGATÓRIA
  //           'Symphony No. 5', // OBRIGATÓRIA
  //           'Piano Concerto No. 5', // OBRIGATÓRIA
  //         ],
  //       },
  //       'mozart-id': {
  //         count: 4, // 4 obras de Mozart
  //         specificWorkTitles: [
  //           'Symphony No. 40', // OBRIGATÓRIA
  //           'Piano Concerto No. 21', // OBRIGATÓRIA
  //         ],
  //       },
  //       'tchaikovsky-id': {
  //         count: 3, // 3 obras de Tchaikovsky
  //         specificWorkTitles: [
  //           'Swan Lake', // OBRIGATÓRIA
  //         ],
  //       },
  //     },
  //     totalMaxWorks: 25, // Orquestra tem repertório mais amplo
  //     fallbackToAutomatic: true,
  //   },
};

// 🚀 IMPLEMENTAÇÃO NO SERVIDOR
export async function InstrumentsPageServer() {
  try {
    const [instrumentsWithWorks, instrumentsStats, topComposersByInstrument] =
      await Promise.all([
        getInstrumentsWithWorks(composerPreferences, worksPreferences), // 👈 Passa ambas as preferências
        getInstrumentsStats(),
        getTopComposersByInstrument(composerPreferences),
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

    return (
      <InstrumentsPageClient
        instruments={enrichedInstruments}
        // instrumentsStats={instrumentsStats}
      />
    );
  } catch (error) {
    console.error('Erro ao carregar dados dos instrumentos:', error);
    return (
      <InstrumentsPageClient
        instruments={[]}
        // instrumentsStats={[]}
        hasError={true}
      />
    );
  }
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
