// app/libs/auth.ts - VERSÃO ATUALIZADA com campos de telefone
import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import prisma from '@/app/libs/prismadb';
import { CustomPrismaAdapter } from './CustomPrismaAdapter';

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
          phoneNumber: user.phoneNumber,

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
