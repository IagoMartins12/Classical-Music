// app/components/Admin/Charts/AdminCharts.tsx
'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export interface ChartData {
  name?: string;
  value?: number; // usado em Area, Bar, Pie, etc.
  [key: string]: string | number | undefined;
}

interface AdminChartProps {
  data: ChartData[];
  height?: number;
  color?: string;
  title?: string;
  subtitle?: string;
}

// Paleta de cores para gráficos
const CHART_COLORS = {
  primary: '#3B82F6',
  secondary: '#10B981',
  accent: '#F59E0B',
  warning: '#EF4444',
  purple: '#8B5CF6',
  pink: '#EC4899',
  indigo: '#6366F1',
  teal: '#14B8A6',
};

const GRADIENT_COLORS = [
  CHART_COLORS.primary,
  CHART_COLORS.secondary,
  CHART_COLORS.accent,
  CHART_COLORS.warning,
  CHART_COLORS.purple,
  CHART_COLORS.pink,
  CHART_COLORS.indigo,
  CHART_COLORS.teal,
];

// Componente de Tooltip customizado
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-theme-elevated border border-theme-primary rounded-xl p-3 shadow-2xl">
        <p className="text-sm font-medium text-theme-primary">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}:{' '}
            {typeof entry.value === 'number'
              ? entry.value.toLocaleString()
              : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Gráfico de Área para tendências
export const TrendAreaChart = ({
  data,
  height = 300,
  color = CHART_COLORS.primary,
  title,
  subtitle,
}: AdminChartProps) => (
  <div className="w-full">
    {(title || subtitle) && (
      <div className="mb-4">
        {title && (
          <h3 className="text-lg font-bold text-theme-primary">{title}</h3>
        )}
        {subtitle && <p className="text-sm text-theme-tertiary">{subtitle}</p>}
      </div>
    )}
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart
        data={data}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id="colorArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="name"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: '#6B7280' }}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: '#6B7280' }}
        />
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          fillOpacity={1}
          fill="url(#colorArea)"
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

// Gráfico de Linha para múltiplas séries
export const MultiLineChart = ({
  data,
  height = 300,
  title,
  subtitle,
  lines = ['value'],
}: AdminChartProps & { lines?: string[] }) => (
  <div className="w-full">
    {(title || subtitle) && (
      <div className="mb-4">
        {title && (
          <h3 className="text-lg font-bold text-theme-primary">{title}</h3>
        )}
        {subtitle && <p className="text-sm text-theme-tertiary">{subtitle}</p>}
      </div>
    )}
    <ResponsiveContainer width="100%" height={height}>
      <LineChart
        data={data}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
        <XAxis
          dataKey="name"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: '#6B7280' }}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: '#6B7280' }}
        />
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
        <Tooltip content={<CustomTooltip />} />
        {lines.map((line, index) => (
          <Line
            key={line}
            type="monotone"
            dataKey={line}
            stroke={GRADIENT_COLORS[index % GRADIENT_COLORS.length]}
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  </div>
);

// Gráfico de Barras
export const AdminBarChart = ({
  data,
  height = 300,
  color = CHART_COLORS.primary,
  title,
  subtitle,
}: AdminChartProps) => (
  <div className="w-full">
    {(title || subtitle) && (
      <div className="mb-4">
        {title && (
          <h3 className="text-lg font-bold text-theme-primary">{title}</h3>
        )}
        {subtitle && <p className="text-sm text-theme-tertiary">{subtitle}</p>}
      </div>
    )}
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <XAxis
          dataKey="name"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: '#6B7280' }}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: '#6B7280' }}
        />
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

