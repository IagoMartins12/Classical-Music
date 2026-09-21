// app/admin/insights/page.tsx
import { Metadata } from 'next';
import InsightsAnalytics from '@/app/components/Admin/Analytics/InsightsAnalytics';

// Painel em CSR: o dado vem da API pelo navegador.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Insights & Analytics | Admin Panel',
  description: 'Análises avançadas e previsões inteligentes',
  robots: 'noindex, nofollow',
};

export default function AdminInsightsPage() {
  return <InsightsAnalytics />;
}
