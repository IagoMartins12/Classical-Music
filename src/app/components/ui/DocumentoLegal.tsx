import { PiCaretDown } from 'react-icons/pi';
import LocalizedLink from '@/app/components/LocalizedLink';
import type { Documento, Idioma } from '@/app/conteudo/legal/tipos';
import { Blocos } from './Blocos';
import { TERMOS } from '@/app/conteudo/legal/termos';
import { PRIVACIDADE } from '@/app/conteudo/legal/privacidade';
import { DIREITOS_AUTORAIS } from '@/app/conteudo/legal/direitosAutorais';
import { CONTATO } from '@/app/utils/contato';
import { cx } from './cx';
import { IndiceDoDocumento } from './IndiceDoDocumento';
import { TextoRico } from './TextoRico';

/**
 * A página de um documento de leitura — Termos de Uso, Política de
 * Privacidade, Direitos Autorais. Lido como um bom documento impresso: coluna
 * de 720px, cláusulas numeradas (nos termos o número é referência, "ver
 * cláusula 5"), índice que acompanha a leitura e "O essencial" no topo para
 * quem não vai ler tudo. Sem cards empilhados, sem ícone por seção.
 */
export type QualDocumento = 'terms' | 'privacy' | 'copyright';

const DOCUMENTOS: Record<QualDocumento, typeof TERMOS> = {
  terms: TERMOS,
  privacy: PRIVACIDADE,
  copyright: DIREITOS_AUTORAIS,
};

const ROTULOS = {
  pt: {
    documentos: 'Documentos legais',
    essencial: 'O essencial',
    indice: 'Nesta página',
    vigor: 'Em vigor desde',
    duvidas: 'Ficou alguma dúvida?',
    escreva: 'Escreva para',
    aba: {
      terms: 'Termos de Uso',
      privacy: 'Privacidade',
      copyright: 'Direitos Autorais',
    },
  },
  en: {
    documentos: 'Legal documents',
    essencial: 'The essentials',
    indice: 'On this page',
    vigor: 'Effective from',
    duvidas: 'Any questions?',
    escreva: 'Write to',
    aba: { terms: 'Terms of Use', privacy: 'Privacy', copyright: 'Copyright' },
  },
} as const;

const CANAL: Record<
  QualDocumento,
  'contato' | 'privacidade' | 'direitosAutorais'
> = {
  terms: 'contato',
  privacy: 'privacidade',
  copyright: 'direitosAutorais',
};

