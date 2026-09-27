// components/common/SuspenseWrapper.tsx
'use client';

import { Suspense } from 'react';
import { Inline } from '@/app/components/ui/Layout';
import { Text } from '@/app/components/ui/Text';
import { Card } from '@/app/components/ui/Card';

interface SuspenseWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
}

// Loading fallback padrão
const DefaultLoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[200px]">
    <Inline gap={3}>
      <div className="w-6 h-6 border-2 border-ouro border-t-transparent rounded-full animate-spin"></div>
      <span className="text-theme-secondary">Carregando...</span>
    </Inline>
  </div>
);

// Wrapper principal
export default function SuspenseWrapper({
  children,
  fallback,
  className = '',
}: SuspenseWrapperProps) {
  return (
    <div className={className}>
      <Suspense fallback={fallback || <DefaultLoadingFallback />}>
        {children}
      </Suspense>
    </div>
  );
}

// HOC para envolver componentes automaticamente
export function withSuspense<T extends object>(
  WrappedComponent: React.ComponentType<T>,
  customFallback?: React.ReactNode
) {
  const ComponentWithSuspense = (props: T) => {
    return (
      <SuspenseWrapper fallback={customFallback}>
        <WrappedComponent {...props} />
      </SuspenseWrapper>
    );
  };

  ComponentWithSuspense.displayName = `withSuspense(${
    WrappedComponent.displayName || WrappedComponent.name
  })`;

  return ComponentWithSuspense;
}

// Loading específico para páginas com formulários
export const FormPageLoading = () => (
  <div className="min-h-screen bg-fundo">
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card densidade="larga" className="text-center">
        <div className="w-12 h-12 border-2 border-ouro border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-theme-secondary">Carregando página...</p>
      </Card>
    </div>
  </div>
);

// Loading específico para listas
export const ListPageLoading = () => (
  <div className="min-h-screen bg-fundo">
    <div className="section-wrap py-20">
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-2 border-ouro border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h3 className="text-xl font-bold text-theme-primary mb-2">
            Carregando conteúdo...
          </h3>
          <p className="text-theme-secondary">
            Aguarde enquanto preparamos tudo para você
          </p>
        </div>
      </div>
    </div>
  </div>
);

// Loading específico para modais ou componentes pequenos
export const ComponentLoading = () => (
  <div className="flex items-center justify-center p-8">
    <Inline gap={3}>
      <div className="w-5 h-5 border-2 border-ouro border-t-transparent rounded-full animate-spin"></div>
      <Text papel="rotulo" tom="suave">
        Carregando...
      </Text>
    </Inline>
  </div>
);
