import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Interfaces para organizar os dados
interface TagFrequency {
  tag: string;
  count: number;
  percentage: number;
  source: 'composer' | 'work' | 'both';
  composerCount: number;
  workCount: number;
}

interface TagAnalysis {
  totalComposers: number;
  totalWorks: number;
  composersWithTags: number;
  worksWithTags: number;
  uniqueTags: number;
  tagFrequencies: TagFrequency[];
  topComposerTags: TagFrequency[];
  topWorkTags: TagFrequency[];
  commonTags: TagFrequency[];
  rareTags: TagFrequency[];
}

// Função para normalizar e extrair tags de string
function extractTagsFromString(tagString: string | null): string[] {
  if (!tagString) return [];

  // Diferentes separadores possíveis
  const separators = [',', ';', '|', '\n', '\t'];
  let tags = [tagString];

  // Aplicar cada separador
  for (const sep of separators) {
    tags = tags.flatMap((tag) => tag.split(sep));
  }

  // Limpar e normalizar
  return tags
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0)
    .map((tag) => tag.toLowerCase())
    .filter((tag) => tag.length > 2); // Filtrar tags muito curtas
}

// Função para normalizar array de tags
function normalizeTagArray(tags: string[]): string[] {
  return tags
    .map((tag) => tag.trim().toLowerCase())
    .filter((tag) => tag.length > 2);
}

