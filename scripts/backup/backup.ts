// scripts/backup/backup.ts
import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

// Lista de todos os models do seu schema na ordem correta para backup
const MODELS_ORDER = [
  // Tabelas independentes primeiro
  'epoch',
  'role',
  'instrument',
  'workGenre',

  // Usuários
  'user',
  'account',
  'session',

  // Compositores (dependem de epoch e role)
  'composer',

  // Obras (dependem de composer, epoch, instrument)
  'work',

  // Partituras e processamento (dependem de work)
  'workScore',

  // Dados do usuário relacionados a obras
  'userInstrument',
  'annotation',
  'pdfAnnotation',
  'scoreBookmark',
  'studySession',
  'wantToLearn',
  'learned',
  'userSelectedScore',
  'learningGoal',
  'favoriteWork',
  'favoriteComposer',
  'favoriteScore',
  'scoreFavoriteStats',

  // Anotações (dependem de user e work)
  'workAnnotation',
  'annotationHelpfulVote',

  // Histórico e moderação
  'uploadHistory',
  'uploadModeration',
];

interface BackupData {
  timestamp: string;
  version: string;
  metadata: {
    totalRecords: number;
    collections: string[];
    backupSize: string;
    duration: string;
    status: string;
  };
  data: Record<string, any[]>;
}

async function createBackupDirectory(): Promise<string> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(process.cwd(), 'backups', `backup-${timestamp}`);

  await fs.mkdir(backupDir, { recursive: true });
  return backupDir;
}

// Collections que podem ser muito grandes e precisam de tratamento especial
const LARGE_COLLECTIONS = ['work', 'composer', 'workScore'];
const CHUNK_SIZE = 1000; // Processar em lotes de 1000 registros

async function getCollectionData(modelName: string): Promise<any[]> {
  try {
    // @ts-ignore - Prisma dynamic model access
    const count = await prisma[modelName].count();

    // Se for uma collection pequena, buscar tudo de uma vez
    if (count <= CHUNK_SIZE && !LARGE_COLLECTIONS.includes(modelName)) {
      // @ts-ignore
      const data = await prisma[modelName].findMany();
      console.log(`✓ Backed up ${data.length} records from ${modelName}`);
      return data;
    }

    // Para collections grandes, avisar que será processada separadamente
    console.log(
      `📊 ${modelName}: ${count} registros (será processado em chunks)`
    );
    return []; // Retorna vazio, será processado separadamente
  } catch (error) {
    console.error(`✗ Error backing up ${modelName}:`, error);
    return [];
  }
}

