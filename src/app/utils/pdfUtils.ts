// app/utils/pdfUtils.ts - VERSÃO MELHORADA
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
 * Gera thumbnail de PDF e faz upload - VERSÃO COMPLETA
 */
export async function generateAndUploadPDFThumbnail(
  file: File
): Promise<ThumbnailResult> {
  try {
    console.log('🖼️ Iniciando geração e upload de thumbnail para:', file.name);

    // Verificar se é PDF
    if (file.type !== 'application/pdf') {
      return {
        success: false,
        error: 'Arquivo não é PDF',
      };
    }

    // Verificar se está no cliente
    if (typeof window === 'undefined') {
      return {
        success: false,
        error: 'Função só funciona no cliente',
      };
    }

    // Gerar thumbnail
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

    // Criar nome para o thumbnail
    const thumbnailName = file.name.replace('.pdf', '-thumbnail.jpg');

    // Fazer upload do thumbnail
    const formData = new FormData();
    formData.append('file', blob, thumbnailName);
    formData.append('type', 'image');

    const uploadResponse = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!uploadResponse.ok) {
      throw new Error('Erro no upload do thumbnail');
    }

    const uploadData = await uploadResponse.json();

    console.log('✅ Thumbnail gerado e enviado com sucesso:', uploadData.url);

    return {
      success: true,
      thumbnailUrl: uploadData.url,
    };
  } catch (error) {
    console.error('❌ Erro ao gerar e fazer upload do thumbnail:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    };
  }
}

/**
 * Gera thumbnail usando Canvas API nativa - VERSÃO ROBUSTA
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

    // Tentar usar PDF.js
    try {
      return await generateWithPDFJS(file);
    } catch (pdfError) {
      console.warn('⚠️ PDF.js falhou, gerando placeholder:', pdfError);
      return await generatePlaceholder(file);
    }
  } catch (error) {
    console.error('❌ Erro geral ao gerar thumbnail:', error);
    return null;
  }
}

/**
 * Método principal com PDF.js - VERSÃO APRIMORADA
 */
async function generateWithPDFJS(file: File): Promise<string | null> {
  // Importar PDF.js dinamicamente
  const pdfjsLib = await import('pdfjs-dist');

  // Configurar worker
  const workerUrl = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;
  pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

  console.log('🔧 PDF.js configurado:', pdfjsLib.version);

  // Converter arquivo para ArrayBuffer
  const arrayBuffer = await file.arrayBuffer();

  // Carregar PDF com configurações robustas
  const loadingTask = pdfjsLib.getDocument({
    data: arrayBuffer,
    verbosity: 0,
    isEvalSupported: false,
    disableFontFace: true,
    useSystemFonts: true,
    standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/standard_fonts/`,
  });

  const pdf = await loadingTask.promise;
  console.log(`📄 PDF carregado: ${pdf.numPages} páginas`);

  // Obter primeira página
  const page = await pdf.getPage(1);

  // Configurar viewport para thumbnail de qualidade
  const viewport = page.getViewport({ scale: 1 });

  // Calcular escala para thumbnail de 200px de largura (boa qualidade)
  const targetWidth = 200;
  const scale = targetWidth / viewport.width;
  const scaledViewport = page.getViewport({ scale });

  // Criar canvas
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Contexto canvas não disponível');
  }

  canvas.width = scaledViewport.width;
  canvas.height = scaledViewport.height;

  // Configurar contexto para melhor qualidade
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';

  // Renderizar página
  const renderContext = {
    canvasContext: context,
    viewport: scaledViewport,
    background: 'white', // Fundo branco para melhor contraste
  };

  await page.render(renderContext).promise;

  console.log(`✅ Thumbnail renderizado: ${canvas.width}x${canvas.height}`);

  // Converter para JPEG com boa qualidade
  return canvas.toDataURL('image/jpeg', 0.85);
}

/**
 * Método placeholder melhorado
 */
async function generatePlaceholder(file: File): Promise<string | null> {
  console.log('📋 Gerando placeholder para:', file.name);

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) return null;

  canvas.width = 200;
  canvas.height = 260; // Proporção mais próxima de uma página

  // Background branco
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Border
  ctx.strokeStyle = '#e5e7eb';
  ctx.lineWidth = 2;
  ctx.strokeRect(0, 0, canvas.width, canvas.height);

  // Ícone PDF estilizado
  ctx.fillStyle = '#dc2626';
  ctx.font = 'bold 24px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('PDF', canvas.width / 2, canvas.height / 2 - 20);

  // Nome do arquivo
  ctx.fillStyle = '#6b7280';
  ctx.font = '12px Arial';
  const fileName =
    file.name.length > 25 ? file.name.substring(0, 22) + '...' : file.name;
  ctx.fillText(fileName, canvas.width / 2, canvas.height / 2 + 10);

  // Tamanho do arquivo
  const fileSize = formatFileSize(file.size);
  ctx.fillStyle = '#9ca3af';
  ctx.font = '10px Arial';
  ctx.fillText(fileSize, canvas.width / 2, canvas.height / 2 + 30);

  return canvas.toDataURL('image/png');
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
    console.log('error', error);
    return '';
  }
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
