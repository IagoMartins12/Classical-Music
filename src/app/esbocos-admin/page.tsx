import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Stack } from '@/app/components/ui/Layout';
import { Text } from '@/app/components/ui/Text';
import { NAVEGACAO } from './dados';

export const metadata: Metadata = {
  title: 'Esboços do painel',
  robots: 'noindex, nofollow',
};

const ESBOCOS = [
  {
    id: 'a',
    nome: 'Índice lateral',
    ideia:
      'Lateral fixa com os nove assuntos, recolhíveis, e ⌘K para ir direto. O painel é uma mesa: números numa faixa, o que pede atenção, o sistema, a semana.',
    bom: 'O mais previsível. É a casca que o ROADMAP já prevê para o painel (janela inteira, lateral fixa, densidade máxima).',
    custo:
      'O mais parecido com qualquer painel. Com os 33 lugares abertos, a lateral fica longa.',
  },
  {
    id: 'b',
    nome: 'Trilho e fila',
    ideia:
      'Trilho de ícones com os assuntos e, ao lado, só as páginas do assunto aberto. O painel é uma fila de trabalho, com a coluna de pulso à direita.',
    bom: 'Poucas páginas à vista de cada vez; o painel diz o que fazer, não só o que aconteceu. No telefone vira barra embaixo, como aplicativo.',
    custo:
      'Duas colunas de navegação comem 300px. Ícone sozinho no trilho pede memória (o nome aparece ao passar).',
  },
  {
    id: 'c',
    nome: 'Topo editorial',
    ideia:
      'A casca da (main): barra do site no topo, conteúdo em 1.280px, Garamond nos títulos. Cada assunto abre um menu com as páginas e o que mora nelas.',
    bom: 'O painel vira parte do Opus Atlas, não outro produto. O boletim conta a semana numa frase; é o mais agradável de abrir.',
    custo:
      'Menos denso: tabelas largas ficam limitadas a 1.280px. Trocar de página sempre passa por um menu ou pelo ⌘K.',
  },
];

export default function Page() {
  if (process.env.NODE_ENV === 'production') notFound();

  const paginas = NAVEGACAO.reduce((s, g) => s + g.itens.length, 0);

  return (
    <main className="min-h-dvh bg-fundo px-4 py-16 text-texto sm:px-6">
      <Stack gap={12} className="mx-auto max-w-[var(--largura-conteudo)]">
        <Stack gap={3}>
          <Text papel="titulo" as="h1">
            Três painéis
          </Text>
          <Text papel="corpo" tom="suave" medida>
            Os três têm a mesma navegação: {paginas} lugares em nove assuntos,
            cobrindo as 27 páginas de /admin e as do admin do blog, com os
            mesmos endereços. Em cada um, abra Painel e Catálogo › Obras para
            ver uma tela de verdade. Troque de tema e estreite a janela: os três
            foram feitos para os dois temas e para o telefone.
          </Text>
        </Stack>

        <ol className="grid gap-4 lg:grid-cols-3">
          {ESBOCOS.map((e) => (
            <li key={e.id}>
              <Link
                href={`/esbocos-admin/${e.id}`}
                className="sup-1 flex h-full flex-col gap-4 p-6 transition-[transform,box-shadow] duration-[var(--t-resposta)] ease-saida hover:-translate-y-[3px] hover:shadow-[var(--sombra-2)] motion-reduce:hover:translate-y-0"
              >
                <span className="flex items-baseline gap-3">
                  <span className="font-display text-3xl uppercase text-ouro-texto">
                    {e.id}
                  </span>
                  <span className="t-subtitulo">{e.nome}</span>
                </span>
                <Text papel="rotulo" as="p">
                  {e.ideia}
                </Text>
                <dl className="mt-auto flex flex-col gap-3 rounded-controle bg-sup-2 p-4">
                  <div>
                    <dt className="t-legenda">A favor</dt>
                    <dd className="t-rotulo text-texto-suave">{e.bom}</dd>
                  </div>
                  <div>
                    <dt className="t-legenda">Contra</dt>
                    <dd className="t-rotulo text-texto-suave">{e.custo}</dd>
                  </div>
                </dl>
              </Link>
            </li>
          ))}
        </ol>
      </Stack>
    </main>
  );
}
