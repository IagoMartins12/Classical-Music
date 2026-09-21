// app/(student)/student/progress/charts.tsx — os gráficos, carregados à parte
//
// Este arquivo existe por causa do peso do `recharts`: importado direto na
// tela, ele entrava no pacote inicial dela (259 kB, o maior do portal) e
// descia antes de qualquer pixel, embora os gráficos fiquem abaixo da dobra e
// a tela funcione sem eles. Aqui viram um `next/dynamic` sem SSR — o mesmo
// tratamento que o painel administrativo já recebeu em
// `components/Admin/Charts/AdminCharts`.
//
// O JSX abaixo é o que estava em `pageClient.tsx`, sem alteração: o que mudou
// foi de onde ele é carregado.
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
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { FiBarChart2, FiTarget } from 'react-icons/fi';
import {
  AnimatedCard,
  AnimatedItem,
} from '@/app/components/animation/AnimatedComponents';
import {
  CHART_COLORS,
  getAssignmentTypeLabel,
} from '@/app/hooks/lessonsSystem/useStudentProgress';
import { StudentProgressResponse } from '@/app/requests/student-progress-requests';

interface ProgressChartsProps {
  progressData: StudentProgressResponse;
  t: (key: string, params?: Record<string, string | number>) => string;
}

/** Mesmo tooltip de antes — morava no `pageClient` e só os gráficos o usavam. */
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-theme-elevated border border-theme-primary rounded-lg p-3 shadow-theme-medium">
        <p className="text-theme-primary font-medium mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value}
            {entry.name.includes('Horas') && 'h'}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function ProgressCharts({
  progressData,
  t,
}: ProgressChartsProps) {
  return (
    <>
      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
        {/* Monthly Progress Chart */}
        <AnimatedItem direction="left" springType="smooth">
          <AnimatedCard hover="lift" className="classical-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-theme-primary">
                {t('monthly_evolution')}
              </h3>
              <FiBarChart2 className="w-6 h-6 text-brand-primary" />
            </div>

            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={progressData.monthlyData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#374151"
                    opacity={0.3}
                  />
                  <XAxis dataKey="month" stroke="#9CA3AF" fontSize={12} />
                  <YAxis stroke="#9CA3AF" fontSize={12} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="completedLessons"
                    stroke={CHART_COLORS.primary}
                    strokeWidth={3}
                    dot={{ fill: CHART_COLORS.primary, strokeWidth: 2, r: 4 }}
                    name={t('completed_lesson_chart')}
                  />
                  <Line
                    type="monotone"
                    dataKey="studyHours"
                    stroke={CHART_COLORS.secondary}
                    strokeWidth={3}
                    dot={{
                      fill: CHART_COLORS.secondary,
                      strokeWidth: 2,
                      r: 4,
                    }}
                    name={t('study_hours_chart')}
                  />
                  <Line
                    type="monotone"
                    dataKey="learnedWorks"
                    stroke={CHART_COLORS.success}
                    strokeWidth={3}
                    dot={{ fill: CHART_COLORS.success, strokeWidth: 2, r: 4 }}
                    name={t('learned_works_chart')}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </AnimatedCard>
        </AnimatedItem>

        {/* Assignment Types Chart */}
        <AnimatedItem direction="right" springType="smooth">
          <AnimatedCard hover="lift" className="classical-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-theme-primary">
                {t('assignment_types')}
              </h3>
              <FiTarget className="w-6 h-6 text-brand-primary" />
            </div>

            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={progressData.assignmentBreakdown?.map(
                      (item, index) => ({
                        name: getAssignmentTypeLabel(item.type),
                        value: item.completed,
                        fill: CHART_COLORS.gradient[
                          index % CHART_COLORS.gradient.length
                        ],
                      })
                    )}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      percent > 0.05
                        ? `${name} (${(percent * 100).toFixed(0)}%)`
                        : ''
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {progressData.assignmentBreakdown?.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          CHART_COLORS.gradient[
                            index % CHART_COLORS.gradient.length
                          ]
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </AnimatedCard>
        </AnimatedItem>
      </div>
    </>
  );
}
