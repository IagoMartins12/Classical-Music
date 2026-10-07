'use client';

import { useState } from 'react';
import {
  PiEnvelopeSimple,
  PiLightbulb,
  PiPencilSimpleLine,
  PiTextAlignLeft,
  PiYoutubeLogo,
  PiListBullets,
} from 'react-icons/pi';
import toast from 'react-hot-toast';
import { Button } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import { Sheet } from '@/app/components/ui/Sheet';
import { cx } from '@/app/components/ui/cx';
import { linkTexto, useEsboco } from './pecas';

/**
 * Completar a ficha (06/10): biografia, vídeo, curiosidade ou um dado da
 * ficha. Só com e-mail confirmado. Entra no ar na hora, com o nome de quem
 * enviou; moderação por denúncia (RN-4). O XP chega depois de 7 dias sem
 * denúncia procedente — evita a corrida por XP com conteúdo ruim.
 */

export type TipoContribuicao = 'bio' | 'video' | 'curiosidade' | 'dado';

const TIPOS: {
  id: TipoContribuicao;
  rotulo: string;
  icone: typeof PiLightbulb;
  xp: number;
}[] = [
  { id: 'bio', rotulo: 'Biografia', icone: PiTextAlignLeft, xp: 120 },
  { id: 'curiosidade', rotulo: 'Curiosidade', icone: PiLightbulb, xp: 30 },
  { id: 'video', rotulo: 'Vídeo', icone: PiYoutubeLogo, xp: 40 },
  { id: 'dado', rotulo: 'Dado da ficha', icone: PiListBullets, xp: 20 },
];

/** O portão: visitante entra; e-mail não confirmado confirma; confirmado contribui. */
export function useContribuir(alvo: string) {
  const { logado, verificado, abrirEntrar } = useEsboco();
  const [aberto, setAberto] = useState<TipoContribuicao | null>(null);
  const [aviso, setAviso] = useState(false);

  const abrir = (t: TipoContribuicao) => {
    if (!logado) return abrirEntrar();
    if (!verificado) return setAviso(true);
    setAberto(t);
  };

  const folhas = (
    <>
      <Sheet
        aberto={aviso}
        aoFechar={() => setAviso(false)}
        titulo="Confirme seu e-mail para contribuir"
        descricao="Biografias, curiosidades e vídeos aparecem para todo mundo com o seu nome — por isso pedimos o e-mail confirmado."
        largura="p"
        rodape={
          <div className="flex justify-end gap-2">
            <Button variante="fantasma" onClick={() => setAviso(false)}>
              Agora não
            </Button>
            <Button
              variante="primario"
              icone={PiEnvelopeSimple}
              onClick={() => {
                setAviso(false);
                toast.success('Enviamos o link para marina@exemplo.com');
              }}
            >
              Reenviar o e-mail
            </Button>
          </div>
        }
      >
        <p className="t-rotulo text-texto-suave">
          O link chegou em marina@exemplo.com. Não achou? Olhe o spam, ou
          reenvie.
        </p>
      </Sheet>
      <FolhaDeContribuicao
        tipo={aberto}
        alvo={alvo}
        aoTrocar={setAberto}
        aoFechar={() => setAberto(null)}
      />
    </>
  );

  return { abrir, folhas };
}

