// // scripts/clear-tables.ts

// import { PrismaClient } from '@prisma/client';
// import readline from 'readline';

// const prisma = new PrismaClient();

// // Interface para criar prompt de confirmação
// const rl = readline.createInterface({
//   input: process.stdin,
//   output: process.stdout,
// });

// // Função para fazer pergunta e aguardar resposta
// function askQuestion(question: string): Promise<string> {
//   return new Promise((resolve) => {
//     rl.question(question, (answer) => {
//       resolve(answer.toLowerCase().trim());
//     });
//   });
// }

// interface CountTablesType {
//   countCategories: number;
//   countWorks: number;
//   countWorksCategorie: number;
//   countWorkGenre: number;
//   countWorkGenresTypes: number;
// }

// // Função para contar registros nas tabelas
// async function countTables(): Promise<CountTablesType> {
//   try {
//     const countCategories = await prisma.categorie.count();
//     const countWorks = await prisma.work.count();
//     const countWorksCategorie = await prisma.workCategorie.count();
//     const countWorkGenre = await prisma.workGenre.count();
//     const countWorkGenresTypes = await prisma.workGenresTypes.count();

//     return {
//       countCategories,
//       countWorks,
//       countWorksCategorie,
//       countWorkGenre,
//       countWorkGenresTypes,
//     };
//   } catch (error) {
//     console.error('❌ Erro ao contar registros das tabelas:', error);
//     return {
//       countCategories: 0,
//       countWorks: 0,
//       countWorksCategorie: 0,
//       countWorkGenre: 0,
//       countWorkGenresTypes: 0,
//     };
//   }
// }

// // Função alternativa para limpar tabelas individualmente (sem transação)
// async function clearAllTablesIndividually(): Promise<void> {
//   console.log('🗑️  Iniciando limpeza individual das tabelas...');

//   const results = {
//     resultWorksCategorie: { count: 0 },
//     resultWorkGenre: { count: 0 },
//     resultWorkGenresTypes: { count: 0 },
//     resultWorks: { count: 0 },
//     resultCategories: { count: 0 },
//   };

//   try {
//     // Desabilitar foreign key checks se for MySQL/PostgreSQL
//     // Para SQLite, vamos limpar uma por vez com retry

//     console.log('   🔗 Limpando work-categories...');
//     try {
//       results.resultWorksCategorie = await prisma.workCategorie.deleteMany({});
//     } catch (error) {
//       console.log('   ⚠️  Erro ao limpar work-categories, continuando...');
//     }

//     console.log('   🎭 Limpando work-genres...');
//     try {
//       results.resultWorkGenre = await prisma.workGenre.deleteMany({});
//     } catch (error) {
//       console.log('   ⚠️  Erro ao limpar work-genres, continuando...');
//     }

//     console.log('   🏷️  Limpando genre-types...');
//     try {
//       results.resultWorkGenresTypes = await prisma.workGenresTypes.deleteMany(
//         {}
//       );
//     } catch (error) {
//       console.log('   ⚠️  Erro ao limpar genre-types, continuando...');
//     }

//     console.log('   🎵 Limpando works...');
//     try {
//       results.resultWorks = await prisma.work.deleteMany({});
//     } catch (error) {
//       console.log('   ⚠️  Erro ao limpar works, continuando...');
//     }

//     console.log('   📂 Limpando categorias...');
//     try {
//       results.resultCategories = await prisma.categorie.deleteMany({});
//     } catch (error) {
//       console.log('   ⚠️  Erro ao limpar categorias, continuando...');
//     }

//     console.log('✅ Limpeza individual concluída! Registros deletados:');
//     console.log(`   📂 ${results.resultCategories.count} categorias`);
//     console.log(`   🎵 ${results.resultWorks.count} works`);
//     console.log(`   🔗 ${results.resultWorksCategorie.count} work-categories`);
//     console.log(`   🎭 ${results.resultWorkGenre.count} work-genres`);
//     console.log(`   🏷️  ${results.resultWorkGenresTypes.count} genre-types`);
//   } catch (error) {
//     console.error('❌ Erro geral na limpeza individual:', error);
//     throw error;
//   }
// }
// async function clearAllTables() {
//   console.log('🗑️  Iniciando limpeza das tabelas...');

//   // Usar transação para garantir consistência
//   return await prisma.$transaction(
//     async (tx) => {
//       try {
//         // Limpar em ordem específica para evitar problemas de chave estrangeira
//         console.log('   🔗 Limpando work-categories...');
//         const resultWorksCategorie = await tx.workCategorie.deleteMany({});

