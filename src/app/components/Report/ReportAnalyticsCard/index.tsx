// app/components/Report/ReportAnalyticsCard.tsx
'use client';

import {
  REPORT_REASONS,
  getEntityTypePlural,
  useReportAnalytics,
} from '@/app/utils/reportHelpers';
import {
  AnimatedCard,
  LoadingSpinner,
} from '@/app/components/animation/AnimatedComponents';
import { FiTrendingUp, FiTrendingDown, FiMinus } from 'react-icons/fi';

interface ReportAnalyticsCardProps {
  period: string;
  title: string;
}

export default function ReportAnalyticsCard({
  period,
  title,
}: ReportAnalyticsCardProps) {
  const { analytics, loading, error } = useReportAnalytics(period);

  if (loading) {
    return (
      <AnimatedCard className="classical-card p-6 text-center">
        <LoadingSpinner size="md" />
        <p className="text-theme-secondary mt-2">Carregando analytics...</p>
      </AnimatedCard>
    );
  }

  if (error) {
    return (
      <AnimatedCard className="classical-card p-6 text-center">
        <p className="text-accent-red">{error}</p>
      </AnimatedCard>
    );
  }

  if (!analytics) return null;

  const getTrendIcon = (value: number) => {
    if (value > 50)
      return <FiTrendingUp className="w-4 h-4 text-accent-green" />;
    if (value < 25)
      return <FiTrendingDown className="w-4 h-4 text-accent-red" />;
    return <FiMinus className="w-4 h-4 text-theme-tertiary" />;
  };

  return (
    <AnimatedCard className="classical-card p-6">
      <h3 className="text-lg font-bold text-theme-primary mb-4">{title}</h3>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-theme-primary">
            {analytics.summary.totalReports}
          </div>
          <div className="text-sm text-theme-tertiary">Total Reports</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-theme-primary flex items-center justify-center space-x-1">
            <span>{Math.round(analytics.summary.resolutionRate)}%</span>
            {getTrendIcon(analytics.summary.resolutionRate)}
          </div>
          <div className="text-sm text-theme-tertiary">Taxa de Resolução</div>
        </div>
      </div>

      {/* Top Reasons */}
      {analytics.breakdown.topReasons.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-theme-primary mb-2">
            Principais Motivos
          </h4>
          <div className="space-y-2">
            {analytics.breakdown.topReasons.slice(0, 3).map((item) => {
              const reasonConfig =
                REPORT_REASONS[item.reason as keyof typeof REPORT_REASONS];
              return (
                <div
                  key={item.reason}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-theme-secondary">
                    {reasonConfig?.icon} {reasonConfig?.label || item.reason}
                  </span>
                  <span className="font-medium text-theme-primary">
                    {item._count.id}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Top Types */}
      {analytics.breakdown.topTypes.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-theme-primary mb-2">
            Tipos Mais Reportados
          </h4>
          <div className="space-y-2">
            {analytics.breakdown.topTypes.map((item) => (
              <div
                key={item.entityType}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-theme-secondary">
                  {getEntityTypePlural(item.entityType)}
                </span>
                <span className="font-medium text-theme-primary">
                  {item._count.id}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </AnimatedCard>
  );
}
