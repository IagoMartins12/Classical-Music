'use client';

import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { PiFilePdf, PiTrash } from 'react-icons/pi';
import ConfirmModal from '@/app/components/ConfirmModal';
import { Button } from '@/app/components/ui/Button';
import { Field } from '@/app/components/ui/Field';
import { Icon } from '@/app/components/ui/Icon';
import { Inline, Stack } from '@/app/components/ui/Layout';
import { Row } from '@/app/components/ui/Row';
import { Sheet } from '@/app/components/ui/Sheet';
import { Text } from '@/app/components/ui/Text';
import { Interruptor } from '@/app/components/Admin/painel/Campos';
import { Escolher, type Opcao } from '@/app/components/Admin/painel/Escolher';
import { Elo, useNavegar } from '@/app/components/Admin/painel/Navegador';
import { HistoricoDoRegistro } from '@/app/components/Admin/painel/Trilha';
import { dataCurta } from '@/app/components/Admin/painel/formatos';
import { adminKeys, useAdminQuery } from '@/app/hooks/admin/query';
import {
  useApagarPartitura,
  useAtualizarPartitura,
} from '@/app/hooks/admin/useCatalogo';
import { useInvalidateAdmin } from '@/app/hooks/admin/query';
import {
  ORIGENS,
  TIPOS_DE_PARTITURA,
  buscarObras,
  getPartituraCompleta,
  salvarPartitura,
} from '@/app/requests/admin/catalogo';

/**
 * A ficha de uma partitura: abre **preenchida** — obra, compositor, título,
 * tipo, arquivo, editora e o resto — e grava só o que mudou.
 *
 * A edição usava o formulário de envio da comunidade, que abria vazio (ele
 * espera o registro no formato da tela de envio) e tinha outra cara. Aqui
 * é a folha do painel, como compositor e obra. Trocar a obra move a
 * partitura; "No ar" tira do site sem apagar.
 */

interface Form {
  obra: Opcao | null;
  title: string;
  type: string;
  externalUrl: string;
  publisher: string;
  editor: string;
  copyright: string;
  pageCount: string;
  fileFormat: string;
  groupTitle: string;
  notes: string;
}

const texto = (v: unknown) => (v === null || v === undefined ? '' : String(v));

