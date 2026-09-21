// components/blog/admin/ApproveArticleButton — "Aprovar e Publicar" da prévia
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { FiCheck } from 'react-icons/fi';
import { approveArticle } from '@/app/requests/blog/admin-actions';

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
    <button
      type="button"
      onClick={handleApprove}
      disabled={approving}
      className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-all flex items-center space-x-2 disabled:opacity-60"
    >
      <FiCheck className="w-4 h-4" />
      <span>{approving ? 'Publicando...' : 'Aprovar e Publicar'}</span>
    </button>
  );
}
