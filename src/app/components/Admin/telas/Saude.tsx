'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PiCheck, PiWarning } from 'react-icons/pi';
import { Icon } from '@/app/components/ui/Icon';
import { Stack } from '@/app/components/ui/Layout';
import { Row } from '@/app/components/ui/Row';
import { Sheet } from '@/app/components/ui/Sheet';
import { Text } from '@/app/components/ui/Text';
import { cx } from '@/app/components/ui/cx';
import { Cabecalho, Secao } from '@/app/components/Admin/painel/Cabecalho';
import { Numeros } from '@/app/components/Admin/painel/Numeros';
import { Tabela, type Coluna } from '@/app/components/Admin/painel/Tabela';
import {
  bytes,
  dataHora,
  numero,
  porcento,
  relativo,
} from '@/app/components/Admin/painel/formatos';
import { adminKeys, useAdminQuery } from '@/app/hooks/admin/query';
import { apiFetch } from '@/app/libs/api/client';
import {
  getMaintenanceHealth,
  getReadiness,
  type ApiMaintenanceHealth,
} from '@/app/requests/admin/operations';

/**
 * Saúde: a casa está de pé?
 *
 * Só o que a API mede. A tela antiga ("Sistema & Performance") mostrava CPU,
 * memória, rede, "requests por status" e "top endpoints" — nada disso chega
 * ao painel (o `/metrics` é do Prometheus, com chave), e os campos ficavam
 * zerados ou eram sorteados no rodapé. Aqui: os serviços da prontidão, o
 * banco e o disco, as filas de trabalho com as falhas de cada uma, e se a
 * busca textual tem índice em todas as coleções.
 *
 * Atualiza sozinha a cada 30 segundos.
 */

type Fila = ApiMaintenanceHealth['queues'][number];

interface Falha {
  jobId: string | null;
  job: string;
  attemptsMade: number;
  failedReason: string | null;
  failedAt: string | null;
}

const SERVICOS: Record<string, string> = {
  database: 'Banco de dados',
  mongodb: 'Banco de dados',
  redis: 'Redis (cache e filas)',
  cache: 'Redis (cache e filas)',
  storage: 'Armazenamento de arquivos',
  cloudinary: 'Armazenamento de arquivos',
  mail: 'E-mail',
  smtp: 'E-mail',
  api: 'API',
};

const FILAS: Record<string, string> = {
  email: 'E-mail',
  maintenance: 'Manutenção',
  newsletter: 'Newsletter',
  notifications: 'Notificações',
  scraper: 'Scrapers',
  media: 'Mídia',
  imports: 'Importações',
};

