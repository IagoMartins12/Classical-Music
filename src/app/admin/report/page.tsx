import { redirect } from 'next/navigation';

/** Repetia `/admin/moderation`. As denúncias têm uma tela só. */
export default function RelatorioAntigo() {
  redirect('/admin/moderation');
}
