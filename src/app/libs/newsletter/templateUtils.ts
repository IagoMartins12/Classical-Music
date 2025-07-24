// app/libs/newsletter/templateUtils.ts
import {
  getAllEmailTemplates,
  getEmailTemplate,
  processTemplate,
  extractVariables,
  validateTemplateVariables,
} from './emailTemplates';

// Tipos de template
export type TemplateType =
  | 'WELCOME'
  | 'ACCOUNT_CONFIRMATION'
  | 'PASSWORD_RESET'
  | 'WEEKLY_DIGEST'
  | 'NEW_COMPOSER'
  | 'CAMPAIGN_CUSTOM';

// Interface para template do banco
export interface DatabaseTemplate {
  id: string;
  name: string;
  type: TemplateType;
  subject: string;
  htmlContent: string;
  textContent: string;
  description?: string | null;
  senderName: string;
  senderEmail: string;
  replyToEmail?: string | null;
  variables: string[];
  isActive: boolean;
  isDefault: boolean;
  timesUsed: number;
  avgOpenRate?: number | null;
  avgClickRate?: number | null;
  creator: {
    firstName?: string | null;
    lastName?: string | null;
  };
}

// Interface para dados de renderização
export interface TemplateRenderData {
  firstName?: string;
  lastName?: string;
  email?: string;
  siteUrl?: string;
  unsubscribeUrl?: string;
  preferencesUrl?: string;
  confirmationUrl?: string;
  resetUrl?: string;
  [key: string]: any;
}

// Interface para resultado de renderização
export interface RenderedTemplate {
  subject: string;
  html: string;
  text: string;
  metadata: {
    templateId?: string;
    templateName?: string;
    templateType: TemplateType;
    variables: string[];
    renderTime: number;
  };
}

/**
 * Classe de serviço para gerenciar templates
 */
export class TemplateService {
  /**
   * Renderizar template do banco de dados
   */
  static async renderDatabaseTemplate(
    template: DatabaseTemplate,
    data: TemplateRenderData
  ): Promise<RenderedTemplate> {
    const startTime = Date.now();

    try {
      // Validar variáveis necessárias
      const validation = validateTemplateVariables(template.type, data);
      if (!validation.valid) {
        console.warn('Variáveis faltando para template:', validation.missing);
      }

      // Renderizar template
      const subject = processTemplate(template.subject, data);
      const html = processTemplate(template.htmlContent, data);
      const text = processTemplate(template.textContent, data);

      return {
        subject,
        html,
        text,
        metadata: {
          templateId: template.id,
          templateName: template.name,
          templateType: template.type,
          variables: template.variables,
          renderTime: Date.now() - startTime,
        },
      };
    } catch (error) {
      throw new Error(
        `Erro ao renderizar template: ${
          error instanceof Error ? error.message : 'Erro desconhecido'
        }`
      );
    }
  }

  /**
   * Renderizar template built-in
   */
  static async renderBuiltInTemplate(
    templateType: TemplateType,
    data: TemplateRenderData
  ): Promise<RenderedTemplate> {
    const startTime = Date.now();

    try {
      const template = getEmailTemplate(templateType);
      if (!template) {
        throw new Error(`Template built-in não encontrado: ${templateType}`);
      }

      // Validar variáveis necessárias
      const validation = validateTemplateVariables(templateType, data);
      if (!validation.valid) {
        console.warn('Variáveis faltando para template:', validation.missing);
      }

      // Renderizar template
      const subject = processTemplate(template.subject, data);
      const html = processTemplate(template.htmlContent, data);
      const text = processTemplate(template.textContent, data);

      return {
        subject,
        html,
        text,
        metadata: {
          templateType,
          templateName: template.description,
          variables: template.variables,
          renderTime: Date.now() - startTime,
        },
      };
    } catch (error) {
      throw new Error(
        `Erro ao renderizar template built-in: ${
          error instanceof Error ? error.message : 'Erro desconhecido'
        }`
      );
    }
  }

