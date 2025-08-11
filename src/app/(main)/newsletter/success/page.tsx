// app/newsletter/success/page.tsx
import React, { Suspense } from 'react';
import NewsletterSuccessContent from './pageClient';

export default function NewsletterSuccessPage() {
  return (
    <Suspense fallback={<NewsletterSuccessLoading />}>
      <NewsletterSuccessContent />
    </Suspense>
  );
}

// Componente de loading
function NewsletterSuccessLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-theme-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto mb-4"></div>
        <p className="text-theme-secondary">Carregando...</p>
      </div>
    </div>
  );
}
