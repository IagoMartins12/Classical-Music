'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { PiArrowsClockwise } from 'react-icons/pi';
import { Button } from '@/app/components/ui/Button';
import { Inline, Stack } from '@/app/components/ui/Layout';
import { Text } from '@/app/components/ui/Text';
import { cx } from '@/app/components/ui/cx';
import { relativo } from './formatos';

/**
 * O topo de toda tela do painel: título, uma linha de contexto e as ações.
 *
 * O título é Garamond em 24px (`t-subtitulo`), não o display de 60px das
 * páginas públicas: no painel a tela é ferramenta, e o título só diz onde se
 * está. Sem ícone ao lado, sem rótulo acima — a trilha do topo já diz a seção.
 *
 * **Toda tela tem "Atualizar".** Sem `aoAtualizar`, o botão relê todas as
 * consultas do painel que estão na tela; com ele, roda o da tela. Nos dois
 * casos o fim aparece num aviso — o dado podia não mudar, e sem o aviso não
 * havia como saber se o clique tinha feito algo. `aoAtualizar={false}` tira
 * o botão (formulários).
 */
export function Cabecalho({
  titulo,
  descricao,
  atualizadoEm,
  aoAtualizar,
  atualizando = false,
  acoes,
  className,
}: {
  titulo: string;
  descricao?: ReactNode;
  /** Quando o dado da tela chegou; aparece como "atualizado há 2 min". */
  atualizadoEm?: Date | string | null;
  aoAtualizar?: (() => unknown) | false;
  atualizando?: boolean;
  acoes?: ReactNode;
  className?: string;
}) {
  const cliente = useQueryClient();
  const [relendo, setRelendo] = useState(false);

  const atualizar = async () => {
    setRelendo(true);
    try {
      if (aoAtualizar) await aoAtualizar();
      else
        await cliente.refetchQueries(
          { queryKey: ['admin'], type: 'active' },
          { throwOnError: true }
        );
      toast.success('Atualizado.', { id: 'painel-atualizado' });
    } catch {
      toast.error('Não foi possível atualizar agora.', {
        id: 'painel-atualizado',
      });
    } finally {
      setRelendo(false);
    }
  };

  return (
    <Inline
      extremos
      quebra
      gap={4}
      alinhar="fim"
      className={cx('pb-2', className)}
    >
      <Stack gap={1} className="min-w-0">
        <Text papel="subtitulo" as="h1">
          {titulo}
        </Text>
        {(descricao || atualizadoEm) && (
          <Text papel="legenda" as="p" className="medida-texto">
            {descricao}
            {descricao && atualizadoEm ? ' · ' : null}
            {atualizadoEm
              ? `${descricao ? 'atualizado' : 'Atualizado'} ${relativo(atualizadoEm)}`
              : null}
          </Text>
        )}
      </Stack>
      {(acoes || aoAtualizar !== false) && (
        <Inline gap={2} quebra>
          {aoAtualizar !== false && (
            <Button
              tamanho="p"
              variante="fantasma"
              icone={PiArrowsClockwise}
              onClick={atualizar}
              carregando={atualizando || relendo}
            >
              Atualizar
            </Button>
          )}
          {acoes}
        </Inline>
      )}
    </Inline>
  );
}

/**
 * Uma seção dentro da tela: título de seção e, à direita, um atalho ("Ver
 * todos"). O espaço acima é maior que o de baixo — o título pertence ao que
 * vem depois dele.
 */
export function Secao({
  titulo,
  id,
  atalho,
  detalhe,
  children,
  className,
}: {
  titulo: string;
  id: string;
  atalho?: ReactNode;
  detalhe?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      aria-labelledby={id}
      className={cx('flex min-w-0 flex-col gap-3', className)}
    >
      <Inline extremos alinhar="base" gap={3}>
        <Text papel="secao" as="h2" id={id}>
          {titulo}
        </Text>
        {detalhe && (
          <Text papel="legenda" as="span">
            {detalhe}
          </Text>
        )}
        {atalho}
      </Inline>
      {children}
    </section>
  );
}
