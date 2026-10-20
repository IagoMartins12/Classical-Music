'use client';

import { useState } from 'react';
import type { Editor } from '@tiptap/react';
import {
  EscolhaDeObra,
  type ItemDoAcervo,
} from '@/app/components/blog/escrita/BuscaNoAcervo';
import { getWorkById } from '@/app/requests/catalog-search';
import { BlocoDoArtigo } from '@/app/components/blog/site/CorpoDoArtigo';
import { FolhaDoEditor } from '../FolhaDoEditor';

interface WorkModalProps {
  editor: Editor;
  onClose: () => void;
}

interface Obra {
  id: string;
  title: string;
  composer?: { name?: string };
  instrument?: { name?: string };
}

/** Cartão de obra: busca no catálogo, com filtro opcional por compositor. */
export function WorkModal({ editor, onClose }: WorkModalProps) {
  const [escolhida, setEscolhida] = useState<ItemDoAcervo | null>(null);
  const [obra, setObra] = useState<Obra | null>(null);
  const [erro, setErro] = useState('');

  async function escolher(item: ItemDoAcervo | null) {
    setEscolhida(item);
    setObra(null);
    setErro('');
    if (!item) return;
    try {
      const achada = (await getWorkById(item.id)) as Obra | null;
      if (achada) setObra(achada);
    } catch {
      setErro('Não deu para carregar a obra. Tente de novo.');
    }
  }

  const attrs = obra && {
    workId: obra.id,
    workTitle: obra.title,
    composerName: obra.composer?.name,
    instrumentName: obra.instrument?.name,
  };

  function inserir() {
    if (!attrs) return;
    editor.chain().focus().insertContent({ type: 'workCard', attrs }).run();
    onClose();
  }

  return (
    <FolhaDoEditor
      titulo="Cartão de obra"
      descricao="Liga o texto à página da obra no catálogo."
      aoFechar={onClose}
      aoEnviar={inserir}
      podeEnviar={Boolean(attrs)}
    >
      <EscolhaDeObra obra={escolhida} aoEscolher={escolher} />
      {erro && (
        <p role="alert" className="t-legenda text-erro">
          {erro}
        </p>
      )}
      {attrs && (
        <div className="flex flex-col gap-2">
          <span className="t-rotulo text-texto-fraco">Como fica no artigo</span>
          <BlocoDoArtigo no={{ type: 'workCard', attrs }} />
        </div>
      )}
    </FolhaDoEditor>
  );
}
