// app/libs/newsletterAutomation.ts
import prisma from '../prismadb';
import { sendTemplateEmail } from './email';

interface AutomationRule {
  id: string;
  name: string;
  type: 'WELCOME' | 'DRIP_CAMPAIGN' | 'BEHAVIOR_TRIGGER' | 'SCHEDULED';
  isActive: boolean;
  conditions: any;
  actions: any;
  schedule?: string; // Cron expression
}

interface AutomationTrigger {
  type:
    | 'USER_SUBSCRIBED'
    | 'EMAIL_OPENED'
    | 'EMAIL_CLICKED'
    | 'TIME_BASED'
    | 'NEW_CONTENT';
  data: any;
}

/**
 * Sistema de automação da newsletter
 */
export class NewsletterAutomation {
  private static instance: NewsletterAutomation;
  private rules: Map<string, AutomationRule> = new Map();

  static getInstance(): NewsletterAutomation {
    if (!NewsletterAutomation.instance) {
      NewsletterAutomation.instance = new NewsletterAutomation();
    }
    return NewsletterAutomation.instance;
  }

  /**
   * Inicializar automações
   */
  async initialize() {
    console.log('Inicializando sistema de automação da newsletter...');

    // Carregar regras do banco de dados
    await this.loadAutomationRules();

    // Configurar tarefas agendadas
    this.setupScheduledTasks();

    console.log(`${this.rules.size} regras de automação carregadas`);
  }

  /**
   * Carregar regras de automação do banco
   */
  private async loadAutomationRules() {
    try {
      // Por enquanto, vamos definir algumas regras padrão
      // Em um sistema real, estas viriam do banco de dados
      const defaultRules: AutomationRule[] = [
        {
          id: 'welcome-email',
          name: 'Email de Boas-vindas',
          type: 'WELCOME',
          isActive: true,
          conditions: {
            trigger: 'USER_SUBSCRIBED',
            delay: 0, // Imediato
          },
          actions: {
            sendEmail: {
              templateType: 'WELCOME',
              delay: 0,
            },
          },
        },
        {
          id: 'weekly-digest',
          name: 'Newsletter Semanal',
          type: 'SCHEDULED',
          isActive: true,
          conditions: {
            trigger: 'TIME_BASED',
          },
          actions: {
            sendEmail: {
              templateType: 'WEEKLY_DIGEST',
            },
          },
          schedule: '0 10 * * 1', // Segunda-feira às 10h
        },
        {
          id: 'new-composer-notification',
          name: 'Notificação de Novo Compositor',
          type: 'BEHAVIOR_TRIGGER',
          isActive: true,
          conditions: {
            trigger: 'NEW_CONTENT',
            contentType: 'COMPOSER',
          },
          actions: {
            sendEmail: {
              templateType: 'NEW_COMPOSER',
              delay: 3600, // 1 hora após adição
            },
          },
        },
      ];

      defaultRules.forEach((rule) => {
        this.rules.set(rule.id, rule);
      });
    } catch (error) {
      console.error('Erro ao carregar regras de automação:', error);
    }
  }

  /**
   * Configurar tarefas agendadas
   */
  private setupScheduledTasks() {
    // Em um ambiente de produção, você usaria uma lib como node-cron
    // ou um sistema de filas como Bull/BullMQ

    // Exemplo com setInterval (substitua por uma solução mais robusta)
    setInterval(() => {
      this.processScheduledAutomations();
    }, 60000); // Verificar a cada minuto

    // Processar automações baseadas em comportamento
    setInterval(() => {
      this.processBehaviorTriggers();
    }, 30000); // Verificar a cada 30 segundos
  }

  /**
   * Processar automações agendadas
   */
  private async processScheduledAutomations() {
    const now = new Date();

    for (const rule of this.rules.values()) {
      if (rule.type === 'SCHEDULED' && rule.isActive && rule.schedule) {
        // Verificar se é hora de executar (simplificado)
        if (this.shouldExecuteSchedule(rule.schedule, now)) {
          await this.executeAutomation(rule, {
            type: 'TIME_BASED',
            data: { timestamp: now.toISOString() },
          });
        }
      }
    }
  }

  /**
   * Processar triggers de comportamento
   */
  private async processBehaviorTriggers() {
    // Verificar novos compositores adicionados
    await this.checkForNewComposers();

    // Verificar outras triggers de comportamento
    await this.checkForNewWorks();
  }

