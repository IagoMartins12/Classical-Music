// app/utils/assignmentVideoUpload.ts - Utilitário para upload de vídeos em assignments

import { writeFile, unlink, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

export interface VideoUploadResult {
  success: boolean;
  filename?: string;
  originalName?: string;
  filePath?: string;
  fileSize?: number;
  mimeType?: string;
  error?: string;
}

export interface VideoSubmission {
  filename: string;
  originalName: string;
  filePath: string;
  fileSize: number;
  uploadedAt: string;
  mimeType: string;
}

/**
 * 🎥 Upload de vídeo para assignment específico
 */
export async function uploadAssignmentVideo(
  assignmentId: string,
  file: File
): Promise<VideoUploadResult> {
  try {
    console.log(
      `🎥 [ASSIGNMENT-VIDEO] Iniciando upload para assignment ${assignmentId}`
    );

    // 1. Validações básicas
    if (!file) {
      return { success: false, error: 'Nenhum arquivo enviado' };
    }

    // 2. Validar tipo de arquivo
    const allowedTypes = [
      'video/mp4',
      'video/webm',
      'video/mov',
      'video/quicktime',
    ];
    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        error: 'Formato não suportado. Use MP4, WebM ou MOV',
      };
    }

    // 3. Validar tamanho (100MB = 104857600 bytes)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      return {
        success: false,
        error: 'Arquivo muito grande. Máximo 100MB permitido',
      };
    }

    // 4. Criar diretório se não existir
    const uploadDir = path.join(
      process.cwd(),
      'public',
      'uploads',
      'assignments',
      assignmentId,
      'videos'
    );

    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
      console.log(`📁 [ASSIGNMENT-VIDEO] Diretório criado: ${uploadDir}`);
    }

    // 5. Gerar nome único para o arquivo
    const timestamp = Date.now();
    const fileExtension = path.extname(file.name);
    const filename = `assignment_${assignmentId}_video_${timestamp}${fileExtension}`;
    const fullPath = path.join(uploadDir, filename);
    const relativePath = `/uploads/assignments/${assignmentId}/videos/${filename}`;

    // 6. Converter File para Buffer e salvar
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    await writeFile(fullPath, buffer);

    console.log(`✅ [ASSIGNMENT-VIDEO] Vídeo salvo: ${relativePath}`);

    return {
      success: true,
      filename,
      originalName: file.name,
      filePath: relativePath,
      fileSize: file.size,
      mimeType: file.type,
    };
  } catch (error) {
    console.error('❌ [ASSIGNMENT-VIDEO] Erro no upload:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno no upload',
    };
  }
}

/**
 * 🗑️ Deletar vídeo anterior do assignment
 */
export async function deleteAssignmentVideo(
  filePath: string
): Promise<boolean> {
  try {
    if (!filePath) return true;

    // Converter path relativo para absoluto
    const fullPath = path.join(process.cwd(), 'public', filePath);

    if (existsSync(fullPath)) {
      await unlink(fullPath);
      console.log(`🗑️ [ASSIGNMENT-VIDEO] Vídeo anterior deletado: ${filePath}`);
      return true;
    }

    return true; // Se não existe, considera sucesso
  } catch (error) {
    console.error('❌ [ASSIGNMENT-VIDEO] Erro ao deletar vídeo:', error);
    return false; // Não falhar a operação principal por causa disso
  }
}

/**
 * 📋 Extrair submission de vídeo do campo JSON
 */
export function extractVideoSubmission(
  submissions: any
): VideoSubmission | null {
  try {
    if (!submissions || typeof submissions !== 'object') {
      return null;
    }

    return submissions.videoSubmission || null;
  } catch (error) {
    console.error('❌ [ASSIGNMENT-VIDEO] Erro ao extrair submission:', error);
    return null;
  }
}

/**
 * 💾 Criar objeto de submission para salvar no banco
 */
export function createVideoSubmission(
  uploadResult: VideoUploadResult
): VideoSubmission {
  return {
    filename: uploadResult.filename!,
    originalName: uploadResult.originalName!,
    filePath: uploadResult.filePath!,
    fileSize: uploadResult.fileSize!,
    uploadedAt: new Date().toISOString(),
    mimeType: uploadResult.mimeType!,
  };
}

/**
 * 🔄 Atualizar submissions mantendo outros dados
 */
export function updateSubmissionsWithVideo(
  currentSubmissions: any,
  videoSubmission: VideoSubmission
): any {
  const submissions = currentSubmissions || {};

  return {
    ...submissions,
    videoSubmission,
  };
}

/**
 * 📏 Formatar tamanho de arquivo para exibição
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * ⏱️ Validar se o arquivo de vídeo ainda existe
 */
export function validateVideoFile(filePath: string): boolean {
  try {
    if (!filePath) return false;

    const fullPath = path.join(process.cwd(), 'public', filePath);
    return existsSync(fullPath);
  } catch (error) {
    console.error('❌ [ASSIGNMENT-VIDEO] Erro ao validar arquivo:', error);
    return false;
  }
}
