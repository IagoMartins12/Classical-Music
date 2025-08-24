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
 * Traduz biografia usando Google Translate (mesmo método do script)
 */
export async function translateBiographyWithGoogle(
  text: string
): Promise<string> {
  try {
    await respectRateLimit();

    // Adicionar contexto musical para melhor tradução
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

    if (data && data[0] && data[0][0] && data[0][0][0]) {
      let result = data[0][0][0];

      // Remover marcador de contexto
      result = result.replace(/^\[MUSIC BIOGRAPHY\]\s*/i, '');

      // Correções específicas para contexto musical
      result = result
        .replace(/\bIa\b/g, 'AI')
        .replace(/Brazilian crying/gi, 'Brazilian Choro')
        .replace(/compass/gi, 'measure')
        .replace(/\bcomposer\b/gi, 'composer')
        .replace(/\bmusical work/gi, 'musical composition')
        .replace(/\bmusical works/gi, 'musical compositions');

      return result;
    }

    throw new Error('Resposta inválida do Google Translate');
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
