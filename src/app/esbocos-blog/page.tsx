import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Stack } from '@/app/components/ui/Layout';
import { Text } from '@/app/components/ui/Text';
import { ARTIGOS, VISTAS, rota, type EsbocoId } from './dados';

export const metadata: Metadata = {
  title: 'Esboços do blog',
  robots: 'noindex, nofollow',
};

const ESBOCOS: {
  id: EsbocoId;
  nome: string;
  ideia: string;
  bom: string;
  custo: string;
}[] = [
  {
    id: 'a',
    nome: 'Primeira página',
    ideia:
      'O blog como a capa de um periódico: uma matéria principal escolhida, duas secundárias, os mais lidos ao lado. Os últimos vêm em linhas com miniatura e a agenda da semana fica fixa na lateral. O artigo é uma coluna de 720px com o sumário acompanhando à direita.',
    bom: 'Hierarquia editorial clara: quem chega sabe o que ler primeiro. Mostra muito sem rolar, e o formato é conhecido.',
    custo:
      'O mais parecido com qualquer revista. A página principal pede alguém escolhendo o destaque.',
  },
  {
    id: 'b',
    nome: 'Caderno',
    ideia:
      'O blog como o sumário de uma enciclopédia: um índice por mês, numa coluna, com o dia à esquerda e o título em serifada grande. A capa existe em todo artigo, pequena, ao lado. No artigo, autor, sumário, ouvir e compartilhar moram na margem, e o texto abre com capitular.',
    bom: 'O que mais tem a cara do Opus Atlas. O mais leve, o melhor para ler, e o que menos sofre quando um artigo fica sem capa.',
    custo:
      'Menos atraente para quem só passa o olho. As capas perdem o protagonismo.',
  },
  {
    id: 'c',
    nome: 'Atlas',
    ideia:
      'O blog como galeria do acervo: mosaico com o título sobre a capa, prateleira dos últimos, uma composição por assunto. No artigo, a capa abre a página de ponta a ponta e a lateral mostra, com retrato, o que o texto cita da enciclopédia.',
    bom: 'O mais visual, e o que mais liga o blog ao catálogo. As pinturas e os retratos aparecem grandes.',
    custo:
      'O mais pesado para carregar e o que mais depende de capa boa em todo artigo. Título sobre foto pede um véu, e o véu escurece a imagem.',
  },
];

export default function Page() {
  if (process.env.NODE_ENV === 'production') notFound();

  return (
    <main className="min-h-dvh bg-fundo px-4 py-16 text-texto sm:px-6">
      <Stack gap={12} className="mx-auto max-w-[var(--largura-conteudo)]">
        <Stack gap={3}>
          <Text papel="titulo" as="h1">
            Três blogs
          </Text>
          <Text papel="corpo" tom="suave" medida>
            Os três têm os mesmos {ARTIGOS.length} artigos de exemplo, a mesma
            agenda e as mesmas peças novas: corpo do artigo renderizado no
            servidor, sumário, &ldquo;Neste artigo&rdquo;, páginas de assunto e
            de autor, ouvir o artigo, música por escolha, newsletter e RSS. Em
            cada um há quatro telas (início, artigo, lista e agenda); a barra no
            pé da página troca de esboço sem sair da tela em que você está.
            Troque de tema e estreite a janela: os três foram feitos para os
            dois temas e para o telefone.
          </Text>
          <Text papel="rotulo" tom="suave" as="p" medida>
            Categoria não tem mais cor nem emoji. Dois artigos estão sem capa de
            propósito (um sem imagem, um com a imagem quebrada) para mostrar a
            capa de reserva: procure &ldquo;Do largo ao presto&rdquo; e
            &ldquo;Por onde começar em Villa-Lobos&rdquo;.
          </Text>
        </Stack>

        <ol className="grid gap-4 lg:grid-cols-3">
          {ESBOCOS.map((e) => (
            <li key={e.id} className="sup-1 flex flex-col gap-4 p-6">
              <span className="flex items-baseline gap-3">
                <span className="font-display text-3xl uppercase text-ouro-texto">
                  {e.id}
                </span>
                <span className="t-subtitulo">{e.nome}</span>
              </span>
              <Text papel="rotulo" as="p">
                {e.ideia}
              </Text>
              <dl className="flex flex-col gap-3 rounded-controle bg-sup-2 p-4">
                <div>
                  <dt className="t-legenda">A favor</dt>
                  <dd className="t-rotulo text-texto-suave">{e.bom}</dd>
                </div>
                <div>
                  <dt className="t-legenda">Contra</dt>
                  <dd className="t-rotulo text-texto-suave">{e.custo}</dd>
                </div>
              </dl>
              <ul className="mt-auto flex flex-wrap gap-2">
                {VISTAS.map((v) => (
                  <li key={v.id}>
                    <Link
                      href={rota(e.id, v.id)}
                      className="inline-flex min-h-[var(--alvo)] items-center rounded-controle border border-linha-forte px-4 text-[0.9375rem] font-medium transition-[border-color,color] duration-[var(--t-resposta)] ease-saida fundo-sup-2 hover:border-ouro/50 hover:text-ouro-texto"
                    >
                      {v.rotulo}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </Stack>
    </main>
  );
}
