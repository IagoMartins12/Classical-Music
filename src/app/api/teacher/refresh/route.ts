// app/api/teacher/refresh/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import {
  getTeacherDashboardData,
  getTeacherStudentsData,
  getTeacherCalendarData,
  revalidateTeacherCache,
} from '@/app/requests/teacher-request';

export async function POST() {
  try {
    console.log('🔄 [REFRESH-API] Starting teacher data refresh...');

    // 1. Verificar autenticação
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // 2. Invalidar cache antes de buscar novos dados
    await revalidateTeacherCache(userId);

    // 3. Buscar dados atualizados em paralelo
    const [dashboardData, studentsData, calendarData] = await Promise.all([
      getTeacherDashboardData(userId),
      getTeacherStudentsData(userId, 'active', 20, 0),
      getTeacherCalendarData(userId),
    ]);

    console.log('✅ [REFRESH-API] Data refreshed successfully');

    return NextResponse.json({
      success: true,
      data: {
        dashboard: dashboardData,
        students: studentsData,
        calendar: calendarData,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ [REFRESH-API] Error refreshing data:', error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Erro interno do servidor',
      },
      { status: 500 }
    );
  }
}
