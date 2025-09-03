// app/libs/cloudinary.ts - VERSÃO COMPLETA OTIMIZADA
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
  eager?: boolean; // 🆕 Para transformações sob demanda
}

/**
 * 🚀 Upload principal OTIMIZADO para Cloudinary
 */
export async function uploadToCloudinary(
  file: File | Buffer,
  options: UploadOptions
): Promise<CloudinaryUploadResult> {
  try {
    console.log(`☁️ [CLOUDINARY] Uploading to folder: ${options.folder}`);

    // 🚀 OTIMIZAÇÃO 1: Evitar conversão desnecessária
    let buffer: Buffer;
    if (file instanceof File) {
      const arrayBuffer = await file.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    } else {
      buffer = file;
    }

    // 🚀 OTIMIZAÇÃO 2: Configurações otimizadas para velocidade
    const uploadOptions: any = {
      folder: options.folder,
      resource_type: options.resourceType,
      overwrite: options.overwrite || false,
      tags: options.tags || [],
      context: options.context || {},

      // 🆕 OTIMIZAÇÕES DE VELOCIDADE
      chunk_size: 6000000, // 6MB chunks (padrão é menor)
      timeout: 120000, // 2 minutos timeout
      use_filename: false, // Evita processar nome do arquivo
      unique_filename: true, // Gera nome único rapidamente
    };

    // Se forneceu publicId customizado
    if (options.publicId) {
      uploadOptions.public_id = options.publicId;
    }

    // 🚀 OTIMIZAÇÃO 3: Transformações sob demanda
    if (options.transformation && !options.eager) {
      // NÃO aplicar transformações no upload, apenas salvar
      // Aplicar quando necessário via URL
      uploadOptions.transformation = undefined;
    } else if (options.transformation && options.eager) {
      uploadOptions.transformation = options.transformation;
      uploadOptions.eager = options.transformation;
    }

    // 🚀 OTIMIZAÇÃO 4: Upload stream otimizado
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
 * Upload específico para partituras (PDF) - MANTIDO IGUAL
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
 * 🚀 Upload de vídeo ULTRA RÁPIDO - SEM transformações
 */
export async function uploadLearnedVideoFast(
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

    // 🆕 SEM TRANSFORMAÇÕES NO UPLOAD - MUITO MAIS RÁPIDO
    transformation: undefined,
    eager: false, // Não aplicar transformações eagerly

    context: {
      workId,
      userId,
      type: 'learned_performance',
      uploadedAt: new Date().toISOString(),
    },
  });
}

/**
 * 🚀 Upload de vídeo com transformações MÍNIMAS
 */
export async function uploadLearnedVideoOptimized(
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

    // 🆕 TRANSFORMAÇÕES MÍNIMAS APENAS
    transformation: [
      { quality: 'auto' }, // Sem especificar :good
      { fetch_format: 'auto' },
      // Removido resize para não processar durante upload
    ],
    eager: false, // Aplicar sob demanda

    context: {
      workId,
      userId,
      type: 'learned_performance',
      uploadedAt: new Date().toISOString(),
    },
  });
}

/**
 * Upload específico para vídeos de performance - OTIMIZADO
 */
export async function uploadLearnedVideo(
  file: File,
  workId: string,
  userId: string
): Promise<CloudinaryUploadResult> {
  // Estratégia baseada no tamanho do arquivo
  if (file.size > 50 * 1024 * 1024) {
    // > 50MB
    console.log(
      `🚀 [CLOUDINARY] Arquivo grande (${(file.size / 1024 / 1024).toFixed(
        1
      )}MB) - usando upload ultra-rápido`
    );
    return uploadLearnedVideoFast(file, workId, userId);
  } else {
    console.log(
      `⚡ [CLOUDINARY] Arquivo médio (${(file.size / 1024 / 1024).toFixed(
        1
      )}MB) - usando upload otimizado`
    );
    return uploadLearnedVideoOptimized(file, workId, userId);
  }
}

/**
 * Upload específico para vídeos de assignments - OTIMIZADO
 */