async function processLargeCollection(
  modelName: string,
  backupDir: string
): Promise<number> {
  try {
    console.log(`📦 Processando collection grande: ${modelName}`);

    // @ts-ignore
    const totalCount = await prisma[modelName].count();
    console.log(
      `   📊 Total de registros: ${totalCount.toLocaleString('pt-BR')}`
    );

    if (totalCount === 0) {
      console.log(`   ⏭️  Collection vazia, pulando...`);
      return 0;
    }

    const collectionsDir = path.join(backupDir, 'collections');
    await fs.mkdir(collectionsDir, { recursive: true });

    let totalProcessed = 0;
    let chunkIndex = 0;

    // Processar em chunks pequenos
    for (let skip = 0; skip < totalCount; skip += CHUNK_SIZE) {
      const take = Math.min(CHUNK_SIZE, totalCount - skip);

      try {
        // @ts-ignore
        const chunk = await prisma[modelName].findMany({
          skip: skip,
          take: take,
        });

        chunkIndex++;
        totalProcessed += chunk.length;

        // Salvar chunk individual
        const chunkFileName =
          totalCount > CHUNK_SIZE
            ? `${modelName}_chunk_${chunkIndex
                .toString()
                .padStart(3, '0')}.json`
            : `${modelName}.json`;

        const chunkPath = path.join(collectionsDir, chunkFileName);
        await fs.writeFile(chunkPath, JSON.stringify(chunk, null, 2));

        console.log(
          `   💾 Chunk ${chunkIndex}: ${chunk.length} registros salvos (${totalProcessed}/${totalCount})`
        );

        // Liberar memória explicitamente
        chunk.length = 0;

        // Pequena pausa para garbage collection
        if (chunkIndex % 10 === 0) {
          await new Promise((resolve) => setTimeout(resolve, 100));
          if (global.gc) {
            global.gc();
          }
        }
      } catch (chunkError) {
        console.error(`   ❌ Erro no chunk ${chunkIndex}:`, chunkError);
      }
    }

    // Criar arquivo de índice para chunks múltiplos
    if (totalCount > CHUNK_SIZE) {
      const indexData = {
        collection: modelName,
        totalRecords: totalProcessed,
        totalChunks: chunkIndex,
        chunkSize: CHUNK_SIZE,
        chunks: Array.from(
          { length: chunkIndex },
          (_, i) =>
            `${modelName}_chunk_${(i + 1).toString().padStart(3, '0')}.json`
        ),
        createdAt: new Date().toISOString(),
      };

      const indexPath = path.join(collectionsDir, `${modelName}_index.json`);
      await fs.writeFile(indexPath, JSON.stringify(indexData, null, 2));
      console.log(`   📋 Índice criado: ${modelName}_index.json`);
    }

    console.log(
      `   ✅ ${modelName}: ${totalProcessed.toLocaleString(
        'pt-BR'
      )} registros processados`
    );
    return totalProcessed;
  } catch (error) {
    console.error(`❌ Erro processando collection ${modelName}:`, error);
    return 0;
  }
}

