// scripts/backup/selective-backup.ts - ATUALIZADO
import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

// Lista de todos os models do seu schema na ordem correta para backup seletivo
const COLLECTION_DEPENDENCIES: { [key: string]: string[] } = {
  // Tabelas independentes primeiro
  user: [],
  epoch: [],
  role: [],
  instrument: [],
  workGenre: [],

  // Tabelas com dependências
  composer: ['epoch', 'role', 'user'],
  work: ['composer', 'epoch', 'instrument', 'user'],
  workScore: ['work'],
  userInstrument: ['user', 'instrument'],
  annotation: ['user', 'work'],
  pdfAnnotation: ['user', 'work'],
  workAnnotation: ['user', 'work'],
  favoriteWork: ['user', 'work'],
  favoriteComposer: ['user', 'composer'],
  favoriteScore: ['user', 'work'],
  studySession: ['user', 'work'],
  wantToLearn: ['user', 'work'],
  learned: ['user', 'work'],
  userSelectedScore: ['user', 'work'],
  learningGoal: ['user'],
  scoreBookmark: ['user', 'work'],
  annotationHelpfulVote: ['user', 'workAnnotation'],
  scoreFavoriteStats: ['work'],
  uploadHistory: ['user'],
  uploadModeration: ['user'],
  generatedReport: ['user'],
  advertisement: ['user', 'instrument'],
  adStats: ['advertisement', 'user'],
  newsletterSubscriber: ['user'],
  newsletterTemplate: [],
  newsletterCampaign: ['newsletterTemplate'],
  newsletterCampaignSend: ['newsletterCampaign', 'newsletterSubscriber'],
  newsletterEmailEvent: ['newsletterSubscriber', 'newsletterCampaign'],
  newsletterSettings: [],
  testEmailList: [],
  templateFragment: [],
  userToken: ['user'],
  account: ['user'],
  session: ['user'],
};

interface SelectiveBackupOptions {
  collections: string[];
  includeDependencies: boolean;
  outputDir?: string;
  name?: string;
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
export function resolveDependencies(collections: string[]): string[] {
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

// Função para criar diretório de backup seletivo
async function createSelectiveBackupDirectory(name?: string): Promise<string> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupName = name
    ? `selective-backup-${name.replace(/[^a-zA-Z0-9]/g, '-')}-${timestamp}`
    : `selective-backup-${timestamp}`;

  const backupDir = path.join(process.cwd(), 'backups', backupName);
  await fs.mkdir(backupDir, { recursive: true });
  return backupDir;
}

// Executar backup seletivo
export async function performSelectiveBackup(
  options: SelectiveBackupOptions
): Promise<BackupResult> {
  const startTime = Date.now();
  let backupDir = '';

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
    backupDir =
      options.outputDir || (await createSelectiveBackupDirectory(options.name));

    // Criar metadados iniciais
    const initialMetadata = {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      type: 'selective',
      status: 'in_progress',
      name:
        options.name ||
        `Backup Seletivo ${new Date().toLocaleDateString('pt-BR')}`,
      selectedCollections: options.collections,
      processedCollections: collectionsToBackup,
      includedDependencies: options.includeDependencies,
      totalRecords: 0,
      collections: [],
      backupSize: '0 MB',
      duration: '0s',
      backupLocation: backupDir,
      createdAt: new Date().toISOString(),
    };

    const metadataPath = path.join(backupDir, 'metadata.json');
    await fs.writeFile(metadataPath, JSON.stringify(initialMetadata, null, 2));

    const backupData: any = {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      type: 'selective',
      name:
        options.name ||
        `Backup Seletivo ${new Date().toLocaleDateString('pt-BR')}`,
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
    console.log('✅ Conectado ao banco de dados');

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
        const CHUNK_SIZE = 500; // Menor para backup seletivo
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

            // Liberar memória explicitamente
            if (global.gc && (skip + take) % (CHUNK_SIZE * 5) === 0) {
              global.gc();
            }
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

        // Salvar collection individual para facilitar restauração
        const collectionsDir = path.join(backupDir, 'collections');
        await fs.mkdir(collectionsDir, { recursive: true });

        const collectionPath = path.join(
          collectionsDir,
          `${collectionName}.json`
        );
        await fs.writeFile(collectionPath, JSON.stringify(data, null, 2));

        // Limpar dados da memória principal para economizar RAM
        backupData.data[collectionName] = [
          `${data.length} registros salvos em arquivo separado`,
        ];
      } catch (error) {
        console.error(`   ❌ Erro em ${collectionName}:`, error);
        backupData.data[collectionName] = [];

        // Salvar erro para debugging
        const errorData = {
          collection: collectionName,
          error: error instanceof Error ? error.message : String(error),
          timestamp: new Date().toISOString(),
        };

        const errorPath = path.join(backupDir, `${collectionName}_error.json`);
        await fs.writeFile(errorPath, JSON.stringify(errorData, null, 2));
      }
    }

