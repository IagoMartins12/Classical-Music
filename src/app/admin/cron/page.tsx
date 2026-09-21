import { Metadata } from 'next';
import CronClient from '@/app/components/Admin/Cron/CronClient';

// Painel em CSR: o dado vem da API pelo navegador.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Tarefas agendadas | Admin Panel',
  description: 'Agendamento das tarefas de manutenção',
  robots: 'noindex, nofollow',
};

export default function CronPage() {
  return <CronClient />;
}
