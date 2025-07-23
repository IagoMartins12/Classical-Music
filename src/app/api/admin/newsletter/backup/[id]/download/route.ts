import { authOptions } from '@/app/libs/auth';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

// app/api/admin/newsletter/backup/[id]/download/route.ts
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
      const content = await fs.readFile(backupFile, 'utf-8');

      return new NextResponse(content, {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="${id}.json"`,
        },
      });
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Backup não encontrado' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Erro no download:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
