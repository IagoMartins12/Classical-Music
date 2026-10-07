import type { Metadata } from 'next';
import { AgendaDoBlog } from '@/app/components/blog/site/AgendaDoBlog';
import { JsonLd, PAGINA } from '@/app/components/blog/site/pecas';
import { cx } from '@/app/components/ui/cx';
import { BLOG } from '@/app/conteudo/blog';
import { tolerarApiForaNoBuild } from '@/app/libs/api/build-tolerance';
import { loadCalendar } from '@/app/requests/calendar-requests';
import { chaveDoDia } from '@/app/utils/blog/formatos';
import { rotasDoBlog } from '@/app/utils/blog/rotas';
import { jsonLdDaAgenda, metadadosDePagina } from '@/app/utils/blog/seo';
import {
  routeLanguage,
  type LangParams,
} from '@/app/utils/translations/routeLanguage';

/**
 * A agenda de concertos (escolha de 30/09/2026: o esboço C). O mês atual
 * vem do servidor (com os concertos no dado estruturado, para a busca); a
 * troca de mês e os filtros acontecem no navegador.
 */

export const revalidate = 600;

type Props = { params: LangParams };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const idioma = await routeLanguage(params);
  const t = BLOG[idioma].agenda;
  return metadadosDePagina({
    idioma,
    titulo: t.meta,
    descricao: t.metaDescricao,
    caminhoPt: rotasDoBlog.agenda('pt'),
    caminhoEn: rotasDoBlog.agenda('en'),
  });
}

export default async function Agenda({ params }: Props) {
  const idioma = await routeLanguage(params);
  const t = BLOG[idioma].agenda;

  const hoje = chaveDoDia(new Date());
  const mes = hoje.slice(0, 7);
  const [ano, m] = mes.split('-').map(Number);
  const inicio = new Date(Date.UTC(ano, m - 1, 1, 3));
  const fim = new Date(Date.UTC(ano, m, 1, 3) - 1);

  const { events, filters } = await tolerarApiForaNoBuild(
    () => loadCalendar(inicio, fim),
    { events: [], filters: { venues: [], cities: [], states: [] } },
    'blog: agenda'
  );

  const futuros = events.filter((e) => e.end >= new Date());

  return (
    <div className={cx(PAGINA, 'pt-8 lg:pt-10')}>
      <JsonLd
        dados={jsonLdDaAgenda(
          futuros.map((e) => ({
            id: e.id,
            titulo: e.title,
            inicio: e.start.toISOString(),
            fim: e.end.toISOString(),
            descricao: e.description ?? null,
            imagem: e.imageUrl ?? null,
            ingresso: e.ticketUrl ?? e.externalUrl ?? null,
            gratuito: e.isFree,
            casa: e.venue.name,
            cidade: e.venue.city,
            estado: e.venue.state,
            compositores: e.composers.map((c) => ({ nome: c.name })),
          }))
        )}
      />
      <header className="mb-8 flex flex-col gap-3">
        <h1 className="font-display text-[2.5rem] leading-[1.05] tracking-[-0.015em] sm:text-[3.25rem]">
          {t.titulo}
        </h1>
        <p className="max-w-[52ch] text-[1.1875rem] leading-[1.55] text-texto-suave">
          {t.descricao}
        </p>
      </header>
      <AgendaDoBlog
        idioma={idioma}
        mesInicial={mes}
        hoje={hoje}
        eventosIniciais={events}
        filtrosIniciais={filters}
      />
    </div>
  );
}
