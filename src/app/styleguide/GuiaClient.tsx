'use client';

import { useState } from 'react';
import {
  PiCheck,
  PiMagnifyingGlass,
  PiMusicNotes,
  PiTrash,
  PiUploadSimple,
} from 'react-icons/pi';
import {
  Badge,
  Button,
  Card,
  Chip,
  Container,
  Erro,
  Field,
  Icon,
  Inline,
  Row,
  Sheet,
  Skeleton,
  Stack,
  Text,
  Vazio,
} from '@/app/components/ui';

/**
 * O guia vivo: todos os primitivos, com conteúdo de verdade do catálogo.
 *
 * Tem um botão de tema próprio porque a validação mais importante é essa —
 * o mesmo componente lendo outras variáveis, sem nenhuma segunda versão.
 */
export function GuiaClient() {
  const [tema, setTema] = useState<'dark' | 'light'>('dark');
  const [epoca, setEpoca] = useState('Clássico');
  const [folhaAberta, setFolhaAberta] = useState(false);
  const [ano, setAno] = useState('18o1');

  function trocarTema() {
    const proximo = tema === 'dark' ? 'light' : 'dark';
    setTema(proximo);
    document.documentElement.setAttribute('data-theme', proximo);
  }

  return (
    <main className="min-h-[100dvh] bg-fundo py-12">
      <Container largura="catalogo">
        <Stack gap={12}>
          <Stack gap={4}>
            <Inline extremos alinhar="fim" quebra gap={4}>
              <Stack gap={2}>
                <Text papel="display">Sistema de design</Text>
                <Text papel="corpo" tom="suave" medida>
                  Os primitivos da fase 2, com a fundação da fase 1 por baixo.
                  Troque o tema: é o mesmo componente lendo outras variáveis.
                </Text>
              </Stack>
              <Button variante="secundario" onClick={trocarTema}>
                Tema: {tema === 'dark' ? 'escuro' : 'claro'}
              </Button>
            </Inline>
          </Stack>

          <Secao titulo="Tipografia" nota="Sete degraus. O corpo é 17px.">
            <Card>
              <Stack gap={3}>
                <Text papel="display">Beethoven</Text>
                <Text papel="titulo">Obras para piano</Text>
                <Text papel="subtitulo">Sonata ao Luar</Text>
                <Text papel="secao">Partituras disponíveis</Text>
                <Text papel="corpo" medida>
                  Até o início do século XVIII o violoncelo carregava a linha do
                  baixo e quase nunca saía dela. As seis suítes mudam essa
                  função de uma vez.
                </Text>
                <Text papel="rotulo" tom="suave">
                  Rótulo de campo, coluna de tabela
                </Text>
                <Text papel="legenda">Nota de rodapé, crédito, metadado</Text>
                <Text papel="corpo" dado>
                  BWV 1007 · op. 27 n.º 2 · 1801 · 18 min
                </Text>
              </Stack>
            </Card>
          </Secao>

          <Secao
            titulo="Superfícies"
            nota="Três níveis, um ângulo só, sempre opacas."
          >
            <div className="grid gap-4 sm:grid-cols-3">
              <Card nivel={1}>
                <Text papel="secao">Nível 1</Text>
                <Text papel="legenda">Card de obra, de aula, de artigo</Text>
              </Card>
              <Card nivel={2}>
                <Text papel="secao">Nível 2</Text>
                <Text papel="legenda">Barra, painel, lateral fixa</Text>
              </Card>
              <Card nivel="alta">
                <Text papel="secao">Elevada</Text>
                <Text papel="legenda">Diálogo, menu, aviso</Text>
              </Card>
            </div>
          </Secao>

          <Secao
            titulo="Card de obra"
            nota="Passe o cursor: 180ms, 3px, sem escala."
          >
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Card clicavel>
                <Stack gap={4}>
                  <Inline extremos alinhar="inicio" gap={3}>
                    <Stack gap={1}>
                      <Text papel="subtitulo">Sonata ao Luar</Text>
                      <Text papel="rotulo" tom="suave">
                        Ludwig van Beethoven
                      </Text>
                    </Stack>
                    <Badge estado="ouro" icone={PiCheck}>
                      Verificada
                    </Badge>
                  </Inline>
                  <div className="h-px bg-[var(--linha)]" />
                  <Inline gap={4} quebra>
                    <Text papel="legenda" dado>
                      op. 27 n.º 2
                    </Text>
                    <Text papel="legenda" dado>
                      1801
                    </Text>
                    <Text papel="legenda" tom="suave">
                      2 partituras
                    </Text>
                  </Inline>
                </Stack>
              </Card>

              <Card clicavel>
                <Stack gap={4}>
                  <Stack gap={1}>
                    <Text papel="subtitulo">Noturno em mi bemol</Text>
                    <Text papel="rotulo" tom="suave">
                      Frédéric Chopin
                    </Text>
                  </Stack>
                  <div className="h-px bg-[var(--linha)]" />
                  <Inline gap={4} quebra>
                    <Text papel="legenda" dado>
                      op. 9 n.º 2
                    </Text>
                    <Text papel="legenda" dado>
                      1832
                    </Text>
                  </Inline>
                </Stack>
              </Card>

              <Card.Skeleton />
            </div>
          </Secao>

          <Secao
            titulo="Botões"
            nota="Uma ação principal por tela. 44px de alvo."
          >
            <Card>
              <Stack gap={4}>
                <Inline gap={2} quebra>
                  <Button variante="primario" icone={PiUploadSimple}>
                    Enviar partitura
                  </Button>
                  <Button variante="secundario">Ver partituras</Button>
                  <Button variante="fantasma">Cancelar</Button>
                  <Button variante="perigo" icone={PiTrash}>
                    Remover
                  </Button>
                </Inline>
                <Inline gap={2} quebra>
                  <Button variante="primario" carregando>
                    Salvando
                  </Button>
                  <Button variante="primario" disabled>
                    Indisponível
                  </Button>
                  <Button variante="secundario" tamanho="p">
                    Denso
                  </Button>
                  <Button
                    variante="secundario"
                    icone={PiMagnifyingGlass}
                    rotulo="Buscar"
                  />
                </Inline>
              </Stack>
            </Card>
          </Secao>

          <Secao titulo="Campos" nota="Rótulo, ajuda e erro sempre juntos.">
            <div className="grid gap-4 sm:grid-cols-2">
              <Card>
                <Stack gap={4}>
                  <Field
                    label="Buscar obra"
                    ajuda="Busca por título, catálogo ou compositor."
                    placeholder="Sonata, BWV 1007, Chopin..."
                  />
                  <Field
                    label="Ano de composição"
                    value={ano}
                    onChange={(e) => setAno(e.target.value)}
                    erro={
                      /^\d{4}$/.test(ano)
                        ? undefined
                        : 'Use quatro dígitos, como 1801.'
                    }
                  />
                </Stack>
              </Card>
              <Card>
                <Stack gap={4}>
                  <Field.Selecao label="Época" defaultValue="Clássico">
                    <option>Barroco</option>
                    <option>Clássico</option>
                    <option>Romântico</option>
                  </Field.Selecao>
                  <Field.Area
                    label="Observações"
                    ajuda="Aparece na ficha da obra."
                    placeholder="Edição revisada por..."
                  />
                </Stack>
              </Card>
            </div>
          </Secao>

          <Secao
            titulo="Etiquetas e selos"
            nota="O chip marca escolha; o selo marca estado."
          >
            <Card>
              <Stack gap={4}>
                <Inline gap={2} quebra>
                  {[
                    'Medieval',
                    'Barroco',
                    'Clássico',
                    'Romântico',
                    'Moderno',
                  ].map((nome) => (
                    <Chip
                      key={nome}
                      selecionado={epoca === nome}
                      onClick={() => setEpoca(nome)}
                    >
                      {nome}
                    </Chip>
                  ))}
                </Inline>
                <Inline gap={2} quebra>
                  <Badge estado="ok">Partitura livre</Badge>
                  <Badge estado="atencao">Em revisão</Badge>
                  <Badge estado="aviso">Domínio público</Badge>
                  <Badge estado="erro">Denunciada</Badge>
                  <Badge estado="neutro">Sem partitura</Badge>
                </Inline>
              </Stack>
            </Card>
          </Secao>

          <Secao
            titulo="Linhas"
            nota="A densidade alta: uma superfície, várias linhas."
          >
            <Row.Lista>
              <Row
                clicavel
                titulo="Helena Vasconcelos"
                detalhe="Suíte n.º 1, prelúdio"
                valor="4 de 4 tarefas"
              />
              <Row
                clicavel
                titulo="Rafael Okonkwo"
                detalhe="Noturno op. 9 n.º 2"
                valor="2 de 4 tarefas"
              />
              <Row
                clicavel
                titulo="Marina Yamashita"
                detalhe="Invenção BWV 772"
                valor="1 de 4 tarefas"
              />
              <Row.Skeleton repetir={1} />
            </Row.Lista>
          </Secao>

          <Secao
            titulo="Vazio, erro e folha"
            nota="Os estados que quase não existem hoje."
          >
            <div className="grid gap-4 lg:grid-cols-3">
              <Vazio
                icone={PiMusicNotes}
                titulo="Nenhuma obra neste filtro"
                descricao="1.412 obras do período existem sem partitura cadastrada."
                acao={
                  <>
                    <Button variante="primario" tamanho="p">
                      Enviar partitura
                    </Button>
                    <Button variante="fantasma" tamanho="p">
                      Remover filtro
                    </Button>
                  </>
                }
              />
              <Erro
                titulo="Não foi possível carregar as obras"
                descricao="A conexão com o catálogo caiu no meio da busca. Seus filtros foram mantidos."
                acao={
                  <Button variante="secundario" tamanho="p">
                    Tentar de novo
                  </Button>
                }
              />
              <Card>
                <Stack gap={3}>
                  <Text papel="secao">Folha</Text>
                  <Text papel="legenda">
                    No telefone sobe de baixo; no desktop, diálogo centrado.
                  </Text>
                  <Button
                    variante="secundario"
                    onClick={() => setFolhaAberta(true)}
                  >
                    Abrir
                  </Button>
                </Stack>
              </Card>
            </div>
          </Secao>

          <Secao titulo="Esqueleto" nota="As medidas do componente de verdade.">
            <Card>
              <Stack gap={3}>
                <Skeleton className="h-5 w-[40%]" />
                <Skeleton className="w-[70%]" />
                <Skeleton className="w-[55%]" />
                <Inline gap={2}>
                  <Skeleton forma="bloco" className="h-9 w-28" />
                  <Skeleton forma="bloco" className="h-9 w-28" />
                </Inline>
              </Stack>
            </Card>
          </Secao>

          <Secao titulo="Ícone" nota="Quatro tamanhos, traço 1.5.">
            <Card>
              <Inline gap={6}>
                <Icon de={PiMusicNotes} tamanho="pp" />
                <Icon de={PiMusicNotes} tamanho="p" />
                <Icon de={PiMusicNotes} tamanho="m" />
                <Icon de={PiMusicNotes} tamanho="g" />
                <Text papel="legenda">
                  A família única entra na fase 3, por codemod.
                </Text>
              </Inline>
            </Card>
          </Secao>
        </Stack>
      </Container>

      <Sheet
        aberto={folhaAberta}
        aoFechar={() => setFolhaAberta(false)}
        titulo="Enviar partitura"
        descricao="A obra entra como não verificada até a curadoria conferir."
        rodape={
          <>
            <Button variante="fantasma" onClick={() => setFolhaAberta(false)}>
              Cancelar
            </Button>
            <Button variante="primario" onClick={() => setFolhaAberta(false)}>
              Enviar
            </Button>
          </>
        }
      >
        <Stack gap={4}>
          <Field label="Título" placeholder="Suíte para violoncelo n.º 1" />
          <Field label="Catálogo" placeholder="BWV 1007" />
          <Field.Area label="Fonte" ajuda="De onde veio esta edição." />
        </Stack>
      </Sheet>
    </main>
  );
}

function Secao({
  titulo,
  nota,
  children,
}: {
  titulo: string;
  nota: string;
  children: React.ReactNode;
}) {
  return (
    <Stack gap={4} as="section">
      <Stack gap={1}>
        <Text papel="titulo" as="h2">
          {titulo}
        </Text>
        <Text papel="legenda">{nota}</Text>
      </Stack>
      {children}
    </Stack>
  );
}
