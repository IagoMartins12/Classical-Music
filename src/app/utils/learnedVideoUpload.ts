// utils/learnedVideoUpload.ts - CORRIGIDO
import fs from 'fs';
import path from 'path';

// Tipos
export interface LearnedVideoUploadResult {
  success: boolean;
  error?: string;
  filePath?: string;
  filename?: string;
  fileSize?: number;
  publicUrl?: string;
}

export interface LearnedVideoData {
  filePath: string;
  filename: string;
  originalName: string;
  fileSize: number;
  uploadedAt: string;
  isPublic: boolean;
}

// Configurações
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const ALLOWED_TYPES = [
  'video/mp4',
  'video/webm',
  'video/mov',
  'video/quicktime',
];

// ✅ CORREÇÃO: Usar caminho absoluto baseado no processo atual
const UPLOAD_BASE_DIR = path.join(process.cwd(), 'public', 'uploads', 'works');

// Função para garantir que o diretório existe
function ensureDirectoryExists(dirPath: string): void {
  console.log(`🗂️ [LEARNED-VIDEO] Verificando diretório: ${dirPath}`);

  if (!fs.existsSync(dirPath)) {
    console.log(`🗂️ [LEARNED-VIDEO] Criando diretório: ${dirPath}`);
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`✅ [LEARNED-VIDEO] Diretório criado com sucesso`);
  } else {
    console.log(`✅ [LEARNED-VIDEO] Diretório já existe`);
  }

  // Verificar permissões
  try {
    fs.accessSync(dirPath, fs.constants.W_OK);
    console.log(`✅ [LEARNED-VIDEO] Diretório tem permissão de escrita`);
  } catch (error) {
    console.error(
      `❌ [LEARNED-VIDEO] Diretório sem permissão de escrita:`,
      error
    );
  }
}

// Função para gerar nome único do arquivo
function generateUniqueFilename(originalName: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const extension = path.extname(originalName);
  const baseName = path
    .basename(originalName, extension)
    .replace(/[^a-zA-Z0-9]/g, '_')
    .substring(0, 50); // Limitar tamanho do nome

  return `${baseName}_${timestamp}_${random}${extension}`;
}

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

// Upload do vídeo do learned item
export async function uploadLearnedVideo(
  workId: string,
  learnedItemId: string,
  videoFile: File
): Promise<LearnedVideoUploadResult> {
  try {
    console.log(
      `🎥 [LEARNED-VIDEO] Iniciando upload para work ${workId}, learned ${learnedItemId}`
    );
    console.log(
      `🎥 [LEARNED-VIDEO] Arquivo: ${videoFile.name}, Tamanho: ${videoFile.size} bytes`
    );

    // Validar arquivo
    const validation = validateVideoFile(videoFile);
    if (!validation.isValid) {
      console.error(`❌ [LEARNED-VIDEO] Validação falhou: ${validation.error}`);
      return {
        success: false,
        error: validation.error,
      };
    }

    // ✅ CORREÇÃO: Estrutura de diretórios mais clara
    const workDir = path.join(
      UPLOAD_BASE_DIR,
      workId,
      'learned',
      learnedItemId
    );
    console.log(`🗂️ [LEARNED-VIDEO] Diretório de destino: ${workDir}`);

    // Garantir que o diretório base existe
    ensureDirectoryExists(UPLOAD_BASE_DIR);
    ensureDirectoryExists(workDir);

    // Gerar nome único
    const filename = generateUniqueFilename(videoFile.name);
    const filePath = path.join(workDir, filename);
    console.log(`📁 [LEARNED-VIDEO] Caminho completo: ${filePath}`);

    // ✅ CORREÇÃO: Melhor tratamento do buffer
    console.log(`💾 [LEARNED-VIDEO] Convertendo arquivo para buffer...`);
    const arrayBuffer = await videoFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    console.log(`💾 [LEARNED-VIDEO] Buffer criado: ${buffer.length} bytes`);

    // Salvar arquivo
    console.log(`💾 [LEARNED-VIDEO] Salvando arquivo...`);
    fs.writeFileSync(filePath, buffer);
    console.log(`✅ [LEARNED-VIDEO] Arquivo salvo com sucesso!`);

    // Verificar se o arquivo foi realmente salvo
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      console.log(
        `✅ [LEARNED-VIDEO] Arquivo verificado - Tamanho: ${stats.size} bytes`
      );
    } else {
      console.error(
        `❌ [LEARNED-VIDEO] Arquivo não encontrado após salvamento!`
      );
      return {
        success: false,
        error: 'Arquivo não foi salvo corretamente',
      };
    }

    // ✅ CORREÇÃO: URL pública relativa ao public
    const publicUrl = `/uploads/works/${workId}/learned/${learnedItemId}/${filename}`;
    console.log(`🌐 [LEARNED-VIDEO] URL pública: ${publicUrl}`);

    console.log(`✅ [LEARNED-VIDEO] Upload concluído: ${filename}`);

    return {
      success: true,
      filePath,
      filename,
      fileSize: videoFile.size,
      publicUrl,
    };
  } catch (error) {
    console.error('❌ [LEARNED-VIDEO] Erro no upload:', error);
    return {
      success: false,
      error: `Erro interno no upload do vídeo: ${
        error instanceof Error ? error.message : 'Erro desconhecido'
      }`,
    };
  }
}

