'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';
import { PiArrowRight, PiCaretRight, PiWarning } from 'react-icons/pi';
import { Badge } from '@/app/components/ui/Badge';
import { Icon } from '@/app/components/ui/Icon';
import { Stack } from '@/app/components/ui/Layout';
import { Sheet } from '@/app/components/ui/Sheet';
import { Text } from '@/app/components/ui/Text';
import { cx } from '@/app/components/ui/cx';
import type { RegistroAuditoria } from '@/app/requests/admin/painel';
import { useAuditoria } from '@/app/hooks/admin/usePainel';
import {
  NOME_ENTIDADE,
  fraseDaAcao,
  nomeDoCampo,
  nomeDoPapel,
  valorLegivel,
} from './acoes';
import { relativo } from './formatos';
import { Elo, useNavegar } from './Navegador';

const FUSO = 'America/Sao_Paulo';

/** "Chrome no Windows", a partir do user agent gravado. */
export function navegador(ua: string | null) {
  if (!ua) return '—';
  const nav = /Edg\//.test(ua)
    ? 'Edge'
    : /Chrome\//.test(ua)
      ? 'Chrome'
      : /Firefox\//.test(ua)
        ? 'Firefox'
        : /Safari\//.test(ua)
          ? 'Safari'
          : 'Outro navegador';
  const so = /Windows/.test(ua)
    ? 'Windows'
    : /Android/.test(ua)
      ? 'Android'
      : /iPhone|iPad/.test(ua)
        ? 'iOS'
        : /Mac OS/.test(ua)
          ? 'macOS'
          : /Linux/.test(ua)
            ? 'Linux'
            : null;
  return so ? `${nav} no ${so}` : nav;
}

/**
 * Uma entrada da trilha como frase: "**Iago** editou a obra *Rêverie*".
 *
 * Quem agiu em peso médio, o alvo em Garamond (nome de obra e de compositor
 * é Garamond no produto inteiro), e a falha marcada com o selo de erro — uma
 * tentativa negada é o que uma investigação procura primeiro.
 */
export function FraseDaTrilha({
  registro,
  className,
}: {
  registro: RegistroAuditoria;
  className?: string;
}) {
  const quem =
    registro.actorName ?? (registro.actorId ? 'Conta removida' : 'Sistema');
  const alvo = registro.metadata?.alvo;
  const campos = registro.metadata?.mudancas?.length ?? 0;

  return (
    <span className={cx('t-rotulo text-texto-suave', className)}>
      <span className="font-medium text-texto">{quem}</span>{' '}
      {fraseDaAcao(registro.action, registro.entityType)}
      {alvo && (
        <>
          {' '}
          <span className="font-display text-[1.0625rem] text-texto">
            {alvo}
          </span>
        </>
      )}
      {campos > 0 && (
        <span className="text-texto-fraco">
          {' '}
          ·{' '}
          {campos === 1
            ? nomeDoCampo(registro.metadata!.mudancas![0].campo)
            : `${campos} campos`}
        </span>
      )}
      {!registro.success && (
        <Badge estado="erro" icone={PiWarning} className="ml-2 align-middle">
          Falhou
        </Badge>
      )}
    </span>
  );
}