    // Finalizar backup
    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);

    backupData.metadata.totalRecords = totalRecords;
    backupData.metadata.duration = `${duration}s`;
    backupData.metadata.status = 'completed';

    // Calcular tamanho aproximado
    const backupSizeBytes = await getDirSize(backupDir);
    backupData.metadata.backupSize = formatBytes(backupSizeBytes);

    // Salvar backup principal (leve, apenas referências)
    const mainBackupPath = path.join(backupDir, 'backup.json');
    await fs.writeFile(mainBackupPath, JSON.stringify(backupData, null, 2));

    // Atualizar metadados finais
    const finalMetadata = {
      ...initialMetadata,
      status: 'completed',
      totalRecords: totalRecords,
      collections: backupData.metadata.collections,
      backupSize: backupData.metadata.backupSize,
      duration: backupData.metadata.duration,
      completedAt: new Date().toISOString(),
      collectionsCount: backupData.metadata.collections.length,
      hasMainBackup: true,
      hasIndividualCollections: true,
    };

    await fs.writeFile(metadataPath, JSON.stringify(finalMetadata, null, 2));

    console.log('\n✅ Backup seletivo concluído!');
    console.log('='.repeat(60));
    console.log(`📁 Localização: ${backupDir}`);
    console.log(`📋 Collections selecionadas: ${options.collections.length}`);
    console.log(`📦 Collections processadas: ${collectionsToBackup.length}`);
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

    console.log('\n📂 Arquivos criados:');
    console.log(`   • metadata.json - Informações completas do backup`);
    console.log(`   • backup.json - Índice principal (leve)`);
    console.log(`   • collections/ - Dados das collections individualmente`);

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

    // Salvar erro no diretório se conseguir
    try {
      if (backupDir) {
        const errorPath = path.join(backupDir, 'error.json');
        const errorData = {
          error: error instanceof Error ? error.message : String(error),
          timestamp: new Date().toISOString(),
          selectedCollections: options.collections,
          includeDependencies: options.includeDependencies,
        };
        await fs.writeFile(errorPath, JSON.stringify(errorData, null, 2));
      }
    } catch (saveError) {
      console.error('Erro ao salvar detalhes do erro:', saveError);
    }

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

    // Ler backup principal
    const backupContent = await fs.readFile(backupPath, 'utf8');
    backupData = JSON.parse(backupContent);

    console.log(
      `📅 Backup de: ${new Date(backupData.timestamp).toLocaleString('pt-BR')}`
    );
    console.log(`🎯 Tipo: ${backupData.type || 'completo'}`);
    console.log(`📋 Nome: ${backupData.name || 'Sem nome'}`);

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
      Object.keys(backupData.data || {});

    console.log(
      `🔄 Collections a restaurar: ${collectionsToRestore.join(', ')}`
    );

    if (options.dryRun) {
      console.log('\n🧪 Modo de teste - nenhuma alteração será feita');

      const collectionsDir = path.join(backupDir, 'collections');

      for (const collection of collectionsToRestore) {
        try {
          const collectionPath = path.join(
            collectionsDir,
            `${collection}.json`
          );
          const data = JSON.parse(await fs.readFile(collectionPath, 'utf8'));
          console.log(
            `   • ${collection}: ${data.length} registros para restaurar`
          );
        } catch {
          console.log(`   • ${collection}: arquivo não encontrado`);
        }
      }
      return;
    }

    // Conectar ao banco
    await prisma.$connect();

    let totalRestored = 0;
    const collectionsDir = path.join(backupDir, 'collections');

    // Restaurar cada collection
    for (const collectionName of collectionsToRestore) {
      // Tentar ler de arquivo individual primeiro
      const collectionPath = path.join(
        collectionsDir,
        `${collectionName}.json`
      );
      let data: any[] = [];

      try {
        data = JSON.parse(await fs.readFile(collectionPath, 'utf8'));
      } catch {
        // Fallback para dados no backup principal
        data = backupData.data?.[collectionName] || [];
      }

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
        // Processar em lotes menores para backup seletivo
        const batchSize = 50;
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

// Utilitário para calcular tamanho de diretório
async function getDirSize(dirPath: string): Promise<number> {
  let size = 0;
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const entryPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        size += await getDirSize(entryPath);
      } else {
        const stats = await fs.stat(entryPath);
        size += stats.size;
      }
    }
  } catch (error) {
    // Ignorar erros
  }
  return size;
}

// Utilitário para formatar bytes
function formatBytes(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
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

// CLI Interface
async function main() {
  const command = process.argv[2];
  const args = process.argv.slice(3);

  switch (command) {
    case 'backup':
      const collections = args.filter((arg) => !arg.startsWith('--'));
      const includeDependencies = args.includes('--with-dependencies');
      const name = args.find((arg) => arg.startsWith('--name='))?.split('=')[1];
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
        name,
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
          'Exemplo: tsx scripts/backup/selective-backup.ts restore ./backups/selective-backup-xxx/backup.json user work'
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
      console.log('  --name=<nome>           - Nome personalizado do backup');
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
        '  tsx scripts/backup/selective-backup.ts backup user work composer --with-dependencies --name="Backup Usuarios e Obras"'
      );
      console.log(
        '  tsx scripts/backup/selective-backup.ts restore ./backups/selective-backup-xxx/backup.json user work'
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
