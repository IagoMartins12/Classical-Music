// scripts/cleanupJob.ts - JOB DE LIMPEZA AUTOMÁTICA
import {
  cleanupOrphanedTemporaryFiles,
  logCleanupResult,
} from '@/app/utils/fileCleanupUtils';
import { promises as fs } from 'fs';
import path from 'path';

interface CleanupJobConfig {
  maxAgeHours: number;
  dryRun: boolean;
  verbose: boolean;
  cleanupTemp: boolean;
  cleanupEmptyDirs: boolean;
  logResults: boolean;
}

interface CleanupJobResult {
  timestamp: string;
  duration: number;
  totalFilesRemoved: number;
  totalDirectoriesRemoved: number;
  totalSpaceFreed: number;
  errors: string[];
  operations: {
    orphanedTempFiles: {
      executed: boolean;
      filesRemoved: number;
      directoriesRemoved: number;
      spaceFreed: number;
      errors: string[];
    };
    emptyDirectories: {
      executed: boolean;
      directoriesRemoved: number;
      errors: string[];
    };
  };
}

/**
 * 🆕 Limpa arquivos temporários órfãos - IMPLEMENTAÇÃO LOCAL
 */
async function cleanupTemporaryFiles(maxAgeHours: number): Promise<{
  removedFiles: string[];
  removedDirectories: string[];
  errors: string[];
  totalSize: number;
}> {
  console.log(`🧹 Limpando arquivos temporários órfãos (>${maxAgeHours}h)...`);

  const result = {
    removedFiles: [] as string[],
    removedDirectories: [] as string[],
    errors: [] as string[],
    totalSize: 0,
  };

  try {
    const tempDir = path.join(
      process.cwd(),
      'public',
      'uploads',
      'scores',
      'temp'
    );

    // Verificar se pasta temp existe
    const tempExists = await fs
      .access(tempDir)
      .then(() => true)
      .catch(() => false);
    if (!tempExists) {
      console.log('📁 Pasta de arquivos temporários não existe');
      return result;
    }

    console.log(`📁 Analisando pasta temporária: ${tempDir}`);

    // Listar todas as pastas de usuários
    const userDirs = await fs.readdir(tempDir, { withFileTypes: true });

    console.log(`👥 Encontradas ${userDirs.length} pastas de usuários`);

    for (const userDir of userDirs) {
      if (!userDir.isDirectory()) continue;

      const userDirPath = path.join(tempDir, userDir.name);
      console.log(`📂 Verificando pasta do usuário: ${userDir.name}`);

      try {
        // Listar arquivos na pasta do usuário
        const files = await fs.readdir(userDirPath, { withFileTypes: true });
        console.log(`   📄 ${files.length} arquivos encontrados`);

        let removedFromThisUser = 0;

        for (const file of files) {
          if (file.isDirectory()) continue;

          const filePath = path.join(userDirPath, file.name);

          try {
            // Verificar idade do arquivo
            const stats = await fs.stat(filePath);
            const ageHours =
              (Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60);

            console.log(`   📄 ${file.name}: ${ageHours.toFixed(1)}h de idade`);

            if (ageHours > maxAgeHours) {
              // Arquivo antigo, remover
              result.totalSize += stats.size;
              await fs.unlink(filePath);
              result.removedFiles.push(filePath);
              removedFromThisUser++;
              console.log(
                `   🗑️ Removido: ${file.name} (${ageHours.toFixed(1)}h)`
              );
            }
          } catch (fileError) {
            const errorMsg = `Erro ao processar arquivo ${filePath}: ${fileError}`;
            result.errors.push(errorMsg);
            console.error(`   ❌ ${errorMsg}`);
          }
        }

        // Tentar remover pasta do usuário se estiver vazia
        try {
          const remainingFiles = await fs.readdir(userDirPath);
          if (remainingFiles.length === 0) {
            await fs.rmdir(userDirPath);
            result.removedDirectories.push(userDirPath);
            console.log(`   📂 Pasta vazia removida: ${userDir.name}`);
          } else {
            console.log(
              `   📁 Pasta mantida: ${remainingFiles.length} arquivos restantes`
            );
          }
        } catch (dirError) {
          console.log(`   📁 Não foi possível remover pasta: ${userDir.name}`);
        }

        if (removedFromThisUser > 0) {
          console.log(
            `   ✅ ${removedFromThisUser} arquivos órfãos removidos do usuário ${userDir.name}`
          );
        }
      } catch (userDirError) {
        const errorMsg = `Erro ao processar pasta do usuário ${userDirPath}: ${userDirError}`;
        result.errors.push(errorMsg);
        console.error(`❌ ${errorMsg}`);
      }
    }
  } catch (error) {
    const errorMsg = `Erro ao limpar arquivos temporários órfãos: ${error}`;
    result.errors.push(errorMsg);
    console.error(`❌ ${errorMsg}`);
  }

  return result;
}

