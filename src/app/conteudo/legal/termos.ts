import { CONTATO } from '@/app/utils/contato';
import type { DocumentoBilingue } from './tipos';

/**
 * Termos de Uso do Opus Atlas.
 *
 * Tudo o que está aqui descreve o que o sistema faz de fato (cérebro de
 * negócio: planos, moderação por denúncia, limites, exclusão de conta). Ao
 * mudar uma regra do produto, mude o texto — e a data de vigência.
 */
export const TERMOS: DocumentoBilingue = {
  pt: {
    titulo: 'Termos de Uso',
    abertura:
      'As regras de uso do Opus Atlas: o que oferecemos, o que esperamos de quem usa a plataforma e como resolvemos o que não sair como combinado.',
    vigencia: '2026-09-28',
    essencial: [
      'Ler a enciclopédia, ouvir as obras e baixar as partituras de domínio público é grátis e não exige conta.',
      'Para criar uma conta é preciso ter **13 anos ou mais**; entre 13 e 18 anos, com autorização dos pais ou responsáveis.',
      'O que você publica continua seu. Você nos autoriza a exibi-lo na plataforma e responde por ter o direito de publicá-lo.',
      'Envios da comunidade entram no ar na hora e são revistos quando alguém denuncia. Violação de direito autoral tira o arquivo do ar imediatamente.',
      'Planos pagos renovam sozinhos e podem ser cancelados a qualquer momento, sem multa. Nos primeiros **7 dias** da contratação, você pode desistir com reembolso integral.',
      'Você pode excluir a sua conta quando quiser. Seus dados pessoais saem junto; obras e partituras que você cadastrou podem continuar no acervo, sem o seu nome.',
    ],
    secoes: [
      {
        id: 'aceitacao',
        titulo: 'Aceitação destes termos',
        blocos: [
          'Estes Termos de Uso regem o acesso e o uso do Opus Atlas — o site em opusatlas.com.br, em qualquer idioma, e os serviços oferecidos por ele (a “plataforma”).',
          'Ao navegar pela plataforma você concorda com estes termos. Ao criar uma conta, você declara tê-los lido e aceito, junto com a [Política de Privacidade](/privacy), que explica como tratamos os seus dados. Se não concordar, não use a plataforma.',
        ],
      },
      {
        id: 'definicoes',
        titulo: 'Definições',
        blocos: [
          {
            lista: [
              '**Visitante:** quem navega sem conta.',
              '**Usuário:** quem tem uma conta, gratuita ou paga.',
              '**Professor:** usuário com assinatura de um plano para professores — Mentor ou Maestro —, que dá acesso ao portal de ensino.',
              '**Aluno:** usuário vinculado a um professor por convite aceito.',
              '**Acervo:** a base de compositores, obras, partituras e mídia da enciclopédia.',
              '**Conteúdo do usuário:** tudo o que um usuário envia ou publica — cadastros no acervo, partituras, anotações, comentários, vídeos, avaliações, textos de perfil e materiais do portal de ensino.',
              '**Planos pagos:** as assinaturas Plus, Mentor e Maestro.',
            ],
          },
        ],
      },
      {
        id: 'servico',
        titulo: 'O que o Opus Atlas oferece',
        blocos: [
          'O Opus Atlas é uma enciclopédia de música clássica que também serve para estudar e ensinar. A plataforma oferece:',
          {
            lista: [
              '**Enciclopédia**, aberta a todos: compositores, obras, épocas, instrumentos e gêneros, com partituras para baixar e players do Spotify e do YouTube.',
              '**Estudo pessoal**, com conta gratuita: favoritos, as listas “Quero aprender” e “Já aprendi”, anotações, conquistas e pontos de experiência.',
              '**Portal de ensino**, para professores: convite de alunos, aulas, tarefas, calendário, relatórios de progresso e perfil no diretório de professores.',
              '**Conteúdo editorial**: blog, agenda de concertos e newsletter.',
            ],
          },
          'Os recursos disponíveis dependem do plano da conta, conforme a [página de planos](/pricing). A plataforma evolui: recursos podem ser criados, alterados ou encerrados. Quando uma mudança reduzir o que um plano pago oferece, avisaremos os assinantes afetados com antecedência.',
        ],
      },
      {
        id: 'conta',
        titulo: 'Conta, idade mínima e segurança',
        blocos: [
          'Você pode criar uma conta com e-mail e senha ou com a sua conta Google. As informações do cadastro precisam ser verdadeiras e mantidas atualizadas.',
          'É preciso ter **13 anos ou mais** para criar uma conta. Quem tem entre 13 e 18 anos declara que tem a autorização dos pais ou responsáveis, que acompanham o uso da plataforma e respondem pelos atos praticados. Se soubermos que uma conta pertence a alguém com menos de 13 anos, ela será excluída.',
          'A conta é pessoal e intransferível. Guarde a sua senha em sigilo: você responde pelo que for feito com a sua conta. Se suspeitar de acesso indevido, troque a senha e escreva para ' +
            CONTATO.suporte +
            '.',
        ],
      },
      {
        id: 'planos',
        titulo: 'Planos, pagamento e cancelamento',
        subsecoes: [
          {
            id: 'planos-precos',
            titulo: 'Preços e cobrança',
            blocos: [
              'Os planos, os recursos de cada um e os preços estão na [página de planos](/pricing). Vale o preço exibido no momento da contratação.',
              'O pagamento é processado pela **Stripe**, em reais, no cartão informado por você. O Opus Atlas não recebe nem armazena o número do seu cartão.',
              'A assinatura se renova automaticamente ao fim de cada período, mensal ou anual, pelo preço vigente, até ser cancelada. Se o preço de um plano mudar, a mudança vale a partir da renovação seguinte, e avisaremos os assinantes antes dela.',
              'Cupons de desconto seguem as condições informadas em cada cupom.',
            ],
          },
          {
            id: 'planos-teste',
            titulo: 'Período de teste',
            blocos: [
              'Os planos pagos podem ter um período de teste gratuito, com a duração informada na página de planos. Terminado o teste, a assinatura passa a ser cobrada, a não ser que você a cancele antes. Avisamos por e-mail quando o teste estiver acabando.',
            ],
          },
          {
            id: 'planos-cancelamento',
            titulo: 'Cancelamento, troca de plano e arrependimento',
            blocos: [
              'Você pode trocar de plano ou cancelar a assinatura a qualquer momento, sem multa. Cancelada, a assinatura continua ativa até o fim do período já pago; depois, a conta volta ao plano gratuito, **mantendo o seu histórico e o seu progresso**.',
              'Descer de plano não apaga nada: um professor que passa a um plano com limite menor de alunos mantém todos os vínculos atuais, mas não pode abrir novos enquanto estiver acima do limite.',
              'Pelo direito de arrependimento (art. 49 do Código de Defesa do Consumidor), você pode desistir da contratação em até **7 dias** contados da assinatura e receber de volta, integralmente, o valor pago. Para isso, escreva para ' +
                CONTATO.suporte +
                ' dentro do prazo.',
              'Fora do prazo de arrependimento, o valor de um período já iniciado não é devolvido proporcionalmente, salvo quando a lei exigir.',
            ],
          },
        ],
        blocos: [],
      },
      {
        id: 'conteudo-do-usuario',
        titulo: 'O conteúdo que você publica',
        blocos: [
          'O conteúdo do usuário continua sendo de quem o criou. Ao publicá-lo, você concede ao Opus Atlas uma licença **gratuita, não exclusiva e válida em todo o mundo** para armazenar, reproduzir, exibir, adaptar ao formato da plataforma e distribuir esse conteúdo dentro dos serviços do Opus Atlas, enquanto ele estiver publicado.',
          'Cadastros no acervo (compositores, obras e partituras) são contribuições para uma enciclopédia coletiva: eles podem ser corrigidos e completados por outros usuários e pela equipe, e **podem permanecer no acervo mesmo depois que você excluir a sua conta**, sem vínculo com o seu nome. A licença acima vale, para essas contribuições, enquanto elas estiverem no acervo.',
          'Anotações podem ser privadas, visíveis só para você, ou públicas, visíveis para todos e abertas à avaliação de utilidade dos outros usuários.',
          'Ao publicar, você declara que o conteúdo é seu ou que você tem o direito de publicá-lo — por estar em domínio público, por licença ou por autorização do titular — e que ele não viola a lei nem direitos de terceiros. Você responde por esse conteúdo.',
        ],
      },
      {
        id: 'moderacao',
        titulo: 'Contribuições ao acervo e moderação',
        blocos: [
          'Os envios da comunidade **entram no ar na hora**. A revisão acontece por denúncia: qualquer pessoa pode denunciar um compositor, uma obra ou uma partitura, e a equipe analisa pela gravidade do caso:',
          {
            tabela: {
              cabecalho: ['Gravidade', 'Exemplos', 'Prazo de análise'],
              linhas: [
                ['Urgente', 'Direito autoral, conteúdo ilegal', 'Até 24 horas'],
                ['Alta', 'Conteúdo ofensivo, spam', 'Até 3 dias'],
                ['Normal', 'Dado incorreto, outros', 'Até 7 dias'],
                ['Baixa', 'Duplicado', 'Até 30 dias'],
              ],
            },
          },
          'Denúncia de violação de direito autoral ou de conteúdo ilegal tira o arquivo do ar imediatamente, e quem o enviou é avisado. Nos demais casos o conteúdo continua publicado até a decisão. Remover um conteúdo exige justificativa por escrito da equipe.',
          'O selo de “verificado” é concedido apenas pela equipe do Opus Atlas. O número de envios depende do plano: o plano gratuito permite 3; os planos pagos, envios ilimitados.',
          'Quem enviou um conteúdo pode editá-lo e excluí-lo. A equipe também pode editar, corrigir, mesclar duplicados ou remover conteúdo que viole estes termos ou a lei.',
        ],
      },
      {
        id: 'conduta',
        titulo: 'Regras de conduta',
        blocos: [
          'Ao usar o Opus Atlas, você concorda em não:',
          {
            lista: [
              'publicar conteúdo protegido por direito autoral sem autorização do titular;',
              'publicar conteúdo ilegal, ofensivo, discriminatório, violento, difamatório, de cunho sexual ou que exponha dados pessoais de terceiros;',
              'assediar, ameaçar ou enganar outros usuários, inclusive no portal de ensino;',
              'se passar por outra pessoa ou instituição, ou criar contas em nome de terceiros;',
              'enviar spam, publicidade não autorizada ou correntes;',
              'coletar dados da plataforma ou de outros usuários por meios automatizados (robôs, raspagem) ou copiar o acervo em massa;',
              'burlar limites de plano, medidas de segurança ou de acesso, sobrecarregar a infraestrutura ou explorar falhas;',
              'manipular pontos de experiência, conquistas, avaliações, votos ou estatísticas;',
              'usar a plataforma para qualquer fim contrário à lei ou a estes termos.',
            ],
          },
        ],
      },
      {
        id: 'ensino',
        titulo: 'Portal de ensino: professores e alunos',
        blocos: [
          'Para ser professor na plataforma, basta assinar um dos planos para professores: Mentor (até 7 alunos) ou Maestro (alunos ilimitados). A assinatura dá acesso ao portal de ensino e ao perfil no diretório de professores.',
          'O vínculo entre professor e aluno começa por convite do professor e aceite do aluno; o convite vale 30 dias. Encerrar o vínculo não apaga aulas, tarefas e histórico.',
          'O Opus Atlas fornece a ferramenta. **Não é parte da relação entre professor e aluno**: não contrata aulas, não intermedeia pagamentos entre eles, não garante disponibilidade, qualidade ou resultado do ensino, nem responde por acordos feitos fora da plataforma.',
          'O professor responde pelas informações que publica no diretório — formação, experiência, contato — e deve usar os dados dos seus alunos apenas para as aulas. As notas privadas do professor não são exibidas ao aluno.',
          'Alunos menores de 18 anos participam com a autorização e o acompanhamento dos pais ou responsáveis.',
        ],
      },
      {
        id: 'propriedade',
        titulo: 'Propriedade intelectual do Opus Atlas',
        blocos: [
          'O nome e a marca Opus Atlas, o logotipo, o design, o software, os textos editoriais e a organização do acervo pertencem ao Opus Atlas ou a quem o licenciou, e são protegidos pela legislação de direitos autorais e de propriedade industrial.',
          'Você pode usar a plataforma para estudo e uso pessoal. Não é permitido copiar, reproduzir em massa, revender ou redistribuir esses elementos sem autorização por escrito — citações curtas, com indicação da fonte, são sempre bem-vindas.',
          'As partituras vindas do IMSLP estão em domínio público segundo a indicação do IMSLP; edições, arranjos e traduções podem ter proteção própria, e o domínio público varia de país para país. Veja [Direitos Autorais](/copyright).',
        ],
      },
      {
        id: 'terceiros',
        titulo: 'Serviços de terceiros',
        blocos: [
          'Partes da plataforma usam serviços de terceiros: players do Spotify e do YouTube, partituras do IMSLP, login com Google e pagamento pela Stripe. Esses serviços têm termos e políticas próprios, que valem quando você os usa, e não são controlados pelo Opus Atlas.',
          'Links para sites externos são oferecidos por conveniência; não respondemos pelo conteúdo deles.',
        ],
      },
      {
        id: 'anuncios',
        titulo: 'Anúncios',
        blocos: [
          'A plataforma exibe anúncios cadastrados pela equipe, que podem ser direcionados por instrumento, por perfil (estudante ou professor), por dispositivo e por período. Os anunciantes recebem apenas números agregados de impressões e cliques — nunca os seus dados pessoais.',
          'A exibição de um anúncio não significa que o Opus Atlas endosse o produto ou serviço anunciado.',
        ],
      },
      {
        id: 'comunicacoes',
        titulo: 'Comunicações',
        blocos: [
          'Enviamos por e-mail as mensagens necessárias ao serviço: confirmação de conta, recuperação de senha, avisos de segurança, convites e avisos do portal de ensino, e avisos de pagamento, renovação e fim de teste. Enquanto você tiver uma conta, essas mensagens fazem parte do serviço.',
          'A newsletter é opcional: exige confirmação por e-mail e pode ser cancelada a qualquer momento pelo link em cada mensagem.',
        ],
      },
      {
        id: 'disponibilidade',
        titulo: 'Disponibilidade',
        blocos: [
          'Trabalhamos para manter a plataforma no ar, mas ela pode ficar indisponível por manutenção, falhas técnicas, de terceiros ou por motivos fora do nosso controle. Não garantimos funcionamento ininterrupto ou livre de erros.',
        ],
      },
      {
        id: 'responsabilidade',
        titulo: 'Limitação de responsabilidade',
        blocos: [
          'O acervo é construído em grande parte pela comunidade e reúne centenas de milhares de registros; ele pode conter imprecisões. As informações têm finalidade educacional e não substituem fontes especializadas quando a exatidão for essencial.',
          'O conteúdo do usuário é de responsabilidade de quem o publicou. O Opus Atlas remove conteúdo nos casos previstos nestes termos e quando determinado pela Justiça, nos termos do Marco Civil da Internet (Lei 12.965/2014).',
          'Na extensão máxima permitida pela lei, inclusive pelo Código de Defesa do Consumidor, o Opus Atlas não responde por danos indiretos, por lucros cessantes, pela atuação de serviços de terceiros, pelo uso da plataforma em desacordo com estes termos nem pelos resultados de estudo ou de ensino obtidos com ela. Nada nestes termos afasta direitos que a lei garante ao consumidor.',
        ],
      },
      {
        id: 'encerramento',
        titulo: 'Exclusão da conta, suspensão e encerramento',
        blocos: [
          'Você pode excluir a sua conta a qualquer momento, no seu perfil. A exclusão pede a sua senha e mostra, antes, o que será apagado. Com ela saem os seus dados pessoais, favoritos, listas de estudo, anotações, comentários, conquistas, notificações, vínculos de ensino e a inscrição na newsletter. Obras e partituras que você cadastrou podem continuar no acervo, sem vínculo com o seu nome. Se houver assinatura ativa, cancele-a antes.',
          'Podemos suspender ou encerrar uma conta, total ou parcialmente, em caso de violação destes termos ou da lei, fraude, risco à segurança da plataforma ou de outros usuários, ou por determinação de autoridade. Sempre que possível, avisaremos antes e informaremos o motivo. O encerramento por violação não dá direito a reembolso do período em curso, ressalvado o direito de arrependimento.',
        ],
      },
      {
        id: 'privacidade',
        titulo: 'Privacidade',
        blocos: [
          'O tratamento dos seus dados pessoais segue a Lei Geral de Proteção de Dados (Lei 13.709/2018) e está descrito na [Política de Privacidade](/privacy), que faz parte destes termos.',
        ],
      },
      {
        id: 'alteracoes',
        titulo: 'Alterações destes termos',
        blocos: [
          'Podemos atualizar estes termos para acompanhar mudanças na plataforma ou na lei. A versão em vigor fica sempre nesta página, com a data de vigência no topo. Quando a mudança for relevante, avisaremos por e-mail ou por aviso na plataforma antes de ela valer. Continuar usando a plataforma depois disso significa concordar com a nova versão.',
        ],
      },
      {
        id: 'lei',
        titulo: 'Lei aplicável e foro',
        blocos: [
          'Estes termos são regidos pelas leis da República Federativa do Brasil. Fica eleito o foro da Comarca de São Paulo, Estado de São Paulo, para resolver qualquer controvérsia, ressalvado o direito do consumidor de propor a ação no foro do seu domicílio.',
          'Antes de recorrer à Justiça, escreva para ' +
            CONTATO.contato +
            ': a maior parte dos problemas se resolve por conversa.',
        ],
      },
      {
        id: 'gerais',
        titulo: 'Disposições gerais',
        blocos: [
          {
            lista: [
              'Se alguma cláusula for considerada inválida, as demais continuam valendo.',
              'Deixar de exigir o cumprimento de uma regra não significa renunciar a ela.',
              'Estes termos, junto com a Política de Privacidade, formam o acordo completo entre você e o Opus Atlas sobre o uso da plataforma.',
              'Havendo diferença entre a versão em português e a versão em outro idioma, prevalece a versão em português.',
            ],
          },
        ],
      },
      {
        id: 'contato',
        titulo: 'Contato',
        blocos: ['Dúvidas sobre estes termos: ' + CONTATO.contato + '.'],
      },
    ],
  },
  en: {
    titulo: 'Terms of Use',
    abertura:
      'The rules for using Opus Atlas: what we offer, what we expect from the people who use it, and how we settle what does not go as agreed.',
    vigencia: '2026-09-28',
    essencial: [
      'Reading the encyclopedia, listening to the works and downloading public-domain scores is free and needs no account.',
      'You must be **13 or older** to create an account; between 13 and 18, with the permission of a parent or guardian.',
      'What you publish stays yours. You allow us to display it on the platform and you are responsible for having the right to publish it.',
      'Community submissions go live immediately and are reviewed when someone reports them. A copyright report takes the file down at once.',
      'Paid plans renew automatically and can be cancelled at any time, with no fee. Within the first **7 days** after subscribing you may withdraw for a full refund.',
      'You can delete your account whenever you want. Your personal data goes with it; works and scores you added may remain in the collection, without your name.',
    ],
    secoes: [
      {
        id: 'aceitacao',
        titulo: 'Acceptance of these terms',
        blocos: [
          'These Terms of Use govern access to and use of Opus Atlas — the website at opusatlas.com.br, in any language, and the services it offers (the “platform”).',
          'By browsing the platform you agree to these terms. By creating an account, you confirm that you have read and accepted them, together with the [Privacy Policy](/privacy), which explains how we handle your data. If you do not agree, do not use the platform.',
        ],
      },
      {
        id: 'definicoes',
        titulo: 'Definitions',
        blocos: [
          {
            lista: [
              '**Visitor:** anyone browsing without an account.',
              '**User:** anyone with an account, free or paid.',
              '**Teacher:** a user subscribed to one of the plans for teachers — Mentor or Maestro —, which gives access to the teaching portal.',
              '**Student:** a user linked to a teacher through an accepted invitation.',
              '**Collection:** the encyclopedia’s database of composers, works, scores and media.',
              '**User content:** everything a user submits or publishes — collection entries, scores, annotations, comments, videos, ratings, profile texts and teaching-portal materials.',
              '**Paid plans:** the Plus, Mentor and Maestro subscriptions.',
            ],
          },
        ],
      },
      {
        id: 'servico',
        titulo: 'What Opus Atlas offers',
        blocos: [
          'Opus Atlas is a classical music encyclopedia that is also a place to study and to teach. The platform offers:',
          {
            lista: [
              '**Encyclopedia**, open to everyone: composers, works, eras, instruments and genres, with downloadable scores and Spotify and YouTube players.',
              '**Personal study**, with a free account: favorites, the “Want to learn” and “Learned” lists, annotations, achievements and experience points.',
              '**Teaching portal**, for teachers: student invitations, lessons, assignments, calendar, progress reports and a profile in the teacher directory.',
              '**Editorial content**: blog, concert calendar and newsletter.',
            ],
          },
          'Available features depend on the account’s plan, as shown on the [plans page](/pricing). The platform evolves: features may be added, changed or discontinued. When a change reduces what a paid plan offers, we will notify affected subscribers in advance.',
        ],
      },
      {
        id: 'conta',
        titulo: 'Account, minimum age and security',
        blocos: [
          'You can create an account with an e-mail and password or with your Google account. Registration details must be true and kept up to date.',
          'You must be **13 or older** to create an account. Users between 13 and 18 confirm that they have the permission of their parents or guardians, who follow their use of the platform and are responsible for their acts. If we learn that an account belongs to someone under 13, it will be deleted.',
          'Your account is personal and non-transferable. Keep your password secret: you are responsible for what is done with your account. If you suspect unauthorized access, change your password and write to ' +
            CONTATO.suporte +
            '.',
        ],
      },
      {
        id: 'planos',
        titulo: 'Plans, payment and cancellation',
        subsecoes: [
          {
            id: 'planos-precos',
            titulo: 'Prices and billing',
            blocos: [
              'Plans, their features and prices are listed on the [plans page](/pricing). The price shown at the time of purchase applies.',
              'Payments are processed by **Stripe**, in Brazilian reais, on the card you provide. Opus Atlas never receives or stores your card number.',
              'Subscriptions renew automatically at the end of each monthly or yearly period, at the current price, until cancelled. If a plan’s price changes, the change applies from the next renewal, and subscribers are notified before it.',
              'Discount coupons follow the conditions stated for each coupon.',
            ],
          },
          {
            id: 'planos-teste',
            titulo: 'Free trial',
            blocos: [
              'Paid plans may include a free trial, with the length shown on the plans page. When the trial ends the subscription is charged, unless you cancel it before. We send an e-mail when the trial is about to end.',
            ],
          },
          {
            id: 'planos-cancelamento',
            titulo: 'Cancellation, plan changes and withdrawal',
            blocos: [
              'You can change plans or cancel your subscription at any time, with no fee. Once cancelled, the subscription stays active until the end of the period already paid; after that the account returns to the free plan, **keeping your history and progress**.',
              'Moving to a lower plan deletes nothing: a teacher whose new plan allows fewer students keeps all current links, but cannot open new ones while above the limit.',
              'Under the right of withdrawal (article 49 of the Brazilian Consumer Protection Code), you may cancel within **7 days** of subscribing and get a full refund. To do so, write to ' +
                CONTATO.suporte +
                ' within that period.',
              'Outside the withdrawal period, the amount for a period already started is not refunded pro rata, unless the law requires it.',
            ],
          },
        ],
        blocos: [],
      },
      {
        id: 'conteudo-do-usuario',
        titulo: 'Content you publish',
        blocos: [
          'User content remains the property of its creator. By publishing it, you grant Opus Atlas a **free, non-exclusive, worldwide license** to store, reproduce, display, adapt to the platform’s format and distribute that content within the Opus Atlas services while it is published.',
          'Collection entries (composers, works and scores) are contributions to a shared encyclopedia: other users and the team may correct and complete them, and they **may remain in the collection after you delete your account**, without being linked to your name. For these contributions, the license above lasts while they remain in the collection.',
          'Annotations can be private, visible only to you, or public, visible to everyone and open to helpfulness votes from other users.',
          'By publishing, you declare that the content is yours or that you have the right to publish it — because it is in the public domain, licensed or authorized by the rights holder — and that it does not break the law or anyone’s rights. You are responsible for that content.',
        ],
      },
      {
        id: 'moderacao',
        titulo: 'Collection contributions and moderation',
        blocos: [
          'Community submissions **go live immediately**. Review happens on report: anyone can report a composer, a work or a score, and the team reviews it according to severity:',
          {
            tabela: {
              cabecalho: ['Severity', 'Examples', 'Review time'],
              linhas: [
                ['Urgent', 'Copyright, illegal content', 'Within 24 hours'],
                ['High', 'Offensive content, spam', 'Within 3 days'],
                ['Normal', 'Incorrect data, other', 'Within 7 days'],
                ['Low', 'Duplicate', 'Within 30 days'],
              ],
            },
          },
          'A report of copyright infringement or illegal content takes the file down immediately, and the person who submitted it is notified. In other cases the content stays online until a decision is made. Removing content requires a written justification from the team.',
          'The “verified” badge is granted only by the Opus Atlas team. The number of submissions depends on the plan: 3 on the free plan; unlimited on paid plans.',
          'Whoever submitted content can edit and delete it. The team may also edit, correct, merge duplicates or remove content that breaks these terms or the law.',
        ],
      },
      {
        id: 'conduta',
        titulo: 'Code of conduct',
        blocos: [
          'When using Opus Atlas, you agree not to:',
          {
            lista: [
              'publish copyrighted content without the rights holder’s permission;',
              'publish illegal, offensive, discriminatory, violent, defamatory or sexual content, or content exposing other people’s personal data;',
              'harass, threaten or deceive other users, including in the teaching portal;',
              'impersonate another person or organization, or create accounts on behalf of others;',
              'send spam, unauthorized advertising or chain messages;',
              'collect data from the platform or other users by automated means (bots, scraping) or copy the collection in bulk;',
              'circumvent plan limits, security or access measures, overload the infrastructure or exploit flaws;',
              'manipulate experience points, achievements, ratings, votes or statistics;',
              'use the platform for any purpose contrary to the law or to these terms.',
            ],
          },
        ],
      },
      {
        id: 'ensino',
        titulo: 'Teaching portal: teachers and students',
        blocos: [
          'To become a teacher on the platform, just subscribe to one of the plans for teachers: Mentor (up to 7 students) or Maestro (unlimited students). The subscription gives access to the teaching portal and to a profile in the teacher directory.',
          'A teacher–student link starts with the teacher’s invitation and the student’s acceptance; invitations are valid for 30 days. Ending the link does not delete lessons, assignments or history.',
          'Opus Atlas provides the tool. **It is not a party to the relationship between teacher and student**: it does not contract lessons, does not handle payments between them, and does not guarantee the availability, quality or outcome of teaching, nor answer for arrangements made outside the platform.',
          'Teachers are responsible for the information they publish in the directory — background, experience, contact — and must use their students’ data only for their lessons. A teacher’s private notes are not shown to the student.',
          'Students under 18 take part with the permission and supervision of their parents or guardians.',
        ],
      },
      {
        id: 'propriedade',
        titulo: 'Opus Atlas intellectual property',
        blocos: [
          'The Opus Atlas name and brand, logo, design, software, editorial texts and the organization of the collection belong to Opus Atlas or its licensors, and are protected by copyright and industrial property laws.',
          'You may use the platform for study and personal use. Copying, bulk reproduction, resale or redistribution of these elements requires written permission — short quotations with attribution are always welcome.',
          'Scores from IMSLP are in the public domain as indicated by IMSLP; editions, arrangements and translations may carry their own protection, and public-domain status varies from country to country. See [Copyright](/copyright).',
        ],
      },
      {
        id: 'terceiros',
        titulo: 'Third-party services',
        blocos: [
          'Parts of the platform rely on third-party services: Spotify and YouTube players, scores from IMSLP, Google sign-in and payment by Stripe. These services have their own terms and policies, which apply when you use them, and are not controlled by Opus Atlas.',
          'Links to external websites are provided for convenience; we are not responsible for their content.',
        ],
      },
      {
        id: 'anuncios',
        titulo: 'Advertising',
        blocos: [
          'The platform shows ads set up by the team, which may be targeted by instrument, by profile (student or teacher), by device and by period. Advertisers receive only aggregate numbers of impressions and clicks — never your personal data.',
          'Showing an ad does not mean that Opus Atlas endorses the advertised product or service.',
        ],
      },
      {
        id: 'comunicacoes',
        titulo: 'Communications',
        blocos: [
          'We send the e-mails the service needs: account confirmation, password recovery, security notices, teaching-portal invitations and notices, and payment, renewal and end-of-trial notices. While you have an account, these messages are part of the service.',
          'The newsletter is optional: it requires e-mail confirmation and can be cancelled at any time through the link in each message.',
        ],
      },
      {
        id: 'disponibilidade',
        titulo: 'Availability',
        blocos: [
          'We work to keep the platform online, but it may be unavailable due to maintenance, technical or third-party failures, or reasons beyond our control. We do not guarantee uninterrupted or error-free operation.',
        ],
      },
      {
        id: 'responsabilidade',
        titulo: 'Limitation of liability',
        blocos: [
          'The collection is largely built by the community and holds hundreds of thousands of records; it may contain inaccuracies. The information is educational and does not replace specialized sources where accuracy is essential.',
          'User content is the responsibility of whoever published it. Opus Atlas removes content in the cases set out in these terms and when ordered by a court, under the Brazilian Internet Civil Framework (Law 12.965/2014).',
          'To the fullest extent permitted by law, including the Brazilian Consumer Protection Code, Opus Atlas is not liable for indirect damages, loss of profits, the conduct of third-party services, use of the platform contrary to these terms, or the study or teaching results obtained with it. Nothing in these terms removes rights the law grants to consumers.',
        ],
      },
      {
        id: 'encerramento',
        titulo: 'Account deletion, suspension and termination',
        blocos: [
          'You can delete your account at any time from your profile. Deletion asks for your password and first shows what will be erased. It removes your personal data, favorites, study lists, annotations, comments, achievements, notifications, teaching links and newsletter subscription. Works and scores you added may remain in the collection, without being linked to your name. If you have an active subscription, cancel it first.',
          'We may suspend or terminate an account, in whole or in part, in case of breach of these terms or the law, fraud, risk to the security of the platform or of other users, or by order of an authority. Whenever possible we will notify you in advance and explain why. Termination for breach gives no right to a refund of the current period, without prejudice to the right of withdrawal.',
        ],
      },
      {
        id: 'privacidade',
        titulo: 'Privacy',
        blocos: [
          'Your personal data is handled under the Brazilian General Data Protection Law (Law 13.709/2018), as described in the [Privacy Policy](/privacy), which is part of these terms.',
        ],
      },
      {
        id: 'alteracoes',
        titulo: 'Changes to these terms',
        blocos: [
          'We may update these terms to reflect changes to the platform or to the law. The current version is always on this page, with its effective date at the top. When a change is significant, we will notify you by e-mail or by a notice on the platform before it takes effect. Continuing to use the platform afterwards means you accept the new version.',
        ],
      },
      {
        id: 'lei',
        titulo: 'Governing law and jurisdiction',
        blocos: [
          'These terms are governed by the laws of the Federative Republic of Brazil. The courts of the City of São Paulo, State of São Paulo, are chosen to settle any dispute, without prejudice to the consumer’s right to sue in the courts of their own domicile.',
          'Before going to court, write to ' +
            CONTATO.contato +
            ': most problems are solved by talking.',
        ],
      },
      {
        id: 'gerais',
        titulo: 'General provisions',
        blocos: [
          {
            lista: [
              'If any clause is held invalid, the others remain in force.',
              'Not enforcing a rule does not mean waiving it.',
              'These terms, together with the Privacy Policy, are the entire agreement between you and Opus Atlas on the use of the platform.',
              'If the Portuguese version and a version in another language differ, the Portuguese version prevails.',
            ],
          },
        ],
      },
      {
        id: 'contato',
        titulo: 'Contact',
        blocos: ['Questions about these terms: ' + CONTATO.contato + '.'],
      },
    ],
  },
};
