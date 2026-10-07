'use client';

import { useId, type FormEvent, type ReactNode } from 'react';
import { Button } from '@/app/components/ui/Button';
import { Sheet } from '@/app/components/ui/Sheet';

/**
 * A casca dos diálogos do editor: a folha do sistema com um formulário e o
 * rodapé "Cancelar / Inserir".
 *
 * Os dez diálogos usavam o `Modal` legado, os botões do `Common` e um
 * `stopPropagation` no envio (o formulário do artigo, por fora, recebia o
 * submit e salvava o artigo junto). A folha é um `<dialog>` na camada de
 * topo, mas o React ainda propaga pela árvore de componentes: o
 * `stopPropagation` continua aqui, uma vez só.
 *
 * O botão de inserir fica no rodapé, fora do `<form>`; o atributo `form`
 * o liga ao formulário, e o Enter num campo continua enviando.
 */
export function FolhaDoEditor({
  titulo,
  descricao,
  aoFechar,
  aoEnviar,
  rotuloDoEnvio = 'Inserir',
  podeEnviar = true,
  enviando = false,
  largura = 'm',
  children,
}: {
  titulo: string;
  descricao?: string;
  aoFechar: () => void;
  aoEnviar: () => void;
  rotuloDoEnvio?: string;
  podeEnviar?: boolean;
  enviando?: boolean;
  largura?: 'p' | 'm' | 'g';
  children: ReactNode;
}) {
  const id = useId();

  function enviar(e: FormEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (podeEnviar && !enviando) aoEnviar();
  }

  return (
    <Sheet
      aberto
      aoFechar={aoFechar}
      titulo={titulo}
      descricao={descricao}
      largura={largura}
      rodape={
        <>
          <Button variante="fantasma" onClick={aoFechar}>
            Cancelar
          </Button>
          <Button
            type="submit"
            form={id}
            variante="primario"
            disabled={!podeEnviar}
            carregando={enviando}
          >
            {rotuloDoEnvio}
          </Button>
        </>
      }
    >
      <form id={id} onSubmit={enviar} className="flex flex-col gap-5">
        {children}
      </form>
    </Sheet>
  );
}
