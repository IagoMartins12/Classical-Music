import type { Metadata } from 'next';
import Insights from '@/app/components/Admin/telas/Insights';

export const metadata: Metadata = { title: 'Insights' };

export default function InsightsPage() {
  return <Insights />;
}
