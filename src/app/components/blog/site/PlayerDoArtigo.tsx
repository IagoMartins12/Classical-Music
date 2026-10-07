'use client';

import { useEffect, useState, type CSSProperties } from 'react';
import {
  PiArrowClockwise,
  PiArrowCounterClockwise,
  PiPause,
  PiPlay,
  PiSpeakerHigh,
  PiSpeakerSlash,
  PiVinylRecord,
  PiWaveform,
  PiCaretDown,
  PiCaretUp,
} from 'react-icons/pi';
import ConfirmModal from '@/app/components/ConfirmModal';
import { Button } from '@/app/components/ui/Button';
import { cx } from '@/app/components/ui/cx';
import { useIsBlogAdmin } from '@/app/components/blog/AdminOnly';
import { BLOG, type Idioma } from '@/app/conteudo/blog';
import { generateArticleAudio } from '@/app/requests/blog/interactions';
import type { MusicaDeFundo } from '@/app/requests/blog/leitura';
import { relogioDe, useFonteDeAudio } from './useFonteDeAudio';

/**
 * O som do artigo: o player de "ouvir o artigo" e o botão da música.
 *
 * **Só a narração tem player.** O chevron para baixo minimiza (a narração
 * continua, numa pílula no canto com tocar/pausar e o chevron para cima);
 * não há fechar. Ele aparece preso ao pé da tela no primeiro
 * toque — dá para ler e controlar ao mesmo tempo: tocar, voltar e avançar
 * 15 s, posição, velocidade, volume e mudo. As teclas de mídia do sistema e a
 * tela de bloqueio do celular o controlam (Media Session). Volume e
 * velocidade ficam lembrados.
 *
 * **A música é um botão, não um player** (decisão de 01/10): toca e pausa,
 * no volume e com a repetição que o autor escolheu. Com a narração falando,
 * ela abaixa para um quarto do volume.
 *
 * **Nada toca sozinho.** O autoplay do legado reprova na WCAG 1.4.2, o
 * navegador bloqueia e quem lê no metrô leva um susto.
 */

const PULO = 15;
const VELOCIDADES = [1, 1.25, 1.5, 1.75, 2, 0.75];
const MEMORIA = 'blog:player';
const ABAIXA = 0.25;

interface Preferencias {
  volume: number;
  velocidade: number;
}

function lerPreferencias(): Partial<Preferencias> {
  try {
    return JSON.parse(localStorage.getItem(MEMORIA) ?? '{}');
  } catch {
    return {};
  }
}

