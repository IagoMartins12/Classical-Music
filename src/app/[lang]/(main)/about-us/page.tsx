import type { Metadata } from 'next';
import { PiArrowRight } from 'react-icons/pi';
import LocalizedLink from '@/app/components/LocalizedLink';
import Image from '@/app/components/SmartImage';
import { BotaoCriarConta } from '@/app/components/auth/BotaoCriarConta';
import { classesDeBotao } from '@/app/components/ui/Button';
import { cx } from '@/app/components/ui/cx';
import { Revelar } from '@/app/components/ui/Revelar';
import { SeloVerificada } from '@/app/components/ui/SeloVerificada';
import { TextoRico } from '@/app/components/ui/TextoRico';
import { SOBRE } from '@/app/conteudo/sobre';
import { compacto, numerosDoAcervo } from '@/app/requests/catalog-numbers';
import { getTop20FamousComposers } from '@/app/requests/composers';
import { CONTATO } from '@/app/utils/contato';
import { alternatesFor, SITE_URL } from '@/app/utils/seoAlternates';
import {
  routeLanguage,
  type LangParams,
} from '@/app/utils/translations/routeLanguage';
import { AstrolabioDoSite } from '@/app/components/site/orbits/Orbitas';
import { FileiraDoAcervo } from '@/app/components/site/FileiraDoAcervo';
import { PageHero } from '@/app/components/site/PageHero';
import { QuadroDoSite, type Retrato } from './QuadroDoSite';

/**
 * "Sobre" — o que o Opus Atlas é.
 *
 * O topo põe **rostos** ao lado da frase: retratos de compositores do próprio
 * acervo (a curadoria da home), cada um levando à sua página. Depois, o quadro
 * das quatro partes do site, com ilustrações que se montam; a frase de "por
 * que é grátis" entrando palavra a palavra; e de onde vem o acervo. O texto
 * mora em `conteudo/sobre.ts`.
 */
interface LangPageProps {
  params: LangParams;
}

/**
 * **Teste de layout.** `true` usa no computador o mesmo layout do telefone e
 * do tablet: topo numa coluna com a fileira de rostos (sem o mosaico) e o
 * quadro com as abas em cima, em vez de ao lado. `false` mantém o layout de
 * duas colunas no computador.
 */
const SET_ALWAYS_LAYOUT_MOBILE = true;

export const revalidate = 3600;

const endereco = (idioma: 'pt' | 'en') =>
  `${SITE_URL}${idioma === 'en' ? '/en' : ''}/about-us`;

export async function generateMetadata({
  params,
}: LangPageProps): Promise<Metadata> {
  const idioma = await routeLanguage(params);
  const { meta } = SOBRE[idioma];
  return {
    title: meta.titulo,
    description: meta.descricao,
    creator: 'Opus Atlas',
    openGraph: {
      title: meta.titulo,
      description: meta.descricao,
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
      title: meta.titulo,
      description: meta.descricao,
    },
    robots: { index: true, follow: true },
    alternates: alternatesFor('/about-us', idioma),
  };
}

/** O ano de uma data da API, que chega por extenso ("16 December 1770"). */
const ano = (d: string | null) => d?.match(/\d{4}/)?.[0] ?? '';

/**
 * Os rostos do topo, nesta ordem (é a do mosaico, coluna a coluna). Quem não
 * estiver na curadoria da API, ou não tiver retrato, cede a vaga ao próximo
 * da curadoria.
 */
const ROSTOS = [
  'Beethoven',
  'Mozart',
  'Bach',
  'Chopin',
  'Haydn',
  'Brahms',
  'Schubert',
];

/** Retratos da curadoria da home — só os que têm foto. Sem API, nenhum. */
async function retratosDoAcervo(): Promise<Retrato[]> {
  try {
    const lista = (await getTop20FamousComposers()).filter(
      (c) => c.portraitUrl
    );
    const escolhidos = ROSTOS.map((n) => lista.find((c) => c.name === n));
    const resto = lista.filter((c) => !escolhidos.includes(c));
    return escolhidos
      .map((c) => c ?? resto.shift())
      .filter((c): c is NonNullable<typeof c> => Boolean(c))
      .map((c) => ({
        id: c.id,
        nome: c.name,
        nomeCompleto: c.fullName,
        anos: [ano(c.birthDate), ano(c.deathDate)].filter(Boolean).join(' – '),
        foto: c.portraitUrl!,
        epoca: c.epochName,
        verificado: c.isVerified,
      }));
  } catch {
    return [];
  }
}

