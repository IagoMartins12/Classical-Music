// app/utils/fileUtils.ts
import { unlink } from 'fs/promises';
import path from 'path';

/**
 * Deleta um arquivo do sistema de arquivos baseado na URL
 */
export async function deleteFileFromUrl(url: string): Promise<boolean> {
  try {
    // Verificar se é um arquivo local (começa com /uploads/)
    if (!url.startsWith('/uploads/')) {
      console.log('🔗 URL externa, não deletando:', url);
      return true; // URL externa, não precisa deletar
    }

    // Construir caminho físico do arquivo
    const filePath = path.join(process.cwd(), 'public', url);

    console.log('🗑️ Tentando deletar arquivo:', filePath);

    // Deletar arquivo
    await unlink(filePath);

    console.log('✅ Arquivo deletado com sucesso:', url);
    return true;
  } catch (error) {
    console.error('❌ Erro ao deletar arquivo:', url, error);
    return false;
  }
}

/**
 * Deleta múltiplos arquivos
 */
export async function deleteMultipleFiles(
  urls: (string | null | undefined)[]
): Promise<void> {
  const validUrls = urls.filter((url): url is string => Boolean(url));

  const deletePromises = validUrls.map((url) => deleteFileFromUrl(url));
  await Promise.allSettled(deletePromises);
}

/**
 * Extrai informações do arquivo a partir da URL
 */
export function getFileInfoFromUrl(url: string) {
  if (!url.startsWith('/uploads/')) {
    return null;
  }

  const parts = url.split('/');
  const fileName = parts[parts.length - 1];
  const type = parts[parts.length - 2]; // score, image, etc.

  return {
    fileName,
    type,
    isLocal: true,
    path: path.join(process.cwd(), 'public', url),
  };
}

/**
 * Gera nome de arquivo único
 */
export function generateUniqueFileName(
  originalName: string,
  prefix?: string
): string {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 15);
  const extension = path.extname(originalName);
  const baseName = path.basename(originalName, extension);

  const prefixStr = prefix ? `${prefix}-` : '';
  const sanitizedBaseName = baseName.replace(/[^a-zA-Z0-9-_]/g, '-');

  return `${prefixStr}${timestamp}-${randomStr}-${sanitizedBaseName}${extension}`;
}

export async function deleteFileWithDetails(url: string): Promise<{
  success: boolean;
  path?: string;
  error?: string;
}> {
  try {
    if (!url.startsWith('/uploads/')) {
      return {
        success: true,
        path: url,
      };
    }

    const filePath = path.join(process.cwd(), 'public', url);

    console.log('🗑️ [FILE-DELETE] Deletando:', {
      url,
      path: filePath.replace(process.cwd(), '.'),
    });

    await unlink(filePath);

    return {
      success: true,
      path: filePath,
    };
  } catch (error) {
    console.error('❌ [FILE-DELETE] Erro:', {
      url,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    });

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    };
  }
}

/**
 * Deleta múltiplos arquivos com relatório detalhado
 */
export async function deleteMultipleFilesWithReport(
  urls: (string | null | undefined)[]
): Promise<{
  total: number;
  deleted: number;
  failed: number;
  details: Array<{ url: string; success: boolean; error?: string }>;
}> {
  const validUrls = urls.filter((url): url is string => Boolean(url));
  const results = await Promise.allSettled(
    validUrls.map(async (url) => {
      const result = await deleteFileWithDetails(url);
      return { url, ...result };
    })
  );

  const details = results.map((result) => {
    if (result.status === 'fulfilled') {
      return result.value;
    } else {
      return {
        url: 'unknown',
        success: false,
        error: result.reason?.message || 'Promise rejected',
      };
    }
  });

  const deleted = details.filter((d) => d.success).length;
  const failed = details.filter((d) => !d.success).length;

  console.log(`📊 [FILE-DELETE] Relatório:`, {
    total: validUrls.length,
    deleted,
    failed,
  });

  return {
    total: validUrls.length,
    deleted,
    failed,
    details,
  };
}
