// app/api/admin/newsletter/templates/[id]/preview/route.ts
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { processTemplate } from '@/app/libs/newsletter/emailTemplates';
interface Params {
  id: string;
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
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'html'; // html, text, both

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID do template é obrigatório' },
        { status: 400 }
      );
    }

    // Buscar template
    const template = await prisma.newsletterTemplate.findUnique({
      where: { id },
    });

    if (!template) {
      return NextResponse.json(
        { success: false, error: 'Template não encontrado' },
        { status: 404 }
      );
    }

    // Dados de exemplo para preview
    const sampleData = {
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
      confirmationUrl: `${
        process.env.NEXTAUTH_URL || 'https://classicalhub.com'
      }/confirm?token=sample`,
      resetUrl: `${
        process.env.NEXTAUTH_URL || 'https://classicalhub.com'
      }/reset?token=sample`,
      requestDate: new Date().toLocaleDateString('pt-BR'),
      ipAddress: '192.168.1.100',

      // Dados para newsletter digest
      newComposers: 5,
      newWorks: 12,
      newScores: 8,
      activeUsers: 150,
      newSubscribersLast30Days: 23,

      // Compositor em destaque
      featuredComposer: {
        name: 'Ludwig van Beethoven',
        period: '1770-1827',
        description:
          'Compositor alemão considerado um dos maiores da história da música clássica.',
        url: `${
          process.env.NEXTAUTH_URL || 'https://classicalhub.com'
        }/composers/beethoven`,
      },

      // Obras populares
      popularWorks: [
        {
          title: 'Sonata ao Luar',
          composer: 'Beethoven',
          instrument: 'Piano',
          description:
            'Uma das sonatas mais conhecidas e amadas do repertório pianístico.',
          url: `${
            process.env.NEXTAUTH_URL || 'https://classicalhub.com'
          }/works/moonlight-sonata`,
        },
        {
          title: 'Ave Maria',
          composer: 'Schubert',
          instrument: 'Voz e Piano',
          description: 'Uma das mais belas canções da música clássica.',
          url: `${
            process.env.NEXTAUTH_URL || 'https://classicalhub.com'
          }/works/ave-maria`,
        },
      ],

      // Dica de estudo
      studyTip: {
        title: 'Técnica de Dedilhado',
        content:
          'Pratique escalas lentamente para desenvolver força e precisão nos dedos. Comece com 60 BPM e aumente gradualmente.',
      },

      // Dados para novo compositor
      composerName: 'Wolfgang Amadeus Mozart',
      composerPeriod: '1756-1791',
      composerNationality: 'Austríaco',
      composerBio:
        'Compositor austríaco do período clássico, conhecido por sua genialidade precoce e prolífica produção musical.',
      composerUrl: `${
        process.env.NEXTAUTH_URL || 'https://classicalhub.com'
      }/composers/mozart`,
      works: [
        {
          title: 'Requiem em Ré menor',
          instrument: 'Coro e Orquestra',
          year: '1791',
        },
        {
          title: 'Sinfonia nº 40',
          instrument: 'Orquestra',
          year: '1788',
        },
        {
          title: 'Sonata K. 331',
          instrument: 'Piano',
          year: '1783',
        },
      ],
      musicalFact:
        'Mozart compôs mais de 600 obras durante sua curta vida de apenas 35 anos.',

      // Dados customizados
      customSubject: 'Assunto Personalizado de Teste',
      customContent:
        '<h3>🎼 Conteúdo personalizado da campanha</h3><p>Este é um exemplo de conteúdo customizado para demonstração do template.</p>',
      customTextContent: 'Conteúdo personalizado da campanha em texto simples.',

      // Dados de teste
      testMessage: 'Esta é uma mensagem de teste',
      testTimestamp: new Date().toLocaleString('pt-BR'),
      isTestEmail: true,
    };

    try {
      const processedTemplate: any = {
        subject: processTemplate(template.subject, sampleData),
      };

      if (format === 'html' || format === 'both') {
        processedTemplate.html = processTemplate(
          template.htmlContent,
          sampleData
        );
      }

      if (format === 'text' || format === 'both') {
        processedTemplate.text = processTemplate(
          template.textContent,
          sampleData
        );
      }

      return NextResponse.json({
        success: true,
        preview: processedTemplate,
        template: {
          id: template.id,
          name: template.name,
          type: template.type,
          variables: template.variables,
          sampleData: Object.keys(sampleData), // Retornar apenas as chaves por segurança
        },
      });
    } catch (error) {
      console.error('Erro ao processar template:', error);

      // Retornar template bruto em caso de erro
      const rawTemplate: any = {
        subject: template.subject,
      };

      if (format === 'html' || format === 'both') {
        rawTemplate.html = template.htmlContent;
      }

      if (format === 'text' || format === 'both') {
        rawTemplate.text = template.textContent;
      }

      return NextResponse.json({
        success: true,
        preview: rawTemplate,
        template: {
          id: template.id,
          name: template.name,
          type: template.type,
          variables: template.variables,
        },
        warning:
          'Template processado sem variáveis devido a erro na renderização',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  } catch (error) {
    console.error('Erro ao gerar preview:', error);

    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST - Preview com dados customizados
export async function POST(
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
    const body = await request.json();
    const { variables = {}, format = 'html' } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID do template é obrigatório' },
        { status: 400 }
      );
    }

    // Buscar template
    const template = await prisma.newsletterTemplate.findUnique({
      where: { id },
    });

    if (!template) {
      return NextResponse.json(
        { success: false, error: 'Template não encontrado' },
        { status: 404 }
      );
    }

    try {
      const processedTemplate: any = {
        subject: processTemplate(template.subject, variables),
      };

      if (format === 'html' || format === 'both') {
        processedTemplate.html = processTemplate(
          template.htmlContent,
          variables
        );
      }

      if (format === 'text' || format === 'both') {
        processedTemplate.text = processTemplate(
          template.textContent,
          variables
        );
      }

      return NextResponse.json({
        success: true,
        preview: processedTemplate,
        template: {
          id: template.id,
          name: template.name,
          type: template.type,
          variables: template.variables,
        },
      });
    } catch (error) {
      console.error(
        'Erro ao processar template com dados customizados:',
        error
      );

      return NextResponse.json(
        {
          success: false,
          error: 'Erro ao processar template com os dados fornecidos',
          details: error instanceof Error ? error.message : 'Erro desconhecido',
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Erro ao gerar preview customizado:', error);

    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