function data(iso: string, idioma: Idioma) {
  return new Intl.DateTimeFormat(idioma === 'pt' ? 'pt-BR' : 'en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(iso));
}

export function DocumentoLegal({
  qual,
  idioma,
}: {
  qual: QualDocumento;
  idioma: Idioma;
}) {
  const doc: Documento = DOCUMENTOS[qual][idioma];
  const r = ROTULOS[idioma];
  const indice = doc.secoes.map((s, i) => ({
    id: s.id,
    numero: i + 1,
    titulo: s.titulo,
  }));
  const canal = CONTATO[CANAL[qual]];

  return (
    <div className="section-wrap pb-20 pt-8 md:pt-12">
      {/* Os três documentos lado a lado: quem procura um costuma precisar do outro. */}
      <nav aria-label={r.documentos} className="mb-10 md:mb-14">
        <ul className="flex flex-wrap gap-1 sm:gap-2">
          {(Object.keys(DOCUMENTOS) as QualDocumento[]).map((q) => (
            <li key={q}>
              <LocalizedLink
                href={`/${q}`}
                aria-current={q === qual ? 'page' : undefined}
                className={cx(
                  'inline-flex min-h-9 items-center whitespace-nowrap rounded-full px-3 text-[0.8125rem] font-medium sm:px-4 sm:text-sm transition-colors duration-[var(--t-toque)]',
                  q === qual
                    ? 'bg-sup-2 text-ouro-texto'
                    : 'text-texto-fraco hover:text-texto'
                )}
              >
                {r.aba[q]}
              </LocalizedLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-16 xl:gap-24">
        <aside className="hidden lg:block">
          <div className="sticky top-28 max-h-[calc(100svh-8rem)] overflow-y-auto pb-8 classical-scrollbar-mini">
            <IndiceDoDocumento itens={indice} rotulo={r.indice} />
          </div>
        </aside>

        <article className="min-w-0 max-w-[var(--largura-texto)]">
          <header>
            <h1 className="classical-title text-4xl leading-[1.1] text-texto md:text-[3.25rem]">
              {doc.titulo}
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-texto-suave">
              {doc.abertura}
            </p>
            <p className="mt-6 text-sm text-texto-fraco">
              {r.vigor}{' '}
              <time dateTime={doc.vigencia}>{data(doc.vigencia, idioma)}</time>
            </p>
          </header>

          <section
            aria-labelledby="essencial"
            className="mt-10 rounded-card bg-sup-2 p-6 md:p-8"
          >
            <h2 id="essencial" className="classical-title text-xl text-texto">
              {r.essencial}
            </h2>
            <ul className="mt-4 flex flex-col gap-3 pl-5 text-[1.0625rem] leading-relaxed text-texto-suave marker:text-ouro-texto list-disc">
              {doc.essencial.map((e, i) => (
                <li key={i} className="pl-1.5">
                  <TextoRico texto={e} />
                </li>
              ))}
            </ul>
          </section>

          <details className="group mt-8 rounded-card bg-sup-2 lg:hidden">
            <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between px-5 text-sm font-semibold text-texto [&::-webkit-details-marker]:hidden">
              {r.indice}
              <PiCaretDown
                aria-hidden="true"
                className="h-4 w-4 text-texto-fraco transition-transform duration-[var(--t-toque)] group-open:rotate-180"
              />
            </summary>
            <ol className="flex flex-col gap-1 px-5 pb-5">
              {indice.map((i) => (
                <li key={i.id}>
                  <a
                    href={`#${i.id}`}
                    className="grid grid-cols-[1.75rem_1fr] py-1.5 text-sm text-texto-suave hover:text-texto"
                  >
                    <span className="tabular-nums text-texto-fraco">
                      {i.numero}.
                    </span>
                    <span>{i.titulo}</span>
                  </a>
                </li>
              ))}
            </ol>
          </details>

          <div className="mt-14 flex flex-col gap-14">
            {doc.secoes.map((s, i) => (
              <section
                key={s.id}
                id={s.id}
                aria-labelledby={`${s.id}-titulo`}
                className="scroll-mt-28"
              >
                <h2
                  id={`${s.id}-titulo`}
                  className="classical-title flex items-baseline gap-3 text-2xl leading-snug text-texto md:text-[1.75rem]"
                >
                  <span className="font-sans text-base font-semibold tabular-nums text-ouro-texto">
                    {i + 1}.
                  </span>
                  {s.titulo}
                </h2>
                {s.blocos.length > 0 && (
                  <div className="mt-5 flex flex-col gap-4 text-[1.0625rem] leading-[1.75] text-texto-suave">
                    <Blocos blocos={s.blocos} />
                  </div>
                )}
                {s.subsecoes?.map((sub, j) => (
                  <div key={sub.id} id={sub.id} className="mt-8 scroll-mt-28">
                    <h3 className="flex items-baseline gap-3 text-lg font-semibold text-texto">
                      <span className="text-sm tabular-nums text-ouro-texto">
                        {i + 1}.{j + 1}
                      </span>
                      {sub.titulo}
                    </h3>
                    <div className="mt-4 flex flex-col gap-4 text-[1.0625rem] leading-[1.75] text-texto-suave">
                      <Blocos blocos={sub.blocos} />
                    </div>
                  </div>
                ))}
              </section>
            ))}
          </div>

          <aside className="mt-20 border-t border-linha pt-10">
            <h2 className="classical-title text-2xl text-texto">{r.duvidas}</h2>
            <p className="mt-3 text-[1.0625rem] leading-relaxed text-texto-suave">
              {r.escreva}{' '}
              <a
                href={`mailto:${canal}`}
                className="font-medium text-ouro-texto underline decoration-ouro/40 underline-offset-[3px] hover:decoration-ouro"
              >
                {canal}
              </a>
              .
            </p>
          </aside>
        </article>
      </div>
    </div>
  );
}
