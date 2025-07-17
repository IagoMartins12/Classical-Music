// app/libs/mediaUtils.ts - Utilitários para gerenciar mídia de anúncios
import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const UPLOAD_DIR = path.join(process.cwd(), 'public/uploads/ads');

// Garantir que o diretório de upload existe
async function ensureUploadDir() {
  try {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  } catch (error) {
    console.error('Erro ao criar diretório de upload:', error);
  }
}

/**
 * Copia um arquivo de mídia para um novo local
 * @param originalUrl - URL original do arquivo (/uploads/ads/filename.jpg)
 * @param newPrefix - Prefixo para o novo arquivo (ex: 'cloned_ad_123')
 * @returns Nova URL do arquivo copiado ou null se falhar
 */
export async function copyMediaFile(
  originalUrl: string,
  newPrefix: string
): Promise<string | null> {
  try {
    if (!originalUrl || !originalUrl.startsWith('/uploads/ads/')) {
      return null;
    }

    await ensureUploadDir();

    // Extrair nome do arquivo original
    const originalFilename = originalUrl.split('/').pop();
    if (!originalFilename) {
      return null;
    }

    // Gerar novo nome com prefixo único
    const fileExtension = path.extname(originalFilename);
    const timestamp = Date.now();
    const randomId = uuidv4().split('-')[0];
    const newFilename = `${newPrefix}_${timestamp}_${randomId}${fileExtension}`;

    // Caminhos dos arquivos
    const originalPath = path.join(UPLOAD_DIR, originalFilename);
    const newPath = path.join(UPLOAD_DIR, newFilename);

    // Verificar se arquivo original existe
    try {
      await fs.access(originalPath);
    } catch (error) {
      console.error('Arquivo original não encontrado:', originalPath);
      return null;
    }

    // Copiar arquivo
    await fs.copyFile(originalPath, newPath);

    // Retornar nova URL
    return `/uploads/ads/${newFilename}`;
  } catch (error) {
    console.error('Erro ao copiar arquivo:', error);
    return null;
  }
}

/**
 * Deleta um arquivo de mídia
 * @param fileUrl - URL do arquivo a ser deletado (/uploads/ads/filename.jpg)
 * @returns true se deletado com sucesso, false caso contrário
 */
export async function deleteMediaFile(fileUrl: string): Promise<boolean> {
  try {
    if (!fileUrl || !fileUrl.startsWith('/uploads/ads/')) {
      return false;
    }

    // Extrair nome do arquivo
    const filename = fileUrl.split('/').pop();
    if (!filename) {
      return false;
    }

    // Caminho completo do arquivo
    const filePath = path.join(UPLOAD_DIR, filename);

    // Verificar se arquivo existe antes de deletar
    try {
      await fs.access(filePath);
      await fs.unlink(filePath);
      console.log('Arquivo deletado:', filePath);
      return true;
    } catch (error) {
      console.error('Erro ao deletar arquivo:', filePath, error);
      return false;
    }
  } catch (error) {
    console.error('Erro no deleteMediaFile:', error);
    return false;
  }
}

/**
 * Cria cópias de toda a mídia de um anúncio
 * @param originalAd - Anúncio original
 * @param newAdId - ID do novo anúncio
 * @returns Objeto com as novas URLs
 */
export async function cloneAdMedia(originalAd: any, newAdId: string) {
  const clonedMedia = {
    imageUrl: null as string | null,
    thumbnailUrl: null as string | null,
    videoUrl: null as string | null,
  };

  try {
    // Clonar imagem principal
    if (originalAd.imageUrl) {
      clonedMedia.imageUrl = await copyMediaFile(
        originalAd.imageUrl,
        `ad_${newAdId}_image`
      );
    }

    // Clonar thumbnail
    if (originalAd.thumbnailUrl) {
      clonedMedia.thumbnailUrl = await copyMediaFile(
        originalAd.thumbnailUrl,
        `ad_${newAdId}_thumb`
      );
    }

    // Clonar vídeo
    if (originalAd.videoUrl) {
      clonedMedia.videoUrl = await copyMediaFile(
        originalAd.videoUrl,
        `ad_${newAdId}_video`
      );
    }

    return clonedMedia;
  } catch (error) {
    console.error('Erro ao clonar mídia:', error);
    return clonedMedia;
  }
}

