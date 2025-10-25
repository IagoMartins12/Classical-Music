import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Interfaces

async function analyzeAndFixWorkStyles(): Promise<void> {
  try {
    console.log('🔍 Iniciando análise das obras...\n');
    const getArticles = await prisma.blogArticle.findFirst();
    const getCategories = await prisma.blogCategory.findFirst();
    const get = await prisma.blogArticleCategory.findFirst();
    const get2 = await prisma.blogArticleTag.findFirst();
    const get3 = await prisma.blogArticleVersion.findFirst();
    const get4 = await prisma.blogTag.findFirst();
    const get5 = await prisma.blogComment.findFirst();

    console.log(
      'dadosss',
      get,
      get2,
      get3,
      get4,
      get5,
      getArticles,
      getCategories
    );
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

export { analyzeAndFixWorkStyles };
