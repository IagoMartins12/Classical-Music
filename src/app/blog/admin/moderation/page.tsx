import type { Metadata } from 'next';
import ComentariosDoBlog from '@/app/components/Admin/telas/ComentariosDoBlog';

export const metadata: Metadata = { title: 'Comentários do blog' };

/**
 * Tela de cliente, como o resto do painel: a casca confere o papel e a API
 * responde por ele. A versão anterior lia no servidor e recarregava a página
 * inteira a cada decisão.
 */
export default function ComentariosPage() {
  return <ComentariosDoBlog />;
}
