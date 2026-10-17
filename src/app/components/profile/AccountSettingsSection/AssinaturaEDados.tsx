'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { PiDownloadSimple } from 'react-icons/pi';
import { useTranslation } from '@/app/context/TranslationContext';
import { Button } from '@/app/components/ui/Button';
import { Card } from '@/app/components/ui/Card';
import { Inline, Stack } from '@/app/components/ui/Layout';
import { profileApi } from '@/app/libs/api/profile';

/**
 * Os dados pessoais, nas Configurações da Conta. A assinatura tem a própria
 * seção no perfil (`SubscriptionSection`). Exportar os próprios dados cumpre
 * a LGPD, art. 18 (portabilidade), prometida nos Termos e na Política.
 */
const R = {
  pt: {
    dados: 'Seus dados',
    dadosTexto:
      'Baixe num arquivo tudo o que é seu no Opus Atlas: conta, perfil, estudos, anotações, envios e histórico. O arquivo não inclui senha, registros administrativos nem notas privadas de professores.',
    exportar: 'Exportar meus dados',
    exportado: 'Arquivo baixado.',
    limite:
      'Você já exportou 3 vezes na última hora. Tente de novo mais tarde.',
    erro: 'Não foi possível concluir. Tente de novo em instantes.',
  },
  en: {
    dados: 'Your data',
    dadosTexto:
      'Download a file with everything that is yours on Opus Atlas: account, profile, study, annotations, uploads and history. It does not include your password, administrative logs or teachers’ private notes.',
    exportar: 'Export my data',
    exportado: 'File downloaded.',
    limite:
      'You have already exported 3 times in the last hour. Please try again later.',
    erro: 'Could not complete. Please try again shortly.',
  },
};

export function AssinaturaEDados() {
  const { language } = useTranslation({ sections: ['pages/profile'] });
  const idioma = language === 'en' ? 'en' : 'pt';
  const r = R[idioma];
  const [ocupado, setOcupado] = useState<null | 'exportar'>(null);

  async function exportar() {
    setOcupado('exportar');
    try {
      const dados = await profileApi.exportarDados();
      const arquivo = new Blob([JSON.stringify(dados, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(arquivo);
      const a = document.createElement('a');
      a.href = url;
      a.download = `opus-atlas-meus-dados-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(r.exportado);
    } catch (e) {
      const status = (e as { status?: number }).status;
      toast.error(status === 429 ? r.limite : r.erro);
    } finally {
      setOcupado(null);
    }
  }

  return (
    <>
      <Card nivel={2}>
        <Stack gap={4}>
          <Inline gap={3}>
            <PiDownloadSimple
              aria-hidden="true"
              className="h-5 w-5 text-ouro-texto"
            />
            <h3 className="text-lg font-semibold text-texto">{r.dados}</h3>
          </Inline>
          <p className="medida-texto text-texto-suave">{r.dadosTexto}</p>
          <div>
            <Button
              icone={PiDownloadSimple}
              onClick={exportar}
              carregando={ocupado === 'exportar'}
              disabled={ocupado !== null}
            >
              {r.exportar}
            </Button>
          </div>
        </Stack>
      </Card>
    </>
  );
}
