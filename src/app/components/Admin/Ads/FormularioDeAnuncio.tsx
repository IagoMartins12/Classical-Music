'use client';

import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { PiWarning } from 'react-icons/pi';
import { Button } from '@/app/components/ui/Button';
import { Field } from '@/app/components/ui/Field';
import { Icon } from '@/app/components/ui/Icon';
import { Stack } from '@/app/components/ui/Layout';
import { Sheet } from '@/app/components/ui/Sheet';
import { Text } from '@/app/components/ui/Text';
import { Interruptor } from '@/app/components/Admin/painel/Campos';
import { useAds } from '@/app/hooks/admin/useAds';
import { listInstruments } from '@/app/requests/admin/ads';

/**
 * Criar, editar e clonar anúncio — um formulário só.
 *
 * Eram três modais (711, 808 e 731 linhas) com os mesmos campos copiados três
 * vezes, cada um com seu jeito de validar; e as datas eram mostradas em UTC
 * num campo de hora local (um anúncio das 20h aparecia às 23h). Aqui:
 *
 * - **criar** nasce rascunho; a mídia vem depois, pela tela do anúncio;
 * - **editar** manda só o que mudou;
 * - **clonar** nasce rascunho e sem mídia, com as mudanças que se fizer.
 *
 * O aviso de conflito (outro anúncio no mesmo lugar e público) é conferido
 * enquanto se escolhe — antes de salvar, não depois.
 */

export type ModoDoAnuncio = 'criar' | 'editar' | 'clonar';

type Anuncio = Record<string, unknown> & { id?: string };

const ESTADOS = [
  { value: 'DRAFT', label: 'Rascunho' },
  { value: 'ACTIVE', label: 'No ar' },
  { value: 'PAUSED', label: 'Pausado' },
  { value: 'SCHEDULED', label: 'Agendado' },
  { value: 'EXPIRED', label: 'Terminou' },
];
const TIPOS = [
  { value: 'BANNER', label: 'Banner' },
  { value: 'VIDEO', label: 'Vídeo' },
  { value: 'CARD', label: 'Card' },
  { value: 'SIDEBAR', label: 'Lateral' },
  { value: 'NATIVE', label: 'Nativo' },
  { value: 'POPUP', label: 'Janela' },
];
const LUGARES = [
  { value: 'HEADER', label: 'Topo do site' },
  { value: 'SIDEBAR_LEFT', label: 'Lateral esquerda' },
  { value: 'SIDEBAR_RIGHT', label: 'Lateral direita' },
  { value: 'CONTENT_TOP', label: 'Acima do conteúdo' },
  { value: 'CONTENT_BOTTOM', label: 'Abaixo do conteúdo' },
  { value: 'BETWEEN_CONTENT', label: 'Entre conteúdos' },
  { value: 'FOOTER', label: 'Rodapé' },
  { value: 'MODAL', label: 'Janela sobre a página' },
];
const PUBLICOS = [
  { value: 'GENERAL', label: 'Todos' },
  { value: 'INSTRUMENT', label: 'Quem estuda um instrumento' },
  { value: 'USER_LEVEL', label: 'Por tipo de conta' },
];
const NIVEIS = [
  { value: 'ALL', label: 'Todas as contas' },
  { value: 'STUDENT', label: 'Só alunos' },
  { value: 'TEACHER', label: 'Só professores' },
];

interface Formulario {
  title: string;
  description: string;
  content: string;
  ctaText: string;
  targetUrl: string;
  linkType: 'url' | 'whatsapp';
  isExternal: boolean;
  type: string;
  placement: string;
  status: string;
  targetType: string;
  targetUserLevel: string;
  instrumentId: string;
  advertiserName: string;
  advertiserEmail: string;
  advertiserPhone: string;
  advertiserWebsite: string;
  startDate: string;
  endDate: string;
  showOnMobile: boolean;
  showOnTablet: boolean;
  showOnDesktop: boolean;
}

/** ISO → `datetime-local` no fuso de quem edita. */
const paraLocal = (v: unknown) => {
  if (!v) return '';
  const d = new Date(String(v));
  if (Number.isNaN(d.getTime())) return '';
  return new Date(d.getTime() - d.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 16);
};
const deLocal = (v: string) => (v ? new Date(v).toISOString() : undefined);

const texto = (v: unknown) => (typeof v === 'string' ? v : '');