export function FichaPartitura({
  partituraId,
  aoFechar,
}: {
  partituraId: string;
  aoFechar: () => void;
}) {
  const navegar = useNavegar();
  const invalidar = useInvalidateAdmin();
  const q = useAdminQuery(
    adminKeys.list('catalogo', { partituraCompleta: partituraId }),
    () => getPartituraCompleta(partituraId)
  );
  const p = q.data;
  const ativar = useAtualizarPartitura();
  const apagar = useApagarPartitura();
  const [form, setForm] = useState<Form | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [apagando, setApagando] = useState(false);

  const inicial = useMemo<Form | null>(
    () =>
      p
        ? {
            obra: p.work
              ? {
                  id: p.work.id,
                  rotulo: p.work.title,
                  detalhe: p.work.composer?.name,
                }
              : null,
            title: p.title,
            type: texto(p.type) || 'SCORES',
            externalUrl: texto(p.downloadUrl),
            publisher: texto(p.publisher),
            editor: texto(p.editor),
            copyright: texto(p.copyright),
            pageCount: texto(p.pageCount),
            fileFormat: texto(p.fileFormat) || 'PDF',
            groupTitle: texto(p.groupTitle),
            notes: texto(p.notes),
          }
        : null,
    [p]
  );

  useEffect(() => setForm(inicial), [inicial]);

  const mudancas = useMemo(() => {
    if (!form || !inicial) return {};
    const out: Record<string, unknown> = {};
    if (form.obra?.id && form.obra.id !== inicial.obra?.id) {
      out.workId = form.obra.id;
    }
    (
      [
        'title',
        'type',
        'externalUrl',
        'publisher',
        'editor',
        'copyright',
        'pageCount',
        'fileFormat',
        'groupTitle',
        'notes',
      ] as const
    ).forEach((k) => {
      if (form[k].trim() !== inicial[k].trim()) out[k] = form[k].trim();
    });
    return out;
  }, [form, inicial]);

  const urlInvalida =
    'externalUrl' in mudancas &&
    !/^https:\/\//i.test(String(mudancas.externalUrl));

  const salvar = async () => {
    setSalvando(true);
    try {
      await salvarPartitura(partituraId, mudancas);
      toast.success('Partitura salva.');
      void invalidar('catalogo');
      void invalidar('auditoria');
      aoFechar();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Não foi possível salvar.');
    } finally {
      setSalvando(false);
    }
  };

  const muda = (k: keyof Form) => (v: string) =>
    setForm((f) => (f ? { ...f, [k]: v } : f));

  return (
    <Sheet
      aberto
      aoFechar={aoFechar}
      titulo={p?.title ?? 'Partitura'}
      descricao={
        p?.work
          ? [p.work.title, p.work.composer?.name].filter(Boolean).join(' · ')
          : undefined
      }
      largura="g"
      rodape={
        p && (
          <>
            <Button
              tamanho="p"
              variante="perigo"
              icone={PiTrash}
              onClick={() => setApagando(true)}
              className="mr-auto"
            >
              Remover
            </Button>
            <Button tamanho="p" variante="fantasma" onClick={aoFechar}>
              Cancelar
            </Button>
            <Button
              tamanho="p"
              variante="primario"
              onClick={salvar}
              carregando={salvando}
              disabled={!Object.keys(mudancas).length || urlInvalida}
            >
              Salvar
            </Button>
          </>
        )
      }
    >
      {q.loading || !p || !form ? (
        q.error ? (
          <Text papel="rotulo" tom="erro" as="p">
            {q.error}
          </Text>
        ) : (
          <Row.Skeleton repetir={6} />
        )
      ) : (
        <Stack gap={6}>
          <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-3">
            <Info rotulo="Obra">
              {p.work ? (
                <Elo onClick={() => navegar.obra(p.work!.id)}>
                  {p.work.title}
                </Elo>
              ) : (
                '—'
              )}
            </Info>
            <Info rotulo="Compositor">
              {p.work?.composer?.id ? (
                <Elo onClick={() => navegar.compositor(p.work!.composer.id!)}>
                  {p.work.composer.name}
                </Elo>
              ) : (
                (p.work?.composer?.name ?? '—')
              )}
            </Info>
            <Info rotulo="Origem">{ORIGENS[p.source] ?? p.source}</Info>
            <Info rotulo="Enviada por">
              {p.uploadedBy ? (
                <Elo onClick={() => navegar.usuario(p.uploadedBy!)}>
                  ver a conta
                </Elo>
              ) : (
                'importada'
              )}
            </Info>
            <Info rotulo="Entrou em">{dataCurta(p.createdAt)}</Info>
            <Info rotulo="Instrumento">{p.work?.instrument?.name ?? '—'}</Info>
          </dl>

          <div className="rounded-card bg-sup-2 p-4">
            <Interruptor
              rotulo="No ar"
              ajuda={
                p.isActive
                  ? 'Aparece na obra e pode ser baixada.'
                  : 'Fora do site, sem apagar — dá para religar.'
              }
              ligado={p.isActive}
              aoMudar={async (v) => {
                try {
                  await ativar.mutateAsync([p.id, { isActive: v }]);
                  toast.success(
                    v ? 'Partitura no ar.' : 'Partitura desativada.'
                  );
                  void q.refetch();
                } catch (e) {
                  toast.error(
                    e instanceof Error ? e.message : 'Não foi possível salvar.'
                  );
                }
              }}
            />
          </div>

          <Stack gap={4}>
            <Escolher
              rotulo="Obra"
              valor={form.obra}
              aoMudar={(o) => setForm((f) => (f ? { ...f, obra: o } : f))}
              buscar={buscarObras}
              placeholder="Título da obra"
            />
            <Field
              label="Título"
              value={form.title}
              onChange={(e) => muda('title')(e.target.value)}
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field.Selecao
                label="Tipo"
                value={form.type}
                onChange={(e) => muda('type')(e.target.value)}
              >
                {Object.entries(TIPOS_DE_PARTITURA).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </Field.Selecao>
              <Field
                label="Formato"
                value={form.fileFormat}
                onChange={(e) => muda('fileFormat')(e.target.value)}
              />
            </div>
            <Field
              label="Endereço do arquivo"
              type="url"
              ajuda="Link https do PDF. Para trocar o arquivo enviado, envie de novo pela página de envios."
              value={form.externalUrl}
              onChange={(e) => muda('externalUrl')(e.target.value)}
              erro={urlInvalida ? 'Precisa começar com https://' : undefined}
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Field
                label="Editora"
                value={form.publisher}
                onChange={(e) => muda('publisher')(e.target.value)}
              />
              <Field
                label="Editor"
                value={form.editor}
                onChange={(e) => muda('editor')(e.target.value)}
              />
              <Field
                label="Páginas"
                inputMode="numeric"
                value={form.pageCount}
                onChange={(e) => muda('pageCount')(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field
                label="Direitos"
                value={form.copyright}
                onChange={(e) => muda('copyright')(e.target.value)}
              />
              <Field
                label="Grupo"
                ajuda="Ex.: “Partitura completa”, “Partes”."
                value={form.groupTitle}
                onChange={(e) => muda('groupTitle')(e.target.value)}
              />
            </div>
            <Field.Area
              label="Notas"
              rows={3}
              value={form.notes}
              onChange={(e) => muda('notes')(e.target.value)}
            />
          </Stack>

          <Inline gap={4} quebra>
            {p.downloadUrl && (
              <a
                href={p.downloadUrl}
                target="_blank"
                rel="noreferrer"
                className="t-rotulo inline-flex items-center gap-1.5 text-ouro-texto underline-offset-4 hover:underline"
              >
                <Icon de={PiFilePdf} tamanho="pp" /> Abrir o arquivo
              </a>
            )}
          </Inline>

          <Stack gap={2}>
            <Text papel="secao" as="h3">
              No painel
            </Text>
            <HistoricoDoRegistro entityId={p.id} />
          </Stack>
        </Stack>
      )}

      {p && (
        <ConfirmModal
          isOpen={apagando}
          onClose={() => setApagando(false)}
          onConfirm={async () => {
            try {
              await apagar.mutateAsync([p.id]);
              toast.success('Partitura removida.');
              setApagando(false);
              aoFechar();
            } catch (e) {
              toast.error(
                e instanceof Error ? e.message : 'Não foi possível remover.'
              );
            }
          }}
          type="danger"
          title="Remover esta partitura?"
          message={`“${p.title}” e o arquivo dela saem do acervo. Para só tirar do site, desligue "No ar". Não dá para desfazer.`}
          confirmText="Remover"
          isLoading={apagar.isPending}
        />
      )}
    </Sheet>
  );
}

function Info({
  rotulo,
  children,
}: {
  rotulo: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <dt className="t-legenda">{rotulo}</dt>
      <dd className="text-sm text-texto">{children}</dd>
    </div>
  );
}
