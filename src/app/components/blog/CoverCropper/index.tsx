'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from 'react';
import {
  PiArrowClockwise,
  PiArrowsOut,
  PiMagnifyingGlassMinus,
  PiMagnifyingGlassPlus,
} from 'react-icons/pi';
import { Button } from '@/app/components/ui/Button';
import { Sheet } from '@/app/components/ui/Sheet';

interface CoverCropperProps {
  imageUrl: string;
  onCropComplete: (croppedBlob: Blob) => void;
  onCancel: () => void;
}

/**
 * O recorte da capa do artigo.
 *
 * **16:10, e não mais 16:9.** É a proporção da capa na página do artigo; as
 * outras vitrines do blog (o mosaico do início, os cartões, as linhas com
 * miniatura) cortam pelo centro em 4:3, 4:5 e quadrado. As três prévias ao
 * lado mostram exatamente esses cortes, em vez de "computador, tablet e
 * celular" na mesma proporção, que não mostravam nada que o recorte já não
 * mostrasse.
 *
 * **Sai em 1600×1000.** O recorte antigo saía em 800×450 e virava a imagem
 * grande do topo do início, esticada em telas de alta densidade.
 *
 * Arrastar move a imagem (mouse, toque ou caneta, pelos eventos de ponteiro);
 * no teclado, as setas movem e + e − aproximam.
 */

const LARGURA = 800;
const ALTURA = 500;
const SAIDA = 2;

const CORTES = [
  { rotulo: 'Mosaico', proporcao: 4 / 3 },
  { rotulo: 'Cartão alto', proporcao: 4 / 5 },
  { rotulo: 'Miniatura', proporcao: 1 },
];

interface Estado {
  escala: number;
  x: number;
  y: number;
  giro: number;
}

function enquadrar(img: HTMLImageElement): Estado {
  const escala = Math.max(LARGURA / img.width, ALTURA / img.height);
  return {
    escala,
    x: (LARGURA - img.width * escala) / 2,
    y: (ALTURA - img.height * escala) / 2,
    giro: 0,
  };
}

/** Desenha a composição (no espaço de 800×500) num contexto de qualquer tamanho. */
function desenhar(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  e: Estado,
  fator: number
) {
  const w = LARGURA * fator;
  const h = ALTURA * fator;
  ctx.clearRect(0, 0, w, h);
  ctx.save();
  ctx.translate(w / 2, h / 2);
  ctx.rotate((e.giro * Math.PI) / 180);
  ctx.translate(-w / 2, -h / 2);
  ctx.drawImage(
    img,
    e.x * fator,
    e.y * fator,
    img.width * e.escala * fator,
    img.height * e.escala * fator
  );
  ctx.restore();
}

