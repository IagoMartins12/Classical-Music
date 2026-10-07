import type { Metadata } from 'next';
import AdminDashboardClient from './AdminDashboardClient';

export const metadata: Metadata = {
  title: { absolute: 'Painel · Opus Atlas' },
};

export default function PainelPage() {
  return <AdminDashboardClient />;
}