//         console.log('   🎭 Limpando work-genres...');
//         const resultWorkGenre = await tx.workGenre.deleteMany({});

//         console.log('   🏷️  Limpando genre-types...');
//         const resultWorkGenresTypes = await tx.workGenresTypes.deleteMany({});

//         console.log('   🎵 Limpando works...');
//         const resultWorks = await tx.work.deleteMany({});

//         console.log('   📂 Limpando categorias...');
//         const resultCategories = await tx.categorie.deleteMany({});

//         console.log('✅ Sucesso! Registros deletados:');
//         console.log(`   📂 ${resultCategories.count} categorias`);
//         console.log(`   🎵 ${resultWorks.count} works`);
//         console.log(`   🔗 ${resultWorksCategorie.count} work-categories`);
//         console.log(`   🎭 ${resultWorkGenre.count} work-genres`);
//         console.log(`   🏷️  ${resultWorkGenresTypes.count} genre-types`);

//         return {
//           resultCategories,
//           resultWorks,
//           resultWorksCategorie,
//           resultWorkGenre,
//           resultWorkGenresTypes,
//         };
//       } catch (error) {
//         console.error('❌ Erro durante a transação:', error);
//         throw error;
//       }
//     },
//     {
//       timeout: 30000, // 30 segundos de timeout
//       maxWait: 5000, // Máximo 5 segundos esperando para começar
//     }
//   );
// }

// // Função principal
// async function main(): Promise<void> {
//   try {
//     console.log('🧹 Script de Limpeza das Tabelas do Banco');
//     console.log('========================================\n');

//     // Contar registros atuais
//     const counts = await countTables();

//     console.log('📊 Registros atuais nas tabelas:');
//     console.log(`   📂 Categorias: ${counts.countCategories}`);
//     console.log(`   🎵 Works: ${counts.countWorks}`);
//     console.log(`   🔗 Work-Categories: ${counts.countWorksCategorie}`);
//     console.log(`   🎭 Work-Genres: ${counts.countWorkGenre}`);
//     console.log(`   🏷️  Genre-Types: ${counts.countWorkGenresTypes}\n`);

//     const totalRecords =
//       counts.countCategories +
//       counts.countWorks +
//       counts.countWorksCategorie +
//       counts.countWorkGenre +
//       counts.countWorkGenresTypes;

//     if (totalRecords === 0) {
//       console.log('ℹ️  As tabelas já estão vazias. Nada para limpar.');
//       return;
//     }

//     console.log(
//       '⚠️  ATENÇÃO: Esta ação irá remover TODOS os dados das seguintes tabelas:'
//     );
//     console.log('   • categories');
//     console.log('   • works');
//     console.log('   • workCategorie');
//     console.log('   • workGenre');
//     console.log('   • workGenresTypes');
//     console.log('\n⚠️  Esta ação NÃO PODE ser desfeita!\n');

//     // Primeira confirmação
//     const firstConfirm = await askQuestion(
//       'Tem certeza que deseja continuar? Digite "sim" para confirmar: '
//     );

//     if (firstConfirm !== 'sim') {
//       console.log('❌ Operação cancelada pelo usuário.');
//       return;
//     }

//     // Segunda confirmação para segurança extra
//     const secondConfirm = await askQuestion(
//       `Você está prestes a deletar ${totalRecords} registros. Digite "CONFIRMAR" para prosseguir: `
//     );

//     if (secondConfirm !== 'confirmar') {
//       console.log('❌ Operação cancelada. Confirmação não recebida.');
//       return;
//     }

//     // Executar limpeza
//     console.log('\n🗑️  Executando limpeza...');

//     try {
//       // Tentar primeiro com transação
//       try {
//         await clearAllTables();
//       } catch (transactionError) {
//         console.log('⚠️  Transação falhou, tentando limpeza individual...');
//         await clearAllTablesIndividually();
//       }
//     } catch (transactionError) {
//       console.log('\n⚠️  Transação falhou, tentando limpeza individual...');
//       console.log(`   Erro da transação: ${transactionError}`);

//       try {
//         await clearAllTablesIndividually();
//       } catch (individualError) {
//         console.error('❌ Ambas as abordagens falharam:', individualError);
//         throw individualError;
//       }
//     }

//     // Verificar se realmente limpou
//     const newCounts = await countTables();
//     const newTotal =
//       newCounts.countCategories +
//       newCounts.countWorks +
//       newCounts.countWorksCategorie +
//       newCounts.countWorkGenre +
//       newCounts.countWorkGenresTypes;

