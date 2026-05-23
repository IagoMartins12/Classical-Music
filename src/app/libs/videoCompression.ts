// app/libs/videoCompression.ts
// Compressão de vídeo server-side usando fluent-ffmpeg
// Executado ANTES do upload para o Cloudinary

import ffmpeg from 'fluent-ffmpeg';
import { writeFile, unlink, mkdir, stat } from 'fs/promises';
import { existsSync } from 'fs';
import { tmpdir } from 'os';
import path from 'path';

// ─────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────

export interface CompressionOptions {
  /** Resolução máxima. Padrão: 1080 (1080p) */
  maxHeight?: 480 | 720 | 1080;
  /** Qualidade CRF: 18 (alta) → 28 (baixa). Padrão: 24 */
  crf?: number;
  /** Bitrate máximo de áudio em kbps. Padrão: 128 */
  audioBitrate?: number;
  /** Preset de velocidade do ffmpeg. Padrão: 'fast' */
  preset?:
    | 'ultrafast'
    | 'superfast'
    | 'veryfast'
    | 'faster'
    | 'fast'
    | 'medium';
}

export interface CompressionResult {
  success: boolean;
  /** Caminho do arquivo comprimido no disco temporário */
  outputPath?: string;
  /** Tamanho original em bytes */
  originalSize?: number;
  /** Tamanho após compressão em bytes */
  compressedSize?: number;
  /** Redução percentual (ex: 65.3) */
  reductionPercent?: number;
  /** Duração do vídeo em segundos */
  duration?: number;
  error?: string;
}

// ─────────────────────────────────────────────
// Helpers internos
// ─────────────────────────────────────────────

/** Salva um File/Blob em disco e retorna o caminho absoluto */
async function saveTempFile(file: File, suffix: string): Promise<string> {
  const dir = path.join(tmpdir(), 'opus-atlas-video');
  if (!existsSync(dir)) await mkdir(dir, { recursive: true });

  const filename = `input_${Date.now()}_${Math.random().toString(36).slice(2)}${suffix}`;
  const filePath = path.join(dir, filename);

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, buffer);
  return filePath;
}

/** Remove arquivo temporário silenciosamente */
async function cleanupFile(filePath: string): Promise<void> {
  try {
    if (existsSync(filePath)) await unlink(filePath);
  } catch {
    // Silencioso — não queremos que cleanup quebre o fluxo principal
  }
}

/** Retorna os metadados do vídeo via ffprobe */
function probeVideo(
  filePath: string
): Promise<{ duration: number; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) return reject(err);

      const videoStream = metadata.streams.find(
        (s) => s.codec_type === 'video'
      );
      resolve({
        duration: metadata.format.duration ?? 0,
        width: videoStream?.width ?? 0,
        height: videoStream?.height ?? 0,
      });
    });
  });
}

// ─────────────────────────────────────────────
// Função principal
// ─────────────────────────────────────────────

/**
 * Comprime um vídeo (File) usando ffmpeg e retorna o caminho do arquivo resultante.
 *
 * O arquivo de saída fica em /tmp e deve ser removido pelo chamador após o upload
 * via `cleanupCompressedVideo(result.outputPath)`.
 *
 * Fluxo recomendado:
 *   1. compressVideo(file)
 *   2. uploadToCloudinary(result.outputPath)
 *   3. cleanupCompressedVideo(result.outputPath)
 */
