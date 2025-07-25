import { authOptions } from '@/app/libs/auth';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import prisma from '@/app/libs/prismadb';

// app/api/admin/newsletter/backup/[id]/restore/route.ts
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 2) {
      return NextResponse.json(
        { success: false, error: 'Acesso negado' },
        { status: 403 }
      );
    }

    const { id } = params;
    const backupsDir = path.join(process.cwd(), 'backups', 'newsletter');
    const backupFile = path.join(backupsDir, `${id}.json`);

    try {
      const content = await fs.readFile(backupFile, 'utf-8');
      const backupData = JSON.parse(content);

      // Iniciar processo de restauração
      const result = await restoreNewsletterData(backupData);

      return NextResponse.json({
        success: true,
        message: 'Backup restaurado com sucesso',
        result,
      });
    } catch (error) {
      console.error('Erro na restauração:', error);
      return NextResponse.json(
        { success: false, error: 'Erro na restauração do backup' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Erro ao restaurar backup:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/**
 * Função para restaurar dados da newsletter
 */
async function restoreNewsletterData(backupData: any) {
  const result = {
    subscribersRestored: 0,
    campaignsRestored: 0,
    templatesRestored: 0,
    eventsRestored: 0,
    settingsRestored: 0,
    errors: [] as string[],
  };

  try {
    // Usar transação para garantir consistência
    await prisma.$transaction(async (tx) => {
      // 1. Limpar dados existentes (opcional - pode ser configurável)
      // await tx.newsletterSubscriber.deleteMany();
      // await tx.newsletterCampaign.deleteMany();
      // await tx.newsletterTemplate.deleteMany();
      // await tx.newsletterEmailEvent.deleteMany();
      // await tx.newsletterSettings.deleteMany();

      // 2. Restaurar subscribers
      if (backupData.subscribers && Array.isArray(backupData.subscribers)) {
        for (const subscriber of backupData.subscribers) {
          try {
            // Remover campos que podem causar conflito
            const {
              id: _id,
              createdAt: _createdAt,
              updatedAt: _updatedAt,
              user: _user,
              ...subscriberData
            } = subscriber;

            await tx.newsletterSubscriber.upsert({
              where: { email: subscriber.email },
              update: subscriberData,
              create: {
                ...subscriberData,
                id: undefined, // Deixar o Prisma gerar novo ID
              },
            });
            result.subscribersRestored++;
          } catch (error) {
            result.errors.push(
              `Erro ao restaurar subscriber ${subscriber.email}: ${error}`
            );
          }
        }
      }

      // 3. Restaurar templates
      if (backupData.templates && Array.isArray(backupData.templates)) {
        for (const template of backupData.templates) {
          try {
            const {
              id: _id,
              createdAt: _createdAt,
              updatedAt: _updatedAt,
              creator: _creator,
              ...templateData
            } = template;

            await tx.newsletterTemplate.create({
              data: {
                ...templateData,
                creatorId: '1', // ID do admin atual
              },
            });
            result.templatesRestored++;
          } catch (error) {
            result.errors.push(
              `Erro ao restaurar template ${template.name}: ${error}`
            );
          }
        }
      }

      // 4. Restaurar campanhas
      if (backupData.campaigns && Array.isArray(backupData.campaigns)) {
        for (const campaign of backupData.campaigns) {
          try {
            const {
              id: _id,
              createdAt: _createdAt,
              updatedAt: _updatedAt,
              template: _template,
              creator: _creator,
              ...campaignData
            } = campaign;

            // Encontrar template correspondente ou usar o primeiro disponível
            const existingTemplate = await tx.newsletterTemplate.findFirst();

            if (existingTemplate) {
              await tx.newsletterCampaign.create({
                data: {
                  ...campaignData,
                  templateId: existingTemplate.id,
                  creatorId: '1', // ID do admin atual
                },
              });
              result.campaignsRestored++;
            }
          } catch (error) {
            result.errors.push(
              `Erro ao restaurar campanha ${campaign.name}: ${error}`
            );
          }
        }
      }

      // 5. Restaurar eventos (apenas os mais recentes para não sobrecarregar)
      if (backupData.events && Array.isArray(backupData.events)) {
        const recentEvents = backupData.events.slice(0, 1000); // Limitar a 1000 eventos

        for (const event of recentEvents) {
          try {
            const { id: _id, ...eventData } = event;

            await tx.newsletterEmailEvent.create({
              data: eventData,
            });
            result.eventsRestored++;
          } catch (error) {
            result.errors.push(`Erro ao restaurar evento: ${error}`);
          }
        }
      }

      // 6. Restaurar configurações
      if (backupData.settings && Array.isArray(backupData.settings)) {
        for (const setting of backupData.settings) {
          try {
            await tx.newsletterSettings.upsert({
              where: { key: setting.key },
              update: { value: setting.value },
              create: setting,
            });
            result.settingsRestored++;
          } catch (error) {
            result.errors.push(
              `Erro ao restaurar configuração ${setting.key}: ${error}`
            );
          }
        }
      }
    });
  } catch (error) {
    console.error('Erro na transação de restauração:', error);
    throw new Error('Falha na restauração dos dados');
  }

  return result;
}
