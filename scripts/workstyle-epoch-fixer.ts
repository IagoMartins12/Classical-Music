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

interface WorkData {
  id: string;
  title: string;
  workStyle: string | null;
  epochId: string;
  composer: {
    name: string;
  } | null;
}

interface WorkUpdateInfo {
  id: string;
  title: string;
  composer: string | null;
  currentWorkStyle: string;
  currentEpochId: string;
  currentEpochName: string;
  correctEpochId: string;
  correctEpochName: string;
}

interface AnalysisStats {
  total: number;
  withWorkStyle: number;
  withEpochId: number;
  withBoth: number;
  inconsistent: number;
  needsUpdate: WorkUpdateInfo[];
}

interface WorkStyleCounts {
  [key: string]: number;
}

interface EpochCounts {
  [key: string]: number;
}

// Definição das épocas com seus IDs
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

// Mapeamento de workStyle (inglês) para época (português)
const WORKSTYLE_TO_EPOCH: Record<string, string> = {
  // Medieval
  medieval: 'Medieval',
  'middle ages': 'Medieval',
  gregorian: 'Medieval',
  'ars antiqua': 'Medieval',
  'ars nova': 'Medieval',

  // Renascentista
  renaissance: 'Renascentista',
  renascimento: 'Renascentista',
  'early renaissance': 'Renascentista',
  'high renaissance': 'Renascentista',
  'late renaissance': 'Renascentista',
  'ars perfecta': 'Renascentista',
  'franco-flemish': 'Renascentista',

  // Barroco
  baroque: 'Barroco',
  barroco: 'Barroco',
  'early baroque': 'Barroco',
  'high baroque': 'Barroco',
  'late baroque': 'Barroco',
  'galant style': 'Barroco',
  rococo: 'Barroco',

  // Clássico
  classical: 'Clássico',
  classico: 'Clássico',
  classic: 'Clássico',
  classicism: 'Clássico',
  galant: 'Clássico',
  'viennese classical': 'Clássico',
  'wiener klassik': 'Clássico',
  'classical period': 'Clássico',

  // Romântico
  romantic: 'Romântico',
  romantico: 'Romântico',
  romanticism: 'Romântico',
  'early romantic': 'Romântico',
  'high romantic': 'Romântico',
  'late romantic': 'Romântico',
  'post-romantic': 'Romântico',
  'romantic period': 'Romântico',
  nationalism: 'Romântico',
  nationalist: 'Romântico',

  // Modernismo
  'early 20th century': 'Modernismo',
  modernism: 'Modernismo',
  modernismo: 'Modernismo',
  impressionism: 'Modernismo',
  impressionist: 'Modernismo',
  expressionism: 'Modernismo',
  expressionist: 'Modernismo',
  neoclassicism: 'Modernismo',
  neoclassical: 'Modernismo',
  symbolism: 'Modernismo',
  symbolist: 'Modernismo',
  fauvism: 'Modernismo',
  dadaism: 'Modernismo',
  futurism: 'Modernismo',

  // Contemporâneo
  modern: 'Contemporâneo',
  contemporary: 'Contemporâneo',
  contemporaneo: 'Contemporâneo',
  'post-modern': 'Contemporâneo',
  postmodern: 'Contemporâneo',
  'avant-garde': 'Contemporâneo',
  minimalism: 'Contemporâneo',
  minimalist: 'Contemporâneo',
  '20th century': 'Contemporâneo',
  '21st century': 'Contemporâneo',
  serialism: 'Contemporâneo',
  'twelve-tone': 'Contemporâneo',
  dodecaphonic: 'Contemporâneo',
  aleatoric: 'Contemporâneo',
  electronic: 'Contemporâneo',
  electroacoustic: 'Contemporâneo',
  spectral: 'Contemporâneo',
  'new complexity': 'Contemporâneo',
};

// Função para normalizar string
function normalizeString(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ');
}

// Função para mapear workStyle para epochId
function getEpochIdFromWorkStyle(workStyle: string): string | null {
  if (!workStyle) return null;

  const normalized = normalizeString(workStyle);
  const epochName = WORKSTYLE_TO_EPOCH[normalized];

  if (epochName) {
    const epoch = EPOCHS.find((e) => e.name === epochName);
    return epoch ? epoch.id : null;
  }

  return null;
}