export function PlayerDoArtigo({
  idioma,
  artigo,
  narracao: narracaoInicial,
  musica,
  minutos,
}: {
  idioma: Idioma;
  artigo: { id: string; titulo: string; autor: string; capa: string | null };
  narracao: string | null;
  musica: MusicaDeFundo | null;
  minutos: number;
}) {
  const t = BLOG[idioma].audio;
  const admin = useIsBlogAdmin();

  const [narracaoUrl, setNarracaoUrl] = useState(narracaoInicial);
  const [aberto, setAberto] = useState(false);
  // Minimizado, o player vira uma pílula no canto e a narração segue.
  const [minimizado, setMinimizado] = useState(false);
  // O painel desce antes de virar pílula (`player-desce`, 200ms).
  const [descendo, setDescendo] = useState(false);
  const minimizar = () => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setMinimizado(true);
      return;
    }
    setDescendo(true);
    window.setTimeout(() => {
      setDescendo(false);
      setMinimizado(true);
    }, 200);
  };
  const [volume, setVolume] = useState(1);
  const [mudo, setMudo] = useState(false);
  const [velocidade, setVelocidade] = useState(1);
  const [gerando, setGerando] = useState(false);
  const [confirmandoGerar, setConfirmandoGerar] = useState(false);
  const [aviso, setAviso] = useState('');

  // Preferências da pessoa, depois de montar (o HTML do servidor não as tem).
  useEffect(() => {
    const p = lerPreferencias();
    if (typeof p.volume === 'number') setVolume(p.volume);
    if (typeof p.velocidade === 'number') setVelocidade(p.velocidade);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(MEMORIA, JSON.stringify({ volume, velocidade }));
    } catch {
      // Sem armazenamento (aba privada): vale só nesta visita.
    }
  }, [volume, velocidade]);

  const narracao = useFonteDeAudio(narracaoUrl, 'arquivo', {
    volume,
    mudo,
    velocidade,
  });

  const fundo = useFonteDeAudio(
    musica?.url ?? null,
    musica?.tipo ?? 'arquivo',
    {
      volume: (musica?.volume ?? 0.3) * (narracao.tocando ? ABAIXA : 1),
      repetir: musica?.repetir ?? true,
    }
  );

  // Teclas de mídia e tela de bloqueio: controlam a narração.
  useEffect(() => {
    if (!('mediaSession' in navigator) || !narracao.tocando) return;
    const sessao = navigator.mediaSession;
    sessao.metadata = new MediaMetadata({
      title: artigo.titulo,
      artist: artigo.autor,
      album: BLOG[idioma].nome,
      artwork: artigo.capa ? [{ src: artigo.capa, sizes: '512x512' }] : [],
    });
    sessao.setActionHandler('play', narracao.tocar);
    sessao.setActionHandler('pause', narracao.pausar);
    sessao.setActionHandler('seekbackward', () => narracao.pular(-PULO));
    sessao.setActionHandler('seekforward', () => narracao.pular(PULO));
    sessao.setActionHandler('seekto', (d) => {
      if (typeof d.seekTime === 'number') narracao.irPara(d.seekTime);
    });
    return () => {
      for (const acao of [
        'play',
        'pause',
        'seekbackward',
        'seekforward',
        'seekto',
      ] as const) {
        sessao.setActionHandler(acao, null);
      }
    };
  }, [narracao.tocando, narracao, artigo, idioma]);

  const ouvir = () => {
    setAberto(true);
    setMinimizado(false);
    narracao.alternar();
  };

  async function gerar() {
    setConfirmandoGerar(false);
    setGerando(true);
    setAviso('');
    try {
      const url = await generateArticleAudio(artigo.id, {
        regenerate: !!narracaoUrl,
      });
      // O endereço novo derruba o áudio antigo (ver `useFonteDeAudio`).
      setNarracaoUrl(`${url}${url.includes('?') ? '&' : '?'}v=${Date.now()}`);
      setAviso(t.gerada);
    } catch (e) {
      setAviso(e instanceof Error ? e.message : t.falhou);
    } finally {
      setGerando(false);
    }
  }

  const temNarracao = !!narracaoUrl;
  if (!temNarracao && !musica && !admin) return null;

  return (
    <>
      <div
        role="group"
        aria-label={t.grupo}
        className="flex flex-wrap items-center gap-2"
      >
        {temNarracao && (
          <Button
            tamanho="p"
            icone={narracao.tocando ? PiPause : PiPlay}
            aria-pressed={narracao.tocando}
            onClick={ouvir}
          >
            {narracao.tocando ? t.pausar : t.ouvir(minutos)}
          </Button>
        )}
        {musica && (
          <Button
            tamanho="p"
            variante="fantasma"
            icone={fundo.tocando ? PiPause : PiVinylRecord}
            aria-pressed={fundo.tocando}
            title={musica.titulo ?? undefined}
            carregando={fundo.carregando && !fundo.tocando}
            onClick={fundo.alternar}
          >
            {fundo.tocando ? t.pausarMusica : t.musica}
          </Button>
        )}
        {admin && (
          <Button
            tamanho="p"
            variante="texto"
            icone={PiWaveform}
            carregando={gerando}
            onClick={() => (narracaoUrl ? setConfirmandoGerar(true) : gerar())}
            className="ml-1"
          >
            {gerando ? t.gerando : narracaoUrl ? t.gerarDeNovo : t.gerar}
          </Button>
        )}
        <span role="status" className="t-legenda w-full empty:hidden">
          {aviso || (fundo.erro ? t.falhou : '')}
        </span>
      </div>

      {aberto && temNarracao && minimizado && (
        <section
          aria-label={t.player}
          className="player-pilula sup-alta fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-barra flex items-center gap-1 !rounded-full p-1.5 pl-2 shadow-[var(--sombra-2)] lg:right-6"
        >
          <Button
            variante="primario"
            tamanho="p"
            icone={narracao.tocando ? PiPause : PiPlay}
            rotulo={narracao.tocando ? t.pausar : t.tocar}
            onClick={narracao.alternar}
            className="!rounded-full"
          />
          <span className="t-dado px-2 text-[0.8125rem] text-texto-suave">
            {relogioDe(narracao.tempo)}
          </span>
          <Button
            variante="fantasma"
            tamanho="p"
            icone={PiCaretUp}
            rotulo={t.expandir}
            onClick={() => setMinimizado(false)}
            className="!rounded-full"
          />
        </section>
      )}

      {aberto && temNarracao && !minimizado && (
        <section
          aria-label={t.player}
          className={`${descendo ? 'player-desce' : 'player-sobe'} sup-alta fixed inset-x-0 bottom-0 z-barra !rounded-b-none px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 lg:bottom-4 lg:left-1/2 lg:right-auto lg:w-[min(46rem,calc(100%-2rem))] lg:-translate-x-1/2 lg:!rounded-folha lg:px-5 lg:pb-4`}
        >
          <p className="mb-2 truncate pr-10 text-[0.8125rem] text-texto-fraco">
            <span className="sr-only">{t.narracao}: </span>
            {artigo.titulo}
          </p>
          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              variante="primario"
              icone={narracao.tocando ? PiPause : PiPlay}
              rotulo={narracao.tocando ? t.pausar : t.tocar}
              carregando={narracao.carregando && !narracao.tocando}
              onClick={narracao.alternar}
              className="!rounded-full"
            />
            <Button
              variante="fantasma"
              tamanho="p"
              icone={PiArrowCounterClockwise}
              rotulo={t.voltar(PULO)}
              onClick={() => narracao.pular(-PULO)}
            />
            <Button
              variante="fantasma"
              tamanho="p"
              icone={PiArrowClockwise}
              rotulo={t.avancar(PULO)}
              onClick={() => narracao.pular(PULO)}
            />
            <Faixa
              rotulo={t.posicao}
              valor={narracao.tempo}
              maximo={narracao.duracao || 1}
              texto={`${relogioDe(narracao.tempo)} / ${relogioDe(narracao.duracao)}`}
              aoMudar={narracao.irPara}
              className="min-w-0 flex-1"
            />
            <span className="t-dado shrink-0 text-[0.8125rem] text-texto-suave max-sm:hidden">
              {relogioDe(narracao.tempo)}
              <span className="text-texto-fraco">
                {' '}
                / {relogioDe(narracao.duracao)}
              </span>
            </span>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <Button
              variante="fantasma"
              tamanho="p"
              icone={mudo ? PiSpeakerSlash : PiSpeakerHigh}
              rotulo={mudo ? t.comSom : t.mudo}
              aria-pressed={mudo}
              onClick={() => setMudo((m) => !m)}
            />
            <Faixa
              rotulo={t.volume}
              valor={mudo ? 0 : volume}
              maximo={1}
              passo={0.05}
              texto={`${Math.round(volume * 100)}%`}
              aoMudar={(v) => {
                setVolume(v);
                if (v > 0) setMudo(false);
              }}
              className="w-24 sm:w-36"
            />
            <Button
              variante="fantasma"
              tamanho="p"
              onClick={() =>
                setVelocidade(
                  VELOCIDADES[
                    (VELOCIDADES.indexOf(velocidade) + 1) % VELOCIDADES.length
                  ]
                )
              }
              aria-label={t.velocidade(velocidade)}
              className="t-dado min-w-12 shrink-0 !px-2"
            >
              {velocidade}×
            </Button>
            <p role="status" className="t-legenda min-w-0 flex-1 truncate">
              {narracao.erro
                ? t.falhou
                : narracao.carregando
                  ? t.carregando
                  : ''}
            </p>
          </div>
          <Button
            variante="fantasma"
            tamanho="p"
            icone={PiCaretDown}
            rotulo={t.minimizar}
            onClick={minimizar}
            className="!absolute right-2 top-2"
          />
        </section>
      )}

      <ConfirmModal
        isOpen={confirmandoGerar}
        onClose={() => setConfirmandoGerar(false)}
        onConfirm={gerar}
        title={t.gerarDeNovo}
        message={t.custo}
        confirmText={t.gerarDeNovo}
        type="warning"
      />
    </>
  );
}

/** A faixa de posição e de volume: um `range` com o ouro até onde está. */
function Faixa({
  rotulo,
  valor,
  maximo,
  passo = 1,
  texto,
  aoMudar,
  className,
}: {
  rotulo: string;
  valor: number;
  maximo: number;
  passo?: number;
  texto: string;
  aoMudar: (valor: number) => void;
  className?: string;
}) {
  const cheio = maximo ? Math.min(100, (valor / maximo) * 100) : 0;
  return (
    <input
      type="range"
      aria-label={rotulo}
      aria-valuetext={texto}
      min={0}
      max={maximo}
      step={passo}
      value={Math.min(valor, maximo)}
      onChange={(e) => aoMudar(Number(e.target.value))}
      className={cx('blog-faixa', className)}
      style={{ '--cheio': `${cheio}%` } as CSSProperties}
    />
  );
}
