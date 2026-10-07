'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Uma fonte de áudio com os mesmos controles, seja arquivo, seja YouTube.
 *
 * O player do artigo toca duas coisas: a narração (um MP3 gerado pela API) e
 * a música de fundo, que o autor escolhe — e que muitas vezes é um vídeo do
 * YouTube. As duas precisam de tocar, pausar, pular, volume e posição. Aqui
 * as duas viram a mesma interface; quem desenha o player não sabe de onde
 * vem o som.
 *
 * **Nada carrega antes do primeiro "tocar".** O arquivo e o script do
 * YouTube só são pedidos quando a pessoa aperta o botão: a página do artigo
 * não paga por um áudio que a maioria não ouve. (E nada toca sozinho: a
 * música de fundo começava ao abrir a página, o que a WCAG 1.4.2 reprova e
 * o navegador bloqueia.)
 */

export type TipoDeFonte = 'arquivo' | 'youtube';

export interface FonteDeAudio {
  carregando: boolean;
  tocando: boolean;
  tempo: number;
  duracao: number;
  erro: boolean;
  tocar: () => void;
  pausar: () => void;
  alternar: () => void;
  irPara: (segundos: number) => void;
  pular: (segundos: number) => void;
}

interface Opcoes {
  /** 0 a 1. Pode mudar a qualquer hora (a música abaixa sob a narração). */
  volume: number;
  mudo?: boolean;
  velocidade?: number;
  repetir?: boolean;
  aoTerminar?: () => void;
}

/** O id do vídeo em qualquer forma de endereço do YouTube. */
export function idDoYoutube(url: string): string | null {
  const padroes = [
    /youtu\.be\/([\w-]{11})/,
    /[?&]v=([\w-]{11})/,
    /\/(?:embed|shorts|live|v)\/([\w-]{11})/,
  ];
  for (const padrao of padroes) {
    const achado = url.match(padrao);
    if (achado) return achado[1];
  }
  return null;
}

// ---------------------------------------------------------------------------
// O script do YouTube, uma vez por página
// ---------------------------------------------------------------------------

interface PlayerDoYoutube {
  playVideo(): void;
  pauseVideo(): void;
  seekTo(segundos: number, permitirBuscar: boolean): void;
  setVolume(volume: number): void;
  mute(): void;
  unMute(): void;
  setPlaybackRate(taxa: number): void;
  getCurrentTime(): number;
  getDuration(): number;
  destroy(): void;
}

interface ApiDoYoutube {
  Player: new (
    elemento: HTMLElement,
    opcoes: Record<string, unknown>
  ) => PlayerDoYoutube;
  PlayerState: { ENDED: number; PLAYING: number; BUFFERING: number };
}

/**
 * O `window` com o que o script do YouTube pendura nele. Local, sem
 * `declare global`: só este arquivo fala com a API do YouTube.
 */
const janela = () =>
  window as unknown as {
    YT?: ApiDoYoutube;
    onYouTubeIframeAPIReady?: () => void;
  };

let scriptDoYoutube: Promise<ApiDoYoutube> | null = null;

function carregarYoutube(): Promise<ApiDoYoutube> {
  const w = janela();
  if (w.YT?.Player) return Promise.resolve(w.YT);
  if (scriptDoYoutube) return scriptDoYoutube;

  scriptDoYoutube = new Promise((resolve, reject) => {
    const anterior = w.onYouTubeIframeAPIReady;
    w.onYouTubeIframeAPIReady = () => {
      anterior?.();
      if (w.YT) resolve(w.YT);
    };
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    tag.async = true;
    tag.onerror = () => {
      scriptDoYoutube = null;
      reject(new Error('YouTube indisponível'));
    };
    document.head.appendChild(tag);
  });

  return scriptDoYoutube;
}

// ---------------------------------------------------------------------------

