// app/components/Admin/ReportPriorityBadge.tsx - Badge de prioridade para reports
'use client';

import { PiClock, PiFlag, PiWarning } from 'react-icons/pi';

interface ReportPriorityBadgeProps {
  priority: 'low' | 'normal' | 'high' | 'urgent';
  createdAt: string;
  className?: string;
}

export default function ReportPriorityBadge({
  priority,
  createdAt,
  className = '',
}: ReportPriorityBadgeProps) {
  const getPriorityConfig = () => {
    // Calcular dias desde criação
    const days = Math.floor(
      (new Date().getTime() - new Date(createdAt).getTime()) /
        (1000 * 60 * 60 * 24)
    );

    // Determinar prioridade baseada no tempo se não especificada
    const calculatedPriority =
      priority === 'normal'
        ? days > 7
          ? 'urgent'
          : days > 3
            ? 'high'
            : 'normal'
        : priority;

    switch (calculatedPriority) {
      case 'urgent':
        return {
          icon: <PiWarning className="w-3 h-3" />,
          color: '',
          label: 'Urgente',
          pulse: true,
        };
      case 'high':
        return {
          icon: <PiWarning className="w-3 h-3" />,
          color: '',
          label: 'Alta',
          pulse: false,
        };
      case 'low':
        return {
          icon: <PiFlag className="w-3 h-3" />,
          color: '',
          label: 'Baixa',
          pulse: false,
        };
      default:
        return {
          icon: <PiClock className="w-3 h-3" />,
          color: 'text-theme-tertiary bg-theme-secondary border-theme-primary',
          label: 'Normal',
          pulse: false,
        };
    }
  };

  const config = getPriorityConfig();

  return (
    <div
      className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium bg-sup-2 ${
        config.color
      } ${config?.pulse ? 'animate-pulse' : ''} ${className}`}
    >
      {config?.icon}
      <span>{config?.label}</span>
    </div>
  );
}
