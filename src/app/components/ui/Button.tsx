import {
  isValidElement,
  type ButtonHTMLAttributes,
  type ComponentType,
  type ReactNode,
  type Ref,
  type SVGProps,
} from 'react';
import { cx } from './cx';
import { Icon } from './Icon';
import { NomeAcao } from './NomeAcao';

/**
 * O botão do sistema.
 *
 * **976 botões escritos à mão** no front, cada um decidindo o próprio raio,
 * peso, cor e altura. Nenhum primitivo compartilhado, e só 42 arquivos com
 * anel de foco próprio: o resto depende do contorno padrão do navegador, que
 * muda de forma entre Chrome, Safari e Firefox e não pertence a design system
 * nenhum.
 *
 * **O principal é degradê**, do ouro claro ao ouro de marca, sempre com texto
 * escuro: branco sobre ouro dá 2,07:1 e reprova; escuro sobre ouro dá 9,23:1.
 * Uma ação principal por tela.
 *
 * **Altura mínima de 44px** mesmo no site. É o alvo de toque que o aplicativo
 * vai herdar, e hoje o projeto tem 784 controles de 32px, metade do
 * recomendado num telefone.
 */

type Variante = 'primario' | 'secundario' | 'fantasma' | 'perigo' | 'texto';
type Tamanho = 'p' | 'm';

const VARIANTE: Record<Variante, string> = {
  primario: 'fill-ouro text-sobre-ouro border-transparent font-semibold',
  secundario:
    'fundo-sup-2 text-texto border-linha-forte font-medium hover:border-ouro/50 hover:text-ouro-texto',
  fantasma:
    'bg-transparent text-texto-suave border-transparent hover:text-texto hover:bg-[var(--interactive-hover)] font-medium',
  perigo:
    'bg-erro text-sobre-erro border-transparent font-semibold hover:bg-[color-mix(in_srgb,var(--erro)_86%,var(--texto))]',
  /**
   * Ação com cara de link, no meio do texto ou ao pé de um bloco ("Voltar",
   * "Ver todos os resultados", "Limpar filtros"). Sem fundo, sem moldura e
   * sem a altura mínima: ela mora numa linha de texto. Eram botões escritos à
   * mão, cada um com o seu dourado.
   */
  texto:
    'bg-transparent border-transparent text-ouro-texto font-medium hover:underline underline-offset-4 !min-h-0 !px-0',
};

const TAMANHO: Record<Tamanho, string> = {
  /** Denso, para barras e tabelas. Continua com 44px de alvo no toque. */
  p: 'min-h-9 text-sm [@media(pointer:coarse)]:min-h-[var(--alvo)]',
  m: 'min-h-[var(--alvo)] text-[0.9375rem]',
};

/**
 * Recuo lateral só com texto. Estava dentro de `TAMANHO`, e o `px-0` do botão
 * só de ícone perdia para o `px-5` (o CSS gerado põe o `px-5` depois): todo
 * botão de ícone saía mais largo que alto, apesar do `aspect-square`.
 */
const RECUO: Record<Tamanho, string> = { p: 'px-3.5', m: 'px-5' };

interface BaseProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** No React 19 o `ref` chega como prop e segue para o `<button>`. */
  ref?: Ref<HTMLButtonElement>;
  variante?: Variante;
  tamanho?: Tamanho;
  icone?: ComponentType<SVGProps<SVGSVGElement>>;
  /** Mostra o girador e bloqueia o clique. Girador só aqui, nunca ocupando a página. */
  carregando?: boolean;
}

/**
 * Com texto, o texto é o nome. Só com ícone, `rotulo` é **obrigatório** — o
 * tipo recusa o botão sem ele. Era o `button-name` que o Lighthouse reprovava
 * em `/works`, `/composers` e no blog: botões de ícone que o leitor de tela
 * anunciava só como "botão".
 */
export type ButtonProps = BaseProps &
  (
    | { children: ReactNode; rotulo?: string }
    | {
        children?: undefined;
        rotulo: string;
        icone: ComponentType<SVGProps<SVGSVGElement>>;
      }
  );

/**
 * As classes do botão, para o que **navega**. Link com cara de botão
 * ("Explorar compositores", "Ver planos") continua sendo `<a>` — botão que
 * troca de página quebra o abrir em nova aba e o que o leitor de tela anuncia.
 */
export function classesDeBotao(
  variante: Variante = 'secundario',
  tamanho: Tamanho = 'm',
  soIcone = false
) {
  return cx(
    'inline-flex items-center justify-center gap-2 rounded-controle border',
    'transition-[transform,background-color,border-color,color] duration-[var(--t-toque)] ease-saida',
    'active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100',
    'disabled:cursor-not-allowed disabled:opacity-40',
    VARIANTE[variante],
    TAMANHO[tamanho],
    soIcone ? 'aspect-square' : RECUO[tamanho]
  );
}

export function Button({
  variante = 'secundario',
  tamanho = 'm',
  icone,
  carregando = false,
  rotulo,
  disabled,
  className,
  children,
  ...resto
}: ButtonProps) {
  // Só ícone também quando o único filho é o nome para leitor de tela
  // (`NomeAcao`), que não ocupa lugar na tela.
  const soIcone =
    !children || (isValidElement(children) && children.type === NomeAcao);

  return (
    <button
      type="button"
      aria-label={rotulo}
      aria-busy={carregando || undefined}
      disabled={disabled || carregando}
      className={cx(classesDeBotao(variante, tamanho, soIcone), className)}
      {...resto}
    >
      {carregando ? (
        <span
          className="h-4 w-4 animate-spin rounded-full border-2 border-current/25 border-t-current motion-reduce:animate-none"
          aria-hidden="true"
        />
      ) : (
        icone && <Icon de={icone} tamanho={tamanho === 'p' ? 'pp' : 'p'} />
      )}
      {children}
    </button>
  );
}
