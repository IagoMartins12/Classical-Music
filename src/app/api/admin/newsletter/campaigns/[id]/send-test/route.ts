// app/api/admin/newsletter/campaigns/[id]/send-test/route.ts
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
    const body = await request.json();
    const {
      testListIds,
      customVariables = {},
      sendMode = 'bulk', // 'bulk' ou 'individual'
    } = body;

    // Validações
    if (
      !testListIds ||
      !Array.isArray(testListIds) ||
      testListIds.length === 0
    ) {
      return NextResponse.json(
        { success: false, error: 'Selecione pelo menos uma lista de teste' },
        { status: 400 }
      );
    }

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

    // Buscar listas de teste selecionadas
    const testLists = await prisma.testEmailList.findMany({
      where: {
        id: { in: testListIds },
        isActive: true,
      },
      include: {
        creator: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (testLists.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Nenhuma lista de teste ativa encontrada' },
        { status: 404 }
      );
    }

    // Coletar todos os emails das listas
    const allEmails = testLists.reduce((emails: string[], list) => {
      return [...emails, ...list.emails];
    }, []);

    // Remover duplicatas
    const uniqueEmails = [...new Set(allEmails)];

    if (uniqueEmails.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Nenhum email encontrado nas listas selecionadas',
        },
        { status: 400 }
      );
    }

    // Preparar dados do template
    let templateData: any = {
      type: campaign.template?.type || 'CAMPAIGN_CUSTOM',
      variables: {
        // Variáveis padrão
        firstName: 'Usuário de Teste',
        siteUrl: process.env.NEXTAUTH_URL || 'https://classicalhub.com',
        unsubscribeUrl: `${process.env.NEXTAUTH_URL}/unsubscribe?token=test`,
        preferencesUrl: `${process.env.NEXTAUTH_URL}/preferences?token=test`,

        // Variáveis específicas para teste
        isTestEmail: true,
        testCampaignName: campaign.name,
        testDate: new Date().toLocaleString('pt-BR'),
        testSender: `${session.user.firstName || 'Admin'} ${
          session.user.lastName || ''
        }`.trim(),

        // Variáveis customizadas
        ...customVariables,
      },
    };

    // Se campanha tem template personalizado, usar ele
    if (campaign.templateId && campaign.template) {
      templateData.customSubject =
        campaign.customSubject || campaign.template.subject;
      templateData.customHtmlContent = campaign.template.htmlContent;
      templateData.customTextContent = campaign.template.textContent;
      templateData.customFrom =
        campaign.senderEmail || campaign.template.senderEmail;
      templateData.customReplyTo =
        campaign.replyToEmail || campaign.template.replyToEmail;
    } else if (campaign.customHtmlContent) {
      // Campanha com conteúdo personalizado
      templateData.customSubject = campaign.customSubject || campaign.subject;
      templateData.customHtmlContent = campaign.customHtmlContent;
      templateData.customTextContent = campaign.customTextContent;
      templateData.customFrom = campaign.senderEmail;
      templateData.customReplyTo = campaign.replyToEmail;
    } else {
      // Template built-in
      templateData.customSubject = campaign.customSubject || campaign.subject;
      templateData.customFrom = campaign.senderEmail;
      templateData.customReplyTo = campaign.replyToEmail;
    }

    // Adicionar prefixo [TESTE] no assunto
    const originalSubject = templateData.customSubject || campaign.subject;
    templateData.customSubject = `[TESTE] ${originalSubject}`;

    // Preparar destinatários
    const recipients = uniqueEmails.map((email) => ({
      email,
      variables: {
        ...templateData.variables,
        email: email,
        // Personalizar nome baseado no email para teste
        firstName:
          email
            .split('@')[0]
            .replace(/[._-]/g, ' ')
            .replace(/\b\w/g, (l) => l.toUpperCase()) || 'Usuário de Teste',
      },
    }));

    // Configurações de envio
    const sendOptions = {
      batchSize: sendMode === 'individual' ? 1 : 10,
      delay: sendMode === 'individual' ? 3000 : 1000, // 3s individual, 1s lote
      onProgress: async (sent: number, total: number) => {
        console.log(`Progresso do teste: ${sent}/${total} emails enviados`);
      },
    };

    // Enviar emails
    const startTime = Date.now();
    const result = await sendBulkEmail(recipients, templateData, sendOptions);
    const endTime = Date.now();

    // Atualizar estatísticas das listas de teste
    await Promise.all(
      testLists.map(async (list) => {
        await prisma.testEmailList.update({
          where: { id: list.id },
          data: {
            timesUsed: { increment: 1 },
            lastUsed: new Date(),
          },
        });
      })
    );

    // Calcular estatísticas
    const successRate =
      result.success > 0
        ? ((result.success / uniqueEmails.length) * 100).toFixed(1)
        : '0.0';

    // Limitar erros mostrados (máximo 10)
    const displayErrors = result.errors.slice(0, 10);
    const hasMoreErrors = result.errors.length > 10;

    return NextResponse.json({
      success: true,
      message:
        result.success === uniqueEmails.length
          ? 'Todos os emails de teste foram enviados com sucesso!'
          : `${result.success} de ${uniqueEmails.length} emails enviados. Verifique os erros.`,
      results: {
        total: uniqueEmails.length,
        successful: result.success,
        failed: result.failed,
        successRate,
        errors: displayErrors,
        hasMoreErrors,
      },
      metadata: {
        processingTime: endTime - startTime,
        sendMode,
        campaignName: campaign.name,
        templateType: templateData.type,
        listsUsed: testLists.map((list) => ({
          id: list.id,
          name: list.name,
          emailCount: list.emails.length,
        })),
      },
    });
  } catch (error) {
    console.error('Erro ao enviar teste de campanha:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// GET - Obter listas de teste disponíveis para uma campanha
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

    // Verificar se campanha existe
    const campaign = await prisma.newsletterCampaign.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        subject: true,
        template: {
          select: {
            type: true,
            name: true,
          },
        },
      },
    });

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: 'Campanha não encontrada' },
        { status: 404 }
      );
    }

    // Buscar listas de teste ativas
    const testLists = await prisma.testEmailList.findMany({
      where: {
        isActive: true,
      },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: [{ timesUsed: 'desc' }, { name: 'asc' }],
    });

    // Calcular estatísticas
    const stats = {
      totalLists: testLists.length,
      totalEmails: testLists.reduce((sum, list) => sum + list.totalEmails, 0),
      averageListSize:
        testLists.length > 0
          ? Math.round(
              testLists.reduce((sum, list) => sum + list.totalEmails, 0) /
                testLists.length
            )
          : 0,
      mostUsedList: testLists.length > 0 ? testLists[0] : null,
    };

    return NextResponse.json({
      success: true,
      campaign: {
        id: campaign.id,
        name: campaign.name,
        subject: campaign.subject,
        templateType: campaign.template?.type || 'CAMPAIGN_CUSTOM',
        templateName: campaign.template?.name || 'Template Personalizado',
      },
      testLists: testLists.map((list) => ({
        ...list,
        createdAt: list.createdAt.toISOString(),
        updatedAt: list.updatedAt.toISOString(),
        lastUsed: list.lastUsed?.toISOString() || null,
      })),
      stats,
    });
  } catch (error) {
    console.error('Erro ao buscar listas de teste:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
