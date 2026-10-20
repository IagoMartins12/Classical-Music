import { CONTATO } from '@/app/utils/contato';
import type { CentralBilingue } from './tipos';

/**
 * Perguntas frequentes. Respostas curtas e verdadeiras: o que o sistema faz
 * hoje (cérebro de negócio, "Promessas e realidade" — a antiga FAQ prometia
 * moderação prévia de todo envio, que não existe).
 */
export const FAQ: CentralBilingue = {
  pt: {
    titulo: 'Perguntas frequentes',
    abertura:
      'Respostas curtas para as dúvidas mais comuns sobre o Opus Atlas.',
    grupos: [
      {
        id: 'geral',
        titulo: 'Sobre o Opus Atlas',
        itens: [
          {
            id: 'o-que-e',
            titulo: 'O que é o Opus Atlas?',
            blocos: [
              'Uma enciclopédia de música clássica que também serve para estudar e ensinar. Reúne cerca de 19 mil compositores e mais de 200 mil obras, com partituras para baixar, players do Spotify e do YouTube, ferramentas de estudo pessoal e um portal para professores e alunos.',
            ],
          },
          {
            id: 'gratuito',
            titulo: 'É gratuito?',
            blocos: [
              'Sim. Ler a enciclopédia, ouvir as obras e baixar as partituras é grátis e não exige conta. A conta gratuita libera favoritos, listas de estudo, anotações e conquistas. Os planos pagos (Plus, Mentor e Maestro) acrescentam recursos de estudo e, para professores, o portal de ensino — veja [Preços](/pricing).',
            ],
          },
          {
            id: 'preciso-de-conta',
            titulo: 'Preciso de conta para usar?',
            blocos: [
              'Não para ler, ouvir e baixar. Para guardar favoritos, organizar o que quer aprender, anotar, contribuir com o acervo ou usar o portal de ensino, sim — e ela é gratuita.',
            ],
          },
          {
            id: 'idade',
            titulo: 'Qual a idade mínima?',
            blocos: [
              '13 anos. Entre 13 e 18, a conta depende da autorização dos pais ou responsáveis.',
            ],
          },
          {
            id: 'idiomas',
            titulo: 'Em quais idiomas o site funciona?',
            blocos: [
              'Português e inglês. Troque pelo botão da bandeira, na barra do topo.',
            ],
          },
          {
            id: 'aplicativo',
            titulo: 'Tem aplicativo?',
            blocos: [
              'Ainda não há aplicativo nas lojas. O site funciona no navegador do celular, com o mesmo conteúdo e as mesmas contas.',
            ],
          },
        ],
      },
      {
        id: 'partituras',
        titulo: 'Partituras e gravações',
        itens: [
          {
            id: 'de-onde-vem',
            titulo: 'De onde vêm as partituras?',
            blocos: [
              'Do IMSLP (International Music Score Library Project), que as oferece como domínio público, e de envios da comunidade. Na primeira visita a uma obra, o Opus Atlas busca as partituras no IMSLP e as guarda.',
            ],
          },
          {
            id: 'posso-usar',
            titulo: 'Posso imprimir, tocar em público e compartilhar?',
            blocos: [
              'Partituras em domínio público podem ser usadas livremente. Mas o domínio público varia de país para país, e edições e arranjos podem ter proteção própria. Veja [Direitos Autorais](/copyright) antes de um uso comercial.',
            ],
          },
          {
            id: 'sem-partitura',
            titulo: 'Por que uma obra não tem partitura?',
            blocos: [
              'Porque ainda não há arquivo no IMSLP e ninguém a enviou. Uma obra sem arquivo no IMSLP é consultada de novo depois de um dia. Se você tem uma partitura em domínio público dessa obra, pode enviá-la em **Uploads**.',
            ],
          },
          {
            id: 'ouvir',
            titulo: 'Posso ouvir as obras?',
            blocos: [
              'Sim, quando encontramos gravações: a seção **Multimídia** da página da obra traz os players do Spotify e do YouTube. Eles seguem as regras dessas plataformas — o Spotify, por exemplo, pode tocar só um trecho para quem não está conectado a ele.',
            ],
          },
        ],
      },
      {
        id: 'comunidade',
        titulo: 'Comunidade e moderação',
        itens: [
          {
            id: 'quem-cadastra',
            titulo: 'Quem cadastra as obras e os compositores?',
            blocos: [
              'A equipe e a comunidade. Qualquer usuário pode cadastrar compositores, obras e partituras em **Uploads**; o plano gratuito permite 3 envios, os pagos são ilimitados.',
            ],
          },
          {
            id: 'moderacao',
            titulo: 'Os envios passam por moderação antes de aparecer?',
            blocos: [
              'Não. O envio entra no ar na hora, e a revisão acontece por denúncia: qualquer pessoa pode denunciar, e a equipe analisa pela gravidade — direito autoral e conteúdo ilegal em até 24 horas, com o arquivo retirado imediatamente; conteúdo ofensivo e spam em até 3 dias; dado incorreto em até 7 dias; duplicado em até 30 dias.',
            ],
          },
          {
            id: 'verificado',
            titulo: 'O que significa o selo de verificado?',
            blocos: [
              'Que a equipe do Opus Atlas conferiu os dados daquele compositor ou daquela obra. Ninguém verifica o próprio envio. A maior parte do acervo ainda não foi verificada — por isso existe o selo.',
            ],
          },
          {
            id: 'erro',
            titulo: 'Encontrei um dado errado. O que faço?',
            blocos: [
              'Se foi você quem enviou, edite em **Uploads**. Se não, use o botão de denúncia (a bandeira) na página e escolha **Informações falsas**, contando o que está errado.',
            ],
          },
          {
            id: 'ia',
            titulo: 'As biografias são escritas por inteligência artificial?',
            blocos: [
              'Parte delas foi redigida com o apoio de ferramentas de inteligência artificial, a partir de dados sobre o compositor. Essas ferramentas nunca recebem dados pessoais de usuários.',
            ],
          },
        ],
      },
      {
        id: 'planos',
        titulo: 'Planos e pagamento',
        itens: [
          {
            id: 'diferencas',
            titulo: 'Qual a diferença entre os planos?',
            blocos: [
              '**Free** é para quem explora e estuda; **Plus** acrescenta envios e vídeos ilimitados, recomendações, metas e relatórios pessoais; **Mentor** abre o portal de ensino para até 7 alunos; **Maestro**, para alunos ilimitados, com recursos avançados e destaque no diretório. Detalhes e preços em [Preços](/pricing).',
            ],
          },
          {
            id: 'teste',
            titulo: 'Como funciona o teste grátis?',
            blocos: [
              'Todos os planos pagos (Plus, Mentor e Maestro) têm 7 dias de teste grátis na primeira assinatura. O cartão é pedido na hora de assinar, e a primeira cobrança só acontece quando o teste acaba: se você cancelar antes, nada é cobrado. Quem já teve um plano pago não ganha um novo teste. Avisamos por e-mail quando o teste está acabando.',
            ],
          },
          {
            id: 'cancelar',
            titulo: 'Posso cancelar quando quiser?',
            blocos: [
              'Sim, sem multa, em **Meu Perfil → Configurações da Conta → Assinatura**. O acesso continua até o fim do período já pago; depois, a conta volta ao plano gratuito, com o seu histórico.',
            ],
          },
          {
            id: 'reembolso',
            titulo: 'Tenho direito a reembolso?',
            blocos: [
              'Nos primeiros 7 dias depois de assinar, sim: é o direito de arrependimento do Código de Defesa do Consumidor, com devolução integral. Escreva para ' +
                CONTATO.suporte +
                ' dentro do prazo.',
            ],
          },
          {
            id: 'cartao',
            titulo: 'Vocês guardam o meu cartão?',
            blocos: [
              'Não. O pagamento é processado pela Stripe; o número do cartão é informado diretamente a ela e nunca passa pelo Opus Atlas.',
            ],
          },
        ],
      },
      {
        id: 'ensino',
        titulo: 'Professores e alunos',
        itens: [
          {
            id: 'virar-professor',
            titulo: 'Como me torno professor na plataforma?',
            blocos: [
              'Assinando um dos planos para professores, em [Preços](/pricing): Mentor (até 7 alunos) ou Maestro (alunos ilimitados). A assinatura libera o portal de ensino e o perfil no diretório.',
            ],
          },
          {
            id: 'aulas-pagas',
            titulo: 'O Opus Atlas cobra as aulas dos alunos?',
            blocos: [
              'Não. A plataforma oferece a ferramenta — aulas, tarefas, calendário, relatórios —, mas não intermedeia a contratação nem o pagamento das aulas, que são combinados entre professor e aluno.',
            ],
          },
          {
            id: 'varios-professores',
            titulo: 'Posso ter mais de um professor?',
            blocos: [
              'Sim. Você pode receber convites de vários professores, e cada vínculo é independente. Encerrar um vínculo não apaga aulas, tarefas nem histórico.',
            ],
          },
        ],
      },
      {
        id: 'privacidade',
        titulo: 'Privacidade e conta',
        itens: [
          {
            id: 'dados',
            titulo: 'O que vocês fazem com os meus dados?',
            blocos: [
              'Usamos os dados para oferecer a plataforma, mantê-la segura e cobrar os planos. **Não vendemos dados pessoais**, e anunciantes recebem apenas números agregados. Tudo está na [Política de Privacidade](/privacy).',
            ],
          },
          {
            id: 'exportar',
            titulo: 'Posso baixar os meus dados?',
            blocos: [
              'Sim, em **Meu Perfil → Configurações da Conta → Seus dados → Exportar meus dados**. Você recebe um arquivo com tudo o que é seu.',
            ],
          },
          {
            id: 'excluir',
            titulo: 'Como excluo a minha conta?',
            blocos: [
              'Em **Meu Perfil → Configurações da Conta → Zona de Perigo → Deletar Conta**. O site mostra antes o que será apagado e pede a sua senha.',
            ],
          },
          {
            id: 'contribuicoes-apos',
            titulo: 'O que acontece com o que enviei se eu excluir a conta?',
            blocos: [
              'Anotações, comentários, favoritos e listas de estudo são apagados. Obras e partituras que você cadastrou podem continuar no acervo, sem o seu nome — elas fazem parte da enciclopédia coletiva.',
            ],
          },
        ],
      },
    ],
  },
  en: {
    titulo: 'Frequently asked questions',
    abertura: 'Short answers to the most common questions about Opus Atlas.',
    grupos: [
      {
        id: 'geral',
        titulo: 'About Opus Atlas',
        itens: [
          {
            id: 'o-que-e',
            titulo: 'What is Opus Atlas?',
            blocos: [
              'A classical music encyclopedia that is also a place to study and to teach. It brings together about 19,000 composers and more than 200,000 works, with downloadable scores, Spotify and YouTube players, personal study tools and a portal for teachers and students.',
            ],
          },
          {
            id: 'gratuito',
            titulo: 'Is it free?',
            blocos: [
              'Yes. Reading the encyclopedia, listening to the works and downloading scores is free and needs no account. The free account unlocks favorites, study lists, annotations and achievements. Paid plans (Plus, Mentor and Maestro) add study features and, for teachers, the teaching portal — see [Pricing](/pricing).',
            ],
          },
          {
            id: 'preciso-de-conta',
            titulo: 'Do I need an account?',
            blocos: [
              'Not to read, listen and download. To save favorites, plan what you want to learn, annotate, contribute to the collection or use the teaching portal, yes — and it is free.',
            ],
          },
          {
            id: 'idade',
            titulo: 'What is the minimum age?',
            blocos: [
              '13. Between 13 and 18, the account requires a parent’s or guardian’s permission.',
            ],
          },
          {
            id: 'idiomas',
            titulo: 'Which languages does the site support?',
            blocos: [
              'Portuguese and English. Switch with the flag button in the top bar.',
            ],
          },
          {
            id: 'aplicativo',
            titulo: 'Is there an app?',
            blocos: [
              'There is no app in the stores yet. The site works in your phone’s browser, with the same content and accounts.',
            ],
          },
        ],
      },
      {
        id: 'partituras',
        titulo: 'Scores and recordings',
        itens: [
          {
            id: 'de-onde-vem',
            titulo: 'Where do the scores come from?',
            blocos: [
              'From IMSLP (International Music Score Library Project), which offers them as public domain, and from community uploads. On a work’s first visit, Opus Atlas fetches its scores from IMSLP and stores them.',
            ],
          },
          {
            id: 'posso-usar',
            titulo: 'Can I print, perform and share them?',
            blocos: [
              'Public-domain scores may be used freely. But the public domain varies by country, and editions and arrangements may have their own protection. Check [Copyright](/copyright) before any commercial use.',
            ],
          },
          {
            id: 'sem-partitura',
            titulo: 'Why does a work have no score?',
            blocos: [
              'Because there is no file on IMSLP yet and nobody has uploaded one. A work with no IMSLP file is checked again after a day. If you have a public-domain score of that work, you can upload it in **Uploads**.',
            ],
          },
          {
            id: 'ouvir',
            titulo: 'Can I listen to the works?',
            blocos: [
              'Yes, when we find recordings: the **Multimedia** section of the work’s page has Spotify and YouTube players. They follow those platforms’ rules — Spotify, for instance, may play only an excerpt if you are not signed in to it.',
            ],
          },
        ],
      },
      {
        id: 'comunidade',
        titulo: 'Community and moderation',
        itens: [
          {
            id: 'quem-cadastra',
            titulo: 'Who adds the works and composers?',
            blocos: [
              'The team and the community. Any user can add composers, works and scores in **Uploads**; the free plan allows 3 submissions, paid plans are unlimited.',
            ],
          },
          {
            id: 'moderacao',
            titulo: 'Are submissions moderated before they appear?',
            blocos: [
              'No. A submission goes live immediately, and review happens on report: anyone can report, and the team reviews by severity — copyright and illegal content within 24 hours, with the file taken down at once; offensive content and spam within 3 days; incorrect data within 7 days; duplicates within 30 days.',
            ],
          },
          {
            id: 'verificado',
            titulo: 'What does the verified badge mean?',
            blocos: [
              'That the Opus Atlas team checked that composer’s or work’s data. Nobody verifies their own submission. Most of the collection has not been verified yet — that is why the badge exists.',
            ],
          },
          {
            id: 'erro',
            titulo: 'I found wrong data. What should I do?',
            blocos: [
              'If you submitted it, edit it in **Uploads**. If not, use the report button (the flag) on the page and choose **False information**, explaining what is wrong.',
            ],
          },
          {
            id: 'ia',
            titulo: 'Are the biographies written by artificial intelligence?',
            blocos: [
              'Some were drafted with the help of artificial intelligence tools, from data about the composer. Those tools never receive users’ personal data.',
            ],
          },
        ],
      },
      {
        id: 'planos',
        titulo: 'Plans and payment',
        itens: [
          {
            id: 'diferencas',
            titulo: 'What is the difference between plans?',
            blocos: [
              '**Free** is for exploring and studying; **Plus** adds unlimited uploads and videos, recommendations, goals and personal reports; **Mentor** opens the teaching portal for up to 7 students; **Maestro**, for unlimited students, with advanced features and highlighting in the directory. Details and prices on [Pricing](/pricing).',
            ],
          },
          {
            id: 'teste',
            titulo: 'How does the free trial work?',
            blocos: [
              'All paid plans (Plus, Mentor and Maestro) have a 7-day free trial on your first subscription. A card is asked for when you subscribe, and the first charge only happens when the trial ends: if you cancel before, nothing is charged. Anyone who already had a paid plan does not get a new trial. We send an e-mail when the trial is about to end.',
            ],
          },
          {
            id: 'cancelar',
            titulo: 'Can I cancel whenever I want?',
            blocos: [
              'Yes, with no fee, in **My profile → Account Settings → Subscription**. Access continues until the end of the period already paid; then the account returns to the free plan, with your history.',
            ],
          },
          {
            id: 'reembolso',
            titulo: 'Am I entitled to a refund?',
            blocos: [
              'Within the first 7 days after subscribing, yes: it is the right of withdrawal under the Brazilian Consumer Protection Code, with a full refund. Write to ' +
                CONTATO.suporte +
                ' within that period.',
            ],
          },
          {
            id: 'cartao',
            titulo: 'Do you store my card?',
            blocos: [
              'No. Payment is processed by Stripe; the card number is given directly to Stripe and never passes through Opus Atlas.',
            ],
          },
        ],
      },
      {
        id: 'ensino',
        titulo: 'Teachers and students',
        itens: [
          {
            id: 'virar-professor',
            titulo: 'How do I become a teacher on the platform?',
            blocos: [
              'By subscribing to one of the plans for teachers, on [Pricing](/pricing): Mentor (up to 7 students) or Maestro (unlimited students). The subscription unlocks the teaching portal and the directory profile.',
            ],
          },
          {
            id: 'aulas-pagas',
            titulo: 'Does Opus Atlas charge students for lessons?',
            blocos: [
              'No. The platform provides the tool — lessons, assignments, calendar, reports — but does not handle hiring or payment for lessons, which are arranged between teacher and student.',
            ],
          },
          {
            id: 'varios-professores',
            titulo: 'Can I have more than one teacher?',
            blocos: [
              'Yes. You can receive invitations from several teachers, and each link is independent. Ending a link does not delete lessons, assignments or history.',
            ],
          },
        ],
      },
      {
        id: 'privacidade',
        titulo: 'Privacy and account',
        itens: [
          {
            id: 'dados',
            titulo: 'What do you do with my data?',
            blocos: [
              'We use it to provide the platform, keep it secure and bill the plans. **We do not sell personal data**, and advertisers receive only aggregate numbers. It is all in the [Privacy Policy](/privacy).',
            ],
          },
          {
            id: 'exportar',
            titulo: 'Can I download my data?',
            blocos: [
              'Yes, in **My profile → Account Settings → Your data → Export my data**. You get a file with everything that is yours.',
            ],
          },
          {
            id: 'excluir',
            titulo: 'How do I delete my account?',
            blocos: [
              'In **My profile → Account Settings → Danger Zone → Delete Account**. The site first shows what will be erased and asks for your password.',
            ],
          },
          {
            id: 'contribuicoes-apos',
            titulo: 'What happens to what I submitted if I delete my account?',
            blocos: [
              'Annotations, comments, favorites and study lists are erased. Works and scores you added may remain in the collection, without your name — they are part of the shared encyclopedia.',
            ],
          },
        ],
      },
    ],
  },
};
