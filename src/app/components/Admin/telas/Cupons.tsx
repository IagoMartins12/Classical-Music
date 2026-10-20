'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { PiCopy, PiPlus, PiTrash, PiWarning } from 'react-icons/pi';
import ConfirmModal from '@/app/components/ConfirmModal';
import { Badge, Chip } from '@/app/components/ui/Badge';
import { Button } from '@/app/components/ui/Button';
import { Vazio } from '@/app/components/ui/Estados';
import { Field } from '@/app/components/ui/Field';
import { Inline, Stack } from '@/app/components/ui/Layout';
import { Sheet } from '@/app/components/ui/Sheet';
import { Text } from '@/app/components/ui/Text';
import { Cabecalho } from '@/app/components/Admin/painel/Cabecalho';
import { Interruptor } from '@/app/components/Admin/painel/Campos';
import { Numeros } from '@/app/components/Admin/painel/Numeros';
import { Tabela, type Coluna } from '@/app/components/Admin/painel/Tabela';
import { HistoricoDoRegistro } from '@/app/components/Admin/painel/Trilha';
import {
  PLANOS,
  dataCurta,
  moeda,
  numero,
} from '@/app/components/Admin/painel/formatos';
import {
  adminKeys,
  useAdminMutation,
  useAdminQuery,
} from '@/app/hooks/admin/query';
import { apiFetch } from '@/app/libs/api/client';
import { syncCouponRequest } from '@/app/requests/admin/billing';

/**
 * Cupons: códigos de desconto para o checkout.
 *
 * O estado de cada cupom é o que a API calcula — ativo, ainda não começou,
 * vencido, esgotado — em vez de a tela adivinhar pelas datas. Apagar só
 * funciona para cupom nunca usado (o histórico de cobrança aponta para ele);
 * para tirar de circulação, desative.
 *
 * **O cupom existe nos dois lados.** Criar e editar espelham o cupom no
 * Stripe, e o checkout leva o espelho na sessão — antes o desconto valia só
 * na nossa conta e quem usava pagava o valor cheio. A coluna "No Stripe" diz
 * se o espelho existe; quando o Stripe recusa, o motivo fica no cupom e o
 * editor tem "Enviar ao Stripe". Teste grátis estendido não tem espelho: não
 * é desconto em dinheiro.
 */

type Tipo = 'PERCENTAGE' | 'FIXED' | 'FREE_TRIAL';

interface Cupom {
  id: string;
  code: string;
  type: Tipo;
  discountValue: number;
  maxDiscount: number | null;
  applicablePlans: string[];
  validFrom: string;
  validUntil: string;
  maxUses: number | null;
  usedCount: number;
  maxUsesPerUser: number | null;
  extraTrialDays: number | null;
  isActive: boolean;
  description: string | null;
  isExpired: boolean;
  isNotStarted: boolean;
  isExhausted: boolean;
  isUsable: boolean;
  remainingUses: number | null;
  stripeCouponId: string | null;
  stripeSyncedAt: string | null;
  stripeSyncError: string | null;
}

interface Resposta {
  coupons: Cupom[];
  stats: {
    total: number;
    active: number;
    inactive: number;
    expired: number;
    totalUsed: number;
  };
}

type Recorte = 'todos' | 'valendo' | 'inativos' | 'vencidos';

const TIPOS: Record<Tipo, string> = {
  PERCENTAGE: 'Percentual',
  FIXED: 'Valor fixo',
  FREE_TRIAL: 'Teste grátis estendido',
};

const desconto = (
  c: Pick<Cupom, 'type' | 'discountValue' | 'maxDiscount' | 'extraTrialDays'>
) =>
  c.type === 'PERCENTAGE'
    ? `${c.discountValue}%${c.maxDiscount ? ` (até ${moeda(c.maxDiscount, 0)})` : ''}`
    : c.type === 'FIXED'
      ? moeda(c.discountValue)
      : `+${c.extraTrialDays ?? c.discountValue} dias de teste`;

function Estado({ c }: { c: Cupom }) {
  if (c.isUsable) return <span className="text-sm">Valendo</span>;
  if (!c.isActive) return <Badge>Desativado</Badge>;
  if (c.isExpired) return <Badge>Vencido</Badge>;
  if (c.isExhausted) return <Badge estado="atencao">Esgotado</Badge>;
  if (c.isNotStarted)
    return <Badge estado="ouro">Começa em {dataCurta(c.validFrom)}</Badge>;
  return <Badge>—</Badge>;
}

