// scripts/performance-fix-master.js - CORREÇÃO COMPLETA DE PERFORMANCE
const { execSync } = require('child_process');
const { MongoClient } = require('mongodb');

const MONGODB_URI =
  'mongodb+srv://martinsiagosaraiva:Bella123456@clusterclassicalhub.8nxuiim.mongodb.net/test';

if (!MONGODB_URI) {
  console.error('❌ DATABASE_URL não encontrada');
  process.exit(1);
}

// 🎯 FUNÇÃO PARA EXECUTAR COMANDO E MOSTRAR OUTPUT
function executeCommand(command, description) {
  console.log(`\n🔧 ${description}...`);
  try {
    const output = execSync(command, { encoding: 'utf-8', stdio: 'pipe' });
    console.log(output);
    return true;
  } catch (error) {
    console.error(`❌ Erro em: ${description}`);
    console.error(error.message);
    return false;
  }
}

// 🧪 TESTE RÁPIDO DE PERFORMANCE
async function quickPerformanceTest() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const db = client.db();
    const workCollection = db.collection('Work');

    console.log('\n🧪 TESTE RÁPIDO DE PERFORMANCE:');

    // Teste 1: Count simples
    const start1 = Date.now();
    const count = await workCollection.countDocuments({});
    const time1 = Date.now() - start1;
    console.log(`   📊 Count (${count.toLocaleString()} docs): ${time1}ms`);

    // Teste 2: Query simples
    const start2 = Date.now();
    const results = await workCollection.find({}).limit(32).toArray();
    const time2 = Date.now() - start2;
    console.log(`   🔍 Query simples (${results.length} docs): ${time2}ms`);

    // Teste 3: Query com ordenação
    const start3 = Date.now();
    const sortedResults = await workCollection
      .find({})
      .sort({ title: 1 })
      .limit(32)
      .toArray();
    const time3 = Date.now() - start3;
    console.log(
      `   📈 Query ordenada (${sortedResults.length} docs): ${time3}ms`
    );

    return {
      countTime: time1,
      queryTime: time2,
      sortTime: time3,
      totalDocs: count,
    };
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
    return null;
  } finally {
    await client.close();
  }
}

// 🛠️ FUNÇÃO PRINCIPAL DE CORREÇÃO
async function masterPerformanceFix() {
  console.log('🚀 INICIANDO CORREÇÃO COMPLETA DE PERFORMANCE\n');
  console.log('Este script irá:');
  console.log('1. 🧪 Diagnosticar problemas atuais');
  console.log('2. 🛠️  Criar índices críticos');
  console.log('3. 🔧 Aplicar otimizações adicionais');
  console.log('4. ✅ Validar correções\n');

  // PASSO 1: Teste inicial
  console.log('📊 PASSO 1: Medindo performance atual...');
  const beforeStats = await quickPerformanceTest();

  if (beforeStats) {
    console.log('\n📈 PERFORMANCE ANTES:');
    console.log(`   - Count: ${beforeStats.countTime}ms`);
    console.log(`   - Query: ${beforeStats.queryTime}ms`);
    console.log(`   - Sort: ${beforeStats.sortTime}ms`);
    console.log(`   - Total docs: ${beforeStats.totalDocs.toLocaleString()}`);

    // Definir se tem problemas sérios
    const hasProblems =
      beforeStats.countTime > 1000 ||
      beforeStats.queryTime > 1000 ||
      beforeStats.sortTime > 2000;

    if (hasProblems) {
      console.log('\n⚠️  PROBLEMAS DETECTADOS! Aplicando correções...');
    } else {
      console.log(
        '\n✅ Performance aceitável, mas aplicando otimizações preventivas...'
      );
    }
  }

  // PASSO 2: Diagnóstico detalhado
  console.log('\n📊 PASSO 2: Diagnóstico detalhado...');
  const diagnosisSuccess = executeCommand(
    'node scripts/performance-diagnosis.js diagnose',
    'Executando diagnóstico completo'
  );

  // PASSO 3: Criar índices críticos
  console.log('\n🛠️  PASSO 3: Criando índices críticos...');
  const criticalIndexesSuccess = executeCommand(
    'node scripts/performance-diagnosis.js fix',
    'Criando índices críticos'
  );

  // PASSO 4: Criar todos os índices otimizados
  console.log('\n🔧 PASSO 4: Criando índices completos...');
  const fullIndexesSuccess = executeCommand(
    'node scripts/migrate-indexes.js',
    'Criando índices completos'
  );

  // PASSO 5: Teste final
  console.log('\n✅ PASSO 5: Validando correções...');
  const afterStats = await quickPerformanceTest();

  if (beforeStats && afterStats) {
    console.log('\n📊 COMPARAÇÃO DE PERFORMANCE:\n');

    console.log('📈 COUNT:');
    console.log(`   Antes:  ${beforeStats.countTime}ms`);
    console.log(`   Depois: ${afterStats.countTime}ms`);
    const countImprovement =
      ((beforeStats.countTime - afterStats.countTime) / beforeStats.countTime) *
      100;
    console.log(`   Melhoria: ${countImprovement.toFixed(1)}%`);

    console.log('\n📈 QUERY SIMPLES:');
    console.log(`   Antes:  ${beforeStats.queryTime}ms`);
    console.log(`   Depois: ${afterStats.queryTime}ms`);
    const queryImprovement =
      ((beforeStats.queryTime - afterStats.queryTime) / beforeStats.queryTime) *
      100;
    console.log(`   Melhoria: ${queryImprovement.toFixed(1)}%`);

    console.log('\n📈 QUERY ORDENADA:');
    console.log(`   Antes:  ${beforeStats.sortTime}ms`);
    console.log(`   Depois: ${afterStats.sortTime}ms`);
    const sortImprovement =
      ((beforeStats.sortTime - afterStats.sortTime) / beforeStats.sortTime) *
      100;
    console.log(`   Melhoria: ${sortImprovement.toFixed(1)}%`);

    const avgImprovement =
      (countImprovement + queryImprovement + sortImprovement) / 3;

    console.log('\n🎯 RESULTADO GERAL:');
    if (avgImprovement > 50) {
      console.log(
        `   🚀 EXCELENTE! Melhoria média: ${avgImprovement.toFixed(1)}%`
      );
    } else if (avgImprovement > 20) {
      console.log(`   ✅ BOM! Melhoria média: ${avgImprovement.toFixed(1)}%`);
    } else if (avgImprovement > 0) {
      console.log(
        `   📈 MODERADO! Melhoria média: ${avgImprovement.toFixed(1)}%`
      );
    } else {
      console.log(
        `   ⚠️  Não houve melhoria significativa. Verifique configurações.`
      );
    }
  }

  // PASSO 6: Recomendações finais
  console.log('\n💡 RECOMENDAÇÕES FINAIS:\n');

  console.log('1. 🔄 REINICIE A APLICAÇÃO NEXT.JS:');
  console.log('   npm run dev   (desenvolvimento)');
  console.log('   npm run build && npm start   (produção)\n');

  console.log('2. 🧪 TESTE AS PÁGINAS:');
  console.log('   - Acesse /works');
  console.log('   - Teste paginação');
  console.log('   - Teste filtros');
  console.log('   - Monitore logs do console\n');

  console.log('3. 📊 MONITORE PERFORMANCE:');
  console.log('   - Observe tempo de resposta no DevTools');
  console.log('   - Verifique logs do servidor');
  console.log('   - Execute: node scripts/migrate-indexes.js test\n');

  if (
    afterStats &&
    (afterStats.countTime > 1000 || afterStats.sortTime > 2000)
  ) {
    console.log('⚠️  ATENÇÃO: Performance ainda não ideal!');
    console.log('\n🔍 DIAGNÓSTICOS ADICIONAIS:');
    console.log('   1. Verifique CPU/RAM do servidor MongoDB');
    console.log('   2. Considere MongoDB Atlas para melhor performance');
    console.log('   3. Analise connection pooling');
    console.log('   4. Considere read replicas para queries de leitura');
    console.log('   5. Execute: db.runCommand({planCacheClear: "Work"})');
  } else {
    console.log('✅ Performance está adequada para production!');
  }

  console.log('\n🎉 CORREÇÃO DE PERFORMANCE CONCLUÍDA!\n');
}

