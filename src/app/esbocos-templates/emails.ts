/**
 * O texto dos e-mails (onda 8, esboço). Escrito com as skills `copywriting`
 * e `impeccable`, conferido contra `Opus-atlas-api/src/mail/mail.service.ts`:
 * o link de confirmação vale 24 horas, o de nova senha vale uma hora, o
 * convite de aluno é o aviso do portal mandado por e-mail, e o retorno de
 * denúncia e o XP de contribuição são avisos novos da onda 7.
 *
 * Nomes, datas e valores são de exemplo. Assunto sem emoji e sem
 * "- Opus Atlas" (o remetente já diz quem é); uma ação por e-mail.
 */

export type Rodape = 'conta' | 'seguranca' | 'cobranca' | 'newsletter';

export interface Caminho {
  titulo: string;
  texto: string;
  link: string;
}

export interface Email {
  id: string;
  nome: string;
  assunto: string;
  /** O texto que aparece ao lado do assunto na caixa de entrada. */
  previa: string;
  titulo: string;
  paragrafos: string[];
  acao: { rotulo: string; dica?: string };
  /** Os dados que a pessoa pode querer conferir (valor, prazo, quem). */
  dados?: { rotulo: string; valor: string }[];
  /** Só no de boas-vindas: os caminhos, como links discretos. */
  caminhos?: Caminho[];
  /** Ilustração do topo, quando o e-mail pede uma. */
  imagem?: { src: string; alt: string; largura: number; altura: number };
  rodape: Rodape;
  /** Newsletter: as notas abaixo do artigo principal. */
  notas?: { rotulo: string; titulo: string; texto: string }[];
}

const GRAVURA_AULA = {
  src: '/illustrations/music-lesson.webp',
  alt: 'Gravura de uma aula de música, em traço dourado',
  largura: 1000,
  altura: 715,
};

