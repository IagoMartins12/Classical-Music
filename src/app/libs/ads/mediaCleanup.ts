// app/libs/ads/mediaCleanup.ts - Utilitário para limpeza de mídia órfã
import fs from 'fs/promises';
import path from 'path';
import prisma from '@/app/libs/prismadb';

/**
 * Encontra pastas de mídia órfãs (sem anúncio correspondente no banco)
 */
export async function findOrphanedMediaDirectories(): Promise<string[]> {
  try {
    const uploadsDir = path.join(process.cwd(), 'public/uploads/ads');

    // Verificar se diretório existe
    try {
      await fs.access(uploadsDir);
    } catch {
      console.log('📁 Diretório de uploads não existe');
      return [];
    }

    // Listar todos os diretórios de ads
    const items = await fs.readdir(uploadsDir, { withFileTypes: true });
    const adDirectories = items
      .filter((item) => item.isDirectory())
      .map((item) => item.name);

    if (adDirectories.length === 0) {
      console.log('📁 Nenhum diretório de ad encontrado');
      return [];
    }

    console.log(`📁 Encontrados ${adDirectories.length} diretórios de ads`);

    // Buscar todos os ads no banco
    const adsInDatabase = await prisma.advertisement.findMany({
      select: {
        id: true,
        title: true,
      },
    });

    console.log(`🗄️ Encontrados ${adsInDatabase.length} ads no banco de dados`);

    // Gerar nomes de pastas esperados para cada ad
    const expectedDirectories = new Set<string>();
    for (const ad of adsInDatabase) {
      const slug = createAdSlug(ad.title, ad.id);
      expectedDirectories.add(slug);
    }

    // Encontrar pastas órfãs
    const orphanedDirectories = adDirectories.filter(
      (dir) => !expectedDirectories.has(dir)
    );

    console.log(`🗑️ Encontradas ${orphanedDirectories.length} pastas órfãs`);

    return orphanedDirectories;
  } catch (error) {
    console.error('❌ Erro ao encontrar pastas órfãs:', error);
    return [];
  }
}

/**
 * Remove pastas de mídia órfãs
 */
export async function removeOrphanedMediaDirectories(
  directories: string[] = [],
  dryRun: boolean = true
): Promise<{
  removed: string[];
  failed: string[];
  totalSize: number;
}> {
  const result = {
    removed: [] as string[],
    failed: [] as string[],
    totalSize: 0,
  };

  if (directories.length === 0) {
    directories = await findOrphanedMediaDirectories();
  }

  if (directories.length === 0) {
    console.log('✅ Nenhuma pasta órfã para remover');
    return result;
  }

  console.log(
    `🗑️ ${dryRun ? 'Simulando' : 'Removendo'} ${
      directories.length
    } pastas órfãs`
  );

  const uploadsDir = path.join(process.cwd(), 'public/uploads/ads');

  for (const dirName of directories) {
    try {
      const dirPath = path.join(uploadsDir, dirName);

      // Calcular tamanho da pasta
      const size = await calculateDirectorySize(dirPath);
      result.totalSize += size;

      if (dryRun) {
        console.log(
          `📁 [DRY RUN] Removeria: ${dirName} (${formatFileSize(size)})`
        );
        result.removed.push(dirName);
      } else {
        // Remover pasta
        await fs.rm(dirPath, { recursive: true, force: true });
        console.log(`🗑️ Removida: ${dirName} (${formatFileSize(size)})`);
        result.removed.push(dirName);
      }
    } catch (error) {
      console.error(`❌ Erro ao remover ${dirName}:`, error);
      result.failed.push(dirName);
    }
  }

  return result;
}

/**
 * Calcula o tamanho total de um diretório
 */
async function calculateDirectorySize(dirPath: string): Promise<number> {
  try {
    let totalSize = 0;
    const items = await fs.readdir(dirPath, { withFileTypes: true });

    for (const item of items) {
      const itemPath = path.join(dirPath, item.name);

      if (item.isDirectory()) {
        totalSize += await calculateDirectorySize(itemPath);
      } else {
        const stats = await fs.stat(itemPath);
        totalSize += stats.size;
      }
    }

    return totalSize;
  } catch (error) {
    console.error(`❌ Erro ao calcular tamanho de ${dirPath}:`, error);
    return 0;
  }
}

/**
 * Cria slug a partir do título + ID (mesma função do serverMediaProcessor)
 */
function createAdSlug(title: string, id: string): string {
  const slug = title
    .toLowerCase()
    .normalize('NFD') // Remove acentos
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
    .replace(/\s+/g, '-') // Substitui espaços por hífens
    .replace(/-+/g, '-') // Remove hífens duplos
    .replace(/^-|-$/g, ''); // Remove hífens do início/fim

  return `${slug}-${id}`.substring(0, 100); // Limita a 100 caracteres
}

/**
 * Formata tamanho de arquivo
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Verifica integridade das pastas de mídia
 */
