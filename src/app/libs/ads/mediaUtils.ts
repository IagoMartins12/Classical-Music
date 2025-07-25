// app/libs/mediaUtils.ts - Versão segura para cliente e servidor
// Dimensões específicas para diferentes dispositivos e posicionamentos
export const AD_DIMENSIONS = {
  // Header - Banner largo
  HEADER: {
    desktop: { width: 1200, height: 120, aspectRatio: '10:1' },
    tablet: { width: 768, height: 120, aspectRatio: '6.4:1' },
    mobile: { width: 375, height: 80, aspectRatio: '4.7:1' },
  },

  // Sidebar - Formato retrato
  SIDEBAR_RIGHT: {
    desktop: { width: 300, height: 400, aspectRatio: '3:4' },
    tablet: { width: 250, height: 333, aspectRatio: '3:4' },
    mobile: { width: 300, height: 200, aspectRatio: '3:2' },
  },

  SIDEBAR_LEFT: {
    desktop: { width: 300, height: 400, aspectRatio: '3:4' },
    tablet: { width: 250, height: 333, aspectRatio: '3:4' },
    mobile: { width: 300, height: 200, aspectRatio: '3:2' },
  },

  // Content - Formato landscape
  CONTENT_TOP: {
    desktop: { width: 800, height: 300, aspectRatio: '8:3' },
    tablet: { width: 600, height: 225, aspectRatio: '8:3' },
    mobile: { width: 350, height: 200, aspectRatio: '7:4' },
  },

  CONTENT_BOTTOM: {
    desktop: { width: 800, height: 300, aspectRatio: '8:3' },
    tablet: { width: 600, height: 225, aspectRatio: '8:3' },
    mobile: { width: 350, height: 200, aspectRatio: '7:4' },
  },

  // Between Content - Banner médio
  BETWEEN_CONTENT: {
    desktop: { width: 800, height: 250, aspectRatio: '16:5' },
    tablet: { width: 600, height: 187, aspectRatio: '16:5' },
    mobile: { width: 350, height: 150, aspectRatio: '7:3' },
  },

  // Footer - Quadrado/Retângulo
  FOOTER: {
    desktop: { width: 350, height: 200, aspectRatio: '7:4' },
    tablet: { width: 300, height: 171, aspectRatio: '7:4' },
    mobile: { width: 300, height: 171, aspectRatio: '7:4' },
  },

  // Modal - Formato destaque
  MODAL: {
    desktop: { width: 600, height: 400, aspectRatio: '3:2' },
    tablet: { width: 500, height: 333, aspectRatio: '3:2' },
    mobile: { width: 350, height: 233, aspectRatio: '3:2' },
  },
};

interface MediaVersions {
  original?: string;
  desktop?: string;
  tablet?: string;
  mobile?: string;
  thumbnail?: string;
}

export interface ProcessedMedia {
  imageUrl?: string;
  imageVersions?: MediaVersions;
  videoUrl?: string;
  videoVersions?: MediaVersions;
  thumbnailUrl?: string;
}

/**
 * Valida dimensões de imagem/vídeo (funciona no cliente)
 */
export function validateMediaDimensions(
  width: number,
  height: number,
  placement: keyof typeof AD_DIMENSIONS
): { isValid: boolean; message?: string; suggestedDimensions?: any } {
  if (!AD_DIMENSIONS[placement]) {
    return {
      isValid: false,
      message: `Placement ${placement} não encontrado`,
    };
  }

  const dimensions = AD_DIMENSIONS[placement];
  const desktopDims = dimensions.desktop;

  // Calcular ratio original
  const originalRatio = width / height;
  const targetRatio = desktopDims.width / desktopDims.height;

  // Tolerância de 10% na proporção
  const tolerance = 0.1;
  const ratioMatch = Math.abs(originalRatio - targetRatio) <= tolerance;

  // Verificar resolução mínima
  const minResolution = Math.min(width, height) >= 200;

  if (!minResolution) {
    return {
      isValid: false,
      message: `Resolução muito baixa. Mínimo: 200px na menor dimensão.`,
      suggestedDimensions: desktopDims,
    };
  }

  if (!ratioMatch) {
    return {
      isValid: false,
      message: `Proporção inadequada para ${placement}. Sugerida: ${desktopDims.aspectRatio}`,
      suggestedDimensions: desktopDims,
    };
  }

  return { isValid: true };
}

/**
 * Obter URL responsiva adequada para um device específico (cliente seguro)
 */
export function getResponsiveImageUrl(
  versions: MediaVersions | undefined,
  device: 'desktop' | 'tablet' | 'mobile' = 'desktop'
): string {
  if (!versions) return '';

  // Fallback chain
  return (
    versions[device] ||
    versions.desktop ||
    versions.tablet ||
    versions.mobile ||
    versions.original ||
    ''
  );
}

