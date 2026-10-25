'use client';

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { PiArrowDown, PiArrowRight } from 'react-icons/pi';
import toast from 'react-hot-toast';
import LocalizedLink from '@/app/components/LocalizedLink';
import { BotaoCriarConta } from '@/app/components/auth/BotaoCriarConta';
import { Button, classesDeBotao } from '@/app/components/ui/Button';
import { NumeroRolante } from '@/app/components/ui/NumeroRolante';
import { Revelar } from '@/app/components/ui/Revelar';
import { VistoQueSeDesenha } from '@/app/components/ui/VistoQueSeDesenha';
import { cx } from '@/app/components/ui/cx';
import { PLANOS, type ChavePlano } from '@/app/conteudo/planos';
import type { Idioma } from '@/app/conteudo/legal/tipos';
import { useSubscription } from '@/app/hooks/useSubscription';
import { useSession } from '@/app/libs/session';
import { useLoginModal } from '@/app/stores/authStore';
import { Confirmar } from './ConfirmarAssinatura';
import {
  formatarPreco,
  maiorDesconto,
  partesDoPreco,
  type PlanoPago,
  type Precos,
} from './precos';

/**
 * Os quatro planos, em dois grupos — estudar (Free, Plus) e ensinar (Mentor,
 * Maestro) —, com a troca de período e a ação de cada um.
 *
 * **O plano atual chega do servidor** (`planoInicial`): a página já nasce
 * com "Seu plano" no lugar certo, sem esperar o navegador perguntar à API.
 * O estado do navegador só assume depois de carregado — para quem entra ou
 * troca de plano sem recarregar.
 *
 * **Uma ação principal.** Para quem não entrou, é "Criar conta grátis". Não
 * há plano "mais popular" — seria um número que ninguém mediu.
 *
 * **No telefone, carrossel.** Quatro planos empilhados davam uma página sem
 * fim; ali cada plano é um cartão que se arrasta, com o próximo aparecendo na
 * borda, e o seletor "Para estudar / Para ensinar" pula de grupo.
 */
type Grupo = 'estudar' | 'ensinar';

type Props = {
  idioma: Idioma;
  precos: Precos;
  /** Plano atual lido no servidor; `null` para visitante. */
  planoInicial: ChavePlano | null;
  /** Só um grupo (a página para professores mostra "Para ensinar"). */
  grupo?: Grupo;
  /** Para onde vai o "comparar todos os planos"; na /pricing, a tabela abaixo. */
  comparar?: string;
};

const DO_GRUPO: Record<Grupo, ChavePlano[]> = {
  estudar: ['FREE', 'PLUS'],
  ensinar: ['MENTOR', 'MAESTRO'],
};

const ORDEM: ChavePlano[] = ['FREE', 'PLUS', 'MENTOR', 'MAESTRO'];

