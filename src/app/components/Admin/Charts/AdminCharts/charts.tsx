// app/components/Admin/Charts/AdminCharts.tsx - VERSÃO CORRIGIDA
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
import { Stack, Inline } from '@/app/components/ui/Layout';
import { Text } from '@/app/components/ui/Text';
import { Card } from '@/app/components/ui/Card';

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

// Paleta de cores para gráficos (atualizada)
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

// 🔧 TOOLTIP MELHORADO COM TRATAMENTO DE DADOS
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-theme-elevated border border-theme-primary rounded-xl p-3 shadow-2xl">
        <Text papel="rotulo" tom="forte" as="p" className="font-medium mb-1">
          {label}
        </Text>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name || 'Valor'}:{' '}
            {typeof entry.value === 'number'
              ? entry.value.toLocaleString('pt-BR')
              : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// 🔧 TOOLTIP PERSONALIZADO PARA PIE CHARTS
const CustomPieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-theme-elevated border border-theme-primary rounded-xl p-3 shadow-2xl">
        <Text papel="rotulo" tom="forte" as="p" className="font-medium">
          {data.name}
        </Text>
        <p className="text-sm" style={{ color: data.color }}>
          Quantidade: {data.value.toLocaleString('pt-BR')}
        </p>
        <Text papel="legenda" tom="fraco" as="p">
          {data.payload.percentage
            ? `${data.payload.percentage.toFixed(1)}%`
            : ''}
        </Text>
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
}: AdminChartProps) => {
  // ✅ VALIDAÇÃO E DEBUG DOS DADOS
  if (!data || data.length === 0) {
    return (
      <div className="w-full">
        {(title || subtitle) && (
          <div className="mb-4">
            {title && (
              <h3 className="text-lg font-bold text-theme-primary">{title}</h3>
            )}
            {subtitle && (
              <Text papel="rotulo" tom="fraco" as="p">
                {subtitle}
              </Text>
            )}
          </div>
        )}
        <div className="h-64 flex items-center justify-center text-theme-tertiary">
          Nenhum dado disponível
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {(title || subtitle) && (
        <div className="mb-4">
          {title && (
            <h3 className="text-lg font-bold text-theme-primary">{title}</h3>
          )}
          {subtitle && (
            <Text papel="rotulo" tom="fraco" as="p">
              {subtitle}
            </Text>
          )}
        </div>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient
              id={`colorArea-${title}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
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
            fill={`url(#colorArea-${title})`}
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

// Gráfico de Barras (CORRIGIDO)
export const AdminBarChart = ({
  data,
  height = 300,
  color = CHART_COLORS.primary,
  title,
  subtitle,
}: AdminChartProps) => {
  // ✅ VALIDAÇÃO E DEBUG DOS DADOS
  if (!data || data.length === 0) {
    return (
      <div className="w-full">
        {(title || subtitle) && (
          <div className="mb-4">
            {title && (
              <h3 className="text-lg font-bold text-theme-primary">{title}</h3>
            )}
            {subtitle && (
              <Text papel="rotulo" tom="fraco" as="p">
                {subtitle}
              </Text>
            )}
          </div>
        )}
        <div className="h-64 flex items-center justify-center text-theme-tertiary">
          Nenhum dado disponível
        </div>
      </div>
    );
  }

  // 🔧 NORMALIZAR DADOS PARA O GRÁFICO DE BARRAS
  const normalizedData = data.map((item) => ({
    name: item.name || 'Sem nome',
    value: typeof item.value === 'number' ? item.value : 0,
  }));

  return (
    <div className="w-full">
      {(title || subtitle) && (
        <div className="mb-4">
          {title && (
            <h3 className="text-lg font-bold text-theme-primary">{title}</h3>
          )}
          {subtitle && (
            <Text papel="rotulo" tom="fraco" as="p">
              {subtitle}
            </Text>
          )}
        </div>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={normalizedData}
          margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
        >
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#6B7280' }}
            angle={-45}
            textAnchor="end"
            height={60}
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
};

// 🔧 GRÁFICO DE PIZZA CORRIGIDO E MELHORADO
export const AdminPieChart = ({
  data,
  height = 300,
  title,
  subtitle,
  innerRadius = 0,
  showLabels = true,
}: AdminChartProps & { innerRadius?: number; showLabels?: boolean }) => {
  // ✅ VALIDAÇÃO E DEBUG DOS DADOS
  if (!data || data.length === 0) {
    return (
      <div className="w-full">
        {(title || subtitle) && (
          <div className="mb-4 text-center">
            {title && (
              <h3 className="text-lg font-bold text-theme-primary">{title}</h3>
            )}
            {subtitle && (
              <Text papel="rotulo" tom="fraco" as="p">
                {subtitle}
              </Text>
            )}
          </div>
        )}
        <div className="h-64 flex items-center justify-center text-theme-tertiary">
          Nenhum dado disponível
        </div>
      </div>
    );
  }

  // 🔧 NORMALIZAR E CALCULAR PERCENTUAIS
  const totalValue = data.reduce(
    (sum, item) => sum + (typeof item.value === 'number' ? item.value : 0),
    0
  );

  const normalizedData = data
    .filter((item) => typeof item.value === 'number' && item.value > 0)
    .map((item) => ({
      name: item.name || 'Sem nome',
      value: typeof item.value === 'number' ? item.value : 0,
      percentage:
        totalValue > 0
          ? ((typeof item.value === 'number' ? item.value : 0) / totalValue) *
            100
          : 0,
    }));

  if (normalizedData.length === 0) {
    return (
      <div className="w-full">
        {(title || subtitle) && (
          <div className="mb-4 text-center">
            {title && (
              <h3 className="text-lg font-bold text-theme-primary">{title}</h3>
            )}
            {subtitle && (
              <Text papel="rotulo" tom="fraco" as="p">
                {subtitle}
              </Text>
            )}
          </div>
        )}
        <div className="h-64 flex items-center justify-center text-theme-tertiary">
          Todos os valores são zero
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {(title || subtitle) && (
        <div className="mb-4 text-center">
          {title && (
            <h3 className="text-lg font-bold text-theme-primary">{title}</h3>
          )}
          {subtitle && (
            <Text papel="rotulo" tom="fraco" as="p">
              {subtitle}
            </Text>
          )}
        </div>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={normalizedData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={
              showLabels
                ? ({ name, percentage }) =>
                    `${name} (${percentage.toFixed(1)}%)`
                : false
            }
            outerRadius={Math.min(height * 0.35, 120)}
            innerRadius={innerRadius}
            fill="#8884d8"
            dataKey="value"
          >
            {normalizedData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={GRADIENT_COLORS[index % GRADIENT_COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomPieTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      {/* 🆕 LEGENDA PERSONALIZADA PARA PIE CHARTS */}
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {normalizedData.map((entry, index) => (
          <Inline gap={2} key={`legend-${index}`} className="text-xs">
            <div
              className="w-3 h-3 rounded-full"
              style={{
                backgroundColor:
                  GRADIENT_COLORS[index % GRADIENT_COLORS.length],
              }}
            />
            <span className="text-theme-secondary">
              {entry.name}: {entry.value.toLocaleString('pt-BR')}
            </span>
          </Inline>
        ))}
      </div>
    </div>
  );
};

// Gráfico de Linha para múltiplas séries (CORRIGIDO)
export const MultiLineChart = ({
  data,
  height = 300,
  title,
  subtitle,
  lines = ['value'],
}: AdminChartProps & { lines?: string[] }) => {
  if (!data || data.length === 0) {
    return (
      <div className="w-full">
        {(title || subtitle) && (
          <div className="mb-4">
            {title && (
              <h3 className="text-lg font-bold text-theme-primary">{title}</h3>
            )}
            {subtitle && (
              <Text papel="rotulo" tom="fraco" as="p">
                {subtitle}
              </Text>
            )}
          </div>
        )}
        <div className="h-64 flex items-center justify-center text-theme-tertiary">
          Nenhum dado disponível
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {(title || subtitle) && (
        <div className="mb-4">
          {title && (
            <h3 className="text-lg font-bold text-theme-primary">{title}</h3>
          )}
          {subtitle && (
            <Text papel="rotulo" tom="fraco" as="p">
              {subtitle}
            </Text>
          )}
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
};

// 🔧 COMPONENTE DE MÉTRICA MELHORADO
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
  <Card className="relative overflow-hidden">
    <div className="flex items-start justify-between mb-4">
      <div className="flex-1">
        <Text papel="rotulo" tom="fraco" as="p" className="mb-1">
          {title}
        </Text>
        {subtitle && (
          <Text papel="legenda" tom="fraco" as="p" className="mb-1">
            {subtitle}
          </Text>
        )}
        <p className="text-3xl font-bold text-theme-primary">
          {typeof value === 'number' ? value.toLocaleString('pt-BR') : value}
        </p>
        {change && (
          <div
            className={`flex items-center space-x-1 mt-2 ${
              change.isPositive ? 'text-ok' : 'text-erro'
            }`}
          >
            <span className="text-sm font-medium">
              {change.isPositive ? '+' : ''}
              {typeof change.value === 'number'
                ? change.value.toFixed(1)
                : change.value}
              {typeof change.value === 'number' ? '%' : ''}
            </span>
          </div>
        )}
      </div>
      {Icon && (
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
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
                id={`mini-gradient-${title.replace(/\s+/g, '-')}`}
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
              fill={`url(#mini-gradient-${title.replace(/\s+/g, '-')})`}
              strokeWidth={1}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    )}
  </Card>
);

// 🆕 COMPONENTE DE DEBUG PARA DADOS
export const DataDebugger = ({ data, title }: { data: any; title: string }) => {
  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <div className="mt-2 p-2 bg-sup-2 rounded text-xs">
      <strong>{title} Debug:</strong>
      <pre className="mt-1 text-xs overflow-x-auto">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
};

// Gráfico de comparação de barras horizontais (MELHORADO)
export const HorizontalBarChart = ({
  data,
  color = CHART_COLORS.primary,
  title,
  subtitle,
}: AdminChartProps) => {
  if (!data || data.length === 0) {
    return (
      <div className="w-full">
        {(title || subtitle) && (
          <div className="mb-4">
            {title && (
              <h3 className="text-lg font-bold text-theme-primary">{title}</h3>
            )}
            {subtitle && (
              <Text papel="rotulo" tom="fraco" as="p">
                {subtitle}
              </Text>
            )}
          </div>
        )}
        <div className="h-64 flex items-center justify-center text-theme-tertiary">
          Nenhum dado disponível
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {(title || subtitle) && (
        <div className="mb-4">
          {title && (
            <h3 className="text-lg font-bold text-theme-primary">{title}</h3>
          )}
          {subtitle && (
            <Text papel="rotulo" tom="fraco" as="p">
              {subtitle}
            </Text>
          )}
        </div>
      )}
      <Stack gap={3}>
        {data.map((item, index) => {
          const maxValue = Math.max(
            ...data.map((d) => (typeof d.value === 'number' ? d.value : 0))
          );
          const percentage =
            typeof item.value === 'number' && maxValue > 0
              ? (item.value / maxValue) * 100
              : 0;

          return (
            <Inline gap={3} key={index}>
              <Text
                papel="rotulo"
                tom="forte"
                as="div"
                className="w-24 font-medium truncate"
              >
                {item.name}
              </Text>
              <div className="flex-1 bg-theme-secondary rounded-full h-3 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: color,
                  }}
                />
              </div>
              <Text
                papel="rotulo"
                tom="forte"
                as="div"
                className="w-16 font-bold text-right"
              >
                {typeof item.value === 'number'
                  ? item.value.toLocaleString('pt-BR')
                  : '0'}
              </Text>
            </Inline>
          );
        })}
      </Stack>
    </div>
  );
};
