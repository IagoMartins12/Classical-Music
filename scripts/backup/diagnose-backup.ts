// scripts/backup/diagnose-backup.ts
import fs from 'fs/promises';
import path from 'path';

async function diagnoseBackup(backupPath: string): Promise<void> {
  console.log('🔍 Diagnóstico do Backup');
  console.log('='.repeat(50));

  try {
    let backupDir: string;

    // Determinar diretório
    if (backupPath.endsWith('backup.json')) {
      backupDir = path.dirname(backupPath);
    } else {
      backupDir = backupPath;
      backupPath = path.join(backupDir, 'backup.json');
    }

    console.log(`📁 Diretório: ${backupDir}`);
    console.log(`📄 Backup principal: ${backupPath}`);

    // 1. Verificar estrutura de arquivos
    console.log('\n📂 Estrutura de arquivos:');
    try {
      const files = await fs.readdir(backupDir);
      files.forEach((file) => {
        console.log(`   • ${file}`);
      });
    } catch (error) {
      console.error('❌ Erro lendo diretório:', error.message);
      return;
    }

    // 2. Verificar metadados
    console.log('\n📋 Metadados:');
    const metadataPath = path.join(backupDir, 'metadata.json');
    try {
      const metadata = JSON.parse(await fs.readFile(metadataPath, 'utf8'));
      console.log(
        `   📅 Data: ${new Date(metadata.timestamp).toLocaleString('pt-BR')}`
      );
      console.log(
        `   📊 Total registros: ${metadata.totalRecords?.toLocaleString(
          'pt-BR'
        )}`
      );
      console.log(`   ✅ Status: ${metadata.status}`);
      console.log(`   📋 Collections: ${metadata.collections?.length || 0}`);
      console.log(
        `   🗃️  Collections grandes: ${metadata.largeCollections?.length || 0}`
      );

      if (metadata.largeCollections?.length > 0) {
        console.log('\n🗃️  Detalhes das collections grandes:');
        metadata.largeCollections.forEach((col: any) => {
          console.log(
            `   • ${col.name}: ${col.records.toLocaleString(
              'pt-BR'
            )} registros${col.isChunked ? ' (chunked)' : ''}`
          );
        });
      }
    } catch (error) {
      console.error('❌ Erro lendo metadados:', error.message);
    }

    // 3. Verificar backup principal
    console.log('\n📄 Backup principal:');
    try {
      const backupContent = await fs.readFile(backupPath, 'utf8');
      const backupData = JSON.parse(backupContent);

      console.log(
        `   📊 Collections no backup principal: ${
          Object.keys(backupData.data).length
        }`
      );

      for (const [collection, data] of Object.entries(backupData.data)) {
        if (Array.isArray(data)) {
          if (data.length === 1 && typeof data[0] === 'string') {
            console.log(`   • ${collection}: ${data[0]} (referência a chunks)`);
          } else {
            console.log(`   • ${collection}: ${data.length} registros`);
          }
        } else {
          console.log(`   • ${collection}: dados inválidos (${typeof data})`);
        }
      }
    } catch (error) {
      console.error('❌ Erro lendo backup principal:', error.message);
    }

    // 4. Verificar collections individuais
    console.log('\n📁 Collections individuais:');
    const collectionsDir = path.join(backupDir, 'collections');
    try {
      const collectionFiles = await fs.readdir(collectionsDir);

      console.log(`   📊 Total de arquivos: ${collectionFiles.length}`);

      // Separar chunks e arquivos normais
      const chunkFiles = collectionFiles.filter((f) => f.includes('_chunk_'));
      const indexFiles = collectionFiles.filter((f) =>
        f.includes('_index.json')
      );
      const normalFiles = collectionFiles.filter(
        (f) => !f.includes('_chunk_') && !f.includes('_index.json')
      );

      console.log(`   📦 Arquivos de chunk: ${chunkFiles.length}`);
      console.log(`   📋 Arquivos de índice: ${indexFiles.length}`);
      console.log(`   📄 Arquivos normais: ${normalFiles.length}`);

      // Verificar arquivos normais
      if (normalFiles.length > 0) {
        console.log('\n📄 Collections normais:');
        for (const file of normalFiles.slice(0, 10)) {
          // Primeiros 10
          try {
            const filePath = path.join(collectionsDir, file);
            const data = JSON.parse(await fs.readFile(filePath, 'utf8'));
            console.log(`   • ${file}: ${data.length} registros`);
          } catch (error) {
            console.log(`   • ${file}: erro lendo (${error.message})`);
          }
        }
        if (normalFiles.length > 10) {
          console.log(`   ... e mais ${normalFiles.length - 10} arquivos`);
        }
      }

      // Verificar índices de chunks
      if (indexFiles.length > 0) {
        console.log('\n📦 Collections com chunks:');
        for (const indexFile of indexFiles) {
          try {
            const indexPath = path.join(collectionsDir, indexFile);
            const indexData = JSON.parse(await fs.readFile(indexPath, 'utf8'));
            console.log(
              `   • ${
                indexData.collection
              }: ${indexData.totalRecords.toLocaleString(
                'pt-BR'
              )} registros em ${indexData.totalChunks} chunks`
            );

            // Verificar se os chunks realmente existem
            let chunksExist = 0;
            for (const chunkFile of indexData.chunks) {
              const chunkPath = path.join(collectionsDir, chunkFile);
              try {
                await fs.access(chunkPath);
                chunksExist++;
              } catch {}
            }
            console.log(
              `     ✓ ${chunksExist}/${indexData.totalChunks} chunks encontrados`
            );
          } catch (error) {
            console.log(`   • ${indexFile}: erro lendo índice`);
          }
        }
      }
    } catch (error) {
      console.error('❌ Erro verificando collections:', error.message);
    }

    // 5. Verificar algumas collections específicas importantes
    console.log('\n🔍 Verificação detalhada de collections importantes:');
    const importantCollections = ['work', 'composer', 'user'];

    for (const collection of importantCollections) {
      try {
        // Verificar se tem índice (é chunked)
        const indexPath = path.join(collectionsDir, `${collection}_index.json`);
        try {
          const indexData = JSON.parse(await fs.readFile(indexPath, 'utf8'));
          console.log(
            `   🗃️  ${collection}: ${indexData.totalRecords.toLocaleString(
              'pt-BR'
            )} registros em chunks`
          );

          // Verificar primeiro chunk
          if (indexData.chunks.length > 0) {
            const firstChunkPath = path.join(
              collectionsDir,
              indexData.chunks[0]
            );
            const firstChunk = JSON.parse(
              await fs.readFile(firstChunkPath, 'utf8')
            );
            console.log(
              `     📦 Primeiro chunk: ${firstChunk.length} registros`
            );
            console.log(`     📝 Exemplo do primeiro registro:`);
            if (firstChunk.length > 0) {
              const example = firstChunk[0];
              const keys = Object.keys(example).slice(0, 5); // Primeiras 5 chaves
              console.log(
                `        {${keys
                  .map((k) => `${k}: ${typeof example[k]}`)
                  .join(', ')}...}`
              );
            }
          }
        } catch {
          // Não é chunked, verificar arquivo normal
          const collectionPath = path.join(
            collectionsDir,
            `${collection}.json`
          );
          try {
            const data = JSON.parse(await fs.readFile(collectionPath, 'utf8'));
            console.log(
              `   📄 ${collection}: ${data.length} registros (arquivo normal)`
            );
            if (data.length > 0) {
              const example = data[0];
              const keys = Object.keys(example).slice(0, 5);
              console.log(
                `     📝 Exemplo: {${keys
                  .map((k) => `${k}: ${typeof example[k]}`)
                  .join(', ')}...}`
              );
            }
          } catch {
            console.log(`   ❌ ${collection}: não encontrado`);
          }
        }
      } catch (error) {
        console.log(`   ❌ ${collection}: erro (${error.message})`);
      }
    }

    // 6. Resumo e recomendações
    console.log('\n💡 Diagnóstico e Recomendações:');
    console.log('='.repeat(50));

    try {
      const metadata = JSON.parse(await fs.readFile(metadataPath, 'utf8'));

      if (metadata.totalRecords > 0) {
        console.log('✅ Backup contém dados');

        if (metadata.largeCollections?.length > 0) {
          console.log('✅ Collections grandes foram processadas em chunks');
          console.log('📝 Para restaurar, use:');
          console.log(`   npm run backup:restore ${backupPath}`);
        }

        console.log('\n🔧 Se a restauração falhar:');
        console.log(
          '1. Verificar se o Prisma suporta createMany sem skipDuplicates'
        );
        console.log('2. Tentar restauração collection por collection:');
        console.log(
          `   npx tsx scripts/backup/restore-selective.ts ${backupDir}/backup.json user composer`
        );
        console.log('3. Verificar se o banco de destino está vazio');
      } else {
        console.log('❌ Backup não contém dados');
        console.log('🔧 Recomendação: refazer o backup');
      }
    } catch {
      console.log('❌ Não foi possível determinar status do backup');
    }
  } catch (error) {
    console.error('💥 Erro durante diagnóstico:', error);
  }
}

// CLI
async function main() {
  const backupPath = process.argv[2];

  if (!backupPath) {
    console.log('🔧 Diagnóstico de Backup');
    console.log('');
    console.log('Uso:');
    console.log('  npx tsx scripts/backup/diagnose-backup.ts <backup-path>');
    console.log('');
    console.log('Exemplos:');
    console.log(
      '  npx tsx scripts/backup/diagnose-backup.ts ./backups/backup-2025-07-06T21-10-52-942Z'
    );
    console.log(
      '  npx tsx scripts/backup/diagnose-backup.ts ./backups/backup-2025-07-06T21-10-52-942Z/backup.json'
    );
    process.exit(1);
  }

  await diagnoseBackup(backupPath);
}

if (require.main === module) {
  main();
}

export { diagnoseBackup };
