// // scripts/difficulty-analyzer.ts - Analisador Standalone (opcional)

// import { PrismaClient } from '@prisma/client';
// import { FileManager, ScraperLogger } from './difficulty-utils';

// const prisma = new PrismaClient();
// const logger = new ScraperLogger('difficulty-analyzer.log');

// interface AnalysisReport {
//   summary: {
//     totalEntries: number;
//     validEntries: number;
//     invalidEntries: number;
//     matchedInDatabase: number;
//     notMatchedInDatabase: number;
//     validationErrors: string[];
//   };
//   matches: {
//     perfectMatches: number;
//     titleMatches: number;
//     noMatches: number;
//     duplicates: number;
//   };
//   difficulties: {
//     byLevel: Record<string, number>;
//     bySystem: Record<string, number>;
//     averageLevel: number;
//   };
//   recommendations: string[];
// }

// class DifficultyAnalyzer {
//   async analyzeResultsFile(
//     resultsFile: string = 'difficulty-analysis-results.json'
//   ): Promise<AnalysisReport> {
//     try {
//       await logger.info('🔍 Iniciando análise detalhada dos resultados');

//       const data = await FileManager.safeReadJson(resultsFile, {
//         foundEntries: [],
//         matchedWorks: [],
//       });
//       const { foundEntries, matchedWorks } = data;

//       const report: AnalysisReport = {
//         summary: {
//           totalEntries: foundEntries.length,
//           validEntries: 0,
//           invalidEntries: 0,
//           matchedInDatabase: matchedWorks.length,
//           notMatchedInDatabase: 0,
//           validationErrors: [],
//         },
//         matches: {
//           perfectMatches: 0,
//           titleMatches: 0,
//           noMatches: 0,
//           duplicates: 0,
//         },
//         difficulties: {
//           byLevel: {},
//           bySystem: {},
//           averageLevel: 0,
//         },
//         recommendations: [],
//       };

//       // Análise das entradas
//       for (const entry of foundEntries) {
//         // Validação básica
//         if (
//           entry.workTitle &&
//           entry.composerName &&
//           entry.sourceId &&
//           entry.difficultyLevel
//         ) {
//           report.summary.validEntries++;
//         } else {
//           report.summary.invalidEntries++;
//           if (!entry.workTitle)
//             report.summary.validationErrors.push('Título faltando');
//           if (!entry.composerName)
//             report.summary.validationErrors.push('Compositor faltando');
//           if (!entry.sourceId)
//             report.summary.validationErrors.push('Source ID faltando');
//           if (!entry.difficultyLevel)
//             report.summary.validationErrors.push(
//               'Nível de dificuldade faltando'
//             );
//         }

//         // Contagem por nível
//         if (entry.difficultyLevel) {
//           report.difficulties.byLevel[entry.difficultyLevel] =
//             (report.difficulties.byLevel[entry.difficultyLevel] || 0) + 1;
//         }

//         // Contagem por sistema
//         if (entry.difficultySystem) {
//           report.difficulties.bySystem[entry.difficultySystem] =
//             (report.difficulties.bySystem[entry.difficultySystem] || 0) + 1;
//         }
//       }

//       // Análise das correspondências
//       const permlinksFound = new Set();
//       const duplicatePermlinks = new Set();

//       for (const match of matchedWorks) {
//         if (permlinksFound.has(match.entry.permlink)) {
//           duplicatePermlinks.add(match.entry.permlink);
//           report.matches.duplicates++;
//         } else {
//           permlinksFound.add(match.entry.permlink);
//         }

//         // Verificar tipo de match
//         if (match.hasWorkScore) {
//           report.matches.perfectMatches++;
//         } else {
//           report.matches.titleMatches++;
//         }
//       }

//       report.summary.notMatchedInDatabase =
//         report.summary.totalEntries - report.summary.matchedInDatabase;
//       report.matches.noMatches = report.summary.notMatchedInDatabase;

//       // Calcular nível médio
//       const levels = Object.entries(report.difficulties.byLevel)
//         .map(([level, count]) => ({ level: parseInt(level), count }))
//         .filter(({ level }) => !isNaN(level));

//       if (levels.length > 0) {
//         const totalWeighted = levels.reduce(
//           (sum, { level, count }) => sum + level * count,
//           0
//         );
//         const totalCount = levels.reduce((sum, { count }) => sum + count, 0);
//         report.difficulties.averageLevel =
//           Math.round((totalWeighted / totalCount) * 10) / 10;
//       }

