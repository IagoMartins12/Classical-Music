import { PrismaClient } from '@prisma/client';
import * as readline from 'readline';

const prisma = new PrismaClient();

// Interfaces
interface NationalityCount {
  nationality: string;
  count: number;
}

interface NationalityUpdate {
  original: string;
  translated: string;
  count: number;
}

interface ComposerNationality {
  id: string;
  name: string;
  nationality: string | null;
}

// Mapeamento de nacionalidades inglês → português
const NATIONALITY_TRANSLATIONS: Record<string, string> = {
  // Principais nacionalidades
  German: 'Alemã',
  American: 'Americana',
  French: 'Francesa',
  English: 'Inglesa',
  Italian: 'Italiana',
  Austrian: 'Austríaca',
  Russian: 'Russa',
  Brazilian: 'Brasileira',
  Polish: 'Polonesa',
  Spanish: 'Espanhola',
  Belgian: 'Belga',
  Danish: 'Dinamarquesa',
  Czech: 'Tcheca',
  Dutch: 'Holandesa',
  Hungarian: 'Húngara',
  Swedish: 'Sueca',
  Swiss: 'Suíça',
  Norwegian: 'Norueguesa',
  Finnish: 'Finlandesa',

  // Outras nacionalidades comuns
  Portuguese: 'Portuguesa',
  Romanian: 'Romena',
  Croatian: 'Croata',
  Serbian: 'Sérvia',
  Bulgarian: 'Búlgara',
  Greek: 'Grega',
  Turkish: 'Turca',
  Japanese: 'Japonesa',
  Chinese: 'Chinesa',
  Korean: 'Coreana',
  Indian: 'Indiana',
  Australian: 'Australiana',
  Canadian: 'Canadense',
  Mexican: 'Mexicana',
  Argentine: 'Argentina',
  Argentinian: 'Argentina',
  Chilean: 'Chilena',
  Colombian: 'Colombiana',
  Venezuelan: 'Venezuelana',
  Peruvian: 'Peruana',
  Uruguayan: 'Uruguaia',
  Paraguayan: 'Paraguaia',
  Bolivian: 'Boliviana',
  Ecuadorian: 'Equatoriana',

  // Nacionalidades europeias adicionais
  Ukrainian: 'Ucraniana',
  Lithuanian: 'Lituana',
  Latvian: 'Letã',
  Estonian: 'Estoniana',
  Slovenian: 'Eslovena',
  Slovak: 'Eslovaca',
  Irish: 'Irlandesa',
  Scottish: 'Escocesa',
  Welsh: 'Galesa',
  Icelandic: 'Islandesa',
  Maltese: 'Maltesa',
  Luxembourgish: 'Luxemburguesa',
  Bohemian: 'Boêmia',
  Moravian: 'Morávia',
  Silesian: 'Silesiana',

  // África e Oriente Médio
  'South African': 'Sul-Africana',
  Egyptian: 'Egípcia',
  Moroccan: 'Marroquina',
  Tunisian: 'Tunisiana',
  Algerian: 'Argelina',
  Israeli: 'Israelense',
  Lebanese: 'Libanesa',
  Syrian: 'Síria',
  Iranian: 'Iraniana',
  Persian: 'Persa',

  // Variações e formas alternativas
  British: 'Britânica',
  UK: 'Britânica',
  'United Kingdom': 'Britânica',
  'United States': 'Americana',
  USA: 'Americana',
  US: 'Americana',
  USSR: 'Soviética',
  Soviet: 'Soviética',
  Czechoslovak: 'Tchecoslovaca',
  Czechoslovakian: 'Tchecoslovaca',
  Yugoslav: 'Iugoslava',
  Yugoslavian: 'Iugoslava',

  // Regiões históricas
  Prussian: 'Prussiana',
  Bavarian: 'Bávara',
  Alsatian: 'Alsaciana',
  Flemish: 'Flamenga',
  Walloon: 'Valônia',
  Catalan: 'Catalã',
  Basque: 'Basca',
  Galician: 'Galega',

  // Casos especiais (manter original se já estiver em português)
  Brasileira: 'Brasileira',
  Portuguesa: 'Portuguesa',
  Espanhola: 'Espanhola',
  Italiana: 'Italiana',
  Francesa: 'Francesa',
  Alemã: 'Alemã',
};

