'use client';

import Link from 'next/link';
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  PiAppleLogo,
  PiArrowSquareOut,
  PiCalendarPlus,
  PiDownloadSimple,
  PiGoogleLogo,
  PiMicrosoftOutlookLogo,
  PiClock,
  PiMapPin,
  PiMusicNotes,
  PiTicket,
  PiUsersThree,
} from 'react-icons/pi';
import { Badge } from '@/app/components/ui/Badge';
import { Button, classesDeBotao } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import { Sheet } from '@/app/components/ui/Sheet';
import { cx } from '@/app/components/ui/cx';
import { BLOG, rotuloDoTipo, type Idioma } from '@/app/conteudo/blog';
import type { CalendarEventData } from '@/app/requests/calendar-requests';
import { dataLonga, horaDoEvento } from '@/app/utils/blog/formatos';
import { Capa } from './Capa';

/**
 * O detalhe de um evento da agenda, numa folha.
 *
 * **Uma folha só para o blog inteiro.** A agenda do mês tem dezenas de
 * eventos; cada um com a sua `<dialog>` encheria a página. O provedor fica
 * na casca do blog e qualquer lista (a agenda, a agenda da semana do início,
 * os destaques) abre o evento pelo `BotaoDoEvento`.
 *
 * Mostra tudo o que o evento tem: quando (com o fim, se dura), onde (casa,
 * sala, cidade), quem toca e rege, o programa com os compositores do
 * acervo, a descrição inteira, preços. E as ações: os ingressos, o evento
 * no Google Agenda de quem lê, e o arquivo .ics para os outros calendários
 * (Apple, Outlook).
 */

interface Abridor {
  abrir: (evento: CalendarEventData) => void;
}

const Contexto = createContext<Abridor | null>(null);

export function ProvedorDeEventos({
  idioma,
  children,
}: {
  idioma: Idioma;
  children: ReactNode;
}) {
  const [evento, setEvento] = useState<CalendarEventData | null>(null);
  const [aberto, setAberto] = useState(false);
  const abrir = useCallback((e: CalendarEventData) => {
    setEvento(e);
    setAberto(true);
  }, []);
  const valor = useMemo(() => ({ abrir }), [abrir]);

  return (
    <Contexto.Provider value={valor}>
      {children}
      <Sheet
        aberto={aberto}
        aoFechar={() => setAberto(false)}
        titulo={evento?.title ?? ''}
        descricao={evento?.subtitle}
        largura="m"
      >
        {/* A chave remonta o corpo a cada evento: nada do anterior fica. */}
        {evento && <Corpo key={evento.id} evento={evento} idioma={idioma} />}
      </Sheet>
    </Contexto.Provider>
  );
}

/**
 * O título do evento como botão que abre o detalhe. Com `esticado`, o clique
 * vale para o cartão inteiro (o pai precisa de `relative`), como os títulos
 * dos cartões de artigo.
 */
