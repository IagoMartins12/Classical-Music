'use client';

import { useId, useState } from 'react';
import type { Editor } from '@tiptap/react';
import { PiPlus, PiTrash, PiUploadSimple } from 'react-icons/pi';
import Image from '@/app/components/SmartImage';
import {
  BuscaNoAcervo,
  ItemEscolhido,
  type ItemDoAcervo,
} from '@/app/components/blog/escrita/BuscaNoAcervo';
import { uploadBlogMedia } from '@/app/requests/blog/interactions';
import { Button, classesDeBotao } from '@/app/components/ui/Button';
import { Field } from '@/app/components/ui/Field';
import { Icon } from '@/app/components/ui/Icon';
import { cx } from '@/app/components/ui/cx';
import { FolhaDoEditor } from '../FolhaDoEditor';

interface TimelineModalProps {
  editor: Editor;
  onClose: () => void;
  articleId?: string;
  sessionId?: string;
}

interface Evento {
  date: string;
  title: string;
  description: string;
  image?: string;
}

const VAZIO: Evento = { date: '', title: '', description: '', image: '' };

/**
 * Linha do tempo: uma lista de momentos (data, título, texto e imagem
 * opcional). Só entram os que têm data e título; o botão de inserir espera
 * pelo primeiro completo, em vez de um `alert` depois do clique.
 */
export function TimelineModal({
  editor,
  onClose,
  articleId,
  sessionId,
}: TimelineModalProps) {
  const id = useId();
  const [eventos, setEventos] = useState<Evento[]>([{ ...VAZIO }]);
  const [enviandoEm, setEnviandoEm] = useState<number | null>(null);
  const [erro, setErro] = useState('');
  const [compositor, setCompositor] = useState<ItemDoAcervo | null>(null);

  const completos = eventos.filter((e) => e.date.trim() && e.title.trim());

  function mudar(i: number, campo: keyof Evento, valor: string) {
    setEventos((atual) =>
      atual.map((e, j) => (j === i ? { ...e, [campo]: valor } : e))
    );
  }

  async function enviarImagem(i: number, arquivo: File) {
    setEnviandoEm(i);
    setErro('');
    try {
      mudar(
        i,
        'image',
        await uploadBlogMedia(arquivo, {
          folder: 'timeline',
          articleId,
          sessionId,
        })
      );
    } catch (falha) {
      setErro(
        falha instanceof Error
          ? `Não deu para enviar: ${falha.message}`
          : 'Não deu para enviar a imagem.'
      );
    } finally {
      setEnviandoEm(null);
    }
  }

  function inserir() {
    editor
      .chain()
      .focus()
      .insertContent({
        type: 'timeline',
        attrs: {
          events: completos.map((e) => ({
            ...e,
            date: e.date.trim(),
            title: e.title.trim(),
          })),
          composerId: compositor?.id ?? '',
          composerName: compositor?.nome ?? '',
        },
      })
      .run();
    onClose();
  }

  return (
    <FolhaDoEditor
      titulo="Linha do tempo"
      descricao="Só entram os momentos com data e título."
      aoFechar={onClose}
      aoEnviar={inserir}
      podeEnviar={completos.length > 0}
      enviando={enviandoEm !== null}
      largura="g"
    >
      <details
        className="rounded-card bg-sup-2 px-4"
        open={Boolean(compositor)}
      >
        <summary className="flex min-h-[var(--alvo)] cursor-pointer items-center justify-between text-sm font-medium text-texto">
          De qual compositor
          <span className="font-normal text-texto-fraco">
            {compositor ? compositor.nome : 'opcional'}
          </span>
        </summary>
        <div className="pb-4">
          {compositor ? (
            <ItemEscolhido
              rotulo="Compositor"
              item={compositor}
              aoTrocar={() => setCompositor(null)}
            />
          ) : (
            <BuscaNoAcervo
              tipo="compositor"
              rotulo="Compositor"
              aoEscolher={setCompositor}
            />
          )}
        </div>
      </details>

      <ol className="flex flex-col gap-3">
        {eventos.map((evento, i) => (
          <li key={i} className="flex flex-col gap-4 rounded-card bg-sup-2 p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="t-rotulo text-texto-fraco">Momento {i + 1}</span>
              {eventos.length > 1 && (
                <Button
                  variante="fantasma"
                  tamanho="p"
                  icone={PiTrash}
                  rotulo={`Tirar o momento ${i + 1}`}
                  onClick={() =>
                    setEventos((atual) => atual.filter((_, j) => j !== i))
                  }
                />
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-[10rem_minmax(0,1fr)]">
              <Field
                label="Data"
                value={evento.date}
                onChange={(e) => mudar(i, 'date', e.target.value)}
                placeholder="1770"
              />
              <Field
                label="Título"
                value={evento.title}
                onChange={(e) => mudar(i, 'title', e.target.value)}
                placeholder="Nasce em Bonn"
              />
            </div>
            <Field.Area
              label="Texto (opcional)"
              rows={2}
              value={evento.description}
              onChange={(e) => mudar(i, 'description', e.target.value)}
              classeCampo="resize-y"
            />
            {evento.image ? (
              <div className="flex items-end gap-3">
                <Image
                  src={evento.image}
                  alt=""
                  width={240}
                  height={160}
                  className="h-24 w-36 rounded-controle object-cover"
                />
                <Button
                  variante="fantasma"
                  tamanho="p"
                  onClick={() => mudar(i, 'image', '')}
                >
                  Tirar imagem
                </Button>
              </div>
            ) : (
              <div>
                <input
                  id={`${id}-imagem-${i}`}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  onChange={(e) => {
                    const arquivo = e.target.files?.[0];
                    e.target.value = '';
                    if (arquivo) enviarImagem(i, arquivo);
                  }}
                  disabled={enviandoEm === i}
                  className="sr-only"
                />
                <label
                  htmlFor={`${id}-imagem-${i}`}
                  className={cx(
                    classesDeBotao('fantasma', 'p'),
                    'cursor-pointer'
                  )}
                >
                  <Icon de={PiUploadSimple} tamanho="pp" />
                  {enviandoEm === i ? 'Enviando…' : 'Imagem (opcional)'}
                </label>
              </div>
            )}
          </li>
        ))}
      </ol>

      {erro && (
        <p role="alert" className="t-legenda text-erro">
          {erro}
        </p>
      )}

      <Button
        variante="secundario"
        icone={PiPlus}
        onClick={() => setEventos((atual) => [...atual, { ...VAZIO }])}
        className="self-start"
      >
        Outro momento
      </Button>
    </FolhaDoEditor>
  );
}
