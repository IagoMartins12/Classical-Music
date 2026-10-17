'use client';

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ComponentType,
  type KeyboardEvent as ReactKeyboardEvent,
  type SVGProps,
} from 'react';
import { PiCaretDown, PiCheck, PiSpinnerGap, PiX } from 'react-icons/pi';
import Image from '@/app/components/SmartImage';
import type { OpcaoSelecao } from './Selecao';
import { cx } from './cx';
import { useListaFlutuante } from './useListaFlutuante';

const norm = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/**
 * The system select with a text filter: an editable combobox (WAI-ARIA APG,
 * list autocomplete). Same look and floating list as `Selecao`; typing
 * narrows the options.
 *
 * Two sources: `opcoes` (a known list, filtered here, accents ignored) or
 * `buscar` (a search run as the person types, for lists too big to load:
 * composers). With `buscar`, `rotulo` names the chosen value, which the
 * loaded options may not contain.
 *
 * Keyboard: ↓ ↑ move, Enter picks, Esc closes and restores the chosen
 * label; leaving the field restores it too, so the text always says what is
 * chosen.
 */
export function SelecaoComBusca({
  opcoes,
  buscar,
  valor,
  rotulo,
  aoMudar,
  placeholder,
  vazio = 'Nada encontrado',
  limpavel = false,
  rotuloLimpar = 'Limpar',
  disabled = false,
  invalido = false,
  icone: Icone,
  id,
  className,
  ...aria
}: {
  opcoes?: OpcaoSelecao[];
  buscar?: (texto: string) => Promise<OpcaoSelecao[]>;
  valor: string;
  /** Label of the chosen value when it may not be among `opcoes`. */
  rotulo?: string;
  aoMudar: (valor: string, opcao: OpcaoSelecao | null) => void;
  placeholder?: string;
  /** What the list says when nothing matches. */
  vazio?: string;
  /** Shows a button that clears the choice. */
  limpavel?: boolean;
  rotuloLimpar?: string;
  disabled?: boolean;
  invalido?: boolean;
  icone?: ComponentType<SVGProps<SVGSVGElement>>;
  id?: string;
  /** Classes of the field (width, height, pill shape). */
  className?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
}) {
  const base = useId();
  const idCampo = id ?? `${base}-campo`;
  const idLista = `${base}-lista`;
  const idOpcao = (i: number) => `${base}-opcao-${i}`;

  const campo = useRef<HTMLDivElement>(null);
  const entrada = useRef<HTMLInputElement>(null);
  const lista = useRef<HTMLUListElement>(null);

  const [aberta, setAberta] = useState(false);
  const [texto, setTexto] = useState<string | null>(null);
  const [ativa, setAtiva] = useState(-1);
  const [remotas, setRemotas] = useState<OpcaoSelecao[]>([]);
  const [buscando, setBuscando] = useState(false);

  const escolhida =
    opcoes?.find((o) => o.value === valor) ??
    remotas.find((o) => o.value === valor);
  const rotuloAtual = valor ? (escolhida?.label ?? rotulo ?? '') : '';

  // Known list: filter here. Search: ask, debounced, and keep the answer.
  const visiveis = useMemo(() => {
    if (buscar) return remotas;
    const todas = opcoes ?? [];
    if (!texto) return todas;
    const q = norm(texto.trim());
    return todas.filter((o) => norm(o.label).includes(q));
  }, [buscar, remotas, opcoes, texto]);

  useEffect(() => {
    if (!buscar || !aberta) return;
    let vivo = true;
    setBuscando(true);
    const t = setTimeout(
      () => {
        buscar(texto?.trim() ?? '')
          .then((r) => vivo && setRemotas(r))
          .catch(() => vivo && setRemotas([]))
          .finally(() => vivo && setBuscando(false));
      },
      texto ? 250 : 0
    );
    return () => {
      vivo = false;
      clearTimeout(t);
    };
  }, [buscar, texto, aberta]);

  useEffect(() => {
    if (aberta) setAtiva(visiveis.length ? 0 : -1);
  }, [aberta, visiveis]);

  const fechar = useCallback(() => {
    setAberta(false);
    setTexto(null);
  }, []);

  const { acima } = useListaFlutuante({
    ancora: campo,
    lista,
    aberta,
    aoClicarFora: fechar,
    conteudo: visiveis.length,
  });

  useEffect(() => {
    if (!aberta || ativa < 0) return;
    document
      .getElementById(idOpcao(ativa))
      ?.scrollIntoView({ block: 'nearest' });
  }, [aberta, ativa]);

  const escolher = (i: number) => {
    const o = visiveis[i];
    if (!o || o.disabled) return;
    if (o.value !== valor) aoMudar(o.value, o);
    fechar();
    entrada.current?.blur();
  };

  const aoTeclar = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (!aberta) setAberta(true);
        else setAtiva((a) => Math.min(a + 1, visiveis.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setAtiva((a) => Math.max(a - 1, 0));
        break;
      case 'Enter':
        if (aberta && ativa >= 0) {
          e.preventDefault();
          escolher(ativa);
        }
        break;
      case 'Escape':
        if (aberta) {
          e.preventDefault();
          fechar();
        }
        break;
      case 'Tab':
        fechar();
        break;
    }
  };

  return (
    <>
      <div
        ref={campo}
        className={cx(
          'input-classical group flex w-full items-center gap-2 pl-4 pr-3',
          aberta && 'selecao-aberta',
          disabled && 'cursor-not-allowed opacity-60',
          className
        )}
        onClick={() => !disabled && entrada.current?.focus()}
      >
        {Icone && (
          <Icone
            aria-hidden
            className="-ml-1 h-5 w-5 shrink-0 text-texto-fraco"
          />
        )}
        <input
          ref={entrada}
          id={idCampo}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={aberta}
          aria-controls={idLista}
          aria-activedescendant={
            aberta && ativa >= 0 ? idOpcao(ativa) : undefined
          }
          aria-invalid={invalido || undefined}
          autoComplete="off"
          spellCheck={false}
          disabled={disabled}
          value={texto ?? rotuloAtual}
          placeholder={placeholder}
          onFocus={(e) => {
            e.currentTarget.select();
            setAberta(true);
          }}
          onChange={(e) => {
            setTexto(e.target.value);
            setAberta(true);
          }}
          onKeyDown={aoTeclar}
          className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-texto-fraco"
          {...aria}
        />
        {buscando && aberta && (
          <PiSpinnerGap
            aria-hidden
            className="h-4 w-4 shrink-0 animate-spin text-texto-fraco"
          />
        )}
        {limpavel && valor && !disabled && (
          <button
            type="button"
            aria-label={rotuloLimpar}
            onClick={(e) => {
              e.stopPropagation();
              aoMudar('', null);
              fechar();
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

      <ul
        ref={lista}
        id={idLista}
        role="listbox"
        popover="manual"
        tabIndex={-1}
        aria-labelledby={aria['aria-labelledby'] ?? idCampo}
        className={cx(
          'selecao-lista classical-scrollbar-mini',
          acima && 'selecao-acima'
        )}
        // Picking an option must not take the focus off the field.
        onPointerDown={(e) => e.preventDefault()}
      >
        {aberta &&
          (visiveis.length ? (
            visiveis.map((o, i) => (
              <li
                key={`${o.value}-${i}`}
                id={idOpcao(i)}
                role="option"
                aria-selected={o.value === valor}
                aria-disabled={o.disabled || undefined}
                data-ativa={i === ativa || undefined}
                className="selecao-opcao"
                onPointerMove={() => !o.disabled && ativa !== i && setAtiva(i)}
                onClick={(e) => {
                  // Inside a <label>, the click would also reach the label,
                  // which clicks the field again and reopens the list.
                  e.preventDefault();
                  escolher(i);
                }}
              >
                {o.retrato && <Retrato {...o.retrato} />}
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate">{o.label}</span>
                  {o.detalhe && (
                    <span className="t-dado truncate text-[0.75rem] text-texto-fraco">
                      {o.detalhe}
                    </span>
                  )}
                </span>
                {o.value === valor && (
                  <PiCheck className="h-4 w-4 shrink-0 text-ouro-texto" />
                )}
              </li>
            ))
          ) : (
            <li className="px-3 py-2 text-[0.9375rem] text-texto-fraco">
              {buscando ? '…' : vazio}
            </li>
          ))}
      </ul>
    </>
  );
}

/** The option's portrait, or its initial in gold when there is no photo. */
function Retrato({ src, nome }: { src: string | null; nome: string }) {
  return (
    <span className="relative grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full bg-sup-2 font-display text-[0.9375rem] text-ouro-texto">
      {src ? (
        <Image
          src={src}
          alt=""
          fill
          sizes="36px"
          className="object-cover object-top"
        />
      ) : (
        <span aria-hidden="true">{nome.trim().charAt(0)}</span>
      )}
    </span>
  );
}
