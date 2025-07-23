// app/api/admin/newsletter/automation/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import NewsletterAutomation from '@/app/libs/newsletter/newsletterAutomation';

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
    const { action, data } = body;

    const automation = NewsletterAutomation.getInstance();

    switch (action) {
      case 'trigger_welcome':
        if (data.subscriberId) {
          await automation.processUserSubscribed(data.subscriberId);
        }
        break;

      case 'trigger_weekly_digest':
        await automation.triggerAutomation({
          type: 'TIME_BASED',
          data: { manual: true },
        });
        break;

      case 'process_new_composer':
        await automation.triggerAutomation({
          type: 'NEW_CONTENT',
          data: {
            contentType: 'COMPOSER',
            composer: data.composer,
          },
        });
        break;

      default:
        return NextResponse.json(
          { success: false, error: 'Ação não reconhecida' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message: 'Automação executada com sucesso',
    });
  } catch (error) {
    console.error('Erro na automação:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
