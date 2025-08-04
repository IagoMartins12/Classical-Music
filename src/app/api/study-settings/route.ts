// app/api/user/study-settings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/app/libs/prismadb';
import { revalidateTag } from 'next/cache';

export async function GET() {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        studyModeSettings: true,
        experienceLevel: true,
        practiceTimePerWeek: true,
        practiceReminders: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Configurações padrão
    const defaultSettings = {
      defaultMetronome: {
        bpm: 120,
        sound: 'click',
        volume: 0.5,
        timeSignature: '4/4',
      },
      pdfSettings: {
        zoom: 1.2,
        theme: 'light',
        layout: 'single',
        autoSave: true,
      },
      sessionSettings: {
        autoStart: false,
        reminderInterval: 30,
        defaultFocus: 'TECHNICAL',
      },
    };

    const studyModeSettings =
      user.studyModeSettings &&
      typeof user.studyModeSettings === 'object' &&
      !Array.isArray(user.studyModeSettings)
        ? { ...defaultSettings, ...user.studyModeSettings }
        : defaultSettings;

    return NextResponse.json({
      success: true,
      settings: {
        id: user.id,
        studyModeSettings,
        experienceLevel: user.experienceLevel,
        practiceTimePerWeek: user.practiceTimePerWeek,
        practiceReminders: user.practiceReminders,
      },
    });
  } catch (error) {
    console.error('Erro ao buscar configurações de estudo:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const {
      studyModeSettings,
      experienceLevel,
      practiceTimePerWeek,
      practiceReminders,
      progressTracking,
      publicProgress,
    } = body;

    // Validações básicas
    if (studyModeSettings) {
      if (
        studyModeSettings.defaultMetronome?.bpm &&
        (studyModeSettings.defaultMetronome.bpm < 30 ||
          studyModeSettings.defaultMetronome.bpm > 300)
      ) {
        return NextResponse.json(
          { error: 'BPM deve estar entre 30 e 300' },
          { status: 400 }
        );
      }

      if (
        studyModeSettings.pdfSettings?.zoom &&
        (studyModeSettings.pdfSettings.zoom < 0.5 ||
          studyModeSettings.pdfSettings.zoom > 5)
      ) {
        return NextResponse.json(
          { error: 'Zoom deve estar entre 0.5 e 5' },
          { status: 400 }
        );
      }
    }

    if (practiceTimePerWeek !== undefined && practiceTimePerWeek < 0) {
      return NextResponse.json(
        { error: 'Tempo de prática deve ser positivo' },
        { status: 400 }
      );
    }

    // Preparar dados para atualização
    const updateData: any = {};

    if (studyModeSettings !== undefined) {
      updateData.studyModeSettings = studyModeSettings;
    }

    if (experienceLevel !== undefined) {
      updateData.experienceLevel = experienceLevel;
    }

    if (practiceTimePerWeek !== undefined) {
      updateData.practiceTimePerWeek = practiceTimePerWeek;
    }

    if (practiceReminders !== undefined) {
      updateData.practiceReminders = practiceReminders;
    }

    if (progressTracking !== undefined) {
      updateData.progressTracking = progressTracking;
    }

    if (publicProgress !== undefined) {
      updateData.publicProgress = publicProgress;
    }

    // Atualizar usuário
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        studyModeSettings: true,
        experienceLevel: true,
        practiceTimePerWeek: true,
        practiceReminders: true,
      },
    });

    // Invalidar caches relevantes
    revalidateTag('user-study-settings');
    revalidateTag(`user-${session.user.id}`);

    return NextResponse.json({
      success: true,
      settings: {
        id: updatedUser.id,
        studyModeSettings: updatedUser.studyModeSettings,
        experienceLevel: updatedUser.experienceLevel,
        practiceTimePerWeek: updatedUser.practiceTimePerWeek,
        practiceReminders: updatedUser.practiceReminders,
      },
      message: 'Configurações atualizadas com sucesso',
    });
  } catch (error) {
    console.error('Erro ao atualizar configurações de estudo:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// app/api/user/study-settings/reset/route.ts - Para resetar configurações
export async function POST() {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Configurações padrão
    const defaultSettings = {
      defaultMetronome: {
        bpm: 120,
        sound: 'click',
        volume: 0.5,
        timeSignature: '4/4',
      },
      pdfSettings: {
        zoom: 1.2,
        theme: 'light',
        layout: 'single',
        autoSave: true,
      },
      sessionSettings: {
        autoStart: false,
        reminderInterval: 30,
        defaultFocus: 'TECHNICAL',
      },
    };

    // Resetar para configurações padrão
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        studyModeSettings: defaultSettings,
      },
      select: {
        id: true,
        studyModeSettings: true,
      },
    });

    // Invalidar caches
    revalidateTag('user-study-settings');
    revalidateTag(`user-${session.user.id}`);

    return NextResponse.json({
      success: true,
      settings: updatedUser.studyModeSettings,
      message: 'Configurações resetadas para o padrão',
    });
  } catch (error) {
    console.error('Erro ao resetar configurações:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
