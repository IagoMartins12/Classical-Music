'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useDeferredValue, useState } from 'react';
import toast from 'react-hot-toast';
import { PiArrowDown, PiArrowUp, PiPlus, PiX } from 'react-icons/pi';
import { Button } from '@/app/components/ui/Button';
import { Field } from '@/app/components/ui/Field';
import { Stack } from '@/app/components/ui/Layout';
import { Text } from '@/app/components/ui/Text';
import {
  definirPorOndeComecar,
  getObras,
  type ObraEscolhida,
} from '@/app/requests/admin/catalogo';

const MAXIMO = 3;

/**
 * "Por onde começar" da página do compositor: até três obras escolhidas
 * pela equipe, em ordem. A página mostra estas primeiro e completa com as
 * automáticas (as mais estudadas, das mais fáceis). Sem escolha, tudo é
 * automático. Quem usa passa `key` com as escolhidas salvas, para recomeçar
 * delas quando o resumo do compositor volta.
 */
export function PorOndeComecar({
  compositorId,
  escolhidas: inicial,
  sugestoes,
}: {
  compositorId: string;
  escolhidas: ObraEscolhida[];
  /** As mais favoritadas, para escolher sem buscar. */
  sugestoes: ObraEscolhida[];
}) {
  const client = useQueryClient();
  const [escolhidas, setEscolhidas] = useState(inicial);
  const [busca, setBusca] = useState('');
  const [salvando, setSalvando] = useState(false);
  const termo = useDeferredValue(busca.trim());

  const resultados = useQuery({
    queryKey: ['admin', 'por-onde-comecar', compositorId, termo],
    queryFn: () => getObras({ composerId: compositorId, search: termo }, 1),
    enabled: termo.length >= 2,
    staleTime: 60_000,
  });

  const mudou =
    escolhidas.map((o) => o.id).join() !== inicial.map((o) => o.id).join();
  const cheia = escolhidas.length >= MAXIMO;
  const opcoes = (
    termo.length >= 2
      ? (resultados.data?.works ?? []).map((w) => ({
          id: w.id,
          title: w.title,
          opOrCatalog: w.opOrCatalog ?? null,
        }))
      : sugestoes
  ).filter((o) => !escolhidas.some((e) => e.id === o.id));

  const mover = (de: number, para: number) =>
    setEscolhidas((lista) => {
      const nova = [...lista];
      const [item] = nova.splice(de, 1);
      nova.splice(para, 0, item);
      return nova;
    });

  const salvar = async () => {
    setSalvando(true);
    try {
      const salvas = await definirPorOndeComecar(
        compositorId,
        escolhidas.map((o) => o.id)
      );
      setEscolhidas(salvas);
      toast.success(
        salvas.length
          ? '"Por onde começar" atualizado.'
          : '"Por onde começar" voltou ao automático.'
      );
      void client.invalidateQueries({ queryKey: ['admin'] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Não foi possível salvar.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Stack gap={3}>
      <div className="flex items-baseline justify-between gap-3">
        <Text papel="secao" as="h3">
          Por onde começar
        </Text>
        {mudou && (
          <Button
            tamanho="p"
            variante="primario"
            carregando={salvando}
            onClick={() => void salvar()}
          >
            Salvar escolha
          </Button>
        )}
      </div>
      <Text papel="legenda" as="p">
        Até três obras, nesta ordem. A página completa com as automáticas (as
        mais estudadas, das mais fáceis).
      </Text>

      {escolhidas.length > 0 ? (
        <ol className="flex flex-col">
          {escolhidas.map((o, i) => (
            <li
              key={o.id}
              className="flex items-center gap-2 border-b border-linha py-1.5 last:border-0"
            >
              <span className="t-dado w-5 text-texto-fraco">{i + 1}</span>
              <span className="min-w-0 flex-1 truncate font-display text-[1rem]">
                {o.title}
                {o.opOrCatalog ? `, ${o.opOrCatalog}` : ''}
              </span>
              <Button
                tamanho="p"
                variante="fantasma"
                icone={PiArrowUp}
                rotulo="Subir"
                disabled={i === 0}
                onClick={() => mover(i, i - 1)}
              />
              <Button
                tamanho="p"
                variante="fantasma"
                icone={PiArrowDown}
                rotulo="Descer"
                disabled={i === escolhidas.length - 1}
                onClick={() => mover(i, i + 1)}
              />
              <Button
                tamanho="p"
                variante="fantasma"
                icone={PiX}
                rotulo="Tirar da escolha"
                onClick={() =>
                  setEscolhidas((lista) => lista.filter((e) => e.id !== o.id))
                }
              />
            </li>
          ))}
        </ol>
      ) : (
        <p className="text-sm text-texto-suave">
          Nenhuma escolhida: a página mostra as automáticas.
        </p>
      )}

      {!cheia && (
        <Stack gap={2}>
          <Field
            label="Acrescentar obra"
            placeholder="Buscar nas obras do compositor"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
          {opcoes.length > 0 && (
            <ul className="flex flex-col">
              {opcoes.slice(0, 6).map((o) => (
                <li key={o.id}>
                  <button
                    type="button"
                    onClick={() => setEscolhidas((lista) => [...lista, o])}
                    className="flex min-h-10 w-full items-center gap-2 rounded-controle px-2 text-left text-sm text-texto-suave hover:bg-sup-2 hover:text-texto"
                  >
                    <PiPlus aria-hidden="true" className="shrink-0" />
                    <span className="truncate">
                      {o.title}
                      {o.opOrCatalog ? `, ${o.opOrCatalog}` : ''}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Stack>
      )}
    </Stack>
  );
}