/**
 * 🆕 Job principal de limpeza
 */
export async function runCleanupJob(
  config: Partial<CleanupJobConfig> = {}
): Promise<CleanupJobResult> {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();

  const finalConfig: CleanupJobConfig = {
    maxAgeHours: 24, // 24 horas por padrão
    dryRun: false,
    verbose: true,
    cleanupTemp: true,
    cleanupEmptyDirs: true,
    logResults: true,
    ...config,
  };

  console.log('🧹 Iniciando job de limpeza automática...');
  console.log('⚙️ Configuração:', finalConfig);

  if (finalConfig.dryRun) {
    console.log('🔍 MODO DRY-RUN: Nenhum arquivo será removido');
  }

  const result: CleanupJobResult = {
    timestamp,
    duration: 0,
    totalFilesRemoved: 0,
    totalDirectoriesRemoved: 0,
    totalSpaceFreed: 0,
    errors: [],
    operations: {
      orphanedTempFiles: {
        executed: false,
        filesRemoved: 0,
        directoriesRemoved: 0,
        spaceFreed: 0,
        errors: [],
      },
      emptyDirectories: {
        executed: false,
        directoriesRemoved: 0,
        errors: [],
      },
    },
  };

  try {
    // 🆕 1. Limpar arquivos temporários órfãos
    if (finalConfig.cleanupTemp) {
      console.log(
        `\n📁 1. Limpando arquivos temporários órfãos (>${finalConfig.maxAgeHours}h)...`
      );

      try {
        if (!finalConfig.dryRun) {
          const tempResult = await cleanupOrphanedTemporaryFiles(
            finalConfig.maxAgeHours
          );

          result.operations.orphanedTempFiles = {
            executed: true,
            filesRemoved: tempResult.removedFiles.length,
            directoriesRemoved: tempResult.removedDirectories.length,
            spaceFreed: tempResult.totalSize,
            errors: tempResult.errors,
          };

          if (finalConfig.verbose) {
            logCleanupResult(tempResult, 'Arquivos Temporários Órfãos');
          }
        } else {
          // Simular limpeza (dry-run)
          const tempResult = await simulateOrphanedFilesCleanup(
            finalConfig.maxAgeHours
          );
          result.operations.orphanedTempFiles = {
            executed: false,
            filesRemoved: tempResult.wouldRemoveFiles,
            directoriesRemoved: tempResult.wouldRemoveDirs,
            spaceFreed: tempResult.wouldFreeSpace,
            errors: [],
          };

          console.log(
            `🔍 DRY-RUN: Removeria ${tempResult.wouldRemoveFiles} arquivos (${(
              tempResult.wouldFreeSpace /
              1024 /
              1024
            ).toFixed(2)}MB)`
          );
        }
      } catch (tempError) {
        const errorMsg = `Erro na limpeza de arquivos temporários: ${tempError}`;
        result.operations.orphanedTempFiles.errors.push(errorMsg);
        result.errors.push(errorMsg);
        console.error(`❌ ${errorMsg}`);
      }
    }

    // 🆕 2. Limpar diretórios vazios
    if (finalConfig.cleanupEmptyDirs) {
      console.log(`\n📂 2. Limpando diretórios vazios...`);

      try {
        if (!finalConfig.dryRun) {
          const emptyDirResult = await cleanupEmptyDirectories();

          result.operations.emptyDirectories = {
            executed: true,
            directoriesRemoved: emptyDirResult.removed.length,
            errors: emptyDirResult.errors,
          };

          if (finalConfig.verbose && emptyDirResult.removed.length > 0) {
            console.log(
              `✅ Diretórios vazios removidos: ${emptyDirResult.removed.length}`
            );
            emptyDirResult.removed.forEach((dir) =>
              console.log(`   📂 ${dir.replace(process.cwd(), '.')}`)
            );
          }
        } else {
          // Simular limpeza de diretórios vazios
          const emptyDirResult = await simulateEmptyDirectoriesCleanup();
          result.operations.emptyDirectories = {
            executed: false,
            directoriesRemoved: emptyDirResult.wouldRemove,
            errors: [],
          };

          console.log(
            `🔍 DRY-RUN: Removeria ${emptyDirResult.wouldRemove} diretórios vazios`
          );
        }
      } catch (emptyDirError) {
        const errorMsg = `Erro na limpeza de diretórios vazios: ${emptyDirError}`;
        result.operations.emptyDirectories.errors.push(errorMsg);
        result.errors.push(errorMsg);
        console.error(`❌ ${errorMsg}`);
      }
    }

    // 🆕 Calcular totais
    result.totalFilesRemoved = result.operations.orphanedTempFiles.filesRemoved;
    result.totalDirectoriesRemoved =
      result.operations.orphanedTempFiles.directoriesRemoved +
      result.operations.emptyDirectories.directoriesRemoved;
    result.totalSpaceFreed = result.operations.orphanedTempFiles.spaceFreed;
  } catch (error) {
    const errorMsg = `Erro geral no job de limpeza: ${error}`;
    result.errors.push(errorMsg);
    console.error(`❌ ${errorMsg}`);
  } finally {
    result.duration = Date.now() - startTime;
  }

  // 🆕 Relatório final
  console.log('\n📊 Relatório final do job de limpeza:');
  console.log(`   ⏱️ Duração: ${(result.duration / 1000).toFixed(2)}s`);
  console.log(`   📄 Arquivos removidos: ${result.totalFilesRemoved}`);
  console.log(`   📂 Diretórios removidos: ${result.totalDirectoriesRemoved}`);
  console.log(
    `   💾 Espaço liberado: ${(result.totalSpaceFreed / 1024 / 1024).toFixed(
      2
    )}MB`
  );
  console.log(`   ⚠️ Erros: ${result.errors.length}`);

  if (result.errors.length > 0) {
    console.log('\n❌ Erros encontrados:');
    result.errors.forEach((error) => console.log(`   ${error}`));
  }

  // 🆕 Salvar log se solicitado
  if (finalConfig.logResults) {
    await saveCleanupLog(result);
  }

  console.log(
    `\n✅ Job de limpeza concluído ${finalConfig.dryRun ? '(DRY-RUN)' : ''}`
  );
  return result;
}

