'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import {
  PiCheck,
  PiClock,
  PiDownloadSimple,
  PiPlay,
  PiWarning,
  PiX,
} from 'react-icons/pi';
import { Button } from '@/app/components/ui/Button';
import { Field } from '@/app/components/ui/Field';
import { Icon } from '@/app/components/ui/Icon';
import { Stack } from '@/app/components/ui/Layout';
import { Row } from '@/app/components/ui/Row';
import { Text } from '@/app/components/ui/Text';
import { Cabecalho, Secao } from '@/app/components/Admin/painel/Cabecalho';
import { Busca } from '@/app/components/Admin/painel/Controles';
import { Numeros, rolarAte } from '@/app/components/Admin/painel/Numeros';
import {
  bytes,
  dataHora,
  numero,
  relativo,
} from '@/app/components/Admin/painel/formatos';
import { useBackup } from '@/app/hooks/admin/useBackup';
import type { BackupCollectionConfig } from '@/app/requests/admin/backup';

/**
 * Backup do banco: o que entra no arquivo, quantos manter, e o histórico.
 *
 * A ordem da execução é a regra (cérebro de backend, Painel administrativo):
 * **gerar → enviar → baixar de volta e conferir → só então girar**. Por isso
 * o número que importa é o último backup *verificado*, não o último que
 * rodou. Quando ele roda é decisão de Tarefas agendadas.
 *
 * Coleção grande entra com recorte de 10 mil por padrão: pedir "tudo" de 200
 * mil documentos sem querer é o jeito mais fácil de estourar o arquivo.
 */

