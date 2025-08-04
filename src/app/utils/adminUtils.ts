import { TimePeriod } from '../components/Admin/Common/PeriodSelector';

export function getPeriodDate(period: TimePeriod): Date | null {
  if (period === 'all') return null;

  const now = new Date();
  switch (period) {
    case '7d':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case '30d':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case '3m':
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    case '6m':
      return new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
    case '1y':
      return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    default:
      return null;
  }
}

export function getPeriodLabel(period: TimePeriod): string {
  const periodLabels = {
    '7d': 'última semana',
    '30d': 'último mês',
    '3m': 'últimos 3 meses',
    '6m': 'últimos 6 meses',
    '1y': 'último ano',
    all: 'todo o período',
  };

  return periodLabels[period];
}