function inicial(a: Anuncio | null, modo: ModoDoAnuncio): Formulario {
  return {
    title: a ? `${texto(a.title)}${modo === 'clonar' ? ' (cópia)' : ''}` : '',
    description: texto(a?.description),
    content: texto(a?.content),
    ctaText: texto(a?.ctaText),
    targetUrl: texto(a?.targetUrl),
    linkType: a?.linkType === 'whatsapp' ? 'whatsapp' : 'url',
    isExternal: (a?.isExternal as boolean | undefined) ?? true,
    type: texto(a?.type) || 'BANNER',
    placement: texto(a?.placement) || 'SIDEBAR_RIGHT',
    status: modo === 'editar' ? texto(a?.status) || 'DRAFT' : 'DRAFT',
    targetType: texto(a?.targetType) || 'GENERAL',
    targetUserLevel: texto(a?.targetUserLevel) || 'ALL',
    instrumentId: texto(a?.instrumentId),
    advertiserName: texto(a?.advertiserName),
    advertiserEmail: texto(a?.advertiserEmail),
    advertiserPhone: texto(a?.advertiserPhone),
    advertiserWebsite: texto(a?.advertiserWebsite),
    startDate: paraLocal(a?.startDate),
    endDate: paraLocal(a?.endDate),
    showOnMobile: (a?.showOnMobile as boolean | undefined) ?? true,
    showOnTablet: (a?.showOnTablet as boolean | undefined) ?? true,
    showOnDesktop: (a?.showOnDesktop as boolean | undefined) ?? true,
  };
}

/** O que vai para a API: textos aparados, vazios fora, datas em ISO. */
function paraApi(f: Formulario) {
  const vazio = (s: string) => s.trim() || undefined;
  return {
    title: f.title.trim(),
    description: vazio(f.description),
    content: vazio(f.content),
    ctaText: vazio(f.ctaText),
    targetUrl: vazio(f.targetUrl),
    linkType: f.linkType,
    isExternal: f.isExternal,
    type: f.type,
    placement: f.placement,
    status: f.status,
    targetType: f.targetType,
    targetUserLevel: f.targetUserLevel,
    instrumentId:
      f.targetType === 'INSTRUMENT' ? f.instrumentId || undefined : undefined,
    advertiserName: f.advertiserName.trim(),
    advertiserEmail: vazio(f.advertiserEmail),
    advertiserPhone: vazio(f.advertiserPhone),
    advertiserWebsite: vazio(f.advertiserWebsite),
    startDate: deLocal(f.startDate),
    endDate: deLocal(f.endDate),
    showOnMobile: f.showOnMobile,
    showOnTablet: f.showOnTablet,
    showOnDesktop: f.showOnDesktop,
  };
}

