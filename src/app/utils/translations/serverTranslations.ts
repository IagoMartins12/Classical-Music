// The language of a server request, read from the cookie the language store
// writes, then from the browser's Accept-Language. (The keyed texts that used
// to load from `public/translations` are modules now: `conteudo/textos`.)
import { headers, cookies } from 'next/headers';

export type Language = 'pt' | 'en';

// CONFIGURAÇÃO PRINCIPAL - Mude aqui para trocar idioma padrão do build
const DEFAULT_BUILD_LANGUAGE: Language = 'pt'; // 🔧 Troque para 'en' se quiser inglês no build

/**
 * Detecta o idioma do pedido lendo o cookie da preferência e, sem ele, o
 * `Accept-Language`.
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

/** Para build estático: sempre o idioma padrão configurado. */
export function getBuildLanguage(): Language {
  return DEFAULT_BUILD_LANGUAGE;
}
