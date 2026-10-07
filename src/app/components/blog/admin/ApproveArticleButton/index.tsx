// components/blog/admin/ApproveArticleButton — "Aprovar e publicar" da prévia
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PiCheck } from 'react-icons/pi';
import { Button } from '@/app/components/ui/Button';
import { approveArticle } from '@/app/requests/blog/admin-actions';
import { rotasDoBlog } from '@/app/utils/blog/rotas';

/** Aprova e publica; em seguida leva ao artigo no ar. */
export function ApproveArticleButton({
  articleId,
  slug,
}: {
  articleId: string;
  slug: string;
}) {
  const router = useRouter();
  const [aprovando, setAprovando] = useState(false);
  const [erro, setErro] = useState('');

  async function aprovar() {
    setAprovando(true);
    setErro('');
    try {
      await approveArticle(articleId);
      router.push(rotasDoBlog.artigo(slug));
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível publicar.');
      setAprovando(false);
    }
  }

  return (
    <span className="flex items-center gap-3">
      <span role="status" className="t-legenda text-erro empty:hidden">
        {erro}
      </span>
      <Button
        variante="primario"
        tamanho="p"
        icone={PiCheck}
        carregando={aprovando}
        onClick={aprovar}
      >
        {aprovando ? 'Publicando…' : 'Aprovar e publicar'}
      </Button>
    </span>
  );
}
