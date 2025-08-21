// utils/serverTranslation.ts
import { headers, cookies } from 'next/headers';
import { Language } from '@/app/stores/useLanguageStore';

export async function getServerLanguage(): Promise<Language> {
  try {
    // 1. Tentar ler do cookie (preferência salva)
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
      } catch (error) {
        console.warn('Erro ao parsear cookie de idioma:', error);
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

    // 3. Fallback para português
    return 'pt';
  } catch (error) {
    console.warn('Erro ao detectar idioma no servidor:', error);
    return 'pt';
  }
}
