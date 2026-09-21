// src/app/(teacher)/teacher/students/[studentId]/progress/charts.tsx — os gráficos, carregados à parte
//
// O `recharts` pesa mais que o resto desta tela somada e nada nele é preciso
// para a primeira pintura: importado direto, descia no pacote inicial de quem
// nem rola até os gráficos. Aqui vira um `next/dynamic` sem SSR — o mesmo
// tratamento que o painel administrativo já recebeu em
// `components/Admin/Charts/AdminCharts`.
//
// O JSX abaixo é o que estava na tela, sem uma vírgula de diferença: mudou de
// onde ele é carregado, não o que ele desenha.
'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';
import { CHART_COLORS } from '@/app/hooks/lessonsSystem/useTeacherProgressReport';

/** Mesmo tooltip de antes — morava na tela e só os gráficos o usavam. */
// Custom tooltip for charts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-theme-elevated border border-theme-primary rounded-lg p-3 shadow-theme-medium">
        <p className="text-theme-primary font-medium mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value}
            {entry.name.includes('Rate') || entry.name.includes('Taxa')
              ? '%'
              : ''}
            {entry.name.includes('Hours') || entry.name.includes('Horas')
              ? 'h'
              : ''}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

interface ChartProps {
  reportData: any;
  t: (key: string, params?: Record<string, string | number>) => string;
}

export function MonthlyEvolutionChart({ reportData, t }: ChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={reportData.evolution.monthly}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
        <XAxis dataKey="month" stroke="#9CA3AF" fontSize={12} />
        <YAxis stroke="#9CA3AF" fontSize={12} />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Line
          type="monotone"
          dataKey="lessonsCompleted"
          stroke={CHART_COLORS.primary}
          strokeWidth={3}
          name={t('chart_lessons_completed')}
        />
        <Line
          type="monotone"
          dataKey="studyHours"
          stroke={CHART_COLORS.success}
          strokeWidth={3}
          name={t('chart_study_hours')}
        />
        <Line
          type="monotone"
          dataKey="attendanceRate"
          stroke={CHART_COLORS.warning}
          strokeWidth={3}
          name={t('chart_attendance_rate')}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function BeforeAfterChart({ reportData, t }: ChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={[
          {
            metric: 'Obras',
            [t('before_classes')]:
              reportData.evolution.beforeAfter.beforeClasses.totalWorks,
            [t('after_classes')]:
              reportData.evolution.beforeAfter.afterClasses.totalWorks,
          },
          {
            metric: 'Favoritas',
            [t('before_classes')]:
              reportData.evolution.beforeAfter.beforeClasses.favoriteWorks,
            [t('after_classes')]:
              reportData.evolution.beforeAfter.afterClasses.favoriteWorks,
          },
          {
            metric: 'Anotações',
            [t('before_classes')]:
              reportData.evolution.beforeAfter.beforeClasses.annotations,
            [t('after_classes')]:
              reportData.evolution.beforeAfter.afterClasses.annotations,
          },
          {
            metric: 'Prática (min)',
            [t('before_classes')]:
              reportData.evolution.beforeAfter.beforeClasses.practiceTime,
            [t('after_classes')]:
              reportData.evolution.beforeAfter.afterClasses.practiceTime,
          },
        ]}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
        <XAxis dataKey="metric" stroke="#9CA3AF" fontSize={12} />
        <YAxis stroke="#9CA3AF" fontSize={12} />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar dataKey={t('before_classes')} fill={CHART_COLORS.secondary} />
        <Bar dataKey={t('after_classes')} fill={CHART_COLORS.primary} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function SkillsRadarChart({ reportData }: ChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart
        data={[
          {
            skill: 'Técnica',
            value: reportData.insights.skillsAssessment.technique,
            fullMark: 5,
          },
          {
            skill: 'Interpretação',
            value: reportData.insights.skillsAssessment.interpretation,
            fullMark: 5,
          },
          {
            skill: 'Ritmo',
            value: reportData.insights.skillsAssessment.rhythm,
            fullMark: 5,
          },
          {
            skill: 'Afinação',
            value: reportData.insights.skillsAssessment.pitch,
            fullMark: 5,
          },
          {
            skill: 'Expressão',
            value: reportData.insights.skillsAssessment.expression,
            fullMark: 5,
          },
          {
            skill: 'Leitura',
            value: reportData.insights.skillsAssessment.sightReading,
            fullMark: 5,
          },
        ]}
      >
        <PolarGrid />
        <PolarAngleAxis dataKey="skill" />
        <PolarRadiusAxis angle={30} domain={[0, 5]} />
        <Radar
          name="Nível Atual"
          dataKey="value"
          stroke={CHART_COLORS.primary}
          fill={CHART_COLORS.primary}
          fillOpacity={0.3}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
