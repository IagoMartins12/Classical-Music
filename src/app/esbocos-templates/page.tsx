import type { Metadata } from 'next';
import { EsbocosTemplates } from './EsbocosTemplates';

export const metadata: Metadata = {
  title: 'Esboços dos e-mails',
  robots: 'noindex, nofollow',
};

/** Onda 8: três direções para o layout base dos e-mails. Sai no fechamento. */
export default function Page() {
  return <EsbocosTemplates />;
}
