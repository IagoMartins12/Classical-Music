'use client';

import { useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { PiArrowSquareOut, PiHandsClapping } from 'react-icons/pi';
import ConfirmModal from '@/app/components/ConfirmModal';
import { Badge } from '@/app/components/ui/Badge';
import { Button, classesDeBotao } from '@/app/components/ui/Button';
import { Vazio } from '@/app/components/ui/Estados';
import { Field } from '@/app/components/ui/Field';
import { Stack } from '@/app/components/ui/Layout';
import { Row } from '@/app/components/ui/Row';
import { Sheet } from '@/app/components/ui/Sheet';
import { Text } from '@/app/components/ui/Text';
import { cx } from '@/app/components/ui/cx';
import { Cabecalho } from '@/app/components/Admin/painel/Cabecalho';
import { Busca, Segmentos } from '@/app/components/Admin/painel/Controles';
import { dataCurta, dataHora } from '@/app/components/Admin/painel/formatos';
import {
  useContribuicoes,
  useReprovarContribuicao,
} from '@/app/hooks/admin/useContribuicoes';
import type {
  Contribuicao,
  RecorteContribuicoes,
  TipoDeContribuicao,
} from '@/app/requests/admin/contribuicoes';

/**
 * Contribuições: a moderação do que a comunidade escreveu no acervo.
 *
 * Elas nascem aprovadas — valem na hora, e o XP espera sete dias. Aqui a
 * equipe lê e, se for o caso, **reprova**: o valor antigo volta (se nada o
 * substituiu), o XP deixa de ser devido ou é devolvido se já tinha sido pago,
 * e o autor recebe o motivo.
 */

const TIPOS: Record<TipoDeContribuicao, string> = {
  BIO: 'Biografia',
  VIDEO: 'Vídeo',
  CURIOSITY: 'Curiosidade',
  CORRECTION: 'Correção de dado',
};

const CAMPOS: Record<string, string> = {
  bio: 'Biografia',
  bioEn: 'Biografia (inglês)',
  videoUrl: 'Vídeo',
  youtubeVideoId: 'Vídeo',
  birthDate: 'Nascimento',
  deathDate: 'Morte',
  nationality: 'Nacionalidade',
  wikipediaLink: 'Wikipédia',
  compositionYear: 'Ano de composição',
  tone: 'Tonalidade',
  instrumentation: 'Instrumentação',
  dedicateTo: 'Dedicatória',
  firstPublishDate: 'Primeira publicação',
  subtitle: 'Subtítulo',
};

const texto = (valor: unknown) =>
  valor === null || valor === undefined || valor === ''
    ? '—'
    : typeof valor === 'string'
      ? valor
      : JSON.stringify(valor);

const rotuloDe = (c: Contribuicao) =>
  c.kind === 'CORRECTION' || c.kind === 'BIO'
    ? (CAMPOS[c.field ?? ''] ?? TIPOS[c.kind])
    : TIPOS[c.kind];

const linkDoSite = (c: Contribuicao) =>
  `/${c.entityType === 'work' ? 'works' : 'composer'}/${c.entityId}`;

export default function Contribuicoes() {
  const [recorte, setRecorte] = useState<RecorteContribuicoes>('live');
  const [tipo, setTipo] = useState<TipoDeContribuicao | undefined>();
  const [busca, setBusca] = useState('');
  const fila = useContribuicoes(recorte, tipo, busca);
  const reprovar = useReprovarContribuicao();
  const [aberta, setAberta] = useState<string | null>(null);
  const [reprovando, setReprovando] = useState<Contribuicao | null>(null);
  const [motivo, setMotivo] = useState('');

  const contagens = fila.extra as
    | { live: number; reverted: number }
    | undefined;
  const atual = fila.items.find((item) => item.id === aberta) ?? null;

  const confirmarReprovacao = async () => {
    if (!reprovando) return;
    try {
      const [resultado] = await Promise.all([
        reprovar.mutateAsync([reprovando.id, motivo.trim()]),
      ]);
      toast.success(
        resultado.xpReturned > 0
          ? `Reprovada. ${resultado.xpReturned} XP devolvidos.`
          : 'Reprovada.'
      );
      setReprovando(null);
      setMotivo('');
      setAberta(null);
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : 'Não foi possível reprovar agora.'
      );
    }
  };

  return (
    <Stack gap={6}>
      <Cabecalho
        titulo="Contribuições"
        descricao="O que a comunidade escreveu no acervo. Elas valem na hora; aqui você reprova a que não serve. O valor antigo volta, o XP é devolvido e o autor recebe o motivo."
        aoAtualizar={fila.refetch}
        atualizando={fila.fetching}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Segmentos
          rotulo="Estado das contribuições"
          valor={recorte}
          aoMudar={setRecorte}
          opcoes={[
            { valor: 'live', rotulo: 'Em vigor', contagem: contagens?.live },
            {
              valor: 'reverted',
              rotulo: 'Reprovadas',
              contagem: contagens?.reverted,
            },
          ]}
        />
        <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto">
          <Field.Selecao
            label="Tipo"
            value={tipo ?? ''}
            onChange={(e) =>
              setTipo((e.target.value || undefined) as TipoDeContribuicao)
            }
            className="w-full sm:w-44"
          >
            <option value="">Todos os tipos</option>
            {Object.entries(TIPOS).map(([valor, nome]) => (
              <option key={valor} value={valor}>
                {nome}
              </option>
            ))}
          </Field.Selecao>
          <Busca
            valor={busca}
            aoMudar={setBusca}
            placeholder="Buscar por autor"
            rotulo="Buscar contribuições por autor"
            className="w-full sm:w-64"
          />
        </div>
      </div>

      {fila.error ? (
        <Vazio
          titulo="Não foi possível carregar as contribuições"
          descricao={fila.error}
          acao={
            <Button tamanho="p" onClick={() => void fila.refetch()}>
              Tentar de novo
            </Button>
          }
        />
      ) : fila.loading ? (
        <Row.Skeleton repetir={6} />
      ) : fila.items.length === 0 ? (
        <Vazio
          icone={PiHandsClapping}
          titulo={
            recorte === 'live'
              ? 'Nenhuma contribuição por aqui'
              : 'Nenhuma contribuição reprovada'
          }
          descricao={
            recorte === 'live' && !busca && !tipo
              ? 'Quando alguém completar o acervo, a contribuição aparece aqui.'
              : undefined
          }
        />
      ) : (
        <Stack gap={1}>
          {fila.items.map((item) => (
            <Row
              key={item.id}
              clicavel
              onClick={() => setAberta(item.id)}
              titulo={`${rotuloDe(item)} · ${item.entityName ?? 'registro removido'}`}
              detalhe={`${item.author.name} · ${dataCurta(item.createdAt)}`}
              depois={<Selos item={item} />}
            />
          ))}
          {fila.hasMore && (
            <div className="pt-3">
              <Button
                tamanho="p"
                variante="fantasma"
                carregando={fila.loadingMore}
                onClick={fila.loadMore}
              >
                Carregar mais
              </Button>
            </div>
          )}
        </Stack>
      )}

      <Sheet
        aberto={atual !== null}
        aoFechar={() => setAberta(null)}
        titulo={atual ? rotuloDe(atual) : 'Contribuição'}
        descricao={atual?.entityName ?? undefined}
        largura="g"
      >
        {atual && (
          <Detalhe
            item={atual}
            aoReprovar={() => {
              setMotivo('');
              setReprovando(atual);
            }}
          />
        )}
      </Sheet>

      <ConfirmModal
        isOpen={reprovando !== null}
        onClose={() => {
          setReprovando(null);
          setMotivo('');
        }}
        onConfirm={confirmarReprovacao}
        type="warning"
        title="Reprovar esta contribuição?"
        message={
          reprovando?.xpGrantedAt
            ? `O valor antigo volta e os ${reprovando.xp} XP já pagos são devolvidos.`
            : 'O valor antigo volta e o XP deixa de ser devido.'
        }
        confirmText="Reprovar"
        cancelText="Voltar"
        isLoading={reprovar.isPending}
        confirmarBloqueado={motivo.trim().length < 5}
        acaoPerigosa
      >
        <Field.Area
          label="Motivo"
          ajuda="Vai para o autor na notificação. Seja direto e gentil."
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          rows={3}
          maxLength={500}
        />
      </ConfirmModal>
    </Stack>
  );
}