// Função principal de análise
async function analyzeIMSLPTags(): Promise<TagAnalysis> {
  console.log('🔍 Iniciando análise de tags IMSLP...\n');

  // 1. Buscar dados dos compositores
  console.log('📊 Buscando dados dos compositores...');
  const composers = await prisma.composer.findMany({
    select: {
      id: true,
      name: true,
      imslpCategories: true,
      _count: {
        select: {
          works: true,
        },
      },
    },
    where: {
      imslpCategories: {
        not: null,
      },
    },
  });

  console.log(
    `   Encontrados ${composers.length} compositores com imslpCategories\n`
  );

  const deletedFavorits = await prisma.favoriteComposer.deleteMany();
  const deletedFavorits2 = await prisma.favoriteScore.deleteMany();
  const deletedFavorits3 = await prisma.favoriteWork.deleteMany();

  console.log('DELETADOS', {
    deletedFavorits,
    deletedFavorits2,
    deletedFavorits3,
  });

  // 2. Buscar dados das obras
  console.log('📊 Buscando dados das obras...');
  const works = await prisma.work.findMany({
    select: {
      id: true,
      title: true,
      imslpTags: true,
      composer: {
        select: {
          name: true,
        },
      },
    },
    where: {
      imslpTags: {
        isEmpty: false,
      },
    },
  });

  console.log(`   Encontradas ${works.length} obras com imslpTags\n`);

  // 3. Contar totais para contexto
  const totalComposers = await prisma.composer.count();
  const totalWorks = await prisma.work.count();

  // 4. Processar tags dos compositores
  console.log('⚙️ Processando tags dos compositores...');
  const composerTagMap = new Map<string, number>();

  for (const composer of composers) {
    const tags = extractTagsFromString(composer.imslpCategories);
    for (const tag of tags) {
      composerTagMap.set(tag, (composerTagMap.get(tag) || 0) + 1);
    }
  }

  // 5. Processar tags das obras
  console.log('⚙️ Processando tags das obras...');
  const workTagMap = new Map<string, number>();

  for (const work of works) {
    const tags = normalizeTagArray(work.imslpTags);
    for (const tag of tags) {
      workTagMap.set(tag, (workTagMap.get(tag) || 0) + 1);
    }
  }

  // 6. Combinar todas as tags
  console.log('🔄 Combinando e analisando dados...\n');
  const allTagsMap = new Map<
    string,
    { composerCount: number; workCount: number }
  >();

  // Adicionar tags de compositores
  for (const [tag, count] of composerTagMap) {
    allTagsMap.set(tag, {
      composerCount: count,
      workCount: workTagMap.get(tag) || 0,
    });
  }

  // Adicionar tags de obras que não estavam em compositores
  for (const [tag, count] of workTagMap) {
    if (!allTagsMap.has(tag)) {
      allTagsMap.set(tag, {
        composerCount: 0,
        workCount: count,
      });
    }
  }

  // 7. Criar frequências ordenadas
  const tagFrequencies: TagFrequency[] = [];
  const totalItems = totalComposers + totalWorks;

  for (const [tag, counts] of allTagsMap) {
    const totalCount = counts.composerCount + counts.workCount;
    const percentage = (totalCount / totalItems) * 100;

    let source: 'composer' | 'work' | 'both' = 'both';
    if (counts.composerCount === 0) source = 'work';
    else if (counts.workCount === 0) source = 'composer';

    tagFrequencies.push({
      tag,
      count: totalCount,
      percentage,
      source,
      composerCount: counts.composerCount,
      workCount: counts.workCount,
    });
  }

  // Ordenar por frequência
  tagFrequencies.sort((a, b) => b.count - a.count);

  // 8. Criar análises específicas
  const topComposerTags = [...composerTagMap.entries()]
    .map(([tag, count]) => ({
      tag,
      count,
      percentage: (count / composers.length) * 100,
      source: 'composer' as const,
      composerCount: count,
      workCount: workTagMap.get(tag) || 0,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  const topWorkTags = [...workTagMap.entries()]
    .map(([tag, count]) => ({
      tag,
      count,
      percentage: (count / works.length) * 100,
      source: 'work' as const,
      composerCount: composerTagMap.get(tag) || 0,
      workCount: count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  // Tags comuns (aparecem em ambas as tabelas)
  const commonTags = tagFrequencies
    .filter((tag) => tag.source === 'both')
    .slice(0, 15);

  // Tags raras mas interessantes (entre 1-5 ocorrências)
  const rareTags = tagFrequencies
    .filter((tag) => tag.count >= 1 && tag.count <= 5)
    .slice(0, 30);

  return {
    totalComposers,
    totalWorks,
    composersWithTags: composers.length,
    worksWithTags: works.length,
    uniqueTags: tagFrequencies.length,
    tagFrequencies: tagFrequencies.slice(0, 50), // Top 50
    topComposerTags,
    topWorkTags,
    commonTags,
    rareTags,
  };
}

// Função para exibir relatório detalhado
function displayAnalysisReport(analysis: TagAnalysis): void {
  console.log('🎼 RELATÓRIO COMPLETO DE ANÁLISE DE TAGS IMSLP\n');
  console.log('='.repeat(70));

  // Estatísticas gerais
  console.log('\n📊 ESTATÍSTICAS GERAIS:');
  console.log(
    `• Total de Compositores: ${analysis.totalComposers.toLocaleString()}`
  );
  console.log(
    `• Compositores com Tags: ${analysis.composersWithTags.toLocaleString()} (${(
      (analysis.composersWithTags / analysis.totalComposers) *
      100
    ).toFixed(1)}%)`
  );
  console.log(`• Total de Obras: ${analysis.totalWorks.toLocaleString()}`);
  console.log(
    `• Obras com Tags: ${analysis.worksWithTags.toLocaleString()} (${(
      (analysis.worksWithTags / analysis.totalWorks) *
      100
    ).toFixed(1)}%)`
  );
  console.log(
    `• Tags Únicas Encontradas: ${analysis.uniqueTags.toLocaleString()}`
  );

  // Top tags geral
  console.log('\n🏆 TOP 20 TAGS MAIS FREQUENTES (GERAL):');
  console.log('-'.repeat(70));
  analysis.tagFrequencies.slice(0, 20).forEach((tag, index) => {
    const sourceIcon =
      tag.source === 'composer' ? '👤' : tag.source === 'work' ? '🎵' : '🤝';
    console.log(
      `${(index + 1).toString().padStart(2)}. ${sourceIcon} ${tag.tag.padEnd(
        35
      )} | ${tag.count.toString().padStart(4)} (${tag.percentage.toFixed(1)}%)`
    );
    if (tag.source === 'both') {
      console.log(
        `     └─ Compositores: ${tag.composerCount} | Obras: ${tag.workCount}`
      );
    }
  });

  // Top tags de compositores
  console.log('\n👤 TOP 15 TAGS DE COMPOSITORES:');
  console.log('-'.repeat(70));
  analysis.topComposerTags.slice(0, 15).forEach((tag, index) => {
    console.log(
      `${(index + 1).toString().padStart(2)}. ${tag.tag.padEnd(
        40
      )} | ${tag.count.toString().padStart(4)} (${tag.percentage.toFixed(1)}%)`
    );
  });

  // Top tags de obras
  console.log('\n🎵 TOP 15 TAGS DE OBRAS:');
  console.log('-'.repeat(70));
  analysis.topWorkTags.slice(0, 15).forEach((tag, index) => {
    console.log(
      `${(index + 1).toString().padStart(2)}. ${tag.tag.padEnd(
        40
      )} | ${tag.count.toString().padStart(4)} (${tag.percentage.toFixed(1)}%)`
    );
  });

  // Tags comuns entre ambas as tabelas
  if (analysis.commonTags.length > 0) {
    console.log('\n🤝 TAGS COMUNS (Compositores + Obras):');
    console.log('-'.repeat(70));
    analysis.commonTags.forEach((tag, index) => {
      console.log(
        `${(index + 1).toString().padStart(2)}. ${tag.tag.padEnd(30)} | C: ${
          tag.composerCount
        } | O: ${tag.workCount} | Total: ${tag.count}`
      );
    });
  }

  // Tags raras interessantes
  console.log('\n💎 TAGS RARAS INTERESSANTES (1-5 ocorrências):');
  console.log('-'.repeat(70));
  analysis.rareTags.slice(0, 20).forEach((tag, index) => {
    const sourceIcon =
      tag.source === 'composer' ? '👤' : tag.source === 'work' ? '🎵' : '🤝';
    console.log(
      `${(index + 1).toString().padStart(2)}. ${sourceIcon} ${tag.tag.padEnd(
        40
      )} | ${tag.count}`
    );
  });

  // Análise de categorias
  console.log('\n🔍 ANÁLISE POR CATEGORIAS:');
  console.log('-'.repeat(70));

  const categories = {
    'Épocas/Períodos': analysis.tagFrequencies
      .filter((tag) =>
        /\b(medieval|renaissance|baroque|classical|romantic|modern|contemporary|century|period)\b/i.test(
          tag.tag
        )
      )
      .slice(0, 10),
    Nacionalidades: analysis.tagFrequencies
      .filter((tag) =>
        /\b(german|french|italian|russian|english|american|austrian|polish|czech|spanish|dutch|hungarian|scandinavian|composers?)\b/i.test(
          tag.tag
        )
      )
      .slice(0, 10),
    Instrumentos: analysis.tagFrequencies
      .filter((tag) =>
        /\b(piano|violin|orchestra|vocal|chamber|organ|guitar|flute|clarinet|trumpet|cello)\b/i.test(
          tag.tag
        )
      )
      .slice(0, 10),
    'Gêneros Musicais': analysis.tagFrequencies
      .filter((tag) =>
        /\b(symphony|sonata|concerto|opera|quartet|mass|motet|song|dance|march|waltz)\b/i.test(
          tag.tag
        )
      )
      .slice(0, 10),
  };

  Object.entries(categories).forEach(([category, tags]) => {
    if (tags.length > 0) {
      console.log(`\n• ${category}:`);
      tags.forEach((tag) => {
        console.log(`   - ${tag.tag} (${tag.count})`);
      });
    }
  });

  console.log('\n' + '='.repeat(70));
  console.log(
    '✅ Análise completa! Use essas informações para identificar tags importantes que podem ter sido perdidas.'
  );
  console.log(
    '💡 Foque especialmente nas tags com alta frequência e nas categorias específicas do seu interesse.\n'
  );
}

// Função para salvar resultado em arquivo (opcional)
async function saveAnalysisToFile(analysis: TagAnalysis): Promise<void> {
  const fs = await import('fs').then((m) => m.promises);

  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalComposers: analysis.totalComposers,
      composersWithTags: analysis.composersWithTags,
      totalWorks: analysis.totalWorks,
      worksWithTags: analysis.worksWithTags,
      uniqueTags: analysis.uniqueTags,
    },
    allTags: analysis.tagFrequencies,
    composerTags: analysis.topComposerTags,
    workTags: analysis.topWorkTags,
    commonTags: analysis.commonTags,
    rareTags: analysis.rareTags,
  };

  const filename = `imslp_tags_analysis_${new Date()
    .toISOString()
    .slice(0, 10)}.json`;
  await fs.writeFile(filename, JSON.stringify(report, null, 2));
  console.log(`📄 Relatório salvo em: ${filename}`);
}

// Função principal
async function main(): Promise<void> {
  try {
    console.log('🚀 Iniciando análise completa de tags IMSLP...\n');

    const analysis = await analyzeIMSLPTags();
    displayAnalysisReport(analysis);

    // Perguntar se quer salvar em arquivo
    const readline = await import('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const saveToFile = await new Promise<string>((resolve) => {
      rl.question(
        '💾 Salvar relatório detalhado em arquivo JSON? (s/N): ',
        resolve
      );
    });

    rl.close();

    if (
      saveToFile.toLowerCase() === 's' ||
      saveToFile.toLowerCase() === 'sim'
    ) {
      await saveAnalysisToFile(analysis);
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('❌ Erro durante a análise:', errorMessage);
  } finally {
    await prisma.$disconnect();
  }
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
  analyzeIMSLPTags,
  displayAnalysisReport,
  extractTagsFromString,
  normalizeTagArray,
  type TagFrequency,
  type TagAnalysis,
};
