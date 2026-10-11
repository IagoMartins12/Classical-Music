import type { Metadata } from 'next';
import { EsbocosProfessores } from './EsbocosProfessores';

export const metadata: Metadata = {
  title: 'Esboços: para professores',
  robots: 'noindex, nofollow',
};

/** Três direções para `/for-teachers` (onda 7). Sai no fechamento. */
export default function Page() {
  return <EsbocosProfessores />;
}
