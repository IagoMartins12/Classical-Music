// contexts/TranslationContext.tsx - Context provider for server translations
'use client';

import { useLanguageWithRefresh } from '@/app/stores/useLanguageStore';
import { Language } from '@/app/utils/translations/serverTranslations';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

export type TranslationData = Record<string, string>;
export type TranslationsMap = Record<string, TranslationData>;

interface TranslationContextValue {
  language: Language;
  translations: TranslationsMap;
  t: (key: string, params?: Record<string, string | number>) => string;
  tSection: (
    section: string,
    key: string,
    params?: Record<string, string | number>
  ) => string;
}

const TranslationContext = createContext<TranslationContextValue | null>(null);

interface TranslationProviderProps {
  language: Language;
  translations: TranslationsMap;
  children: React.ReactNode;
}

/**
 * Provider que injeta traduções do servidor nos componentes client
 */
export function TranslationProvider({
  language,
  translations,
  children,
}: TranslationProviderProps) {
  const contextValue = useMemo(() => {
    // Função t() principal
    const t = (
      key: string,
      params?: Record<string, string | number>
    ): string => {
      // Detectar namespace (ex: "works:work_title")
      if (key.includes(':')) {
        const [section, actualKey] = key.split(':', 2);
        return tSection(section, actualKey, params);
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

    // Função t() para seção específica
    const tSection = (
      section: string,
      key: string,
      params?: Record<string, string | number>
    ): string => {
      const sectionData = translations[section];

      if (sectionData && sectionData[key]) {
        return interpolateTranslation(sectionData[key], params);
      }

      return formatKeyAsFallback(key);
    };

    return {
      language,
      translations,
      t,
      tSection,
    };
  }, [language, translations]);

  return (
    <TranslationContext.Provider value={contextValue}>
      {children}
    </TranslationContext.Provider>
  );
}

/**
 * Hook que usa Context primeiro, fallback para fetch (backward compatibility)
 */
export function useTranslation(
  options: {
    sections?: string[];
    defaultSection?: string;
  } = {}
) {
  const context = useContext(TranslationContext);

  // Chama SEMPRE o hook original
  const original = useOriginalTranslation(options);

  // Se existir contexto (server translations), sobrescreve o retorno
  if (context) {
    return {
      t: context.t,
      tSection: context.tSection,
      language: context.language,
      isLoading: false,
      loadedSections: Object.keys(context.translations),
      error: null,
      changeLanguage: () => {
        console.warn(
          'changeLanguage not available when using server translations'
        );
      },
      toggleLanguage: () => {
        console.warn(
          'toggleLanguage not available when using server translations'
        );
      },
      loadSection: async () => {
        console.warn(
          'loadSection not available when using server translations'
        );
      },
      preloadSections: async () => {
        console.warn(
          'preloadSections not available when using server translations'
        );
      },
    };
  }

  // Caso contrário, usa o fallback do hook original
  return original;
}

// Função utilitária para interpolação
function interpolateTranslation(
  text: string,
  params?: Record<string, string | number>
): string {
  if (!params) return text;

  return text.replace(/\{(\w+)\}/g, (match, key) => {
    const value = params[key];
    return value !== undefined ? String(value) : match;
  });
}

// Função utilitária para fallback
function formatKeyAsFallback(key: string): string {
  return key
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

// Cache global para todas as seções carregadas (do hook original)
const sectionCache = new Map<
  string,
  { ptBr: Record<string, string>; en: Record<string, string> }
>();

interface UseTranslationOptions {
  sections?: string[];
  defaultSection?: string;
}

interface UseTranslationResult {
  t: (key: string, params?: Record<string, string | number>) => string;
  tSection: (
    section: string,
    key: string,
    params?: Record<string, string | number>
  ) => string;
  language: Language;
  isLoading: boolean;
  loadedSections: string[];
  error: string | null;
  changeLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  loadSection: (section: string) => Promise<void>;
  preloadSections: (sections: string[]) => Promise<void>;
}

// Hook original (client-side) para fallback
function useOriginalTranslation(
  options: UseTranslationOptions = {}
): UseTranslationResult {
  const { sections, defaultSection } = options;

  const { language, setLanguage, toggleLanguage } = useLanguageWithRefresh();
  const [isLoading, setIsLoading] = useState(false);
  const [loadedSections, setLoadedSections] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Carregar seção específica
  const loadSection = useCallback(
    async (section: string) => {
      if (sectionCache.has(section)) {
        if (!loadedSections.includes(section)) {
          setLoadedSections((prev) => [...prev, section]);
        }
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`/translations/${section}.json`);

        if (!response.ok) {
          throw new Error(`Failed to load section ${section}`);
        }

        const translationData = await response.json();

        if (!translationData.ptBr && !translationData.en) {
          return;
        }

        sectionCache.set(section, {
          ptBr: translationData.ptBr || {},
          en: translationData.en || {},
        });

        setLoadedSections((prev) => {
          if (!prev.includes(section)) {
            return [...prev, section];
          }
          return prev;
        });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Erro ao carregar tradução'
        );
        sectionCache.set(section, { ptBr: {}, en: {} });
      } finally {
        setIsLoading(false);
      }
    },
    [loadedSections]
  );

  // Pré-carregar múltiplas seções
  const preloadSections = useCallback(
    async (sectionsToLoad: string[]) => {
      const promises = sectionsToLoad.map((section) => loadSection(section));
      await Promise.all(promises);
    },
    [loadSection]
  );

  // Carregar seções iniciais
  useEffect(() => {
    if (sections && sections.length > 0) {
      const loadInitialSections = async () => {
        for (const section of sections) {
          await loadSection(section);
        }
      };
      loadInitialSections();
    }
  }, [sections, loadSection]);

  // Função para traduzir com seção específica
  const tSection = useCallback(
    (
      section: string,
      key: string,
      params?: Record<string, string | number>
    ): string => {
      const sectionData = sectionCache.get(section);

      if (!sectionData) {
        return formatKeyAsFallback(key);
      }

      const currentLangKey = language === 'pt' ? 'ptBr' : 'en';
      let translation = sectionData[currentLangKey]?.[key];

      if (!translation && language === 'en') {
        translation = sectionData.ptBr?.[key];
      }

      if (!translation) {
        return formatKeyAsFallback(key);
      }

      return interpolateTranslation(translation, params);
    },
    [language]
  );

  // Função principal de tradução
  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      if (key.includes(':')) {
        const [section, actualKey] = key.split(':', 2);
        return tSection(section, actualKey, params);
      }

      if (defaultSection) {
        const translation = tSection(defaultSection, key, params);
        if (translation !== formatKeyAsFallback(key)) {
          return translation;
        }
      }

      if (loadedSections.length > 0) {
        for (const section of loadedSections) {
          if (section !== defaultSection) {
            const sectionTranslation = tSection(section, key, params);
            if (sectionTranslation !== formatKeyAsFallback(key)) {
              return sectionTranslation;
            }
          }
        }
      }

      return formatKeyAsFallback(key);
    },
    [defaultSection, loadedSections, tSection]
  );

  const changeLanguage = useCallback(
    (lang: Language) => {
      setLanguage(lang);
    },
    [setLanguage]
  );

  return {
    t,
    tSection,
    language,
    isLoading,
    loadedSections,
    error,
    changeLanguage,
    toggleLanguage,
    loadSection,
    preloadSections,
  };
}
