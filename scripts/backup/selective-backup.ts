// scripts/backup/selective-backup.ts
import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

// Collections disponíveis com suas dependências
const COLLECTION_DEPENDENCIES: { [key: string]: string[] } = {
  user: [],
  epoch: [],
  role: [],
  instrument: [],
  workGenre: [],
  composer: ['epoch', 'role', 'user'],
  work: ['composer', 'epoch', 'instrument', 'user'],
  workScore: ['work'],
  userInstrument: ['user', 'instrument'],
  annotation: ['user', 'work'],
  pdfAnnotation: ['user', 'work'],
  favoriteWork: ['user', 'work'],
  favoriteComposer: ['user', 'composer'],
  newsletterSubscriber: ['user'],
  newsletterTemplate: ['user'],
  advertisement: ['user', 'instrument'],
  // Adicione outras collections conforme necessário
};

interface SelectiveBackupOptions {
  collections: string[];
  includeDependencies: boolean;
  outputDir?: string;
  compressionLevel?: number;
}

interface BackupResult {
  success: boolean;
  backupPath?: string;
  collections: string[];
  totalRecords: number;
  size: string;
  duration: number;
  error?: string;
}

// Função para resolver dependências das collections
function resolveDependencies(collections: string[]): string[] {
  const resolved = new Set<string>();
  const toProcess = [...collections];

  while (toProcess.length > 0) {
    const current = toProcess.pop()!;

    if (resolved.has(current)) continue;

    resolved.add(current);

    // Adicionar dependências
    if (COLLECTION_DEPENDENCIES[current]) {
      for (const dep of COLLECTION_DEPENDENCIES[current]) {
        if (!resolved.has(dep)) {
          toProcess.push(dep);
        }
      }
    }
  }

  // Ordenar por ordem de dependência
  const ordered = Array.from(resolved).sort((a, b) => {
    const aDeps = COLLECTION_DEPENDENCIES[a]?.length || 0;
    const bDeps = COLLECTION_DEPENDENCIES[b]?.length || 0;
    return aDeps - bDeps;
  });

  return ordered;
}

