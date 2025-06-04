// scripts/clear-composers.ts

import { PrismaClient } from '@prisma/client';
import readline from 'readline';

const prisma = new PrismaClient();

interface UpdateResult {
  success: boolean;
  categoryNamesCount: number;
  genresCount: number;
  errors: string[];
  totalAffected: number;
}

async function updateWorks(): Promise<UpdateResult> {
  const result: UpdateResult = {
    success: false,
    categoryNamesCount: 0,
    genresCount: 0,
    errors: [],
    totalAffected: 0,
  };

  console.log('🚀 Iniciando processo de atualização...\n');

  try {
    // Primeiro, vamos contar quantos registros serão afetados
    console.log('📊 Verificando registros que serão afetados...');

    const worksWithCategoryNames = await prisma.work.count({
      where: {
        categoryNames: {
          isEmpty: false,
        },
      },
    });

    const worksWithGenres = await prisma.work.count({
      where: {
        genres: {
          not: null,
        },
      },
    });

    console.log(
      `   • Registros com categoryNames preenchidos: ${worksWithCategoryNames}`
    );
    console.log(`   • Registros com genres preenchidos: ${worksWithGenres}`);
    console.log(
      `   • Total de registros que serão modificados: ${
        worksWithCategoryNames + worksWithGenres
      }\n`
    );

    // Atualizar categoryNames
    console.log('🔄 Limpando campo categoryNames...');
    try {
      const categoryNamesUpdate = await prisma.work.updateMany({
        where: {
          categoryNames: {
            isEmpty: false,
          },
        },
        data: {
          categoryNames: [],
        },
      });

      result.categoryNamesCount = categoryNamesUpdate.count;
      console.log(
        `   ✅ Campo categoryNames limpo com sucesso! ${categoryNamesUpdate.count} registros afetados`
      );
    } catch (error) {
      const errorMsg = `Erro ao limpar categoryNames: ${
        error instanceof Error ? error.message : String(error)
      }`;
      result.errors.push(errorMsg);
      console.error(`   ❌ ${errorMsg}`);
    }

    // Atualizar genres
    console.log('🔄 Limpando campo genres...');
    try {
      const genresUpdate = await prisma.work.updateMany({
        where: {
          genres: {
            not: null,
          },
        },
        data: {
          genres: '',
        },
      });

      result.genresCount = genresUpdate.count;
      console.log(
        `   ✅ Campo genres limpo com sucesso! ${genresUpdate.count} registros afetados`
      );
    } catch (error) {
      const errorMsg = `Erro ao limpar genres: ${
        error instanceof Error ? error.message : String(error)
      }`;
      result.errors.push(errorMsg);
      console.error(`   ❌ ${errorMsg}`);
    }

    result.totalAffected = result.categoryNamesCount + result.genresCount;
    result.success = result.errors.length === 0;

    // Resumo final
    console.log('\n📋 RESUMO DA OPERAÇÃO:');
    console.log('========================');
    console.log(
      `Status: ${result.success ? '✅ SUCESSO' : '⚠️  PARCIAL/ERRO'}`
    );
    console.log(
      `Registros categoryNames afetados: ${result.categoryNamesCount}`
    );
    console.log(`Registros genres afetados: ${result.genresCount}`);
    console.log(`Total de registros afetados: ${result.totalAffected}`);

    if (result.errors.length > 0) {
      console.log(`\n❌ Erros encontrados (${result.errors.length}):`);
      result.errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`);
      });
    }

    return result;
  } catch (error) {
    const errorMsg = `Erro geral na operação: ${
      error instanceof Error ? error.message : String(error)
    }`;
    result.errors.push(errorMsg);
    console.error(`\n❌ ${errorMsg}`);
    console.error('Stack trace:', error);
    return result;
  }
}

async function getStats() {
  try {
    console.log('📊 Coletando estatísticas da tabela works...\n');

    const totalWorks = await prisma.work.count();

    const worksWithCategoryNames = await prisma.work.count({
      where: {
        categoryNames: {
          isEmpty: false,
        },
      },
    });

    const worksWithGenres = await prisma.work.count({
      where: {
        genres: {
          not: null,
        },
      },
    });

    const worksWithBothFields = await prisma.work.count({
      where: {
        AND: [
          {
            categoryNames: {
              isEmpty: false,
            },
          },
          {
            genres: {
              not: null,
            },
          },
        ],
      },
    });

    console.log('📈 ESTATÍSTICAS DA TABELA WORKS:');
    console.log('================================');
    console.log(`Total de registros: ${totalWorks}`);
    console.log(
      `Registros com categoryNames: ${worksWithCategoryNames} (${(
        (worksWithCategoryNames / totalWorks) *
        100
      ).toFixed(1)}%)`
    );
    console.log(
      `Registros com genres: ${worksWithGenres} (${(
        (worksWithGenres / totalWorks) *
        100
      ).toFixed(1)}%)`
    );
    console.log(
      `Registros com ambos os campos: ${worksWithBothFields} (${(
        (worksWithBothFields / totalWorks) *
        100
      ).toFixed(1)}%)`
    );
    console.log(
      `Registros que seriam afetados: ${
        worksWithCategoryNames + worksWithGenres - worksWithBothFields
      }`
    );
  } catch (error) {
    console.error('❌ Erro ao coletar estatísticas:', error);
  }
}

async function confirmAction(message: string): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(
      `${message} (Digite 'CONFIRMAR' para prosseguir): `,
      (answer) => {
        rl.close();
        resolve(answer.trim().toLowerCase() === 'confirmar');
      }
    );
  });
}

async function clearWithConfirmation() {
  try {
    // Mostrar estatísticas primeiro
    await getStats();

    console.log(
      '\n⚠️  ATENÇÃO: Esta operação irá limpar os campos categoryNames e genres de todos os registros!'
    );

    const confirmed = await confirmAction(
      '\n🔴 Tem certeza que deseja prosseguir?'
    );

    if (!confirmed) {
      console.log('❌ Operação cancelada pelo usuário.');
      return;
    }

    console.log('\n🚀 Iniciando limpeza...');
    const result = await updateWorks();

    if (result.success) {
      console.log('\n🎉 Operação concluída com sucesso!');
    } else {
      console.log(
        '\n⚠️  Operação concluída com erros. Verifique os logs acima.'
      );
    }
  } catch (error) {
    console.error('❌ Erro durante a operação:', error);
  }
}

async function forceUpdate() {
  console.log('⚠️  MODO FORÇADO ATIVADO - Pulando confirmação...\n');

  try {
    const result = await updateWorks();

    if (result.success) {
      console.log('\n🎉 Operação forçada concluída com sucesso!');
    } else {
      console.log(
        '\n⚠️  Operação forçada concluída com erros. Verifique os logs acima.'
      );
    }
  } catch (error) {
    console.error('❌ Erro durante a operação forçada:', error);
  }
}

// Função para limpar recursos
async function cleanup() {
  await prisma.$disconnect();
}

// Capturar sinais de interrupção para limpeza
process.on('SIGINT', async () => {
  console.log('\n🛑 Operação interrompida pelo usuário...');
  await cleanup();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Processo terminado...');
  await cleanup();
  process.exit(0);
});

// Verificar argumentos da linha de comando
const command = process.argv[2];

async function main() {
  try {
    switch (command) {
      case 'update':
        await updateWorks();
        break;

      case 'clear':
        await clearWithConfirmation();
        break;

      case 'force':
        await forceUpdate();
        break;

      case 'stats':
        await getStats();
        break;

      default:
        console.log('🧹 Script de Limpeza da Tabela Works');
        console.log('====================================\n');
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
        console.log(
          '  npm run clear-composers update - Executar atualização direta'
        );
        console.log('\nUso recomendado:');
        console.log('  npx ts-node scripts/clear-composers.ts clear');
        console.log('  npx ts-node scripts/clear-composers.ts stats');
        break;
    }
  } catch (error) {
    console.error('❌ Erro fatal na execução do script:', error);
  } finally {
    await cleanup();
  }
}

// Executar função principal
main().catch(console.error);
