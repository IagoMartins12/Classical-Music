// app/utils/pdfUtils.ts - VERSÃO ATUALIZADA PARA ACEITAR IMAGENS
interface FileInfo {
  isValid: boolean;
  fileSize?: string;
  pageCount?: number;
  title?: string;
  error?: string;
}

interface ThumbnailResult {
  success: boolean;
  thumbnailUrl?: string;
  tempThumbnailPath?: string;
  error?: string;
}

/**
 * Detecta as bordas do conteúdo removendo espaços em branco
 */
function detectContentBounds(
  context: CanvasRenderingContext2D,
  width: number,
  height: number
): {
  left: number;
  top: number;
  right: number;
  bottom: number;
} {
  console.log('🔍 Analisando conteúdo para detectar bordas...');

  const imageData = context.getImageData(0, 0, width, height);
  const data = imageData.data;

  let left = width;
  let right = 0;
  let top = height;
  let bottom = 0;

  const threshold = 250;

  const isContent = (x: number, y: number): boolean => {
    const index = (y * width + x) * 4;
    const r = data[index];
    const g = data[index + 1];
    const b = data[index + 2];
    const alpha = data[index + 3];

    return (r < threshold || g < threshold || b < threshold) && alpha > 0;
  };

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (isContent(x, y)) {
        left = Math.min(left, x);
        right = Math.max(right, x);
        top = Math.min(top, y);
        bottom = Math.max(bottom, y);
      }
    }
  }

  if (left === width) {
    console.log('⚠️ Nenhum conteúdo detectado, usando canvas completo');
    return { left: 0, top: 0, right: width, bottom: height };
  }

  const margin = Math.min(20, Math.min(width, height) * 0.02);

  const bounds = {
    left: Math.max(0, left - margin),
    top: Math.max(0, top - margin),
    right: Math.min(width, right + margin),
    bottom: Math.min(height, bottom + margin),
  };

  const contentWidth = bounds.right - bounds.left;
  const contentHeight = bounds.bottom - bounds.top;
  const reductionPercent = (
    ((width * height - contentWidth * contentHeight) / (width * height)) *
    100
  ).toFixed(1);

  console.log(
    `✂️ Conteúdo detectado: ${contentWidth}x${contentHeight} (redução de ${reductionPercent}% de espaço em branco)`
  );

  return bounds;
}

/**
 * Carrega PDF.js via CDN com versão compatível
 */
async function loadPDFJS(): Promise<any> {
  return new Promise((resolve, reject) => {
    if ((window as any).pdfjsLib) {
      resolve((window as any).pdfjsLib);
      return;
    }

    const script = document.createElement('script');
    script.src =
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.onload = () => {
      const pdfjsLib = (window as any).pdfjsLib;

      if (!pdfjsLib) {
        reject(new Error('PDF.js não foi carregado corretamente'));
        return;
      }

      pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

      console.log('✅ PDF.js carregado via CDN:', pdfjsLib.version);
      resolve(pdfjsLib);
    };

    script.onerror = () => {
      reject(new Error('Erro ao carregar PDF.js via CDN'));
    };

    document.head.appendChild(script);
  });
}

/**
 * Verifica se uma URL é um arquivo válido e extrai informações básicas
 */
