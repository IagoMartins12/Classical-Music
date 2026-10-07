'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { PiArrowSquareOut, PiPencilSimple, PiTrash } from 'react-icons/pi';
import ConfirmModal from '@/app/components/ConfirmModal';
import { Button } from '@/app/components/ui/Button';
import { Field } from '@/app/components/ui/Field';
import { Icon } from '@/app/components/ui/Icon';
import { Inline, Stack } from '@/app/components/ui/Layout';
import { Row } from '@/app/components/ui/Row';
import { SeloVerificada } from '@/app/components/ui/SeloVerificada';
import { Sheet } from '@/app/components/ui/Sheet';
import { Text } from '@/app/components/ui/Text';
import { Interruptor } from '@/app/components/Admin/painel/Campos';
import {
  Elo,
  irParaTela,
  useNavegar,
} from '@/app/components/Admin/painel/Navegador';
import { Numeros, rolarAte } from '@/app/components/Admin/painel/Numeros';
import { HistoricoDoRegistro } from '@/app/components/Admin/painel/Trilha';
import { dataCurta, numero } from '@/app/components/Admin/painel/formatos';
import {
  useApagarCompositor,
  useAtualizarCompositor,
  useDetalheCompositor,
} from '@/app/hooks/admin/useCatalogo';
import { QUALIDADES, type Compositor } from '@/app/requests/admin/catalogo';

