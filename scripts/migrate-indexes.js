// scripts/migrate-indexes.js - CORREÇÃO ESPECÍFICA PARA PERFORMANCE
const { MongoClient } = require('mongodb');

// Configuração da conexão
const MONGODB_URI =
  'mongodb+srv://martinsiagosaraiva:Bella123456@clusterclassicalhub.8nxuiim.mongodb.net/test';

if (!MONGODB_URI) {
  console.error('❌ DATABASE_URL não encontrada nas variáveis de ambiente');
  process.exit(1);
}

console.log('🔗 Conectando ao MongoDB...');

async function createOptimizedIndexes() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('✅ Conectado ao MongoDB');

    const db = client.db();

    // 🚀 ÍNDICES CRÍTICOS PARA COLLECTION 'Work'
    console.log('\n📊 Criando índices CRÍTICOS para performance...');

    const workCollection = db.collection('Work');

    // 1. 🔥 ÍNDICE PRINCIPAL - Query sem filtros (mais comum)
    console.log('🔥 Criando índice para query sem filtros...');
    try {
      await workCollection.createIndex(
        {
          'composer.name': 1,
          title: 1,
        },
        {
          name: 'main_works_query',
          background: true,
        }
      );
      console.log('  ✅ Índice principal criado: main_works_query');
    } catch (error) {
      if (error.code === 85) {
        console.log('  ⚠️  Índice já existe: main_works_query');
      } else {
        console.error('  ❌ Erro:', error.message);
      }
    }

    // 2. 🔥 ÍNDICE PARA COUNT RÁPIDO
    console.log('🔥 Criando índice para count otimizado...');
    try {
      await workCollection.createIndex(
        { _id: 1 },
        {
          name: 'fast_count_index',
          background: true,
        }
      );
      console.log('  ✅ Índice count criado: fast_count_index');
    } catch (error) {
      if (error.code === 85) {
        console.log('  ⚠️  Índice já existe: fast_count_index');
      } else {
        console.error('  ❌ Erro:', error.message);
      }
    }

    // 3. 🔥 ÍNDICES COMPOSTOS PARA JOINS
    console.log('🔥 Criando índices para JOINs otimizados...');

    const criticalIndexes = [
      // Índice composto principal
      {
        keys: { composerId: 1, title: 1, createdAt: -1 },
        name: 'composer_title_date_compound',
        comment: 'Principal query de ordenação',
      },

      // Índice reverso para diferentes padrões
      {
        keys: { title: 1, composerId: 1 },
        name: 'title_composer_compound',
        comment: 'Query alternativa de ordenação',
      },

      // Índice para filtros específicos
      {
        keys: { composerId: 1, instrumentId: 1, epochId: 1 },
        name: 'composer_instrument_epoch_compound',
        comment: 'Filtros múltiplos',
      },

      // Índice para busca textual
      {
        keys: { title: 1, opOrCatalog: 1 },
        name: 'title_opus_search',
        comment: 'Busca por título e opus',
      },

      // Índice para paginação eficiente
      {
        keys: { createdAt: -1, _id: 1 },
        name: 'pagination_index',
        comment: 'Paginação otimizada',
      },
    ];

    for (const indexDef of criticalIndexes) {
      try {
        await workCollection.createIndex(indexDef.keys, {
          name: indexDef.name,
          background: true,
          comment: indexDef.comment,
        });
        console.log(`  ✅ Índice criado: ${indexDef.name}`);
      } catch (error) {
        if (error.code === 85) {
          console.log(`  ⚠️  Índice já existe: ${indexDef.name}`);
        } else {
          console.error(`  ❌ Erro ao criar ${indexDef.name}:`, error.message);
        }
      }
    }

    // 4. 🔥 ÍNDICES PARA COLLECTIONS RELACIONADAS
    console.log('\n🔥 Criando índices para collections relacionadas...');

    // Composer
    const composerCollection = db.collection('Composer');
    try {
      await composerCollection.createIndex(
        { name: 1, fullName: 1 },
        {
          name: 'composer_name_search',
          background: true,
        }
      );
      console.log('  ✅ Índice Composer criado: composer_name_search');
    } catch (error) {
      if (error.code === 85) {
        console.log('  ⚠️  Índice Composer já existe');
      } else {
        console.error('  ❌ Erro Composer:', error.message);
      }
    }

    // Instrument
    const instrumentCollection = db.collection('Instrument');
    try {
      await instrumentCollection.createIndex(
        { name: 1 },
        {
          name: 'instrument_name_index',
          background: true,
        }
      );
      console.log('  ✅ Índice Instrument criado: instrument_name_index');
    } catch (error) {
      if (error.code === 85) {
        console.log('  ⚠️  Índice Instrument já existe');
      } else {
        console.error('  ❌ Erro Instrument:', error.message);
      }
    }

    // Epoch
    const epochCollection = db.collection('Epoch');
    try {
      await epochCollection.createIndex(
        { name: 1 },
        {
          name: 'epoch_name_index',
          background: true,
        }
      );
      console.log('  ✅ Índice Epoch criado: epoch_name_index');
    } catch (error) {
      if (error.code === 85) {
        console.log('  ⚠️  Índice Epoch já existe');
      } else {
        console.error('  ❌ Erro Epoch:', error.message);
      }
    }

    // WorkGenre
    const workGenreCollection = db.collection('WorkGenre');
    try {
      await workGenreCollection.createIndex(
        { name: 1 },
        {
          name: 'workgenre_name_index',
          background: true,
        }
      );
      console.log('  ✅ Índice WorkGenre criado: workgenre_name_index');
    } catch (error) {
      if (error.code === 85) {
        console.log('  ⚠️  Índice WorkGenre já existe');
      } else {
        console.error('  ❌ Erro WorkGenre:', error.message);
      }
    }

    // 🔍 ANALISAR PERFORMANCE ATUAL
    console.log('\n📈 Analisando performance das queries...');

    try {
      // Testar query principal (sem filtros)
      console.log('🧪 Testando query principal...');
      const startTime = Date.now();

      const testResult = await workCollection
        .find({})
        .sort({ 'composer.name': 1, title: 1 })
        .limit(32)
        .explain('executionStats');

      const duration = Date.now() - startTime;
      console.log(`  ⏱️  Tempo de execução: ${duration}ms`);
      console.log(
        `  📊 Documentos examinados: ${
          testResult.executionStats?.totalDocsExamined || 'N/A'
        }`
      );

      // Testar count
      console.log('🧪 Testando count...');
      const countStartTime = Date.now();
      const count = await workCollection.countDocuments({});
      const countDuration = Date.now() - countStartTime;
      console.log(`  ⏱️  Tempo count: ${countDuration}ms`);
      console.log(`  📊 Total documentos: ${count}`);
    } catch (error) {
      console.log('  ⚠️  Erro no teste de performance:', error.message);
    }

    // 📋 VERIFICAR ÍNDICES CRIADOS
    console.log('\n📋 Verificando índices criados...');

    const workIndexes = await workCollection.indexes();
    console.log(
      `\n📊 Total de índices na collection Work: ${workIndexes.length}`
    );

    // Mostrar apenas os índices mais importantes
    const importantIndexes = workIndexes.filter(
      (idx) =>
        idx.name.includes('main_') ||
        idx.name.includes('composer_') ||
        idx.name.includes('fast_')
    );

    if (importantIndexes.length > 0) {
      console.log('🔑 Índices críticos:');
      importantIndexes.forEach((idx) => {
        const keyString = Object.entries(idx.key)
          .map(([field, direction]) => `${field}:${direction}`)
          .join(', ');
        console.log(`  - ${idx.name}: {${keyString}}`);
      });
    }

    // 💡 RECOMENDAÇÕES FINAIS
    console.log('\n💡 RECOMENDAÇÕES:');
    console.log(
      '1. 🔄 Reinicie a aplicação para garantir que use os novos índices'
    );
    console.log(
      '2. 📊 Monitore os logs para verificar melhoria na performance'
    );
    console.log('3. 🧪 Teste as queries mais lentas novamente');
    console.log(
      '4. 📈 Use db.collection.getIndexes() para verificar uso dos índices'
    );

    if (count > 100000) {
      console.log('\n⚠️  IMPORTANTE: Com mais de 100k documentos:');
      console.log('   - Considere implementar paginação cursor-based');
      console.log('   - Monitore o uso de memória das queries');
      console.log('   - Considere particionar por época ou compositor');
    }

    console.log('\n✅ Migração de índices concluída com sucesso!');
  } catch (error) {
    console.error('❌ Erro durante a migração:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('🔒 Conexão com MongoDB fechada\n');
  }
}

