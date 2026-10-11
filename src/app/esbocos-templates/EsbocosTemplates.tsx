'use client';

import { useState } from 'react';
import { PiDesktop, PiDeviceMobile, PiMoon, PiSun } from 'react-icons/pi';
import { chip } from '@/app/components/site/choice';
import { Icon } from '@/app/components/ui/Icon';
import { cx } from '@/app/components/ui/cx';
import { Carta, Ingresso, Partitura, type Props } from './direcoes';
import { EMAILS, REMETENTE } from './emails';
import { PALETAS, SANS, SELO, type Tema } from './paleta';

type Direcao = 'a' | 'b' | 'c';

const DIRECOES: {
  id: Direcao;
  nome: string;
  ideia: string;
  bom: string;
  custo: string;
  desenho: (p: Props) => React.ReactNode;
}[] = [
  {
    id: 'a',
    nome: 'O ingresso',
    ideia:
      'Cada e-mail é um ingresso: a mensagem em cima, uma linha picotada e um canhoto com o que vale guardar (valor, prazo, quem convidou). Nas boas-vindas, o canhoto traz os três caminhos para começar.',
    bom: 'O mais memorável e o que mais organiza: o dado importante tem lugar fixo, e um recibo de pagamento parece mesmo um comprovante.',
    custo:
      'O picote pede imagem ou truque de tabela para sair perfeito no Outlook; nos e-mails sem dado, o canhoto fica com pouco a dizer.',
    desenho: (p) => <Ingresso {...p} />,
  },
  {
    id: 'b',
    nome: 'A folha de partitura',
    ideia:
      'Cada e-mail é a primeira página de uma partitura: a pauta no alto, o título centralizado como o de uma obra, "Opus Atlas" creditado à direita como o compositor, os dados em compassos entre barras e a barra dupla que fecha a peça antes do rodapé.',
    bom: 'O que mais diz "música" sem ilustração nenhuma, só com linhas finas, e funciona igual em qualquer cliente.',
    custo:
      'Centralizado e cerimonioso: nos avisos curtos (senha, confirmação) a solenidade pode pesar mais que a mensagem.',
    desenho: (p) => <Partitura {...p} />,
  },
  {
    id: 'c',
    nome: 'A carta com selo',
    ideia:
      'Cada e-mail é uma carta da equipe: o selo e a data como papel timbrado, o texto em Garamond, a assinatura no fim e, nas boas-vindas, um P.S. com os caminhos para começar.',
    bom: 'O mais caloroso e o mais simples de manter: é praticamente texto, e o Gmail e o Outlook mostram quase igual ao desenho.',
    custo:
      'O menos marcante dos três; quem recebe muitos e-mails pode não reconhecer o Opus Atlas só pelo layout.',
    desenho: (p) => <Carta {...p} />,
  },
];

/** The inbox row: who sent it, the subject and the preview text. */
function Cabecalho({
  assunto,
  previa,
  tema,
}: {
  assunto: string;
  previa: string;
  tema: Tema;
}) {
  const p = PALETAS[tema];
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '14px 18px',
        background: tema === 'claro' ? '#ffffff' : '#13141c',
        borderBottom: `1px solid ${p.linha}`,
        fontFamily: SANS,
      }}
    >
      <span
        style={{
          display: 'grid',
          placeItems: 'center',
          width: 40,
          height: 40,
          flexShrink: 0,
          borderRadius: '50%',
          background: p.fora,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={SELO} alt="" width={30} height={31} />
      </span>
      <span style={{ minWidth: 0, flex: 1 }}>
        <span
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 8,
            fontSize: 13,
            color: p.suave,
          }}
        >
          <strong style={{ color: p.texto }}>{REMETENTE}</strong>
          <span>14:32</span>
        </span>
        <span
          style={{
            display: 'block',
            marginTop: 2,
            fontSize: 15,
            fontWeight: 600,
            color: p.texto,
          }}
        >
          {assunto}
        </span>
        <span
          style={{
            display: 'block',
            marginTop: 2,
            fontSize: 13,
            color: p.fraco,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {previa}
        </span>
      </span>
    </div>
  );
}

