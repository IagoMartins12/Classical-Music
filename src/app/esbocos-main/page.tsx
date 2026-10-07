import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Stack } from '@/app/components/ui/Layout';
import { Text } from '@/app/components/ui/Text';
import { TELAS, rota, type EsbocoId } from './dados';

export const metadata: Metadata = {
  title: 'Esboços da main',
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
    nome: 'Programa de concerto',
    ideia:
      'O site como uma revista de música. A home abre como a página dupla de um programa: o compositor do dia em retrato inteiro, a busca logo abaixo, e cada seção uma página com uma ideia só — quem nasceu hoje, a obra do dia como partitura em pé, as épocas, coleções e concertos, os mais procurados. Compositor e obra são perfis de revista: retrato que acompanha a rolagem, capitular na biografia, as partituras agrupadas como no site.',
    bom: 'O que mais tem a cara do Opus Atlas e o mais bonito de abrir. Retrato e Garamond em tamanho de capa fazem a enciclopédia parecer uma publicação, não um banco de dados — e é o que mais conteúdo indexável põe na home.',
    custo:
      'O mais longo de rolar. Quem chega querendo uma partitura precisa da busca, que divide o topo com o compositor do dia.',
  },
  {
    id: 'b',
    nome: 'Atlas',
    ideia:
      'O nome ao pé da letra: um mapa do tempo. A home abre numa linha do tempo de 1600 a hoje com os rostos no ano em que nasceram; tocar num rosto estica a vida dele sobre as épocas. O compositor vira uma vida desenhada — obras por ano, os marcos, os contemporâneos lado a lado — e a obra aparece no ponto da vida em que foi escrita. A busca é uma paleta (⌘K) de qualquer lugar.',
    bom: 'O mais original e o que ensina sem texto: a linha do tempo mostra quem foi contemporâneo de quem. Tem o "momento" que ninguém mais tem, e casa com a história da música.',
    custo:
      'A linha do tempo rola de lado no telefone e pede dado limpo (datas e épocas — hoje há Wagner como "Clássico"). É o mais trabalhoso de construir.',
  },
  {
    id: 'c',
    nome: 'Estante',
    ideia:
      'A busca é o produto. A home é um campo grande que já responde enquanto se digita — compositor, obra, partitura, artigo — com atalhos do que mais se procura; abaixo, prateleiras que rolam de lado, e para quem entrou a primeira é a dela. Compositor e obra são telas de aplicativo: abas, a primeira página da partitura em destaque, trocando de arquivo com um toque. No telefone, abas embaixo.',
    bom: 'O mais rápido para quem chega do Google atrás de uma partitura e o mais familiar para quem usa aplicativo. É o que o app nativo herdaria quase sem mudar.',
    custo:
      'O menos editorial: a enciclopédia vira catálogo, e a home diz menos sobre música. As prateleiras pedem números ao vivo (as mais estudadas).',
  },
];

const ACHADOS = [
  'Villa-Lobos está cadastrado como americano. Ernesto Nazareth não está no banco (só um "Diniz Nazareth", sem foto e sem obras).',
  'Instrumentos mal mapeados: violoncelo tem só 1.141 obras e contrabaixo 5.169 — o "baixo contínuo" do IMSLP parece cair em contrabaixo. "Soprano", "Voz" e "Vocal" estão separados.',
  'A história da música tem texto para 6 épocas, mas o banco tem 7: "Contemporâneo" (2.627 compositores) não tem capítulo, e "Modernismo" aparece como "1900–presente".',
  'As "descobertas aleatórias" não são aleatórias: a API devolve os primeiros por ordem alfabética (Abbiate, Abel, Aadler…).',
  'As "últimas adições" não filtram nada: um compositor "Demon slayer / Kimetsu no yaiba" aparece na home. Pede ficha mínima e nenhuma denúncia aberta.',
  'As 300 curiosidades usam emoji como ícone (🦻, ☕) — proibido no design system; o ícone passa a vir do tipo.',
  'A contagem de downloads das partituras está vazia em todas (116 de 116 nos Noturnos): "mais baixadas" não existe hoje. Os esboços usam "mais estudadas".',
  'Dificuldade não é confiável: Estudos Op. 10 de Chopin e Noturnos Op. 9 estão como "iniciante". Aparece como "estimado".',
  'Instrumentação vem crua do IMSLP ("Title suggests for Violoncelo ou Piano"); instrumentos do Chopin como "Piano, Violin, Viola, Flute, Cello, Harp, Organ".',
  'Épocas erradas nos famosos (Wagner "Clássico", Ravel "Romântico"); datas em três formatos; "sem foto" do IMSLP gravado como retrato.',
  '3.442 compositores sem nacionalidade; pintores e escritores no cadastro (Frans Floris, Pierre Corneille); Asola duplicado.',
  'A busca não pesa popularidade: "Nocturnes Op.9" traz Marie Colin antes de Chopin.',
  'A home declara JSON-LD numa <meta> (o Google não lê), redes sociais que não existem, um SearchAction para /search (que não existe) e um "Course" inventado.',
];

