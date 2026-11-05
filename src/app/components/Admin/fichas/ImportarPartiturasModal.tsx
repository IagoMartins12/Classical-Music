'use client';

import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { PiArrowClockwise, PiCheck } from 'react-icons/pi';
import { Button } from '@/app/components/ui/Button';
import { Erro } from '@/app/components/ui/Estados';
import { FormBlock, FormSheet } from '@/app/components/site/edit/FormSheet';
import { MagnifierSearching } from '@/app/components/site/MagnifierSearching';
import {
  previewImslpScores,
  refreshFromImslp,
  type ImslpScoresPreview,
} from '@/app/requests/work-score-library';

const MOSTRADAS = 12;

const STATUS: Record<string, string> = {
  failed: 'A última leitura deu erro.',
  none: 'Lida antes: o IMSLP não tinha nada.',
  found: 'Lida antes, com partituras gravadas.',
};

/**
 * "Importar partituras do IMSLP", with the preview first: the page is read,
 * nothing is written, and the sheet says what would be created and updated.
 * Only "Confirmar alterações" writes (the same reading the work page's
 * "Atualizar do IMSLP" does, cache of that work included).
 */
export function ImportarPartiturasModal({
  aberto,
  aoFechar,
  workId,
  titulo,
  aoConcluir,
}: {
  aberto: boolean;
  aoFechar: () => void;
  workId: string;
  titulo: string;
  /** After the changes are confirmed and written. */
  aoConcluir: () => void;
}) {
  const [previa, setPrevia] = useState<ImslpScoresPreview | null>(null);
  const [lendo, setLendo] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [gravando, setGravando] = useState(false);

  const ler = useCallback(
    async (sinal?: AbortSignal) => {
      setLendo(true);
      setErro(null);
      setPrevia(null);
      try {
        setPrevia(await previewImslpScores(workId, sinal));
      } catch (e) {
        if ((e as Error)?.name === 'AbortError') return;
        setErro(
          e instanceof Error ? e.message : 'O IMSLP não respondeu agora.'
        );
      } finally {
        setLendo(false);
      }
    },
    [workId]
  );

  useEffect(() => {
    if (!aberto) return;
    const controle = new AbortController();
    void ler(controle.signal);
    return () => controle.abort();
  }, [aberto, ler]);

  const criar = previa?.toCreate.length ?? 0;
  const atualizar = previa?.toUpdate.length ?? 0;
  const nadaAMudar = !!previa && criar + atualizar === 0;

  const confirmar = async () => {
    setGravando(true);
    try {
      const { created, updated } = await refreshFromImslp(workId);
      toast.success(
        `${created} partitura(s) nova(s) e ${updated} atualizada(s).`
      );
      aoConcluir();
      aoFechar();
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : 'Não foi possível gravar agora.'
      );
    } finally {
      setGravando(false);
    }
  };

  const contagem = (rotulo: string, valor: number) => (
    <div className="flex flex-col gap-1">
      <span className="font-display text-[1.75rem] leading-none text-texto tabular-nums">
        {valor}
      </span>
      <span className="t-legenda">{rotulo}</span>
    </div>
  );

  const rodape = (
    <div className="flex flex-col gap-2 sm:flex-row-reverse">
      <Button
        variante="primario"
        icone={PiCheck}
        carregando={gravando}
        disabled={!previa || nadaAMudar}
        onClick={() => void confirmar()}
        className="w-full sm:flex-1"
      >
        {nadaAMudar ? 'Nada a atualizar' : 'Confirmar alterações'}
      </Button>
      <Button
        variante="fantasma"
        disabled={gravando}
        onClick={aoFechar}
        className="w-full sm:w-auto"
      >
        Cancelar
      </Button>
    </div>
  );

  return (
    <FormSheet
      aberto={aberto}
      aoFechar={aoFechar}
      titulo="Importar partituras do IMSLP"
      descricao={titulo}
      ocupado={gravando}
      rodape={rodape}
    >
      <FormBlock
        titulo="Prévia"
        nota="Lemos a página da obra no IMSLP agora. Nada é gravado até você confirmar."
      >
        {lendo ? (
          <div
            role="status"
            className="col-span-full flex w-full flex-col items-center gap-5 rounded-card bg-sup-2 px-6 py-8 text-center"
          >
            <MagnifierSearching />
            <p className="font-display text-[1.375rem] leading-snug">
              Lendo as partituras no IMSLP…
            </p>
            <p className="-mt-3 t-rotulo text-texto-suave">
              Leva alguns segundos. A prévia aparece sozinha.
            </p>
          </div>
        ) : erro ? (
          <Erro
            className="col-span-full w-full"
            titulo="Não foi possível ler o IMSLP"
            descricao={erro}
            acao={
              <Button
                tamanho="p"
                icone={PiArrowClockwise}
                onClick={() => void ler()}
              >
                Tentar de novo
              </Button>
            }
          />
        ) : previa ? (
          <div className="col-span-full flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {contagem('Hoje na obra', previa.stored)}
              {contagem('Lidas no IMSLP', previa.onPage)}
              {contagem('A criar', criar)}
              {contagem('A atualizar', atualizar)}
            </div>

            <p className="t-corpo">
              {nadaAMudar
                ? 'A obra já está igual ao IMSLP.'
                : `Partituras do IMSLP na obra: ${previa.stored} → ${previa.stored + criar}${
                    criar ? ` (+${criar})` : ''
                  }.`}{' '}
              {previa.status && STATUS[previa.status]}
            </p>

            {previa.notOnPage > 0 && (
              <p className="t-rotulo text-texto-suave">
                {previa.notOnPage} partitura(s) guardada(s) não aparecem mais na
                página do IMSLP. Elas ficam: a leitura não apaga nada.
              </p>
            )}

            {criar > 0 && (
              <section className="flex flex-col gap-2">
                <h4 className="t-legenda">Novas ({criar})</h4>
                <ul className="flex flex-col divide-y divide-[var(--linha)]">
                  {previa.toCreate.slice(0, MOSTRADAS).map((s, i) => (
                    <li key={`${s.title}-${i}`} className="py-2">
                      <span className="block truncate text-[0.9375rem]">
                        {s.title}
                      </span>
                      <span className="block truncate t-legenda">
                        {[s.type, s.publisher].filter(Boolean).join(' · ')}
                      </span>
                    </li>
                  ))}
                </ul>
                {criar > MOSTRADAS && (
                  <p className="t-legenda">e mais {criar - MOSTRADAS}.</p>
                )}
              </section>
            )}

            {atualizar > 0 && (
              <section className="flex flex-col gap-2">
                <h4 className="t-legenda">Mudam ({atualizar})</h4>
                <ul className="flex flex-col divide-y divide-[var(--linha)]">
                  {previa.toUpdate.slice(0, MOSTRADAS).map((s, i) => (
                    <li key={`${s.title}-${i}`} className="py-2">
                      <span className="block truncate text-[0.9375rem]">
                        {s.title}
                      </span>
                      <span className="block truncate t-legenda">
                        Muda: {s.changed.join(', ')}
                      </span>
                    </li>
                  ))}
                </ul>
                {atualizar > MOSTRADAS && (
                  <p className="t-legenda">e mais {atualizar - MOSTRADAS}.</p>
                )}
              </section>
            )}
          </div>
        ) : null}
      </FormBlock>
    </FormSheet>
  );
}
