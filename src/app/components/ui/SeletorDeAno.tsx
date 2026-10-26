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
  escreverAno,
  lerAno,
  mostrarAno,
  type AnoDeComposicao,
} from '@/app/utils/anoDeComposicao';
import { Button } from './Button';
import { CaixaDeMarcar } from './CaixaDeMarcar';
import { cx } from './cx';
import { useListaFlutuante } from './useListaFlutuante';

const TEXTO: Record<
  Idioma,
  {
    escolher: string;
    ano: string;
    ate: string;
    anterior: string;
    seguinte: string;
    aproximado: string;
    limpar: string;
    pronto: string;
    original: (t: string) => string;
  }
> = {
  pt: {
    escolher: 'Escolher ano',
    ano: 'Ano',
    ate: 'Até (opcional, para obras escritas em mais de um ano)',
    anterior: 'Ano anterior',
    seguinte: 'Ano seguinte',
    aproximado: 'Ano aproximado',
    limpar: 'Limpar',
    pronto: 'Pronto',
    original: (t) => `Registrado hoje como "${t}".`,
  },
  en: {
    escolher: 'Choose a year',
    ano: 'Year',
    ate: 'Until (optional, for works written over several years)',
    anterior: 'Previous year',
    seguinte: 'Next year',
    aproximado: 'Approximate year',
    limpar: 'Clear',
    pronto: 'Done',
    original: (t) => `Currently recorded as "${t}".`,
  },
};

const ANO_MIN = 100;
const ANO_MAX = new Date().getFullYear();
const limitar = (ano: number) => Math.min(ANO_MAX, Math.max(ANO_MIN, ano));

/**
 * Year picker for a work's year of composition, the sibling of
 * `SeletorDeData`: the same field and floating panel, with the year typed or
 * stepped (no grid of years reaches 1685), an optional last year for a work
 * written over several ("1830–1835") and "approximate".
 *
 * `valor` is the stored text; what the picker cannot keep ("1837, Paris")
 * shows under the field as recorded, and nothing is rewritten until the
 * person changes something. `aoMudar` receives the stored shape
 * (`escreverAno`: "1830-1835 ca."), or '' when cleared.
 */
