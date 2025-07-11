// app/api/admin/settings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';

interface SystemConfig {
  general: {
    platformName: string;
    allowRegistrations: boolean;
    requireEmailVerification: boolean;
    maintenanceMode: boolean;
    defaultUserRole: string;
    maxUploadSize: number;
    sessionTimeout: number;
  };
  moderation: {
    autoModeration: boolean;
    qualityThreshold: number;
    reportThreshold: number;
    autoApproveFromTrustedUsers: boolean;
    trustedUserMinScore: number;
    bulkActionLimit: number;
  };
  content: {
    allowUserUploads: boolean;
    requireModerationForNewUsers: boolean;
    maxDailyUploads: number;
    maxMonthlyUploads: number;
    enableVersioning: boolean;
    autoBackup: boolean;
  };
  notifications: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    moderationAlerts: boolean;
    systemAlerts: boolean;
    reportNotifications: boolean;
    weeklyDigest: boolean;
  };
  security: {
    twoFactorAuth: boolean;
    passwordMinLength: number;
    sessionSecurity: 'normal' | 'strict';
    ipWhitelist: string[];
    rateLimiting: boolean;
    bruteForceProtection: boolean;
  };
  performance: {
    cacheTimeout: number;
    enableCDN: boolean;
    compressionLevel: number;
    maxConcurrentUsers: number;
    databaseOptimization: boolean;
  };
}

interface QualityRule {
  id: string;
  name: string;
  description: string;
  category: 'content' | 'metadata' | 'format' | 'user';
  severity: 'info' | 'warning' | 'error';
  isActive: boolean;
  autoAction: 'none' | 'flag' | 'reject' | 'approve';
  parameters: Record<string, any>;
}

// Configurações padrão do sistema
const getDefaultConfig = (): SystemConfig => ({
  general: {
    platformName: 'Classical Music Platform',
    allowRegistrations: true,
    requireEmailVerification: true,
    maintenanceMode: false,
    defaultUserRole: 'CASUAL_USER',
    maxUploadSize: 50,
    sessionTimeout: 8,
  },
  moderation: {
    autoModeration: true,
    qualityThreshold: 7.0,
    reportThreshold: 3,
    autoApproveFromTrustedUsers: true,
    trustedUserMinScore: 4.5,
    bulkActionLimit: 50,
  },
  content: {
    allowUserUploads: true,
    requireModerationForNewUsers: true,
    maxDailyUploads: 50,
    maxMonthlyUploads: 1000,
    enableVersioning: true,
    autoBackup: true,
  },
  notifications: {
    emailNotifications: true,
    pushNotifications: false,
    moderationAlerts: true,
    systemAlerts: true,
    reportNotifications: true,
    weeklyDigest: true,
  },
  security: {
    twoFactorAuth: false,
    passwordMinLength: 8,
    sessionSecurity: 'normal',
    ipWhitelist: [],
    rateLimiting: true,
    bruteForceProtection: true,
  },
  performance: {
    cacheTimeout: 3600,
    enableCDN: true,
    compressionLevel: 6,
    maxConcurrentUsers: 10000,
    databaseOptimization: true,
  },
});

const getDefaultQualityRules = (): QualityRule[] => [
  {
    id: '1',
    name: 'Biografia Mínima',
    description:
      'Compositores devem ter pelo menos 100 caracteres de biografia',
    category: 'content',
    severity: 'warning',
    isActive: true,
    autoAction: 'flag',
    parameters: { minLength: 100 },
  },
  {
    id: '2',
    name: 'Datas Obrigatórias',
    description: 'Compositores devem ter data de nascimento',
    category: 'metadata',
    severity: 'error',
    isActive: true,
    autoAction: 'reject',
    parameters: { requiredFields: ['birthDate'] },
  },
  {
    id: '3',
    name: 'Usuário Confiável',
    description: 'Usuários com score alto podem ter aprovação automática',
    category: 'user',
    severity: 'info',
    isActive: true,
    autoAction: 'approve',
    parameters: { minScore: 4.5 },
  },
];

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 2) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const section = searchParams.get('section') || 'all';

    // Em produção, buscar do banco de dados
    const config = getDefaultConfig();
    const qualityRules = getDefaultQualityRules();

    if (section === 'rules') {
      return NextResponse.json({
        success: true,
        qualityRules,
        timestamp: new Date().toISOString(),
      });
    }

    if (section !== 'all' && config[section as keyof SystemConfig]) {
      return NextResponse.json({
        success: true,
        config: { [section]: config[section as keyof SystemConfig] },
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      config,
      qualityRules,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Erro na API de configurações do admin:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 2) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { section, config, qualityRules } = body;

    // Em produção, salvar no banco de dados
    console.log('Salvando configurações:', { section, config, qualityRules });

    // Log da alteração para auditoria
    await prisma.uploadHistory.create({
      data: {
        action: 'update_settings',
        entityType: 'system',
        entityId: 'system_config',
        userId: session.user.id,
        metadata: {
          section,
          changes: config || qualityRules,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Configurações salvas com sucesso',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Erro ao salvar configurações:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