async function performBackup(): Promise<void> {
  const startTime = Date.now();

  console.log('🚀 Iniciando backup do banco de dados...');
  console.log(`⏰ Horário: ${new Date().toLocaleString('pt-BR')}`);

  let backupDir: string;

  try {
    // Testar conexão
    await prisma.$connect();
    console.log('✅ Conectado ao banco de dados');

    backupDir = await createBackupDirectory();
    console.log(`📁 Diretório criado: ${backupDir}`);

    // Criar metadados iniciais primeiro
    const initialMetadata = {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      status: 'in_progress',
      totalRecords: 0,
      collections: [],
      largeCollections: [],
      backupSize: '0 MB',
      duration: '0s',
      models: MODELS_ORDER,
      backupLocation: backupDir,
      mainBackupFile: 'backup.json',
      collectionsDir: 'collections/',
      createdAt: new Date().toISOString(),
    };

    const metadataPath = path.join(backupDir, 'metadata.json');
    await fs.writeFile(metadataPath, JSON.stringify(initialMetadata, null, 2));
    console.log('📝 Metadados iniciais salvos');

    const backupData: BackupData = {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      metadata: {
        totalRecords: 0,
        collections: [],
        backupSize: '0 MB',
        duration: '0s',
        status: 'in_progress',
      },
      data: {},
    };

    let totalRecords = 0;
    let largeCollectionsProcessed = [];
    const collectionsDir = path.join(backupDir, 'collections');
    await fs.mkdir(collectionsDir, { recursive: true });

    console.log('\n📦 Fazendo backup das collections...');

    // FASE 1: Backup de collections pequenas/normais
    console.log('\n🔸 FASE 1: Collections pequenas e normais');
    for (const modelName of MODELS_ORDER) {
      if (LARGE_COLLECTIONS.includes(modelName)) {
        console.log(
          `📦 ${modelName}: será processado na fase 2 (collection grande)`
        );
        continue;
      }

      console.log(`📦 Fazendo backup de ${modelName}...`);

      try {
        const modelData = await getCollectionData(modelName);
        backupData.data[modelName] = modelData;
        totalRecords += modelData.length;

        if (modelData.length > 0) {
          backupData.metadata.collections.push(modelName);

          // Salvar collection individual
          const collectionPath = path.join(collectionsDir, `${modelName}.json`);
          await fs.writeFile(
            collectionPath,
            JSON.stringify(modelData, null, 2)
          );
          console.log(
            `   💾 Salvo: ${modelName}.json (${modelData.length} registros)`
          );
        }
      } catch (error) {
        console.error(`❌ Erro específico em ${modelName}:`, error);
        backupData.data[modelName] = [];
      }
    }

    console.log(
      `\n✅ Fase 1 concluída: ${totalRecords.toLocaleString('pt-BR')} registros`
    );

    // FASE 2: Processamento de collections grandes
    console.log('\n🔸 FASE 2: Collections grandes (processamento em chunks)');
    for (const modelName of LARGE_COLLECTIONS) {
      if (!MODELS_ORDER.includes(modelName)) continue;

      try {
        const recordsProcessed = await processLargeCollection(
          modelName,
          backupDir
        );
        totalRecords += recordsProcessed;

        if (recordsProcessed > 0) {
          largeCollectionsProcessed.push({
            name: modelName,
            records: recordsProcessed,
            isChunked: recordsProcessed > CHUNK_SIZE,
          });
          backupData.metadata.collections.push(modelName);
          // Para collections grandes, não adicionar aos dados principais
          backupData.data[modelName] = [
            `${recordsProcessed} registros salvos em chunks separados`,
          ];
        }
      } catch (error) {
        console.error(
          `❌ Erro processando collection grande ${modelName}:`,
          error
        );
      }
    }

    console.log('\n💾 Finalizando backup...');

    // Calcular duração
    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);

    // Atualizar metadados finais
    backupData.metadata.totalRecords = totalRecords;
    backupData.metadata.duration = `${duration}s`;
    backupData.metadata.status = 'completed';

    // Estimativa de tamanho (sem incluir collections grandes na memória)
    try {
      const smallCollectionsSize = Object.entries(backupData.data)
        .filter(([name, data]) => !LARGE_COLLECTIONS.includes(name))
        .reduce((total, [_, data]) => total + JSON.stringify(data).length, 0);

      backupData.metadata.backupSize = `${(
        smallCollectionsSize /
        (1024 * 1024)
      ).toFixed(2)}+ MB (collections grandes em chunks)`;
    } catch {
      backupData.metadata.backupSize = 'Calculando...';
    }

    // Salvar backup principal (apenas collections pequenas)
    try {
      console.log('💾 Salvando backup principal (collections pequenas)...');
      const mainBackupPath = path.join(backupDir, 'backup.json');

      const lightBackup = {
        ...backupData,
        note: 'Collections grandes (work, composer, etc.) estão em chunks separados na pasta collections/',
        largeCollections: largeCollectionsProcessed,
      };

      await fs.writeFile(mainBackupPath, JSON.stringify(lightBackup, null, 2));
      console.log('✅ Backup principal salvo');
    } catch (error) {
      console.warn('⚠️  Erro salvando backup principal:', error);
    }

    // Atualizar metadados finais
    const finalMetadata = {
      ...initialMetadata,
      status: 'completed',
      totalRecords: totalRecords,
      collections: backupData.metadata.collections,
      largeCollections: largeCollectionsProcessed,
      backupSize: backupData.metadata.backupSize,
      duration: backupData.metadata.duration,
      completedAt: new Date().toISOString(),
      collectionsCount: backupData.metadata.collections.length,
      hasMainBackup: true,
      hasIndividualCollections: true,
      hasChunkedCollections: largeCollectionsProcessed.length > 0,
      chunkSize: CHUNK_SIZE,
    };

    await fs.writeFile(metadataPath, JSON.stringify(finalMetadata, null, 2));

    console.log('\n✅ Backup concluído com sucesso!');
    console.log('='.repeat(60));
    console.log(`📁 Localização: ${backupDir}`);
    console.log(
      `📊 Total de registros: ${totalRecords.toLocaleString('pt-BR')}`
    );
    console.log(`💾 Tamanho estimado: ${backupData.metadata.backupSize}`);
    console.log(`⏱️  Duração: ${duration}s`);
    console.log(`📋 Collections: ${backupData.metadata.collections.length}`);

    if (largeCollectionsProcessed.length > 0) {
      console.log(`\n🗃️  Collections grandes processadas:`);
      largeCollectionsProcessed.forEach((col) => {
        const chunks = col.isChunked
          ? ` (${Math.ceil(col.records / CHUNK_SIZE)} chunks)`
          : '';
        console.log(
          `   • ${col.name}: ${col.records.toLocaleString(
            'pt-BR'
          )} registros${chunks}`
        );
      });
    }

    console.log('\n📂 Arquivos criados:');
    console.log(`   • metadata.json - Informações completas do backup`);
    console.log(`   • backup.json - Backup das collections pequenas`);
    console.log(`   • collections/ - Arquivos individuais e chunks`);

    if (largeCollectionsProcessed.some((col) => col.isChunked)) {
      console.log(
        `   • collections/*_index.json - Índices para collections grandes`
      );
    }

    console.log(
      '\n💡 Para restaurar collections grandes, use os chunks individuais!'
    );
  } catch (error) {
    console.error('\n❌ Erro durante o backup:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Script de restauração com suporte a chunks - CORRIGIDO
async function performRestore(
  backupPath: string,
  options: {
    skipExisting?: boolean;
    collections?: string[];
  } = {}
): Promise<void> {
  console.log('🔄 Iniciando restauração do banco de dados...');

  try {
    let backupData: BackupData;
    let backupDir: string;
    let metadata: any;

    // Determinar diretório do backup
    if (backupPath.endsWith('backup.json')) {
      backupDir = path.dirname(backupPath);
    } else {
      backupDir = backupPath;
      backupPath = path.join(backupDir, 'backup.json');
    }

    // Ler metadados primeiro
    const metadataPath = path.join(backupDir, 'metadata.json');
    try {
      metadata = JSON.parse(await fs.readFile(metadataPath, 'utf8'));
      console.log(
        `📅 Restaurando backup de: ${new Date(
          metadata.timestamp
        ).toLocaleString('pt-BR')}`
      );
      console.log(
        `📊 Total de registros: ${metadata.totalRecords?.toLocaleString(
          'pt-BR'
        )}`
      );
      console.log(
        `🗃️  Collections grandes: ${metadata.largeCollections?.length || 0}`
      );
    } catch (metaError) {
      console.warn('⚠️  Metadados não encontrados, tentando backup direto...');
    }

    // Tentar ler backup principal
    try {
      const backupContent = await fs.readFile(backupPath, 'utf8');
      backupData = JSON.parse(backupContent);
    } catch (error) {
      console.log(
        'ℹ️  Backup principal não encontrado, usando collections individuais...'
      );

      // Criar estrutura básica para usar collections individuais
      backupData = {
        timestamp: metadata?.timestamp || new Date().toISOString(),
        version: metadata?.version || '1.0.0',
        metadata: {
          totalRecords: metadata?.totalRecords || 0,
          collections: metadata?.collections || [],
          backupSize: metadata?.backupSize || 'N/A',
          duration: metadata?.duration || 'N/A',
          status: metadata?.status || 'completed',
        },
        data: {},
      };
    }

    const collectionsToRestore = options.collections || MODELS_ORDER;
    const collectionsDir = path.join(backupDir, 'collections');

    let restoredCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    let totalRestored = 0;

    for (const modelName of collectionsToRestore) {
      // Verificar se é uma collection presente no backup
      if (metadata?.collections && !metadata.collections.includes(modelName)) {
        console.log(`⏭️  Pulando ${modelName} (não presente no backup)`);
        skippedCount++;
        continue;
      }

      console.log(`📥 Restaurando ${modelName}...`);

      try {
        if (options.skipExisting) {
          // @ts-ignore
          const existingCount = await prisma[modelName].count();
          if (existingCount > 0) {
            console.log(
              `⏭️  Pulando ${modelName} (${existingCount} registros já existem)`
            );
            skippedCount++;
            continue;
          }
        }

        let modelData = [];
        let recordsInModel = 0;

        // Verificar se é uma collection grande com chunks
        const indexPath = path.join(collectionsDir, `${modelName}_index.json`);
        try {
          const indexData = JSON.parse(await fs.readFile(indexPath, 'utf8'));
          console.log(
            `   📦 Collection chunked detectada: ${indexData.totalChunks} chunks`
          );

          // Restaurar chunk por chunk
          for (const chunkFile of indexData.chunks) {
            const chunkPath = path.join(collectionsDir, chunkFile);
            try {
              const chunkData = JSON.parse(
                await fs.readFile(chunkPath, 'utf8')
              );

              // Inserir chunk em lotes menores
              const batchSize = 50; // Menor para evitar problemas
              for (let i = 0; i < chunkData.length; i += batchSize) {
                const batch = chunkData.slice(i, i + batchSize);

                // Inserir um por um se createMany não funcionar
                try {
                  // @ts-ignore - Tentar createMany sem skipDuplicates
                  const result = await prisma[modelName].createMany({
                    data: batch,
                  });
                  recordsInModel += result.count || batch.length;
                } catch (createManyError) {
                  // Fallback: inserir um por um
                  console.log(
                    `   🔄 Fallback: inserindo registros individualmente...`
                  );
                  for (const record of batch) {
                    try {
                      // @ts-ignore
                      await prisma[modelName].create({ data: record });
                      recordsInModel++;
                    } catch (individualError) {
                      // Pular registros duplicados ou inválidos silenciosamente
                    }
                  }
                }
              }

              console.log(
                `   ✓ Chunk ${chunkFile}: ${chunkData.length} registros processados`
              );
            } catch (chunkError) {
              console.warn(`   ⚠️  Erro no chunk ${chunkFile}:`, chunkError);
            }
          }
        } catch {
          // Não é chunked, tentar collection normal

          // Primeiro verificar se os dados no backup principal são válidos
          if (
            backupData.data[modelName] &&
            Array.isArray(backupData.data[modelName])
          ) {
            const potentialData = backupData.data[modelName];

            // Verificar se é uma string indicando chunks (dados inválidos)
            if (
              potentialData.length === 1 &&
              typeof potentialData[0] === 'string'
            ) {
              console.log(
                `   ℹ️  ${modelName} tem dados em chunks, procurando arquivo individual...`
              );
              modelData = [];
            } else {
              modelData = potentialData;
            }
          }

          // Se não há dados válidos no backup principal, tentar arquivo individual
          if (modelData.length === 0) {
            const collectionPath = path.join(
              collectionsDir,
              `${modelName}.json`
            );
            try {
              const fileData = await fs.readFile(collectionPath, 'utf8');
              modelData = JSON.parse(fileData);
              console.log(
                `   📁 Carregado de ${modelName}.json: ${modelData.length} registros`
              );
            } catch {
              console.log(`   ⏭️  Arquivo ${modelName}.json não encontrado`);
              skippedCount++;
              continue;
            }
          }

          if (modelData.length === 0) {
            console.log(`   ⏭️  ${modelName} vazio`);
            skippedCount++;
            continue;
          }

          // Inserir dados em lotes
          const batchSize = 50;
          for (let i = 0; i < modelData.length; i += batchSize) {
            const batch = modelData.slice(i, i + batchSize);
            try {
              // @ts-ignore - Tentar createMany sem skipDuplicates
              const result = await prisma[modelName].createMany({
                data: batch,
              });
              recordsInModel += result.count || batch.length;
            } catch (createManyError) {
              // Fallback: inserir um por um
              console.log(
                `   🔄 Fallback para ${modelName}: inserindo individualmente...`
              );
              for (const record of batch) {
                try {
                  // @ts-ignore
                  await prisma[modelName].create({ data: record });
                  recordsInModel++;
                } catch (individualError) {
                  // Pular duplicados silenciosamente
                }
              }
            }
          }
        }

        console.log(
          `✓ Restaurado ${recordsInModel.toLocaleString(
            'pt-BR'
          )} registros em ${modelName}`
        );
        totalRestored += recordsInModel;
        restoredCount++;
      } catch (error) {
        console.error(`✗ Erro restaurando ${modelName}:`, error);
        errorCount++;
      }
    }

    console.log('\n✅ Restauração concluída!');
    console.log('='.repeat(60));
    console.log(`📊 Collections restauradas: ${restoredCount}`);
    console.log(
      `📈 Total de registros restaurados: ${totalRestored.toLocaleString(
        'pt-BR'
      )}`
    );
    console.log(`⏭️  Collections puladas: ${skippedCount}`);
    console.log(`❌ Collections com erro: ${errorCount}`);

    if (metadata?.largeCollections?.length > 0) {
      console.log(
        'ℹ️  Backup continha collections grandes processadas em chunks'
      );
    }

    if (totalRestored === 0) {
      console.log('\n⚠️  ATENÇÃO: Nenhum registro foi restaurado!');
      console.log('Possíveis causas:');
      console.log(
        '• Dados já existem no banco (use --skip-existing para verificar)'
      );
      console.log('• Problema com chunks das collections grandes');
      console.log('• Versão incompatível do Prisma');
      console.log('\n💡 Tente verificar o backup primeiro:');
      console.log(`npx tsx scripts/backup/backup.ts verify ${backupPath}`);
    }
  } catch (error) {
    console.error('❌ Erro durante a restauração:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Utilitário para listar backups disponíveis
async function listBackups(): Promise<void> {
  const backupsDir = path.join(process.cwd(), 'backups');

  try {
    // Verificar se o diretório existe
    try {
      await fs.access(backupsDir);
    } catch {
      console.log('📭 Nenhum backup encontrado (pasta backups/ não existe)');
      console.log('💡 Execute: npm run backup');
      return;
    }

    const entries = await fs.readdir(backupsDir, { withFileTypes: true });
    const backupDirs = entries.filter((entry) => entry.isDirectory());

    if (backupDirs.length === 0) {
      console.log('📭 Nenhum backup encontrado');
      console.log('💡 Execute: npm run backup');
      return;
    }

    console.log('📚 Backups disponíveis:');
    console.log('='.repeat(60));

    // Ordenar por data (mais recente primeiro)
    backupDirs.sort((a, b) => b.name.localeCompare(a.name));

    for (const dir of backupDirs) {
      const metadataPath = path.join(backupsDir, dir.name, 'metadata.json');
      const backupPath = path.join(backupsDir, dir.name, 'backup.json');
      const collectionsPath = path.join(backupsDir, dir.name, 'collections');
      const errorPath = path.join(backupsDir, dir.name, 'error.json');

      try {
        // Verificar se houve erro primeiro
        try {
          const errorData = JSON.parse(await fs.readFile(errorPath, 'utf8'));
          console.log(`📁 ${dir.name}`);
          console.log(`   ❌ Status: FALHOU`);
          console.log(
            `   📅 Data: ${new Date(errorData.timestamp).toLocaleString(
              'pt-BR'
            )}`
          );
          console.log(`   💥 Erro: ${errorData.error}`);
          console.log('');
          continue;
        } catch {
          // Não há arquivo de erro, continuar verificação normal
        }

        // Tentar ler metadados
        const metadata = JSON.parse(await fs.readFile(metadataPath, 'utf8'));

        console.log(`📁 ${dir.name}`);
        console.log(
          `   📅 Data: ${new Date(metadata.timestamp).toLocaleString('pt-BR')}`
        );
        console.log(
          `   📊 Registros: ${
            metadata.totalRecords?.toLocaleString('pt-BR') || 'N/A'
          }`
        );
        console.log(`   💾 Tamanho: ${metadata.backupSize || 'N/A'}`);
        console.log(`   ⏱️  Duração: ${metadata.duration || 'N/A'}`);
        console.log(
          `   📋 Collections: ${
            metadata.collectionsCount || metadata.collections?.length || 0
          }`
        );

        // Verificar status
        const status = metadata.status || 'unknown';
        const statusEmoji =
          status === 'completed'
            ? '✅'
            : status === 'in_progress'
            ? '🔄'
            : status === 'failed'
            ? '❌'
            : '❓';
        console.log(`   ${statusEmoji} Status: ${status.toUpperCase()}`);

        // Verificar se há collections individuais
        try {
          const collectionFiles = await fs.readdir(collectionsPath);
          console.log(
            `   🗂️  Collections individuais: ${collectionFiles.length}`
          );
        } catch {
          console.log(`   🗂️  Collections individuais: 0`);
        }

        // Verificar se há backup principal
        try {
          await fs.access(backupPath);
          console.log(`   📄 Backup principal: ✅`);
        } catch {
          console.log(`   📄 Backup principal: ❌ (muito grande)`);
        }
      } catch {
        // Se não conseguir ler metadados, verificar estrutura básica
        try {
          const dirStat = await fs.stat(path.join(backupsDir, dir.name));
          console.log(`📁 ${dir.name}`);
          console.log(`   📅 Data: ${dirStat.mtime.toLocaleString('pt-BR')}`);

          // Verificar se há backup.json
          try {
            const backupStat = await fs.stat(backupPath);
            const sizeMB = (backupStat.size / (1024 * 1024)).toFixed(2);
            console.log(`   💾 Tamanho: ${sizeMB} MB`);
            console.log(`   ⚠️  Status: metadados ausentes, mas backup existe`);
          } catch {
            // Verificar se há collections
            try {
              const collectionFiles = await fs.readdir(collectionsPath);
              console.log(
                `   🗂️  Collections: ${collectionFiles.length} arquivos`
              );
              console.log(
                `   ⚠️  Status: backup incompleto (sem backup principal)`
              );
            } catch {
              console.log(`   ❌ Status: backup corrompido ou vazio`);
            }
          }
        } catch {
          console.log(`📁 ${dir.name}`);
          console.log(`   ❌ Backup inacessível ou corrompido`);
        }
      }
      console.log('');
    }

    console.log(`📈 Total: ${backupDirs.length} backup(s) encontrado(s)`);

    // Dicas úteis
    console.log('\n💡 Dicas:');
    console.log(
      '   • Para restaurar: npm run backup:restore ./backups/backup-xxx/backup.json'
    );
    console.log(
      '   • Para verificar: npm run backup:verify ./backups/backup-xxx/backup.json'
    );
    console.log(
      '   • Para collections grandes, use os arquivos em collections/ individuais'
    );
  } catch (error) {
    console.error('❌ Erro listando backups:', error);
  }
}

// Verificar integridade de um backup
async function verifyBackup(backupPath: string): Promise<boolean> {
  try {
    console.log(`🔍 Verificando integridade de: ${backupPath}`);

    let backupData: BackupData;
    let useIndividualCollections = false;

    // Tentar ler backup principal
    try {
      const backupContent = await fs.readFile(backupPath, 'utf8');
      backupData = JSON.parse(backupContent);
    } catch (error) {
      console.log(
        'ℹ️  Backup principal não encontrado, verificando collections individuais...'
      );

      // Tentar usar metadados + collections individuais
      const backupDir = path.dirname(backupPath);
      const metadataPath = path.join(backupDir, 'metadata.json');
      const collectionsDir = path.join(backupDir, 'collections');

      try {
        const metadata = JSON.parse(await fs.readFile(metadataPath, 'utf8'));

        // Verificar collections individuais
        let totalRecordsFound = 0;
        let collectionsFound = 0;

        for (const collection of metadata.collections || []) {
          try {
            const collectionPath = path.join(
              collectionsDir,
              `${collection}.json`
            );
            const collectionData = JSON.parse(
              await fs.readFile(collectionPath, 'utf8')
            );
            totalRecordsFound += collectionData.length;
            collectionsFound++;
          } catch {
            console.warn(
              `⚠️  Collection ${collection} não encontrada ou corrompida`
            );
          }
        }

        console.log('📋 Resultado da verificação (collections individuais):');
        console.log(
          `   Collections esperadas: ${metadata.collections?.length || 0}`
        );
        console.log(`   Collections encontradas: ${collectionsFound}`);
        console.log(`   Registros encontrados: ${totalRecordsFound}`);
        console.log(`   Registros nos metadados: ${metadata.totalRecords}`);

        const isValid =
          totalRecordsFound === metadata.totalRecords &&
          collectionsFound === (metadata.collections?.length || 0);

        console.log(
          `   Status: ${isValid ? '✅ VÁLIDO' : '⚠️  PARCIALMENTE VÁLIDO'}`
        );

        return isValid;
      } catch (metaError) {
        console.error('❌ Não foi possível verificar backup:', metaError);
        return false;
      }
    }

    // Verificação do backup principal
    let totalRecords = 0;
    let collectionsWithData = 0;

    for (const [collection, data] of Object.entries(backupData.data)) {
      if (Array.isArray(data)) {
        totalRecords += data.length;
        if (data.length > 0) {
          collectionsWithData++;
        }
      }
    }

    const isValid = totalRecords === backupData.metadata.totalRecords;

    console.log('📋 Resultado da verificação:');
    console.log(`   Registros no backup: ${totalRecords}`);
    console.log(
      `   Registros nos metadados: ${backupData.metadata.totalRecords}`
    );
    console.log(`   Collections com dados: ${collectionsWithData}`);
    console.log(
      `   Collections nos metadados: ${backupData.metadata.collections.length}`
    );
    console.log(`   Status: ${isValid ? '✅ VÁLIDO' : '❌ INVÁLIDO'}`);

    return isValid;
  } catch (error) {
    console.error('❌ Erro verificando backup:', error);
    return false;
  }
}

// CLI Interface
async function main() {
  const command = process.argv[2];

  switch (command) {
    case 'backup':
      await performBackup();
      break;

    case 'restore':
      const backupPath = process.argv[3];
      if (!backupPath) {
        console.error('❌ Forneça o caminho do backup para restaurar');
        console.log(
          'Exemplo: npm run backup:restore ./backups/backup-2024-01-01/backup.json'
        );
        process.exit(1);
      }

      const skipExisting = process.argv.includes('--skip-existing');
      await performRestore(backupPath, { skipExisting });
      break;

    case 'list':
      await listBackups();
      break;

    case 'verify':
      const verifyPath = process.argv[3];
      if (!verifyPath) {
        console.error('❌ Forneça o caminho do backup para verificar');
        console.log(
          'Exemplo: npm run backup:verify ./backups/backup-2024-01-01/backup.json'
        );
        process.exit(1);
      }
      await verifyBackup(verifyPath);
      break;

    default:
      console.log('🔧 Sistema de Backup - MongoDB Atlas');
      console.log('');
      console.log('Comandos disponíveis:');
      console.log('  backup               - Criar novo backup completo');
      console.log('  restore <path>       - Restaurar backup');
      console.log('  list                 - Listar backups disponíveis');
      console.log('  verify <path>        - Verificar integridade do backup');
      console.log('');
      console.log('Opções de restauração:');
      console.log(
        '  --skip-existing      - Pular collections que já têm dados'
      );
      console.log('');
      console.log('Exemplos:');
      console.log('  npm run backup');
      console.log('  npm run backup:list');
      console.log(
        '  npm run backup:restore ./backups/backup-2024-01-01/backup.json'
      );
      console.log(
        '  npm run backup:restore ./backups/backup-2024-01-01/backup.json --skip-existing'
      );
      console.log(
        '  npx tsx scripts/backup/backup.ts verify ./backups/backup-2024-01-01/backup.json'
      );
      console.log('');
      console.log('💡 Para backups grandes, use as collections individuais:');
      console.log(
        '  npx tsx scripts/backup/restore-selective.ts ./backups/backup-xxx/backup.json user work'
      );
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error('💥 Erro crítico:', error);
    process.exit(1);
  });
}

export { performBackup, performRestore, listBackups, verifyBackup };