export function FormularioDeAnuncio({
  modo,
  anuncio,
  aoFechar,
  aoSalvar,
}: {
  modo: ModoDoAnuncio;
  anuncio: Anuncio | null;
  aoFechar: () => void;
  aoSalvar: (criado?: { id?: string }) => void;
}) {
  const { createAd, updateAd, cloneAd, checkConflict } = useAds();
  const [f, setF] = useState<Formulario>(() => inicial(anuncio, modo));
  const [instrumentos, setInstrumentos] = useState<
    { id: string; name: string }[]
  >([]);
  const [conflito, setConflito] = useState<string | null>(null);
  const [tentou, setTentou] = useState(false);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => setF(inicial(anuncio, modo)), [anuncio, modo]);

  useEffect(() => {
    listInstruments()
      .then(setInstrumentos)
      .catch(() => setInstrumentos([]));
  }, []);

  // Conflito de lugar e público, conferido enquanto se escolhe.
  useEffect(() => {
    let vivo = true;
    const t = window.setTimeout(async () => {
      try {
        const r = await checkConflict(
          f.type,
          f.placement,
          f.targetType,
          f.targetType === 'INSTRUMENT' ? f.instrumentId : undefined,
          modo === 'editar' ? anuncio?.id : undefined
        );
        if (!vivo) return;
        setConflito(
          r?.hasConflict
            ? (r.conflicts
                ?.map((c: { message: string }) => c.message)
                .join(' ') ??
                r.message ??
                'Já existe um anúncio no ar neste lugar e para este público.')
            : null
        );
      } catch {
        if (vivo) setConflito(null);
      }
    }, 400);
    return () => {
      vivo = false;
      window.clearTimeout(t);
    };
  }, [
    f.type,
    f.placement,
    f.targetType,
    f.instrumentId,
    modo,
    anuncio?.id,
    checkConflict,
  ]);

  const erros = useMemo(() => {
    const e: Partial<Record<keyof Formulario, string>> = {};
    if (!f.title.trim()) e.title = 'Dê um título ao anúncio.';
    if (!f.advertiserName.trim()) e.advertiserName = 'Quem está anunciando?';
    if (f.targetType === 'INSTRUMENT' && !f.instrumentId) {
      e.instrumentId = 'Escolha o instrumento.';
    }
    if (f.linkType === 'whatsapp' && f.targetUrl) {
      if (f.targetUrl.replace(/\D/g, '').length < 10) {
        e.targetUrl = 'Número com DDI e DDD, só dígitos: 5511999999999.';
      }
    } else if (f.targetUrl && !/^https?:\/\//i.test(f.targetUrl.trim())) {
      e.targetUrl = 'Endereço completo, começando com https://';
    }
    if (f.startDate && f.endDate && f.endDate <= f.startDate) {
      e.endDate = 'O fim precisa ser depois do início.';
    }
    if (!f.showOnMobile && !f.showOnTablet && !f.showOnDesktop) {
      e.showOnDesktop = 'Escolha ao menos um tipo de tela.';
    }
    return e;
  }, [f]);

  const mostrar = (campo: keyof Formulario) =>
    tentou ? erros[campo] : undefined;

  const salvar = async () => {
    setTentou(true);
    if (Object.keys(erros).length > 0) {
      toast.error('Confira os campos marcados.');
      return;
    }
    if (conflito && f.status === 'ACTIVE') {
      toast.error('Outro anúncio já está no ar neste lugar e público.');
      return;
    }
    setSalvando(true);
    try {
      const dados = paraApi(f);
      if (modo === 'editar' && anuncio?.id) {
        const antes = paraApi(inicial(anuncio, 'editar'));
        const mudou = Object.fromEntries(
          Object.entries(dados).filter(
            ([k, v]) =>
              JSON.stringify(v) !==
              JSON.stringify((antes as Record<string, unknown>)[k])
          )
        );
        if (Object.keys(mudou).length) await updateAd(anuncio.id, mudou);
        aoSalvar();
      } else if (modo === 'clonar' && anuncio?.id) {
        const criado = await cloneAd(anuncio.id, { ...dados, status: 'DRAFT' });
        aoSalvar(criado);
      } else {
        const criado = await createAd(dados);
        aoSalvar(criado);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Não foi possível salvar.');
    } finally {
      setSalvando(false);
    }
  };

  const muda =
    <K extends keyof Formulario>(k: K) =>
    (v: Formulario[K]) =>
      setF((x) => ({ ...x, [k]: v }));

  const titulo =
    modo === 'criar'
      ? 'Novo anúncio'
      : modo === 'clonar'
        ? 'Clonar anúncio'
        : 'Editar anúncio';

  return (
    <Sheet
      aberto
      aoFechar={aoFechar}
      titulo={titulo}
      descricao={
        modo === 'criar'
          ? 'Nasce como rascunho. A imagem entra depois, pela tela do anúncio.'
          : modo === 'clonar'
            ? `A cópia de “${texto(anuncio?.title)}” nasce rascunho e sem mídia.`
            : texto(anuncio?.title)
      }
      largura="g"
      rodape={
        <>
          <Button tamanho="p" variante="fantasma" onClick={aoFechar}>
            Cancelar
          </Button>
          <Button
            tamanho="p"
            variante="primario"
            onClick={salvar}
            carregando={salvando}
          >
            {modo === 'criar'
              ? 'Criar rascunho'
              : modo === 'clonar'
                ? 'Criar cópia'
                : 'Salvar'}
          </Button>
        </>
      }
    >
      <Stack gap={8}>
        <Bloco titulo="O anúncio">
          <Field
            label="Título"
            value={f.title}
            onChange={(e) => muda('title')(e.target.value)}
            erro={mostrar('title')}
          />
          <Field.Area
            label="Texto curto"
            ajuda="Aparece abaixo do título no card."
            rows={2}
            value={f.description}
            onChange={(e) => muda('description')(e.target.value)}
          />
          <Field.Area
            label="Texto longo (opcional)"
            rows={3}
            value={f.content}
            onChange={(e) => muda('content')(e.target.value)}
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field
              label="Texto do botão"
              placeholder="Saiba mais"
              value={f.ctaText}
              onChange={(e) => muda('ctaText')(e.target.value)}
            />
            <Field.Selecao
              label="O botão leva para"
              value={f.linkType}
              onChange={(e) =>
                muda('linkType')(e.target.value as Formulario['linkType'])
              }
            >
              <option value="url">Um site</option>
              <option value="whatsapp">Uma conversa no WhatsApp</option>
            </Field.Selecao>
          </div>
          <Field
            label={
              f.linkType === 'whatsapp' ? 'Número do WhatsApp' : 'Endereço'
            }
            placeholder={
              f.linkType === 'whatsapp' ? '5511999999999' : 'https://…'
            }
            value={f.targetUrl}
            onChange={(e) => muda('targetUrl')(e.target.value)}
            erro={mostrar('targetUrl')}
          />
          {f.linkType === 'url' && (
            <Interruptor
              rotulo="Abrir em outra aba"
              ligado={f.isExternal}
              aoMudar={muda('isExternal')}
            />
          )}
        </Bloco>

        <Bloco titulo="Onde e para quem">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field.Selecao
              label="Formato"
              value={f.type}
              onChange={(e) => muda('type')(e.target.value)}
            >
              {TIPOS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Field.Selecao>
            <Field.Selecao
              label="Lugar"
              value={f.placement}
              onChange={(e) => muda('placement')(e.target.value)}
            >
              {LUGARES.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Field.Selecao>
            <Field.Selecao
              label="Público"
              value={f.targetType}
              onChange={(e) => muda('targetType')(e.target.value)}
            >
              {PUBLICOS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Field.Selecao>
            {f.targetType === 'INSTRUMENT' && (
              <Field.Selecao
                label="Instrumento"
                value={f.instrumentId}
                onChange={(e) => muda('instrumentId')(e.target.value)}
                erro={mostrar('instrumentId')}
              >
                <option value="">Escolha</option>
                {instrumentos.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.name}
                  </option>
                ))}
              </Field.Selecao>
            )}
            {f.targetType === 'USER_LEVEL' && (
              <Field.Selecao
                label="Contas"
                value={f.targetUserLevel}
                onChange={(e) => muda('targetUserLevel')(e.target.value)}
              >
                {NIVEIS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Field.Selecao>
            )}
          </div>
          {conflito && (
            <p
              role="status"
              className="flex items-start gap-2 rounded-controle bg-sup-2 px-4 py-3 text-sm text-atencao"
            >
              <Icon de={PiWarning} tamanho="p" className="mt-0.5" />
              <span>
                {conflito} Pode salvar como rascunho ou pausado; no ar, só um
                por lugar e público.
              </span>
            </p>
          )}
          <fieldset className="flex flex-col gap-3">
            <legend className="t-rotulo mb-2 font-medium text-texto">
              Em que telas aparece
            </legend>
            <Interruptor
              rotulo="Computador"
              ligado={f.showOnDesktop}
              aoMudar={muda('showOnDesktop')}
            />
            <Interruptor
              rotulo="Tablet"
              ligado={f.showOnTablet}
              aoMudar={muda('showOnTablet')}
            />
            <Interruptor
              rotulo="Celular"
              ligado={f.showOnMobile}
              aoMudar={muda('showOnMobile')}
            />
            {mostrar('showOnDesktop') && (
              <span className="t-legenda text-erro">
                {mostrar('showOnDesktop')}
              </span>
            )}
          </fieldset>
        </Bloco>

        <Bloco titulo="Quando">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {modo === 'editar' && (
              <Field.Selecao
                label="Estado"
                value={f.status}
                onChange={(e) => muda('status')(e.target.value)}
              >
                {ESTADOS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Field.Selecao>
            )}
            <Field
              type="datetime-local"
              label="Começa"
              ajuda="Em branco: assim que for posto no ar."
              value={f.startDate}
              onChange={(e) => muda('startDate')(e.target.value)}
            />
            <Field
              type="datetime-local"
              label="Termina"
              ajuda="Em branco: sem data para acabar."
              value={f.endDate}
              onChange={(e) => muda('endDate')(e.target.value)}
              erro={mostrar('endDate')}
            />
          </div>
        </Bloco>

        <Bloco titulo="Anunciante">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field
              label="Nome"
              value={f.advertiserName}
              onChange={(e) => muda('advertiserName')(e.target.value)}
              erro={mostrar('advertiserName')}
            />
            <Field
              type="email"
              label="E-mail"
              value={f.advertiserEmail}
              onChange={(e) => muda('advertiserEmail')(e.target.value)}
            />
            <Field
              type="tel"
              label="Telefone"
              value={f.advertiserPhone}
              onChange={(e) => muda('advertiserPhone')(e.target.value)}
            />
            <Field
              type="url"
              label="Site"
              value={f.advertiserWebsite}
              onChange={(e) => muda('advertiserWebsite')(e.target.value)}
            />
          </div>
        </Bloco>
      </Stack>
    </Sheet>
  );
}

function Bloco({
  titulo,
  children,
}: {
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4">
      <Text papel="secao" as="h3">
        {titulo}
      </Text>
      {children}
    </section>
  );
}
