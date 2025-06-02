// scripts/clear-composers.ts

import { PrismaClient } from '@prisma/client';
import readline from 'readline';

const prisma = new PrismaClient();

// Interface para criar prompt de confirmação
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Função para fazer pergunta e aguardar resposta
function askQuestion(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.toLowerCase().trim());
    });
  });
}

interface countComposersType {
  count: number;
  countWorks: number;
  countWorksCategorie: number;
}
// Função para contar registros na tabela
async function countComposers(): Promise<countComposersType> {
  try {
    const count = await prisma.categorie.count();
    const countWorks = await prisma.work.count({});
    const countWorksCategorie = await prisma.workCategorie.count({});
    return { count, countWorks, countWorksCategorie };
  } catch (error) {
    console.error('❌ Erro ao contar categorias:', error);
    return { count: 0, countWorks: 0, countWorksCategorie: 0 };
  }
}

// Função para limpar todos os compositores
async function clearAllComposers(): Promise<void> {
  try {
    console.log('🗑️  Iniciando limpeza da tabela composers...');

    const result = await prisma.categorie.deleteMany({});
    const resultWorks = await prisma.work.deleteMany({});
    const resultWorksCategorie = await prisma.workCategorie.deleteMany({});
    const resultGenre = await prisma.workGenre.deleteMany({});
    const resultGenreType = await prisma.workGenresTypes.deleteMany({});
    const resultGenreTypes = await prisma.genre.deleteMany({});

    console.log(
      `✅ Sucesso! \n ${result.count} categorias deletadas \n ${resultWorks.count} peças deletadas \n
      ${resultWorksCategorie.count} worksCategories deletadas \n ${resultGenre.count} generos deletados \n ${resultGenreType.count} genre types deletados`
    );
  } catch (error) {
    console.error('❌ Erro ao limpar tabela composers:', error);
    throw error;
  }
}

// Função principal
async function main(): Promise<void> {
  try {
    console.log('🧹 Script de Limpeza da Tabela Composers');
    console.log('=====================================\n');

    // Contar registros atuais
    const { count, countWorks, countWorksCategorie } = await countComposers();

    console.log(
      `📊 Atualmente há \n ${count} dados na tabela categoria \n ${countWorks} na tabela work \n${countWorksCategorie} na tabela worksCategories`
    );
    console.log(
      '⚠️  ATENÇÃO: Esta ação irá remover TODOS os dados da tabela categories, works e worksCategorie!'
    );
    console.log('⚠️  Esta ação NÃO PODE ser desfeita!\n');

    // Primeira confirmação
    const firstConfirm = await askQuestion(
      'Tem certeza que deseja continuar? Digite "sim" para confirmar: '
    );

    if (firstConfirm !== 'sim') {
      console.log('❌ Operação cancelada pelo usuário.');
      return;
    }

    // Executar limpeza
    console.log('\n🗑️  Executando limpeza...');
    await clearAllComposers();

    // Verificar se realmente limpou
    if (count === 0 && countWorks === 0 && countWorksCategorie === 0) {
      console.log('✅ Limpeza concluída com sucesso!');
      console.log('📊 A tabela composers agora está vazia.');
    }
  } catch (error) {
    console.error('❌ Erro fatal durante a execução:', error);
    process.exit(1);
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

// Função para limpeza silenciosa (para automação)
async function clearSilent(): Promise<void> {
  try {
    console.log('🗑️  Limpeza silenciosa iniciada...');

    const currentCount = await countComposers();
    console.log(`📊 Removendo ${currentCount} compositores...`);

    await clearAllComposers();

    const { count, countWorks, countWorksCategorie } = await countComposers();
    if (count === 0 && countWorks === 0 && countWorksCategorie === 0) {
      console.log('✅ Limpeza silenciosa concluída!');
    }
  } catch (error) {
    console.error('❌ Erro na limpeza silenciosa:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Função para mostrar estatísticas
async function showStats(): Promise<void> {
  try {
    console.log('📊 Estatísticas da Tabela Composers');
    console.log('==================================');

    const count = await countComposers();
    console.log(`Total de compositores: ${count}`);
  } catch (error) {
    console.error('❌ Erro ao obter estatísticas:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Verificar argumentos da linha de comando
const command = process.argv[2];

switch (command) {
  case 'clear':
    // Limpeza com confirmação
    main().catch(console.error);
    break;

  case 'force':
    // Limpeza silenciosa (cuidado!)
    clearSilent().catch(console.error);
    break;

  case 'stats':
    // Mostrar estatísticas
    showStats().catch(console.error);
    break;

  default:
    console.log('🧹 Script de Limpeza da Tabela Composers');
    console.log('=======================================\n');
    console.log('Comandos disponíveis:');
    console.log(
      '  npm run clear-composers clear  - Limpar com confirmação (seguro)'
    );
    console.log(
      '  npm run clear-composers force  - Limpar sem confirmação (perigoso!)'
    );
    console.log(
      '  npm run clear-composers stats  - Mostrar estatísticas da tabela'
    );
    console.log('\nUso recomendado:');
    console.log('  npx ts-node scripts/clear-composers.ts clear');
    break;
}
