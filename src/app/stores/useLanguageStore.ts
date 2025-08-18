// stores/useLanguageStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Language = 'pt' | 'en';

interface LanguageState {
  language: Language;
  isTranslating: boolean;
  setLanguage: (language: Language) => void;
  setTranslating: (translating: boolean) => void;
  toggleLanguage: () => void;
}

// Cache de traduções em memória para performance
const translationCache = new Map<string, string>();

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      language: 'pt', // Padrão português
      isTranslating: false,

      setLanguage: (language: Language) => {
        set({ language });
        // Disparar evento para componentes reagirem
        window.dispatchEvent(
          new CustomEvent('languageChanged', { detail: language })
        );
      },

      setTranslating: (translating: boolean) => {
        set({ isTranslating: translating });
      },

      toggleLanguage: () => {
        const current = get().language;
        const newLanguage: Language = current === 'pt' ? 'en' : 'pt';
        get().setLanguage(newLanguage);
      },
    }),
    {
      name: 'opus-atlas-language',
      // Detectar idioma do navegador na inicialização
      onRehydrateStorage: () => (state) => {
        if (state && typeof window !== 'undefined') {
          const browserLang = navigator.language.startsWith('pt') ? 'pt' : 'en';

          // Se é primeira vez (sem preferência salva), usar idioma do navegador
          const hasStoredPreference = localStorage.getItem(
            'opus-atlas-language'
          );
          if (!hasStoredPreference) {
            state.setLanguage(browserLang);
          }
        }
      },
    }
  )
);

// Cache para traduções
export const TranslationCache = {
  get: (key: string, targetLang: Language): string | null => {
    return translationCache.get(`${key}_${targetLang}`) || null;
  },

  set: (key: string, targetLang: Language, translation: string): void => {
    translationCache.set(`${key}_${targetLang}`, translation);
  },

  clear: (): void => {
    translationCache.clear();
  },

  size: (): number => {
    return translationCache.size;
  },
};