export function FichaCompositor({
  compositor: c,
  aoFechar,
  aoEditarCadastro,
}: {
  compositor: Compositor | null;
  aoFechar: () => void;
  aoEditarCadastro: (id: string) => void;
}) {
  const [verificado, setVerificado] = useState(false);
  const [notas, setNotas] = useState('');
  const [qualidade, setQualidade] = useState('');
  const [apagando, setApagando] = useState(false);
  const atualizar = useAtualizarCompositor();
  const apagar = useApagarCompositor();
  const detalhe = useDetalheCompositor(c?.id ?? null);
  const navegar = useNavegar();
  const router = useRouter();
  const d = detalhe.data;

  useEffect(() => {
    if (c) {
      setVerificado(c.isVerified);
      setNotas(c.verificationNotes ?? '');
      setQualidade(c.dataQuality ?? '');
    }
  }, [c]);

  const dados: {
    isVerified?: boolean;
    verificationNotes?: string;
    dataQuality?: string;
  } = {};
  if (c) {
    if (verificado !== c.isVerified) dados.isVerified = verificado;
    if (notas !== (c.verificationNotes ?? '')) dados.verificationNotes = notas;
    if (qualidade && qualidade !== (c.dataQuality ?? ''))
      dados.dataQuality = qualidade;
  }
  const mudou = Object.keys(dados).length > 0;
  const retirandoSemMotivo =
    !!c && c.isVerified && !verificado && notas.trim().length < 3;

  const salvar = async () => {
    if (!c) return;
    try {
      await atualizar.mutateAsync([c.id, dados]);
      toast.success('Compositor salvo.');
      aoFechar();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Não foi possível salvar.');
    }
  };

  const remover = async () => {
    if (!c) return;
    try {
      await apagar.mutateAsync([c.id]);
      toast.success('Compositor removido.');
      setApagando(false);
      aoFechar();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Não foi possível remover.');
    }
  };

  return (
    <Sheet
      aberto={!!c}
      aoFechar={aoFechar}
      titulo={c?.name ?? ''}
      descricao={
        c
          ? [
              c.fullName !== c.name ? c.fullName : null,
              c.epochName,
              [c.birthDate, c.deathDate].filter(Boolean).join('–') || null,
              c.nationality,
            ]
              .filter(Boolean)
              .join(' · ') || undefined
          : undefined
      }
      largura="g"
      rodape={
        c && (
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
            <Button
              tamanho="p"
              icone={PiPencilSimple}
              onClick={() => aoEditarCadastro(c.id)}
            >
              Editar cadastro
            </Button>
            <Button
              tamanho="p"
              variante="primario"
              onClick={salvar}
              disabled={!mudou || retirandoSemMotivo}
              carregando={atualizar.isPending}
            >
              Salvar
            </Button>
          </>
        )
      }
    >
      {c && (
        <Stack gap={6}>
          {detalhe.loading || !d ? (
            <Row.Skeleton repetir={2} />
          ) : (
            <>
              <Numeros
                colunas={3}
                itens={[
                  {
                    id: 'obras',
                    rotulo: 'Obras',
                    aoClicar: () =>
                      irParaTela(
                        router,
                        `/admin/works?compositor=${c.id}&nome=${encodeURIComponent(c.name)}`
                      ),
                    valor: numero(d.counts.works),
                    nota: `${numero(d.counts.verifiedWorks)} verificadas`,
                  },
                  {
                    id: 'partituras',
                    rotulo: 'Partituras',
                    aoClicar: () =>
                      irParaTela(
                        router,
                        `/admin/scores?compositor=${c.id}&nome=${encodeURIComponent(c.name)}`
                      ),
                    valor: numero(d.counts.scores),
                  },
                  {
                    id: 'favoritos',
                    rotulo: 'Favoritos nas obras',
                    aoClicar: d.topWorks.length
                      ? () => rolarAte('cmp-mais-favoritadas')
                      : undefined,
                    valor: numero(d.counts.favoritos),
                    nota: `${numero(d.counts.aprendidas)} aprendidas · ${numero(d.counts.querem)} querem`,
                  },
                ]}
              />

              <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-3">
                <Info rotulo="Biografia">
                  {d.bioLength ? `${numero(d.bioLength)} caracteres` : 'falta'}
                </Info>
                <Info rotulo="Biografia em inglês">
                  {d.bioEnLength
                    ? `${numero(d.bioEnLength)} caracteres`
                    : 'falta'}
                </Info>
                <Info rotulo="Retrato">{c.portraitUrl ? 'sim' : 'falta'}</Info>
                <Info rotulo="Origem">
                  {c.isCustom ? 'comunidade' : 'importado'}
                  {d.dataSource ? ` · ${d.dataSource}` : ''}
                </Info>
                <Info rotulo="Cadastrado por">
                  {d.createdBy ? (
                    <Elo onClick={() => navegar.usuario(d.createdBy!.id)}>
                      {d.createdBy.name}
                    </Elo>
                  ) : (
                    '—'
                  )}
                </Info>
                <Info rotulo="Entrou em">{dataCurta(c.createdAt)}</Info>
                {outrosNomes(d.alternativeNames).length ? (
                  <Info rotulo="Outros nomes">
                    {outrosNomes(d.alternativeNames).slice(0, 4).join(', ')}
                  </Info>
                ) : null}
              </dl>

              {d.bio && (
                <Stack gap={1}>
                  <Text papel="legenda" as="p">
                    Começo da biografia
                  </Text>
                  <p className="line-clamp-4 text-sm text-texto-suave">
                    {d.bio}
                  </p>
                </Stack>
              )}

              {d.topWorks.length > 0 && (
                <Stack gap={2}>
                  <Text papel="secao" as="h3" id="cmp-mais-favoritadas">
                    Obras mais favoritadas
                  </Text>
                  <ul className="flex flex-col">
                    {d.topWorks.map((w) => (
                      <li
                        key={w.id}
                        className="flex items-baseline gap-3 border-b border-linha py-2 text-sm last:border-0"
                      >
                        <Elo
                          onClick={() => navegar.obra(w.id)}
                          className="min-w-0 flex-1 truncate font-display text-[1rem]"
                        >
                          {w.title}
                        </Elo>
                        <span className="t-legenda t-dado shrink-0">
                          {numero(w.favorites)} fav. · {numero(w.scores)} part.
                        </span>
                      </li>
                    ))}
                  </ul>
                </Stack>
              )}

              <Inline gap={4} quebra>
                <Link
                  href={`/composer/${c.id}`}
                  target="_blank"
                  className="t-rotulo inline-flex items-center gap-1.5 text-ouro-texto underline-offset-4 hover:underline"
                >
                  Abrir no site <Icon de={PiArrowSquareOut} tamanho="pp" />
                </Link>
                {d.wikipediaLink && (
                  <a
                    href={d.wikipediaLink}
                    target="_blank"
                    rel="noreferrer"
                    className="t-rotulo inline-flex items-center gap-1.5 text-ouro-texto underline-offset-4 hover:underline"
                  >
                    Wikipedia <Icon de={PiArrowSquareOut} tamanho="pp" />
                  </a>
                )}
                {d.permLinkImslp && (
                  <a
                    href={d.permLinkImslp}
                    target="_blank"
                    rel="noreferrer"
                    className="t-rotulo inline-flex items-center gap-1.5 text-ouro-texto underline-offset-4 hover:underline"
                  >
                    IMSLP <Icon de={PiArrowSquareOut} tamanho="pp" />
                  </a>
                )}
              </Inline>
            </>
          )}

          <Stack gap={4} className="rounded-card bg-sup-2 p-4">
            <Interruptor
              rotulo={
                <span className="inline-flex items-center gap-1.5">
                  Verificado{' '}
                  {verificado && (
                    <SeloVerificada className="h-4 w-4 text-verificado" />
                  )}
                </span>
              }
              ajuda={
                verificado
                  ? 'O selo aparece no compositor e nas obras dele.'
                  : 'Marque quando nome, datas e biografia estiverem conferidos.'
              }
              ligado={verificado}
              aoMudar={setVerificado}
            />
            <Field.Area
              label="Nota da verificação"
              ajuda={
                retirandoSemMotivo
                  ? 'Ao retirar a verificação, diga por quê (é obrigatório).'
                  : 'Fonte ou critério usado na conferência.'
              }
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              rows={3}
            />
            <Field.Selecao
              label="Qualidade dos dados"
              value={qualidade}
              onChange={(e) => setQualidade(e.target.value)}
            >
              <option value="" disabled>
                Não avaliado
              </option>
              {Object.entries(QUALIDADES).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </Field.Selecao>
          </Stack>

          <Stack gap={2}>
            <Text papel="secao" as="h3">
              No painel
            </Text>
            <HistoricoDoRegistro entityId={c.id} />
          </Stack>
        </Stack>
      )}

      {c && (
        <ConfirmModal
          isOpen={apagando}
          onClose={() => setApagando(false)}
          onConfirm={remover}
          type="danger"
          title="Remover este compositor?"
          message={`${c.name} sai do catálogo. Só é possível remover compositor sem obras — com obras, a API recusa e diz quantas.`}
          confirmText="Remover"
          cancelText="Voltar"
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

/** `alternativeNames` vem como lista, texto ("A; B") ou nulo, conforme a origem. */
function outrosNomes(v: unknown): string[] {
  if (Array.isArray(v)) return v.filter((x) => typeof x === 'string');
  if (typeof v === 'string') {
    return v
      .split(/[;,|]/)
      .map((x) => x.trim())
      .filter(Boolean);
  }
  return [];
}
