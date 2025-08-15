// app/libs/auth.ts - VERSÃO ATUALIZADA com verificação teacher/student
import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import prisma from '@/app/libs/prismadb';
import { CustomPrismaAdapter } from './CustomPrismaAdapter';

// 🆕 FUNÇÃO PARA BUSCAR DADOS DE VERIFICAÇÃO TEACHER/STUDENT
async function getUserVerificationData(userId: string, isTeacher: boolean) {
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
    // 🔥 SÓ BUSCAR SE O USUÁRIO FOR TEACHER OU STUDENT (performance)
    if (isTeacher) {
      console.log('🔍 Buscando dados de verificação do teacher para:', userId);
      const teacherProfile = await prisma.teacher.findUnique({
        where: { userId },
        select: { isVerified: true },
      });
      result.teacherVerified = teacherProfile?.isVerified || false;
      console.log('✅ Teacher verification status:', result.teacherVerified);
    } else {
      console.log('🔍 Buscando dados de convite do student para:', userId);
      // Buscar o status do convite mais recente (ACCEPTED tem prioridade)
      const studentRelation = await prisma.teacherStudent.findFirst({
        where: {
          student: { userId },
          isActive: true,
        },
        select: { inviteStatus: true },
        orderBy: [
          { inviteStatus: 'desc' }, // ACCEPTED vem antes
          { createdAt: 'desc' }, // Mais recente primeiro
        ],
      });
      result.studentInviteStatus = studentRelation?.inviteStatus || null;
      console.log('✅ Student invite status:', result.studentInviteStatus);
    }

    return result;
  } catch (error) {
    console.error('❌ Erro ao buscar dados de verificação:', error);
    // Em caso de erro, não bloquear login
    return result;
  }
}

