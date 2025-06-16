// app/libs/auth.ts (versão completa e corrigida)
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
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email e senha são obrigatórios');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
          select: {
            id: true,
            firstName: true,
            lastName: true,
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
      // Handle Google sign-in
      if (account?.provider === 'google') {
        try {
          // Check if user exists
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! },
          });

          if (!existingUser) {
            // Create new user from Google profile with proper typing
            const googleProfile = profile as {
              given_name?: string;
              family_name?: string;
            };

            await prisma.user.create({
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
          }

          return true;
        } catch (error) {
          console.error('Google sign-in error:', error);
          return false;
        }
      }

      return true;
    },
    async jwt({ token, user, account }) {
      // Initial sign in
      if (account && user) {
        return {
          ...token,
          id: user.id,
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
      }

      // Return previous token if the access token has not expired yet
      return token;
    },
    async session({ session, token }) {
      // Get fresh user data from database
      if (token.id) {
        const user = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
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

        if (user) {
          session.user = {
            ...session.user,
            id: user.id,
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
        }
      }

      return session;
    },
  },
  pages: {
    signIn: '/', // Redirect to home page with modal
    error: '/', // Redirect to home page with error
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development', // Adicionar debug para desenvolvimento
};