  /**
   * Escolher template apropriado (personalizado ou built-in)
   */
  static async chooseTemplate(
    templateType: TemplateType,
    customTemplates: DatabaseTemplate[]
  ): Promise<{
    type: 'custom' | 'builtin';
    template: DatabaseTemplate | null;
  }> {
    // Buscar template padrão do tipo especificado
    const defaultTemplate = customTemplates.find(
      (t) => t.type === templateType && t.isDefault && t.isActive
    );

    if (defaultTemplate) {
      return { type: 'custom', template: defaultTemplate };
    }

    // Buscar qualquer template ativo do tipo
    const activeTemplate = customTemplates.find(
      (t) => t.type === templateType && t.isActive
    );

    if (activeTemplate) {
      return { type: 'custom', template: activeTemplate };
    }

    // Usar template built-in
    return { type: 'builtin', template: null };
  }

  /**
   * Validar template antes de salvar
   */
  static validateTemplate(template: Partial<DatabaseTemplate>): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Validações obrigatórias
    if (!template.name?.trim()) {
      errors.push('Nome é obrigatório');
    }

    if (!template.type) {
      errors.push('Tipo é obrigatório');
    }

    if (!template.subject?.trim()) {
      errors.push('Assunto é obrigatório');
    }

    if (!template.htmlContent?.trim()) {
      errors.push('Conteúdo HTML é obrigatório');
    }

    if (!template.senderEmail?.trim()) {
      errors.push('Email do remetente é obrigatório');
    } else if (!isValidEmail(template.senderEmail)) {
      errors.push('Email do remetente inválido');
    }

    // Validar email de resposta se fornecido
    if (template.replyToEmail && !isValidEmail(template.replyToEmail)) {
      errors.push('Email de resposta inválido');
    }

