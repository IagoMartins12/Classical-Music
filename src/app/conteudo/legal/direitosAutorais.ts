import { CONTATO } from '@/app/utils/contato';
import type { DocumentoBilingue } from './tipos';

/**
 * Direitos Autorais: de onde vem o acervo, o que é domínio público e como
 * notificar uma violação. O procedimento segue a RN-4 (moderação por
 * denúncia): denúncia de direito autoral tira o arquivo do ar na hora.
 */
export const DIREITOS_AUTORAIS: DocumentoBilingue = {
  pt: {
    titulo: 'Direitos Autorais',
    abertura:
      'De onde vem o que está no Opus Atlas, o que é domínio público e como avisar se algo aqui viola um direito autoral seu.',
    vigencia: '2026-09-28',
    essencial: [
      'As partituras vêm do IMSLP, em domínio público segundo o próprio IMSLP, ou são enviadas pela comunidade.',
      'Domínio público muda de país para país: no Brasil, a regra geral é 70 anos contados a partir de 1º de janeiro do ano seguinte à morte do autor.',
      'Edições, arranjos e traduções podem ter proteção própria, mesmo quando a composição já é livre.',
      'Se algo aqui viola um direito seu, use **Denunciar → Violação de direitos autorais** ou escreva para ' +
        CONTATO.direitosAutorais +
        '. O arquivo sai do ar na hora, e o caso é analisado em até 24 horas.',
    ],
    secoes: [
      {
        id: 'compromisso',
        titulo: 'Nosso compromisso',
        blocos: [
          'O Opus Atlas existe para tornar a música clássica acessível — e isso só faz sentido respeitando quem cria. Seguimos a Lei de Direitos Autorais (Lei 9.610/1998), a Convenção de Berna e o Marco Civil da Internet (Lei 12.965/2014), e retiramos conteúdo que viole direitos de terceiros.',
        ],
      },
      {
        id: 'origem',
        titulo: 'De onde vem o acervo',
        blocos: [
          {
            lista: [
              '**Dados sobre compositores e obras** — nomes, datas, catálogos, instrumentação, época — são informações factuais, reunidas pela equipe, pela comunidade e a partir de fontes públicas como o IMSLP.',
              '**Biografias de compositores** são textos redigidos para o Opus Atlas, parte deles com o apoio de ferramentas de inteligência artificial.',
              '**Partituras** vêm do IMSLP (International Music Score Library Project), que as oferece como domínio público, ou são enviadas por usuários, que declaram ter o direito de publicá-las.',
              '**Áudio e vídeo** são tocados pelos players do Spotify e do YouTube: o conteúdo fica hospedado nessas plataformas, sob as regras delas. Os vídeos de performance enviados por usuários são de responsabilidade de quem os enviou.',
              '**Textos do blog, design, logotipo e software** são do Opus Atlas.',
            ],
          },
        ],
      },
      {
        id: 'dominio-publico',
        titulo: 'Domínio público',
        blocos: [
          'No Brasil, os direitos patrimoniais do autor duram por toda a vida dele e por mais **70 anos**, contados a partir de 1º de janeiro do ano seguinte ao da morte (art. 41 da Lei 9.610/1998). Depois disso, a obra entra em domínio público e pode ser usada livremente, respeitados os direitos morais — como o de ter o nome do autor indicado.',
          'Três cuidados:',
          {
            lista: [
              '**O prazo varia de país para país.** Uma partitura em domínio público no Canadá, onde o IMSLP se baseia, pode ainda estar protegida no Brasil ou em outros lugares. Confira a lei do lugar onde você vai usá-la.',
              '**Edições, arranjos, revisões e traduções** podem ter proteção própria, independente da composição original.',
              '**O domínio público de uma obra não vale para todas as suas gravações**: interpretações e fonogramas têm direitos próprios.',
            ],
          },
          'O Opus Atlas indica a origem de cada partitura, mas não garante o status de domínio público em todas as jurisdições.',
        ],
      },
      {
        id: 'uso',
        titulo: 'O que você pode fazer com o conteúdo',
        blocos: [
          {
            lista: [
              '**Partituras em domínio público:** baixar, imprimir, estudar, tocar, ensinar e compartilhar, observadas as ressalvas acima.',
              '**Textos, design e dados do Opus Atlas:** usar para estudo e fins pessoais. Citações curtas são permitidas com indicação da fonte (art. 46 da Lei 9.610/1998). Reproduzir em massa, copiar o acervo ou revender exige autorização por escrito.',
              '**Conteúdo de outros usuários:** pertence a quem o criou. Para usá-lo fora da plataforma, peça autorização ao autor.',
            ],
          },
        ],
      },
      {
        id: 'envios',
        titulo: 'Ao enviar conteúdo',
        blocos: [
          'Envie apenas o que é seu, o que está em domínio público ou o que você tem autorização para publicar. Não envie partituras de editoras em catálogo, arranjos e transcrições de terceiros sem permissão, gravações comerciais, nem digitalizações de livros protegidos.',
          'Os envios entram no ar na hora, e quem envia responde pelo conteúdo, como dizem os [Termos de Uso](/terms). Contas com violações repetidas podem ser suspensas ou encerradas.',
        ],
      },
      {
        id: 'notificar',
        titulo: 'Como notificar uma violação',
        blocos: [
          'Se você é titular de direitos — ou age em nome de quem é — e encontrou no Opus Atlas algo publicado sem autorização, há dois caminhos:',
          {
            lista: [
              'Na página da obra, do compositor ou da partitura, use **Denunciar** e escolha **Violação de direitos autorais**.',
              'Ou escreva para ' + CONTATO.direitosAutorais + '.',
            ],
            numerada: true,
          },
          'Para agilizar a análise, informe:',
          {
            lista: [
              'seu nome e contato e, se agir em nome de outra pessoa ou empresa, o vínculo com ela;',
              'a obra protegida e quem detém os direitos;',
              'o endereço exato (URL) do conteúdo no Opus Atlas;',
              'por que o uso não é autorizado;',
              'uma declaração de que as informações são verdadeiras e de que você é o titular ou está autorizado a agir por ele.',
            ],
          },
        ],
      },
      {
        id: 'o-que-acontece',
        titulo: 'O que acontece depois',
        blocos: [
          {
            lista: [
              'O arquivo denunciado **sai do ar imediatamente**, e a ficha da obra ou do compositor fica marcada como contestada.',
              'A equipe analisa o caso em **até 24 horas**.',
              'Quem enviou o conteúdo é avisado.',
              'Se a violação se confirmar, o conteúdo é removido em definitivo, com justificativa registrada. Se não se confirmar, ele volta ao ar.',
            ],
            numerada: true,
          },
        ],
      },
      {
        id: 'contestar',
        titulo: 'Como contestar uma remoção',
        blocos: [
          'Se um conteúdo seu foi retirado e você acredita que foi um engano — porque a obra está em domínio público, porque você é o titular ou porque tem autorização —, escreva para ' +
            CONTATO.direitosAutorais +
            ' com a sua justificativa e o que puder comprová-la. Reavaliamos o caso e, se a contestação for procedente, o conteúdo volta ao ar.',
        ],
      },
      {
        id: 'ma-fe',
        titulo: 'Notificações de má-fé',
        blocos: [
          'Notificar como violação algo que se sabe não ser uma violação prejudica quem publicou e a comunidade. Quem fizer notificações falsas ou de má-fé responde por elas, nos termos da lei.',
        ],
      },
      {
        id: 'contato',
        titulo: 'Contato',
        blocos: [
          'Assuntos de direitos autorais: ' + CONTATO.direitosAutorais + '.',
        ],
      },
    ],
  },
  en: {
    titulo: 'Copyright',
    abertura:
      'Where the content on Opus Atlas comes from, what the public domain is and how to tell us if something here infringes your copyright.',
    vigencia: '2026-09-28',
    essencial: [
      'Scores come from IMSLP, in the public domain as stated by IMSLP, or are uploaded by the community.',
      'The public domain differs from country to country: in Brazil, the general rule is 70 years counted from January 1 of the year after the author’s death.',
      'Editions, arrangements and translations may carry their own protection, even when the composition itself is free.',
      'If something here infringes your rights, use **Report → Copyright violation** or write to ' +
        CONTATO.direitosAutorais +
        '. The file is taken down at once, and the case is reviewed within 24 hours.',
    ],
    secoes: [
      {
        id: 'compromisso',
        titulo: 'Our commitment',
        blocos: [
          'Opus Atlas exists to make classical music accessible — and that only makes sense if we respect those who create. We follow the Brazilian Copyright Law (Law 9.610/1998), the Berne Convention and the Brazilian Internet Civil Framework (Law 12.965/2014), and we remove content that infringes the rights of others.',
        ],
      },
      {
        id: 'origem',
        titulo: 'Where the collection comes from',
        blocos: [
          {
            lista: [
              '**Data about composers and works** — names, dates, catalogues, instrumentation, era — is factual information, gathered by the team, the community and public sources such as IMSLP.',
              '**Composer biographies** are texts written for Opus Atlas, some of them with the help of artificial intelligence tools.',
              '**Scores** come from IMSLP (International Music Score Library Project), which offers them as public domain, or are uploaded by users, who declare they have the right to publish them.',
              '**Audio and video** play through Spotify and YouTube players: the content is hosted on those platforms, under their rules. Performance videos uploaded by users are the responsibility of whoever uploaded them.',
              '**Blog texts, design, logo and software** belong to Opus Atlas.',
            ],
          },
        ],
      },
      {
        id: 'dominio-publico',
        titulo: 'Public domain',
        blocos: [
          'In Brazil, an author’s economic rights last for their lifetime plus **70 years**, counted from January 1 of the year following their death (article 41 of Law 9.610/1998). After that, the work enters the public domain and may be used freely, respecting moral rights — such as having the author’s name credited.',
          'Three things to keep in mind:',
          {
            lista: [
              '**Terms vary by country.** A score in the public domain in Canada, where IMSLP is based, may still be protected in Brazil or elsewhere. Check the law where you will use it.',
              '**Editions, arrangements, revisions and translations** may have their own protection, separate from the original composition.',
              '**A work being in the public domain does not free every recording of it**: performances and sound recordings have their own rights.',
            ],
          },
          'Opus Atlas shows where each score comes from, but does not guarantee its public-domain status in every jurisdiction.',
        ],
      },
      {
        id: 'uso',
        titulo: 'What you may do with the content',
        blocos: [
          {
            lista: [
              '**Public-domain scores:** download, print, study, perform, teach and share, subject to the notes above.',
              '**Opus Atlas texts, design and data:** use for study and personal purposes. Short quotations are allowed with attribution (article 46 of Law 9.610/1998). Bulk reproduction, copying the collection or resale requires written permission.',
              '**Other users’ content:** belongs to its creator. To use it outside the platform, ask the author for permission.',
            ],
          },
        ],
      },
      {
        id: 'envios',
        titulo: 'When you upload content',
        blocos: [
          'Upload only what is yours, in the public domain or what you are authorized to publish. Do not upload in-print publisher editions, third-party arrangements and transcriptions without permission, commercial recordings or scans of protected books.',
          'Uploads go live immediately, and the uploader is responsible for the content, as set out in the [Terms of Use](/terms). Accounts with repeated infringements may be suspended or terminated.',
        ],
      },
      {
        id: 'notificar',
        titulo: 'How to report an infringement',
        blocos: [
          'If you hold the rights — or act on behalf of whoever does — and found something on Opus Atlas published without permission, there are two ways:',
          {
            lista: [
              'On the work, composer or score page, use **Report** and choose **Copyright violation**.',
              'Or write to ' + CONTATO.direitosAutorais + '.',
            ],
            numerada: true,
          },
          'To speed up the review, include:',
          {
            lista: [
              'your name and contact and, if acting for another person or company, your relationship to them;',
              'the protected work and who holds the rights;',
              'the exact address (URL) of the content on Opus Atlas;',
              'why the use is not authorized;',
              'a statement that the information is true and that you are the rights holder or authorized to act for them.',
            ],
          },
        ],
      },
      {
        id: 'o-que-acontece',
        titulo: 'What happens next',
        blocos: [
          {
            lista: [
              'The reported file is **taken down immediately**, and the work or composer entry is flagged as disputed.',
              'The team reviews the case **within 24 hours**.',
              'The person who uploaded the content is notified.',
              'If the infringement is confirmed, the content is removed for good, with the reason recorded. If not, it goes back online.',
            ],
            numerada: true,
          },
        ],
      },
      {
        id: 'contestar',
        titulo: 'How to dispute a removal',
        blocos: [
          'If content of yours was taken down and you believe it was a mistake — because the work is in the public domain, because you hold the rights or because you are authorized —, write to ' +
            CONTATO.direitosAutorais +
            ' with your reasons and whatever supports them. We review the case and, if the dispute is upheld, the content goes back online.',
        ],
      },
      {
        id: 'ma-fe',
        titulo: 'Bad-faith reports',
        blocos: [
          'Reporting as infringement something known not to be one harms the uploader and the community. Anyone who files false or bad-faith reports is liable for them under the law.',
        ],
      },
      {
        id: 'contato',
        titulo: 'Contact',
        blocos: ['Copyright matters: ' + CONTATO.direitosAutorais + '.'],
      },
    ],
  },
};