  /**
   * Verificar novos compositores
   */
  private async checkForNewComposers() {
    try {
      // Buscar compositores adicionados nas últimas 2 horas
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

      const newComposers = await prisma.composer.findMany({
        where: {
          createdAt: {
            gte: twoHoursAgo,
          },
        },
        take: 5, // Limitar para não sobrecarregar
      });

      for (const composer of newComposers) {
        await this.triggerAutomation({
          type: 'NEW_CONTENT',
          data: {
            contentType: 'COMPOSER',
            composer: {
              id: composer.id,
              name: composer.name,
              fullName: composer.fullName,
              bio: composer.bio,
              epochName: composer.epochName,
              birthDate: composer.birthDate,
              deathDate: composer.deathDate,
            },
          },
        });
      }
    } catch (error) {
      console.error('Erro ao verificar novos compositores:', error);
    }
  }

  /**
   * Verificar novas obras
   */
  private async checkForNewWorks() {
    try {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

      const newWorks = await prisma.work.findMany({
        where: {
          createdAt: {
            gte: twoHoursAgo,
          },
        },
        include: {
          composer: true,
          instrument: true,
        },
        take: 10,
      });

      if (newWorks.length > 0) {
        await this.triggerAutomation({
          type: 'NEW_CONTENT',
          data: {
            contentType: 'WORKS',
            works: newWorks.map((work) => ({
              id: work.id,
              title: work.title,
              composer: work.composer.name,
              instrument: work.instrument.name,
              year: work.compositionYear,
            })),
          },
        });
      }
    } catch (error) {
      console.error('Erro ao verificar novas obras:', error);
    }
  }

  /**
   * Disparar automação baseada em trigger
   */
  async triggerAutomation(trigger: AutomationTrigger) {
    for (const rule of this.rules.values()) {
      if (rule.isActive && this.matchesTrigger(rule, trigger)) {
        await this.executeAutomation(rule, trigger);
      }
    }
  }

  /**
   * Verificar se o trigger corresponde à regra
   */
  private matchesTrigger(
    rule: AutomationRule,
    trigger: AutomationTrigger
  ): boolean {
    if (rule.conditions.trigger !== trigger.type) {
      return false;
    }

    // Verificações específicas por tipo
    switch (trigger.type) {
      case 'NEW_CONTENT':
        return rule.conditions.contentType === trigger.data.contentType;
      case 'USER_SUBSCRIBED':
        return true;
      default:
        return true;
    }
  }

  /**
   * Executar automação
   */
  private async executeAutomation(
    rule: AutomationRule,
    trigger: AutomationTrigger
  ) {
    try {
      console.log(`Executando automação: ${rule.name}`);

      if (rule.actions.sendEmail) {
        await this.executeSendEmailAction(rule.actions.sendEmail, trigger);
      }

      // Log da execução
      console.log(`Automação ${rule.name} executada com sucesso`);
    } catch (error) {
      console.error(`Erro ao executar automação ${rule.name}:`, error);
    }
  }

  /**
   * Executar ação de envio de email
   */
  private async executeSendEmailAction(
    emailAction: any,
    trigger: AutomationTrigger
  ) {
    const { templateType, delay = 0 } = emailAction;

    // Aplicar delay se especificado
    if (delay > 0) {
      setTimeout(async () => {
        await this.sendAutomationEmail(templateType, trigger);
      }, delay * 1000);
    } else {
      await this.sendAutomationEmail(templateType, trigger);
    }
  }