export function useFonteDeAudio(
  url: string | null,
  tipo: TipoDeFonte,
  opcoes: Opcoes
): FonteDeAudio {
  const [carregando, setCarregando] = useState(false);
  const [tocando, setTocando] = useState(false);
  const [tempo, setTempo] = useState(0);
  const [duracao, setDuracao] = useState(0);
  const [erro, setErro] = useState(false);

  const audio = useRef<HTMLAudioElement | null>(null);
  const youtube = useRef<PlayerDoYoutube | null>(null);
  const caixaDoYoutube = useRef<HTMLDivElement | null>(null);
  const relogio = useRef<ReturnType<typeof setInterval> | null>(null);
  const querTocar = useRef(false);

  // As opções mais recentes, lidas pelos ouvintes sem recriá-los.
  const atuais = useRef(opcoes);
  atuais.current = opcoes;

  const pararRelogio = () => {
    if (relogio.current) clearInterval(relogio.current);
    relogio.current = null;
  };

  // Troca de endereço (a narração recém-gerada): começa do zero.
  useEffect(() => {
    return () => {
      pararRelogio();
      audio.current?.pause();
      audio.current = null;
      youtube.current?.destroy();
      youtube.current = null;
      caixaDoYoutube.current?.remove();
      caixaDoYoutube.current = null;
      setTocando(false);
      setTempo(0);
      setDuracao(0);
      setErro(false);
    };
  }, [url, tipo]);

  // Volume, mudo, velocidade e repetição seguem as opções a qualquer hora.
  useEffect(() => {
    const volume = Math.min(1, Math.max(0, opcoes.volume));
    if (audio.current) {
      audio.current.volume = volume;
      audio.current.muted = !!opcoes.mudo;
      audio.current.playbackRate = opcoes.velocidade ?? 1;
      audio.current.loop = !!opcoes.repetir;
    }
    if (youtube.current) {
      youtube.current.setVolume(Math.round(volume * 100));
      if (opcoes.mudo) youtube.current.mute();
      else youtube.current.unMute();
      youtube.current.setPlaybackRate(opcoes.velocidade ?? 1);
    }
  }, [opcoes.volume, opcoes.mudo, opcoes.velocidade, opcoes.repetir]);

  const prepararArquivo = useCallback(() => {
    if (audio.current || !url) return audio.current;
    const el = new Audio(url);
    el.preload = 'metadata';
    el.volume = Math.min(1, Math.max(0, atuais.current.volume));
    el.muted = !!atuais.current.mudo;
    el.playbackRate = atuais.current.velocidade ?? 1;
    el.loop = !!atuais.current.repetir;
    el.addEventListener('loadedmetadata', () =>
      setDuracao(Number.isFinite(el.duration) ? el.duration : 0)
    );
    el.addEventListener('timeupdate', () => setTempo(el.currentTime));
    el.addEventListener('play', () => setTocando(true));
    el.addEventListener('pause', () => setTocando(false));
    el.addEventListener('waiting', () => setCarregando(true));
    el.addEventListener('playing', () => setCarregando(false));
    el.addEventListener('ended', () => {
      setTocando(false);
      atuais.current.aoTerminar?.();
    });
    el.addEventListener('error', () => {
      setErro(true);
      setCarregando(false);
      setTocando(false);
    });
    audio.current = el;
    return el;
  }, [url]);

  const prepararYoutube = useCallback(async () => {
    if (youtube.current || !url) return youtube.current;
    const id = idDoYoutube(url);
    if (!id) {
      setErro(true);
      return null;
    }
    setCarregando(true);
    try {
      const YT = await carregarYoutube();
      // O vídeo não aparece: o YouTube exige um elemento no documento, que
      // fica fora da tela e fora da árvore de acessibilidade.
      const caixa = document.createElement('div');
      caixa.setAttribute('aria-hidden', 'true');
      caixa.style.cssText =
        'position:fixed;width:1px;height:1px;left:-9999px;top:0;overflow:hidden;';
      const alvo = document.createElement('div');
      caixa.appendChild(alvo);
      document.body.appendChild(caixa);
      caixaDoYoutube.current = caixa;

      await new Promise<void>((resolve, reject) => {
        youtube.current = new YT.Player(alvo, {
          videoId: id,
          width: 1,
          height: 1,
          playerVars: {
            controls: 0,
            disablekb: 1,
            playsinline: 1,
            rel: 0,
            modestbranding: 1,
          },
          events: {
            onReady: () => {
              const p = youtube.current!;
              p.setVolume(Math.round(atuais.current.volume * 100));
              if (atuais.current.mudo) p.mute();
              setDuracao(p.getDuration() || 0);
              resolve();
            },
            onError: () => reject(new Error('vídeo indisponível')),
            onStateChange: (evento: { data: number }) => {
              const p = youtube.current;
              if (!p) return;
              if (evento.data === YT.PlayerState.PLAYING) {
                setTocando(true);
                setCarregando(false);
                setDuracao(p.getDuration() || 0);
                pararRelogio();
                relogio.current = setInterval(
                  () => setTempo(p.getCurrentTime() || 0),
                  500
                );
              } else if (evento.data === YT.PlayerState.BUFFERING) {
                setCarregando(true);
              } else {
                setTocando(false);
                pararRelogio();
                setTempo(p.getCurrentTime() || 0);
              }
              if (evento.data === YT.PlayerState.ENDED) {
                if (atuais.current.repetir) {
                  p.seekTo(0, true);
                  p.playVideo();
                } else {
                  atuais.current.aoTerminar?.();
                }
              }
            },
          },
        });
      });
      return youtube.current;
    } catch {
      setErro(true);
      return null;
    } finally {
      setCarregando(false);
    }
  }, [url]);

  const tocar = useCallback(async () => {
    if (!url) return;
    querTocar.current = true;
    setErro(false);
    if (tipo === 'arquivo') {
      const el = prepararArquivo();
      if (!el) return;
      setCarregando(true);
      try {
        await el.play();
      } catch {
        setErro(true);
      } finally {
        setCarregando(false);
      }
      return;
    }
    const p = await prepararYoutube();
    if (p && querTocar.current) p.playVideo();
  }, [url, tipo, prepararArquivo, prepararYoutube]);

  const pausar = useCallback(() => {
    querTocar.current = false;
    audio.current?.pause();
    youtube.current?.pauseVideo();
  }, []);

  const irPara = useCallback(
    (segundos: number) => {
      const alvo = Math.max(
        0,
        duracao ? Math.min(segundos, duracao) : segundos
      );
      if (audio.current) audio.current.currentTime = alvo;
      youtube.current?.seekTo(alvo, true);
      setTempo(alvo);
    },
    [duracao]
  );

  const pular = useCallback(
    (segundos: number) => {
      const atual =
        audio.current?.currentTime ??
        youtube.current?.getCurrentTime() ??
        tempo;
      irPara(atual + segundos);
    },
    [irPara, tempo]
  );

  const alternar = useCallback(() => {
    if (tocando) pausar();
    else void tocar();
  }, [tocando, pausar, tocar]);

  return {
    carregando,
    tocando,
    tempo,
    duracao,
    erro,
    tocar: () => void tocar(),
    pausar,
    alternar,
    irPara,
    pular,
  };
}

/** "1:05" · "1:02:10". */
export function relogioDe(segundos: number): string {
  if (!Number.isFinite(segundos) || segundos < 0) return '0:00';
  const s = Math.floor(segundos % 60);
  const m = Math.floor((segundos / 60) % 60);
  const h = Math.floor(segundos / 3600);
  const ss = String(s).padStart(2, '0');
  return h ? `${h}:${String(m).padStart(2, '0')}:${ss}` : `${m}:${ss}`;
}