export default function Backup() {
  const backup = useBackup();
  const [keep, setKeep] = useState(3);
  const [selecionadas, setSelecionadas] = useState<Map<string, number | null>>(
    new Map()
  );
  const [busca, setBusca] = useState('');

  useEffect(() => {
    if (!backup.data) return;
    setKeep(backup.data.settings.keep);
    setSelecionadas(
      new Map(backup.data.settings.collections.map((c) => [c.name, c.limit]))
    );
  }, [backup.data]);

  const colecoes = useMemo(() => {
    const t = busca.trim().toLowerCase();
    const lista = backup.data?.colecoes ?? [];
    return t
      ? lista.filter(
          (c) =>
            c.model.toLowerCase().includes(t) ||
            c.name.toLowerCase().includes(t)
        )
      : lista;
  }, [backup.data, busca]);

  const total = useMemo(() => {
    let soma = 0;
    for (const c of backup.data?.colecoes ?? []) {
      if (!selecionadas.has(c.name)) continue;
      const lim = selecionadas.get(c.name) ?? null;
      soma += lim === null ? c.documents : Math.min(lim, c.documents);
    }
    return soma;
  }, [backup.data, selecionadas]);

  // Salvar só acende quando algo mudou em relação ao que está gravado.
  const mudou = useMemo(() => {
    const s = backup.data?.settings;
    if (!s) return false;
    if (s.keep !== keep || s.collections.length !== selecionadas.size)
      return true;
    return s.collections.some(
      (c) =>
        !selecionadas.has(c.name) ||
        (selecionadas.get(c.name) ?? null) !== c.limit
    );
  }, [backup.data, keep, selecionadas]);

  const alternar = (name: string, docs: number) =>
    setSelecionadas((a) => {
      const p = new Map(a);
      if (p.has(name)) p.delete(name);
      else p.set(name, docs > 10_000 ? 10_000 : null);
      return p;
    });

  const limitar = (name: string, valor: string) =>
    setSelecionadas((a) => {
      const p = new Map(a);
      const n = Number(valor);
      p.set(
        name,
        valor.trim() === '' || !Number.isFinite(n) || n <= 0
          ? null
          : Math.floor(n)
      );
      return p;
    });

  const salvar = async () => {
    const collections: BackupCollectionConfig[] = [
      ...selecionadas.entries(),
    ].map(([name, limit]) => ({ name, limit }));
    try {
      await backup.salvar.mutateAsync([keep, collections]);
      toast.success('Configuração do backup salva.');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Não foi possível salvar.');
    }
  };

  const impedimento = backup.data?.settings.storageIssue;
  const bom = backup.ultimoBom;
  const agenda = backup.data?.agendamento?.schedule;
  const velho =
    !bom?.verifiedAt ||
    Date.now() - new Date(bom.verifiedAt).getTime() > 48 * 3_600_000;

  return (
    <Stack gap={8}>
      <Cabecalho
        titulo="Backup"
        descricao="O arquivo vai para um bucket privado, é baixado de volta para conferência e só então o mais antigo sai"
        acoes={
          <>
            <Button
              tamanho="p"
              onClick={salvar}
              disabled={!mudou}
              carregando={backup.salvar.isPending}
            >
              Salvar configuração
            </Button>
            <Button
              tamanho="p"
              variante="primario"
              icone={PiPlay}
              onClick={() => void backup.executar()}
              carregando={backup.executando}
              disabled={!!impedimento}
            >
              Fazer backup agora
            </Button>
          </>
        }
      />

      {impedimento && (
        <div
          role="alert"
          className="flex gap-3 rounded-card bg-sup-2 px-5 py-4"
        >
          <Icon
            de={PiWarning}
            tamanho="m"
            className="mt-0.5 shrink-0 text-atencao"
          />
          <Stack gap={1}>
            <Text papel="corpo" as="p" className="font-medium">
              O backup não pode rodar ainda
            </Text>
            <Text papel="rotulo" tom="suave" as="p">
              {impedimento}
            </Text>
          </Stack>
        </div>
      )}

      <Numeros
        carregando={backup.loading}
        itens={[
          {
            id: 'verificado',
            rotulo: 'Último verificado',
            aoClicar: () => rolarAte('bkp-execucoes'),
            valor: bom?.verifiedAt ? relativo(bom.verifiedAt) : 'nenhum',
            nota: bom
              ? `${bytes(bom.sizeBytes)} · ${numero(bom.documentCount)} documentos`
              : 'nenhum arquivo conferido ainda',
            tom: velho ? 'atencao' : undefined,
          },
          {
            id: 'agenda',
            rotulo: 'Próximo',
            aoClicar: () => rolarAte('bkp-execucoes'),
            valor: agenda?.nextRunAt ? relativo(agenda.nextRunAt) : 'manual',
            nota: (
              <Link href="/admin/cron" className="hover:text-texto">
                {agenda?.cron
                  ? 'mudar em Tarefas agendadas'
                  : 'agendar em Tarefas agendadas'}
              </Link>
            ),
          },
          {
            id: 'entra',
            rotulo: 'Vai no arquivo',
            aoClicar: () => rolarAte('bkp-colecoes'),
            valor: numero(total),
            nota: `${numero(selecionadas.size)} coleções`,
          },
          {
            id: 'arquivos',
            rotulo: 'No bucket',
            aoClicar: () => rolarAte('bkp-arquivos'),
            valor: numero(backup.data?.arquivos.length),
            nota: `mantém ${keep}`,
          },
        ]}
      />

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <Secao titulo="O que entra no arquivo" id="bkp-colecoes">
          <div className="flex flex-wrap items-end gap-3">
            <Busca
              valor={busca}
              aoMudar={setBusca}
              rotulo="Filtrar coleções"
              placeholder="Filtrar coleções"
            />
            <div className="w-36">
              <Field
                label="Arquivos mantidos"
                type="number"
                min={1}
                max={30}
                value={keep}
                onChange={(e) =>
                  setKeep(
                    Math.min(30, Math.max(1, Number(e.target.value) || 1))
                  )
                }
              />
            </div>
          </div>
          <ul className="sup-1 max-h-[32rem] overflow-y-auto !p-0 rolagem-discreta">
            {colecoes.map((c) => {
              const marcada = selecionadas.has(c.name);
              const lim = selecionadas.get(c.name) ?? null;
              return (
                <li
                  key={c.name}
                  className="flex items-center gap-3 border-t border-linha px-4 py-2.5 first:border-0"
                >
                  <input
                    type="checkbox"
                    checked={marcada}
                    onChange={() => alternar(c.name, c.documents)}
                    aria-label={`Incluir ${c.model}`}
                    className="h-4 w-4 accent-[var(--ouro)]"
                  />
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-sm text-texto">
                      {c.model}
                    </span>
                    <span className="t-legenda t-dado truncate">
                      {c.name} · {numero(c.documents)}
                    </span>
                  </span>
                  {marcada && (
                    <input
                      type="number"
                      min={1}
                      value={lim ?? ''}
                      placeholder="tudo"
                      onChange={(e) => limitar(c.name, e.target.value)}
                      aria-label={`Quantos registros de ${c.model}`}
                      className="input-classical t-dado !min-h-9 w-28 !pl-3 text-sm"
                    />
                  )}
                </li>
              );
            })}
          </ul>
          <Text papel="legenda" as="p">
            Número em branco é a coleção inteira. Ao entrar o {keep + 1}º
            arquivo, o mais antigo sai.
          </Text>
        </Secao>

        <Stack gap={8}>
          <Secao titulo="No bucket" id="bkp-arquivos">
            {(backup.data?.arquivos.length ?? 0) === 0 ? (
              <Text papel="rotulo" tom="suave" as="p">
                Nenhum arquivo ainda.
              </Text>
            ) : (
              <Row.Lista>
                {backup.data!.arquivos.map((a) => (
                  <Row
                    key={a.key}
                    titulo={
                      <span className="t-dado text-sm">
                        {a.key.split('/').pop()}
                      </span>
                    }
                    detalhe={`${bytes(a.sizeBytes)} · ${dataHora(a.createdAt)}`}
                    depois={
                      <Button
                        tamanho="p"
                        variante="fantasma"
                        icone={PiDownloadSimple}
                        rotulo="Baixar (link de 1 hora)"
                        onClick={() => void backup.baixar(a.key)}
                      />
                    }
                  />
                ))}
              </Row.Lista>
            )}
          </Secao>

          <Secao titulo="Execuções" id="bkp-execucoes">
            {(backup.data?.execucoes.length ?? 0) === 0 ? (
              <Text papel="rotulo" tom="suave" as="p">
                Nenhuma execução registrada.
              </Text>
            ) : (
              <ul className="flex flex-col">
                {backup.data!.execucoes.map((e) => (
                  <li
                    key={e.id}
                    className="flex gap-3 border-b border-linha py-2.5 last:border-0"
                  >
                    <Icon
                      de={
                        e.status === 'ok'
                          ? PiCheck
                          : e.status === 'failed'
                            ? PiX
                            : PiClock
                      }
                      rotulo={
                        e.status === 'ok'
                          ? 'Concluído'
                          : e.status === 'failed'
                            ? 'Falhou'
                            : 'Rodando'
                      }
                      className={
                        e.status === 'failed'
                          ? 'mt-0.5 text-erro'
                          : 'mt-0.5 text-texto-fraco'
                      }
                    />
                    <span className="flex min-w-0 flex-col">
                      <span className="text-sm text-texto">
                        {dataHora(e.startedAt)}
                        {e.verifiedAt ? (
                          <span className="text-texto-suave">
                            {' '}
                            · verificado
                          </span>
                        ) : e.status === 'ok' ? (
                          <span className="text-atencao">
                            {' '}
                            · sem verificação
                          </span>
                        ) : null}
                      </span>
                      {e.error ? (
                        <span className="t-legenda text-erro">{e.error}</span>
                      ) : e.status === 'ok' ? (
                        <span className="t-legenda">
                          {bytes(e.sizeBytes)} · {numero(e.documentCount)}{' '}
                          documentos
                          {e.rotated?.length
                            ? ` · ${e.rotated.length} antigo${e.rotated.length === 1 ? '' : 's'} removido${e.rotated.length === 1 ? '' : 's'}`
                            : ''}
                        </span>
                      ) : null}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Secao>
        </Stack>
      </div>
    </Stack>
  );
}
