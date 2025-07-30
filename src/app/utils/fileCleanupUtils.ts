// app/utils/fileCleanupUtils.ts - ATUALIZADO PARA NOVA ESTRUTURA
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
 * 🆕 Remove pasta completa de uma partitura (PDF + thumbnail + pasta) - ATUALIZADO
 */
export async function cleanupScoreWorkDirectory(
  downloadUrl: string | null,
  thumbnailUrl: string | null
): Promise<CleanupResult> {
  console.log(`🧹 Limpando pasta completa da partitura...`);

  try {
    // Extrair pasta da partitura do downloadUrl (prioridade)
    let scoreDir = extractScoreDirectoryFromUrl(downloadUrl);

    // Se não encontrou pelo PDF, tentar pelo thumbnail
    if (!scoreDir && thumbnailUrl) {
      scoreDir = extractScoreDirectoryFromUrl(thumbnailUrl);
    }

    if (scoreDir) {
      console.log(`📁 Removendo pasta da partitura: ${scoreDir}`);
      return await removeDirectory(scoreDir);
    } else {
      // Fallback: remover arquivos individuais
      console.log(
        `⚠️ Não foi possível identificar pasta da partitura, removendo arquivos individuais`
      );
      return await removeFilesByUrls([downloadUrl, thumbnailUrl]);
    }
  } catch (error) {
    console.error('❌ Erro ao limpar pasta da partitura:', error);

    // Fallback: tentar remover arquivos individuais
    return await removeFilesByUrls([downloadUrl, thumbnailUrl]);
  }
}

/**
 * 🆕 Extrai o diretório da partitura de uma URL - ATUALIZADO PARA NOVA ESTRUTURA
 * Ex: /uploads/scores/final/2025/07/nome-da-peca/nome-da-peca-123456/nome-da-peca.pdf
 *     → /public/uploads/scores/final/2025/07/nome-da-peca/nome-da-peca-123456/
 */
function extractScoreDirectoryFromUrl(url: string | null): string | null {
  if (!url) return null;

  try {
    // Verificar se é URL da estrutura nova (final com ID)
    const newScoreMatch = url.match(
      /\/uploads\/scores\/final\/(\d{4})\/(\d{2})\/([^\/]+)\/([^\/]+)\//
    );

    if (newScoreMatch) {
      const [, year, month, workTitle, scoreDir] = newScoreMatch;
      return path.join(
        process.cwd(),
        'public',
        'uploads',
        'scores',
        'final',
        year,
        month,
        workTitle,
        scoreDir
      );
    }

    // Verificar se é URL da estrutura antiga (final sem ID)
    const oldFinalMatch = url.match(
      /\/uploads\/scores\/final\/(\d{4})\/(\d{2})\/([^\/]+)\//
    );

    if (oldFinalMatch) {
      const [, year, month, workTitle] = oldFinalMatch;
      return path.join(
        process.cwd(),
        'public',
        'uploads',
        'scores',
        'final',
        year,
        month,
        workTitle
      );
    }

    // Verificar se é URL da estrutura muito antiga
    const veryOldMatch = url.match(/\/uploads\/score\/(\d{4})\/(\d{2})\//);

    if (veryOldMatch) {
      const fileDir = path.dirname(
        path.join(process.cwd(), 'public', url.substring(1))
      );
      return fileDir;
    }

    return null;
  } catch (error) {
    console.error('❌ Erro ao extrair diretório da partitura:', error);
    return null;
  }
}

/**
 * 🆕 Remove arquivos temporários órfãos do usuário
 */
export async function cleanupUserTemporaryFiles(
  userId: string
): Promise<CleanupResult> {
  console.log(`🧹 Limpando arquivos temporários do usuário: ${userId}`);

  const userTempDir = path.join(
    process.cwd(),
    'public',
    'uploads',
    'scores',
    'temp',
    userId
  );

  return await removeDirectory(userTempDir);
}

/**
 * 🆕 Remove todos os arquivos temporários órfãos (mais antigos que X horas)
 */
export async function cleanupOrphanedTemporaryFiles(
  maxAgeHours: number = 24
): Promise<CleanupResult> {
  console.log(`🧹 Limpando arquivos temporários órfãos (>${maxAgeHours}h)...`);

  const result: CleanupResult = {
    removedFiles: [],
    removedDirectories: [],
    errors: [],
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

    // Listar todas as pastas de usuários
    const userDirs = await fs.readdir(tempDir, { withFileTypes: true });

    for (const userDir of userDirs) {
      if (!userDir.isDirectory()) continue;

      const userDirPath = path.join(tempDir, userDir.name);

      try {
        // Listar arquivos na pasta do usuário
        const files = await fs.readdir(userDirPath, { withFileTypes: true });

        for (const file of files) {
          if (file.isDirectory()) continue;

          const filePath = path.join(userDirPath, file.name);

          try {
            // Verificar idade do arquivo
            const stats = await fs.stat(filePath);
            const ageHours =
              (Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60);

            if (ageHours > maxAgeHours) {
              // Arquivo antigo, remover
              result.totalSize += stats.size;
              await fs.unlink(filePath);
              result.removedFiles.push(filePath);
              console.log(
                `🗑️ Arquivo temporário órfão removido: ${filePath} (${ageHours.toFixed(
                  1
                )}h)`
              );
            }
          } catch (fileError) {
            const errorMsg = `Erro ao processar arquivo ${filePath}: ${fileError}`;
            result.errors.push(errorMsg);
            console.error(`❌ ${errorMsg}`);
          }
        }

        // Tentar remover pasta do usuário se estiver vazia
        try {
          const remainingFiles = await fs.readdir(userDirPath);
          if (remainingFiles.length === 0) {
            await fs.rmdir(userDirPath);
            result.removedDirectories.push(userDirPath);
            console.log(`📂 Pasta temporária vazia removida: ${userDirPath}`);
          }
        } catch{
          // Não é erro crítico se não conseguir remover pasta vazia
          console.log(`📁 Pasta não vazia ou erro ao remover: ${userDirPath}`);
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
 * 🆕 Remove arquivos de uma partitura (ATUALIZADO para nova estrutura)
 */
export async function cleanupScoreFiles(
  downloadUrl: string | null,
  thumbnailUrl: string | null
): Promise<CleanupResult> {
  console.log(`🧹 Limpando arquivos da partitura...`);

  // 🆕 Tentar remover pasta completa primeiro
  const workDirResult = await cleanupScoreWorkDirectory(
    downloadUrl,
    thumbnailUrl
  );

  if (workDirResult.removedDirectories.length > 0) {
    // Pasta completa foi removida com sucesso
    console.log('✅ Pasta completa da obra removida');
    return workDirResult;
  } else {
    // Fallback: remover arquivos individuais
    console.log('⚠️ Removendo arquivos individuais (fallback)');
    return await removeFilesByUrls([downloadUrl, thumbnailUrl]);
  }
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
 * 🆕 Extrai título da obra de uma URL de partitura
 */
export function extractWorkTitleFromScoreUrl(
  url: string | null
): string | null {
  if (!url) return null;

  // Exemplo: /uploads/scores/final/2024/12/sonata-ao-luar/sonata-ao-luar.pdf
  const match = url.match(/\/uploads\/scores\/final\/\d{4}\/\d{2}\/([^\/]+)\//);
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

  if (result.removedDirectories.length > 0) {
    console.log(`   📂 Diretórios removidos:`);
    result.removedDirectories.forEach((dir) => {
      const relativePath = dir.replace(process.cwd(), '.');
      console.log(`      ${relativePath}`);
    });
  }
}