export async function validateAndExtractFileInfo(
  url: string
): Promise<FileInfo> {
  try {
    console.log('🔍 Verificando arquivo:', url);

    const urlLower = url.toLowerCase();
    const isPDF = urlLower.includes('.pdf');
    const isImage =
      urlLower.includes('.jpg') ||
      urlLower.includes('.jpeg') ||
      urlLower.includes('.png') ||
      urlLower.includes('.gif') ||
      urlLower.includes('.bmp') ||
      urlLower.includes('.webp');

    if (!isPDF && !isImage) {
      return {
        isValid: false,
        error: 'URL deve ser um arquivo PDF ou imagem (JPG, PNG, GIF, etc.)',
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
    if (contentType) {
      const validTypes = [
        'application/pdf',
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/bmp',
        'image/webp',
      ];

      if (!validTypes.some((type) => contentType.includes(type))) {
        return {
          isValid: false,
          error: 'O arquivo não é um PDF ou imagem válida',
        };
      }
    }

    const contentLength = response.headers.get('content-length');
    let fileSize: string | undefined;
    let estimatedPages: number | undefined;

    if (contentLength) {
      const bytes = parseInt(contentLength);
      fileSize = formatFileSize(bytes);

      if (isPDF) {
        estimatedPages = Math.max(1, Math.round(bytes / 51200));
      } else {
        estimatedPages = 1; // Imagens têm 1 "página"
      }
    }

    console.log('✅ Arquivo válido:', {
      fileSize,
      estimatedPages,
      isPDF,
      isImage,
    });

    return {
      isValid: true,
      fileSize,
      pageCount: estimatedPages,
      title: extractTitleFromUrl(url),
    };
  } catch (error) {
    console.error('❌ Erro ao verificar arquivo:', error);
    return {
      isValid: false,
      error: 'Erro ao verificar o arquivo',
    };
  }
}

/**
 * Gera thumbnail PROVISÓRIA e faz upload para pasta temporária
 */
export async function generateAndUploadTempThumbnail(
  file: File,
  userId: string
): Promise<ThumbnailResult> {
  try {
    console.log('🖼️ Gerando thumbnail provisória para:', file.name);

    // Verificar se é PDF ou imagem
    const isPDF = file.type === 'application/pdf';
    const isImage = file.type.startsWith('image/');

    if (!isPDF && !isImage) {
      return {
        success: false,
        error: 'Arquivo deve ser PDF ou imagem',
      };
    }

    // Informar sobre arquivos grandes
    if (file.size > 10 * 1024 * 1024) {
      console.log('📄 Arquivo grande detectado - processo pode ser mais lento');
    }

    let thumbnailDataUrl: string | null = null;

    if (isPDF) {
      // Para PDFs: usar o método existente com PDF.js
      thumbnailDataUrl = await generatePDFThumbnail(file);
    } else if (isImage) {
      // Para imagens: usar a própria imagem como thumbnail
      thumbnailDataUrl = await generateImageThumbnail(file);
    }

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

    // Nome temporário único
    const tempId = generateTempId();
    const thumbnailName = `temp-${tempId}-thumb.png`;

    // Upload para pasta temporária do usuário
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
      tempThumbnailPath: uploadData.tempPath,
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
 * Gera thumbnail DEFINITIVA para pasta final da obra
 */
export async function generateAndUploadFinalThumbnail(
  file: File,
  workTitle: string,
  scoreId?: string
): Promise<
  ThumbnailResult & { scoreId: string; scoreDir: string; thumbDir: string }
> {
  try {
    console.log('🖼️ Gerando thumbnail definitiva para:', workTitle);

    let thumbnailDataUrl: string | null = null;

    if (file.type === 'application/pdf') {
      thumbnailDataUrl = await generatePDFThumbnail(file);
    } else if (file.type.startsWith('image/')) {
      thumbnailDataUrl = await generateImageThumbnail(file);
    }

    if (!thumbnailDataUrl) {
      return {
        success: false,
        error: 'Não foi possível gerar thumbnail',
        scoreId: scoreId || '',
        scoreDir: '',
        thumbDir: '',
      };
    }

    // Converter DataURL para Blob
    const response = await fetch(thumbnailDataUrl);
    const blob = await response.blob();

    // Gerar estrutura de pastas com ID único
    const structure = generateScoreDirectory(workTitle, scoreId);
    const cleanTitle = sanitizeWorkTitle(workTitle);
    const thumbnailName = `${cleanTitle}.png`;

    // Upload para pasta definitiva
    const formData = new FormData();
    formData.append('file', blob, thumbnailName);
    formData.append('type', 'score-final');
    formData.append('scoreDir', structure.scoreDir);
    formData.append('thumbDir', structure.thumbDir);
    formData.append('isThumb', 'true');

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
      scoreId: structure.scoreId,
      scoreDir: structure.scoreDir,
      thumbDir: structure.thumbDir,
    };
  } catch (error) {
    console.error('❌ Erro ao gerar thumbnail definitiva:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      scoreId: scoreId || '',
      scoreDir: '',
      thumbDir: '',
    };
  }
}

/**
 * 🆕 Gera thumbnail a partir de uma imagem
 */
export async function generateImageThumbnail(
  file: File
): Promise<string | null> {
  try {
    console.log('🖼️ Gerando thumbnail da imagem:', file.name);

    if (!file.type.startsWith('image/')) {
      console.warn('❌ Arquivo não é uma imagem');
      return null;
    }

    if (typeof window === 'undefined') {
      console.warn('❌ Função só funciona no cliente');
      return null;
    }

    return new Promise((resolve) => {
      const img = new Image();

      img.onload = () => {
        try {
          // Limpar URL após processamento
          URL.revokeObjectURL(fileUrl);

          // Usar a imagem original como thumbnail (sem redimensionamento conforme solicitado)
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            console.error('❌ Não foi possível criar contexto do canvas');
            resolve(null);
            return;
          }

          // Usar dimensões originais da imagem
          canvas.width = img.width;
          canvas.height = img.height;

          // Desenhar imagem no canvas
          ctx.drawImage(img, 0, 0);

          console.log(
            `✅ Thumbnail de imagem gerada: ${canvas.width}x${canvas.height}`
          );
          resolve(canvas.toDataURL('image/png', 0.8));
        } catch (error) {
          console.error('❌ Erro ao processar imagem:', error);
          resolve(null);
        }
      };

      img.onerror = () => {
        console.error('❌ Erro ao carregar imagem');
        URL.revokeObjectURL(fileUrl);
        resolve(null);
      };

      // Criar URL da imagem
      const fileUrl = URL.createObjectURL(file);
      img.src = fileUrl;
    });
  } catch (error) {
    console.error('❌ Erro geral ao gerar thumbnail de imagem:', error);
    return null;
  }
}

/**
 * Gera thumbnail usando PDF.js
 */
export async function generatePDFThumbnail(file: File): Promise<string | null> {
  try {
    console.log('🖼️ Gerando thumbnail do PDF:', file.name);

    if (file.type !== 'application/pdf') {
      console.warn('❌ Arquivo não é PDF');
      return null;
    }

    if (typeof window === 'undefined') {
      console.warn('❌ Função só funciona no cliente');
      return null;
    }

    let pdfjsLib: any;
    try {
      if (typeof window !== 'undefined' && (window as any).pdfjsLib) {
        pdfjsLib = (window as any).pdfjsLib;
        console.log('📚 Usando PDF.js global:', pdfjsLib.version);
      } else {
        pdfjsLib = await loadPDFJS();
      }

      if (!pdfjsLib) {
        throw new Error('PDF.js não pôde ser carregado');
      }

      console.log('📚 PDF.js carregado:', pdfjsLib.version);
    } catch (pdfError) {
      console.warn('⚠️ PDF.js não disponível, usando fallback:', pdfError);
      return await generatePlaceholder(file);
    }

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      console.log(`📄 PDF carregado: ${pdf.numPages} páginas`);

      const page = await pdf.getPage(1);

      let canvas = document.createElement('canvas');
      let context = canvas.getContext('2d');

      if (!context) {
        throw new Error('Não foi possível criar contexto do canvas');
      }

      const tempCanvas = document.createElement('canvas');
      const tempContext = tempCanvas.getContext('2d');

      if (!tempContext) {
        throw new Error('Não foi possível criar contexto temporário do canvas');
      }

      const analysisScale = 2;
      const analysisViewport = page.getViewport({ scale: analysisScale });

      tempCanvas.width = analysisViewport.width;
      tempCanvas.height = analysisViewport.height;

      const analysisRenderContext = {
        canvasContext: tempContext,
        viewport: analysisViewport,
      };

      await page.render(analysisRenderContext).promise;
      console.log(
        `📊 Página renderizada para análise: ${tempCanvas.width}x${tempCanvas.height}`
      );

      const contentBounds = detectContentBounds(
        tempContext,
        tempCanvas.width,
        tempCanvas.height
      );
      console.log('📐 Área de conteúdo detectada:', contentBounds);

      canvas = document.createElement('canvas');
      context = canvas.getContext('2d');

      if (!context) {
        throw new Error('Não foi possível criar contexto do canvas final');
      }

      const contentWidth = contentBounds.right - contentBounds.left;
      const contentHeight = contentBounds.bottom - contentBounds.top;
      const contentAspectRatio = contentWidth / contentHeight;

      const maxWidth = 400;
      const maxHeight = 520;

      let finalWidth, finalHeight;

      if (contentAspectRatio > maxWidth / maxHeight) {
        finalWidth = Math.min(maxWidth, contentWidth / analysisScale);
        finalHeight = finalWidth / contentAspectRatio;
      } else {
        finalHeight = Math.min(maxHeight, contentHeight / analysisScale);
        finalWidth = finalHeight * contentAspectRatio;
      }

      canvas.width = Math.round(finalWidth);
      canvas.height = Math.round(finalHeight);

      console.log(
        `🖼️ Canvas final: ${canvas.width}x${
          canvas.height
        } (aspect: ${contentAspectRatio.toFixed(2)})`
      );

      context.drawImage(
        tempCanvas,
        contentBounds.left,
        contentBounds.top,
        contentWidth,
        contentHeight,
        0,
        0,
        canvas.width,
        canvas.height
      );

      console.log('✅ Thumbnail gerada com crop automático');
      return canvas.toDataURL('image/png', 0.8);
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
 * Gera placeholder melhorado quando processamento falha
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

  // Ícone baseado no tipo de arquivo
  const isPDF = file.type === 'application/pdf';
  const isImage = file.type.startsWith('image/');

  if (isPDF) {
    ctx.fillStyle = '#dc2626';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('PDF', canvas.width / 2, canvas.height / 2 - 40);
  } else if (isImage) {
    ctx.fillStyle = '#059669';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('IMG', canvas.width / 2, canvas.height / 2 - 40);
  }

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
 * Gera ID temporário único
 */
function generateTempId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Limpa título da obra para usar como nome de pasta
 */
export function sanitizeWorkTitle(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 50);
}

/**
 * Gera ID único para partitura específica
 */
export function generateScoreId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 8);
  return `${timestamp}-${random}`;
}

/**
 * Gera estrutura de pastas para partitura específica
 */
export function generateScoreDirectory(
  workTitle: string,
  scoreId?: string
): {
  workDir: string;
  scoreDir: string;
  thumbDir: string;
  scoreId: string;
} {
  const now = new Date();
  const year = now.getFullYear().toString();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const cleanTitle = sanitizeWorkTitle(workTitle);
  const finalScoreId = scoreId || generateScoreId();

  const workDir = `${year}/${month}/${cleanTitle}`;
  const scoreDir = `${workDir}/${cleanTitle}-${finalScoreId}`;
  const thumbDir = `${scoreDir}/thumb`;

  return {
    workDir,
    scoreDir,
    thumbDir,
    scoreId: finalScoreId,
  };
}

/**
 * Valida se um arquivo uploadado é válido
 */
export async function validateUploadedFile(file: File): Promise<FileInfo> {
  try {
    console.log('🔍 Verificando arquivo uploadado:', file.name);

    // Verificar tipo MIME - agora aceita PDFs e imagens
    const validTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/bmp',
      'image/webp',
    ];

    if (!validTypes.includes(file.type)) {
      return {
        isValid: false,
        error: 'O arquivo deve ser um PDF ou imagem (PNG, JPG, GIF, etc.)',
      };
    }

    // Verificar extensão
    const fileName = file.name.toLowerCase();
    const validExtensions = [
      '.pdf',
      '.png',
      '.jpg',
      '.jpeg',
      '.gif',
      '.bmp',
      '.webp',
    ];
    const hasValidExtension = validExtensions.some((ext) =>
      fileName.endsWith(ext)
    );

    if (!hasValidExtension) {
      return {
        isValid: false,
        error:
          'O arquivo deve ter uma extensão válida (.pdf, .png, .jpg, etc.)',
      };
    }

    // Verificar tamanho (máximo 50MB)
    const maxSize = 50 * 1024 * 1024;
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

    // Para PDFs: estimar páginas. Para imagens: 1 página
    let estimatedPages = 1;
    if (file.type === 'application/pdf') {
      estimatedPages = Math.max(1, Math.round(file.size / 51200));
    }

    const title = extractTitleFromUrl(file.name);

    console.log('✅ Arquivo válido:', {
      fileSize,
      estimatedPages,
      title,
      type: file.type,
    });

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

    // Remove extensão
    const title = filename.replace(/\.(pdf|png|jpg|jpeg|gif|bmp|webp)$/i, '');

    const decoded = decodeURIComponent(title);
    const cleaned = decoded.replace(/[_-]/g, ' ');
    const capitalized = cleaned.replace(/\b\w/g, (char) => char.toUpperCase());

    return capitalized.trim();
  } catch {
    // Se não é URL, processar como nome de arquivo
    const filename = url || '';
    const title = filename.replace(/\.(pdf|png|jpg|jpeg|gif|bmp|webp)$/i, '');
    const cleaned = title.replace(/[_-]/g, ' ');
    const capitalized = cleaned.replace(/\b\w/g, (char) => char.toUpperCase());
    return capitalized.trim();
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
 * Detecta se uma URL é provavelmente um arquivo válido (PDF ou imagem)
 */
export function isProbablyValidFile(url: string): boolean {
  if (!isValidUrl(url)) return false;
  const urlLower = url.toLowerCase();
  return (
    urlLower.includes('.pdf') ||
    urlLower.includes('.png') ||
    urlLower.includes('.jpg') ||
    urlLower.includes('.jpeg') ||
    urlLower.includes('.gif') ||
    urlLower.includes('.bmp') ||
    urlLower.includes('.webp') ||
    urlLower.includes('pdf') ||
    urlLower.includes('image')
  );
}

// Manter compatibilidade com nomes antigos
export const validateAndExtractPDFInfo = validateAndExtractFileInfo;
export const isProbablyPDF = isProbablyValidFile;