export function QuadroDePlanos({
  idioma,
  precos,
  planoInicial,
  grupo,
  comparar = '#comparacao',
}: Props) {
  const c = PLANOS[idioma];
  const [anual, setAnual] = useState(false);
  const [escolhido, setEscolhido] = useState<PlanoPago | null>(null);
  // `/pricing#plus` (o convite de um recurso do plano): o plano já vem
  // selecionado, com o contorno e o botão em destaque.
  const [selecionado, setSelecionado] = useState<ChavePlano | null>(null);
  useEffect(() => {
    const plano = window.location.hash.slice(1).toUpperCase() as ChavePlano;
    if (ORDEM.includes(plano) && plano !== 'FREE') setSelecionado(plano);
  }, []);
  const { status } = useSession();
  const { open: abrirLogin } = useLoginModal();
  const { loading, getCurrentPlan, createStripeCheckout } = useSubscription();

  // Enquanto o navegador não sabe, vale o que o servidor disse.
  const logado =
    status === 'authenticated' ||
    (status === 'loading' && planoInicial !== null);
  const atual: ChavePlano | null = !logado
    ? null
    : status === 'authenticated' && !loading
      ? (getCurrentPlan() as ChavePlano)
      : planoInicial;
  const desconto = maiorDesconto(precos);
  const soUm = !!grupo;

  function escolher(plano: PlanoPago) {
    if (!logado) {
      toast(c.confirmar.entrar);
      abrirLogin();
      return;
    }
    setEscolhido(plano);
  }

  function acao(plano: ChavePlano) {
    if (plano === 'FREE') {
      if (atual === 'FREE') {
        return (
          <Button disabled className="w-full">
            {c.estado.planoAtual}
          </Button>
        );
      }
      if (atual) {
        return (
          <p className="text-sm leading-relaxed text-texto-fraco">
            {c.estado.voltarAoFree}
          </p>
        );
      }
      return (
        <BotaoCriarConta variante="primario" className="w-full">
          {c.planos.FREE.acao}
        </BotaoCriarConta>
      );
    }
    if (!precos[plano]) {
      return (
        <Button disabled className="w-full">
          {c.preco.indisponivel}
        </Button>
      );
    }
    if (atual === plano) {
      return (
        <Button disabled className="w-full">
          {c.estado.planoAtual}
        </Button>
      );
    }
    // Quem já tem plano pago muda pela assinatura, no perfil: subir cobra só
    // a diferença, descer fica para a renovação, e cancelada ou atrasada tem o
    // seu caminho lá. Um checkout novo por cima duplicaria a cobrança (o subir
    // por aqui dava erro, achado B1 de 21/10).
    if (atual && atual !== 'FREE') {
      return (
        <LocalizedLink
          href="/profile"
          className={cx(classesDeBotao(), 'w-full')}
        >
          {c.estado.gerenciar}
        </LocalizedLink>
      );
    }
    return (
      <Button
        className="w-full"
        variante={selecionado === plano ? 'primario' : undefined}
        onClick={() => escolher(plano)}
      >
        {c.planos[plano].acao}
      </Button>
    );
  }

  const cartao = (plano: ChavePlano, sufixo: string, ordem: number) => (
    <CartaoDoPlano
      key={plano}
      plano={plano}
      idioma={idioma}
      anual={anual}
      precos={precos}
      atual={atual === plano}
      selecionado={selecionado === plano && atual !== plano}
      sufixo={sufixo}
      ordem={ordem}
      acao={acao(plano)}
    />
  );

  return (
    <>
      <div className="section-wrap mt-10">
        <SeletorDePeriodo
          anual={anual}
          aoMudar={setAnual}
          idioma={idioma}
          desconto={desconto}
        />
      </div>

      <CarrosselDePlanos idioma={idioma} grupo={grupo}>
        {(grupo ? DO_GRUPO[grupo] : ORDEM).map((p, i) => cartao(p, 'm', i))}
      </CarrosselDePlanos>

      <div
        className={cx(
          'section-wrap mt-10 hidden gap-12 md:grid',
          !grupo && 'xl:grid-cols-2 xl:gap-8'
        )}
      >
        {(grupo ? [grupo] : (['estudar', 'ensinar'] as const)).map(
          (grupo, g) => {
            const planos = DO_GRUPO[grupo];
            return (
              <Revelar
                as="section"
                key={grupo}
                id={grupo}
                aria-labelledby={`${grupo}-titulo`}
                className="flex scroll-mt-28 flex-col"
                style={{ transitionDelay: `${g * 120}ms` }}
              >
                <h2
                  id={`${grupo}-titulo`}
                  className={cx(
                    'classical-title text-2xl leading-tight text-texto md:text-[2rem]',
                    // A page showing one group already titles it.
                    soUm && 'sr-only'
                  )}
                >
                  {c.grupos[grupo].titulo}
                </h2>
                <p
                  className={cx(
                    'mt-2 max-w-[52ch] text-[0.9375rem] leading-relaxed text-texto-suave xl:min-h-[3.25em]',
                    soUm && 'hidden'
                  )}
                >
                  {c.grupos[grupo].texto}
                </p>
                <div className="mt-6 grid flex-1 grid-cols-2 overflow-hidden rounded-card bg-sup-2">
                  {planos.map((p, i) => (
                    <div
                      key={p}
                      className={cx('flex', i > 0 && 'border-l border-linha')}
                    >
                      {cartao(p, 'd', g * 2 + i)}
                    </div>
                  ))}
                </div>
              </Revelar>
            );
          }
        )}
      </div>

      <p className="section-wrap mt-6 md:mt-8">
        <LocalizedLink
          href={comparar}
          className="inline-flex min-h-6 items-center gap-1.5 text-[0.9375rem] font-medium text-ouro-texto underline decoration-ouro/40 underline-offset-[5px] transition-colors hover:decoration-ouro"
        >
          {c.comparar}
          {comparar.startsWith('#') ? (
            <PiArrowDown aria-hidden="true" className="h-3.5 w-3.5" />
          ) : (
            <PiArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
          )}
        </LocalizedLink>
      </p>

      {escolhido && precos[escolhido] && (
        <Confirmar
          idioma={idioma}
          plano={escolhido}
          anual={anual && Boolean(precos[escolhido]?.anual)}
          precos={precos}
          pagarNoStripe={createStripeCheckout}
          aoFechar={() => setEscolhido(null)}
        />
      )}
    </>
  );
}