export async function checkMediaIntegrity(): Promise<{
  adsWithMissingMedia: Array<{
    id: string;
    title: string;
    expectedDirectory: string;
    missingFiles: string[];
  }>;
  adsWithValidMedia: number;
  totalChecked: number;
}> {
  try {
    console.log('🔍 Verificando integridade da mídia...');

    const adsWithMedia = await prisma.advertisement.findMany({
      where: {
        OR: [
          { imageUrl: { not: null } },
          { videoUrl: { not: null } },
          { imageVersions: { not: null } },
          { videoVersions: { not: null } },
        ],
      },
      select: {
        id: true,
        title: true,
        imageUrl: true,
        videoUrl: true,
        imageVersions: true,
        videoVersions: true,
      },
    });

    console.log(`📊 Verificando ${adsWithMedia.length} ads com mídia`);

    const adsWithMissingMedia = [];
    let adsWithValidMedia = 0;

    for (const ad of adsWithMedia) {
      const expectedDirectory = createAdSlug(ad.title, ad.id);
      const dirPath = path.join(
        process.cwd(),
        'public/uploads/ads',
        expectedDirectory
      );
      const missingFiles = [];

      // Verificar se diretório existe
      try {
        await fs.access(dirPath);
      } catch {
        adsWithMissingMedia.push({
          id: ad.id,
          title: ad.title,
          expectedDirectory,
          missingFiles: ['directory_missing'],
        });
        continue;
      }

      // Verificar arquivos específicos
      const filesToCheck = [];

      // Adicionar URLs de imagem
      if (ad.imageUrl) filesToCheck.push(ad.imageUrl);
      if (ad.imageVersions && typeof ad.imageVersions === 'object') {
        Object.values(ad.imageVersions).forEach((url) => {
          if (url && typeof url === 'string') filesToCheck.push(url);
        });
      }

      // Adicionar URLs de vídeo
      if (ad.videoUrl) filesToCheck.push(ad.videoUrl);
      if (ad.videoVersions && typeof ad.videoVersions === 'object') {
        Object.values(ad.videoVersions).forEach((url) => {
          if (url && typeof url === 'string') filesToCheck.push(url);
        });
      }

      // Verificar se arquivos existem
      for (const fileUrl of filesToCheck) {
        try {
          const filePath = path.join(process.cwd(), 'public', fileUrl);
          await fs.access(filePath);
        } catch {
          missingFiles.push(fileUrl);
        }
      }

      if (missingFiles.length > 0) {
        adsWithMissingMedia.push({
          id: ad.id,
          title: ad.title,
          expectedDirectory,
          missingFiles,
        });
      } else {
        adsWithValidMedia++;
      }
    }

    console.log(`✅ ${adsWithValidMedia} ads com mídia válida`);
    console.log(`❌ ${adsWithMissingMedia.length} ads com mídia faltando`);

    return {
      adsWithMissingMedia,
      adsWithValidMedia,
      totalChecked: adsWithMedia.length,
    };
  } catch (error) {
    console.error('❌ Erro ao verificar integridade:', error);
    return {
      adsWithMissingMedia: [],
      adsWithValidMedia: 0,
      totalChecked: 0,
    };
  }
}

/**
 * Gera relatório completo de mídia
 */
export async function generateMediaReport(): Promise<{
  orphanedDirectories: string[];
  integrityCheck: any;
  totalOrphanedSize: number;
  recommendations: string[];
}> {
  console.log('📊 Gerando relatório de mídia...');

  const orphanedDirectories = await findOrphanedMediaDirectories();
  const integrityCheck = await checkMediaIntegrity();

  // Calcular tamanho das pastas órfãs
  let totalOrphanedSize = 0;
  const uploadsDir = path.join(process.cwd(), 'public/uploads/ads');

  for (const dirName of orphanedDirectories) {
    try {
      const dirPath = path.join(uploadsDir, dirName);
      const size = await calculateDirectorySize(dirPath);
      totalOrphanedSize += size;
    } catch (error) {
      console.warn(`⚠️ Erro ao calcular tamanho de ${dirName}:`, error);
    }
  }

  // Gerar recomendações
  const recommendations = [];

  if (orphanedDirectories.length > 0) {
    recommendations.push(
      `🗑️ Remover ${
        orphanedDirectories.length
      } pasta(s) órfã(s) para liberar ${formatFileSize(totalOrphanedSize)}`
    );
  }

  if (integrityCheck.adsWithMissingMedia.length > 0) {
    recommendations.push(
      `🔧 Corrigir ${integrityCheck.adsWithMissingMedia.length} ad(s) com mídia faltando`
    );
  }

  if (recommendations.length === 0) {
    recommendations.push('✅ Mídia está integra, nenhuma ação necessária');
  }

  console.log('📊 Relatório de mídia gerado');

  return {
    orphanedDirectories,
    integrityCheck,
    totalOrphanedSize,
    recommendations,
  };
}