// 🧹 FUNÇÃO PARA LIMPAR E RECRIAR ÍNDICES
async function cleanAndRecreateIndexes() {
  console.log('🧹 LIMPEZA E RECRIAÇÃO DE ÍNDICES\n');

  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const db = client.db();
    const workCollection = db.collection('Work');

    console.log('📋 Listando índices atuais...');
    const currentIndexes = await workCollection.indexes();
    console.log(`   Encontrados: ${currentIndexes.length} índices`);

    // Remover índices não essenciais (manter apenas _id_)
    for (const index of currentIndexes) {
      if (index.name !== '_id_') {
        try {
          console.log(`🗑️  Removendo: ${index.name}`);
          await workCollection.dropIndex(index.name);
        } catch (error) {
          console.log(`   ⚠️  Não foi possível remover: ${index.name}`);
        }
      }
    }

    console.log('\n✅ Índices limpos! Recriando índices otimizados...');
  } catch (error) {
    console.error('❌ Erro na limpeza:', error.message);
  } finally {
    await client.close();
  }

  // Recriar índices
  executeCommand(
    'node scripts/migrate-indexes.js',
    'Recriando índices otimizados'
  );
}

// CLI
if (require.main === module) {
  const command = process.argv[2];

  switch (command) {
    case 'fix':
    case undefined:
      masterPerformanceFix();
      break;

    case 'test':
      console.log('🧪 TESTE RÁPIDO DE PERFORMANCE\n');
      quickPerformanceTest().then((stats) => {
        if (stats) {
          console.log('\n📊 RESULTADO:');
          if (stats.countTime < 500 && stats.sortTime < 1000) {
            console.log('✅ Performance EXCELENTE!');
          } else if (stats.countTime < 1000 && stats.sortTime < 2000) {
            console.log('📈 Performance BOA');
          } else {
            console.log('⚠️  Performance PRECISA DE MELHORIA');
            console.log('Execute: node scripts/performance-fix-master.js fix');
          }
        }
      });
      break;

    case 'clean':
      console.log('🧹 LIMPEZA COMPLETA DOS ÍNDICES\n');
      cleanAndRecreateIndexes();
      break;

    default:
      console.log('📋 COMANDOS DISPONÍVEIS:\n');
      console.log(
        '  node scripts/performance-fix-master.js        - Correção completa'
      );
      console.log(
        '  node scripts/performance-fix-master.js fix    - Correção completa'
      );
      console.log(
        '  node scripts/performance-fix-master.js test   - Teste rápido'
      );
      console.log(
        '  node scripts/performance-fix-master.js clean  - Limpar e recriar índices\n'
      );
      console.log(
        '🚀 Para resolver o problema de 23s → Execute: npm run fix-performance'
      );
  }
}

module.exports = {
  masterPerformanceFix,
  quickPerformanceTest,
  cleanAndRecreateIndexes,
};
