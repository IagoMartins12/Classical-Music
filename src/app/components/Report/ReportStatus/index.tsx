// app/components/Common/ReportStatus.tsx - Exibir status de reports em cards
'use client';

import { FiFlag, FiClock, FiCheck, FiX } from 'react-icons/fi';

interface ReportStatusProps {
  hasReports: boolean;
  reportCount?: number;
  status?: 'pending' | 'approved' | 'rejected';
  className?: string;
}

export default function ReportStatus({
  hasReports,
  reportCount = 0,
  status = 'pending',
  className = '',
}: ReportStatusProps) {
  if (!hasReports) return null;

  const getStatusConfig = () => {
    switch (status) {
      case 'pending':
        return {
          icon: <FiClock className="w-3 h-3" />,
          color: 'text-accent-amber bg-accent-amber/10 border-accent-amber/30',
          label: 'Pendente',
        };
      case 'approved':
        return {
          icon: <FiCheck className="w-3 h-3" />,
          color: 'text-accent-green bg-accent-green/10 border-accent-green/30',
          label: 'Aprovado',
        };
      case 'rejected':
        return {
          icon: <FiX className="w-3 h-3" />,
          color: 'text-accent-red bg-accent-red/10 border-accent-red/30',
          label: 'Rejeitado',
        };
      default:
        return {
          icon: <FiFlag className="w-3 h-3" />,
          color: 'text-theme-tertiary bg-theme-secondary border-theme-primary',
          label: 'Reportado',
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div
      className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full border text-xs font-medium ${config?.color} ${className}`}
      title={`${reportCount} report(s) - ${config?.label}`}
    >
      {config?.icon}
      <span>{config?.label}</span>
      {reportCount > 1 && (
        <span className="ml-1 px-1 py-0.5 bg-current text-white rounded-full text-xs">
          {reportCount}
        </span>
      )}
    </div>
  );
}
