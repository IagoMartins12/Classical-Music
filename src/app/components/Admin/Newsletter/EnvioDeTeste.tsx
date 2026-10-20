'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  PiCheckCircle,
  PiPaperPlaneRight,
  PiWarningCircle,
} from 'react-icons/pi';
import { Button } from '@/app/components/ui/Button';
import { Field } from '@/app/components/ui/Field';
import { Icon } from '@/app/components/ui/Icon';
import { Stack } from '@/app/components/ui/Layout';
import { Row } from '@/app/components/ui/Row';
import { Sheet } from '@/app/components/ui/Sheet';
import { Text } from '@/app/components/ui/Text';
import { apiFetch } from '@/app/libs/api/client';
import {
  listTestListsRequest,
  type ApiTestList,
} from '@/app/requests/admin/newsletter';

/**
 * Enviar uma campanha de teste antes do envio de verdade.
 *
 * Escolhem-se listas de teste (ou um e-mail avulso), e cada endereço aparece
 * com o resultado à medida que é enviado. O modal antigo pedia "variáveis
 * personalizadas" e um "modo de envio" que a API nunca recebeu — ela só
 * aceita o destinatário —, e mostrava o resultado só no fim, em números.
 */

type Resultado = { para: string; ok: boolean; erro?: string };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function EnvioDeTeste({
  campanha,
  aoFechar,
  aoEnviar,
}: {
  campanha: { id: string; name: string; subject?: string };
  aoFechar: () => void;
  aoEnviar?: () => void;
}) {
  const [listas, setListas] = useState<ApiTestList[] | null>(null);
  const [marcadas, setMarcadas] = useState<string[]>([]);
  const [avulso, setAvulso] = useState('');
  const [resultados, setResultados] = useState<Resultado[]>([]);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    listTestListsRequest()
      .then((l) => {
        const ativas = l.filter((x) => x.isActive);
        setListas(ativas);
        if (ativas.length === 1) setMarcadas([ativas[0].id]);
      })
      .catch(() => setListas([]));
  }, []);

  const destinatarios = useMemo(() => {
    const daLista = (listas ?? [])
      .filter((l) => marcadas.includes(l.id))
      .flatMap((l) => l.emails);
    const extra = avulso
      .split(/[,\s]+/)
      .map((e) => e.trim())
      .filter((e) => EMAIL.test(e));
    return [...new Set([...daLista, ...extra])];
  }, [listas, marcadas, avulso]);

  const enviar = async () => {
    setEnviando(true);
    setResultados([]);
    for (const para of destinatarios) {
      try {
        await apiFetch(`/admin/newsletter/campaigns/${campanha.id}/test`, {
          method: 'POST',
          body: { to: para },
        });
        setResultados((r) => [...r, { para, ok: true }]);
      } catch (e) {
        setResultados((r) => [
          ...r,
          { para, ok: false, erro: e instanceof Error ? e.message : 'falhou' },
        ]);
      }
    }
    setEnviando(false);
    aoEnviar?.();
  };

  const feitos = resultados.length;
  const falhas = resultados.filter((r) => !r.ok).length;

  return (
    <Sheet
      aberto
      aoFechar={aoFechar}
      titulo="Enviar teste"
      descricao={`${campanha.name}${campanha.subject ? ` · “${campanha.subject}”` : ''}`}
      largura="m"
      rodape={
        <>
          <Button tamanho="p" variante="fantasma" onClick={aoFechar}>
            {feitos && !enviando ? 'Fechar' : 'Cancelar'}
          </Button>
          <Button
            tamanho="p"
            variante="primario"
            icone={PiPaperPlaneRight}
            onClick={enviar}
            carregando={enviando}
            disabled={destinatarios.length === 0}
          >
            {destinatarios.length
              ? `Enviar para ${destinatarios.length}`
              : 'Enviar'}
          </Button>
        </>
      }
    >
      <Stack gap={6}>
        <Stack gap={2}>
          <Text papel="rotulo" as="h3" className="font-medium">
            Listas de teste
          </Text>
          {listas === null ? (
            <Row.Skeleton repetir={2} />
          ) : listas.length === 0 ? (
            <Text papel="rotulo" tom="suave" as="p">
              Nenhuma lista de teste ativa.{' '}
              <Link
                href="/admin/newsletter/test-lists"
                className="text-ouro-texto underline-offset-4 hover:underline"
              >
                Criar uma
              </Link>
              , ou use um e-mail avulso abaixo.
            </Text>
          ) : (
            <ul className="flex flex-col divide-y divide-linha rounded-controle bg-sup-2">
              {listas.map((l) => (
                <li key={l.id}>
                  <label className="flex min-h-11 cursor-pointer items-center gap-3 px-4 py-2">
                    <input
                      type="checkbox"
                      checked={marcadas.includes(l.id)}
                      onChange={() =>
                        setMarcadas((m) =>
                          m.includes(l.id)
                            ? m.filter((x) => x !== l.id)
                            : [...m, l.id]
                        )
                      }
                      className="h-4 w-4 accent-[var(--ouro)]"
                    />
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="text-sm text-texto">{l.name}</span>
                      <span className="t-legenda truncate">
                        {l.emails.length}{' '}
                        {l.emails.length === 1 ? 'endereço' : 'endereços'} ·{' '}
                        {l.emails.slice(0, 3).join(', ')}
                        {l.emails.length > 3 ? '…' : ''}
                      </span>
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </Stack>

        <Field
          label="E-mail avulso (opcional)"
          ajuda="Um ou mais, separados por vírgula."
          placeholder="voce@exemplo.com"
          value={avulso}
          onChange={(e) => setAvulso(e.target.value)}
        />

        {(enviando || feitos > 0) && (
          <Stack gap={2} aria-live="polite">
            <Text papel="rotulo" as="h3" className="font-medium">
              {enviando
                ? `Enviando… ${feitos} de ${destinatarios.length}`
                : falhas
                  ? `${feitos - falhas} enviados, ${falhas} falharam`
                  : `${feitos} enviados`}
            </Text>
            <ul className="flex flex-col divide-y divide-linha rounded-controle bg-sup-2">
              {resultados.map((r) => (
                <li
                  key={r.para}
                  className="flex items-start gap-2 px-4 py-2 text-sm"
                >
                  <Icon
                    de={r.ok ? PiCheckCircle : PiWarningCircle}
                    tamanho="p"
                    className={
                      r.ok ? 'mt-0.5 text-texto-suave' : 'mt-0.5 text-erro'
                    }
                  />
                  <span className="flex min-w-0 flex-col">
                    <span className="t-dado break-all text-texto">
                      {r.para}
                    </span>
                    {r.erro && (
                      <span className="t-legenda text-erro">{r.erro}</span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </Stack>
        )}
      </Stack>
    </Sheet>
  );
}
