'use client';

import { useState } from 'react';
import { PiFlag } from 'react-icons/pi';
import toast from 'react-hot-toast';
import { Button } from '@/app/components/ui/Button';
import { Sheet } from '@/app/components/ui/Sheet';
import { cx } from '@/app/components/ui/cx';
import { useEsboco } from './pecas';

/**
 * Reportar (06/10, 2ª rodada): o botão fica à vista, ao lado do compartilhar.
 * Os motivos são os do `ReportModal` de hoje; "Outros" pede a descrição.
 * Sem conta, abre o entrar — o report leva o nome de quem enviou.
 */

const MOTIVOS = [
  {
    id: 'false_information',
    rotulo: 'Informação errada',
    texto: 'Data, local, obra ou foto que não confere',
  },
  {
    id: 'inappropriate_content',
    rotulo: 'Conteúdo inadequado',
    texto: 'Ofensivo ou impróprio',
  },
  {
    id: 'copyright_violation',
    rotulo: 'Direitos autorais',
    texto: 'Material protegido usado sem autorização',
  },
  {
    id: 'duplicate_content',
    rotulo: 'Duplicado',
    texto: 'Já existe outra página para isto',
  },
  { id: 'spam', rotulo: 'Spam', texto: 'Repetitivo ou sem relação' },
  { id: 'other', rotulo: 'Outros', texto: 'Conte o que aconteceu' },
];

export function BotaoReportar({ alvo }: { alvo: string }) {
  const { logado, abrirEntrar } = useEsboco();
  const [aberto, setAberto] = useState(false);
  const [motivo, setMotivo] = useState<string | null>(null);
  const [texto, setTexto] = useState('');
  const pedeTexto = motivo === 'other';
  const pronto = !!motivo && (!pedeTexto || texto.trim().length > 0);

  const fechar = () => {
    setAberto(false);
    setMotivo(null);
    setTexto('');
  };

  return (
    <>
      <Button
        icone={PiFlag}
        onClick={() => (logado ? setAberto(true) : abrirEntrar())}
      >
        Reportar
      </Button>
      <Sheet
        aberto={aberto}
        aoFechar={fechar}
        titulo={`Reportar ${alvo}`}
        descricao="A equipe lê cada report. Se você estiver certo, a página é corrigida e você recebe um aviso."
        largura="p"
        rodape={
          <div className="flex justify-end gap-2">
            <Button variante="fantasma" onClick={fechar}>
              Cancelar
            </Button>
            <Button
              variante="primario"
              disabled={!pronto}
              onClick={() => {
                fechar();
                toast.success('Report enviado. Obrigado por avisar.');
              }}
            >
              Enviar report
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-5">
          <fieldset className="flex flex-col gap-2">
            <legend className="t-rotulo mb-2">O que está errado?</legend>
            {MOTIVOS.map((m) => (
              <label
                key={m.id}
                className={cx(
                  'flex min-h-[var(--alvo)] items-center gap-3 rounded-controle px-3 py-2',
                  motivo === m.id ? 'tint-ouro text-ouro-na-tinta' : 'bg-sup-2'
                )}
              >
                <input
                  type="radio"
                  name="motivo-report"
                  checked={motivo === m.id}
                  onChange={() => setMotivo(m.id)}
                  className="accent-[var(--ouro)]"
                />
                <span className="flex flex-col">
                  <span className="t-rotulo">{m.rotulo}</span>
                  <span className="t-legenda">{m.texto}</span>
                </span>
              </label>
            ))}
          </fieldset>
          <label className="flex flex-col gap-1.5">
            <span className="t-rotulo">
              Detalhes{' '}
              <span className="text-texto-fraco">
                {pedeTexto ? '(obrigatório)' : '(opcional)'}
              </span>
            </span>
            <textarea
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              rows={3}
              className="input-classical w-full rounded-controle px-4 py-3 text-base"
              placeholder="Ex.: a data de nascimento certa é 22 de fevereiro."
            />
          </label>
          <p className="t-legenda">
            Report falso de propósito pode suspender a conta.
          </p>
        </div>
      </Sheet>
    </>
  );
}
