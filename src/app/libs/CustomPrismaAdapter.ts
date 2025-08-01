// app/libs/CustomPrismaAdapter.ts - VERSÃO ATUALIZADA com campos de telefone
import {
  Adapter,
  AdapterUser,
  AdapterAccount,
  AdapterSession,
} from 'next-auth/adapters';
import { PrismaClient } from '@prisma/client';
import { sendTemplateEmail } from './newsletter/email';

interface CreateUserData {
  name?: string | null;
  email: string;
  image?: string | null;
  emailVerified?: Date | null;
}

export function CustomPrismaAdapter(prisma: PrismaClient): Adapter {
  return {
    // 🆕 ATUALIZADO: createUser com detecção de registro novo
    createUser: async (user: CreateUserData): Promise<AdapterUser> => {
      console.log('🔧 CustomAdapter: Processando usuário Google:', user.email);

      // 🆕 PRIMEIRO: Verificar se usuário já existe
      const existingUser = await prisma.user.findUnique({
        where: { email: user.email },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          image: true,
          emailVerified: true,

          // 🆕 CAMPOS DE LOCALIZAÇÃO
          city: true,
          state: true,
          country: true,

          // 🆕 CAMPOS DE TELEFONE
          phone: true,
          phoneCountryCode: true,
          phoneNumber: true,
        },
      });

      if (existingUser) {
        console.log('👤 Usuário já existe - fazendo login:', existingUser.id);

        // Limpar flags será feito no cliente pelo GoogleRegistrationHandler
        console.log('👤 Usuário existente fazendo login via Google');

        return {
          id: existingUser.id,
          email: existingUser.email!,
          emailVerified: existingUser.emailVerified,
          name: `${existingUser.firstName || ''} ${
            existingUser.lastName || ''
          }`.trim(),
          image: existingUser.image,

          // 🆕 CAMPOS DE LOCALIZAÇÃO
          city: existingUser.city,
          state: existingUser.state,
          country: existingUser.country,

          // 🆕 CAMPOS DE TELEFONE
          phone: existingUser.phone,
          phoneCountryCode: existingUser.phoneCountryCode,
          phoneNumber: existingUser.phoneNumber,
        } as AdapterUser;
      }

      // 🆕 SE CHEGOU AQUI: É um registro novo
      console.log('🆕 Criando nova conta Google para:', user.email);

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
              : new Date(), // Google users já têm email verificado
            role: 0,
            onboardingCompleted: false,
            profilePublic: true,
            showLocation: false,
            hashedPassword: null, // Google users não têm senha

            // 🆕 CAMPOS DE LOCALIZAÇÃO (valores padrão null)
            city: null,
            state: null,
            country: null,

            // 🆕 CAMPOS DE TELEFONE (valores padrão null)
            phone: null,
            phoneCountryCode: null,
            phoneNumber: null,
          },
        });

        console.log('✅ Nova conta Google criada:', createdUser.id);

        // A marcação no sessionStorage será feita no cliente pelo RegisterModal

        // Enviar email de boas-vindas para usuários novos
        try {
          console.log(
            '📧 Enviando email de boas-vindas para nova conta Google...'
          );

          const emailResult = await sendTemplateEmail(user.email, {
            type: 'ACCOUNT_CONFIRMATION',
            variables: {
              firstName: firstName || 'Usuário',
              userName: firstName || 'Usuário',
              loginMethod: 'Google',
              onboardingUrl: `${
                process.env.NEXTAUTH_URL || 'http://localhost:3000'
              }/?onboarding=true`,
              supportUrl: `${
                process.env.NEXTAUTH_URL || 'http://localhost:3000'
              }/support`,
            },
          });

          if (emailResult.success) {
            console.log('✅ Email de boas-vindas enviado com sucesso');
          } else {
            console.error(
              '❌ Falha no envio do email de boas-vindas:',
              emailResult.error
            );
          }
        } catch (emailError) {
          console.error('❌ Erro ao enviar email de boas-vindas:', emailError);
        }

        return {
          id: createdUser.id,
          email: createdUser.email!,
          emailVerified: createdUser.emailVerified,
          name: `${createdUser.firstName || ''} ${
            createdUser.lastName || ''
          }`.trim(),
          image: createdUser.image,

          // 🆕 CAMPOS DE LOCALIZAÇÃO
          city: createdUser.city,
          state: createdUser.state,
          country: createdUser.country,

          // 🆕 CAMPOS DE TELEFONE
          phone: createdUser.phone,
          phoneCountryCode: createdUser.phoneCountryCode,
          phoneNumber: createdUser.phoneNumber,
        } as AdapterUser;
      } catch (error) {
        console.error('❌ CustomAdapter: Erro ao criar usuário Google:', error);

        // Em caso de race condition (usuário criado entre a verificação e a criação)
        if (error instanceof Error && error.message.includes('duplicate key')) {
          console.log(
            '🔄 Race condition detectada, buscando usuário existente...'
          );

          const raceUser = await prisma.user.findUnique({
            where: { email: user.email },
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              image: true,
              emailVerified: true,

              // 🆕 CAMPOS DE LOCALIZAÇÃO
              city: true,
              state: true,
              country: true,

              // 🆕 CAMPOS DE TELEFONE
              phone: true,
              phoneCountryCode: true,
              phoneNumber: true,
            },
          });

          if (raceUser) {
            console.log(
              '✅ Usuário encontrado após race condition:',
              raceUser.id
            );

            return {
              id: raceUser.id,
              email: raceUser.email!,
              emailVerified: raceUser.emailVerified,
              name: `${raceUser.firstName || ''} ${
                raceUser.lastName || ''
              }`.trim(),
              image: raceUser.image,

              // 🆕 CAMPOS DE LOCALIZAÇÃO
              city: raceUser.city,
              state: raceUser.state,
              country: raceUser.country,

              // 🆕 CAMPOS DE TELEFONE
              phone: raceUser.phone,
              phoneCountryCode: raceUser.phoneCountryCode,
              phoneNumber: raceUser.phoneNumber,
            } as AdapterUser;
          }
        }

        throw error;
      }
    },

    // Buscar usuário por ID
    getUser: async (id: string): Promise<AdapterUser | null> => {
      try {
        const user = await prisma.user.findUnique({
          where: { id },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            image: true,
            emailVerified: true,

            // 🆕 CAMPOS DE LOCALIZAÇÃO
            city: true,
            state: true,
            country: true,

            // 🆕 CAMPOS DE TELEFONE
            phone: true,
            phoneCountryCode: true,
            phoneNumber: true,
          },
        });

        if (!user) return null;

        return {
          id: user.id,
          email: user.email!,
          emailVerified: user.emailVerified,
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
          image: user.image,

          // 🆕 CAMPOS DE LOCALIZAÇÃO
          city: user.city,
          state: user.state,
          country: user.country,

          // 🆕 CAMPOS DE TELEFONE
          phone: user.phone,
          phoneCountryCode: user.phoneCountryCode,
          phoneNumber: user.phoneNumber,
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
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            image: true,
            emailVerified: true,

            // 🆕 CAMPOS DE LOCALIZAÇÃO
            city: true,
            state: true,
            country: true,

            // 🆕 CAMPOS DE TELEFONE
            phone: true,
            phoneCountryCode: true,
            phoneNumber: true,
          },
        });

        if (!user) return null;

        return {
          id: user.id,
          email: user.email!,
          emailVerified: user.emailVerified,
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
          image: user.image,

          // 🆕 CAMPOS DE LOCALIZAÇÃO
          city: user.city,
          state: user.state,
          country: user.country,

          // 🆕 CAMPOS DE TELEFONE
          phone: user.phone,
          phoneCountryCode: user.phoneCountryCode,
          phoneNumber: user.phoneNumber,
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
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                image: true,
                emailVerified: true,

                // 🆕 CAMPOS DE LOCALIZAÇÃO
                city: true,
                state: true,
                country: true,

                // 🆕 CAMPOS DE TELEFONE
                phone: true,
                phoneCountryCode: true,
                phoneNumber: true,
              },
            },
          },
        });

        if (!account || !account.user) return null;

        const user = account.user;

        return {
          id: user.id,
          email: user.email!,
          emailVerified: user.emailVerified,
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
          image: user.image,

          // 🆕 CAMPOS DE LOCALIZAÇÃO
          city: user.city,
          state: user.state,
          country: user.country,

          // 🆕 CAMPOS DE TELEFONE
          phone: user.phone,
          phoneCountryCode: user.phoneCountryCode,
          phoneNumber: user.phoneNumber,
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
        const updateData: any = { ...data };

        if (data.name) {
          const nameParts = data.name.trim().split(' ');
          updateData.firstName = nameParts[0] || '';
          updateData.lastName = nameParts.slice(1).join(' ') || '';
          delete updateData.name;
        }

        if (data.emailVerified) {
          updateData.emailVerified = new Date(data.emailVerified);
        }

        const user = await prisma.user.update({
          where: { id },
          data: updateData,
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            image: true,
            emailVerified: true,

            // 🆕 CAMPOS DE LOCALIZAÇÃO
            city: true,
            state: true,
            country: true,

            // 🆕 CAMPOS DE TELEFONE
            phone: true,
            phoneCountryCode: true,
            phoneNumber: true,
          },
        });

        return {
          id: user.id,
          email: user.email!,
          emailVerified: user.emailVerified,
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
          image: user.image,

          // 🆕 CAMPOS DE LOCALIZAÇÃO
          city: user.city,
          state: user.state,
          country: user.country,

          // 🆕 CAMPOS DE TELEFONE
          phone: user.phone,
          phoneCountryCode: user.phoneCountryCode,
          phoneNumber: user.phoneNumber,
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
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                image: true,
                emailVerified: true,

                // 🆕 CAMPOS DE LOCALIZAÇÃO
                city: true,
                state: true,
                country: true,

                // 🆕 CAMPOS DE TELEFONE
                phone: true,
                phoneCountryCode: true,
                phoneNumber: true,
              },
            },
          },
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

            // 🆕 CAMPOS DE LOCALIZAÇÃO
            city: session.user.city,
            state: session.user.state,
            country: session.user.country,

            // 🆕 CAMPOS DE TELEFONE
            phone: session.user.phone,
            phoneCountryCode: session.user.phoneCountryCode,
            phoneNumber: session.user.phoneNumber,
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
