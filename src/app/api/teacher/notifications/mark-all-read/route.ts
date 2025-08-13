// app/api/teacher/notifications/mark-all-read/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !session.user.isTeacher) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();

    // Marcar todas as notificações não lidas como lidas
    const result = await prisma.notification.updateMany({
      where: {
        userId: session.user.id,
        status: 'UNREAD',
        expiresAt: { gte: now }, // Apenas não expiradas
      },
      data: {
        status: 'READ',
        readAt: now,
      },
    });

    return NextResponse.json({
      success: true,
      updatedCount: result.count,
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
