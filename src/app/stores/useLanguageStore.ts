import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useRouter } from 'next/navigation';
import React from 'react';

export type Language = 'pt' | 'en';

interface LanguageState {
  language: Language;
  isTranslating: boolean;
  hasUserPreference: boolean; // 🆕 Flag para indicar se usuário fez escolha manual
  setLanguage: (language: Language, isUserChoice?: boolean) => void;
  setTranslating: (translating: boolean) => void;
  toggleLanguage: () => void;
  initializeFromSystem: () => void; // 🆕 Método para inicializar do sistema
}

// Função para detectar linguagem do sistema
function getSystemLanguage(): Language {
  if (typeof navigator === 'undefined') return 'pt';

  const browserLang = navigator.language || navigator.languages?.[0] || 'pt';

  // Detecta se é português (pt, pt-BR, pt-PT, etc.) ou inglês
  return browserLang.toLowerCase().startsWith('pt') ? 'pt' : 'en';
}

// Função para salvar no cookie
function setCookieLanguage(language: Language, hasUserPreference: boolean) {
  if (typeof document === 'undefined') return;

  const cookieValue = JSON.stringify({
    state: { language, hasUserPreference },
    version: 0,
  });

  document.cookie = `opus-atlas-language=${encodeURIComponent(
    cookieValue
  )}; path=/; max-age=${365 * 24 * 60 * 60}; SameSite=Lax`;
}

// Função para ler do cookie
function getCookieData(): {
  language: Language | null;
  hasUserPreference: boolean;
} {
  if (typeof document === 'undefined')
    return { language: null, hasUserPreference: false };

  try {
    const cookies = document.cookie.split(';');
    const languageCookie = cookies.find((cookie) =>
      cookie.trim().startsWith('opus-atlas-language=')
    );

    if (!languageCookie) return { language: null, hasUserPreference: false };

    const cookieValue = decodeURIComponent(languageCookie.split('=')[1]);
    const parsed = JSON.parse(cookieValue);

    return {
      language: parsed.state?.language || null,
      hasUserPreference: parsed.state?.hasUserPreference || false,
    };
  } catch {
    return { language: null, hasUserPreference: false };
  }
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      language: 'pt', // Padrão temporário
      isTranslating: false,
      hasUserPreference: false,

      setLanguage: (language: Language, isUserChoice = true) => {
        const currentLanguage = get().language;
        const currentHasUserPreference = get().hasUserPreference;

        if (
          currentLanguage !== language ||
          currentHasUserPreference !== isUserChoice
        ) {
          set({
            language,
            hasUserPreference: isUserChoice,
          });
          setCookieLanguage(language, isUserChoice);
        }
      },

      setTranslating: (translating: boolean) => {
        set({ isTranslating: translating });
      },

      toggleLanguage: () => {
        const current = get().language;
        const newLanguage: Language = current === 'pt' ? 'en' : 'pt';
        get().setLanguage(newLanguage, true); // 🆕 Sempre marca como escolha do usuário
      },

      // 🆕 Método para inicializar do sistema
      initializeFromSystem: () => {
        const { hasUserPreference } = get();

        // Se usuário já fez uma escolha manual, não alterar
        if (hasUserPreference) return;

        const systemLanguage = getSystemLanguage();
        const currentLanguage = get().language;

        // Se a linguagem do sistema é diferente da atual, atualizar
        if (systemLanguage !== currentLanguage) {
          set({ language: systemLanguage });
          setCookieLanguage(systemLanguage, false);
        }
      },
    }),
    {
      name: 'opus-atlas-language',
      onRehydrateStorage: () => (state) => {
        if (state && typeof window !== 'undefined') {
          const cookieData = getCookieData();

          if (cookieData.language) {
            // Se há dados no cookie, usar eles
            state.setLanguage(
              cookieData.language,
              cookieData.hasUserPreference
            );
          } else {
            // Se não há dados salvos, usar linguagem do sistema
            const systemLanguage = getSystemLanguage();
            state.setLanguage(systemLanguage, false);
          }
        }
      },
    }
  )
);

// ✅ Hook principal com router.refresh() e timing controlado
export function useLanguageWithRefresh() {
  const router = useRouter();
  const store = useLanguageStore();

  // 🆕 Inicializar do sistema no mount (apenas se não há preferência do usuário)
  React.useEffect(() => {
    store.initializeFromSystem();
  }, []);

  const setLanguageWithRefresh = (language: Language) => {
    const currentLanguage = store.language;

    if (currentLanguage !== language) {
      store.setTranslating(true);
      store.setLanguage(language, true); // Marca como escolha do usuário

      // ✅ Executar refresh em background, mas deixar modal controlar a finalização
      setTimeout(() => {
        router.refresh();
        // ✅ NÃO setar isTranslating como false aqui - deixar o modal controlar
      }, 500); // Pequeno delay para garantir que cookie foi salvo
    }
  };

  const toggleLanguageWithRefresh = () => {
    const newLanguage = store.language === 'pt' ? 'en' : 'pt';
    setLanguageWithRefresh(newLanguage);
  };

  // ✅ Callback para quando modal completar
  const handleModalComplete = () => {
    store.setTranslating(false);
  };

  return {
    language: store.language,
    isTranslating: store.isTranslating,
    hasUserPreference: store.hasUserPreference, // 🆕 Exposar flag
    setLanguage: setLanguageWithRefresh,
    toggleLanguage: toggleLanguageWithRefresh,
    changeLanguage: setLanguageWithRefresh,
    onModalComplete: handleModalComplete,
  };
}
