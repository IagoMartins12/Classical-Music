// app/hooks/useClientMetadata.ts
'use client';

import { useEffect } from 'react';

interface ClientMetadata {
  title?: string;
  description?: string;
  noIndex?: boolean;
}

export function useClientMetadata({
  title,
  description,
  noIndex = false,
}: ClientMetadata) {
  useEffect(() => {
    // Atualizar title
    if (title) {
      document.title = title;
    }

    // Atualizar description
    if (description) {
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.setAttribute('name', 'description');
        document.head.appendChild(metaDescription);
      }
      metaDescription.setAttribute('content', description);
    }

    // Configurar robots se necessário
    if (noIndex) {
      let robotsMeta = document.querySelector('meta[name="robots"]');
      if (!robotsMeta) {
        robotsMeta = document.createElement('meta');
        robotsMeta.setAttribute('name', 'robots');
        document.head.appendChild(robotsMeta);
      }
      robotsMeta.setAttribute('content', 'noindex, nofollow');
    }
  }, [title, description, noIndex]);
}