// Função para normalizar nacionalidade
function normalizeNationality(nationality: string): string {
  if (!nationality) return '';
  return nationality.trim().replace(/\s+/g, ' ');
}

// Função para traduzir nacionalidade
function translateNationality(nationality: string): string {
  const normalized = normalizeNationality(nationality);
  return NATIONALITY_TRANSLATIONS[normalized] || normalized;
}

// Função para criar interface readline
function createReadlineInterface(): readline.Interface {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
}

// Função para fazer pergunta ao usuário
function askQuestion(
  rl: readline.Interface,
  question: string
): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function analyzeAndTranslateNationalities(): Promise<void> {
  try {
    console.log('🌍 Iniciando análise de nacionalidades...\n');

    // Buscar todos os compositores com nacionalidade
    const composers: ComposerNationality[] = await prisma.composer.findMany({
      select: {
        id: true,
        name: true,
        nationality: true,
      },
      where: {
        nationality: {
          not: null,
        },
      },
    });

    console.log(
      `📊 Total de compositores com nacionalidade: ${composers.length}\n`
    );

    // Contar nacionalidades únicas
    const nationalityCounts: Record<string, number> = {};
    const composersByNationality: Record<string, ComposerNationality[]> = {};

    for (const composer of composers) {
      if (composer.nationality) {
        const normalized = normalizeNationality(composer.nationality);
        nationalityCounts[normalized] =
          (nationalityCounts[normalized] || 0) + 1;

        if (!composersByNationality[normalized]) {
          composersByNationality[normalized] = [];
        }
        composersByNationality[normalized].push(composer);
      }
    }

    // Ordenar por quantidade
    const sortedNationalities: NationalityCount[] = Object.entries(
      nationalityCounts
    )
      .map(([nationality, count]) => ({ nationality, count }))
      .sort((a, b) => b.count - a.count);

    // Exibir estatísticas atuais
    console.log('📈 NACIONALIDADES ATUAIS:');
    sortedNationalities.forEach((item, index) => {
      const translated = translateNationality(item.nationality);
      const needsTranslation = translated !== item.nationality;
      const status = needsTranslation ? '🔄 TRADUZIR' : '✅ OK';

      console.log(
        `${index + 1}. ${item.nationality}: ${
          item.count
        } compositores → ${translated} ${status}`
      );
    });

    // Identificar quais precisam ser traduzidas
    const needsTranslation: NationalityUpdate[] = sortedNationalities
      .filter((item) => {
        const translated = translateNationality(item.nationality);
        return translated !== item.nationality;
      })
      .map((item) => ({
        original: item.nationality,
        translated: translateNationality(item.nationality),
        count: item.count,
      }));

    console.log(`\n🔄 TOTAL DE NACIONALIDADES: ${sortedNationalities.length}`);
    console.log(`🔄 PRECISAM SER TRADUZIDAS: ${needsTranslation.length}`);
    console.log(
      `✅ JÁ ESTÃO CORRETAS: ${
        sortedNationalities.length - needsTranslation.length
      }\n`
    );

    if (needsTranslation.length > 0) {
      console.log('🔧 TRADUÇÕES QUE SERÃO APLICADAS:');
      needsTranslation.forEach((item, index) => {
        console.log(
          `${index + 1}. "${item.original}" → "${item.translated}" (${
            item.count
          } compositores)`
        );
      });

      // Calcular total de compositores afetados
      const totalComposersAffected = needsTranslation.reduce(
        (sum, item) => sum + item.count,
        0
      );
      console.log(
        `\n📊 Total de compositores que serão atualizados: ${totalComposersAffected}\n`
      );

      // Confirmar se deve aplicar as traduções
      const rl = createReadlineInterface();

      const answer = await askQuestion(
        rl,
        `🚀 Aplicar traduções em ${needsTranslation.length} nacionalidades? (s/N): `
      );

      rl.close();

      if (answer.toLowerCase() === 's' || answer.toLowerCase() === 'sim') {
        console.log('\n🔄 Aplicando traduções...\n');

        let successCount = 0;
        let errorCount = 0;
        let totalProcessed = 0;

        for (const translation of needsTranslation) {
          try {
            // Buscar compositores com esta nacionalidade
            const composersToUpdate =
              composersByNationality[translation.original];

            if (composersToUpdate && composersToUpdate.length > 0) {
              // Atualizar em lote
              await prisma.composer.updateMany({
                where: {
                  id: {
                    in: composersToUpdate.map((c) => c.id),
                  },
                },
                data: {
                  nationality: translation.translated,
                },
              });

              successCount++;
              totalProcessed += composersToUpdate.length;

              console.log(
                `✅ ${successCount}/${needsTranslation.length}: "${translation.original}" → "${translation.translated}" (${composersToUpdate.length} compositores)`
              );
            }
          } catch (error) {
            errorCount++;
            const errorMessage =
              error instanceof Error ? error.message : 'Erro desconhecido';
            console.log(
              `❌ Erro ao traduzir "${translation.original}": ${errorMessage}`
            );
          }
        }

        console.log(`\n🎉 CONCLUSÃO:`);
        console.log(`- ✅ Nacionalidades traduzidas: ${successCount}`);
        console.log(`- ❌ Erros: ${errorCount}`);
        console.log(
          `- 📊 Total de compositores atualizados: ${totalProcessed}`
        );
        console.log(
          `- 🌍 Total de nacionalidades processadas: ${needsTranslation.length}\n`
        );

        // Verificação final
        console.log('🔍 Verificando resultado...\n');

        const updatedComposers = await prisma.composer.findMany({
          select: { nationality: true },
          where: { nationality: { not: null } },
        });

        const finalCounts: Record<string, number> = {};
        for (const composer of updatedComposers) {
          if (composer.nationality) {
            finalCounts[composer.nationality] =
              (finalCounts[composer.nationality] || 0) + 1;
          }
        }

        console.log('📊 NACIONALIDADES APÓS TRADUÇÃO (Top 10):');
        Object.entries(finalCounts)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 10)
          .forEach(([nationality, count], index) => {
            console.log(`${index + 1}. ${nationality}: ${count} compositores`);
          });
      } else {
        console.log('\n⏸️ Operação cancelada pelo usuário.\n');
      }
    } else {
      console.log(
        '\n✨ Nenhuma tradução necessária! Todas as nacionalidades já estão em português.\n'
      );
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('❌ Erro durante a execução:', errorMessage);
  } finally {
    await prisma.$disconnect();
  }
}

// Função principal
async function main(): Promise<void> {
  console.log('🌍 TRADUTOR DE NACIONALIDADES\n');
  console.log('Este script irá:');
  console.log('1. Analisar todas as nacionalidades dos compositores');
  console.log('2. Identificar quais estão em inglês');
  console.log('3. Traduzir para português');
  console.log('4. Aplicar as traduções no banco de dados\n');

  await analyzeAndTranslateNationalities();
}

// Executar script
if (require.main === module) {
  main().catch((error) => {
    const errorMessage =
      error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('❌ Erro fatal:', errorMessage);
    process.exit(1);
  });
}

export {
  analyzeAndTranslateNationalities,
  translateNationality,
  NATIONALITY_TRANSLATIONS,
  type NationalityCount,
  type NationalityUpdate,
  type ComposerNationality,
};
