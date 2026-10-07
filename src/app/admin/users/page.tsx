import type { Metadata } from 'next';
import Usuarios from '@/app/components/Admin/telas/Usuarios';

export const metadata: Metadata = { title: 'Usuários' };

/**
 * `/admin/users` é a lista de usuários desde 29/09/2026. A "análise de
 * usuários" que morava aqui foi para Uso da plataforma (`/admin/analytics`).
 */
export default function UsuariosPage() {
  return <Usuarios />;
}
