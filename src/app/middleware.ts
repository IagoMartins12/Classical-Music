// middleware.ts - VERSÃO ATUALIZADA COM LOGGING
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const { pathname } = request.nextUrl;

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

  // SISTEMA DE LOGGING INTEGRADO
  // Lista de rotas que não precisam de logging detalhado
  const skipLogging = [
    '/favicon.ico',
    '/_next/',
    '/api/health',
    '/api/auth/session', // Evitar spam de logs
  ];

  const shouldSkip = skipLogging.some((path) => pathname.startsWith(path));

  // Se for uma rota de API e não deve ser ignorada, preparar para logging
  if (pathname.startsWith('/api') && !shouldSkip) {
    try {
      const startTime = Date.now();

      // Tentar obter dados do usuário
      let userData = null;
      try {
        const token = await getToken({
          req: request,
          secret: process.env.NEXTAUTH_SECRET,
        });

        if (token) {
          userData = {
            userId: token.sub,
            userName:
              token.firstName && token.lastName
                ? `${token.firstName} ${token.lastName}`
                : token.email,
            userRole: token.role || 0,
          };
        }
      } catch (error) {
        // Falha silenciosa na obtenção do token
        console.warn('Failed to get token in middleware:', error);
      }

      // Construir contexto para logging
      const requestContext = {
        path: pathname,
        userAgent: request.headers.get('user-agent') || 'unknown',
        ipAddress:
          request.headers.get('x-forwarded-for') ||
          request.headers.get('x-real-ip') ||
          'unknown',
        referer: request.headers.get('referer'),
        ...userData,
        traceId: `req_${startTime}_${Math.random().toString(36).substring(2)}`,
      };

      // Adicionar headers para que as APIs possam usar
      response.headers.set('x-request-start', startTime.toString());
      response.headers.set('x-request-context', JSON.stringify(requestContext));
      response.headers.set('x-trace-id', requestContext.traceId);
    } catch (error) {
      // Em caso de erro no middleware, não quebrar a aplicação
      console.error('Middleware logging error:', error);
    }
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
