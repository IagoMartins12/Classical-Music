'use client';

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import {
  PiArrowRight,
  PiBookOpenText,
  PiCheckCircle,
  PiDownloadSimple,
  PiFlag,
  PiHeart,
  PiLockSimple,
  PiPencilSimple,
  PiPlus,
  PiTrash,
  PiUploadSimple,
  PiGlobeSimple,
} from 'react-icons/pi';
import { Abas, Aba } from '@/app/components/ui/Abas';
import { Button } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import { cx } from '@/app/components/ui/cx';
import { CONQUISTAS, PESSOA, formatar, rota, type Conquista } from './dados';
import {
  Ficha,
  Medalha,
  Retrato,
  linkTexto,
  retratoDe,
  useEsboco,
} from './pecas';

/**
 * O conteúdo das páginas pessoais, o mesmo nos três esboços — o que muda é a
 * moldura (o cabeçalho e como se anda entre elas), que cada esboço desenha.
 *
 * Cada página traz a conquista que ela aproxima ("Margem lida: 17 de 25" em
 * anotações): a gamificação mora nas telas pessoais, não numa página à parte.
 */

// ---------------------------------------------------------------------------
// Peças
// ---------------------------------------------------------------------------

function Secao({
  titulo,
  acao,
  children,
}: {
  titulo: string;
  acao?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-end justify-between gap-4">
        <h2 className="t-subtitulo">{titulo}</h2>
        {acao}
      </div>
      {children}
    </section>
  );
}

/** A conquista que esta página aproxima, com a barra do quanto falta. */
export function ProximaConquista({ id }: { id: string }) {
  const c = CONQUISTAS.find((x) => x.id === id) as Conquista;
  const { atual = 0, total = 1 } = c.progresso ?? {};
  return (
    <div className="flex items-center gap-4 rounded-card bg-sup-2 p-4">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[var(--fundo)] text-ouro-texto">
        <Medalha className="h-7 w-7" />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3">
          <span className="font-medium">{c.nome}</span>
          <span className="t-dado text-[0.8125rem] text-texto-suave">
            {atual} de {total} · +{c.xp} XP
          </span>
        </div>
        <span className="h-1.5 overflow-hidden rounded-full bg-[var(--linha)]">
          <span
            className="cresce block h-full rounded-full fill-ouro"
            style={{ width: `${(atual / total) * 100}%` }}
          />
        </span>
        <span className="t-legenda">{c.como}</span>
      </div>
    </div>
  );
}

function LinhaDeObra({
  obra,
  compositor,
  detalhe,
  depois,
}: {
  obra: string;
  compositor: string;
  detalhe?: ReactNode;
  depois?: ReactNode;
}) {
  const { esboco } = useEsboco();
  return (
    <li className="flex items-center gap-4 py-3">
      <Retrato
        nome={compositor}
        src={retratoDe(compositor)}
        sizes="48px"
        className="h-11 w-11 shrink-0 rounded-full"
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <Link
          href={rota(esboco, 'obra')}
          className={cx('truncate font-display text-[1.125rem]', linkTexto)}
        >
          {obra}
        </Link>
        <span className="t-rotulo truncate text-texto-suave">
          {compositor}
          {detalhe ? <> · {detalhe}</> : null}
        </span>
      </div>
      {depois}
    </li>
  );
}

const lista = 'flex flex-col divide-y divide-[var(--linha)]';

// ---------------------------------------------------------------------------
// Estudo (antes "lições")
// ---------------------------------------------------------------------------

