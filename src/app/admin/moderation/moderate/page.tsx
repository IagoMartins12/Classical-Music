import { redirect } from 'next/navigation';

/** A fila de denúncias mora em `/admin/moderation` desde 29/09/2026. */
export default function FilaAntiga() {
  redirect('/admin/moderation');
}
