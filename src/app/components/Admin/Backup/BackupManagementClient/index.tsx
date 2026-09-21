'use client';

import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  FiAlertTriangle,
  FiCheckCircle,
  FiClock,
  FiDatabase,
  FiDownload,
  FiPlay,
  FiSave,
  FiX,
} from 'react-icons/fi';
import { useBackup } from '@/app/hooks/admin/useBackup';
import type { BackupCollectionConfig } from '@/app/requests/admin/backup';

/** `18234567` → `17,4 MB`. */
function tamanho(bytes: number | null): string {
  if (!bytes) return '—';

  const unidades = ['B', 'kB', 'MB', 'GB'];
  let valor = bytes;
  let unidade = 0;

  while (valor >= 1024 && unidade < unidades.length - 1) {
    valor /= 1024;
    unidade += 1;
  }

  return `${valor.toFixed(1).replace('.', ',')} ${unidades[unidade]}`;
}

function quando(iso: string | null): string {
  return iso ? new Date(iso).toLocaleString('pt-BR') : '—';
}

export default function BackupManagementClient() {
  const backup = useBackup();

  const [keep, setKeep] = useState(3);
  const [selecionadas, setSelecionadas] = useState<Map<string, number | null>>(
    new Map()
  );
  const [busca, setBusca] = useState('');

  // A configuração gravada vira o estado da tela assim que chega.
  useEffect(() => {
    if (!backup.data) return;

    setKeep(backup.data.settings.keep);
    setSelecionadas(
      new Map(
        backup.data.settings.collections.map((colecao) => [
          colecao.name,
          colecao.limit,
        ])
      )
    );
  }, [backup.data]);

  const colecoes = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    const lista = backup.data?.colecoes ?? [];

    return termo
      ? lista.filter(
          (colecao) =>
            colecao.model.toLowerCase().includes(termo) ||
            colecao.name.toLowerCase().includes(termo)
        )
      : lista;
  }, [backup.data, busca]);

  const totalSelecionado = useMemo(() => {
    let total = 0;

    for (const colecao of backup.data?.colecoes ?? []) {
      if (!selecionadas.has(colecao.name)) continue;

      const limite = selecionadas.get(colecao.name) ?? null;
      total +=
        limite === null
          ? colecao.documents
          : Math.min(limite, colecao.documents);
    }

    return total;
  }, [backup.data, selecionadas]);

  function alternar(name: string, documentos: number) {
    setSelecionadas((anterior) => {
      const proximo = new Map(anterior);

      if (proximo.has(name)) {
        proximo.delete(name);
      } else {
        // Coleção grande entra com recorte por padrão: pedir "tudo" de 200 mil
        // documentos sem querer é o jeito mais fácil de estourar o arquivo.
        proximo.set(name, documentos > 10_000 ? 10_000 : null);
      }

      return proximo;
    });
  }

  function definirLimite(name: string, valor: string) {
    setSelecionadas((anterior) => {
      const proximo = new Map(anterior);
      const numero = Number(valor);

      proximo.set(
        name,
        valor.trim() === '' || !Number.isFinite(numero) || numero <= 0
          ? null
          : Math.floor(numero)
      );

      return proximo;
    });
  }

  async function salvar() {
    const collections: BackupCollectionConfig[] = [
      ...selecionadas.entries(),
    ].map(([name, limit]) => ({ name, limit }));

    try {
      await backup.salvar.mutateAsync([keep, collections]);
      toast.success('Configuração do backup salva.');
    } catch {
      // O hook de mutação já mostra o erro.
    }
  }

  const impedimento = backup.data?.settings.storageIssue;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-theme-primary classical-title">
            Backup do banco
          </h1>
          <p className="text-theme-secondary text-sm mt-1">
            O arquivo vai para um bucket privado, é baixado de volta para
            conferência e só então o mais antigo sai.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => void backup.executar()}
            disabled={backup.executando || Boolean(impedimento)}
            className="btn-classical-primary flex items-center gap-2 disabled:opacity-50"
          >
            <FiPlay className="w-4 h-4" />
            {backup.executando ? 'Executando…' : 'Executar agora'}
          </button>

          <button
            onClick={() => void salvar()}
            disabled={backup.salvar.isPending}
            className="btn-classical-secondary flex items-center gap-2 disabled:opacity-50"
          >
            <FiSave className="w-4 h-4" />
            Salvar
          </button>
        </div>
      </header>

      {impedimento && (
        <div className="classical-card p-4 flex gap-3 border-l-4 border-accent-amber">
          <FiAlertTriangle className="w-5 h-5 text-accent-amber shrink-0 mt-0.5" />
          <div>
            <p className="text-theme-primary font-medium">
              O backup não pode rodar ainda
            </p>
            <p className="text-theme-secondary text-sm mt-1">{impedimento}</p>
          </div>
        </div>
      )}

      <section className="grid gap-4 md:grid-cols-3">
        <div className="classical-card p-4">
          <p className="text-theme-tertiary text-xs uppercase tracking-wide">
            Último backup verificado
          </p>
          <p className="text-theme-primary font-semibold mt-1">
            {backup.ultimoBom ? quando(backup.ultimoBom.verifiedAt) : 'nenhum'}
          </p>
          {backup.ultimoBom && (
            <p className="text-theme-secondary text-sm">
              {tamanho(backup.ultimoBom.sizeBytes)} ·{' '}
              {backup.ultimoBom.documentCount?.toLocaleString('pt-BR')}{' '}
              documentos
            </p>
          )}
        </div>

        <div className="classical-card p-4">
          <p className="text-theme-tertiary text-xs uppercase tracking-wide">
            Agendamento
          </p>
          <p className="text-theme-primary font-semibold mt-1">
            {backup.data?.agendamento?.schedule?.cron ?? 'manual'}
          </p>
          <p className="text-theme-secondary text-sm">
            Próxima:{' '}
            {quando(backup.data?.agendamento?.schedule?.nextRunAt ?? null)}
          </p>
        </div>

        <div className="classical-card p-4">
          <label className="text-theme-tertiary text-xs uppercase tracking-wide">
            Arquivos mantidos
          </label>
          <input
            type="number"
            min={1}
            max={30}
            value={keep}
            onChange={(evento) => setKeep(Number(evento.target.value) || 1)}
            className="mt-1 w-24 rounded-md border border-theme-primary bg-theme-elevated px-3 py-1.5 text-theme-primary"
          />
          <p className="text-theme-secondary text-sm mt-1">
            Ao entrar o {keep + 1}º, o mais antigo sai.
          </p>
        </div>
      </section>

      <section className="classical-card p-4">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 className="text-lg font-semibold text-theme-primary flex items-center gap-2">
            <FiDatabase className="w-4 h-4" />O que entra no arquivo
          </h2>

          <div className="flex items-center gap-3">
            <span className="text-theme-secondary text-sm">
              {selecionadas.size} coleções ·{' '}
              {totalSelecionado.toLocaleString('pt-BR')} documentos
            </span>
            <input
              value={busca}
              onChange={(evento) => setBusca(evento.target.value)}
              placeholder="Filtrar…"
              className="rounded-md border border-theme-primary bg-theme-elevated px-3 py-1.5 text-sm text-theme-primary"
            />
          </div>
        </div>

        <div className="max-h-[28rem] overflow-y-auto divide-y divide-theme-secondary">
          {colecoes.map((colecao) => {
            const marcada = selecionadas.has(colecao.name);
            const limite = selecionadas.get(colecao.name) ?? null;

            return (
              <div
                key={colecao.name}
                className="flex items-center gap-3 py-2.5"
              >
                <input
                  type="checkbox"
                  checked={marcada}
                  onChange={() => alternar(colecao.name, colecao.documents)}
                  className="w-4 h-4"
                  aria-label={`Incluir ${colecao.model} no backup`}
                />

                <div className="flex-1 min-w-0">
                  <p className="text-theme-primary text-sm font-medium truncate">
                    {colecao.model}
                  </p>
                  <p className="text-theme-tertiary text-xs truncate">
                    {colecao.name} · {colecao.documents.toLocaleString('pt-BR')}{' '}
                    documentos
                  </p>
                </div>

                {marcada && (
                  <input
                    type="number"
                    min={1}
                    value={limite ?? ''}
                    placeholder="tudo"
                    onChange={(evento) =>
                      definirLimite(colecao.name, evento.target.value)
                    }
                    className="w-28 rounded-md border border-theme-primary bg-theme-elevated px-2 py-1 text-sm text-theme-primary"
                    aria-label={`Quantos registros de ${colecao.model}`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="classical-card p-4">
          <h2 className="text-lg font-semibold text-theme-primary mb-3">
            Arquivos no bucket
          </h2>

          {(backup.data?.arquivos.length ?? 0) === 0 ? (
            <p className="text-theme-secondary text-sm">
              Nenhum arquivo ainda.
            </p>
          ) : (
            <ul className="divide-y divide-theme-secondary">
              {backup.data?.arquivos.map((arquivo) => (
                <li
                  key={arquivo.key}
                  className="flex items-center justify-between gap-3 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="text-theme-primary text-sm truncate">
                      {arquivo.key.split('/').pop()}
                    </p>
                    <p className="text-theme-tertiary text-xs">
                      {tamanho(arquivo.sizeBytes)} · {quando(arquivo.createdAt)}
                    </p>
                  </div>

                  <button
                    onClick={() => void backup.baixar(arquivo.key)}
                    className="btn-classical-secondary flex items-center gap-1.5 text-sm px-3 py-1.5"
                  >
                    <FiDownload className="w-3.5 h-3.5" />
                    Baixar
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="classical-card p-4">
          <h2 className="text-lg font-semibold text-theme-primary mb-3">
            Últimas execuções
          </h2>

          {(backup.data?.execucoes.length ?? 0) === 0 ? (
            <p className="text-theme-secondary text-sm">
              Nenhuma execução registrada.
            </p>
          ) : (
            <ul className="divide-y divide-theme-secondary">
              {backup.data?.execucoes.map((execucao) => (
                <li key={execucao.id} className="flex gap-3 py-2.5">
                  {execucao.status === 'ok' ? (
                    <FiCheckCircle className="w-4 h-4 text-accent-green shrink-0 mt-0.5" />
                  ) : execucao.status === 'failed' ? (
                    <FiX className="w-4 h-4 text-accent-red shrink-0 mt-0.5" />
                  ) : (
                    <FiClock className="w-4 h-4 text-accent-amber shrink-0 mt-0.5" />
                  )}

                  <div className="min-w-0">
                    <p className="text-theme-primary text-sm">
                      {quando(execucao.startedAt)}
                      {execucao.verifiedAt && ' · verificado'}
                    </p>
                    {execucao.error && (
                      <p className="text-accent-red text-xs mt-0.5">
                        {execucao.error}
                      </p>
                    )}
                    {execucao.status === 'ok' && (
                      <p className="text-theme-tertiary text-xs">
                        {tamanho(execucao.sizeBytes)} ·{' '}
                        {execucao.documentCount?.toLocaleString('pt-BR')}{' '}
                        documentos
                        {execucao.rotated?.length
                          ? ` · ${execucao.rotated.length} removido(s)`
                          : ''}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
