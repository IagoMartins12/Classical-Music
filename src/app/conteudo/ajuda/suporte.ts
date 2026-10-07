import { CONTATO } from '@/app/utils/contato';
import type { CentralBilingue } from './tipos';

/**
 * Suporte: quando algo não funciona. Cada item é um problema real, com a
 * causa e o que resolver — sem promessa de prazo de resposta que ninguém
 * mede.
 */
export const SUPORTE: CentralBilingue = {
  pt: {
    titulo: 'Suporte',
    abertura:
      'Algo não saiu como esperado? Aqui estão os problemas mais comuns e como resolvê-los. Se o seu não estiver na lista, fale com a gente.',
    grupos: [
      {
        id: 'acesso',
        titulo: 'Entrar na conta',
        itens: [
          {
            id: 'sem-email-confirmacao',
            titulo: 'Não recebi o e-mail de confirmação',
            blocos: [
              'Procure na caixa de spam e nas abas de promoções. Se não estiver lá, use **Reenviar Verificação** no aviso que aparece depois de entrar, ou em **Meu Perfil → Configurações da Conta**. Confira também se o e-mail foi digitado sem erro.',
            ],
          },
          {
            id: 'esqueci-senha',
            titulo: 'Esqueci a minha senha',
            blocos: [
              'Na janela de entrar, toque em **Esqueceu sua senha?** e informe o e-mail da conta. Você recebe um link para criar uma senha nova; se ele expirar, peça outro.',
            ],
          },
          {
            id: 'conta-google',
            titulo: 'Criei a conta com o Google e não tenho senha',
            blocos: [
              'Continue entrando com o Google. Se quiser entrar também com e-mail e senha, vá a **Meu Perfil → Configurações da Conta** e use **Definir Senha**.',
            ],
          },
          {
            id: 'sessao-cai',
            titulo: 'O site me desconecta toda hora',
            blocos: [
              'A sessão depende de cookies essenciais. Se o navegador bloqueia cookies do opusatlas.com.br, ou apaga cookies ao fechar, você precisa entrar de novo a cada visita. Libere os cookies do site nas configurações do navegador. Navegação anônima também encerra a sessão ao fechar a janela.',
            ],
          },
          {
            id: 'link-expirado',
            titulo: 'O link do e-mail diz que expirou',
            blocos: [
              'Links de confirmação, de recuperação de senha e de troca de e-mail valem por tempo limitado e só uma vez. Peça um novo pelo mesmo caminho: reenviar a verificação, esquecer a senha ou refazer a troca de e-mail.',
            ],
          },
        ],
      },
      {
        id: 'acervo',
        titulo: 'Partituras e mídia',
        itens: [
          {
            id: 'sem-partitura',
            titulo: 'A obra não mostra partituras',
            blocos: [
              'Na primeira visita, o Opus Atlas busca as partituras no IMSLP. Se não havia arquivo lá, a obra é consultada de novo depois de um dia. Se você tem uma partitura em domínio público dessa obra, pode enviá-la em **Uploads**.',
            ],
          },
          {
            id: 'download',
            titulo: 'O download da partitura não começa',
            blocos: [
              'Algumas extensões e bloqueadores impedem downloads e janelas novas. Tente liberar o site no bloqueador ou usar outro navegador. Os arquivos são PDF: no celular, pode ser preciso um leitor de PDF para abrir.',
            ],
          },
          {
            id: 'player',
            titulo: 'O player do Spotify ou do YouTube não toca',
            blocos: [
              'Os players vêm dessas plataformas. O Spotify pode tocar só um trecho se você não estiver conectado a ele no navegador; bloqueadores de anúncio e de rastreamento podem impedir os dois de carregar. Se a obra não tem a seção **Multimídia**, ainda não encontramos gravações dela.',
            ],
          },
          {
            id: 'dado-errado',
            titulo: 'Um dado da obra ou do compositor está errado',
            blocos: [
              'Use o botão de denúncia (a bandeira) na página, escolha **Informações falsas** e conte o que está errado. Se foi você quem cadastrou, pode corrigir em **Uploads**.',
            ],
          },
        ],
      },
      {
        id: 'envios',
        titulo: 'Envios ao acervo',
        itens: [
          {
            id: 'limite-envios',
            titulo: 'Não consigo enviar mais nada',
            blocos: [
              'O plano gratuito permite 3 envios. Os planos pagos têm envios ilimitados — veja [Preços](/pricing).',
            ],
          },
          {
            id: 'duplicado',
            titulo: 'O sistema diz que o compositor ou a obra já existe',
            blocos: [
              'A checagem de duplicatas reconhece nomes escritos de formas diferentes ("W. A. Mozart" e "Mozart, Wolfgang Amadeus"). Abra o cadastro existente: em vez de criar outro, você pode enviar a partitura para a obra que já está lá.',
            ],
          },
          {
            id: 'envio-removido',
            titulo: 'Um envio meu saiu do ar',
            blocos: [
              'Ele pode ter sido denunciado. Em caso de direito autoral, o arquivo sai na hora e você é avisado. Se acha que foi um engano, veja como contestar em [Direitos Autorais](/copyright).',
            ],
          },
        ],
      },
      {
        id: 'pagamento',
        titulo: 'Pagamento e assinatura',
        itens: [
          {
            id: 'recusado',
            titulo: 'O pagamento foi recusado',
            blocos: [
              'Confira os dados do cartão e o limite disponível, ou tente outro cartão. A autorização é feita pelo seu banco, por meio da Stripe; alguns bancos bloqueiam compras online até você confirmar no aplicativo deles.',
            ],
          },
          {
            id: 'cobranca-teste',
            titulo: 'Fui cobrado depois do teste grátis',
            blocos: [
              'Terminado o teste, a assinatura passa a ser cobrada se não for cancelada antes. Se isso aconteceu há menos de 7 dias da contratação, você tem direito ao reembolso integral: escreva para ' +
                CONTATO.suporte +
                '.',
            ],
          },
          {
            id: 'cancelar',
            titulo: 'Quero cancelar a assinatura',
            blocos: [
              'Em **Meu Perfil → Configurações da Conta → Assinatura**, toque em **Cancelar assinatura**. O acesso continua até o fim do período pago. Para trocar o cartão ou ver faturas, use **Gerenciar pagamento**.',
            ],
          },
          {
            id: 'plano-nao-mudou',
            titulo: 'Paguei, mas o plano não mudou',
            blocos: [
              'Recarregue a página e saia e entre de novo na conta: a confirmação da Stripe pode levar alguns instantes. Se o plano continuar o mesmo, escreva para ' +
                CONTATO.suporte +
                ' com o e-mail da conta e a data do pagamento.',
            ],
          },
        ],
      },
      {
        id: 'ensino',
        titulo: 'Portal de ensino',
        itens: [
          {
            id: 'convite-nao-chegou',
            titulo: 'O aluno não recebeu o convite',
            blocos: [
              'Peça que ele procure no spam e confira se o e-mail foi digitado exatamente como o da conta dele. Convites valem 30 dias; depois disso, envie um novo.',
            ],
          },
          {
            id: 'limite-alunos',
            titulo: 'Não consigo convidar mais alunos',
            blocos: [
              'O plano Mentor permite até 7 alunos; o Maestro, ilimitados. Descer de plano não remove ninguém, mas impede novos vínculos enquanto você estiver acima do limite.',
            ],
          },
        ],
      },
    ],
  },
  en: {
    titulo: 'Support',
    abertura:
      'Something did not go as expected? Here are the most common problems and how to solve them. If yours is not on the list, get in touch.',
    grupos: [
      {
        id: 'acesso',
        titulo: 'Signing in',
        itens: [
          {
            id: 'sem-email-confirmacao',
            titulo: 'I did not get the confirmation e-mail',
            blocos: [
              'Look in your spam and promotions folders. If it is not there, use **Resend Verification** on the notice that shows up after signing in, or in **My profile → Account Settings**. Also check that the e-mail was typed correctly.',
            ],
          },
          {
            id: 'esqueci-senha',
            titulo: 'I forgot my password',
            blocos: [
              'In the sign-in window, tap **Forgot your password?** and enter your account e-mail. You get a link to create a new password; if it expires, ask for another.',
            ],
          },
          {
            id: 'conta-google',
            titulo: 'I signed up with Google and have no password',
            blocos: [
              'Keep signing in with Google. If you also want to sign in with e-mail and password, go to **My profile → Account Settings** and use **Set Password**.',
            ],
          },
          {
            id: 'sessao-cai',
            titulo: 'The site keeps signing me out',
            blocos: [
              'Your session relies on essential cookies. If your browser blocks cookies from opusatlas.com.br, or deletes cookies on close, you have to sign in again on every visit. Allow the site’s cookies in your browser settings. Private browsing also ends the session when the window closes.',
            ],
          },
          {
            id: 'link-expirado',
            titulo: 'The e-mail link says it has expired',
            blocos: [
              'Confirmation, password-recovery and e-mail-change links are valid for a limited time and only once. Request a new one the same way: resend verification, forgot password or redo the e-mail change.',
            ],
          },
        ],
      },
      {
        id: 'acervo',
        titulo: 'Scores and media',
        itens: [
          {
            id: 'sem-partitura',
            titulo: 'The work shows no scores',
            blocos: [
              'On the first visit, Opus Atlas fetches scores from IMSLP. If there was no file there, the work is checked again after a day. If you have a public-domain score of that work, you can upload it in **Uploads**.',
            ],
          },
          {
            id: 'download',
            titulo: 'The score download does not start',
            blocos: [
              'Some extensions and blockers prevent downloads and new windows. Try allowing the site in your blocker or using another browser. Files are PDFs: on a phone you may need a PDF reader to open them.',
            ],
          },
          {
            id: 'player',
            titulo: 'The Spotify or YouTube player does not play',
            blocos: [
              'The players come from those platforms. Spotify may play only an excerpt if you are not signed in to it in the browser; ad and tracking blockers can stop both from loading. If the work has no **Multimedia** section, we have not found recordings of it yet.',
            ],
          },
          {
            id: 'dado-errado',
            titulo: 'A work or composer detail is wrong',
            blocos: [
              'Use the report button (the flag) on the page, choose **False information** and explain what is wrong. If you added it, you can fix it in **Uploads**.',
            ],
          },
        ],
      },
      {
        id: 'envios',
        titulo: 'Collection uploads',
        itens: [
          {
            id: 'limite-envios',
            titulo: 'I cannot upload anything else',
            blocos: [
              'The free plan allows 3 submissions. Paid plans have unlimited submissions — see [Pricing](/pricing).',
            ],
          },
          {
            id: 'duplicado',
            titulo: 'The system says the composer or work already exists',
            blocos: [
              'The duplicate check recognizes names written differently (“W. A. Mozart” and “Mozart, Wolfgang Amadeus”). Open the existing entry: instead of creating another, you can upload the score to the work that is already there.',
            ],
          },
          {
            id: 'envio-removido',
            titulo: 'Something I uploaded was taken down',
            blocos: [
              'It may have been reported. For copyright, the file is taken down at once and you are notified. If you think it was a mistake, see how to dispute it in [Copyright](/copyright).',
            ],
          },
        ],
      },
      {
        id: 'pagamento',
        titulo: 'Payment and subscription',
        itens: [
          {
            id: 'recusado',
            titulo: 'My payment was declined',
            blocos: [
              'Check the card details and available limit, or try another card. Authorization is done by your bank, through Stripe; some banks block online purchases until you confirm in their app.',
            ],
          },
          {
            id: 'cobranca-teste',
            titulo: 'I was charged after the free trial',
            blocos: [
              'When the trial ends, the subscription is charged unless cancelled before. If this happened within 7 days of subscribing, you are entitled to a full refund: write to ' +
                CONTATO.suporte +
                '.',
            ],
          },
          {
            id: 'cancelar',
            titulo: 'I want to cancel my subscription',
            blocos: [
              'In **My profile → Account Settings → Subscription**, tap **Cancel subscription**. Access continues until the end of the paid period. To change your card or see invoices, use **Manage payment**.',
            ],
          },
          {
            id: 'plano-nao-mudou',
            titulo: 'I paid but my plan did not change',
            blocos: [
              'Reload the page and sign out and in again: Stripe’s confirmation may take a moment. If the plan stays the same, write to ' +
                CONTATO.suporte +
                ' with your account e-mail and the payment date.',
            ],
          },
        ],
      },
      {
        id: 'ensino',
        titulo: 'Teaching portal',
        itens: [
          {
            id: 'convite-nao-chegou',
            titulo: 'The student did not get the invitation',
            blocos: [
              'Ask them to check spam and make sure the e-mail was typed exactly as their account’s. Invitations last 30 days; after that, send a new one.',
            ],
          },
          {
            id: 'limite-alunos',
            titulo: 'I cannot invite more students',
            blocos: [
              'The Mentor plan allows up to 7 students; Maestro, unlimited. Moving to a lower plan removes no one, but blocks new links while you are above the limit.',
            ],
          },
        ],
      },
    ],
  },
};