export async function compressVideo(
  file: File,
  options: CompressionOptions = {}
): Promise<CompressionResult> {
  const {
    maxHeight = 1080,
    crf = 24,
    audioBitrate = 128,
    preset = 'fast',
  } = options;

  const ext = path.extname(file.name).toLowerCase() || '.mp4';
  let inputPath: string | null = null;
  let outputPath: string | null = null;

  try {
    console.log(
      `🎥 [COMPRESS] Iniciando compressão: ${file.name} (${formatBytes(file.size)})`
    );

    // 1. Salvar arquivo de entrada no disco temporário
    inputPath = await saveTempFile(file, ext);
    const originalSize = file.size;

    // 2. Obter metadados do vídeo original
    let videoMeta = { duration: 0, width: 0, height: 0 };
    try {
      videoMeta = await probeVideo(inputPath);
      console.log(
        `📐 [COMPRESS] Dimensões originais: ${videoMeta.width}x${videoMeta.height}, duração: ${videoMeta.duration.toFixed(1)}s`
      );
    } catch (probeErr) {
      console.warn(
        '⚠️ [COMPRESS] ffprobe falhou, continuando sem metadados:',
        probeErr
      );
    }

    // 3. Decidir se precisa escalar
    const needsScale = videoMeta.height > maxHeight && videoMeta.height > 0;
    // Filtro de escala: mantém proporção, garante dimensões pares (exigência do H.264)
    const scaleFilter = needsScale
      ? `scale=-2:${maxHeight}`
      : 'scale=trunc(iw/2)*2:trunc(ih/2)*2'; // Apenas garante pares

    // 4. Definir caminho de saída (sempre .mp4)
    const dir = path.join(tmpdir(), 'opus-atlas-video');
    const outputFilename = `compressed_${Date.now()}_${Math.random().toString(36).slice(2)}.mp4`;
    outputPath = path.join(dir, outputFilename);

    // 5. Compressão com ffmpeg
    await new Promise<void>((resolve, reject) => {
      ffmpeg(inputPath!)
        .videoCodec('libx264')
        .audioCodec('aac')
        .addOption('-crf', String(crf))
        .addOption('-preset', preset)
        .addOption('-movflags', '+faststart') // Otimiza para streaming web
        .addOption('-vf', scaleFilter)
        .audioBitrate(`${audioBitrate}k`)
        .format('mp4')
        .on('start', (cmd) => {
          console.log(`⚙️  [COMPRESS] ffmpeg iniciado`, cmd);
          console.log(
            `    Escala: ${needsScale ? `→ altura máx ${maxHeight}px` : 'mantida'}`
          );
          console.log(
            `    CRF: ${crf} | Preset: ${preset} | Áudio: ${audioBitrate}kbps`
          );
        })
        .on('progress', (progress) => {
          if (progress.percent) {
            process.stdout.write(
              `\r⏳ [COMPRESS] ${Math.round(progress.percent)}%`
            );
          }
        })
        .on('end', () => {
          process.stdout.write('\n');
          resolve();
        })
        .on('error', (err) => {
          process.stdout.write('\n');
          reject(err);
        })
        .save(outputPath!);
    });

    // 6. Calcular redução
    const stats = await stat(outputPath);
    const compressedSize = stats.size;
    const reductionPercent =
      ((originalSize - compressedSize) / originalSize) * 100;

    console.log(`✅ [COMPRESS] Concluído:`);
    console.log(`   Original:    ${formatBytes(originalSize)}`);
    console.log(`   Comprimido:  ${formatBytes(compressedSize)}`);
    console.log(`   Redução:     ${reductionPercent.toFixed(1)}%`);

    return {
      success: true,
      outputPath,
      originalSize,
      compressedSize,
      reductionPercent,
      duration: videoMeta.duration,
    };
  } catch (error) {
    console.error('❌ [COMPRESS] Erro durante compressão:', error);

    // Limpar output parcial em caso de erro
    if (outputPath) await cleanupFile(outputPath);

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Erro desconhecido na compressão',
    };
  } finally {
    // Sempre limpar o arquivo de entrada
    if (inputPath) await cleanupFile(inputPath);
  }
}

/**
 * Remove o arquivo comprimido do disco temporário.
 * Deve ser chamado após o upload para o Cloudinary.
 */
export async function cleanupCompressedVideo(
  outputPath?: string
): Promise<void> {
  if (!outputPath) return;
  await cleanupFile(outputPath);
  console.log(
    `🗑️  [COMPRESS] Arquivo temporário removido: ${path.basename(outputPath)}`
  );
}

// ─────────────────────────────────────────────
// Configurações pré-definidas por contexto
// ─────────────────────────────────────────────

/**
 * Perfis de compressão prontos para uso.
 *
 * - `assignment`  → Submissão de tarefa pelo aluno. Qualidade equilibrada.
 * - `workMedia`   → Vídeo-aula de uma obra. Qualidade maior, pois é conteúdo educativo.
 * - `mobile`      → Vídeo gravado em celular. Compressão mais agressiva para economizar banda.
 */
export const CompressionProfiles: Record<string, CompressionOptions> = {
  assignment: {
    maxHeight: 1080,
    crf: 26,
    audioBitrate: 128,
    preset: 'fast',
  },
  workMedia: {
    maxHeight: 1080,
    crf: 22,
    audioBitrate: 192,
    preset: 'medium',
  },
  mobile: {
    maxHeight: 720,
    crf: 28,
    audioBitrate: 96,
    preset: 'fast',
  },
};

// ─────────────────────────────────────────────
// Utilitários exportados
// ─────────────────────────────────────────────

/** Verifica se um File é um vídeo pelo MIME type */
export function isVideoFile(file: File): boolean {
  return file.type.startsWith('video/');
}

/**
 * Decide automaticamente qual perfil usar com base no tamanho do arquivo.
 * - < 50 MB  → sem compressão (retorna null)
 * - 50–200 MB → perfil "assignment"
 * - > 200 MB  → perfil "mobile" (mais agressivo)
 */
export function selectCompressionProfile(
  fileSizeBytes: number,
  context: 'assignment' | 'workMedia' = 'assignment'
): CompressionOptions | null {
  const MB = 1024 * 1024;

  if (fileSizeBytes < 50 * MB) {
    console.log(
      `ℹ️  [COMPRESS] Arquivo pequeno (${formatBytes(fileSizeBytes)}), compressão ignorada`
    );
    return null;
  }

  if (fileSizeBytes > 200 * MB) {
    console.log(
      `ℹ️  [COMPRESS] Arquivo grande (${formatBytes(fileSizeBytes)}), usando perfil "mobile"`
    );
    return CompressionProfiles.mobile;
  }

  console.log(
    `ℹ️  [COMPRESS] Usando perfil "${context}" para ${formatBytes(fileSizeBytes)}`
  );
  return CompressionProfiles[context];
}

/** Formata bytes para string legível */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
