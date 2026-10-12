/**
 * Os pontos de partida dos modelos de newsletter.
 *
 * Cada um é só o **corpo** da carta: a API põe o selo, a data, o emblema, a
 * assinatura e o rodapé com o descadastro (o layout dos e-mails). Tags sem
 * atributo (`h1`, `h2`, `p`, `ul`, `blockquote`, `hr`) ganham o estilo da
 * carta sozinhas; o `h1` vira o título, com o filete embaixo.
 *
 * As variáveis são só as que o envio preenche: `firstName`, `lastName`,
 * `email`, `siteUrl`, `unsubscribeUrl`, `campaignName` e `year`.
 */

export interface ModeloPronto {
  type: 'CAMPAIGN_CUSTOM' | 'WEEKLY_DIGEST' | 'NEW_COMPOSER';
  rotulo: string;
  description: string;
  subject: string;
  htmlContent: string;
  textContent: string;
}

export const MODELOS_PRONTOS: ModeloPronto[] = [
  {
    type: 'CAMPAIGN_CUSTOM',
    rotulo: 'Carta livre',
    description: 'Uma carta curta, com um assunto e um convite.',
    subject: '{{firstName}}, chegou coisa nova no acervo',
    htmlContent: `<h1>Coisa nova no acervo</h1>
<p>Olá, {{firstName}}.</p>
<p>Conte aqui o motivo desta carta: a obra que entrou, a edição que vale abrir, o recurso novo do site.</p>
<p>Feche com um convite só. <a href="{{siteUrl}}">Abrir o Opus Atlas</a></p>`,
    textContent: `Coisa nova no acervo

Olá, {{firstName}}.

Conte aqui o motivo desta carta: a obra que entrou, a edição que vale abrir, o recurso novo do site.

Abrir o Opus Atlas: {{siteUrl}}`,
  },
  {
    type: 'WEEKLY_DIGEST',
    rotulo: 'Resumo da semana',
    description: 'O que passou pelo acervo e pelo blog nos últimos dias.',
    subject: 'A semana no Opus Atlas',
    htmlContent: `<h1>A semana no acervo</h1>
<p>Olá, {{firstName}}. Separamos o que passou pelo Opus Atlas nos últimos dias.</p>
<h2>Obras para conhecer</h2>
<ul>
<li><strong>Obra</strong>, compositor: uma linha sobre por que ouvir.</li>
<li><strong>Obra</strong>, compositor: uma linha sobre por que ouvir.</li>
</ul>
<h2>Do blog</h2>
<p>O título do artigo e uma frase sobre ele. <a href="{{siteUrl}}/blog">Ler no blog</a></p>`,
    textContent: `A semana no acervo

Olá, {{firstName}}. Separamos o que passou pelo Opus Atlas nos últimos dias.

OBRAS PARA CONHECER
- Obra, compositor: uma linha sobre por que ouvir.
- Obra, compositor: uma linha sobre por que ouvir.

DO BLOG
O título do artigo e uma frase sobre ele.
Ler no blog: {{siteUrl}}/blog`,
  },
  {
    type: 'NEW_COMPOSER',
    rotulo: 'Compositor em destaque',
    description: 'Apresenta um compositor e por onde começar a ouvi-lo.',
    subject: 'Um compositor para conhecer',
    htmlContent: `<h1>Nome do compositor</h1>
<p>Período · país</p>
<blockquote>Uma frase dele, ou sobre ele, que dê vontade de ouvir.</blockquote>
<p>Duas ou três linhas sobre a vida e a música: onde viveu, o que mudou, por que ainda é tocado.</p>
<h2>Por onde começar</h2>
<ul>
<li><strong>Obra</strong>: por que começar por ela.</li>
<li><strong>Obra</strong>: o que ouvir com atenção.</li>
</ul>
<p><a href="{{siteUrl}}/composers">Ver a página do compositor</a></p>`,
    textContent: `Nome do compositor
Período · país

"Uma frase dele, ou sobre ele, que dê vontade de ouvir."

Duas ou três linhas sobre a vida e a música: onde viveu, o que mudou, por que ainda é tocado.

POR ONDE COMEÇAR
- Obra: por que começar por ela.
- Obra: o que ouvir com atenção.

Ver a página do compositor: {{siteUrl}}/composers`,
  },
];

/** As variáveis citadas (`{{nome}}`), sem repetição. */
export function extractVariables(texto: string): string[] {
  return [
    ...new Set(
      (texto.match(/{{\s*([a-zA-Z0-9_]+)\s*}}/g) ?? []).map((v) =>
        v.replace(/[{}\s]/g, '')
      )
    ),
  ];
}
