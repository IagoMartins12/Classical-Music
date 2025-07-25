// app/api/admin/newsletter/backup/stats/route.ts
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 2) {
      return NextResponse.json(
        { success: false, error: 'Acesso negado' },
        { status: 403 }
      );
    }

    // Buscar estatísticas para o backup
    const [totalSubscribers, totalCampaigns, totalTemplates, totalEvents] =
      await Promise.all([
        prisma.newsletterSubscriber.count(),
        prisma.newsletterCampaign.count(),
        prisma.newsletterTemplate.count(),
        prisma.newsletterEmailEvent.count(),
      ]);

    // Buscar último backup
    const backupsDir = path.join(process.cwd(), 'backups', 'newsletter');
    let lastBackup: string | undefined;
    let backupSize: string | undefined;

    try {
      const files = await fs.readdir(backupsDir);
      const backupFiles = files.filter((f) => f.endsWith('.json'));

      if (backupFiles.length > 0) {
        // Pegar o mais recente
        const stats = await Promise.all(
          backupFiles.map(async (file) => {
            const filePath = path.join(backupsDir, file);
            const stat = await fs.stat(filePath);
            return { file, mtime: stat.mtime, size: stat.size };
          })
        );

        stats.sort((a, b) => b.mtime.getTime() - a.mtime.getTime());
        lastBackup = stats[0].mtime.toISOString();
        backupSize = formatFileSize(stats[0].size);
      }
    } catch (error) {
      console.log('error', error);
    }

    const stats = {
      totalSubscribers,
      totalCampaigns,
      totalTemplates,
      totalEvents,
      lastBackup,
      backupSize,
    };

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