/**
 * 🆕 Simula limpeza de arquivos órfãos (para dry-run)
 */
async function simulateOrphanedFilesCleanup(maxAgeHours: number): Promise<{
  wouldRemoveFiles: number;
  wouldRemoveDirs: number;
  wouldFreeSpace: number;
}> {
  let wouldRemoveFiles = 0;
  let wouldRemoveDirs = 0;
  let wouldFreeSpace = 0;

  try {
    const tempDir = path.join(
      process.cwd(),
      'public',
      'uploads',
      'scores',
      'temp'
    );

    const tempExists = await fs
      .access(tempDir)
      .then(() => true)
      .catch(() => false);
    if (!tempExists)
      return { wouldRemoveFiles, wouldRemoveDirs, wouldFreeSpace };

    const userDirs = await fs.readdir(tempDir, { withFileTypes: true });

    for (const userDir of userDirs) {
      if (!userDir.isDirectory()) continue;

      const userDirPath = path.join(tempDir, userDir.name);
      const files = await fs.readdir(userDirPath, { withFileTypes: true });

      let userDirHasOldFiles = false;

      for (const file of files) {
        if (file.isDirectory()) continue;

        const filePath = path.join(userDirPath, file.name);
        const stats = await fs.stat(filePath);
        const ageHours =
          (Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60);

        if (ageHours > maxAgeHours) {
          wouldRemoveFiles++;
          wouldFreeSpace += stats.size;
          userDirHasOldFiles = true;
        }
      }

      // Se todos os arquivos da pasta seriam removidos, a pasta também seria
      if (userDirHasOldFiles && files.every((f) => f.isFile())) {
        wouldRemoveDirs++;
      }
    }
  } catch (error) {
    console.warn(`⚠️ Erro na simulação: ${error}`);
  }

  return { wouldRemoveFiles, wouldRemoveDirs, wouldFreeSpace };
}

/**
 * 🆕 Limpa diretórios vazios na estrutura de uploads
 */
async function cleanupEmptyDirectories(): Promise<{
  removed: string[];
  errors: string[];
}> {
  const result = { removed: [] as string[], errors: [] as string[] };

  try {
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    await cleanupEmptyDirsRecursive(uploadsDir, result);
  } catch (error) {
    result.errors.push(`Erro ao limpar diretórios vazios: ${error}`);
  }

  return result;
}

/**
 * 🆕 Função recursiva para limpar diretórios vazios
 */
