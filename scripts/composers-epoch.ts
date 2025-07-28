import { PrismaClient } from '@prisma/client';
import * as readline from 'readline';

const prisma = new PrismaClient();

// Interfaces
interface EpochInfo {
  id: string;
  name: string;
  startYear: number;
  endYear: number;
}

interface ComposerData {
  id: string;
  name: string;
  fullName: string;
  birthDate: string | null;
  deathDate: string | null;
  epochId: string;
  epochName: string | null; // ← IMPORTANTE: Pode ser null
  worksCount: number;
}

interface ComposerCorrection {
  id: string;
  name: string;
  fullName: string;
  birthDate: string | null;
  deathDate: string | null;
  currentEpochName: string | null;
  correctEpochName: string;
  currentEpochId: string;
  correctEpochId: string;
  reason: string;
  worksCount: number;
  hasEpochNameMismatch: boolean; // ← NOVO: Para identificar inconsistências
}

// 🆕 INTERFACE PARA INCONSISTÊNCIAS EPOCHNAME
interface EpochNameInconsistency {
  id: string;
  name: string;
  fullName: string;
  currentEpochId: string;
  currentEpochName: string | null;
  correctEpochName: string;
  worksCount: number;
}

// Definição das épocas
const EPOCHS: EpochInfo[] = [
  {
    id: '685d59bc1e3db0c5aaa8941b',
    name: 'Medieval',
    startYear: 476,
    endYear: 1399,
  },
  {
    id: '685d59d81e3db0c5aaa89425',
    name: 'Renascentista',
    startYear: 1400,
    endYear: 1599,
  },
  {
    id: '685d59e11e3db0c5aaa8942d',
    name: 'Barroco',
    startYear: 1600,
    endYear: 1749,
  },
  {
    id: '685d59eb1e3db0c5aaa89435',
    name: 'Clássico',
    startYear: 1750,
    endYear: 1819,
  },
  {
    id: '685d59f31e3db0c5aaa89439',
    name: 'Romântico',
    startYear: 1820,
    endYear: 1910,
  },
  {
    id: '685d59ff1e3db0c5aaa8943f',
    name: 'Modernismo',
    startYear: 1911,
    endYear: 1949,
  },
  {
    id: '685d5a061e3db0c5aaa89443',
    name: 'Contemporâneo',
    startYear: 1950,
    endYear: 2024,
  },
];

// Lista de compositores famosos (mantendo sua lista original)
const FAMOUS_COMPOSERS_EPOCHS: Record<string, string> = {
  // MEDIEVAL (476-1399)
  'guillaume de machaut': 'Medieval',
  machaut: 'Medieval',
  pérotin: 'Medieval',
  perotin: 'Medieval',
  léonin: 'Medieval',
  leonin: 'Medieval',
  'hildegard von bingen': 'Medieval',
  hildegard: 'Medieval',
  'guillaume dufay': 'Medieval',
  dufay: 'Medieval',
  // ... (mantendo toda sua lista original)

  // BARROCO (1600-1749) - Exemplos principais
  'johann sebastian bach': 'Barroco',
  bach: 'Barroco',
  'j.s. bach': 'Barroco',
  'george frideric handel': 'Barroco',
  handel: 'Barroco',
  händel: 'Barroco',
  'antonio vivaldi': 'Barroco',
  vivaldi: 'Barroco',

  // CLÁSSICO (1750-1819)
  'wolfgang amadeus mozart': 'Clássico',
  mozart: 'Clássico',
  'w.a. mozart': 'Clássico',
  'joseph haydn': 'Clássico',
  haydn: 'Clássico',
  'ludwig van beethoven': 'Clássico',
  beethoven: 'Clássico',

  // ROMÂNTICO (1820-1910)
  'franz schubert': 'Romântico',
  schubert: 'Romântico',
  'frédéric chopin': 'Romântico',
  'frederic chopin': 'Romântico',
  chopin: 'Romântico',
  'robert schumann': 'Romântico',
  schumann: 'Romântico',

  // MODERNISMO (1911-1949)
  'claude debussy': 'Modernismo',
  debussy: 'Modernismo',
  'maurice ravel': 'Modernismo',
  ravel: 'Modernismo',
  'igor stravinsky': 'Modernismo',
  stravinsky: 'Modernismo',

  // CONTEMPORÂNEO (1950-2024)
  'john cage': 'Contemporâneo',
  cage: 'Contemporâneo',
  'philip glass': 'Contemporâneo',
  glass: 'Contemporâneo',
  'steve reich': 'Contemporâneo',
  reich: 'Contemporâneo',
  // ... (inclua o resto da sua lista aqui)
};