export const EMAILS: Email[] = [
  {
    id: 'boas-vindas',
    nome: 'Boas-vindas',
    assunto: 'Sua estante no Opus Atlas está pronta',
    previa: 'Conte o que você toca e a sua conta fica com a sua cara.',
    titulo: 'Que bom ter você aqui, Marina',
    paragrafos: [
      'A partir de agora, o que você estuda fica guardado num lugar só: as obras que quer aprender, as que já aprendeu, as partituras que favoritou e as suas anotações nas margens.',
      'Comece pelo seu perfil. Leva um minuto e deixa claro o que você toca e há quanto tempo estuda.',
    ],
    acao: { rotulo: 'Completar meu perfil' },
    caminhos: [
      {
        titulo: 'Leia ouvindo',
        texto: 'Abra um compositor e escute a obra enquanto lê sobre ela.',
        link: 'Ver compositores',
      },
      {
        titulo: 'Monte a sua lista',
        texto:
          'Marque uma obra como "Quero estudar" e ela entra na sua estante.',
        link: 'Abrir meus estudos',
      },
      {
        titulo: 'Dê aula por aqui',
        texto: 'Se você ensina, o portal do professor acompanha cada aluno.',
        link: 'Conhecer o portal',
      },
    ],
    imagem: GRAVURA_AULA,
    rodape: 'conta',
  },
  {
    id: 'confirmar',
    nome: 'Confirmar conta',
    assunto: 'Confirme seu e-mail para começar',
    previa: 'Um toque no botão e a sua conta fica pronta.',
    titulo: 'Falta só confirmar que este e-mail é seu',
    paragrafos: [
      'Toque no botão para ativar a sua conta. Depois disso, favoritos, listas de estudo e anotações ficam guardados com você.',
    ],
    acao: {
      rotulo: 'Confirmar meu e-mail',
      dica: 'O link vale por 24 horas.',
    },
    rodape: 'seguranca',
  },
  {
    id: 'senha',
    nome: 'Nova senha',
    assunto: 'Seu link para criar uma nova senha',
    previa: 'Ele vale por uma hora.',
    titulo: 'Vamos criar uma senha nova',
    paragrafos: [
      'Recebemos um pedido para trocar a senha da sua conta. Toque no botão e escolha a nova.',
    ],
    acao: { rotulo: 'Criar nova senha', dica: 'O link vale por uma hora.' },
    rodape: 'seguranca',
  },
  {
    id: 'convite',
    nome: 'Convite de aluno',
    assunto: 'Helena Costa convidou você para a turma dela',
    previa: 'Aceite para ver as aulas e as tarefas que ela passar.',
    titulo: 'Helena quer acompanhar o seu estudo',
    paragrafos: [
      'Helena Costa dá aula pelo portal do professor do Opus Atlas e convidou você para a turma dela.',
      'Quando você aceitar, as aulas marcadas e as tarefas aparecem na sua conta, ao lado das partituras que você já usa.',
    ],
    acao: { rotulo: 'Ver o convite' },
    dados: [
      { rotulo: 'Professora', valor: 'Helena Costa' },
      { rotulo: 'Instrumento', valor: 'Piano' },
    ],
    rodape: 'conta',
  },
  {
    id: 'pagamento',
    nome: 'Pagamento',
    assunto: 'Pagamento confirmado: o plano Mentor está ativo',
    previa: 'O portal do professor já está aberto para você.',
    titulo: 'Tudo certo com o seu pagamento',
    paragrafos: [
      'O plano Mentor está ativo e o portal do professor já pode ser usado. Comece trazendo seus alunos para a turma.',
    ],
    acao: { rotulo: 'Abrir o portal' },
    dados: [
      { rotulo: 'Plano', valor: 'Mentor' },
      { rotulo: 'Período', valor: 'Mensal' },
      { rotulo: 'Valor', valor: 'R$ 39,90' },
      { rotulo: 'Data', valor: '11 de outubro de 2026' },
    ],
    rodape: 'cobranca',
  },
  {
    id: 'denuncia-removida',
    nome: 'Denúncia: removido',
    assunto: 'Sua denúncia foi analisada',
    previa: 'O conteúdo que você apontou saiu do ar.',
    titulo: 'O que você denunciou saiu do ar',
    paragrafos: [
      'A equipe analisou a sua denúncia sobre uma curiosidade na página de Frédéric Chopin e retirou o conteúdo.',
      'Obrigado por avisar. É assim que o acervo continua confiável para quem estuda por ele.',
    ],
    acao: { rotulo: 'Ver a página de Chopin' },
    rodape: 'conta',
  },
  {
    id: 'denuncia-mantida',
    nome: 'Denúncia: mantido',
    assunto: 'Sua denúncia foi analisada',
    previa: 'O conteúdo continua no ar, e explicamos por quê.',
    titulo: 'Olhamos com cuidado e o conteúdo fica',
    paragrafos: [
      'A equipe analisou a sua denúncia sobre uma curiosidade na página de Frédéric Chopin e concluiu que ela não fere as regras do acervo.',
      'Se você tiver uma fonte que mostre o contrário, denuncie de novo pela própria página e conte o que encontrou.',
    ],
    acao: { rotulo: 'Ver a página de Chopin' },
    rodape: 'conta',
  },
  {
    id: 'xp',
    nome: 'XP de contribuição',
    assunto: 'Sua curiosidade sobre Chopin rendeu 30 XP',
    previa: 'Passaram sete dias sem denúncia, e o XP entrou na sua conta.',
    titulo: 'Sua curiosidade rendeu 30 XP',
    paragrafos: [
      'Faz sete dias que você contou que Chopin deu poucos concertos públicos na vida. Ninguém contestou, e o XP já está na sua conta.',
      'Cada informação que você acrescenta deixa a página melhor para a próxima pessoa que chegar nela.',
    ],
    acao: { rotulo: 'Ver minhas conquistas' },
    dados: [
      { rotulo: 'Contribuição', valor: 'Curiosidade' },
      { rotulo: 'Página', valor: 'Frédéric Chopin' },
      { rotulo: 'XP', valor: '+30' },
    ],
    rodape: 'conta',
  },
  {
    id: 'newsletter',
    nome: 'Newsletter',
    assunto: 'O noturno, de Dublin a Paris',
    previa:
      'Como uma forma pequena, criada por um irlandês, virou a voz de Chopin.',
    titulo: 'O noturno, de Dublin a Paris',
    paragrafos: [
      'John Field deu o nome; Chopin deu a alma. Nesta edição, a história de uma forma feita para tocar baixinho, à luz de vela, e por que ela continua sendo a porta de entrada de tanta gente no piano.',
    ],
    acao: { rotulo: 'Ler o artigo no blog' },
    imagem: {
      src: '/illustrations/beethoven-manuscript.webp',
      alt: 'Manuscrito de Beethoven em traço dourado',
      largura: 1000,
      altura: 778,
    },
    notas: [
      {
        rotulo: 'Obra da semana',
        titulo: 'Noturnos, Op. 9',
        texto:
          'Três noturnos, e o segundo é o que todo mundo já ouviu sem saber o nome.',
      },
      {
        rotulo: 'Coleção',
        titulo: 'A noite no piano',
        texto:
          'Quatro obras para tocar ou ouvir com a luz baixa, escolhidas pela equipe.',
      },
    ],
    rodape: 'newsletter',
  },
];

export const RODAPES: Record<Rodape, string> = {
  conta:
    'Você recebeu este e-mail porque tem uma conta no Opus Atlas. Escolha quais avisos chegam por e-mail em Meu perfil.',
  seguranca:
    'Não foi você? Ignore este e-mail: nada muda na sua conta sem o clique no botão.',
  cobranca:
    'Cobrança feita pelo Stripe, em reais. Para trocar de plano ou cancelar, use Meu perfil → Configurações da Conta. Em até 7 dias da assinatura você pode desistir e receber o valor de volta.',
  newsletter:
    'Você recebe esta newsletter porque se inscreveu no site do Opus Atlas. Cancelar a inscrição leva um clique.',
};

export const REMETENTE = 'Opus Atlas';
export const ENDERECO = 'opusatlas.com.br · São Paulo, Brasil';