export const authOptions: NextAuthOptions = {
  adapter: CustomPrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
          scope: 'openid email profile',
        },
      },
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email e senha são obrigatórios');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            bio: true,
            email: true,
            hashedPassword: true,
            image: true,
            role: true,
            onboardingCompleted: true,
            userType: true,

            // 🆕 CAMPOS DE LOCALIZAÇÃO
            city: true,
            state: true,
            country: true,

            // 🆕 CAMPOS DE TELEFONE
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

        if (!user || !user.hashedPassword) {
          throw new Error('Email ou senha incorretos');
        }

        const isValidPassword = await bcrypt.compare(
          credentials.password,
          user.hashedPassword
        );

        if (!isValidPassword) {
          throw new Error('Email ou senha incorretos');
        }

        // 🆕 BUSCAR DADOS DE VERIFICAÇÃO SE NECESSÁRIO
        const verificationData = await getUserVerificationData(
          user.id,
          user.isTeacher || false
        );

        console.log('VERIFICATION DATA');

        return {
          id: user.id,
          email: user.email!,
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
          image: user.image,
          bio: user.bio,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          onboardingCompleted: user.onboardingCompleted,
          userType: user.userType,

          // 🆕 CAMPOS DE LOCALIZAÇÃO
          city: user.city,
          state: user.state,
          country: user.country,

          // 🆕 CAMPOS DE TELEFONE
          phone: user.phone,
          phoneCountryCode: user.phoneCountryCode,
          isStudent: user.isStudent,
          isTeacher: user.isTeacher,
          phoneNumber: user.phoneNumber,

          // 🆕 CAMPOS DE VERIFICAÇÃO
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
      },
    }),
  ],
  callbacks: {
    async signIn({ account }) {
      // Para contas Google, sempre permitir
      // O CustomPrismaAdapter vai lidar com a criação/vinculação
      if (account?.provider === 'google') {
        console.log('✅ Login Google permitido, adapter vai processar');
        return true;
      }

      // Para outros providers, comportamento padrão
      return true;
    },

    async jwt({ token, user, trigger }) {
      // Initial sign in - user object is available
      if (user) {
        console.log('🔑 Initial JWT creation for:', user.email);

        // Buscar dados completos do usuário no banco
        const fullUser = await prisma.user.findUnique({
          where: { email: user.email! },
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

            // 🆕 CAMPOS DE LOCALIZAÇÃO
            city: true,
            state: true,
            country: true,

            // 🆕 CAMPOS DE TELEFONE
            phone: true,
            phoneCountryCode: true,
            isStudent: true,
            isTeacher: true,
            phoneNumber: true,

            favoriteComposerId: true,
            favoriteEpochId: true,
            experienceLevel: true,
            practiceTimePerWeek: true,
            profilePublic: true,
            showLocation: true,
            emailVerified: true,
          },
        });

        if (fullUser) {
          // 🆕 BUSCAR DADOS DE VERIFICAÇÃO SE NECESSÁRIO
          const verificationData = await getUserVerificationData(
            fullUser.id,
            fullUser.isTeacher || false
          );

          return {
            ...token,
            id: fullUser.id,
            firstName: fullUser.firstName,
            lastName: fullUser.lastName,
            bio: fullUser.bio,
            role: fullUser.role,
            onboardingCompleted: fullUser.onboardingCompleted,
            userType: fullUser.userType,

            // 🆕 CAMPOS DE LOCALIZAÇÃO
            city: fullUser.city,
            state: fullUser.state,
            country: fullUser.country,

            // 🆕 CAMPOS DE TELEFONE
            phone: fullUser.phone,
            phoneCountryCode: fullUser.phoneCountryCode,
            phoneNumber: fullUser.phoneNumber,
            isStudent: fullUser.isStudent,
            isTeacher: fullUser.isTeacher,

            // 🆕 CAMPOS DE VERIFICAÇÃO
            teacherVerified: verificationData.teacherVerified,
            studentInviteStatus: verificationData.studentInviteStatus,

            favoriteComposerId: fullUser.favoriteComposerId,
            favoriteEpochId: fullUser.favoriteEpochId,
            experienceLevel: fullUser.experienceLevel,
            practiceTimePerWeek: fullUser.practiceTimePerWeek,
            profilePublic: fullUser.profilePublic,
            showLocation: fullUser.showLocation,
            emailVerified: fullUser.emailVerified,
            picture: fullUser.image,
          };
        }
      }

      // Se for um update, buscar dados frescos do banco
      if (trigger === 'update' && token.id) {
        console.log('🔄 Atualizando token do usuário:', token.id);

        const freshUser = await prisma.user.findUnique({
          where: { id: token.id as string },
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

            // 🆕 CAMPOS DE LOCALIZAÇÃO
            city: true,
            state: true,
            country: true,

            // 🆕 CAMPOS DE TELEFONE
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

        if (freshUser) {
          // 🆕 BUSCAR DADOS DE VERIFICAÇÃO ATUALIZADOS
          const verificationData = await getUserVerificationData(
            freshUser.id,
            freshUser.isTeacher || false
          );

          return {
            ...token,
            firstName: freshUser.firstName,
            lastName: freshUser.lastName,
            bio: freshUser.bio,
            role: freshUser.role,
            onboardingCompleted: freshUser.onboardingCompleted,
            userType: freshUser.userType,

            // 🆕 CAMPOS DE LOCALIZAÇÃO
            city: freshUser.city,
            state: freshUser.state,
            country: freshUser.country,

            // 🆕 CAMPOS DE TELEFONE
            phone: freshUser.phone,
            phoneCountryCode: freshUser.phoneCountryCode,
            phoneNumber: freshUser.phoneNumber,
            isStudent: freshUser.isStudent,
            isTeacher: freshUser.isTeacher,

            // 🆕 CAMPOS DE VERIFICAÇÃO ATUALIZADOS
            teacherVerified: verificationData.teacherVerified,
            studentInviteStatus: verificationData.studentInviteStatus,

            favoriteComposerId: freshUser.favoriteComposerId,
            favoriteEpochId: freshUser.favoriteEpochId,
            experienceLevel: freshUser.experienceLevel,
            practiceTimePerWeek: freshUser.practiceTimePerWeek,
            profilePublic: freshUser.profilePublic,
            showLocation: freshUser.showLocation,
            emailVerified: freshUser.emailVerified,
            picture: freshUser.image,
          };
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (token.id) {
        // Buscar dados sempre atualizados do banco
        const user = await prisma.user.findUnique({
          where: { id: token.id as string },
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

            // 🆕 CAMPOS DE LOCALIZAÇÃO
            city: true,
            state: true,
            country: true,

            // 🆕 CAMPOS DE TELEFONE
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

        if (user) {
          // 🆕 BUSCAR DADOS DE VERIFICAÇÃO PARA SESSÃO
          const verificationData = await getUserVerificationData(
            user.id,
            user.isTeacher || false
          );

          session.user = {
            id: user.id,
            email: user.email!,
            name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
            image: user.image,
            firstName: user.firstName,
            lastName: user.lastName,
            bio: user.bio,
            role: user.role,
            onboardingCompleted: user.onboardingCompleted,
            userType: user.userType,

            // 🆕 CAMPOS DE LOCALIZAÇÃO
            city: user.city,
            state: user.state,
            country: user.country,

            // 🆕 CAMPOS DE TELEFONE
            phone: user.phone,
            phoneCountryCode: user.phoneCountryCode,
            phoneNumber: user.phoneNumber,
            isStudent: user.isStudent,
            isTeacher: user.isTeacher,

            // 🆕 CAMPOS DE VERIFICAÇÃO
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
        }
      }

      return session;
    },

    // Callback para redirecionar após login/registro
    async redirect({ url, baseUrl }) {
      // Se está vindo do callback do Google
      if (url.includes('/api/auth/callback/google')) {
        return baseUrl; // Redireciona para a home
      }

      // Para outras situações, usar comportamento padrão
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;

      return baseUrl;
    },
  },
  pages: {
    signIn: '/', // Página customizada de login (seus modals)
    error: '/', // Página de erro customizada
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
  logger: {
    error(code, metadata) {
      console.error('❌ NextAuth Error:', code, metadata);
    },
    warn(code) {
      console.warn('⚠️ NextAuth Warning:', code);
    },
    debug(code, metadata) {
      if (process.env.NODE_ENV === 'development') {
        console.log('🐛 NextAuth Debug:', code, metadata);
      }
    },
  },
};

// 🆕 NOVO: Função para verificar se email foi registrado com senha
export const checkEmailRegistrationMethod = async (email: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        hashedPassword: true,
        emailVerified: true,
      },
    });

    if (!user) {
      return { exists: false, method: null };
    }

    return {
      exists: true,
      method: user.hashedPassword ? 'password' : 'google',
      isVerified: !!user.emailVerified,
    };
  } catch (error) {
    console.error('Erro ao verificar método de registro:', error);
    return { exists: false, method: null };
  }
};

// Utilitários existentes
export const isGoogleOAuthConfigured = () => {
  return !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
};

export const isAuthConfigured = () => {
  return !!(
    process.env.NEXTAUTH_SECRET &&
    process.env.NEXTAUTH_URL &&
    process.env.DATABASE_URL &&
    isGoogleOAuthConfigured()
  );
};