export default function Saude() {
  const router = useRouter();
  const [fila, setFila] = useState<Fila | null>(null);
  const prontidao = useAdminQuery(
    adminKeys.list('saude', 'prontidao'),
    getReadiness,
    { refetchInterval: 30_000, staleTime: 15_000 }
  );
  const medida = useAdminQuery(
    adminKeys.list('saude', 'medida'),
    getMaintenanceHealth,
    { refetchInterval: 30_000, staleTime: 15_000 }
  );

  const p = prontidao.data;
  const m = medida.data;
  const servicos = Object.entries(
    p?.details ?? { ...(p?.info ?? {}), ...(p?.error ?? {}) }
  );
  const disco = m?.databaseHostDisk;

  const colunas: Coluna<Fila>[] = [
    {
      id: 'fila',
      titulo: 'Fila',
      principal: true,
      celula: (q) => (
        <span className="flex items-center gap-2">
          {q.workers === 0 && (q.counts.waiting ?? 0) > 0 ? (
            <Icon de={PiWarning} rotulo="Parada" className="text-atencao" />
          ) : (
            <Icon de={PiCheck} rotulo="Normal" className="text-texto-fraco" />
          )}
          <span className="text-[0.9375rem] text-texto">
            {FILAS[q.queue] ?? q.queue}
          </span>
          {q.paused && <span className="t-legenda">pausada</span>}
        </span>
      ),
    },
    {
      id: 'workers',
      titulo: 'Workers',
      alinhar: 'fim',
      celula: (q) => (
        <span className={q.workers === 0 ? 'text-atencao' : undefined}>
          {numero(q.workers)}
        </span>
      ),
    },
    {
      id: 'esperando',
      titulo: 'Esperando',
      alinhar: 'fim',
      celula: (q) => numero(q.counts.waiting ?? 0),
    },
    {
      id: 'rodando',
      titulo: 'Rodando',
      alinhar: 'fim',
      soNoComputador: true,
      celula: (q) => numero(q.counts.active ?? 0),
    },
    {
      id: 'falhas',
      titulo: 'Falhas retidas',
      alinhar: 'fim',
      celula: (q) => (
        <span
          className={(q.counts.failed ?? 0) > 0 ? 'text-atencao' : undefined}
        >
          {numero(q.counts.failed ?? 0)}
        </span>
      ),
    },
    {
      id: 'antigo',
      titulo: 'Mais antigo',
      alinhar: 'fim',
      soNoComputador: true,
      celula: (q) =>
        q.oldestWaitingSeconds === null
          ? '—'
          : q.oldestWaitingSeconds < 120
            ? `${q.oldestWaitingSeconds} s`
            : `${Math.round(q.oldestWaitingSeconds / 60)} min`,
    },
  ];

  return (
    <Stack gap={8}>
      <Cabecalho
        titulo="Saúde"
        descricao="Serviços, banco, filas de trabalho e busca"
        atualizadoEm={medida.updatedAt}
        aoAtualizar={() => Promise.all([prontidao.refetch(), medida.refetch()])}
        atualizando={medida.fetching && !medida.loading}
      />

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <Secao titulo="Serviços" id="saude-servicos">
          {prontidao.loading ? (
            <Row.Lista>
              <Row.Skeleton repetir={3} />
            </Row.Lista>
          ) : prontidao.error ? (
            <Text papel="rotulo" tom="erro" as="p">
              A API não respondeu: {prontidao.error}
            </Text>
          ) : (
            <Row.Lista>
              {servicos.map(([nome, s]) => {
                const ok = s.status === 'up';
                return (
                  <Row
                    key={nome}
                    antes={
                      <span className="grid h-8 w-8 place-items-center">
                        <Icon
                          de={ok ? PiCheck : PiWarning}
                          rotulo={ok ? 'No ar' : 'Fora'}
                          className={ok ? 'text-texto-fraco' : 'text-erro'}
                        />
                      </span>
                    }
                    titulo={SERVICOS[nome] ?? nome}
                    detalhe={
                      ok
                        ? 'respondendo'
                        : ('message' in s && s.message) || 'fora do ar'
                    }
                    valor={
                      'responseTimeMs' in s && s.responseTimeMs != null
                        ? `${numero(s.responseTimeMs)} ms`
                        : undefined
                    }
                  />
                );
              })}
            </Row.Lista>
          )}
        </Secao>

        <Secao
          titulo="Banco"
          id="saude-banco"
          detalhe={m ? `medido ${relativo(m.measuredAt)}` : undefined}
        >
          <Numeros
            carregando={medida.loading}
            colunas={4}
            itens={[
              {
                id: 'docs',
                rotulo: 'Documentos',
                aoClicar: () => router.push('/admin/database'),
                valor: numero(m?.database.documents),
                nota: m
                  ? `${numero(m.database.collections)} coleções`
                  : undefined,
              },
              {
                id: 'dados',
                rotulo: 'Dados',
                aoClicar: () => router.push('/admin/database'),
                valor: bytes(m?.database.dataSizeBytes),
                nota: m
                  ? `${bytes(m.database.storageSizeBytes)} em disco`
                  : undefined,
              },
              {
                id: 'indices',
                rotulo: 'Índices',
                aoClicar: () => router.push('/admin/database'),
                valor: numero(m?.database.indexes),
                nota: m ? bytes(m.database.indexSizeBytes) : undefined,
              },
              {
                id: 'disco',
                rotulo: 'Disco do servidor',
                valor: disco ? porcento(disco.usedPercent, 0) : '—',
                nota: disco
                  ? `${bytes(disco.usedBytes)} de ${bytes(disco.totalBytes)}`
                  : 'o provedor não informa',
                tom: disco && disco.usedPercent >= 80 ? 'atencao' : undefined,
              },
            ]}
          />
        </Secao>
      </div>

      <Secao
        titulo="Filas de trabalho"
        id="saude-filas"
        detalhe="falhas ficam retidas por 7 dias"
      >
        <Tabela
          rotulo="Filas de trabalho"
          colunas={colunas}
          linhas={m?.queues ?? []}
          chave={(q) => q.queue}
          carregando={medida.loading}
          aoClicar={setFila}
          erro={
            medida.error ? (
              <Text papel="rotulo" tom="erro" as="p">
                {medida.error}
              </Text>
            ) : undefined
          }
        />
        <Text papel="legenda" as="p" className="medida-texto">
          Fila com trabalho esperando e zero worker está parada: as rotas
          respondem, o trabalho entra, e nada é processado — normalmente o
          contêiner do worker não subiu.
        </Text>
      </Secao>

      {m && (
        <Secao titulo="Busca textual" id="saude-busca">
          {m.search.allIndexed ? (
            <Text papel="rotulo" tom="suave" as="p">
              Todas as {numero(m.search.collections.length)} coleções buscáveis
              têm índice de texto.
            </Text>
          ) : (
            <Text papel="rotulo" tom="atencao" as="p">
              Sem índice de texto:{' '}
              {m.search.collections
                .filter((c) => !c.textIndex)
                .map((c) => c.collection)
                .join(', ')}
              . A busca nelas cai para varredura lenta — a tarefa de manutenção
              de índices resolve.
            </Text>
          )}
        </Secao>
      )}

      <Falhas fila={fila} aoFechar={() => setFila(null)} />
    </Stack>
  );
}

