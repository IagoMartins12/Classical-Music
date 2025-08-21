import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useRouter } from 'next/navigation';

export type Language = 'pt' | 'en';

interface LanguageState {
  language: Language;
  isTranslating: boolean;
  setLanguage: (language: Language) => void;
  setTranslating: (translating: boolean) => void;
  toggleLanguage: () => void;
}

// Função para salvar no cookie
function setCookieLanguage(language: Language) {
  if (typeof document === 'undefined') return;

  const cookieValue = JSON.stringify({
    state: { language },
    version: 0,
  });

  document.cookie = `opus-atlas-language=${encodeURIComponent(
    cookieValue
  )}; path=/; max-age=${365 * 24 * 60 * 60}; SameSite=Lax`;
}

// Função para ler do cookie
function getCookieLanguage(): Language | null {
  if (typeof document === 'undefined') return null;

  try {
    const cookies = document.cookie.split(';');
    const languageCookie = cookies.find((cookie) =>
      cookie.trim().startsWith('opus-atlas-language=')
    );

    if (!languageCookie) return null;

    const cookieValue = decodeURIComponent(languageCookie.split('=')[1]);
    const parsed = JSON.parse(cookieValue);

    return parsed.state?.language || null;
  } catch {
    return null;
  }
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      language: 'pt',
      isTranslating: false,

      setLanguage: (language: Language) => {
        const currentLanguage = get().language;

        if (currentLanguage !== language) {
          set({ language });
          setCookieLanguage(language);
        }
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
      onRehydrateStorage: () => (state) => {
        if (state && typeof window !== 'undefined') {
          const cookieLanguage = getCookieLanguage();
          if (cookieLanguage && cookieLanguage !== state.language) {
            state.setLanguage(cookieLanguage);
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

  const setLanguageWithRefresh = (language: Language) => {
    const currentLanguage = store.language;

    if (currentLanguage !== language) {
      store.setTranslating(true);
      store.setLanguage(language);

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
    setLanguage: setLanguageWithRefresh,
    toggleLanguage: toggleLanguageWithRefresh,
    changeLanguage: setLanguageWithRefresh,
    onModalComplete: handleModalComplete, // ✅ Callback para o modal
  };
}
