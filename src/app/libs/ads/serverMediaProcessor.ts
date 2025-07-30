// app/libs/ads/serverMediaProcessor.ts - Processamento com pastas exclusivas por AD
import path from 'path';
import fs from 'fs/promises';

// Imports condicionais para evitar erros no cliente
let sharp: any;
let ffmpeg: any;

// Importar apenas no servidor
if (typeof window === 'undefined') {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    sharp = require('sharp');
  } catch (error) {
    console.warn('Sharp não disponível:', error);
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    ffmpeg = require('fluent-ffmpeg');
  } catch (error) {
    console.warn('FFmpeg não disponível:', error);
  }
}

import { AD_DIMENSIONS } from './mediaUtils';

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
 * Cria slug a partir do título + ID
 */
export function createAdSlug(title: string, id: string): string {
  const slug = title
    .toLowerCase()
    .normalize('NFD') // Remove acentos
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
    .replace(/\s+/g, '-') // Substitui espaços por hífens
    .replace(/-+/g, '-') // Remove hífens duplos
    .replace(/^-|-$/g, ''); // Remove hífens do início/fim

  return `${slug}-${id}`.substring(0, 100); // Limita a 100 caracteres
}

/**
 * Cria diretório exclusivo para o anúncio
 */
export async function createAdMediaDirectory(
  adTitle: string,
  adId: string
): Promise<string> {
  const slug = createAdSlug(adTitle, adId);
  const adDir = path.join(process.cwd(), 'public/uploads/ads', slug);

  try {
    await fs.mkdir(adDir, { recursive: true });
    console.log(`📁 Diretório criado: ${adDir}`);
    return adDir;
  } catch (error) {
    console.error('❌ Erro ao criar diretório:', error);
    throw error;
  }
}

/**
 * Obtém caminho do diretório do anúncio
 */
export function getAdMediaDirectory(adTitle: string, adId: string): string {
  const slug = createAdSlug(adTitle, adId);
  return path.join(process.cwd(), 'public/uploads/ads', slug);
}

/**
 * Obtém URL pública do diretório do anúncio
 */
export function getAdMediaPublicPath(adTitle: string, adId: string): string {
  const slug = createAdSlug(adTitle, adId);
  return `/uploads/ads/${slug}`;
}

/**
 * Processa imagem criando versões otimizadas para diferentes dispositivos
 */
export async function processImage(
  filePath: string,
  placement: keyof typeof AD_DIMENSIONS,
  adTitle: string,
  adId: string
): Promise<MediaVersions> {
  if (!sharp) {
    console.warn('Sharp não disponível, usando arquivo original');
    const publicPath = getAdMediaPublicPath(adTitle, adId);
    const originalUrl = `${publicPath}/${path.basename(filePath)}`;
    return { original: originalUrl };
  }

  try {
    const dimensions = AD_DIMENSIONS[placement];
    const adDir = await createAdMediaDirectory(adTitle, adId);
    const publicPath = getAdMediaPublicPath(adTitle, adId);
    const originalName = path.basename(filePath, path.extname(filePath));
    const ext = '.webp'; // Usar WebP para melhor compressão

    const versions: MediaVersions = {};

    // Carregar imagem original
    const originalImage = sharp(filePath);
    const metadata = await originalImage.metadata();

    console.log(
      `🖼️ Processando imagem: ${originalName}, dimensões originais: ${metadata.width}x${metadata.height}`
    );

    // Processar para cada dispositivo
    for (const [device, dims] of Object.entries(dimensions)) {
      const outputPath = path.join(adDir, `${originalName}_${device}${ext}`);
      const publicUrl = `${publicPath}/${path.basename(outputPath)}`;

      await originalImage
        .clone()
        .resize(dims.width, dims.height, {
          fit: 'cover', // Recorta mantendo proporção
          position: 'center',
          withoutEnlargement: false,
        })
        .webp({
          quality: device === 'mobile' ? 80 : 90,
          effort: 6,
          progressive: true,
        })
        .sharpen()
        .toFile(outputPath);

      versions[device as keyof MediaVersions] = publicUrl;
      console.log(`✅ Criada versão ${device}: ${dims.width}x${dims.height}`);
    }

    // Criar thumbnail pequeno adicional
    const thumbnailPath = path.join(adDir, `${originalName}_thumb${ext}`);
    const thumbnailUrl = `${publicPath}/${path.basename(thumbnailPath)}`;

    await originalImage
      .clone()
      .resize(150, 100, {
        fit: 'cover',
        position: 'center',
      })
      .webp({ quality: 75 })
      .toFile(thumbnailPath);

    versions.thumbnail = thumbnailUrl;

    // Manter original otimizado
    const processedOriginalPath = path.join(
      adDir,
      `${originalName}_original${ext}`
    );
    const originalUrl = `${publicPath}/${path.basename(processedOriginalPath)}`;

    await originalImage.webp({ quality: 95 }).toFile(processedOriginalPath);
    versions.original = originalUrl;

    console.log('✅ Processamento de imagem concluído');
    return versions;
  } catch (error) {
    console.error('❌ Erro ao processar imagem:', error);

    // Fallback: copiar arquivo original para pasta do ad
    try {
      const adDir = await createAdMediaDirectory(adTitle, adId);
      const publicPath = getAdMediaPublicPath(adTitle, adId);
      const filename = path.basename(filePath);
      const fallbackPath = path.join(adDir, filename);

      await fs.copyFile(filePath, fallbackPath);
      const originalUrl = `${publicPath}/${filename}`;
      return { original: originalUrl };
    } catch (fallbackError) {
      console.error('❌ Erro no fallback:', fallbackError);
      throw error;
    }
  }
}