//     if (newTotal === 0) {
//       console.log('\n✅ Limpeza concluída com sucesso!');
//       console.log('📊 Todas as tabelas agora estão vazias.');
//     } else {
//       console.log(
//         '\n⚠️  Atenção: Alguns registros podem não ter sido removidos.'
//       );
//       console.log('   Verifique as dependências entre tabelas.');
//     }
//   } catch (error) {
//     console.error('❌ Erro fatal durante a execução:', error);
//     process.exit(1);
//   } finally {
//     rl.close();
//     await prisma.$disconnect();
//   }
// }

// // Função para limpeza silenciosa (para automação)
// async function clearSilent(): Promise<void> {
//   try {
//     console.log('🗑️  Limpeza silenciosa iniciada...');

//     const currentCounts = await countTables();
//     const totalRecords =
//       currentCounts.countCategories +
//       currentCounts.countWorks +
//       currentCounts.countWorksCategorie +
//       currentCounts.countWorkGenre +
//       currentCounts.countWorkGenresTypes;

//     console.log(`📊 Removendo ${totalRecords} registros...`);

//     if (totalRecords === 0) {
//       console.log('ℹ️  Nenhum registro para remover.');
//       return;
//     }

//     await clearAllTables();

//     const newCounts = await countTables();
//     const newTotal =
//       newCounts.countCategories +
//       newCounts.countWorks +
//       newCounts.countWorksCategorie +
//       newCounts.countWorkGenre +
//       newCounts.countWorkGenresTypes;

//     if (newTotal === 0) {
//       console.log('✅ Limpeza silenciosa concluída!');
//     } else {
//       console.log('⚠️  Alguns registros podem não ter sido removidos.');
//     }
//   } catch (error) {
//     console.error('❌ Erro na limpeza silenciosa:', error);
//     throw error;
//   } finally {
//     await prisma.$disconnect();
//   }
// }

// // Função para mostrar estatísticas
// async function showStats(): Promise<void> {
//   try {
//     console.log('📊 Estatísticas das Tabelas');
//     console.log('==========================\n');

//     const counts = await countTables();

//     console.log('Registros por tabela:');
//     console.log(`   📂 Categorias: ${counts.countCategories}`);
//     console.log(`   🎵 Works: ${counts.countWorks}`);
//     console.log(`   🔗 Work-Categories: ${counts.countWorksCategorie}`);
//     console.log(`   🎭 Work-Genres: ${counts.countWorkGenre}`);
//     console.log(`   🏷️  Genre-Types: ${counts.countWorkGenresTypes}`);

//     const total =
//       counts.countCategories +
//       counts.countWorks +
//       counts.countWorksCategorie +
//       counts.countWorkGenre +
//       counts.countWorkGenresTypes;

//     console.log(`\n📈 Total de registros: ${total}`);
//   } catch (error) {
//     console.error('❌ Erro ao obter estatísticas:', error);
//   } finally {
//     await prisma.$disconnect();
//   }
// }

// // Verificar argumentos da linha de comando
// const command = process.argv[2];

// switch (command) {
//   case 'clear':
//     // Limpeza com confirmação dupla
//     main().catch(console.error);
//     break;

//   case 'individual':
//     // Limpeza individual (quando transação falha)
//     (async () => {
//       try {
//         console.log('🗑️  Executando limpeza individual...');
//         await clearAllTablesIndividually();
//         console.log('✅ Limpeza individual concluída!');
//       } catch (error) {
//         console.error('❌ Erro na limpeza individual:', error);
//       } finally {
//         await prisma.$disconnect();
//       }
//     })().catch(console.error);
//     break;

//   case 'stats':
//     // Mostrar estatísticas
//     showStats().catch(console.error);
//     break;

//   default:
//     console.log('🧹 Script de Limpeza das Tabelas do Banco');
//     console.log('========================================\n');
//     console.log('Comandos disponíveis:');
//     console.log(
//       '  npm run clear-tables clear      - Limpar com confirmação dupla (seguro)'
//     );
//     console.log(
//       '  npm run clear-tables individual - Limpar individualmente (se transação falhar)'
//     );
//     console.log(
//       '  npm run clear-tables force      - Limpar sem confirmação (perigoso!)'
//     );
//     console.log(
//       '  npm run clear-tables stats      - Mostrar estatísticas das tabelas'
//     );
//     console.log('\nExemplos de uso:');
//     console.log('  npx ts-node scripts/clear-tables.ts clear');
//     console.log('  npx ts-node scripts/clear-tables.ts stats');
//     console.log('\n⚠️  O comando "force" deve ser usado apenas em automações!');
//     break;
// }
