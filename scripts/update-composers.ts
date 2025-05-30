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

async function countComposers(): Promise<number> {
  return await prisma.composer.count();
}

// Verificar se o Role existe no banco
async function roleExists(roleId: string): Promise<string | null> {
  const role = await prisma.role.findUnique({
    where: { id: roleId },
  });
  return role?.name ?? null;
}

async function updatePrimaryRole(primaryRoleId: string): Promise<number> {
  try {
    const result = await prisma.composer.updateMany({
      data: { primaryRoleId },
    });
    return result.count;
  } catch (error) {
    console.error('❌ Erro na atualização:', error);
    throw error;
  }
}

async function main(): Promise<void> {
  try {
    console.log('🔄 Script de Atualização de Primary Role');
    console.log('======================================\n');

    const currentCount = await countComposers();
    if (currentCount === 0) {
      console.log('ℹ️  A tabela composers está vazia. Nada para atualizar.');
      return;
    }

    console.log(`📊 Total de compositores: ${currentCount}`);

    // Solicitar o ID do primaryRole (como string)
    const primaryRoleId = await askQuestion(
      '🔢 Insira o ID do primaryRole (ObjectId) para atribuir a TODOS os compositores: '
    );

    // Validar formato do ObjectId (24 caracteres hex)
    if (!/^[0-9a-fA-F]{24}$/.test(primaryRoleId)) {
      throw new Error(
        'Formato de ID inválido. Deve ser um ObjectId de 24 caracteres hexadecimais.'
      );
    }

    const roleName = await roleExists(primaryRoleId);
    // Verificar se o role existe
    if (!roleName) {
      throw new Error(`❌ Não existe um Role com o ID: ${primaryRoleId}.`);
    }

    // Primeira confirmação
    const firstConfirm = await askQuestion(
      `⚠️  ATENÇÃO: Isso atualizará TODOS os ${currentCount} compositores para o role de: ${roleName}! Continuar? (s/n): `
    );

    if (firstConfirm.toLowerCase() !== 's') {
      console.log('❌ Operação cancelada.');
      return;
    }

    // Segunda confirmação
    const secondConfirm = await askQuestion(
      `🔥 CONFIRMAÇÃO FINAL: Digite "ATUALIZAR" para confirmar: `
    );

    if (secondConfirm !== 'ATUALIZAR') {
      console.log('❌ Operação cancelada. Confirmação incorreta.');
      return;
    }

    console.log('\n🔄 Atualizando compositores...');
    const updatedCount = await updatePrimaryRole(primaryRoleId);

    console.log(`\n✅ Sucesso! ${updatedCount} compositores atualizados.`);
    console.log(`🆔 Novo primaryRoleId: ${primaryRoleId}`);
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
