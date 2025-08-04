// app/components/Admin/Common/PeriodSelector.tsx
'use client';

import { FiCalendar } from 'react-icons/fi';
import Select from '@/app/components/Common/Select';

export type TimePeriod = '7d' | '30d' | '3m' | '6m' | '1y' | 'all';

interface PeriodSelectorProps {
  value: TimePeriod;
  onChange: (period: TimePeriod) => void;
  className?: string;
}

export default function PeriodSelector({
  value,
  onChange,
  className = '',
}: PeriodSelectorProps) {
  const periodOptions = [
    { value: '7d', label: 'Última semana' },
    { value: '30d', label: 'Último mês' },
    { value: '3m', label: 'Últimos 3 meses' },
    { value: '6m', label: 'Últimos 6 meses' },
    { value: '1y', label: 'Último ano' },
    { value: 'all', label: 'Todos os dados' },
  ];

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <FiCalendar className="w-4 h-4 text-theme-tertiary" />
      <Select
        value={value}
        onChange={(e) => onChange(e.target.value as TimePeriod)}
        options={periodOptions}
        className="input-classical-2 min-w-[140px]"
      />
    </div>
  );
}
