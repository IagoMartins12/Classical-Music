// app/utils/pdfUtils.ts - VERSÃO COM PDF.js FUNCIONANDO
interface PDFInfo {
  isValid: boolean;
  fileSize?: string;
  pageCount?: number;
  title?: string;
  error?: string;
}

interface ThumbnailResult {
  success: boolean;
  thumbnailUrl?: string;
  tempThumbnailPath?: string; // 🆕 Caminho temporário
  error?: string;
}

/**
 * Verifica se uma URL é um PDF válido e extrai informações básicas
 */
export async function validateAndExtractPDFInfo(url: string): Promise<PDFInfo> {
  try {
    console.log('🔍 Verificando PDF:', url);

    if (!url.toLowerCase().includes('.pdf')) {
      return {
        isValid: false,
        error: 'URL deve ser um arquivo PDF (.pdf)',
      };
    }

    const response = await fetch(url, {
      method: 'HEAD',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      return {
        isValid: false,
        error: `Erro ao acessar o arquivo: ${response.status} ${response.statusText}`,
      };
    }

    const contentType = response.headers.get('content-type');
    if (contentType && !contentType.includes('application/pdf')) {
      return {
        isValid: false,
        error: 'O arquivo não é um PDF válido',
      };
    }

    const contentLength = response.headers.get('content-length');
    let fileSize: string | undefined;
    let estimatedPages: number | undefined;

    if (contentLength) {
      const bytes = parseInt(contentLength);
      fileSize = formatFileSize(bytes);
      estimatedPages = Math.max(1, Math.round(bytes / 51200));
    }

    console.log('✅ PDF válido:', { fileSize, estimatedPages });

    return {
      isValid: true,
      fileSize,
      pageCount: estimatedPages,
      title: extractTitleFromUrl(url),
    };
  } catch (error) {
    console.error('❌ Erro ao verificar PDF:', error);
    return {
      isValid: false,
      error: 'Erro ao verificar o arquivo PDF',
    };
  }
}

/**
 * 🆕 Gera thumbnail PROVISÓRIA e faz upload para pasta temporária
 */
export async function generateAndUploadTempThumbnail(
  file: File,
  userId: string
): Promise<ThumbnailResult> {
  try {
    console.log('🖼️ Gerando thumbnail provisória para:', file.name);

    // Verificar se é PDF
    if (file.type !== 'application/pdf') {
      return {
        success: false,
        error: 'Arquivo não é PDF',
      };
    }

    // Informar sobre PDF grande
    if (file.size > 10 * 1024 * 1024) {
      // 10MB
      console.log('📄 PDF grande detectado - processo pode ser mais lento');
    }

    // Gerar thumbnail
    const thumbnailDataUrl = await generatePDFThumbnail(file);

    if (!thumbnailDataUrl) {
      console.warn('⚠️ Não foi possível gerar preview - usando fallback');
      return {
        success: false,
        error: 'Não foi possível gerar thumbnail - usando placeholder',
      };
    }

    // Converter DataURL para Blob
    const response = await fetch(thumbnailDataUrl);
    const blob = await response.blob();

    // 🆕 Nome temporário único
    const tempId = generateTempId();
    const thumbnailName = `temp-${tempId}-thumb.png`;

    // 🆕 Upload para pasta temporária do usuário
    const formData = new FormData();
    formData.append('file', blob, thumbnailName);
    formData.append('type', 'score-temp');
    formData.append('userId', userId);
    formData.append('tempId', tempId);

    const uploadResponse = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!uploadResponse.ok) {
      throw new Error('Erro no upload do thumbnail provisório');
    }

    const uploadData = await uploadResponse.json();

    console.log('✅ Thumbnail provisória gerada:', uploadData.url);

    return {
      success: true,
      thumbnailUrl: uploadData.url,
      tempThumbnailPath: uploadData.tempPath, // Caminho temporário para mover depois
    };
  } catch (error) {
    console.error('❌ Erro ao gerar thumbnail provisória:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    };
  }
}

/**
 * 🆕 Gera thumbnail DEFINITIVA para pasta final da obra
 */
export async function generateAndUploadFinalThumbnail(
  file: File,
  workTitle: string,
  year: number,
  month: number
): Promise<ThumbnailResult> {
  try {
    console.log('🖼️ Gerando thumbnail definitiva para:', workTitle);

    const thumbnailDataUrl = await generatePDFThumbnail(file);

    if (!thumbnailDataUrl) {
      return {
        success: false,
        error: 'Não foi possível gerar thumbnail',
      };
    }

    // Converter DataURL para Blob
    const response = await fetch(thumbnailDataUrl);
    const blob = await response.blob();

    // Nome da obra limpo para usar como pasta
    const cleanWorkTitle = sanitizeWorkTitle(workTitle);
    const thumbnailName = `${cleanWorkTitle}-thumb.png`;

    // Upload para pasta definitiva
    const formData = new FormData();
    formData.append('file', blob, thumbnailName);
    formData.append('type', 'score-final');
    formData.append('workTitle', cleanWorkTitle);
    formData.append('year', year.toString());
    formData.append('month', month.toString().padStart(2, '0'));

    const uploadResponse = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!uploadResponse.ok) {
      throw new Error('Erro no upload do thumbnail definitivo');
    }

    const uploadData = await uploadResponse.json();

    console.log('✅ Thumbnail definitiva gerada:', uploadData.url);

    return {
      success: true,
      thumbnailUrl: uploadData.url,
    };
  } catch (error) {
    console.error('❌ Erro ao gerar thumbnail definitiva:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    };
  }
}

/**
 * 🆕 Gera thumbnail usando PDF.js - VERSÃO FUNCIONANDO
 */
export async function generatePDFThumbnail(file: File): Promise<string | null> {
  try {
    console.log('🖼️ Gerando thumbnail do PDF:', file.name);

    // Verificar se é PDF
    if (file.type !== 'application/pdf') {
      console.warn('❌ Arquivo não é PDF');
      return null;
    }

    // Verificar se está no cliente
    if (typeof window === 'undefined') {
      console.warn('❌ Função só funciona no cliente');
      return null;
    }

    // 🆕 Tentar importar PDF.js dinamicamente
    let pdfjsLib: any;
    try {
      // Tentar importar PDF.js
      pdfjsLib = await import('pdfjs-dist');

      // Configurar worker
      if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
        pdfjsLib.GlobalWorkerOptions.workerSrc =
          'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      }
    } catch (pdfError) {
      console.warn('⚠️ PDF.js não disponível, usando fallback:', pdfError);
      return await generatePlaceholder(file);
    }

    try {
      // Converter arquivo para ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();

      // Carregar PDF
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      console.log(`📄 PDF carregado: ${pdf.numPages} páginas`);

      // Pegar primeira página
      const page = await pdf.getPage(1);

      // Configurar viewport
      const viewport = page.getViewport({ scale: 1.5 }); // Escala para qualidade

      // Criar canvas
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      if (!context) {
        throw new Error('Não foi possível criar contexto do canvas');
      }

      // Ajustar tamanho do canvas
      canvas.width = Math.min(viewport.width, 400); // Máximo 400px de largura
      canvas.height = Math.min(viewport.height, 520); // Máximo 520px de altura

      // Escalar proporcionalmente
      const scaleX = canvas.width / viewport.width;
      const scaleY = canvas.height / viewport.height;
      const scale = Math.min(scaleX, scaleY);

      canvas.width = viewport.width * scale;
      canvas.height = viewport.height * scale;

      // Renderizar página
      const renderContext = {
        canvasContext: context,
        viewport: page.getViewport({ scale }),
      };

      await page.render(renderContext).promise;

      console.log('✅ Thumbnail gerada com PDF.js');
      return canvas.toDataURL('image/png', 0.8); // Qualidade 80%
    } catch (renderError) {
      console.warn('⚠️ Erro ao renderizar PDF, usando fallback:', renderError);
      return await generatePlaceholder(file);
    }
  } catch (error) {
    console.error('❌ Erro geral ao gerar thumbnail:', error);
    return await generatePlaceholder(file);
  }
}

/**
 * Gera placeholder melhorado quando PDF.js falha
 */
async function generatePlaceholder(file: File): Promise<string | null> {
  console.log('📋 Gerando placeholder para:', file.name);

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) return null;

  canvas.width = 300;
  canvas.height = 400;

  // Background branco
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Border
  ctx.strokeStyle = '#e5e7eb';
  ctx.lineWidth = 2;
  ctx.strokeRect(0, 0, canvas.width, canvas.height);

  // Ícone PDF estilizado
  ctx.fillStyle = '#dc2626';
  ctx.font = 'bold 36px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('PDF', canvas.width / 2, canvas.height / 2 - 40);

  // Nome do arquivo
  ctx.fillStyle = '#374151';
  ctx.font = '16px Arial';
  const fileName =
    file.name.length > 30 ? file.name.substring(0, 27) + '...' : file.name;
  ctx.fillText(fileName, canvas.width / 2, canvas.height / 2 + 10);

  // Tamanho do arquivo
  const fileSize = formatFileSize(file.size);
  ctx.fillStyle = '#6b7280';
  ctx.font = '14px Arial';
  ctx.fillText(fileSize, canvas.width / 2, canvas.height / 2 + 40);

  // Aviso de placeholder
  ctx.fillStyle = '#f59e0b';
  ctx.font = '12px Arial';
  ctx.fillText(
    'Preview não disponível',
    canvas.width / 2,
    canvas.height / 2 + 70
  );

  return canvas.toDataURL('image/png');
}