// Executar backup seletivo
export async function performSelectiveBackup(
  options: SelectiveBackupOptions
): Promise<BackupResult> {
  const startTime = Date.now();

  console.log('🎯 Iniciando backup seletivo...');
  console.log(`📋 Collections selecionadas: ${options.collections.join(', ')}`);

  try {
    // Resolver dependências se necessário
    const collectionsToBackup = options.includeDependencies
      ? resolveDependencies(options.collections)
      : options.collections;

    console.log(
      `📦 Collections a serem processadas: ${collectionsToBackup.join(', ')}`
    );

    // Criar diretório de backup
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir =
      options.outputDir ||
      path.join(process.cwd(), 'backups', `selective-backup-${timestamp}`);

    await fs.mkdir(backupDir, { recursive: true });

    const backupData: any = {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      type: 'selective',
      selectedCollections: options.collections,
      processedCollections: collectionsToBackup,
      includedDependencies: options.includeDependencies,
      metadata: {
        totalRecords: 0,
        collections: [],
        backupSize: '0 MB',
        duration: '0s',
        status: 'in_progress',
      },
      data: {} as any,
    };

    let totalRecords = 0;

    // Conectar ao banco
    await prisma.$connect();

    // Fazer backup de cada collection
    for (const collectionName of collectionsToBackup) {
      console.log(`📦 Fazendo backup de ${collectionName}...`);

      try {
        // @ts-ignore - Prisma dynamic model access
        const count = await prisma[collectionName].count();
        console.log(
          `   📊 Total de registros: ${count.toLocaleString('pt-BR')}`
        );

        if (count === 0) {
          console.log(`   ⏭️  Collection vazia, pulando...`);
          backupData.data[collectionName] = [];
          continue;
        }

        // Para collections grandes, processar em chunks
        const CHUNK_SIZE = 1000;
        const data = [];

        if (count > CHUNK_SIZE) {
          console.log(`   📦 Processando em chunks de ${CHUNK_SIZE}...`);

          for (let skip = 0; skip < count; skip += CHUNK_SIZE) {
            const take = Math.min(CHUNK_SIZE, count - skip);

            // @ts-ignore
            const chunk = await prisma[collectionName].findMany({
              skip,
              take,
            });

            data.push(...chunk);

            console.log(`   💾 Processados ${skip + take}/${count} registros`);
          }
        } else {
          // @ts-ignore
          const allData = await prisma[collectionName].findMany();
          data.push(...allData);
        }

        backupData.data[collectionName] = data;
        totalRecords += data.length;
        backupData.metadata.collections.push(collectionName);

        console.log(
          `   ✅ ${collectionName}: ${data.length.toLocaleString(
            'pt-BR'
          )} registros`
        );

        // Salvar collection individual
        const collectionPath = path.join(backupDir, `${collectionName}.json`);
        await fs.writeFile(collectionPath, JSON.stringify(data, null, 2));
      } catch (error) {
        console.error(`   ❌ Erro em ${collectionName}:`, error);
        backupData.data[collectionName] = [];
      }
    }

    // Finalizar backup
    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);

    backupData.metadata.totalRecords = totalRecords;
    backupData.metadata.duration = `${duration}s`;
    backupData.metadata.status = 'completed';

    // Calcular tamanho
    const backupJson = JSON.stringify(backupData, null, 2);
    const sizeBytes = Buffer.byteLength(backupJson, 'utf8');
    backupData.metadata.backupSize = formatBytes(sizeBytes);

    // Salvar backup principal
    const mainBackupPath = path.join(backupDir, 'backup.json');
    await fs.writeFile(mainBackupPath, backupJson);

    // Salvar metadados
    const metadata = {
      ...backupData.metadata,
      collectionsProcessed: collectionsToBackup.length,
      originalSelections: options.collections,
      dependenciesIncluded: options.includeDependencies,
      backupLocation: backupDir,
      createdAt: new Date().toISOString(),
    };

    const metadataPath = path.join(backupDir, 'metadata.json');
    await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));

    console.log('\n✅ Backup seletivo concluído!');
    console.log('='.repeat(60));
    console.log(`📁 Localização: ${backupDir}`);
    console.log(`📊 Collections processadas: ${collectionsToBackup.length}`);
    console.log(
      `📈 Total de registros: ${totalRecords.toLocaleString('pt-BR')}`
    );
    console.log(`💾 Tamanho: ${backupData.metadata.backupSize}`);
    console.log(`⏱️  Duração: ${duration}s`);

    if (
      options.includeDependencies &&
      collectionsToBackup.length > options.collections.length
    ) {
      console.log(`\n🔗 Dependências incluídas automaticamente:`);
      const dependencies = collectionsToBackup.filter(
        (c) => !options.collections.includes(c)
      );
      dependencies.forEach((dep) => console.log(`   • ${dep}`));
    }

    return {
      success: true,
      backupPath: mainBackupPath,
      collections: collectionsToBackup,
      totalRecords,
      size: backupData.metadata.backupSize,
      duration,
    };
  } catch (error) {
    console.error('\n❌ Erro durante backup seletivo:', error);

    return {
      success: false,
      collections: [],
      totalRecords: 0,
      size: '0 MB',
      duration: Math.round((Date.now() - startTime) / 1000),
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    };
  } finally {
    await prisma.$disconnect();
  }
}

