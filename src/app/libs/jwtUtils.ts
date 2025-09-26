// app/libs/jwtUtils.ts - JWT com Refresh Token para Mobile
import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import prisma from './prismadb';

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;
const ACCESS_TOKEN_EXPIRE = '15m'; // Token de acesso curto
const REFRESH_TOKEN_EXPIRE = '7d'; // Refresh token mais longo

export interface MobileUserSession {
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
}

export interface JWTTokens {
  accessToken: string;
  refreshToken: string;
  user: MobileUserSession;
}

// Função para buscar dados de verificação (similar ao auth.ts)
async function getUserVerificationData(
  userId: string,
  isTeacher: boolean,
  isStudent: boolean
) {
  const result = {
    teacherVerified: null as boolean | null,
    studentInviteStatus: null as
      | 'PENDING'
      | 'ACCEPTED'
      | 'DECLINED'
      | 'EXPIRED'
      | null,
  };

  try {
    if (isTeacher) {
      const teacherProfile = await prisma.teacher.findUnique({
        where: { userId },
        select: { isVerified: true },
      });
      result.teacherVerified = teacherProfile?.isVerified || false;
    }

    if (isStudent) {
      const studentRelation = await prisma.teacherStudent.findFirst({
        where: {
          student: { userId },
          isActive: true,
        },
        select: { inviteStatus: true },
        orderBy: [{ inviteStatus: 'desc' }, { createdAt: 'desc' }],
      });
      result.studentInviteStatus = studentRelation?.inviteStatus || null;
    }

    return result;
  } catch (error) {
    console.error('Erro ao buscar dados de verificação:', error);
    return result;
  }
}

// Criar tokens JWT
export async function generateTokens(
  userId: string
): Promise<JWTTokens | null> {
  try {
    // Buscar dados completos do usuário
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        image: true,
        bio: true,
        role: true,
        onboardingCompleted: true,
        userType: true,
        phone: true,
        phoneCountryCode: true,
        phoneNumber: true,
        isStudent: true,
        isTeacher: true,
        favoriteComposerId: true,
        favoriteEpochId: true,
        experienceLevel: true,
        practiceTimePerWeek: true,
        profilePublic: true,
        showLocation: true,
        emailVerified: true,
      },
    });

    if (!user) return null;

    // Buscar dados de verificação
    const verificationData = await getUserVerificationData(
      user.id,
      user.isTeacher || false,
      user.isStudent || false
    );

    const sessionUser: MobileUserSession = {
      id: user.id,
      email: user.email!,
      firstName: user.firstName,
      lastName: user.lastName,
      image: user.image,
      bio: user.bio,
      role: user.role,
      onboardingCompleted: user.onboardingCompleted,
      userType: user.userType,
      phone: user.phone,
      phoneCountryCode: user.phoneCountryCode,
      phoneNumber: user.phoneNumber,
      isStudent: user.isStudent,
      isTeacher: user.isTeacher,
      teacherVerified: verificationData.teacherVerified,
      studentInviteStatus: verificationData.studentInviteStatus,
      favoriteComposerId: user.favoriteComposerId,
      favoriteEpochId: user.favoriteEpochId,
      experienceLevel: user.experienceLevel,
      practiceTimePerWeek: user.practiceTimePerWeek,
      profilePublic: user.profilePublic,
      showLocation: user.showLocation,
      emailVerified: user.emailVerified,
    };

    // Payload para o access token (dados básicos)
    const accessPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      type: 'access',
    };

    // Payload para o refresh token (só ID)
    const refreshPayload = {
      userId: user.id,
      type: 'refresh',
    };

    const accessToken = jwt.sign(accessPayload, JWT_SECRET, {
      expiresIn: ACCESS_TOKEN_EXPIRE,
    });

    const refreshToken = jwt.sign(refreshPayload, JWT_REFRESH_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRE,
    });

    // Salvar refresh token no banco (opcional, para invalidação)
    await prisma.user.update({
      where: { id: userId },
      data: {
        // Você pode adicionar campo refreshToken na tabela User se quiser controle total
        updatedAt: new Date(),
      },
    });

    return {
      accessToken,
      refreshToken,
      user: sessionUser,
    };
  } catch (error) {
    console.error('Erro ao gerar tokens:', error);
    return null;
  }
}

// Verificar access token
export function verifyAccessToken(
  token: string
): { userId: string; email: string; role: number } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    if (decoded.type !== 'access') {
      return null;
    }

    return {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };
  } catch {
    return null;
  }
}

// Verificar refresh token
export function verifyRefreshToken(token: string): { userId: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as any;

    if (decoded.type !== 'refresh') {
      return null;
    }

    return {
      userId: decoded.userId,
    };
  } catch {
    return null;
  }
}

// Renovar access token usando refresh token
export async function refreshAccessToken(
  refreshToken: string
): Promise<{ accessToken: string } | null> {
  try {
    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) return null;

    // Verificar se usuário ainda existe
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, role: true },
    });

    if (!user) return null;

    // Gerar novo access token
    const accessPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      type: 'access',
    };

    const accessToken = jwt.sign(accessPayload, JWT_SECRET, {
      expiresIn: ACCESS_TOKEN_EXPIRE,
    });

    return { accessToken };
  } catch (error) {
    console.error('Erro ao renovar token:', error);
    return null;
  }
}

// Extrair token do header Authorization
export function extractTokenFromHeader(request: NextRequest): string | null {
  const authorization = request.headers.get('authorization');
  if (!authorization?.startsWith('Bearer ')) {
    return null;
  }
  return authorization.substring(7);
}

// Buscar sessão completa do usuário mobile
export async function getMobileUserSession(
  userId: string
): Promise<MobileUserSession | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        image: true,
        bio: true,
        role: true,
        onboardingCompleted: true,
        userType: true,
        phone: true,
        phoneCountryCode: true,
        phoneNumber: true,
        isStudent: true,
        isTeacher: true,
        favoriteComposerId: true,
        favoriteEpochId: true,
        experienceLevel: true,
        practiceTimePerWeek: true,
        profilePublic: true,
        showLocation: true,
        emailVerified: true,
      },
    });

    if (!user) return null;

    // Buscar dados de verificação
    const verificationData = await getUserVerificationData(
      user.id,
      user.isTeacher || false,
      user.isStudent || false
    );

    return {
      id: user.id,
      email: user.email!,
      firstName: user.firstName,
      lastName: user.lastName,
      image: user.image,
      bio: user.bio,
      role: user.role,
      onboardingCompleted: user.onboardingCompleted,
      userType: user.userType,
      phone: user.phone,
      phoneCountryCode: user.phoneCountryCode,
      phoneNumber: user.phoneNumber,
      isStudent: user.isStudent,
      isTeacher: user.isTeacher,
      teacherVerified: verificationData.teacherVerified,
      studentInviteStatus: verificationData.studentInviteStatus,
      favoriteComposerId: user.favoriteComposerId,
      favoriteEpochId: user.favoriteEpochId,
      experienceLevel: user.experienceLevel,
      practiceTimePerWeek: user.practiceTimePerWeek,
      profilePublic: user.profilePublic,
      showLocation: user.showLocation,
      emailVerified: user.emailVerified,
    };
  } catch (error) {
    console.error('Erro ao buscar sessão mobile:', error);
    return null;
  }
}