/** O espelho do cupom no Stripe, em uma palavra. */
function NoStripe({ c }: { c: Cupom }) {
  if (c.type === 'FREE_TRIAL') {
    return <span className="t-legenda">não se aplica</span>;
  }
  if (c.stripeCouponId) return <span className="text-sm">sim</span>;
  // Sem espelho e sem erro: cupom de antes da sincronização. O checkout cria
  // o espelho na hora do uso.
  if (!c.stripeSyncError)
    return <span className="t-legenda">no primeiro uso</span>;
  return (
    <Badge estado="atencao" icone={PiWarning}>
      Não chegou
    </Badge>
  );
}

const TOCA = ['receita', 'auditoria'];

export default function Cupons() {
  const q = useAdminQuery(adminKeys.list('receita', 'cupons'), () =>
    apiFetch<Resposta>('/admin/coupons', {
      query: { limit: 100 },
      cache: 'no-store',
    })
  );
  const alternar = useAdminMutation(
    (id: string) =>
      apiFetch(`/admin/coupons/${id}/toggle`, { method: 'PATCH' }),
    TOCA
  );
  const [recorte, setRecorte] = useState<Recorte>('todos');
  const [aberto, setAberto] = useState<Cupom | 'novo' | null>(null);

  const s = q.data?.stats;
  const cupons = (q.data?.coupons ?? []).filter((c) =>
    recorte === 'valendo'
      ? c.isUsable
      : recorte === 'inativos'
        ? !c.isActive
        : recorte === 'vencidos'
          ? c.isExpired || c.isExhausted
          : true
  );

  const colunas: Coluna<Cupom>[] = [
    {
      id: 'codigo',
      titulo: 'Código',
      principal: true,
      celula: (c) => (
        <span className="flex min-w-0 flex-col">
          <span className="t-dado text-[0.9375rem] text-texto">{c.code}</span>
          {c.description && (
            <span className="t-legenda truncate">{c.description}</span>
          )}
        </span>
      ),
    },
    {
      id: 'desconto',
      titulo: 'Desconto',
      celula: (c) => <span className="text-sm">{desconto(c)}</span>,
    },
    {
      id: 'planos',
      titulo: 'Planos',
      soNoComputador: true,
      celula: (c) => (
        <span className="text-sm">
          {c.applicablePlans.length
            ? c.applicablePlans.map((p) => PLANOS[p] ?? p).join(', ')
            : 'todos'}
        </span>
      ),
    },
    {
      id: 'usos',
      titulo: 'Usos',
      alinhar: 'fim',
      celula: (c) =>
        `${numero(c.usedCount)}${c.maxUses !== null ? ` / ${numero(c.maxUses)}` : ''}`,
    },
    {
      id: 'validade',
      titulo: 'Vale até',
      soNoComputador: true,
      celula: (c) => (
        <span className="t-dado text-sm">{dataCurta(c.validUntil)}</span>
      ),
    },
    { id: 'estado', titulo: 'Estado', celula: (c) => <Estado c={c} /> },
    {
      id: 'stripe',
      titulo: 'No Stripe',
      soNoComputador: true,
      celula: (c) => <NoStripe c={c} />,
    },
  ];

  return (
    <Stack gap={6}>
      <Cabecalho
        titulo="Cupons"
        descricao="Códigos de desconto do checkout"
        acoes={
          <Button
            tamanho="p"
            variante="primario"
            icone={PiPlus}
            onClick={() => setAberto('novo')}
          >
            Novo cupom
          </Button>
        }
      />

      <Numeros
        carregando={q.loading}
        itens={[
          {
            id: 'ativos',
            rotulo: 'Ativos',
            valor: numero(s?.active),
            aoClicar: () => setRecorte('valendo'),
          },
          {
            id: 'inativos',
            rotulo: 'Desativados',
            valor: numero(s?.inactive),
            aoClicar: () => setRecorte('inativos'),
          },
          {
            id: 'vencidos',
            rotulo: 'Vencidos',
            valor: numero(s?.expired),
            aoClicar: () => setRecorte('vencidos'),
          },
          {
            id: 'usos',
            rotulo: 'Usos somados',
            valor: numero(s?.totalUsed),
            aoClicar: () => setRecorte('todos'),
          },
        ]}
      />

      <div className="flex flex-wrap gap-2">
        <Chip
          selecionado={recorte === 'todos'}
          onClick={() => setRecorte('todos')}
        >
          Todos
        </Chip>
        <Chip
          selecionado={recorte === 'valendo'}
          onClick={() => setRecorte('valendo')}
        >
          Valendo agora
        </Chip>
        <Chip
          selecionado={recorte === 'inativos'}
          onClick={() => setRecorte('inativos')}
        >
          Desativados
        </Chip>
        <Chip
          selecionado={recorte === 'vencidos'}
          onClick={() => setRecorte('vencidos')}
        >
          Vencidos ou esgotados
        </Chip>
      </div>

      <Tabela
        rotulo="Cupons"
        colunas={colunas}
        linhas={cupons}
        chave={(c) => c.id}
        carregando={q.loading}
        aoClicar={setAberto}
        erro={
          q.error ? (
            <Text papel="rotulo" tom="erro" as="p">
              {q.error}
            </Text>
          ) : undefined
        }
        vazio={
          <Vazio
            titulo="Nenhum cupom aqui"
            descricao="Crie um código para uma campanha ou parceria."
          />
        }
      />

      <EditorCupom
        cupom={aberto}
        aoFechar={() => setAberto(null)}
        aoAlternar={async (c) => {
          try {
            await alternar.mutateAsync([c.id]);
            toast.success(c.isActive ? 'Cupom desativado.' : 'Cupom ativado.');
            setAberto(null);
          } catch (e) {
            toast.error(
              e instanceof Error ? e.message : 'Não foi possível mudar.'
            );
          }
        }}
      />
    </Stack>
  );
}