/** As mudanças de uma entrada, campo a campo: antes → depois. */
export function MudancasDaTrilha({
  registro,
}: {
  registro: RegistroAuditoria;
}) {
  const mudancas = registro.metadata?.mudancas ?? [];
  const dados = registro.metadata?.dados;

  if (mudancas.length === 0 && !dados) {
    return (
      <Text papel="rotulo" tom="suave" as="p">
        Esta ação não altera campos de um registro (ou foi gravada antes de a
        trilha guardar o que muda, em 29/09/2026).
      </Text>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {mudancas.length > 0 && (
        <dl className="flex flex-col divide-y divide-linha rounded-controle bg-sup-2">
          {mudancas.map((m) => (
            <div
              key={m.campo}
              className="grid gap-1 px-4 py-3 sm:grid-cols-[140px_minmax(0,1fr)] sm:gap-4"
            >
              <dt className="t-legenda pt-0.5">{nomeDoCampo(m.campo)}</dt>
              <dd className="flex min-w-0 flex-wrap items-center gap-2 text-sm">
                <span className="max-w-full break-words text-texto-fraco line-through decoration-texto-fraco/60">
                  {valorLegivel(m.antes)}
                </span>
                <Icon
                  de={PiArrowRight}
                  tamanho="pp"
                  className="text-texto-fraco"
                />
                <span className="max-w-full break-words text-texto">
                  {valorLegivel(m.depois)}
                </span>
              </dd>
            </div>
          ))}
        </dl>
      )}

      {dados && (
        <div className="flex flex-col gap-2">
          <Text papel="legenda" as="p">
            O que foi enviado
          </Text>
          <dl className="flex flex-col divide-y divide-linha rounded-controle bg-sup-2">
            {Object.entries(dados).map(([campo, valor]) => (
              <div
                key={campo}
                className="grid gap-1 px-4 py-2.5 sm:grid-cols-[140px_minmax(0,1fr)] sm:gap-4"
              >
                <dt className="t-legenda pt-0.5">{nomeDoCampo(campo)}</dt>
                <dd className="break-words text-sm text-texto">
                  {valorLegivel(valor)}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </div>
  );
}

/**
 * O que o painel já fez com um registro: a trilha filtrada pelo id. Mora no
 * editor de obra, compositor, partitura — quem vai mexer vê quem mexeu antes.
 */
export function HistoricoDoRegistro({ entityId }: { entityId: string }) {
  const { items, loading } = useAuditoria({ entityId }, 8);
  const [aberto, setAberto] = useState<RegistroAuditoria | null>(null);

  if (loading)
    return (
      <Text papel="legenda" as="p">
        Lendo o histórico…
      </Text>
    );
  if (items.length === 0) {
    return (
      <Text papel="rotulo" tom="suave" as="p">
        Ninguém mexeu neste registro pelo painel.
      </Text>
    );
  }

  return (
    <>
      <ul className="flex flex-col">
        {items.map((r) => (
          <li key={r.id} className="border-b border-linha last:border-0">
            <button
              type="button"
              onClick={() => setAberto(r)}
              className="-mx-2 flex min-h-11 w-[calc(100%+1rem)] items-center gap-3 rounded-controle px-2 py-2 text-left transition-colors hover:bg-[var(--interactive-hover)]"
            >
              <FraseDaTrilha
                registro={{
                  ...r,
                  metadata: r.metadata
                    ? { ...r.metadata, alvo: undefined }
                    : null,
                }}
                className="min-w-0 flex-1"
              />
              <span className="t-legenda t-dado shrink-0">
                {relativo(r.createdAt)}
              </span>
              <Icon
                de={PiCaretRight}
                tamanho="pp"
                className="shrink-0 text-texto-fraco"
              />
            </button>
          </li>
        ))}
      </ul>
      <EventoDaTrilha registro={aberto} aoFechar={() => setAberto(null)} />
    </>
  );
}

/**
 * Um evento da trilha por inteiro: o que mudou campo a campo, quem, de onde,
 * com que navegador e o código da ação. Abre da Auditoria e de todo "No
 * painel" dos editores; quem abre pode pôr ações no pé (`acoes`).
 */
export function EventoDaTrilha({
  registro: r,
  aoFechar,
  acoes,
}: {
  registro: RegistroAuditoria | null;
  aoFechar: () => void;
  acoes?: ReactNode;
}) {
  const navegar = useNavegar();
  // O registro do evento, aberto no painel quando é de um tipo com ficha.
  const abrir = (x: RegistroAuditoria): (() => void) | null => {
    const id = x.entityId;
    if (!id) return null;
    if (x.entityType === 'user') return () => navegar.usuario(id);
    if (x.entityType === 'composer') return () => navegar.compositor(id);
    if (x.entityType === 'work') return () => navegar.obra(id);
    if (x.entityType === 'workScore' || x.entityType === 'score') {
      return () => navegar.partitura(id);
    }
    return null;
  };
  return (
    <Sheet
      aberto={!!r}
      aoFechar={aoFechar}
      titulo={
        r
          ? `${r.actorName ?? (r.actorId ? 'Conta removida' : 'Sistema')} ${fraseDaAcao(r.action, r.entityType)}`
          : ''
      }
      descricao={
        r
          ? new Date(r.createdAt).toLocaleString('pt-BR', {
              dateStyle: 'full',
              timeStyle: 'medium',
              timeZone: FUSO,
            })
          : undefined
      }
      largura="g"
    >
      {r && (
        <Stack gap={6}>
          {!r.success && (
            <div
              role="alert"
              className="rounded-controle border border-erro/35 bg-erro/10 px-4 py-3 text-sm text-erro"
            >
              A ação foi tentada e falhou
              {r.metadata?.mensagem
                ? `: ${String(r.metadata.mensagem)}`
                : r.metadata?.error
                  ? ` (${String(r.metadata.error)})`
                  : '.'}
            </div>
          )}

          <Stack gap={2}>
            <Text papel="secao" as="h3">
              O que mudou
            </Text>
            <MudancasDaTrilha registro={r} />
          </Stack>

          <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
            <Dado rotulo="Quem">
              {r.actorId && r.actorName ? (
                <Elo onClick={() => navegar.usuario(r.actorId!)}>
                  {r.actorName}
                </Elo>
              ) : (
                (r.actorName ?? (r.actorId ? 'Conta removida' : 'Sistema'))
              )}
              {nomeDoPapel(r.actorRole) ? (
                <span className="text-texto-fraco">
                  {' '}
                  · {nomeDoPapel(r.actorRole)}
                </span>
              ) : null}
            </Dado>
            <Dado rotulo="Registro">
              {abrir(r) ? (
                <Elo onClick={abrir(r)!}>{r.metadata?.alvo ?? 'abrir'}</Elo>
              ) : (
                (r.metadata?.alvo ?? '—')
              )}
              {r.entityType && (
                <span className="text-texto-fraco">
                  {' '}
                  · {NOME_ENTIDADE[r.entityType] ?? r.entityType}
                </span>
              )}
            </Dado>
            <Dado rotulo="Código da ação" dado>
              {r.action}
            </Dado>
            <Dado rotulo="Id do registro" dado>
              {r.entityId ?? '—'}
            </Dado>
            <Dado rotulo="Rede de origem" dado>
              {r.ipAddress ?? '—'}
            </Dado>
            <Dado rotulo="Navegador">{navegador(r.userAgent)}</Dado>
            {r.requestId && (
              <Dado rotulo="Requisição" dado>
                {r.requestId}
              </Dado>
            )}
          </dl>

          {acoes}
        </Stack>
      )}
    </Sheet>
  );
}

function Dado({
  rotulo,
  children,
  dado = false,
}: {
  rotulo: string;
  children: ReactNode;
  dado?: boolean;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <dt className="t-legenda">{rotulo}</dt>
      <dd
        className={
          dado ? 't-dado break-all text-sm text-texto' : 'text-sm text-texto'
        }
      >
        {children}
      </dd>
    </div>
  );
}