  /**
   * Enviar email de automação
   */
  private async sendAutomationEmail(
    templateType: string,
    trigger: AutomationTrigger
  ) {
    try {
      // Buscar subscribers ativos
      const subscribers = await prisma.newsletterSubscriber.findMany({
        where: {
          status: 'ACTIVE',
        },
        take: templateType === 'WEEKLY_DIGEST' ? 10000 : 100, // Limitar baseado no tipo
      });

      if (subscribers.length === 0) {
        console.log('Nenhum subscriber ativo encontrado');
        return;
      }

      // Preparar variáveis do template baseadas no trigger
      const templateVariables = this.prepareTemplateVariables(
        templateType,
        trigger
      );

      // Enviar para cada subscriber
      for (const subscriber of subscribers) {
        try {
          const personalizedVariables = {
            ...templateVariables,
            firstName: subscriber.firstName || 'Usuário',
            email: subscriber.email,
            unsubscribeUrl: `${process.env.NEXTAUTH_URL}/api/newsletter/unsubscribe?token=${subscriber.unsubscribeToken}`,
          };

          await sendTemplateEmail(subscriber.email, {
            type: templateType,
            variables: personalizedVariables,
          });

          // Log do evento
          await prisma.newsletterEmailEvent.create({
            data: {
              eventType: 'SENT',
              subscriberId: subscriber.id,
              timestamp: new Date(),
              eventData: {
                automationTrigger: trigger.type,
                templateType,
              },
            },
          });

          // Pequeno delay entre envios para não sobrecarregar
          await new Promise((resolve) => setTimeout(resolve, 100));
        } catch (error) {
          console.error(
            `Erro ao enviar email para ${subscriber.email}:`,
            error
          );
        }
      }

      console.log(
        `Emails de automação enviados para ${subscribers.length} subscribers`
      );
    } catch (error) {
      console.error('Erro no envio de email de automação:', error);
    }
  }

  /**
   * Preparar variáveis do template
   */
  private prepareTemplateVariables(
    templateType: string,
    trigger: AutomationTrigger
  ): any {
    const baseVariables = {
      siteUrl: process.env.NEXTAUTH_URL,
      currentDate: new Date().toLocaleDateString('pt-BR'),
    };

    switch (templateType) {
      case 'WEEKLY_DIGEST':
        return {
          ...baseVariables,
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
        };

      case 'NEW_COMPOSER':
        const composerData = trigger.data.composer || {};
        return {
          ...baseVariables,
          composerName: composerData.name || 'Novo Compositor',
          composerPeriod: `${composerData.birthDate || '?'} - ${
            composerData.deathDate || '?'
          }`,
          composerNationality: composerData.nationality || 'Desconhecida',
          composerBio: composerData.bio || 'Biografia em breve.',
          composerUrl: `${process.env.NEXTAUTH_URL}/composers/${composerData.id}`,
          musicalFact:
            'Descubra mais sobre este fascinante compositor em nossa plataforma!',
        };

      default:
        return baseVariables;
    }
  }

  /**
   * Verificar se deve executar agendamento (simplificado)
   */
  private shouldExecuteSchedule(cronExpression: string, now: Date): boolean {
    // Implementação simplificada - em produção use uma lib como node-cron
    // Por hora, vamos apenas verificar se é segunda-feira às 10h
    if (cronExpression === '0 10 * * 1') {
      return (
        now.getDay() === 1 && now.getHours() === 10 && now.getMinutes() === 0
      );
    }

    return false;
  }

  /**
   * Processar trigger específico (método público)
   */
  async processUserSubscribed(subscriberId: string) {
    try {
      const subscriber = await prisma.newsletterSubscriber.findUnique({
        where: { id: subscriberId },
      });

      if (!subscriber) {
        console.error(`Subscriber ${subscriberId} não encontrado`);
        return;
      }

      await this.triggerAutomation({
        type: 'USER_SUBSCRIBED',
        data: {
          subscriberId,
          email: subscriber.email,
          subscribedAt: subscriber.subscribedAt,
        },
      });
    } catch (error) {
      console.error('Erro ao processar subscriber inscrito:', error);
    }
  }

  /**
   * Processar abertura de email
   */
  async processEmailOpened(subscriberId: string, campaignId?: string) {
    try {
      await this.triggerAutomation({
        type: 'EMAIL_OPENED',
        data: {
          subscriberId,
          campaignId,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error('Erro ao processar abertura de email:', error);
    }
  }

  /**
   * Processar clique em email
   */
  async processEmailClicked(
    subscriberId: string,
    url: string,
    campaignId?: string
  ) {
    try {
      await this.triggerAutomation({
        type: 'EMAIL_CLICKED',
        data: {
          subscriberId,
          campaignId,
          clickedUrl: url,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error('Erro ao processar clique em email:', error);
    }
  }
}

// Inicializar automação ao carregar o módulo
if (process.env.NODE_ENV !== 'test') {
  NewsletterAutomation.getInstance().initialize();
}

export default NewsletterAutomation;
