'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useInvalidateAdmin } from '@/app/hooks/admin/query';
import { useListasDeCadastro } from '@/app/hooks/admin/useCatalogo';
import { getCadastro } from '@/app/requests/admin/catalogo';

/**
 * Criar e editar compositor, obra e partitura pelo painel.
 *
 * **Os formulários são os da comunidade** (`UploadsPage/modals`): checagem de
 * duplicata no IMSLP e na Wikipedia, retrato, busca de compositor e de obra,
 * validação. Refazer tudo no painel seria ter dois cadastros que divergem; a
 * API é a mesma (`/uploads/*`) e, quando quem edita é administrador, a
 * alteração vai para a auditoria com o antes e o depois.
 *
 * Os formulários pesam (1.400 a 2.000 linhas cada): só carregam quando
 * abertos.
 */

const FormularioCompositor = dynamic(
  () => import('@/app/components/UploadsPage/modals/CreateComposerModal'),
  { ssr: false }
);
const FormularioObra = dynamic(
  () => import('@/app/components/UploadsPage/modals/CreateWorkModal'),
  { ssr: false }
);
const FormularioPartitura = dynamic(
  () => import('@/app/components/UploadsPage/modals/CreateScoreModal'),
  { ssr: false }
);

export type TipoDeCadastro = 'composer' | 'work' | 'score';

/** `id` nulo: cadastro novo. */
export interface CadastroAberto {
  tipo: TipoDeCadastro;
  id: string | null;
}

export function Cadastro({
  aberto,
  aoFechar,
}: {
  aberto: CadastroAberto | null;
  aoFechar: () => void;
}) {
  const listas = useListasDeCadastro();
  const invalidar = useInvalidateAdmin();
  const [registro, setRegistro] = useState<Record<string, unknown> | null>(
    null
  );

  const id = aberto?.id ?? null;
  const tipo = aberto?.tipo ?? null;

  useEffect(() => {
    setRegistro(null);
    if (!id || !tipo) return;
    let vivo = true;
    getCadastro(tipo, id)
      .then((r) => vivo && setRegistro(r))
      .catch((e) => {
        toast.error(
          e instanceof Error ? e.message : 'Não foi possível abrir o cadastro.'
        );
        aoFechar();
      });
    return () => {
      vivo = false;
    };
    // `aoFechar` muda a cada render de quem chama; o que importa é o registro.
  }, [id, tipo]);

  if (!aberto || !listas.data) return null;
  // Editando: espera o cadastro chegar para o formulário já abrir preenchido.
  if (aberto.id && !registro) return null;

  const fechar = () => {
    void invalidar('catalogo');
    void invalidar('auditoria');
    aoFechar();
  };

  const { epochs, instruments, roles } = listas.data;

  if (aberto.tipo === 'composer') {
    return (
      <FormularioCompositor
        isOpen
        onClose={fechar}
        epochs={epochs}
        roles={roles}
        editingComposer={registro ?? undefined}
      />
    );
  }
  if (aberto.tipo === 'work') {
    return (
      <FormularioObra
        isOpen
        onClose={fechar}
        composers={[]}
        instruments={instruments}
        epochs={epochs}
        editingWork={registro ?? undefined}
      />
    );
  }
  return (
    <FormularioPartitura
      isOpen
      onClose={fechar}
      works={[]}
      editingScore={registro ?? undefined}
    />
  );
}
