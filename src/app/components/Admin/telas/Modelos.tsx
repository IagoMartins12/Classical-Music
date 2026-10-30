'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { PiEye, PiPencilSimple, PiPlus } from 'react-icons/pi';
import ConfirmModal from '@/app/components/ConfirmModal';
import { EditorDeModelo } from '@/app/components/Admin/Newsletter/EditorDeModelo';
import { PreviaDeEmail } from '@/app/components/Admin/Newsletter/PreviaDeEmail';
import { Badge, Chip } from '@/app/components/ui/Badge';
import { Button } from '@/app/components/ui/Button';
import { Vazio } from '@/app/components/ui/Estados';
import { Stack } from '@/app/components/ui/Layout';
import { Text } from '@/app/components/ui/Text';
import { Cabecalho } from '@/app/components/Admin/painel/Cabecalho';
import { BarraDeSelecao, Busca } from '@/app/components/Admin/painel/Controles';
import { Tabela, type Coluna } from '@/app/components/Admin/painel/Tabela';
import { dataCurta, numero } from '@/app/components/Admin/painel/formatos';
import { useInvalidateAdmin } from '@/app/hooks/admin/query';
import {
  useApagarModelos,
  useModelos,
} from '@/app/hooks/admin/useNewsletterPainel';
import { getModelo, type Modelo } from '@/app/requests/admin/newsletterPainel';

/**
 * Modelos de e-mail: o desenho de cada tipo de envio (boas-vindas, resumo
 * semanal, campanha própria…).
 *
 * **A lista antiga buscava o modelo inteiro, um por um** — uma chamada por
 * modelo só para listar nomes, com o HTML de todos na memória. Aqui a lista
 * vem numa chamada, e o conteúdo é buscado quando se vai editar ou
 * pré-visualizar aquele modelo.
 */

const TIPOS: Record<string, string> = {
  WELCOME: 'Boas-vindas',
  ACCOUNT_CONFIRMATION: 'Confirmação de conta',
  PASSWORD_RESET: 'Troca de senha',
  WEEKLY_DIGEST: 'Resumo semanal',
  NEW_COMPOSER: 'Novo compositor',
  CAMPAIGN_CUSTOM: 'Campanha própria',
};

type Recorte = 'todos' | 'ativos' | 'inativos';

