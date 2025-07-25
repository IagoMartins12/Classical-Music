// app/libs/customPrismaAdapter.ts - Adapter customizado com tipagem correta
import {
  Adapter,
  AdapterUser,
  AdapterAccount,
  AdapterSession,
} from 'next-auth/adapters';
import { PrismaClient } from '@prisma/client';

// Interfaces para compatibilidade com NextAuth
interface CreateUserData {
  name?: string | null;
  email: string;
  image?: string | null;
  emailVerified?: Date | null;
}

export function CustomPrismaAdapter(prisma: PrismaClient): Adapter {
  return {
    // Criar usuário com mapeamento correto dos campos
    createUser: async (user: CreateUserData): Promise<AdapterUser> => {
      console.log('🔧 CustomAdapter: Criando usuário:', user.email);

      // Separar nome completo em firstName e lastName
      const fullName = user.name || '';
      const nameParts = fullName.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      try {
        const createdUser = await prisma.user.create({
          data: {
            email: user.email,
            firstName: firstName,
            lastName: lastName,
            image: user.image,
            emailVerified: user.emailVerified
              ? new Date(user.emailVerified)
              : null,
            // Campos específicos para usuários Google
            role: 0,
            onboardingCompleted: false,
            profilePublic: true,
            showLocation: false,
            hashedPassword: null, // Google users não têm senha
          },
        });

        console.log('✅ CustomAdapter: Usuário criado:', createdUser.id);

        // Retornar no formato esperado pelo NextAuth
        return {
          id: createdUser.id,
          email: createdUser.email!,
          emailVerified: createdUser.emailVerified,
          name: `${createdUser.firstName || ''} ${
            createdUser.lastName || ''
          }`.trim(),
          image: createdUser.image,
        } as AdapterUser;
      } catch (error) {
        console.error('❌ CustomAdapter: Erro ao criar usuário:', error);
        throw error;
      }
    },

    // Buscar usuário por ID
    getUser: async (id: string): Promise<AdapterUser | null> => {
      try {
        const user = await prisma.user.findUnique({
          where: { id },
        });

        if (!user) return null;

        return {
          id: user.id,
          email: user.email!,
          emailVerified: user.emailVerified,
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
          image: user.image,
        } as AdapterUser;
      } catch (error) {
        console.error('❌ CustomAdapter: Erro ao buscar usuário:', error);
        return null;
      }
    },

    // Buscar usuário por email
    getUserByEmail: async (email: string): Promise<AdapterUser | null> => {
      try {
        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
        });

        if (!user) return null;

        return {
          id: user.id,
          email: user.email!,
          emailVerified: user.emailVerified,
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
          image: user.image,
        } as AdapterUser;
      } catch (error) {
        console.error(
          '❌ CustomAdapter: Erro ao buscar usuário por email:',
          error
        );
        return null;
      }
    },

    // Buscar usuário por conta OAuth
    getUserByAccount: async ({
      providerAccountId,
      provider,
    }: {
      providerAccountId: string;
      provider: string;
    }): Promise<AdapterUser | null> => {
      try {
        const account = await prisma.account.findUnique({
          where: {
            provider_providerAccountId: {
              provider,
              providerAccountId,
            },
          },
          include: { user: true },
        });

        if (!account || !account.user) return null;

        const user = account.user;

        return {
          id: user.id,
          email: user.email!,
          emailVerified: user.emailVerified,
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
          image: user.image,
        } as AdapterUser;
      } catch (error) {
        console.error(
          '❌ CustomAdapter: Erro ao buscar usuário por conta:',
          error
        );
        return null;
      }
    },

    // Atualizar usuário
    updateUser: async ({
      id,
      ...data
    }: Partial<AdapterUser> &
      Pick<AdapterUser, 'id'>): Promise<AdapterUser> => {
      try {
        // Separar nome se fornecido
        const updateData: any = { ...data };

        if (data.name) {
          const nameParts = data.name.trim().split(' ');
          updateData.firstName = nameParts[0] || '';
          updateData.lastName = nameParts.slice(1).join(' ') || '';
          delete updateData.name; // Remover campo name
        }

        if (data.emailVerified) {
          updateData.emailVerified = new Date(data.emailVerified);
        }

        const user = await prisma.user.update({
          where: { id },
          data: updateData,
        });

        return {
          id: user.id,
          email: user.email!,
          emailVerified: user.emailVerified,
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
          image: user.image,
        } as AdapterUser;
      } catch (error) {
        console.error('❌ CustomAdapter: Erro ao atualizar usuário:', error);
        throw error;
      }
    },

    // Deletar usuário
    deleteUser: async (userId: string): Promise<void> => {
      try {
        await prisma.user.delete({
          where: { id: userId },
        });
      } catch (error) {
        console.error('❌ CustomAdapter: Erro ao deletar usuário:', error);
        throw error;
      }
    },

    // Criar conta OAuth
    linkAccount: async (account: AdapterAccount): Promise<AdapterAccount> => {
      try {
        console.log(
          '🔗 CustomAdapter: Vinculando conta:',
          account.provider,
          account.providerAccountId
        );

        const createdAccount = await prisma.account.create({
          data: {
            userId: account.userId,
            type: account.type,
            provider: account.provider,
            providerAccountId: account.providerAccountId,
            refresh_token: account.refresh_token,
            access_token: account.access_token,
            expires_at: account.expires_at,
            token_type: account.token_type,
            scope: account.scope,
            id_token: account.id_token,
            session_state: account.session_state,
          },
        });

        console.log('✅ CustomAdapter: Conta vinculada com sucesso');

        return {
          id: createdAccount.id,
          userId: createdAccount.userId,
          type: createdAccount.type,
          provider: createdAccount.provider,
          providerAccountId: createdAccount.providerAccountId,
          refresh_token: createdAccount.refresh_token,
          access_token: createdAccount.access_token,
          expires_at: createdAccount.expires_at,
          token_type: createdAccount.token_type,
          scope: createdAccount.scope,
          id_token: createdAccount.id_token,
          session_state: createdAccount.session_state,
        } as AdapterAccount;
      } catch (error) {
        console.error('❌ CustomAdapter: Erro ao vincular conta:', error);
        throw error;
      }
    },

    // Desvincular conta
    unlinkAccount: async ({
      providerAccountId,
      provider,
    }: {
      providerAccountId: string;
      provider: string;
    }): Promise<AdapterAccount | undefined> => {
      try {
        const account = await prisma.account.delete({
          where: {
            provider_providerAccountId: {
              provider,
              providerAccountId,
            },
          },
        });

        return {
          id: account.id,
          userId: account.userId,
          type: account.type,
          provider: account.provider,
          providerAccountId: account.providerAccountId,
          refresh_token: account.refresh_token,
          access_token: account.access_token,
          expires_at: account.expires_at,
          token_type: account.token_type,
          scope: account.scope,
          id_token: account.id_token,
          session_state: account.session_state,
        } as AdapterAccount;
      } catch (error) {
        console.error('❌ CustomAdapter: Erro ao desvincular conta:', error);
        return undefined;
      }
    },

    // Criar sessão
    createSession: async ({
      sessionToken,
      userId,
      expires,
    }: {
      sessionToken: string;
      userId: string;
      expires: Date;
    }): Promise<AdapterSession> => {
      try {
        const session = await prisma.session.create({
          data: {
            sessionToken,
            userId,
            expires,
          },
        });

        return {
          id: session.id,
          sessionToken: session.sessionToken,
          userId: session.userId,
          expires: session.expires,
        } as AdapterSession;
      } catch (error) {
        console.error('❌ CustomAdapter: Erro ao criar sessão:', error);
        throw error;
      }
    },

    // Buscar e atualizar sessão
    getSessionAndUser: async (
      sessionToken: string
    ): Promise<{
      session: AdapterSession;
      user: AdapterUser;
    } | null> => {
      try {
        const session = await prisma.session.findUnique({
          where: { sessionToken },
          include: { user: true },
        });

        if (!session || !session.user) return null;

        return {
          session: {
            id: session.id,
            sessionToken: session.sessionToken,
            userId: session.userId,
            expires: session.expires,
          } as AdapterSession,
          user: {
            id: session.user.id,
            email: session.user.email!,
            emailVerified: session.user.emailVerified,
            name: `${session.user.firstName || ''} ${
              session.user.lastName || ''
            }`.trim(),
            image: session.user.image,
          } as AdapterUser,
        };
      } catch (error) {
        console.error('❌ CustomAdapter: Erro ao buscar sessão:', error);
        return null;
      }
    },

    // Atualizar sessão
    updateSession: async ({
      sessionToken,
      ...data
    }: Partial<AdapterSession> & Pick<AdapterSession, 'sessionToken'>): Promise<
      AdapterSession | null | undefined
    > => {
      try {
        const session = await prisma.session.update({
          where: { sessionToken },
          data,
        });

        return {
          id: session.id,
          sessionToken: session.sessionToken,
          userId: session.userId,
          expires: session.expires,
        } as AdapterSession;
      } catch (error) {
        console.error('❌ CustomAdapter: Erro ao atualizar sessão:', error);
        return null;
      }
    },

    // Deletar sessão
    deleteSession: async (
      sessionToken: string
    ): Promise<AdapterSession | null | undefined> => {
      try {
        const session = await prisma.session.delete({
          where: { sessionToken },
        });

        return {
          id: session.id,
          sessionToken: session.sessionToken,
          userId: session.userId,
          expires: session.expires,
        } as AdapterSession;
      } catch (error) {
        console.error('❌ CustomAdapter: Erro ao deletar sessão:', error);
        return null;
      }
    },
  };
}
