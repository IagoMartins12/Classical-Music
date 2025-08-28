// app/libs/cloudinary.ts
import { v2 as cloudinary } from 'cloudinary';

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface CloudinaryUploadResult {
  success: boolean;
  url?: string;
  publicId?: string;
  secureUrl?: string;
  error?: string;
  fileSize?: number;
  format?: string;
  duration?: number; // Para vídeos
  width?: number; // Para imagens/vídeos
  height?: number; // Para imagens/vídeos
}

export interface UploadOptions {
  folder: string;
  resourceType: 'auto' | 'image' | 'video' | 'raw';
  publicId?: string;
  overwrite?: boolean;
  transformation?: any[];
  tags?: string[];
  context?: Record<string, any>;
}

/**
 * Upload principal para Cloudinary
 */
export async function uploadToCloudinary(
  file: File | Buffer,
  options: UploadOptions
): Promise<CloudinaryUploadResult> {
  try {
    console.log(`☁️ [CLOUDINARY] Uploading to folder: ${options.folder}`);

    // Converter File para Buffer se necessário
    let buffer: Buffer;
    if (file instanceof File) {
      const arrayBuffer = await file.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    } else {
      buffer = file;
    }

    // Configurações de upload
    const uploadOptions: any = {
      folder: options.folder,
      resource_type: options.resourceType,
      overwrite: options.overwrite || false,
      tags: options.tags || [],
      context: options.context || {},
    };

    // Se forneceu publicId customizado
    if (options.publicId) {
      uploadOptions.public_id = options.publicId;
    }

    // Transformações específicas por tipo
    if (options.transformation) {
      uploadOptions.transformation = options.transformation;
    }

    // Upload via stream
    const result = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            console.error('❌ [CLOUDINARY] Upload error:', error);
            reject(error);
          } else {
            resolve(result);
          }
        }
      );

      uploadStream.end(buffer);
    });

    console.log(`✅ [CLOUDINARY] Upload successful: ${result.secure_url}`);

    return {
      success: true,
      url: result.url,
      secureUrl: result.secure_url,
      publicId: result.public_id,
      fileSize: result.bytes,
      format: result.format,
      duration: result.duration,
      width: result.width,
      height: result.height,
    };
  } catch (error) {
    console.error('❌ [CLOUDINARY] Upload failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}

/**
 * Upload específico para partituras (PDF)
 */
export async function uploadScore(
  file: File,
  workId: string,
  scoreId: string
): Promise<CloudinaryUploadResult> {
  const folder = `partituras/${workId}`;
  const publicId = `score_${scoreId}`;

  return uploadToCloudinary(file, {
    folder,
    resourceType: 'image', // ✅ MUDANÇA: image em vez de raw para PDFs
    publicId,
    overwrite: true,
    tags: ['partitura', 'pdf', workId],
    context: {
      workId,
      scoreId,
      uploadedAt: new Date().toISOString(),
    },
  });
}

/**
 * Upload específico para vídeos de performance
 */
export async function uploadLearnedVideo(
  file: File,
  workId: string,
  userId: string
): Promise<CloudinaryUploadResult> {
  const folder = `videos/learned/${workId}`;
  const publicId = `learned_${userId}_${Date.now()}`;

  return uploadToCloudinary(file, {
    folder,
    resourceType: 'video',
    publicId,
    overwrite: false,
    tags: ['learned', 'performance', workId, userId],
    transformation: [
      { quality: 'auto:good' },
      { fetch_format: 'auto' },
      { width: 1280, height: 720, crop: 'limit' }, // HD máximo
    ],
    context: {
      workId,
      userId,
      type: 'learned_performance',
      uploadedAt: new Date().toISOString(),
    },
  });
}

/**
 * Upload específico para vídeos de assignments
 */
export async function uploadAssignmentVideo(
  file: File,
  assignmentId: string
): Promise<CloudinaryUploadResult> {
  const folder = `videos/assignments/${assignmentId}`;
  const publicId = `assignment_${assignmentId}_${Date.now()}`;

  return uploadToCloudinary(file, {
    folder,
    resourceType: 'video',
    publicId,
    overwrite: false,
    tags: ['assignment', 'submission', assignmentId],
    transformation: [
      { quality: 'auto:good' },
      { fetch_format: 'auto' },
      { width: 1280, height: 720, crop: 'limit' },
    ],
    context: {
      assignmentId,
      type: 'assignment_submission',
      uploadedAt: new Date().toISOString(),
    },
  });
}

/**
 * Upload específico para vídeo aulas
 */
export async function uploadVideoAula(
  file: File,
  workId: string
): Promise<CloudinaryUploadResult> {
  const folder = `videos/aulas/${workId}`;
  const publicId = `aula_${workId}_${Date.now()}`;

  return uploadToCloudinary(file, {
    folder,
    resourceType: 'video',
    publicId,
    overwrite: true,
    tags: ['video-aula', 'educational', workId],
    transformation: [
      { quality: 'auto:best' }, // Melhor qualidade para aulas
      { fetch_format: 'auto' },
      { width: 1920, height: 1080, crop: 'limit' }, // Full HD para aulas
    ],
    context: {
      workId,
      type: 'video_aula',
      uploadedAt: new Date().toISOString(),
    },
  });
}

/**
 * Upload específico para áudios customizados
 */
export async function uploadCustomAudio(
  file: File,
  workId: string
): Promise<CloudinaryUploadResult> {
  const folder = `audio/custom/${workId}`;
  const publicId = `audio_${workId}_${Date.now()}`;

  return uploadToCloudinary(file, {
    folder,
    resourceType: 'video', // Cloudinary usa 'video' para áudio
    publicId,
    overwrite: true,
    tags: ['audio', 'custom', workId],
    transformation: [{ quality: 'auto' }, { fetch_format: 'auto' }],
    context: {
      workId,
      type: 'custom_audio',
      uploadedAt: new Date().toISOString(),
    },
  });
}

/**
 * Deletar arquivo do Cloudinary
 */
export async function deleteFromCloudinary(
  publicId: string,
  resourceType: 'image' | 'video' | 'raw' = 'image'
): Promise<boolean> {
  try {
    console.log(`🗑️ [CLOUDINARY] Deleting: ${publicId}`);

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });

    if (result.result === 'ok') {
      console.log(`✅ [CLOUDINARY] Deleted successfully: ${publicId}`);
      return true;
    } else {
      console.warn(`⚠️ [CLOUDINARY] Delete result: ${result.result}`);
      return false;
    }
  } catch (error) {
    console.error('❌ [CLOUDINARY] Delete error:', error);
    return false;
  }
}

/**
 * Gerar URL otimizada
 */
export function getOptimizedUrl(
  publicId: string,
  options?: {
    width?: number;
    height?: number;
    quality?: string;
    format?: string;
    crop?: string;
  }
): string {
  return cloudinary.url(publicId, {
    quality: options?.quality || 'auto',
    fetch_format: options?.format || 'auto',
    width: options?.width,
    height: options?.height,
    crop: options?.crop || 'limit',
    secure: true,
  });
}

/**
 * Gerar thumbnail de vídeo
 */
export function getVideoThumbnail(
  publicId: string,
  options?: {
    width?: number;
    height?: number;
    timeOffset?: string;
  }
): string {
  return cloudinary.url(publicId, {
    resource_type: 'video',
    format: 'jpg',
    width: options?.width || 640,
    height: options?.height || 360,
    crop: 'fill',
    start_offset: options?.timeOffset || '10s',
    secure: true,
  });
}

export default cloudinary;
