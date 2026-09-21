// app/admin/analytics/page.tsx
import { Metadata } from 'next';
import { Suspense } from 'react';
import AdminAnalytics from '@/app/components/Admin/Analytics/AdminAnalytics';
import LoadingAdminState from '@/app/components/Admin/Common/LoadingState';

// Painel em CSR: o dado vem da API pelo navegador.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Analytics | Admin Panel',
  description: 'Visão completa de analytics e performance da plataforma',
  robots: 'noindex, nofollow',
};

export default function AdminAnalyticsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-primary">
          <LoadingAdminState loadingName="analytics" />
        </div>
      }
    >
      <AdminAnalytics />
    </Suspense>
  );
}