/**
 * Processa vídeo criando versões otimizadas
 */
export async function processVideo(
  filePath: string,
  placement: keyof typeof AD_DIMENSIONS,
  adTitle: string,
  adId: string
): Promise<MediaVersions> {
  if (!ffmpeg) {
    console.warn('FFmpeg não disponível, usando arquivo original');
    try {
      const adDir = await createAdMediaDirectory(adTitle, adId);
      const publicPath = getAdMediaPublicPath(adTitle, adId);
      const filename = path.basename(filePath);
      const fallbackPath = path.join(adDir, filename);

      await fs.copyFile(filePath, fallbackPath);
      const originalUrl = `${publicPath}/${filename}`;
      return { original: originalUrl };
    } catch (error) {
      console.error('❌ Erro no fallback de vídeo:', error);
      throw error;
    }
  }

  return new Promise(async (resolve, reject) => {
    try {
      const dimensions = AD_DIMENSIONS[placement];
      const adDir = await createAdMediaDirectory(adTitle, adId);
      const publicPath = getAdMediaPublicPath(adTitle, adId);
      const originalName = path.basename(filePath, path.extname(filePath));

      const versions: MediaVersions = {};
      let processedCount = 0;
      const totalToProcess = Object.keys(dimensions).length;

      console.log(`🎥 Processando vídeo: ${originalName}`);

      // Processar para cada dispositivo
      Object.entries(dimensions).forEach(([device, dims]) => {
        const outputPath = path.join(adDir, `${originalName}_${device}.mp4`);
        const publicUrl = `${publicPath}/${path.basename(outputPath)}`;

        ffmpeg(filePath)
          .size(`${dims.width}x${dims.height}`)
          .videoCodec('libx264')
          .audioCodec('aac')
          .videoBitrate(device === 'mobile' ? '1000k' : '2000k')
          .audioBitrate('128k')
          .format('mp4')
          .addOptions([
            '-preset fast',
            '-crf 23',
            '-movflags +faststart',
            `-vf scale=${dims.width}:${dims.height}:force_original_aspect_ratio=increase,crop=${dims.width}:${dims.height}`,
          ])
          .on('start', (commandLine: unknown) => {
            console.log(`🎬 Iniciando processamento ${device}:`, commandLine);
          })
          .on('progress', (progress: any) => {
            if (progress?.percent) {
              console.log(
                `📊 Progresso ${device}: ${Math.round(progress.percent)}%`
              );
            }
          })
          .on('end', () => {
            console.log(
              `✅ Versão ${device} concluída: ${dims.width}x${dims.height}`
            );
            versions[device as keyof MediaVersions] = publicUrl;
            processedCount++;

            if (processedCount === totalToProcess) {
              // Criar thumbnail do vídeo
              generateVideoThumbnail(filePath, adTitle, adId)
                .then((thumbnailUrl) => {
                  versions.thumbnail = thumbnailUrl;

                  // Copiar original para pasta do ad
                  const originalName = path.basename(filePath);
                  const originalPath = path.join(adDir, originalName);
                  fs.copyFile(filePath, originalPath)
                    .then(() => {
                      versions.original = `${publicPath}/${originalName}`;
                      console.log('✅ Processamento de vídeo concluído');
                      resolve(versions);
                    })
                    .catch((error) => {
                      console.warn('⚠️ Erro ao copiar original:', error);
                      resolve(versions);
                    });
                })
                .catch((error) => {
                  console.warn(
                    '⚠️ Erro ao criar thumbnail, mas vídeo processado:',
                    error
                  );
                  // Copiar original mesmo sem thumbnail
                  const originalName = path.basename(filePath);
                  const originalPath = path.join(adDir, originalName);
                  fs.copyFile(filePath, originalPath)
                    .then(() => {
                      versions.original = `${publicPath}/${originalName}`;
                      resolve(versions);
                    })
                    .catch(() => {
                      resolve(versions);
                    });
                });
            }
          })
          .on('error', (error: unknown) => {
            console.error(`❌ Erro processando ${device}:`, error);
            reject(error);
          })
          .save(outputPath);
      });
    } catch (error) {
      console.error('❌ Erro ao processar vídeo:', error);
      reject(error);
    }
  });
}

