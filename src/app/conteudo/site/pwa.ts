import type { Idioma } from '../legal/tipos';

/** The app (PWA): install invite, install steps, offline notices. */
const pt = {
  convite: {
    titulo: 'Sabia que o Opus Atlas também tem aplicativo?',
    texto:
      'Ele fica na tela inicial do celular, abre sem a barra do navegador e guarda as páginas que você visitou para ler sem internet. Não precisa de loja: instala em segundos.',
    ver: 'Ver como instalar',
    agoraNao: 'Agora não',
    nuncaMais: 'Não mostrar mais',
  },
  passos: {
    titulo: 'Como instalar o Opus Atlas',
    descricao: 'Três toques e o ícone aparece na sua tela inicial.',
    instalar: 'Instalar agora',
    ouManual: 'Ou, pelo menu do navegador:',
    abas: { ios: 'iPhone e iPad', android: 'Android' },
    ios: [
      {
        titulo: 'Abra o Opus Atlas no Safari',
        texto: 'No iPhone e no iPad, só o Safari instala o app.',
      },
      {
        titulo: 'Toque em Compartilhar',
        texto: 'O quadrado com a seta para cima, na barra do Safari.',
      },
      {
        titulo: 'Escolha "Adicionar à Tela de Início"',
        texto: 'Role a lista de opções até encontrar.',
      },
      {
        titulo: 'Toque em "Adicionar"',
        texto: 'O Opus Atlas aparece com os seus outros apps.',
      },
    ],
    android: [
      {
        titulo: 'Abra o Opus Atlas no Chrome',
        texto: 'É pelo Chrome que a instalação funciona melhor.',
      },
      {
        titulo: 'Abra o menu do Chrome',
        texto: 'Os três pontos no canto de cima.',
      },
      {
        titulo: 'Toque em "Instalar app"',
        texto: 'Em alguns celulares aparece como "Adicionar à tela inicial".',
      },
      {
        titulo: 'Confirme em "Instalar"',
        texto: 'O Opus Atlas aparece com os seus outros apps.',
      },
    ],
    fechar: 'Fechar',
  },
  offline: {
    faixa: 'Sem conexão: você está vendo o que ficou salvo.',
    noAparelho: 'Ver o que está no aparelho',
    busca: 'Sem conexão: a busca volta quando a internet voltar.',
  },
  aparelho: {
    tituloOffline: 'Sem conexão',
    textoOffline:
      'Esta página ainda não foi aberta neste aparelho. O que você já visitou abre normalmente; as partituras guardadas estão logo abaixo.',
    titulo: 'No aparelho',
    texto:
      'Partituras guardadas para usar sem internet. As páginas que você visita também ficam salvas, até um limite, e abrem offline.',
    vazio:
      'Nenhuma partitura guardada ainda. Na página de uma obra, abra a partitura e toque em "Guardar no aparelho".',
    abrir: 'Abrir',
    remover: 'Remover',
    removerTitulo: 'Tirar esta partitura do aparelho?',
    removerTexto:
      'Ela deixa de abrir sem internet. Para ter de novo, é só guardar outra vez na página da obra.',
    cancelar: 'Cancelar',
    ocupado: (usado: string, total: string) =>
      `${usado} usados de ${total} disponíveis para o site neste aparelho.`,
    voltar: 'Ir para o início',
    instalar: 'Instalar o app',
    apresentacao: {
      titulo: 'O Opus Atlas no seu celular',
      abertura:
        'Ainda não temos um app nas lojas. Mas o site sabe se instalar como um: fica na tela de início, abre em tela cheia, guarda partituras e continua funcionando sem internet.',
      tecnologia: 'Quer saber mais sobre a tecnologia? Clique aqui.',
      sobre: {
        titulo: 'Um app que é o próprio site',
        comoFunciona: 'Como funciona',
        partes: [
          {
            titulo: 'Um ícone na tela de início',
            texto:
              'Ao instalar, o navegador cria um atalho com cara de aplicativo. Um toque e o Opus Atlas abre em tela cheia, sem a barra de endereço.',
            analogia:
              'Como encadernar as sonatas que você mais toca: o conteúdo é o mesmo, mas agora tem capa e lugar fixo na estante.',
          },
          {
            titulo: 'Um copista trabalhando por você',
            texto:
              'Por trás, o navegador guarda uma cópia das páginas que você visitou e das partituras que você escolheu. Sem internet, são essas cópias que aparecem.',
            analogia:
              'Como os copistas do tempo de Bach, que passavam as partes a limpo para cada músico levar para casa.',
          },
          {
            titulo: 'Edições novas chegam sozinhas',
            texto:
              'Quando você abre o app com internet, ele busca a versão mais recente do site. Não há loja, nem atualização para baixar.',
            analogia:
              'Como uma edição revisada que aparece na sua estante sem você precisar voltar à loja de partituras.',
          },
        ],
        exemplos: 'No dia a dia',
        usos: [
          [
            'Na aula, sem sinal',
            'Guarde a partitura no aparelho em casa e abra na sala de aula, mesmo sem internet.',
          ],
          [
            'Antes do ensaio',
            'Abra pelo ícone e vá direto ao seu estudo, sem procurar o site no navegador.',
          ],
          [
            'No ônibus ou no metrô',
            'As páginas de compositores e obras que você já visitou continuam abrindo.',
          ],
          [
            'Na estante',
            'Em tela cheia, a partitura ocupa a tela inteira, sem a barra do navegador.',
          ],
        ] as [string, string][],
        nome: 'Para os curiosos: o nome técnico disso é Progressive Web App (PWA). Funciona no Chrome e no Edge do Android e do computador, e no Safari do iPhone.',
        fechar: 'Entendi',
      },
      comparar: 'O que você tem com ele instalado',
      itens: [
        {
          titulo: 'Na tela de início',
          texto:
            'Um ícone ao lado dos seus outros apps, um toque e está aberto.',
          tem: true,
        },
        {
          titulo: 'Em tela cheia',
          texto:
            'Sem a barra do navegador: só a partitura, o estudo, o portal.',
          tem: true,
        },
        {
          titulo: 'Partituras sem internet',
          texto:
            'Guarde as que você está estudando e abra na sala de aula sem sinal.',
          tem: true,
        },
        {
          titulo: 'O que você visitou, offline',
          texto:
            'Páginas abertas ficam salvas, até um limite, e abrem sem conexão.',
          tem: true,
        },
        {
          titulo: 'Sempre atualizado',
          texto:
            'Não há versão para baixar: a próxima vez que abrir, já é a nova.',
          tem: true,
        },
        {
          titulo: 'Na App Store e no Google Play',
          texto: 'Ainda não. Por enquanto, a instalação é pelo navegador.',
          tem: false,
        },
      ],
      seuAparelho: 'Neste aparelho',
    },
  },
  guardar: {
    guardar: 'Guardar no aparelho',
    guardando: 'Guardando…',
    guardada: 'No aparelho',
    remover: 'Tirar do aparelho',
    ok: 'Partitura guardada. Ela abre sem internet.',
    erro: 'Não foi possível guardar este arquivo.',
    removida: 'Partitura tirada do aparelho.',
  },
};

