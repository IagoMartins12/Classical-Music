// scripts/performance-diagnosis.js - DIAGNÓSTICO ESPECÍFICO DE PERFORMANCE
const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.DATABASE_URL;

if (!MONGODB_URI) {
  console.error('❌ DATABASE_URL não encontrada');
  process.exit(1);
}

async function diagnosePerformance() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('🔗 Conectado ao MongoDB para diagnóstico\n');

    const db = client.db();
    const workCollection = db.collection('Work');

    // 📊 INFORMAÇÕES BÁSICAS DA COLLECTION
    console.log('📊 INFORMAÇÕES DA COLLECTION:');

    const stats = await db.command({ collStats: 'Work' });
    console.log(`   📦 Documentos: ${stats.count.toLocaleString()}`);
    console.log(`   💾 Tamanho: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   📋 Índices: ${stats.nindexes}`);
    console.log(
      `   🗂️  Tamanho índices: ${(stats.totalIndexSize / 1024 / 1024).toFixed(
        2
      )} MB\n`
    );

    // 🔍 LISTAR TODOS OS ÍNDICES
    console.log('🔍 ÍNDICES ATUAIS:');
    const indexes = await workCollection.indexes();
    indexes.forEach((idx, i) => {
      const keyString = Object.entries(idx.key)
        .map(([field, direction]) => `${field}:${direction}`)
        .join(', ');
      console.log(`   ${i + 1}. ${idx.name}: {${keyString}}`);
    });
    console.log('');

    // 🧪 TESTE 1: Query sem filtros (sua query principal)
    console.log('🧪 TESTE 1: Query sem filtros (página 1)');
    console.log(
      '   Query: find({}).sort({composer.name: 1, title: 1}).limit(32)'
    );

    const start1 = performance.now();
    const explain1 = await workCollection
      .find({})
      .sort({ 'composer.name': 1, title: 1 })
      .limit(32)
      .explain('executionStats');
    const duration1 = performance.now() - start1;

    console.log(`   ⏱️  Tempo: ${duration1.toFixed(2)}ms`);
    console.log(
      `   📊 Docs examinados: ${explain1.executionStats.totalDocsExamined}`
    );
    console.log(
      `   📋 Docs retornados: ${explain1.executionStats.totalDocsReturned}`
    );
    console.log(
      `   🎯 Índice usado: ${
        explain1.executionStats.executionStages.indexName || 'COLLECTION SCAN'
      }`
    );
    console.log(
      `   ⚡ Eficiência: ${(
        (explain1.executionStats.totalDocsReturned /
          explain1.executionStats.totalDocsExamined) *
        100
      ).toFixed(1)}%\n`
    );

    // 🧪 TESTE 2: Count total
    console.log('🧪 TESTE 2: Count total');

    const start2 = performance.now();
    const count = await workCollection.countDocuments({});
    const duration2 = performance.now() - start2;

    console.log(`   ⏱️  Tempo: ${duration2.toFixed(2)}ms`);
    console.log(`   📊 Total: ${count.toLocaleString()}\n`);

    // 🧪 TESTE 3: Query com ordenação diferente
    console.log('🧪 TESTE 3: Query ordenação por _id');

    const start3 = performance.now();
    const result3 = await workCollection
      .find({})
      .sort({ _id: 1 })
      .limit(32)
      .toArray();
    const duration3 = performance.now() - start3;

    console.log(`   ⏱️  Tempo: ${duration3.toFixed(2)}ms`);
    console.log(`   📊 Resultados: ${result3.length}\n`);

    // 🧪 TESTE 4: Verificar se há problemas de JOIN/LOOKUP
    console.log('🧪 TESTE 4: Query apenas com campos simples');

    const start4 = performance.now();
    const result4 = await workCollection
      .find({})
      .project({ _id: 1, title: 1, composerId: 1 })
      .sort({ title: 1 })
      .limit(32)
      .toArray();
    const duration4 = performance.now() - start4;

    console.log(`   ⏱️  Tempo: ${duration4.toFixed(2)}ms`);
    console.log(`   📊 Resultados: ${result4.length}\n`);

    // 🧪 TESTE 5: Verificar collections relacionadas
    console.log('🧪 TESTE 5: Verificar collections relacionadas');

    const composerStats = await db.command({ collStats: 'Composer' });
    const instrumentStats = await db.command({ collStats: 'Instrument' });
    const epochStats = await db.command({ collStats: 'Epoch' });

    console.log(`   👨‍🎼 Composers: ${composerStats.count}`);
    console.log(`   🎼 Instruments: ${instrumentStats.count}`);
    console.log(`   🏛️  Epochs: ${epochStats.count}\n`);

    // 🔍 ANÁLISE DOS PROBLEMAS
    console.log('🔍 ANÁLISE DOS PROBLEMAS:\n');

    let problemsFound = false;

    if (duration1 > 1000) {
      console.log('❌ PROBLEMA 1: Query principal muito lenta (>1s)');
      console.log(
        '   💡 Solução: Criar índice composto para {composer.name: 1, title: 1}'
      );
      problemsFound = true;
    }

    if (duration2 > 1000) {
      console.log('❌ PROBLEMA 2: Count muito lento (>1s)');
      console.log(
        '   💡 Solução: MongoDB não está usando índice otimizado para count'
      );
      problemsFound = true;
    }

    if (
      explain1.executionStats.totalDocsExamined >
      explain1.executionStats.totalDocsReturned * 10
    ) {
      console.log('❌ PROBLEMA 3: Muitos documentos examinados vs retornados');
      console.log(
        '   💡 Solução: Índices não estão sendo utilizados eficientemente'
      );
      problemsFound = true;
    }

    if (explain1.executionStats.executionStages.stage === 'COLLSCAN') {
      console.log('❌ PROBLEMA 4: Collection scan ao invés de índice');
      console.log(
        '   💡 Solução: Índices não existem ou não estão sendo utilizados'
      );
      problemsFound = true;
    }

    if (stats.count > 100000 && duration3 < duration1 / 2) {
      console.log('❌ PROBLEMA 5: Ordenação complexa está custosa');
      console.log(
        '   💡 Solução: Ordenação por {composer.name, title} precisa de índice composto'
      );
      problemsFound = true;
    }

    if (!problemsFound) {
      console.log('✅ Nenhum problema óbvio encontrado nos testes básicos');
    }

    // 🛠️  SOLUÇÕES RECOMENDADAS
    console.log('\n🛠️  SOLUÇÕES RECOMENDADAS:\n');

    console.log('1. 🔧 Execute o script de migração de índices:');
    console.log('   node scripts/migrate-indexes.js\n');

    console.log('2. 🎯 Índices críticos necessários:');
    console.log('   - {composerId: 1, title: 1} para ordenação principal');
    console.log('   - {title: 1} para ordenação alternativa');
    console.log('   - {_id: 1} para count otimizado\n');

    console.log('3. 📊 Verificar query plan:');
    console.log('   - Usar .explain("executionStats") nas queries lentas');
    console.log('   - Garantir que não há COLLSCAN\n');

    if (stats.count > 150000) {
      console.log('4. ⚡ Para collections grandes (150k+ docs):');
      console.log('   - Considere paginação cursor-based');
      console.log('   - Implemente cache mais agressivo');
      console.log('   - Considere field selection (projection)\n');
    }

    console.log('5. 🎛️  Configurações MongoDB:');
    console.log('   - Verificar se connection pooling está otimizado');
    console.log('   - Considerar read preference secundária para reads');
    console.log('   - Monitorar CPU e RAM do servidor MongoDB\n');
  } catch (error) {
    console.error('❌ Erro durante diagnóstico:', error);
  } finally {
    await client.close();
    console.log('🔒 Diagnóstico concluído\n');
  }
}

