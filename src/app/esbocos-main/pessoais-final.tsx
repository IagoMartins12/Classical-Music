'use client';

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import {
  PiCheck,
  PiClockCounterClockwise,
  PiCloudArrowDown,
  PiDownloadSimple,
  PiFlag,
  PiGoogleLogo,
  PiLinkSimple,
  PiMagnifyingGlass,
  PiMusicNotes,
  PiPencilSimple,
  PiPlus,
  PiSealCheck,
  PiTrash,
  PiUploadSimple,
  PiUser,
} from 'react-icons/pi';
import toast from 'react-hot-toast';
import Image from '@/app/components/SmartImage';
import { Abas, Aba } from '@/app/components/ui/Abas';
import { Button } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import { Sheet } from '@/app/components/ui/Sheet';
import { cx } from '@/app/components/ui/cx';
import { FAMOSOS, PESSOA, rota, type EsbocoId } from './dados';
import { MINIATURAS } from './fichas-dados';
import {
  ANOTACOES_NOTURNO,
  COLECOES_FINAL,
  ENVIOS_FINAL,
  FORMATOS,
  PERIODOS,
  TIPOS_OBRA,
  type Qualidade,
} from './final-dados';
import { CartaoAnotacao } from './anotacoes-final';
import { Coracao } from './coracao';
import {
  Ficha,
  Retrato,
  Rostos,
  linkTexto,
  retratoDe,
  useEsboco,
} from './pecas';
import { ProximaConquista } from './pessoais';

/**
 * As páginas pessoais (06/10), com o mapa do que o produto já faz. Envios é
 * a `/upload` inteira: limites, abas, busca e filtros, qualidade do dado,
 * estado, histórico, e os formulários (compositor com extração do IMSLP e da
 * Wikipédia, obra com catálogo e mídia, partitura com agrupamento, importação
 * em lote do IMSLP).
 */

const campo =
  'input-classical min-h-[var(--alvo)] w-full rounded-controle px-4 text-base';

function Campo({
  rotulo,
  children,
  ajuda,
  largo = false,
}: {
  rotulo: string;
  children: ReactNode;
  ajuda?: string;
  largo?: boolean;
}) {
  return (
    <label className={cx('flex flex-col gap-1.5', largo && 'sm:col-span-2')}>
      <span className="t-rotulo">{rotulo}</span>
      {children}
      {ajuda && <span className="t-legenda">{ajuda}</span>}
    </label>
  );
}

function Bloco({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-4">
      <legend className="t-subtitulo mb-1">{titulo}</legend>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}

// ---------------------------------------------------------------------------
// Envios
// ---------------------------------------------------------------------------

const ROTULO_QUALIDADE: Record<Qualidade, string> = {
  alta: 'Ficha completa',
  média: 'Ficha parcial',
  baixa: 'Ficha incompleta',
};

function Estado({ estado }: { estado: 'No ar' | 'Denunciado' | 'Verificado' }) {
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1.5 t-rotulo',
        estado === 'Denunciado'
          ? 'text-erro'
          : estado === 'Verificado'
            ? 'text-verificado'
            : 'text-texto-suave'
      )}
    >
      <Icon
        de={
          estado === 'Denunciado'
            ? PiFlag
            : estado === 'Verificado'
              ? PiSealCheck
              : PiCheck
        }
        tamanho="pp"
      />
      {estado}
    </span>
  );
}

function Qualidade({ q }: { q: Qualidade }) {
  const n = q === 'alta' ? 3 : q === 'média' ? 2 : 1;
  return (
    <span
      className="inline-flex items-center gap-2 t-legenda"
      title="Quanto da ficha está preenchido"
    >
      <span className="flex gap-0.5" aria-hidden="true">
        {[1, 2, 3].map((k) => (
          <span
            key={k}
            className={cx(
              'h-1.5 w-3 rounded-full',
              k <= n ? 'bg-[var(--ouro)]' : 'bg-[var(--linha)]'
            )}
          />
        ))}
      </span>
      {ROTULO_QUALIDADE[q]}
    </span>
  );
}

type Formulario = 'compositor' | 'obra' | 'partitura' | 'lote' | null;