function Falhas({
  fila,
  aoFechar,
}: {
  fila: Fila | null;
  aoFechar: () => void;
}) {
  const q = useAdminQuery(
    adminKeys.list('saude', { falhas: fila?.queue }),
    () =>
      apiFetch<{ failures: Falha[] }>(`/admin/jobs/${fila?.queue}/failures`, {
        cache: 'no-store',
      }).then((r) => r.failures),
    { enabled: !!fila }
  );
  const lista = q.data ?? [];

  return (
    <Sheet
      aberto={!!fila}
      aoFechar={aoFechar}
      titulo={fila ? `Falhas em ${FILAS[fila.queue] ?? fila.queue}` : ''}
      descricao="As últimas, da mais recente para a mais antiga"
      largura="g"
    >
      {q.loading ? (
        <Row.Skeleton repetir={4} />
      ) : lista.length === 0 ? (
        <Text papel="rotulo" tom="suave" as="p">
          Nenhuma falha retida nesta fila.
        </Text>
      ) : (
        <ul className="flex flex-col">
          {lista.map((f, i) => (
            <li
              key={f.jobId ?? i}
              className={cx(
                'flex flex-col gap-1 border-b border-linha py-3 last:border-0'
              )}
            >
              <span className="flex items-baseline gap-3">
                <span className="t-dado flex-1 text-sm text-texto">
                  {f.job}
                </span>
                <span className="t-legenda">{dataHora(f.failedAt)}</span>
              </span>
              <span className="text-sm text-texto-suave">
                {f.failedReason ?? 'sem motivo registrado'}
              </span>
              <span className="t-legenda">
                {f.attemptsMade}{' '}
                {f.attemptsMade === 1 ? 'tentativa' : 'tentativas'}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Sheet>
  );
}
