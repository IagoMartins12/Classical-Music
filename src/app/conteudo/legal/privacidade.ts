import { CONTATO } from '@/app/utils/contato';
import { identificacaoDaEmpresa } from '@/app/utils/empresa';
import type { DocumentoBilingue } from './tipos';

/**
 * Política de Privacidade do Opus Atlas.
 *
 * Cada dado, serviço, cookie e prazo daqui existe no sistema (campos do banco,
 * variáveis de ambiente da API, cookies do front, RN-2 e RN-5 do cérebro de
 * negócio). Ao coletar um dado novo, contratar um serviço novo ou mudar um
 * prazo, atualize a política — e a data de vigência.
 */
export const PRIVACIDADE: DocumentoBilingue = {
  pt: {
    titulo: 'Política de Privacidade',
    abertura:
      'Quais dados pessoais o Opus Atlas trata, por que, com quem os compartilha, por quanto tempo os guarda e como você exerce os seus direitos — nos termos da Lei Geral de Proteção de Dados.',
    vigencia: '2026-09-28',
    essencial: [
      'Coletamos o que você nos informa (cadastro, perfil, estudo, publicações) e o necessário para a plataforma funcionar e ficar segura.',
      '**Não vendemos dados pessoais.** Anunciantes recebem apenas números agregados.',
      'Sua senha é guardada cifrada (Argon2). O pagamento é feito pela Stripe: o número do seu cartão nunca passa por nós.',
      'Alguns fornecedores ficam fora do Brasil — pagamento, arquivos, e-mail, métricas. Todos estão listados aqui.',
      'No seu perfil você edita os seus dados, **exporta tudo** o que é seu e exclui a conta.',
      'Dúvidas e pedidos sobre dados pessoais: ' + CONTATO.privacidade + '.',
    ],
    secoes: [
      {
        id: 'sobre',
        titulo: 'Sobre esta política',
        blocos: [
          'Esta política vale para o Opus Atlas — o site em opusatlas.com.br, em qualquer idioma, e os serviços oferecidos por ele — e segue a Lei Geral de Proteção de Dados Pessoais (Lei 13.709/2018, a “LGPD”), o Marco Civil da Internet (Lei 12.965/2014) e o Código de Defesa do Consumidor.',
          ...identificacaoDaEmpresa('pt'),
          'O Opus Atlas é o controlador dos dados pessoais tratados na plataforma. O canal do encarregado pelo tratamento de dados é ' +
            CONTATO.privacidade +
            '.',
        ],
      },
      {
        id: 'dados',
        titulo: 'Quais dados tratamos',
        blocos: [],
        subsecoes: [
          {
            id: 'dados-informados',
            titulo: 'Dados que você nos informa',
            blocos: [
              {
                lista: [
                  '**Cadastro:** nome, sobrenome, e-mail e senha. A senha é guardada apenas como hash criptográfico (Argon2), nunca em texto.',
                  '**Login com Google:** nome, e-mail e foto do perfil, enviados pelo Google com a sua autorização.',
                  '**Perfil:** nome de usuário, foto, biografia, cidade, estado, país, telefone, instrumentos, preferências musicais, compositor e época favoritos, tempo de prática e as suas escolhas de visibilidade (perfil público, mostrar localização).',
                  '**Estudo:** favoritos (compositores, obras, partituras), a lista “Quero aprender” (prioridade, motivação, partitura escolhida), a lista “Já aprendi” (datas, nível de domínio, dificuldades, observações) e os vídeos de performance que você enviar.',
                  '**Publicações:** cadastros no acervo, partituras, anotações, comentários, curtidas e artigos salvos no blog, votos de utilidade e denúncias.',
                  '**Portal de ensino — professores:** biografia, formação, experiência, conquistas, especialidades, instrumentos, método, faixas etárias e níveis atendidos, site, redes sociais, foto, fuso horário e disponibilidade.',
                  '**Portal de ensino — alunos:** instrumento principal, objetivos, formação musical, rotina e ritmo de estudo, preferências de contato e de lembretes e, se você quiser informar, necessidades específicas de aprendizagem. Aulas, tarefas, entregas, relatórios de progresso e as notas privadas que o professor escreve sobre o aluno também ficam registrados.',
                  '**Contato:** nome, e-mail, assunto, categoria e mensagem enviados pelo fale-conosco.',
                  '**Newsletter:** e-mail, idioma, fuso horário, frequência e interesses.',
                ],
              },
            ],
          },
          {
            id: 'dados-automaticos',
            titulo: 'Dados gerados pelo uso',
            blocos: [
              {
                lista: [
                  '**Sessão:** cookies que mantêm você conectado (veja [Cookies](#cookies)) e a data da sua última atividade.',
                  '**Endereço IP:** registrado quando você pede a troca de e-mail (ele aparece no aviso de segurança que enviamos), quando envia uma mensagem pelo fale-conosco e nas ações da equipe administrativa. Também é usado de forma passageira para limitar tentativas repetidas.',
                  '**Audiência:** visitas a artigos e impressões e cliques de anúncios são contados por pessoa, sem guardar o endereço IP.',
                  '**Métricas de navegação:** páginas visitadas, tipo de dispositivo, navegador e região aproximada, pelo Google Analytics, no site em produção.',
                  '**Erros técnicos:** quando algo falha, o registro do erro pode incluir o identificador interno da sua conta — nunca o seu nome ou e-mail.',
                ],
              },
            ],
          },
          {
            id: 'dados-pagamento',
            titulo: 'Dados de pagamento',
            blocos: [
              'Quem processa o pagamento é a **Stripe**. Os dados do cartão são informados diretamente a ela; o Opus Atlas não os recebe nem os armazena. Guardamos o plano, os valores, as datas, o cupom usado e os identificadores da assinatura e do cliente na Stripe.',
            ],
          },
          {
            id: 'dados-sensiveis',
            titulo: 'Dados sensíveis',
            blocos: [
              'Não pedimos dados sensíveis. O único campo que pode conter um — necessidades específicas de aprendizagem, no perfil de aluno — é opcional: preenchê-lo é o seu consentimento para que essa informação seja usada no acompanhamento pelo professor. Você pode apagá-la quando quiser.',
            ],
          },
        ],
      },
      {
        id: 'finalidades',
        titulo: 'Para que usamos e com que base legal',
        blocos: [
          'Cada tratamento tem uma finalidade e uma base legal da LGPD (arts. 7º e 11):',
          {
            tabela: {
              cabecalho: ['Finalidade', 'Base legal'],
              linhas: [
                [
                  'Criar e manter a conta, autenticar o acesso',
                  'Execução de contrato',
                ],
                [
                  'Oferecer favoritos, listas de estudo, anotações e conquistas',
                  'Execução de contrato',
                ],
                [
                  'Operar o portal de ensino entre professor e aluno',
                  'Execução de contrato',
                ],
                [
                  'Cobrar planos pagos e emitir comprovantes',
                  'Execução de contrato; cumprimento de obrigação legal',
                ],
                [
                  'Enviar e-mails de conta, segurança, ensino e pagamento',
                  'Execução de contrato',
                ],
                [
                  'Enviar a newsletter',
                  'Consentimento, que pode ser revogado a qualquer momento',
                ],
                [
                  'Proteger a plataforma, prevenir fraudes, limitar tentativas e registrar ações administrativas',
                  'Legítimo interesse; exercício regular de direitos',
                ],
                ['Medir o uso e melhorar a plataforma', 'Legítimo interesse'],
                [
                  'Exibir anúncios direcionados por instrumento, perfil e dispositivo',
                  'Legítimo interesse',
                ],
                [
                  'Analisar denúncias e moderar conteúdo',
                  'Legítimo interesse; cumprimento de obrigação legal',
                ],
                [
                  'Tratar necessidades específicas de aprendizagem informadas pelo aluno',
                  'Consentimento',
                ],
                [
                  'Atender autoridades e ordens judiciais',
                  'Cumprimento de obrigação legal',
                ],
              ],
            },
          },
          'Quando o tratamento se apoia em legítimo interesse, usamos apenas os dados necessários e respeitamos as suas expectativas e os seus direitos. Você pode se opor a ele pelo canal do encarregado.',
        ],
      },
      {
        id: 'menores',
        titulo: 'Crianças e adolescentes',
        blocos: [
          'A plataforma não é destinada a menores de 13 anos, e não criamos contas para eles de forma consciente. De 13 a 18 anos, a conta depende da autorização dos pais ou responsáveis, e os dados são tratados no melhor interesse do adolescente, como manda o art. 14 da LGPD. Se soubermos de uma conta de alguém com menos de 13 anos, ela será excluída. Pais e responsáveis podem pedir a exclusão pelo e-mail ' +
            CONTATO.privacidade +
            '.',
        ],
      },
      {
        id: 'compartilhamento',
        titulo: 'Com quem compartilhamos',
        blocos: [
          '**Não vendemos nem alugamos dados pessoais.** Eles são compartilhados apenas com os fornecedores que fazem a plataforma funcionar, e só no necessário para cada serviço:',
          {
            tabela: {
              cabecalho: ['Fornecedor', 'Para quê', 'Onde'],
              linhas: [
                [
                  'Stripe',
                  'Processar pagamentos e assinaturas',
                  'Estados Unidos e outros',
                ],
                [
                  'Google',
                  'Login com Google; narração em áudio dos artigos do blog (recebe só o texto do artigo)',
                  'Estados Unidos e outros',
                ],
                [
                  'Cloudinary',
                  'Guardar e entregar imagens, fotos de perfil e arquivos enviados',
                  'Estados Unidos',
                ],
                [
                  'Provedor de e-mail',
                  'Entregar os e-mails da plataforma',
                  'Conforme o provedor',
                ],
                [
                  'Google Analytics',
                  'Métricas de navegação',
                  'Estados Unidos e outros',
                ],
                [
                  'Sentry',
                  'Registro de erros técnicos (sem nome ou e-mail)',
                  'Estados Unidos e outros',
                ],
                [
                  'Hospedagem, banco de dados, cache e cópias de segurança',
                  'Manter a plataforma no ar e os dados guardados',
                  'Provedores de nuvem',
                ],
              ],
            },
          },
          'Serviços de inteligência artificial (Anthropic, OpenAI e Groq) são usados para redigir biografias de compositores e recebem apenas dados sobre os compositores — **nenhum dado pessoal de usuários**.',
          'Os players do Spotify e do YouTube são carregados das plataformas deles, que podem coletar dados de navegação conforme as próprias políticas.',
          'O que você torna público — perfil público, anotações públicas, contribuições ao acervo, comentários e, para professores, o perfil e o contato no diretório — fica visível para outros usuários e visitantes. Entre professor e aluno vinculados, as informações do portal de ensino são compartilhadas entre os dois.',
          'Também podemos compartilhar dados quando a lei exigir, por ordem judicial ou de autoridade competente, ou para defender direitos do Opus Atlas e de seus usuários.',
        ],
      },
      {
        id: 'transferencia',
        titulo: 'Transferência internacional',
        blocos: [
          'Alguns fornecedores guardam ou processam dados fora do Brasil. Essa transferência acontece nas hipóteses do art. 33 da LGPD — em especial, quando é necessária para executar o contrato com você — e apenas com fornecedores que tratam os dados para prestar o serviço contratado pelo Opus Atlas.',
        ],
      },
      {
        id: 'cookies',
        titulo: 'Cookies e armazenamento no navegador',
        blocos: [
          {
            tabela: {
              cabecalho: ['Tipo', 'O que guarda', 'Duração'],
              linhas: [
                [
                  'Essenciais — sessão (opus_access_token, opus_refresh_token e opus_session)',
                  'Mantêm você conectado. Os tokens de acesso e de renovação não podem ser lidos por scripts da página; o opus_session só indica que há uma sessão e não guarda segredo algum.',
                  'Acesso de 15 minutos, renovado por até 7 dias',
                ],
                [
                  'Essencial — idioma (opus-atlas-language)',
                  'O idioma que você escolheu',
                  'Persistente',
                ],
                [
                  'Preferências (armazenamento local)',
                  'Tema claro ou escuro, tamanho da letra dos artigos, buscas recentes, anúncios dispensados e uma cópia local de favoritos e estudos, para a tela abrir rápido',
                  'Até você limpar o navegador',
                ],
                [
                  'Métricas (Google Analytics)',
                  'Contagem de visitas e navegação',
                  'Conforme o Google',
                ],
              ],
            },
          },
          'Você pode apagar ou bloquear cookies nas configurações do navegador; sem os essenciais, porém, não é possível entrar na conta. Para não ser medido pelo Google Analytics, use o complemento de desativação oferecido pelo Google.',
        ],
      },
      {
        id: 'retencao',
        titulo: 'Por quanto tempo guardamos',
        blocos: [
          {
            lista: [
              '**Conta e perfil:** enquanto a conta existir. Ao excluí-la, apagamos os dados pessoais, favoritos, listas de estudo, anotações, comentários, conquistas, notificações, vínculos de ensino e a inscrição na newsletter.',
              '**Contribuições ao acervo:** obras e partituras que você cadastrou podem continuar no acervo depois da exclusão da conta, sem vínculo com o seu nome.',
              '**Registros de ações administrativas:** 90 dias para consultas, 2 anos para alterações e 5 anos para ações graves (excluir conta, mudar papel, cobrança, extrair dados pessoais).',
              '**Pagamentos e obrigações legais:** pelo prazo que a lei exigir. A Stripe mantém os próprios registros conforme a política dela.',
              '**Newsletter:** até você cancelar a inscrição. Endereços que retornam permanentemente ou marcam a mensagem como spam saem da lista.',
              '**Cópias de segurança:** podem conter dados já excluídos por um período limitado, até serem substituídas.',
            ],
          },
        ],
      },
      {
        id: 'direitos',
        titulo: 'Seus direitos',
        blocos: [
          'Pelo art. 18 da LGPD, você pode pedir, a qualquer momento:',
          {
            lista: [
              'confirmação de que tratamos os seus dados e acesso a eles;',
              'correção de dados incompletos, inexatos ou desatualizados;',
              'anonimização, bloqueio ou eliminação de dados desnecessários, excessivos ou tratados em desconformidade com a lei;',
              'portabilidade dos seus dados;',
              'eliminação dos dados tratados com o seu consentimento;',
              'informação sobre com quem compartilhamos os seus dados;',
              'informação sobre a possibilidade de não consentir e as consequências da recusa;',
              'revogação do consentimento;',
              'oposição a um tratamento feito sem consentimento, quando ele não cumprir a lei.',
            ],
          },
          'Muita coisa você faz sozinho, no seu perfil: **editar** os dados, **exportar** tudo o que é seu num arquivo (até 3 vezes por hora) e **excluir** a conta. O arquivo exportado não inclui credenciais, os registros administrativos nem as notas privadas que um professor escreveu sobre você — e diz isso no próprio arquivo.',
          'Para os demais pedidos, escreva para ' +
            CONTATO.privacidade +
            '. Podemos pedir informações para confirmar a sua identidade. Respondemos em até 15 dias. Você também pode reclamar à Autoridade Nacional de Proteção de Dados (ANPD).',
          'O Opus Atlas não toma decisões exclusivamente automatizadas que afetem os seus interesses.',
        ],
      },
      {
        id: 'seguranca',
        titulo: 'Segurança',
        blocos: [
          'Protegemos os seus dados com medidas técnicas e administrativas, entre elas:',
          {
            lista: [
              'conexão cifrada (HTTPS) em todo o site;',
              'senhas guardadas apenas como hash Argon2;',
              'cookies de sessão inacessíveis a scripts, com acesso curto (15 minutos) e renovação controlada;',
              'acesso ao painel restrito por papel, com registro das ações administrativas;',
              'limite de tentativas contra abuso e força bruta;',
              'monitoramento de erros e cópias de segurança em armazenamento privado;',
              'confirmação por senha para excluir a conta e trocar o e-mail.',
            ],
          },
          'Nenhum sistema é totalmente imune a incidentes. Se um incidente de segurança puder causar risco ou dano relevante, comunicaremos a ANPD e as pessoas afetadas, como determina o art. 48 da LGPD.',
        ],
      },
      {
        id: 'alteracoes',
        titulo: 'Alterações desta política',
        blocos: [
          'Podemos atualizar esta política para acompanhar mudanças na plataforma, nos fornecedores ou na lei. A versão em vigor fica sempre nesta página, com a data de vigência no topo. Mudanças relevantes serão avisadas por e-mail ou por aviso na plataforma.',
        ],
      },
      {
        id: 'contato',
        titulo: 'Encarregado e contato',
        blocos: [
          'Pedidos sobre dados pessoais, dúvidas sobre esta política e comunicações da ANPD: ' +
            CONTATO.privacidade +
            '.',
        ],
      },
    ],
  },
  en: {
    titulo: 'Privacy Policy',
    abertura:
      'Which personal data Opus Atlas handles, why, who it is shared with, how long it is kept and how you exercise your rights — under the Brazilian General Data Protection Law.',
    vigencia: '2026-09-28',
    essencial: [
      'We collect what you tell us (registration, profile, study, posts) and what the platform needs to work and stay secure.',
      '**We do not sell personal data.** Advertisers only receive aggregate numbers.',
      'Your password is stored hashed (Argon2). Payments go through Stripe: your card number never passes through us.',
      'Some providers are outside Brazil — payment, files, e-mail, analytics. All of them are listed here.',
      'In your profile you can edit your data, **export everything** that is yours and delete your account.',
      'Questions and requests about personal data: ' +
        CONTATO.privacidade +
        '.',
    ],
    secoes: [
      {
        id: 'sobre',
        titulo: 'About this policy',
        blocos: [
          'This policy applies to Opus Atlas — the website at opusatlas.com.br, in any language, and the services it offers — and follows the Brazilian General Data Protection Law (Law 13.709/2018, “LGPD”), the Brazilian Internet Civil Framework (Law 12.965/2014) and the Consumer Protection Code.',
          ...identificacaoDaEmpresa('en'),
          'Opus Atlas is the controller of the personal data processed on the platform. The data protection officer can be reached at ' +
            CONTATO.privacidade +
            '.',
        ],
      },
      {
        id: 'dados',
        titulo: 'Which data we process',
        blocos: [],
        subsecoes: [
          {
            id: 'dados-informados',
            titulo: 'Data you give us',
            blocos: [
              {
                lista: [
                  '**Registration:** first name, last name, e-mail and password. The password is stored only as a cryptographic hash (Argon2), never as text.',
                  '**Google sign-in:** name, e-mail and profile photo, sent by Google with your authorization.',
                  '**Profile:** username, photo, bio, city, state, country, phone, instruments, musical preferences, favorite composer and era, practice time and your visibility choices (public profile, show location).',
                  '**Study:** favorites (composers, works, scores), the “Want to learn” list (priority, motivation, chosen score), the “Learned” list (dates, mastery level, difficulties, notes) and the performance videos you upload.',
                  '**Posts:** collection entries, scores, annotations, comments, blog likes and bookmarks, helpfulness votes and reports.',
                  '**Teaching portal — teachers:** bio, background, experience, achievements, specialties, instruments, method, age groups and levels taught, website, social networks, photo, time zone and availability.',
                  '**Teaching portal — students:** main instrument, goals, musical background, study routine and pace, contact and reminder preferences and, if you choose to share it, specific learning needs. Lessons, assignments, submissions, progress reports and the private notes a teacher writes about a student are also recorded.',
                  '**Contact:** name, e-mail, subject, category and message sent through the contact form.',
                  '**Newsletter:** e-mail, language, time zone, frequency and interests.',
                ],
              },
            ],
          },
          {
            id: 'dados-automaticos',
            titulo: 'Data generated by use',
            blocos: [
              {
                lista: [
                  '**Session:** cookies that keep you signed in (see [Cookies](#cookies)) and the date of your last activity.',
                  '**IP address:** recorded when you request an e-mail change (it appears in the security notice we send), when you send a message through the contact form and on actions by the administrative team. It is also used briefly to limit repeated attempts.',
                  '**Audience:** article visits and ad impressions and clicks are counted per person, without storing the IP address.',
                  '**Browsing metrics:** pages visited, device type, browser and approximate region, through Google Analytics, on the production site.',
                  '**Technical errors:** when something fails, the error record may include your account’s internal identifier — never your name or e-mail.',
                ],
              },
            ],
          },
          {
            id: 'dados-pagamento',
            titulo: 'Payment data',
            blocos: [
              'Payments are processed by **Stripe**. Card details are given directly to Stripe; Opus Atlas neither receives nor stores them. We keep the plan, amounts, dates, coupon used and the Stripe subscription and customer identifiers.',
            ],
          },
          {
            id: 'dados-sensiveis',
            titulo: 'Sensitive data',
            blocos: [
              'We do not ask for sensitive data. The only field that may contain it — specific learning needs, in the student profile — is optional: filling it in is your consent for that information to be used in the teacher’s follow-up. You can erase it whenever you want.',
            ],
          },
        ],
      },
      {
        id: 'finalidades',
        titulo: 'Why we use it and on what legal basis',
        blocos: [
          'Each processing activity has a purpose and a legal basis under the LGPD (articles 7 and 11):',
          {
            tabela: {
              cabecalho: ['Purpose', 'Legal basis'],
              linhas: [
                [
                  'Create and maintain the account, authenticate access',
                  'Performance of contract',
                ],
                [
                  'Provide favorites, study lists, annotations and achievements',
                  'Performance of contract',
                ],
                [
                  'Run the teaching portal between teacher and student',
                  'Performance of contract',
                ],
                [
                  'Bill paid plans and issue receipts',
                  'Performance of contract; legal obligation',
                ],
                [
                  'Send account, security, teaching and payment e-mails',
                  'Performance of contract',
                ],
                [
                  'Send the newsletter',
                  'Consent, which can be withdrawn at any time',
                ],
                [
                  'Protect the platform, prevent fraud, limit attempts and log administrative actions',
                  'Legitimate interest; regular exercise of rights',
                ],
                ['Measure use and improve the platform', 'Legitimate interest'],
                [
                  'Show ads targeted by instrument, profile and device',
                  'Legitimate interest',
                ],
                [
                  'Review reports and moderate content',
                  'Legitimate interest; legal obligation',
                ],
                [
                  'Handle specific learning needs shared by the student',
                  'Consent',
                ],
                ['Respond to authorities and court orders', 'Legal obligation'],
              ],
            },
          },
          'When processing relies on legitimate interest, we use only the data needed and respect your expectations and rights. You can object to it through the data protection officer.',
        ],
      },
      {
        id: 'menores',
        titulo: 'Children and teenagers',
        blocos: [
          'The platform is not intended for children under 13, and we do not knowingly create accounts for them. From 13 to 18, the account depends on the permission of parents or guardians, and data is processed in the teenager’s best interest, as article 14 of the LGPD requires. If we learn of an account belonging to someone under 13, it will be deleted. Parents and guardians can request deletion at ' +
            CONTATO.privacidade +
            '.',
        ],
      },
      {
        id: 'compartilhamento',
        titulo: 'Who we share it with',
        blocos: [
          '**We do not sell or rent personal data.** It is shared only with the providers that make the platform work, and only as needed for each service:',
          {
            tabela: {
              cabecalho: ['Provider', 'Purpose', 'Where'],
              linhas: [
                [
                  'Stripe',
                  'Process payments and subscriptions',
                  'United States and others',
                ],
                [
                  'Google',
                  'Google sign-in; audio narration of blog articles (receives only the article text)',
                  'United States and others',
                ],
                [
                  'Cloudinary',
                  'Store and deliver images, profile photos and uploaded files',
                  'United States',
                ],
                [
                  'E-mail provider',
                  'Deliver the platform’s e-mails',
                  'Depends on the provider',
                ],
                [
                  'Google Analytics',
                  'Browsing metrics',
                  'United States and others',
                ],
                [
                  'Sentry',
                  'Technical error logging (no name or e-mail)',
                  'United States and others',
                ],
                [
                  'Hosting, database, cache and backups',
                  'Keep the platform online and the data stored',
                  'Cloud providers',
                ],
              ],
            },
          },
          'Artificial intelligence services (Anthropic, OpenAI and Groq) are used to draft composer biographies and receive only data about composers — **no personal data from users**.',
          'Spotify and YouTube players load from their platforms, which may collect browsing data under their own policies.',
          'What you make public — public profile, public annotations, collection contributions, comments and, for teachers, the directory profile and contact — is visible to other users and visitors. Between a linked teacher and student, teaching-portal information is shared between the two.',
          'We may also share data when required by law, by court order or by a competent authority, or to defend the rights of Opus Atlas and its users.',
        ],
      },
      {
        id: 'transferencia',
        titulo: 'International transfer',
        blocos: [
          'Some providers store or process data outside Brazil. These transfers take place under the cases in article 33 of the LGPD — in particular, when necessary to perform the contract with you — and only with providers that process the data to deliver the service Opus Atlas contracted.',
        ],
      },
      {
        id: 'cookies',
        titulo: 'Cookies and browser storage',
        blocos: [
          {
            tabela: {
              cabecalho: ['Type', 'What it stores', 'Duration'],
              linhas: [
                [
                  'Essential — session (opus_access_token, opus_refresh_token and opus_session)',
                  'Keep you signed in. The access and refresh tokens cannot be read by page scripts; opus_session only signals that a session exists and holds no secret.',
                  '15-minute access, renewed for up to 7 days',
                ],
                [
                  'Essential — language (opus-atlas-language)',
                  'The language you chose',
                  'Persistent',
                ],
                [
                  'Preferences (local storage)',
                  'Light or dark theme, article font size, recent searches, dismissed ads and a local copy of favorites and study lists, so screens open quickly',
                  'Until you clear your browser',
                ],
                [
                  'Metrics (Google Analytics)',
                  'Visit and navigation counts',
                  'As set by Google',
                ],
              ],
            },
          },
          'You can delete or block cookies in your browser settings; without the essential ones, however, you cannot sign in. To opt out of Google Analytics, use the opt-out add-on provided by Google.',
        ],
      },
      {
        id: 'retencao',
        titulo: 'How long we keep it',
        blocos: [
          {
            lista: [
              '**Account and profile:** while the account exists. When you delete it, we erase your personal data, favorites, study lists, annotations, comments, achievements, notifications, teaching links and newsletter subscription.',
              '**Collection contributions:** works and scores you added may remain in the collection after the account is deleted, without being linked to your name.',
              '**Administrative action logs:** 90 days for queries, 2 years for changes and 5 years for serious actions (deleting an account, changing a role, billing, extracting personal data).',
              '**Payments and legal obligations:** for as long as the law requires. Stripe keeps its own records under its policy.',
              '**Newsletter:** until you unsubscribe. Addresses that permanently bounce or mark messages as spam are removed from the list.',
              '**Backups:** may contain already-deleted data for a limited period, until they are replaced.',
            ],
          },
        ],
      },
      {
        id: 'direitos',
        titulo: 'Your rights',
        blocos: [
          'Under article 18 of the LGPD, you may request at any time:',
          {
            lista: [
              'confirmation that we process your data and access to it;',
              'correction of incomplete, inaccurate or outdated data;',
              'anonymization, blocking or deletion of unnecessary or excessive data, or data processed unlawfully;',
              'portability of your data;',
              'deletion of data processed with your consent;',
              'information about who we share your data with;',
              'information about the possibility of not consenting and the consequences of refusing;',
              'withdrawal of consent;',
              'objection to processing carried out without consent, when it does not comply with the law.',
            ],
          },
          'Much of this you can do yourself, in your profile: **edit** your data, **export** everything that is yours to a file (up to 3 times per hour) and **delete** your account. The exported file does not include credentials, administrative logs or the private notes a teacher wrote about you — and says so in the file itself.',
          'For other requests, write to ' +
            CONTATO.privacidade +
            '. We may ask for information to confirm your identity. We reply within 15 days. You may also file a complaint with the Brazilian Data Protection Authority (ANPD).',
          'Opus Atlas does not make decisions based solely on automated processing that affect your interests.',
        ],
      },
      {
        id: 'seguranca',
        titulo: 'Security',
        blocos: [
          'We protect your data with technical and administrative measures, including:',
          {
            lista: [
              'encrypted connection (HTTPS) across the whole site;',
              'passwords stored only as Argon2 hashes;',
              'session cookies inaccessible to scripts, with short access (15 minutes) and controlled renewal;',
              'role-based access to the admin panel, with a log of administrative actions;',
              'rate limiting against abuse and brute force;',
              'error monitoring and backups in private storage;',
              'password confirmation to delete the account and change the e-mail.',
            ],
          },
          'No system is fully immune to incidents. If a security incident may cause significant risk or harm, we will notify the ANPD and the people affected, as article 48 of the LGPD requires.',
        ],
      },
      {
        id: 'alteracoes',
        titulo: 'Changes to this policy',
        blocos: [
          'We may update this policy to reflect changes to the platform, our providers or the law. The current version is always on this page, with its effective date at the top. Significant changes will be announced by e-mail or by a notice on the platform.',
        ],
      },
      {
        id: 'contato',
        titulo: 'Data protection officer and contact',
        blocos: [
          'Requests about personal data, questions about this policy and communications from the ANPD: ' +
            CONTATO.privacidade +
            '.',
        ],
      },
    ],
  },
};
