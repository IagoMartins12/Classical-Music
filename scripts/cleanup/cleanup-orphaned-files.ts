// scripts/cleanup-orphaned-files.ts - SCRIPT OPCIONAL PARA LIMPEZA
// Execute com: npx tsx scripts/cleanup-orphaned-files.ts

import prisma from '@/app/libs/prismadb';
import { readdir, stat, unlink } from 'fs/promises';
import path from 'path';

interface OrphanedFile {
  path: string;
  url: string;
  size: number;
  type: 'score' | 'image';
  lastModified: Date;
}

async function findOrphanedFiles(): Promise<OrphanedFile[]> {
  console.log('🔍 Procurando arquivos órfãos...');

  const orphanedFiles: OrphanedFile[] = [];
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');

  try {
    // 1. Buscar todas as URLs de arquivos no banco
    const dbFiles = await prisma.workScore.findMany({
      select: {
        downloadUrl: true,
        thumbnailUrl: true,
      },
    });

    // Criar Set com todas as URLs usadas
    const usedUrls = new Set<string>();

    dbFiles.forEach((score) => {
      if (score.downloadUrl) usedUrls.add(score.downloadUrl);
      if (score.thumbnailUrl) usedUrls.add(score.thumbnailUrl);
    });

    console.log(
      `📊 Encontrados ${usedUrls.size} arquivos referenciados no banco`
    );

    // 2. Verificar arquivos na pasta de uploads
    const types = ['score', 'image'];

    for (const type of types) {
      const typeDir = path.join(uploadsDir, type);

      try {
        await scanDirectory(typeDir, type, usedUrls, orphanedFiles);
      } catch (error) {
        console.warn(`⚠️ Pasta não encontrada: ${typeDir}`);
      }
    }

    return orphanedFiles;
  } catch (error) {
    console.error('❌ Erro ao procurar arquivos órfãos:', error);
    return [];
  }
}

async function scanDirectory(
  dirPath: string,
  type: 'score' | 'image',
  usedUrls: Set<string>,
  orphanedFiles: OrphanedFile[]
): Promise<void> {
  const items = await readdir(dirPath, { withFileTypes: true });

  for (const item of items) {
    const fullPath = path.join(dirPath, item.name);

    if (item.isDirectory()) {
      // Recursivamente escanear subdiretórios
      await scanDirectory(fullPath, type, usedUrls, orphanedFiles);
    } else if (item.isFile()) {
      // Construir URL que seria usada pelo banco
      const relativePath = path.relative(
        path.join(process.cwd(), 'public'),
        fullPath
      );
      const url = '/' + relativePath.replace(/\\/g, '/'); // Normalizar separadores

      // Verificar se está sendo usado
      if (!usedUrls.has(url)) {
        const stats = await stat(fullPath);

        orphanedFiles.push({
          path: fullPath,
          url,
          size: stats.size,
          type,
          lastModified: stats.mtime,
        });
      }
    }
  }
}

function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

async function cleanupOrphanedFiles(
  files: OrphanedFile[],
  dryRun: boolean = true
): Promise<void> {
  if (files.length === 0) {
    console.log('✅ Nenhum arquivo órfão encontrado!');
    return;
  }

  console.log(`\n📋 Encontrados ${files.length} arquivos órfãos:`);

  let totalSize = 0;

  // Listar arquivos
  files.forEach((file, index) => {
    totalSize += file.size;
    console.log(
      `${index + 1}. ${file.url} (${formatFileSize(
        file.size
      )}) - ${file.lastModified.toLocaleDateString()}`
    );
  });

  console.log(`\n💾 Espaço total ocupado: ${formatFileSize(totalSize)}`);

  if (dryRun) {
    console.log('\n🔍 MODO DRY-RUN: Nenhum arquivo foi deletado.');
    console.log('Para deletar realmente, execute com --delete');
    return;
  }

  // Deletar arquivos
  console.log('\n🗑️ Deletando arquivos órfãos...');

  let deletedCount = 0;
  let deletedSize = 0;

  for (const file of files) {
    try {
      await unlink(file.path);
      deletedCount++;
      deletedSize += file.size;
      console.log(`✅ Deletado: ${file.url}`);
    } catch (error) {
      console.error(`❌ Erro ao deletar ${file.url}:`, error);
    }
  }

  console.log(`\n✅ Limpeza concluída:`);
  console.log(`   - ${deletedCount}/${files.length} arquivos deletados`);
  console.log(`   - ${formatFileSize(deletedSize)} liberados`);
}

// Executar script
async function main() {
  const args = process.argv.slice(2);
  const deleteMode = args.includes('--delete');

  console.log('🧹 Script de Limpeza de Arquivos Órfãos');
  console.log('=====================================\n');

  if (deleteMode) {
    console.log('⚠️  MODO DELEÇÃO ATIVADO ⚠️');
  } else {
    console.log('🔍 Modo dry-run (apenas listar)');
  }

  try {
    const orphanedFiles = await findOrphanedFiles();
    await cleanupOrphanedFiles(orphanedFiles, !deleteMode);
  } catch (error) {
    console.error('❌ Erro durante execução:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}

export { findOrphanedFiles, cleanupOrphanedFiles };
