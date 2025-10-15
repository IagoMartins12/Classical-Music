// app/libs/hybridAuth.ts - Verificação Híbrida Otimizada (NextAuth + JWT)
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth';
import {
  extractTokenFromHeader,
  verifyAccessToken,
  getMobileUserSession,
} from './jwtUtils';

export interface HybridSession {
  user: {
    id: string;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
    image?: string | null;
    bio?: string | null;
    role: number;
    onboardingCompleted?: boolean | null;
    userType?: string | null;
    phone?: string | null;
    phoneCountryCode?: string | null;
    phoneNumber?: string | null;
    favoriteComposerId?: string | null;
    favoriteEpochId?: string | null;
    experienceLevel?: string | null;
    practiceTimePerWeek?: number | null;
    profilePublic?: boolean | null;
    showLocation?: boolean | null;
    isStudent?: boolean | null;
    isTeacher?: boolean | null;
    teacherVerified?: boolean | null;
    studentInviteStatus?: string | null;
    emailVerified?: Date | null;
  };
  type: 'nextauth' | 'jwt';
}

// Função SUPER OTIMIZADA de verificação híbrida baseada nos headers
export async function getHybridSession(
  request: NextRequest
): Promise<HybridSession | null> {
  try {
    // STEP 1: Detectar tipo pelos headers (ZERO overhead)
    const hasAuthorizationHeader = request.headers.has('authorization');
    const hasCookies = request.headers.has('cookie');

    // STEP 2: Se tem Authorization Bearer -> JWT Mobile (mais rápido)
    if (hasAuthorizationHeader) {
      const token = extractTokenFromHeader(request);
      if (token) {
        const decoded = verifyAccessToken(token);
        if (decoded) {
          // Buscar sessão completa do usuário mobile
          const mobileUser = await getMobileUserSession(decoded.userId);
          if (mobileUser) {
            return {
              user: mobileUser,
              type: 'jwt',
            };
          }
        }
      }
    }

    // STEP 3: Se tem cookies -> NextAuth Web (só se não teve JWT válido)
    if (hasCookies) {
      const session = await getServerSession(authOptions);
      if (session?.user?.id) {
        return {
          user: {
            id: session.user.id,
            email: session.user.email!,
            firstName: session.user.firstName,
            lastName: session.user.lastName,
            image: session.user.image,
            bio: session.user.bio,
            role: session.user.role,
            onboardingCompleted: session.user.onboardingCompleted,
            userType: session.user.userType,
            phone: session.user.phone,
            phoneCountryCode: session.user.phoneCountryCode,
            phoneNumber: session.user.phoneNumber,
            favoriteComposerId: session.user.favoriteComposerId,
            favoriteEpochId: session.user.favoriteEpochId,
            experienceLevel: session.user.experienceLevel,
            practiceTimePerWeek: session.user.practiceTimePerWeek,
            profilePublic: session.user.profilePublic,
            showLocation: session.user.showLocation,
            isStudent: session.user.isStudent,
            isTeacher: session.user.isTeacher,
            teacherVerified: session.user.teacherVerified,
            studentInviteStatus: session.user.studentInviteStatus,
            emailVerified: session.user.emailVerified,
          },
          type: 'nextauth',
        };
      }
    }

    return null;
  } catch (error) {
    console.error('Erro na verificação híbrida:', error);
    return null;
  }
}

// Função de conveniência para verificar apenas se está autenticado (ainda mais rápida)
export async function isAuthenticated(request: NextRequest): Promise<boolean> {
  try {
    // JWT check (super rápido)
    const hasAuthorizationHeader = request.headers.has('authorization');
    if (hasAuthorizationHeader) {
      const token = extractTokenFromHeader(request);
      if (token) {
        const decoded = verifyAccessToken(token);
        return !!decoded;
      }
    }

    // NextAuth check (só se necessário)
    const hasCookies = request.headers.has('cookie');
    if (hasCookies) {
      const session = await getServerSession(authOptions);
      return !!session?.user?.id;
    }

    return false;
  } catch {
    return false;
  }
}

// Função para verificar permissões de role
export async function hasRole(
  request: NextRequest,
  requiredRole: number
): Promise<boolean> {
  try {
    const session = await getHybridSession(request);
    return session ? session.user.role >= requiredRole : false;
  } catch {
    return false;
  }
}

// Função para verificar se é professor
export async function isTeacher(request: NextRequest): Promise<boolean> {
  return hasRole(request, 1);
}

// Função para verificar se é admin
export async function isAdmin(request: NextRequest): Promise<boolean> {
  return hasRole(request, 2);
}

// Helper para extrair user ID rapidamente (sem dados completos)
export async function getUserId(request: NextRequest): Promise<string | null> {
  try {
    // JWT (mais rápido)
    const hasAuthorizationHeader = request.headers.has('authorization');
    if (hasAuthorizationHeader) {
      const token = extractTokenFromHeader(request);
      if (token) {
        const decoded = verifyAccessToken(token);
        return decoded?.userId || null;
      }
    }

    // NextAuth
    const hasCookies = request.headers.has('cookie');
    if (hasCookies) {
      const session = await getServerSession(authOptions);
      return session?.user?.id || null;
    }

    return null;
  } catch {
    return null;
  }
}

// Middleware helper para usar nas rotas de API
export function withAuth(
  handler: (request: NextRequest, session: HybridSession) => Promise<Response>
) {
  return async (request: NextRequest) => {
    const session = await getHybridSession(request);

    if (!session) {
      return new Response(JSON.stringify({ error: 'Não autorizado' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return handler(request, session);
  };
}

// Middleware para verificar role específico
export function withRole(
  requiredRole: number,
  handler: (request: NextRequest, session: HybridSession) => Promise<Response>
) {
  return async (request: NextRequest) => {
    const session = await getHybridSession(request);

    if (!session) {
      return new Response(JSON.stringify({ error: 'Não autorizado' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (session.user.role < requiredRole) {
      return new Response(JSON.stringify({ error: 'Acesso negado' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return handler(request, session);
  };
}

// Função para debug (só em desenvolvimento)
export async function debugAuthState(request: NextRequest): Promise<void> {
  if (process.env.NODE_ENV !== 'development') return;

  console.log('🔍 [AUTH DEBUG] Headers:', {
    hasAuthorization: request.headers.has('authorization'),
    hasCookie: request.headers.has('cookie'),
    userAgent: request.headers.get('user-agent')?.substring(0, 50),
  });

  const session = await getHybridSession(request);
  console.log('🔍 [AUTH DEBUG] Session:', {
    authenticated: !!session,
    type: session?.type,
    userId: session?.user?.id,
    role: session?.user?.role,
  });
}
