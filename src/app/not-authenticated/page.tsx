// ================================
// app/not-authenticated/page.tsx - CORRIGIDO
// ================================
import { Suspense } from 'react';
import NotAuthenticatedContent from './pageClient';
import { FormPageLoading } from '../wrappers/SuspenseWrapper';

export const metadata = {
  title: 'Acesso negado - Opus Atlas',
  description: 'Você não tem permissão para acessar está área.',

  robots: {
    index: true,
    follow: true,
  },
};

export const revalidate = 3600;

export default function NotAuthenticatedPage() {
  return (
    <Suspense fallback={<FormPageLoading />}>
      <NotAuthenticatedContent />
    </Suspense>
  );
}
