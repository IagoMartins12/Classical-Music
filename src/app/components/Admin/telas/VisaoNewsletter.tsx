'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { PiDownloadSimple, PiPlus } from 'react-icons/pi';
import { Button, classesDeBotao } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import { Stack } from '@/app/components/ui/Layout';
import { Row } from '@/app/components/ui/Row';
import { Text } from '@/app/components/ui/Text';
import { Cabecalho, Secao } from '@/app/components/Admin/painel/Cabecalho';
import { Segmentos } from '@/app/components/Admin/painel/Controles';
import { Proporcoes } from '@/app/components/Admin/painel/Graficos';
import { Numeros, rolarAte } from '@/app/components/Admin/painel/Numeros';
import { data, numero, porcento } from '@/app/components/Admin/painel/formatos';
import {
  useEstatisticasNews,
  useNumerosNews,
} from '@/app/hooks/admin/useNewsletterPainel';
import {
  exportarNumerosNews,
  type PeriodoNews,
} from '@/app/requests/admin/newsletterPainel';

/**
 * Newsletter: quem assina, o que foi enviado e como foi recebido.
 *
 * **Eram duas telas** — "Dashboard" e "Analytics" — mostrando os mesmos
 * assinantes e as mesmas taxas por caminhos diferentes, e a segunda tinha
 * seções inteiras zeradas (engajamento alto/médio/baixo, gráficos de
 * tendência) que a API não mede. Aqui fica o que é medido: assinantes por
 * estado, entradas e saídas no período, e o funil dos e-mails (enviados →
 * entregues → abertos → clicados), somado das campanhas.
 */

const PERIODOS: { valor: PeriodoNews; rotulo: string }[] = [
  { valor: '7d', rotulo: '7 dias' },
  { valor: '30d', rotulo: '30 dias' },
  { valor: '90d', rotulo: '90 dias' },
  { valor: '1y', rotulo: '1 ano' },
];

const ESTADOS: Record<string, string> = {
  ACTIVE: 'Ativos',
  PENDING: 'Esperando confirmação',
  UNSUBSCRIBED: 'Saíram',
  BOUNCED: 'E-mail devolvido',
  BLOCKED: 'Bloqueados',
};

const CAMPANHAS: Record<string, string> = {
  DRAFT: 'Rascunhos',
  SCHEDULED: 'Agendadas',
  SENDING: 'Enviando',
  SENT: 'Enviadas',
  PAUSED: 'Pausadas',
  CANCELLED: 'Canceladas',
  FAILED: 'Falharam',
};

