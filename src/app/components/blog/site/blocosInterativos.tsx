'use client';

import { useState, type CSSProperties } from 'react';
import { PiFilePdf, PiPause, PiPlay } from 'react-icons/pi';
import Image from '@/app/components/SmartImage';
import { Button } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import { cx } from '@/app/components/ui/cx';
import { idDoYoutube, relogioDe, useFonteDeAudio } from './useFonteDeAudio';

/**
 * As partes do corpo do artigo que precisam de navegador. O resto do texto
 * é HTML do servidor (`CorpoDoArtigo`).
 */

/**
 * Vídeo do YouTube "leve": a miniatura e o botão, e o player só entra no
 * clique. Um `iframe` do YouTube baixa ~1 MB de script por vídeo; um artigo
 * com a comparação de duas gravações carregava dois antes de alguém pedir.
 */
export function VideoDoYoutube({
  url,
  titulo,
  inicio,
  rotuloTocar,
}: {
  url: string;
  titulo: string;
  inicio?: number | null;
  rotuloTocar: string;
}) {
  const [ativo, setAtivo] = useState(false);
  const id = idDoYoutube(url);
  if (!id) return null;

  if (ativo) {
    return (
      <span className="relative block aspect-video overflow-hidden rounded-card bg-sup-2">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0${inicio ? `&start=${inicio}` : ''}`}
          title={titulo}
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setAtivo(true)}
      className="group/video relative block aspect-video w-full overflow-hidden rounded-card bg-sup-2"
    >
      <Image
        src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`}
        alt=""
        fill
        sizes="(min-width: 768px) 720px, 100vw"
        className="object-cover"
      />
      <span className="absolute inset-0 bg-veu-foto/40" aria-hidden="true" />
      <span className="absolute left-1/2 top-1/2 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full fill-ouro text-sobre-ouro transition-transform duration-[var(--t-resposta)] ease-saida group-active/video:scale-95">
        <Icon de={PiPlay} tamanho="g" />
      </span>
      <span className="sr-only">
        {rotuloTocar}: {titulo}
      </span>
    </button>
  );
}

/** O bloco de áudio do texto (gravação ou YouTube), com o próprio controle. */
export function AudioNoTexto({
  url,
  tipo,
  titulo,
  rotulos,
  compacto = false,
}: {
  url: string;
  tipo: 'arquivo' | 'youtube';
  titulo: string;
  rotulos: { tocar: string; pausar: string; posicao: string };
  /** Só o botão (a citação com música de fundo). */
  compacto?: boolean;
}) {
  const fonte = useFonteDeAudio(url, tipo, { volume: 0.8 });
  const cheio = fonte.duracao ? (fonte.tempo / fonte.duracao) * 100 : 0;

  if (compacto) {
    return (
      <Button
        tamanho="p"
        variante="fantasma"
        icone={fonte.tocando ? PiPause : PiPlay}
        aria-pressed={fonte.tocando}
        carregando={fonte.carregando && !fonte.tocando}
        onClick={fonte.alternar}
      >
        {fonte.tocando ? rotulos.pausar : titulo}
      </Button>
    );
  }

  return (
    <span className="flex items-center gap-3">
      <Button
        variante="primario"
        icone={fonte.tocando ? PiPause : PiPlay}
        rotulo={`${fonte.tocando ? rotulos.pausar : rotulos.tocar}: ${titulo}`}
        carregando={fonte.carregando && !fonte.tocando}
        onClick={fonte.alternar}
        className="!rounded-full"
      />
      <input
        type="range"
        aria-label={`${rotulos.posicao}: ${titulo}`}
        aria-valuetext={`${relogioDe(fonte.tempo)} / ${relogioDe(fonte.duracao)}`}
        min={0}
        max={fonte.duracao || 1}
        step={1}
        value={Math.min(fonte.tempo, fonte.duracao || 1)}
        onChange={(e) => fonte.irPara(Number(e.target.value))}
        className="blog-faixa min-w-0 flex-1"
        style={{ '--cheio': `${cheio}%` } as CSSProperties}
      />
      <span className="t-dado shrink-0 text-[0.8125rem] text-texto-suave">
        {relogioDe(fonte.tempo)}
        <span className="text-texto-fraco"> / {relogioDe(fonte.duracao)}</span>
      </span>
    </span>
  );
}

/**
 * A partitura dentro do texto. O PDF só abre no clique: um visualizador de
 * 600 px carregando no meio do artigo pesava a página de todo leitor.
 */
export function PartituraNoTexto({
  url,
  titulo,
  pagina,
  rotuloAbrir,
}: {
  url: string;
  titulo: string;
  pagina: number;
  rotuloAbrir: string;
}) {
  const [aberta, setAberta] = useState(false);

  if (aberta) {
    return (
      <iframe
        src={`${url}#page=${pagina}`}
        title={titulo}
        className="block h-[70vh] max-h-[640px] w-full rounded-controle bg-sup-2"
      />
    );
  }

  return (
    <Button
      icone={PiFilePdf}
      onClick={() => setAberta(true)}
      className={cx('self-start')}
    >
      {rotuloAbrir}
    </Button>
  );
}
