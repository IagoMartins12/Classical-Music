// src/app/(student)/student/progress/[reportId]/charts.tsx — os gráficos, carregados à parte
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

// A paleta que a tela declarava — veio junto com os gráficos, sem alteração.
const CHART_COLORS = {
  primary: '#3B82F6',
  secondary: '#8B5CF6',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#06B6D4',
  purple: '#8B5CF6',
  pink: '#EC4899',
  orange: '#F97316',
  gradient: [
    '#3B82F6',
    '#8B5CF6',
    '#10B981',
    '#F59E0B',
    '#EF4444',
    '#06B6D4',
    '#EC4899',
    '#F97316',
  ],
} as const;

interface ChartProps {
  progressData: any;
}

export function MonthlyEvolutionChart({ progressData }: ChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={progressData.evolution.monthly}>
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
          name="Aulas Concluídas"
        />
        <Line
          type="monotone"
          dataKey="studyHours"
          stroke={CHART_COLORS.success}
          strokeWidth={3}
          name="Horas de Estudo"
        />
        <Line
          type="monotone"
          dataKey="attendanceRate"
          stroke={CHART_COLORS.warning}
          strokeWidth={3}
          name="Taxa de Presença"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function BeforeAfterChart({ progressData }: ChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={[
          {
            metric: 'Obras',
            'Antes das Aulas':
              progressData.evolution.beforeAfter.beforeClasses.totalWorks,
            'Depois das Aulas':
              progressData.evolution.beforeAfter.afterClasses.totalWorks,
          },
          {
            metric: 'Favoritas',
            'Antes das Aulas':
              progressData.evolution.beforeAfter.beforeClasses.favoriteWorks,
            'Depois das Aulas':
              progressData.evolution.beforeAfter.afterClasses.favoriteWorks,
          },
          {
            metric: 'Anotações',
            'Antes das Aulas':
              progressData.evolution.beforeAfter.beforeClasses.annotations,
            'Depois das Aulas':
              progressData.evolution.beforeAfter.afterClasses.annotations,
          },
        ]}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
        <XAxis dataKey="metric" stroke="#9CA3AF" fontSize={12} />
        <YAxis stroke="#9CA3AF" fontSize={12} />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar dataKey="Antes das Aulas" fill={CHART_COLORS.secondary} />
        <Bar dataKey="Depois das Aulas" fill={CHART_COLORS.primary} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function SkillsRadarChart({ progressData }: ChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart
        data={[
          {
            skill: 'Técnica',
            value: progressData.insights.skillsAssessment.technique,
            fullMark: 5,
          },
          {
            skill: 'Interpretação',
            value: progressData.insights.skillsAssessment.interpretation,
            fullMark: 5,
          },
          {
            skill: 'Ritmo',
            value: progressData.insights.skillsAssessment.rhythm,
            fullMark: 5,
          },
          {
            skill: 'Afinação',
            value: progressData.insights.skillsAssessment.pitch,
            fullMark: 5,
          },
          {
            skill: 'Expressão',
            value: progressData.insights.skillsAssessment.expression,
            fullMark: 5,
          },
          {
            skill: 'Leitura',
            value: progressData.insights.skillsAssessment.sightReading,
            fullMark: 5,
          },
        ]}
      >
        <PolarGrid />
        <PolarAngleAxis dataKey="skill" />
        <PolarRadiusAxis angle={30} domain={[0, 5]} />
        <Radar
          name="Seu Nível"
          dataKey="value"
          stroke={CHART_COLORS.primary}
          fill={CHART_COLORS.primary}
          fillOpacity={0.3}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
