import type { Metadata } from 'next';
import {
  PiArrowDown,
  PiBookOpenText,
  PiCaretDown,
  PiDownloadSimple,
  PiFileText,
  PiHeadphones,
  PiMinus,
} from 'react-icons/pi';
import { BotaoCriarConta } from '@/app/components/auth/BotaoCriarConta';
import { classesDeBotao } from '@/app/components/ui/Button';
import LocalizedLink from '@/app/components/LocalizedLink';
import { Revelar } from '@/app/components/ui/Revelar';
import { TextoRico } from '@/app/components/ui/TextoRico';
import { VistoQueSeDesenha } from '@/app/components/ui/VistoQueSeDesenha';
import { PLANOS, type ChavePlano, type Valor } from '@/app/conteudo/planos';
import { apiFetch } from '@/app/libs/api/client';
import { getServerAccessToken } from '@/app/libs/api/server-session';
import { alternatesFor, SITE_URL } from '@/app/utils/seoAlternates';
import {
  routeLanguage,
  type LangParams,
} from '@/app/utils/translations/routeLanguage';
import { OrbitaDosPlanos } from '@/app/components/site/orbits/Orbitas';
import { compacto, numerosDoAcervo } from '@/app/requests/catalog-numbers';
import { FileiraDoAcervo } from '@/app/components/site/FileiraDoAcervo';
import { PageHero } from '@/app/components/site/PageHero';
import { buscarPrecos } from './buscarPrecos';
import { QuadroDePlanos } from './QuadroDePlanos';
import {
  formatarPreco,
  maiorDesconto,
  PLANOS_PAGOS,
  type Precos,
} from './precos';

/**
 * Planos e preços. O que precisa de conta (período, plano atual, checkout)
 * mora no `QuadroDePlanos`; comparação e perguntas são do servidor, no HTML
 * que o robô lê. O texto está em `conteudo/planos.ts`.
 *
 * **Renderizada por visita**, não guardada: o plano atual de quem está logado
 * sai no HTML (lido do cookie de sessão), e a página já nasce com "Seu plano"
 * marcado. O preço continua em cache, na chamada à API (`buscarPrecos`).
 */
interface LangPageProps {
  params: LangParams;
}

const SEM_PRECOS: Precos = { PLUS: null, MENTOR: null, MAESTRO: null };

const endereco = (idioma: 'pt' | 'en') =>
  `${SITE_URL}${idioma === 'en' ? '/en' : ''}/pricing`;

/**
 * O plano de quem está vendo, pela API com o token do cookie. Visitante, token
 * vencido ou API fora: `null` — a página cai no estado de visitante e o
 * navegador confirma depois.
 */