export default function Modelos() {
  const [busca, setBusca] = useState('');
  const [recorte, setRecorte] = useState<Recorte>('todos');
  const [marcados, setMarcados] = useState<string[]>([]);
  const [editando, setEditando] = useState<Record<string, unknown> | null>(
    null
  );
  const [criando, setCriando] = useState(false);
  const [vendo, setVendo] = useState<Record<string, unknown> | null>(null);
  const [apagando, setApagando] = useState(false);
  const [abrindo, setAbrindo] = useState<string | null>(null);
  const invalidar = useInvalidateAdmin();

  const lista = useModelos({
    search: busca,
    isActive:
      recorte === 'ativos' ? true : recorte === 'inativos' ? false : undefined,
  });
  const apagar = useApagarModelos();
  const modelos = lista.data ?? [];

  // O conteúdo só vem quando alguém vai usar.
  const abrir = async (m: Modelo, para: 'editar' | 'ver') => {
    setAbrindo(m.id);
    try {
      const completo = await getModelo(m.id);
      if (para === 'editar') setEditando(completo);
      else setVendo(completo);
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : 'Não foi possível abrir o modelo.'
      );
    } finally {
      setAbrindo(null);
    }
  };

  const colunas: Coluna<Modelo>[] = [
    {
      id: 'nome',
      titulo: 'Modelo',
      principal: true,
      celula: (m) => (
        <span className="flex min-w-0 flex-col">
          <span className="truncate text-[0.9375rem] text-texto">{m.name}</span>
          <span className="t-legenda truncate">{m.subject}</span>
        </span>
      ),
    },
    {
      id: 'tipo',
      titulo: 'Tipo',
      celula: (m) => <span className="text-sm">{TIPOS[m.type] ?? m.type}</span>,
    },
    {
      id: 'estado',
      titulo: 'Em uso',
      celula: (m) =>
        m.isActive ? (
          <span className="text-sm">sim</span>
        ) : (
          <Badge>Inativo</Badge>
        ),
    },
    {
      id: 'atualizado',
      titulo: 'Mudou em',
      soNoComputador: true,
      celula: (m) => (
        <span className="t-dado text-sm">{dataCurta(m.updatedAt)}</span>
      ),
    },
    {
      id: 'acoes',
      titulo: 'Ações',
      celula: (m) => (
        <span className="flex gap-1" onClick={(e) => e.stopPropagation()}>
          <Button
            tamanho="p"
            variante="fantasma"
            icone={PiEye}
            rotulo={`Pré-visualizar ${m.name}`}
            carregando={abrindo === m.id}
            onClick={() => abrir(m, 'ver')}
          />
          <Button
            tamanho="p"
            variante="fantasma"
            icone={PiPencilSimple}
            rotulo={`Editar ${m.name}`}
            onClick={() => abrir(m, 'editar')}
          />
        </span>
      ),
    },
  ];

  const aoSalvar = () => {
    setEditando(null);
    setCriando(false);
    toast.success('Modelo salvo.');
    void invalidar('newsletter');
    void invalidar('auditoria');
  };

  return (
    <Stack gap={6}>
      <Cabecalho
        titulo="Modelos de e-mail"
        descricao={`${numero(modelos.length)} modelos · o desenho de cada tipo de envio`}
        acoes={
          <Button
            tamanho="p"
            variante="primario"
            icone={PiPlus}
            onClick={() => setCriando(true)}
          >
            Novo modelo
          </Button>
        }
      />

      <Stack gap={3}>
        <Busca
          valor={busca}
          aoMudar={setBusca}
          rotulo="Buscar modelo"
          placeholder="Nome ou assunto"
        />
        <div className="faixa-de-chips flex flex-wrap gap-2">
          <Chip
            selecionado={recorte === 'todos'}
            onClick={() => setRecorte('todos')}
          >
            Todos
          </Chip>
          <Chip
            selecionado={recorte === 'ativos'}
            onClick={() => setRecorte('ativos')}
          >
            Em uso
          </Chip>
          <Chip
            selecionado={recorte === 'inativos'}
            onClick={() => setRecorte('inativos')}
          >
            Inativos
          </Chip>
        </div>
      </Stack>

      <BarraDeSelecao
        quantidade={marcados.length}
        singular="modelo marcado"
        plural="modelos marcados"
        aoLimpar={() => setMarcados([])}
      >
        <Button tamanho="p" variante="perigo" onClick={() => setApagando(true)}>
          Apagar
        </Button>
      </BarraDeSelecao>

      <Tabela
        rotulo="Modelos de e-mail"
        colunas={colunas}
        linhas={modelos}
        chave={(m) => m.id}
        carregando={lista.loading}
        aoClicar={(m) => abrir(m, 'editar')}
        selecionadas={marcados}
        aoSelecionar={setMarcados}
        rotuloSelecao={(m) => `Marcar ${m.name}`}
        erro={
          lista.error ? (
            <Text papel="rotulo" tom="erro" as="p">
              {lista.error}
            </Text>
          ) : undefined
        }
        vazio={
          <Vazio
            titulo="Nenhum modelo aqui"
            descricao={
              busca
                ? `Nada com “${busca}”.`
                : 'Crie o primeiro para usar nas campanhas.'
            }
          />
        }
      />

      {(criando || editando) && (
        <EditorDeModelo
          modelo={editando}
          aoFechar={() => {
            setCriando(false);
            setEditando(null);
          }}
          aoSalvar={() => aoSalvar()}
        />
      )}

      {vendo && (
        <PreviaDeEmail
          aberto
          aoFechar={() => setVendo(null)}
          titulo={String(vendo.name ?? 'Modelo')}
          assunto={String(vendo.subject ?? '')}
          html={String(vendo.htmlContent ?? '')}
          texto={(vendo.textContent as string | null) ?? null}
          variaveis={(vendo.variables as string[] | undefined) ?? []}
        />
      )}

      <ConfirmModal
        isOpen={apagando}
        onClose={() => setApagando(false)}
        onConfirm={async () => {
          try {
            await apagar.mutateAsync([marcados]);
            toast.success(
              `${marcados.length} ${marcados.length === 1 ? 'modelo apagado' : 'modelos apagados'}.`
            );
            setMarcados([]);
          } catch (e) {
            toast.error(
              e instanceof Error ? e.message : 'Não foi possível apagar.'
            );
          }
          setApagando(false);
        }}
        type="danger"
        acaoPerigosa
        title={`Apagar ${marcados.length} ${marcados.length === 1 ? 'modelo' : 'modelos'}?`}
        message="Só sai modelo que nenhuma campanha usa — se algum estiver em uso, a API recusa e diz quais."
        confirmText="Apagar"
        cancelText="Voltar"
        isLoading={apagar.isPending}
      />
    </Stack>
  );
}
