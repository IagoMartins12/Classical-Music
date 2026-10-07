'use client';

import { useMemo, useState } from 'react';
import {
  PiArrowDown,
  PiArrowUp,
  PiColumns,
  PiCopy,
  PiDownloadSimple,
  PiFunnel,
  PiLock,
  PiPencilSimple,
  PiPlus,
  PiTrash,
  PiX,
} from 'react-icons/pi';
import ConfirmationModal from '@/app/components/Admin/Database/ConfirmationModal';
import FieldSelector from '@/app/components/Admin/Database/FieldSelector';
import FilterPanel from '@/app/components/Admin/Database/FilterPanel';
import { EditorDeDocumento } from '@/app/components/Admin/Database/EditorDeDocumento';
import { CONFIRMATION_MESSAGES } from '@/app/components/Admin/Database/confirmations';
import { Chip } from '@/app/components/ui/Badge';
import { Button } from '@/app/components/ui/Button';
import { Vazio } from '@/app/components/ui/Estados';
import { Icon } from '@/app/components/ui/Icon';
import { Inline, Stack } from '@/app/components/ui/Layout';
import { Selecao } from '@/app/components/ui/Selecao';
import { Skeleton } from '@/app/components/ui/Skeleton';
import { Text } from '@/app/components/ui/Text';
import { cx } from '@/app/components/ui/cx';
import { Cabecalho } from '@/app/components/Admin/painel/Cabecalho';
import { BarraDeSelecao, Busca } from '@/app/components/Admin/painel/Controles';
import { numero } from '@/app/components/Admin/painel/formatos';
import { useDatabaseStudio } from '@/app/hooks/admin/useDatabaseStudio';
import { deleteConfirmationPhrase } from '@/app/requests/admin/database';

/**
 * Database Studio: ler e, com cuidado, escrever direto nos models.
 *
 * As travas são da API (JWT de administrador, política de campos, frase de
 * confirmação por alvo, trilha): apagar 3 registros pede a frase dos 3, e
 * ela não confirma apagar 300. Campo sensível não é lido, filtrado nem
 * ordenado — aparece com o cadeado.
 *
 * Mudou da tela anterior: os models ficam numa coluna com busca que filtra
 * de verdade (o campo "Buscar tabela" antigo não estava ligado a nada), sem
 * cor por categoria; a tabela é a do painel; a remoção pedia a frase **e**
 * depois um `window.confirm` — ficou só a frase.
 */

const CATEGORIAS: Record<string, string> = {
  core: 'Núcleo',
  content: 'Conteúdo',
  social: 'Social',
  admin: 'Administração',
  system: 'Sistema',
};