export function BotaoDoEvento({
  evento,
  esticado = true,
  className,
  children,
}: {
  evento: CalendarEventData;
  esticado?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const abridor = useContext(Contexto);
  return (
    <button
      type="button"
      aria-haspopup="dialog"
      onClick={() => abridor?.abrir(evento)}
      className={cx('text-left', esticado && 'blog-titulo-link', className)}
    >
      {children}
    </button>
  );
}

function Corpo({
  evento: e,
  idioma,
}: {
  evento: CalendarEventData;
  idioma: Idioma;
}) {
  const t = BLOG[idioma].agenda;
  const fuso = e.timeZone;
  const ingresso = e.ticketUrl || e.externalUrl;
  const hora = horaDoEvento(e.start, idioma, fuso, e.allDay);
  const variosDias = e.end.getTime() - e.start.getTime() > 26 * 3_600_000;
  const [escolhendo, setEscolhendo] = useState(false);

  const linhas: Array<{
    icone: typeof PiClock;
    rotulo: string;
    conteudo: ReactNode;
  }> = [
    {
      icone: PiClock,
      rotulo: t.quando,
      conteudo: (
        <>
          <time dateTime={e.start.toISOString()}>
            {dataLonga(e.start, idioma)}
            {hora && <span className="t-dado">, {hora}</span>}
          </time>
          {variosDias && (
            <span className="block text-texto-fraco">
              {t.ate(dataLonga(e.end, idioma))}
            </span>
          )}
        </>
      ),
    },
    {
      icone: PiMapPin,
      rotulo: t.onde,
      conteudo: (
        <>
          {e.venue.name}
          {e.room && <span className="text-texto-fraco"> · {e.room}</span>}
          {e.venue.city !== 'N/A' && (
            <span className="block text-texto-fraco">
              {e.venue.city}
              {e.venue.state !== 'N/A' && (
                <span className="t-dado"> {e.venue.state}</span>
              )}
            </span>
          )}
        </>
      ),
    },
  ];
  if (e.conductor || e.ensemble) {
    linhas.push({
      icone: PiUsersThree,
      rotulo: t.quemToca,
      conteudo: (
        <>
          {e.ensemble && <span className="block">{e.ensemble}</span>}
          {e.conductor && (
            <span className="block text-texto-fraco">
              {t.regencia}: {e.conductor}
            </span>
          )}
        </>
      ),
    });
  }
  if (e.composers.length) {
    linhas.push({
      icone: PiMusicNotes,
      rotulo: t.noPrograma,
      conteudo: (
        <span className="flex flex-wrap gap-x-1">
          {e.composers.map((c, i) => (
            <span key={c.id}>
              <Link
                href={`/composer/${c.id}`}
                className="underline decoration-linha-forte underline-offset-4 hover:decoration-ouro"
              >
                {c.name}
              </Link>
              {i < e.composers.length - 1 && ','}
            </span>
          ))}
        </span>
      ),
    });
  }
  if (e.ticketInfo || e.isFree) {
    linhas.push({
      icone: PiTicket,
      rotulo: t.ingressos,
      conteudo: e.isFree ? (
        <>
          <Badge>{t.gratuito}</Badge>
          {e.ticketInfo && <span className="mt-1 block">{e.ticketInfo}</span>}
        </>
      ) : (
        e.ticketInfo
      ),
    });
  }

  return (
    <div className="flex flex-col gap-6">
      {e.imageUrl && (
        <Capa
          src={e.imageUrl}
          alt=""
          inicial={e.title}
          sizes="(min-width: 640px) 560px, 100vw"
          esqueleto
          className="aspect-[16/9] rounded-card"
        />
      )}
      <p className="t-rotulo text-ouro-texto">{rotuloDoTipo(idioma, e.type)}</p>

      <dl className="flex flex-col gap-4">
        {linhas.map((l) => (
          <div
            key={l.rotulo}
            className="grid grid-cols-[1.5rem_minmax(0,1fr)] gap-x-3"
          >
            <Icon de={l.icone} className="mt-0.5 text-texto-fraco" />
            <dt className="sr-only">{l.rotulo}</dt>
            <dd className="text-[0.9375rem] leading-[1.5]">{l.conteudo}</dd>
          </div>
        ))}
      </dl>

      {e.description && (
        <p className="whitespace-pre-line text-[0.9375rem] leading-[1.6] text-texto-suave">
          {e.description}
        </p>
      )}

      {/* No telefone os botões ocupam a largura, um embaixo do outro. */}
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        {ingresso && (
          <a
            href={ingresso}
            target="_blank"
            rel="noopener noreferrer"
            className={classesDeBotao('primario')}
          >
            {e.isFree ? t.saibaMais : t.comprarIngressos}
            <Icon de={PiArrowSquareOut} tamanho="pp" />
            <span className="sr-only">{BLOG[idioma].corpo.abreEmNovaAba}</span>
          </a>
        )}
        <Button icone={PiCalendarPlus} onClick={() => setEscolhendo(true)}>
          {t.adicionarAgenda}
        </Button>
      </div>
      <EscolhaDeCalendario
        aberto={escolhendo}
        aoFechar={() => setEscolhendo(false)}
        evento={e}
        idioma={idioma}
      />
    </div>
  );
}

/**
 * O evento já preenchido no Google Agenda de quem clica (a pessoa só
 * confirma "Salvar"). Datas em UTC, no formato que o Google pede.
 */
function linkDoGoogle(e: CalendarEventData) {
  const carimbo = (d: Date) =>
    d
      .toISOString()
      .replace(/[-:]/g, '')
      .replace(/\.\d{3}/, '');
  const fim =
    e.end > e.start ? e.end : new Date(e.start.getTime() + 2 * 3_600_000);
  const local = [
    e.venue.name,
    e.room,
    e.venue.city !== 'N/A' ? e.venue.city : null,
  ]
    .filter(Boolean)
    .join(', ');
  const detalhes = [e.description?.slice(0, 900), e.ticketUrl || e.externalUrl]
    .filter(Boolean)
    .join('\n\n');
  const p = new URLSearchParams({
    action: 'TEMPLATE',
    text: e.title,
    dates: `${carimbo(e.start)}/${carimbo(fim)}`,
    ...(local ? { location: local } : {}),
    ...(detalhes ? { details: detalhes } : {}),
  });
  return `https://calendar.google.com/calendar/render?${p.toString()}`;
}

/**
 * O evento como arquivo de calendário (RFC 5545), baixado na hora: o
 * iPhone, o Mac e o Outlook abrem direto no calendário de cada um.
 */
function baixarIcs(e: CalendarEventData) {
  const carimbo = (d: Date) =>
    d
      .toISOString()
      .replace(/[-:]/g, '')
      .replace(/\.\d{3}/, '');
  const escapar = (s: string) =>
    s.replace(/[\\,;]/g, (c) => `\\${c}`).replace(/\n/g, '\\n');
  const local = [
    e.venue.name,
    e.room,
    e.venue.city !== 'N/A' ? e.venue.city : null,
  ]
    .filter(Boolean)
    .join(', ');
  const fim =
    e.end > e.start ? e.end : new Date(e.start.getTime() + 2 * 3_600_000);
  const linhas = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Opus Atlas//Agenda//PT',
    'BEGIN:VEVENT',
    `UID:${e.id}@opusatlas.com.br`,
    `DTSTAMP:${carimbo(new Date())}`,
    `DTSTART:${carimbo(e.start)}`,
    `DTEND:${carimbo(fim)}`,
    `SUMMARY:${escapar(e.title)}`,
    local && `LOCATION:${escapar(local)}`,
    e.description && `DESCRIPTION:${escapar(e.description.slice(0, 900))}`,
    (e.ticketUrl || e.externalUrl) && `URL:${e.ticketUrl || e.externalUrl}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter(Boolean);
  const arquivo = new Blob([linhas.join('\r\n')], {
    type: 'text/calendar;charset=utf-8',
  });
  const url = URL.createObjectURL(arquivo);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${(e.slug || e.id).slice(0, 60)}.ics`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ---------------------------------------------------------------------------
// Adicionar à agenda
// ---------------------------------------------------------------------------

type Calendario = 'google' | 'apple' | 'outlook' | 'office' | 'arquivo';

/** O calendário do aparelho vem primeiro (e marcado como sugerido). */
function sugerido(): Calendario {
  if (typeof navigator === 'undefined') return 'google';
  const ua = navigator.userAgent;
  if (/iPhone|iPad|Macintosh|Mac OS X/.test(ua)) return 'apple';
  if (/Windows/.test(ua)) return 'outlook';
  return 'google';
}

/** O evento no Outlook na web (pessoal ou do trabalho), já preenchido. */
function linkDoOutlook(e: CalendarEventData, base: string) {
  const fim =
    e.end > e.start ? e.end : new Date(e.start.getTime() + 2 * 3_600_000);
  const local = [
    e.venue.name,
    e.room,
    e.venue.city !== 'N/A' ? e.venue.city : null,
  ]
    .filter(Boolean)
    .join(', ');
  const p = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: e.title,
    startdt: e.start.toISOString(),
    enddt: fim.toISOString(),
    ...(local ? { location: local } : {}),
    ...(e.description ? { body: e.description.slice(0, 900) } : {}),
  });
  return `${base}/calendar/0/action/compose?${p.toString()}`;
}

