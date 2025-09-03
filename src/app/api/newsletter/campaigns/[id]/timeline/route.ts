// app/api/admin/newsletter/campaigns/[id]/timeline/route.ts
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

interface Params {
  id: string;
}

interface TimelineEvent {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
  icon: string;
  color: string;
  metadata?: any;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 2) {
      return NextResponse.json(
        { success: false, error: 'Acesso negado' },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Buscar campanha com dados básicos
    const campaign = await prisma.newsletterCampaign.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        createdAt: true,
        scheduledAt: true,
        sentAt: true,
        status: true,
        emailsSent: true,
        emailsDelivered: true,
        emailsOpened: true,
        emailsClicked: true,
        emailsBounced: true,
        emailsUnsubscribed: true,
        lastEditedAt: true,
      },
    });

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: 'Campanha não encontrada' },
        { status: 404 }
      );
    }

    const timelineEvents: TimelineEvent[] = [];

    // Evento de criação
    timelineEvents.push({
      id: 'created',
      type: 'CREATED',
      title: 'Campanha Criada',
      description: 'A campanha foi criada no sistema',
      timestamp: campaign.createdAt.toISOString(),
      icon: 'FiMail',
      color: 'accent-blue',
    });

    // Evento de última edição (se diferente da criação)
    if (campaign.lastEditedAt && campaign.lastEditedAt > campaign.createdAt) {
      timelineEvents.push({
        id: 'edited',
        type: 'EDITED',
        title: 'Campanha Editada',
        description: 'A campanha foi modificada',
        timestamp: campaign.lastEditedAt.toISOString(),
        icon: 'FiEdit',
        color: 'accent-amber',
      });
    }

    // Evento de agendamento
    if (campaign.scheduledAt) {
      timelineEvents.push({
        id: 'scheduled',
        type: 'SCHEDULED',
        title: 'Campanha Agendada',
        description: `Agendada para ${new Date(
          campaign.scheduledAt
        ).toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })}`,
        timestamp: campaign.scheduledAt.toISOString(),
        icon: 'FiClock',
        color: 'accent-purple',
      });
    }

    // Eventos de envio
    if (campaign.sentAt) {
      timelineEvents.push({
        id: 'sending',
        type: 'SENDING_STARTED',
        title: 'Envio Iniciado',
        description: `Iniciou o processo de envio para ${
          campaign.emailsSent || 0
        } subscribers`,
        timestamp: campaign.sentAt.toISOString(),
        icon: 'FiSend',
        color: 'accent-blue',
        metadata: {
          totalRecipients: campaign.emailsSent || 0,
        },
      });

      // Buscar eventos reais de email
      const emailEvents = await prisma.newsletterEmailEvent.findMany({
        where: {
          campaignId: id,
          eventType: {
            in: [
              'SENT',
              'DELIVERED',
              'OPENED',
              'CLICKED',
              'BOUNCED',
              'COMPLAINED',
              'UNSUBSCRIBED',
            ],
          },
        },
        orderBy: { timestamp: 'asc' },
        select: {
          eventType: true,
          timestamp: true,
          subscriberId: true,
        },
      });

      // Agrupar eventos por tipo e criar marcos importantes
      const eventGroups = groupEventsByType(emailEvents);

      // Primeira entrega
      if (eventGroups.DELIVERED && eventGroups.DELIVERED.length > 0) {
        timelineEvents.push({
          id: 'first-delivery',
          type: 'FIRST_DELIVERY',
          title: 'Primeira Entrega',
          description: 'Primeiro email foi entregue com sucesso',
          timestamp: eventGroups.DELIVERED[0].timestamp.toISOString(),
          icon: 'FiCheckCircle',
          color: 'accent-green',
        });
      }

      // Primeira abertura
      if (eventGroups.OPENED && eventGroups.OPENED.length > 0) {
        const firstOpen = eventGroups.OPENED[0];
        const timeSinceDelivery = campaign.sentAt
          ? Math.round(
              (firstOpen.timestamp.getTime() -
                new Date(campaign.sentAt).getTime()) /
                (1000 * 60)
            )
          : 0;

        timelineEvents.push({
          id: 'first-open',
          type: 'FIRST_OPEN',
          title: 'Primeira Abertura',
          description: `Primeiro subscriber abriu o email (${timeSinceDelivery} min após o envio)`,
          timestamp: firstOpen.timestamp.toISOString(),
          icon: 'FiActivity',
          color: 'accent-purple',
          metadata: {
            timeToOpen: `${timeSinceDelivery} minutos`,
          },
        });
      }

      // Primeiro clique
      if (eventGroups.CLICKED && eventGroups.CLICKED.length > 0) {
        const firstClick = eventGroups.CLICKED[0];
        const timeSinceDelivery = campaign.sentAt
          ? Math.round(
              (firstClick.timestamp.getTime() -
                new Date(campaign.sentAt).getTime()) /
                (1000 * 60 * 60)
            )
          : 0;

        timelineEvents.push({
          id: 'first-click',
          type: 'FIRST_CLICK',
          title: 'Primeiro Clique',
          description: `Primeiro subscriber clicou em um link (${timeSinceDelivery}h após o envio)`,
          timestamp: firstClick.timestamp.toISOString(),
          icon: 'FiTrendingUp',
          color: 'accent-green',
          metadata: {
            timeToClick: `${timeSinceDelivery} horas`,
          },
        });
      }

      // Marcos de performance
      const performanceMilestones = await calculatePerformanceMilestones(
        campaign,
        new Date(campaign.sentAt)
      );

      timelineEvents.push(...performanceMilestones);

      // Evento de conclusão do envio
      const completionTime = calculateCompletionTime(campaign.sentAt);
      timelineEvents.push({
        id: 'sending-completed',
        type: 'SENDING_COMPLETED',
        title: 'Envio Concluído',
        description: `Campanha enviada com sucesso. ${
          campaign.emailsDelivered || 0
        } entregues de ${campaign.emailsSent || 0} enviados`,
        timestamp: completionTime.toISOString(),
        icon: 'FiCheckCircle',
        color: 'accent-green',
        metadata: {
          deliveryRate:
            campaign.emailsSent > 0
              ? (
                  ((campaign.emailsDelivered || 0) / campaign.emailsSent) *
                  100
                ).toFixed(1) + '%'
              : '0%',
          bounceRate:
            campaign.emailsSent > 0
              ? (
                  ((campaign.emailsBounced || 0) / campaign.emailsSent) *
                  100
                ).toFixed(1) + '%'
              : '0%',
        },
      });

      // Problemas significativos
      if ((campaign.emailsBounced || 0) > (campaign.emailsSent || 0) * 0.05) {
        timelineEvents.push({
          id: 'high-bounce-rate',
          type: 'HIGH_BOUNCE_RATE',
          title: 'Taxa de Bounce Elevada',
          description: `${campaign.emailsBounced} emails retornaram (${(
            ((campaign.emailsBounced || 0) / (campaign.emailsSent || 1)) *
            100
          ).toFixed(1)}%)`,
          timestamp: completionTime.toISOString(),
          icon: 'FiAlertTriangle',
          color: 'accent-red',
          metadata: {
            bounceCount: campaign.emailsBounced,
            bounceRate:
              (
                ((campaign.emailsBounced || 0) / (campaign.emailsSent || 1)) *
                100
              ).toFixed(1) + '%',
          },
        });
      }
    }

    // Ordenar eventos por timestamp
    timelineEvents.sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    // Calcular estatísticas da timeline
    const stats = {
      totalEvents: timelineEvents.length,
      daysSinceCreated: Math.ceil(
        (Date.now() - campaign.createdAt.getTime()) / (1000 * 60 * 60 * 24)
      ),
      daysSinceSent: campaign.sentAt
        ? Math.ceil(
            (Date.now() - new Date(campaign.sentAt).getTime()) /
              (1000 * 60 * 60 * 24)
          )
        : null,
      timeToFirstOpen:
        campaign.sentAt && campaign.emailsOpened > 0 ? '15min' : null, // Simulado
      currentPhase: getCurrentPhase(campaign),
    };

    return NextResponse.json({
      success: true,
      timelineData: timelineEvents,
      stats,
      campaign: {
        id: campaign.id,
        name: campaign.name,
        status: campaign.status,
      },
    });
  } catch (error) {
    console.error('Erro ao buscar timeline da campanha:', error);

    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Funções auxiliares
function groupEventsByType(events: any[]) {
  return events.reduce((groups, event) => {
    if (!groups[event.eventType]) {
      groups[event.eventType] = [];
    }
    groups[event.eventType].push(event);
    return groups;
  }, {} as Record<string, any[]>);
}

async function calculatePerformanceMilestones(
  campaign: any,
  sentDate: Date
): Promise<TimelineEvent[]> {
  const milestones: TimelineEvent[] = [];
  const totalDelivered = campaign.emailsDelivered || 0;

  // Marco de 25% de taxa de abertura
  if (campaign.emailsOpened && campaign.emailsOpened >= totalDelivered * 0.25) {
    const milestoneTime = new Date(sentDate);
    milestoneTime.setHours(milestoneTime.getHours() + 2); // Simular 2h depois

    milestones.push({
      id: 'milestone-25-opens',
      type: 'MILESTONE_OPENS_25',
      title: 'Marco: 25% de Aberturas',
      description: `Atingiu 25% de taxa de abertura (${campaign.emailsOpened} aberturas)`,
      timestamp: milestoneTime.toISOString(),
      icon: 'FiBarChart2',
      color: 'accent-green',
      metadata: {
        openCount: campaign.emailsOpened,
        openRate:
          ((campaign.emailsOpened / totalDelivered) * 100).toFixed(1) + '%',
      },
    });
  }

  // Marco de alta performance (>40% abertura)
  if (campaign.emailsOpened && campaign.emailsOpened >= totalDelivered * 0.4) {
    const milestoneTime = new Date(sentDate);
    milestoneTime.setHours(milestoneTime.getHours() + 6);

    milestones.push({
      id: 'milestone-high-performance',
      type: 'HIGH_PERFORMANCE',
      title: 'Alta Performance Atingida',
      description: `Excelente taxa de abertura: ${(
        (campaign.emailsOpened / totalDelivered) *
        100
      ).toFixed(1)}%`,
      timestamp: milestoneTime.toISOString(),
      icon: 'FiTrendingUp',
      color: 'accent-green',
      metadata: {
        openRate:
          ((campaign.emailsOpened / totalDelivered) * 100).toFixed(1) + '%',
        performance: 'Alta',
      },
    });
  }

  return milestones;
}

function calculateCompletionTime(sentAt: Date): Date {
  // Simular que o envio leva entre 30 minutos a 2 horas
  const completionTime = new Date(sentAt);
  completionTime.setHours(completionTime.getHours() + 1); // 1 hora depois por padrão
  return completionTime;
}

function getCurrentPhase(campaign: any): string {
  switch (campaign.status) {
    case 'DRAFT':
      return 'Preparação';
    case 'SCHEDULED':
      return 'Aguardando Envio';
    case 'SENDING':
      return 'Enviando';
    case 'SENT':
      if (campaign.sentAt) {
        const daysSinceSent = Math.ceil(
          (Date.now() - new Date(campaign.sentAt).getTime()) /
            (1000 * 60 * 60 * 24)
        );
        if (daysSinceSent <= 1) return 'Monitoramento Inicial';
        if (daysSinceSent <= 7) return 'Análise de Performance';
        return 'Arquivo';
      }
      return 'Finalizada';
    case 'PAUSED':
      return 'Pausada';
    case 'CANCELLED':
      return 'Cancelada';
    case 'FAILED':
      return 'Com Falha';
    default:
      return 'Desconhecida';
  }
}
