import type { CentralBilingue } from './tipos';

/**
 * Central de Ajuda: como usar cada parte do Opus Atlas, em passos. Os nomes
 * de botão e de menu são os que aparecem na tela — ao renomear um, renomeie
 * aqui também.
 */
export const GUIAS: CentralBilingue = {
  pt: {
    titulo: 'Central de Ajuda',
    abertura:
      'Como usar cada parte do Opus Atlas, passo a passo: da primeira busca ao portal de ensino.',
    grupos: [
      {
        id: 'explorar',
        titulo: 'Explorar o acervo',
        itens: [
          {
            id: 'buscar-obras',
            titulo: 'Encontrar uma obra',
            blocos: [
              {
                numerada: true,
                lista: [
                  'Abra **Obras** no menu.',
                  'Digite o título, o número de opus ou o nome do compositor e toque em **Buscar** (ou Enter).',
                  'Para afinar, abra **Mostrar Filtros** e escolha compositor, instrumento, período ou gênero.',
                  'Alterne entre cards e lista no seletor à direita.',
                ],
              },
            ],
          },
          {
            id: 'buscar-compositores',
            titulo: 'Encontrar um compositor',
            blocos: [
              'Em **Compositores**, busque pelo nome e filtre por período. A página de cada compositor reúne biografia, datas, época, nacionalidade e a lista de obras, que também pode ser filtrada.',
            ],
          },
          {
            id: 'baixar-partituras',
            titulo: 'Baixar uma partitura',
            blocos: [
              {
                numerada: true,
                lista: [
                  'Abra a página da obra.',
                  'Em **Partituras Disponíveis**, escolha entre partituras completas, partes, arranjos e os demais tipos.',
                  'Toque em baixar: o arquivo é um PDF, grátis.',
                ],
              },
              'Na primeira visita a uma obra, o Opus Atlas busca as partituras no IMSLP — leva cerca de um segundo. Veja em [Direitos Autorais](/copyright) o que significa domínio público.',
            ],
          },
          {
            id: 'ouvir',
            titulo: 'Ouvir uma obra',
            blocos: [
              'Na página da obra, a seção **Multimídia** traz os players do Spotify e do YouTube, quando a obra tem gravações encontradas. Os players são carregados dessas plataformas e seguem as regras delas.',
            ],
          },
          {
            id: 'idioma-tema',
            titulo: 'Trocar o idioma ou o tema',
            blocos: [
              'Na barra do topo, o botão com a bandeira alterna entre português e inglês, e o botão ao lado alterna entre o tema escuro e o claro. No telefone, os dois ficam no menu.',
            ],
          },
        ],
      },
      {
        id: 'estudo',
        titulo: 'Estudo pessoal',
        itens: [
          {
            id: 'criar-conta',
            titulo: 'Criar uma conta',
            blocos: [
              {
                numerada: true,
                lista: [
                  'Toque em **Criar Conta**, no topo.',
                  'Use o seu e-mail e uma senha, ou continue com o Google.',
                  'Aceite os [Termos de Uso](/terms) e a [Política de Privacidade](/privacy).',
                  'Se usou e-mail, confirme a conta pelo link que enviamos.',
                ],
              },
              'A conta é gratuita e exige 13 anos ou mais; entre 13 e 18, com autorização dos responsáveis.',
            ],
          },
          {
            id: 'favoritos',
            titulo: 'Guardar favoritos',
            blocos: [
              'Toque no coração em qualquer compositor, obra ou partitura. Tudo o que você favoritou fica em **Favoritos**, no menu da sua conta, com busca e separado por tipo.',
            ],
          },
          {
            id: 'quero-aprender',
            titulo: 'Organizar o que quero aprender',
            blocos: [
              {
                numerada: true,
                lista: [
                  'Na página da obra, toque em **Quero estudar**.',
                  'Defina a prioridade, a motivação e, se quiser, a partitura que vai usar.',
                  'Quando terminar, toque em **Já aprendi** e registre o nível de domínio, as datas e as dificuldades.',
                ],
              },
              'As duas listas ficam em **Lições**, no menu da sua conta.',
            ],
          },
          {
            id: 'anotacoes',
            titulo: 'Escrever anotações',
            blocos: [
              'Na página da obra, em **Anotações**, toque em **Nova Anotação**. Escolha a categoria (interpretação, técnica, teoria, estudo, contexto histórico), indique compassos ou movimento e decida se ela é **privada**, só sua, ou **pública**, visível para todos. Anotações públicas recebem votos de utilidade da comunidade. Todas as suas ficam em **Anotações**, no menu da conta.',
            ],
          },
          {
            id: 'conquistas',
            titulo: 'Conquistas e pontos',
            blocos: [
              'Estudar, contribuir e anotar rendem pontos de experiência e medalhas. O sistema calcula o seu progresso sozinho — ninguém concede medalha a si mesmo.',
            ],
          },
        ],
      },
      {
        id: 'contribuir',
        titulo: 'Contribuir com o acervo',
        itens: [
          {
            id: 'enviar',
            titulo: 'Cadastrar compositor, obra ou partitura',
            blocos: [
              {
                numerada: true,
                lista: [
                  'Abra **Uploads**, no menu da sua conta.',
                  'Escolha o que vai cadastrar: compositor, obra ou partitura.',
                  'Se a obra ou o compositor estiver no IMSLP, cole o link: nome, datas, biografia, nacionalidade e época são preenchidos para você.',
                  'Confira os dados e envie.',
                ],
              },
              'O envio entra no ar na hora. O sistema avisa quando algo parecido já existe ("W. A. Mozart" e "Mozart, Wolfgang Amadeus" são o mesmo compositor). O plano gratuito permite 3 envios; os pagos, ilimitados.',
            ],
          },
          {
            id: 'editar-envio',
            titulo: 'Editar ou excluir o que enviei',
            blocos: [
              'Em **Uploads**, cada item enviado por você pode ser editado ou excluído. O histórico das suas contribuições fica na mesma página.',
            ],
          },
          {
            id: 'denunciar',
            titulo: 'Denunciar um problema no acervo',
            blocos: [
              'Na página da obra, do compositor ou da partitura, use o botão de denúncia (a bandeira) e escolha o motivo: conteúdo inapropriado, violação de direitos autorais, informação falsa, spam, duplicado ou outro. A equipe analisa pela gravidade — direito autoral em até 24 horas. Veja os prazos nos [Termos de Uso](/terms).',
            ],
          },
        ],
      },
      {
        id: 'ensino',
        titulo: 'Professores e alunos',
        itens: [
          {
            id: 'ser-professor',
            titulo: 'Tornar-se professor',
            blocos: [
              'Assine um dos planos para professores em [Preços](/pricing): **Mentor**, para até 7 alunos, ou **Maestro**, para alunos ilimitados. A assinatura libera o portal de ensino — alunos, aulas, tarefas, calendário e relatórios — e o perfil no diretório de professores. Cada plano tem período de teste grátis.',
            ],
          },
          {
            id: 'convidar-aluno',
            titulo: 'Convidar um aluno',
            blocos: [
              'Na **Área do Professor**, em alunos, informe o e-mail do aluno. Ele recebe um convite válido por 30 dias e aceita pelo link. Depois do aceite, os dois compartilham aulas, tarefas, calendário e relatórios de progresso.',
            ],
          },
          {
            id: 'aceitar-convite',
            titulo: 'Aceitar o convite de um professor',
            blocos: [
              'Abra o e-mail de convite e siga o link para aceitar ou recusar. O convite vale 30 dias, e você pode ter convites de mais de um professor ao mesmo tempo. As aulas e tarefas aparecem na **Área do Aluno**.',
            ],
          },
          {
            id: 'diretorio',
            titulo: 'Aparecer no diretório de professores',
            blocos: [
              'Professores com plano Mentor ou Maestro e perfil público aparecem em [Professores](/teachers), com formação, experiência, especialidades e contato. O plano Maestro tem destaque e selo.',
            ],
          },
        ],
      },
      {
        id: 'conta',
        titulo: 'Conta, plano e dados',
        itens: [
          {
            id: 'perfil',
            titulo: 'Editar o perfil',
            blocos: [
              'Em **Meu Perfil** estão as abas Informações Básicas, Meus Instrumentos, Preferências Musicais, Configurações de Privacidade (perfil público, mostrar localização) e Configurações da Conta.',
            ],
          },
          {
            id: 'email-senha',
            titulo: 'Trocar o e-mail ou a senha',
            blocos: [
              'Em **Meu Perfil → Configurações da Conta**, use **Alterar Email** ou **Alterar Senha**; os dois pedem a senha atual. A troca de e-mail só vale depois que você confirma pelo link enviado ao novo endereço, e o endereço antigo recebe um aviso de segurança. Quem entrou com o Google pode **Definir Senha** para entrar também com e-mail.',
            ],
          },
          {
            id: 'assinatura',
            titulo: 'Assinar, trocar ou cancelar um plano',
            blocos: [
              'Os planos estão em [Preços](/pricing). Para gerenciar uma assinatura, vá a **Meu Perfil → Configurações da Conta → Assinatura**: lá você cancela, reativa ou abre o portal de pagamento da Stripe para trocar o cartão e ver as faturas. Cancelada, a assinatura continua até o fim do período pago.',
            ],
          },
          {
            id: 'exportar',
            titulo: 'Exportar os meus dados',
            blocos: [
              'Em **Meu Perfil → Configurações da Conta → Seus dados**, toque em **Exportar meus dados**: você baixa um arquivo com tudo o que é seu na plataforma. Dá para exportar até 3 vezes por hora.',
            ],
          },
          {
            id: 'excluir',
            titulo: 'Excluir a conta',
            blocos: [
              'Em **Meu Perfil → Configurações da Conta → Zona de Perigo**, toque em **Deletar Conta**. Antes, o Opus Atlas mostra o que será apagado e pede a sua senha. Obras e partituras que você cadastrou podem continuar no acervo, sem o seu nome. Se tiver uma assinatura ativa, cancele-a antes.',
            ],
          },
          {
            id: 'newsletter',
            titulo: 'Assinar ou cancelar a newsletter',
            blocos: [
              'Informe o seu e-mail no rodapé e confirme pelo link que enviamos. Para sair, use o link de cancelamento que vem em toda mensagem.',
            ],
          },
        ],
      },
    ],
  },
  en: {
    titulo: 'Help Center',
    abertura:
      'How to use each part of Opus Atlas, step by step: from your first search to the teaching portal.',
    grupos: [
      {
        id: 'explorar',
        titulo: 'Exploring the collection',
        itens: [
          {
            id: 'buscar-obras',
            titulo: 'Find a work',
            blocos: [
              {
                numerada: true,
                lista: [
                  'Open **Works** in the menu.',
                  'Type the title, opus number or composer’s name and tap **Search** (or Enter).',
                  'To narrow it down, open **Show Filters** and pick composer, instrument, era or genre.',
                  'Switch between cards and list with the toggle on the right.',
                ],
              },
            ],
          },
          {
            id: 'buscar-compositores',
            titulo: 'Find a composer',
            blocos: [
              'In **Composers**, search by name and filter by era. Each composer page brings together the biography, dates, era, nationality and the list of works, which can also be filtered.',
            ],
          },
          {
            id: 'baixar-partituras',
            titulo: 'Download a score',
            blocos: [
              {
                numerada: true,
                lista: [
                  'Open the work’s page.',
                  'Under **Available Scores**, choose between complete scores, parts, arrangements and the other types.',
                  'Tap download: the file is a free PDF.',
                ],
              },
              'On a work’s first visit, Opus Atlas fetches the scores from IMSLP — it takes about a second. See [Copyright](/copyright) for what the public domain means.',
            ],
          },
          {
            id: 'ouvir',
            titulo: 'Listen to a work',
            blocos: [
              'On the work’s page, the **Multimedia** section has Spotify and YouTube players, when recordings of the work were found. The players load from those platforms and follow their rules.',
            ],
          },
          {
            id: 'idioma-tema',
            titulo: 'Change language or theme',
            blocos: [
              'In the top bar, the flag button switches between Portuguese and English, and the button next to it switches between dark and light themes. On a phone, both are in the menu.',
            ],
          },
        ],
      },
      {
        id: 'estudo',
        titulo: 'Personal study',
        itens: [
          {
            id: 'criar-conta',
            titulo: 'Create an account',
            blocos: [
              {
                numerada: true,
                lista: [
                  'Tap **Create Account** at the top.',
                  'Use your e-mail and a password, or continue with Google.',
                  'Accept the [Terms of Use](/terms) and the [Privacy Policy](/privacy).',
                  'If you used e-mail, confirm the account through the link we send.',
                ],
              },
              'The account is free and requires being 13 or older; between 13 and 18, with a parent’s or guardian’s permission.',
            ],
          },
          {
            id: 'favoritos',
            titulo: 'Save favorites',
            blocos: [
              'Tap the heart on any composer, work or score. Everything you saved is in **Favorites**, in your account menu, searchable and grouped by type.',
            ],
          },
          {
            id: 'quero-aprender',
            titulo: 'Plan what you want to learn',
            blocos: [
              {
                numerada: true,
                lista: [
                  'On the work’s page, tap **Want to study**.',
                  'Set the priority, your motivation and, if you like, the score you will use.',
                  'When you are done, tap **Already Learned** and record your mastery level, dates and difficulties.',
                ],
              },
              'Both lists are in **Lesson**, in your account menu.',
            ],
          },
          {
            id: 'anotacoes',
            titulo: 'Write annotations',
            blocos: [
              'On the work’s page, under **Annotations**, tap **New Annotation**. Pick a category (interpretation, technique, theory, practice, historical context), point to measures or movement and choose whether it is **private**, only yours, or **public**, visible to everyone. Public annotations get helpfulness votes from the community. All of yours are in **Annotations**, in the account menu.',
            ],
          },
          {
            id: 'conquistas',
            titulo: 'Achievements and points',
            blocos: [
              'Studying, contributing and annotating earn experience points and medals. The system calculates your progress on its own — nobody grants themselves a medal.',
            ],
          },
        ],
      },
      {
        id: 'contribuir',
        titulo: 'Contributing to the collection',
        itens: [
          {
            id: 'enviar',
            titulo: 'Add a composer, work or score',
            blocos: [
              {
                numerada: true,
                lista: [
                  'Open **Uploads**, in your account menu.',
                  'Choose what to add: composer, work or score.',
                  'If the work or composer is on IMSLP, paste the link: name, dates, biography, nationality and era are filled in for you.',
                  'Check the details and submit.',
                ],
              },
              'The submission goes live immediately. The system warns you when something similar already exists (“W. A. Mozart” and “Mozart, Wolfgang Amadeus” are the same composer). The free plan allows 3 submissions; paid plans, unlimited.',
            ],
          },
          {
            id: 'editar-envio',
            titulo: 'Edit or delete what you submitted',
            blocos: [
              'In **Uploads**, every item you submitted can be edited or deleted. Your contribution history is on the same page.',
            ],
          },
          {
            id: 'denunciar',
            titulo: 'Report a problem in the collection',
            blocos: [
              'On the work, composer or score page, use the report button (the flag) and choose the reason: inappropriate content, copyright infringement, false information, spam, duplicate or other. The team reviews by severity — copyright within 24 hours. See the time frames in the [Terms of Use](/terms).',
            ],
          },
        ],
      },
      {
        id: 'ensino',
        titulo: 'Teachers and students',
        itens: [
          {
            id: 'ser-professor',
            titulo: 'Become a teacher',
            blocos: [
              'Subscribe to one of the plans for teachers on [Pricing](/pricing): **Mentor**, for up to 7 students, or **Maestro**, for unlimited students. The subscription unlocks the teaching portal — students, lessons, assignments, calendar and reports — and the teacher directory profile. Each plan has a free trial.',
            ],
          },
          {
            id: 'convidar-aluno',
            titulo: 'Invite a student',
            blocos: [
              'In the **Teacher panel**, under students, enter the student’s e-mail. They get an invitation valid for 30 days and accept it through the link. After that, the two of you share lessons, assignments, calendar and progress reports.',
            ],
          },
          {
            id: 'aceitar-convite',
            titulo: 'Accept a teacher’s invitation',
            blocos: [
              'Open the invitation e-mail and follow the link to accept or decline. It is valid for 30 days, and you can hold invitations from more than one teacher at a time. Lessons and assignments show up in the **Student panel**.',
            ],
          },
          {
            id: 'diretorio',
            titulo: 'Appear in the teacher directory',
            blocos: [
              'Teachers on the Mentor or Maestro plan with a public profile appear in [Teachers](/teachers), with background, experience, specialties and contact. The Maestro plan gets highlighting and a badge.',
            ],
          },
        ],
      },
      {
        id: 'conta',
        titulo: 'Account, plan and data',
        itens: [
          {
            id: 'perfil',
            titulo: 'Edit your profile',
            blocos: [
              '**My profile** has the tabs Basic Information, My Instruments, Musical Preferences, Privacy Settings (public profile, show location) and Account Settings.',
            ],
          },
          {
            id: 'email-senha',
            titulo: 'Change your e-mail or password',
            blocos: [
              'In **My profile → Account Settings**, use **Change Email** or **Change Password**; both ask for your current password. An e-mail change only takes effect after you confirm it through the link sent to the new address, and the old address gets a security notice. If you signed in with Google, you can **Set Password** to also sign in with e-mail.',
            ],
          },
          {
            id: 'assinatura',
            titulo: 'Subscribe, change or cancel a plan',
            blocos: [
              'Plans are on [Pricing](/pricing). To manage a subscription, go to **My profile → Account Settings → Subscription**: there you cancel, reactivate or open Stripe’s payment portal to change your card and see invoices. Once cancelled, the subscription lasts until the end of the paid period.',
            ],
          },
          {
            id: 'exportar',
            titulo: 'Export your data',
            blocos: [
              'In **My profile → Account Settings → Your data**, tap **Export my data**: you download a file with everything that is yours on the platform. You can export up to 3 times per hour.',
            ],
          },
          {
            id: 'excluir',
            titulo: 'Delete your account',
            blocos: [
              'In **My profile → Account Settings → Danger Zone**, tap **Delete Account**. First, Opus Atlas shows what will be erased and asks for your password. Works and scores you added may remain in the collection, without your name. If you have an active subscription, cancel it first.',
            ],
          },
          {
            id: 'newsletter',
            titulo: 'Subscribe to or leave the newsletter',
            blocos: [
              'Enter your e-mail in the footer and confirm through the link we send. To leave, use the unsubscribe link included in every message.',
            ],
          },
        ],
      },
    ],
  },
};