export default function VisaoNewsletter() {
  const router = useRouter();
  const [periodo, setPeriodo] = useState<PeriodoNews>('30d');
  const [exportando, setExportando] = useState(false);
  const stats = useEstatisticasNews();
  const num = useNumerosNews(periodo);
  const s = stats.data;
  const n = num.data;
  const rotulo = PERIODOS.find((p) => p.valor === periodo)!.rotulo;

  const exportar = async () => {
    setExportando(true);
    try {
      await exportarNumerosNews(periodo);
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : 'Não foi possível exportar.'
      );
    } finally {
      setExportando(false);
    }
  };

  const e = n?.emails;

  return (
    <Stack gap={8}>
      <Cabecalho
        titulo="Newsletter"
        descricao="Quem assina, o que foi enviado e como foi recebido"
        atualizadoEm={num.updatedAt}
        acoes={
          <>
            <Segmentos
              rotulo="Período"
              opcoes={PERIODOS}
              valor={periodo}
              aoMudar={setPeriodo}
            />
            <Button
              tamanho="p"
              icone={PiDownloadSimple}
              onClick={exportar}
              carregando={exportando}
            >
              CSV
            </Button>
            <Link
              href="/admin/newsletter/campaigns?nova=1"
              className={classesDeBotao('primario', 'p')}
            >
              <Icon de={PiPlus} tamanho="pp" /> Nova campanha
            </Link>
          </>
        }
      />

      <Numeros
        carregando={stats.loading || num.loading}
        itens={[
          {
            id: 'ativos',
            rotulo: 'Assinantes ativos',
            aoClicar: () => router.push('/admin/newsletter/subscribers'),
            valor: numero(s?.subscribersByStatus.ACTIVE ?? 0),
            nota: s
              ? `${numero(s.subscribersByStatus.PENDING ?? 0)} esperando confirmação`
              : undefined,
          },
          {
            id: 'entraram',
            rotulo: `Entraram em ${rotulo}`,
            aoClicar: () => rolarAte('news-assinantes'),
            valor: numero(n?.subscribers.gained),
            nota: n
              ? `${numero(n.subscribers.lost)} saíram · saldo ${n.subscribers.net >= 0 ? '+' : ''}${numero(n.subscribers.net)}`
              : undefined,
            tom: n && n.subscribers.net < 0 ? 'atencao' : undefined,
          },
          {
            id: 'campanhas',
            rotulo: 'Campanhas enviadas',
            aoClicar: () => router.push('/admin/newsletter/campaigns'),
            valor: numero(n?.campaigns.sent),
            nota: e ? `${numero(e.sent)} e-mails` : undefined,
          },
          {
            id: 'entrega',
            rotulo: 'Entrega',
            aoClicar: () => rolarAte('news-funil'),
            valor: porcento(e?.deliveryRate),
            nota: e ? `${numero(e.bounced)} devolvidos` : undefined,
          },
          {
            id: 'abertura',
            rotulo: 'Abertura',
            aoClicar: () => rolarAte('news-funil'),
            valor: porcento(e?.openRate),
            nota: 'dos entregues',
          },
          {
            id: 'clique',
            rotulo: 'Clique',
            aoClicar: () => rolarAte('news-top'),
            valor: porcento(e?.clickRate),
            nota: 'dos que abriram',
          },
        ]}
      />

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <Secao titulo="O caminho dos e-mails" id="news-funil" detalhe={rotulo}>
          {e && e.sent > 0 ? (
            <Proporcoes
              titulo="Enviados, entregues, abertos e clicados"
              dados={[
                { rotulo: 'Enviados', valor: e.sent },
                { rotulo: 'Entregues', valor: e.delivered },
                { rotulo: 'Abertos', valor: e.opened },
                { rotulo: 'Clicados', valor: e.clicked },
              ]}
            />
          ) : (
            <Text papel="rotulo" tom="suave" as="p">
              {num.loading
                ? 'Carregando…'
                : 'Nenhuma campanha enviada no período.'}
            </Text>
          )}
        </Secao>

        <Secao
          titulo="Assinantes"
          id="news-assinantes"
          atalho={
            <Link
              href="/admin/newsletter/subscribers"
              className={classesDeBotao('texto', 'p')}
            >
              Ver lista
            </Link>
          }
        >
          {s ? (
            <Proporcoes
              titulo="Assinantes por estado"
              dados={Object.entries(s.subscribersByStatus)
                .sort((a, b) => b[1] - a[1])
                .map(([k, v]) => ({ rotulo: ESTADOS[k] ?? k, valor: v }))}
            />
          ) : (
            <Row.Skeleton repetir={3} />
          )}
        </Secao>
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <Secao
          titulo="Campanhas que mais abriram"
          id="news-top"
          detalhe={rotulo}
        >
          {n && n.topCampaigns.length > 0 ? (
            <ul className="flex flex-col">
              {n.topCampaigns.map((c) => (
                <li
                  key={c.id}
                  className="flex items-baseline gap-3 border-b border-linha py-2.5 last:border-0"
                >
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-[0.9375rem] text-texto">
                      {c.name}
                    </span>
                    <span className="t-legenda">
                      {data(c.sentAt)} · {numero(c.emailsDelivered)} entregues
                    </span>
                  </span>
                  <span className="t-dado text-sm text-texto">
                    {porcento(c.openRate)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <Text papel="rotulo" tom="suave" as="p">
              {num.loading
                ? 'Carregando…'
                : 'Nenhuma campanha entregue no período.'}
            </Text>
          )}
        </Secao>

        <Secao
          titulo="Campanhas"
          id="news-estados"
          atalho={
            <Link
              href="/admin/newsletter/campaigns"
              className={classesDeBotao('texto', 'p')}
            >
              Ver todas
            </Link>
          }
        >
          {s &&
            !Object.keys(CAMPANHAS).some(
              (k) => (s.campaignsByStatus[k] ?? 0) > 0
            ) && (
              <Text papel="rotulo" tom="suave" as="p">
                Nenhuma campanha criada ainda.
              </Text>
            )}
          <dl className="flex flex-col">
            {s &&
              Object.entries(CAMPANHAS)
                .filter(([k]) => (s.campaignsByStatus[k] ?? 0) > 0)
                .map(([k, r]) => (
                  <div
                    key={k}
                    className="flex items-baseline gap-3 border-b border-linha py-2.5 last:border-0"
                  >
                    <dt className="t-rotulo flex-1 text-texto-suave">{r}</dt>
                    <dd
                      className={
                        k === 'FAILED'
                          ? 't-dado text-atencao'
                          : 't-dado text-texto'
                      }
                    >
                      {numero(s.campaignsByStatus[k])}
                    </dd>
                  </div>
                ))}
          </dl>
        </Secao>
      </div>
    </Stack>
  );
}