const NUMEROS_REAIS = [
  ['Compositores com biografia', '3,4%'],
  ['com retrato de verdade', '70,5%'],
  ['com data de nascimento', '96,8%'],
  ['com a ficha básica completa', '2,9% (559)'],
  ['Obras com ano de composição', '37%'],
  ['com Spotify · YouTube', '5,8% · 1,7%'],
  ['com videoaula · áudio', '1 obra · 0,1%'],
  ['com gênero e link do IMSLP', '~100%'],
];

export default function Page() {
  if (process.env.NODE_ENV === 'production') notFound();

  return (
    <main className="min-h-dvh bg-fundo px-4 py-16 text-texto sm:px-6">
      <Stack gap={12} className="mx-auto max-w-[var(--largura-catalogo)]">
        <Stack gap={3}>
          <Text papel="titulo" as="h1">
            Três mains
          </Text>
          <Text papel="corpo" tom="suave" medida>
            Os três usam os mesmos dados, quase todos reais (do banco local):
            Chopin, os Noturnos Op. 9 com as miniaturas do IMSLP, quem nasceu e
            morreu em 1º de outubro. Marina é a pessoa de exemplo. Cada esboço
            tem a home, compositor, obra, busca, o dia, coleção, a página
            Ensino, as seis páginas pessoais, as páginas de link de e-mail, 404
            e acesso negado.
          </Text>
          <Text papel="rotulo" tom="suave" as="p" medida>
            A página nasce do que existe. Quase todo compositor e quase toda
            obra do acervo têm pouca coisa — por isso cada esboço mostra duas
            fichas: a completa (Chopin, Noturnos Op. 9) e a típica (Pierre
            Baillot, sem biografia; Caprichos Op. 2, sem ano, sem gravação e com
            as partituras ainda chegando do IMSLP). Seção sem dado não aparece;
            o que falta vira convite para completar, com XP.
          </Text>
          <dl className="grid max-w-[var(--largura-conteudo)] grid-cols-2 gap-x-8 gap-y-2 sm:grid-cols-4">
            {NUMEROS_REAIS.map(([t, v]) => (
              <div key={t} className="flex flex-col">
                <dt className="t-legenda">{t}</dt>
                <dd className="t-dado text-texto">{v}</dd>
              </div>
            ))}
          </dl>
          <Text papel="rotulo" tom="suave" as="p" medida>
            A barra no pé troca de esboço sem sair da tela, alterna visitante e
            logada, e em &ldquo;Todas as telas&rdquo; abre entrar (o erro do
            login só no toast), as boas-vindas e a conquista ao vivo. O
            compartilhar está nas páginas de compositor e obra. Troque o tema e
            estreite a janela.
          </Text>
        </Stack>

        <ol className="grid grid-cols-1 gap-4 lg:grid-cols-3">
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
              <div className="mt-auto flex flex-col gap-3">
                {(['Público', 'Seu', 'Sistema'] as const).map((g) => (
                  <div key={g} className="flex flex-col gap-1.5">
                    <span className="t-legenda">
                      {g === 'Seu' ? 'Pessoais' : g}
                    </span>
                    <ul className="flex flex-wrap gap-x-4 gap-y-1">
                      {TELAS.filter((t) => t.grupo === g).map((t) => (
                        <li key={t.id}>
                          <Link
                            href={rota(e.id, t.id)}
                            className="inline-flex min-h-9 items-center text-[0.9375rem] text-texto-suave underline decoration-transparent underline-offset-4 transition-colors hover:text-ouro-texto hover:decoration-ouro/60"
                          >
                            {t.rotulo}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </li>
          ))}
        </ol>

        <Stack gap={4}>
          <Text papel="subtitulo" as="h2">
            Achados no caminho
          </Text>
          <Text papel="rotulo" tom="suave" as="p" medida>
            Defeitos de dado e de SEO que apareceram ao montar os esboços com
            dados reais. Nenhum depende do esboço escolhido.
          </Text>
          <ul className="flex max-w-[var(--largura-conteudo)] flex-col divide-y divide-[var(--linha)]">
            {ACHADOS.map((a) => (
              <li key={a} className="t-rotulo py-3 text-texto-suave">
                {a}
              </li>
            ))}
          </ul>
        </Stack>
      </Stack>
    </main>
  );
}