// Gráfico de Pizza/Donut
export const AdminPieChart = ({
  data,
  height = 300,
  title,
  subtitle,
  innerRadius = 0,
  showLabels = true,
}: AdminChartProps & { innerRadius?: number; showLabels?: boolean }) => {
  return (
    <div className="w-full">
      {(title || subtitle) && (
        <div className="mb-4 text-center">
          {title && (
            <h3 className="text-lg font-bold text-theme-primary">{title}</h3>
          )}
          {subtitle && (
            <p className="text-sm text-theme-tertiary">{subtitle}</p>
          )}
        </div>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={
              showLabels
                ? ({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                : false
            }
            outerRadius={80}
            innerRadius={innerRadius}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={GRADIENT_COLORS[index % GRADIENT_COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

// Componente de métricas rápidas com mini-gráficos
export const MetricCard = ({
  title,
  value,
  change,
  data,
  icon: Icon,
  color = CHART_COLORS.primary,
  subtitle,
}: {
  title: string;
  value: string | number;
  change?: { value: number | string; isPositive: boolean };
  data?: ChartData[];
  icon?: React.ComponentType<any>;
  color?: string;
  subtitle?: string;
}) => (
  <div className="classical-card p-6 relative overflow-hidden">
    <div className="flex items-start justify-between mb-4">
      <div>
        <p className="text-sm text-theme-tertiary mb-1">{title}</p>
        {subtitle && (
          <p className="text-xs text-theme-tertiary mb-1">{subtitle}</p>
        )}
        <p className="text-3xl font-bold text-theme-primary">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        {change && (
          <div
            className={`flex items-center space-x-1 mt-2 ${
              change.isPositive ? 'text-accent-green' : 'text-accent-red'
            }`}
          >
            <span className="text-sm font-medium">
              {change.isPositive ? '+' : ''}
              {typeof change.value === 'number'
                ? change.value.toFixed(1)
                : change.value}
              %
            </span>
          </div>
        )}
      </div>
      {Icon && (
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon className="w-6 h-6" style={{ color }} />
        </div>
      )}
    </div>

    {data && data.length > 0 && (
      <div className="h-16">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient
                id={`mini-gradient-${title}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              fillOpacity={1}
              fill={`url(#mini-gradient-${title})`}
              strokeWidth={1}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    )}
  </div>
);

// Gráfico de comparação de barras horizontais
export const HorizontalBarChart = ({
  data,
  color = CHART_COLORS.primary,
  title,
  subtitle,
}: AdminChartProps) => (
  <div className="w-full">
    {(title || subtitle) && (
      <div className="mb-4">
        {title && (
          <h3 className="text-lg font-bold text-theme-primary">{title}</h3>
        )}
        {subtitle && <p className="text-sm text-theme-tertiary">{subtitle}</p>}
      </div>
    )}
    <div className="space-y-3">
      {data.map((item, index) => {
        const maxValue = Math.max(
          ...data.map((d) => (typeof d.value === 'number' ? d.value : 0))
        );
        const percentage =
          typeof item.value === 'number' && maxValue > 0
            ? (item.value / maxValue) * 100
            : 0;

        return (
          <div key={index} className="flex items-center space-x-3">
            <div className="w-24 text-sm font-medium text-theme-primary truncate">
              {item.name}
            </div>
            <div className="flex-1 bg-theme-secondary rounded-full h-3 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{
                  width: `${percentage}%`,
                  backgroundColor: color,
                }}
              />
            </div>
            <div className="w-16 text-sm font-bold text-theme-primary text-right">
              {item.value ? item.value.toLocaleString() : 'Valor desconhecido'}
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

// Gráfico de heatmap simples
export const SimpleHeatmap = ({
  data,
  title,
  subtitle,
}: {
  data: Array<{ day: string; hour: number; value: number }>;
  title?: string;
  subtitle?: string;
}) => {
  const maxValue = Math.max(...data.map((d) => d.value));
  const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const getIntensity = (value: number) => {
    return (value / maxValue) * 100;
  };

  return (
    <div className="w-full">
      {(title || subtitle) && (
        <div className="mb-4">
          {title && (
            <h3 className="text-lg font-bold text-theme-primary">{title}</h3>
          )}
          {subtitle && (
            <p className="text-sm text-theme-tertiary">{subtitle}</p>
          )}
        </div>
      )}

      <div className="grid grid-cols-25 gap-1">
        {/* Header com horas */}
        <div></div>
        {hours.map((hour) => (
          <div
            key={hour}
            className="text-xs text-theme-tertiary text-center p-1"
          >
            {hour}
          </div>
        ))}

        {/* Dados do heatmap */}
        {days.map((day) => (
          <div key={day} className="contents">
            <div className="text-xs text-theme-tertiary text-right p-1 font-medium">
              {day}
            </div>
            {hours.map((hour) => {
              const dataPoint = data.find(
                (d) => d.day === day && d.hour === hour
              );
              const intensity = dataPoint ? getIntensity(dataPoint.value) : 0;

              return (
                <div
                  key={`${day}-${hour}`}
                  className="w-4 h-4 rounded-sm"
                  style={{
                    backgroundColor: `rgba(59, 130, 246, ${intensity / 100})`,
                  }}
                  title={`${day} ${hour}:00 - ${
                    dataPoint?.value || 0
                  } atividades`}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
