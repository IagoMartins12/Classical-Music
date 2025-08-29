// utils/serverTranslations.ts - ATUALIZADO com detecção correta de idioma
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { unstable_cache } from 'next/cache';
import { headers, cookies } from 'next/headers';

export type Language = 'pt' | 'en';
export type TranslationData = Record<string, string>;

// CONFIGURAÇÃO PRINCIPAL - Mude aqui para trocar idioma padrão do build
const DEFAULT_BUILD_LANGUAGE: Language = 'pt'; // 🔧 Troque para 'en' se quiser inglês no build

// Cache permanente para traduções (não expira)
const translationsCache = new Map<string, TranslationData>();

/**
 * Carrega uma seção de traduções do arquivo JSON
 */
async function loadTranslationSection(
  language: Language,
  section: string
): Promise<TranslationData> {
  const cacheKey = `${language}-${section}`;

  // Verificar cache em memória primeiro
  if (translationsCache.has(cacheKey)) {
    return translationsCache.get(cacheKey)!;
  }

  try {
    const filePath = join(
      process.cwd(),
      'public',
      'translations',
      `${section}.json`
    );

    if (!existsSync(filePath)) {
      console.warn(`Translation file not found: ${filePath}`);
      translationsCache.set(cacheKey, {});
      return {};
    }

    const fileContent = readFileSync(filePath, 'utf-8');
    const translationData = JSON.parse(fileContent);

    // Extrair traduções para a linguagem específica
    const langData = translationData[language === 'pt' ? 'ptBr' : 'en'] || {};

    // Cache permanente
    translationsCache.set(cacheKey, langData);
    return langData;
  } catch (error) {
    console.error(`Error loading translation section ${section}:`, error);
    translationsCache.set(cacheKey, {});
    return {};
  }
}

/**
 * Carrega múltiplas seções de tradução com cache
 */
export const getServerTranslations = unstable_cache(
  async (
    language: Language,
    sections: string[]
  ): Promise<Record<string, TranslationData>> => {
    const translations: Record<string, TranslationData> = {};

    // Carregar todas as seções em paralelo
    const sectionPromises = sections.map(async (section) => {
      const data = await loadTranslationSection(language, section);
      return [section, data] as const;
    });

    const results = await Promise.all(sectionPromises);

    // Montar objeto final
    results.forEach(([section, data]) => {
      translations[section] = data;
    });

    return translations;
  },
  // Cache key baseado na linguagem e seções
  ['server-translations'],
  {
    // Cache permanente - só invalida no restart/rebuild
    revalidate: false,
    tags: ['translations'],
  }
);

/**
 * CORRIGIDO: Detecta idioma do servidor lendo cookie corretamente
 */
export async function getServerLanguageStatic(): Promise<Language> {
  try {
    // 1. Tentar ler do cookie (preferência salva pelo usuário)
    const cookieStore = await cookies();
    const languageCookie = cookieStore.get('opus-atlas-language');

    if (languageCookie?.value) {
      try {
        const decoded = decodeURIComponent(languageCookie.value);
        const stored = JSON.parse(decoded);

        if (
          stored.state?.language &&
          (stored.state.language === 'pt' || stored.state.language === 'en')
        ) {
          return stored.state.language;
        }
      } catch {
        // Cookie malformado, continuar para próximo método
      }
    }

    // 2. Tentar ler do header Accept-Language
    const headersList = await headers();
    const acceptLanguage = headersList.get('accept-language');

    if (acceptLanguage) {
      const preferredLang = acceptLanguage
        .split(',')[0]
        .split('-')[0]
        .toLowerCase();

      if (preferredLang === 'pt') return 'pt';
      if (preferredLang === 'en') return 'en';
    }

    // 3. Fallback para idioma padrão configurado
    return DEFAULT_BUILD_LANGUAGE;
  } catch {
    // Durante build estático ou erro, usar idioma padrão
    return DEFAULT_BUILD_LANGUAGE;
  }
}

/**
 * Para build estático - sempre retorna idioma padrão configurado
 */
export function getBuildLanguage(): Language {
  return DEFAULT_BUILD_LANGUAGE;
}

/**
 * Detecta se está em modo build estático
 */
function isBuildTime(): boolean {
  return process.env.NODE_ENV === 'production' && !process.env.RUNTIME;
}

/**
 * Função principal para detectar idioma (escolhe estratégia automaticamente)
 */
export async function detectServerLanguage(): Promise<Language> {
  // Se é build time, usar idioma fixo
  if (isBuildTime()) {
    return getBuildLanguage();
  }

  // Se é runtime, detectar corretamente
  return await getServerLanguageStatic();
}

/**
 * Função de interpolação de parâmetros
 */
export function interpolateTranslation(
  text: string,
  params?: Record<string, string | number>
): string {
  if (!params) return text;

  return text.replace(/\{(\w+)\}/g, (match, key) => {
    const value = params[key];
    return value !== undefined ? String(value) : match;
  });
}

/**
 * Cria uma função t() para uma linguagem e traduções específicas
 */
