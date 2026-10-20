'use client';

import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { PiEye } from 'react-icons/pi';
import { Button } from '@/app/components/ui/Button';
import { Field } from '@/app/components/ui/Field';
import { Stack } from '@/app/components/ui/Layout';
import { Sheet } from '@/app/components/ui/Sheet';
import { Text } from '@/app/components/ui/Text';
import { Segmentos } from '@/app/components/Admin/painel/Controles';
import { useNewsletterAdmin } from '@/app/hooks/admin/useNewsletterAdmin';
import { PreviaDeEmail } from './PreviaDeEmail';

/**
 * Criar e editar campanha da newsletter.
 *
 * Era um modal de cinco "passos" (788 linhas). O último, "Segmentação",
 * tinha três caixas — novos assinantes, alto engajamento, interesses — que
 * **não estavam ligadas a nada**: marcar ou não dava no mesmo, a campanha ia
 * para a base inteira. Aqui o público é o que a API de fato filtra:
 * interesses, nível, frequência e "abriu e-mail desde".
 *
 * Conteúdo: um modelo salvo ou HTML próprio. Envio: agendar (a API exige
 * data no futuro) ou deixar como rascunho para enviar à mão.
 */

type Aba = 'conteudo' | 'publico' | 'envio';

const NIVEIS = [
  { value: 'BEGINNER', label: 'Iniciante' },
  { value: 'INTERMEDIATE', label: 'Intermediário' },
  { value: 'ADVANCED', label: 'Avançado' },
];
const FREQUENCIAS = [
  { value: 'daily', label: 'Quem pediu diária' },
  { value: 'weekly', label: 'Quem pediu semanal' },
  { value: 'monthly', label: 'Quem pediu mensal' },
];

type Campanha = Record<string, unknown> & { id?: string };

const paraLocal = (v: unknown) => {
  if (!v) return '';
  const d = new Date(String(v));
  if (Number.isNaN(d.getTime())) return '';
  return new Date(d.getTime() - d.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 16);
};

