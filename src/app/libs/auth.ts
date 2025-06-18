// app/libs/auth.ts (alternativa - forçar refresh sempre para imagem)
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
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! },
          });

          if (!existingUser) {
            const googleProfile = profile as {
              given_name?: string;
              family_name?: string;
            };

            const newUser = await prisma.user.create({
              data: {
                email: user.email!,
                firstName:
                  googleProfile?.given_name || user.name?.split(' ')[0] || '',
                lastName:
                  googleProfile?.family_name ||
                  user.name?.split(' ').slice(1).join(' ') ||
                  '',
                image: user.image,
                role: 0,
                onboardingCompleted: false,
                profilePublic: true,
                showLocation: false,
              },
            });

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
          }

          return true;
        } catch (error) {
          console.error('Google sign-in error:', error);
          return false;
        }
      }

      return true;
    },

    async jwt({ token, user, account, trigger }) {
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
            // Importante: atualizar a imagem também
            picture: freshUser.image,
          };
        }
      }

      return token;
    },

    async session({ session, token }) {
      // SEMPRE buscar dados frescos do banco (para garantir dados atualizados)
      if (token.id) {
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
          },
        });

        if (user) {
          session.user = {
            id: user.id,
            email: user.email!,
            name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
            image: user.image, // Sempre pegará a imagem atualizada do banco
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
  },
  pages: {
    signIn: '/',
    error: '/',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 0, // Força update da sessão a cada requisição
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};