/**
 * Gera thumbnail de vídeo
 */
export async function generateVideoThumbnail(
  videoPath: string,
  adTitle: string,
  adId: string
): Promise<string> {
  if (!ffmpeg || !sharp) {
    console.warn('FFmpeg ou Sharp não disponível para thumbnail');
    return '';
  }

  return new Promise(async (resolve, reject) => {
    try {
      const adDir = await createAdMediaDirectory(adTitle, adId);
      const publicPath = getAdMediaPublicPath(adTitle, adId);
      const originalName = path.basename(videoPath, path.extname(videoPath));
      const tempPath = path.join(adDir, `${originalName}_thumb_temp.png`);
      const thumbnailPath = path.join(adDir, `${originalName}_thumb.webp`);
      const publicUrl = `${publicPath}/${path.basename(thumbnailPath)}`;

      ffmpeg(videoPath)
        .screenshots({
          timestamps: ['10%'],
          filename: path.basename(tempPath),
          folder: adDir,
          size: '300x200',
        })
        .on('end', async () => {
          try {
            // Converter para WebP usando Sharp
            await sharp(tempPath).webp({ quality: 80 }).toFile(thumbnailPath);

            // Remover PNG temporário
            await fs.unlink(tempPath).catch(console.error);
            resolve(publicUrl);
          } catch (error) {
            console.error('❌ Erro ao converter thumbnail:', error);
            reject(error);
          }
        })
        .on('error', (error: unknown) => {
          console.error('❌ Erro ao gerar thumbnail:', error);
          reject(error);
        });
    } catch (error) {
      console.error('❌ Erro ao preparar thumbnail:', error);
      reject(error);
    }
  });
}

/**
 * Remove diretório completo de um anúncio
 */
export async function deleteAdMediaDirectory(
  adTitle: string,
  adId: string
): Promise<boolean> {
  try {
    const adDir = getAdMediaDirectory(adTitle, adId);

    // Verificar se diretório existe
    try {
      await fs.access(adDir);
    } catch {
      console.log(`📁 Diretório não existe: ${adDir}`);
      return true; // Não é erro se não existe
    }

    // Remover diretório recursivamente
    await fs.rm(adDir, { recursive: true, force: true });
    console.log(`🗑️ Diretório removido: ${adDir}`);
    return true;
  } catch (error) {
    console.error('❌ Erro ao deletar diretório:', error);
    return false;
  }
}

/**
 * Remove arquivo específico de mídia
 */
export async function deleteMediaFile(publicUrl: string): Promise<boolean> {
  if (!publicUrl || !publicUrl.startsWith('/uploads/ads/')) {
    return false;
  }

  try {
    const filePath = path.join(process.cwd(), 'public', publicUrl);
    await fs.unlink(filePath);
    console.log(`🗑️ Arquivo removido: ${publicUrl}`);
    return true;
  } catch (error) {
    console.error('❌ Erro ao deletar arquivo:', error);
    return false;
  }
}

/**
 * Remove todas as versões de uma mídia
 */
export async function deleteAllMediaVersions(
  versions: MediaVersions
): Promise<void> {
  if (!versions) return;

  const promises = Object.values(versions)
    .filter(Boolean)
    .map((url) => deleteMediaFile(url as string));

  const results = await Promise.allSettled(promises);

  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      console.error(`❌ Erro ao deletar versão ${index}:`, result.reason);
    }
  });
}