async function cleanupEmptyDirsRecursive(
  dirPath: string,
  result: { removed: string[]; errors: string[] }
): Promise<boolean> {
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    if (entries.length === 0) {
      // Diretório vazio - não remover se for raiz importante
      const isImportantRoot = [
        'uploads',
        'scores',
        'temp',
        'final',
        'image',
        'composers',
        'users',
      ].some((importantDir) => dirPath.endsWith(importantDir));

      if (!isImportantRoot) {
        await fs.rmdir(dirPath);
        result.removed.push(dirPath);
        return true; // Diretório foi removido
      }
      return false;
    }

    // Verificar subdiretórios
    let hasRemainingEntries = false;

    for (const entry of entries) {
      const entryPath = path.join(dirPath, entry.name);

      if (entry.isDirectory()) {
        const wasRemoved = await cleanupEmptyDirsRecursive(entryPath, result);
        if (!wasRemoved) {
          hasRemainingEntries = true;
        }
      } else {
        hasRemainingEntries = true;
      }
    }

    // Se todos os subdiretórios foram removidos e não há arquivos
    if (!hasRemainingEntries) {
      const isImportantRoot = [
        'uploads',
        'scores',
        'temp',
        'final',
        'image',
        'composers',
        'users',
      ].some((importantDir) => dirPath.endsWith(importantDir));

      if (!isImportantRoot) {
        await fs.rmdir(dirPath);
        result.removed.push(dirPath);
        return true;
      }
    }

    return false;
  } catch (error) {
    result.errors.push(`Erro ao processar diretório ${dirPath}: ${error}`);
    return false;
  }
}

/**
 * 🆕 Simula limpeza de diretórios vazios
 */
async function simulateEmptyDirectoriesCleanup(): Promise<{
  wouldRemove: number;
}> {
  let wouldRemove = 0;

  const countEmptyDirs = async (dirPath: string): Promise<number> => {
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });

      if (entries.length === 0) {
        const isImportantRoot = [
          'uploads',
          'scores',
          'temp',
          'final',
          'image',
          'composers',
          'users',
        ].some((importantDir) => dirPath.endsWith(importantDir));

        return isImportantRoot ? 0 : 1;
      }

      let count = 0;
      let hasFiles = false;

      for (const entry of entries) {
        const entryPath = path.join(dirPath, entry.name);

        if (entry.isDirectory()) {
          count += await countEmptyDirs(entryPath);
        } else {
          hasFiles = true;
        }
      }

      // Se só tem diretórios vazios que seriam removidos
      if (!hasFiles && count === entries.length) {
        const isImportantRoot = [
          'uploads',
          'scores',
          'temp',
          'final',
          'image',
          'composers',
          'users',
        ].some((importantDir) => dirPath.endsWith(importantDir));

        return isImportantRoot ? count : count + 1;
      }

      return count;
    } catch (error) {
      return 0;
    }
  };

  try {
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    wouldRemove = await countEmptyDirs(uploadsDir);
  } catch (error) {
    console.warn(`⚠️ Erro na simulação de diretórios vazios: ${error}`);
  }

  return { wouldRemove };
}

/**
 * 🆕 Salva log do job de limpeza
 */
async function saveCleanupLog(result: CleanupJobResult): Promise<void> {
  try {
    const logsDir = path.join(process.cwd(), 'logs', 'cleanup');
    await fs.mkdir(logsDir, { recursive: true });

    const logFile = path.join(
      logsDir,
      `cleanup-${result.timestamp.replace(/[:.]/g, '-')}.json`
    );
    await fs.writeFile(logFile, JSON.stringify(result, null, 2));

    console.log(`📄 Log salvo: ${logFile.replace(process.cwd(), '.')}`);
  } catch (error) {
    console.warn(`⚠️ Erro ao salvar log: ${error}`);
  }
}

/**
 * 🆕 Função para executar via linha de comando
 */
async function main() {
  const args = process.argv.slice(2);

  const config: Partial<CleanupJobConfig> = {
    dryRun: args.includes('--dry-run'),
    verbose: !args.includes('--quiet'),
    maxAgeHours: parseInt(
      args.find((arg) => arg.startsWith('--max-age='))?.split('=')[1] || '24'
    ),
    cleanupTemp: !args.includes('--no-temp'),
    cleanupEmptyDirs: !args.includes('--no-empty-dirs'),
    logResults: !args.includes('--no-log'),
  };

  await runCleanupJob(config);
}

// Executar se chamado diretamente
if (require.main === module) {
  main().catch(console.error);
}