export function createTranslationFunction(
  language: Language,
  translations: Record<string, TranslationData>
) {
  return function t(
    key: string,
    params?: Record<string, string | number>
  ): string {
    // Detectar namespace (ex: "works:work_title")
    if (key.includes(':')) {
      const [section, actualKey] = key.split(':', 2);
      const sectionData = translations[section];

      if (sectionData && sectionData[actualKey]) {
        return interpolateTranslation(sectionData[actualKey], params);
      }
    }

    // Buscar em todas as seções carregadas
    for (const sectionData of Object.values(translations)) {
      if (sectionData[key]) {
        return interpolateTranslation(sectionData[key], params);
      }
    }

    // Fallback: formatar chave como texto legível
    return formatKeyAsFallback(key);
  };
}

/**
 * Formatar chave como fallback legível
 */
function formatKeyAsFallback(key: string): string {
  return key
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

/**
 * Função utilitária para carregar traduções de uma página específica
 */
export async function loadPageTranslations(
  language: Language,
  pageSections: string[]
): Promise<{
  translations: Record<string, TranslationData>;
  t: (key: string, params?: Record<string, string | number>) => string;
}> {
  const translations = await getServerTranslations(language, pageSections);
  const t = createTranslationFunction(language, translations);

  return { translations, t };
}

// Seções comuns que muitas páginas usam
export const COMMON_TRANSLATION_SECTIONS = [
  'common',
  'navigation',
  'auth',
  'errors',
];

/**
 * Carregar traduções com seções comuns incluídas
 */
export async function loadPageTranslationsWithCommon(
  language: Language,
  pageSections: string[]
): Promise<{
  translations: Record<string, TranslationData>;
  t: (key: string, params?: Record<string, string | number>) => string;
}> {
  const allSections = [...COMMON_TRANSLATION_SECTIONS, ...pageSections];
  const uniqueSections = [...new Set(allSections)];

  return loadPageTranslations(language, uniqueSections);
}

// ===============================================
// METADATA UTILITIES
// ===============================================

/**
 * Gera metadata estático para build (sempre usa idioma padrão)
 */
export function generateStaticMetadata(pageKey: string, additionalData?: any) {
  const language = getBuildLanguage();

  // Aqui você pode carregar traduções síncronas para metadata se necessário
  // Ou usar valores hardcoded baseados no idioma padrão

  const metadataContent = {
    pt: {
      titleTemplate: '%s | Opus Atlas',
      defaultTitle: 'Opus Atlas - Enciclopédia de Música Clássica',
      description:
        'Explore, aprenda e pratique música clássica com nossa enciclopédia interativa.',
      keywords: [
        'música clássica',
        'compositores',
        'partituras',
        'educação musical',
      ],
      locale: 'pt_BR',
      url: 'https://opusatlas.com.br',
    },
    en: {
      titleTemplate: '%s | Opus Atlas',
      defaultTitle: 'Opus Atlas - Classical Music Encyclopedia',
      description:
        'Explore, learn, and practice classical music with our interactive encyclopedia.',
      keywords: [
        'classical music',
        'composers',
        'sheet music',
        'music education',
      ],
      locale: 'en_US',
      url: 'https://opusatlas.com/en',
    },
  };

  const content = metadataContent[language];

  return {
    title: {
      template: content.titleTemplate,
      default: content.defaultTitle,
    },
    description: content.description,
    keywords: content.keywords,
    openGraph: {
      title: content.defaultTitle,
      description: content.description,
      type: 'website',
      locale: content.locale,
      url: content.url,
    },
    alternates: {
      canonical: content.url,
      languages: {
        'pt-BR': metadataContent.pt.url,
        'en-US': metadataContent.en.url,
      },
    },
    ...additionalData,
  };
}

// ===============================================
// CLIENT-SIDE METADATA UPDATE UTILITIES
// ===============================================

/**
 * Tipos para metadata dinâmica
 */
export interface DynamicMetadata {
  title?: string;
  description?: string;
  keywords?: string[];
  ogTitle?: string;
  ogDescription?: string;
}

/**
 * Atualiza metadata dinamicamente no client-side
 */
export function updateClientMetadata(metadata: DynamicMetadata) {
  if (typeof window === 'undefined') return;

  // Atualizar title
  if (metadata.title) {
    document.title = metadata.title;
  }

  // Atualizar meta description
  if (metadata.description) {
    updateMetaTag('description', metadata.description);
  }

  // Atualizar meta keywords
  if (metadata.keywords) {
    updateMetaTag('keywords', metadata.keywords.join(', '));
  }

  // Atualizar Open Graph
  if (metadata.ogTitle) {
    updateMetaTag('og:title', metadata.ogTitle, 'property');
  }

  if (metadata.ogDescription) {
    updateMetaTag('og:description', metadata.ogDescription, 'property');
  }
}

/**
 * Helper para atualizar meta tags
 */
function updateMetaTag(
  name: string,
  content: string,
  attribute: string = 'name'
) {
  let metaTag = document.querySelector(`meta[${attribute}="${name}"]`);

  if (!metaTag) {
    metaTag = document.createElement('meta');
    metaTag.setAttribute(attribute, name);
    document.head.appendChild(metaTag);
  }

  metaTag.setAttribute('content', content);
}