export default function CoverCropper({
  imageUrl,
  onCropComplete,
  onCancel,
}: CoverCropperProps) {
  const principal = useRef<HTMLCanvasElement>(null);
  const cortes = useRef<Array<HTMLCanvasElement | null>>([]);
  const arraste = useRef<{ x: number; y: number } | null>(null);
  const [imagem, setImagem] = useState<HTMLImageElement | null>(null);
  const [falhou, setFalhou] = useState(false);
  const [estado, setEstado] = useState<Estado>({
    escala: 1,
    x: 0,
    y: 0,
    giro: 0,
  });
  const [grade, setGrade] = useState(true);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setImagem(img);
      setEstado(enquadrar(img));
    };
    img.onerror = () => setFalhou(true);
    img.src = imageUrl;
  }, [imageUrl]);

  useEffect(() => {
    if (!imagem) return;
    const ctx = principal.current?.getContext('2d');
    if (ctx) {
      desenhar(ctx, imagem, estado, 1);
      if (grade) {
        ctx.strokeStyle = 'rgba(255,255,255,0.45)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (const t of [1 / 3, 2 / 3]) {
          ctx.moveTo(LARGURA * t, 0);
          ctx.lineTo(LARGURA * t, ALTURA);
          ctx.moveTo(0, ALTURA * t);
          ctx.lineTo(LARGURA, ALTURA * t);
        }
        ctx.stroke();
      }
    }
    // Os cortes das outras vitrines: o centro da composição, como o
    // `object-cover` faz no site.
    const fonte = principal.current;
    if (!fonte) return;
    const limpa = document.createElement('canvas');
    limpa.width = LARGURA;
    limpa.height = ALTURA;
    const lctx = limpa.getContext('2d');
    if (!lctx) return;
    desenhar(lctx, imagem, estado, 1);
    CORTES.forEach((corte, i) => {
      const alvo = cortes.current[i];
      const actx = alvo?.getContext('2d');
      if (!alvo || !actx) return;
      const sh = ALTURA;
      const sw = Math.min(LARGURA, sh * corte.proporcao);
      const sx = (LARGURA - sw) / 2;
      actx.clearRect(0, 0, alvo.width, alvo.height);
      actx.drawImage(limpa, sx, 0, sw, sh, 0, 0, alvo.width, alvo.height);
    });
  }, [imagem, estado, grade]);

  const zoom = useCallback((fator: number) => {
    setEstado((e) => {
      const escala = Math.min(Math.max(e.escala * fator, 0.1), 5);
      // Aproxima em torno do centro do recorte, não do canto da imagem.
      const k = escala / e.escala;
      return {
        ...e,
        escala,
        x: LARGURA / 2 - (LARGURA / 2 - e.x) * k,
        y: ALTURA / 2 - (ALTURA / 2 - e.y) * k,
      };
    });
  }, []);

  /** Pixels da tela para o espaço de 800×500 do recorte. */
  function paraRecorte(dx: number, dy: number) {
    const largura = principal.current?.getBoundingClientRect().width || LARGURA;
    const k = LARGURA / largura;
    return { dx: dx * k, dy: dy * k };
  }

  function apertar(e: PointerEvent<HTMLCanvasElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    arraste.current = { x: e.clientX, y: e.clientY };
  }
  function mover(e: PointerEvent<HTMLCanvasElement>) {
    if (!arraste.current) return;
    const { dx, dy } = paraRecorte(
      e.clientX - arraste.current.x,
      e.clientY - arraste.current.y
    );
    arraste.current = { x: e.clientX, y: e.clientY };
    setEstado((s) => ({ ...s, x: s.x + dx, y: s.y + dy }));
  }
  function soltar() {
    arraste.current = null;
  }

  function tecla(e: KeyboardEvent<HTMLCanvasElement>) {
    const passo = e.shiftKey ? 40 : 8;
    const mov: Record<string, [number, number]> = {
      ArrowLeft: [-passo, 0],
      ArrowRight: [passo, 0],
      ArrowUp: [0, -passo],
      ArrowDown: [0, passo],
    };
    if (mov[e.key]) {
      e.preventDefault();
      const [dx, dy] = mov[e.key];
      setEstado((s) => ({ ...s, x: s.x + dx, y: s.y + dy }));
    } else if (e.key === '+' || e.key === '=') {
      e.preventDefault();
      zoom(1.1);
    } else if (e.key === '-') {
      e.preventDefault();
      zoom(1 / 1.1);
    }
  }

  function confirmar() {
    if (!imagem) return;
    setSalvando(true);
    const saida = document.createElement('canvas');
    saida.width = LARGURA * SAIDA;
    saida.height = ALTURA * SAIDA;
    const ctx = saida.getContext('2d');
    if (!ctx) return setSalvando(false);
    desenhar(ctx, imagem, estado, SAIDA);
    saida.toBlob(
      (blob) => {
        setSalvando(false);
        if (blob) onCropComplete(blob);
      },
      'image/jpeg',
      0.9
    );
  }

  return (
    <Sheet
      aberto
      aoFechar={onCancel}
      titulo="Recortar a capa"
      descricao="Arraste para mover. As prévias mostram como as outras vitrines do blog cortam a mesma imagem."
      largura="g"
      rodape={
        <>
          <Button variante="fantasma" onClick={onCancel}>
            Cancelar
          </Button>
          <Button
            variante="primario"
            onClick={confirmar}
            disabled={!imagem}
            carregando={salvando}
          >
            Usar este recorte
          </Button>
        </>
      }
    >
      {falhou ? (
        <p role="alert" className="text-erro">
          A imagem não abriu. Tente enviar o arquivo de novo.
        </p>
      ) : (
        <div className="flex flex-col gap-5">
          <canvas
            ref={principal}
            width={LARGURA}
            height={ALTURA}
            tabIndex={0}
            role="img"
            aria-label="Recorte da capa. Use as setas para mover e + ou − para aproximar."
            onPointerDown={apertar}
            onPointerMove={mover}
            onPointerUp={soltar}
            onPointerCancel={soltar}
            onKeyDown={tecla}
            className="aspect-[16/10] h-auto w-full cursor-move touch-none rounded-card bg-sup-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ouro"
          />

          <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
            <div className="flex items-center gap-1">
              <Button
                variante="fantasma"
                tamanho="p"
                icone={PiMagnifyingGlassMinus}
                rotulo="Afastar"
                onClick={() => zoom(1 / 1.2)}
              />
              <input
                type="range"
                min={0.1}
                max={5}
                step={0.01}
                value={estado.escala}
                onChange={(e) => zoom(Number(e.target.value) / estado.escala)}
                aria-label="Aproximação"
                aria-valuetext={`${Math.round(estado.escala * 100)}%`}
                className="blog-faixa w-40"
                style={{
                  ['--cheio' as string]: `${((estado.escala - 0.1) / 4.9) * 100}%`,
                }}
              />
              <Button
                variante="fantasma"
                tamanho="p"
                icone={PiMagnifyingGlassPlus}
                rotulo="Aproximar"
                onClick={() => zoom(1.2)}
              />
            </div>
            <Button
              variante="fantasma"
              tamanho="p"
              icone={PiArrowClockwise}
              onClick={() =>
                setEstado((e) => ({ ...e, giro: (e.giro + 90) % 360 }))
              }
            >
              Girar
            </Button>
            <Button
              variante="fantasma"
              tamanho="p"
              icone={PiArrowsOut}
              onClick={() => imagem && setEstado(enquadrar(imagem))}
            >
              Enquadrar
            </Button>
            <Button
              variante="fantasma"
              tamanho="p"
              aria-pressed={grade}
              onClick={() => setGrade((g) => !g)}
            >
              Linhas dos terços
            </Button>
          </div>

          <div className="grid grid-cols-3 items-end gap-4">
            {CORTES.map((corte, i) => (
              <figure key={corte.rotulo} className="flex flex-col gap-1.5">
                <canvas
                  ref={(c) => {
                    cortes.current[i] = c;
                  }}
                  width={Math.round(200 * corte.proporcao)}
                  height={200}
                  aria-hidden="true"
                  className="h-auto w-full rounded-controle bg-sup-2"
                  style={{ aspectRatio: corte.proporcao }}
                />
                <figcaption className="t-legenda">{corte.rotulo}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      )}
    </Sheet>
  );
}