const LINK =
  'inline-flex min-h-6 items-center gap-1.5 font-medium text-ouro-texto underline decoration-ouro/40 underline-offset-[5px] transition-colors hover:decoration-ouro';

/** As três colunas do mosaico, com o deslocamento de cada uma. */
const COLUNAS = [
  { de: 0, ate: 2, desce: 'mt-16' },
  { de: 2, ate: 5, desce: 'mt-0' },
  { de: 5, ate: 7, desce: 'mt-24' },
];

export default async function Pagina({ params }: LangPageProps) {
  const idioma = await routeLanguage(params);
  const c = SOBRE[idioma];
  const [numeros, retratos] = await Promise.all([
    numerosDoAcervo(),
    retratosDoAcervo(),
  ]);
  const m = SET_ALWAYS_LAYOUT_MOBILE;
  const url = endereco(idioma);
  const inicio = `${SITE_URL}${idioma === 'en' ? '/en' : ''}`;
  const palavras = c.porque.frase.split(' ');

  const dados = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'AboutPage',
        '@id': `${url}#pagina`,
        url,
        name: c.meta.titulo,
        description: c.meta.descricao,
        inLanguage: idioma === 'pt' ? 'pt-BR' : 'en-US',
        isPartOf: { '@id': `${SITE_URL}/#website` },
        about: { '@id': `${SITE_URL}/#organization` },
        breadcrumb: { '@id': `${url}#migalhas` },
      },
      {
        '@type': 'Organization',
        '@id': `${SITE_URL}/#organization`,
        name: 'Opus Atlas',
        url: SITE_URL,
        logo: `${SITE_URL}/logo-opus-atlas.jpeg`,
        email: CONTATO.contato,
        description: c.meta.descricao,
        knowsAbout: [
          'Classical music',
          'Sheet music',
          'Music education',
          'Composers',
        ],
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${url}#migalhas`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Opus Atlas',
            item: inicio,
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
        {/* Topo: a frase de um lado, rostos do acervo do outro. */}
        <PageHero
          idioma={idioma}
          migalha={c.migalha}
          titulo={c.titulo}
          abertura={
            <TextoRico
              texto={c.abertura(numeros, (n) => `**${compacto(n)}**`)}
            />
          }
          extra={
            <FileiraDoAcervo
              rotulo={c.retratos.rotulo}
              itens={retratos.map((r) => ({
                chave: r.id,
                foto: r.foto,
                nome: r.nome,
              }))}
              legenda={
                numeros && c.retratos.mais(compacto(numeros.compositores))
              }
              className={cx(!m && 'lg:hidden')}
            />
          }
          acoes={
            <>
              <LocalizedLink
                href="/composers"
                className={classesDeBotao('primario')}
              >
                {c.acoes.explorar}
                <PiArrowRight aria-hidden="true" className="h-4 w-4" />
              </LocalizedLink>
              <BotaoCriarConta
                seLogado={
                  <LocalizedLink href="/profile" className={classesDeBotao()}>
                    {c.acoes.seuPerfil}
                  </LocalizedLink>
                }
              >
                {c.acoes.criarConta}
              </BotaoCriarConta>
            </>
          }
          /* Com o layout de telefone em toda largura, o lado direito é o
              astrolábio do site; sem ele, o mosaico de rostos. */
          ilustracao={
            m ? (
              <AstrolabioDoSite />
            ) : (
              retratos.length >= 7 && (
                <ul
                  aria-label={c.retratos.rotulo}
                  className="hidden grid-cols-3 gap-3 lg:grid"
                >
                  {COLUNAS.map((col, ci) => (
                    <li key={ci} className={`flex flex-col gap-3 ${col.desce}`}>
                      <ul className="flex flex-col gap-3">
                        {retratos.slice(col.de, col.ate).map((r, i) => (
                          <li
                            key={r.id}
                            className="entra"
                            style={{ ['--i' as string]: 2 + col.de + i }}
                          >
                            <LocalizedLink
                              href={`/composer/${r.id}`}
                              data-vira={`compositor-${r.id}`}
                              className="group/rosto relative block aspect-[3/4] overflow-hidden rounded-card bg-sup-2"
                            >
                              <Image
                                src={r.foto}
                                alt=""
                                fill
                                sizes="(min-width: 1280px) 180px, 15vw"
                                className="object-cover grayscale-[40%] transition-[filter,transform] duration-[600ms] ease-saida group-hover/rosto:scale-[1.04] group-hover/rosto:grayscale-0"
                              />
                              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-veu-foto to-transparent px-3 pb-2.5 pt-8">
                                <span className="classical-title block text-sm leading-tight text-sobre-foto">
                                  {r.nome}
                                </span>
                                <span className="block text-[0.6875rem] text-sobre-foto/75">
                                  {r.anos}
                                </span>
                              </span>
                            </LocalizedLink>
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
              )
            )
          }
        />

        {/* As quatro partes do site, num quadro com ilustrações. */}
        <Revelar
          as="section"
          aria-labelledby="camadas"
          className="section-wrap mt-20 md:mt-32"
        >
          <h2
            id="camadas"
            className="classical-title text-3xl leading-tight text-texto md:text-[2.5rem]"
          >
            {c.camadas.titulo}
          </h2>
          <QuadroDoSite idioma={idioma} retratos={retratos} empilhado={m} />
        </Revelar>

        {/* Por que é grátis: a frase entra palavra a palavra. */}
        <section
          aria-labelledby="porque"
          className="section-wrap mt-24 md:mt-36"
        >
          <h2
            id="porque"
            className="classical-title text-3xl leading-tight text-texto md:text-[2.5rem]"
          >
            {c.porque.titulo}
          </h2>
          <Revelar
            as="blockquote"
            cascata
            className="classical-title mt-8 max-w-[24ch] text-balance text-[2rem] italic leading-[1.15] text-texto md:mt-12 md:text-5xl lg:text-[3.5rem]"
          >
            {palavras.map((p, i) => (
              <span
                key={i}
                className="inline-block"
                style={{ transitionDelay: `${i * 55}ms` }}
              >
                {p}
                {i < palavras.length - 1 ? ' ' : ''}
              </span>
            ))}
          </Revelar>
          <Revelar className="mt-10 grid max-w-5xl gap-6 text-[1.0625rem] leading-[1.75] text-texto-suave md:mt-14 md:grid-cols-2 md:gap-12">
            {c.porque.paragrafos.map((p) => (
              <p key={p}>
                <TextoRico texto={p} />
              </p>
            ))}
          </Revelar>
        </section>

        {/* De onde vem o acervo: uma superfície só, os itens em cascata. */}
        <section
          aria-labelledby="acervo"
          className="section-wrap mt-24 md:mt-36"
        >
          <div className="rounded-card bg-sup-2 px-6 py-10 md:px-12 md:py-16 lg:px-16">
            <h2
              id="acervo"
              className="classical-title text-3xl leading-tight text-texto md:text-[2.5rem]"
            >
              {c.acervo.titulo}
            </h2>
            <p className="mt-4 max-w-[52ch] text-lg leading-relaxed text-texto-suave">
              {c.acervo.abertura}
            </p>

            <Revelar
              as="dl"
              cascata
              className="mt-10 grid gap-x-12 gap-y-10 md:mt-14 md:grid-cols-2 lg:grid-cols-3"
            >
              {c.acervo.itens.map((item, i) => (
                <div key={item.titulo} style={{ ['--i' as string]: i }}>
                  <dt className="flex items-center gap-2 font-semibold text-texto">
                    {/* O item do selo mostra o selo, que se traça ao aparecer. */}
                    {i === 2 && (
                      <SeloVerificada
                        desenhar
                        className="h-5 w-5 shrink-0 text-verificado"
                      />
                    )}
                    {item.titulo}
                  </dt>
                  <dd className="mt-2.5 text-[0.9375rem] leading-[1.7] text-texto-suave">
                    <TextoRico texto={item.texto} />
                  </dd>
                </div>
              ))}
            </Revelar>
          </div>
        </section>

        <Revelar
          as="section"
          aria-labelledby="fecho"
          className="section-wrap mt-24 md:mt-36"
        >
          <div className="grid gap-6 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-12 lg:gap-20">
            <h2
              id="fecho"
              className="classical-title text-3xl leading-tight text-texto md:text-[2.5rem]"
            >
              {c.fecho.titulo}
            </h2>
            <div>
              <p className="max-w-[60ch] text-lg leading-relaxed text-texto-suave">
                <TextoRico texto={c.fecho.texto} />
              </p>
              <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-[0.9375rem]">
                {c.fecho.links.map((l) => (
                  <li key={l.href}>
                    <LocalizedLink href={l.href} className={LINK}>
                      {l.rotulo}
                      <PiArrowRight
                        aria-hidden="true"
                        className="h-3.5 w-3.5"
                      />
                    </LocalizedLink>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Revelar>
      </div>
    </>
  );
}
