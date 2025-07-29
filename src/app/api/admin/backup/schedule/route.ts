// app/api/admin/backup/schedule/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import fs from 'fs/promises';
import path from 'path';
import {
  BackupSchedule,
  CreateBackupScheduleRequest,
  generateCronExpression,
  calculateNextRun,
  validateScheduleConfig,
  getScheduleDescription,
} from '@/app/types/backup';

// Caminho para armazenar os agendamentos
const SCHEDULES_FILE = path.join(
  process.cwd(),
  'data',
  'backup-schedules.json'
);

// Função para carregar agendamentos
async function loadSchedules(): Promise<BackupSchedule[]> {
  try {
    // Garantir que o diretório existe
    const dataDir = path.dirname(SCHEDULES_FILE);
    await fs.mkdir(dataDir, { recursive: true });

    const content = await fs.readFile(SCHEDULES_FILE, 'utf8');
    return JSON.parse(content);
  } catch {
    // Se o arquivo não existir, retornar array vazio
    return [];
  }
}

// Função para salvar agendamentos
async function saveSchedules(schedules: BackupSchedule[]): Promise<void> {
  const dataDir = path.dirname(SCHEDULES_FILE);
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(SCHEDULES_FILE, JSON.stringify(schedules, null, 2));
}

// GET - Listar agendamentos
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 2) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const schedules = await loadSchedules();

    // Atualizar próximas execuções se necessário
    const now = new Date();
    let schedulesUpdated = false;

    for (const schedule of schedules) {
      if (schedule.enabled && new Date(schedule.nextRun) <= now) {
        // Recalcular próxima execução
        schedule.nextRun = calculateNextRun({
          name: schedule.name,
          frequency: schedule.frequency,
          time: schedule.time,
          dayOfWeek: schedule.dayOfWeek,
          dayOfMonth: schedule.dayOfMonth,
          collections: schedule.collections,
          retentionDays: schedule.retentionDays,
          enabled: schedule.enabled,
        });
        schedulesUpdated = true;
      }
    }

    if (schedulesUpdated) {
      await saveSchedules(schedules);
    }

    return NextResponse.json({
      success: true,
      schedules: schedules.map((schedule) => ({
        ...schedule,
        description: getScheduleDescription(schedule),
        cronExpression: generateCronExpression({
          name: schedule.name,
          frequency: schedule.frequency,
          time: schedule.time,
          dayOfWeek: schedule.dayOfWeek,
          dayOfMonth: schedule.dayOfMonth,
          collections: schedule.collections,
          retentionDays: schedule.retentionDays,
          enabled: schedule.enabled,
        }),
      })),
    });
  } catch (error) {
    console.error('Erro ao listar agendamentos:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST - Criar novo agendamento
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 2) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const requestData: CreateBackupScheduleRequest = await request.json();

    // Validar dados de entrada
    const validationErrors = validateScheduleConfig(requestData);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Dados inválidos',
          details: validationErrors,
        },
        { status: 400 }
      );
    }

    const schedules = await loadSchedules();

    // Verificar se já existe agendamento com o mesmo nome
    const existingSchedule = schedules.find((s) => s.name === requestData.name);
    if (existingSchedule) {
      return NextResponse.json(
        {
          success: false,
          error: 'Já existe um agendamento com este nome',
        },
        { status: 409 }
      );
    }

    // Criar novo agendamento
    const newSchedule: BackupSchedule = {
      id: `schedule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: requestData.name,
      frequency: requestData.frequency,
      time: requestData.time,
      dayOfWeek: requestData.dayOfWeek,
      dayOfMonth: requestData.dayOfMonth,
      collections: requestData.collections,
      retentionDays: requestData.retentionDays,
      enabled: requestData.enabled,
      nextRun: calculateNextRun(requestData),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    schedules.push(newSchedule);
    await saveSchedules(schedules);

    // Log para debug
    console.log('📅 Novo agendamento criado:', {
      id: newSchedule.id,
      name: newSchedule.name,
      description: getScheduleDescription(newSchedule),
      cronExpression: generateCronExpression(requestData),
      nextRun: newSchedule.nextRun,
    });

    return NextResponse.json({
      success: true,
      message: 'Agendamento criado com sucesso',
      schedule: {
        ...newSchedule,
        description: getScheduleDescription(newSchedule),
        cronExpression: generateCronExpression(requestData),
      },
    });
  } catch (error) {
    console.error('Erro ao criar agendamento:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// PUT - Atualizar agendamento
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 2) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const scheduleId = searchParams.get('id');

    if (!scheduleId) {
      return NextResponse.json(
        { error: 'ID do agendamento é obrigatório' },
        { status: 400 }
      );
    }

    const requestData: CreateBackupScheduleRequest = await request.json();

    // Validar dados de entrada
    const validationErrors = validateScheduleConfig(requestData);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Dados inválidos',
          details: validationErrors,
        },
        { status: 400 }
      );
    }

    const schedules = await loadSchedules();
    const scheduleIndex = schedules.findIndex((s) => s.id === scheduleId);

    if (scheduleIndex === -1) {
      return NextResponse.json(
        { error: 'Agendamento não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se já existe outro agendamento com o mesmo nome
    const existingSchedule = schedules.find(
      (s) => s.name === requestData.name && s.id !== scheduleId
    );
    if (existingSchedule) {
      return NextResponse.json(
        {
          success: false,
          error: 'Já existe outro agendamento com este nome',
        },
        { status: 409 }
      );
    }

    // Atualizar agendamento
    const updatedSchedule: BackupSchedule = {
      ...schedules[scheduleIndex],
      name: requestData.name,
      frequency: requestData.frequency,
      time: requestData.time,
      dayOfWeek: requestData.dayOfWeek,
      dayOfMonth: requestData.dayOfMonth,
      collections: requestData.collections,
      retentionDays: requestData.retentionDays,
      enabled: requestData.enabled,
      nextRun: calculateNextRun(requestData),
      updatedAt: new Date(),
    };

    schedules[scheduleIndex] = updatedSchedule;
    await saveSchedules(schedules);

    console.log('📅 Agendamento atualizado:', {
      id: updatedSchedule.id,
      name: updatedSchedule.name,
      description: getScheduleDescription(updatedSchedule),
      nextRun: updatedSchedule.nextRun,
    });

    return NextResponse.json({
      success: true,
      message: 'Agendamento atualizado com sucesso',
      schedule: {
        ...updatedSchedule,
        description: getScheduleDescription(updatedSchedule),
        cronExpression: generateCronExpression(requestData),
      },
    });
  } catch (error) {
    console.error('Erro ao atualizar agendamento:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Remover agendamento
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 2) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const scheduleId = searchParams.get('id');

    if (!scheduleId) {
      return NextResponse.json(
        { error: 'ID do agendamento é obrigatório' },
        { status: 400 }
      );
    }

    const schedules = await loadSchedules();
    const scheduleIndex = schedules.findIndex((s) => s.id === scheduleId);

    if (scheduleIndex === -1) {
      return NextResponse.json(
        { error: 'Agendamento não encontrado' },
        { status: 404 }
      );
    }

    const removedSchedule = schedules[scheduleIndex];
    schedules.splice(scheduleIndex, 1);
    await saveSchedules(schedules);

    console.log('📅 Agendamento removido:', {
      id: removedSchedule.id,
      name: removedSchedule.name,
    });

    return NextResponse.json({
      success: true,
      message: 'Agendamento removido com sucesso',
    });
  } catch (error) {
    console.error('Erro ao remover agendamento:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
