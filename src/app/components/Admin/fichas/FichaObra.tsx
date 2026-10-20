'use client';

import { Elo, useNavegar } from '@/app/components/Admin/painel/Navegador';

import { useEffect, useState } from 'react';
import Link from 'next/link';
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

import { Numeros, rolarAte } from '@/app/components/Admin/painel/Numeros';

import { HistoricoDoRegistro } from '@/app/components/Admin/painel/Trilha';
import { dataCurta, numero } from '@/app/components/Admin/painel/formatos';
import {
  useApagarObra,
  useAtualizarObra,
  useDetalheObra,
} from '@/app/hooks/admin/useCatalogo';
import {
  TIPOS_DE_OBRA,
  TIPOS_DE_PARTITURA,
  type EdicaoObra,
  type Obra,
} from '@/app/requests/admin/catalogo';

const DIFICULDADES = Array.from({ length: 12 }, (_, i) => String(i + 1));

export function FichaObra({
  obra,
  aoFechar,
  aoEditarCadastro,
}: {
  obra: Obra | null;
  aoFechar: () => void;
  aoEditarCadastro: (id: string) => void;
}) {
  const [form, setForm] = useState<EdicaoObra>({});
  const [apagando, setApagando] = useState(false);
  const atualizar = useAtualizarObra();
  const apagar = useApagarObra();
  const detalhe = useDetalheObra(obra?.id ?? null);
  const d = detalhe.data;
  const navegar = useNavegar();

  useEffect(() => {
    if (obra) {
      setForm({
        title: obra.title,
        workType: obra.workType,
        difficultyLevel: obra.difficultyLevel,
        instrumentation: obra.instrumentation ?? '',
        videoUrl: obra.videoUrl ?? '',
        isVerified: obra.isVerified,
      });
    }
  }, [obra]);

  if (!obra)
    return (
      <Sheet aberto={false} aoFechar={aoFechar} titulo="">
        {null}
      </Sheet>
    );

  // Só o que mudou vai para a API — e para a trilha.
  const mudancas: EdicaoObra = {};
  if (form.title !== obra.title) mudancas.title = form.title;
  if (form.workType !== obra.workType) mudancas.workType = form.workType;
  if ((form.difficultyLevel ?? null) !== (obra.difficultyLevel ?? null))
    mudancas.difficultyLevel = form.difficultyLevel || null;
  if ((form.instrumentation ?? '') !== (obra.instrumentation ?? ''))
    mudancas.instrumentation = form.instrumentation;
  if ((form.videoUrl ?? '') !== (obra.videoUrl ?? ''))
    mudancas.videoUrl = form.videoUrl || null;
  if (form.isVerified !== obra.isVerified)
    mudancas.isVerified = form.isVerified;
  const mudou = Object.keys(mudancas).length > 0;

  const salvar = async () => {
    try {
      await atualizar.mutateAsync([obra.id, mudancas]);
      toast.success('Obra salva.');
      aoFechar();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Não foi possível salvar.');
    }
  };

  const remover = async () => {
    try {
      await apagar.mutateAsync([obra.id]);
      toast.success('Obra removida.');
      setApagando(false);
      aoFechar();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Não foi possível remover.');
    }
  };

  return (
    <>
      <Sheet
        aberto={!!obra}
        aoFechar={aoFechar}
        titulo={obra.title}
        descricao={[obra.composer?.name, obra.opOrCatalog, obra.epoch?.name]
          .filter(Boolean)
          .join(' · ')}
        largura="g"
        rodape={
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
              onClick={() => aoEditarCadastro(obra.id)}
            >
              Editar cadastro
            </Button>
            <Button
              tamanho="p"
              variante="primario"
              onClick={salvar}
              disabled={!mudou}
              carregando={atualizar.isPending}
            >
              Salvar
            </Button>
          </>
        }
      >
        <Stack gap={6}>
          {detalhe.loading || !d ? (
            <Row.Skeleton repetir={2} />
          ) : (
            <>
              <Numeros
                colunas={3}
                itens={[
                  {
                    id: 'fav',
                    rotulo: 'Favoritos',
                    valor: numero(d.counts.favorites),
                    aoClicar: d.counts.favorites
                      ? () =>
                          navegar.pessoasDaObra(
                            obra.id,
                            obra.title,
                            'favoritos'
                          )
                      : undefined,
                  },
                  {
                    id: 'querem',
                    rotulo: 'Querem aprender',
                    valor: numero(d.counts.wantToLearn),
                    aoClicar: d.counts.wantToLearn
                      ? () =>
                          navegar.pessoasDaObra(
                            obra.id,
                            obra.title,
                            'quero-aprender'
                          )
                      : undefined,
                  },
                  {
                    id: 'aprenderam',
                    rotulo: 'Aprenderam',
                    valor: numero(d.counts.learned),
                    aoClicar: d.counts.learned
                      ? () =>
                          navegar.pessoasDaObra(
                            obra.id,
                            obra.title,
                            'aprendidas'
                          )
                      : undefined,
                  },
                  {
                    id: 'partituras',
                    rotulo: 'Partituras',
                    aoClicar: d.scores.length
                      ? () => rolarAte('obra-partituras')
                      : undefined,
                    valor: numero(d.counts.scores),
                  },
                  {
                    id: 'anotacoes',
                    rotulo: 'Anotações',
                    valor: numero(d.counts.annotations),
                  },
                ]}
              />
              <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-3">
                <Info rotulo="Instrumento">{obra.instrument?.name ?? '—'}</Info>
                <Info rotulo="Composta em">{d.compositionYear ?? '—'}</Info>
                <Info rotulo="Origem">
                  {obra.isCustom ? 'comunidade' : 'importada'}
                </Info>
                <Info rotulo="Compositor">
                  {obra.composer ? (
                    <Elo onClick={() => navegar.compositor(obra.composer!.id)}>
                      {obra.composer.name}
                    </Elo>
                  ) : (
                    '—'
                  )}
                </Info>
                <Info rotulo="Cadastrada por">
                  {d.createdBy ? (
                    <Elo onClick={() => navegar.usuario(d.createdBy!.id)}>
                      {d.createdBy.name}
                    </Elo>
                  ) : (
                    '—'
                  )}
                </Info>
                <Info rotulo="Entrou em">{dataCurta(obra.createdAt)}</Info>
                <Info rotulo="Verificada">
                  {obra.isVerified && obra.verifiedAt
                    ? `desde ${dataCurta(obra.verifiedAt)}`
                    : 'não'}
                </Info>
              </dl>
              {d.scores.length > 0 && (
                <Stack gap={2}>
                  <Text papel="secao" as="h3" id="obra-partituras">
                    Partituras
                  </Text>
                  <ul className="flex flex-col">
                    {d.scores.map((p) => (
                      <li
                        key={p.id}
                        className="flex items-baseline gap-3 border-b border-linha py-2 text-sm last:border-0"
                      >
                        <Elo
                          onClick={() => navegar.partitura(p.id)}
                          className="min-w-0 flex-1 truncate"
                        >
                          {p.title}
                        </Elo>
                        <span className="t-legenda shrink-0">
                          {TIPOS_DE_PARTITURA[p.type] ?? p.type}
                          {!p.isActive && ' · desativada'}
                        </span>
                        {p.downloadUrl && (
                          <a
                            href={p.downloadUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="t-rotulo shrink-0 text-ouro-texto underline-offset-4 hover:underline"
                          >
                            Abrir
                          </a>
                        )}
                      </li>
                    ))}
                  </ul>
                </Stack>
              )}
              <Inline gap={4} quebra>
                <Link
                  href={`/works/${obra.id}`}
                  target="_blank"
                  className="t-rotulo inline-flex items-center gap-1.5 text-ouro-texto underline-offset-4 hover:underline"
                >
                  Abrir no site <Icon de={PiArrowSquareOut} tamanho="pp" />
                </Link>
                {d.imslpPermlink && (
                  <a
                    href={d.imslpPermlink}
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

          <Interruptor
            rotulo={
              <span className="inline-flex items-center gap-1.5">
                Verificada{' '}
                {form.isVerified && (
                  <SeloVerificada className="h-4 w-4 text-verificado" />
                )}
              </span>
            }
            ajuda={
              form.isVerified
                ? 'O selo aparece na obra, e ela sobe nas buscas.'
                : 'Marque quando título, compositor e catálogo estiverem conferidos.'
            }
            ligado={!!form.isVerified}
            aoMudar={(v) => setForm((f) => ({ ...f, isVerified: v }))}
          />
          <Field
            label="Título"
            value={form.title ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field.Selecao
              label="Tipo"
              value={form.workType ?? ''}
              onChange={(e) =>
                setForm((f) => ({ ...f, workType: e.target.value }))
              }
            >
              {Object.entries(TIPOS_DE_OBRA).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </Field.Selecao>
            <Field.Selecao
              label="Dificuldade"
              ajuda="Escala do IMSLP, de 1 a 12."
              value={form.difficultyLevel ?? ''}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  difficultyLevel: e.target.value || null,
                }))
              }
            >
              <option value="">Sem nível</option>
              {DIFICULDADES.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </Field.Selecao>
          </div>
          <Field
            label="Instrumentação"
            value={form.instrumentation ?? ''}
            onChange={(e) =>
              setForm((f) => ({ ...f, instrumentation: e.target.value }))
            }
          />
          <Field
            label="Vídeo"
            type="url"
            placeholder="https://www.youtube.com/…"
            value={form.videoUrl ?? ''}
            onChange={(e) =>
              setForm((f) => ({ ...f, videoUrl: e.target.value }))
            }
          />

          <Stack gap={2}>
            <Text papel="secao" as="h3">
              No painel
            </Text>
            <HistoricoDoRegistro entityId={obra.id} />
          </Stack>
        </Stack>
      </Sheet>

      <ConfirmModal
        isOpen={apagando}
        onClose={() => setApagando(false)}
        onConfirm={remover}
        type="danger"
        title="Remover esta obra?"
        message={`“${obra.title}” sai do catálogo. Obras com partituras, anotações ou favoritos de alguém não podem ser removidas — a API recusa e diz por quê.`}
        confirmText="Remover"
        cancelText="Voltar"
        isLoading={apagar.isPending}
      />
    </>
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