/**
 * Clona mídia para um novo anúncio
 */
export async function cloneAdMedia(
  originalAd: any,
  newAdTitle: string,
  newAdId: string
): Promise<ProcessedMedia> {
  try {
    const result: ProcessedMedia = {};

    console.log(`📋 Clonando mídia para anúncio ${newAdId}`);

    // Criar diretório para o novo ad
    const newAdDir = await createAdMediaDirectory(newAdTitle, newAdId);
    const newPublicPath = getAdMediaPublicPath(newAdTitle, newAdId);

    // Clonar versões de imagem
    if (
      originalAd.imageVersions &&
      typeof originalAd.imageVersions === 'object'
    ) {
      const imageVersions: MediaVersions = {};

      for (const [device, url] of Object.entries(originalAd.imageVersions)) {
        if (url && typeof url === 'string') {
          try {
            const originalPath = path.join(process.cwd(), 'public', url);
            const filename = path.basename(url);
            const newPath = path.join(newAdDir, filename);
            const newUrl = `${newPublicPath}/${filename}`;

            await fs.copyFile(originalPath, newPath);
            imageVersions[device as keyof MediaVersions] = newUrl;
            console.log(`✅ Imagem clonada: ${device}`);
          } catch (error) {
            console.error(`❌ Erro ao clonar imagem ${device}:`, error);
          }
        }
      }

      if (Object.keys(imageVersions).length > 0) {
        result.imageVersions = imageVersions;
        result.imageUrl = imageVersions.desktop || imageVersions.original;
      }
    }

    // Clonar versões de vídeo
    if (
      originalAd.videoVersions &&
      typeof originalAd.videoVersions === 'object'
    ) {
      const videoVersions: MediaVersions = {};

      for (const [device, url] of Object.entries(originalAd.videoVersions)) {
        if (url && typeof url === 'string') {
          try {
            const originalPath = path.join(process.cwd(), 'public', url);
            const filename = path.basename(url);
            const newPath = path.join(newAdDir, filename);
            const newUrl = `${newPublicPath}/${filename}`;

            await fs.copyFile(originalPath, newPath);
            videoVersions[device as keyof MediaVersions] = newUrl;
            console.log(`✅ Vídeo clonado: ${device}`);
          } catch (error) {
            console.error(`❌ Erro ao clonar vídeo ${device}:`, error);
          }
        }
      }

      if (Object.keys(videoVersions).length > 0) {
        result.videoVersions = videoVersions;
        result.videoUrl = videoVersions.desktop || videoVersions.original;
      }
    }

    // Clonar thumbnail
    if (originalAd.thumbnailUrl) {
      try {
        const originalPath = path.join(
          process.cwd(),
          'public',
          originalAd.thumbnailUrl
        );
        const filename = path.basename(originalAd.thumbnailUrl);
        const newPath = path.join(newAdDir, filename);
        const newUrl = `${newPublicPath}/${filename}`;

        await fs.copyFile(originalPath, newPath);
        result.thumbnailUrl = newUrl;
        console.log(`✅ Thumbnail clonado`);
      } catch (error) {
        console.error(`❌ Erro ao clonar thumbnail:`, error);
      }
    }

    console.log(`✅ Clonagem de mídia concluída para anúncio ${newAdId}`);
    return result;
  } catch (error) {
    console.error('❌ Erro ao clonar mídia:', error);
    return {};
  }
}

/**
 * Limpar arquivos temporários e órfãos
 */
export async function cleanupOldMedia(): Promise<void> {
  try {
    const uploadsDir = path.join(process.cwd(), 'public/uploads/ads');

    // Verificar se diretório existe
    try {
      await fs.access(uploadsDir);
    } catch {
      console.log('📁 Diretório de uploads não existe, criando...');
      await fs.mkdir(uploadsDir, { recursive: true });
      return;
    }

    const directories = await fs.readdir(uploadsDir, { withFileTypes: true });
    const adDirectories = directories.filter((dir) => dir.isDirectory());

    console.log(
      `🧹 Verificando ${adDirectories.length} diretórios de ads para limpeza`
    );

    // Aqui você pode implementar lógica para remover diretórios órfãos
    // Por exemplo, verificar se o ID do ad ainda existe no banco

    console.log('🧹 Limpeza de mídia concluída');
  } catch (error) {
    console.error('❌ Erro na limpeza de mídia:', error);
  }
}