export function EsbocosTemplates() {
  const [direcao, setDirecao] = useState<Direcao>('a');
  const [emailId, setEmailId] = useState(EMAILS[0].id);
  const [celular, setCelular] = useState(false);
  const [tema, setTema] = useState<Tema>('escuro');
  const d = DIRECOES.find((x) => x.id === direcao)!;
  const e = EMAILS.find((x) => x.id === emailId)!;

  return (
    <div className="classical-theme pb-24">
      <div className="border-b border-linha">
        <div className="section-wrap flex flex-col gap-5 py-8">
          <h1 className="t-titulo">Esboços dos e-mails</h1>
          <div className="flex flex-wrap items-center gap-2">
            {DIRECOES.map((x) => (
              <button
                key={x.id}
                type="button"
                aria-pressed={direcao === x.id}
                onClick={() => setDirecao(x.id)}
                className={chip(direcao === x.id)}
              >
                {x.id.toUpperCase()} · {x.nome}
              </button>
            ))}
          </div>
          <dl className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {[
              ['A ideia', d.ideia],
              ['O que é bom', d.bom],
              ['O custo', d.custo],
            ].map(([t, v]) => (
              <div key={t}>
                <dt className="t-legenda">{t}</dt>
                <dd className="t-rotulo mt-1">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <div className="section-wrap mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[16rem_minmax(0,1fr)]">
        <nav
          aria-label="E-mails"
          className="flex flex-col gap-1 lg:sticky lg:top-24 lg:self-start"
        >
          <span className="t-legenda mb-2">E-mail</span>
          {EMAILS.map((x) => (
            <button
              key={x.id}
              type="button"
              aria-current={x.id === emailId || undefined}
              onClick={() => setEmailId(x.id)}
              className={cx(
                'flex flex-col items-start rounded-controle px-3 py-2 text-left transition-colors',
                x.id === emailId ? 'tint-ouro' : 'hover:bg-sup-2'
              )}
            >
              <span
                className={cx(
                  'text-[0.9375rem]',
                  x.id === emailId && 'text-ouro-na-tinta'
                )}
              >
                {x.nome}
              </span>
              <span className="t-legenda line-clamp-1">{x.assunto}</span>
            </button>
          ))}
          <div className="mt-6 flex flex-col gap-2">
            <span className="t-legenda">Ver em</span>
            <div className="flex gap-2">
              <button
                type="button"
                aria-pressed={!celular}
                onClick={() => setCelular(false)}
                className={chip(!celular)}
              >
                <Icon de={PiDesktop} tamanho="p" /> Computador
              </button>
              <button
                type="button"
                aria-pressed={celular}
                onClick={() => setCelular(true)}
                className={chip(celular)}
              >
                <Icon de={PiDeviceMobile} tamanho="p" /> Celular
              </button>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                aria-pressed={tema === 'claro'}
                onClick={() => setTema('claro')}
                className={chip(tema === 'claro')}
              >
                <Icon de={PiSun} tamanho="p" /> Claro
              </button>
              <button
                type="button"
                aria-pressed={tema === 'escuro'}
                onClick={() => setTema('escuro')}
                className={chip(tema === 'escuro')}
              >
                <Icon de={PiMoon} tamanho="p" /> Escuro
              </button>
            </div>
          </div>
        </nav>

        <div className="flex flex-col items-center gap-4">
          <div
            className="w-full overflow-hidden shadow-[var(--sombra-2)]"
            style={{
              maxWidth: celular ? 390 : 760,
              borderRadius: celular ? 36 : 14,
              border: celular ? '10px solid #050507' : undefined,
            }}
          >
            <Cabecalho assunto={e.assunto} previa={e.previa} tema={tema} />
            {d.desenho({ e, tema, celular })}
          </div>
          <p className="t-legenda max-w-[60ch] text-center">
            Nomes, datas e valores são de exemplo. Onde o cliente de e-mail não
            carrega fontes (Gmail, Outlook), o Garamond vira Georgia, como aqui
            pode acontecer.
          </p>
        </div>
      </div>
    </div>
  );
}
