// app/api/admin/newsletter/backup/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import path from 'path';
import fs from 'fs/promises';

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
    const backupsDir = path.join(process.cwd(), 'backups', 'newsletter');
    const backupFile = path.join(backupsDir, `${id}.json`);

    try {
      const stats = await fs.stat(backupFile);
      const content = await fs.readFile(backupFile, 'utf-8');
      const data = JSON.parse(content);

      const backup = {
        id,
        type: 'FULL',
        filename: `${id}.json`,
        fileSize: stats.size,
        subscribersCount: data.subscribers?.length || 0,
        campaignsCount: data.campaigns?.length || 0,
        templatesCount: data.templates?.length || 0,
        eventsCount: data.events?.length || 0,
        status: 'COMPLETED',
        createdAt: stats.birthtime.toISOString(),
        completedAt: stats.mtime.toISOString(),
        metadata: data.metadata,
      };

      return NextResponse.json({
        success: true,
        backup,
      });
    } catch (error) {
      console.error('Erro ao buscar backup:', error);

      return NextResponse.json(
        { success: false, error: 'Backup não encontrado' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Erro ao buscar backup:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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
    const backupsDir = path.join(process.cwd(), 'backups', 'newsletter');
    const backupFile = path.join(backupsDir, `${id}.json`);

    try {
      await fs.unlink(backupFile);

      return NextResponse.json({
        success: true,
        message: 'Backup deletado com sucesso',
      });
    } catch (error) {
      console.error('Erro ao buscar backup:', error);
      return NextResponse.json(
        { success: false, error: 'Backup não encontrado' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Erro ao deletar backup:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