// Deletar vídeo do learned item
export async function deleteLearnedVideo(filePath: string): Promise<boolean> {
  try {
    console.log(`🗑️ [LEARNED-VIDEO] Tentando deletar: ${filePath}`);

    // ✅ CORREÇÃO: Verificar se o caminho é absoluto ou relativo
    let absoluteFilePath: string;

    if (path.isAbsolute(filePath)) {
      absoluteFilePath = filePath;
    } else {
      // Se for relativo, considerar a partir do diretório do projeto
      absoluteFilePath = path.join(
        process.cwd(),
        'public',
        filePath.replace(/^\/uploads\/works\//, 'uploads/works/')
      );
    }

    console.log(`🗑️ [LEARNED-VIDEO] Caminho absoluto: ${absoluteFilePath}`);

    if (fs.existsSync(absoluteFilePath)) {
      fs.unlinkSync(absoluteFilePath);
      console.log(`🗑️ [LEARNED-VIDEO] Vídeo deletado: ${filePath}`);

      // Tentar remover diretório pai se vazio
      const dirPath = path.dirname(absoluteFilePath);
      try {
        const files = fs.readdirSync(dirPath);
        if (files.length === 0) {
          fs.rmdirSync(dirPath);
          console.log(`🗑️ [LEARNED-VIDEO] Diretório removido: ${dirPath}`);
        }
      } catch (dirError) {
        console.log(
          `⚠️ [LEARNED-VIDEO] Não foi possível remover diretório: ${dirPath}`
        );
      }

      return true;
    }

    console.log(`⚠️ [LEARNED-VIDEO] Arquivo não existe: ${absoluteFilePath}`);
    return true; // Considerar sucesso se arquivo já não existe
  } catch (error) {
    console.error('❌ [LEARNED-VIDEO] Erro ao deletar vídeo:', error);
    return false;
  }
}

// Deletar todos os vídeos de um learned item
export async function deleteAllLearnedVideos(
  workId: string,
  learnedItemId: string
): Promise<boolean> {
  try {
    const learnedDir = path.join(
      UPLOAD_BASE_DIR,
      workId,
      'learned',
      learnedItemId
    );
    console.log(`🗑️ [LEARNED-VIDEO] Deletando diretório: ${learnedDir}`);

    if (fs.existsSync(learnedDir)) {
      // Remover todos os arquivos do diretório
      const files = fs.readdirSync(learnedDir);
      console.log(`🗑️ [LEARNED-VIDEO] Arquivos encontrados: ${files.length}`);

      for (const file of files) {
        const filePath = path.join(learnedDir, file);
        fs.unlinkSync(filePath);
        console.log(`🗑️ [LEARNED-VIDEO] Arquivo removido: ${file}`);
      }

      // Remover o diretório
      fs.rmdirSync(learnedDir);
      console.log(
        `🗑️ [LEARNED-VIDEO] Todos os vídeos do learned ${learnedItemId} removidos`
      );

      return true;
    }

    console.log(`⚠️ [LEARNED-VIDEO] Diretório não existe: ${learnedDir}`);
    return true; // Sucesso se diretório não existe
  } catch (error) {
    console.error(
      '❌ [LEARNED-VIDEO] Erro ao deletar vídeos do learned item:',
      error
    );
    return false;
  }
}

// Extrair dados do vídeo das submissões
export function extractLearnedVideoData(learned: any): LearnedVideoData | null {
  if (!learned.videoUrl || !learned.videoFileName) {
    return null;
  }

  return {
    filePath: learned.videoFilePath || learned.videoUrl,
    filename: learned.videoFileName,
    originalName: learned.videoFileName,
    fileSize: learned.videoFileSize || 0,
    uploadedAt: learned.videoUploadedAt || learned.updatedAt,
    isPublic: learned.isVideoPublic || false,
  };
}

// Criar dados de vídeo para salvar
export function createLearnedVideoData(
  uploadResult: LearnedVideoUploadResult,
  isPublic: boolean
): any {
  if (!uploadResult.success) return null;

  return {
    videoUrl: uploadResult.publicUrl,
    videoFileName: uploadResult.filename,
    videoFilePath: uploadResult.filePath,
    videoFileSize: uploadResult.fileSize,
    isVideoPublic: isPublic,
    videoUploadedAt: new Date(),
  };
}