// Função para obter nome da época pelo ID
function getEpochNameById(epochId: string): string {
  const epoch = EPOCHS.find((e) => e.id === epochId);
  return epoch ? epoch.name : 'Desconhecida';
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

async function analyzeAndFixWorkStyles(): Promise<void> {
  try {
    console.log('🔍 Iniciando análise das obras...\n');

    // Buscar todas as obras
    const works: WorkData[] = await prisma.work.findMany({
      select: {
        id: true,
        title: true,
        workStyle: true,
        epochId: true,
        composer: {
          select: {
            name: true,
          },
        },
      },
    });

    console.log(`📊 Total de obras encontradas: ${works.length}\n`);

    // Análise inicial
    const stats: AnalysisStats = {
      total: works.length,
      withWorkStyle: 0,
      withEpochId: 0,
      withBoth: 0,
      inconsistent: 0,
      needsUpdate: [],
    };

    const workStyleCounts: WorkStyleCounts = {};
    const epochCounts: EpochCounts = {};

    console.log('📈 Analisando dados atuais...\n');

    for (const work of works) {
      // Contabilizar workStyle
      if (work.workStyle) {
        stats.withWorkStyle++;
        const normalized = normalizeString(work.workStyle);
        workStyleCounts[normalized] = (workStyleCounts[normalized] || 0) + 1;
      }

      // Contabilizar epochId
      if (work.epochId) {
        stats.withEpochId++;
        const epochName = getEpochNameById(work.epochId);
        epochCounts[epochName] = (epochCounts[epochName] || 0) + 1;
      }

      // Contabilizar ambos
      if (work.workStyle && work.epochId) {
        stats.withBoth++;
      }

      // Verificar inconsistências
      if (work.workStyle) {
        const correctEpochId = getEpochIdFromWorkStyle(work.workStyle);

        if (correctEpochId && correctEpochId !== work.epochId) {
          stats.inconsistent++;
          stats.needsUpdate.push({
            id: work.id,
            title: work.title,
            composer: work.composer?.name || null,
            currentWorkStyle: work.workStyle,
            currentEpochId: work.epochId,
            currentEpochName: getEpochNameById(work.epochId),
            correctEpochId: correctEpochId,
            correctEpochName: getEpochNameById(correctEpochId),
          });
        }
      }
    }

    // Exibir estatísticas
    console.log('📊 ESTATÍSTICAS ATUAIS:');
    console.log(`- Total de obras: ${stats.total}`);
    console.log(
      `- Com workStyle: ${stats.withWorkStyle} (${(
        (stats.withWorkStyle / stats.total) *
        100
      ).toFixed(1)}%)`
    );
    console.log(
      `- Com epochId: ${stats.withEpochId} (${(
        (stats.withEpochId / stats.total) *
        100
      ).toFixed(1)}%)`
    );
    console.log(
      `- Com ambos: ${stats.withBoth} (${(
        (stats.withBoth / stats.total) *
        100
      ).toFixed(1)}%)`
    );
    console.log(
      `- Inconsistentes: ${stats.inconsistent} (${(
        (stats.inconsistent / stats.total) *
        100
      ).toFixed(1)}%)\n`
    );

    // Exibir contagem de workStyles
    console.log('🎭 WORKSTYLES ENCONTRADOS:');
    Object.entries(workStyleCounts)
      .sort(([, a], [, b]) => b - a)
      .forEach(([style, count]) => {
        const mapped = WORKSTYLE_TO_EPOCH[style] || '❌ NÃO MAPEADO';
        console.log(`- "${style}": ${count} obras → ${mapped}`);
      });

    // Exibir contagem de épocas
    console.log('\n🏛️ ÉPOCAS ATUAIS:');
    Object.entries(epochCounts)
      .sort(([, a], [, b]) => b - a)
      .forEach(([epoch, count]) => {
        console.log(`- ${epoch}: ${count} obras`);
      });

    if (stats.needsUpdate.length > 0) {
      console.log('\n🔧 CORREÇÕES NECESSÁRIAS:');
      stats.needsUpdate.slice(0, 10).forEach((work, index) => {
        console.log(
          `${index + 1}. "${work.title}" (${
            work.composer || 'Compositor desconhecido'
          })`
        );
        console.log(`   WorkStyle: "${work.currentWorkStyle}"`);
        console.log(
          `   Atual: ${work.currentEpochName} → Correto: ${work.correctEpochName}\n`
        );
      });

      if (stats.needsUpdate.length > 10) {
        console.log(`... e mais ${stats.needsUpdate.length - 10} obras\n`);
      }

      // Confirmar se deve aplicar as correções
      const rl = createReadlineInterface();

      const answer = await askQuestion(
        rl,
        `🚀 Aplicar ${stats.needsUpdate.length} correções? (s/N): `
      );

      rl.close();

      if (answer.toLowerCase() === 's' || answer.toLowerCase() === 'sim') {
        console.log('\n🔄 Aplicando correções...\n');

        let successCount = 0;
        let errorCount = 0;

        for (const work of stats.needsUpdate) {
          try {
            await prisma.work.update({
              where: { id: work.id },
              data: { epochId: work.correctEpochId },
            });

            successCount++;
            console.log(
              `✅ ${successCount}/${stats.needsUpdate.length}: "${work.title}" → ${work.correctEpochName}`
            );
          } catch (error) {
            errorCount++;
            const errorMessage =
              error instanceof Error ? error.message : 'Erro desconhecido';
            console.log(
              `❌ Erro ao atualizar "${work.title}": ${errorMessage}`
            );
          }
        }

        console.log(`\n🎉 CONCLUSÃO:`);
        console.log(`- ✅ Sucessos: ${successCount}`);
        console.log(`- ❌ Erros: ${errorCount}`);
        console.log(`- 📊 Total processado: ${stats.needsUpdate.length}\n`);
      } else {
        console.log('\n⏸️ Operação cancelada pelo usuário.\n');
      }
    } else {
      console.log(
        '\n✨ Nenhuma correção necessária! Todos os dados estão consistentes.\n'
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
  console.log('🎵 CORRETOR DE WORKSTYLE → EPOCHID\n');
  console.log('Este script irá:');
  console.log('1. Analisar todas as obras');
  console.log('2. Identificar inconsistências entre workStyle e epochId');
  console.log('3. Aplicar correções baseadas no mapeamento\n');

  await analyzeAndFixWorkStyles();
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
  analyzeAndFixWorkStyles,
  getEpochIdFromWorkStyle,
  WORKSTYLE_TO_EPOCH,
  EPOCHS,
  type EpochInfo,
  type WorkData,
  type WorkUpdateInfo,
  type AnalysisStats,
};