//       // Gerar recomendações
//       report.recommendations = this.generateRecommendations(report);

//       await logger.info('✅ Análise detalhada concluída', {
//         totalEntries: report.summary.totalEntries,
//         matchedInDatabase: report.summary.matchedInDatabase,
//         validEntries: report.summary.validEntries,
//       });

//       return report;
//     } catch (error) {
//       await logger.error('❌ Erro na análise detalhada', error);
//       throw error;
//     }
//   }

//   private generateRecommendations(report: AnalysisReport): string[] {
//     const recommendations: string[] = [];

//     // Taxa de correspondência
//     const matchRate =
//       (report.summary.matchedInDatabase / report.summary.totalEntries) * 100;
//     if (matchRate < 50) {
//       recommendations.push(
//         '⚠️ Taxa de correspondência baixa (<50%). Verifique se os permlinks estão corretos no banco de dados.'
//       );
//     } else if (matchRate < 75) {
//       recommendations.push(
//         '📊 Taxa de correspondência moderada. Considere melhorar a busca por títulos similares.'
//       );
//     } else {
//       recommendations.push(
//         '✅ Boa taxa de correspondência! O scraper está funcionando bem.'
//       );
//     }

//     // Entradas inválidas
//     if (report.summary.invalidEntries > 0) {
//       const invalidRate =
//         (report.summary.invalidEntries / report.summary.totalEntries) * 100;
//       recommendations.push(
//         `🔍 ${invalidRate.toFixed(
//           1
//         )}% das entradas têm dados faltando. Verifique a extração HTML.`
//       );
//     }

//     // Duplicatas
//     if (report.matches.duplicates > 0) {
//       recommendations.push(
//         `🔄 ${report.matches.duplicates} obras duplicadas encontradas. Considere implementar deduplicação.`
//       );
//     }

//     // Distribuição de níveis
//     const levelEntries = Object.entries(report.difficulties.byLevel);
//     if (levelEntries.length > 0) {
//       const [mostCommonLevel, count] = levelEntries.reduce((max, current) =>
//         current[1] > max[1] ? current : max
//       );
//       recommendations.push(
//         `📈 Nível mais comum: ${mostCommonLevel} (${count} obras)`
//       );
//     }

//     // Nível médio
//     if (report.difficulties.averageLevel > 0) {
//       if (report.difficulties.averageLevel < 4) {
//         recommendations.push(
//           '🎓 Maioria das obras são para iniciantes/intermediários.'
//         );
//       } else if (report.difficulties.averageLevel > 8) {
//         recommendations.push(
//           '🎼 Maioria das obras são avançadas/virtuosísticas.'
//         );
//       } else {
//         recommendations.push('⚖️ Boa distribuição de níveis de dificuldade.');
//       }
//     }

//     return recommendations;
//   }

//   async generateReport(
//     outputFile: string = 'difficulty-detailed-report.json'
//   ): Promise<void> {
//     const report = await this.analyzeResultsFile();
//     await FileManager.safeWriteJson(outputFile, report);

//     console.log('\n📋 RELATÓRIO DETALHADO DE ANÁLISE:');
//     console.log('='.repeat(60));
//     console.log(`📊 Total de entradas: ${report.summary.totalEntries}`);
//     console.log(`✅ Entradas válidas: ${report.summary.validEntries}`);
//     console.log(`❌ Entradas inválidas: ${report.summary.invalidEntries}`);
//     console.log(
//       `🎯 Correspondências no banco: ${report.summary.matchedInDatabase}`
//     );
//     console.log(`🚫 Não encontradas: ${report.summary.notMatchedInDatabase}`);
//     console.log(`📈 Nível médio: ${report.difficulties.averageLevel}`);

//     console.log('\n🎯 RECOMENDAÇÕES:');
//     report.recommendations.forEach((rec, i) => {
//       console.log(`${i + 1}. ${rec}`);
//     });

//     console.log(`\n💾 Relatório detalhado salvo em: ${outputFile}`);
//   }
// }

// // Executar se chamado diretamente
// if (require.main === module) {
//   const analyzer = new DifficultyAnalyzer();
//   analyzer.generateReport().catch(console.error);
// }

// export default DifficultyAnalyzer;
