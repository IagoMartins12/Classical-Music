'use client';

import { useMemo, useState } from 'react';
import { Stack } from '@/app/components/ui/Layout';
import { Sheet } from '@/app/components/ui/Sheet';
import { Text } from '@/app/components/ui/Text';
import { Segmentos } from '@/app/components/Admin/painel/Controles';
import { processTemplate } from '@/app/libs/newsletter/emailTemplates';
import { SITE_URL } from '@/app/utils/seoAlternates';

/**
 * A prévia de um e-mail (modelo ou campanha), com dados de exemplo no lugar
 * das variáveis.
 *
 * **O HTML roda num `iframe` isolado** (`sandbox`, sem script): antes ele era
 * injetado na página do painel com `dangerouslySetInnerHTML` — o CSS do
 * e-mail vazava para o painel e um `<script>` num modelo rodaria com a
 * sessão do administrador.
 *
 * Três vistas (como fica, a versão só texto, o código) e três larguras (o
 * e-mail é lido mais no celular do que em qualquer outro lugar).
 */

type Vista = 'visual' | 'texto' | 'codigo';
type Largura = 'computador' | 'tablet' | 'celular';

const LARGURA: Record<Largura, string> = {
  computador: '100%',
  tablet: '768px',
  celular: '375px',
};

/** O que entra no lugar das variáveis na prévia. */
export const AMOSTRA = {
  firstName: 'Ana',
  lastName: 'Ribeiro',
  email: 'ana@exemplo.com',
  siteUrl: SITE_URL,
  unsubscribeUrl: `${SITE_URL}/unsubscribe?token=exemplo`,
  preferencesUrl: `${SITE_URL}/preferences?token=exemplo`,
  confirmationUrl: `${SITE_URL}/confirm?token=exemplo`,
  resetUrl: `${SITE_URL}/reset?token=exemplo`,
  requestDate: new Date().toLocaleDateString('pt-BR'),
  ipAddress: '189.40.0.1',
  newComposers: 5,
  newWorks: 12,
  newScores: 8,
  activeUsers: 150,
  featuredComposer: {
    name: 'Ludwig van Beethoven',
    period: '1770–1827',
    description: 'Compositor alemão, ponte entre o classicismo e o romantismo.',
    url: `${SITE_URL}/composers`,
  },
  popularWorks: [
    {
      title: 'Sonata ao Luar',
      composer: 'Beethoven',
      instrument: 'Piano',
      description: 'Uma das sonatas mais tocadas do repertório.',
      url: `${SITE_URL}/works`,
    },
  ],
  studyTip: {
    title: 'Dedilhado',
    content: 'Estude as passagens difíceis devagar, com o dedilhado fixo.',
  },
  composerName: 'Wolfgang Amadeus Mozart',
  composerPeriod: '1756–1791',
  composerNationality: 'Austríaco',
  composerBio: 'Compositor do período clássico, de genialidade precoce.',
  composerUrl: `${SITE_URL}/composers`,
  works: [
    {
      title: 'Réquiem em ré menor',
      instrument: 'Coro e orquestra',
      year: '1791',
    },
    { title: 'Sinfonia nº 40', instrument: 'Orquestra', year: '1788' },
  ],
  musicalFact: 'Mozart compôs mais de 600 obras.',
  customSubject: 'Assunto da campanha',
  customContent:
    '<h3>Conteúdo da campanha</h3><p>O texto que a campanha acrescenta ao modelo.</p>',
  customTextContent: 'O texto que a campanha acrescenta ao modelo.',
};

function aplicar(t: string | null | undefined, dados: Record<string, unknown>) {
  if (!t) return '';
  try {
    return processTemplate(t, dados);
  } catch {
    return t;
  }
}

export function PreviaDeEmail({
  aberto,
  aoFechar,
  titulo,
  assunto,
  html,
  texto,
  variaveis,
  dados = AMOSTRA,
}: {
  aberto: boolean;
  aoFechar: () => void;
  titulo: string;
  assunto: string;
  html: string;
  texto?: string | null;
  variaveis?: string[];
  dados?: Record<string, unknown>;
}) {
  const [vista, setVista] = useState<Vista>('visual');
  const [largura, setLargura] = useState<Largura>('computador');

  const pronto = useMemo(
    () => ({
      assunto: aplicar(assunto, dados),
      html: aplicar(html, dados),
      texto: aplicar(texto, dados),
    }),
    [assunto, html, texto, dados]
  );

  return (
    <Sheet aberto={aberto} aoFechar={aoFechar} titulo={titulo} largura="g">
      <Stack gap={4}>
        <div className="rounded-controle bg-sup-2 px-4 py-3">
          <span className="t-legenda">Assunto</span>
          <p className="text-[0.9375rem] text-texto">{pronto.assunto || '—'}</p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Segmentos
            rotulo="Vista"
            valor={vista}
            aoMudar={setVista}
            opcoes={[
              { valor: 'visual', rotulo: 'Como fica' },
              { valor: 'texto', rotulo: 'Só texto' },
              { valor: 'codigo', rotulo: 'Código' },
            ]}
          />
          {vista === 'visual' && (
            <Segmentos
              rotulo="Largura"
              valor={largura}
              aoMudar={setLargura}
              opcoes={[
                { valor: 'computador', rotulo: 'Computador' },
                { valor: 'tablet', rotulo: 'Tablet' },
                { valor: 'celular', rotulo: 'Celular' },
              ]}
            />
          )}
        </div>

        {vista === 'visual' ? (
          <div className="relative flex justify-center overflow-x-auto rounded-card bg-sup-2 p-3 rolagem-discreta">
            <iframe
              title={`Prévia: ${titulo}`}
              // Sem `allow-scripts`: o e-mail não roda código aqui.
              sandbox="allow-popups allow-popups-to-escape-sandbox"
              srcDoc={pronto.html}
              style={{ width: LARGURA[largura], maxWidth: '100%' }}
              className="h-[65dvh] rounded-controle border border-linha bg-white"
            />
          </div>
        ) : vista === 'texto' ? (
          <pre className="t-dado max-h-[65dvh] overflow-auto whitespace-pre-wrap rounded-card bg-sup-2 p-4 text-sm text-texto rolagem-discreta">
            {pronto.texto || 'Este e-mail não tem versão só texto.'}
          </pre>
        ) : (
          <pre className="t-dado max-h-[65dvh] overflow-auto whitespace-pre-wrap break-all rounded-card bg-sup-2 p-4 text-xs text-texto-suave rolagem-discreta">
            {html}
          </pre>
        )}

        {variaveis && variaveis.length > 0 && (
          <Stack gap={1}>
            <Text papel="legenda" as="p">
              Variáveis deste e-mail
            </Text>
            <p className="t-dado text-xs text-texto-suave">
              {variaveis.map((v) => `{{${v}}}`).join('  ')}
            </p>
          </Stack>
        )}
      </Stack>
    </Sheet>
  );
}
