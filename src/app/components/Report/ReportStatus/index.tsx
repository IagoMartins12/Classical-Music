// app/components/Common/ReportStatus.tsx - Exibir status de reports em cards
'use client';

import { PiCheck, PiClock, PiFlag, PiX } from 'react-icons/pi';

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
          icon: <PiClock className="w-3 h-3" />,
          color: '',
          label: 'Pendente',
        };
      case 'approved':
        return {
          icon: <PiCheck className="w-3 h-3" />,
          color: '',
          label: 'Aprovado',
        };
      case 'rejected':
        return {
          icon: <PiX className="w-3 h-3" />,
          color: '',
          label: 'Rejeitado',
        };
      default:
        return {
          icon: <PiFlag className="w-3 h-3" />,
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
