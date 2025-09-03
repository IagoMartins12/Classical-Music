// app/components/Admin/ReportPriorityBadge.tsx - Badge de prioridade para reports
'use client';

import { FiAlertTriangle, FiClock, FiFlag } from 'react-icons/fi';

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
          icon: <FiAlertTriangle className="w-3 h-3" />,
          color: 'text-accent-red bg-accent-red/10 border-accent-red/30',
          label: 'Urgente',
          pulse: true,
        };
      case 'high':
        return {
          icon: <FiAlertTriangle className="w-3 h-3" />,
          color: 'text-accent-amber bg-accent-amber/10 border-accent-amber/30',
          label: 'Alta',
          pulse: false,
        };
      case 'low':
        return {
          icon: <FiFlag className="w-3 h-3" />,
          color: 'text-accent-blue bg-accent-blue/10 border-accent-blue/30',
          label: 'Baixa',
          pulse: false,
        };
      default:
        return {
          icon: <FiClock className="w-3 h-3" />,
          color: 'text-theme-tertiary bg-theme-secondary border-theme-primary',
          label: 'Normal',
          pulse: false,
        };
    }
  };

  const config = getPriorityConfig();

  return (
    <div
      className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full border text-xs font-medium ${
        config.color
      } ${config?.pulse ? 'animate-pulse' : ''} ${className}`}
    >
      {config?.icon}
      <span>{config?.label}</span>
    </div>
  );
}