// Restaurar backup seletivo
export async function restoreSelectiveBackup(
  backupPath: string,
  options: {
    collections?: string[];
    skipExisting?: boolean;
    dryRun?: boolean;
  } = {}
): Promise<void> {
  console.log('🔄 Iniciando restauração seletiva...');

  try {
    let backupData: any;
    let backupDir: string;

    // Determinar diretório do backup
    if (backupPath.endsWith('backup.json')) {
      backupDir = path.dirname(backupPath);
    } else {
      backupDir = backupPath;
      backupPath = path.join(backupDir, 'backup.json');
    }

    // Ler backup
    const backupContent = await fs.readFile(backupPath, 'utf8');
    backupData = JSON.parse(backupContent);

    console.log(
      `📅 Backup de: ${new Date(backupData.timestamp).toLocaleString('pt-BR')}`
    );
    console.log(`🎯 Tipo: ${backupData.type || 'completo'}`);

    if (backupData.type === 'selective') {
      console.log(
        `📋 Collections originais: ${
          backupData.selectedCollections?.join(', ') || 'N/A'
        }`
      );
      console.log(
        `📦 Collections processadas: ${
          backupData.processedCollections?.join(', ') || 'N/A'
        }`
      );
    }

    // Determinar collections a restaurar
    const collectionsToRestore =
      options.collections ||
      backupData.processedCollections ||
      Object.keys(backupData.data);

    console.log(
      `🔄 Collections a restaurar: ${collectionsToRestore.join(', ')}`
    );

    if (options.dryRun) {
      console.log('\n🧪 Modo de teste - nenhuma alteração será feita');

      for (const collection of collectionsToRestore) {
        const data = backupData.data[collection];
        if (data && Array.isArray(data)) {
          console.log(
            `   • ${collection}: ${data.length} registros para restaurar`
          );
        }
      }
      return;
    }

    // Conectar ao banco
    await prisma.$connect();

    let totalRestored = 0;

    // Restaurar cada collection
    for (const collectionName of collectionsToRestore) {
      if (!backupData.data[collectionName]) {
        console.log(
          `⚠️  Collection '${collectionName}' não encontrada no backup`
        );
        continue;
      }

      const data = backupData.data[collectionName];
      if (!Array.isArray(data) || data.length === 0) {
        console.log(`⏭️  ${collectionName} vazio, pulando`);
        continue;
      }

      console.log(
        `📥 Restaurando ${data.length.toLocaleString(
          'pt-BR'
        )} registros em ${collectionName}...`
      );

      if (options.skipExisting) {
        // @ts-ignore
        const existingCount = await prisma[collectionName].count();
        if (existingCount > 0) {
          console.log(
            `   ⏭️  Pulando ${collectionName} (${existingCount} registros já existem)`
          );
          continue;
        }
      }

      try {
        // Processar em lotes
        const batchSize = 100;
        let batchRestored = 0;

        for (let i = 0; i < data.length; i += batchSize) {
          const batch = data.slice(i, i + batchSize);

          try {
            // @ts-ignore - Tentar createMany
            const result = await prisma[collectionName].createMany({
              data: batch,
              skipDuplicates: true,
            });
            batchRestored += result.count || batch.length;
          } catch (createManyError) {
            // Fallback: inserir um por um
            console.log(
              `   🔄 Fallback para ${collectionName}: inserindo individualmente...`
            );
            for (const record of batch) {
              try {
                // @ts-ignore
                await prisma[collectionName].create({ data: record });
                batchRestored++;
              } catch (individualError) {
                // Pular duplicados silenciosamente
              }
            }
          }
        }

        console.log(
          `   ✅ ${collectionName}: ${batchRestored.toLocaleString(
            'pt-BR'
          )} registros restaurados`
        );
        totalRestored += batchRestored;
      } catch (error) {
        console.error(`   ❌ Erro em ${collectionName}:`, error);
      }
    }

    console.log('\n✅ Restauração seletiva concluída!');
    console.log(
      `📈 Total restaurado: ${totalRestored.toLocaleString('pt-BR')} registros`
    );
  } catch (error) {
    console.error('❌ Erro durante restauração seletiva:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Listar collections disponíveis
export async function listAvailableCollections(): Promise<{
  [key: string]: number;
}> {
  console.log('📋 Listando collections disponíveis...');

  const collections: { [key: string]: number } = {};

  try {
    await prisma.$connect();

    for (const collectionName of Object.keys(COLLECTION_DEPENDENCIES)) {
      try {
        // @ts-ignore
        const count = await prisma[collectionName].count();
        collections[collectionName] = count;
      } catch (error) {
        console.warn(`⚠️  Erro contando ${collectionName}:`, error);
        collections[collectionName] = 0;
      }
    }
  } catch (error) {
    console.error('❌ Erro listando collections:', error);
  } finally {
    await prisma.$disconnect();
  }

  return collections;
}

// Utilitário para formatar bytes
function formatBytes(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
}

// CLI Interface
async function main() {
  const command = process.argv[2];
  const args = process.argv.slice(3);

  switch (command) {
    case 'backup':
      const collections = args.filter((arg) => !arg.startsWith('--'));
      const includeDependencies = args.includes('--with-dependencies');
      const outputDir = args
        .find((arg) => arg.startsWith('--output='))
        ?.split('=')[1];

      if (collections.length === 0) {
        console.error('❌ Especifique pelo menos uma collection para backup');
        console.log(
          'Exemplo: tsx scripts/backup/selective-backup.ts backup user work composer --with-dependencies'
        );
        process.exit(1);
      }

      const result = await performSelectiveBackup({
        collections,
        includeDependencies,
        outputDir,
      });

      if (!result.success) {
        console.error('❌ Backup falhou:', result.error);
        process.exit(1);
      }
      break;

    case 'restore':
      const backupPath = args[0];
      const restoreCollections = args
        .slice(1)
        .filter((arg) => !arg.startsWith('--'));
      const skipExisting = args.includes('--skip-existing');
      const dryRun = args.includes('--dry-run');

      if (!backupPath) {
        console.error('❌ Especifique o caminho do backup');
        console.log(
          'Exemplo: tsx scripts/backup/selective-backup.ts restore ./backups/backup-xxx/backup.json user work'
        );
        process.exit(1);
      }

      await restoreSelectiveBackup(backupPath, {
        collections:
          restoreCollections.length > 0 ? restoreCollections : undefined,
        skipExisting,
        dryRun,
      });
      break;

    case 'list':
      const availableCollections = await listAvailableCollections();

      console.log('\n📋 Collections disponíveis:');
      console.log('='.repeat(50));

      for (const [name, count] of Object.entries(availableCollections)) {
        const deps = COLLECTION_DEPENDENCIES[name] || [];
        console.log(`📦 ${name}: ${count.toLocaleString('pt-BR')} registros`);
        if (deps.length > 0) {
          console.log(`   🔗 Dependências: ${deps.join(', ')}`);
        }
        console.log('');
      }
      break;

    default:
      console.log('🎯 Backup Seletivo de Collections');
      console.log('');
      console.log('Comandos disponíveis:');
      console.log(
        '  backup <collections...>  - Criar backup de collections específicas'
      );
      console.log('  restore <backup-path>    - Restaurar backup seletivo');
      console.log(
        '  list                     - Listar collections disponíveis'
      );
      console.log('');
      console.log('Opções:');
      console.log(
        '  --with-dependencies      - Incluir dependências automaticamente'
      );
      console.log('  --output=<dir>          - Diretório de saída customizado');
      console.log(
        '  --skip-existing         - Pular collections que já têm dados'
      );
      console.log(
        '  --dry-run               - Simular restauração sem alterações'
      );
      console.log('');
      console.log('Exemplos:');
      console.log(
        '  tsx scripts/backup/selective-backup.ts backup user work composer --with-dependencies'
      );
      console.log(
        '  tsx scripts/backup/selective-backup.ts restore ./backups/backup-xxx/backup.json user work'
      );
      console.log('  tsx scripts/backup/selective-backup.ts list');
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error('💥 Erro crítico:', error);
    process.exit(1);
  });
}
