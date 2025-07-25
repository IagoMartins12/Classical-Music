// app/api/admin/newsletter/settings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import { verifyEmailConfig } from '@/app/libs/newsletter/email';
import prisma from '@/app/libs/prismadb';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 2) {
      return NextResponse.json(
        { success: false, error: 'Acesso negado' },
        { status: 403 }
      );
    }

    // Buscar configurações do banco ou criar padrões
    const settingsData = await getOrCreateNewsletterSettings();

    // Verificar status da conexão
    const connectionStatus = await verifyEmailConfig();

    return NextResponse.json({
      success: true,
      settings: settingsData,
      connectionStatus,
    });
  } catch (error) {
    console.error('Erro ao buscar configurações:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 2) {
      return NextResponse.json(
        { success: false, error: 'Acesso negado' },
        { status: 403 }
      );
    }

    const settings = await request.json();

    // Salvar configurações no banco
    await saveNewsletterSettings(settings);

    // Verificar nova conexão
    const connectionStatus = await verifyEmailConfig();

    return NextResponse.json({
      success: true,
      message: 'Configurações salvas com sucesso',
      connectionStatus,
    });
  } catch (error) {
    console.error('Erro ao salvar configurações:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

async function getOrCreateNewsletterSettings() {
  try {
    // Buscar configurações existentes
    const existingSettings = await prisma.newsletterSettings.findMany();

    if (existingSettings.length === 0) {
      // Criar configurações padrão
      const defaultSettings = [
        { key: 'smtp_host', value: process.env.SMTP_HOST || '' },
        { key: 'smtp_port', value: process.env.SMTP_PORT || '587' },
        { key: 'smtp_secure', value: process.env.SMTP_SECURE || 'false' },
        { key: 'smtp_user', value: process.env.SMTP_USER || '' },
        { key: 'smtp_pass', value: process.env.SMTP_PASS || '' },
        {
          key: 'smtp_from_name',
          value: process.env.SMTP_FROM_NAME || 'Opus Atlas',
        },
        {
          key: 'smtp_from_email',
          value: process.env.SMTP_FROM_EMAIL || 'noreply@classicalhub.com',
        },
        {
          key: 'smtp_reply_to',
          value: process.env.SMTP_REPLY_TO || 'contato@classicalhub.com',
        },
        { key: 'enable_double_optin', value: 'true' },
        { key: 'default_frequency', value: 'weekly' },
        { key: 'max_subscribers_per_batch', value: '100' },
        { key: 'delay_between_batches', value: '2000' },
        { key: 'enable_analytics', value: 'true' },
        { key: 'retention_days', value: '365' },
        { key: 'welcome_email_delay', value: '0' },
        { key: 'weekly_digest_day', value: '1' },
        { key: 'weekly_digest_hour', value: '10' },
        { key: 'new_composer_notification_delay', value: '3600' },
        { key: 'enable_behavior_triggers', value: 'true' },
        { key: 'max_emails_per_day', value: '1000' },
      ];

      await prisma.newsletterSettings.createMany({
        data: defaultSettings,
      });

      // Buscar novamente
      const newSettings = await prisma.newsletterSettings.findMany();
      return formatSettings(newSettings);
    }

    return formatSettings(existingSettings);
  } catch (error) {
    console.error('Erro ao buscar/criar configurações:', error);
    throw error;
  }
}

async function saveNewsletterSettings(settings: any) {
  try {
    const settingsToUpdate = [
      { key: 'smtp_host', value: settings.smtp.host },
      { key: 'smtp_port', value: settings.smtp.port.toString() },
      { key: 'smtp_secure', value: settings.smtp.secure.toString() },
      { key: 'smtp_user', value: settings.smtp.user },
      { key: 'smtp_pass', value: settings.smtp.pass },
      { key: 'smtp_from_name', value: settings.smtp.fromName },
      { key: 'smtp_from_email', value: settings.smtp.fromEmail },
      { key: 'smtp_reply_to', value: settings.smtp.replyToEmail },
      {
        key: 'enable_double_optin',
        value: settings.general.enableDoubleOptIn.toString(),
      },
      { key: 'default_frequency', value: settings.general.defaultFrequency },
      {
        key: 'max_subscribers_per_batch',
        value: settings.general.maxSubscribersPerBatch.toString(),
      },
      {
        key: 'delay_between_batches',
        value: settings.general.delayBetweenBatches.toString(),
      },

      {
        key: 'enable_analytics',
        value: settings.general.enableAnalytics.toString(),
      },
      {
        key: 'retention_days',
        value: settings.general.retentionDays.toString(),
      },
    ];

    // Usar upsert para cada configuração
    for (const setting of settingsToUpdate) {
      await prisma.newsletterSettings.upsert({
        where: { key: setting.key },
        update: { value: setting.value },
        create: { key: setting.key, value: setting.value },
      });
    }
  } catch (error) {
    console.error('Erro ao salvar configurações:', error);
    throw error;
  }
}

function formatSettings(settingsArray: any[]) {
  const settingsMap = settingsArray.reduce((acc, setting) => {
    acc[setting.key] = setting.value;
    return acc;
  }, {} as Record<string, string>);

  return {
    smtp: {
      host: settingsMap.smtp_host || '',
      port: parseInt(settingsMap.smtp_port || '587'),
      secure: settingsMap.smtp_secure === 'true',
      user: settingsMap.smtp_user || '',
      pass: settingsMap.smtp_pass || '',
      fromName: settingsMap.smtp_from_name || 'Opus Atlas',
      fromEmail: settingsMap.smtp_from_email || 'noreply@classicalhub.com',
      replyToEmail: settingsMap.smtp_reply_to || 'contato@classicalhub.com',
    },
    general: {
      enableDoubleOptIn: settingsMap.enable_double_optin === 'true',
      defaultFrequency: settingsMap.default_frequency || 'weekly',
      maxSubscribersPerBatch: parseInt(
        settingsMap.max_subscribers_per_batch || '100'
      ),
      delayBetweenBatches: parseInt(
        settingsMap.delay_between_batches || '2000'
      ),
      enableAnalytics: settingsMap.enable_analytics === 'true',
      retentionDays: parseInt(settingsMap.retention_days || '365'),
    },
  };
}

// app/api/admin/newsletter/settings/test-connection/route.ts
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 2) {
      return NextResponse.json(
        { success: false, error: 'Acesso negado' },
        { status: 403 }
      );
    }

    const smtpSettings = await request.json();

    // Temporariamente sobrescrever as variáveis de ambiente
    const originalEnv = {
      SMTP_HOST: process.env.SMTP_HOST,
      SMTP_PORT: process.env.SMTP_PORT,
      SMTP_SECURE: process.env.SMTP_SECURE,
      SMTP_USER: process.env.SMTP_USER,
      SMTP_PASS: process.env.SMTP_PASS,
    };

    process.env.SMTP_HOST = smtpSettings.host;
    process.env.SMTP_PORT = smtpSettings.port.toString();
    process.env.SMTP_SECURE = smtpSettings.secure.toString();
    process.env.SMTP_USER = smtpSettings.user;
    process.env.SMTP_PASS = smtpSettings.pass;

    try {
      // Testar conexão
      const result = await verifyEmailConfig();

      return NextResponse.json({
        success: result.valid,
        provider: result.provider,
        error: result.error,
        message: result.valid
          ? 'Conexão testada com sucesso'
          : 'Falha na conexão',
      });
    } finally {
      // Restaurar variáveis de ambiente
      process.env.SMTP_HOST = originalEnv.SMTP_HOST;
      process.env.SMTP_PORT = originalEnv.SMTP_PORT;
      process.env.SMTP_SECURE = originalEnv.SMTP_SECURE;
      process.env.SMTP_USER = originalEnv.SMTP_USER;
      process.env.SMTP_PASS = originalEnv.SMTP_PASS;
    }
  } catch (error) {
    console.error('Erro no teste de conexão:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
