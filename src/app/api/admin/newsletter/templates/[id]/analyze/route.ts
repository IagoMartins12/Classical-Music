// app/api/admin/newsletter/templates/[id]/analyze/route.ts
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import {
  generateTemplateReport,
  DatabaseTemplate,
} from '@/app/libs/newsletter/templateUtils';
import { extractVariables } from '@/app/libs/newsletter/emailTemplates';

export async function GET(
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

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID do template é obrigatório' },
        { status: 400 }
      );
    }

    // Buscar template
    const template = await prisma.newsletterTemplate.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        campaigns: {
          select: {
            id: true,
            name: true,
            status: true,
            openRate: true,
            clickRate: true,
            emailsSent: true,
            sentAt: true,
          },
          orderBy: { sentAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!template) {
      return NextResponse.json(
        { success: false, error: 'Template não encontrado' },
        { status: 404 }
      );
    }

    // Converter para formato esperado pelo utils
    const templateForAnalysis: DatabaseTemplate = {
      id: template.id,
      name: template.name,
      type: template.type as any,
      subject: template.subject,
      htmlContent: template.htmlContent,
      textContent: template.textContent,
      description: template.description,
      senderName: template.senderName,
      senderEmail: template.senderEmail,
      replyToEmail: template.replyToEmail,
      variables: template.variables,
      isActive: template.isActive,
      isDefault: template.isDefault,
      timesUsed: template.timesUsed,
      avgOpenRate: template.avgOpenRate,
      avgClickRate: template.avgClickRate,
      creator: {
        firstName: template.creator.firstName,
        lastName: template.creator.lastName,
      },
    };

    // Gerar análise completa
    const analysis = generateTemplateReport(templateForAnalysis);

    // Análise adicional de conteúdo
    const contentAnalysis = analyzeTemplateContent(template);

    // Análise de performance baseada em campanhas
    const performanceAnalysis = analyzeCampaignPerformance(template.campaigns);

    // Análise de SEO/Deliverability
    const deliverabilityAnalysis = analyzeDeliverability(template);

    // Recomendações de otimização
    const optimizationRecommendations = generateOptimizationRecommendations(
      template,
      contentAnalysis,
      performanceAnalysis
    );

    // Atualizar quality score no banco se necessário
    if (analysis.quality.score !== template.qualityScore) {
      await prisma.newsletterTemplate.update({
        where: { id },
        data: {
          qualityScore: analysis.quality.score,
          lastQualityCheck: new Date(),
        },
      });
    }

    const result = {
      template: {
        ...template,
        createdAt: template.createdAt.toISOString(),
        updatedAt: template.updatedAt.toISOString(),
        lastEditedAt: template.lastEditedAt?.toISOString() || null,
        campaigns: template.campaigns.map((campaign) => ({
          ...campaign,
          sentAt: campaign.sentAt?.toISOString() || null,
        })),
      },
      analysis: {
        ...analysis,
        contentAnalysis,
        performanceAnalysis,
        deliverabilityAnalysis,
        optimizationRecommendations,
      },
      generatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      analysis: result,
    });
  } catch (error) {
    console.error('Erro ao analisar template:', error);

    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Função para analisar conteúdo do template
function analyzeTemplateContent(template: any) {
  const analysis = {
    wordCount: {
      subject: template.subject.split(' ').length,
      html: template.htmlContent.replace(/<[^>]*>/g, '').split(' ').length,
      text: template.textContent.split(' ').length,
    },
    readability: {
      subjectLength: template.subject.length,
      avgSentenceLength: calculateAvgSentenceLength(template.htmlContent),
      complexWords: countComplexWords(template.htmlContent),
    },
    structure: {
      hasImages: template.htmlContent.includes('<img'),
      hasLinks: template.htmlContent.includes('<a'),
      hasCTA: hasCallToAction(template.htmlContent),
      hasPersonalization: template.variables.length > 0,
    },
    variables: {
      total: template.variables.length,
      used: extractVariables(
        template.htmlContent +
          ' ' +
          template.textContent +
          ' ' +
          template.subject
      ),
      unused: [],
    },
    accessibility: {
      hasAltText: checkAltText(template.htmlContent),
      colorContrast: 'unknown', // Seria necessário análise mais avançada
      semanticStructure: checkSemanticStructure(template.htmlContent),
    },
  };

  // Calcular variáveis não utilizadas
  analysis.variables.unused = template.variables.filter(
    (variable: string) => !analysis.variables.used.includes(variable)
  );

  return analysis;
}

// Função para analisar performance das campanhas
function analyzeCampaignPerformance(campaigns: any[]) {
  if (campaigns.length === 0) {
    return {
      totalCampaigns: 0,
      avgOpenRate: 0,
      avgClickRate: 0,
      totalEmailsSent: 0,
      trend: 'insufficient_data',
      bestPerforming: null,
      worstPerforming: null,
    };
  }

  const sentCampaigns = campaigns.filter(
    (c) => c.status === 'SENT' && c.openRate !== null
  );

  if (sentCampaigns.length === 0) {
    return {
      totalCampaigns: campaigns.length,
      avgOpenRate: 0,
      avgClickRate: 0,
      totalEmailsSent: 0,
      trend: 'no_sent_campaigns',
      bestPerforming: null,
      worstPerforming: null,
    };
  }

  const avgOpenRate =
    sentCampaigns.reduce((sum, c) => sum + (c.openRate || 0), 0) /
    sentCampaigns.length;
  const avgClickRate =
    sentCampaigns.reduce((sum, c) => sum + (c.clickRate || 0), 0) /
    sentCampaigns.length;
  const totalEmailsSent = sentCampaigns.reduce(
    (sum, c) => sum + (c.emailsSent || 0),
    0
  );

  // Calcular tendência (últimas 3 vs primeiras 3 campanhas)
  let trend = 'stable';
  if (sentCampaigns.length >= 6) {
    const recent = sentCampaigns.slice(0, 3);
    const older = sentCampaigns.slice(-3);
    const recentAvg = recent.reduce((sum, c) => sum + (c.openRate || 0), 0) / 3;
    const olderAvg = older.reduce((sum, c) => sum + (c.openRate || 0), 0) / 3;

    if (recentAvg > olderAvg * 1.1) trend = 'improving';
    else if (recentAvg < olderAvg * 0.9) trend = 'declining';
  }

  const bestPerforming = sentCampaigns.reduce((best, current) =>
    (current.openRate || 0) > (best.openRate || 0) ? current : best
  );

  const worstPerforming = sentCampaigns.reduce((worst, current) =>
    (current.openRate || 0) < (worst.openRate || 0) ? current : worst
  );

  return {
    totalCampaigns: campaigns.length,
    sentCampaigns: sentCampaigns.length,
    avgOpenRate,
    avgClickRate,
    totalEmailsSent,
    trend,
    bestPerforming,
    worstPerforming,
  };
}

// Função para analisar deliverability
function analyzeDeliverability(template: any) {
  const analysis = {
    spamScore: calculateSpamScore(template),
    subjectLine: analyzeSubjectLine(template.subject),
    senderReputation: analyzeSenderInfo(template),
    contentFlags: checkContentFlags(template.htmlContent),
    recommendations: [] as string[],
  };

  // Gerar recomendações baseadas na análise
  if (analysis.spamScore > 5) {
    analysis.recommendations.push(
      'Reduza palavras que podem ser interpretadas como spam'
    );
  }

  if (analysis.subjectLine.hasExcessiveCaps) {
    analysis.recommendations.push(
      'Evite usar muitas letras maiúsculas no assunto'
    );
  }

  if (analysis.contentFlags.suspiciousLinks) {
    analysis.recommendations.push('Verifique se todos os links são confiáveis');
  }

  return analysis;
}

// Função para gerar recomendações de otimização
function generateOptimizationRecommendations(
  template: any,
  contentAnalysis: any,
  performanceAnalysis: any
) {
  const recommendations = [];

  // Recomendações baseadas no conteúdo
  if (contentAnalysis.wordCount.subject > 50) {
    recommendations.push({
      type: 'subject',
      priority: 'high',
      message:
        'Assunto muito longo. Mantenha entre 30-50 caracteres para melhor visualização.',
    });
  }

  if (!contentAnalysis.structure.hasCTA) {
    recommendations.push({
      type: 'content',
      priority: 'high',
      message: 'Adicione um call-to-action claro para melhorar o engajamento.',
    });
  }

  if (contentAnalysis.variables.total === 0) {
    recommendations.push({
      type: 'personalization',
      priority: 'medium',
      message:
        'Considere adicionar personalização (ex: {{firstName}}) para melhorar o engajamento.',
    });
  }

  // Recomendações baseadas na performance
  if (
    performanceAnalysis.avgOpenRate < 0.2 &&
    performanceAnalysis.sentCampaigns > 2
  ) {
    recommendations.push({
      type: 'performance',
      priority: 'high',
      message:
        'Taxa de abertura baixa. Teste diferentes assuntos e horários de envio.',
    });
  }

  if (
    performanceAnalysis.avgClickRate < 0.02 &&
    performanceAnalysis.sentCampaigns > 2
  ) {
    recommendations.push({
      type: 'performance',
      priority: 'high',
      message: 'Taxa de clique baixa. Otimize o conteúdo e calls-to-action.',
    });
  }

  // Recomendações de acessibilidade
  if (!contentAnalysis.accessibility.hasAltText) {
    recommendations.push({
      type: 'accessibility',
      priority: 'medium',
      message:
        'Adicione texto alternativo às imagens para melhor acessibilidade.',
    });
  }

  return recommendations;
}

// Funções auxiliares
function calculateAvgSentenceLength(html: string): number {
  const text = html.replace(/<[^>]*>/g, '');
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const words = text.split(' ').filter((w) => w.trim().length > 0);
  return sentences.length > 0 ? words.length / sentences.length : 0;
}

function countComplexWords(html: string): number {
  const text = html.replace(/<[^>]*>/g, '').toLowerCase();
  const words = text.split(' ').filter((w) => w.trim().length > 0);
  return words.filter(
    (word) => word.length > 6 || word.includes('ção') || word.includes('mente')
  ).length;
}

function hasCallToAction(html: string): boolean {
  const ctaPatterns = [
    /clique aqui/i,
    /saiba mais/i,
    /leia mais/i,
    /compre agora/i,
    /inscreva-se/i,
    /cadastre-se/i,
    /baixe/i,
    /download/i,
    /<a[^>]*>.*?(btn|button|cta)/i,
  ];

  return ctaPatterns.some((pattern) => pattern.test(html));
}

function checkAltText(html: string): boolean {
  const imgTags = html.match(/<img[^>]*>/g) || [];
  return imgTags.every((img) => img.includes('alt='));
}

function checkSemanticStructure(html: string): boolean {
  return html.includes('<h1') || html.includes('<h2') || html.includes('<h3');
}

function calculateSpamScore(template: any): number {
  let score = 0;
  const content = `${template.subject} ${template.htmlContent}`.toLowerCase();

  // Palavras suspeitas
  const spamWords = [
    'grátis',
    'urgente',
    '!!!',
    'clique aqui',
    'oferta imperdível',
  ];
  spamWords.forEach((word) => {
    if (content.includes(word)) score += 1;
  });

  // Excesso de maiúsculas
  const capsRatio =
    (template.subject.match(/[A-Z]/g) || []).length / template.subject.length;
  if (capsRatio > 0.3) score += 2;

  return score;
}

function analyzeSubjectLine(subject: string) {
  return {
    length: subject.length,
    wordCount: subject.split(' ').length,
    hasExcessiveCaps:
      (subject.match(/[A-Z]/g) || []).length / subject.length > 0.3,
    hasEmojis:
      /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/u.test(
        subject
      ),
    hasNumbers: /\d/.test(subject),
    hasSpecialChars: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(subject),
  };
}

function analyzeSenderInfo(template: any) {
  return {
    hasReplyTo: !!template.replyToEmail,
    senderEmailValid: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(template.senderEmail),
    senderNameProvided:
      !!template.senderName && template.senderName.trim().length > 0,
  };
}

function checkContentFlags(html: string) {
  return {
    suspiciousLinks: html.includes('bit.ly') || html.includes('tinyurl'),
    excessiveImages: (html.match(/<img/g) || []).length > 10,
    noTextVersion: false, // Seria verificado comparando com textContent
    excessiveColors: (html.match(/color:/g) || []).length > 5,
  };
}
