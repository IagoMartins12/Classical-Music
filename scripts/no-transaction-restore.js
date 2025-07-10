// no-transaction-restore.js
const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

const MONGO_URL = 'mongodb://localhost:27017';
const DB_NAME = 'classical_hub';

async function directMongoRestore(backupPath) {
  const client = new MongoClient(MONGO_URL);

  try {
    console.log('🔄 Conectando ao MongoDB diretamente...');
    await client.connect();

    const db = client.db(DB_NAME);
    console.log('✅ Conectado ao banco:', DB_NAME);

    if (!fs.existsSync(backupPath)) {
      throw new Error(`Backup não encontrado em: ${backupPath}`);
    }

    const files = fs.readdirSync(backupPath);
    console.log('📁 Arquivos encontrados:', files.length);

    // Ordem de restauração
    const restoreOrder = [
      'epoch',
      'role',
      'instrument',
      'workGenre',
      'user',
      'composer',
      'work',
      'userInstrument',
      'annotation',
      'favoriteWork',
      'favoriteComposer',
      'wantToLearn',
      'learned',
      'studySession',
      'pdfAnnotation',
      'scoreBookmark',
      'workScore',
      'favoriteScore',
      'workAnnotation',
      'annotationHelpfulVote',
      'annotationReply',
    ];

    const results = {};

    for (const collectionName of restoreOrder) {
      const result = await restoreCollectionDirect(
        db,
        backupPath,
        collectionName
      );
      results[collectionName] = result;
    }

    // Relatório final
    console.log('\n📊 RELATÓRIO FINAL:');
    console.log('==================');
    Object.entries(results).forEach(([collection, result]) => {
      if (result.processed > 0) {
        console.log(
          `${collection}: ${result.success}/${result.processed} (${result.errors} erros)`
        );
      }
    });

    console.log('\n🎉 Restauração concluída!');
  } catch (error) {
    console.error('❌ Erro durante a restauração:', error);
  } finally {
    await client.close();
  }
}

async function restoreCollectionDirect(db, backupPath, collectionName) {
  const result = { processed: 0, success: 0, errors: 0 };

  try {
    // Verificar se existe arquivo para esta collection
    const jsonPath = path.join(backupPath, `${collectionName}.json`);
    const chunkedPath = path.join(backupPath, `${collectionName}_chunk_0.json`);

    let filePath = null;
    let isChunked = false;

    if (fs.existsSync(jsonPath)) {
      filePath = jsonPath;
    } else if (fs.existsSync(chunkedPath)) {
      isChunked = true;
    } else {
      console.log(`⏭️  ${collectionName}: arquivo não encontrado`);
      return result;
    }

    console.log(`\n📥 Restaurando ${collectionName}...`);

    const collection = db.collection(collectionName);

    if (isChunked) {
      // Processar arquivos em chunks
      let chunkIndex = 0;
      while (true) {
        const chunkPath = path.join(
          backupPath,
          `${collectionName}_chunk_${chunkIndex}.json`
        );
        if (!fs.existsSync(chunkPath)) break;

        console.log(`   📦 Processando chunk ${chunkIndex}...`);
        const chunkResult = await processFileDirect(collection, chunkPath);
        result.processed += chunkResult.processed;
        result.success += chunkResult.success;
        result.errors += chunkResult.errors;

        chunkIndex++;
      }
    } else {
      // Processar arquivo único
      const fileResult = await processFileDirect(collection, filePath);
      result.processed = fileResult.processed;
      result.success = fileResult.success;
      result.errors = fileResult.errors;
    }

    if (result.processed > 0) {
      console.log(
        `✅ ${collectionName}: ${result.success}/${result.processed} registros (${result.errors} erros)`
      );
    }
  } catch (error) {
    console.error(`❌ Erro ao restaurar ${collectionName}:`, error.message);
    result.errors++;
  }

  return result;
}

async function processFileDirect(collection, filePath) {
  const result = { processed: 0, success: 0, errors: 0 };

  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    let data;

    try {
      data = JSON.parse(fileContent);
    } catch (error) {
      console.error(`❌ Erro no JSON:`, error.message);
      return result;
    }

    if (!Array.isArray(data)) {
      console.log(`⚠️  Não é um array`);
      return result;
    }

    if (data.length === 0) {
      console.log(`ℹ️  Está vazio`);
      return result;
    }

    result.processed = data.length;

    // Tentar inserção em lote primeiro
    try {
      const cleanedData = data.map((record) => {
        const cleaned = { ...record };
        // Converter _id string para ObjectId se necessário
        if (cleaned._id && typeof cleaned._id === 'string') {
          const { ObjectId } = require('mongodb');
          cleaned._id = new ObjectId(cleaned._id);
        }
        return cleaned;
      });

      const insertResult = await collection.insertMany(cleanedData, {
        ordered: false,
      });
      result.success = insertResult.insertedCount;
      console.log(
        `   ✅ Inserção em lote: ${insertResult.insertedCount} registros`
      );
    } catch (batchError) {
      console.log(
        `   ⚠️  Inserção em lote falhou, tentando individualmente...`
      );

      // Inserção individual como fallback
      for (let i = 0; i < data.length; i++) {
        try {
          const record = { ...data[i] };
          if (record._id && typeof record._id === 'string') {
            const { ObjectId } = require('mongodb');
            record._id = new ObjectId(record._id);
          }

          await collection.insertOne(record);
          result.success++;

          if (i % 100 === 0 && i > 0) {
            console.log(`   📈 Progresso: ${i}/${data.length}`);
          }
        } catch (error) {
          result.errors++;

          // Log apenas os primeiros 3 erros
          if (result.errors <= 3) {
            console.error(`   ❌ Erro registro ${i}:`, error.message);
          }
        }
      }
    }
  } catch (error) {
    console.error(`❌ Erro ao processar arquivo:`, error.message);
    result.errors++;
  }

  return result;
}

// Executar
const backupPath = process.argv[2];
if (!backupPath) {
  console.error('❌ Por favor, forneça o caminho do backup');
  console.log('Uso: node no-transaction-restore.js /path/to/backup/folder');
  process.exit(1);
}

directMongoRestore(backupPath);