export async function uploadAssignmentVideo(
  file: File,
  assignmentId: string
): Promise<CloudinaryUploadResult> {
  const folder = `videos/assignments/${assignmentId}`;
  const publicId = `assignment_${assignmentId}_${Date.now()}`;

  // Assignments podem ser grandes, usar estratégia rápida
  return uploadToCloudinary(file, {
    folder,
    resourceType: 'video',
    publicId,
    overwrite: false,
    tags: ['assignment', 'submission', assignmentId],
    // 🆕 Transformações sob demanda apenas
    transformation: undefined,
    eager: false,
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
    // 🆕 Para aulas, manter qualidade alta mas aplicar sob demanda
    transformation: undefined,
    eager: false,
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
 * 🆕 Gerar URL otimizada SOB DEMANDA
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
 * 🆕 Gerar URL otimizada para VÍDEOS sob demanda
 */
export function getOptimizedVideoUrl(
  publicId: string,
  options?: {
    width?: number;
    height?: number;
    quality?: string;
    format?: string;
  }
): string {
  return cloudinary.url(publicId, {
    resource_type: 'video',
    quality: options?.quality || 'auto:good',
    fetch_format: options?.format || 'auto',
    width: options?.width || 1280,
    height: options?.height || 720,
    crop: 'limit',
    secure: true,
  });
}

/**
 * 🆕 Gerar URL de vídeo comprimido sob demanda
 */
export function getCompressedVideoUrl(
  publicId: string,
  compressionLevel: 'light' | 'medium' | 'heavy' = 'medium'
): string {
  const qualityMap = {
    light: 'auto:good',
    medium: 'auto:eco',
    heavy: 'auto:low',
  };

  return cloudinary.url(publicId, {
    resource_type: 'video',
    quality: qualityMap[compressionLevel],
    fetch_format: 'auto',
    width: 1280,
    height: 720,
    crop: 'limit',
    secure: true,
  });
}

/**
 * 🆕 Gerar URL para aula em qualidade alta
 */
export function getVideoAulaUrl(
  publicId: string,
  quality: 'hd' | 'fhd' | 'auto' = 'auto'
): string {
  const configs = {
    hd: { width: 1280, height: 720, quality: 'auto:best' },
    fhd: { width: 1920, height: 1080, quality: 'auto:best' },
    auto: { width: 1280, height: 720, quality: 'auto:good' },
  };

  const config = configs[quality];

  return cloudinary.url(publicId, {
    resource_type: 'video',
    quality: config.quality,
    fetch_format: 'auto',
    width: config.width,
    height: config.height,
    crop: 'limit',
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

/**
 * 🆕 Gerar múltiplas URLs para diferentes contextos
 */
export function getVideoUrls(publicId: string) {
  return {
    // Para preview rápido
    preview: getCompressedVideoUrl(publicId, 'medium'),

    // Para visualização normal
    normal: getOptimizedVideoUrl(publicId, {
      width: 1280,
      height: 720,
      quality: 'auto:good',
    }),

    // Para qualidade alta
    hd: getOptimizedVideoUrl(publicId, {
      width: 1920,
      height: 1080,
      quality: 'auto:best',
    }),

    // Thumbnail
    thumbnail: getVideoThumbnail(publicId, {
      width: 640,
      height: 360,
      timeOffset: '10s',
    }),

    // Original (URL base)
    original: cloudinary.url(publicId, {
      resource_type: 'video',
      secure: true,
    }),
  };
}

/**
 * 🆕 Função para upgrade de URLs legadas
 */
export function upgradeVideoUrl(
  publicId: string,
  context: 'preview' | 'normal' | 'hd' = 'normal'
): string {
  switch (context) {
    case 'preview':
      return getCompressedVideoUrl(publicId, 'medium');
    case 'hd':
      return getOptimizedVideoUrl(publicId, {
        width: 1920,
        height: 1080,
        quality: 'auto:best',
      });
    case 'normal':
    default:
      return getOptimizedVideoUrl(publicId, {
        width: 1280,
        height: 720,
        quality: 'auto:good',
      });
  }
}

/**
 * 🆕 Análise de performance de upload
 */
export const uploadMetrics = {
  averageTime: 0,
  totalUploads: 0,
  slowUploads: 0,

  record(uploadTime: number, fileSize: number, fileName?: string) {
    this.totalUploads++;
    this.averageTime =
      (this.averageTime * (this.totalUploads - 1) + uploadTime) /
      this.totalUploads;

    // Considerar lento se > 30 segundos
    if (uploadTime > 30000) {
      this.slowUploads++;
    }

    const throughputMBps = fileSize / (uploadTime / 1000) / 1024 / 1024;

    console.log(`📊 [METRICS] Upload #${this.totalUploads}:`, {
      file: fileName || 'unknown',
      time: `${(uploadTime / 1000).toFixed(1)}s`,
      fileSize: `${(fileSize / 1024 / 1024).toFixed(2)}MB`,
      throughput: `${throughputMBps.toFixed(2)}MB/s`,
      averageTime: `${(this.averageTime / 1000).toFixed(1)}s`,
      slowRate: `${((this.slowUploads / this.totalUploads) * 100).toFixed(1)}%`,
    });

    // Alertar se taxa de uploads lentos está alta
    if (this.totalUploads > 5 && this.slowUploads / this.totalUploads > 0.3) {
      console.warn(
        `⚠️ [METRICS] ${((this.slowUploads / this.totalUploads) * 100).toFixed(
          1
        )}% dos uploads estão lentos`
      );
    }
  },
};

export default cloudinary;