// Função para extrair ano de uma string de data
function extractYear(dateString: string | null): number | null {
  if (!dateString) return null;
  const yearMatch = dateString.match(/\b(1[0-9]{3}|20[0-9]{2})\b/);
  if (yearMatch) {
    return parseInt(yearMatch[0]);
  }
  return null;
}

// Função para determinar época baseada no ano
function getEpochByYear(year: number): EpochInfo | null {
  return (
    EPOCHS.find((epoch) => year >= epoch.startYear && year <= epoch.endYear) ||
    null
  );
}

// Função para obter nome da época pelo ID
function getEpochNameById(epochId: string): string {
  const epoch = EPOCHS.find((e) => e.id === epochId);
  return epoch ? epoch.name : 'Desconhecida';
}

// Função para determinar época correta do compositor
function getCorrectEpoch(
  composer: ComposerData
): { epochId: string; epochName: string; reason: string } | null {
  const normalizedName = composer.name.toLowerCase().trim();
  const normalizedFullName = composer.fullName.toLowerCase().trim();

  // 1. Verificar lista de compositores famosos conhecidos
  if (
    FAMOUS_COMPOSERS_EPOCHS[normalizedName] ||
    FAMOUS_COMPOSERS_EPOCHS[normalizedFullName]
  ) {
    const correctEpochName =
      FAMOUS_COMPOSERS_EPOCHS[normalizedName] ||
      FAMOUS_COMPOSERS_EPOCHS[normalizedFullName];
    const epoch = EPOCHS.find((e) => e.name === correctEpochName);
    if (epoch) {
      return {
        epochId: epoch.id,
        epochName: epoch.name,
        reason: 'Lista de compositores famosos',
      };
    }
  }

  // 2. Baseado na data de nascimento (período produtivo: +25 anos)
  const birthYear = extractYear(composer.birthDate);
  if (birthYear) {
    const productiveYear = birthYear + 25;
    const epoch = getEpochByYear(productiveYear);
    if (epoch) {
      return {
        epochId: epoch.id,
        epochName: epoch.name,
        reason: `Baseado no ano de nascimento (${birthYear}) + período produtivo`,
      };
    }
  }

  // 3. Baseado na data de morte (-25 anos)
  const deathYear = extractYear(composer.deathDate);
  if (deathYear) {
    const productiveYear = deathYear - 25;
    const epoch = getEpochByYear(productiveYear);
    if (epoch) {
      return {
        epochId: epoch.id,
        epochName: epoch.name,
        reason: `Baseado no ano de morte (${deathYear}) - período produtivo`,
      };
    }
  }

  return null;
}

// 🆕 FUNÇÃO PARA VERIFICAR INCONSISTÊNCIAS DE EPOCHNAME
async function findEpochNameInconsistencies(): Promise<
  EpochNameInconsistency[]
