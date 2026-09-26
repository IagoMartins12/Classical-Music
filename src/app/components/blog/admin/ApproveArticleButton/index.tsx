// components/blog/admin/ApproveArticleButton — "Aprovar e Publicar" da prévia
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { PiCheck } from 'react-icons/pi';
import { approveArticle } from '@/app/requests/blog/admin-actions';
import { Inline } from '@/app/components/ui/Layout';

interface ApproveArticleButtonProps {
  articleId: string;
  slug: string;
}

export function ApproveArticleButton({
  articleId,
  slug,
}: ApproveArticleButtonProps) {
  const router = useRouter();
  const [approving, setApproving] = useState(false);

  const handleApprove = async () => {
    setApproving(true);
    try {
      await approveArticle(articleId);
      toast.success('Artigo aprovado e publicado!');
      router.push(`/blog/${slug}`);
    } catch (error: any) {
      toast.error(error?.message || 'Erro ao aprovar o artigo');
      setApproving(false);
    }
  };

  return (
    <Inline
      as="button"
      gap={2}
      type="button"
      onClick={handleApprove}
      disabled={approving}
      className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-all disabled:opacity-60"
    >
      <PiCheck className="w-4 h-4" />
      <span>{approving ? 'Publicando...' : 'Aprovar e Publicar'}</span>
    </Inline>
  );
}