export function Estudo() {
  const [aba, setAba] = useState<'estudando' | 'quero' | 'aprendi'>(
    'estudando'
  );
  return (
    <div className="flex flex-col gap-10">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {PESSOA.estudando.map((e) => (
          <article key={e.obra} className="sup-1 flex flex-col gap-4 p-5">
            <div className="flex items-start gap-4">
              <Retrato
                nome={e.compositor}
                src={retratoDe(e.compositor)}
                sizes="64px"
                className="h-14 w-14 shrink-0 rounded-controle"
              />
              <div className="flex min-w-0 flex-col">
                <h3 className="font-display text-[1.375rem] leading-snug">
                  {e.obra}
                </h3>
                <span className="t-rotulo text-texto-suave">
                  {e.compositor} · {e.edicao}
                </span>
                <span className="t-legenda">Estudando {e.desde}</span>
              </div>
            </div>
            <p className="rounded-controle bg-sup-2 px-4 py-3 t-rotulo">
              <span className="text-texto-fraco">Onde parei: </span>
              {e.progresso}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button variante="primario" tamanho="p" icone={PiBookOpenText}>
                Abrir partitura
              </Button>
              <Button tamanho="p" icone={PiPencilSimple}>
                Anotar onde parei
              </Button>
              <Button tamanho="p" variante="fantasma" icone={PiCheckCircle}>
                Já aprendi
              </Button>
            </div>
          </article>
        ))}
      </div>

      <ProximaConquista id="trinta-dias" />

      <Secao titulo="Repertório">
        <Abas rotulo="Repertório">
          <Aba ativa={aba === 'estudando'} onClick={() => setAba('estudando')}>
            Estudando · {PESSOA.estudando.length}
          </Aba>
          <Aba ativa={aba === 'quero'} onClick={() => setAba('quero')}>
            Quero aprender · {PESSOA.queroAprender.length}
          </Aba>
          <Aba ativa={aba === 'aprendi'} onClick={() => setAba('aprendi')}>
            Já aprendi · {PESSOA.aprendi.length}
          </Aba>
        </Abas>
        <ul className={lista}>
          {aba === 'estudando' &&
            PESSOA.estudando.map((e) => (
              <LinhaDeObra
                key={e.obra}
                obra={e.obra}
                compositor={e.compositor}
                detalhe={e.edicao}
              />
            ))}
          {aba === 'quero' &&
            PESSOA.queroAprender.map((e) => (
              <LinhaDeObra
                key={e.obra}
                obra={e.obra}
                compositor={e.compositor}
                detalhe="sem partitura escolhida"
                depois={<Button tamanho="p">Escolher partitura</Button>}
              />
            ))}
          {aba === 'aprendi' &&
            PESSOA.aprendi.map((e) => (
              <LinhaDeObra
                key={e.obra}
                obra={e.obra}
                compositor={e.compositor}
                detalhe={e.dominio}
              />
            ))}
        </ul>
      </Secao>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Favoritos
// ---------------------------------------------------------------------------

export function Favoritos() {
  const { esboco } = useEsboco();
  const [aba, setAba] = useState<'compositores' | 'obras' | 'partituras'>(
    'compositores'
  );
  return (
    <div className="flex flex-col gap-6">
      <Abas rotulo="Favoritos">
        <Aba
          ativa={aba === 'compositores'}
          onClick={() => setAba('compositores')}
        >
          Compositores · {PESSOA.favoritos.compositores.length}
        </Aba>
        <Aba ativa={aba === 'obras'} onClick={() => setAba('obras')}>
          Obras · {PESSOA.favoritos.obras.length}
        </Aba>
        <Aba ativa={aba === 'partituras'} onClick={() => setAba('partituras')}>
          Partituras · {PESSOA.favoritos.partituras.length}
        </Aba>
      </Abas>
      {aba === 'compositores' && (
        <ul className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-5">
          {PESSOA.favoritos.compositores.map((n) => (
            <li key={n}>
              <Link
                href={rota(esboco, 'compositor')}
                className="group flex flex-col gap-3"
              >
                <Retrato
                  nome={n}
                  src={retratoDe(n)}
                  sizes="(max-width: 640px) 50vw, 200px"
                  className="aspect-[4/5] w-full rounded-card"
                />
                <span className="font-display text-[1.25rem] transition-colors group-hover:text-ouro-texto">
                  {n}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      {aba === 'obras' && (
        <ul className={lista}>
          {PESSOA.favoritos.obras.map((o, i) => (
            <LinhaDeObra
              key={o}
              obra={o}
              compositor={['Chopin', 'Debussy', 'Schumann', 'Ravel'][i]}
              depois={
                <Icon
                  de={PiHeart}
                  tamanho="m"
                  rotulo="Favorita"
                  className="text-ouro-texto"
                />
              }
            />
          ))}
        </ul>
      )}
      {aba === 'partituras' && (
        <ul className={lista}>
          {PESSOA.favoritos.partituras.map((p, i) => (
            <LinhaDeObra
              key={p}
              obra={p}
              compositor={['Chopin', 'Bach'][i]}
              depois={
                <Button
                  tamanho="p"
                  variante="fantasma"
                  icone={PiDownloadSimple}
                  rotulo="Baixar"
                />
              }
            />
          ))}
        </ul>
      )}
      <ProximaConquista id="epocas" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Anotações
// ---------------------------------------------------------------------------

export function Anotacoes() {
  return (
    <div className="flex flex-col gap-6">
      <ProximaConquista id="anotacoes-curtidas" />
      <ul className="flex flex-col gap-4">
        {PESSOA.anotacoes.map((a) => (
          <li key={a.texto} className="sup-1 flex flex-col gap-3 p-5">
            <div className="flex items-center justify-between gap-3">
              <span className="t-rotulo text-texto-suave">
                <span className="font-display text-[1.125rem] text-texto">
                  {a.obra}
                </span>{' '}
                · {a.compositor}
              </span>
              <span className="flex items-center gap-1.5 t-legenda">
                <Icon
                  de={a.publica ? PiGlobeSimple : PiLockSimple}
                  tamanho="pp"
                />
                {a.publica ? 'Pública' : 'Só você vê'}
              </span>
            </div>
            <p className="font-display text-[1.1875rem] italic leading-relaxed">
              “{a.texto}”
            </p>
            <div className="flex items-center justify-between gap-3">
              <span className="t-legenda">
                {a.quando}
                {a.publica ? ` · ${a.curtidas} curtidas` : ''}
              </span>
              <span className="flex gap-1">
                <Button
                  tamanho="p"
                  variante="fantasma"
                  icone={PiPencilSimple}
                  rotulo="Editar anotação"
                />
                <Button
                  tamanho="p"
                  variante="fantasma"
                  icone={PiTrash}
                  rotulo="Apagar anotação"
                />
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Envios
// ---------------------------------------------------------------------------

export function Envios() {
  const { usados, total } = PESSOA.limiteEnvios;
  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
        <div className="flex flex-col gap-2">
          <span className="t-rotulo">
            <span className="t-dado text-texto">{usados}</span> de {total}{' '}
            envios do plano Free.{' '}
            <Link href="#" className={cx('text-ouro-texto', linkTexto)}>
              No Plus, sem limite.
            </Link>
          </span>
          <span className="h-1.5 max-w-md overflow-hidden rounded-full bg-[var(--linha)]">
            <span
              className="cresce block h-full rounded-full fill-ouro"
              style={{ width: `${(usados / total) * 100}%` }}
            />
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variante="primario" icone={PiUploadSimple}>
            Enviar partitura
          </Button>
          <Button icone={PiPlus}>Obra</Button>
          <Button icone={PiPlus}>Compositor</Button>
        </div>
      </div>
      <ul className={lista}>
        {PESSOA.envios.map((e) => (
          <li
            key={e.titulo}
            className="flex flex-wrap items-center gap-x-4 gap-y-1 py-4"
          >
            <span className="t-legenda w-24">{e.tipo}</span>
            <span className="min-w-0 flex-1 font-display text-[1.125rem]">
              {e.titulo}
            </span>
            <span
              className={cx(
                'flex items-center gap-1.5 t-rotulo',
                e.estado === 'Denunciado' ? 'text-erro' : 'text-texto-suave'
              )}
            >
              {e.estado === 'Denunciado' && <Icon de={PiFlag} tamanho="pp" />}
              {e.estado}
            </span>
            <span className="t-legenda w-14 text-right">{e.quando}</span>
          </li>
        ))}
      </ul>
      <ProximaConquista id="dez-envios" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Conquistas
// ---------------------------------------------------------------------------

export function Conquistas() {
  const { xp } = useEsboco();
  const feitas = CONQUISTAS.filter((c) => c.feita);
  const andando = CONQUISTAS.filter((c) => !c.feita);
  const pct = Math.min(100, ((xp - 1000) / (PESSOA.proximoNivel - 1000)) * 100);
  return (
    <div className="flex flex-col gap-10">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-[auto_minmax(0,1fr)] md:items-center">
        <span className="flex items-baseline gap-3">
          <span className="font-display text-[4rem] leading-none text-ouro-texto">
            {PESSOA.nivel}
          </span>
          <span className="t-rotulo text-texto-suave">nível</span>
        </span>
        <div className="flex flex-col gap-2">
          <span className="t-rotulo">
            <span className="t-dado text-texto">{formatar(xp)}</span> XP ·{' '}
            faltam{' '}
            <span className="t-dado">{formatar(PESSOA.proximoNivel - xp)}</span>{' '}
            para o nível {PESSOA.nivel + 1}
          </span>
          <span className="h-2 overflow-hidden rounded-full bg-[var(--linha)]">
            <span
              className="barra-xp block h-full rounded-full fill-ouro"
              style={{ ['--xp' as string]: pct / 100 }}
            />
          </span>
          <span className="t-legenda">
            {PESSOA.sequencia} dias seguidos estudando. As conquistas chegam na
            hora, em qualquer página.
          </span>
        </div>
      </div>

      <Secao titulo={`Conquistadas · ${feitas.length}`}>
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {feitas.map((c) => (
            <li
              key={c.id}
              className="flex flex-col items-center gap-3 rounded-card bg-sup-2 p-5 text-center"
            >
              <span className="grid h-16 w-16 place-items-center rounded-full tint-ouro text-ouro-na-tinta">
                <Medalha className="h-10 w-10" />
              </span>
              <span className="font-medium leading-snug">{c.nome}</span>
              <span className="t-legenda">
                {c.feita} · +{c.xp} XP
              </span>
            </li>
          ))}
        </ul>
      </Secao>

      <Secao titulo="A caminho">
        <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {andando.map((c) => (
            <li key={c.id}>
              <ProximaConquista id={c.id} />
            </li>
          ))}
        </ul>
      </Secao>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Perfil
// ---------------------------------------------------------------------------

function Campo({
  rotulo,
  valor,
  tipo = 'text',
}: {
  rotulo: string;
  valor: string;
  tipo?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="t-rotulo">{rotulo}</span>
      <input
        type={tipo}
        defaultValue={valor}
        className="input-classical min-h-[var(--alvo)] rounded-controle px-4 text-base"
      />
    </label>
  );
}

export function Perfil() {
  const [instrumento, setInstrumento] = useState('Piano');
  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_18rem]">
      <div className="flex flex-col gap-10">
        <Secao titulo="Você">
          <div className="flex items-center gap-5">
            <span className="grid h-20 w-20 place-items-center rounded-full bg-sup-2 font-display text-[2rem] text-ouro-texto">
              M
            </span>
            <Button tamanho="p">Trocar foto</Button>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Campo rotulo="Nome" valor={PESSOA.nomeCompleto} />
            <Campo rotulo="E-mail" valor={PESSOA.email} tipo="email" />
          </div>
        </Secao>
        <Secao titulo="Música">
          <span className="t-rotulo text-texto-suave">
            Instrumento principal — filtra partituras, coleções e sugestões.
          </span>
          <div className="flex flex-wrap gap-2">
            {[
              'Piano',
              'Violino',
              'Violoncelo',
              'Violão',
              'Flauta',
              'Canto',
            ].map((i) => (
              <Ficha
                key={i}
                ativa={instrumento === i}
                onClick={() => setInstrumento(i)}
              >
                {i}
              </Ficha>
            ))}
          </div>
        </Secao>
        <Secao titulo="Privacidade">
          <ul className={lista}>
            {[
              ['Mostrar o que estou estudando no meu perfil público', true],
              ['Anotações novas nascem públicas', true],
              ['Receber a newsletter mensal', false],
            ].map(([t, v]) => (
              <li
                key={t as string}
                className="flex items-center justify-between gap-4 py-3"
              >
                <span className="t-rotulo">{t}</span>
                <input
                  type="checkbox"
                  defaultChecked={v as boolean}
                  aria-label={t as string}
                  className="h-5 w-5 accent-[var(--ouro)]"
                />
              </li>
            ))}
          </ul>
        </Secao>
        <Secao titulo="Conta">
          <div className="flex flex-wrap gap-2">
            <Button icone={PiDownloadSimple}>Baixar meus dados</Button>
            <Button variante="perigo" icone={PiTrash}>
              Excluir conta
            </Button>
          </div>
        </Secao>
      </div>
      <aside className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-card bg-sup-2 p-5">
          <span className="t-legenda">Plano</span>
          <p className="font-display text-[1.5rem]">Free</p>
          <p className="t-rotulo text-texto-suave">
            20 envios, 4 vídeos. Enciclopédia e estudo sem limite.
          </p>
          <Link
            href="#"
            className={cx(
              'mt-3 inline-flex items-center gap-1.5 t-rotulo text-ouro-texto',
              linkTexto
            )}
          >
            Ver planos <Icon de={PiArrowRight} tamanho="pp" />
          </Link>
        </div>
      </aside>
    </div>
  );
}
