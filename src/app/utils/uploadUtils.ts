// app/utils/uploadUtils.ts (utilitários para upload)
import { readdir, unlink, stat } from 'fs/promises';
import path from 'path';

// Tipos de arquivo permitidos
export const ALLOWED_IMAGE_EXTENSIONS = [
  '.jpg',
  '.jpeg',
  '.png',
  '.gif',
  '.webp',
];
export const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
];

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Função para validar arquivo de imagem
export function validateImageFile(file: File) {
  const errors: string[] = [];

  // Validar tamanho
  if (file.size > MAX_FILE_SIZE) {
    errors.push(
      `Arquivo muito grande. Máximo ${MAX_FILE_SIZE / (1024 * 1024)}MB.`
    );
  }

  // Validar tipo MIME
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    errors.push('Tipo de arquivo não permitido. Use JPG, PNG, GIF ou WebP.');
  }

  // Validar extensão do arquivo
  const fileExtension = path.extname(file.name).toLowerCase();
  if (!ALLOWED_IMAGE_EXTENSIONS.includes(fileExtension)) {
    errors.push('Extensão de arquivo não permitida.');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Função para limpar imagens antigas de um diretório
export async function cleanOldImages(directoryPath: string): Promise<{
  success: boolean;
  removedFiles: string[];
  errors: string[];
}> {
  const removedFiles: string[] = [];
  const errors: string[] = [];

  try {
    // Verificar se o diretório existe
    try {
      await stat(directoryPath);
    } catch {
      // Diretório não existe, nada para limpar
      return { success: true, removedFiles: [], errors: [] };
    }

    const existingFiles = await readdir(directoryPath);

    // Filtrar apenas arquivos de imagem
    const imageFiles = existingFiles.filter((file) => {
      const ext = path.extname(file).toLowerCase();
      return ALLOWED_IMAGE_EXTENSIONS.includes(ext);
    });

    // Remover cada arquivo de imagem
    for (const imageFile of imageFiles) {
      const filePath = path.join(directoryPath, imageFile);
      try {
        await unlink(filePath);
        removedFiles.push(imageFile);
        console.log(`✅ Imagem antiga removida: ${imageFile}`);
      } catch (unlinkError) {
        const errorMsg = `Erro ao remover ${imageFile}: ${unlinkError}`;
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

// Função para gerar nome de arquivo único
export function generateFileName(originalName: string, userId: string): string {
  const fileExtension = path.extname(originalName);
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);

  return `profile-${timestamp}-${random}${fileExtension}`;
}

// Função para gerar caminho do diretório do usuário
export function getUserUploadPath(userId: string): string {
  return path.join(process.cwd(), 'public', 'uploads', 'profiles', userId);
}

// Função para gerar URL pública
export function getPublicImageUrl(userId: string, fileName: string): string {
  return `/uploads/profiles/${userId}/${fileName}`;
}

// Função para obter informações do diretório
export async function getDirectoryInfo(directoryPath: string) {
  try {
    const files = await readdir(directoryPath);
    const imageFiles = files.filter((file) => {
      const ext = path.extname(file).toLowerCase();
      return ALLOWED_IMAGE_EXTENSIONS.includes(ext);
    });

    let totalSize = 0;
    for (const file of imageFiles) {
      const filePath = path.join(directoryPath, file);
      const stats = await stat(filePath);
      totalSize += stats.size;
    }

    return {
      totalFiles: imageFiles.length,
      totalSize,
      files: imageFiles,
    };
  } catch {
    return {
      totalFiles: 0,
      totalSize: 0,
      files: [],
    };
  }
}
