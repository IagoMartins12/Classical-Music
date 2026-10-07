import { redirect } from 'next/navigation';

/** Os números da newsletter moram na visão geral desde 29/09/2026. */
export default function NumerosAntigos() {
  redirect('/admin/newsletter');
}
