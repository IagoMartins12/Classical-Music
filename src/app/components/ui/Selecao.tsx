'use client';

import {
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import type {
  ComponentType,
  FocusEventHandler,
  KeyboardEvent as ReactKeyboardEvent,
  Ref,
  SVGProps,
} from 'react';
import { PiCaretDown, PiCheck } from 'react-icons/pi';
import { cx } from './cx';
import { useListaFlutuante } from './useListaFlutuante';

/**
 * O select do sistema: um *select-only combobox* (WAI-ARIA APG), no lugar do
 * `<select>` nativo, cuja lista é desenhada pelo sistema operacional e não
 * aceita estilo nenhum.
 *
 * **Teclado, como num select nativo.** Fechado: ↓ ↑ Enter e Espaço abrem.
 * Aberto: ↓ ↑ andam (pulando o desabilitado), Home/End vão às pontas, Enter,
 * Espaço e Tab escolhem, Esc fecha sem mudar. Digitar letras pula para a opção
 * que começa com elas, aberto ou fechado. O leitor de tela acompanha a opção
 * ativa por `aria-activedescendant`, sem o foco sair do botão.
 *
 * **A lista abre na camada de topo** (Popover API): nenhum `overflow` de card
 * a corta e nenhum diálogo a cobre — o `Sheet` também está na camada de topo,
 * e o que abre depois fica por cima. A posição acompanha o botão na rolagem, e
 * a lista abre para cima quando não cabe embaixo.
 *
 * O `ref` aponta para o botão: é o que as telas usam para focar o primeiro
 * campo com erro. O `name` vai num campo oculto, para formulário nativo.
 */

export interface OpcaoSelecao {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelecaoProps {
  opcoes: OpcaoSelecao[];
  valor: string;
  aoMudar: (valor: string) => void;
  placeholder?: string;
  id?: string;
  name?: string;
  disabled?: boolean;
  invalido?: boolean;
  /** Ligação com rótulo e mensagens, quando quem usa já tem os ids. */
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  /**
   * Ícone à esquerda, dentro do campo (o relógio do filtro de período, a nota
   * do filtro de gênero). Fica dentro do botão: desenhado por fora, com
   * `absolute`, ele ficava atrás do fundo do campo e só sobrava o recuo.
   */
  icone?: ComponentType<SVGProps<SVGSVGElement>>;
  /** Classes do botão (largura, altura). A aparência vem de `.input-classical`. */
  className?: string;
  onBlur?: FocusEventHandler<HTMLButtonElement>;
  onFocus?: FocusEventHandler<HTMLButtonElement>;
  ref?: Ref<HTMLButtonElement | null>;
}

export function Selecao({
  opcoes,
  valor,
  aoMudar,
  placeholder,
  id,
  name,
  disabled = false,
  invalido = false,
  icone: Icone,
  className,
  onBlur,
  onFocus,
  ref,
  ...aria
}: SelecaoProps) {
  const base = useId();
  const idBotao = id ?? `${base}-selecao`;
  const idLista = `${base}-lista`;
  const idOpcao = (i: number) => `${base}-opcao-${i}`;

  const botao = useRef<HTMLButtonElement>(null);
  const lista = useRef<HTMLUListElement>(null);
  useImperativeHandle(ref, () => botao.current as HTMLButtonElement, []);

  const [aberta, setAberta] = useState(false);
  const [ativa, setAtiva] = useState(-1);
  const busca = useRef({ texto: '', ate: 0 });

  const indiceSelecionado = useMemo(
    () => opcoes.findIndex((o) => o.value === valor),
    [opcoes, valor]
  );
  const selecionada = indiceSelecionado >= 0 ? opcoes[indiceSelecionado] : null;
  const mostraPlaceholder =
    !selecionada || (selecionada.value === '' && !!placeholder);

  const habilitada = useCallback(
    (i: number) => i >= 0 && i < opcoes.length && !opcoes[i].disabled,
    [opcoes]
  );

  const proxima = useCallback(
    (de: number, passo: 1 | -1) => {
      for (let i = de + passo; i >= 0 && i < opcoes.length; i += passo) {
        if (habilitada(i)) return i;
      }
      return de;
    },
    [opcoes.length, habilitada]
  );

  const primeira = useCallback(() => proxima(-1, 1), [proxima]);
  const ultima = useCallback(
    () => proxima(opcoes.length, -1),
    [proxima, opcoes.length]
  );

  // ---- abrir e fechar -----------------------------------------------------

  const abrir = useCallback(
    (destaque?: number) => {
      if (disabled) return;
      setAtiva(
        destaque ??
          (habilitada(indiceSelecionado) ? indiceSelecionado : primeira())
      );
      setAberta(true);
    },
    [disabled, habilitada, indiceSelecionado, primeira]
  );

  const fechar = useCallback((devolverFoco = true) => {
    setAberta(false);
    if (devolverFoco) botao.current?.focus();
  }, []);

  const escolher = useCallback(
    (i: number) => {
      if (!habilitada(i)) return;
      if (opcoes[i].value !== valor) aoMudar(opcoes[i].value);
      fechar();
    },
    [habilitada, opcoes, valor, aoMudar, fechar]
  );

  const { acima } = useListaFlutuante({
    ancora: botao,
    lista,
    aberta,
    aoClicarFora: useCallback(() => fechar(false), [fechar]),
  });

  // A opção ativa sempre à vista dentro da lista.
  useEffect(() => {
    if (!aberta || ativa < 0) return;
    document
      .getElementById(idOpcao(ativa))
      ?.scrollIntoView({ block: 'nearest' });
  }, [aberta, ativa]);

  // ---- teclado ------------------------------------------------------------

  const buscarPorTexto = (tecla: string) => {
    const agora = Date.now();
    busca.current.texto =
      (agora < busca.current.ate ? busca.current.texto : '') +
      tecla.toLowerCase();
    busca.current.ate = agora + 600;
    const inicio = aberta ? ativa : indiceSelecionado;
    const ordem = [...opcoes.keys()].map(
      (k) =>
        (k + Math.max(inicio, 0) + (busca.current.texto.length === 1 ? 1 : 0)) %
        opcoes.length
    );
    const achada = ordem.find(
      (i) =>
        habilitada(i) &&
        opcoes[i].label.toLowerCase().startsWith(busca.current.texto)
    );
    if (achada === undefined) return;
    if (aberta) setAtiva(achada);
    else if (opcoes[achada].value !== valor) aoMudar(opcoes[achada].value);
  };

  const aoTeclar = (e: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    const { key } = e;

    if (!aberta) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(key)) {
        e.preventDefault();
        abrir(
          key === 'ArrowUp' && !habilitada(indiceSelecionado)
            ? ultima()
            : undefined
        );
      } else if (key === 'Home' || key === 'End') {
        e.preventDefault();
        abrir(key === 'Home' ? primeira() : ultima());
      } else if (key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        buscarPorTexto(key);
      }
      return;
    }

    switch (key) {
      case 'ArrowDown':
        e.preventDefault();
        setAtiva((a) => proxima(a, 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (e.altKey) escolher(ativa);
        else setAtiva((a) => proxima(a, -1));
        break;
      case 'Home':
        e.preventDefault();
        setAtiva(primeira());
        break;
      case 'End':
        e.preventDefault();
        setAtiva(ultima());
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        escolher(ativa);
        break;
      case 'Escape':
        e.preventDefault();
        fechar();
        break;
      case 'Tab':
        // Tab escolhe e segue o fluxo normal do foco, como no nativo.
        if (habilitada(ativa) && opcoes[ativa].value !== valor)
          aoMudar(opcoes[ativa].value);
        setAberta(false);
        break;
      default:
        if (key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey)
          buscarPorTexto(key);
    }
  };

  return (
    <>
      <button
        ref={botao}
        id={idBotao}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={aberta}
        aria-controls={idLista}
        aria-activedescendant={
          aberta && ativa >= 0 ? idOpcao(ativa) : undefined
        }
        aria-invalid={invalido || undefined}
        aria-disabled={disabled || undefined}
        disabled={disabled}
        onClick={() => (aberta ? fechar() : abrir())}
        onKeyDown={aoTeclar}
        onBlur={onBlur}
        onFocus={onFocus}
        className={cx(
          'input-classical group flex w-full cursor-pointer items-center gap-2 pl-4 pr-3 text-left',
          aberta && 'selecao-aberta',
          className
        )}
        {...aria}
      >
        {Icone && (
          <Icone
            aria-hidden
            className="-ml-1 h-5 w-5 shrink-0 text-texto-fraco"
          />
        )}
        <span
          className={cx(
            'flex-1 truncate',
            mostraPlaceholder && 'text-texto-fraco'
          )}
        >
          {mostraPlaceholder
            ? (placeholder ?? selecionada?.label ?? '')
            : selecionada?.label}
        </span>
        <PiCaretDown
          className={cx(
            'h-4 w-4 shrink-0 text-texto-suave transition-transform duration-[var(--t-resposta)] ease-saida motion-reduce:transition-none',
            aberta && 'rotate-180 text-ouro-texto'
          )}
        />
      </button>

      {name && <input type="hidden" name={name} value={valor} />}

      <ul
        ref={lista}
        id={idLista}
        role="listbox"
        popover="manual"
        tabIndex={-1}
        aria-labelledby={aria['aria-labelledby'] ?? idBotao}
        className={cx(
          'selecao-lista classical-scrollbar-mini',
          acima && 'selecao-acima'
        )}
        // Clique numa opção não pode tirar o foco do botão: é por ele que o
        // teclado e o leitor de tela seguem a lista.
        onPointerDown={(e) => e.preventDefault()}
      >
        {aberta &&
          opcoes.map((o, i) => {
            const escolhida = i === indiceSelecionado;
            return (
              <li
                key={`${o.value}-${i}`}
                id={idOpcao(i)}
                role="option"
                aria-selected={escolhida}
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
                <span className="flex-1 truncate">{o.label}</span>
                {escolhida && (
                  <PiCheck className="h-4 w-4 shrink-0 text-ouro-texto" />
                )}
              </li>
            );
          })}
      </ul>
    </>
  );
}
