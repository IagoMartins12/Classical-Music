'use client';

import { useEffect, useId, useState } from 'react';
import type { Editor } from '@tiptap/react';
import { PiCheck } from 'react-icons/pi';
import {
  EscolhaDeObra,
  type ItemDoAcervo,
} from '@/app/components/blog/escrita/BuscaNoAcervo';
import Image from '@/app/components/SmartImage';
import { Interruptor } from '@/app/components/Admin/painel/Campos';
import { Field } from '@/app/components/ui/Field';
import { Icon } from '@/app/components/ui/Icon';
import { Skeleton } from '@/app/components/ui/Skeleton';
import { cx } from '@/app/components/ui/cx';
import { workScoresRequest } from '@/app/requests/work-scores';
import { FolhaDoEditor } from '../FolhaDoEditor';

interface ScoreModalProps {
  editor: Editor;
  onClose: () => void;
}

interface Obra {
  id: string;
  title: string;
  composer?: { name?: string };
}

interface PartituraDaObra {
  id: string;
  title: string;
  type?: string;
  pageCount?: number;
  downloadUrl: string;
  thumbnailUrl?: string;
}

/** Partitura no texto: escolhe-se a obra e, dela, uma das partituras. */
export function ScoreModal({ editor, onClose }: ScoreModalProps) {
  const id = useId();
  const [obraEscolhida, setObraEscolhida] = useState<ItemDoAcervo | null>(null);
  const obraId = obraEscolhida?.id ?? '';
  const obra: Obra | null = obraEscolhida
    ? {
        id: obraEscolhida.id,
        title: obraEscolhida.nome,
        composer: { name: obraEscolhida.compositor?.nome },
      }
    : null;
  const [partituras, setPartituras] = useState<PartituraDaObra[]>([]);
  const [escolhida, setEscolhida] = useState<PartituraDaObra | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const [pagina, setPagina] = useState(1);
  const [baixar, setBaixar] = useState(true);

  useEffect(() => {
    if (!obraId) return;
    let vivo = true;
    setCarregando(true);
    setErro('');
    setEscolhida(null);
    workScoresRequest(new URLSearchParams({ workId: obraId }))
      .then((dados) => {
        if (vivo) setPartituras(dados?.workScores ?? []);
      })
      .catch(() => {
        if (vivo)
          setErro('Não deu para carregar as partituras. Tente de novo.');
      })
      .finally(() => {
        if (vivo) setCarregando(false);
      });
    return () => {
      vivo = false;
    };
  }, [obraId]);

  function inserir() {
    if (!escolhida || !obra) return;
    editor
      .chain()
      .focus()
      .insertContent({
        type: 'scoreViewer',
        attrs: {
          workId: obra.id,
          scoreId: escolhida.id,
          scoreUrl: escolhida.downloadUrl,
          scoreTitle: escolhida.title,
          workTitle: obra.title,
          composerName: obra.composer?.name,
          pageNumber: Math.max(1, pagina || 1),
          allowDownload: baixar,
        },
      })
      .run();
    onClose();
  }

  return (
    <FolhaDoEditor
      titulo="Partitura"
      descricao="O leitor folheia a partitura sem sair do artigo."
      aoFechar={onClose}
      aoEnviar={inserir}
      podeEnviar={Boolean(escolhida && obra)}
    >
      <EscolhaDeObra
        obra={obraEscolhida}
        aoEscolher={(o) => {
          setObraEscolhida(o);
          if (!o) setPartituras([]);
        }}
      />

      {obraId && (
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 text-sm font-medium text-texto">
            Partitura
          </legend>
          {carregando ? (
            <div className="flex flex-col gap-2" aria-busy="true">
              <Skeleton className="h-16 w-full rounded-controle" />
              <Skeleton className="h-16 w-full rounded-controle" />
            </div>
          ) : erro ? (
            <p role="alert" className="t-legenda text-erro">
              {erro}
            </p>
          ) : partituras.length === 0 ? (
            <p className="t-legenda">
              Esta obra ainda não tem partitura no acervo.
            </p>
          ) : (
            <ul className="classical-scrollbar flex max-h-72 flex-col gap-1 overflow-y-auto pr-1">
              {partituras.map((p) => {
                const marcada = escolhida?.id === p.id;
                return (
                  <li key={p.id}>
                    <label
                      className={cx(
                        'flex cursor-pointer items-center gap-4 rounded-controle p-2 pr-4 transition-colors',
                        'has-[:focus-visible]:border-[var(--ouro)]',
                        marcada ? 'bg-sup-2' : 'hover:bg-(--interactive-hover)'
                      )}
                    >
                      <input
                        type="radio"
                        name={`${id}-partitura`}
                        checked={marcada}
                        onChange={() => setEscolhida(p)}
                        className="sr-only"
                      />
                      {p.thumbnailUrl ? (
                        <Image
                          src={p.thumbnailUrl}
                          alt=""
                          width={48}
                          height={64}
                          className="h-16 w-12 shrink-0 rounded-sm bg-sup-2 object-cover"
                        />
                      ) : (
                        <span
                          aria-hidden="true"
                          className="h-16 w-12 shrink-0 rounded-sm bg-sup-2"
                        />
                      )}
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate font-medium text-texto">
                          {p.title}
                        </span>
                        <span className="t-legenda">
                          {[
                            p.type,
                            p.pageCount ? `${p.pageCount} páginas` : null,
                          ]
                            .filter(Boolean)
                            .join(' · ')}
                        </span>
                      </span>
                      {marcada && (
                        <Icon
                          de={PiCheck}
                          tamanho="p"
                          className="text-ouro-texto"
                        />
                      )}
                    </label>
                  </li>
                );
              })}
            </ul>
          )}
        </fieldset>
      )}

      {escolhida && (
        <div className="flex flex-col gap-4">
          <Field
            label="Abrir na página"
            type="number"
            inputMode="numeric"
            min={1}
            max={escolhida.pageCount || undefined}
            value={pagina}
            onChange={(e) => setPagina(Number(e.target.value))}
            classeCampo="max-w-32"
          />
          <Interruptor
            rotulo="Deixar baixar"
            ajuda="Mostra o link para baixar o PDF sob a partitura."
            ligado={baixar}
            aoMudar={setBaixar}
          />
        </div>
      )}
    </FolhaDoEditor>
  );
}
