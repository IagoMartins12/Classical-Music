// app/utils/learnedVideoUpload.ts - ATUALIZADO PARA CLOUDINARY
import {
  uploadLearnedVideo as uploadToCloudinary,
  deleteFromCloudinary,
  getVideoThumbnail,
} from '@/app/libs/cloudinary';

// Tipos atualizados
export interface LearnedVideoUploadResult {
  success: boolean;
  error?: string;
  cloudinaryUrl?: string;
  publicId?: string;
  filename?: string;
  fileSize?: number;
  thumbnailUrl?: string;
  duration?: number;
  format?: string;
}

export interface LearnedVideoData {
  cloudinaryUrl: string;
  cloudinaryPublicId: string;
  filename: string;
  originalName: string;
  fileSize: number;
  uploadedAt: string;
  isPublic: boolean;
  thumbnailUrl?: string;
  duration?: number;
  format?: string;
  filePath?: string | null;
}

// Configurações
const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB
const ALLOWED_TYPES = [
  'video/mp4',
  'video/webm',
  'video/mov',
  'video/quicktime',
];

// Função para validar arquivo de vídeo
function validateVideoFile(file: File): { isValid: boolean; error?: string } {
  // Validar tipo
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: `Tipo de arquivo não suportado. Use: ${ALLOWED_TYPES.join(', ')}`,
    };
  }

  // Validar tamanho
  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `Arquivo muito grande. Tamanho máximo: ${
        MAX_FILE_SIZE / (1024 * 1024)
      }MB`,
    };
  }

  return { isValid: true };
}

// Upload do vídeo do learned item - CLOUDINARY
export async function uploadLearnedVideo(
  workId: string,
  learnedItemId: string,
  videoFile: File
): Promise<LearnedVideoUploadResult> {
  try {
    console.log(
      `🎥 [CLOUDINARY] Iniciando upload learned para work ${workId}, learned ${learnedItemId}`
    );
    console.log(
      `🎥 [CLOUDINARY] Arquivo: ${videoFile.name}, Tamanho: ${videoFile.size} bytes`
    );

    // Validar arquivo
    const validation = validateVideoFile(videoFile);
    if (!validation.isValid) {
      console.error(`❌ [CLOUDINARY] Validação falhou: ${validation.error}`);
      return {
        success: false,
        error: validation.error,
      };
    }

    // Upload para Cloudinary
    const uploadResult = await uploadToCloudinary(
      videoFile,
      workId,
      learnedItemId
    );

    if (!uploadResult.success) {
      console.error(`❌ [CLOUDINARY] Upload falhou: ${uploadResult.error}`);
      return {
        success: false,
        error: uploadResult.error,
      };
    }

    // Gerar thumbnail do vídeo
    const thumbnailUrl = uploadResult.publicId
      ? getVideoThumbnail(uploadResult.publicId, { width: 640, height: 360 })
      : undefined;

    console.log(`✅ [CLOUDINARY] Upload concluído: ${uploadResult.secureUrl}`);

    return {
      success: true,
      cloudinaryUrl: uploadResult.secureUrl!,
      publicId: uploadResult.publicId!,
      filename: videoFile.name,
      fileSize: uploadResult.fileSize!,
      thumbnailUrl,
      duration: uploadResult.duration,
      format: uploadResult.format,
    };
  } catch (error) {
    console.error('❌ [CLOUDINARY] Erro no upload:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    };
  }
}

// Deletar vídeo do learned item - CLOUDINARY
export async function deleteLearnedVideo(publicId: string): Promise<boolean> {
  try {
    console.log(`🗑️ [CLOUDINARY] Tentando deletar: ${publicId}`);

    const success = await deleteFromCloudinary(publicId, 'video');

    if (success) {
      console.log(`🗑️ [CLOUDINARY] Vídeo deletado: ${publicId}`);
      return true;
    } else {
      console.warn(`⚠️ [CLOUDINARY] Falha ao deletar: ${publicId}`);
      return false;
    }
  } catch (error) {
    console.error('❌ [CLOUDINARY] Erro ao deletar vídeo:', error);
    return false;
  }
}

// Deletar todos os vídeos de um learned item (mantido para compatibilidade)
export async function deleteAllLearnedVideos(
  workId: string,
  learnedItemId: string
): Promise<boolean> {
  // Com Cloudinary, geralmente temos apenas 1 vídeo por learned item
  // Esta função agora precisa da publicId específica para deletar
  console.log(
    `🗑️ [CLOUDINARY] deleteAllLearnedVideos chamada para work ${workId}, learned ${learnedItemId}`
  );
  console.log(
    `⚠️ [CLOUDINARY] Use deleteLearnedVideo(publicId) com a publicId específica`
  );
  return true;
}

// Extrair dados do vídeo das submissões - ATUALIZADO
export function extractLearnedVideoData(learned: any): LearnedVideoData | null {
  // Fallback para dados locais antigos
  if (learned.videoUrl || learned.videoFileName) {
    return {
      cloudinaryUrl: learned.videoUrl || '',
      cloudinaryPublicId: '',
      filename: learned.videoFileName || 'video.mp4',
      originalName: learned.videoFileName || 'video.mp4',
      fileSize: learned.videoFileSize || 0,
      uploadedAt: learned.videoUploadedAt || learned.updatedAt,
      isPublic: learned.isVideoPublic || false,
      filePath: learned.filePath || '',
    };
  }

  return null;
}

// Criar dados de vídeo para salvar - ATUALIZADO
export function createLearnedVideoData(
  uploadResult: LearnedVideoUploadResult,
  isPublic: boolean
): any {
  if (!uploadResult.success) return null;

  return {
    // Campos do Cloudinary

    // Campos legados (mantidos para compatibilidade)
    videoUrl: uploadResult.cloudinaryUrl,
    videoFileName: uploadResult.filename,
    videoFileSize: uploadResult.fileSize,

    // Configurações
    isVideoPublic: isPublic,
    videoUploadedAt: new Date(),
  };
}
