// utils/pdfUtils.ts - Funções para validar e extrair informações de PDFs

interface PDFInfo {
  isValid: boolean;
  fileSize?: string;
  pageCount?: number;
  title?: string;
  error?: string;
}

/**
 * Verifica se uma URL é um PDF válido e extrai informações básicas
 */
export async function validateAndExtractPDFInfo(url: string): Promise<PDFInfo> {
  try {
    console.log('🔍 Verificando PDF:', url);

    // Verificar se a URL tem extensão .pdf
    if (!url.toLowerCase().includes('.pdf')) {
      return {
        isValid: false,
        error: 'URL deve ser um arquivo PDF (.pdf)',
      };
    }

    // Fazer requisição HEAD para verificar se o arquivo existe e obter informações
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

    // Verificar Content-Type
    const contentType = response.headers.get('content-type');
    if (contentType && !contentType.includes('application/pdf')) {
      return {
        isValid: false,
        error: 'O arquivo não é um PDF válido',
      };
    }

    // Obter tamanho do arquivo
    const contentLength = response.headers.get('content-length');
    let fileSize: string | undefined;

    if (contentLength) {
      const bytes = parseInt(contentLength);
      fileSize = formatFileSize(bytes);
    }

    // Para obter o número de páginas, precisaríamos baixar e processar o PDF
    // Por enquanto, vamos fazer uma estimativa básica baseada no tamanho
    let estimatedPages: number | undefined;
    if (contentLength) {
      const bytes = parseInt(contentLength);
      // Estimativa: ~50KB por página (muito aproximado)
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
 * Valida se um arquivo uploadado é um PDF válido
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

    // Estimativa básica de páginas baseada no tamanho
    const estimatedPages = Math.max(1, Math.round(file.size / 51200));

    // Extrair título do nome do arquivo
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
  } catch (error) {
    console.log('error', error)
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
