import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Detectar idioma preferido se não há cookie
  if (!request.cookies.has('opus-atlas-language')) {
    const acceptLanguage = request.headers.get('accept-language');
    const preferredLang = acceptLanguage
      ?.split(',')[0]
      .split('-')[0]
      .toLowerCase();

    const language = preferredLang === 'pt' ? 'pt' : 'en';

    // Definir cookie padrão
    response.cookies.set(
      'opus-atlas-language',
      JSON.stringify({
        state: { language },
        version: 0,
      }),
      {
        maxAge: 365 * 24 * 60 * 60, // 1 ano
        path: '/',
      }
    );
  }

  return response;
}
