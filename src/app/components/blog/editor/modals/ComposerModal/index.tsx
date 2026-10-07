'use client';

import { useState } from 'react';
import type { Editor } from '@tiptap/react';
import {
  BuscaNoAcervo,
  ItemEscolhido,
  type ItemDoAcervo,
} from '@/app/components/blog/escrita/BuscaNoAcervo';
import { findComposerById } from '@/app/requests/catalog-search';
import { Chip } from '@/app/components/ui/Badge';
import { BlocoDoArtigo } from '@/app/components/blog/site/CorpoDoArtigo';
import { cortar } from '@/app/utils/blog/tiptap';
import { FolhaDoEditor } from '../FolhaDoEditor';

interface ComposerModalProps {
  editor: Editor;
  onClose: () => void;
}

interface Compositor {
  id: string;
  name: string;
  portraitUrl?: string;
  bio?: string;
  birthDate?: string;
  deathDate?: string;
  nationality?: string;
  instruments?: string;
  epochName?: string;
  wikipediaLink?: string;
}

type Parte =
  | 'retrato'
  | 'datas'
  | 'epoca'
  | 'nacionalidade'
  | 'instrumentacao'
  | 'biografia'
  | 'resumo'
  | 'obras'
  | 'wikipedia';

const PARTES: Array<{ valor: Parte; rotulo: string }> = [
  { valor: 'retrato', rotulo: 'Retrato' },
  { valor: 'datas', rotulo: 'Datas' },
  { valor: 'epoca', rotulo: 'Época' },
  { valor: 'nacionalidade', rotulo: 'Nacionalidade' },
  { valor: 'instrumentacao', rotulo: 'Instrumentação' },
  { valor: 'biografia', rotulo: 'Biografia' },
  { valor: 'resumo', rotulo: 'Só o começo da biografia' },
  { valor: 'obras', rotulo: 'Link "Ver obras"' },
  { valor: 'wikipedia', rotulo: 'Link da Wikipedia' },
];

/**
 * Cartão de compositor. O que entra no cartão se escolhe em fichas, e a
 * prévia ao lado é o próprio bloco do artigo (`BlocoDoArtigo`): não há uma
 * segunda versão do cartão só para o diálogo.
 */
export function ComposerModal({ editor, onClose }: ComposerModalProps) {
  const [escolhido, setEscolhido] = useState<ItemDoAcervo | null>(null);
  const [compositor, setCompositor] = useState<Compositor | null>(null);
  const [erro, setErro] = useState('');
  const [layout, setLayout] = useState<'vertical' | 'horizontal'>('horizontal');
  const [partes, setPartes] = useState<Set<Parte>>(
    () =>
      new Set([
        'retrato',
        'datas',
        'epoca',
        'nacionalidade',
        'biografia',
        'obras',
      ])
  );

  const tem = (p: Parte) => partes.has(p);
  function alternar(p: Parte) {
    setPartes((atual) => {
      const novo = new Set(atual);
      if (novo.has(p)) novo.delete(p);
      else novo.add(p);
      return novo;
    });
  }

  async function escolher(item: ItemDoAcervo | null) {
    setEscolhido(item);
    setCompositor(null);
    setErro('');
    if (!item) return;
    const novoId = item.id;
    try {
      const achado = (await findComposerById(novoId)) as Compositor | null;
      if (achado) setCompositor(achado);
    } catch {
      setErro('Não deu para carregar o compositor. Tente de novo.');
    }
  }

  const c = compositor;
  const attrs = c && {
    composerId: c.id,
    composerName: c.name,
    composerImage: tem('retrato') ? (c.portraitUrl ?? null) : null,
    composerBio: tem('biografia')
      ? tem('resumo') && c.bio
        ? cortar(c.bio, 200)
        : (c.bio ?? null)
      : null,
    composerBirthDate: tem('datas') ? (c.birthDate ?? null) : null,
    composerDeathDate: tem('datas') ? (c.deathDate ?? null) : null,
    composerNationality: tem('nacionalidade') ? (c.nationality ?? null) : null,
    composerInstrumentation: tem('instrumentacao')
      ? (c.instruments ?? null)
      : null,
    composerEpoch: tem('epoca') ? (c.epochName ?? null) : null,
    composerWikipediaLink: tem('wikipedia') ? (c.wikipediaLink ?? null) : null,
    layout,
    showWorksButton: tem('obras'),
  };

  function inserir() {
    if (!attrs) return;
    editor.chain().focus().insertContent({ type: 'composerCard', attrs }).run();
    onClose();
  }

  return (
    <FolhaDoEditor
      titulo="Cartão de compositor"
      descricao="Liga o texto à página do compositor no catálogo."
      aoFechar={onClose}
      aoEnviar={inserir}
      podeEnviar={Boolean(attrs)}
      largura="g"
    >
      {escolhido ? (
        <ItemEscolhido
          rotulo="Compositor"
          item={escolhido}
          aoTrocar={() => escolher(null)}
        />
      ) : (
        <BuscaNoAcervo
          tipo="compositor"
          rotulo="Compositor"
          aoEscolher={escolher}
          autoFocus
        />
      )}
      {erro && (
        <p role="alert" className="t-legenda text-erro">
          {erro}
        </p>
      )}

      {attrs && (
        <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
          <div className="flex flex-col gap-5">
            <fieldset className="flex flex-col gap-2">
              <legend className="mb-2 text-sm font-medium text-texto">
                Formato
              </legend>
              <div className="flex flex-wrap gap-1.5">
                <Chip
                  selecionado={layout === 'horizontal'}
                  onClick={() => setLayout('horizontal')}
                >
                  Retrato ao lado
                </Chip>
                <Chip
                  selecionado={layout === 'vertical'}
                  onClick={() => setLayout('vertical')}
                >
                  Retrato em cima
                </Chip>
              </div>
            </fieldset>
            <fieldset className="flex flex-col gap-2">
              <legend className="mb-2 text-sm font-medium text-texto">
                O que mostrar
              </legend>
              <div className="flex flex-wrap gap-1.5">
                {PARTES.filter(
                  (p) => p.valor !== 'resumo' || tem('biografia')
                ).map((p) => (
                  <Chip
                    key={p.valor}
                    selecionado={tem(p.valor)}
                    onClick={() => alternar(p.valor)}
                  >
                    {p.rotulo}
                  </Chip>
                ))}
              </div>
            </fieldset>
          </div>
          <div className="flex flex-col gap-2">
            <span className="t-rotulo text-texto-fraco">
              Como fica no artigo
            </span>
            <BlocoDoArtigo no={{ type: 'composerCard', attrs }} />
          </div>
        </div>
      )}
    </FolhaDoEditor>
  );
}
