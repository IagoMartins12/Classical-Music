// scripts/set-primary-role.ts
import { PrismaClient } from '@prisma/client';
import readline from 'readline';

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function askQuestion(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

async function updatePrimaryRole(): Promise<number> {
  try {
    const result = await prisma.work.updateMany({
      data: { epochId: '6838846f7e5dd7f7e0ba7033' },
      where: {
        epochId: '683db996efd737805c0dfe6e',
      },
    });
    return result.count;
  } catch (error) {
    console.error('❌ Erro na atualização:', error);
    throw error;
  }
}

async function main(): Promise<void> {
  try {
    console.log('🔄 Script de Atualização de works');
    console.log('======================================\n');

    console.log('\n🔄 Atualizando compositores...');
    const updatedCount = await updatePrimaryRole();

    console.log(`\n✅ Sucesso! ${updatedCount} compositores atualizados.`);
    console.log(`🆔 Novo primaryRoleId:`);
  } catch (error) {
    console.error(
      '❌ Erro no script:',
      error instanceof Error ? error.message : error
    );
    process.exit(1);
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

// Execução direta
main().catch(console.error);
