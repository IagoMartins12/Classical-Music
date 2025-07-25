// app/api/admin/newsletter/backup/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import path from 'path';
import fs from 'fs/promises';
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

    // Buscar backups do sistema de arquivos ou banco
    // Por simplicidade, vamos usar um diretório local
    const backupsDir = path.join(process.cwd(), 'backups', 'newsletter');

    try {
      await fs.access(backupsDir);
    } catch {
      await fs.mkdir(backupsDir, { recursive: true });
    }

    const files = await fs.readdir(backupsDir);
    const backups = [];

    for (const file of files) {
      if (file.endsWith('.json')) {
        const filePath = path.join(backupsDir, file);
        const stats = await fs.stat(filePath);

        try {
          const content = await fs.readFile(filePath, 'utf-8');
          const data = JSON.parse(content);

          backups.push({
            id: file.replace('.json', ''),
            type: 'FULL',
            filename: file,
            fileSize: stats.size,
            subscribersCount: data.subscribers?.length || 0,
            campaignsCount: data.campaigns?.length || 0,
            templatesCount: data.templates?.length || 0,
            eventsCount: data.events?.length || 0,
            status: 'COMPLETED',
            createdAt: stats.birthtime.toISOString(),
            completedAt: stats.mtime.toISOString(),
          });
        } catch (error) {
          console.error(`Erro ao ler backup ${file}:`, error);
        }
      }
    }

    // Ordenar por data de criação (mais recente primeiro)
    backups.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({
      success: true,
      backups,
    });
  } catch (error) {
    console.error('Erro ao buscar backups:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 2) {
      return NextResponse.json(
        { success: false, error: 'Acesso negado' },
        { status: 403 }
      );
    }

    const config = await request.json();

    // Criar backup
    const backup = await createNewsletterBackup(config);

    return NextResponse.json({
      success: true,
      backup,
      message: 'Backup criado com sucesso',
    });
  } catch (error) {
    console.error('Erro ao criar backup:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

async function createNewsletterBackup(config: any) {
  const backupId = `newsletter-backup-${Date.now()}`;
  const backupData: any = {
    metadata: {
      id: backupId,
      createdAt: new Date().toISOString(),
      version: '1.0',
      config,
    },
  };

  // Backup de subscribers
  if (config.includeSubscribers) {
    const subscribers = await prisma.newsletterSubscriber.findMany({
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });
    backupData.subscribers = subscribers;
  }

  // Backup de campanhas
  if (config.includeCampaigns) {
    const campaigns = await prisma.newsletterCampaign.findMany({
      include: {
        template: true,
        creator: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });
    backupData.campaigns = campaigns;
  }

  // Backup de templates
  if (config.includeTemplates) {
    const templates = await prisma.newsletterTemplate.findMany({
      include: {
        creator: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });
    backupData.templates = templates;
  }

  // Backup de eventos
  if (config.includeEvents) {
    const events = await prisma.newsletterEmailEvent.findMany({
      take: 10000, // Limitar para não sobrecarregar
      orderBy: { timestamp: 'desc' },
    });
    backupData.events = events;
  }

  // Backup de configurações
  if (config.includeSettings) {
    const settings = await prisma.newsletterSettings.findMany();
    backupData.settings = settings;
  }

  // Salvar backup no sistema de arquivos
  const backupsDir = path.join(process.cwd(), 'backups', 'newsletter');
  await fs.mkdir(backupsDir, { recursive: true });

  const backupFile = path.join(backupsDir, `${backupId}.json`);
  await fs.writeFile(backupFile, JSON.stringify(backupData, null, 2));

  const stats = await fs.stat(backupFile);

  return {
    id: backupId,
    type: 'FULL',
    filename: `${backupId}.json`,
    fileSize: stats.size,
    subscribersCount: backupData.subscribers?.length || 0,
    campaignsCount: backupData.campaigns?.length || 0,
    templatesCount: backupData.templates?.length || 0,
    eventsCount: backupData.events?.length || 0,
    status: 'COMPLETED',
    createdAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
  };
}
