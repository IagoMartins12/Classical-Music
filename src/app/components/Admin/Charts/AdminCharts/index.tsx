// components/Admin/Charts/AdminCharts — os gráficos, carregados sob demanda
//
// O `recharts` sozinho pesa mais que o resto do painel somado, e dez telas o
// importavam direto — ele entrava no pacote inicial de todas. Aqui cada
// gráfico vira um `next/dynamic` sem SSR (o painel é CSR): o código só desce
// quando a tela que o usa é aberta.
'use client';

import dynamic from 'next/dynamic';

export type { ChartData } from './charts';

const ChartPlaceholder = () => (
  <div className="w-full h-64 rounded-xl bg-theme-elevated animate-pulse" />
);

const CardPlaceholder = () => (
  <div className="w-full h-32 rounded-xl bg-theme-elevated animate-pulse" />
);

export const TrendAreaChart = dynamic(
  () => import('./charts').then((module) => module.TrendAreaChart),
  { ssr: false, loading: ChartPlaceholder }
);

export const AdminBarChart = dynamic(
  () => import('./charts').then((module) => module.AdminBarChart),
  { ssr: false, loading: ChartPlaceholder }
);

export const AdminPieChart = dynamic(
  () => import('./charts').then((module) => module.AdminPieChart),
  { ssr: false, loading: ChartPlaceholder }
);

export const MultiLineChart = dynamic(
  () => import('./charts').then((module) => module.MultiLineChart),
  { ssr: false, loading: ChartPlaceholder }
);

export const HorizontalBarChart = dynamic(
  () => import('./charts').then((module) => module.HorizontalBarChart),
  { ssr: false, loading: ChartPlaceholder }
);

export const MetricCard = dynamic(
  () => import('./charts').then((module) => module.MetricCard),
  { ssr: false, loading: CardPlaceholder }
);

export const DataDebugger = dynamic(
  () => import('./charts').then((module) => module.DataDebugger),
  { ssr: false }
);