    // Validar variáveis
    if (template.htmlContent && template.textContent && template.subject) {
      try {
        const allContent = `${template.htmlContent} ${template.textContent} ${template.subject}`;
        const variables = extractVariables(allContent);

        // Verificar se há variáveis malformadas
        const malformedVars = allContent
          .match(/{{[^}]*}}/g)
          ?.filter(
            (v) =>
              !v.match(/^{{\s*[a-zA-Z_][a-zA-Z0-9_]*\s*}}$/) &&
              !v.match(/^{{\s*#(if|each)\s+[a-zA-Z_][a-zA-Z0-9_]*\s*}}$/) &&
              !v.match(/^{{\s*\/(if|each)\s*}}$/)
          );

        if (malformedVars && malformedVars.length > 0) {
          errors.push(
            `Variáveis malformadas encontradas: ${malformedVars.join(', ')}`
          );
        }
      } catch (error) {
        errors.push('Erro ao analisar variáveis do template');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Gerar dados de teste para preview
   */
  static generateSampleData(templateType: TemplateType): TemplateRenderData {
    const baseData: TemplateRenderData = {
      firstName: 'João',
      lastName: 'Silva',
      email: 'joao@exemplo.com',
      siteUrl: process.env.NEXTAUTH_URL || 'https://classicalhub.com',
      unsubscribeUrl: `${
        process.env.NEXTAUTH_URL || 'https://classicalhub.com'
      }/unsubscribe?token=sample`,
      preferencesUrl: `${
        process.env.NEXTAUTH_URL || 'https://classicalhub.com'
      }/preferences?token=sample`,
    };

    // Dados específicos por tipo de template
    switch (templateType) {
      case 'ACCOUNT_CONFIRMATION':
        return {
          ...baseData,
          confirmationUrl: `${
            process.env.NEXTAUTH_URL || 'https://classicalhub.com'
          }/confirm?token=sample`,
        };

      case 'PASSWORD_RESET':
        return {
          ...baseData,
          resetUrl: `${
            process.env.NEXTAUTH_URL || 'https://classicalhub.com'
          }/reset?token=sample`,
          requestDate: new Date().toLocaleDateString('pt-BR'),
          ipAddress: '192.168.1.100',
        };

      case 'WEEKLY_DIGEST':
        return {
          ...baseData,
          newComposers: 5,
          newWorks: 12,
          newScores: 8,
          activeUsers: 150,
          featuredComposer: {
            name: 'Ludwig van Beethoven',
            period: '1770-1827',
            description:
              'Compositor alemão considerado um dos maiores da história.',
            url: `${baseData.siteUrl}/composers/beethoven`,
          },
          popularWorks: [
            {
              title: 'Sonata ao Luar',
              composer: 'Beethoven',
              instrument: 'Piano',
              description: 'Uma das sonatas mais conhecidas.',
              url: `${baseData.siteUrl}/works/moonlight-sonata`,
            },
          ],
          studyTip: {
            title: 'Técnica de Dedilhado',
            content: 'Pratique escalas lentamente para desenvolver precisão.',
          },
        };

      case 'NEW_COMPOSER':
        return {
          ...baseData,
          composerName: 'Wolfgang Amadeus Mozart',
          composerPeriod: '1756-1791',
          composerNationality: 'Austríaco',
          composerBio: 'Compositor austríaco do período clássico.',
          composerUrl: `${baseData.siteUrl}/composers/mozart`,
          works: [
            {
              title: 'Requiem em Ré menor',
              instrument: 'Coro e Orquestra',
              year: '1791',
            },
            { title: 'Sinfonia nº 40', instrument: 'Orquestra', year: '1788' },
          ],
          musicalFact:
            'Mozart compôs mais de 600 obras durante sua curta vida.',
        };

      default:
        return baseData;
    }
  }

  /**
   * Comparar performance entre templates
   */
  static compareTemplatePerformance(
    template1: DatabaseTemplate,
    template2: DatabaseTemplate
  ): {
    better: DatabaseTemplate;
    metrics: {
      openRate: { template1: number; template2: number; winner: string };
      clickRate: { template1: number; template2: number; winner: string };
      usage: { template1: number; template2: number; winner: string };
    };
  } {
    const openRate1 = template1.avgOpenRate || 0;
    const openRate2 = template2.avgOpenRate || 0;
    const clickRate1 = template1.avgClickRate || 0;
    const clickRate2 = template2.avgClickRate || 0;
    const usage1 = template1.timesUsed || 0;
    const usage2 = template2.timesUsed || 0;

    // Calcular score geral (ponderado)
    const score1 =
      openRate1 * 0.4 + clickRate1 * 0.4 + Math.log(usage1 + 1) * 0.2;
    const score2 =
      openRate2 * 0.4 + clickRate2 * 0.4 + Math.log(usage2 + 1) * 0.2;

    return {
      better: score1 > score2 ? template1 : template2,
      metrics: {
        openRate: {
          template1: openRate1,
          template2: openRate2,
          winner: openRate1 > openRate2 ? template1.name : template2.name,
        },
        clickRate: {
          template1: clickRate1,
          template2: clickRate2,
          winner: clickRate1 > clickRate2 ? template1.name : template2.name,
        },
        usage: {
          template1: usage1,
          template2: usage2,
          winner: usage1 > usage2 ? template1.name : template2.name,
        },
      },
    };
  }
}

/**
 * Funções utilitárias
 */

/**
 * Validar formato de email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Formatar tipo de template para exibição
 */
export function formatTemplateType(type: TemplateType): string {
  const typeMap: Record<TemplateType, string> = {
    WELCOME: 'Boas-vindas',
    ACCOUNT_CONFIRMATION: 'Confirmação de Conta',
    PASSWORD_RESET: 'Reset de Senha',
    WEEKLY_DIGEST: 'Digest Semanal',
    NEW_COMPOSER: 'Novo Compositor',
    CAMPAIGN_CUSTOM: 'Campanha Customizada',
  };

  return typeMap[type] || type;
}

/**
 * Obter cor do tipo de template
 */
export function getTemplateTypeColor(type: TemplateType): string {
  const colorMap: Record<TemplateType, string> = {
    WELCOME: 'text-accent-green bg-accent-green/10',
    ACCOUNT_CONFIRMATION: 'text-accent-blue bg-accent-blue/10',
    PASSWORD_RESET: 'text-accent-red bg-accent-red/10',
    WEEKLY_DIGEST: 'text-accent-purple bg-accent-purple/10',
    NEW_COMPOSER: 'text-accent-amber bg-accent-amber/10',
    CAMPAIGN_CUSTOM: 'text-theme-primary bg-theme-secondary',
  };

  return colorMap[type] || 'text-theme-tertiary bg-theme-secondary';
}

/**
 * Calcular score de qualidade do template
 */
export function calculateTemplateQuality(template: DatabaseTemplate): {
  score: number;
  factors: {
    completeness: number;
    performance: number;
    usage: number;
    maintenance: number;
  };
  rating: 'Excelente' | 'Bom' | 'Regular' | 'Precisa Melhorar';
} {
  // Fator de completude (0-25)
  let completeness = 0;
  if (template.name?.trim()) completeness += 5;
  if (template.description?.trim()) completeness += 3;
  if (template.htmlContent?.trim()) completeness += 10;
  if (template.textContent?.trim()) completeness += 5;
  if (template.variables?.length > 0) completeness += 2;

  // Fator de performance (0-35)
  const avgOpenRate = template.avgOpenRate || 0;
  const avgClickRate = template.avgClickRate || 0;
  const performance = avgOpenRate * 20 + avgClickRate * 15;

  // Fator de uso (0-25)
  const timesUsed = template.timesUsed || 0;
  const usage = Math.min((timesUsed / 10) * 25, 25);

  // Fator de manutenção (0-15)
  let maintenance = 15;
  if (!template.isActive) maintenance -= 10;
  if (!template.senderEmail || !isValidEmail(template.senderEmail))
    maintenance -= 5;

  const totalScore = completeness + performance + usage + maintenance;

  let rating: 'Excelente' | 'Bom' | 'Regular' | 'Precisa Melhorar';
  if (totalScore >= 80) rating = 'Excelente';
  else if (totalScore >= 60) rating = 'Bom';
  else if (totalScore >= 40) rating = 'Regular';
  else rating = 'Precisa Melhorar';

  return {
    score: totalScore,
    factors: {
      completeness,
      performance,
      usage,
      maintenance,
    },
    rating,
  };
}

/**
 * Sugerir melhorias para template
 */
export function suggestTemplateImprovements(
  template: DatabaseTemplate
): string[] {
  const suggestions: string[] = [];
  const quality = calculateTemplateQuality(template);

  if (quality.factors.completeness < 20) {
    if (!template.description?.trim()) {
      suggestions.push('Adicione uma descrição clara do propósito do template');
    }
    if (!template.textContent?.trim()) {
      suggestions.push(
        'Crie uma versão em texto alternativa para melhor compatibilidade'
      );
    }
    if (!template.variables?.length) {
      suggestions.push('Considere adicionar variáveis para personalização');
    }
  }

  if (quality.factors.performance < 20) {
    suggestions.push(
      'Teste diferentes assuntos para melhorar a taxa de abertura'
    );
    suggestions.push('Otimize o conteúdo para aumentar a taxa de clique');
    suggestions.push('Considere A/B testing com variações do template');
  }

  if (quality.factors.usage < 15) {
    suggestions.push(
      'Promova o uso deste template ou considere torná-lo padrão'
    );
    suggestions.push(
      'Verifique se o template atende às necessidades dos usuários'
    );
  }

  if (quality.factors.maintenance < 10) {
    if (!template.isActive) {
      suggestions.push('Ative o template se ele estiver pronto para uso');
    }
    if (!isValidEmail(template.senderEmail)) {
      suggestions.push('Corrija o email do remetente');
    }
  }

  return suggestions;
}

/**
 * Gerar relatório de template
 */
export function generateTemplateReport(template: DatabaseTemplate): {
  template: DatabaseTemplate;
  quality: ReturnType<typeof calculateTemplateQuality>;
  suggestions: string[];
  metadata: {
    variableCount: number;
    estimatedRenderTime: number;
    contentLength: number;
    lastUsed?: string;
  };
} {
  const quality = calculateTemplateQuality(template);
  const suggestions = suggestTemplateImprovements(template);

  return {
    template,
    quality,
    suggestions,
    metadata: {
      variableCount: template.variables?.length || 0,
      estimatedRenderTime: (template.htmlContent?.length || 0) / 1000, // Estimativa simples
      contentLength:
        (template.htmlContent?.length || 0) +
        (template.textContent?.length || 0),
    },
  };
}
