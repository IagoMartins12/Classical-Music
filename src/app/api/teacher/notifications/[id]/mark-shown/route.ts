// app/api/teacher/notifications/[id]/mark-shown/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !session.user.isTeacher) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { type } = await req.json(); // 'toast' | 'browser'

    const updateData: any = {};
    if (type === 'toast') {
      updateData.toastShown = true;
      updateData.lastShownAt = new Date();
    } else if (type === 'browser') {
      updateData.browserShown = true;
    }
    const { id } = await params;

    await prisma.notification.update({
      where: {
        id: id,
        userId: session.user.id,
      },
      data: updateData,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error marking notification as shown:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
