// utils/biographyTranslation.ts
import fs from 'fs';
import path from 'path';

export interface BiographyCache {
  ptBr: Record<string, string>;
  en: Record<string, string>;
}

const CACHE_FILE_PATH = path.join(
  process.cwd(),
  'public',
  'translations',
  'composers-bio.json'
);

// Rate limiting para Google Translate
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1000; // 1 segundo entre requests

/**
 * Carrega o cache de biografias traduzidas
 */
export function loadBiographyCache(): BiographyCache {
  try {
    if (fs.existsSync(CACHE_FILE_PATH)) {
      const data = fs.readFileSync(CACHE_FILE_PATH, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.warn('Erro ao carregar cache de biografias:', error);
  }

  return { ptBr: {}, en: {} };
}

/**
 * Salva o cache de biografias traduzidas
 */
export function saveBiographyCache(cache: BiographyCache): void {
  try {
    const dir = path.dirname(CACHE_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(CACHE_FILE_PATH, JSON.stringify(cache, null, 2), 'utf8');
  } catch (error) {
    console.error('Erro ao salvar cache de biografias:', error);
  }
}

/**
 * Gera chave única para o compositor
 */
export function generateComposerBioKey(
  composerName: string,
  composerId: string
): string {
  const cleanName = composerName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-zA-Z0-9]/g, '_')
    .toLowerCase();

  return `${cleanName}_${composerId}`;
}

/**
 * Respeita rate limit do Google Translate
 */
async function respectRateLimit(): Promise<void> {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;

  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    const waitTime = MIN_REQUEST_INTERVAL - timeSinceLastRequest;
    await new Promise((resolve) => setTimeout(resolve, waitTime));
  }

  lastRequestTime = Date.now();
}
/**
 * Traduz biografia usando Google Translate (VERSÃO OTIMIZADA - UMA ÚNICA REQUISIÇÃO)
 */
export async function translateBiographyWithGoogle(
  text: string
): Promise<string> {
  try {
    await respectRateLimit();

    // ✅ MAPEAR ESTRUTURA DO TEXTO ORIGINAL
    const originalParagraphs = text
      .split('\n\n')
      .filter((p) => p.trim().length > 0);

    console.log(
      `Mapeando ${originalParagraphs.length} parágrafos para preservar estrutura`
    );

    // Se tem apenas 1 parágrafo, traduzir direto sem complicação
    if (originalParagraphs.length <= 1) {
      return await translateSingleRequest(text);
    }

    // ✅ INSERIR MARCADORES ÚNICOS ENTRE PARÁGRAFOS para preservar quebras
    const markedText = originalParagraphs.join(' |PARAGRAPH_BREAK| ');

    console.log('Texto com marcadores criado, fazendo tradução única...');

    // Fazer uma única tradução com marcadores
    const translatedText = await translateSingleRequest(markedText);

    // ✅ RECONSTRUIR PARÁGRAFOS baseado nos marcadores
    const reconstructed = reconstructFromMarkers(
      translatedText,
      originalParagraphs.length
    );

    console.log(
      `Estrutura reconstruída com ${
        reconstructed.split('\n\n').length
      } parágrafos`
    );

    return reconstructed;
  } catch (error) {
    console.warn(
      `Erro na tradução: ${
        error instanceof Error ? error.message : 'Erro desconhecido'
      }`
    );
    throw error;
  }
}

/**
 * ✅ FUNÇÃO AUXILIAR: Faz uma única tradução
 */