async function buscarPlanoAtual(): Promise<ChavePlano | null> {
  const token = await getServerAccessToken();
  if (!token) return null;
  try {
    const r = await apiFetch<{ plan?: { type?: string } }>(
      '/subscription/current',
      { token, cache: 'no-store' }
    );
    const tipo = r.plan?.type;
    return tipo === 'PLUS' || tipo === 'MENTOR' || tipo === 'MAESTRO'
      ? tipo
      : 'FREE';
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: LangPageProps): Promise<Metadata> {
  const idioma = await routeLanguage(params);
  const c = PLANOS[idioma];
  const precos = await buscarPrecos().catch(() => null);
  const mensais =
    precos && PLANOS_PAGOS.every((p) => precos[p])
      ? {
          PLUS: formatarPreco(precos.PLUS!.mensal, idioma),
          MENTOR: formatarPreco(precos.MENTOR!.mensal, idioma),
          MAESTRO: formatarPreco(precos.MAESTRO!.mensal, idioma),
        }
      : null;
  const descricao = c.meta.descricao(mensais);

  return {
    title: c.meta.titulo,
    description: descricao,
    creator: 'Opus Atlas',
    openGraph: {
      title: c.meta.titulo,
      description: descricao,
      type: 'website',
      locale: idioma === 'pt' ? 'pt_BR' : 'en_US',
      url: endereco(idioma),
      siteName: 'Opus Atlas',
      images: [
        {
          url: `${SITE_URL}/logo-opus-atlas.jpeg`,
          width: 1200,
          height: 630,
          alt: 'Opus Atlas',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: c.meta.titulo,
      description: descricao,
    },
    robots: { index: true, follow: true },
    alternates: alternatesFor('/pricing', idioma),
  };
}

/** Texto limpo da marcação do `TextoRico`, para o JSON-LD. */
const semMarcacao = (t: string) =>
  t.replace(/\*\*(.+?)\*\*/g, '$1').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

/** What is free before any plan, as gold icons beside the archive line. */
const GRATIS = [
  ['ler', PiBookOpenText],
  ['ouvir', PiHeadphones],
  ['partituras', PiFileText],
  ['baixar', PiDownloadSimple],
] as const;

export default async function Pagina({ params }: LangPageProps) {
  const idioma = await routeLanguage(params);
  // Tabela vazia (banco sem `seed-plan-pricing`, ou o build sem API): a
  // página aparece mesmo assim, com o Free e os pagos "indisponíveis" — nunca
  // em branco, e nunca com preço inventado. Se a API cair, o erro sobe e o
  // Next devolve 500 sem guardar nada.
  const [precosDaApi, planoAtual, numeros] = await Promise.all([
    buscarPrecos(),
    buscarPlanoAtual(),
    numerosDoAcervo(),
  ]);
  const precos = precosDaApi ?? SEM_PRECOS;

  const c = PLANOS[idioma];
  const url = endereco(idioma);
  const perguntas = c.perguntas.itens(maiorDesconto(precos));
  const nomes = ['FREE', 'PLUS', 'MENTOR', 'MAESTRO'] as const;

  // Uma oferta por plano e período, com o preço que a página mostra. Sem
  // `aggregateRating`: a página antiga declarava 4,9 de 1.250 avaliações que
  // não existem — o Google trata isso como dado estruturado enganoso.
  const ofertas = [
    {
      '@type': 'Offer',
      name: 'Free',
      price: '0',
      priceCurrency: 'BRL',
      availability: 'https://schema.org/InStock',
      url,
    },
    ...PLANOS_PAGOS.flatMap((p) => {
      const pr = precos[p];
      if (!pr) return [];
      const nome = c.planos[p].nome;
      const oferta = (
        valor: number,
        duracao: 'P1M' | 'P1Y',
        rotulo: string
      ) => ({
        '@type': 'Offer',
        name: `${nome} — ${rotulo}`,
        price: valor.toFixed(2),
        priceCurrency: 'BRL',
        availability: 'https://schema.org/InStock',
        url,
        priceSpecification: {
          '@type': 'UnitPriceSpecification',
          price: valor.toFixed(2),
          priceCurrency: 'BRL',
          billingDuration: duracao,
          unitCode: duracao === 'P1M' ? 'MON' : 'ANN',
        },
      });
      return [
        oferta(pr.mensal, 'P1M', c.periodo.mensal),
        ...(pr.anual ? [oferta(pr.anual.total, 'P1Y', c.periodo.anual)] : []),
      ];
    }),
  ];

  const dados = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${url}#pagina`,
        url,
        name: c.meta.titulo,
        inLanguage: idioma === 'pt' ? 'pt-BR' : 'en-US',
        isPartOf: { '@id': `${SITE_URL}/#website` },
        breadcrumb: { '@id': `${url}#migalhas` },
        mainEntity: { '@id': `${url}#produto` },
      },
      {
        '@type': 'Product',
        '@id': `${url}#produto`,
        name: 'Opus Atlas',
        description: c.abertura,
        brand: { '@id': `${SITE_URL}/#organization` },
        image: `${SITE_URL}/logo-opus-atlas.jpeg`,
        offers: ofertas,
      },
      {
        '@type': 'FAQPage',
        '@id': `${url}#perguntas`,
        mainEntity: perguntas.map((q) => ({
          '@type': 'Question',
          name: q.pergunta,
          acceptedAnswer: { '@type': 'Answer', text: semMarcacao(q.resposta) },
        })),
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${url}#migalhas`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Opus Atlas',
            item: `${SITE_URL}${idioma === 'en' ? '/en' : ''}`,
          },
          { '@type': 'ListItem', position: 2, name: c.migalha, item: url },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(dados).replace(/</g, '\\u003c'),
        }}
      />

      <div className="pb-24 md:pb-32">
        <PageHero
          idioma={idioma}
          migalha={c.migalha}
          titulo={c.titulo}
          abertura={c.abertura}
          extra={
            <FileiraDoAcervo
              rotulo={c.gratis.rotulo}
              itens={GRATIS.map(([chave, icone]) => ({
                chave,
                icone,
                nome: c.gratis.itens[chave],
              }))}
              legenda={c.acervo(numeros, (n) => `**${compacto(n)}**`)}
            />
          }
          acoes={
            <>
              <a href="#planos" className={classesDeBotao('primario')}>
                {c.acoesTopo.planos}
                <PiArrowDown aria-hidden="true" className="h-4 w-4" />
              </a>
              <BotaoCriarConta
                seLogado={
                  <LocalizedLink href="/profile" className={classesDeBotao()}>
                    {c.acoesTopo.seuPlano}
                  </LocalizedLink>
                }
              >
                {c.acoesTopo.criarConta}
              </BotaoCriarConta>
            </>
          }
          ilustracao={<OrbitaDosPlanos />}
        />

        <div id="planos" className="scroll-mt-24" />
        <QuadroDePlanos
          idioma={idioma}
          precos={precos}
          planoInicial={planoAtual}
        />

        {/* Comparação: tabela de verdade, com o nome do plano em cada coluna. */}
        <section
          aria-labelledby="comparacao"
          className="section-wrap mt-24 md:mt-32"
        >
          <h2
            id="comparacao"
            className="classical-title scroll-mt-28 text-3xl leading-tight text-texto md:text-[2.5rem]"
          >
            {c.comparacao.titulo}
          </h2>
          <Revelar className="mt-8 md:mt-10">
            <table className="w-full table-fixed border-collapse text-left">
              <caption className="sr-only">{c.comparacao.titulo}</caption>
              <colgroup>
                <col className="w-[36%] sm:w-[40%]" />
                <col />
                <col />
                <col />
                <col />
              </colgroup>
              <thead>
                <tr className="border-b border-linha-forte">
                  <th
                    scope="col"
                    className="pb-4 pr-3 text-xs font-medium text-texto-fraco sm:text-sm"
                  >
                    {c.comparacao.recurso}
                  </th>
                  {nomes.map((n) => (
                    <th
                      key={n}
                      scope="col"
                      className="classical-title px-1 pb-4 text-center text-base text-texto sm:text-xl"
                    >
                      {c.planos[n].nome}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {c.comparacao.linhas.map((linha, l) => (
                  <tr key={linha.recurso} className="border-b border-linha">
                    <th
                      scope="row"
                      className="py-3.5 pr-3 align-top text-[0.8125rem] font-normal leading-snug text-texto-suave sm:py-4 sm:text-[0.9375rem]"
                    >
                      {linha.recurso}
                    </th>
                    {linha.valores.map((v, i) => (
                      <td
                        key={nomes[i]}
                        className="px-1 py-3.5 text-center align-top sm:py-4"
                      >
                        <Celula
                          valor={v}
                          ordem={l + i}
                          sim={c.comparacao.sim}
                          nao={c.comparacao.nao}
                          breve={c.emBreve}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </Revelar>
        </section>

        <section
          aria-labelledby="perguntas"
          className="section-wrap mt-24 md:mt-32"
        >
          <div className="grid gap-8 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-20">
            <div>
              <h2
                id="perguntas"
                className="classical-title text-3xl leading-tight text-texto md:text-[2.5rem] lg:sticky lg:top-28"
              >
                {c.perguntas.titulo}
              </h2>
            </div>
            <Revelar cascata className="border-t border-linha">
              {perguntas.map((q, i) => (
                <details
                  key={q.pergunta}
                  style={{ ['--i' as string]: i }}
                  className="group border-b border-linha"
                >
                  <summary className="flex min-h-[var(--alvo)] cursor-pointer list-none items-center justify-between gap-6 py-5 text-[1.0625rem] font-medium text-texto transition-colors hover:text-ouro-texto [&::-webkit-details-marker]:hidden">
                    <h3 className="font-medium">{q.pergunta}</h3>
                    <PiCaretDown
                      aria-hidden="true"
                      className="h-4 w-4 shrink-0 text-texto-fraco transition-transform duration-[var(--t-resposta)] group-open:rotate-180"
                    />
                  </summary>
                  <p className="max-w-[62ch] pb-6 text-[1rem] leading-[1.75] text-texto-suave">
                    <TextoRico texto={q.resposta} />
                  </p>
                </details>
              ))}
            </Revelar>
          </div>
        </section>

        <section
          aria-labelledby="fecho"
          className="section-wrap mt-24 md:mt-32"
        >
          <h2
            id="fecho"
            className="classical-title text-2xl leading-tight text-texto md:text-[2rem]"
          >
            {c.fecho.titulo}
          </h2>
          <p className="mt-3 text-lg leading-relaxed text-texto-suave">
            <TextoRico texto={c.fecho.texto} />
          </p>
        </section>
      </div>
    </>
  );
}

function Celula({
  valor,
  ordem,
  sim,
  nao,
  breve,
}: {
  valor: Valor;
  ordem: number;
  sim: string;
  nao: string;
  breve: string;
}) {
  if (valor === true) {
    return (
      <>
        <VistoQueSeDesenha
          ordem={ordem}
          className="mx-auto h-[1.125rem] w-[1.125rem] text-ouro-texto"
        />
        <span className="sr-only">{sim}</span>
      </>
    );
  }
  if (valor === false) {
    return (
      <>
        <PiMinus
          aria-hidden="true"
          className="mx-auto h-4 w-4 text-texto-fraco opacity-60"
        />
        <span className="sr-only">{nao}</span>
      </>
    );
  }
  if (typeof valor === 'object') {
    return (
      <span className="inline-block rounded-full border border-ouro/40 px-1.5 py-px text-[0.625rem] font-semibold leading-tight text-ouro-texto sm:text-[0.6875rem]">
        {breve}
      </span>
    );
  }
  return (
    <span className="block text-[0.6875rem] font-medium leading-snug text-texto sm:text-[0.9375rem]">
      {valor}
    </span>
  );
}
