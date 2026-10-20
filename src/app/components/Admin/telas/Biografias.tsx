'use client';

import { useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { PiArrowSquareOut, PiBookOpenText } from 'react-icons/pi';
import { Abas, Aba } from '@/app/components/ui/Abas';
import { Badge } from '@/app/components/ui/Badge';
import { Button, classesDeBotao } from '@/app/components/ui/Button';
import { Vazio } from '@/app/components/ui/Estados';
import { Field } from '@/app/components/ui/Field';
import { Stack } from '@/app/components/ui/Layout';
import { Row } from '@/app/components/ui/Row';
import { Sheet } from '@/app/components/ui/Sheet';
import { Text } from '@/app/components/ui/Text';
import { cx } from '@/app/components/ui/cx';
import { Avatar } from '@/app/components/Admin/painel/Avatar';
import { Cabecalho } from '@/app/components/Admin/painel/Cabecalho';
import { Busca } from '@/app/components/Admin/painel/Controles';
import { dataCurta, numero } from '@/app/components/Admin/painel/formatos';
import {
  useBiografias,
  useRevisarBiografia,
} from '@/app/hooks/admin/useBiografias';
import {
  BIO_MAX,
  BIO_MIN,
  type BiografiaParaRevisar,
  type RecorteBiografias,
} from '@/app/requests/admin/biografias';

/**
 * Biografias: a fila de revisão.
 *
 * O site escreve a biografia com IA quando um compositor chega sem uma, e a
 * traduz entre português e inglês; os dois textos levam um aviso ("ainda não
 * revisado por uma pessoa") até alguém da equipe lê-los aqui. **Aprovar como
 * está** deixa a origem honesta (segue escrita com ajuda de IA, agora
 * "revisada pela equipe"); **reescrever** faz do texto o de uma pessoa.
 *
 * A fila passa uma por uma: ao aprovar, a folha já mostra a próxima.
 */

const contar = (texto: string) => texto.trim().length;

const erroDeTamanho = (texto: string) => {
  const n = contar(texto);
  if (n < BIO_MIN) {
    return `Uma biografia é um texto, não uma linha: pelo menos ${numero(BIO_MIN)} caracteres (tem ${numero(n)}).`;
  }
  if (n > BIO_MAX) {
    return `No máximo ${numero(BIO_MAX)} caracteres (tem ${numero(n)}).`;
  }
  return undefined;
};

export default function Biografias() {
  const [recorte, setRecorte] = useState<RecorteBiografias>('pending');
  const [busca, setBusca] = useState('');
  const fila = useBiografias(recorte, busca);
  const revisar = useRevisarBiografia();
  const [aberta, setAberta] = useState<string | null>(null);

  const contagens = fila.extra as
    | { pending: number; reviewed: number }
    | undefined;
  const indice = fila.items.findIndex((item) => item.id === aberta);
  const atual = indice >= 0 ? fila.items[indice] : null;
  const proxima = indice >= 0 ? (fila.items[indice + 1] ?? null) : null;

  const aprovar = async (corpo: { bio?: string; bioEn?: string }) => {
    if (!atual) return;
    // A próxima da fila pendente: a aprovada sai da lista, e a folha segue.
    const seguinte =
      recorte === 'pending'
        ? (proxima?.id ?? fila.items[indice - 1]?.id ?? null)
        : null;
    try {
      await revisar.mutateAsync([atual.id, corpo]);
      toast.success('Biografia aprovada.');
      setAberta(seguinte);
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : 'Não foi possível aprovar agora.'
      );
    }
  };

  return (
    <Stack gap={6}>
      <Cabecalho
        titulo="Biografias"
        descricao="As biografias escritas por IA e as traduções automáticas esperam aqui uma pessoa da equipe. Aprove como está ou reescreva e aprove: o aviso no site muda sozinho."
        aoAtualizar={fila.refetch}
        atualizando={fila.fetching}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Abas rotulo="Recorte da fila de biografias">
          <Aba
            ativa={recorte === 'pending'}
            onClick={() => setRecorte('pending')}
          >
            Pendentes
            {contagens ? ` · ${numero(contagens.pending)}` : ''}
          </Aba>
          <Aba
            ativa={recorte === 'reviewed'}
            onClick={() => setRecorte('reviewed')}
          >
            Revisadas
            {contagens ? ` · ${numero(contagens.reviewed)}` : ''}
          </Aba>
        </Abas>
        <Busca
          valor={busca}
          aoMudar={setBusca}
          placeholder="Buscar compositor"
          rotulo="Buscar compositor na fila de biografias"
          className="w-full sm:w-72"
        />
      </div>

      {fila.error ? (
        <Vazio
          titulo="Não foi possível carregar a fila"
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
          icone={PiBookOpenText}
          titulo={
            recorte === 'pending'
              ? busca
                ? 'Nenhuma biografia pendente com esse nome'
                : 'Nada esperando revisão'
              : 'Nenhuma biografia revisada ainda'
          }
          descricao={
            recorte === 'pending' && !busca
              ? 'Quando uma biografia for escrita por IA ou traduzida por máquina, ela aparece aqui.'
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
              antes={<Avatar nome={item.name} imagem={item.portraitUrl} />}
              titulo={item.name}
              detalhe={`${item.epochName ?? 'Sem época'} · ${numero(item.worksCount)} ${item.worksCount === 1 ? 'obra' : 'obras'}`}
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
        titulo="Revisar a biografia"
        descricao={atual ? atual.name : undefined}
        largura="gg"
        rodape={undefined}
      >
        {atual && (
          <Editor
            key={atual.id}
            item={atual}
            temProxima={recorte === 'pending' && proxima !== null}
            ocupado={revisar.isPending}
            aoAprovar={aprovar}
            aoPular={() => setAberta(proxima?.id ?? null)}
          />
        )}
      </Sheet>
    </Stack>
  );
}

function Selos({ item }: { item: BiografiaParaRevisar }) {
  return (
    <span className="flex flex-wrap items-center justify-end gap-1">
      {item.writtenByAi && <Badge>Escrita por IA</Badge>}
      {item.translatedFrom && <Badge>Tradução automática</Badge>}
      {item.reviewedAt && !item.translatedFrom && (
        <Badge estado="ok">Revisada em {dataCurta(item.reviewedAt)}</Badge>
      )}
    </span>
  );
}

function Editor({
  item,
  temProxima,
  ocupado,
  aoAprovar,
  aoPular,
}: {
  item: BiografiaParaRevisar;
  temProxima: boolean;
  ocupado: boolean;
  aoAprovar: (corpo: { bio?: string; bioEn?: string }) => Promise<void>;
  aoPular: () => void;
}) {
  const [bio, setBio] = useState(item.bio ?? '');
  const [bioEn, setBioEn] = useState(item.bioEn ?? '');

  const mudouPt = contar(bio) > 0 && bio.trim() !== (item.bio ?? '').trim();
  const mudouEn =
    contar(bioEn) > 0 && bioEn.trim() !== (item.bioEn ?? '').trim();
  const erroPt = mudouPt ? erroDeTamanho(bio) : undefined;
  const erroEn = mudouEn ? erroDeTamanho(bioEn) : undefined;
  const mudou = mudouPt || mudouEn;

  const aprovar = () =>
    aoAprovar({
      ...(mudouPt ? { bio: bio.trim() } : {}),
      ...(mudouEn ? { bioEn: bioEn.trim() } : {}),
    });

  const origem = item.writtenByAi
    ? `Escrita por IA${item.generatedBy ? ` (${item.generatedBy})` : ''}${item.generatedAt ? ` em ${dataCurta(item.generatedAt)}` : ''}.`
    : 'O texto em português é de uma pessoa.';
  const traducao = item.translatedFrom
    ? item.translatedFrom === 'pt'
      ? 'O inglês é tradução automática do português.'
      : 'O português é tradução automática do inglês.'
    : null;

  return (
    <Stack gap={6}>
      <div className="flex flex-col gap-1">
        <Text papel="rotulo" as="p">
          {origem}
        </Text>
        {traducao && (
          <Text papel="legenda" as="p">
            {traducao} Ao aprovar, a equipe a dá como lida.
          </Text>
        )}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Field.Area
          label="Português"
          rows={14}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          ajuda={`${numero(contar(bio))} caracteres`}
          erro={erroPt}
          disabled={ocupado}
        />
        <Field.Area
          label="English"
          rows={14}
          value={bioEn}
          onChange={(e) => setBioEn(e.target.value)}
          ajuda={`${numero(contar(bioEn))} caracteres`}
          erro={erroEn}
          disabled={ocupado}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-[var(--linha)] pt-5">
        <Button
          variante="primario"
          carregando={ocupado}
          disabled={Boolean(erroPt || erroEn)}
          onClick={() => void aprovar()}
        >
          {mudou
            ? temProxima
              ? 'Salvar, aprovar e ir para a próxima'
              : 'Salvar e aprovar'
            : temProxima
              ? 'Aprovar como está e ir para a próxima'
              : 'Aprovar como está'}
        </Button>
        {temProxima && (
          <Button variante="fantasma" disabled={ocupado} onClick={aoPular}>
            Pular
          </Button>
        )}
        <Link
          href={`/composer/${item.id}`}
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
