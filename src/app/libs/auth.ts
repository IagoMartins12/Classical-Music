// app/libs/auth.ts - Versão melhorada com debug
import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import bcrypt from 'bcryptjs';
import prisma from '@/app/libs/prismadb';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
          scope: 'openid email profile', // Mais explícito
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
            city: true,
            state: true,
            country: true,
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
          city: user.city,
          state: user.state,
          country: user.country,
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
    async signIn({ user, account, profile }) {
      console.log('🔐 SignIn callback:', {
        provider: account?.provider,
        userId: user.id,
        email: user.email,
      });

      if (account?.provider === 'google') {
        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! },
          });

          if (!existingUser) {
            console.log('👤 Criando novo usuário Google:', user.email);

            const googleProfile = profile as {
              given_name?: string;
              family_name?: string;
              picture?: string;
            };

            const newUser = await prisma.user.create({
              data: {
                email: user.email!.toLowerCase(),
                firstName:
                  googleProfile?.given_name || user.name?.split(' ')[0] || '',
                lastName:
                  googleProfile?.family_name ||
                  user.name?.split(' ').slice(1).join(' ') ||
                  '',
                image: googleProfile?.picture || user.image,
                role: 0,
                onboardingCompleted: false,
                profilePublic: true,
                showLocation: false,
                emailVerified: new Date(), // Google emails são pré-verificados
              },
            });

            console.log('✅ Usuário Google criado:', newUser.id);

            // Atualizar dados temporários do usuário para os callbacks seguintes
            user.id = newUser.id;
            user.firstName = newUser.firstName;
            user.lastName = newUser.lastName;
            user.bio = newUser.bio;
            user.role = newUser.role;
            user.onboardingCompleted = newUser.onboardingCompleted;
            user.userType = newUser.userType;
            user.city = newUser.city;
            user.state = newUser.state;
            user.country = newUser.country;
            user.favoriteComposerId = newUser.favoriteComposerId;
            user.favoriteEpochId = newUser.favoriteEpochId;
            user.experienceLevel = newUser.experienceLevel;
            user.practiceTimePerWeek = newUser.practiceTimePerWeek;
            user.profilePublic = newUser.profilePublic;
            user.showLocation = newUser.showLocation;
          } else {
            console.log('👤 Usuário Google existente:', existingUser.id);

            // Atualizar imagem se mudou
            if (user.image && user.image !== existingUser.image) {
              await prisma.user.update({
                where: { id: existingUser.id },
                data: { image: user.image },
              });
            }
          }

          return true;
        } catch (error) {
          console.error('❌ Erro no Google sign-in:', error);
          return false;
        }
      }

      return true;
    },

    async jwt({ token, user, account, trigger }) {
      console.log('🔑 JWT callback:', {
        trigger,
        hasUser: !!user,
        tokenId: token.id,
      });

      // Initial sign in
      if (account && user) {
        return {
          ...token,
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          bio: user.bio,
          role: user.role,
          onboardingCompleted: user.onboardingCompleted,
          userType: user.userType,
          city: user.city,
          state: user.state,
          country: user.country,
          favoriteComposerId: user.favoriteComposerId,
          favoriteEpochId: user.favoriteEpochId,
          experienceLevel: user.experienceLevel,
          practiceTimePerWeek: user.practiceTimePerWeek,
          profilePublic: user.profilePublic,
          showLocation: user.showLocation,
        };
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
            city: true,
            state: true,
            country: true,
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
            city: freshUser.city,
            state: freshUser.state,
            country: freshUser.country,
            favoriteComposerId: freshUser.favoriteComposerId,
            favoriteEpochId: freshUser.favoriteEpochId,
            experienceLevel: freshUser.experienceLevel,
            practiceTimePerWeek: freshUser.practiceTimePerWeek,
            profilePublic: freshUser.profilePublic,
            showLocation: freshUser.showLocation,
            emailVerified: freshUser.emailVerified,
            picture: freshUser.image, // Atualizar imagem
          };
        }
      }

      return token;
    },

    async session({ session, token }) {
      console.log('📱 Session callback:', {
        tokenId: token.id,
        email: session.user?.email,
      });

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
            city: true,
            state: true,
            country: true,
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
            city: user.city,
            state: user.state,
            country: user.country,
            favoriteComposerId: user.favoriteComposerId,
            favoriteEpochId: user.favoriteEpochId,
            experienceLevel: user.experienceLevel,
            practiceTimePerWeek: user.practiceTimePerWeek,
            profilePublic: user.profilePublic,
            showLocation: user.showLocation,
          };
        }
      }

      return session;
    },

    // Callback para redirecionar após login/registro
    async redirect({ url, baseUrl }) {
      console.log('🔀 Redirect callback:', { url, baseUrl });

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
    updateAge: 24 * 60 * 60, // 24 hours - atualiza sessão a cada 24h
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
  // Configurações de log em desenvolvimento
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

// Utilitário para verificar se Google OAuth está configurado
export const isGoogleOAuthConfigured = () => {
  return !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
};

// Utilitário para verificar configuração geral
export const isAuthConfigured = () => {
  return !!(
    process.env.NEXTAUTH_SECRET &&
    process.env.NEXTAUTH_URL &&
    process.env.DATABASE_URL &&
    isGoogleOAuthConfigured()
  );
};