function FolhaDeContribuicao({
  tipo,
  alvo,
  aoTrocar,
  aoFechar,
}: {
  tipo: TipoContribuicao | null;
  alvo: string;
  aoTrocar: (t: TipoContribuicao) => void;
  aoFechar: () => void;
}) {
  const [texto, setTexto] = useState('');
  const atual = TIPOS.find((t) => t.id === tipo);
  const campo = 'input-classical w-full rounded-controle px-4 text-base';

  return (
    <Sheet
      aberto={!!tipo}
      aoFechar={aoFechar}
      titulo={`Completar ${alvo}`}
      descricao="Entra no ar na hora, com o seu nome. Se alguém denunciar e a equipe concordar, sai."
      largura="m"
      rodape={
        <div className="flex items-center justify-between gap-3">
          <span className="t-legenda">
            +{atual?.xp ?? 0} XP após 7 dias sem denúncia
          </span>
          <div className="flex gap-2">
            <Button variante="fantasma" onClick={aoFechar}>
              Cancelar
            </Button>
            <Button
              variante="primario"
              onClick={() => {
                aoFechar();
                setTexto('');
                toast.success('Publicado — obrigado!');
              }}
            >
              Publicar
            </Button>
          </div>
        </div>
      }
    >
      <div className="flex flex-col gap-5">
        <div
          role="tablist"
          aria-label="O que você quer acrescentar"
          className="grid grid-cols-2 gap-2 sm:grid-cols-4"
        >
          {TIPOS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tipo === t.id}
              onClick={() => aoTrocar(t.id)}
              className={cx(
                'flex min-h-16 flex-col items-start justify-center gap-1 rounded-card px-3 text-left',
                tipo === t.id
                  ? 'tint-ouro text-ouro-na-tinta'
                  : 'bg-sup-2 text-texto-suave hover:text-texto'
              )}
            >
              <Icon de={t.icone} tamanho="m" />
              <span className="text-[0.875rem]">{t.rotulo}</span>
            </button>
          ))}
        </div>

        {tipo === 'bio' && (
          <>
            <label className="flex flex-col gap-1.5">
              <span className="t-rotulo">Biografia em português</span>
              <textarea
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                rows={8}
                className={cx(campo, 'py-3')}
                placeholder="Quem foi, onde viveu, o que escreveu e por que importa. 3 a 5 parágrafos."
              />
              <span className="t-legenda">
                {texto.length} caracteres · as outras línguas são traduzidas e
                marcadas como “não revisadas” até alguém revisar.
              </span>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="t-rotulo">
                Fonte <span className="text-texto-fraco">(link ou livro)</span>
              </span>
              <input
                className={cx(campo, 'min-h-[var(--alvo)]')}
                placeholder="https://… ou Grove Music Online"
              />
            </label>
          </>
        )}
        {tipo === 'curiosidade' && (
          <>
            <label className="flex flex-col gap-1.5">
              <span className="t-rotulo">
                A curiosidade, em uma ou duas frases
              </span>
              <textarea
                rows={3}
                maxLength={280}
                className={cx(campo, 'py-3')}
                placeholder="Ex.: Deu só cerca de 30 concertos públicos na vida inteira."
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="t-rotulo">Fonte</span>
              <input
                className={cx(campo, 'min-h-[var(--alvo)]')}
                placeholder="Onde você leu isso?"
              />
            </label>
          </>
        )}
        {tipo === 'video' && (
          <>
            <label className="flex flex-col gap-1.5">
              <span className="t-rotulo">Link do YouTube</span>
              <input
                className={cx(campo, 'min-h-[var(--alvo)]')}
                placeholder="https://www.youtube.com/watch?v=…"
              />
            </label>
            <span className="t-legenda">
              Documentário, aula ou gravação. Vídeo seu tocando vai em “Já
              aprendi” da obra.
            </span>
          </>
        )}
        {tipo === 'dado' && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[
              'Data de nascimento',
              'Local de nascimento',
              'Data de morte',
              'Nacionalidade',
              'Ano de composição',
              'Tonalidade',
            ].map((c) => (
              <label key={c} className="flex flex-col gap-1.5">
                <span className="t-rotulo">{c}</span>
                <input className={cx(campo, 'min-h-[var(--alvo)]')} />
              </label>
            ))}
          </div>
        )}
      </div>
    </Sheet>
  );
}

/** O convite (compositor e obra): o que falta, como botões que já abrem o formulário certo. */
export function ConviteParaCompletar({
  falta,
  alvo,
  contribuir,
}: {
  falta: { rotulo: string; tipo: TipoContribuicao }[];
  alvo: string;
  contribuir: ReturnType<typeof useContribuir>;
}) {
  const { logado, verificado } = useEsboco();
  if (!falta.length) return null;
  return (
    <div className="flex flex-col gap-4 rounded-card bg-sup-2 p-5">
      <span className="flex items-start gap-3">
        <Icon
          de={PiPencilSimpleLine}
          tamanho="m"
          className="mt-0.5 shrink-0 text-ouro-texto"
        />
        <span className="flex flex-col gap-1">
          <span className="font-medium">Ajude a completar {alvo}</span>
          <span className="t-rotulo text-texto-suave">
            Falta {falta.map((f) => f.rotulo).join(', ')}. Cada informação
            aceita vale XP e aparece para todo mundo.
          </span>
        </span>
      </span>
      <div className="flex flex-wrap gap-2 pl-8">
        {falta.map((f) => (
          <Button
            key={f.rotulo}
            tamanho="p"
            onClick={() => contribuir.abrir(f.tipo)}
          >
            + {f.rotulo}
          </Button>
        ))}
      </div>
      {logado && !verificado && (
        <span className="pl-8 t-legenda">
          Precisa do e-mail confirmado.{' '}
          <button
            type="button"
            onClick={() => contribuir.abrir('bio')}
            className={cx('text-ouro-texto', linkTexto)}
          >
            Como confirmar
          </button>
        </span>
      )}
    </div>
  );
}
