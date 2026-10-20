'use client';

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import {
  PiCheck,
  PiCompass,
  PiEnvelopeSimpleOpen,
  PiLockKey,
  PiMagnifyingGlass,
  PiChalkboardTeacher,
  PiKey,
} from 'react-icons/pi';
import toast from 'react-hot-toast';
import { Button, classesDeBotao } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import { NotasAoFundo } from '@/app/components/ui/NotasAoFundo';
import { cx } from '@/app/components/ui/cx';
import { FAMOSOS, rota, type EsbocoId } from './dados';
import { Retrato, linkTexto, useEsboco } from './pecas';

/**
 * As páginas de espera e orientação: links de e-mail (confirmar conta,
 * nova senha, convite), 404 e acesso negado. Uma frase que diz o que
 * aconteceu, uma que diz o que fazer, e a ação. As notas ao fundo são
 * permitidas aqui (decisão de 27/09: só espera e orientação).
 *
 * A — centrada, em Garamond grande, como uma página de livro.
 * B — em duas colunas: o símbolo à esquerda, numa faixa larga.
 * C — um cartão compacto, como uma tela de aplicativo.
 */

function Moldura({
  variante,
  icone,
  titulo,
  texto,
  children,
  estado = 'neutro',
}: {
  variante: EsbocoId;
  icone: typeof PiCheck;
  titulo: string;
  texto: ReactNode;
  children?: ReactNode;
  estado?: 'ok' | 'neutro';
}) {
  const simbolo = (
    <span
      className={cx(
        'grid shrink-0 place-items-center rounded-full',
        variante === 'b' ? 'h-24 w-24' : 'h-16 w-16',
        estado === 'ok'
          ? 'tint-ouro text-ouro-na-tinta'
          : 'bg-sup-2 text-ouro-texto'
      )}
    >
      {estado === 'ok' ? (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={cx(
            'medalha-desenha',
            variante === 'b' ? 'h-12 w-12' : 'h-8 w-8'
          )}
        >
          <path
            className="medalha-visto"
            pathLength={1}
            d="M5 12.5l4.5 4.5L19 7.5"
          />
        </svg>
      ) : (
        <Icon
          de={icone}
          tamanho="g"
          className={variante === 'b' ? '!h-10 !w-10' : undefined}
        />
      )}
    </span>
  );

  if (variante === 'b') {
    return (
      <section className="relative isolate overflow-hidden">
        <NotasAoFundo className="-z-10" />
        <div className="section-wrap grid grid-cols-1 min-h-[70dvh] items-center gap-10 py-16 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <div
            className="entra flex md:justify-end"
            style={{ ['--i' as string]: 0 }}
          >
            {simbolo}
          </div>
          <div className="flex max-w-xl flex-col gap-5">
            <h1 className="t-titulo entra" style={{ ['--i' as string]: 1 }}>
              {titulo}
            </h1>
            <div
              className="t-corpo entra text-texto-suave"
              style={{ ['--i' as string]: 2 }}
            >
              {texto}
            </div>
            <div
              className="entra flex flex-wrap gap-3 pt-2"
              style={{ ['--i' as string]: 3 }}
            >
              {children}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (variante === 'c') {
    return (
      <section className="grid min-h-[70dvh] place-items-center px-4 py-16">
        <div className="sup-1 entra flex w-full max-w-md flex-col items-center gap-5 p-8 text-center">
          {simbolo}
          <h1 className="t-subtitulo">{titulo}</h1>
          <div className="t-rotulo text-texto-suave">{texto}</div>
          <div className="flex w-full flex-col gap-2 pt-2">{children}</div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative isolate overflow-hidden">
      <NotasAoFundo className="-z-10" />
      <div className="mx-auto flex min-h-[72dvh] max-w-2xl flex-col items-center justify-center gap-6 px-4 py-20 text-center">
        <span className="entra" style={{ ['--i' as string]: 0 }}>
          {simbolo}
        </span>
        <h1
          className="t-display entra text-balance max-sm:!text-[2.5rem]"
          style={{ ['--i' as string]: 1 }}
        >
          {titulo}
        </h1>
        <div
          className="t-corpo entra max-w-[48ch] text-texto-suave"
          style={{ ['--i' as string]: 2 }}
        >
          {texto}
        </div>
        <div
          className="entra flex flex-wrap justify-center gap-3 pt-2"
          style={{ ['--i' as string]: 3 }}
        >
          {children}
        </div>
      </div>
    </section>
  );
}

export function ConfirmarConta({ variante }: { variante: EsbocoId }) {
  const { abrirBoasVindas, setLogado } = useEsboco();
  return (
    <Moldura
      variante={variante}
      estado="ok"
      icone={PiEnvelopeSimpleOpen}
      titulo="E-mail confirmado"
      texto={
        <>
          Pronto, Marina: sua conta está confirmada. Se ainda não respondeu as
          três perguntas das boas-vindas, dá tempo agora.
        </>
      }
    >
      <Button
        variante="primario"
        onClick={() => {
          setLogado(true);
          abrirBoasVindas();
        }}
      >
        Responder as boas-vindas
      </Button>
      <Link
        href={rota(variante, 'estudo')}
        className={classesDeBotao('secundario', 'm')}
      >
        Ir para minha estante
      </Link>
    </Moldura>
  );
}

export function NovaSenha({ variante }: { variante: EsbocoId }) {
  const [senha, setSenha] = useState('');
  const [pronto, setPronto] = useState(false);
  const curta = senha.length > 0 && senha.length < 8;

  if (pronto) {
    return (
      <Moldura
        variante={variante}
        estado="ok"
        icone={PiKey}
        titulo="Senha trocada"
        texto="Use a senha nova da próxima vez que entrar. Você já está dentro."
      >
        <Link
          href={rota(variante, 'estudo')}
          className={classesDeBotao('primario', 'm')}
        >
          Ir para minha estante
        </Link>
      </Moldura>
    );
  }

  return (
    <Moldura
      variante={variante}
      icone={PiKey}
      titulo="Escolha uma senha nova"
      texto={
        <form
          className="mx-auto flex w-full max-w-sm flex-col gap-4 text-left"
          onSubmit={(e) => {
            e.preventDefault();
            if (senha.length < 8) return;
            setPronto(true);
          }}
        >
          <span className="t-rotulo text-texto-suave">
            Para marina@exemplo.com. O link vale por uma hora.
          </span>
          <label className="flex flex-col gap-1.5">
            <span className="t-rotulo text-texto">Senha nova</span>
            <input
              type="password"
              autoComplete="new-password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              aria-describedby="regra-senha"
              className="input-classical min-h-[var(--alvo)] rounded-controle px-4 text-base"
            />
            <span
              id="regra-senha"
              className={cx('t-legenda', curta && '!text-erro')}
            >
              Pelo menos 8 caracteres
              {curta ? ` — faltam ${8 - senha.length}` : ''}.
            </span>
          </label>
          <Button variante="primario" type="submit">
            Salvar senha nova
          </Button>
        </form>
      }
    />
  );
}

export function ConviteDeProfessor({ variante }: { variante: EsbocoId }) {
  const [resposta, setResposta] = useState<'aceito' | 'recusado' | null>(null);

  if (resposta === 'aceito') {
    return (
      <Moldura
        variante={variante}
        estado="ok"
        icone={PiChalkboardTeacher}
        titulo="Você agora é aluna da Helena"
        texto="As aulas, tarefas e o calendário dela aparecem no seu portal. Ela recebeu um aviso."
      >
        <Button variante="primario">Abrir o portal</Button>
      </Moldura>
    );
  }
  if (resposta === 'recusado') {
    return (
      <Moldura
        variante={variante}
        icone={PiChalkboardTeacher}
        titulo="Convite recusado"
        texto="Avisamos a Helena. Se mudar de ideia, peça a ela um convite novo."
      >
        <Link
          href={rota(variante)}
          className={classesDeBotao('secundario', 'm')}
        >
          Voltar ao início
        </Link>
      </Moldura>
    );
  }

  return (
    <Moldura
      variante={variante}
      icone={PiChalkboardTeacher}
      titulo="Helena Prado convidou você para estudar com ela"
      texto={
        <span className="flex flex-col items-center gap-4">
          <span>
            Professora de piano no Opus Atlas. Aceitando, vocês dividem aulas,
            tarefas e o que você está estudando. Você continua dona da sua
            estante.
          </span>
          <span className="t-legenda">O convite vale até 31 de outubro.</span>
        </span>
      }
    >
      <Button variante="primario" onClick={() => setResposta('aceito')}>
        Aceitar convite
      </Button>
      <Button onClick={() => setResposta('recusado')}>Recusar</Button>
    </Moldura>
  );
}

export function NaoEncontrada({ variante }: { variante: EsbocoId }) {
  const sugestoes = FAMOSOS.filter((c) =>
    ['Chopin', 'Bach', 'Debussy', 'Mozart'].includes(c.nome)
  );
  return (
    <Moldura
      variante={variante}
      icone={PiCompass}
      titulo="Esta página não está no atlas"
      texto={
        <span className="flex flex-col items-center gap-6">
          <span>
            O endereço pode ter mudado, ou a obra saiu do acervo. Procure pelo
            nome:
          </span>
          <form
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              toast('Na refação, leva a /search');
            }}
            className="c-busca flex w-full max-w-md items-center gap-2 rounded-full bg-[var(--campo)] p-1.5 pl-4"
          >
            <Icon
              de={PiMagnifyingGlass}
              tamanho="m"
              className="text-texto-fraco"
            />
            <label htmlFor="busca-404" className="sr-only">
              Buscar
            </label>
            <input
              id="busca-404"
              type="search"
              enterKeyHint="search"
              placeholder="Compositor, obra, partitura…"
              className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-texto-fraco"
            />
            <Button variante="primario" tamanho="p" type="submit">
              Buscar
            </Button>
          </form>
          <span className="flex flex-wrap items-center justify-center gap-4">
            {sugestoes.map((c) => (
              <Link
                key={c.id}
                href={rota(variante, 'compositor')}
                className={cx(
                  'flex items-center gap-2 text-texto-suave',
                  linkTexto
                )}
              >
                <Retrato
                  nome={c.nome}
                  src={c.retrato}
                  sizes="40px"
                  className="h-8 w-8 rounded-full"
                />
                {c.nome}
              </Link>
            ))}
          </span>
        </span>
      }
    >
      <Link href={rota(variante)} className={classesDeBotao('secundario', 'm')}>
        Voltar ao início
      </Link>
    </Moldura>
  );
}

export function AcessoNegado({ variante }: { variante: EsbocoId }) {
  const { logado, abrirEntrar } = useEsboco();
  return (
    <Moldura
      variante={variante}
      icone={PiLockKey}
      titulo={
        logado ? 'Esta área não é da sua conta' : 'Entre para ver esta página'
      }
      texto={
        logado
          ? 'Você está como Marina, que não tem acesso aqui. Se acha que deveria ter, fale com quem administra o espaço.'
          : 'É uma página pessoal. Entrando, você volta exatamente para cá.'
      }
    >
      {logado ? (
        <Link href={rota(variante)} className={classesDeBotao('primario', 'm')}>
          Voltar ao início
        </Link>
      ) : (
        <>
          <Button variante="primario" onClick={abrirEntrar}>
            Entrar
          </Button>
          <Link
            href={rota(variante)}
            className={classesDeBotao('secundario', 'm')}
          >
            Voltar ao início
          </Link>
        </>
      )}
    </Moldura>
  );
}