/**
 * Mensal ou anual: um grupo de rádio (escolhe um valor, não troca de aba), com
 * o marcador que desliza até a opção escolhida.
 */
function SeletorDePeriodo({
  anual,
  aoMudar,
  idioma,
  desconto,
}: {
  anual: boolean;
  aoMudar: (anual: boolean) => void;
  idioma: Idioma;
  desconto: number | null;
}) {
  const c = PLANOS[idioma].periodo;
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const [marca, setMarca] = useState<{ x: number; w: number } | null>(null);

  useLayoutEffect(() => {
    const medir = () => {
      const b = refs.current[anual ? 1 : 0];
      if (b) setMarca({ x: b.offsetLeft, w: b.offsetWidth });
    };
    medir();
    window.addEventListener('resize', medir);
    return () => window.removeEventListener('resize', medir);
  }, [anual]);

  return (
    <div
      role="radiogroup"
      aria-label={c.rotulo}
      className="relative inline-flex rounded-full bg-sup-2 p-1"
    >
      {marca && (
        <span
          aria-hidden="true"
          className="absolute inset-y-1 rounded-full fundo-sup-1 shadow-sm transition-[transform,width] duration-[420ms] ease-saida motion-reduce:transition-none"
          style={{
            width: marca.w,
            transform: `translateX(${marca.x - 4}px)`,
            left: 4,
          }}
        />
      )}
      {[false, true].map((ehAnual, i) => (
        <button
          key={String(ehAnual)}
          ref={(el) => {
            refs.current[i] = el;
          }}
          type="button"
          role="radio"
          aria-checked={anual === ehAnual}
          onClick={() => aoMudar(ehAnual)}
          className={cx(
            'relative inline-flex min-h-[var(--alvo)] items-center gap-2 rounded-full px-5 text-sm font-medium transition-colors duration-[var(--t-resposta)]',
            anual === ehAnual
              ? 'text-texto'
              : 'text-texto-suave hover:text-texto',
            // Antes de medir (primeira pintura), o fundo marca a escolha.
            !marca && anual === ehAnual && 'fundo-sup-1'
          )}
        >
          {ehAnual ? c.anual : c.mensal}
          {ehAnual && desconto && (
            <span className="text-xs font-semibold text-ouro-texto">
              {c.ate(desconto)}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

/**
 * O carrossel do telefone (abaixo de `md`): os quatro cartões numa faixa que
 * rola de lado com encaixe, o próximo aparecendo na borda. O seletor de grupo
 * e os pontos acompanham a rolagem e levam ao cartão.
 */
function CarrosselDePlanos({
  idioma,
  grupo: soGrupo,
  children,
}: {
  idioma: Idioma;
  grupo?: Grupo;
  children: ReactNode[];
}) {
  const c = PLANOS[idioma];
  const faixa = useRef<HTMLDivElement>(null);
  const [ativo, setAtivo] = useState(0);
  const nomes = soGrupo ? DO_GRUPO[soGrupo] : ORDEM;

  useEffect(() => {
    const el = faixa.current;
    if (!el) return;
    const aoRolar = () => {
      const filhos = [...el.children] as HTMLElement[];
      const meio = el.scrollLeft + el.clientWidth / 2;
      let melhor = 0;
      filhos.forEach((f, i) => {
        const centro = f.offsetLeft + f.offsetWidth / 2;
        const atualCentro =
          filhos[melhor].offsetLeft + filhos[melhor].offsetWidth / 2;
        if (Math.abs(centro - meio) < Math.abs(atualCentro - meio)) melhor = i;
      });
      setAtivo(melhor);
    };
    el.addEventListener('scroll', aoRolar, { passive: true });
    return () => el.removeEventListener('scroll', aoRolar);
  }, []);

  const irPara = (i: number) => {
    const el = faixa.current;
    const alvo = el?.children[i] as HTMLElement | undefined;
    if (!el || !alvo) return;
    const reduzido = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    el.scrollTo({
      left: alvo.offsetLeft - (el.clientWidth - alvo.offsetWidth) / 2,
      behavior: reduzido ? 'auto' : 'smooth',
    });
  };

  const grupo = soGrupo ?? (ativo < 2 ? 'estudar' : 'ensinar');

  // `/pricing?para=ensinar` (de "comparar todos os planos" na página para
  // professores) abre já nos planos de quem dá aula.
  useEffect(() => {
    if (soGrupo) return;
    const para = new URLSearchParams(window.location.search).get('para');
    if (para !== 'ensinar') return;
    const el = faixa.current;
    const alvo = el?.children[2] as HTMLElement | undefined;
    if (el && alvo)
      el.scrollLeft = alvo.offsetLeft - (el.clientWidth - alvo.offsetWidth) / 2;
    if (window.matchMedia('(min-width: 768px)').matches) {
      document.getElementById('ensinar')?.scrollIntoView({ block: 'start' });
    }
  }, [soGrupo]);

  // `/pricing#plus` (o convite de um recurso do Plus) abre já no plano: no
  // carrossel, centrado; na grade, o cartão dele na tela.
  useEffect(() => {
    const plano = window.location.hash.slice(1).toUpperCase() as ChavePlano;
    const i = nomes.indexOf(plano);
    if (i < 0) return;
    const el = faixa.current;
    const alvo = el?.children[i] as HTMLElement | undefined;
    if (window.matchMedia('(min-width: 768px)').matches) {
      document
        .getElementById(`plano-${plano}-d`)
        ?.scrollIntoView({ block: 'center' });
    } else if (el && alvo) {
      el.scrollLeft = alvo.offsetLeft - (el.clientWidth - alvo.offsetWidth) / 2;
      el.scrollIntoView({ block: 'center' });
    }
  }, [nomes]);

  return (
    <Revelar className="mt-8 md:hidden">
      <div className={cx('section-wrap', soGrupo && 'hidden')}>
        <div
          role="group"
          aria-label={c.carrossel.rotulo}
          className="grid grid-cols-2 gap-1 rounded-full bg-sup-2 p-1"
        >
          {(['estudar', 'ensinar'] as const).map((g) => (
            <button
              key={g}
              type="button"
              aria-pressed={grupo === g}
              onClick={() => irPara(g === 'estudar' ? 0 : 2)}
              className={cx(
                'min-h-[var(--alvo)] rounded-full px-3 text-sm font-medium transition-colors duration-[var(--t-resposta)]',
                grupo === g
                  ? 'fundo-sup-1 text-texto shadow-sm'
                  : 'text-texto-suave'
              )}
            >
              {c.grupos[g].titulo}
            </button>
          ))}
        </div>
        <p
          key={grupo}
          className="mt-3 text-sm leading-relaxed text-texto-suave"
        >
          {c.grupos[grupo].texto}
        </p>
      </div>

      <div
        ref={faixa}
        className="mt-5 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children.map((filho, i) => (
          <div
            key={i}
            className="flex w-[86%] shrink-0 snap-center overflow-hidden rounded-card bg-sup-2"
          >
            {filho}
          </div>
        ))}
      </div>

      <div className="mt-3 flex justify-center gap-1">
        {nomes.map((n, i) => (
          <button
            key={n}
            type="button"
            aria-label={c.carrossel.plano(c.planos[n].nome)}
            aria-current={ativo === i || undefined}
            onClick={() => irPara(i)}
            className="grid h-8 w-8 place-items-center"
          >
            <span
              className={cx(
                'h-1.5 rounded-full transition-all duration-[var(--t-entrada)]',
                ativo === i ? 'w-5 bg-ouro' : 'w-1.5 bg-texto-fraco/40'
              )}
            />
          </button>
        ))}
      </div>
    </Revelar>
  );
}

/** "a, b e c" / "a, b and c". */
function juntar(itens: string[], idioma: Idioma) {
  return new Intl.ListFormat(idioma === 'pt' ? 'pt-BR' : 'en-US', {
    type: 'conjunction',
  }).format(itens);
}

/** Um plano: nome, para quem, preço, ação e o que inclui. */
function CartaoDoPlano({
  plano,
  idioma,
  anual,
  precos,
  atual,
  selecionado,
  sufixo,
  ordem,
  acao,
}: {
  plano: ChavePlano;
  idioma: Idioma;
  anual: boolean;
  precos: Precos;
  atual: boolean;
  selecionado: boolean;
  sufixo: string;
  ordem: number;
  acao: ReactNode;
}) {
  const c = PLANOS[idioma];
  const p = c.planos[plano];
  const id = `plano-${plano}-${sufixo}`;

  return (
    <article
      aria-labelledby={id}
      className={cx(
        'relative flex w-full flex-col p-7 md:p-9',
        (atual || selecionado) &&
          'shadow-[inset_0_0_0_1.5px_color-mix(in_srgb,var(--ouro)_55%,transparent)] md:rounded-card'
      )}
    >
      <div className="flex items-baseline justify-between gap-3">
        <h3
          id={id}
          className="classical-title text-[2rem] leading-none text-texto"
        >
          {p.nome}
        </h3>
        {(atual || selecionado) && (
          <span className="rounded-full bg-ouro/15 px-2.5 py-1 text-xs font-semibold text-ouro-texto">
            {atual ? c.estado.seuPlano : c.estado.selecionado}
          </span>
        )}
      </div>
      <p className="mt-3 text-[0.9375rem] leading-snug text-texto-suave md:min-h-[2.8em]">
        {p.paraQuem}
      </p>

      <Preco plano={plano} anual={anual} precos={precos} idioma={idioma} />

      <div className="mt-6">{acao}</div>

      {p.inclui && (
        <p className="mt-8 text-sm font-semibold text-texto">{p.inclui}</p>
      )}
      <ul
        className={cx(
          'flex flex-col gap-2.5 text-[0.9375rem] leading-snug',
          p.inclui ? 'mt-3' : 'mt-8'
        )}
      >
        {p.recursos.map((r, i) => (
          <li key={r} className="flex gap-2.5 text-texto">
            <VistoQueSeDesenha
              ordem={ordem * 3 + i}
              className="mt-[0.15em] h-4 w-4 shrink-0 text-ouro-texto"
            />
            <span>{r}</span>
          </li>
        ))}
      </ul>

      {/* O que vem, numa linha só: marcado, e sem parecer incluído. */}
      {p.emBreve.length > 0 && (
        <p className="mt-5 text-sm leading-relaxed text-texto-fraco">
          <span className="mr-1.5 inline-block rounded-full border border-ouro/40 px-1.5 py-px align-[0.1em] text-[0.6875rem] font-semibold leading-tight text-ouro-texto">
            {c.emBreve}
          </span>
          {juntar(p.emBreve, idioma)}
        </p>
      )}
    </article>
  );
}

/** O preço grande: os dígitos giram quando o período troca. */
function Preco({
  plano,
  anual,
  precos,
  idioma,
}: {
  plano: ChavePlano;
  anual: boolean;
  precos: Precos;
  idioma: Idioma;
}) {
  const c = PLANOS[idioma];

  if (plano === 'FREE') {
    return (
      <div className="mt-7">
        <p className="classical-title text-[3.25rem] leading-none text-texto">
          {c.preco.gratis}
        </p>
        <p className="mt-2.5 text-sm text-texto-fraco md:min-h-[2.6em]" />
        <TesteGratis dias={0} idioma={idioma} />
      </div>
    );
  }

  const p = precos[plano as PlanoPago];
  if (!p) {
    return (
      <div className="mt-7">
        <p className="classical-title text-[3.25rem] leading-none text-texto-fraco">
          —
        </p>
        <p className="mt-2.5 text-sm text-texto-fraco md:min-h-[2.6em]" />
        <TesteGratis dias={0} idioma={idioma} />
      </div>
    );
  }

  const usaAnual = anual && p.anual;
  const valor = usaAnual ? p.anual!.porMes : p.mensal;
  const { simbolo, inteiro, centavos } = partesDoPreco(valor, idioma);

  let nota: string;
  if (usaAnual) {
    nota = `${c.preco.porAno(formatarPreco(p.anual!.total, idioma))} · ${c.preco.economia(formatarPreco(p.anual!.economia, idioma))}`;
  } else if (anual) {
    nota = c.preco.soMensal;
  } else {
    nota = p.anual
      ? c.preco.anualDisponivel(formatarPreco(p.anual.porMes, idioma))
      : '';
  }

  return (
    <div className="mt-7">
      <p className="flex items-baseline gap-1 text-texto">
        <span className="self-start pt-1.5 text-base font-medium text-texto-suave">
          {simbolo}
        </span>
        <span className="classical-title flex items-baseline text-[3.25rem] leading-none tabular-nums">
          <NumeroRolante valor={inteiro} />
          {centavos && (
            <NumeroRolante valor={centavos} className="text-[0.5em]" />
          )}
        </span>
        <span className="text-sm text-texto-suave">{c.preco.porMes}</span>
      </p>
      <p
        key={nota}
        className="mt-2.5 text-sm leading-snug text-texto-fraco md:min-h-[2.6em]"
      >
        {nota}
      </p>
      <TesteGratis dias={p.teste} idioma={idioma} />
    </div>
  );
}

/**
 * O teste grátis do plano, com os dias da tabela de preços. Sem dias, deixa o
 * mesmo espaço vazio: os botões dos três cards seguem na mesma altura.
 */
function TesteGratis({ dias, idioma }: { dias: number; idioma: Idioma }) {
  const c = PLANOS[idioma].teste;
  return (
    <div className="mt-3 flex flex-col gap-0.5 md:min-h-[3.4em]">
      {dias > 0 && (
        <>
          <p className="text-sm font-semibold text-ouro-texto">
            {c.selo(dias)}
          </p>
          <p className="text-[0.8125rem] leading-snug text-texto-fraco">
            {c.detalhe}
          </p>
        </>
      )}
    </div>
  );
}