async function translateSingleRequest(text: string): Promise<string> {
  const contextualText = `[MUSIC BIOGRAPHY] ${text}`;

  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=pt&tl=en&dt=t&q=${encodeURIComponent(
    contextualText
  )}`;

  const response = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const data = await response.json();

  if (data && data[0] && Array.isArray(data[0])) {
    let result = '';

    // Concatenar todos os segmentos da tradução
    for (const segment of data[0]) {
      if (segment && segment[0] && typeof segment[0] === 'string') {
        result += segment[0];
      }
    }

    if (!result.trim()) {
      throw new Error('Tradução vazia após concatenar segmentos');
    }

    // Remover marcador de contexto
    result = result.replace(/^\[MUSIC BIOGRAPHY\]\s*/i, '');

    return applyMusicalCorrections(result);
  }

  throw new Error('Resposta inválida do Google Translate');
}

/**
 * ✅ FUNÇÃO AUXILIAR: Reconstrói parágrafos a partir dos marcadores
 */
function reconstructFromMarkers(
  translatedText: string,
  expectedParagraphs: number
): string {
  // Limpar texto
  const cleanText = translatedText.replace(/\s+/g, ' ').trim();

  // ✅ BUSCAR PELOS MARCADORES (podem ter variações na tradução)
  const markerVariations = [
    '|PARAGRAPH_BREAK|',
    '| PARAGRAPH_BREAK |',
    '| Paragraph_Break |', // ✅ ADICIONADO: Variação encontrada
    '|Paragraph_Break|',
    '|paragraph_break|',
    '| paragraph_break |',
    '|PARAGRAPH BREAK|',
    '| PARAGRAPH BREAK |',
    'PARAGRAPH_BREAK',
    'paragraph break',
    'PARAGRAPH BREAK',
    'Paragraph_Break', // ✅ ADICIONADO
  ];

  let paragraphs: string[] = [];
  let foundMarkers = false;

  // Tentar encontrar marcadores
  for (const marker of markerVariations) {
    if (cleanText.includes(marker)) {
      paragraphs = cleanText
        .split(marker)
        .map((p) => p.trim())
        .filter((p) => p.length > 0);

      foundMarkers = true;
      console.log(
        `Encontrados ${paragraphs.length} parágrafos usando marcador: ${marker}`
      );
      break;
    }
  }

  // ✅ FALLBACK: Se não encontrou marcadores, dividir por sentenças
  if (!foundMarkers || paragraphs.length < 2) {
    console.log(
      'Marcadores não encontrados, usando método de divisão inteligente...'
    );
    paragraphs = intelligentSplit(cleanText, expectedParagraphs);
  }

  // ✅ AJUSTAR NÚMERO DE PARÁGRAFOS se necessário
  if (paragraphs.length !== expectedParagraphs) {
    console.log(
      `Ajustando de ${paragraphs.length} para ${expectedParagraphs} parágrafos`
    );
    paragraphs = adjustParagraphCount(paragraphs, expectedParagraphs);
  }

  // Juntar com quebras duplas
  return paragraphs.filter((p) => p.trim().length > 0).join('\n\n');
}

/**
 * ✅ FUNÇÃO AUXILIAR: Divisão inteligente baseada em sentenças
 */
function intelligentSplit(text: string, targetCount: number): string[] {
  // Dividir em sentenças
  const sentences = text
    .split(/(?<=[.!?])\s+(?=[A-Z])/)
    .filter((s) => s.trim().length > 0);

  if (sentences.length < targetCount) {
    // Se tem menos sentenças que parágrafos desejados, retornar como está
    return sentences;
  }

  // Distribuir sentenças proporcionalmente
  const sentencesPerParagraph = Math.max(
    1,
    Math.floor(sentences.length / targetCount)
  );
  const paragraphs: string[] = [];

  for (let i = 0; i < targetCount; i++) {
    const start = i * sentencesPerParagraph;
    let end = start + sentencesPerParagraph;

    // Último parágrafo pega todas as sentenças restantes
    if (i === targetCount - 1) {
      end = sentences.length;
    }

    const paragraphSentences = sentences.slice(start, end);
    if (paragraphSentences.length > 0) {
      paragraphs.push(paragraphSentences.join(' ').trim());
    }
  }

  return paragraphs.filter((p) => p.length > 0);
}

/**
 * ✅ FUNÇÃO AUXILIAR: Ajusta o número de parágrafos
 */
function adjustParagraphCount(
  paragraphs: string[],
  targetCount: number
): string[] {
  if (paragraphs.length === targetCount) {
    return paragraphs;
  }

  if (paragraphs.length > targetCount) {
    // Tem mais parágrafos que o esperado - combinar os últimos
    const result = paragraphs.slice(0, targetCount - 1);
    const combined = paragraphs.slice(targetCount - 1).join(' ');
    result.push(combined);
    return result;
  }

  if (paragraphs.length < targetCount) {
    // Tem menos parágrafos - dividir o maior
    const result = [...paragraphs];

    while (result.length < targetCount) {
      // Encontrar o parágrafo mais longo para dividir
      let longestIndex = 0;
      let longestLength = 0;

      for (let i = 0; i < result.length; i++) {
        if (result[i].length > longestLength) {
          longestLength = result[i].length;
          longestIndex = i;
        }
      }

      // Dividir o parágrafo mais longo no meio
      const longest = result[longestIndex];
      const sentences = longest.split(/(?<=[.!?])\s+(?=[A-Z])/);

      if (sentences.length >= 2) {
        const mid = Math.floor(sentences.length / 2);
        const firstHalf = sentences.slice(0, mid).join(' ');
        const secondHalf = sentences.slice(mid).join(' ');

        result[longestIndex] = firstHalf;
        result.splice(longestIndex + 1, 0, secondHalf);
      } else {
        // Se não consegue dividir por sentenças, dividir por palavras
        const words = longest.split(' ');
        const mid = Math.floor(words.length / 2);
        const firstHalf = words.slice(0, mid).join(' ');
        const secondHalf = words.slice(mid).join(' ');

        result[longestIndex] = firstHalf;
        result.splice(longestIndex + 1, 0, secondHalf);
      }
    }

    return result;
  }

  return paragraphs;
}

/**
 * ✅ FUNÇÃO AUXILIAR: Aplica correções específicas para contexto musical
 */
function applyMusicalCorrections(text: string): string {
  return (
    text
      // Correções específicas para contexto musical
      .replace(/\bIa\b/g, 'AI')
      .replace(/Brazilian crying/gi, 'Brazilian Choro')
      .replace(/compass/gi, 'measure')
      .replace(/\bmusical work/gi, 'musical composition')
      .replace(/\bmusical works/gi, 'musical compositions')
      .replace(/songwriters?/gi, 'composer')
      .replace(/coral/gi, 'choral')
      .replace(/singing/gi, 'cantata')
      .replace(/Merment/gi, 'Lament')

      // Correções de termos musicais comuns
      .replace(/\bconcerts\b/gi, 'concertos')
      .replace(/\bAscap\b/gi, 'ASCAP')

      // Correções de datas e informações biográficas
      .replace(/\bborn in\s+(\d+)/gi, 'born in $1')
      .replace(/\bdied in\s+(\d+)/gi, 'died in $1')
      .replace(/\bhe was\s+a/gi, 'he was a')
      .replace(/\bshe was\s+a/gi, 'she was a')

      // Correções de pronomes para mulheres compositoras
      .replace(/\b(Abbott|Jane)\s+began\s+his\b/gi, '$1 began her')
      .replace(
        /\bhe\s+continued\s+his\s+studies/gi,
        'she continued her studies'
      )
      .replace(
        /\bhis\s+formation\s+was\s+influenced/gi,
        'her formation was influenced'
      )
      .replace(
        /\bAbel\s+began\s+her\s+musical\s+formation/gi,
        'Abel began his musical formation'
      )

      // Limpar espaços múltiplos
      .replace(/[ \t]{2,}/g, ' ')
      .replace(/^\s+|\s+$/gm, '')
      .trim()
  );
}
/**
 * Busca biografia traduzida no cache
 */
export function getCachedBiography(
  composerName: string,
  composerId: string,
  language: 'pt' | 'en'
): string | null {
  const cache = loadBiographyCache();
  const key = generateComposerBioKey(composerName, composerId);

  const langKey = language === 'pt' ? 'ptBr' : 'en';
  return cache[langKey][key] || null;
}

/**
 * Salva biografia no cache
 */
export function cacheBiography(
  composerName: string,
  composerId: string,
  biography: string,
  language: 'pt' | 'en'
): void {
  const cache = loadBiographyCache();
  const key = generateComposerBioKey(composerName, composerId);

  const langKey = language === 'pt' ? 'ptBr' : 'en';
  cache[langKey][key] = biography;

  saveBiographyCache(cache);
}

/**
 * Traduz e cacheia biografia se necessário
 */
export async function translateAndCacheBiography(
  composerName: string,
  composerId: string,
  portugueseBio: string
): Promise<string> {
  const key = generateComposerBioKey(composerName, composerId);
  const cache = loadBiographyCache();

  // Verificar se já temos tradução
  if (cache.en[key]) {
    return cache.en[key];
  }

  // Traduzir
  const englishBio = await translateBiographyWithGoogle(portugueseBio);

  // Salvar no cache
  cache.en[key] = englishBio;

  // Garantir que o português também está no cache
  if (!cache.ptBr[key]) {
    cache.ptBr[key] = portugueseBio;
  }

  saveBiographyCache(cache);

  return englishBio;
}
