// app/api/admin/newsletter/send-test/route.ts
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { logSecurityEvent } from '@/app/libs/tokenUtils';
import {
  emailTemplates,
  getEmailTemplate,
} from '@/app/libs/newsletter/emailTemplates';
import { sendBulkEmail, sendTemplateEmail } from '@/app/libs/newsletter/email';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 2) {
      return NextResponse.json(
        { success: false, error: 'Acesso negado' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      testListIds = [],
      templateType,
      customSubject,
      testVariables = {},
      sendMode = 'bulk', // 'bulk' ou 'individual'
    } = body;

    // Validações básicas
    if (!templateType || typeof templateType !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Tipo de template é obrigatório' },
        { status: 400 }
      );
    }

    if (!Array.isArray(testListIds) || testListIds.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Pelo menos uma lista de teste deve ser selecionada',
        },
        { status: 400 }
      );
    }

    // Verificar se template existe
    const template = getEmailTemplate(templateType);

    if (!template) {
      return NextResponse.json(
        { success: false, error: 'Template não encontrado' },
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

    // Coletar todos os emails únicos das listas
    const allEmails = new Set<string>();
    testLists.forEach((list) => {
      list.emails.forEach((email) => allEmails.add(email));
    });

    const uniqueEmails = Array.from(allEmails);

    if (uniqueEmails.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Nenhum email encontrado nas listas selecionadas',
        },
        { status: 400 }
      );
    }

    // Rate limiting para envios de teste (máximo 100 emails por hora)
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);

    // Aqui você pode implementar um controle de rate limiting se necessário
    // Por exemplo, criar uma tabela de logs de envio de teste...

    // Preparar dados do template
    const templateData = {
      type: templateType,
      variables: {
        firstName: 'Usuário de Teste',
        siteUrl: process.env.NEXTAUTH_URL || 'http://localhost:3000',
        unsubscribeUrl: '#test-unsubscribe',
        confirmationUrl: '#test-confirmation',
        resetUrl: '#test-reset',
        // Dados específicos para teste
        ...testVariables,
        // Adicionar timestamp para identificar como teste
        isTestEmail: true,
        testTimestamp: new Date().toLocaleString('pt-BR'),
        testLists: testLists.map((list) => list.name).join(', '),
      },
      customSubject: customSubject || undefined,
    };

    let results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    };

    // Obter IP do usuário para log
    const userIP = request.headers.get('x-forwarded-for') || 'unknown';

    if (sendMode === 'bulk') {
      // Envio em lote (mais eficiente para muitos emails)
      const recipients = uniqueEmails.map((email) => ({
        email,
        variables: {
          ...templateData.variables,
          email: email, // Incluir o email atual nas variáveis
        },
      }));

      results = await sendBulkEmail(recipients, templateData, {
        batchSize: 50, // Enviar em lotes de 50
        delay: 1000, // 1 segundo entre lotes
        onProgress: (sent, total) => {
          console.log(`Progresso: ${sent}/${total} emails enviados`);
        },
      });
    } else {
      // Envio individual (para testes menores com mais controle)
      for (const email of uniqueEmails) {
        try {
          const emailData = {
            ...templateData,
            variables: {
              ...templateData.variables,
              email: email,
            },
          };

          const result = await sendTemplateEmail(email, emailData);

          if (result.success) {
            results.success++;
          } else {
            results.failed++;
            results.errors.push(`${email}: ${result.error}`);
          }
        } catch (error) {
          results.failed++;
          results.errors.push(
            `${email}: ${
              error instanceof Error ? error.message : 'Erro desconhecido'
            }`
          );
        }

        // Pequeno delay entre envios individuais
        if (uniqueEmails.indexOf(email) < uniqueEmails.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }
    }

    // Atualizar estatísticas das listas (última utilização e contador)
    await prisma.testEmailList.updateMany({
      where: {
        id: { in: testListIds },
      },
      data: {
        lastUsed: new Date(),
        timesUsed: {
          increment: 1,
        },
      },
    });

    // Log de segurança
    logSecurityEvent('TEST_EMAILS_SENT', session.user.id, {
      templateType,
      testListIds,
      emailCount: uniqueEmails.length,
      successCount: results.success,
      failedCount: results.failed,
      sendMode,
      ip: userIP,
      customSubject: customSubject || null,
    });

    // Preparar resposta
    const responseData = {
      success: true,
      message: `Envio de teste concluído: ${results.success} sucessos, ${results.failed} falhas`,
      results: {
        total: uniqueEmails.length,
        successful: results.success,
        failed: results.failed,
        successRate: ((results.success / uniqueEmails.length) * 100).toFixed(1),
      },
      lists: testLists.map((list) => ({
        id: list.id,
        name: list.name,
        emailCount: list.totalEmails,
      })),
      template: {
        type: templateType,
        subject: customSubject || template.subject,
      },
    };

    // Incluir erros se houver (limitado aos primeiros 10)

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Erro ao enviar emails de teste:', error);

    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// GET - Obter templates disponíveis e estatísticas
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 2) {
      return NextResponse.json(
        { success: false, error: 'Acesso negado' },
        { status: 403 }
      );
    }

    // Mapear templates disponíveis
    const availableTemplates = Object.entries(emailTemplates).map(
      ([key, template]) => ({
        type: key,
        name: getTemplateName(key),
        subject: template.subject,
        description: getTemplateDescription(key),
      })
    );

    // Obter estatísticas das listas de teste
    const testListsStats = await prisma.testEmailList.aggregate({
      _count: { id: true },
      _sum: {
        totalEmails: true,
        timesUsed: true,
      },
      where: { isActive: true },
    });

    return NextResponse.json({
      success: true,
      templates: availableTemplates,
      stats: {
        activeLists: testListsStats._count.id || 0,
        totalTestEmails: testListsStats._sum.totalEmails || 0,
        totalUsage: testListsStats._sum.timesUsed || 0,
      },
    });
  } catch (error) {
    console.error('Erro ao obter dados de teste:', error);

    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Funções auxiliares para metadados dos templates
function getTemplateName(templateType: string): string {
  const names: Record<string, string> = {
    WELCOME: 'Confirmação de Newsletter',
    ACCOUNT_CONFIRMATION: 'Confirmação de Conta',
    PASSWORD_RESET: 'Reset de Senha',
    WEEKLY_DIGEST: 'Newsletter Semanal',
    NEW_COMPOSER: 'Novo Compositor',
  };
  return names[templateType] || templateType;
}

function getTemplateDescription(templateType: string): string {
  const descriptions: Record<string, string> = {
    WELCOME: 'Email de boas-vindas para confirmação de inscrição na newsletter',
    ACCOUNT_CONFIRMATION:
      'Email para confirmar a criação de nova conta de usuário',
    PASSWORD_RESET: 'Email para redefinição de senha',
    WEEKLY_DIGEST: 'Newsletter semanal com resumo de atividades',
    NEW_COMPOSER: 'Notificação sobre novo compositor adicionado',
  };
  return descriptions[templateType] || 'Template de email';
}