export function SeletorDeAno({
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

  const { ano, inexato } = lerAno(valor);
  const [inicioTexto, setInicioTexto] = useState(ano ? String(ano.inicio) : '');
  const [fimTexto, setFimTexto] = useState(ano?.fim ? String(ano.fim) : '');
  // "Approximate" can be ticked before there is a year: it is kept here and
  // goes into the text with the first year chosen.
  const [aproximado, setAproximado] = useState(ano?.aproximado ?? false);

  // Outro valor de fora (o formulário reabriu): os anos digitados acompanham.
  useEffect(() => {
    setInicioTexto(ano ? String(ano.inicio) : '');
    setFimTexto(ano?.fim ? String(ano.fim) : '');
    if (ano) setAproximado(ano.aproximado);
    // Só o texto gravado importa; `ano` é derivado dele.
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
  });

  useEffect(() => {
    if (!aberta) return;
    entradaAno.current?.focus({ preventScroll: true });
    if (painel.current) painel.current.scrollTop = 0;
  }, [aberta]);

  const mudar = (a: AnoDeComposicao | null) => aoMudar(a ? escreverAno(a) : '');
  const limpar = () => {
    setInicioTexto('');
    setFimTexto('');
    mudar(null);
  };

  const comInicio = (inicio: number): AnoDeComposicao => ({
    inicio,
    // An end before the new start no longer makes a span.
    fim: ano?.fim && ano.fim > inicio ? ano.fim : null,
    aproximado: ano?.aproximado ?? aproximado,
  });
  const digitarInicio = (texto: string) => {
    const limpo = texto.replace(/\D/g, '').slice(0, 4);
    setInicioTexto(limpo);
    const n = Number(limpo);
    if (limpo.length >= 3 && n >= ANO_MIN && n <= ANO_MAX) mudar(comInicio(n));
  };
  const passarInicio = (passo: number) => {
    const n = limitar((ano?.inicio ?? ANO_MAX) + passo);
    setInicioTexto(String(n));
    mudar(comInicio(n));
  };

  const digitarFim = (texto: string) => {
    const limpo = texto.replace(/\D/g, '').slice(0, 4);
    setFimTexto(limpo);
    if (!ano) return;
    if (!limpo) return mudar({ ...ano, fim: null });
    const n = Number(limpo);
    if (limpo.length === 4 && n > ano.inicio && n <= ANO_MAX)
      mudar({ ...ano, fim: n });
  };
  const passarFim = (passo: number) => {
    if (!ano) return;
    const n = limitar((ano.fim ?? ano.inicio) + passo);
    if (n <= ano.inicio) {
      setFimTexto('');
      return mudar({ ...ano, fim: null });
    }
    setFimTexto(String(n));
    mudar({ ...ano, fim: n });
  };

  const aoTeclar = (e: ReactKeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      fechar();
    }
  };

  const seta =
    'grid h-9 w-9 shrink-0 place-items-center rounded-full text-texto-suave hover:bg-[var(--interactive-hover)] hover:text-texto disabled:cursor-not-allowed disabled:opacity-40';

  const passo = (
    rotulo: string,
    idEntrada: string,
    texto: string,
    aoDigitar: (t: string) => void,
    aoPassar: (p: number) => void,
    desligado = false,
    ref?: typeof entradaAno
  ) => (
    <div className="flex flex-col gap-2">
      <label htmlFor={idEntrada} className="t-legenda font-medium text-texto">
        {rotulo}
      </label>
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label={t.anterior}
          onClick={() => aoPassar(-1)}
          disabled={desligado}
          className={seta}
        >
          <PiCaretLeft aria-hidden className="h-4 w-4" />
        </button>
        <input
          ref={ref}
          id={idEntrada}
          inputMode="numeric"
          autoComplete="off"
          value={texto}
          disabled={desligado}
          onChange={(e) => aoDigitar(e.target.value)}
          placeholder={String(ANO_MAX)}
          className="input-classical min-w-0 flex-1 px-3 text-center tabular-nums disabled:opacity-40"
        />
        <button
          type="button"
          aria-label={t.seguinte}
          onClick={() => aoPassar(1)}
          disabled={desligado}
          className={seta}
        >
          <PiCaretRight aria-hidden className="h-4 w-4" />
        </button>
      </div>
    </div>
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
          className="min-w-0 flex-1 truncate bg-transparent text-left tabular-nums outline-none focus-visible:shadow-none"
          {...aria}
        >
          {ano ? (
            mostrarAno(ano)
          ) : (
            <span className="text-texto-fraco">{t.escolher}</span>
          )}
        </button>
        {ano && (
          <button
            type="button"
            aria-label={t.limpar}
            onClick={(e) => {
              e.stopPropagation();
              limpar();
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
      {inexato && valor.trim() && (
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
          <div className="flex w-full min-w-[17rem] flex-col gap-4">
            {passo(
              t.ano,
              `${base}-ano`,
              inicioTexto,
              digitarInicio,
              passarInicio,
              false,
              entradaAno
            )}
            {passo(t.ate, `${base}-fim`, fimTexto, digitarFim, passarFim, !ano)}
            <CaixaDeMarcar
              rotulo={t.aproximado}
              marcado={ano?.aproximado ?? aproximado}
              aoMudar={(marcado) => {
                setAproximado(marcado);
                if (ano) mudar({ ...ano, aproximado: marcado });
              }}
            />
            <div className="flex items-center justify-end gap-2 border-t border-linha pt-3">
              {ano && (
                <Button
                  variante="fantasma"
                  tamanho="p"
                  onClick={limpar}
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