export default function EstudioDoBanco() {
  const e = useDatabaseStudio();
  const [buscaModel, setBuscaModel] = useState('');
  const [editor, setEditor] = useState<{
    id: string | null;
    duplicarDe?: string | null;
  } | null>(null);
  const [campos, setCampos] = useState(false);
  const [filtros, setFiltros] = useState(false);
  const [apagar, setApagar] = useState<string[] | null>(null);

  const porCategoria = useMemo(() => {
    const t = buscaModel.trim().toLowerCase();
    const grupos = new Map<string, typeof e.models>();
    for (const m of e.models) {
      if (
        t &&
        !m.displayName.toLowerCase().includes(t) &&
        !m.name.toLowerCase().includes(t)
      )
        continue;
      grupos.set(m.category, [...(grupos.get(m.category) ?? []), m]);
    }
    return [...grupos.entries()];
  }, [e.models, buscaModel]);

  const colunas = e.selectedFields.length
    ? e.selectedFields
    : e.availableFields.slice(0, 8);
  const campo = (nome: string) =>
    e.modelSchema?.fields.find((f) => f.name === nome);
  const paginas = Math.max(1, Math.ceil(e.totalRecords / e.pageSize));
  const filtrosAtivos = Object.keys(e.activeFilters);

  return (
    <Stack gap={6}>
      <Cabecalho
        titulo="Database Studio"
        descricao="Leitura e escrita direta nos models, com confirmação por frase e registro na auditoria"
      />

      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside
          aria-label="Models"
          className="flex flex-col gap-3 lg:sticky lg:top-20 lg:max-h-[calc(100dvh-7rem)]"
        >
          <Busca
            valor={buscaModel}
            aoMudar={setBuscaModel}
            rotulo="Buscar model"
            placeholder="Buscar model"
            className="!max-w-none"
          />
          <nav className="rolagem-discreta flex flex-col gap-4 overflow-y-auto pr-1">
            {e.loading && e.models.length === 0
              ? Array.from({ length: 8 }, (_, i) => (
                  <Skeleton key={i} className="h-5 w-full" />
                ))
              : porCategoria.map(([cat, lista]) => (
                  <div key={cat} className="flex flex-col gap-0.5">
                    <span className="t-legenda px-3 pb-1">
                      {CATEGORIAS[cat] ?? cat}
                    </span>
                    {lista.map((m) => (
                      <button
                        key={m.name}
                        type="button"
                        aria-current={
                          e.selectedModel === m.name ? 'true' : undefined
                        }
                        onClick={() => e.selectModel(m.name)}
                        className={cx(
                          'flex min-h-9 items-center gap-2 rounded-controle px-3 text-left text-sm transition-colors duration-[var(--t-toque)] ease-saida',
                          e.selectedModel === m.name
                            ? 'fundo-sup-1 font-medium text-texto shadow-[var(--sombra-1)]'
                            : 'text-texto-suave hover:bg-[var(--interactive-hover)] hover:text-texto'
                        )}
                      >
                        <span className="flex-1 truncate">{m.displayName}</span>
                        <span className="t-dado text-xs text-texto-fraco">
                          {numero(m.count)}
                        </span>
                      </button>
                    ))}
                  </div>
                ))}
          </nav>
        </aside>

        {!e.selectedModel ? (
          <Vazio
            titulo="Escolha um model"
            descricao="A lista à esquerda mostra cada coleção do banco e quantos registros ela tem."
          />
        ) : (
          <Stack gap={4} className="min-w-0 max-w-full">
            <Inline extremos quebra gap={3}>
              <Text papel="secao" as="h2">
                {e.models.find((m) => m.name === e.selectedModel)
                  ?.displayName ?? e.selectedModel}
              </Text>
              <Inline gap={2} quebra>
                <Button
                  tamanho="p"
                  variante="fantasma"
                  icone={PiColumns}
                  onClick={() => setCampos(true)}
                >
                  Campos{' '}
                  {e.selectedFields.length
                    ? `(${e.selectedFields.length})`
                    : ''}
                </Button>
                <Button
                  tamanho="p"
                  variante="fantasma"
                  icone={PiFunnel}
                  onClick={() => setFiltros(true)}
                >
                  Filtros{' '}
                  {filtrosAtivos.length ? `(${filtrosAtivos.length})` : ''}
                </Button>
                <Button
                  tamanho="p"
                  variante="fantasma"
                  icone={PiDownloadSimple}
                  onClick={() => void e.exportData('json')}
                >
                  JSON
                </Button>
                <Button
                  tamanho="p"
                  variante="primario"
                  icone={PiPlus}
                  onClick={() => setEditor({ id: null })}
                >
                  Novo documento
                </Button>
              </Inline>
            </Inline>

            <Busca
              valor={e.searchQuery}
              aoMudar={e.setSearchQuery}
              rotulo="Buscar registros"
              placeholder="Buscar nos campos de texto"
            />

            {filtrosAtivos.length > 0 && (
              <Inline gap={2} quebra>
                {filtrosAtivos.map((f) => (
                  <Chip key={f} selecionado onClick={() => e.removeFilter(f)}>
                    {f}:{' '}
                    {String(
                      (e.activeFilters as Record<string, { value?: unknown }>)[
                        f
                      ]?.value ?? e.activeFilters[f]
                    )}{' '}
                    <Icon de={PiX} tamanho="pp" className="ml-1.5" />
                  </Chip>
                ))}
                <Button tamanho="p" variante="texto" onClick={e.clearFilters}>
                  Limpar filtros
                </Button>
              </Inline>
            )}

            <BarraDeSelecao
              quantidade={e.selectedRecords.size}
              singular="registro marcado"
              plural="registros marcados"
              aoLimpar={e.clearSelection}
            >
              <Button
                tamanho="p"
                variante="perigo"
                icone={PiTrash}
                onClick={() => setApagar([...e.selectedRecords])}
              >
                Apagar
              </Button>
            </BarraDeSelecao>

            {/* A tabela rola dentro da própria caixa: com `min-w-max` solto,
                um documento largo empurrava a página inteira para o lado. O
                `relative` também é preciso: o rótulo `sr-only` da coluna de
                ações é absoluto e, sem um ancestral posicionado, escapava da
                caixa e alargava a página para 2.000 px. */}
            <div className="sup-1 relative w-full max-w-full overflow-x-auto !p-0 rolagem-discreta">
              <table className="w-full min-w-max text-left text-sm">
                <thead>
                  <tr className="t-legenda">
                    <th className="w-10 px-4 py-3">
                      <input
                        type="checkbox"
                        aria-label="Marcar todos desta página"
                        checked={
                          e.records.length > 0 &&
                          e.selectedRecords.size === e.records.length
                        }
                        onChange={() =>
                          e.selectedRecords.size === e.records.length
                            ? e.clearSelection()
                            : e.selectAllRecords()
                        }
                        className="h-4 w-4 accent-[var(--ouro)]"
                      />
                    </th>
                    {colunas.map((nome) => {
                      const f = campo(nome);
                      const ordena = !f?.isSensitive;
                      return (
                        <th
                          key={nome}
                          scope="col"
                          className="px-3 py-3 font-normal"
                        >
                          <button
                            type="button"
                            disabled={!ordena}
                            onClick={() => e.setSort(nome)}
                            className="inline-flex items-center gap-1 whitespace-nowrap hover:text-texto disabled:cursor-default"
                          >
                            {f?.isSensitive && (
                              <Icon
                                de={PiLock}
                                tamanho="pp"
                                rotulo="Campo protegido"
                              />
                            )}
                            <span className="t-dado">{nome}</span>
                            {e.sortField === nome && (
                              <Icon
                                de={
                                  e.sortDirection === 'asc'
                                    ? PiArrowUp
                                    : PiArrowDown
                                }
                                tamanho="pp"
                              />
                            )}
                          </button>
                        </th>
                      );
                    })}
                    <th className="px-3 py-3">
                      <span className="sr-only">Ações</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {e.loadingRecords ? (
                    Array.from({ length: 8 }, (_, i) => (
                      <tr key={i} className="border-t border-linha">
                        <td colSpan={colunas.length + 2} className="px-4 py-3">
                          <Skeleton className="w-full" />
                        </td>
                      </tr>
                    ))
                  ) : e.records.length === 0 ? (
                    <tr>
                      <td
                        colSpan={colunas.length + 2}
                        className="px-4 py-8 text-center"
                      >
                        <Text papel="rotulo" tom="suave" as="p">
                          Nenhum registro{' '}
                          {filtrosAtivos.length || e.searchQuery
                            ? 'com esses filtros'
                            : 'neste model'}
                          .
                        </Text>
                      </td>
                    </tr>
                  ) : (
                    e.records.map((r: Record<string, unknown>) => {
                      const id = String(r.id);
                      const marcado = e.selectedRecords.has(id);
                      return (
                        <tr
                          key={id}
                          className={cx(
                            'border-t border-linha',
                            marcado
                              ? 'bg-[var(--interactive-hover)]'
                              : 'hover:bg-[var(--interactive-hover)]'
                          )}
                        >
                          <td className="px-4 py-2.5">
                            <input
                              type="checkbox"
                              aria-label={`Marcar ${id}`}
                              checked={marcado}
                              onChange={() => e.toggleRecordSelection(id)}
                              className="h-4 w-4 accent-[var(--ouro)]"
                            />
                          </td>
                          {colunas.map((nome) => {
                            const f = campo(nome);
                            const v = f
                              ? e.formatFieldValue(r[nome], f)
                              : String(r[nome] ?? '-');
                            return (
                              <td
                                key={nome}
                                className={cx(
                                  'max-w-72 truncate px-3 py-2.5',
                                  f?.isId || /Id$/.test(nome)
                                    ? 't-dado text-xs text-texto-suave'
                                    : 'text-texto'
                                )}
                                title={v}
                              >
                                {f?.isSensitive ? (
                                  <span className="text-texto-fraco">••••</span>
                                ) : (
                                  v
                                )}
                              </td>
                            );
                          })}
                          <td className="whitespace-nowrap px-3 py-2 text-right">
                            <Button
                              tamanho="p"
                              variante="fantasma"
                              icone={PiPencilSimple}
                              rotulo={`Editar ${id}`}
                              title="Editar"
                              onClick={() => setEditor({ id })}
                            />
                            <Button
                              tamanho="p"
                              variante="fantasma"
                              icone={PiCopy}
                              rotulo={`Duplicar ${id}`}
                              title="Duplicar"
                              onClick={() =>
                                setEditor({ id: null, duplicarDe: id })
                              }
                            />
                            <Button
                              tamanho="p"
                              variante="fantasma"
                              icone={PiTrash}
                              rotulo={`Apagar ${id}`}
                              onClick={() => setApagar([id])}
                            />
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <Inline extremos quebra gap={3}>
              <Text papel="legenda" as="p" className="t-dado">
                {numero(e.totalRecords)} registros · página {e.currentPage} de{' '}
                {paginas}
              </Text>
              <Inline gap={2}>
                <div className="w-32">
                  <label htmlFor="estudio-por-pagina" className="sr-only">
                    Por página
                  </label>
                  <Selecao
                    id="estudio-por-pagina"
                    valor={String(e.pageSize)}
                    aoMudar={(v) => e.setPageSize(Number(v))}
                    opcoes={[25, 50, 100, 200].map((n) => ({
                      value: String(n),
                      label: `${n} por página`,
                    }))}
                  />
                </div>
                <Button
                  tamanho="p"
                  variante="fantasma"
                  disabled={e.currentPage <= 1}
                  onClick={() => e.loadRecords(e.currentPage - 1)}
                >
                  Anterior
                </Button>
                <Button
                  tamanho="p"
                  variante="fantasma"
                  disabled={e.currentPage >= paginas}
                  onClick={() => e.loadRecords(e.currentPage + 1)}
                >
                  Próxima
                </Button>
              </Inline>
            </Inline>
          </Stack>
        )}
      </div>

      {e.modelSchema && e.selectedModel && (
        <EditorDeDocumento
          aberto={!!editor}
          model={e.selectedModel}
          schema={e.modelSchema}
          id={editor?.id ?? null}
          duplicarDe={editor?.duplicarDe}
          aoFechar={() => setEditor(null)}
          aoSalvar={() => {
            setEditor(null);
            void e.loadRecords(e.currentPage);
          }}
        />
      )}

      {campos && (
        <FieldSelector
          isOpen
          onClose={() => setCampos(false)}
          availableFields={e.availableFields}
          selectedFields={e.selectedFields}
          modelSchema={e.modelSchema}
          onToggleField={e.toggleFieldSelection}
          onSelectAll={e.selectAllFields}
          onClearSelection={e.clearFieldSelection}
          onApply={() => e.loadRecords(1)}
        />
      )}

      {filtros && (
        <FilterPanel
          isOpen
          onClose={() => setFiltros(false)}
          availableFields={e.availableFields}
          activeFilters={e.activeFilters}
          modelSchema={e.modelSchema}
          onAddFilter={e.addFilter}
          onRemoveFilter={e.removeFilter}
          onClearFilters={e.clearFilters}
          onApply={() => e.loadRecords(1)}
        />
      )}

      {apagar && e.selectedModel && (
        <ConfirmationModal
          isOpen
          onClose={() => setApagar(null)}
          onConfirm={async () => {
            if (apagar.length === 1) await e.deleteRecord(apagar[0]);
            else await e.deleteMultipleRecords(apagar);
            setApagar(null);
          }}
          title={
            apagar.length === 1
              ? CONFIRMATION_MESSAGES.delete.title
              : CONFIRMATION_MESSAGES.deleteMultiple.title
          }
          message={
            apagar.length === 1
              ? CONFIRMATION_MESSAGES.delete.message
              : CONFIRMATION_MESSAGES.deleteMultiple.message(apagar.length)
          }
          keyword={deleteConfirmationPhrase(e.selectedModel, apagar.length)}
          placeholder={`Digite "${deleteConfirmationPhrase(e.selectedModel, apagar.length)}"`}
          type="danger"
        />
      )}
    </Stack>
  );
}