function Selos({ item }: { item: Contribuicao }) {
  return (
    <span className="flex flex-wrap items-center justify-end gap-1">
      {item.revertedAt ? (
        <Badge estado="erro">Reprovada</Badge>
      ) : item.xp > 0 ? (
        <Badge estado={item.xpGrantedAt ? 'ok' : undefined}>
          {item.xp} XP {item.xpGrantedAt ? 'pagos' : 'em espera'}
        </Badge>
      ) : null}
    </span>
  );
}

function Detalhe({
  item,
  aoReprovar,
}: {
  item: Contribuicao;
  aoReprovar: () => void;
}) {
  const ehCuriosidade = item.kind === 'CURIOSITY';

  return (
    <Stack gap={6}>
      <div className="flex flex-col gap-1">
        <Text papel="rotulo" as="p">
          {item.author.name} (@{item.author.username}) · {item.author.email}
        </Text>
        <Text papel="legenda" as="p">
          Enviada em {dataHora(item.createdAt)}
          {item.revertedAt && ` · reprovada em ${dataHora(item.revertedAt)}`}
        </Text>
      </div>

      {ehCuriosidade ? (
        <Bloco titulo="Curiosidade" valor={item.curiosity ?? 'Já removida.'} />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Bloco titulo="Antes" valor={texto(item.before)} fraco />
          <Bloco titulo="Depois" valor={texto(item.after)} />
        </div>
      )}

      {item.source && <Bloco titulo="Fonte indicada" valor={item.source} />}

      <Text papel="legenda" as="p">
        {item.xp > 0
          ? item.xpGrantedAt
            ? `${item.xp} XP já pagos em ${dataCurta(item.xpGrantedAt)}.`
            : `${item.xp} XP em espera (são pagos após sete dias sem denúncia).`
          : 'Sem XP em jogo.'}
      </Text>

      <div className="flex flex-wrap items-center gap-3 border-t border-[var(--linha)] pt-5">
        {!item.revertedAt && (
          <Button variante="perigo" onClick={aoReprovar}>
            Reprovar e devolver o XP
          </Button>
        )}
        <Link
          href={linkDoSite(item)}
          target="_blank"
          rel="noopener noreferrer"
          className={cx(classesDeBotao('fantasma', 'm'), 'sm:ml-auto')}
        >
          Abrir no site <PiArrowSquareOut aria-hidden="true" />
        </Link>
      </div>
    </Stack>
  );
}

function Bloco({
  titulo,
  valor,
  fraco = false,
}: {
  titulo: string;
  valor: string;
  fraco?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Text papel="rotulo" as="p">
        {titulo}
      </Text>
      <p
        className={cx(
          'whitespace-pre-wrap break-words rounded-card bg-sup-2 p-4 text-[0.9375rem]',
          fraco && 'text-texto-suave'
        )}
      >
        {valor}
      </p>
    </div>
  );
}