> {
  console.log('🔍 Buscando inconsistências entre epochId e epochName...\n');

  // Buscar compositores onde epochName não corresponde ao epochId
  const composers = await prisma.composer.findMany({
    select: {
      id: true,
      name: true,
      fullName: true,
      epochId: true,
      epochName: true,
      _count: {
        select: {
          works: true,
        },
      },
    },
    orderBy: {
      works: {
        _count: 'desc',
      },
    },
    take: 500, // Verificar top 500 compositores
  });

  const inconsistencies: EpochNameInconsistency[] = [];

  for (const composer of composers) {
    const correctEpochName = getEpochNameById(composer.epochId);

    // Verificar se epochName está inconsistente
    if (composer.epochName !== correctEpochName) {
      inconsistencies.push({
        id: composer.id,
        name: composer.name,
        fullName: composer.fullName,
        currentEpochId: composer.epochId,
        currentEpochName: composer.epochName,
        correctEpochName: correctEpochName,
        worksCount: composer._count.works,
      });
    }
  }

  return inconsistencies;
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

// 🆕 FUNÇÃO PRINCIPAL MELHORADA
async function analyzeAndFixComposerEpochs(): Promise<void> {
  try {
    console.log('🎼 CORRETOR DE ÉPOCAS DOS COMPOSITORES - VERSÃO MELHORADA\n');
    console.log('Este script irá:');
    console.log('1. ✅ Verificar inconsistências entre epochId e epochName');
    console.log('2. ✅ Analisar os compositores com épocas incorretas');
    console.log('3. ✅ Corrigir AMBOS epochId E epochName simultaneamente');
    console.log('4. ✅ Aplicar todas as correções necessárias\n');

    // 🆕 PASSO 1: Verificar inconsistências de epochName
    console.log('📋 PASSO 1: VERIFICANDO INCONSISTÊNCIAS DE EPOCHNAME...\n');

    const epochNameInconsistencies = await findEpochNameInconsistencies();

    if (epochNameInconsistencies.length > 0) {
      console.log(
        `❌ Encontradas ${epochNameInconsistencies.length} inconsistências de epochName:`
      );

      // Mostrar os 10 casos mais importantes
      const topInconsistencies = epochNameInconsistencies
        .sort((a, b) => b.worksCount - a.worksCount)
        .slice(0, 10);

      topInconsistencies.forEach((inc, index) => {
        console.log(`${index + 1}. ${inc.name} (${inc.worksCount} obras)`);
        console.log(`   epochId aponta para: "${inc.correctEpochName}"`);
        console.log(
          `   mas epochName está: "${inc.currentEpochName || 'null'}"\n`
        );
      });

      if (epochNameInconsistencies.length > 10) {
        console.log(
          `   ... e mais ${epochNameInconsistencies.length - 10} casos\n`
        );
      }
    } else {
      console.log('✅ Nenhuma inconsistência de epochName encontrada!\n');
    }

    // PASSO 2: Análise de épocas incorretas (código original melhorado)
    console.log('📋 PASSO 2: ANALISANDO ÉPOCAS INCORRETAS...\n');

    const topComposers: ComposerData[] = await prisma.composer
      .findMany({
        select: {
          id: true,
          name: true,
          fullName: true,
          birthDate: true,
          deathDate: true,
          epochId: true,
          epochName: true,
          _count: {
            select: {
              works: true,
            },
          },
        },
        orderBy: {
          works: {
            _count: 'desc',
          },
        },
        take: 300,
      })
      .then((composers) =>
        composers.map((composer) => ({
          id: composer.id,
          name: composer.name,
          fullName: composer.fullName,
          birthDate: composer.birthDate,
          deathDate: composer.deathDate,
          epochId: composer.epochId,
          epochName: composer.epochName,
          worksCount: composer._count.works,
        }))
      );

    const corrections: ComposerCorrection[] = [];
    const epochCounts: Record<string, number> = {};

    for (const composer of topComposers) {
      const currentEpochName =
        composer.epochName || getEpochNameById(composer.epochId);
      epochCounts[currentEpochName] = (epochCounts[currentEpochName] || 0) + 1;

      const correctEpoch = getCorrectEpoch(composer);
      const correctEpochNameForId = getEpochNameById(composer.epochId);

      // Verificar se precisa correção (época errada OU epochName inconsistente)
      const needsEpochCorrection =
        correctEpoch && correctEpoch.epochId !== composer.epochId;
      const hasEpochNameMismatch = composer.epochName !== correctEpochNameForId;

      if (needsEpochCorrection || hasEpochNameMismatch) {
        const finalCorrectEpoch = correctEpoch || {
          epochId: composer.epochId,
          epochName: correctEpochNameForId,
          reason: 'Correção de epochName inconsistente',
        };

        corrections.push({
          id: composer.id,
          name: composer.name,
          fullName: composer.fullName,
          birthDate: composer.birthDate,
          deathDate: composer.deathDate,
          currentEpochName: composer.epochName,
          correctEpochName: finalCorrectEpoch.epochName,
          currentEpochId: composer.epochId,
          correctEpochId: finalCorrectEpoch.epochId,
          reason: finalCorrectEpoch.reason,
          worksCount: composer.worksCount,
          hasEpochNameMismatch: hasEpochNameMismatch,
        });
      }
    }

    // Exibir estatísticas
    console.log('📊 DISTRIBUIÇÃO ATUAL POR ÉPOCAS:');
    Object.entries(epochCounts)
      .sort(([, a], [, b]) => b - a)
      .forEach(([epoch, count]) => {
        console.log(`- ${epoch}: ${count} compositores`);
      });

    console.log(`\n🔍 RESUMO DA ANÁLISE:`);
    console.log(
      `- Inconsistências de epochName: ${epochNameInconsistencies.length}`
    );
    console.log(
      `- Correções de época necessárias: ${
        corrections.filter((c) => !c.hasEpochNameMismatch).length
      }`
    );
    console.log(`- Total de correções: ${corrections.length}`);
    console.log(
      `- Compositores corretos: ${topComposers.length - corrections.length}\n`
    );

    if (corrections.length > 0) {
      console.log('🔧 TODAS AS CORREÇÕES NECESSÁRIAS:\n');

      // Separar por tipo de correção
      const epochCorrections = corrections.filter(
        (c) => !c.hasEpochNameMismatch
      );
      const nameCorrections = corrections.filter(
        (c) => c.hasEpochNameMismatch && c.currentEpochId === c.correctEpochId
      );
      const bothCorrections = corrections.filter(
        (c) => c.hasEpochNameMismatch && c.currentEpochId !== c.correctEpochId
      );

      if (epochCorrections.length > 0) {
        console.log(`🔄 Correções de Época (${epochCorrections.length}):`);
        epochCorrections.slice(0, 5).forEach((correction, index) => {
          console.log(`${index + 1}. ${correction.name}`);
          console.log(
            `   ${correction.currentEpochName} → ${correction.correctEpochName}`
          );
          console.log(`   Razão: ${correction.reason}\n`);
        });
      }

      if (nameCorrections.length > 0) {
        console.log(
          `📝 Correções só de epochName (${nameCorrections.length}):`
        );
        nameCorrections.slice(0, 5).forEach((correction, index) => {
          console.log(`${index + 1}. ${correction.name}`);
          console.log(
            `   epochName: "${correction.currentEpochName}" → "${correction.correctEpochName}"`
          );
          console.log(`   (epochId já está correto)\n`);
        });
      }

      if (bothCorrections.length > 0) {
        console.log(`🔄 Correções de Ambos (${bothCorrections.length}):`);
        bothCorrections.slice(0, 5).forEach((correction, index) => {
          console.log(`${index + 1}. ${correction.name}`);
          console.log(
            `   Época: ${correction.currentEpochName} → ${correction.correctEpochName}`
          );
          console.log(`   (corrigindo epochId + epochName)\n`);
        });
      }

      // Confirmar aplicação
      const rl = createReadlineInterface();
      const answer = await askQuestion(
        rl,
        `🚀 Aplicar todas as ${corrections.length} correções (epochId + epochName)? (s/N): `
      );
      rl.close();

      if (answer.toLowerCase() === 's' || answer.toLowerCase() === 'sim') {
        console.log('\n🔄 Aplicando correções...\n');

        let successCount = 0;
        let errorCount = 0;

        for (const correction of corrections) {
          try {
            // 🆕 CORREÇÃO MELHORADA: Atualiza AMBOS epochId e epochName
            await prisma.composer.update({
              where: { id: correction.id },
              data: {
                epochId: correction.correctEpochId,
                epochName: correction.correctEpochName, // ← NOVO: Atualiza epochName também!
              },
            });

            successCount++;
            const changeType = correction.hasEpochNameMismatch
              ? correction.currentEpochId === correction.correctEpochId
                ? 'epochName'
                : 'ambos'
              : 'epochId';

            console.log(
              `✅ ${successCount}/${corrections.length}: ${correction.name} → ${correction.correctEpochName} (${changeType})`
            );
          } catch (error) {
            errorCount++;
            const errorMessage =
              error instanceof Error ? error.message : 'Erro desconhecido';
            console.log(
              `❌ Erro ao atualizar "${correction.name}": ${errorMessage}`
            );
          }
        }

        console.log(`\n🎉 CONCLUSÃO:`);
        console.log(`- ✅ Sucessos: ${successCount}`);
        console.log(`- ❌ Erros: ${errorCount}`);
        console.log(`- 📊 Total processado: ${corrections.length}\n`);

        // Verificação final
        console.log('✅ VERIFICAÇÃO FINAL: Checando consistência...\n');

        const finalInconsistencies = await findEpochNameInconsistencies();
        if (finalInconsistencies.length === 0) {
          console.log(
            '🎉 PERFEITO! Todas as inconsistências foram corrigidas!\n'
          );
        } else {
          console.log(
            `⚠️ Ainda restam ${finalInconsistencies.length} inconsistências para revisar.\n`
          );
        }
      } else {
        console.log('\n⏸️ Operação cancelada pelo usuário.\n');
      }
    } else {
      console.log('\n✨ Perfeito! Nenhuma correção necessária!\n');
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
  console.log('verificando...');
  const updatedWork = await prisma.work.findMany({
    where: {
      subtitle: {
        not: null,
      },
    },
    select: {
      id: true,
      title: true,
      subtitle: true,
    },
    take: 10000,
  });
  const ids = updatedWork.map((work) => work.id);
  const removedSubtitle = await prisma.work.updateMany({
    where: {
      id: {
        in: ids,
      },
    },
    data: {
      subtitle: null,
    },
  });

  console.log('updatedWork', removedSubtitle);
  // await analyzeAndFixComposerEpochs();
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
  analyzeAndFixComposerEpochs,
  findEpochNameInconsistencies,
  getCorrectEpoch,
  extractYear,
  FAMOUS_COMPOSERS_EPOCHS,
  EPOCHS,
  type ComposerData,
  type ComposerCorrection,
  type EpochNameInconsistency,
  type EpochInfo,
};