/**
 * 🆕 Gera ID temporário único
 */
function generateTempId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 🆕 Limpa título da obra para usar como nome de pasta
 */
export function sanitizeWorkTitle(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD') // Decomposer acentos
    .replace(/[\u0300-\u036f]/g, '') // Remover acentos
    .replace(/[^a-z0-9\s-]/g, '') // Apenas letras, números, espaços e hífens
    .replace(/\s+/g, '-') // Espaços viram hífens
    .replace(/-+/g, '-') // Múltiplos hífens viram um
    .replace(/^-|-$/g, '') // Remover hífens do início/fim
    .substring(0, 50); // Máximo 50 caracteres
}

/**
 * Valida se um arquivo uploadado é válido
 */
export async function validateUploadedFile(file: File): Promise<PDFInfo> {
  try {
    console.log('🔍 Verificando arquivo uploadado:', file.name);

    // Verificar tipo MIME
    if (file.type !== 'application/pdf') {
      return {
        isValid: false,
        error: 'O arquivo deve ser um PDF',
      };
    }

    // Verificar extensão
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      return {
        isValid: false,
        error: 'O arquivo deve ter extensão .pdf',
      };
    }

    // Verificar tamanho (máximo 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return {
        isValid: false,
        error: 'O arquivo é muito grande. Máximo permitido: 50MB',
      };
    }

    // Verificar se o arquivo não está vazio
    if (file.size === 0) {
      return {
        isValid: false,
        error: 'O arquivo está vazio',
      };
    }

    const fileSize = formatFileSize(file.size);
    const estimatedPages = Math.max(1, Math.round(file.size / 51200));
    const title = extractTitleFromUrl(file.name);

    console.log('✅ Arquivo PDF válido:', { fileSize, estimatedPages, title });

    return {
      isValid: true,
      fileSize,
      pageCount: estimatedPages,
      title,
    };
  } catch (error) {
    console.error('❌ Erro ao verificar arquivo:', error);
    return {
      isValid: false,
      error: 'Erro ao processar o arquivo',
    };
  }
}

/**
 * Formata o tamanho do arquivo em bytes para uma string legível
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Extrai um título provável do nome do arquivo na URL
 */
function extractTitleFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const filename = pathname.split('/').pop() || '';

    // Remove extensão .pdf
    const title = filename.replace(/\.pdf$/i, '');

    // Decodifica caracteres especiais
    const decoded = decodeURIComponent(title);

    // Substitui underscores e hífens por espaços
    const cleaned = decoded.replace(/[_-]/g, ' ');

    // Capitaliza primeira letra de cada palavra
    const capitalized = cleaned.replace(/\b\w/g, (char) => char.toUpperCase());

    return capitalized.trim();
  } catch (error) {
    return '';
  }
}

/**
 * Detecta se uma string é uma URL válida
 */
export function isValidUrl(string: string): boolean {
  try {
    new URL(string);
    return true;
  } catch {
    return false;
  }
}

/**
 * Detecta se uma URL é provavelmente um PDF
 */
export function isProbablyPDF(url: string): boolean {
  if (!isValidUrl(url)) return false;
  const urlLower = url.toLowerCase();
  return urlLower.includes('.pdf') || urlLower.includes('pdf');
}
