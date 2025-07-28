// types/backup.ts
export interface BackupSchedule {
  id: string;
  name: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string; // Format: "HH:MM"
  dayOfWeek?: number; // 0-6 (0 = Sunday) - usado para frequency === 'weekly'
  dayOfMonth?: number; // 1-28 - usado para frequency === 'monthly'
  collections: string[];
  retentionDays: number;
  enabled: boolean;
  nextRun: Date;
  lastRun?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBackupScheduleRequest {
  name: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string;
  dayOfWeek?: number;
  dayOfMonth?: number;
  collections: string[];
  retentionDays: number;
  enabled: boolean;
}

// Função para gerar expressão cron baseada na configuração
export function generateCronExpression(
  schedule: CreateBackupScheduleRequest
): string {
  const [hour, minute] = schedule.time.split(':').map(Number);

  switch (schedule.frequency) {
    case 'daily':
      // Todo dia no horário especificado
      return `${minute} ${hour} * * *`;

    case 'weekly':
      // Todo dia da semana especificado no horário
      const dayOfWeek = schedule.dayOfWeek ?? 0; // Default domingo
      return `${minute} ${hour} * * ${dayOfWeek}`;

    case 'monthly':
      // Todo dia do mês especificado no horário
      const dayOfMonth = schedule.dayOfMonth ?? 1; // Default dia 1
      return `${minute} ${hour} ${dayOfMonth} * *`;

    default:
      throw new Error(`Frequência não suportada: ${schedule.frequency}`);
  }
}

// Função para calcular próxima execução
export function calculateNextRun(schedule: CreateBackupScheduleRequest): Date {
  const now = new Date();
  const [hour, minute] = schedule.time.split(':').map(Number);

  let nextRun: Date;

  switch (schedule.frequency) {
    case 'daily':
      nextRun = new Date(now);
      nextRun.setHours(hour, minute, 0, 0);

      // Se já passou da hora hoje, agendar para amanhã
      if (nextRun <= now) {
        nextRun.setDate(nextRun.getDate() + 1);
      }
      break;

    case 'weekly':
      const dayOfWeek = schedule.dayOfWeek ?? 0;
      nextRun = new Date(now);
      nextRun.setHours(hour, minute, 0, 0);

      // Calcular dias até o próximo dia da semana especificado
      const currentDay = now.getDay();
      let daysToAdd = dayOfWeek - currentDay;

      if (daysToAdd < 0 || (daysToAdd === 0 && nextRun <= now)) {
        daysToAdd += 7; // Próxima semana
      }

      nextRun.setDate(nextRun.getDate() + daysToAdd);
      break;

    case 'monthly':
      const dayOfMonth = schedule.dayOfMonth ?? 1;
      nextRun = new Date(
        now.getFullYear(),
        now.getMonth(),
        dayOfMonth,
        hour,
        minute,
        0,
        0
      );

      // Se já passou este mês, agendar para o próximo
      if (nextRun <= now) {
        nextRun.setMonth(nextRun.getMonth() + 1);
      }

      // Garantir que o dia existe no mês (ex: 30 de fevereiro)
      if (nextRun.getDate() !== dayOfMonth) {
        nextRun = new Date(
          nextRun.getFullYear(),
          nextRun.getMonth() + 1,
          dayOfMonth,
          hour,
          minute,
          0,
          0
        );
      }
      break;

    default:
      throw new Error(`Frequência não suportada: ${schedule.frequency}`);
  }

  return nextRun;
}

// Função para obter descrição amigável do agendamento
export function getScheduleDescription(schedule: BackupSchedule): string {
  const DAYS_OF_WEEK = [
    'Domingo',
    'Segunda-feira',
    'Terça-feira',
    'Quarta-feira',
    'Quinta-feira',
    'Sexta-feira',
    'Sábado',
  ];

  switch (schedule.frequency) {
    case 'daily':
      return `Diariamente às ${schedule.time}`;

    case 'weekly':
      const dayName = DAYS_OF_WEEK[schedule.dayOfWeek ?? 0];
      return `Toda ${dayName} às ${schedule.time}`;

    case 'monthly':
      const day = schedule.dayOfMonth ?? 1;
      return `Todo dia ${day} do mês às ${schedule.time}`;

    default:
      return `${schedule.frequency} às ${schedule.time}`;
  }
}

// Função para validar configuração de agendamento
export function validateScheduleConfig(
  schedule: CreateBackupScheduleRequest
): string[] {
  const errors: string[] = [];

  if (!schedule.name?.trim()) {
    errors.push('Nome do agendamento é obrigatório');
  }

  if (!['daily', 'weekly', 'monthly'].includes(schedule.frequency)) {
    errors.push('Frequência deve ser daily, weekly ou monthly');
  }

  // Validar formato do horário
  const timeRegex = /^([01]?[0-9]|2[0-3]):([0-5][0-9])$/;
  if (!timeRegex.test(schedule.time)) {
    errors.push('Horário deve estar no formato HH:MM (00:00 - 23:59)');
  }

  // Validações específicas por frequência
  if (schedule.frequency === 'weekly') {
    if (
      schedule.dayOfWeek === undefined ||
      schedule.dayOfWeek < 0 ||
      schedule.dayOfWeek > 6
    ) {
      errors.push(
        'Dia da semana deve ser entre 0 (domingo) e 6 (sábado) para agendamento semanal'
      );
    }
  }

  if (schedule.frequency === 'monthly') {
    if (
      schedule.dayOfMonth === undefined ||
      schedule.dayOfMonth < 1 ||
      schedule.dayOfMonth > 28
    ) {
      errors.push('Dia do mês deve ser entre 1 e 28 para agendamento mensal');
    }
  }

  if (schedule.retentionDays < 1 || schedule.retentionDays > 365) {
    errors.push('Retenção deve ser entre 1 e 365 dias');
  }

  return errors;
}

// Exemplo de uso das funções
export const SCHEDULE_EXAMPLES = {
  daily: {
    name: 'Backup Diário',
    frequency: 'daily' as const,
    time: '02:00',
    collections: [],
    retentionDays: 7,
    enabled: true,
  },

  weekly: {
    name: 'Backup Semanal - Domingo',
    frequency: 'weekly' as const,
    time: '03:00',
    dayOfWeek: 0, // Domingo
    collections: [],
    retentionDays: 30,
    enabled: true,
  },

  monthly: {
    name: 'Backup Mensal - Dia 1',
    frequency: 'monthly' as const,
    time: '01:00',
    dayOfMonth: 1, // Primeiro dia do mês
    collections: [],
    retentionDays: 90,
    enabled: true,
  },
};