const en: typeof pt = {
  convite: {
    titulo: 'Did you know Opus Atlas has an app?',
    texto:
      'It sits on your phone’s home screen, opens without the browser bar and keeps the pages you visited for reading offline. No store needed: it installs in seconds.',
    ver: 'See how to install',
    agoraNao: 'Not now',
    nuncaMais: 'Don’t show again',
  },
  passos: {
    titulo: 'How to install Opus Atlas',
    descricao: 'Three taps and the icon is on your home screen.',
    instalar: 'Install now',
    ouManual: 'Or, from the browser menu:',
    abas: { ios: 'iPhone and iPad', android: 'Android' },
    ios: [
      {
        titulo: 'Open Opus Atlas in Safari',
        texto: 'On iPhone and iPad, only Safari installs the app.',
      },
      {
        titulo: 'Tap Share',
        texto: 'The square with the arrow pointing up, in Safari’s bar.',
      },
      {
        titulo: 'Choose "Add to Home Screen"',
        texto: 'Scroll the list of options to find it.',
      },
      {
        titulo: 'Tap "Add"',
        texto: 'Opus Atlas shows up with your other apps.',
      },
    ],
    android: [
      {
        titulo: 'Open Opus Atlas in Chrome',
        texto: 'Installing works best from Chrome.',
      },
      {
        titulo: 'Open Chrome’s menu',
        texto: 'The three dots in the top corner.',
      },
      {
        titulo: 'Tap "Install app"',
        texto: 'On some phones it reads "Add to Home screen".',
      },
      {
        titulo: 'Confirm with "Install"',
        texto: 'Opus Atlas shows up with your other apps.',
      },
    ],
    fechar: 'Close',
  },
  offline: {
    faixa: 'Offline: you are seeing what was saved.',
    noAparelho: 'See what is on this device',
    busca: 'Offline: search comes back with the connection.',
  },
  aparelho: {
    tituloOffline: 'Offline',
    textoOffline:
      'This page has not been opened on this device yet. What you already visited opens as usual; your saved scores are below.',
    titulo: 'On this device',
    texto:
      'Scores saved for use without internet. The pages you visit are saved too, up to a limit, and open offline.',
    vazio:
      'No saved scores yet. On a work’s page, open a score and tap "Save to device".',
    abrir: 'Open',
    remover: 'Remove',
    removerTitulo: 'Remove this score from the device?',
    removerTexto:
      'It will no longer open offline. To have it again, save it once more on the work page.',
    cancelar: 'Cancel',
    ocupado: (usado: string, total: string) =>
      `${usado} used of ${total} available to the site on this device.`,
    voltar: 'Go to the home page',
    instalar: 'Install the app',
    apresentacao: {
      titulo: 'Opus Atlas on your phone',
      abertura:
        'We do not have an app in the stores yet. But the site can install itself like one: it sits on your home screen, opens full screen, keeps scores and keeps working without internet.',
      tecnologia: 'Want to know more about the technology? Click here.',
      sobre: {
        titulo: 'An app that is the site itself',
        comoFunciona: 'How it works',
        partes: [
          {
            titulo: 'An icon on your home screen',
            texto:
              'When you install it, the browser creates a shortcut that looks like an app. One tap and Opus Atlas opens full screen, without the address bar.',
            analogia:
              'Like binding the sonatas you play the most: the music is the same, but now it has a cover and its own place on the shelf.',
          },
          {
            titulo: 'A copyist working for you',
            texto:
              'Behind the scenes, the browser keeps a copy of the pages you visited and the scores you chose. Without internet, those copies are what you see.',
            analogia:
              'Like the copyists of Bach’s time, who wrote out the parts for each musician to take home.',
          },
          {
            titulo: 'New editions arrive on their own',
            texto:
              'When you open the app with internet, it fetches the latest version of the site. No store, no update to download.',
            analogia:
              'Like a revised edition that shows up on your shelf without a trip back to the music shop.',
          },
        ],
        exemplos: 'Day to day',
        usos: [
          [
            'In class, without signal',
            'Save the score on your device at home and open it in the classroom, even offline.',
          ],
          [
            'Before rehearsal',
            'Open it from the icon and go straight to your practice, without looking for the site in the browser.',
          ],
          [
            'On the bus or the subway',
            'The composer and work pages you have visited keep opening.',
          ],
          [
            'On the stand',
            'Full screen, the score fills the whole screen, without the browser bar.',
          ],
        ] as [string, string][],
        nome: 'For the curious: the technical name is Progressive Web App (PWA). It works in Chrome and Edge on Android and computers, and in Safari on the iPhone.',
        fechar: 'Got it',
      },
      comparar: 'What you get with it installed',
      itens: [
        {
          titulo: 'On your home screen',
          texto: 'An icon next to your other apps; one tap and it is open.',
          tem: true,
        },
        {
          titulo: 'Full screen',
          texto: 'No browser bar: just the score, the practice, the portal.',
          tem: true,
        },
        {
          titulo: 'Scores without internet',
          texto:
            'Save the ones you are learning and open them in a lesson with no signal.',
          tem: true,
        },
        {
          titulo: 'What you visited, offline',
          texto:
            'Pages you opened are saved, up to a limit, and open without a connection.',
          tem: true,
        },
        {
          titulo: 'Always up to date',
          texto:
            'There is no version to download: next time you open it, it is the new one.',
          tem: true,
        },
        {
          titulo: 'On the App Store and Google Play',
          texto: 'Not yet. For now, it installs through the browser.',
          tem: false,
        },
      ],
      seuAparelho: 'On this device',
    },
  },
  guardar: {
    guardar: 'Save to device',
    guardando: 'Saving…',
    guardada: 'On this device',
    remover: 'Remove from device',
    ok: 'Score saved. It opens without internet.',
    erro: 'This file could not be saved.',
    removida: 'Score removed from this device.',
  },
};

export const PWA: Record<Idioma, typeof pt> = { pt, en };
export type PwaCopy = typeof pt;
