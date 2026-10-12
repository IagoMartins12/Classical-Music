'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Button } from '@/app/components/ui/Button';
import { Erro } from '@/app/components/ui/Estados';
import { Stack } from '@/app/components/ui/Layout';
import { Sheet } from '@/app/components/ui/Sheet';
import { Skeleton } from '@/app/components/ui/Skeleton';
import { Text } from '@/app/components/ui/Text';
import { Segmentos } from '@/app/components/Admin/painel/Controles';
import { previaDeEmail } from '@/app/requests/admin/newsletterPainel';

/**
 * A prévia de um e-mail (modelo ou campanha), montada pela API: as variáveis
 * com um assinante de exemplo e o corpo dentro do layout dos e-mails — o que
 * aparece aqui é o que chega na caixa de entrada.
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

export function PreviaDeEmail({
  aberto,
  aoFechar,
  titulo,
  assunto,
  html,
  texto,
  variaveis,
}: {
  aberto: boolean;
  aoFechar: () => void;
  titulo: string;
  assunto: string;
  html: string;
  texto?: string | null;
  variaveis?: string[];
}) {
  const [vista, setVista] = useState<Vista>('visual');
  const [largura, setLargura] = useState<Largura>('computador');

  const previa = useQuery({
    queryKey: ['admin', 'newsletter', 'previa', assunto, html, texto],
    queryFn: () =>
      previaDeEmail({
        subject: assunto,
        htmlContent: html,
        textContent: texto ?? undefined,
      }),
    enabled: aberto && html.trim().length > 0,
    staleTime: Infinity,
  });
  const pronto = previa.data;

  return (
    <Sheet aberto={aberto} aoFechar={aoFechar} titulo={titulo} largura="g">
      <Stack gap={4}>
        <div className="rounded-controle bg-sup-2 px-4 py-3">
          <span className="t-legenda">Assunto</span>
          <p className="text-[0.9375rem] text-texto">
            {pronto?.subject || assunto || '—'}
          </p>
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

        {vista !== 'codigo' && !html.trim() ? (
          <Text papel="legenda" as="p">
            Escreva o conteúdo para ver a prévia.
          </Text>
        ) : vista !== 'codigo' && previa.isError ? (
          <Erro
            titulo="Não foi possível montar a prévia"
            acao={
              <Button variante="secundario" onClick={() => previa.refetch()}>
                Tentar de novo
              </Button>
            }
          />
        ) : vista !== 'codigo' && !pronto ? (
          <Skeleton forma="bloco" className="h-[65dvh] w-full" />
        ) : vista === 'visual' ? (
          <div className="relative flex justify-center overflow-x-auto rounded-card bg-sup-2 p-3 rolagem-discreta">
            <iframe
              title={`Prévia: ${titulo}`}
              // Sem `allow-scripts`: o e-mail não roda código aqui.
              sandbox="allow-popups allow-popups-to-escape-sandbox"
              srcDoc={pronto?.html}
              style={{ width: LARGURA[largura], maxWidth: '100%' }}
              className="h-[65dvh] rounded-controle border border-linha"
            />
          </div>
        ) : vista === 'texto' ? (
          <pre className="t-dado max-h-[65dvh] overflow-auto whitespace-pre-wrap rounded-card bg-sup-2 p-4 text-sm text-texto rolagem-discreta">
            {pronto?.text}
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
