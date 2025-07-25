// app/api/admin/newsletter/campaigns/[id]/send/route.ts
import { authOptions } from '@/app/libs/auth';
import { sendBulkEmail } from '@/app/libs/newsletter/email';
import prisma from '@/app/libs/prismadb';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

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

    // Buscar campanha
    const campaign = await prisma.newsletterCampaign.findUnique({
      where: { id },
      include: {
        template: true,
      },
    });

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: 'Campanha não encontrada' },
        { status: 404 }
      );
    }

    if (campaign.status !== 'DRAFT' && campaign.status !== 'SCHEDULED') {
      return NextResponse.json(
        {
          success: false,
          error: 'Campanha já foi enviada ou está em processo',
        },
        { status: 400 }
      );
    }

    // Atualizar status para SENDING
    await prisma.newsletterCampaign.update({
      where: { id },
      data: {
        status: 'SENDING',
        sentAt: new Date(),
      },
    });

    // Iniciar processo de envio em background
    // Aqui você pode usar uma queue (Bull, BullMQ, etc.) ou processar diretamente
    await startCampaignSending(id);

    return NextResponse.json({
      success: true,
      message: 'Envio da campanha iniciado',
    });
  } catch (error) {
    console.error('Erro ao enviar campanha:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Função para processar envio de campanha
async function startCampaignSending(campaignId: string) {
  try {
    const campaign = await prisma.newsletterCampaign.findUnique({
      where: { id: campaignId },
      include: {
        template: true,
      },
    });

    if (!campaign) {
      throw new Error('Campanha não encontrada');
    }

    // Buscar subscribers ativos
    const subscribers = await prisma.newsletterSubscriber.findMany({
      where: {
        status: 'ACTIVE',
        // Aplicar filtros de segmentação se houver
        ...(campaign.targetSegments
          ? JSON.parse(campaign.targetSegments as string)
          : {}),
      },
    });

    // Atualizar contagem total
    await prisma.newsletterCampaign.update({
      where: { id: campaignId },
      data: {
        totalSubscribers: subscribers.length,
      },
    });

    // Importar função de envio em lote

    // Preparar dados para envio
    const recipients = subscribers.map((sub) => ({
      email: sub.email,
      variables: {
        firstName: sub.firstName || 'Usuário',
        email: sub.email,
        unsubscribeUrl: `${process.env.NEXTAUTH_URL}/api/newsletter/unsubscribe?token=${sub.unsubscribeToken}`,
      },
    }));

    // Enviar emails em lote
    const result = await sendBulkEmail(
      recipients,
      {
        type: campaign.template ? campaign.template.type : 'DEFAULT',
        variables: {
          // Variáveis do template baseadas no tipo
          ...getTemplateVariables(
            campaign.template ? campaign.template.type : 'DEFAULT'
          ),
          campaignId: campaign.id,
        },
      },
      {
        batchSize: 50,
        delay: 2000, // 2 segundos entre batches
        onProgress: async (sent) => {
          // Atualizar progresso no banco
          await prisma.newsletterCampaign.update({
            where: { id: campaignId },
            data: {
              emailsSent: sent,
            },
          });
        },
      }
    );

    // Atualizar campanha com resultados finais
    await prisma.newsletterCampaign.update({
      where: { id: campaignId },
      data: {
        status: result.failed === 0 ? 'SENT' : 'FAILED',
        emailsSent: result.success,
        emailsDelivered: result.success, // Assumindo entrega imediata
        // Salvar erros se houver
        ...(result.errors.length > 0
          ? { notes: JSON.stringify(result.errors) }
          : {}),
      },
    });
  } catch (error) {
    console.error('Erro no envio da campanha:', error);

    // Marcar campanha como falhada
    await prisma.newsletterCampaign.update({
      where: { id: campaignId },
      data: {
        status: 'FAILED',
        notes: error instanceof Error ? error.message : 'Erro desconhecido',
      },
    });
  }
}

// Função para obter variáveis do template baseadas no tipo
function getTemplateVariables(templateType: string) {
  switch (templateType) {
    case 'WEEKLY_DIGEST':
      return {
        newComposers: 5,
        newWorks: 12,
        newScores: 8,
        activeUsers: 150,
        featuredComposer: {
          name: 'Ludwig van Beethoven',
          period: '1770-1827',
          description:
            'Compositor alemão considerado um dos maiores da história.',
          url: `${process.env.NEXTAUTH_URL}/composers/beethoven`,
        },
        popularWorks: [
          {
            title: 'Sonata ao Luar',
            composer: 'Beethoven',
            instrument: 'Piano',
            description: 'Uma das sonatas mais conhecidas para piano.',
            url: `${process.env.NEXTAUTH_URL}/works/moonlight-sonata`,
          },
        ],
        studyTip: {
          title: 'Técnica de Dedilhado',
          content:
            'Pratique escalas lentamente para desenvolver força e precisão nos dedos.',
        },
        siteUrl: process.env.NEXTAUTH_URL,
      };

    case 'NEW_COMPOSER':
      return {
        composerName: 'Nome do Compositor',
        composerPeriod: 'Período',
        composerNationality: 'Nacionalidade',
        composerBio: 'Biografia do compositor',
        composerUrl: `${process.env.NEXTAUTH_URL}/composers/novo`,
        works: [],
        musicalFact: 'Curiosidade musical interessante',
      };

    default:
      return {
        siteUrl: process.env.NEXTAUTH_URL,
      };
  }
}