/**
 * A escolha do calendário, na folha do sistema e no desenho da folha de
 * compartilhar (ícone redondo e nome). Google e Outlook abrem o evento já
 * preenchido na conta de quem está no navegador; Apple e "outro" baixam o
 * .ics, que o iPhone e o Mac abrem direto no Calendário.
 */
function EscolhaDeCalendario({
  aberto,
  aoFechar,
  evento,
  idioma,
}: {
  aberto: boolean;
  aoFechar: () => void;
  evento: CalendarEventData;
  idioma: Idioma;
}) {
  const t = BLOG[idioma].agenda;
  const primeiro = sugerido();
  const opcoes: Array<{
    id: Calendario;
    nome: string;
    icone: typeof PiCalendarPlus;
    href?: string;
  }> = [
    {
      id: 'google',
      nome: 'Google Agenda',
      icone: PiGoogleLogo,
      href: linkDoGoogle(evento),
    },
    { id: 'apple', nome: t.calendarioApple, icone: PiAppleLogo },
    {
      id: 'outlook',
      nome: 'Outlook',
      icone: PiMicrosoftOutlookLogo,
      href: linkDoOutlook(evento, 'https://outlook.live.com'),
    },
    {
      id: 'office',
      nome: t.outlookTrabalho,
      icone: PiMicrosoftOutlookLogo,
      href: linkDoOutlook(evento, 'https://outlook.office.com'),
    },
    { id: 'arquivo', nome: t.outroCalendario, icone: PiDownloadSimple },
  ];
  opcoes.sort((a, b) => Number(b.id === primeiro) - Number(a.id === primeiro));

  const classe =
    'group flex w-full flex-col items-center gap-2 rounded-controle text-[0.8125rem] text-texto-suave';
  const circulo =
    'grid h-12 w-12 place-items-center rounded-full bg-sup-2 text-texto transition-[background-color,color,transform] duration-[var(--t-toque)] ease-saida group-hover:bg-[var(--interactive-hover)] group-hover:text-ouro-texto group-active:scale-95 motion-reduce:transition-none';

  return (
    <Sheet
      aberto={aberto}
      aoFechar={aoFechar}
      titulo={t.adicionarAgenda}
      descricao={evento.title}
      largura="p"
    >
      <ul className="grid grid-cols-3 gap-y-5">
        {opcoes.map((o) => {
          const miolo = (
            <>
              <span className={cx(circulo, o.id === primeiro && 'tint-ouro')}>
                <Icon de={o.icone} tamanho="m" />
              </span>
              <span className="text-center leading-tight">
                {o.nome}
                {o.id === primeiro && (
                  <span className="t-legenda block">{t.sugerido}</span>
                )}
              </span>
            </>
          );
          return (
            <li key={o.id}>
              {o.href ? (
                <a
                  href={o.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={aoFechar}
                  className={classe}
                >
                  {miolo}
                </a>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    baixarIcs(evento);
                    aoFechar();
                  }}
                  className={classe}
                >
                  {miolo}
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </Sheet>
  );
}
