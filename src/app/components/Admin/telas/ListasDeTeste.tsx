'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { PiPlus, PiTrash } from 'react-icons/pi';
import ConfirmModal from '@/app/components/ConfirmModal';
import { Badge } from '@/app/components/ui/Badge';
import { Button } from '@/app/components/ui/Button';
import { Vazio } from '@/app/components/ui/Estados';
import { Field } from '@/app/components/ui/Field';
import { Stack } from '@/app/components/ui/Layout';
import { Row } from '@/app/components/ui/Row';
import { Sheet } from '@/app/components/ui/Sheet';
import { Text } from '@/app/components/ui/Text';
import { Cabecalho } from '@/app/components/Admin/painel/Cabecalho';
import { Interruptor } from '@/app/components/Admin/painel/Campos';
import { numero, relativo } from '@/app/components/Admin/painel/formatos';
import { useAdminMutation } from '@/app/hooks/admin/query';
import { useListasDeTeste } from '@/app/hooks/admin/useNewsletterPainel';
import {
  createTestListRequest,
  deleteTestListRequest,
  updateTestListRequest,
  type ApiTestList,
} from '@/app/requests/admin/newsletter';

/**
 * Listas de teste: quem recebe a prévia de uma campanha antes do envio.
 *
 * A tela antiga tinha 1.197 linhas — filtros, ordenação, cores por lista,
 * duplicar, ações em lote — para o que costuma ser meia dúzia de listas com
 * poucos e-mails cada. Ficou o que se usa: ver, criar, editar os endereços,
 * ligar/desligar e apagar. A cor da lista não aparece mais (a paleta do
 * painel é contida); o campo continua na API.
 */

const TOCA = ['newsletter', 'auditoria'];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ListasDeTeste() {
  const { data, loading, error } = useListasDeTeste();
  const [aberta, setAberta] = useState<ApiTestList | 'nova' | null>(null);

  const listas = data ?? [];

  return (
    <Stack gap={6}>
      <Cabecalho
        titulo="Listas de teste"
        descricao="Quem recebe a prévia de uma campanha antes do envio de verdade"
        acoes={
          <Button
            tamanho="p"
            variante="primario"
            icone={PiPlus}
            onClick={() => setAberta('nova')}
          >
            Nova lista
          </Button>
        }
      />

      {loading ? (
        <Row.Lista>
          <Row.Skeleton repetir={3} />
        </Row.Lista>
      ) : error ? (
        <Text papel="rotulo" tom="erro" as="p">
          {error}
        </Text>
      ) : listas.length === 0 ? (
        <Vazio
          titulo="Nenhuma lista ainda"
          descricao="Crie uma com os e-mails da equipe: toda campanha pode ser testada nela antes de sair."
          acao={
            <Button
              tamanho="p"
              variante="primario"
              onClick={() => setAberta('nova')}
            >
              Criar lista
            </Button>
          }
        />
      ) : (
        <Row.Lista>
          {listas.map((l) => (
            <Row
              key={l.id}
              clicavel
              onClick={() => setAberta(l)}
              titulo={
                <span className="flex items-center gap-2">
                  {l.name}
                  {!l.isActive && <Badge>Desligada</Badge>}
                </span>
              }
              detalhe={
                l.description ||
                l.emails.slice(0, 3).join(', ') +
                  (l.emails.length > 3 ? '…' : '')
              }
              valor={`${numero(l.totalEmails ?? l.emails.length)} e-mails · ${l.timesUsed ? `usada ${relativo(l.lastUsed)}` : 'nunca usada'}`}
            />
          ))}
        </Row.Lista>
      )}

      <Editor lista={aberta} aoFechar={() => setAberta(null)} />
    </Stack>
  );
}

