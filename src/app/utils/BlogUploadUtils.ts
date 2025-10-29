// app/utils/BlogUploadUtils.ts - ATUALIZADO COM SUPORTE A ÁUDIO

import { readdir, unlink, stat } from 'fs/promises';
import path from 'path';

// ✅ IMAGENS
export const ALLOWED_IMAGE_EXTENSIONS = [
  '.jpg',
  '.jpeg',
  '.png',
  '.gif',
  '.webp',
];

export const ALLOWED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
];

// ✅ ÁUDIOS
export const ALLOWED_AUDIO_EXTENSIONS = [
  '.mp3',
  '.wav',
  '.ogg',
  '.m4a',
  '.aac',
];

export const ALLOWED_AUDIO_MIME_TYPES = [
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/ogg',
  'audio/mp4',
  'audio/aac',
  'audio/x-m4a',
];

export const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_AUDIO_SIZE = 25 * 1024 * 1024; // 25MB

// ✅ VALIDAR IMAGEM
export function validateImageFile(file: File) {
  const errors: string[] = [];

  if (file.size > MAX_IMAGE_SIZE) {
    errors.push(
      `Imagem muito grande. Tamanho máximo: ${MAX_IMAGE_SIZE / (1024 * 1024)}MB`
    );
  }

  if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.type)) {
    errors.push('Tipo de imagem não permitido. Use JPEG, PNG, GIF ou WebP.');
  }

  const fileExtension = path.extname(file.name).toLowerCase();
  if (!ALLOWED_IMAGE_EXTENSIONS.includes(fileExtension)) {
    errors.push('Extensão de imagem não permitida.');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// ✅ VALIDAR ÁUDIO
export function validateAudioFile(file: File) {
  const errors: string[] = [];

  if (file.size > MAX_AUDIO_SIZE) {
    errors.push(
      `Áudio muito grande. Tamanho máximo: ${MAX_AUDIO_SIZE / (1024 * 1024)}MB`
    );
  }

  if (!ALLOWED_AUDIO_MIME_TYPES.includes(file.type)) {
    errors.push('Tipo de áudio não permitido. Use MP3, WAV, OGG, M4A ou AAC.');
  }

  const fileExtension = path.extname(file.name).toLowerCase();
  if (!ALLOWED_AUDIO_EXTENSIONS.includes(fileExtension)) {
    errors.push('Extensão de áudio não permitida.');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// ✅ VALIDAR ARQUIVO (GENÉRICO)
export function validateFile(file: File, type: 'image' | 'audio') {
  if (type === 'image') {
    return validateImageFile(file);
  } else {
    return validateAudioFile(file);
  }
}

// ✅ GERAR NOME DE ARQUIVO ÚNICO
export function generateFileName(originalName: string): string {
  const fileExtension = path.extname(originalName);
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);

  return `${timestamp}-${random}${fileExtension}`;
}

// ✅ CAMINHO DO UPLOAD
export function getBlogUploadPath(
  articleId: string | null,
  folder: string = 'thumbnail'
): string {
  if (!articleId) {
    return path.join(process.cwd(), 'public', 'blog', 'imageArticle', folder);
  }
  return path.join(process.cwd(), 'public', 'blog', articleId, folder);
}

// ✅ URL PÚBLICA
export function getPublicBlogImageUrl(
  articleId: string,
  folder: string = 'thumbnail',
  fileName: string
): string {
  return `uploads/blog/${articleId}/${folder}/${fileName}`;
}

// ✅ LIMPAR ARQUIVOS ANTIGOS
export async function cleanOldFiles(
  directoryPath: string,
  fileType: 'image' | 'audio' = 'image'
): Promise<{
  success: boolean;
  removedFiles: string[];
  errors: string[];
}> {
  const removedFiles: string[] = [];
  const errors: string[] = [];

  try {
    try {
      await stat(directoryPath);
    } catch {
      return { success: true, removedFiles: [], errors: [] };
    }

    const existingFiles = await readdir(directoryPath);

    const allowedExtensions =
      fileType === 'image'
        ? ALLOWED_IMAGE_EXTENSIONS
        : ALLOWED_AUDIO_EXTENSIONS;

    const targetFiles = existingFiles.filter((file) => {
      const ext = path.extname(file).toLowerCase();
      return allowedExtensions.includes(ext);
    });

    for (const file of targetFiles) {
      const filePath = path.join(directoryPath, file);
      try {
        await unlink(filePath);
        removedFiles.push(file);
        console.log(`✅ Arquivo removido: ${file}`);
      } catch (unlinkError) {
        const errorMsg = `Erro ao remover ${file}: ${unlinkError}`;
        errors.push(errorMsg);
        console.warn(`⚠️ ${errorMsg}`);
      }
    }

    return {
      success: errors.length === 0,
      removedFiles,
      errors,
    };
  } catch (error) {
    console.error('❌ Erro ao limpar diretório:', error);
    return {
      success: false,
      removedFiles: [],
      errors: [`Erro ao acessar diretório: ${error}`],
    };
  }
}

// ✅ INFORMAÇÕES DO DIRETÓRIO
export async function getDirectoryInfo(directoryPath: string) {
  try {
    const files = await readdir(directoryPath);
    const imageFiles = files.filter((file) => {
      const ext = path.extname(file).toLowerCase();
      return ALLOWED_IMAGE_EXTENSIONS.includes(ext);
    });

    const audioFiles = files.filter((file) => {
      const ext = path.extname(file).toLowerCase();
      return ALLOWED_AUDIO_EXTENSIONS.includes(ext);
    });

    let totalSize = 0;
    for (const file of [...imageFiles, ...audioFiles]) {
      const filePath = path.join(directoryPath, file);
      const stats = await stat(filePath);
      totalSize += stats.size;
    }

    return {
      totalFiles: imageFiles.length + audioFiles.length,
      imageFiles: imageFiles.length,
      audioFiles: audioFiles.length,
      totalSize,
      files: [...imageFiles, ...audioFiles],
    };
  } catch {
    return {
      totalFiles: 0,
      imageFiles: 0,
      audioFiles: 0,
      totalSize: 0,
      files: [],
    };
  }
}

// ✅ LIMPAR TODOS OS ARQUIVOS DO ARTIGO
export async function cleanArticleFiles(articleId: string): Promise<{
  success: boolean;
  removedCount: number;
  errors: string[];
}> {
  const folders = ['thumbnail', 'content', 'gallery', 'audio'];
  let totalRemoved = 0;
  const allErrors: string[] = [];

  for (const folder of folders) {
    const dirPath = getBlogUploadPath(articleId, folder);

    // Limpar imagens
    const imageResult = await cleanOldFiles(dirPath, 'image');
    totalRemoved += imageResult.removedFiles.length;
    allErrors.push(...imageResult.errors);

    // Limpar áudios
    const audioResult = await cleanOldFiles(dirPath, 'audio');
    totalRemoved += audioResult.removedFiles.length;
    allErrors.push(...audioResult.errors);
  }

  return {
    success: allErrors.length === 0,
    removedCount: totalRemoved,
    errors: allErrors,
  };
}
