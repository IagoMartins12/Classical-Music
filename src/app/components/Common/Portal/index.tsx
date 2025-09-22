// components/Common/Portal.tsx
'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface PortalProps {
  children: React.ReactNode;
  containerId?: string;
}

export default function Portal({
  children,
  containerId = 'portal-root',
}: PortalProps) {
  const [container, setContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    // Encontrar ou criar o container
    let portalContainer = document.getElementById(containerId);

    if (!portalContainer) {
      portalContainer = document.createElement('div');
      portalContainer.id = containerId;
      portalContainer.style.position = 'relative';
      portalContainer.style.zIndex = '999999';
      document.body.appendChild(portalContainer);
    }

    setContainer(portalContainer);

    // Cleanup function para remover o container se não houver mais filhos
    return () => {
      if (portalContainer && portalContainer.children.length === 0) {
        document.body.removeChild(portalContainer);
      }
    };
  }, [containerId]);

  // Se ainda não temos o container, não renderizar nada
  if (!container) return null;

  // Usar createPortal para renderizar os children no container
  return createPortal(children, container);
}