export function EditorDeCampanha({
  campanha,
  aoFechar,
  aoSalvar,
}: {
  /** Nula: campanha nova. Editando, a campanha completa (com conteúdo). */
  campanha: Campanha | null;
  aoFechar: () => void;
  aoSalvar: () => void;
}) {
  const { templates, fetchTemplates, createCampaign, updateCampaign } =
    useNewsletterAdmin();
  const seg = (campanha?.targetSegments ?? {}) as Record<string, unknown>;
  const s = (v: unknown) => (typeof v === 'string' ? v : '');

  const [aba, setAba] = useState<Aba>('conteudo');
  const [nome, setNome] = useState(s(campanha?.name));
  const [assunto, setAssunto] = useState(s(campanha?.subject));
  const [fonte, setFonte] = useState<'modelo' | 'proprio'>(
    campanha && !campanha.templateId ? 'proprio' : 'modelo'
  );
  const [modeloId, setModeloId] = useState(s(campanha?.templateId));
  const [html, setHtml] = useState(s(campanha?.customHtmlContent));
  const [texto, setTexto] = useState(s(campanha?.customTextContent));
  const [publico, setPublico] = useState<'todos' | 'segmento'>(
    campanha?.targetAll === false ? 'segmento' : 'todos'
  );
  const [interesses, setInteresses] = useState(
    Array.isArray(seg.interests) ? (seg.interests as string[]).join(', ') : ''
  );
  const [nivel, setNivel] = useState(s(seg.experienceLevel));
  const [frequencia, setFrequencia] = useState(s(seg.frequency));
  const [engajados, setEngajados] = useState(s(seg.engagedSince).slice(0, 10));
  const [remetente, setRemetente] = useState(
    s(campanha?.senderName) || 'Opus Atlas'
  );
  const [responderPara, setResponderPara] = useState(s(campanha?.replyToEmail));
  const [quando, setQuando] = useState(paraLocal(campanha?.scheduledAt));
  const [tentou, setTentou] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [vendo, setVendo] = useState(false);

  useEffect(() => {
    void fetchTemplates();
  }, [fetchTemplates]);

  const modelos = templates.filter((t) => t.isActive);
  const modelo = templates.find((t) => t.id === modeloId);

  // Escolher um modelo preenche o assunto, se ainda estiver vazio.
  useEffect(() => {
    if (modelo && !assunto) setAssunto(modelo.subject);
  }, [modeloId]);

  const erros = useMemo(() => {
    const e: Record<string, string> = {};
    if (nome.trim().length < 2) e.nome = 'Dê um nome à campanha.';
    if (assunto.trim().length < 2) e.assunto = 'O e-mail precisa de assunto.';
    if (fonte === 'modelo' && !modeloId) e.modelo = 'Escolha um modelo.';
    if (fonte === 'proprio' && !html.trim()) e.html = 'Falta o HTML.';
    if (quando && new Date(quando).getTime() <= Date.now()) {
      e.quando = 'O agendamento precisa ser no futuro.';
    }
    if (
      responderPara &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(responderPara.trim())
    ) {
      e.responderPara = 'E-mail inválido.';
    }
    if (
      publico === 'segmento' &&
      !interesses.trim() &&
      !nivel &&
      !frequencia &&
      !engajados
    ) {
      e.publico = 'Escolha ao menos um critério, ou envie para todos.';
    }
    return e;
  }, [
    nome,
    assunto,
    fonte,
    modeloId,
    html,
    quando,
    responderPara,
    publico,
    interesses,
    nivel,
    frequencia,
    engajados,
  ]);

  const mostrar = (k: string) => (tentou ? erros[k] : undefined);

  const salvar = async () => {
    setTentou(true);
    if (Object.keys(erros).length) {
      setAba(
        erros.nome || erros.assunto || erros.modelo || erros.html
          ? 'conteudo'
          : erros.publico
            ? 'publico'
            : 'envio'
      );
      return;
    }
    setSalvando(true);
    try {
      const segmentos =
        publico === 'segmento'
          ? {
              interests: interesses
                .split(',')
                .map((i) => i.trim())
                .filter(Boolean),
              experienceLevel: nivel || undefined,
              frequency: frequencia || undefined,
              engagedSince: engajados
                ? new Date(`${engajados}T00:00:00`).toISOString()
                : undefined,
            }
          : undefined;
      const dados = {
        name: nome.trim(),
        subject: assunto.trim(),
        templateId: fonte === 'modelo' ? modeloId : undefined,
        customHtmlContent: fonte === 'proprio' ? html.trim() : undefined,
        customTextContent:
          fonte === 'proprio' ? texto.trim() || undefined : undefined,
        senderName: remetente.trim() || undefined,
        replyToEmail: responderPara.trim() || undefined,
        scheduledAt: quando
          ? new Date(quando).toISOString()
          : campanha?.id
            ? null
            : undefined,
        targetSegments: segmentos,
      };
      if (campanha?.id) await updateCampaign(campanha.id, dados);
      else await createCampaign(dados);
      aoSalvar();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Não foi possível salvar.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Sheet
      aberto
      aoFechar={aoFechar}
      titulo={campanha?.id ? 'Editar campanha' : 'Nova campanha'}
      descricao={
        campanha?.id
          ? s(campanha.name)
          : 'Nasce como rascunho, ou agendada se tiver data.'
      }
      largura="g"
      rodape={
        <>
          <Button
            tamanho="p"
            icone={PiEye}
            className="mr-auto"
            onClick={() => setVendo(true)}
            disabled={fonte === 'modelo' ? !modelo : !html.trim()}
          >
            Prévia
          </Button>
          <Button tamanho="p" variante="fantasma" onClick={aoFechar}>
            Cancelar
          </Button>
          <Button
            tamanho="p"
            variante="primario"
            onClick={salvar}
            carregando={salvando}
          >
            {quando ? 'Salvar e agendar' : 'Salvar rascunho'}
          </Button>
        </>
      }
    >
      <Stack gap={6}>
        <Segmentos
          rotulo="Parte da campanha"
          valor={aba}
          aoMudar={setAba}
          opcoes={[
            { valor: 'conteudo', rotulo: 'Conteúdo' },
            { valor: 'publico', rotulo: 'Público' },
            { valor: 'envio', rotulo: 'Envio' },
          ]}
        />

        {aba === 'conteudo' && (
          <Stack gap={4}>
            <Field
              label="Nome"
              ajuda="Só no painel."
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              erro={mostrar('nome')}
            />
            <Field
              label="Assunto"
              value={assunto}
              onChange={(e) => setAssunto(e.target.value)}
              erro={mostrar('assunto')}
            />
            <Segmentos
              rotulo="De onde vem o conteúdo"
              valor={fonte}
              aoMudar={setFonte}
              opcoes={[
                { valor: 'modelo', rotulo: 'Um modelo salvo' },
                { valor: 'proprio', rotulo: 'HTML próprio' },
              ]}
            />
            {fonte === 'modelo' ? (
              <Field.Selecao
                label="Modelo"
                value={modeloId}
                onChange={(e) => setModeloId(e.target.value)}
                erro={mostrar('modelo')}
              >
                <option value="">Escolha</option>
                {modelos.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </Field.Selecao>
            ) : (
              <>
                <Field.Area
                  label="HTML"
                  rows={14}
                  classeCampo="t-dado text-xs"
                  spellCheck={false}
                  value={html}
                  onChange={(e) => setHtml(e.target.value)}
                  erro={mostrar('html')}
                />
                <Field.Area
                  label="Versão só texto (opcional)"
                  rows={5}
                  value={texto}
                  onChange={(e) => setTexto(e.target.value)}
                />
              </>
            )}
          </Stack>
        )}

        {aba === 'publico' && (
          <Stack gap={4}>
            <Segmentos
              rotulo="Quem recebe"
              valor={publico}
              aoMudar={setPublico}
              opcoes={[
                { valor: 'todos', rotulo: 'Todos os ativos' },
                { valor: 'segmento', rotulo: 'Só uma parte' },
              ]}
            />
            {publico === 'todos' ? (
              <Text papel="rotulo" tom="suave" as="p">
                Todos os assinantes ativos na hora do envio.
              </Text>
            ) : (
              <>
                <Text papel="rotulo" tom="suave" as="p">
                  Recebe quem casa com todos os critérios preenchidos.
                </Text>
                <Field
                  label="Interesses"
                  ajuda="Separados por vírgula; recebe quem tem ao menos um."
                  placeholder="piano, barroco"
                  value={interesses}
                  onChange={(e) => setInteresses(e.target.value)}
                />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <Field.Selecao
                    label="Nível"
                    value={nivel}
                    onChange={(e) => setNivel(e.target.value)}
                  >
                    <option value="">Qualquer</option>
                    {NIVEIS.map((n) => (
                      <option key={n.value} value={n.value}>
                        {n.label}
                      </option>
                    ))}
                  </Field.Selecao>
                  <Field.Selecao
                    label="Frequência"
                    value={frequencia}
                    onChange={(e) => setFrequencia(e.target.value)}
                  >
                    <option value="">Qualquer</option>
                    {FREQUENCIAS.map((n) => (
                      <option key={n.value} value={n.value}>
                        {n.label}
                      </option>
                    ))}
                  </Field.Selecao>
                  <Field
                    type="date"
                    label="Abriu e-mail desde"
                    value={engajados}
                    onChange={(e) => setEngajados(e.target.value)}
                  />
                </div>
                {mostrar('publico') && (
                  <span className="t-legenda text-erro">
                    {mostrar('publico')}
                  </span>
                )}
              </>
            )}
          </Stack>
        )}

        {aba === 'envio' && (
          <Stack gap={4}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field
                label="Nome de quem envia"
                value={remetente}
                onChange={(e) => setRemetente(e.target.value)}
              />
              <Field
                type="email"
                label="Responder para (opcional)"
                value={responderPara}
                onChange={(e) => setResponderPara(e.target.value)}
                erro={mostrar('responderPara')}
              />
            </div>
            <Field
              type="datetime-local"
              label="Agendar para"
              ajuda="Em branco: fica rascunho, e você envia quando quiser."
              value={quando}
              onChange={(e) => setQuando(e.target.value)}
              erro={mostrar('quando')}
            />
          </Stack>
        )}
      </Stack>

      <PreviaDeEmail
        aberto={vendo}
        aoFechar={() => setVendo(false)}
        titulo={nome || 'Prévia da campanha'}
        assunto={assunto}
        html={fonte === 'modelo' ? (modelo?.htmlContent ?? '') : html}
        texto={fonte === 'modelo' ? modelo?.textContent : texto}
        variaveis={fonte === 'modelo' ? modelo?.variables : undefined}
      />
    </Sheet>
  );
}
