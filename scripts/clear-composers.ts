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

// Função para contar registros na tabela
async function countComposers(): Promise<number> {
  try {
    const count = await prisma.composer.count();
    return count;
  } catch (error) {
    console.error('❌ Erro ao contar compositores:', error);
    return 0;
  }
}

// Função para limpar todos os compositores
async function clearAllComposers(): Promise<void> {
  try {
    console.log('🗑️  Iniciando limpeza da tabela composers...');

    const result = await prisma.composer.deleteMany({});

    console.log(
      `✅ Sucesso! ${result.count} compositores foram removidos da tabela.`
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
    const currentCount = await countComposers();

    if (currentCount === 0) {
      console.log('ℹ️  A tabela composers já está vazia.');
      return;
    }

    console.log(`📊 Atualmente há ${currentCount} compositores na tabela.`);
    console.log(
      '⚠️  ATENÇÃO: Esta ação irá remover TODOS os dados da tabela composers!'
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

    // Segunda confirmação
    const secondConfirm = await askQuestion(
      `🔥 CONFIRMAÇÃO FINAL: Digite "DELETAR TUDO" para confirmar a remoção de ${currentCount} compositores: `
    );

    if (secondConfirm !== 'deletar tudo') {
      console.log('❌ Operação cancelada. Confirmação não correspondeu.');
      return;
    }

    // Executar limpeza
    console.log('\n🗑️  Executando limpeza...');
    await clearAllComposers();

    // Verificar se realmente limpou
    const finalCount = await countComposers();
    if (finalCount === 0) {
      console.log('✅ Limpeza concluída com sucesso!');
      console.log('📊 A tabela composers agora está vazia.');
    } else {
      console.log(
        `⚠️  Atenção: Ainda restam ${finalCount} registros na tabela.`
      );
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

    const finalCount = await countComposers();
    if (finalCount === 0) {
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

    if (count > 0) {
      // Estatísticas adicionais
      const withImages = await prisma.composer.count({
        where: {
          portraitUrl: {
            not: null,
          },
        },
      });

      const withWiki = await prisma.composer.count({
        where: {
          wikipediaLink: {
            not: null,
          },
        },
      });

      const withBirthDate = await prisma.composer.count({
        where: {
          birthDate: {
            not: null,
          },
        },
      });

      const withDeathDate = await prisma.composer.count({
        where: {
          deathDate: {
            not: null,
          },
        },
      });

      // Compositores por época
      const epochStats = await prisma.composer.groupBy({
        by: ['epochName'],
        _count: {
          id: true,
        },
        orderBy: {
          _count: {
            id: 'desc',
          },
        },
      });

      console.log(`Com imagens: ${withImages}`);
      console.log(`Com Wikipedia: ${withWiki}`);
      console.log(`Com data de nascimento: ${withBirthDate}`);
      console.log(`Com data de morte: ${withDeathDate}\n`);

      console.log('📈 Distribuição por Época:');
      epochStats.forEach((epoch) => {
        console.log(`   ${epoch.epochName}: ${epoch._count.id}`);
      });
    }
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
