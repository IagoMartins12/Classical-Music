'use client';

import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react';
import { PiTrash } from 'react-icons/pi';
import { Button } from '@/app/components/ui/Button';
import { cx } from '@/app/components/ui/cx';
import { BlocoDoArtigo } from '@/app/components/blog/site/CorpoDoArtigo';
import type { NoTipTap } from '@/app/utils/blog/tiptap';

/**
 * Como os blocos próprios aparecem dentro do editor.
 *
 * Antes cada extensão tinha o seu desenho de editor (cartão com sombra,
 * botões azuis e cinza, ícones coloridos), diferente do que o leitor via. Agora
 * o editor desenha o bloco com o mesmo `BlocoDoArtigo` do artigo publicado e
 * acrescenta só o que é de quem escreve: o nome do bloco e o botão de tirar,
 * sempre visíveis (o "aparece no hover" sumia no toque e no teclado). O bloco
 * selecionado ganha o anel de foco do sistema.
 */
export function VistaDoBloco({
  node,
  deleteNode,
  selected,
  rotulo,
}: NodeViewProps & { rotulo: string }) {
  return (
    <NodeViewWrapper
      contentEditable={false}
      data-drag-handle
      className={cx(
        'vista-do-bloco my-8 flex flex-col gap-2 rounded-card outline-offset-4',
        selected && 'outline-2 outline-ouro'
      )}
    >
      <div className="flex items-center justify-between gap-3 font-sans">
        <span className="t-rotulo text-texto-fraco">{rotulo}</span>
        <Button
          variante="fantasma"
          tamanho="p"
          icone={PiTrash}
          rotulo={`Tirar ${rotulo.toLowerCase()}`}
          title={`Tirar ${rotulo.toLowerCase()}`}
          onClick={() => deleteNode()}
        />
      </div>
      <BlocoDoArtigo no={node.toJSON() as NoTipTap} />
    </NodeViewWrapper>
  );
}

/** A vista de um tipo de bloco, com o nome que ele mostra no editor. */
export const vistaDe = (rotulo: string) =>
  function Vista(props: NodeViewProps) {
    return <VistaDoBloco {...props} rotulo={rotulo} />;
  };