/**
 * Deleta toda a mídia associada a um anúncio
 * @param ad - Anúncio a ter a mídia deletada
 * @returns Array com resultados das deleções
 */
export async function deleteAdMedia(
  ad: any
): Promise<{ type: string; success: boolean; url: string }[]> {
  const results = [];

  try {
    // Deletar imagem principal
    if (ad.imageUrl) {
      const success = await deleteMediaFile(ad.imageUrl);
      results.push({
        type: 'image',
        success,
        url: ad.imageUrl,
      });
    }

    // Deletar thumbnail
    if (ad.thumbnailUrl) {
      const success = await deleteMediaFile(ad.thumbnailUrl);
      results.push({
        type: 'thumbnail',
        success,
        url: ad.thumbnailUrl,
      });
    }

    // Deletar vídeo
    if (ad.videoUrl) {
      const success = await deleteMediaFile(ad.videoUrl);
      results.push({
        type: 'video',
        success,
        url: ad.videoUrl,
      });
    }

    return results;
  } catch (error) {
    console.error('Erro ao deletar mídia do anúncio:', error);
    return results;
  }
}

/**
 * Gera thumbnail para vídeo (placeholder para implementação futura)
 * @param videoPath - Caminho do vídeo
 * @returns Caminho do thumbnail ou null
 */
export async function generateVideoThumbnail(
  videoPath: string
): Promise<string | null> {
  try {
    // TODO: Implementar geração de thumbnail com ffmpeg
    // const ffmpeg = require('fluent-ffmpeg');
    // const thumbnailFilename = `thumb_${Date.now()}.jpg`;
    // const thumbnailPath = path.join(UPLOAD_DIR, thumbnailFilename);

    // await new Promise((resolve, reject) => {
    //   ffmpeg(videoPath)
    //     .screenshots({
    //       count: 1,
    //       folder: UPLOAD_DIR,
    //       filename: thumbnailFilename,
    //       timemarks: ['1'], // Capturar no segundo 1
    //     })
    //     .on('end', resolve)
    //     .on('error', reject);
    // });

    // return `/uploads/ads/${thumbnailFilename}`;
    return null;
  } catch (error) {
    console.error('Erro ao gerar thumbnail:', error);
    return null;
  }
}

/**
 * Valida se uma URL de mídia é válida e segura
 * @param url - URL a ser validada
 * @returns true se válida, false caso contrário
 */
export function isValidMediaUrl(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }

  // Verificar se é uma URL de upload local
  if (url.startsWith('/uploads/ads/')) {
    return true;
  }

  // Verificar se é uma URL externa válida
  try {
    const urlObj = new URL(url);
    return ['http:', 'https:'].includes(urlObj.protocol);
  } catch (error) {
    return false;
  }
}

/**
 * Obtém informações sobre um arquivo de mídia
 * @param fileUrl - URL do arquivo
 * @returns Informações do arquivo
 */
export async function getMediaFileInfo(fileUrl: string) {
  try {
    if (!fileUrl || !fileUrl.startsWith('/uploads/ads/')) {
      return null;
    }

    const filename = fileUrl.split('/').pop();
    if (!filename) {
      return null;
    }

    const filePath = path.join(UPLOAD_DIR, filename);

    try {
      const stats = await fs.stat(filePath);
      return {
        exists: true,
        size: stats.size,
        sizeFormatted: formatFileSize(stats.size),
        modified: stats.mtime,
        extension: path.extname(filename).toLowerCase(),
      };
    } catch (error) {
      return {
        exists: false,
        size: 0,
        sizeFormatted: '0 B',
        modified: null,
        extension: path.extname(filename).toLowerCase(),
      };
    }
  } catch (error) {
    console.error('Erro ao obter info do arquivo:', error);
    return null;
  }
}

/**
 * Formata o tamanho do arquivo em uma string legível
 * @param bytes - Tamanho em bytes
 * @returns String formatada (ex: "1.5 MB")
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
