// app/utils/fileCleanupUtils.ts
import { promises as fs } from 'fs';
import path from 'path';

interface CleanupResult {
  removedFiles: string[];
  removedDirectories: string[];
  errors: string[];
  totalSize: number;
}

/**
 * Remove um diretório completo e todos os seus arquivos
 */
export async function removeDirectory(dirPath: string): Promise<CleanupResult> {
  const result: CleanupResult = {
    removedFiles: [],
    removedDirectories: [],
    errors: [],
    totalSize: 0,
  };

  try {
    // Verificar se o diretório existe
    const exists = await fs
      .access(dirPath)
      .then(() => true)
      .catch(() => false);
    if (!exists) {
      console.log(`📁 Diretório não existe: ${dirPath}`);
      return result;
    }

    // Listar todos os arquivos no diretório
    const files = await fs.readdir(dirPath, { withFileTypes: true });

    for (const file of files) {
      const filePath = path.join(dirPath, file.name);

      try {
        if (file.isDirectory()) {
          // Recursivamente remover subdiretórios
          const subResult = await removeDirectory(filePath);
          result.removedFiles.push(...subResult.removedFiles);
          result.removedDirectories.push(...subResult.removedDirectories);
          result.errors.push(...subResult.errors);
          result.totalSize += subResult.totalSize;
        } else {
          // Obter tamanho do arquivo antes de remover
          const stats = await fs.stat(filePath);
          result.totalSize += stats.size;

          // Remover arquivo
          await fs.unlink(filePath);
          result.removedFiles.push(filePath);
          console.log(`🗑️ Arquivo removido: ${filePath}`);
        }
      } catch (error) {
        const errorMsg = `Erro ao remover ${filePath}: ${error}`;
        result.errors.push(errorMsg);
        console.error(`❌ ${errorMsg}`);
      }
    }

    // Remover o diretório vazio
    try {
      await fs.rmdir(dirPath);
      result.removedDirectories.push(dirPath);
      console.log(`📂 Diretório removido: ${dirPath}`);
    } catch (error) {
      const errorMsg = `Erro ao remover diretório ${dirPath}: ${error}`;
      result.errors.push(errorMsg);
      console.error(`❌ ${errorMsg}`);
    }
  } catch (error) {
    const errorMsg = `Erro ao acessar diretório ${dirPath}: ${error}`;
    result.errors.push(errorMsg);
    console.error(`❌ ${errorMsg}`);
  }

  return result;
}

/**
 * Remove arquivos específicos baseado em uma lista de URLs
 */
export async function removeFilesByUrls(
  urls: (string | null)[]
): Promise<CleanupResult> {
  const result: CleanupResult = {
    removedFiles: [],
    removedDirectories: [],
    errors: [],
    totalSize: 0,
  };

  const validUrls = urls.filter(
    (url): url is string =>
      url !== null && url !== undefined && url.trim() !== ''
  );

  for (const url of validUrls) {
    try {
      // Converter URL pública para caminho do sistema de arquivos
      const relativePath = url.startsWith('/') ? url.substring(1) : url;
      const filePath = path.join(process.cwd(), 'public', relativePath);

      // Verificar se o arquivo existe
      const exists = await fs
        .access(filePath)
        .then(() => true)
        .catch(() => false);
      if (!exists) {
        console.log(`📄 Arquivo não existe: ${filePath}`);
        continue;
      }

      // Obter tamanho do arquivo
      const stats = await fs.stat(filePath);
      result.totalSize += stats.size;

      // Remover arquivo
      await fs.unlink(filePath);
      result.removedFiles.push(filePath);
      console.log(`🗑️ Arquivo removido: ${filePath}`);
    } catch (error) {
      const errorMsg = `Erro ao remover arquivo ${url}: ${error}`;
      result.errors.push(errorMsg);
      console.error(`❌ ${errorMsg}`);
    }
  }

  return result;
}

/**
 * Remove todas as imagens de um compositor
 */
export async function cleanupComposerFiles(
  composerId: string
): Promise<CleanupResult> {
  console.log(`🧹 Limpando arquivos do compositor: ${composerId}`);

  const composerDir = path.join(
    process.cwd(),
    'public',
    'uploads',
    'composers',
    composerId
  );
  return await removeDirectory(composerDir);
}

/**
 * Remove todas as imagens de um usuário
 */
export async function cleanupUserFiles(userId: string): Promise<CleanupResult> {
  console.log(`🧹 Limpando arquivos do usuário: ${userId}`);

  const userDir = path.join(
    process.cwd(),
    'public',
    'uploads',
    'users',
    userId
  );
  return await removeDirectory(userDir);
}

/**
 * Remove arquivos específicos de uma score (PDF + thumbnail)
 */
export async function cleanupScoreFiles(
  downloadUrl: string | null,
  thumbnailUrl: string | null
): Promise<CleanupResult> {
  console.log(`🧹 Limpando arquivos da partitura...`);

  const urls = [downloadUrl, thumbnailUrl];
  return await removeFilesByUrls(urls);
}

/**
 * Extrai composerId de uma URL de imagem de compositor
 */
export function extractComposerIdFromUrl(url: string | null): string | null {
  if (!url) return null;

  // Exemplo: /uploads/composers/composer-123/image.jpg
  const match = url.match(/\/uploads\/composers\/([^\/]+)\//);
  return match ? match[1] : null;
}

/**
 * Extrai userId de uma URL de imagem de usuário
 */
export function extractUserIdFromUrl(url: string | null): string | null {
  if (!url) return null;

  // Exemplo: /uploads/users/user-123/profile.jpg
  const match = url.match(/\/uploads\/users\/([^\/]+)\//);
  return match ? match[1] : null;
}

/**
 * Log detalhado do resultado da limpeza
 */
export function logCleanupResult(result: CleanupResult, context: string) {
  console.log(`📊 Resultado da limpeza - ${context}:`);
  console.log(`   📄 Arquivos removidos: ${result.removedFiles.length}`);
  console.log(
    `   📂 Diretórios removidos: ${result.removedDirectories.length}`
  );
  console.log(
    `   💾 Espaço liberado: ${(result.totalSize / 1024 / 1024).toFixed(2)}MB`
  );

  if (result.errors.length > 0) {
    console.log(`   ⚠️ Erros: ${result.errors.length}`);
    result.errors.forEach((error) => console.log(`      ${error}`));
  }

  if (result.removedFiles.length > 0) {
    console.log(`   🗑️ Arquivos removidos:`);
    result.removedFiles.forEach((file) => {
      const relativePath = file.replace(process.cwd(), '.');
      console.log(`      ${relativePath}`);
    });
  }
}
