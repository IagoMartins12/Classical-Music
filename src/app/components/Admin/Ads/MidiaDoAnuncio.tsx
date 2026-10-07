'use client';

import { useEffect, useId, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { PiImage, PiTrash, PiUploadSimple } from 'react-icons/pi';
import ConfirmModal from '@/app/components/ConfirmModal';
import { Button } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import { Stack } from '@/app/components/ui/Layout';
import { Sheet } from '@/app/components/ui/Sheet';
import { Text } from '@/app/components/ui/Text';
import { cx } from '@/app/components/ui/cx';
import {
  AD_DIMENSIONS,
  formatFileSize,
  getImageDimensions,
  validateFile,
  validateMediaDimensions,
} from '@/app/libs/ads/mediaUtils';
import { removeAdMedia, uploadAdMedia } from '@/app/requests/admin/ads';

/**
 * A imagem do anúncio: a atual, a troca e a remoção.
 *
 * O tamanho certo depende do lugar: a tela diz as medidas do lugar do
 * anúncio antes de escolher o arquivo, e confere a proporção quando ele
 * chega — a imagem errada é recortada pelo site e o anúncio perde o texto.
 *
 * **Vídeo não passa pela API ainda** (o modal antigo oferecia a aba e o envio
 * falhava no fim). A tela diz isso, em vez de oferecer.
 */

type Lugar = keyof typeof AD_DIMENSIONS;

interface AnuncioComMidia {
  id: string;
  title?: string;
  placement?: string;
  imageUrl?: string | null;
  videoUrl?: string | null;
}

export function MidiaDoAnuncio({
  anuncio: a,
  aoFechar,
  aoMudar,
}: {
  anuncio: AnuncioComMidia;
  aoFechar: () => void;
  aoMudar: () => void;
}) {
  const id = useId();
  const entrada = useRef<HTMLInputElement>(null);
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [previa, setPrevia] = useState<string | null>(null);
  const [medidas, setMedidas] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [erros, setErros] = useState<string[]>([]);
  const [arrastando, setArrastando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [removendo, setRemovendo] = useState(false);
  const [confirmarRemocao, setConfirmarRemocao] = useState(false);

  const lugar = (
    a.placement && a.placement in AD_DIMENSIONS ? a.placement : 'SIDEBAR_RIGHT'
  ) as Lugar;
  const alvo = AD_DIMENSIONS[lugar];

  // A prévia é uma URL de objeto: solta quando sai.
  useEffect(
    () => () => {
      if (previa) URL.revokeObjectURL(previa);
    },
    [previa]
  );

  const escolher = async (f: File | null) => {
    setAviso(null);
    setErros([]);
    setMedidas(null);
    if (previa) URL.revokeObjectURL(previa);
    setPrevia(null);
    setArquivo(null);
    if (!f) return;

    const v = validateFile(f, 'image', lugar);
    if (!v.isValid) {
      setErros(v.errors);
      return;
    }
    setArquivo(f);
    setPrevia(URL.createObjectURL(f));
    try {
      const m = await getImageDimensions(f);
      setMedidas(m);
      const d = validateMediaDimensions(m.width, m.height, lugar);
      // Proporção errada não bloqueia: avisa. Resolução baixa, sim.
      if (!d.isValid) {
        if (/baixa/i.test(d.message ?? '')) setErros([d.message ?? '']);
        else
          setAviso(
            `A proporção não é a do lugar (${alvo.desktop.aspectRatio}); o site vai recortar as bordas.`
          );
      }
    } catch {
      setErros(['Não foi possível ler a imagem.']);
    }
  };

  const enviar = async () => {
    if (!arquivo) return;
    setEnviando(true);
    try {
      await uploadAdMedia(a.id, arquivo, 'image');
      toast.success('Imagem trocada.');
      void escolher(null);
      aoMudar();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Não foi possível enviar.');
    } finally {
      setEnviando(false);
    }
  };

  const remover = async () => {
    setRemovendo(true);
    try {
      await removeAdMedia(a.id, a.videoUrl && !a.imageUrl ? 'video' : 'image');
      toast.success('Mídia removida.');
      setConfirmarRemocao(false);
      aoMudar();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Não foi possível remover.');
    } finally {
      setRemovendo(false);
    }
  };

  const temMidia = !!(a.imageUrl || a.videoUrl);

  return (
    <Sheet
      aberto
      aoFechar={aoFechar}
      titulo="Imagem do anúncio"
      descricao={a.title}
      largura="g"
      rodape={
        <>
          {temMidia && (
            <Button
              tamanho="p"
              variante="perigo"
              icone={PiTrash}
              onClick={() => setConfirmarRemocao(true)}
              className="mr-auto"
            >
              Remover a atual
            </Button>
          )}
          <Button tamanho="p" variante="fantasma" onClick={aoFechar}>
            Fechar
          </Button>
          <Button
            tamanho="p"
            variante="primario"
            icone={PiUploadSimple}
            disabled={!arquivo || erros.length > 0}
            carregando={enviando}
            onClick={enviar}
          >
            {temMidia ? 'Trocar a imagem' : 'Enviar a imagem'}
          </Button>
        </>
      }
    >
      <Stack gap={6}>
        <dl className="grid grid-cols-3 gap-3 rounded-card bg-sup-2 p-4 text-sm">
          {(['desktop', 'tablet', 'mobile'] as const).map((t) => (
            <div key={t} className="flex flex-col gap-0.5">
              <dt className="t-legenda">
                {t === 'desktop'
                  ? 'Computador'
                  : t === 'tablet'
                    ? 'Tablet'
                    : 'Celular'}
              </dt>
              <dd className="t-dado text-texto">
                {alvo[t].width} × {alvo[t].height}
              </dd>
            </div>
          ))}
        </dl>
        <Text papel="legenda" as="p" className="-mt-4">
          Medidas do lugar deste anúncio. Envie a do computador (proporção{' '}
          {alvo.desktop.aspectRatio}); o site gera as outras. JPG, PNG ou WebP,
          até 10 MB.
        </Text>

        {temMidia && !previa && (
          <Stack gap={2}>
            <Text papel="rotulo" as="h3" className="font-medium">
              Agora
            </Text>
            {a.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- mídia do anúncio, de qualquer origem
              <img
                src={a.imageUrl}
                alt={`Imagem atual de ${a.title ?? 'anúncio'}`}
                className="max-h-72 w-auto self-start rounded-controle border border-linha object-contain"
              />
            ) : a.videoUrl ? (
              <video
                src={a.videoUrl}
                controls
                className="max-h-72 self-start rounded-controle border border-linha"
              />
            ) : null}
          </Stack>
        )}

        <label
          htmlFor={id}
          onDragOver={(e) => {
            e.preventDefault();
            setArrastando(true);
          }}
          onDragLeave={() => setArrastando(false)}
          onDrop={(e) => {
            e.preventDefault();
            setArrastando(false);
            void escolher(e.dataTransfer.files?.[0] ?? null);
          }}
          className={cx(
            'flex min-h-40 cursor-pointer flex-col items-center justify-center gap-2 rounded-card border border-dashed px-6 py-8 text-center transition-colors',
            arrastando
              ? 'border-ouro bg-[var(--interactive-hover)]'
              : 'border-linha-forte hover:bg-[var(--interactive-hover)]'
          )}
        >
          {previa ? (
            // eslint-disable-next-line @next/next/no-img-element -- prévia local do arquivo escolhido
            <img
              src={previa}
              alt="Prévia da imagem escolhida"
              className="max-h-64 w-auto rounded-controle object-contain"
            />
          ) : (
            <Icon de={PiImage} tamanho="g" className="text-texto-suave" />
          )}
          <span className="t-rotulo text-texto">
            {arquivo
              ? arquivo.name
              : 'Arraste a imagem aqui ou clique para escolher'}
          </span>
          {arquivo && (
            <span className="t-legenda t-dado">
              {formatFileSize(arquivo.size)}
              {medidas ? ` · ${medidas.width} × ${medidas.height}` : ''}
            </span>
          )}
          <input
            ref={entrada}
            id={id}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={(e) => void escolher(e.target.files?.[0] ?? null)}
          />
        </label>

        {erros.length > 0 && (
          <ul role="alert" className="flex flex-col gap-1 text-sm text-erro">
            {erros.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        )}
        {aviso && (
          <p role="status" className="text-sm text-atencao">
            {aviso}
          </p>
        )}
        <Text papel="legenda" as="p">
          Vídeo de anúncio ainda não passa pela API; por enquanto, só imagem.
        </Text>
      </Stack>

      <ConfirmModal
        isOpen={confirmarRemocao}
        onClose={() => setConfirmarRemocao(false)}
        onConfirm={remover}
        type="danger"
        title="Remover a mídia?"
        message="O anúncio fica sem imagem até você enviar outra — no ar, ele aparece só com o texto."
        confirmText="Remover"
        isLoading={removendo}
      />
    </Sheet>
  );
}