/**
 * Obter srcset para imagens responsivas (cliente seguro)
 */
export function getImageSrcSet(versions: MediaVersions | undefined): string {
  if (!versions) return '';

  const srcSet = [];

  if (versions.mobile) srcSet.push(`${versions.mobile} 480w`);
  if (versions.tablet) srcSet.push(`${versions.tablet} 768w`);
  if (versions.desktop) srcSet.push(`${versions.desktop} 1200w`);

  return srcSet.join(', ');
}

/**
 * Determinar tipo de dispositivo baseado em user agent (cliente seguro)
 */
export function getDeviceType(
  userAgent?: string
): 'desktop' | 'tablet' | 'mobile' {
  if (typeof window === 'undefined') {
    // Server-side: usar user agent se disponível
    if (!userAgent) return 'desktop';

    const isMobile = /mobile|android|iphone/i.test(userAgent);
    const isTablet = /tablet|ipad/i.test(userAgent);

    return isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop';
  }

  // Client-side: usar window width
  const width = window.innerWidth;
  if (width < 640) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

/**
 * Obter informações de um arquivo (cliente seguro)
 */
export function getFileInfo(file: File) {
  return {
    name: file.name,
    size: file.size,
    type: file.type,
    lastModified: file.lastModified,
    isImage: file.type.startsWith('image/'),
    isVideo: file.type.startsWith('video/'),
    sizeFormatted: formatFileSize(file.size),
  };
}

/**
 * Formatar tamanho de arquivo (cliente seguro)
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Validar arquivo antes do upload (cliente seguro)
 */
export function validateFile(
  file: File,
  type: 'image' | 'video',
  placement: keyof typeof AD_DIMENSIONS
) {
  const info = getFileInfo(file);
  const errors: string[] = [];

  // Validar tipo
  if (type === 'image' && !info.isImage) {
    errors.push('Arquivo deve ser uma imagem');
  } else if (type === 'video' && !info.isVideo) {
    errors.push('Arquivo deve ser um vídeo');
  }

  // Validar tamanho
  const maxSize = type === 'video' ? 100 * 1024 * 1024 : 10 * 1024 * 1024; // 100MB vídeo, 10MB imagem
  if (file.size > maxSize) {
    errors.push(`Arquivo muito grande. Máximo: ${formatFileSize(maxSize)}`);
  }

  // Validar formato
  const allowedImageTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
  ];
  const allowedVideoTypes = [
    'video/mp4',
    'video/webm',
    'video/ogg',
    'video/avi',
    'video/mov',
  ];

  if (type === 'image' && !allowedImageTypes.includes(file.type)) {
    errors.push('Formato de imagem não suportado. Use JPG, PNG ou WebP');
  } else if (type === 'video' && !allowedVideoTypes.includes(file.type)) {
    errors.push('Formato de vídeo não suportado. Use MP4, WebM ou OGG');
  }

  return {
    isValid: errors.length === 0,
    errors,
    info,
    suggestedDimensions: AD_DIMENSIONS[placement],
  };
}

/**
 * Criar preview de arquivo (cliente seguro)
 */
export function createFilePreview(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      if (e.target?.result) {
        resolve(e.target.result as string);
      } else {
        reject(new Error('Falha ao criar preview'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Erro ao ler arquivo'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Obter dimensões de uma imagem (cliente seguro)
 */
export function getImageDimensions(
  file: File
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
      URL.revokeObjectURL(img.src);
    };

    img.onerror = () => {
      reject(new Error('Falha ao carregar imagem'));
      URL.revokeObjectURL(img.src);
    };

    img.src = URL.createObjectURL(file);
  });
}

// Funções que só funcionam no servidor (evitam erros de importação)
export const serverOnlyFunctions = {
  // Essas funções são implementadas apenas nas API routes
  processImage: async () => {
    throw new Error('processImage só pode ser usado no servidor');
  },
  processVideo: async () => {
    throw new Error('processVideo só pode ser usado no servidor');
  },
  generateVideoThumbnail: async () => {
    throw new Error('generateVideoThumbnail só pode ser usado no servidor');
  },
  deleteMediaFile: async () => {
    throw new Error('deleteMediaFile só pode ser usado no servidor');
  },
  deleteAllMediaVersions: async () => {
    throw new Error('deleteAllMediaVersions só pode ser usado no servidor');
  },
  cloneAdMedia: async () => {
    throw new Error('cloneAdMedia só pode ser usado no servidor');
  },
};

// Re-export das funções server-only para compatibilidade
export const {
  processImage,
  processVideo,
  generateVideoThumbnail,
  deleteMediaFile,
  deleteAllMediaVersions,
  cloneAdMedia,
} = serverOnlyFunctions;