// 🧪 FUNÇÃO PARA TESTAR PERFORMANCE ESPECÍFICA
async function testSpecificQueries() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const db = client.db();
    const workCollection = db.collection('Work');

    console.log('\n🧪 TESTANDO QUERIES ESPECÍFICAS...\n');

    // 1. Query sem filtros (principal)
    console.log('1. 📊 Query sem filtros (paginação):');
    const start1 = Date.now();
    const result1 = await workCollection
      .find({})
      .sort({ 'composer.name': 1, title: 1 })
      .limit(32)
      .toArray();
    console.log(
      `   ⏱️  ${Date.now() - start1}ms - ${result1.length} resultados`
    );

    // 2. Count total
    console.log('2. 📊 Count total:');
    const start2 = Date.now();
    const count = await workCollection.countDocuments({});
    console.log(`   ⏱️  ${Date.now() - start2}ms - ${count} documentos`);

    // 3. Query com filtro de compositor
    console.log('3. 📊 Query com filtro (compositor):');
    const start3 = Date.now();
    const result3 = await workCollection
      .find({ composerId: { $exists: true } })
      .sort({ title: 1 })
      .limit(32)
      .toArray();
    console.log(
      `   ⏱️  ${Date.now() - start3}ms - ${result3.length} resultados`
    );

    // 4. Query de busca textual
    console.log('4. 📊 Query busca textual:');
    const start4 = Date.now();
    const result4 = await workCollection
      .find({
        $or: [
          { title: { $regex: 'sonata', $options: 'i' } },
          { opOrCatalog: { $regex: 'op', $options: 'i' } },
        ],
      })
      .limit(32)
      .toArray();
    console.log(
      `   ⏱️  ${Date.now() - start4}ms - ${result4.length} resultados`
    );

    console.log(
      '\n📊 Se algum teste demorar mais de 1000ms, há problemas de índice!\n'
    );
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  } finally {
    await client.close();
  }
}

// Executar migração
if (require.main === module) {
  const command = process.argv[2];

  if (command === 'test') {
    console.log('🧪 Executando apenas testes de performance...\n');
    testSpecificQueries()
      .then(() => {
        console.log('✅ Testes concluídos!');
        process.exit(0);
      })
      .catch((error) => {
        console.error('❌ Falha nos testes:', error);
        process.exit(1);
      });
  } else {
    console.log('🚀 Iniciando migração completa de índices...\n');
    createOptimizedIndexes()
      .then(() => {
        console.log(
          '🎉 Processo concluído! Execute "node scripts/migrate-indexes.js test" para testar.\n'
        );
        process.exit(0);
      })
      .catch((error) => {
        console.error('💥 Falha na migração:', error);
        process.exit(1);
      });
  }
}

module.exports = { createOptimizedIndexes, testSpecificQueries };