interface Formulario {
  code: string;
  type: Tipo;
  discountValue: string;
  maxDiscount: string;
  applicablePlans: string[];
  validFrom: string;
  validUntil: string;
  maxUses: string;
  maxUsesPerUser: string;
  extraTrialDays: string;
  description: string;
  isActive: boolean;
}

const hoje = () => new Date().toISOString().slice(0, 10);
const daquiA = (dias: number) =>
  new Date(Date.now() + dias * 86_400_000).toISOString().slice(0, 10);

function EditorCupom({
  cupom,
  aoFechar,
  aoAlternar,
}: {
  cupom: Cupom | 'novo' | null;
  aoFechar: () => void;
  aoAlternar: (c: Cupom) => void;
}) {
  const novo = cupom === 'novo';
  const atual = cupom && cupom !== 'novo' ? cupom : null;
  const [f, setF] = useState<Formulario | null>(null);
  const [apagando, setApagando] = useState(false);

  const salvar = useAdminMutation(
    (corpo: Record<string, unknown>) =>
      atual
        ? apiFetch(`/admin/coupons/${atual.id}`, {
            method: 'PATCH',
            body: corpo,
          })
        : apiFetch('/admin/coupons', { method: 'POST', body: corpo }),
    TOCA
  );
  const apagar = useAdminMutation(
    (id: string) => apiFetch(`/admin/coupons/${id}`, { method: 'DELETE' }),
    TOCA
  );
  const sincronizar = useAdminMutation(
    (id: string) => syncCouponRequest(id),
    TOCA
  );
  const mandarAoStripe = async () => {
    if (!atual) return;
    try {
      const r = await sincronizar.mutateAsync([atual.id]);
      if (r.stripeSyncError) {
        toast.error(`O Stripe recusou: ${r.stripeSyncError}`);
      } else {
        toast.success('Cupom no Stripe.');
        aoFechar();
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Não foi possível enviar.');
    }
  };

  useEffect(() => {
    if (!cupom) return setF(null);
    setF({
      code: atual?.code ?? '',
      type: atual?.type ?? 'PERCENTAGE',
      discountValue: atual ? String(atual.discountValue) : '10',
      maxDiscount: atual?.maxDiscount != null ? String(atual.maxDiscount) : '',
      applicablePlans: atual?.applicablePlans ?? [],
      validFrom: atual ? atual.validFrom.slice(0, 10) : hoje(),
      validUntil: atual ? atual.validUntil.slice(0, 10) : daquiA(30),
      maxUses: atual?.maxUses != null ? String(atual.maxUses) : '',
      maxUsesPerUser:
        atual?.maxUsesPerUser != null ? String(atual.maxUsesPerUser) : '1',
      extraTrialDays:
        atual?.extraTrialDays != null ? String(atual.extraTrialDays) : '',
      description: atual?.description ?? '',
      isActive: atual?.isActive ?? true,
    });
  }, [cupom]);

  if (!cupom || !f)
    return (
      <Sheet aberto={false} aoFechar={aoFechar} titulo="">
        {null}
      </Sheet>
    );

  const n = (v: string) =>
    v.trim() === '' ? undefined : Number(v.replace(',', '.'));
  const codigoOk =
    !novo || /^[A-Z0-9][A-Z0-9_-]{2,31}$/.test(f.code.trim().toUpperCase());
  const datasOk = f.validFrom <= f.validUntil;
  const valorOk =
    f.type === 'FREE_TRIAL'
      ? (n(f.extraTrialDays) ?? 0) > 0
      : (n(f.discountValue) ?? 0) > 0 &&
        (f.type !== 'PERCENTAGE' || (n(f.discountValue) ?? 0) <= 100);

  const corpo = () => ({
    ...(novo ? { code: f.code.trim().toUpperCase() } : {}),
    type: f.type,
    discountValue: f.type === 'FREE_TRIAL' ? 0 : n(f.discountValue),
    maxDiscount: f.type === 'PERCENTAGE' ? n(f.maxDiscount) : undefined,
    applicablePlans: f.applicablePlans,
    validFrom: new Date(`${f.validFrom}T00:00:00-03:00`).toISOString(),
    validUntil: new Date(`${f.validUntil}T23:59:59-03:00`).toISOString(),
    maxUses: f.maxUses.trim() === '' ? null : n(f.maxUses),
    maxUsesPerUser: n(f.maxUsesPerUser),
    extraTrialDays: f.type === 'FREE_TRIAL' ? n(f.extraTrialDays) : undefined,
    description: f.description.trim() || undefined,
    ...(novo ? { isActive: f.isActive } : {}),
  });

  const enviar = async () => {
    try {
      const salvo = (await salvar.mutateAsync([corpo()])) as Cupom;
      if (salvo?.stripeSyncError) {
        toast.error(
          `Cupom salvo, mas não chegou ao Stripe: ${salvo.stripeSyncError}`
        );
      } else {
        toast.success(novo ? 'Cupom criado.' : 'Cupom salvo.');
      }
      aoFechar();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Não foi possível salvar.');
    }
  };

  const campo = (k: keyof Formulario) => ({
    value: f[k] as string,
    onChange: (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => setF({ ...f, [k]: e.target.value }),
  });

  return (
    <>
      <Sheet
        aberto
        aoFechar={aoFechar}
        titulo={novo ? 'Novo cupom' : atual!.code}
        descricao={
          atual
            ? `${numero(atual.usedCount)} usos${atual.remainingUses !== null ? ` · restam ${numero(atual.remainingUses)}` : ''}`
            : undefined
        }
        largura="m"
        rodape={
          <>
            {atual && (
              <>
                <Button
                  tamanho="p"
                  variante="perigo"
                  icone={PiTrash}
                  disabled={atual.usedCount > 0}
                  title={
                    atual.usedCount > 0
                      ? 'Cupom já usado: desative em vez de apagar'
                      : undefined
                  }
                  onClick={() => setApagando(true)}
                  className="mr-auto"
                >
                  Apagar
                </Button>
                <Button tamanho="p" onClick={() => aoAlternar(atual)}>
                  {atual.isActive ? 'Desativar' : 'Ativar'}
                </Button>
              </>
            )}
            <Button
              tamanho="p"
              variante="primario"
              onClick={enviar}
              carregando={salvar.isPending}
              disabled={!codigoOk || !datasOk || !valorOk}
            >
              Salvar
            </Button>
          </>
        }
      >
        <Stack gap={4}>
          {novo ? (
            <Field
              label="Código"
              ajuda="De 3 a 32 letras, números, hífen ou sublinhado. Não muda depois."
              erro={
                f.code && !codigoOk
                  ? 'Use só letras sem acento, números, - e _.'
                  : undefined
              }
              value={f.code}
              onChange={(e) =>
                setF({ ...f, code: e.target.value.toUpperCase() })
              }
              classeCampo="t-dado"
            />
          ) : (
            <Inline gap={2}>
              <code className="t-dado flex-1 rounded-controle bg-sup-2 px-3 py-2">
                {atual!.code}
              </code>
              <Button
                tamanho="p"
                icone={PiCopy}
                rotulo="Copiar código"
                onClick={() => {
                  void navigator.clipboard.writeText(atual!.code);
                  toast.success('Código copiado.');
                }}
              />
            </Inline>
          )}
          <Field.Selecao label="Tipo" {...campo('type')}>
            {Object.entries(TIPOS).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </Field.Selecao>
          {f.type === 'FREE_TRIAL' ? (
            <Field
              label="Dias a mais de teste"
              inputMode="numeric"
              {...campo('extraTrialDays')}
            />
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <Field
                label={
                  f.type === 'PERCENTAGE' ? 'Desconto (%)' : 'Desconto (R$)'
                }
                inputMode="decimal"
                {...campo('discountValue')}
              />
              {f.type === 'PERCENTAGE' && (
                <Field
                  label="Teto (R$)"
                  ajuda="Opcional"
                  inputMode="decimal"
                  {...campo('maxDiscount')}
                />
              )}
            </div>
          )}
          <fieldset className="flex flex-col gap-2">
            <legend className="t-rotulo mb-1 font-medium text-texto">
              Vale para
            </legend>
            <div className="flex flex-wrap gap-2">
              {['PLUS', 'MENTOR', 'MAESTRO'].map((p) => (
                <Chip
                  key={p}
                  selecionado={f.applicablePlans.includes(p)}
                  onClick={() =>
                    setF({
                      ...f,
                      applicablePlans: f.applicablePlans.includes(p)
                        ? f.applicablePlans.filter((x) => x !== p)
                        : [...f.applicablePlans, p],
                    })
                  }
                >
                  {PLANOS[p]}
                </Chip>
              ))}
            </div>
            <span className="t-legenda">
              {f.applicablePlans.length
                ? ''
                : 'Nenhum marcado: vale para todos.'}
            </span>
          </fieldset>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Vale de" type="date" {...campo('validFrom')} />
            <Field
              label="Até"
              type="date"
              erro={datasOk ? undefined : 'Termina antes de começar.'}
              {...campo('validUntil')}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Usos no total"
              ajuda="Em branco: sem limite"
              inputMode="numeric"
              {...campo('maxUses')}
            />
            <Field
              label="Por pessoa"
              inputMode="numeric"
              {...campo('maxUsesPerUser')}
            />
          </div>
          <Field
            label="Para que é"
            ajuda="Só no painel"
            {...campo('description')}
          />
          {novo && (
            <Interruptor
              rotulo="Já ativo"
              ajuda="Desmarque para criar e ligar depois."
              ligado={f.isActive}
              aoMudar={(v) => setF({ ...f, isActive: v })}
            />
          )}
          {atual && atual.type !== 'FREE_TRIAL' && (
            <Stack gap={2}>
              <Text papel="secao" as="h3">
                No Stripe
              </Text>
              <Text papel="rotulo" tom="suave" as="p">
                {atual.stripeCouponId
                  ? `O checkout aplica este cupom (${atual.stripeCouponId})${atual.stripeSyncedAt ? `, enviado em ${dataCurta(atual.stripeSyncedAt)}` : ''}. Mudar desconto, validade ou limite troca o cupom de lá por outro.`
                  : atual.stripeSyncError
                    ? `Não chegou ao Stripe: ${atual.stripeSyncError}`
                    : 'Criado antes da sincronização. O checkout cria o cupom no Stripe no primeiro uso; dá para enviar já.'}
              </Text>
              <Button
                tamanho="p"
                className="self-start"
                onClick={mandarAoStripe}
                carregando={sincronizar.isPending}
              >
                {atual.stripeCouponId
                  ? 'Refazer no Stripe'
                  : 'Enviar ao Stripe'}
              </Button>
            </Stack>
          )}
          {atual && (
            <Stack gap={2}>
              <Text papel="secao" as="h3">
                No painel
              </Text>
              <HistoricoDoRegistro entityId={atual.id} />
            </Stack>
          )}
        </Stack>
      </Sheet>

      <ConfirmModal
        isOpen={apagando}
        onClose={() => setApagando(false)}
        onConfirm={async () => {
          if (!atual) return;
          try {
            await apagar.mutateAsync([atual.id]);
            toast.success('Cupom apagado.');
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
        title={`Apagar ${atual?.code ?? 'o cupom'}?`}
        message="Ele nunca foi usado, então nada no histórico de cobrança aponta para ele."
        confirmText="Apagar"
        cancelText="Voltar"
        isLoading={apagar.isPending}
      />
    </>
  );
}