export function EnviosFinal({ esboco }: { esboco: EsbocoId }) {
  const e = ENVIOS_FINAL;
  const [aba, setAba] = useState<
    'tudo' | 'compositores' | 'obras' | 'partituras' | 'historico'
  >('tudo');
  const [form, setForm] = useState<Formulario>(null);
  const linha = 'flex flex-wrap items-center gap-x-5 gap-y-2 py-4';

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            [
              'Envios no plano Free',
              `${e.limite.usados} de ${e.limite.total}`,
              e.limite.usados / e.limite.total,
            ],
            [
              'Vídeos',
              `${e.limite.videos.usados} de ${e.limite.videos.total}`,
              e.limite.videos.usados / e.limite.videos.total,
            ],
            [
              'No ar',
              String(
                e.stats.compositores +
                  e.stats.obras +
                  e.stats.partituras -
                  e.stats.denunciados
              ),
              null,
            ],
            ['Com denúncia', String(e.stats.denunciados), null],
          ].map(([t, v, p]) => (
            <div
              key={t as string}
              className="flex flex-col gap-2 rounded-card bg-sup-2 p-4"
            >
              <span className="t-legenda">{t}</span>
              <span className="font-display text-[1.75rem] leading-none">
                {v}
              </span>
              {p !== null && (
                <span className="h-1 overflow-hidden rounded-full bg-[var(--linha)]">
                  <span
                    className="cresce block h-full rounded-full fill-ouro"
                    style={{ width: `${(p as number) * 100}%` }}
                  />
                </span>
              )}
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 lg:max-w-xs lg:justify-end">
          <Button
            variante="primario"
            icone={PiUploadSimple}
            onClick={() => setForm('partitura')}
          >
            Enviar partitura
          </Button>
          <Button icone={PiMusicNotes} onClick={() => setForm('obra')}>
            Nova obra
          </Button>
          <Button icone={PiUser} onClick={() => setForm('compositor')}>
            Novo compositor
          </Button>
          <Button
            variante="fantasma"
            icone={PiCloudArrowDown}
            onClick={() => setForm('lote')}
          >
            Importar do IMSLP
          </Button>
        </div>
      </div>
      <p className="t-rotulo text-texto-suave">
        Tudo o que você envia entra no ar na hora, com o seu nome.{' '}
        <Link href="#" className={cx('text-ouro-texto', linkTexto)}>
          No Plus, sem limite de envios.
        </Link>
      </p>

      <div className="flex flex-col gap-4">
        <Abas rotulo="Seus envios">
          {(
            [
              ['tudo', 'Tudo', 3],
              ['compositores', 'Compositores', 1],
              ['obras', 'Obras', 1],
              ['partituras', 'Partituras', 1],
              ['historico', 'Histórico', null],
            ] as const
          ).map(([id, r, n]) => (
            <Aba
              key={id}
              ativa={aba === id}
              onClick={() => setAba(id)}
              className="inline-flex items-center gap-2"
            >
              {id === 'historico' && (
                <Icon de={PiClockCounterClockwise} tamanho="p" />
              )}
              {r}
              {n !== null ? ` · ${n}` : ''}
            </Aba>
          ))}
        </Abas>
        {aba !== 'historico' && (
          <div className="flex flex-wrap items-center gap-2">
            <label className="c-busca flex min-w-0 flex-1 items-center gap-2 rounded-full bg-[var(--campo)] px-4 sm:max-w-sm">
              <Icon
                de={PiMagnifyingGlass}
                tamanho="p"
                className="text-texto-fraco"
              />
              <span className="sr-only">Buscar nos seus envios</span>
              <input
                type="search"
                placeholder="Buscar nos seus envios"
                className="min-h-10 min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-texto-fraco"
              />
            </label>
            {['Compositor', 'Obra', 'Época'].map((f) => (
              <Ficha key={f}>{f}</Ficha>
            ))}
          </div>
        )}
      </div>

      {aba === 'historico' ? (
        <ol className="relative flex flex-col gap-0 pl-6 before:absolute before:bottom-2 before:left-[0.4rem] before:top-2 before:w-px before:bg-[var(--linha-forte)]">
          {e.historico.map((h) => (
            <li key={h.quando} className="relative py-3">
              <span
                className="absolute -left-6 top-[1.15rem] h-3 w-3 rounded-full border-2 border-[var(--linha-forte)] bg-[var(--fundo)]"
                aria-hidden="true"
              />
              <span className="t-dado text-[0.75rem] text-texto-fraco">
                {h.quando}
              </span>
              <p className="t-rotulo">
                {h.acao}{' '}
                <span className="font-display text-[1.0625rem]">{h.alvo}</span>
              </p>
            </li>
          ))}
        </ol>
      ) : (
        <div className="flex flex-col gap-8">
          {(aba === 'tudo' || aba === 'compositores') && (
            <section className="flex flex-col gap-1">
              <h3 className="t-legenda">Compositores</h3>
              <ul className="flex flex-col divide-y divide-[var(--linha)]">
                {e.compositores.map((c) => (
                  <li key={c.id} className={linha}>
                    <Retrato
                      nome={c.nome}
                      src={c.retrato}
                      sizes="48px"
                      className="h-12 w-12 rounded-full"
                    />
                    <span className="flex min-w-0 flex-1 flex-col">
                      <Link
                        href={rota(esboco, 'compositor-tipico')}
                        className={cx('font-display text-[1.25rem]', linkTexto)}
                      >
                        {c.nome}
                      </Link>
                      <span className="t-rotulo text-texto-suave">
                        {c.detalhe} · {c.obras} obras · fonte: {c.fonte}
                      </span>
                    </span>
                    <Qualidade q={c.qualidade} />
                    <Estado estado={c.estado} />
                    <span className="t-legenda">{c.quando}</span>
                    <span className="flex gap-1">
                      <Button
                        tamanho="p"
                        variante="fantasma"
                        icone={PiPencilSimple}
                        rotulo="Editar"
                        onClick={() => setForm('compositor')}
                      />
                      <Button
                        tamanho="p"
                        variante="fantasma"
                        icone={PiTrash}
                        rotulo="Apagar"
                      />
                    </span>
                  </li>
                ))}
              </ul>
              <p className="rounded-controle bg-sup-2 px-4 py-3 t-rotulo text-texto-suave">
                A denúncia diz:{' '}
                <span className="text-texto">
                  “o retrato não é da compositora”
                </span>
                . Prazo da moderação: 7 dias. Você pode trocar o retrato agora.
              </p>
            </section>
          )}
          {(aba === 'tudo' || aba === 'obras') && (
            <section className="flex flex-col gap-1">
              <h3 className="t-legenda">Obras</h3>
              <ul className="flex flex-col divide-y divide-[var(--linha)]">
                {e.obras.map((o) => (
                  <li key={o.id} className={linha}>
                    <span className="grid h-12 w-12 place-items-center rounded-controle bg-sup-2 text-texto-suave">
                      <Icon de={PiMusicNotes} tamanho="m" />
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col">
                      <Link
                        href={rota(esboco, 'obra-tipica')}
                        className={cx('font-display text-[1.25rem]', linkTexto)}
                      >
                        {o.titulo}
                      </Link>
                      <span className="t-rotulo text-texto-suave">
                        {o.compositor} · {o.detalhe} · {o.partituras} partituras
                      </span>
                      <span className="t-legenda">
                        Falta: {o.falta.join(', ')}
                      </span>
                    </span>
                    <Qualidade q={o.qualidade} />
                    <Estado estado={o.estado} />
                    <span className="t-legenda">{o.quando}</span>
                    <span className="flex gap-1">
                      <Button
                        tamanho="p"
                        variante="fantasma"
                        icone={PiUploadSimple}
                        rotulo="Enviar partitura desta obra"
                        onClick={() => setForm('partitura')}
                      />
                      <Button
                        tamanho="p"
                        variante="fantasma"
                        icone={PiPencilSimple}
                        rotulo="Editar"
                        onClick={() => setForm('obra')}
                      />
                      <Button
                        tamanho="p"
                        variante="fantasma"
                        icone={PiTrash}
                        rotulo="Apagar"
                      />
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}
          {(aba === 'tudo' || aba === 'partituras') && (
            <section className="flex flex-col gap-1">
              <h3 className="t-legenda">Partituras</h3>
              <ul className="flex flex-col divide-y divide-[var(--linha)]">
                {e.partituras.map((p) => (
                  <li key={p.id} className={linha}>
                    <span className="relative aspect-[1/1.3] w-10 overflow-hidden rounded-[4px] bg-sobre-foto">
                      <span className="absolute inset-0 grid place-items-center t-dado text-[0.625rem] text-sobre-ouro">
                        PDF
                      </span>
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="font-display text-[1.25rem]">
                        {p.titulo}
                      </span>
                      <span className="t-rotulo text-texto-suave">
                        {p.obra} · {p.compositor} · {p.formato} · {p.paginas}{' '}
                        pág. · {p.tamanho}
                      </span>
                      <span className="t-legenda">
                        Grupo: {p.grupo} · {p.baixadas} downloads
                      </span>
                    </span>
                    <Qualidade q={p.qualidade} />
                    <Estado estado={p.estado} />
                    <span className="t-legenda">{p.quando}</span>
                    <span className="flex gap-1">
                      <Button
                        tamanho="p"
                        variante="fantasma"
                        icone={PiDownloadSimple}
                        rotulo="Baixar"
                      />
                      <Button
                        tamanho="p"
                        variante="fantasma"
                        icone={PiPencilSimple}
                        rotulo="Editar"
                        onClick={() => setForm('partitura')}
                      />
                      <Button
                        tamanho="p"
                        variante="fantasma"
                        icone={PiTrash}
                        rotulo="Apagar"
                      />
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
      <ProximaConquista id="dez-envios" />
      <FormularioDeEnvio form={form} aoFechar={() => setForm(null)} />
    </div>
  );
}

function FormularioDeEnvio({
  form,
  aoFechar,
}: {
  form: Formulario;
  aoFechar: () => void;
}) {
  const [extraido, setExtraido] = useState(false);
  const [modo, setModo] = useState<'arquivo' | 'link'>('arquivo');
  const [grupo, setGrupo] = useState('Partes individuais');
  const [lote, setLote] = useState<'descobrir' | 'escolher' | 'importando'>(
    'descobrir'
  );
  const titulos: Record<Exclude<Formulario, null>, [string, string]> = {
    compositor: [
      'Novo compositor',
      'Comece pelo link do IMSLP ou da Wikipédia: a gente preenche o que der e confere se ele já existe.',
    ],
    obra: [
      'Nova obra',
      'Só título e compositor são obrigatórios. Quanto mais completo, melhor a página.',
    ],
    partitura: [
      'Enviar partitura',
      'PDF, MusicXML, MIDI ou imagens. Entra no ar na hora, no grupo que você escolher.',
    ],
    lote: [
      'Importar obras do IMSLP',
      'Pela página do compositor no IMSLP: a gente lista as obras e você marca as que entram.',
    ],
  };
  if (!form) return null;
  const [titulo, descricao] = titulos[form];

  return (
    <Sheet
      aberto={!!form}
      aoFechar={aoFechar}
      titulo={titulo}
      descricao={descricao}
      largura="g"
      rodape={
        <div className="flex items-center justify-between gap-3">
          <span className="t-legenda">Conta 1 envio dos 20 do plano Free</span>
          <div className="flex gap-2">
            <Button variante="fantasma" onClick={aoFechar}>
              Cancelar
            </Button>
            <Button
              variante="primario"
              onClick={() => {
                aoFechar();
                toast.success('Enviado — já está no ar');
              }}
            >
              {form === 'lote' ? 'Importar as marcadas' : 'Publicar'}
            </Button>
          </div>
        </div>
      }
    >
      {form === 'compositor' && (
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-3 rounded-card bg-sup-2 p-4">
            <span className="t-rotulo">Extrair de uma página</span>
            <div className="flex flex-wrap gap-2">
              <input
                className={cx(campo, 'min-w-0 flex-1')}
                defaultValue="https://imslp.org/wiki/Category:Nepomuceno,_Alberto"
                aria-label="Link do IMSLP ou da Wikipédia"
              />
              <Button icone={PiLinkSimple} onClick={() => setExtraido(true)}>
                Extrair dados
              </Button>
            </div>
            {extraido && (
              <span className="t-rotulo text-ok">
                Encontramos nome, datas, nacionalidade, retrato e 41 obras.
                Nenhum compositor igual no acervo.
              </span>
            )}
          </div>
          <Bloco titulo="Quem é">
            <Campo rotulo="Nome curto">
              <input
                className={campo}
                defaultValue={extraido ? 'Nepomuceno' : ''}
              />
            </Campo>
            <Campo rotulo="Nome completo">
              <input
                className={campo}
                defaultValue={extraido ? 'Alberto Nepomuceno' : ''}
              />
            </Campo>
            <Campo
              rotulo="Nomes alternativos"
              ajuda="Separados por vírgula: transliterações, apelidos."
              largo
            >
              <input className={campo} />
            </Campo>
            <Campo rotulo="Nacionalidade">
              <input
                className={campo}
                defaultValue={extraido ? 'Brasil' : ''}
              />
            </Campo>
            <Campo rotulo="Retrato">
              <Button icone={PiUploadSimple}>Escolher imagem</Button>
            </Campo>
          </Bloco>
          <Bloco titulo="Datas">
            <Campo
              rotulo="Nascimento"
              ajuda="Data inteira, se souber; só o ano também vale."
            >
              <input
                className={campo}
                defaultValue={extraido ? '6 de julho de 1864' : ''}
              />
            </Campo>
            <Campo rotulo="Morte" ajuda="Vazio se está vivo.">
              <input
                className={campo}
                defaultValue={extraido ? '16 de outubro de 1920' : ''}
              />
            </Campo>
          </Bloco>
          <Bloco titulo="Classificação">
            <Campo rotulo="Época">
              <select className={campo}>
                {PERIODOS.filter((p) => p.id !== 'todos').map((p) => (
                  <option key={p.id}>{p.nome}</option>
                ))}
              </select>
            </Campo>
            <Campo rotulo="Papel principal">
              <select className={campo}>
                {[
                  'Compositor',
                  'Intérprete',
                  'Regente',
                  'Editor',
                  'Arranjador',
                ].map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </Campo>
            <Campo rotulo="Instrumentos" largo>
              <input className={campo} placeholder="Piano, órgão…" />
            </Campo>
          </Bloco>
          <Bloco titulo="Biografia e links">
            <Campo rotulo="Biografia" largo>
              <textarea rows={4} className={cx(campo, 'py-3')} />
            </Campo>
            <Campo rotulo="IMSLP">
              <input className={campo} />
            </Campo>
            <Campo rotulo="Wikipédia">
              <input className={campo} />
            </Campo>
            <Campo rotulo="Vídeo (YouTube)" largo>
              <input className={campo} />
            </Campo>
          </Bloco>
        </div>
      )}

      {form === 'obra' && (
        <div className="flex flex-col gap-8">
          <Bloco titulo="A obra">
            <Campo rotulo="Compositor">
              <input className={campo} defaultValue="Alberto Nepomuceno" />
            </Campo>
            <Campo rotulo="Título">
              <input className={campo} defaultValue="Modinha" />
            </Campo>
            <Campo rotulo="Subtítulo">
              <input className={campo} />
            </Campo>
            <Campo rotulo="Tipo">
              <select className={campo}>
                {TIPOS_OBRA.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </Campo>
            <Campo
              rotulo="Faz parte de outra obra?"
              ajuda="Ex.: um noturno dentro dos Noturnos, Op. 9. Sugerimos pela semelhança do título."
              largo
            >
              <input className={campo} placeholder="Buscar a obra-mãe…" />
            </Campo>
            <Campo rotulo="Época">
              <select className={campo}>
                {PERIODOS.filter((p) => p.id !== 'todos').map((p) => (
                  <option key={p.id}>{p.nome}</option>
                ))}
              </select>
            </Campo>
            <Campo rotulo="Instrumento principal">
              <input className={campo} defaultValue="Voz e piano" />
            </Campo>
          </Bloco>
          <Bloco titulo="Catálogo">
            <Campo rotulo="Opus ou catálogo">
              <input className={campo} />
            </Campo>
            <Campo rotulo="Ano de composição">
              <input className={campo} defaultValue="1894" />
            </Campo>
            <Campo rotulo="Primeira publicação">
              <input className={campo} />
            </Campo>
            <Campo rotulo="Tonalidade">
              <input className={campo} />
            </Campo>
            <Campo rotulo="Duração (min)">
              <input inputMode="numeric" className={campo} />
            </Campo>
            <Campo rotulo="Dificuldade">
              <select className={campo}>
                {['Não sei', 'Iniciante', 'Intermediário', 'Avançado'].map(
                  (d) => (
                    <option key={d}>{d}</option>
                  )
                )}
              </select>
            </Campo>
            <Campo rotulo="Gêneros" largo>
              <input className={campo} placeholder="Modinha, canção…" />
            </Campo>
            <Campo rotulo="Categorias" largo>
              <input className={campo} placeholder="Para 2 instrumentistas…" />
            </Campo>
            <Campo rotulo="Página no IMSLP" largo>
              <input className={campo} />
            </Campo>
          </Bloco>
          <Bloco titulo="Ouvir e assistir">
            <Campo rotulo="Spotify">
              <input
                className={campo}
                placeholder="https://open.spotify.com/track/…"
              />
            </Campo>
            <Campo rotulo="YouTube">
              <input className={campo} />
            </Campo>
            <Campo rotulo="Áudio próprio">
              <Button icone={PiUploadSimple}>Enviar áudio</Button>
            </Campo>
            <Campo
              rotulo="Videoaula"
              ajuda="Vídeo seu ensinando: conta 1 dos 4 vídeos do Free."
            >
              <Button icone={PiUploadSimple}>Enviar vídeo</Button>
            </Campo>
          </Bloco>
        </div>
      )}

      {form === 'partitura' && (
        <div className="flex flex-col gap-8">
          <Bloco titulo="O arquivo">
            <Campo
              rotulo="Obra"
              ajuda="Vindo da página da obra, ela já vem escolhida."
              largo
            >
              <input
                className={campo}
                defaultValue="Noturnos, Op. 9 — Chopin"
              />
            </Campo>
            <div className="flex flex-col gap-2 sm:col-span-2">
              <div className="flex gap-2">
                <Ficha
                  ativa={modo === 'arquivo'}
                  onClick={() => setModo('arquivo')}
                >
                  Enviar arquivo
                </Ficha>
                <Ficha ativa={modo === 'link'} onClick={() => setModo('link')}>
                  Link externo
                </Ficha>
              </div>
              {modo === 'arquivo' ? (
                <span className="flex min-h-28 flex-col items-center justify-center gap-2 rounded-card border border-dashed border-[var(--linha-forte)] t-rotulo text-texto-suave">
                  <Icon de={PiUploadSimple} tamanho="g" />
                  Arraste o arquivo ou toque para escolher
                </span>
              ) : (
                <input
                  className={campo}
                  placeholder="https://…"
                  aria-label="Link da partitura"
                />
              )}
            </div>
            <Campo rotulo="Formato">
              <select className={campo}>
                {FORMATOS.map((f) => (
                  <option key={f}>{f}</option>
                ))}
              </select>
            </Campo>
            <Campo rotulo="Tipo">
              <select className={campo}>
                {[
                  'Partitura completa',
                  'Parte',
                  'Arranjo',
                  'Libreto',
                  'Outro',
                ].map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </Campo>
            <Campo
              rotulo="Título do arquivo"
              ajuda="Ex.: Violino I, Ato 2, Nº 2 com digitação."
            >
              <input className={campo} />
            </Campo>
            <Campo rotulo="Páginas">
              <input inputMode="numeric" className={campo} />
            </Campo>
          </Bloco>
          <fieldset className="flex flex-col gap-3">
            <legend className="t-subtitulo mb-1">Em que grupo ele entra</legend>
            <span className="t-rotulo text-texto-suave">
              Os grupos são os conjuntos da obra (partes de uma orquestração,
              volumes). Pelo que já existe:
            </span>
            {[
              {
                t: 'Partes individuais',
                r: 'Já existe uma partitura completa; esta pode ser uma parte.',
                c: 'alta',
              },
              {
                t: 'Arranjos',
                r: 'Criar uma seção nova para arranjos.',
                c: 'média',
              },
              {
                t: 'Enviadas por quem estuda aqui',
                r: 'O seu grupo nesta obra.',
                c: 'alta',
              },
            ].map((s) => (
              <label
                key={s.t}
                className={cx(
                  'flex cursor-pointer items-start gap-3 rounded-controle p-3',
                  grupo === s.t ? 'tint-ouro' : 'bg-sup-2'
                )}
              >
                <input
                  type="radio"
                  name="grupo"
                  checked={grupo === s.t}
                  onChange={() => setGrupo(s.t)}
                  className="mt-1 accent-[var(--ouro)]"
                />
                <span className="flex flex-col">
                  <span
                    className={cx(
                      'font-medium',
                      grupo === s.t && 'text-ouro-na-tinta'
                    )}
                  >
                    {s.t}
                  </span>
                  <span className="t-legenda">
                    {s.r} · confiança {s.c}
                  </span>
                </span>
              </label>
            ))}
            <Campo rotulo="Ou um grupo novo">
              <input className={campo} placeholder="Título do grupo" />
            </Campo>
          </fieldset>
          <Bloco titulo="Publicação">
            <Campo rotulo="Editor">
              <input className={campo} />
            </Campo>
            <Campo rotulo="Editora">
              <input className={campo} />
            </Campo>
            <Campo
              rotulo="Direitos"
              ajuda="Só domínio público ou trabalho seu."
            >
              <select className={campo}>
                {['Domínio público', 'Obra minha (CC BY)', 'Outro'].map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </Campo>
            <Campo rotulo="Miniatura">
              <Button icone={PiUploadSimple}>Gerar da 1ª página</Button>
            </Campo>
            <Campo rotulo="Notas" largo>
              <textarea
                rows={3}
                className={cx(campo, 'py-3')}
                placeholder="Digitação, cortes, de onde veio…"
              />
            </Campo>
          </Bloco>
        </div>
      )}

      {form === 'lote' && (
        <div className="flex flex-col gap-6">
          <ol className="grid grid-cols-3 gap-2">
            {['Descobrir', 'Escolher', 'Importar'].map((p, i) => (
              <li key={p} className="flex flex-col gap-1.5">
                <span
                  className={cx(
                    'h-[3px] rounded-full',
                    i <= ['descobrir', 'escolher', 'importando'].indexOf(lote)
                      ? 'bg-[var(--ouro)]'
                      : 'bg-[var(--linha)]'
                  )}
                />
                <span className="t-legenda">{p}</span>
              </li>
            ))}
          </ol>
          {lote === 'descobrir' && (
            <div className="flex flex-col gap-3">
              <Campo rotulo="Página do compositor no IMSLP">
                <input
                  className={campo}
                  defaultValue="https://imslp.org/wiki/Category:Nepomuceno,_Alberto"
                />
              </Campo>
              <Button
                icone={PiMagnifyingGlass}
                className="self-start"
                onClick={() => setLote('escolher')}
              >
                Descobrir obras
              </Button>
            </div>
          )}
          {lote === 'escolher' && (
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-4 t-rotulo text-texto-suave">
                <span>41 encontradas</span>
                <span>· 27 novas</span>
                <span>· 14 já no acervo</span>
              </div>
              <ul className="flex max-h-72 flex-col divide-y divide-[var(--linha)] overflow-y-auto rounded-card bg-sup-2 px-4">
                {[
                  'Série brasileira',
                  'Galhofeira, Op. 13 nº 4',
                  'Trovas, Op. 29',
                  'Sinfonia em sol menor',
                  'Modinha (já existe)',
                ].map((t, i) => (
                  <li
                    key={t}
                    className="flex items-center gap-3 py-2.5 t-rotulo"
                  >
                    <input
                      type="checkbox"
                      defaultChecked={i < 4}
                      disabled={i === 4}
                      className="h-4 w-4 accent-[var(--ouro)]"
                    />
                    <span
                      className={cx('flex-1', i === 4 && 'text-texto-fraco')}
                    >
                      {t}
                    </span>
                  </li>
                ))}
              </ul>
              <Button
                className="self-start"
                onClick={() => setLote('importando')}
              >
                Importar 4 obras
              </Button>
            </div>
          )}
          {lote === 'importando' && (
            <div className="flex flex-col gap-3">
              <span className="t-rotulo">
                Importando 3 de 4 — “Trovas, Op. 29”
              </span>
              <span className="h-2 overflow-hidden rounded-full bg-[var(--linha)]">
                <span className="block h-full w-3/4 rounded-full fill-ouro" />
              </span>
              <span className="t-legenda">
                Roda na fila: pode fechar; avisamos quando terminar.
              </span>
            </div>
          )}
        </div>
      )}
    </Sheet>
  );
}

// ---------------------------------------------------------------------------
// Favoritos (com coração e coleções)
// ---------------------------------------------------------------------------

export function FavoritosFinal({ esboco }: { esboco: EsbocoId }) {
  const [aba, setAba] = useState<
    'compositores' | 'obras' | 'partituras' | 'colecoes'
  >('compositores');
  const comps = FAMOSOS.filter((c) =>
    PESSOA.favoritos.compositores.includes(c.nome)
  );
  return (
    <div className="flex flex-col gap-6">
      <Abas rotulo="Favoritos">
        <Aba
          ativa={aba === 'compositores'}
          onClick={() => setAba('compositores')}
        >
          Compositores · {comps.length}
        </Aba>
        <Aba ativa={aba === 'obras'} onClick={() => setAba('obras')}>
          Obras · {PESSOA.favoritos.obras.length}
        </Aba>
        <Aba ativa={aba === 'partituras'} onClick={() => setAba('partituras')}>
          Partituras · {PESSOA.favoritos.partituras.length}
        </Aba>
        <Aba ativa={aba === 'colecoes'} onClick={() => setAba('colecoes')}>
          Coleções · 2
        </Aba>
      </Abas>
      {aba === 'compositores' && (
        <ul className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-5">
          {comps.map((c) => (
            <li key={c.id} className="relative">
              <Coracao
                rotulo={c.nome}
                sobre
                inicial
                className="absolute right-2 top-2 z-elevado"
              />
              <Link
                href={rota(esboco, 'compositor')}
                className="group flex flex-col gap-3"
              >
                <Retrato
                  nome={c.nome}
                  src={c.retrato}
                  sizes="200px"
                  className="aspect-[4/5] w-full rounded-card"
                />
                <span className="font-display text-[1.25rem] group-hover:text-ouro-texto">
                  {c.nome}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      {aba === 'obras' && (
        <ul className="flex flex-col divide-y divide-[var(--linha)]">
          {PESSOA.favoritos.obras.map((o, i) => {
            const comp = ['Chopin', 'Debussy', 'Schumann', 'Ravel'][i];
            return (
              <li key={o} className="flex items-center gap-2">
                <Link
                  href={rota(esboco, 'obra')}
                  className="group flex min-w-0 flex-1 items-center gap-4 py-3"
                >
                  <Retrato
                    nome={comp}
                    src={retratoDe(comp)}
                    sizes="44px"
                    className="h-11 w-11 rounded-full"
                  />
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate font-display text-[1.1875rem] group-hover:text-ouro-texto">
                      {o}
                    </span>
                    <span className="t-rotulo text-texto-suave">{comp}</span>
                  </span>
                </Link>
                <Coracao rotulo={o} inicial />
              </li>
            );
          })}
        </ul>
      )}
      {aba === 'partituras' && (
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(8.75rem,1fr))] gap-4">
          {PESSOA.favoritos.partituras.map((p, i) => (
            <li key={p} className="flex min-w-0 flex-col gap-2">
              <span className="relative block aspect-[1/1.3] overflow-hidden rounded-[8px] bg-sobre-foto shadow-[var(--sombra-1)]">
                <Image
                  src={MINIATURAS[i]}
                  alt=""
                  fill
                  sizes="140px"
                  className="object-contain"
                />
              </span>
              <span className="flex items-start gap-1">
                <span className="line-clamp-2 flex-1 text-[0.8125rem] leading-tight">
                  {p}
                </span>
                <Coracao rotulo={p} inicial className="!h-8 !w-8" />
              </span>
            </li>
          ))}
        </ul>
      )}
      {aba === 'colecoes' && (
        <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {COLECOES_FINAL.filter((c) => c.naHome)
            .slice(0, 2)
            .map((c) => (
              <li
                key={c.id}
                className="flex items-center gap-4 rounded-card bg-sup-2 p-4"
              >
                <Rostos
                  nomes={c.rostos.filter((n) => retratoDe(n))}
                  tamanho="h-9 w-9"
                />
                <Link
                  href={rota(esboco, 'colecao')}
                  className="group flex min-w-0 flex-1 flex-col"
                >
                  <span className="truncate font-display text-[1.1875rem] group-hover:text-ouro-texto">
                    {c.titulo}
                  </span>
                  <span className="t-legenda">{c.autor.nome}</span>
                </Link>
                <Coracao rotulo={c.titulo} inicial />
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Anotações (as suas, com o modelo inteiro)
// ---------------------------------------------------------------------------

export function AnotacoesPessoaisFinal() {
  const minhas = ANOTACOES_NOTURNO.map((a, i) => ({
    ...a,
    minha: true,
    publica: i !== 2,
    autor: { nome: 'Marina D.', papel: 'Estudante' as const },
  }));
  return (
    <div className="flex flex-col gap-6">
      <ProximaConquista id="anotacoes-curtidas" />
      <div className="flex flex-wrap items-center gap-2">
        {[
          'Todas · 4',
          'Públicas · 3',
          'Só minhas · 1',
          'Noturnos, Op. 9',
          'Invenção nº 8',
        ].map((f, i) => (
          <Ficha key={f} ativa={i === 0}>
            {f}
          </Ficha>
        ))}
      </div>
      <ul className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {minhas.map((a) => (
          <CartaoAnotacao key={a.id} a={a} />
        ))}
      </ul>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Perfil (as cinco seções de hoje)
// ---------------------------------------------------------------------------

export function PerfilFinal() {
  const { verificado } = useEsboco();
  const [instrumentos, setInstrumentos] = useState([
    {
      nome: 'Piano',
      nivel: 'Intermediário',
      desde: '2019',
      principal: true,
      aprendendo: false,
    },
    {
      nome: 'Canto',
      nivel: 'Iniciante',
      desde: '2025',
      principal: false,
      aprendendo: true,
    },
  ]);
  const secao = 'flex flex-col gap-5 rounded-card bg-sup-2 p-6';
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[13rem_minmax(0,1fr)]">
      <nav
        aria-label="Seções do perfil"
        className="flex gap-1 overflow-x-auto lg:sticky lg:top-24 lg:flex-col lg:self-start"
      >
        {['Você', 'Instrumentos', 'Preferências', 'Privacidade', 'Conta'].map(
          (s) => (
            <a
              key={s}
              href={`#perfil-${s}`}
              className="inline-flex min-h-10 shrink-0 items-center rounded-controle px-3 text-[0.9375rem] text-texto-suave hover:bg-sup-2 hover:text-texto"
            >
              {s}
            </a>
          )
        )}
      </nav>
      <div className="flex min-w-0 flex-col gap-6">
        <section id="perfil-Você" className={secao}>
          <h2 className="t-subtitulo">Informações básicas</h2>
          <div className="flex items-center gap-5">
            <span className="grid h-20 w-20 place-items-center rounded-full bg-[var(--fundo)] font-display text-[2rem] text-ouro-texto">
              M
            </span>
            <Button tamanho="p" icone={PiUploadSimple}>
              Trocar foto
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Campo rotulo="Nome">
              <input className={campo} defaultValue="Marina" />
            </Campo>
            <Campo rotulo="Sobrenome">
              <input className={campo} defaultValue="Duarte" />
            </Campo>
            <Campo rotulo="Telefone" ajuda="Com o código do país.">
              <input className={campo} defaultValue="+55 21 9…" />
            </Campo>
            <Campo rotulo="Onde você mora">
              <input className={campo} defaultValue="Rio de Janeiro, Brasil" />
            </Campo>
            <Campo
              rotulo="Sobre você"
              ajuda="Aparece no seu perfil público. Até 500 caracteres."
              largo
            >
              <textarea
                rows={3}
                className={cx(campo, 'py-3')}
                defaultValue="Pianista amadora, estudando Chopin."
              />
            </Campo>
          </div>
        </section>
        <section id="perfil-Instrumentos" className={secao}>
          <div className="flex items-center justify-between gap-3">
            <h2 className="t-subtitulo">Meus instrumentos</h2>
            <Button
              tamanho="p"
              icone={PiPlus}
              onClick={() =>
                setInstrumentos((l) => [
                  ...l,
                  {
                    nome: 'Violão',
                    nivel: 'Iniciante',
                    desde: '2026',
                    principal: false,
                    aprendendo: true,
                  },
                ])
              }
            >
              Adicionar
            </Button>
          </div>
          <ul className="flex flex-col divide-y divide-[var(--linha)]">
            {instrumentos.map((i) => (
              <li
                key={i.nome}
                className="flex flex-wrap items-center gap-x-5 gap-y-2 py-3"
              >
                <span className="min-w-28 font-display text-[1.25rem]">
                  {i.nome}
                </span>
                <span className="t-rotulo text-texto-suave">
                  {i.nivel} · desde {i.desde}
                </span>
                {i.principal && (
                  <span className="rounded-full tint-ouro px-2.5 py-0.5 text-[0.75rem] text-ouro-na-tinta">
                    Principal
                  </span>
                )}
                {i.aprendendo && (
                  <span className="rounded-full bg-[var(--fundo)] px-2.5 py-0.5 text-[0.75rem]">
                    Aprendendo
                  </span>
                )}
                <span className="ml-auto flex gap-1">
                  <Button
                    tamanho="p"
                    variante="fantasma"
                    icone={PiPencilSimple}
                    rotulo={`Editar ${i.nome}`}
                  />
                  <Button
                    tamanho="p"
                    variante="fantasma"
                    icone={PiTrash}
                    rotulo={`Tirar ${i.nome}`}
                  />
                </span>
              </li>
            ))}
          </ul>
        </section>
        <section id="perfil-Preferências" className={secao}>
          <h2 className="t-subtitulo">Preferências musicais</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Campo rotulo="Compositor favorito">
              <input className={campo} defaultValue="Frédéric Chopin" />
            </Campo>
            <Campo rotulo="Período favorito">
              <select className={campo} defaultValue="Romântico">
                {PERIODOS.filter((p) => p.id !== 'todos').map((p) => (
                  <option key={p.id}>{p.nome}</option>
                ))}
              </select>
            </Campo>
            <Campo rotulo="Experiência">
              <select className={campo}>
                {['Iniciante', 'Intermediário', 'Avançado'].map((n) => (
                  <option key={n}>{n}</option>
                ))}
              </select>
            </Campo>
            <Campo rotulo="Tempo de prática por dia">
              <select className={campo}>
                {[
                  'Menos de 30 min',
                  '30 min a 1 h',
                  '1 a 2 h',
                  'Mais de 2 h',
                ].map((n) => (
                  <option key={n}>{n}</option>
                ))}
              </select>
            </Campo>
          </div>
        </section>
        <section id="perfil-Privacidade" className={secao}>
          <h2 className="t-subtitulo">Privacidade</h2>
          <ul className="flex flex-col divide-y divide-[var(--linha)]">
            {[
              [
                'Perfil público',
                'Outras pessoas veem seu nome, foto e coleções públicas.',
                true,
              ],
              ['Mostrar meus instrumentos', 'No perfil público.', true],
              ['Mostrar onde moro', 'Só a cidade.', false],
              [
                'Mostrar minha atividade',
                'Anotações públicas e conquistas.',
                true,
              ],
            ].map(([t, d, v]) => (
              <li
                key={t as string}
                className="flex items-center justify-between gap-4 py-3"
              >
                <span className="flex flex-col">
                  <span className="t-rotulo">{t}</span>
                  <span className="t-legenda">{d}</span>
                </span>
                <input
                  type="checkbox"
                  defaultChecked={v as boolean}
                  aria-label={t as string}
                  className="h-5 w-5 accent-[var(--ouro)]"
                />
              </li>
            ))}
          </ul>
          <p className="t-legenda">
            Seu e-mail nunca aparece. O que você estuda e o seu progresso são só
            seus.
          </p>
        </section>
        <section id="perfil-Conta" className={secao}>
          <h2 className="t-subtitulo">Conta</h2>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <dt className="t-legenda">E-mail</dt>
              <dd className="flex items-center gap-2 t-rotulo">
                {PESSOA.email}
                {verificado ? (
                  <span className="inline-flex items-center gap-1 text-ok">
                    <Icon de={PiCheck} tamanho="pp" />
                    confirmado
                  </span>
                ) : (
                  <span className="text-atencao">não confirmado</span>
                )}
              </dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="t-legenda">Como você entra</dt>
              <dd className="inline-flex items-center gap-2 t-rotulo">
                <Icon de={PiGoogleLogo} tamanho="p" />
                Google e senha
              </dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="t-legenda">Plano</dt>
              <dd className="t-rotulo">
                Free ·{' '}
                <Link href="#" className={cx('text-ouro-texto', linkTexto)}>
                  ver planos
                </Link>
              </dd>
            </div>
          </dl>
          <div className="flex flex-wrap gap-2">
            <Button tamanho="p">Trocar e-mail</Button>
            <Button tamanho="p">Trocar senha</Button>
            {!verificado && (
              <Button tamanho="p" variante="primario">
                Reenviar confirmação
              </Button>
            )}
          </div>
          <div className="flex flex-col gap-3 border-t border-[var(--linha)] pt-5">
            <span className="t-rotulo">Seus dados</span>
            <div className="flex flex-wrap gap-2">
              <Button tamanho="p" icone={PiDownloadSimple}>
                Baixar meus dados
              </Button>
              <Button tamanho="p" variante="perigo" icone={PiTrash}>
                Excluir conta
              </Button>
            </div>
            <span className="t-legenda">
              Excluir apaga estante, anotações e envios. Os envios ao acervo
              podem ficar sem o seu nome, se você preferir.
            </span>
          </div>
        </section>
      </div>
    </div>
  );
}
