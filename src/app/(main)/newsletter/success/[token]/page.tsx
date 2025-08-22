// ================================
// app/newsletter/success/page.tsx - CORRIGIDO
// ================================
import React, { Suspense } from 'react';
import NewsletterSuccessContent from './pageClient';

export default function NewsletterSuccessPage() {
  return (
    <Suspense fallback={<NewsletterSuccessPageLoading />}>
      <NewsletterSuccessContent />
    </Suspense>
  );
}

// Componente de loading específico
function NewsletterSuccessPageLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-theme-background">
      <div className="classical-card p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto mb-4"></div>
        <p className="text-theme-secondary">Carregando confirmação...</p>
      </div>
    </div>
  );
}