// 🎯 FUNÇÃO PARA CRIAR ÍNDICES CRÍTICOS IMEDIATAMENTE
async function createCriticalIndexes() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('🚀 Criando índices críticos para correção imediata...\n');

    const db = client.db();
    const workCollection = db.collection('Work');

    // Índices mais críticos baseados no problema
    const criticalIndexes = [
      {
        fields: { composerId: 1, title: 1 },
        name: 'critical_composer_title',
        comment: 'Índice crítico para ordenação principal',
      },
      {
        fields: { title: 1 },
        name: 'critical_title_sort',
        comment: 'Índice crítico para ordenação por título',
      },
      {
        fields: { _id: 1 },
        name: 'critical_id_count',
        comment: 'Índice crítico para count otimizado',
      },
      {
        fields: { createdAt: -1 },
        name: 'critical_created_sort',
        comment: 'Índice crítico para ordenação por data',
      },
    ];

    for (const idx of criticalIndexes) {
      try {
        console.log(`🔧 Criando: ${idx.name}...`);
        await workCollection.createIndex(idx.fields, {
          name: idx.name,
          background: true,
          comment: idx.comment,
        });
        console.log(`   ✅ Sucesso: ${idx.name}`);
      } catch (error) {
        if (error.code === 85) {
          console.log(`   ⚠️  Já existe: ${idx.name}`);
        } else {
          console.log(`   ❌ Erro: ${idx.name} - ${error.message}`);
        }
      }
    }

    console.log(
      '\n✅ Índices críticos criados! Teste novamente a aplicação.\n'
    );
  } catch (error) {
    console.error('❌ Erro ao criar índices críticos:', error);
  } finally {
    await client.close();
  }
}

// CLI
if (require.main === module) {
  const command = process.argv[2];

  switch (command) {
    case 'diagnose':
    case undefined:
      console.log('🏥 DIAGNÓSTICO DE PERFORMANCE - MongoDB\n');
      diagnosePerformance();
      break;

    case 'fix':
      console.log('🛠️  CORREÇÃO RÁPIDA - Criando índices críticos\n');
      createCriticalIndexes();
      break;

    default:
      console.log('📋 Comandos disponíveis:');
      console.log(
        '  node scripts/performance-diagnosis.js         - Executar diagnóstico'
      );
      console.log(
        '  node scripts/performance-diagnosis.js diagnose - Executar diagnóstico'
      );
      console.log(
        '  node scripts/performance-diagnosis.js fix      - Criar índices críticos'
      );
  }
}

module.exports = { diagnosePerformance, createCriticalIndexes };