function Editor({
  lista,
  aoFechar,
}: {
  lista: ApiTestList | 'nova' | null;
  aoFechar: () => void;
}) {
  const nova = lista === 'nova';
  const atual = lista && lista !== 'nova' ? lista : null;
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [emails, setEmails] = useState('');
  const [ativa, setAtiva] = useState(true);
  const [apagando, setApagando] = useState(false);

  const salvar = useAdminMutation(
    (dados: Record<string, unknown>) =>
      atual
        ? updateTestListRequest(atual.id, dados)
        : createTestListRequest(dados),
    TOCA
  );
  const apagar = useAdminMutation(
    (id: string) => deleteTestListRequest(id),
    TOCA
  );

  useEffect(() => {
    setNome(atual?.name ?? '');
    setDescricao(atual?.description ?? '');
    setEmails((atual?.emails ?? []).join('\n'));
    setAtiva(atual?.isActive ?? true);
  }, [lista]);

  const lidos = emails
    .split(/[\s,;]+/)
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  const invalidos = lidos.filter((e) => !EMAIL.test(e));
  const unicos = [...new Set(lidos.filter((e) => EMAIL.test(e)))];

  const enviar = async () => {
    try {
      await salvar.mutateAsync([
        {
          name: nome.trim(),
          description: descricao.trim() || null,
          emails: unicos,
          isActive: ativa,
        },
      ]);
      toast.success(nova ? 'Lista criada.' : 'Lista salva.');
      aoFechar();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Não foi possível salvar.');
    }
  };

  return (
    <>
      <Sheet
        aberto={!!lista}
        aoFechar={aoFechar}
        titulo={nova ? 'Nova lista de teste' : (atual?.name ?? '')}
        largura="m"
        rodape={
          <>
            {atual && (
              <Button
                tamanho="p"
                variante="perigo"
                icone={PiTrash}
                onClick={() => setApagando(true)}
                className="mr-auto"
              >
                Apagar
              </Button>
            )}
            <Button tamanho="p" variante="fantasma" onClick={aoFechar}>
              Cancelar
            </Button>
            <Button
              tamanho="p"
              variante="primario"
              onClick={enviar}
              carregando={salvar.isPending}
              disabled={
                !nome.trim() || unicos.length === 0 || invalidos.length > 0
              }
            >
              Salvar
            </Button>
          </>
        }
      >
        <Stack gap={4}>
          <Field
            label="Nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Equipe editorial"
          />
          <Field
            label="Para que serve"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Opcional"
          />
          <Field.Area
            label="E-mails"
            ajuda={
              invalidos.length
                ? undefined
                : `${numero(unicos.length)} ${unicos.length === 1 ? 'endereço' : 'endereços'} — um por linha, ou separados por vírgula.`
            }
            erro={
              invalidos.length
                ? `Não parecem e-mails: ${invalidos.slice(0, 3).join(', ')}${invalidos.length > 3 ? '…' : ''}`
                : undefined
            }
            value={emails}
            onChange={(e) => setEmails(e.target.value)}
            rows={8}
            classeCampo="t-dado"
          />
          <Interruptor
            rotulo="Ligada"
            ajuda={
              ativa
                ? 'Aparece na hora de enviar um teste.'
                : 'Fica guardada, mas não aparece para escolher.'
            }
            ligado={ativa}
            aoMudar={setAtiva}
          />
        </Stack>
      </Sheet>

      <ConfirmModal
        isOpen={apagando}
        onClose={() => setApagando(false)}
        onConfirm={async () => {
          if (!atual) return;
          try {
            await apagar.mutateAsync([atual.id]);
            toast.success('Lista apagada.');
            setApagando(false);
            aoFechar();
          } catch (e) {
            toast.error(
              e instanceof Error ? e.message : 'Não foi possível apagar.'
            );
            setApagando(false);
          }
        }}
        type="danger"
        acaoPerigosa
        title="Apagar esta lista?"
        message="Os endereços saem daqui; ninguém é descadastrado da newsletter."
        confirmText="Apagar"
        cancelText="Voltar"
        isLoading={apagar.isPending}
      />
    </>
  );
}
