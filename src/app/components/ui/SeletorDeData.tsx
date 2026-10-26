'use client';

import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import {
  PiCalendarBlank,
  PiCaretDown,
  PiCaretLeft,
  PiCaretRight,
  PiX,
} from 'react-icons/pi';
import type { Idioma } from '@/app/conteudo/legal/tipos';
import { useRouteLanguage } from '@/app/hooks/useRouteLanguage';
import {
  diasNoMes,
  escreverData,
  lerData,
  mostrarData,
  nomeDoMes,
  type DataHistorica,
} from '@/app/utils/dataHistorica';
import { Button } from './Button';
import { CaixaDeMarcar } from './CaixaDeMarcar';
import { cx } from './cx';
import { useListaFlutuante } from './useListaFlutuante';

const TEXTO: Record<
  Idioma,
  {
    escolher: string;
    ano: string;
    anoAnterior: string;
    anoSeguinte: string;
    meses: string;
    dias: string;
    aproximada: string;
    limpar: string;
    pronto: string;
    original: (t: string) => string;
  }
> = {
  pt: {
    escolher: 'Escolher data',
    ano: 'Ano',
    anoAnterior: 'Ano anterior',
    anoSeguinte: 'Ano seguinte',
    meses: 'Mês (opcional)',
    dias: 'Dia (opcional)',
    aproximada: 'Data aproximada',
    limpar: 'Limpar',
    pronto: 'Pronto',
    original: (t) => `Registrado hoje como "${t}".`,
  },
  en: {
    escolher: 'Choose a date',
    ano: 'Year',
    anoAnterior: 'Previous year',
    anoSeguinte: 'Next year',
    meses: 'Month (optional)',
    dias: 'Day (optional)',
    aproximada: 'Approximate date',
    limpar: 'Clear',
    pronto: 'Done',
    original: (t) => `Currently recorded as "${t}".`,
  },
};

const ANO_MIN = 100;
const ANO_MAX = new Date().getFullYear();

/**
 * Datepicker for historical dates (a composer's birth and death), with the
 * look of `Selecao`: the same field, and a floating panel in the top layer.
 *
 * A calendar that walks month by month does not reach 1685. Here the year is
 * typed (or stepped), and month and day are optional, as they often are in
 * the sources: a date can be "1830", "August 1830" or "15 August 1830", and
 * marked approximate ("ca.1830").
 *
 * `valor` is the stored text, in whatever shape the sources left it; the
 * field shows it read (`lerData`) and, when the text says more than the
 * picker keeps ("fl. 1852"), the original under it. Nothing is rewritten
 * until the person changes something: `aoMudar` receives the text in the
 * stored format (`escreverData`), or '' when cleared.
 */
