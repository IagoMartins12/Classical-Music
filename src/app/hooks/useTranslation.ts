'use client';
// hooks/useTranslation.ts - VERSÃO CORRIGIDA PARA INTERPOLAÇÃO
import {
  useLanguageWithRefresh,
  Language,
} from '@/app/stores/useLanguageStore';
import { useState, useEffect, useCallback } from 'react';

// Cache global para todas as seções carregadas
// Estrutura: Map<section, {ptBr: {}, en: {}}>
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

export function useTranslation(
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
      // Verificar se já está no cache
      if (sectionCache.has(section)) {
        if (!loadedSections.includes(section)) {
          setLoadedSections((prev) => [...prev, section]);
        }
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Carregar apenas UM arquivo JSON por seção
        const response = await fetch(`/translations/${section}.json`);

        if (!response.ok) {
          throw new Error(`Failed to load section ${section}`);
        }

        // Estrutura esperada { ptBr: {}, en: {} }
        const translationData = await response.json();

        // Verificar se tem a estrutura correta
        if (!translationData.ptBr && !translationData.en) {
          return;
        }

        // Armazenar no cache
        sectionCache.set(section, {
          ptBr: translationData.ptBr || {},
          en: translationData.en || {},
        });

        // Atualizar seções carregadas
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

        // Fallback: criar entrada vazia para evitar requests repetidos
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

  // Só carregar seções se foram definidas
  useEffect(() => {
    const loadInitialSections = async () => {
      // Só executar se sections foi definido e não está vazio
      if (sections && sections.length > 0) {
        for (const section of sections) {
          await loadSection(section);
        }
      }
    };

    loadInitialSections();
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

      // Buscar na linguagem atual com fallback para português
      const currentLangKey = language === 'pt' ? 'ptBr' : 'en';
      let translation = sectionData[currentLangKey]?.[key];

      if (!translation && language === 'en') {
        // Fallback para português se inglês não encontrado
        translation = sectionData.ptBr?.[key];
      }

      if (!translation) {
        return formatKeyAsFallback(key);
      }

      return interpolateParams(translation, params);
    },
    [language]
  );

  // Função principal de tradução sem seção padrão
  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      // Detectar namespace (ex: "works:work_title")
      if (key.includes(':')) {
        const [section, actualKey] = key.split(':', 2);
        return tSection(section, actualKey, params);
      }

      // Se há seção padrão definida, tentar nela primeiro
      if (defaultSection) {
        const translation = tSection(defaultSection, key, params);
        if (translation !== formatKeyAsFallback(key)) {
          return translation;
        }
      }

      // Se não há seção padrão ou não encontrou, tentar em todas as seções carregadas
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

// Hook especializado para seções específicas
export function useSectionTranslation(section: string) {
  const translation = useTranslation({
    sections: [section],
    defaultSection: section,
  });

  return {
    ...translation,
    t: (key: string, params?: Record<string, string | number>) =>
      translation.tSection(section, key, params),
  };
}

// Hook para carregar múltiplas seções de uma vez
export function useMultiSectionTranslation(sections: string[]) {
  return useTranslation({ sections, defaultSection: sections[0] });
}

// ✅ FUNÇÃO CORRIGIDA: Mudança da regex de {{}} para {}
function interpolateParams(
  text: string,
  params?: Record<string, string | number>
): string {
  if (!params) return text;

  // ✅ CORREÇÃO: Usar chaves simples {} ao invés de duplas {{}}
  return text.replace(/\{(\w+)\}/g, (match, key) => {
    const value = params[key];
    return value !== undefined ? String(value) : match;
  });
}

function formatKeyAsFallback(key: string): string {
  return key
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