export function SeletorDeData({
  valor,
  aoMudar,
  id,
  invalido = false,
  ...aria
}: {
  valor: string;
  aoMudar: (texto: string) => void;
  id?: string;
  invalido?: boolean;
  'aria-describedby'?: string;
}) {
  const { language } = useRouteLanguage();
  const t = TEXTO[language];
  const base = useId();
  const idCampo = id ?? `${base}-campo`;
  const idPainel = `${base}-painel`;
  const campo = useRef<HTMLDivElement>(null);
  const painel = useRef<HTMLDivElement>(null);
  const entradaAno = useRef<HTMLInputElement>(null);
  const botao = useRef<HTMLButtonElement>(null);
  const [aberta, setAberta] = useState(false);

  const { data, inexata } = lerData(valor);
  const [anoTexto, setAnoTexto] = useState(data ? String(data.ano) : '');
  // "Approximate" can be ticked before there is a year: it is kept here and
  // goes into the text with the first year chosen.
  const [aproximada, setAproximada] = useState(data?.aproximada ?? false);

  // Outro valor de fora (o formulário reabriu): o ano digitado acompanha.
  useEffect(() => {
    setAnoTexto(data ? String(data.ano) : '');
    if (data) setAproximada(data.aproximada);
    // Só o texto gravado importa; `data` é derivada dele.
  }, [valor]);

  const fechar = () => {
    setAberta(false);
    botao.current?.focus();
  };
  const { acima } = useListaFlutuante({
    ancora: campo,
    lista: painel,
    aberta,
    aoClicarFora: () => setAberta(false),
    conteudo: data?.mes,
  });

  // The year first, with the panel at its top: with little room below the
  // field, focusing could scroll the panel and hide the year.
  useEffect(() => {
    if (!aberta) return;
    entradaAno.current?.focus({ preventScroll: true });
    if (painel.current) painel.current.scrollTop = 0;
  }, [aberta]);

  const mudar = (d: DataHistorica | null) => aoMudar(d ? escreverData(d) : '');
  const comAno = (ano: number): DataHistorica => {
    const mes = data?.mes ?? null;
    const dia =
      data?.dia && mes && data.dia <= diasNoMes(ano, mes) ? data.dia : null;
    return { ano, mes, dia, aproximada: data?.aproximada ?? aproximada };
  };

  const digitarAno = (texto: string) => {
    const limpo = texto.replace(/\D/g, '').slice(0, 4);
    setAnoTexto(limpo);
    const ano = Number(limpo);
    if (limpo.length >= 3 && ano >= ANO_MIN && ano <= ANO_MAX)
      mudar(comAno(ano));
  };
  const passarAno = (passo: number) => {
    const ano = Math.min(
      ANO_MAX,
      Math.max(ANO_MIN, (data?.ano ?? ANO_MAX) + passo)
    );
    setAnoTexto(String(ano));
    mudar(comAno(ano));
  };

  const aoTeclar = (e: ReactKeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      fechar();
    }
  };

  const celula = (ativa: boolean) =>
    cx(
      'grid h-8 w-full place-items-center rounded-lg text-[0.875rem] transition-colors duration-[var(--t-toque)]',
      'disabled:cursor-not-allowed disabled:opacity-40',
      ativa
        ? 'fill-ouro font-medium text-sobre-ouro'
        : 'text-texto-suave hover:[background:var(--ouro-tint)] hover:text-texto'
    );

  return (
    <div className="flex flex-col gap-1.5">
      <div
        ref={campo}
        className={cx(
          'input-classical group relative flex w-full items-center gap-2 pl-4 pr-3',
          aberta && 'selecao-aberta'
        )}
        aria-invalid={invalido || undefined}
        // The whole field opens the panel, the chevron included; the clear
        // button stops its own click.
        onClick={() => setAberta((a) => !a)}
      >
        <PiCalendarBlank
          aria-hidden
          className="h-4 w-4 shrink-0 text-texto-fraco"
        />
        <button
          ref={botao}
          id={idCampo}
          type="button"
          aria-haspopup="dialog"
          aria-expanded={aberta}
          aria-controls={idPainel}
          // The field around it shows the focus, and its click opens.
          className="min-w-0 flex-1 truncate bg-transparent text-left outline-none focus-visible:shadow-none"
          {...aria}
        >
          {data ? (
            mostrarData(data, language)
          ) : (
            <span className="text-texto-fraco">{t.escolher}</span>
          )}
        </button>
        {data && (
          <button
            type="button"
            aria-label={t.limpar}
            onClick={(e) => {
              e.stopPropagation();
              setAnoTexto('');
              mudar(null);
            }}
            className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-texto-suave hover:bg-[var(--interactive-hover)] hover:text-texto"
          >
            <PiX aria-hidden className="h-3.5 w-3.5" />
          </button>
        )}
        <PiCaretDown
          aria-hidden
          className={cx(
            'h-4 w-4 shrink-0 text-texto-suave transition-transform duration-[var(--t-resposta)] ease-saida motion-reduce:transition-none',
            aberta && 'rotate-180 text-ouro-texto'
          )}
        />
      </div>
      {inexata && valor.trim() && (
        <span className="t-legenda">{t.original(valor.trim())}</span>
      )}

      <div
        ref={painel}
        id={idPainel}
        role="dialog"
        aria-label={t.escolher}
        popover="manual"
        onKeyDown={aoTeclar}
        className={cx('selecao-lista p-4', acima && 'selecao-acima')}
      >
        {aberta && (
          // A lista flutuante tem ao menos a largura do campo e mede o
          // conteúdo (`max-content`): o conteúdo pede um mínimo, para as
          // grades não ficarem estreitas, e ocupa toda a largura do painel.
          <div className="flex w-full min-w-[17rem] flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label
                htmlFor={`${base}-ano`}
                className="t-legenda font-medium text-texto"
              >
                {t.ano}
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label={t.anoAnterior}
                  onClick={() => passarAno(-1)}
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-texto-suave hover:bg-[var(--interactive-hover)] hover:text-texto"
                >
                  <PiCaretLeft aria-hidden className="h-4 w-4" />
                </button>
                <input
                  ref={entradaAno}
                  id={`${base}-ano`}
                  inputMode="numeric"
                  autoComplete="off"
                  value={anoTexto}
                  onChange={(e) => digitarAno(e.target.value)}
                  placeholder={String(ANO_MAX)}
                  className="input-classical min-w-0 flex-1 px-3 text-center tabular-nums"
                />
                <button
                  type="button"
                  aria-label={t.anoSeguinte}
                  onClick={() => passarAno(1)}
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-texto-suave hover:bg-[var(--interactive-hover)] hover:text-texto"
                >
                  <PiCaretRight aria-hidden className="h-4 w-4" />
                </button>
              </div>
            </div>

            <fieldset className="flex flex-col gap-2" disabled={!data}>
              <legend className="t-legenda mb-2 font-medium text-texto">
                {t.meses}
              </legend>
              <div className="grid grid-cols-4 gap-1">
                {Array.from({ length: 12 }, (_, i) => i + 1).map((mes) => (
                  <button
                    key={mes}
                    type="button"
                    aria-pressed={data?.mes === mes}
                    onClick={() =>
                      data &&
                      mudar(
                        data.mes === mes
                          ? { ...data, mes: null, dia: null }
                          : {
                              ...data,
                              mes,
                              dia:
                                data.dia && data.dia <= diasNoMes(data.ano, mes)
                                  ? data.dia
                                  : null,
                            }
                      )
                    }
                    className={cx(celula(data?.mes === mes), 'capitalize')}
                  >
                    {nomeDoMes(mes, language, true)}
                  </button>
                ))}
              </div>
            </fieldset>

            {data?.mes && (
              <fieldset className="flex flex-col gap-2">
                <legend className="t-legenda mb-2 font-medium text-texto">
                  {t.dias}
                </legend>
                <div className="grid grid-cols-7 gap-1">
                  {Array.from(
                    { length: diasNoMes(data.ano, data.mes) },
                    (_, i) => i + 1
                  ).map((dia) => (
                    <button
                      key={dia}
                      type="button"
                      aria-pressed={data.dia === dia}
                      onClick={() =>
                        mudar({ ...data, dia: data.dia === dia ? null : dia })
                      }
                      className={cx(celula(data.dia === dia), 'tabular-nums')}
                    >
                      {dia}
                    </button>
                  ))}
                </div>
              </fieldset>
            )}

            <CaixaDeMarcar
              rotulo={t.aproximada}
              marcado={data?.aproximada ?? aproximada}
              aoMudar={(marcada) => {
                setAproximada(marcada);
                if (data) mudar({ ...data, aproximada: marcada });
              }}
            />

            <div className="flex items-center justify-end gap-2 border-t border-linha pt-3">
              {data && (
                <Button
                  variante="fantasma"
                  tamanho="p"
                  onClick={() => {
                    setAnoTexto('');
                    mudar(null);
                  }}
                  className="mr-auto"
                >
                  {t.limpar}
                </Button>
              )}
              <Button variante="primario" tamanho="p" onClick={fechar}>
                {t.pronto}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
